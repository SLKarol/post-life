import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetUniqueSlug1625926613358 implements MigrationInterface {
  name = 'SetUniqueSlug1625926613358';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" ADD CONSTRAINT "UQ_1123ff6815c5b8fec0ba9fec370" UNIQUE ("slug")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "UQ_1123ff6815c5b8fec0ba9fec370"`,
    );
  }
}
