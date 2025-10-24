export interface Opening {
  id: string;
  name: string;
  moves: string;
}

// This is a small placeholder list. Replace with the comprehensive opening list as needed.
export const CHESS_OPENINGS: Opening[] = [
  { id: 'italian_game', name: 'Italian Game', moves: 'e4 e5 Nf3 Nc6 Bc4' },
  { id: 'sicilian_defense', name: 'Sicilian Defense', moves: 'e4 c5' },
  { id: 'queens_gambit', name: "Queen's Gambit", moves: 'd4 d5 c4' },
  { id: 'french_defense', name: 'French Defense', moves: 'e4 e6 d4 d5' }
];
