import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, Unique } from 'typeorm';
import { Profile } from './profile.entity';

export enum LanguageLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  NATIVE = 'NATIVE',
}

export enum LanguageType {
    TEACHING = 'TEACHING',
    LEARNING = 'LEARNING',
}

@Entity('languages')
@Unique(['name', 'level', 'type'])
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: LanguageLevel })
  level: LanguageLevel;

  @Column({ type: 'enum', enum: LanguageType })
  type: LanguageType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Profile, (profile) => profile.languages)
  profiles: Profile[];
}
