import { Column, Entity } from "typeorm";

@Entity("tarjetas", { schema: "clientes" })
export class Tarjetas {
  @Column("varchar", { primary: true, name: "NombreTarjeta", length: 150 })
  nombreTarjeta: string;

  @Column("varchar", { name: "Archivo", length: 150 })
  archivo: string;

  @Column("tinyint", { name: "Seleccionable", width: 1, default: () => "'0'" })
  seleccionable: boolean;

  @Column("int", { name: "Orden", nullable: true })
  orden: number | null;

  @Column("varchar", { primary: true, name: "TipoConexion", length: 100 })
  tipoConexion: string;
}
