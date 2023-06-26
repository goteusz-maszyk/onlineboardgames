import { Server, Socket } from 'socket.io'

/**
 * @param {Socket} socket 
 * @param {Map<String, import("../types.js").Room>} rooms 
 * @param {Server} io
 */
export default function winChecker(socket, rooms, io) {
  const room = rooms.get(socket.room)
  const { cells } = room
  room.gameEnded = true

  if (cells.a1 && cells.a1 == cells.a2 && cells.a1 == cells.a3) {
    // col A
    endGame(socket, rooms, io, { winner: cells.a1, cells: ['a1', 'a2', 'a3'] })
  } else if (cells.b1 && cells.b1 == cells.b2 && cells.b1 == cells.b3) {
    // col B
    endGame(socket, rooms, io, { winner: cells.b1, cells: ['b1', 'b2', 'b3'] })
  } else if (cells.c1 && cells.c1 == cells.c2 && cells.c1 == cells.c3) {
    // col C
    endGame(socket, rooms, io, { winner: cells.c1, cells: ['c1', 'c2', 'c3'] })
  } else if (cells.a1 && cells.a1 == cells.b1 && cells.a1 == cells.c1) {
    // row 1
    endGame(socket, rooms, io, { winner: cells.a1, cells: ['a1', 'b1', 'c1'] })
  } else if (cells.a2 && cells.a2 == cells.b2 && cells.a2 == cells.c2) {
    // row 2
    endGame(socket, rooms, io, { winner: cells.a2, cells: ['a2', 'b2', 'c2'] })
  } else if (cells.a3 && cells.a3 == cells.b3 && cells.a3 == cells.c3) {
    // row 3
    endGame(socket, rooms, io, { winner: cells.a3, cells: ['a3', 'b3', 'c3'] })
  } else if (cells.a1 && cells.a1 == cells.b2 && cells.a1 == cells.c3) {
    // diag 1 (left up)
    endGame(socket, rooms, io, { winner: cells.a1, cells: ['a1', 'b2', 'c3'] })
  } else if (cells.a3 && cells.a3 == cells.b2 && cells.a3 == cells.c1) {
    // diag 2 (right up)
    endGame(socket, rooms, io, { winner: cells.a3, cells: ['a3', 'b2', 'c1'] })
  } else if (Object.keys(cells).length == 9) {
    // board is full
    endGame(socket, rooms, io, { winner: undefined, cells: [] })
  } else {
    room.gameEnded = false
  }
}

function endGame(socket, rooms, io, data) {
  rooms.get(socket.room).gameEndData = data
  io.of("/tictactoe").to(socket.room).emit('gameEnd', data)
}