import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProcedureInsertTags1626177592145
  implements MigrationInterface
{
  name = 'CreateProcedureInsertTags1626177592145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE PROCEDURE public.set_tag_for_article(
  tags character varying[],
  article uuid)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE                                                     
  n_tag character varying;
begin

  DELETE from tags_in_articles_articles WHERE "articlesId"=article;

  FOREACH n_tag IN ARRAY tags	LOOP
    INSERT INTO tags_in_articles_articles ("tagsId", "articlesId") 
    SELECT insert_tag(n_tag), article;
  END LOOP;
end;
$BODY$;
COMMENT ON PROCEDURE public.set_tag_for_article(character varying[], uuid)
  IS 'Установить тэги для статьи';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP PROCEDURE public.set_tag_for_article(character varying[], uuid)`,
    );
  }
}
