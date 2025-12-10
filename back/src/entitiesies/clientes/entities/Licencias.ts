import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Conexionesbd } from "./Conexionesbd";

@Entity("licencias", { schema: "clientes" })
export class Licencias {
  // Clave primaria compuesta (no auto_increment en esta entidad)
  @PrimaryColumn("bigint", { name: "IdConexion" })
  idConexion: number;

  @PrimaryColumn("varchar", { name: "Tipo", length: 45 })
  tipo: string;

  @PrimaryColumn("varchar", { name: "Aplicacion", length: 45 })
  aplicacion: string;

  @Column("datetime", {
    name: "FechaCreacion",
    default: () => "CURRENT_TIMESTAMP",
  })
  fechaCreacion: Date;

  @Column("datetime", {
    name: "FechaActualizacion",
    default: () => "CURRENT_TIMESTAMP",
  })
  fechaActualizacion: Date;
}
