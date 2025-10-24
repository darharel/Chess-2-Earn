export interface Opening {
  id: string;
  name: string;
  moves: string;
}

// This is a small placeholder list. Replace with the comprehensive opening list as needed.
export const CHESS_OPENINGS: Opening[] = [
  { id: 'italian_game', name: 'Italian Game', moves: 'e4 e5 Nf3 Nc6 Bc4' },
  { id: 'sicilian_defense', name: 'Sicilian Defense', moves: 'e4 c5' },
  { id: 'ruy_lopez', name: 'Ruy Lopez', moves: 'e4 e5 Nf3 Nc6 Bb5' },
  { id: 'queens_gambit', name: "Queen's Gambit", moves: 'd4 d5 c4' },
  { id: 'french_defense', name: 'French Defense', moves: 'e4 e6 d4 d5' },
  { id: 'caro_kann', name: 'Caro-Kann Defense', moves: 'e4 c6 d4 d5' },
  { id: 'scandinavian_defense', name: 'Scandinavian Defense', moves: 'e4 d5 exd5 Qxd5 Nc3' },
  { id: 'kings_indian_defense', name: "King's Indian Defense", moves: 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6' }
];
