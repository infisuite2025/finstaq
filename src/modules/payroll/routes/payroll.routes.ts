import { FastifyInstance } from 'fastify';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { requireAccountantOrOwner } from '../../../core/middleware/rbac.middleware';
import { PayrollController } from '../controllers/payroll.controller';

export async function payrollRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // HR directory stays open for every signed-in role.
  app.get('/employees', PayrollController.listEmployees);
  app.get('/employees/:id', PayrollController.getEmployee);
  app.post('/employees', PayrollController.saveEmployee);

  // Phone and web both call /payroll/employees. Reads stay open. Writes stay restricted.
  app.register(async (directory) => {
    directory.get('/employees', PayrollController.listEmployees);
    directory.get('/employees/:id', PayrollController.getEmployee);
  }, { prefix: '/payroll' });

  // Payroll run, loans data, and statutory returns are owner and accountant only.
  app.register(async (payroll) => {
    payroll.addHook('preHandler', requireAccountantOrOwner);
    payroll.post('/employees', PayrollController.saveEmployee);
    payroll.post('/employees/calculate-ctc', PayrollController.calculateCtc);
    payroll.post('/employees/calculate-tax', PayrollController.calculateTax);
    payroll.get('/attendance', PayrollController.getAttendance);
    payroll.post('/attendance', PayrollController.updateAttendance);
    payroll.get('/preview', PayrollController.previewPayroll);
    payroll.post('/execute', PayrollController.executePayroll);
    payroll.get('/history', PayrollController.listPayrollRuns);
    payroll.get('/payslip/:employeeId', PayrollController.getPayslip);
    payroll.get('/reports/epfo-ecr', PayrollController.exportEpfoEcr);
    payroll.get('/compliance/ecr', PayrollController.exportEpfoEcr);
  }, { prefix: '/payroll' });
}
