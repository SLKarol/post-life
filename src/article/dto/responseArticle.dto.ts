import { ApiProperty, OmitType, IntersectionType } from '@nestjs/swagger';

import { ArticleEntity } from '../article.entity';
import { ProfileDto } from '@app/profile/dto/profile.dto';

class SecurityArticleDto extends OmitType(ArticleEntity, [
  'id',
  'author',
  'updateTimestamp',
] as const) {}

class ArticleExtend {
  @ApiProperty()
  author: ProfileDto;

  @ApiProperty({
    description: 'Число пользователей, кто добавил эту запись в "Избранное"',
  })
  favoritesCount: number;

  @ApiProperty({
    description: 'Количество комментариев',
  })
  commentsCount: number;

  @ApiProperty({ description: 'username, у которого искать избранное' })
  favorited: boolean;

  @ApiProperty({
    description: 'Список используемых тэгов в заметке',
    type: [String],
  })
  tagList: string[];
}

export class ArticleInfoDto extends IntersectionType(
  SecurityArticleDto,
  ArticleExtend,
) {}

export class ResponseArticleDto {
  @ApiProperty()
  article: ArticleInfoDto;
}
