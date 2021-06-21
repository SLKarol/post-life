import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';

export const getOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  return {
    host: configService.get('ORM_HOST'),
    username: configService.get('ORM_LOGIN'),
    password: configService.get('ORM_PASSWORD'),
    database: configService.get('ORM_DATABASE'),
    type: 'postgres',
    port: 5432,
    entities: [join(__dirname, '/../**/**.entity{.ts,.js}')],
    synchronize: false,
    migrations: [join(__dirname, '/../migrations/**/*{.ts,.js}')],
    cli: {
      migrationsDir: 'src/migrations',
    },
  };
};

const config: ConnectionOptions = {
  username: process.env.ORM_LOGIN,
  password: process.env.ORM_PASSWORD,
  database: process.env.ORM_DATABASE,
  type: 'postgres',
  port: 5432,
  entities: [join(__dirname, '/../**/**.entity{.ts,.js}')],
  synchronize: false,
  migrations: [join(__dirname, '/../migrations/**/*{.ts,.js}')],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export default config;
