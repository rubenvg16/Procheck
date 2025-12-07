import { Column, Entity } from "typeorm";

@Entity("conexionessmtp", { schema: "clientes" })
export class Conexionessmtp {
  @Column("int", { name: "IDConexion" })
  idConexion: number;

  @Column("varchar", { name: "Host", length: 500, default: () => "''" })
  host: string;

  @Column("int", { name: "Port", default: () => "'0'" })
  port: number;

  @Column("varchar", { name: "User", length: 500, default: () => "''" })
  user: string;

  @Column("varchar", { name: "Password", length: 500, default: () => "''" })
  password: string;

  @Column("varchar", { name: "FromMail", length: 500, default: () => "''" })
  fromMail: string;

  @Column("varchar", { name: "FromName", length: 500, default: () => "''" })
  fromName: string;

  @Column("varchar", { name: "ReplyToMail", length: 500, default: () => "''" })
  replyToMail: string;

  @Column("varchar", { name: "ReplyToName", length: 500, default: () => "''" })
  replyToName: string;

  @Column("varchar", { name: "SMTPSecure", length: 50, default: () => "'ssl'" })
  smtpSecure: string;
}
