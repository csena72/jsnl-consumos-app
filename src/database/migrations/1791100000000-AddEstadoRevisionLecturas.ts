import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEstadoRevisionLecturas1791100000000 implements MigrationInterface {
    name = 'AddEstadoRevisionLecturas1791100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."lecturas_estado_revision_enum" AS ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA')`);
        await queryRunner.query(`ALTER TABLE "lecturas" ADD "estado_revision" "public"."lecturas_estado_revision_enum" NOT NULL DEFAULT 'PENDIENTE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lecturas" DROP COLUMN "estado_revision"`);
        await queryRunner.query(`DROP TYPE "public"."lecturas_estado_revision_enum"`);
    }

}
