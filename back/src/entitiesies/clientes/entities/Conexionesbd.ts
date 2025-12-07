import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Licencias } from "./Licencias";

@Entity("conexionesbd", { schema: "clientes" })
export class Conexionesbd {
  @PrimaryGeneratedColumn("increment", { type: "bigint", name: "IdConexion" })
  idConexion: number;

  @Column("varchar", {
    name: "NombreConexion",
    length: 100,
    default: () => "'0'",
  })
  nombreConexion: string;

  @Column("varchar", { name: "Servidor", nullable: true, length: 100 })
  servidor: string | null;

  @Column("varchar", { name: "Catalog", nullable: true, length: 100 })
  catalog: string | null;

  @Column("varchar", { name: "Usuario", nullable: true, length: 100 })
  usuario: string | null;

  @Column("varchar", { name: "Password", nullable: true, length: 250 })
  password: string | null;

  @Column("varchar", { name: "Centro", nullable: true, length: 20 })
  centro: string | null;

  @Column("varchar", { name: "Modelo", nullable: true, length: 50 })
  modelo: string | null;

  @Column("varchar", {
    name: "TipoConexion",
    length: 100,
    default: () => "'0'",
  })
  tipoConexion: string;

  @Column("int", { name: "IdConexionCentral", nullable: true })
  idConexionCentral: number | null;

  @Column("varchar", { name: "NombreURL", nullable: true, length: 50 })
  nombreUrl: string | null;

  @Column("bit", { name: "WebSocket", default: () => "'b'0''" })
  webSocket: boolean;

  @OneToMany(() => Licencias, (licencias) => licencias.idConexion2)
  licencias: Licencias[];
}
