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

  @Column("int", { name: "Cajas", default: () => "'1'" })
  cajas: number;

  @Column("int", { name: "Mandos", default: () => "'0'" })
  mandos: number;

  @Column("varchar", { name: "Hdd", length: 45 })
  hdd: string;

  // Relación con Conexionesbd
  @ManyToOne(() => Conexionesbd, (conexionesbd) => conexionesbd.licencias, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "IdConexion", referencedColumnName: "idConexion" }])
  idConexion2: Conexionesbd;
}
