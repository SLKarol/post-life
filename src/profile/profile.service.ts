import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '@app/user/user.entity';
import { ProfileDto, ProfileResponseDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getProfile(
    currentUserId: string,
    profileUsername: string,
  ): Promise<ProfileDto> {
    const profiles = await this.userRepository.query(
      'Select get_profile_by_username($1, $2) as profile;',
      [currentUserId, profileUsername],
    );
    return profiles[0]['profile'] as ProfileDto;
  }

  buildProfileResponse(profile: ProfileDto): ProfileResponseDto {
    return { profile };
  }

  async followProfile(
    currentUserId: string,
    profileUsername: string,
  ): Promise<ProfileDto> {
    try {
      const profiles = await this.userRepository.query(
        'Select follow_profile($1, $2) as profile;',
        [currentUserId, profileUsername],
      );
      return profiles[0]['profile'] as ProfileDto;
    } catch (e) {
      const { message } = e;
      throw new HttpException(message || e, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async unfollowProfile(
    currentUserId: string,
    profileUsername: string,
  ): Promise<ProfileDto> {
    try {
      const profiles = await this.userRepository.query(
        'Select unfollow_profile($1, $2) as profile;',
        [currentUserId, profileUsername],
      );
      return profiles[0]['profile'] as ProfileDto;
    } catch (e) {
      const { message } = e;
      throw new HttpException(message || e, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
