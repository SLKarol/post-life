import { ApiProperty } from '@nestjs/swagger';
import { TagEntity } from '../tag.entity';

export class ResponseTagDto {
  @ApiProperty()
  tag: TagEntity;
}
