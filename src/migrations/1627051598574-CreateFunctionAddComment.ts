import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionAddComment1627051598574
  implements MigrationInterface
{
  name = 'CreateFunctionAddComment1627051598574';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION add_comment(
  id_user UUID,
  slug_text TEXT,
  body TEXT,
  id_parent UUID default null
) RETURNS JSON LANGUAGE 'plpgsql' AS $BODY$
DECLARE article_id uuid;
comment_id uuid;
BEGIN
  SELECT ID INTO article_id FROM articles
    WHERE slug = slug_text;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Article does not find';
  END IF;
  INSERT INTO comments ("id_parent", "body", "authorId", "articleId")
  VALUES (id_parent, body, id_user, article_id)
  RETURNING id INTO comment_id;
  RETURN (SELECT comment_json(comment_id, id_user));	
END;
$BODY$`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION add_comment`);
  }
}
