import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssignLanguagesDto } from 'src/dtos/languages/assign.languages.dto';
import { LanguageDto } from 'src/dtos/languages/language.dto';
import { Language } from 'src/entities/language.entity';
import { Profile } from 'src/entities/profile.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class LanguagesService {
    constructor(
        @InjectRepository(Language)
        private readonly languageRepository: Repository<Language>,
    ) {}

    async create(dto: LanguageDto) {
        try {
            const language = this.languageRepository.create(dto);
            return await this.languageRepository.save(language);
        } catch (error) {
            if (error.code === '23505') {
            throw new ConflictException(
                `Language ${dto.name} (${dto.type}, ${dto.level}) already exists`,
            );
            }
            throw error;
        }
    }

    async findAll() {
    return this.languageRepository.find();
  }

  async findOne(id: number) {
    const language = await this.languageRepository.findOne({ where: { id } });

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    return language;
  }

  async update(id: number, dto: LanguageDto) {
    const language = await this.findOne(id);

    const duplicate = await this.languageRepository.findOne({ where: { name: dto.name, level: dto.level, type: dto.type } });

    if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
        `Language ${dto.name} (${dto.type}, ${dto.level}) already exists`,
        );
    }

    Object.assign(language, dto);
    try {
        return await this.languageRepository.save(language);
        } catch (error) {
        if (error.code === '23505') {
            throw new ConflictException(
            `Language ${dto.name} (${dto.type}, ${dto.level}) already exists`,
            );
        }
        throw error;
    }
  }

  async delete(id: number) {
    const language = await this.findOne(id);
    return this.languageRepository.remove(language);
  }
}