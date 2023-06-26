import { Server, Socket } from "socket.io";
import { amazons, emptyAmounts, robbers, trapAmounts, treasureAmounts } from "./cardAmounts.js";
import weightedRandom from "../weightedRandom.js";
import startRound from './startRound.js';
/**
 * @param {import("../types.js").AmazonkiRoom} room 
 * @param {Server} io 
 * @param {Socket} socket 
 */
export default function startGame(room, io, socket) {
  room.gameStarted = true;
  room.roundsLeft = 5;

  room.emptyAvailable = emptyAmounts(room.connections.length);
  room.trasuresAvailable = treasureAmounts(room.connections.length);
  room.trapsAvailable = trapAmounts(room.connections.length);
  room.amazonsAvailable = amazons(room.connections.length);
  room.robbersAvailable = robbers(room.connections.length);
  io.of('/amazonki').to(socket.room).emit('reset-game', room.connections.length);
  room.connections.forEach(conn => {
    conn.isAmazon = weightedRandom([
      room.amazonsAvailable / (room.amazonsAvailable + room.robbersAvailable),
      room.robbersAvailable / (room.amazonsAvailable + room.robbersAvailable)
    ]) == 0;
    if (conn.isAmazon) {
      room.amazonsAvailable -= 1
    } else {
      room.robbersAvailable -= 1
    }
    conn.emit('setRole', conn.isAmazon)
  });
  startRound(room, io, socket);
}