import { Socket } from "socket.io"
import onCellChange from "./cellChange.js"
import winChecker from "./winChecker.js"

/**
 * 
 * @param {Socket} socket 
 * @param {Map<String, import("../types.js").Room>} rooms 
 * @returns 
 */
export default function initTictactoe(socket, rooms, io) {
  if (!rooms.has(socket.room)) {
    rooms.set(socket.room, { nextShape: 'O', cells: {}, connections: [], nextPlayer: socket.id, shapes: {} })
  }

  const room = rooms.get(socket.room);
  room.connections.push(socket);

  if (room.connections.length == 2) {
    socket.disconnect(true)
    return
  }

  if (room.connections.length == 1) {
    setTimeout(() => {
      socket.emit('setShape', 'O')
    }, 10)
    room.shapes[socket.id] = 'O'
  } else if (!Object.values(room.shapes).includes('O')) {
    setTimeout(() => {
      socket.emit('setShape', 'O')
    }, 10)
    room.shapes[socket.id] = 'O'
  } else {
    setTimeout(() => {
      socket.emit('setShape', 'X')
    }, 10)
    room.shapes[socket.id] = 'X'
  }


  socket.on('cellChange', data => {
    if (rooms.get(socket.room).gameEnded) return
    onCellChange(socket, rooms.get(socket.room), io, data)
    winChecker(socket, rooms, io)
  })

  setTimeout(() => {
    if (!rooms.has(socket.room)) return
    Object.keys(rooms.get(socket.room).cells).forEach(cell => {
      socket.emit('cellChange', [cell, rooms.get(socket.room).cells[cell]])
    })
    if (rooms.get(socket.room).gameEnded) socket.emit('gameEnd', rooms.get(socket.room).gameEndData)
  }, 100)

  socket.on('reset-game', () => {
    rooms.get(socket.room).cells = {}
    rooms.get(socket.room).gameEnded = false
    io.of("/tictactoe").to(socket.room).emit('reset-game')
    for (const i of ['a1', 'b1', 'c1', 'a2', 'b2', 'c2', 'a3', 'b3', 'c3'])
      io.of("/tictactoe").to(socket.room).emit('cellChange', [i, ""])
  })
}