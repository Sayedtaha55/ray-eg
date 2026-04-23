import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class MediaVirusScanService {
  private isEnabled() {
    const raw = String(process.env.MEDIA_VIRUS_SCAN_ENABLE || '').trim().toLowerCase();
    return raw === 'true' || raw === '1' || raw === 'yes';
  }

  async scanOrThrow(params: { buffer: Buffer; mimeType?: string; originalName?: string }) {
    if (!this.isEnabled()) return { scanned: false, clean: true };

    const host = String(process.env.CLAMAV_HOST || '').trim();
    const portRaw = String(process.env.CLAMAV_PORT || '3310').trim();
    const port = Number(portRaw) || 3310;

    if (!host) {
      throw new BadRequestException('Virus scanning is enabled but CLAMAV_HOST is not configured');
    }

    const net = await import('net');

    const socket = new net.Socket();
    const timeoutMs = Math.max(1000, Number(process.env.CLAMAV_TIMEOUT_MS || 15000) || 15000);

    const connectPromise = new Promise<void>((resolve, reject) => {
      socket.once('error', reject);
      socket.connect(port, host, () => resolve());
    });

    await Promise.race([
      connectPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('ClamAV connect timeout')), timeoutMs)),
    ]);

    const response = await new Promise<string>((resolve, reject) => {
      let data = '';

      const done = (err?: any) => {
        try {
          socket.destroy();
        } catch {
        }
        if (err) return reject(err);
        resolve(data);
      };

      socket.setTimeout(timeoutMs, () => done(new Error('ClamAV scan timeout')));
      socket.on('data', (chunk: Buffer) => {
        data += chunk.toString('utf8');
        if (data.includes('\n')) {
          done();
        }
      });
      socket.on('error', (e) => done(e));

      try {
        socket.write('zINSTREAM\0');
        const buf = params.buffer;
        let offset = 0;
        const chunkSize = 8192;
        while (offset < buf.length) {
          const end = Math.min(buf.length, offset + chunkSize);
          const chunk = buf.subarray(offset, end);
          const sizeBuf = Buffer.alloc(4);
          sizeBuf.writeUInt32BE(chunk.length, 0);
          socket.write(sizeBuf);
          socket.write(chunk);
          offset = end;
        }
        socket.write(Buffer.alloc(4));
      } catch (e) {
        done(e);
      }
    });

    const normalized = String(response || '').trim();
    const isOk = normalized.includes('OK');
    const isFound = normalized.includes('FOUND');

    if (!isOk || isFound) {
      throw new BadRequestException('Virus scan failed');
    }

    return { scanned: true, clean: true };
  }
}
