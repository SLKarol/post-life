import { ApiProperty, OmitType } from '@nestjs/swagger';

import { UserEntity } from '../user.entity';

export class SecurityUserDto extends OmitType(UserEntity, [
  'id',
  'password',
  'hashPassword',
  'email',
  'articles',
  'favorites',
  'comments',
]) {}

export class ListUsersResponseDto {
  @ApiProperty({ type: [SecurityUserDto] })
  readonly users: SecurityUserDto[];
}
