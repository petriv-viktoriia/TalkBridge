import { Profile } from 'src/entities/profile.entity';
import { ProfileDto } from 'src/dtos/profiles/profile.dto';

export class ProfileMapper {
  static toDto(profile: Profile): ProfileDto {
    return {
      id: profile.id,
      userId: profile.user.id,
      userName: profile.userName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      gender: profile.gender,
      age: profile.age,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  static toDtoList(profiles: Profile[]): ProfileDto[] {
    return profiles.map(this.toDto);
  }
}