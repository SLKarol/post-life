import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

import { CloudinarySettings, TypeUpload } from './types/types';
import { CLOUDINARY_MODULE_OPTIONS } from './cloudinary.constants';
import { TAG_BASE_NAME } from './constants/tagFiles';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY_MODULE_OPTIONS) options: CloudinarySettings) {
    v2.config({
      cloud_name: options.cloudinaryCloudName,
      api_key: options.cloudinaryApiKey,
      api_secret: options.cloudinaryApiSecret,
    });
  }

  /**
   * Метод загрузки изображений
   */
  async uploadImage({
    file,
    type = 'avatar',
  }: {
    file: Express.Multer.File;
    type: TypeUpload;
  }): Promise<UploadApiResponse> {
    // Загрузка картинки в облако
    const uploadResponse = await this.uploadFile(file);
    if (this.isUploadApiErrorResponse(uploadResponse)) {
      throw new HttpException(
        'Upload avatar error',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    // После загрузки картинки назначить ей тэг:
    const tag = `${TAG_BASE_NAME}_${type}`;
    const { public_id } = uploadResponse;
    await v2.uploader.add_tag(tag, [public_id]);
    return uploadResponse;
  }

  /**
   * Загрузка файла в сервис cloudinary
   */
  private async uploadFile(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!file) {
      throw new HttpException(
        'File not present!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      // Буфер в виде потока отправить в функцию upload
      toStream(file.buffer).pipe(upload);
    });
  }

  /**
   * Проверка результата загрузки на наличие ошибок
   * Т.е. - проверка типа: Это UploadApiErrorResponse ?
   */
  private isUploadApiErrorResponse(
    response: UploadApiErrorResponse | UploadApiResponse,
  ): response is UploadApiErrorResponse {
    return (<UploadApiErrorResponse>response).http_code !== undefined;
  }
}
