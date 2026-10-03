import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1791061544616 implements MigrationInterface {
    name = 'InitialSchema1791061544616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."socios_categoria_enum" AS ENUM('RESIDENCIAL', 'RURAL', 'COMERCIAL')`);
        await queryRunner.query(`CREATE TABLE "socios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "numero_socio" integer NOT NULL, "nombre_completo" character varying NOT NULL, "direccion_tacural" character varying NOT NULL, "categoria" "public"."socios_categoria_enum" NOT NULL DEFAULT 'RESIDENCIAL', CONSTRAINT "UQ_0f9f4822e5b19d18ab8f4113873" UNIQUE ("numero_socio"), CONSTRAINT "PK_19aa081436e91864ec86a4bf912" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."medidores_tipo_servicio_enum" AS ENUM('AGUA', 'ENERGIA')`);
        await queryRunner.query(`CREATE TYPE "public"."medidores_estado_enum" AS ENUM('ACTIVO', 'INACTIVO')`);
        await queryRunner.query(`CREATE TABLE "medidores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "numero_serie" character varying NOT NULL, "socio_id" uuid NOT NULL, "tipo_servicio" "public"."medidores_tipo_servicio_enum" NOT NULL, "estado" "public"."medidores_estado_enum" NOT NULL DEFAULT 'ACTIVO', CONSTRAINT "UQ_959052206fe37d16d69306d3c03" UNIQUE ("numero_serie"), CONSTRAINT "PK_8f1365658a4071c7f8aea4d5d15" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."usuarios_rol_enum" AS ENUM('ADMIN', 'OPERARIO')`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "nombre" character varying NOT NULL, "rol" "public"."usuarios_rol_enum" NOT NULL DEFAULT 'OPERARIO', CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lecturas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lote_id" uuid, "medidor_id" uuid NOT NULL, "operario_id" uuid NOT NULL, "valor_lectura" numeric(10,2) NOT NULL, "periodo" character varying(6) NOT NULL, "fecha_captura" TIMESTAMP NOT NULL, "promedio_historico" numeric(10,2), "desvio_porcentaje" numeric(5,2), "es_atipico" boolean NOT NULL DEFAULT false, "fotografia_url" character varying, "observaciones" text, CONSTRAINT "PK_8843b4f95f8fd7fd75bd502bf49" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."lotes_sincronizacion_estado_enum" AS ENUM('PENDIENTE', 'PROCESADO', 'CON_INCONSISTENCIAS')`);
        await queryRunner.query(`CREATE TABLE "lotes_sincronizacion" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "operario_id" uuid NOT NULL, "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), "estado" "public"."lotes_sincronizacion_estado_enum" NOT NULL DEFAULT 'PENDIENTE', CONSTRAINT "PK_a2631fc299ba915b86185c492c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reclamos_estado_enum" AS ENUM('PENDIENTE', 'EN_REVISION', 'RESUELTO')`);
        await queryRunner.query(`CREATE TABLE "reclamos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "socio_id" uuid NOT NULL, "lectura_id" uuid, "motivo" character varying NOT NULL, "estado" "public"."reclamos_estado_enum" NOT NULL DEFAULT 'PENDIENTE', "foto_evidencia_url" character varying, "fecha_ingreso" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1e8b09f7b6dcd2f738a2ff0239c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "medidores" ADD CONSTRAINT "FK_b3f6fc5feb1f4bd13e969730358" FOREIGN KEY ("socio_id") REFERENCES "socios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lecturas" ADD CONSTRAINT "FK_d8f6ae75a18dd0d42dfdf8d37e2" FOREIGN KEY ("lote_id") REFERENCES "lotes_sincronizacion"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lecturas" ADD CONSTRAINT "FK_f57940a7e4ca588606b8ad7f076" FOREIGN KEY ("medidor_id") REFERENCES "medidores"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lecturas" ADD CONSTRAINT "FK_7cb41c9f4e5cafc86d17a13b9d6" FOREIGN KEY ("operario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lotes_sincronizacion" ADD CONSTRAINT "FK_50fbbcf864c1063e0d6017f8dda" FOREIGN KEY ("operario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reclamos" ADD CONSTRAINT "FK_cfe2ba819936782feb77887d149" FOREIGN KEY ("socio_id") REFERENCES "socios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reclamos" ADD CONSTRAINT "FK_ee63a782f0af47be0bb84d9f7be" FOREIGN KEY ("lectura_id") REFERENCES "lecturas"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reclamos" DROP CONSTRAINT "FK_ee63a782f0af47be0bb84d9f7be"`);
        await queryRunner.query(`ALTER TABLE "reclamos" DROP CONSTRAINT "FK_cfe2ba819936782feb77887d149"`);
        await queryRunner.query(`ALTER TABLE "lotes_sincronizacion" DROP CONSTRAINT "FK_50fbbcf864c1063e0d6017f8dda"`);
        await queryRunner.query(`ALTER TABLE "lecturas" DROP CONSTRAINT "FK_7cb41c9f4e5cafc86d17a13b9d6"`);
        await queryRunner.query(`ALTER TABLE "lecturas" DROP CONSTRAINT "FK_f57940a7e4ca588606b8ad7f076"`);
        await queryRunner.query(`ALTER TABLE "lecturas" DROP CONSTRAINT "FK_d8f6ae75a18dd0d42dfdf8d37e2"`);
        await queryRunner.query(`ALTER TABLE "medidores" DROP CONSTRAINT "FK_b3f6fc5feb1f4bd13e969730358"`);
        await queryRunner.query(`DROP TABLE "reclamos"`);
        await queryRunner.query(`DROP TYPE "public"."reclamos_estado_enum"`);
        await queryRunner.query(`DROP TABLE "lotes_sincronizacion"`);
        await queryRunner.query(`DROP TYPE "public"."lotes_sincronizacion_estado_enum"`);
        await queryRunner.query(`DROP TABLE "lecturas"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TYPE "public"."usuarios_rol_enum"`);
        await queryRunner.query(`DROP TABLE "medidores"`);
        await queryRunner.query(`DROP TYPE "public"."medidores_estado_enum"`);
        await queryRunner.query(`DROP TYPE "public"."medidores_tipo_servicio_enum"`);
        await queryRunner.query(`DROP TABLE "socios"`);
        await queryRunner.query(`DROP TYPE "public"."socios_categoria_enum"`);
    }

}
