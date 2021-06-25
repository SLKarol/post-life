import { ApiProperty, OmitType } from '@nestjs/swagger';

import { UserEntity } from '../user.entity';

export class UserSecurityDto extends OmitType(UserEntity, [
  'id',
  'password',
  'hashPassword',
  'email',
]) {}

export class ListUsersResponseDto {
  @ApiProperty({ type: [UserSecurityDto] })
  readonly users: UserSecurityDto[];
}
