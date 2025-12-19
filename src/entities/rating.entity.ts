import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Column, Unique, Check } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('ratings')
@Unique(['rater', 'rated'])
@Check('"score" >= 1 AND "score" <= 5')
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'raterId' })
  rater: Profile;

  @Column()
  raterId: number;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ratedId' })
  rated: Profile;

  @Column()
  ratedId: number;

  @Column({ type: 'int' })
  score: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}