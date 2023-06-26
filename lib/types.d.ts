import { Socket } from "socket.io";

export interface Room {
  connections: Socket[];
}

export interface AmazonkiRoom extends Room {
  gameStarted: boolean;
  roundsLeft: Number;
  roundOpenedCards: Number;

  playerCards: Number[][];
  
  emptyAvailable: Number;
  trasuresAvailable: Number;
  trapsAvailable: Number;

  nowTurn: Number;
}