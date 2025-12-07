import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("listas", { schema: "checklist_online" })
export class Listas {
  @PrimaryGeneratedColumn({ type: "bigint", name: "idlista", unsigned: true })
  idlista: string;

  @Column("varchar", { name: "nombre", length: 200, default: () => "''" })
  nombre: string;

  @Column("varchar", { name: "local", length: 200, default: () => "''" })
  local: string;

  @Column("bit", { name: "alta", default: () => "'b'0''" })
  alta: number;
}
