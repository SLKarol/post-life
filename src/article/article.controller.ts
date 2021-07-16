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
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { CreateArticleDto } from './dto/createArticle.dto';
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
      createArticleDto,
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
}
