import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Profile } from 'src/entities/profile.entity';
import { ProfileDto } from 'src/dtos/profiles/profile.dto';
import { ProfileMapper } from 'src/mappers/profile.mapper';
import { User } from 'src/entities/user.entity';
import { Language } from 'src/entities/language.entity';
import { AssignLanguagesDto } from 'src/dtos/languages/assign.languages.dto';

@Injectable()
export class ProfilesService {
    constructor(
        @InjectRepository(Profile)
        private profilesRepository: Repository<Profile>,

        @InjectRepository(User)
        private usersRepository: Repository<User>,

        @InjectRepository(Language)
        private languageRepository: Repository<Language>,
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
            interests: [],
            languages: [],
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
        const profile = await this.profilesRepository.findOne({ where: { id }, relations: ['user', 'interests', 'languages'] });
        if (!profile) throw new NotFoundException(`Profile ${id} not found`);
        return ProfileMapper.toDto(profile);
    }

    async findAll(minAge?: number, maxAge?: number, languageId?: number, level?: string, type?: string): Promise<ProfileDto[]> {
        const query = this.profilesRepository.createQueryBuilder('profile')
            .leftJoinAndSelect('profile.user', 'user')
            .leftJoinAndSelect('profile.interests', 'interests')
            .leftJoinAndSelect('profile.languages', 'languages');

        if (minAge !== undefined) query.andWhere('profile.age >= :minAge', { minAge });
        if (maxAge !== undefined) query.andWhere('profile.age <= :maxAge', { maxAge });
        if (languageId) query.andWhere('language.id = :languageId', { languageId });
        if (level) query.andWhere('language.level = :level', { level });
        if (type) query.andWhere('language.type = :type', { type });

        const profiles = await query.getMany();
        return ProfileMapper.toDtoList(profiles);
    }

    async delete(id: number): Promise<void> {
        const result = await this.profilesRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException(`Profile ${id} not found`);
    }

    async assignLanguagesByUserId(userId: number, dto: AssignLanguagesDto) {
      const profile = await this.profilesRepository.findOne({
        where: { user: { id: userId } },
        relations: ['languages'],
      });

      if (!profile) {
        throw new NotFoundException(`Profile for user ${userId} not found`);
      }

      const languages = await this.languageRepository.findBy({
        id: In(dto.languageIds),
      });

      profile.languages.push(
        ...languages.filter(
          l => !profile.languages.some(pl => pl.id === l.id),
        ),
      );

      return this.profilesRepository.save(profile);
    }

    async unassignLanguagesByUserId(userId: number, dto: AssignLanguagesDto) {
      const profile = await this.profilesRepository.findOne({
        where: { user: { id: userId } },
        relations: ['languages'],
      });

      if (!profile) {
        throw new NotFoundException(`Profile for user ${userId} not found`);
      }

      profile.languages = profile.languages.filter(
        l => !dto.languageIds.includes(l.id),
      );

      return this.profilesRepository.save(profile);
    }


    async findByUserId(userId: number): Promise<ProfileDto> {
      const profile = await this.profilesRepository.findOne({ where: { user: { id: userId } }, relations: ['languages', 'user'] });
      if (!profile) {
        throw new NotFoundException(`Profile for user ${userId} not found`);
      }
      return ProfileMapper.toDto(profile);
    }

    async updateByUserId(userId: number, dto: ProfileDto): Promise<ProfileDto> {
      const profile = await this.profilesRepository.findOne({ where: { user: { id: userId } } });
      if (!profile) {
        throw new NotFoundException(`Profile for user ${userId} not found`);
      }

      Object.assign(profile, dto);
      const updated = await this.profilesRepository.save(profile);
      return ProfileMapper.toDto(updated);
    }

    async deleteByUserId(userId: number): Promise<void> {
      const profile = await this.profilesRepository.findOne({ where: { user: { id: userId } } });
      if (!profile) {
        throw new NotFoundException(`Profile for user ${userId} not found`);
      }
      await this.profilesRepository.remove(profile);
    }
}
