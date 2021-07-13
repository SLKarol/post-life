import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Connection, DeleteResult, Repository } from 'typeorm';
import slugify from 'slugify';

import { ArticleEntity } from './article.entity';
import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { WARNING_NOT_ACTIVE_USER } from '@app/constants/user';
import { ResponseArticleDto } from './dto/responseArticle.dto';
import { ProfileService } from '@app/profile/profile.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private readonly profileService: ProfileService,
  ) {}

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    // Если пользователь не активировал свою учётку, то ему не положено создавать статьи
    if (!currentUser.active) {
      throw new HttpException(WARNING_NOT_ACTIVE_USER, HttpStatus.FORBIDDEN);
    }
    const { tagList = [], ...inputNewArticle } = createArticleDto.article;
    let article = new ArticleEntity();
    Object.assign(article, inputNewArticle);
    article.slug = this.getSlug(inputNewArticle.title);
    article.author = currentUser;
    article = await this.articleRepository.save(article);
    // Задать информацию по тэгам
    await this.articleRepository.query(
      'CALL public.set_tag_for_article($1, $2);',
      [tagList, article.id],
    );
    return article;
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

  async buildArticleResponse(
    article: ArticleEntity,
    currentUserId: string,
  ): Promise<ResponseArticleDto> {
    const author = await this.profileService.getProfile(
      currentUserId,
      article.author.username,
    );
    const { id, ...responseArticle } = article;
    const re = { ...responseArticle, author };
    return { article: { ...re } };
  }
}
