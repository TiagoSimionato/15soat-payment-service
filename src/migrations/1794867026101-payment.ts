import { MigrationInterface, QueryRunner } from "typeorm";

export class Payment1794867026101 implements MigrationInterface {
    name = 'Payment1794867026101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tb_payment" ("orderId" character varying NOT NULL, "service_order_id" integer NOT NULL, CONSTRAINT "UQ_bbcc87d1773e2546f6d4985c4f5" UNIQUE ("service_order_id"), CONSTRAINT "PK_75ee66d531c4e46820e06b3aa02" PRIMARY KEY ("orderId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tb_payment"`);
    }

}
