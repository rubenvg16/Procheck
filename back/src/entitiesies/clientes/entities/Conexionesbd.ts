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
}
