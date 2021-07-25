import { ApiProperty } from '@nestjs/swagger';

import { CommentInfoDto } from './responseComment.dto';

export class ResponseMultipleComments {
  @ApiProperty({ type: [CommentInfoDto] })
  comments: CommentInfoDto[];
}
