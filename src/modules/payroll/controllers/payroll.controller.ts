import { FastifyReply, FastifyRequest } from 'fastify';
import { PayrollService, buildPayStructure } from '../services/payroll.service';

export class PayrollController {
  public static async listEmployees(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
    const { department } = request.query as { department?: string };
    const list = await PayrollService.listEmployees(tenantId, department);
    return reply.send({ success: true, data: list });
  }

  public static async getEmployee(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
    const { id } = request.params as { id: string };
    const emp = await PayrollService.getEmployeeById(tenantId, id);
    if (!emp) {
      return reply.status(404).send({ success: false, error: 'Employee not found' });
    }
    return reply.send({ success: true, data: emp });
  }

  public static async saveEmployee(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
      const emp = await PayrollService.saveEmployee(tenantId, request.body as any);
      return reply.send({ success: true, data: emp });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message || 'Failed to save employee' });
    }
  }

  public static async calculateCtc(request: FastifyRequest, reply: FastifyReply) {
    const { annualCtc, monthlyCtc, isPfEligible = true, pfCappingOption = 'CAPPED_15000', isEsicEligible } = request.body as any;
    const ctc = annualCtc || (monthlyCtc ? monthlyCtc * 12 : 600000);
    const structure = buildPayStructure(ctc, isPfEligible, pfCappingOption, isEsicEligible);
    return reply.send({ success: true, data: structure });
  }

  public static async calculateTax(request: FastifyRequest, reply: FastifyReply) {
    const { annualGross, declaration, annualPf = 21600, annualPt = 2400 } = request.body as any;
    const newRegimeTax = PayrollService.calculateTdsOnSalary(
      annualGross,
      { ...declaration, taxRegime: 'NEW' },
      annualPf,
      annualPt
    );
    const oldRegimeTax = PayrollService.calculateTdsOnSalary(
      annualGross,
      { ...declaration, taxRegime: 'OLD' },
      annualPf,
      annualPt
    );

    return reply.send({
      success: true,
      data: {
        annualGross,
        monthlyNewRegimeTds: newRegimeTax,
        annualNewRegimeTax: newRegimeTax * 12,
        monthlyOldRegimeTds: oldRegimeTax,
        annualOldRegimeTax: oldRegimeTax * 12,
        recommendedRegime: newRegimeTax <= oldRegimeTax ? 'NEW' : 'OLD',
        annualSavings: Math.abs((newRegimeTax - oldRegimeTax) * 12),
      },
    });
  }

  public static async getAttendance(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = request.query as {
      month?: string;
      year?: string;
    };
    const records = await PayrollService.getAttendanceRegister(
      tenantId,
      parseInt(String(month)),
      parseInt(String(year))
    );
    return reply.send({ success: true, data: records });
  }

  public static async updateAttendance(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
    const rec = await PayrollService.updateAttendance(tenantId, request.body as any);
    return reply.send({ success: true, data: rec });
  }

  public static async previewPayroll(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = request.query as {
      month?: string;
      year?: string;
    };
    const preview = await PayrollService.previewPayroll(
      tenantId,
      parseInt(String(month)),
      parseInt(String(year))
    );
    return reply.send({ success: true, data: preview });
  }

  public static async executePayroll(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
    const result = await PayrollService.executePayrollRun(tenantId, request.body as any);
    return reply.send({ success: true, data: result });
  }

  public static async listPayrollRuns(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
    const runs = await PayrollService.listPayrollRuns(tenantId);
    return reply.send({ success: true, data: runs });
  }

  public static async getPayslip(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
    const { employeeId } = request.params as { employeeId: string };
    const { runId } = request.query as { runId?: string };
    const payslip = await PayrollService.getPayslip(tenantId, employeeId, runId);
    return reply.send({ success: true, data: payslip });
  }

  public static async exportEpfoEcr(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = (request as any).tenantId || (request.headers['x-tenant-id'] as string) || (request.user as any)?.tenantId || 'tenant-default-01';
    const { runId } = request.query as { runId?: string };
    const ecr = await PayrollService.generateEpfoEcrText(tenantId, runId);
    return reply.send({ success: true, data: ecr });
  }
}
