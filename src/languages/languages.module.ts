import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from 'src/entities/language.entity';
import { LanguagesController } from './languages.controller';
import { Profile } from 'src/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Language, Profile])],
  providers: [LanguagesService],
  exports: [LanguagesService],
  controllers: [LanguagesController],
})
export class LanguagesModule {}
