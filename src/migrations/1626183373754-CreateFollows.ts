import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollows1626183373754 implements MigrationInterface {
  name = 'CreateFollows1626183373754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "follows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "followerId" character varying NOT NULL, "followingId" character varying NOT NULL, CONSTRAINT "PK_8988f607744e16ff79da3b8a627" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "follows"`);
  }
}
