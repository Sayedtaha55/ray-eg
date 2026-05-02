import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private resolveConfig() {
    const host = String(process.env.SMTP_HOST || '').trim();
    const portRaw = String(process.env.SMTP_PORT || '').trim();
    const port = portRaw ? Number(portRaw) : 587;
    const user = String(process.env.SMTP_USER || '').trim();
    const pass = String(process.env.SMTP_PASS || '').trim();
    const secureRaw = String(process.env.SMTP_SECURE || '').trim().toLowerCase();
    const secure = secureRaw === 'true' || secureRaw === '1';

    const from = String(process.env.SMTP_FROM || '').trim();
    const fromName = String(process.env.SMTP_FROM_NAME || '').trim();

    const isConfigured = Boolean(host && from);

    return { host, port, user, pass, secure, from, fromName, isConfigured };
  }

  async sendMail(input: { to: string; subject: string; text: string }) {
    const cfg = this.resolveConfig();
    const to = String(input?.to || '').trim();
    const subject = String(input?.subject || '').trim();
    const text = String(input?.text || '').trim();

    if (!cfg.isConfigured) {
      return { ok: false, skipped: true };
    }

    if (!to || !subject || !text) {
      return { ok: false, skipped: true };
    }

    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.user && cfg.pass ? { user: cfg.user, pass: cfg.pass } : undefined,
    });

    const from = cfg.fromName ? `${cfg.fromName} <${cfg.from}>` : cfg.from;

    await transporter.sendMail({
      from,
      to,
      subject,
      text,
    });

    return { ok: true };
  }
}
