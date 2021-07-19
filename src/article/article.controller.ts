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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

import { ArticleDto, CreateArticleDto } from './dto/createArticle.dto';
import { ResponseArticleDto } from './dto/responseArticle.dto';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { ArticleService } from './article.service';
import { JwtAuthGuard, AllowNullUserGuard } from '@app/user/guards/jwt.guard';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';

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
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ResponseArticleDto> {
    const article = await this.articleService.createArticle(
      currentUser,
      createArticleDto.article,
    );
    return this.articleService.buildArticleResponse(article);
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
}
