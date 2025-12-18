import { Module } from '@nestjs/common';
import { Profile } from 'src/entities/profile.entity';
import { ProfilesService } from './profiles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { User } from 'src/entities/user.entity';
import { Language } from 'src/entities/language.entity';
import { Interest } from 'src/entities/interest.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Profile, User, Language, Interest])],
    providers: [ProfilesService],
    controllers: [ProfilesController],
    exports: [ProfilesService],
})
export class ProfilesModule {}
