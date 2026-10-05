import { MigrationInterface, QueryRunner } from "typeorm";

export class Sprint5CrudsLocalidadesRutas1791230410016 implements MigrationInterface {
    name = 'Sprint5CrudsLocalidadesRutas1791230410016'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "localidades" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "provincia" character varying NOT NULL, "codigo_postal" character varying, CONSTRAINT "UQ_631e497aebaa31a4b18c0694b38" UNIQUE ("nombre"), CONSTRAINT "PK_5bdb0ef5463491e8f3259dd1ae1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rutas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" character varying NOT NULL, "localidad_id" uuid NOT NULL, "activa" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_928413b7a21b485172d98c78060" UNIQUE ("localidad_id", "nombre"), CONSTRAINT "PK_80408b869ec5168c98210b8eba8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."medidores_pendientes_alta_tipo_servicio_enum" AS ENUM('AGUA', 'ENERGIA')`);
        await queryRunner.query(`CREATE TYPE "public"."medidores_pendientes_alta_estado_precinto_enum" AS ENUM('INTACTO', 'VIOLADO', 'SIN_PRECINTO')`);
        await queryRunner.query(`CREATE TYPE "public"."medidores_pendientes_alta_estado_enum" AS ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO')`);
        await queryRunner.query(`CREATE TABLE "medidores_pendientes_alta" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "numero_serie" character varying NOT NULL, "tipo_servicio" "public"."medidores_pendientes_alta_tipo_servicio_enum" NOT NULL, "numero_caja" character varying, "estado_precinto" "public"."medidores_pendientes_alta_estado_precinto_enum" NOT NULL DEFAULT 'INTACTO', "localidad_id" uuid, "direccion_referencia" character varying, "observaciones" text, "foto_url" character varying, "estado" "public"."medidores_pendientes_alta_estado_enum" NOT NULL DEFAULT 'PENDIENTE', "reportado_por_id" uuid NOT NULL, "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), "revisado_por_id" uuid, "fecha_revision" TIMESTAMP, "motivo_rechazo" character varying, "medidor_id" uuid, CONSTRAINT "PK_5ec88fbdcd8f9d8212f6955d412" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reclamos_historial_estado_anterior_enum" AS ENUM('PENDIENTE', 'EN_PROCESO', 'RESUELTO')`);
        await queryRunner.query(`CREATE TYPE "public"."reclamos_historial_estado_nuevo_enum" AS ENUM('PENDIENTE', 'EN_PROCESO', 'RESUELTO')`);
        await queryRunner.query(`CREATE TABLE "reclamos_historial" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reclamo_id" uuid NOT NULL, "estado_anterior" "public"."reclamos_historial_estado_anterior_enum", "estado_nuevo" "public"."reclamos_historial_estado_nuevo_enum" NOT NULL, "comentario" text, "usuario_id" uuid, "fecha" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3554bf04e6c830b4957c9c4d700" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reclamos" RENAME COLUMN "motivo" TO "descripcion"`);
        await queryRunner.query(`ALTER TABLE "reclamos" ALTER COLUMN "descripcion" TYPE text`);
        await queryRunner.query(`ALTER TABLE "reclamos" RENAME COLUMN "foto_evidencia_url" TO "foto_url"`);
        await queryRunner.query(`ALTER TABLE "reclamos" RENAME COLUMN "fecha_ingreso" TO "fecha_creacion"`);
        await queryRunner.query(`ALTER TABLE "socios" ADD "dni" character varying`);
        await queryRunner.query(`ALTER TABLE "socios" ADD CONSTRAINT "UQ_6a5c452cf970b4cc88a1d31785c" UNIQUE ("dni")`);
        await queryRunner.query(`ALTER TABLE "socios" ADD "telefono" character varying`);
        await queryRunner.query(`ALTER TABLE "socios" ADD "localidad_id" uuid`);
        await queryRunner.query(`ALTER TABLE "socios" ADD "activo" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "medidores" ADD "numero_caja" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."medidores_estado_precinto_enum" AS ENUM('INTACTO', 'VIOLADO', 'SIN_PRECINTO')`);
        await queryRunner.query(`ALTER TABLE "medidores" ADD "estado_precinto" "public"."medidores_estado_precinto_enum" NOT NULL DEFAULT 'INTACTO'`);
        await queryRunner.query(`ALTER TABLE "medidores" ADD "localidad_id" uuid`);
        await queryRunner.query(`ALTER TABLE "medidores" ADD "ruta_id" uuid`);
        await queryRunner.query(`ALTER TABLE "medidores" ADD "orden_secuencia" integer`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "activo" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE TYPE "public"."reclamos_tipo_reclamo_enum" AS ENUM('LECTURA_ERRONEA', 'FACTURACION', 'MEDIDOR_DANADO', 'FALTA_SERVICIO', 'OTRO')`);
        await queryRunner.query(`ALTER TABLE "reclamos" ADD "tipo_reclamo" "public"."reclamos_tipo_reclamo_enum" NOT NULL DEFAULT 'OTRO'`);
        await queryRunner.query(`ALTER TYPE "public"."reclamos_estado_enum" RENAME TO "reclamos_estado_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."reclamos_estado_enum" AS ENUM('PENDIENTE', 'EN_PROCESO', 'RESUELTO')`);
        await queryRunner.query(`ALTER TABLE "reclamos" ALTER COLUMN "estado" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "reclamos" ALTER COLUMN "estado" TYPE "public"."reclamos_estado_enum" USING (CASE WHEN "estado"::"text" = 'EN_REVISION' THEN 'EN_PROCESO' ELSE "estado"::"text" END)::"public"."reclamos_estado_enum"`);
        await queryRunner.query(`ALTER TABLE "reclamos" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE'`);
        await queryRunner.query(`DROP TYPE "public"."reclamos_estado_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_df18788eed660fd8ee1153dfec" ON "medidores"  ("orden_secuencia") `);
        await queryRunner.query(`ALTER TABLE "medidores" ADD CONSTRAINT "UQ_da6b8bda22aba95f4289eebbcd0" UNIQUE ("tipo_servicio", "numero_caja")`);
        await queryRunner.query(`ALTER TABLE "rutas" ADD CONSTRAINT "FK_7cbec85efdfb8e6d5babbc8272f" FOREIGN KEY ("localidad_id") REFERENCES "localidades"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "socios" ADD CONSTRAINT "FK_a34ca73fb9f63e26cf57fec81c3" FOREIGN KEY ("localidad_id") REFERENCES "localidades"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medidores" ADD CONSTRAINT "FK_4f67e15f285db01bd678f4d0b2b" FOREIGN KEY ("localidad_id") REFERENCES "localidades"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medidores" ADD CONSTRAINT "FK_4f7c8a3f6224641ee737ad42972" FOREIGN KEY ("ruta_id") REFERENCES "rutas"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medidores_pendientes_alta" ADD CONSTRAINT "FK_706ad69dcf20d468a0ee496f921" FOREIGN KEY ("localidad_id") REFERENCES "localidades"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medidores_pendientes_alta" ADD CONSTRAINT "FK_fabeb6a0688fc2d243559b88aa5" FOREIGN KEY ("reportado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medidores_pendientes_alta" ADD CONSTRAINT "FK_ff704532dd3cab32bc7a1c6fb4b" FOREIGN KEY ("revisado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medidores_pendientes_alta" ADD CONSTRAINT "FK_87b915c65ee36c4fa00cf522d4b" FOREIGN KEY ("medidor_id") REFERENCES "medidores"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reclamos_historial" ADD CONSTRAINT "FK_8694ff871ef942461aa0e70dd34" FOREIGN KEY ("reclamo_id") REFERENCES "reclamos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reclamos_historial" ADD CONSTRAINT "FK_e428aff9d92c652d55493bab595" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reclamos_historial" DROP CONSTRAINT "FK_e428aff9d92c652d55493bab595"`);
        await queryRunner.query(`ALTER TABLE "reclamos_historial" DROP CONSTRAINT "FK_8694ff871ef942461aa0e70dd34"`);
        await queryRunner.query(`ALTER TABLE "medidores_pendientes_alta" DROP CONSTRAINT "FK_87b915c65ee36c4fa00cf522d4b"`);
        await queryRunner.query(`ALTER TABLE "medidores_pendientes_alta" DROP CONSTRAINT "FK_ff704532dd3cab32bc7a1c6fb4b"`);
        await queryRunner.query(`ALTER TABLE "medidores_pendientes_alta" DROP CONSTRAINT "FK_fabeb6a0688fc2d243559b88aa5"`);
        await queryRunner.query(`ALTER TABLE "medidores_pendientes_alta" DROP CONSTRAINT "FK_706ad69dcf20d468a0ee496f921"`);
        await queryRunner.query(`ALTER TABLE "medidores" DROP CONSTRAINT "FK_4f7c8a3f6224641ee737ad42972"`);
        await queryRunner.query(`ALTER TABLE "medidores" DROP CONSTRAINT "FK_4f67e15f285db01bd678f4d0b2b"`);
        await queryRunner.query(`ALTER TABLE "socios" DROP CONSTRAINT "FK_a34ca73fb9f63e26cf57fec81c3"`);
        await queryRunner.query(`ALTER TABLE "rutas" DROP CONSTRAINT "FK_7cbec85efdfb8e6d5babbc8272f"`);
        await queryRunner.query(`ALTER TABLE "medidores" DROP CONSTRAINT "UQ_da6b8bda22aba95f4289eebbcd0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df18788eed660fd8ee1153dfec"`);
        await queryRunner.query(`CREATE TYPE "public"."reclamos_estado_enum_old" AS ENUM('PENDIENTE', 'EN_REVISION', 'RESUELTO')`);
        await queryRunner.query(`ALTER TABLE "reclamos" ALTER COLUMN "estado" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "reclamos" ALTER COLUMN "estado" TYPE "public"."reclamos_estado_enum_old" USING (CASE WHEN "estado"::"text" = 'EN_PROCESO' THEN 'EN_REVISION' ELSE "estado"::"text" END)::"public"."reclamos_estado_enum_old"`);
        await queryRunner.query(`ALTER TABLE "reclamos" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE'`);
        await queryRunner.query(`DROP TYPE "public"."reclamos_estado_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."reclamos_estado_enum_old" RENAME TO "reclamos_estado_enum"`);
        await queryRunner.query(`ALTER TABLE "reclamos" RENAME COLUMN "fecha_creacion" TO "fecha_ingreso"`);
        await queryRunner.query(`ALTER TABLE "reclamos" RENAME COLUMN "foto_url" TO "foto_evidencia_url"`);
        await queryRunner.query(`ALTER TABLE "reclamos" ALTER COLUMN "descripcion" TYPE character varying`);
        await queryRunner.query(`ALTER TABLE "reclamos" RENAME COLUMN "descripcion" TO "motivo"`);
        await queryRunner.query(`ALTER TABLE "reclamos" DROP COLUMN "tipo_reclamo"`);
        await queryRunner.query(`DROP TYPE "public"."reclamos_tipo_reclamo_enum"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "activo"`);
        await queryRunner.query(`ALTER TABLE "medidores" DROP COLUMN "orden_secuencia"`);
        await queryRunner.query(`ALTER TABLE "medidores" DROP COLUMN "ruta_id"`);
        await queryRunner.query(`ALTER TABLE "medidores" DROP COLUMN "localidad_id"`);
        await queryRunner.query(`ALTER TABLE "medidores" DROP COLUMN "estado_precinto"`);
        await queryRunner.query(`DROP TYPE "public"."medidores_estado_precinto_enum"`);
        await queryRunner.query(`ALTER TABLE "medidores" DROP COLUMN "numero_caja"`);
        await queryRunner.query(`ALTER TABLE "socios" DROP COLUMN "activo"`);
        await queryRunner.query(`ALTER TABLE "socios" DROP COLUMN "localidad_id"`);
        await queryRunner.query(`ALTER TABLE "socios" DROP COLUMN "telefono"`);
        await queryRunner.query(`ALTER TABLE "socios" DROP CONSTRAINT "UQ_6a5c452cf970b4cc88a1d31785c"`);
        await queryRunner.query(`ALTER TABLE "socios" DROP COLUMN "dni"`);
        await queryRunner.query(`DROP TABLE "reclamos_historial"`);
        await queryRunner.query(`DROP TYPE "public"."reclamos_historial_estado_nuevo_enum"`);
        await queryRunner.query(`DROP TYPE "public"."reclamos_historial_estado_anterior_enum"`);
        await queryRunner.query(`DROP TABLE "medidores_pendientes_alta"`);
        await queryRunner.query(`DROP TYPE "public"."medidores_pendientes_alta_estado_enum"`);
        await queryRunner.query(`DROP TYPE "public"."medidores_pendientes_alta_estado_precinto_enum"`);
        await queryRunner.query(`DROP TYPE "public"."medidores_pendientes_alta_tipo_servicio_enum"`);
        await queryRunner.query(`DROP TABLE "rutas"`);
        await queryRunner.query(`DROP TABLE "localidades"`);
    }

}
