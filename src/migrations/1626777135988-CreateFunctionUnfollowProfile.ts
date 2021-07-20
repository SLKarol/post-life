import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionUnfollowProfile1626777135988
  implements MigrationInterface
{
  name = 'CreateFunctionUnfollowProfile1626777135988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION unfollow_profile(
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
  
  DELETE FROM follows
  WHERE follows."followerId"=follower
    AND follows."followingId"=user_id;
    
  Return (SELECT get_profile_by_username(follower, user_name));
END;
$BODY$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop FUNCTION unfollow_profile`);
  }
}
