import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { ArticleEntity } from '@app/article/article.entity';

@Entity({ name: 'tags' })
export class TagEntity {
  @IsNotEmpty()
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ManyToMany(() => ArticleEntity)
  @JoinTable()
  inArticles: ArticleEntity[];
}
