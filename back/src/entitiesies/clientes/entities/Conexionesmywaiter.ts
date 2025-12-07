import { Column, Entity } from "typeorm";

@Entity("conexionesmywaiter", { schema: "clientes" })
export class Conexionesmywaiter {
  @Column("int", { primary: true, name: "IdConexion" })
  idConexion: number;

  @Column("bit", { name: "Carta" })
  carta: boolean;

  @Column("bit", { name: "CartaInteractiva" })
  cartaInteractiva: boolean;

  @Column("bit", { name: "Pedido" })
  pedido: boolean;

  @Column("bit", { name: "Mensajes" })
  mensajes: boolean;

  @Column("bit", { name: "Cuenta" })
  cuenta: boolean;

  @Column("bit", { name: "Valorar" })
  valorar: boolean;

  @Column("bit", { name: "Home" })
  home: boolean;

  @Column("varchar", { name: "NodoNEO", nullable: true, length: 50 })
  nodoNeo: string | null;

  @Column("varchar", {
    name: "ModoEnvioPedido",
    length: 50,
    default: () => "'DIRECTO'",
  })
  modoEnvioPedido: string;
}
