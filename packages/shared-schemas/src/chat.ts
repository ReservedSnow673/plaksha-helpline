import { z } from 'zod';

export const SendChatMessageSchema = z.object({
  body: z.string().min(1).max(4000),
  clientMessageId: z.string().min(8).max(128),
});
export type SendChatMessageInput = z.infer<typeof SendChatMessageSchema>;
