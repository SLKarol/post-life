import { ApiProperty, PartialType } from '@nestjs/swagger';

import { UserDto } from './user.dto';

export class PatchUserDto extends PartialType(UserDto) {}

export class MainPatchUserDto {
  @ApiProperty({ description: 'Данные для обновления юзера' })
  readonly user: PatchUserDto;
}
