import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaCompressionService } from './media-compression.service';
import { RedisModule } from './redis/redis.module';
import {
  MediaController,
  MediaControllerLite,
  MediaControllerPresignOnly,
  MediaControllerPutOnly,
  MediaControllerUploadOnly,
} from './media.controller';
import { MediaPresignService } from './media-presign.service';
import { MediaStorageService } from './media-storage.service';
import { MediaOptimizeQueue } from './media-optimize.queue';
import { MediaOptimizeService } from './media-optimize.service';
import { MediaOptimizeWorker } from './media-optimize.worker';

const disableController = String(process.env.MEDIA_DISABLE_CONTROLLER || '').toLowerCase() === 'true';

const controllerMode = String(process.env.MEDIA_CONTROLLER_MODE || 'full').toLowerCase().trim();
const selectedControllers =
  controllerMode === 'lite'
    ? [MediaControllerLite]
    : controllerMode === 'presign'
      ? [MediaControllerPresignOnly]
      : controllerMode === 'put'
        ? [MediaControllerPutOnly]
      : controllerMode === 'upload'
        ? [MediaControllerUploadOnly]
        : [MediaControllerPresignOnly, MediaControllerUploadOnly, MediaControllerPutOnly];

@Module({
  imports: [ConfigModule, RedisModule],
  controllers: disableController ? [] : selectedControllers,
  providers: [
    MediaCompressionService,
    MediaPresignService,
    MediaStorageService,
    MediaOptimizeQueue,
    MediaOptimizeService,
    MediaOptimizeWorker,
  ],
  exports: [MediaCompressionService, MediaPresignService, MediaStorageService, MediaOptimizeQueue, MediaOptimizeService],
})
export class MediaModule {}
