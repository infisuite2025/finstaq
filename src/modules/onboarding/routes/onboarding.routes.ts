import { FastifyInstance } from 'fastify';
import {
  inferGstinHandler,
  getIndustryTemplatesHandler,
  applyStarterKitHandler,
  getOnboardingStatusHandler,
} from '../controllers/onboarding.controller';

export async function onboardingRoutes(app: FastifyInstance) {
  app.post('/infer-gstin', inferGstinHandler);
  app.get('/industry-templates', getIndustryTemplatesHandler);
  app.post('/apply-starter-kit', applyStarterKitHandler);
  app.get('/status', getOnboardingStatusHandler);
}
