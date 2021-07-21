import { ApiProperty, PickType } from '@nestjs/swagger';

export class QueryListParams {
  @ApiProperty({
    required: false,
    description: 'Тэг',
  })
  tag?: string;

  @ApiProperty({
    type: Number,
    description: 'Записей на страницу',
  })
  limit?: number;

  @ApiProperty({
    type: Number,
    description: 'Сколько строк пропустить вначале',
  })
  offset?: number;

  @ApiProperty({ required: false, description: 'Ник автора' })
  author?: string;

  @ApiProperty({ required: false, description: 'Избранное у пользователя ...' })
  favorited?: string;
}

export class QueryListFeedsParams extends PickType(QueryListParams, [
  'limit',
  'offset',
] as const) {}
