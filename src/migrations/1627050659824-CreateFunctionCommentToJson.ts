import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionCommentToJson1627050659824
  implements MigrationInterface
{
  name = 'CreateFunctionCommentToJson1627050659824';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION comment_json(comment_id uuid, user_id uuid)
      RETURNS json
      LANGUAGE 'sql'
  AS $BODY$
  select to_jsonb(commnt)
  from (
      select id, "createdAt", "updatedAt", body, id_parent as "idParent",
        (
          SELECT to_jsonb(a)
          FROM (
              SELECT username,
                bio,
                image,
                EXISTS(
                  SELECT 1
                  FROM follows
                  WHERE "followerId" = user_id
                    AND "followingId" = comments."authorId"
                ) AS following
              FROM users
              WHERE users.id = comments."authorId"
            ) a
        ) AS author
      from comments
      WHERE id = comment_id
    ) commnt
  $BODY$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION comment_json`);
  }
}
