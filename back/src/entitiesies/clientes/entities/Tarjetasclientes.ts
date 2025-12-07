import { Column, Entity } from "typeorm";

@Entity("tarjetasclientes", { schema: "clientes" })
export class Tarjetasclientes {
  @Column("varchar", { primary: true, name: "NombreCliente", length: 500 })
  nombreCliente: string;

  @Column("varchar", { primary: true, name: "NombreTarjeta", length: 500 })
  nombreTarjeta: string;

  @Column("varchar", { primary: true, name: "TipoConexion", length: 500 })
  tipoConexion: string;

  @Column("tinyint", { name: "Visible", width: 1 })
  visible: boolean;

  @Column("smallint", { name: "Orden", nullable: true })
  orden: number | null;
}
