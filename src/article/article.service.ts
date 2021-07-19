import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';

import { ArticleEntity } from './article.entity';
import { UserEntity } from '@app/user/user.entity';
import { ArticleDto } from './dto/createArticle.dto';
import { WARNING_NOT_ACTIVE_USER } from '@app/constants/user';
import { ArticleInfoDto, ResponseArticleDto } from './dto/responseArticle.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: ArticleDto,
  ): Promise<ArticleInfoDto> {
    // Если пользователь не активировал свою учётку, то ему не положено создавать статьи
    if (!currentUser.active) {
      throw new HttpException(WARNING_NOT_ACTIVE_USER, HttpStatus.FORBIDDEN);
    }
    const { tagList = [], ...inputNewArticle } = createArticleDto;
    const slug = this.getSlug(inputNewArticle.title);
    const newArticles = await this.articleRepository.query(
      'Select add_article($1, $2, $3, $4, $5, $6) as articles;',
      [
        slug,
        inputNewArticle.title,
        inputNewArticle.description,
        inputNewArticle.body,
        currentUser.id,
        tagList,
      ],
    );
    return newArticles[0]['articles'] as ArticleInfoDto;
  }

  /**
   * Генерирует slug ля заголовка статьи
   * @param title Заголовок статьи
   * @returns slug
   */
  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }

  buildArticleResponse(article: ArticleInfoDto): ResponseArticleDto {
    return { article };
  }

  async findBySlug(
    slug: string,
    user: UserEntity | null,
  ): Promise<ArticleInfoDto> {
    const userId = user && user.id;
    const articles = await this.articleRepository.query(
      'Select article_by_slug($1, $2) as articles;',
      [slug, userId],
    );
    return articles[0]['articles'] as ArticleInfoDto;
  }

  async updateArticle(
    slug: string,
    updateArticleDto: ArticleDto,
    currentUserId: string,
  ): Promise<ArticleInfoDto | null> {
    const { tagList = [] } = updateArticleDto;
    try {
      const newArticles = await this.articleRepository.query(
        'Select edit_article($1, $2, $3, $4, $5, $6) as articles;',
        [
          slug,
          updateArticleDto.title,
          updateArticleDto.description,
          updateArticleDto.body,
          tagList,
          currentUserId,
        ],
      );
      return newArticles[0]['articles'] as ArticleInfoDto | null;
    } catch (e) {
      const { message } = e;
      throw new HttpException(message || e, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async deleteArticle(slug: string, currentUserId: string): Promise<boolean> {
    try {
      const newArticles = await this.articleRepository.query(
        'Select delete_article($1, $2) as result;',
        [slug, currentUserId],
      );
      return newArticles[0]['result'] as boolean;
    } catch (e) {
      const { message } = e;
      throw new HttpException(message || e, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
