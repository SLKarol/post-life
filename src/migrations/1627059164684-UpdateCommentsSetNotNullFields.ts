import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCommentsSetNotNullFields1627059164684
  implements MigrationInterface
{
  name = 'UpdateCommentsSetNotNullFields1627059164684';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE comments ALTER COLUMN "authorId" SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE comments ALTER COLUMN "articleId" SET NOT NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE comments ALTER COLUMN "authorId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE comments ALTER COLUMN "articleId" DROP NOT NULL`,
    );
  }
}
