import { Server, Socket } from "socket.io";
import weightedRandom from "../weightedRandom.js";
import shuffle from '../shuffle.js';
/** 
 * @param {import("../types.js").AmazonkiRoom} room 
 * @param {Server} io 
 * @param {Socket} socket 
 */
export default function startRound(room, io, socket) {
  if(!room.gameStarted) return;
  
  const emptyAvailable = room.emptyAvailable;
  const trasuresAvailable = room.trasuresAvailable;
  const trapsAvailable = room.trapsAvailable
  
  io.of('/amazonki').to(socket.room).emit('set-round', room.roundsLeft, trasuresAvailable, trapsAvailable);

  room.connections.forEach(socket => {
    room.playerCards[room.connections.indexOf(socket)] = [];
    for (let i = 1; i <= room.roundsLeft; i++) {
      const cardsAvailable = room.emptyAvailable + room.trasuresAvailable + room.trapsAvailable
      const card = Number(weightedRandom([
        room.emptyAvailable / cardsAvailable,
        room.trasuresAvailable / cardsAvailable,
        room.trapsAvailable / cardsAvailable
      ]))
      switch (card) {
        case 0:
          room.emptyAvailable -= 1;
          break;
        case 1:
          room.trasuresAvailable -= 1;
          break;
        case 2:
          room.trapsAvailable -= 1;
          break;
      }
      room.playerCards[room.connections.indexOf(socket)].push(card)
    }
    const playerCards = room.playerCards[room.connections.indexOf(socket)];
    const shuffled = shuffle(playerCards);
    socket.emit('set-cards', shuffled)
  });


  room.roundsLeft -= 1;
  room.emptyAvailable = emptyAvailable;
  room.trasuresAvailable = trasuresAvailable;
  room.trapsAvailable = trapsAvailable;
  room.roundOpenedCards = 0;
  room.connections[room.nowTurn].emit('your-turn')
}

/** 
 * @param {import("../types.js").AmazonkiRoom} room 
 * @param {Server} io 
 * @param {Socket} socket
 */
export function checkWin(room, io, socket) {
  if(room.trasuresAvailable == 0) {
    room.gameStarted = false;
    io.of('/amazonki').to(socket.room).emit('gameEnd', false, room.trasuresAvailable, room.trapsAvailable)
    return
  }
  if(room.trapsAvailable == 0 || room.roundsLeft == 2) {
    room.gameStarted = false;
    io.of('/amazonki').to(socket.room).emit('gameEnd', true, room.trasuresAvailable, room.trapsAvailable)
    return
  }
}