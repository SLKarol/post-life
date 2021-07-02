import { ApiProperty } from '@nestjs/swagger';

export class AvatarDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
