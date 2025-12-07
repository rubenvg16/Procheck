import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("permisosclientes", { schema: "clientes" })
export class Permisosclientes {

  @PrimaryColumn("varchar", { name: "Cliente", length: 500 })
  cliente: string;

  @PrimaryColumn("int", { name: "IDConexion", default: () => "'0'" })
  idConexion: number;

  @Column("varchar", { name: "App", length: 100, default: () => "'0'" })
  app: string;

  @Column("varchar", { name: "Permiso", length: 100, default: () => "'0'" })
  permiso: string;

  @Column("varchar", { name: "Valor", length: 500, default: () => "'0'" })
  valor: string;
}
