import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaCompressionService } from '@modules/media/media-compression.service';
import { RedisModule } from '@common/redis/redis.module';
import { PrismaModule } from '@common/prisma/prisma.module';
import {
  MediaController,
  MediaControllerLite,
  MediaControllerPresignOnly,
  MediaControllerPutOnly,
  MediaControllerUploadOnly,
} from '@modules/media/media.controller';
import { MediaPresignService } from './media-presign.service';
import { MediaStorageService } from '@modules/media/media-storage.service';
import { MediaOptimizeQueue } from './media-optimize.queue';
import { MediaOptimizeService } from '@modules/media/media-optimize.service';
import { MediaOptimizeWorker } from './media-optimize.worker';
import { Media3dOptimizeService } from './media-3d-optimize.service';
import { MediaVirusScanService } from './media-virus-scan.service';

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
  imports: [ConfigModule, RedisModule, PrismaModule],
  controllers: disableController ? [] : selectedControllers,
  providers: [
    MediaCompressionService,
    MediaPresignService,
    MediaVirusScanService,
    MediaStorageService,
    MediaOptimizeService,
    Media3dOptimizeService,
    ...(enableOptimize ? [MediaOptimizeQueue, MediaOptimizeWorker] : []),
  ],
  exports: [
    MediaCompressionService,
    MediaPresignService,
    MediaStorageService,
    MediaOptimizeService,
    Media3dOptimizeService,
    ...(enableOptimize ? [MediaOptimizeQueue] : []),
  ],
})
export class MediaModule {}
