import { UserRole } from '@prisma/client';
import { prisma } from '../../core/database/prisma';
import { PasswordService } from '../../core/security/password';
import { ForbiddenError, UnauthorizedError, ValidationError } from '../../core/errors/app-error';
import { superAdminService } from '../super-admin/services/super-admin.service';

const TENANT_ID = 'tenant-default-01';
const DEMO_PASSWORD = 'Password@2026';

const DEMO_USERS: Array<{
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  subdomain: string;
}> = [
  { id: 'usr-apex-owner', email: 'owner@apexindustries.com', role: 'OWNER', firstName: 'Vikram', lastName: 'Singhania', subdomain: 'apex' },
  { id: 'usr-apex-acct', email: 'accountant@apexindustries.com', role: 'ACCOUNTANT', firstName: 'Priya', lastName: 'Deshmukh', subdomain: 'apex' },
  { id: 'usr-apex-clerk', email: 'clerk@apexindustries.com', role: 'DATA_ENTRY', firstName: 'Ramesh', lastName: 'Patel', subdomain: 'apex' },
  { id: 'usr-zenith-acct', email: 'accounts@zenithlogistics.in', role: 'ACCOUNTANT', firstName: 'Zenith', lastName: 'Accounts', subdomain: 'zenith' },
  { id: 'usr-nova-owner', email: 'finance@novaretail.com', role: 'OWNER', firstName: 'Nova', lastName: 'Finance', subdomain: 'novaretail' },
];

const EMAIL_WORKSPACE: Record<string, string> = {
  'superadmin@finstaq.com': 'admin',
  ...Object.fromEntries(DEMO_USERS.map((user) => [user.email, user.subdomain])),
};

let demoReady: Promise<void> | null = null;

export async function ensureDemoUsers(): Promise<void> {
  if (!demoReady) {
    demoReady = seedDemoUsers().catch((error) => {
      demoReady = null;
      throw error;
    });
  }
  return demoReady;
}

async function seedDemoUsers(): Promise<void> {
  await prisma.tenant.upsert({
    where: { id: TENANT_ID },
    update: {},
    create: {
      id: TENANT_ID,
      name: 'Apex Industries Ltd.',
      gstIn: '27AABCF1234F1Z5',
      currency: 'INR',
    },
  });

  for (const user of DEMO_USERS) {
    const existing = await prisma.user.findFirst({ where: { email: user.email } });
    if (existing) {
      if (existing.passwordHash === 'dev-not-used') {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            passwordHash: await PasswordService.hash(DEMO_PASSWORD),
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: true,
          },
        });
      }
      continue;
    }
    await prisma.user.create({
      data: {
        id: user.id,
        tenantId: TENANT_ID,
        email: user.email,
        passwordHash: await PasswordService.hash(DEMO_PASSWORD),
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }
}

export interface LoginResult {
  email: string;
  role: 'SUPER_ADMIN' | UserRole;
  userId: string;
  tenantId: string;
  tenantName: string;
  subdomain: string;
  tenantStatus: 'ACTIVE' | 'SUSPENDED';
  suspendedReason?: string;
}

export async function loginWithPassword(emailRaw: string, password: string, subdomainRaw?: string): Promise<LoginResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes('@')) throw new ValidationError('Enter a valid email address');
  if (!password || password.length < 6) throw new ValidationError('Password must be at least 6 characters');

  if (email === 'superadmin@finstaq.com') {
    if (password !== DEMO_PASSWORD) throw new UnauthorizedError('Email or password is incorrect');
    return {
      email,
      role: 'SUPER_ADMIN',
      userId: 'usr-super-admin',
      tenantId: 'PLATFORM_SUPER_ADMIN',
      tenantName: 'Finstaq Platform Management',
      subdomain: 'admin',
      tenantStatus: 'ACTIVE',
    };
  }

  await ensureDemoUsers();
  const matches = await prisma.user.findMany({ where: { email }, include: { tenant: true } });
  let user = null as (typeof matches)[number] | null;
  for (const candidate of matches) {
    if (candidate.passwordHash === 'dev-not-used' || !candidate.isActive) continue;
    if (await PasswordService.verify(candidate.passwordHash, password)) {
      user = candidate;
      break;
    }
  }
  if (!user) throw new UnauthorizedError('Email or password is incorrect');

  const linked = await superAdminService.getTenantById(user.tenantId);
  const expectedWorkspace = EMAIL_WORKSPACE[email] || linked?.subdomain;
  const subdomain = (subdomainRaw || expectedWorkspace || 'apex').trim().toLowerCase();
  if (expectedWorkspace && subdomain !== expectedWorkspace) {
    throw new UnauthorizedError('This user does not belong to that workspace');
  }

  const workspace = await superAdminService.getTenantBySubdomain(subdomain);
  return {
    email: user.email,
    role: user.role,
    userId: user.id,
    tenantId: workspace?.id || user.tenantId,
    tenantName: workspace?.name || user.tenant.name,
    subdomain: workspace?.subdomain || subdomain,
    tenantStatus: workspace?.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
    suspendedReason: workspace?.suspendedReason,
  };
}

export async function listWorkspaceUsers() {
  await ensureDemoUsers();
  const users = await prisma.user.findMany({
    where: { tenantId: TENANT_ID },
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true, createdAt: true },
  });
  return users;
}

export async function createWorkspaceUser(
  actorRole: string,
  input: { email: string; password: string; role: UserRole; firstName: string; lastName: string },
) {
  if (actorRole !== 'OWNER' && actorRole !== 'SUPER_ADMIN') {
    throw new ForbiddenError('Only an owner can create users');
  }
  const email = input.email.trim().toLowerCase();
  if (!email.includes('@')) throw new ValidationError('Enter a valid email address');
  if (!input.password || input.password.length < 8) throw new ValidationError('Password must be at least 8 characters');
  if (!['OWNER', 'ACCOUNTANT', 'DATA_ENTRY'].includes(input.role)) throw new ValidationError('Choose a valid role');

  await ensureDemoUsers();
  const existing = await prisma.user.findFirst({ where: { tenantId: TENANT_ID, email } });
  if (existing) throw new ValidationError('A user with this email already exists');

  return prisma.user.create({
    data: {
      tenantId: TENANT_ID,
      email,
      passwordHash: await PasswordService.hash(input.password),
      role: input.role,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
    },
    select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true, createdAt: true },
  });
}
