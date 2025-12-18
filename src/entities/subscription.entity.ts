import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Column, Unique } from 'typeorm';
import { Profile } from './profile.entity';

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  REJECTED = 'REJECTED',
}

@Entity('subscriptions')
@Unique(['follower', 'following'])
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: Profile;

  @Column()
  followerId: number;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' })
  following: Profile;

  @Column()
  followingId: number;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  matchedAt: Date | null;
}