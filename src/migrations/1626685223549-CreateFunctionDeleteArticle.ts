import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionDeleteArticle1626685223549
  implements MigrationInterface
{
  name = 'CreateFunctionDeleteArticle1626685223549';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION delete_article(
  slugtext text,
  author text)
    RETURNS boolean
    LANGUAGE 'plpgsql'
AS $BODY$
DECLARE 
  id_article uuid;
BEGIN
SELECT id INTO id_article FROM articles WHERE articles.slug=slugText AND articles."authorId"=author::uuid;
IF NOT FOUND THEN
  RAISE EXCEPTION 'Запись % невозможно удалить',slugText;
END IF;
DELETE FROM articles WHERE id=id_article;
RETURN true;
END;
$BODY$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION delete_article`);
  }
}
