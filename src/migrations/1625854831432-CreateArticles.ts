import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticles1625854831432 implements MigrationInterface {
  name = 'CreateArticles1625854831432';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "body" character varying NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" uuid, CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_favorites_articles" ("usersId" uuid NOT NULL, "articlesId" uuid NOT NULL, CONSTRAINT "PK_aebb5070a5fa58957adae6d78af" PRIMARY KEY ("usersId", "articlesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b3bc5ca3e98f5f3858dbf626ad" ON "users_favorites_articles" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_61dc60abcf0035e5ce2aea013b" ON "users_favorites_articles" ("articlesId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tags_in_articles_articles" ("tagsId" uuid NOT NULL, "articlesId" uuid NOT NULL, CONSTRAINT "PK_a705f9719c457941ebc83199e0c" PRIMARY KEY ("tagsId", "articlesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bd9792857d9e7fe5eb8f51a523" ON "tags_in_articles_articles" ("tagsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_644e1ee7f17bed955923c0876f" ON "tags_in_articles_articles" ("articlesId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_favorites_articles" ADD CONSTRAINT "FK_b3bc5ca3e98f5f3858dbf626ad6" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_favorites_articles" ADD CONSTRAINT "FK_61dc60abcf0035e5ce2aea013bc" FOREIGN KEY ("articlesId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags_in_articles_articles" ADD CONSTRAINT "FK_bd9792857d9e7fe5eb8f51a5236" FOREIGN KEY ("tagsId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags_in_articles_articles" ADD CONSTRAINT "FK_644e1ee7f17bed955923c0876fc" FOREIGN KEY ("articlesId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tags_in_articles_articles" DROP CONSTRAINT "FK_644e1ee7f17bed955923c0876fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags_in_articles_articles" DROP CONSTRAINT "FK_bd9792857d9e7fe5eb8f51a5236"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_favorites_articles" DROP CONSTRAINT "FK_61dc60abcf0035e5ce2aea013bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_favorites_articles" DROP CONSTRAINT "FK_b3bc5ca3e98f5f3858dbf626ad6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_644e1ee7f17bed955923c0876f"`);
    await queryRunner.query(`DROP INDEX "IDX_bd9792857d9e7fe5eb8f51a523"`);
    await queryRunner.query(`DROP TABLE "tags_in_articles_articles"`);
    await queryRunner.query(`DROP INDEX "IDX_61dc60abcf0035e5ce2aea013b"`);
    await queryRunner.query(`DROP INDEX "IDX_b3bc5ca3e98f5f3858dbf626ad"`);
    await queryRunner.query(`DROP TABLE "users_favorites_articles"`);
    await queryRunner.query(`DROP TABLE "articles"`);
  }
}
