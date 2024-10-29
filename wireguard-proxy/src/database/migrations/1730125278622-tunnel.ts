import { MigrationInterface, QueryRunner } from 'typeorm';

export class Tunnel1730125278622 implements MigrationInterface {
  name = 'Tunnel1730125278622';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "tunnel" (
                "id" SERIAL NOT NULL,
                "private_key" character varying NOT NULL,
                "public_key" character varying NOT NULL,
                "allowed_ips" inet NOT NULL,
                CONSTRAINT "UQ_fc601f5e14ecc198229da61741d" UNIQUE ("allowed_ips"),
                CONSTRAINT "PK_acd19b9c808b89cab56680ca787" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "tunnel"
        `);
  }
}
