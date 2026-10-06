import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sprint7RutaOperario1791400000000 implements MigrationInterface {
  name = 'Sprint7RutaOperario1791400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rutas" ADD "operario_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "rutas" ADD CONSTRAINT "FK_rutas_operario" FOREIGN KEY ("operario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_rutas_operario" ON "rutas" ("operario_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_rutas_operario"`);
    await queryRunner.query(`ALTER TABLE "rutas" DROP CONSTRAINT "FK_rutas_operario"`);
    await queryRunner.query(`ALTER TABLE "rutas" DROP COLUMN "operario_id"`);
  }
}
