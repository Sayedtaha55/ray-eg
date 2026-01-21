import { Module } from '@nestjs/common';
import { MediaCompressionService } from './media-compression.service';

@Module({
  providers: [MediaCompressionService],
  exports: [MediaCompressionService],
})
export class MediaModule {}
