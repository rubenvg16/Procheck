import { Column, Entity } from "typeorm";

@Entity("sessionclientes", { schema: "clientes" })
export class Sessionclientes {
  @Column("varchar", { name: "SessionId", length: 350 })
  sessionId: string;
}
