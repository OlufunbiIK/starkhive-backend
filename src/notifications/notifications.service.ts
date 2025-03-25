import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { JobNotification } from './entities/job-notification.entity';
import { NotificationSettingsService } from '../notification-settings/notification-settings.service';
dotenv.config();
import * as Twilio from 'twilio';
import { NotificationSettingsService } from '../notification-settings/notification-settings.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JobNotification } from './entities/job-notification.entities';

@Injectable()
export class NotificationsService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'your-email@gmail.com', pass: 'your-password' },    
  });

  private twilioClient = Twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');

  constructor(
    private readonly notificationSettingsService: NotificationSettingsService,
    @InjectRepository(JobNotification)
    private readonly notificationRepository: Repository<JobNotification>,
  ) {}

  public async create(createNotificationDto: { userId: number; type: string; message: string; }) {
    const { userId, type, message } = createNotificationDto;
    const notification = this.notificationRepository.create({ userId, type, message });
    await this.notificationRepository.save(notification);

    const settings = await this.notificationSettingsService.getSettings(userId);
    if (settings.email)
      await this.sendEmail('user@example.com', 'New Notification', message);
    if (settings.push)
      this.sendPushNotification(userId, message);

    return notification;
  }

  public async createMentionNotification(mentionedUserId: string, commentId: string) {
    const userId = +mentionedUserId; 
    const notification = this.notificationRepository.create({
      userId,
      type: 'mention',
      message: `You were mentioned in comment: ${commentId}`,
    });

    await this.notificationRepository.save(notification);

    const settings = await this.notificationSettingsService.getSettings(userId);
    if (settings.email)
      await this.sendEmail('user@example.com', 'You were mentioned', `You were mentioned in comment: ${commentId}`);
    if (settings.push)
      this.sendPushNotification(userId, `You were mentioned in comment: ${commentId}`);

    return notification;
  }

  public async findByUser(userId: number) {
    return await this.notificationRepository.find({ where: { userId } });
  }
  
  public async markAsRead(id: number, read: boolean) {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    notification.read = read;
    return await this.notificationRepository.save(notification);
  }

  public async sendEmail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({ from: 'your-email@gmail.com', to, subject, text });
  }

  /**Send SMS */
  public async sendSMS(to: string, message: string) {
    await this.twilioClient.messages.create({ body: message, from: 'your-twilio-number', to });
  }

  /** Mock Push Notification */
  private sendPushNotification(userId: number, message: string) {
    console.log(`Sending Push Notification to User ${userId}: ${message}`);
  }
}
