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

console.log('[MediaModule] file loaded');

const disableController = String(process.env.MEDIA_DISABLE_CONTROLLER || '').toLowerCase() === 'true';

const enableOptimize =
  String(process.env.MEDIA_OPT_ENABLE || '').toLowerCase().trim() === 'true' ||
  String(process.env.MEDIA_OPT_ENABLE_WORKER || '').toLowerCase().trim() === 'true';

const controllerMode = String(process.env.MEDIA_CONTROLLER_MODE || 'full').toLowerCase().trim();
const selectedControllers =
  controllerMode === 'lite'
    ? [MediaControllerLite]
    : controllerMode === 'presign'
      ? [MediaControllerLite, MediaControllerPresignOnly]
      : controllerMode === 'put'
        ? [MediaControllerLite, MediaControllerPutOnly]
        : controllerMode === 'upload'
          ? [MediaControllerLite, MediaControllerUploadOnly]
          : controllerMode === 'full'
            ? [MediaControllerLite, MediaControllerPresignOnly, MediaControllerUploadOnly, MediaControllerPutOnly]
            : [MediaController];

@Module({
  imports: [ConfigModule, RedisModule],
  controllers: disableController ? [] : selectedControllers,
  providers: [
    MediaCompressionService,
    MediaPresignService,
    MediaStorageService,
    ...(enableOptimize ? [MediaOptimizeQueue, MediaOptimizeService, MediaOptimizeWorker] : []),
  ],
  exports: [
    MediaCompressionService,
    MediaPresignService,
    MediaStorageService,
    ...(enableOptimize ? [MediaOptimizeQueue, MediaOptimizeService] : []),
  ],
})
export class MediaModule {}
