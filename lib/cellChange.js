import { Socket, Server } from 'socket.io';

/**
 * @param {Socket} socket 
 * @param {Array} rooms 
 * @param {Server} io 
 * @param {Array} data
 */
export default function onCellChange(socket, rooms, io, data) {
  if (rooms[socket.room].lastPlayer == socket.id) {
    return
  }
  if (!rooms[socket.room].cells[data[0]]) {
    data.push(rooms[socket.room].connections[socket.id])
    rooms[socket.room].cells[data[0]] = rooms[socket.room].connections[socket.id]
    io.to(socket.room).emit('cellChange', data)
  } else return

  if (rooms[socket.room].nextShape === "O") {
    rooms[socket.room].nextShape = "X"
  } else {
    rooms[socket.room].nextShape = "O"
  }


  rooms[socket.room].lastPlayer = socket.id
}