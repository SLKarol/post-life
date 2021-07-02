import { ApiProperty, PickType } from '@nestjs/swagger';

import { UserDto } from './user.dto';

export class LoginUserDto extends PickType(UserDto, [
  'email',
  'password',
] as const) {}

export class MainLoginDto {
  @ApiProperty()
  readonly user: LoginUserDto;
}
