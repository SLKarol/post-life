import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionAddToFavorites1626705232459
  implements MigrationInterface
{
  name = 'CreateFunctionAddToFavorites1626705232459';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION add_article_to_favorites(
  slugText text,
  user_id text)
    RETURNS json
    LANGUAGE 'plpgsql'
AS $BODY$
DECLARE 
  id_article uuid;
BEGIN
SELECT id INTO id_article FROM articles WHERE articles.slug=slugText;

IF EXISTS (
	SELECT 1 FROM users_favorites_articles
	WHERE users_favorites_articles."usersId"=user_id::uuid
	  AND users_favorites_articles."articlesId"=id_article
) THEN
  	DELETE FROM users_favorites_articles
  	WHERE "usersId"=user_id::uuid AND "articlesId"=id_article;
END IF;

Return (SELECT article_json(id_article, user_id::uuid));
END;
$BODY$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION add_article_to_favorites`);
  }
}
