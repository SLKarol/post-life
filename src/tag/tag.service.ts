import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { Connection, DeleteResult, Repository } from 'typeorm';

import { TagEntity } from '@app/tag/tag.entity';
import { TagType } from './dto/tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectConnection() private connectionDB: Connection,
  ) {}

  async findAll(): Promise<string[]> {
    const tags = await this.tagRepository.find();
    return tags.map((tag) => tag.name);
  }

  async insertTag(nameTag: string): Promise<TagType> {
    const ids: { id: string }[] = await this.connectionDB.query(
      'Select * from insert_tag($1) as id;',
      [nameTag],
    );
    if (!ids.length) {
      throw new HttpException(
        'Возникла ошибка при добавлении тэга',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return { id: ids[0].id, name: nameTag };
  }

  private async findTagById(id: string): Promise<TagEntity> {
    return this.tagRepository.findOne({ id });
  }

  async updateTag(
    id: string,
    { name }: Partial<TagEntity>,
  ): Promise<TagEntity> {
    const tag = await this.findTagById(id);
    tag.name = name;
    return await this.tagRepository.save(tag);
  }

  async deleteTag(id: string): Promise<DeleteResult> {
    return await this.tagRepository.delete({ id });
  }
}
