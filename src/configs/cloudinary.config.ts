import { ConfigService } from '@nestjs/config';

import { ICloudinaryOptions } from '@app/cloudinary/cloudinary.interface';

export const getCloudinaryConfig = (
  configService: ConfigService,
): ICloudinaryOptions => {
  const cloudinaryCloudName = configService.get('CLOUDINARY_CLOUD_NAME');
  const cloudinaryApiKey = configService.get('CLOUDINARY_API_KEY');
  const cloudinaryApiSecret = configService.get('CLOUDINARY_API_SECRET');
  if (!cloudinaryCloudName && !cloudinaryApiKey && !cloudinaryApiSecret) {
    throw new Error('Не заданы настройки cloudinary!');
  }
  return {
    cloudinaryCloudName,
    cloudinaryApiKey,
    cloudinaryApiSecret,
  };
};
