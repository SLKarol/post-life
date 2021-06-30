import { ApiProperty, PartialType } from '@nestjs/swagger';

import { CreateUserDto } from './createUser.dto';

export class PatchUserDto extends PartialType(CreateUserDto) {}

export class MainPatchUserDto {
  @ApiProperty({ description: 'Данные для обновления юзера' })
  readonly user: PatchUserDto;
}
