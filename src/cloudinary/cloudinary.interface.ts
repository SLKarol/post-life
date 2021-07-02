import { ModuleMetadata } from '@nestjs/common';

export interface ICloudinaryOptions {
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
}

export interface ICloudinaryModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) => Promise<ICloudinaryOptions> | ICloudinaryOptions;
  inject?: any[];
}
