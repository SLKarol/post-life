import { OmitType } from '@nestjs/swagger';

import { UserEntity } from '../user.entity';

class UserSecurityDto extends OmitType(UserEntity, [
  'id',
  'password',
  'hashPassword',
  'email',
]) {}

export class ListUsersResponseDto {
  users: UserSecurityDto[];
}
