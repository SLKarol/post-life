import { ApiProperty } from '@nestjs/swagger';
import { UploadApiResponse } from 'cloudinary';

export class AvatarDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

/**
 * Этот класс основан на ответе cloudinary, когда файл загружен
 */
class UploadedFile implements Pick<UploadApiResponse, 'url'> {
  @ApiProperty({ description: 'Адрес загруженного файла' })
  url: string;
}

export class UploadFileDto {
  @ApiProperty({ type: UploadedFile })
  file: UploadedFile;
}
