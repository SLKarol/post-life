import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticleEntity } from './article.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ProfileModule } from '@app/profile/profile.module';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity]), ProfileModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
