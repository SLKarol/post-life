import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { cloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [ConfigModule],
  providers: [CloudinaryService, cloudinaryProvider],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
