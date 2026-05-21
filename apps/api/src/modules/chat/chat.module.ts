import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ChatMessage } from '../../db/models/chat-message.model';
import { ChatThread } from '../../db/models/chat-thread.model';
import { OutboxModule } from '../outbox/outbox.module';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [SequelizeModule.forFeature([ChatThread, ChatMessage]), OutboxModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
