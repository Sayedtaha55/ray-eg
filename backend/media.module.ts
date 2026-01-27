import { Module } from '@nestjs/common';
import { MediaCompressionService } from './media-compression.service';
import { MediaController } from './media.controller';
import { MediaPresignService } from './media-presign.service';

@Module({
  controllers: [MediaController],
  providers: [MediaCompressionService, MediaPresignService],
  exports: [MediaCompressionService, MediaPresignService],
})
export class MediaModule {}
