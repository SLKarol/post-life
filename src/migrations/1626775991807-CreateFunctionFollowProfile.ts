import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionFollowProfile1626775991807
  implements MigrationInterface
{
  name = 'CreateFunctionFollowProfile1626775991807';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION follow_profile(
  follower uuid,
  user_name text)
    RETURNS json
    LANGUAGE 'plpgsql'
AS $BODY$
DECLARE user_id uuid;
BEGIN
  select id into user_id from users WHERE username=user_name;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile does not exist';
  END IF;
  IF follower=user_id THEN
    RAISE EXCEPTION 'Ты не можешь следить сам за собой';
  END IF;
  IF NOT EXISTS (
  SELECT id FROM follows
  WHERE follows."followerId"=follower
    AND follows."followingId"=user_id
  ) THEN
    INSERT INTO follows ("followerId", "followingId")
    VALUES (follower, user_id);
  END IF;
    
  Return (SELECT get_profile_by_username(follower, user_name));
END;
$BODY$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION follow_profile`);
  }
}
