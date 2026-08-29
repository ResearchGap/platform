import nodemailer from "nodemailer";

import type { EmailSender } from "../../modules/password-reset/email-sender.js";

interface SmtpEmailSenderConfig {
  from: string;
  host: string;
  password: string;
  port: number;
  secure: boolean;
  user: string;
}

export class SmtpEmailSender implements EmailSender {
  private readonly from: string;
  private readonly transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor(config: SmtpEmailSenderConfig) {
    this.from = config.from;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.password },
    });
  }

  async send(input: Parameters<EmailSender["send"]>[0]): Promise<void> {
    await this.transporter.sendMail({ from: this.from, ...input });
  }
}
