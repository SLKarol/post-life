import {
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '@app/user/user.entity';

@Entity({ name: 'articles' })
export class ArticleEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  slug: string;

  @Column()
  @ApiProperty()
  title: string;

  @Column({ default: '' })
  @ApiProperty({ description: 'Вступительная часть к заметке' })
  description: string;

  @Column({ default: '' })
  @ApiProperty({ description: 'Содержание заметки' })
  body: string;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  @ManyToOne(() => UserEntity, (user) => user.articles, { eager: true })
  author: UserEntity;
}
