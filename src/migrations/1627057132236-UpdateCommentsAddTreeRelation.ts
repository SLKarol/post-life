import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCommentsAddTreeRelation1627057132236
  implements MigrationInterface
{
  name = 'UpdateCommentsAddTreeRelation1627057132236';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "fk_tree_comments" FOREIGN KEY (id_parent) REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT "fk_tree_comments"`,
    );
  }
}
