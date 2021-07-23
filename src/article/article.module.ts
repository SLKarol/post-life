import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticleEntity } from './article.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { CommentEntity } from './comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleEntity]),
    TypeOrmModule.forFeature([CommentEntity]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
