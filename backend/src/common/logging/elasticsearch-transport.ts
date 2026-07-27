import { Transform, TransformCallback } from 'stream';

interface ElasticsearchTransportOptions {
  node?: string;
  indexPrefix?: string;
  auth?: { username?: string; password?: string };
  flushInterval?: number;
  maxBufferSize?: number;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  [key: string]: any;
}

export class ElasticsearchTransport extends Transform {
  private node: string;
  private indexPrefix: string;
  private auth: { username?: string; password?: string };
  private flushInterval: number;
  private maxBufferSize: number;
  private buffer: string[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  constructor(opts: ElasticsearchTransportOptions = {}) {
    super({ objectMode: true });
    this.node = String(opts.node || process.env.ELASTICSEARCH_NODE || 'http://localhost:9200').trim();
    this.indexPrefix = String(opts.indexPrefix || 'ray-logs').trim();
    this.auth = opts.auth || {
      username: process.env.ELASTICSEARCH_USERNAME || undefined,
      password: process.env.ELASTICSEARCH_PASSWORD || undefined,
    };
    this.flushInterval = opts.flushInterval || 5000;
    this.maxBufferSize = opts.maxBufferSize || 100;

    this.startFlushTimer();
  }

  private getIndexName() {
    const date = new Date().toISOString().slice(0, 10);
    return `${this.indexPrefix}-${date}`;
  }

  private buildBulkBody(entries: LogEntry[]): string {
    const indexName = this.getIndexName();
    return entries
      .map((entry) => {
        const header = JSON.stringify({ index: { _index: indexName } });
        const doc = JSON.stringify({
          ...entry,
          '@timestamp': entry.timestamp || new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          service: 'ray-marketplace',
        });
        return `${header}\n${doc}`;
      })
      .join('\n') + '\n';
  }

  private async flush() {
    if (this.buffer.length === 0) return;

    const rawEntries = this.buffer.splice(0, this.buffer.length);
    const entries: LogEntry[] = rawEntries.map((raw) => {
      try { return JSON.parse(raw) as LogEntry; } catch { return { timestamp: new Date().toISOString(), level: 'info', message: raw } as LogEntry; }
    });
    const body = this.buildBulkBody(entries);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/x-ndjson',
      };

      if (this.auth.username && this.auth.password) {
        const credentials = Buffer.from(`${this.auth.username}:${this.auth.password}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
      }

      const response = await fetch(`${this.node}/_bulk`, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        console.warn(`[ElasticsearchTransport] Bulk insert failed: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.warn('[ElasticsearchTransport] Failed to flush logs:', err instanceof Error ? err.message : err);
    }
  }

  private startFlushTimer() {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => {
      this.flush().catch(() => {});
    }, this.flushInterval);
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
    try {
      let entry: LogEntry;
      if (typeof chunk === 'string') {
        entry = JSON.parse(chunk);
      } else if (typeof chunk === 'object' && chunk !== null) {
        entry = chunk as LogEntry;
      } else {
        return callback();
      }

      this.buffer.push(JSON.stringify(entry));

      if (this.buffer.length >= this.maxBufferSize) {
        this.flush().catch(() => {});
      }

      callback();
    } catch {
      callback();
    }
  }

  _final(callback: TransformCallback) {
    this.isShuttingDown = true;
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush()
      .then(() => callback())
      .catch(() => callback());
  }

  close() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush().catch(() => {});
  }
}
