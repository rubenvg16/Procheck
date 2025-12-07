import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("loginclientes", { schema: "clientes" })
export class Loginclientes {
  @PrimaryColumn("varchar", { name: "IdCliente", length: 100 })
  nombre: string;

  @Column("varchar", { name: "NombreCompleto", nullable: true, length: 500 })
  nombreCompleto: string | null;

  @Column("varchar", { name: "Password", length: 5000 })
  password: string;

  @Column("tinyint", { name: "Activo", nullable: true, width: 1 })
  activo: number | null;

  @Column("varchar", { name: "Fotico", nullable: true, length: 500 })
  fotico: string | null;

  @Column("bit", { name: "Validado", nullable: true })
  validado: Buffer | null;

  @Column("bit", { name: "CondAceptadas", nullable: true })
  condAceptadas: Buffer | null;

  @Column("varchar", { name: "Idioma", nullable: true, length: 500 })
  idioma: string | null;
}
