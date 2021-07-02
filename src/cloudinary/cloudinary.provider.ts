import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CLOUDINARY_MODULE_OPTIONS } from './cloudinary.constants';

export const cloudinaryProvider: Provider = {
  provide: CLOUDINARY_MODULE_OPTIONS,
  inject: [ConfigService], //no worries for imports because you're using a global module
  useFactory: async (configService: ConfigService) => {
    return {
      cloudinaryCloudName: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      cloudinaryApiKey: configService.get<string>('CLOUDINARY_API_KEY'),
      cloudinaryApiSecret: configService.get<string>('CLOUDINARY_API_SECRET'),
    };
  },
};
