import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import slugify from 'slugify';

import { ArticleEntity } from './article.entity';
import { UserEntity } from '@app/user/user.entity';
import { ArticleDto } from './dto/createArticle.dto';
import { WARNING_NOT_ACTIVE_USER } from '@app/constants/user';
import { ArticleInfoDto, ResponseArticleDto } from './dto/responseArticle.dto';
import { ResponseMultipleArticles } from './dto/responseMultipleArticles.dto';
import {
  QueryListFeedsParams,
  QueryListParams,
} from './dto/queryListParams.dto';
import { CommentEntity } from './comment.entity';
import { CommentInfoDto, ResponseCommentDto } from './dto/responseComment.dto';
import { CommentDto } from './dto/createComment.dto';
import { ResponseMultipleComments } from './dto/responseMultipleComments.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(ArticleEntity)
    private readonly commentRepository: Repository<CommentEntity>,
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

  async findAll(
    user: UserEntity | null,
    query: QueryListParams,
  ): Promise<ResponseMultipleArticles> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .select('article_json(articles.id, :user)', 'article');
    // Параметр к запросу
    queryBuilder.setParameter('user', user ? user.id : null);

    // Обработка фильтров
    if (query.tag) {
      queryBuilder.andWhere(
        `articles.id IN (
SELECT "articlesId" FROM tags_in_articles_articles, tags 
WHERE tags_in_articles_articles."tagsId"=tags.id AND LOWER(tags.name)=:tag
)`,
        {
          tag: query.tag.toLowerCase(),
        },
      );
    }

    // Поиск по автору
    if (query.author) {
      queryBuilder.andWhere(
        `articles."authorId" = (
SELECT id FROM users
WHERE users.username=:author
LIMIT 1
)`,
        {
          author: query.author,
        },
      );
    }

    // поиск по избранному от юзера
    if (query.favorited) {
      queryBuilder.andWhere(
        `articles.id IN (
SELECT users_favorites_articles."articlesId"
FROM users_favorites_articles, users
WHERE users.id=users_favorites_articles."usersId" AND users.username=:favorited
)`,
        {
          favorited: query.favorited,
        },
      );
    }

    // Сортировка
    queryBuilder.orderBy('articles.createdAt', 'DESC');
    // Получить общее к-во записей
    const articlesCount = await queryBuilder.getCount();
    // Постраничный запрос
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }
    // Получить список записей
    const listArticles = await queryBuilder.getRawMany<ResponseArticleDto>();
    // Приведение записей к заданному типу
    const articles = listArticles.map((a) => a.article);

    return { articles, articlesCount };
  }

  async addArticleToFavorites(
    slug: string,
    currentUserId: string,
  ): Promise<ArticleInfoDto> {
    const newArticles = await this.articleRepository.query(
      'Select add_article_to_favorites($1, $2) as articles;',
      [slug, currentUserId],
    );
    return newArticles[0]['articles'] as ArticleInfoDto | null;
  }

  async deleteArticleFromFavorites(
    slug: string,
    currentUserId: string,
  ): Promise<ArticleInfoDto> {
    const newArticles = await this.articleRepository.query(
      'Select delete_article_from_favorites($1, $2) as articles;',
      [slug, currentUserId],
    );
    return newArticles[0]['articles'] as ArticleInfoDto;
  }

  async getFeed(
    currentUserId: string,
    query: QueryListFeedsParams,
  ): Promise<ResponseMultipleArticles> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .select('article_json(articles.id, :user)', 'article');
    // Поиск по ленте юзера
    queryBuilder.innerJoin(
      'follows',
      'follows',
      'follows."followingId"=articles."authorId" AND follows."followerId"=:user',
      { follower: currentUserId },
    );
    // Параметр к запросу
    queryBuilder.setParameter('user', currentUserId);

    // Сортировка
    queryBuilder.orderBy('articles.createdAt', 'DESC');
    // Получить общее к-во записей
    const articlesCount = await queryBuilder.getCount();
    // Постраничный запрос
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }
    // Получить список записей
    const listArticles = await queryBuilder.getRawMany<ResponseArticleDto>();
    // Приведение записей к заданному типу
    const articles = listArticles.map((a) => a.article);
    console.log(queryBuilder.getQuery());
    return { articles, articlesCount };
  }

  buildCommentResponse(comment: CommentInfoDto): ResponseCommentDto {
    return { comment };
  }

  async addComment(
    slug: string,
    comment: CommentDto,
    currentUserId: string,
  ): Promise<CommentInfoDto> {
    const { body, idParent = null } = comment;
    const comments = await this.commentRepository.query(
      'Select add_comment($1, $2, $3, $4) as comments;',
      [currentUserId, slug, body, idParent],
    );
    return comments[0]['comments'] as CommentInfoDto;
  }

  async getComments(
    slug: string,
    user: UserEntity | null,
  ): Promise<ResponseMultipleComments> {
    const userId = user && user.id;
    const newArticles = await this.commentRepository.query(
      'Select get_comments_json($1, $2) as comments;',
      [slug, userId],
    );
    return newArticles[0]['comments'] as ResponseMultipleComments;
  }
}
