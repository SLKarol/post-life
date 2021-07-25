import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionGetCommentsJson1627202842314
  implements MigrationInterface
{
  name = 'CreateFunctionGetCommentsJson1627202842314';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION get_comments_json(slugtext text, userid uuid)
RETURNS json LANGUAGE 'plpgsql'
AS $BODY$
DECLARE article_id uuid;
BEGIN
  select id into article_id from articles WHERE slug=slugtext;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Article does not exist';
  END IF;	
  Return (	
    Select to_jsonb(res) AS res FROM (
    Select (select array_to_json(array_agg(to_jsonb(a4))) FROM (
      Select id, id_parent, body, "createdAt", "updatedAt",
      (
        SELECT to_jsonb(a)
        FROM (
          SELECT username,
          bio,
          image,
          EXISTS(
            SELECT 1 FROM follows
            WHERE "followerId" = userid AND "followingId" = comments_ordered."authorId"
          ) AS following
          FROM users
        WHERE users.id = comments_ordered."authorId"
            ) a
        ) AS author
    from comments_ordered where "articleId"=article_id
    ) a4
    ) as comments ) res);
END;
$BODY$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION get_comments_json`);
  }
}
