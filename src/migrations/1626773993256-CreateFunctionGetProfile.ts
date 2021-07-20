import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionGetProfile1626773993256
  implements MigrationInterface
{
  name = 'CreateFunctionGetProfile1626773993256';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION get_profile_by_username(
  follower uuid,
  user_name text)
    RETURNS json
    LANGUAGE 'plpgsql'
AS $BODY$
DECLARE user_id uuid;
BEGIN
  select id into user_id from users WHERE username=user_name;  
  Return (SELECT to_jsonb(usr) FROM (
    SELECT username, bio, image, active,
      exists (SELECT id FROM follows WHERE follows."followerId"=follower AND follows."followingId"=user_id) as following
    FROM users WHERE id=user_id
  ) usr);
END;
$BODY$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION get_profile_by_username`);
  }
}
