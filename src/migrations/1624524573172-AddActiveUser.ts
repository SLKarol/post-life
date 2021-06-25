import {MigrationInterface, QueryRunner} from "typeorm";

export class AddActiveUser1624524573172 implements MigrationInterface {
    name = 'AddActiveUser1624524573172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "active" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "active"`);
    }

}
