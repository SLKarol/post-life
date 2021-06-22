import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions } from 'typeorm';

export const getOrmConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const url = configService.get('DATABASE_URL');
  const isNotLocalhost = url.indexOf('@localhost') === -1;
  return {
    url,
    type: 'postgres',
    port: 5432,
    entities: [join(__dirname, '/../**/**.entity{.ts,.js}')],
    synchronize: false,
    migrations: [join(__dirname, '/../migrations/**/*{.ts,.js}')],
    cli: {
      migrationsDir: 'src/migrations',
    },
    ssl: isNotLocalhost ? true : undefined,
    extra: isNotLocalhost && {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  };
};

const config: ConnectionOptions = {
  url: process.env.DATABASE_URL,
  type: 'postgres',
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
