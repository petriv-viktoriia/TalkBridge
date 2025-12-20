import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Column, Index } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('chats')
@Index(['profile1', 'profile2'], { unique: true })
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  // Перший учасник (завжди менший ID)
  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile1Id' })
  profile1: Profile;

  @Column()
  profile1Id: number;

  // Другий учасник (завжди більший ID)
  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile2Id' })
  profile2: Profile;

  @Column()
  profile2Id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Останнє повідомлення (для зручності)
  @Column({ type: 'text', nullable: true })
  lastMessage?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt?: Date;
}
