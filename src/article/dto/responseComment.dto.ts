import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';

import { ProfileDto } from '@app/profile/dto/profile.dto';

import { CommentEntity } from '../comment.entity';

class CommentDto extends PickType(CommentEntity, [
  'body',
  'createdAt',
  'updatedAt',
  'id',
] as const) {
  @ApiProperty({ required: false })
  idParent?: string;
}

class AuthorCommentDto {
  @ApiProperty()
  author: ProfileDto;
}

export class CommentInfoDto extends IntersectionType(
  CommentDto,
  AuthorCommentDto,
) {}

export class ResponseCommentDto {
  @ApiProperty()
  comment: CommentInfoDto;
}
