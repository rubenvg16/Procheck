import { Column, Entity } from "typeorm";

@Entity("versionesclientes", { schema: "clientes" })
export class Versionesclientes {
  @Column("varchar", { primary: true, name: "usuario", length: 500 })
  usuario: string;

  @Column("varchar", { primary: true, name: "aplicacion", length: 30 })
  aplicacion: string;

  @Column("int", { name: "version" })
  version: number;
}
