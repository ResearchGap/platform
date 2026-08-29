export interface EmailSender {
  send(input: { html: string; subject: string; text?: string; to: string }): Promise<void>;
}
