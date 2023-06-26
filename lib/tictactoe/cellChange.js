import { Socket, Server } from 'socket.io';

/**
 * @param {Socket} socket 
 * @param {Array} rooms 
 * @param {Server} io 
 * @param {Array} data
 */
export default function onCellChange(socket, room, io, data) {
  if (room.lastPlayer == socket.id) {
    return
  }
  if (!room.cells[data[0]]) {
    data.push(room.shapes[socket.id])
    room.cells[data[0]] = room.shapes[socket.id]
    io.of('/tictactoe').to(socket.room).emit('cellChange', data)
  } else return

  if (room.nextShape === "O") {
    room.nextShape = "X"
  } else {
    room.nextShape = "O"
  }


  room.lastPlayer = socket.id
}