import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('image-processing') private imageProcessingQueue: Queue,
    @InjectQueue('notifications') private notificationsQueue: Queue,
    @InjectQueue('analytics') private analyticsQueue: Queue,
  ) {}

  // Email Queue
  async addEmailJob(data: {
    to: string;
    subject: string;
    template: string;
    context?: any;
  }) {
    try {
      await this.emailQueue.add('send-email', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      });
      this.logger.log(`Email job added for ${data.to}`);
    } catch (error) {
      this.logger.error('Failed to add email job:', error);
    }
  }

  // Image Processing Queue
  async addImageProcessingJob(data: {
    imageUrl: string;
    shopId: string;
    type: 'thumbnail' | 'medium' | 'large';
  }) {
    try {
      await this.imageProcessingQueue.add('process-image', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false,
      });
      this.logger.log(`Image processing job added for ${data.imageUrl}`);
    } catch (error) {
      this.logger.error('Failed to add image processing job:', error);
    }
  }

  // Notifications Queue
  async addNotificationJob(data: {
    userId: string;
    shopId?: string;
    type: 'order' | 'offer' | 'reservation' | 'general';
    title: string;
    body: string;
    data?: any;
  }) {
    try {
      await this.notificationsQueue.add('send-notification', data, {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      });
      this.logger.log(`Notification job added for user ${data.userId}`);
    } catch (error) {
      this.logger.error('Failed to add notification job:', error);
    }
  }

  // Analytics Queue
  async addAnalyticsJob(data: {
    shopId: string;
    type: 'visit' | 'order' | 'product-view' | 'search';
    metadata?: any;
  }) {
    try {
      await this.analyticsQueue.add('track-analytics', data, {
        attempts: 2,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      });
      this.logger.log(`Analytics job added for shop ${data.shopId}`);
    } catch (error) {
      this.logger.error('Failed to add analytics job:', error);
    }
  }

  // Bulk operations
  async addBulkEmailJobs(jobs: any[]) {
    try {
      await this.emailQueue.addBulk(
        jobs.map((job) => ({
          name: 'send-email',
          data: job,
          opts: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
          },
        })),
      );
      this.logger.log(`Bulk email jobs added: ${jobs.length}`);
    } catch (error) {
      this.logger.error('Failed to add bulk email jobs:', error);
    }
  }

  async addBulkNotificationJobs(jobs: any[]) {
    try {
      await this.notificationsQueue.addBulk(
        jobs.map((job) => ({
          name: 'send-notification',
          data: job,
          opts: {
            attempts: 5,
            backoff: { type: 'exponential', delay: 1000 },
          },
        })),
      );
      this.logger.log(`Bulk notification jobs added: ${jobs.length}`);
    } catch (error) {
      this.logger.error('Failed to add bulk notification jobs:', error);
    }
  }

  // Queue health check
  async getQueueStats() {
    try {
      const emailStats = await this.emailQueue.getJobCounts();
      const imageStats = await this.imageProcessingQueue.getJobCounts();
      const notificationStats = await this.notificationsQueue.getJobCounts();
      const analyticsStats = await this.analyticsQueue.getJobCounts();

      return {
        email: emailStats,
        imageProcessing: imageStats,
        notifications: notificationStats,
        analytics: analyticsStats,
      };
    } catch (error) {
      this.logger.error('Failed to get queue stats:', error);
      return null;
    }
  }

  // Clean up old jobs
  async cleanOldQueues(age: number = 24 * 60 * 60 * 1000) {
    try {
      await this.emailQueue.clean(age, 'completed');
      await this.emailQueue.clean(age, 'failed');
      await this.imageProcessingQueue.clean(age, 'completed');
      await this.imageProcessingQueue.clean(age, 'failed');
      await this.notificationsQueue.clean(age, 'completed');
      await this.notificationsQueue.clean(age, 'failed');
      await this.analyticsQueue.clean(age, 'completed');
      await this.analyticsQueue.clean(age, 'failed');

      this.logger.log('Old jobs cleaned from queues');
    } catch (error) {
      this.logger.error('Failed to clean old jobs:', error);
    }
  }
}
