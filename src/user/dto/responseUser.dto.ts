import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';

import { UserEntity } from '../user.entity';

class TokenDto {
  @ApiProperty({ description: 'Токен' })
  token: string;
}

class UserWithTokenDto extends IntersectionType(
  OmitType(UserEntity, ['id', 'password', 'hashPassword']),
  TokenDto,
) {}

export class ResponseUserDto {
  @ApiProperty({ description: 'Данные о пользователе' })
  user: UserWithTokenDto;
}
