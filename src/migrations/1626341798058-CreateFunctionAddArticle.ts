import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionAddArticle1626341798058
  implements MigrationInterface
{
  name = 'CreateFunctionAddArticle1626341798058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION add_article(
  slug TEXT,
  title TEXT,
  description TEXT,
  body TEXT,
  author TEXT,
  tags TEXT []
) RETURNS json AS $$
DECLARE id_article uuid = uuid_generate_v4();
BEGIN
INSERT INTO articles (id, slug, title, description, body, "authorId")
VALUES (
  id_article,
  slug,
  title,
  description,
  body,
  author::uuid
);
CALL set_tag_for_article(tags, id_article);
Return (SELECT article_json(id_article, author::uuid));
END;
$$ LANGUAGE plpgsql;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION add_article`);
  }
}
