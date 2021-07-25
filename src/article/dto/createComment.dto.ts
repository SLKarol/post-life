import { ApiProperty, PickType } from '@nestjs/swagger';

import { CommentEntity } from '../comment.entity';

export class CommentDto extends PickType(CommentEntity, ['body'] as const) {
  @ApiProperty({ required: false })
  idParent?: string;
}

export class MainCommentDto {
  @ApiProperty()
  readonly comment: CommentDto;
}
