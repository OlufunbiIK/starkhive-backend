import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Contract } from 'src/contract/entities/contract.entity';
import { NotificationSettings } from 'src/notification-settings/entities/notification-settings.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany, ManyToMany } from 'typeorm';
import { OneToOne } from 'typeorm';
import { FreelancerProfile } from 'src/freelancer-profile/entities/freelancer-profile.entity';
import { Post } from 'src/post/entities/post.entity';
import { Conversation } from '../../conversations/conversation.entity';

@Entity('users')
@Index(['username', 'email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @Length(3, 20)  
  username: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Column({ unique: true })
  @IsNotEmpty()  
  walletAddress: string;

  @OneToMany(() => Contract, (contract) => contract.user)
  contracts: Contract[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(
    () => Post,
    (post) => post.author,
  )
  posts: Post[]
  @OneToMany(() => NotificationSettings, (notification) => notification.user)
  notificationSettings: NotificationSettings[];

  @ManyToMany(() => Conversation, conversation => conversation.participants)
  conversations: Conversation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => FreelancerProfile, (freelancerProfile) => freelancerProfile.user, { cascade: true })
  freelancerProfile: FreelancerProfile;
}