import { ApiProperty } from '@nestjs/swagger';
import { ArticleInfoDto } from './responseArticle.dto';

export class ResponseMultipleArticles {
  @ApiProperty({ type: [ArticleInfoDto] })
  articles: ArticleInfoDto[];

  @ApiProperty()
  articlesCount: number;
}
