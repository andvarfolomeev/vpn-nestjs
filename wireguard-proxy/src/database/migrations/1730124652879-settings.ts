import { MigrationInterface, QueryRunner } from 'typeorm';

export class Settings1730124652879 implements MigrationInterface {
  name = 'Settings1730124652879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "settings" (
                "key" character varying NOT NULL,
                "value" character varying NOT NULL,
                CONSTRAINT "PK_c8639b7626fa94ba8265628f214" PRIMARY KEY ("key")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "settings"
        `);
  }
}
