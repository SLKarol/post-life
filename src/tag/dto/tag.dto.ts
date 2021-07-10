import { ApiProperty, OmitType } from '@nestjs/swagger';

import { TagEntity } from '../tag.entity';

export class TagType extends OmitType(TagEntity, ['inArticles'] as const) {}

export class ResponseTagDto {
  @ApiProperty()
  tag: TagType;
}
