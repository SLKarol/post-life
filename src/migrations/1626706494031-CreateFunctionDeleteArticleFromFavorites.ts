import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionDeleteArticleFromFavorites1626706494031
  implements MigrationInterface
{
  name = 'CreateFunctionDeleteArticleFromFavorites1626706494031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION delete_article_from_favorites(
  slugText text,
  user_id text)
    RETURNS json
    LANGUAGE 'plpgsql'
AS $BODY$
DECLARE 
  id_article uuid;
BEGIN
SELECT articles.id as id INTO id_article FROM articles, users_favorites_articles
WHERE articles.slug=slugText 
  AND articles.id=users_favorites_articles."articlesId"
  AND users_favorites_articles."usersId"=user_id::uuid;

IF FOUND THEN
  DELETE FROM users_favorites_articles
  WHERE "usersId"=user_id::uuid AND "articlesId"=id_article;
END IF;

SELECT id INTO id_article FROM articles WHERE articles.slug=slugText;
Return (SELECT article_json(id_article, user_id::uuid));
END;
$BODY$`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION delete_article_from_favorites`);
  }
}
