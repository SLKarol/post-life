import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditRelationArticleComment1626170922112
  implements MigrationInterface
{
  name = 'EditRelationArticleComment1626170922112';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "FK_712708472f44a600c8bf9b7e02e"`,
    );
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "commentId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "articles" ADD "commentId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "articles" ADD CONSTRAINT "FK_712708472f44a600c8bf9b7e02e" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
