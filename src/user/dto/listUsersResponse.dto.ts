import { ApiProperty, OmitType } from '@nestjs/swagger';

import { UserEntity } from '../user.entity';

class SecurityUserDto extends OmitType(UserEntity, [
  'id',
  'password',
  'hashPassword',
  'email',
  'articles',
  'favorites',
]) {}

export class ListUsersResponseDto {
  @ApiProperty({ type: [SecurityUserDto] })
  readonly users: SecurityUserDto[];
}
