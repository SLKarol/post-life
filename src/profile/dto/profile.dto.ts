import { ApiProperty, IntersectionType } from '@nestjs/swagger';

import { SecurityUserDto } from '@app/user/dto/listUsersResponse.dto';

class FollowedProp {
  @ApiProperty()
  following: boolean;
}

export class ProfileDto extends IntersectionType(
  SecurityUserDto,
  FollowedProp,
) {}

export class ProfileResponseDto {
  @ApiProperty()
  profile: ProfileDto;
}
