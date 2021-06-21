import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';

export const getOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  return {
    // host: configService.get('ORM_HOST'),
    // username: configService.get('ORM_LOGIN'),
    // password: configService.get('ORM_PASSWORD'),
    // database: configService.get('ORM_DATABASE'),
    url: configService.get('DATABASE_URL'),
    type: 'postgres',
    port: 5432,
    entities: [join(__dirname, '/../**/**.entity{.ts,.js}')],
    synchronize: false,
    migrations: [join(__dirname, '/../migrations/**/*{.ts,.js}')],
    cli: {
      migrationsDir: 'src/migrations',
    },
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  };
};

const config: ConnectionOptions = {
  // username: process.env.ORM_LOGIN,
  // password: process.env.ORM_PASSWORD,
  // database: process.env.ORM_DATABASE,
  url: process.env.DATABASE_URL,
  type: 'postgres',
  port: 5432,
  entities: [join(__dirname, '/../**/**.entity{.ts,.js}')],
  synchronize: false,
  migrations: [join(__dirname, '/../migrations/**/*{.ts,.js}')],
  cli: {
    migrationsDir: 'src/migrations',
  },
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};

export default config;
