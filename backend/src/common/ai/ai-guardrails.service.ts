import { Injectable } from '@nestjs/common';

export interface GuardrailsResult {
  redactedText: string;
  flags: string[];
  blocked: boolean;
  reason?: string;
}

@Injectable()
export class AiGuardrailsService {
  redactPII(input: string) {
    let text = String(input || '');

    // Email
    text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]');

    // Credit card (very rough)
    text = text.replace(/\b(?:\d[ -]*?){13,19}\b/g, (m) => {
      const digits = m.replace(/\D/g, '');
      if (digits.length < 13 || digits.length > 19) return m;
      return '[REDACTED_CARD]';
    });

    // Phone numbers (Egypt + generic)
    text = text.replace(/\b(?:\+?2)?01[0-2,5]{1}[0-9]{8}\b/g, '[REDACTED_PHONE]');
    text = text.replace(/\b\+?[0-9]{1,3}[ -]?[0-9]{3,4}[ -]?[0-9]{3,4}[ -]?[0-9]{3,4}\b/g, (m) => {
      const digits = m.replace(/\D/g, '');
      if (digits.length >= 10 && digits.length <= 15) return '[REDACTED_PHONE]';
      return m;
    });

    return text;
  }

  moderate(input: string): { flags: string[]; blocked: boolean; reason?: string } {
    const text = String(input || '').toLowerCase();
    const flags: string[] = [];

    // Very basic safety signals (can be improved later)
    const selfHarm = /(suicide|kill myself|انتحار|هنتحر|اقتل نفسي)/i;
    const violence = /(how to make a bomb|make a bomb|تفجير|قنبلة|سلاح)/i;
    const hate = /(nazi|هتلر|ابادة|قتل جماعي)/i;

    if (selfHarm.test(text)) flags.push('self_harm');
    if (violence.test(text)) flags.push('violence');
    if (hate.test(text)) flags.push('hate');

    const blocked = flags.includes('self_harm') || flags.includes('violence');
    const reason = blocked ? 'Message violates safety policy' : undefined;

    return { flags, blocked, reason };
  }

  run(input: string): GuardrailsResult {
    const redactedText = this.redactPII(input);
    const moderation = this.moderate(redactedText);

    return {
      redactedText,
      flags: moderation.flags,
      blocked: moderation.blocked,
      reason: moderation.reason,
    };
  }
}
