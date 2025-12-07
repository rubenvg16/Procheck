import { Column, Entity } from "typeorm";

@Entity("ultimaconexiones", { schema: "clientes" })
export class Ultimaconexiones {
  @Column("varchar", { name: "Nombre", length: 500 })
  nombre: string;

  @Column("datetime", { name: "UltimaConexionBack" })
  ultimaConexionBack: Date;
}
