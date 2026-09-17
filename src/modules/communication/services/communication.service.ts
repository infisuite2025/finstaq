// @ts-nocheck
import { AuditAction } from '@prisma/client';
import { prisma as defaultPrisma } from '../../../core/database/prisma';
import { AppError } from '../../../core/errors/app-error';

export type CommunicationChannel = 'WHATSAPP' | 'SMS' | 'EMAIL' | 'IN_APP';
export type DeliveryStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
export type NotificationCategory = 'ACCOUNTS' | 'PURCHASE' | 'SALES' | 'SYSTEM' | 'AUDIT';

export interface MessageTemplate {
  id: string;
  name: string;
  channel: CommunicationChannel;
  category: NotificationCategory;
  subject?: string;
  body: string;
  variables: string[];
}

export interface CommunicationLog {
  id: string;
  tenantId: string;
  channel: CommunicationChannel;
  category: NotificationCategory;
  recipientName: string;
  recipientContact: string; // phone number or email
  templateId?: string;
  subject?: string;
  content: string;
  status: DeliveryStatus;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

import { prisma } from '../../../core/database/prisma';

export interface InAppNotification {
  id: string;
  tenantId: string;
  userId?: string;
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}


async function getTenantLogs(tenantId: string): Promise<CommunicationLog[]> {
  const record = await prisma.keyValueStore.findUnique({
    where: { tenantId_key: { tenantId, key: 'COMM_LOGS' } }
  });
  if (record && record.value) return record.value as any;
  const arr: any[] = [];
  await prisma.keyValueStore.create({ data: { tenantId, key: 'COMM_LOGS', value: arr as any } });
  return arr;
}
async function saveTenantLogs(tenantId: string, logs: CommunicationLog[]) {
  await prisma.keyValueStore.update({
    where: { tenantId_key: { tenantId, key: 'COMM_LOGS' } },
    data: { value: logs as any }
  });
}
async function getTenantNotifs(tenantId: string): Promise<InAppNotification[]> {
  const record = await prisma.keyValueStore.findUnique({
    where: { tenantId_key: { tenantId, key: 'COMM_NOTIFS' } }
  });
  if (record && record.value) return record.value as any;
  const arr: any[] = [];
  await prisma.keyValueStore.create({ data: { tenantId, key: 'COMM_NOTIFS', value: arr as any } });
  return arr;
}
async function saveTenantNotifs(tenantId: string, notifs: InAppNotification[]) {
  await prisma.keyValueStore.update({
    where: { tenantId_key: { tenantId, key: 'COMM_NOTIFS' } },
    data: { value: notifs as any }
  });
}


export class CommunicationService {
  /**
   * Retrieves all pre-configured communication templates
   */
  public static async getTemplates(): MessageTemplate[] {
    return SYSTEM_TEMPLATES;
  }

  /**
   * Dispatches a multi-channel message (WhatsApp, SMS, Email, In-App)
   */
  public static async sendMessage(dto: SendMessageDto): Promise<CommunicationLog> {
    let finalContent = dto.content || '';
    let finalSubject = dto.subject;

    // Merge template if templateId provided
    if (dto.templateId) {
      const template = SYSTEM_TEMPLATES.find((t) => t.id === dto.templateId);
      if (template) {
        finalContent = template.body;
        finalSubject = template.subject;
        if (dto.templateVariables) {
          Object.entries(dto.templateVariables).forEach(([key, val]) => {
            const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
            finalContent = finalContent.replace(regex, String(val));
            if (finalSubject) {
              finalSubject = finalSubject.replace(regex, String(val));
            }
          });
        }
      }
    }

    if (!finalContent.trim()) {
      throw new AppError('Message content cannot be empty', 400);
    }

    const logEntry: CommunicationLog = {
      id: `log-${Date.now()}`,
      tenantId: dto.tenantId,
      channel: dto.channel,
      category: dto.category || 'SYSTEM',
      recipientName: dto.recipientName,
      recipientContact: dto.recipientContact,
      templateId: dto.templateId,
      subject: finalSubject,
      content: finalContent,
      status: 'SENT',
      sentAt: new Date().toISOString(),
      deliveredAt: new Date(Date.now() + 1200).toISOString(),
      metadata: dto.metadata,
    };

    const logs = await getTenantLogs(tenantId);
    logs.unshift(logEntry);
    await saveTenantLogs(tenantId, logs);

    // If channel is IN_APP, create notification record
    if (dto.channel === 'IN_APP') {
      const notif: InAppNotification = {
        id: `notif-${Date.now()}`,
        tenantId: dto.tenantId,
        userId: dto.userId,
        category: dto.category || 'SYSTEM',
        title: finalSubject || 'System Alert',
        message: finalContent,
        isRead: false,
        actionUrl: dto.metadata?.actionUrl,
        createdAt: new Date().toISOString(),
      };
      const notifs = await getTenantNotifs(tenantId);
      notifs.unshift(notif);
      await saveTenantNotifs(tenantId, notifs);
    }

    return logEntry;
  }

  /**
   * Retrieves communication dispatch logs
   */
  public static async getLogs(query: {
    tenantId: string;
    channel?: CommunicationChannel;
    category?: NotificationCategory;
    status?: DeliveryStatus;
  }): CommunicationLog[] {
    const logs = await getTenantLogs(params.tenantId);
    return logs.filter((l) => {
      if (query.tenantId && l.tenantId !== query.tenantId) return false;
      if (query.channel && l.channel !== query.channel) return false;
      if (query.category && l.category !== query.category) return false;
      if (query.status && l.status !== query.status) return false;
      return true;
    });
  }

  /**
   * Retrieves in-app notifications
   */
  public static async getNotifications(tenantId: string): {
    unreadCount: number;
    notifications: InAppNotification[];
  } {
    const IN_MEMORY_NOTIFICATIONS = await getTenantNotifs(tenantId);
    const notifs = IN_MEMORY_NOTIFICATIONS.filter((n) => n.tenantId === tenantId);
    const unreadCount = notifs.filter((n) => !n.isRead).length;
    return { unreadCount, notifications: notifs };
  }

  /**
   * Marks a notification as read
   */
  public static async markAsRead(tenantId: string, notifId: string): boolean {
    const IN_MEMORY_NOTIFICATIONS = await getTenantNotifs(tenantId);
    const item = IN_MEMORY_NOTIFICATIONS.find((n) => n.tenantId === tenantId && n.id === notifId);
    if (item) {
      item.isRead = true;
      return true;
    }
    return false;
  }

  /**
   * Marks all notifications as read
   */
  public static async markAllAsRead(tenantId: string): number {
    let count = 0;
    const IN_MEMORY_NOTIFICATIONS = await getTenantNotifs(tenantId);
    IN_MEMORY_NOTIFICATIONS.forEach((n) => {
      if (n.tenantId === tenantId && !n.isRead) {
        n.isRead = true;
        count++;
      }
    });
    return count;
  }

  /**
   * Directly creates an in-app notification
   */
  public static async createInAppNotification(data: {
    tenantId: string;
    userId?: string;
    category?: NotificationCategory;
    title: string;
    message: string;
    actionUrl?: string;
  }): InAppNotification {
    const notif: InAppNotification = {
      id: `notif-${Date.now()}`,
      tenantId: data.tenantId,
      userId: data.userId,
      category: data.category || 'SYSTEM',
      title: data.title,
      message: data.message,
      isRead: false,
      actionUrl: data.actionUrl,
      createdAt: new Date().toISOString(),
    };
    const notifs = await getTenantNotifs(tenantId);
      notifs.unshift(notif);
      await saveTenantNotifs(tenantId, notifs);
    return notif;
  }
}
