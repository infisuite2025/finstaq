import { FastifyInstance } from 'fastify';
import { authenticate } from '../../../core/middleware/auth.middleware';
import { PayrollController } from '../controllers/payroll.controller';

export async function payrollRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate);

  // Direct /employees endpoints for HR Workspace
  app.get('/employees', PayrollController.listEmployees);
  app.get('/employees/:id', PayrollController.getEmployee);
  app.post('/employees', PayrollController.saveEmployee);

  // /payroll scoped endpoints
  app.get('/payroll/employees', PayrollController.listEmployees);
  app.get('/payroll/employees/:id', PayrollController.getEmployee);
  app.post('/payroll/employees', PayrollController.saveEmployee);
  app.post('/payroll/employees/calculate-ctc', PayrollController.calculateCtc);
  app.post('/payroll/employees/calculate-tax', PayrollController.calculateTax);
  app.get('/payroll/attendance', PayrollController.getAttendance);
  app.post('/payroll/attendance', PayrollController.updateAttendance);
  app.get('/payroll/preview', PayrollController.previewPayroll);
  app.post('/payroll/execute', PayrollController.executePayroll);
  app.get('/payroll/history', PayrollController.listPayrollRuns);
  app.get('/payroll/payslip/:employeeId', PayrollController.getPayslip);
  app.get('/payroll/reports/epfo-ecr', PayrollController.exportEpfoEcr);
  app.get('/payroll/compliance/ecr', PayrollController.exportEpfoEcr);
}
