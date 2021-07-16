import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFuctionArticleBySlug1626439604496
  implements MigrationInterface
{
  name = 'CreateFuctionArticleBySlug1626439604496';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION article_by_slug(
  slugtext text,
  iduser text)
    RETURNS json
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE id_article uuid;
BEGIN
  select id into id_article from articles WHERE articles.slug=slugtext;
  Return (SELECT article_json(id_article, iduser::uuid));
END;
$BODY$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION article_by_slug`);
  }
}
