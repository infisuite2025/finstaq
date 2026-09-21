import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { CommunicationService, CommunicationChannel, NotificationCategory } from '../services/communication.service';
import { ValidationError } from '../../../core/errors/app-error';

const channelEnum = z.preprocess(
  (val) => (typeof val === 'string' ? val.toUpperCase() : val),
  z.enum(['WHATSAPP', 'SMS', 'EMAIL', 'IN_APP'])
);

const categoryEnum = z.preprocess(
  (val) => (typeof val === 'string' ? val.toUpperCase() : val),
  z.enum(['ACCOUNTS', 'PURCHASE', 'SALES', 'SYSTEM', 'AUDIT']).optional()
);

const sendMessageSchema = z.object({
  channel: channelEnum,
  category: categoryEnum.default('SYSTEM'),
  recipientName: z.string().max(200).optional(),
  recipientContact: z.string().max(200).optional(),
  recipient: z.string().max(200).optional(),
  templateId: z.string().optional(),
  subject: z.string().max(300).optional(),
  content: z.string().max(5000).optional(),
  templateVariables: z.record(z.union([z.string(), z.number()])).optional(),
  variables: z.record(z.union([z.string(), z.number()])).optional(),
  metadata: z.record(z.any()).optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
});

export class CommunicationController {
  public static async getTemplates(request: FastifyRequest, reply: FastifyReply) {
    const templates = await CommunicationService.getTemplates();
    return reply.send({ success: true, data: templates });
  }

  public static async sendMessage(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = sendMessageSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid communication dispatch payload', parseResult.error.format());
    }

    const data = parseResult.data;
    const recipientContact = data.recipientContact || data.recipient || 'N/A';
    const recipientName = data.recipientName || (recipientContact.includes('@') ? recipientContact.split('@')[0] : 'Authorized Contact');
    const templateVariables = data.templateVariables || data.variables || {};

    const log = await CommunicationService.sendMessage({
      tenantId: request.user?.tenantId,
      userId: request.user?.userId,
      channel: data.channel as CommunicationChannel,
      category: (data.category || 'SYSTEM') as NotificationCategory,
      recipientName,
      recipientContact,
      templateId: data.templateId,
      subject: data.subject,
      content: data.content,
      templateVariables,
      metadata: {
        ...data.metadata,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
      },
    });

    return reply.status(201).send({
      success: true,
      message: `Message dispatched successfully via ${data.channel}`,
      data: log,
    });
  }

  public static async getLogs(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as any;
    const logs = await CommunicationService.getLogs({
      tenantId: request.user?.tenantId,
      channel: query.channel ? query.channel.toUpperCase() : undefined,
      category: query.category ? query.category.toUpperCase() : undefined,
      status: query.status ? query.status.toUpperCase() : undefined,
    });
    return reply.send({ success: true, data: logs });
  }

  public static async getNotifications(request: FastifyRequest, reply: FastifyReply) {
    const result = await CommunicationService.getNotifications(request.user?.tenantId);
    return reply.send({ success: true, data: result });
  }

  public static async createNotification(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const notification = await CommunicationService.createInAppNotification({
      tenantId: request.user?.tenantId,
      userId: body.userId || request.user?.userId,
      category: (body.category ? body.category.toUpperCase() : 'SYSTEM') as NotificationCategory,
      title: body.title || 'System Notification',
      message: body.message || '',
      actionUrl: body.actionUrl || body.link,
    });
    return reply.status(201).send({ success: true, data: notification });
  }

  public static async markAsRead(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const success = await CommunicationService.markAsRead(request.user?.tenantId, id);
    return reply.send({ success, message: success ? 'Marked as read' : 'Notification not found' });
  }

  public static async markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
    const count = await CommunicationService.markAllAsRead(request.user?.tenantId);
    return reply.send({ success: true, message: `${count} notifications marked as read` });
  }
}
