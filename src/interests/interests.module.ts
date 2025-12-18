import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interest } from 'src/entities/interest.entity';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';
import { User } from 'src/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Interest, User])],
    providers: [InterestsService],
    controllers: [InterestsController],
    exports: [InterestsService],
})
export class InterestsModule {}
