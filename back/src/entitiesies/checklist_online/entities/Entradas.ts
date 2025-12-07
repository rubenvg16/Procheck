import { Column, Entity } from "typeorm";

@Entity("entradas", { schema: "checklist_online" })
export class Entradas {
  @Column("bigint", { primary: true, name: "idlista", unsigned: true })
  idlista: number;

  @Column("int", { primary: true, name: "orden", unsigned: true })
  orden: number;

  @Column("varchar", { name: "nombre", length: 200, default: () => "''" })
  nombre: string;

  @Column("varchar", { name: "tipo", length: 50, default: () => "''" })
  tipo: string;
}
