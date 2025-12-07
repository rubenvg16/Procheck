import { Column, Entity } from "typeorm";

@Entity("respuestas", { schema: "checklist_online" })
export class Respuestas {
  @Column("datetime", { primary: true, name: "fecha" })
  fecha: Date;

  @Column("bigint", { primary: true, name: "idLista", unsigned: true })
  idLista: number;

  @Column("int", {
    primary: true,
    name: "orden",
    unsigned: true,
    default: () => "'0'",
  })
  orden: number;

  @Column("varchar", { name: "local", length: 200, default: () => "'0'" })
  local: string;

  @Column("varchar", { name: "usuario", length: 200, default: () => "'0'" })
  usuario: string;

  @Column("varchar", { name: "Tipo", length: 200, default: () => "'0'" })
  tipo: string;

  @Column("varchar", { name: "Valor", length: 200, default: () => "'0'" })
  valor: string;
}
