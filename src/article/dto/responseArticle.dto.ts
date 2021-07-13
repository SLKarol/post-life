import { ApiProperty, OmitType, IntersectionType } from '@nestjs/swagger';

import { ArticleEntity } from '../article.entity';
import { ProfileDto } from '@app/profile/dto/profile.dto';

class Article extends OmitType(ArticleEntity, [
  'id',
  'author',
  'updateTimestamp',
] as const) {}

class Author {
  author: ProfileDto;
}

class ArticleResponse extends IntersectionType(Article, Author) {}

export class ResponseArticleDto {
  @ApiProperty()
  article: ArticleResponse;
}
