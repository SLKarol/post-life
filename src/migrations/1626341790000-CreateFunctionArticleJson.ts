import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionGetArticleJson1626341790000
  implements MigrationInterface
{
  name = 'CreateFunctionGetArticleJson1626341790000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION public.article_json(
  articleid uuid,
  userid uuid)
    RETURNS json
    LANGUAGE 'sql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
select to_jsonb(artcl)
from (
    select slug,
      title,
      description,
      body,
      "createdAt",
      "updatedAt",
      (
        select array_to_json(array_agg(to_jsonb(tag)))
        from (
            select id,
              name
            from tags,
              tags_in_articles_articles
            where tags_in_articles_articles."articlesId" = articles.id
              AND tags_in_articles_articles."tagsId" = tags.id
            order by tags.name
          ) tag
      ) AS "tagList",
      exists(
        SELECT 1
        FROM users_favorites_articles
        WHERE "articlesId" = articles.id
          AND "usersId" = userId
      ) AS favorited,
      (
        SELECT COUNT(*)
        FROM users_favorites_articles
        WHERE "articlesId" = articles.id
      ) AS "favoritesCount",
      (
        SELECT COUNT(*)
        FROM comments
        WHERE comments."articleId" = articleId
      ) AS "commentsCount",
      (
        SELECT to_jsonb(a)
        FROM (
            SELECT username,
              bio,
              image,
              EXISTS(
                SELECT 1
                FROM follows
                WHERE "followerId" = userId
                  AND "followingId" = articles."authorId"
              ) AS following
            FROM users
            WHERE users.id = articles."authorId"
          ) a
      ) AS author
    from articles
    WHERE id = articleId
  ) artcl
$BODY$;
COMMENT ON FUNCTION public.get_article_json(uuid, uuid)
  IS 'Получает JSON статьи. Статья получается по ID';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION article_json`);
  }
}
