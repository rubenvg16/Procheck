import { Column, Entity } from "typeorm";

@Entity("tarjetasconexiones", { schema: "clientes" })
export class Tarjetasconexiones {
  @Column("varchar", { name: "NombreConexion", length: 500 })
  nombreConexion: string;

  @Column("varchar", { name: "NombreTarjeta", length: 200 })
  nombreTarjeta: string;

  @Column("varchar", { name: "TipoConexion", length: 50 })
  tipoConexion: string;

  @Column("tinyint", { name: "Visible", width: 1 })
  visible: boolean;
}
