import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateViewCommentsOrdered1627059869171
  implements MigrationInterface
{
  name = 'CreateViewCommentsOrdered1627059869171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE VIEW comments_ordered
AS
WITH RECURSIVE tree AS (
        SELECT comments.id,
            comments.id_parent,
            comments.body,
            comments."createdAt",
            comments."updatedAt",
            comments."authorId",
            comments."articleId",
            comments.id::text AS path
          FROM comments
          WHERE comments.id_parent IS NULL
        UNION
        SELECT f1.id,
            f1.id_parent,
            f1.body,
            f1."createdAt",
            f1."updatedAt",
            f1."authorId",
            f1."articleId",
            (tree_1.path || '/'::text) || f1.id::text AS path
          FROM tree tree_1
            JOIN comments f1 ON f1.id_parent = tree_1.id
        )
SELECT tree.id,
    tree.id_parent,
    tree.body,
    tree."createdAt",
    tree."updatedAt",
    tree."authorId",
    tree."articleId"
  FROM tree
  ORDER BY tree.path, tree."createdAt";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW IF EXISTS comments_ordered`);
  }
}
