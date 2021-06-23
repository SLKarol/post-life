import { ApiProperty, IntersectionType } from '@nestjs/swagger';

import { UserTypeDto } from './userType.dto';

class TokenDto {
  @ApiProperty()
  token: string;
}

class UserDto extends IntersectionType(UserTypeDto, TokenDto) {}

export class ResponseUserDto {
  @ApiProperty({ description: 'Данные о пользователе' })
  user: UserDto;
}
