import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterestDto } from 'src/dtos/interests/interest.dto';
import { Interest } from 'src/entities/interest.entity';
import { Profile } from 'src/entities/profile.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class InterestsService {
    constructor(
        @InjectRepository(Interest)
        private interestsRepository: Repository<Interest>,

        @InjectRepository(Profile)
        private profileRepository: Repository<Profile>,
    ) {}

  async create(dto: InterestDto): Promise<Interest> {
    if (!dto.name) throw new BadRequestException('Interest name is required');

    const exists = await this.interestsRepository.findOne({ where: { name: dto.name } });

    if (exists) throw new BadRequestException(`Interest ${dto.name} already exists`);

    const interest = this.interestsRepository.create(dto);
    return this.interestsRepository.save(interest);
  }

  async findAll(): Promise<Interest[]> {
    return this.interestsRepository.find();
  }

  async findOne(id: number): Promise<Interest> {
    const interest = await this.interestsRepository.findOne({ where: { id } });
    if (!interest) throw new NotFoundException(`Interest ${id} not found`);
    return interest;
  }

  async update(id: number, dto: InterestDto): Promise<Interest> {
    const interest = await this.findOne(id);

    if (!dto.name) throw new BadRequestException('Interest name is required');

    if (dto.name !== interest.name) {
      const exists = await this.interestsRepository.findOne({
        where: { name: dto.name },
      });

      if (exists) {
        throw new BadRequestException(`Interest ${dto.name} already exists`);
      }
    }

    interest.name = dto.name;
    await this.interestsRepository.save(interest);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const interest = await this.interestsRepository.findOne({ where: { id }, relations: ['profiles'] });
    if (!interest) throw new NotFoundException(`Interest ${id} not found`);

    if (interest.profiles && interest.profiles.length > 0) {
        interest.profiles = [];
        await this.interestsRepository.save(interest);
    }
    await this.interestsRepository.delete(id);
  }

  async assignInterestsToProfile(profileId: number, interestIds: number[]): Promise<Profile> {
  const profile = await this.profileRepository.findOne({ where: { id: profileId }, relations: ['interests'] });
  if (!profile) throw new NotFoundException(`Profile ${profileId} not found`);

  const interests = await this.interestsRepository.find({ where: { id: In(interestIds) } });
  if (interests.length !== interestIds.length) throw new BadRequestException('Some interests do not exist');

  profile.interests = interests;
  return this.profileRepository.save(profile);
}

  async removeInterestFromProfile(profileId: number, interestId: number): Promise<Profile> {
    const user = await this.profileRepository.findOne({ where: { id: profileId }, relations: ['interests'] });
    if (!user) throw new NotFoundException(`Profile ${profileId} not found`);

    const exists = user.interests.find(interest => interest.id === interestId);
    if (!exists) throw new BadRequestException(`Interest ${interestId} is not assigned to user ${profileId}`);

    user.interests = user.interests.filter(interest => interest.id !== interestId);
    return this.profileRepository.save(user);
  }
}