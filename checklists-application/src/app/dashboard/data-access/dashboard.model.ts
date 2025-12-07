export interface Checklist {
  nombre: string;
  alta: boolean;
  idLista: number;
}

export interface Conexion {
  nombreConexion: string;
  checklists: Checklist[];
  isExpanded?: boolean;
}
