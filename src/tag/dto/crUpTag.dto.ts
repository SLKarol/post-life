import { ApiProperty, OmitType } from '@nestjs/swagger';
import { TagEntity } from '../tag.entity';

class CrUpTagDto extends OmitType(TagEntity, ['id'] as const) {}

export class FullCrUpTagDto {
  @ApiProperty()
  readonly tag: CrUpTagDto;
}
