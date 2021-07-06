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

import { TagService } from '@app/tag/tag.service';
import { TagEntity } from './tag.entity';
import { JwtAuthGuard } from '@app/user/guards/jwt.guard';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
import { FullCrUpTagDto } from './dto/crUpTag.dto';
import { ResponseTagDto } from './dto/tag.dto';
import { DeleteResult } from 'typeorm';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}
  @Get()
  async findAll(): Promise<{ tags: TagEntity[] }> {
    const tags = await this.tagService.findAll();
    return {
      tags,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @ApiResponse({
    description: 'Добавленный тэг',
    status: 200,
    type: ResponseTagDto,
  })
  @ApiBearerAuth()
  async insertTag(@Body() addTagDto: FullCrUpTagDto): Promise<ResponseTagDto> {
    const { name } = addTagDto.tag;
    const addedTag = await this.tagService.insertTag(name);
    return { tag: addedTag };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @ApiResponse({
    description: 'Изменённый тэг',
    status: 200,
    type: ResponseTagDto,
  })
  @ApiBearerAuth()
  async updateTag(
    @Param('id') id: string,
    @Body() editTagDto: FullCrUpTagDto,
  ): Promise<ResponseTagDto> {
    const { name } = editTagDto.tag;
    const updatedTag = await this.tagService.updateTag(id, { name });
    return { tag: updatedTag };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new BackendValidationPipe())
  @ApiBearerAuth()
  async deleteTag(@Param('id') id: string): Promise<DeleteResult> {
    return this.tagService.deleteTag(id);
  }
}
