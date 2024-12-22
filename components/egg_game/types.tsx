export interface Team {
    id: string;
    name: string;
    players: string[];
    score?: number;
  }
  
  export interface DragPosition {
    tableId: string;
    position: 'eastWest' | 'northSouth';
  }
  
  export interface Table {
    id: string;
    row: number;
    col: number;
    eastWest?: Team;
    northSouth?: Team;
  }
  
  export interface SeatingState {
    tables: Table[];
    unassigned: Team[];
  }
  
  export interface SeatingArrangementProps {
    teams: Team[];
    seating: SeatingState;
    setSeating: (seating: SeatingState) => void;
  }