import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ArticleDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly description: string;

  @ApiProperty()
  readonly body: string;

  @ApiProperty()
  readonly tagList?: string[];
}

export class CreateArticleDto {
  @ApiProperty()
  @IsNotEmpty()
  article: ArticleDto;
}
