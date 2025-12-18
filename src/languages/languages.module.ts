import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from 'src/entities/language.entity';
import { LanguagesController } from './languages.controller';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Language, User])],
  providers: [LanguagesService],
  exports: [LanguagesService],
  controllers: [LanguagesController],
})
export class LanguagesModule {}
