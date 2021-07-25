import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

import { ArticleDto, CreateArticleDto } from './dto/createArticle.dto';
import { ResponseArticleDto } from './dto/responseArticle.dto';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { ArticleService } from './article.service';
import { JwtAuthGuard, AllowNullUserGuard } from '@app/user/guards/jwt.guard';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
import { ResponseMultipleArticles } from './dto/responseMultipleArticles.dto';
import {
  QueryListFeedsParams,
  QueryListParams,
} from './dto/queryListParams.dto';
import { CommentDto, MainCommentDto } from './dto/createComment.dto';
import { ResponseCommentDto } from './dto/responseComment.dto';
import { ResponseMultipleComments } from './dto/responseMultipleComments.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @ApiBearerAuth()
  @ApiResponse({
    description: 'Новая заметка',
    status: 200,
    type: ResponseArticleDto,
  })
  async create(
    @User() currentUser: UserEntity,
    @Body('article') articleDto: ArticleDto,
  ): Promise<ResponseArticleDto> {
    const article = await this.articleService.createArticle(
      currentUser,
      articleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    type: ResponseMultipleArticles,
  })
  async getFeed(
    @User('id') currentUserId: string,
    @Query() query: QueryListFeedsParams,
  ): Promise<ResponseMultipleArticles> {
    return await this.articleService.getFeed(currentUserId, query);
  }

  @Get(':slug')
  @UseGuards(AllowNullUserGuard)
  @ApiResponse({
    description: 'Заметка',
    status: 200,
    type: ResponseArticleDto,
  })
  async getSingleArticle(
    @Param('slug') slug: string,
    @User() currentUser: UserEntity | null,
  ): Promise<ResponseArticleDto> {
    const article = await this.articleService.findBySlug(slug, currentUser);
    return this.articleService.buildArticleResponse(article);
  }

  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @ApiBody({ type: CreateArticleDto })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    type: ResponseArticleDto,
  })
  async updateArticle(
    @User('id') currentUserId: string,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: ArticleDto,
  ): Promise<ResponseArticleDto> {
    const article = await this.articleService.updateArticle(
      slug,
      updateArticleDto,
      currentUserId,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    type: Boolean,
  })
  async deleteArticle(
    @User('id') currentUserId: string,
    @Param('slug') slug: string,
  ): Promise<boolean> {
    return await this.articleService.deleteArticle(slug, currentUserId);
  }

  @Get()
  @UseGuards(AllowNullUserGuard)
  @ApiResponse({
    status: 200,
    type: ResponseMultipleArticles,
  })
  async findAll(
    @User() currentUser: UserEntity | null,
    @Query() query: QueryListParams,
  ): Promise<ResponseMultipleArticles> {
    return await this.articleService.findAll(currentUser, query);
  }

  @Post(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    type: ResponseArticleDto,
  })
  async addArticleToFavorites(
    @User('id') currentUserId: string,
    @Param('slug') slug: string,
  ): Promise<ResponseArticleDto> {
    const article = await this.articleService.addArticleToFavorites(
      slug,
      currentUserId,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Post(':slug/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: MainCommentDto })
  @ApiResponse({
    status: 200,
    type: ResponseCommentDto,
  })
  async addComment(
    @User('id') currentUserId: string,
    @Param('slug') slug: string,
    @Body('comment') commentDto: CommentDto,
  ): Promise<ResponseCommentDto> {
    const comment = await this.articleService.addComment(
      slug,
      commentDto,
      currentUserId,
    );
    return this.articleService.buildCommentResponse(comment);
  }

  @Delete(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    type: ResponseArticleDto,
  })
  async deleteArticleFromFavorites(
    @User('id') currentUserId: string,
    @Param('slug') slug: string,
  ): Promise<ResponseArticleDto> {
    const article = await this.articleService.deleteArticleFromFavorites(
      slug,
      currentUserId,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug/comments')
  @UseGuards(AllowNullUserGuard)
  @ApiResponse({
    status: 200,
    type: ResponseMultipleComments,
  })
  async getComments(
    @User() currentUser: UserEntity | null,
    @Param('slug') slug: string,
  ): Promise<ResponseMultipleComments> {
    return await this.articleService.getComments(slug, currentUser);
  }
}
