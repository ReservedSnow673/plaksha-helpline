import { SendChatMessageSchema, type SendChatMessageInput } from '@plaksha/shared-schemas';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ZodBody } from '../../common/pipes/zod-validation.pipe';
import type { RequestPrincipal } from '../../common/types/request';

import { ChatService } from './chat.service';

@Controller('incidents/:incidentId/chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @RequirePermissions('chat.read')
  @Get()
  async list(
    @Param('incidentId') incidentId: string,
    @Query('before') before?: string,
    @Query('limit') limit?: string,
  ) {
    const thread = await this.chat.getThreadForIncident(incidentId);
    const messages = await this.chat.listMessages(thread.id, before, limit ? Number(limit) : undefined);
    return { data: { threadId: thread.id, messages } };
  }

  @RequirePermissions('chat.send')
  @Post()
  async send(
    @Param('incidentId') incidentId: string,
    @CurrentUser() actor: RequestPrincipal,
    @Body(ZodBody(SendChatMessageSchema)) input: SendChatMessageInput,
  ) {
    const thread = await this.chat.getThreadForIncident(incidentId);
    const message = await this.chat.send({
      threadId: thread.id,
      senderUserId: actor.userId,
      body: input.body,
      clientMessageId: input.clientMessageId,
    });
    return { data: message };
  }
}
