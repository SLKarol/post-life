import { OmitType } from '@nestjs/swagger';

import { UserEntity } from '../user.entity';

export class UserTypeDto extends OmitType(UserEntity, [
  'id',
  'password',
  'hashPassword',
]) {}
