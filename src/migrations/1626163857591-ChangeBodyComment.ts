import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeBodyComment1626163857591 implements MigrationInterface {
  name = 'ChangeBodyComment1626163857591';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" RENAME COLUMN "comment" TO "body"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" RENAME COLUMN "body" TO "comment"`,
    );
  }
}
