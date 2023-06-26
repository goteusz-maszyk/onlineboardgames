import { Server, Socket } from "socket.io";
import startGame from "./startGame.js";
import startRound, { checkWin } from "./startRound.js";
/**
 * @param {Socket} socket 
 * @param {Map<String, import("../types.js").AmazonkiRoom>} rooms 
 * @param {Server} io
 */
export default function initAmazonki(socket, rooms, io) {
  if (!rooms.has(socket.room)) {
    rooms.set(socket.room, { gameStarted: false, connections: [], emptyAvailable: 0, trasuresAvailable: 0, trapsAvailable: 0, playerCards: [], nowTurn: 0 });
  }
  const room = rooms.get(socket.room);
  room.connections.push(socket);

  if (room.connections.length == 11) {
    socket.disconnect(true)
    return
  }

  if (room.connections.length == 10) {
    startGame(room, io, socket)
  }

  socket.on('reset-game', () => {
    if (room.connections.length > 2) {
      startGame(room, io, socket)
    }
  })

  socket.on('open-card', (playerIndex, cardIndex) => {
    if(!room.gameStarted) return
    if(room.nowTurn != room.connections.indexOf(socket)) return;
    if (room.connections.indexOf(socket) == playerIndex) return;
    room.roundOpenedCards += 1
    const cardType = room.playerCards[playerIndex][cardIndex];
    io.of('/amazonki').to(socket.room).emit('open-card', playerIndex, cardIndex, cardType);
    room.nowTurn = playerIndex;
    room.connections[room.nowTurn].emit('your-turn')

    switch (cardType) {
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
    checkWin(room, io, socket);
    if(room.roundOpenedCards == room.connections.length) startRound(room, io, socket)
  })

  socket.on('set-nickname', nick => {
    socket.nickname = nick;
    io.of('/amazonki').to(socket.room).emit('set-nickname', room.connections.indexOf(socket), nick);
  })
}