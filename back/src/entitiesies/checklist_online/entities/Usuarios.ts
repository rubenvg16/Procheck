import { Column, Entity } from "typeorm";

@Entity("usuarios", { schema: "checklist_online" })
export class Usuarios {
  @Column("varchar", { primary: true, name: "usuario", length: 200 })
  usuario: string;

  @Column("varchar", { primary: true, name: "local", length: 200 })
  local: string;

  @Column("varchar", { name: "password", nullable: true, length: 200 })
  password: string | null;
}
