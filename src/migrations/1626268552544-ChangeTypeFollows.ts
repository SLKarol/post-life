import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTypeFollows1626268552544 implements MigrationInterface {
  name = 'ChangeTypeFollows1626268552544';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "follows" DROP COLUMN "followerId"`);
    await queryRunner.query(
      `ALTER TABLE "follows" ADD "followerId" uuid NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "follows" DROP COLUMN "followingId"`);
    await queryRunner.query(
      `ALTER TABLE "follows" ADD "followingId" uuid NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "follows" DROP COLUMN "followingId"`);
    await queryRunner.query(
      `ALTER TABLE "follows" ADD "followingId" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "follows" DROP COLUMN "followerId"`);
    await queryRunner.query(
      `ALTER TABLE "follows" ADD "followerId" character varying NOT NULL`,
    );
  }
}
