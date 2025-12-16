import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from 'src/entities/profile.entity';
import { ProfileDto } from 'src/dtos/profiles/profile.dto';
import { ProfileMapper } from 'src/mappers/profile.mapper';
import { User } from 'src/entities/user.entity';

@Injectable()
export class ProfilesService {
    constructor(
        @InjectRepository(Profile)
        private profilesRepository: Repository<Profile>,

        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async create(dto: ProfileDto): Promise<ProfileDto> {
        if (!dto.userId) throw new BadRequestException('userId is required');
        if (!dto.userName) throw new BadRequestException('userName is required');

        const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
        if (!user) throw new NotFoundException(`User ${dto.userId} not found`);

        const existingProfile = await this.profilesRepository.findOne({ where: { user: { id: dto.userId } } });
        if (existingProfile) throw new BadRequestException(`User ${dto.userId} already has a profile`);
        
        const userNameExists = await this.profilesRepository.findOne({ where: { userName: dto.userName } });
        if (userNameExists) throw new BadRequestException(`userName: ${dto.userName} is already taken`);
        
        const profile = this.profilesRepository.create({
            ...dto,
            user,
        });

        const saved = await this.profilesRepository.save(profile);
        return ProfileMapper.toDto(saved);
    }

    async update(id: number, dto: ProfileDto): Promise<ProfileDto> {
        const profile = await this.profilesRepository.findOne({ where: { id }, relations: ['user'] });
        if (!profile) throw new NotFoundException(`Profile ${id} not found`);

        Object.keys(dto).forEach(key => {
            if (dto[key] === undefined || dto[key] === null || dto[key] === '') delete dto[key];
        });

        if (dto.userName && dto.userName !== profile.userName) {
            const exists = await this.profilesRepository.findOne({ where: { userName: dto.userName } });
            if (exists) throw new BadRequestException(`userName "${dto.userName}" is already taken`);
        }

        Object.assign(profile, dto);
        const updated = await this.profilesRepository.save(profile);
        return ProfileMapper.toDto(updated);
    }

    async findOne(id: number): Promise<ProfileDto> {
        const profile = await this.profilesRepository.findOne({ where: { id }, relations: ['user'] });
        if (!profile) throw new NotFoundException(`Profile ${id} not found`);
        return ProfileMapper.toDto(profile);
    }

    async findAll(minAge?: number, maxAge?: number): Promise<ProfileDto[]> {
        const query = this.profilesRepository.createQueryBuilder('profile')
            .leftJoinAndSelect('profile.user', 'user');

        if (minAge !== undefined) {
            query.andWhere('profile.age >= :minAge', { minAge });
        }

        if (maxAge !== undefined) {
            query.andWhere('profile.age <= :maxAge', { maxAge });
        }

        const profiles = await query.getMany();
        return ProfileMapper.toDtoList(profiles);
    }

    async delete(id: number): Promise<void> {
        const result = await this.profilesRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException(`Profile ${id} not found`);
    }
}
