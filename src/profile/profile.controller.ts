import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { User } from '@app/user/decorators/user.decorator';
import { ProfileService } from './profile.service';
import { AllowNullUserGuard, JwtAuthGuard } from '@app/user/guards/jwt.guard';
import { ProfileResponseDto } from './dto/profile.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  @UseGuards(AllowNullUserGuard)
  @ApiResponse({
    status: 200,
    type: ProfileResponseDto,
  })
  async getProfile(
    @User('id') currentUserId: string,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileService.getProfile(
      currentUserId,
      profileUsername,
    );
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    type: ProfileResponseDto,
  })
  async followProfile(
    @User('id') currentUserId: string,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileService.followProfile(
      currentUserId,
      profileUsername,
    );
    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    type: ProfileResponseDto,
  })
  async unfollowProfile(
    @User('id') currentUserId: string,
    @Param('username') profileUsername: string,
  ): Promise<ProfileResponseDto> {
    const profile = await this.profileService.unfollowProfile(
      currentUserId,
      profileUsername,
    );
    return this.profileService.buildProfileResponse(profile);
  }
}
