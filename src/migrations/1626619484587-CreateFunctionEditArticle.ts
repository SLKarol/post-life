import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionEditArticle1626619484587
  implements MigrationInterface
{
  name = 'CreateFunctionEditArticle1626619484587';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION edit_article(
  slugText text,
  titleText text,
  descriptionText text,
  bodyText text,
  tags text[],
  author text)
    RETURNS json
    LANGUAGE 'plpgsql'
AS $BODY$
DECLARE 
  id_article uuid;
  can_edit boolean;
BEGIN
select id into id_article from articles WHERE articles.slug=slugText;
SELECT can_work_this_article(id_article, author::uuid) into can_edit;
IF can_edit=true THEN
  UPDATE articles SET title=titleText, description=descriptionText, body=bodyText
    WHERE id=id_article;
  CALL set_tag_for_article(tags, id_article);
  Return (SELECT article_json(id_article, author::uuid) as articles);
ELSE
  RETURN null;
END IF;
END;
$BODY$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION edit_article`);
  }
}
