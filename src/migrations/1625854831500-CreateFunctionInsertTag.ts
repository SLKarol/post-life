import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionInsertTag1625854831500
  implements MigrationInterface
{
  name = 'CreateFunctionInsertTag1625854831500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION insert_tag(nameTag character varying)
      RETURNS uuid
      as $body$
      INSERT INTO tags (name) 
      SELECT nameTag
      WHERE
          NOT EXISTS (
              SELECT tags.id FROM tags WHERE tags.name = nameTag
          );
      select tags.id from tags WHERE tags.name = nameTag;	
      $body$ LANGUAGE 'sql';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION insert_tag"`);
  }
}
