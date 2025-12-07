import { Column, Entity } from "typeorm";

@Entity("versionesapps", { schema: "clientes" })
export class Versionesapps {
  @Column("datetime", {
    name: "FechaCreacion",
    default: () => "CURRENT_TIMESTAMP",
  })
  fechaCreacion: Date;

  @Column("varchar", { primary: true, name: "Aplicacion", length: 45 })
  aplicacion: string;

  @Column("varchar", { primary: true, name: "Version", length: 45 })
  version: string;
}
