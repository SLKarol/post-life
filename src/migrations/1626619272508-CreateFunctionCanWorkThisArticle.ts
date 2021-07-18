import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionCanWorkThisArticle1626619272508
  implements MigrationInterface
{
  name = 'CreateFunctionCanWorkThisArticle1626619272508';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION can_work_this_article(
  id_article UUID,
  id_user UUID
) RETURNS boolean AS $$
SELECT exists(
  SELECT 1 FROM articles WHERE articles.id=id_article AND articles."authorId"=id_user
  );
$$ LANGUAGE sql;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION can_work_this_article`);
  }
}
