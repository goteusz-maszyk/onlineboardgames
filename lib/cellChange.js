import { Socket, Server } from 'socket.io';

/**
 * @param {Socket} socket 
 * @param {Array} rooms 
 * @param {Server} io 
 * @param {Array} data
 */
export default function onCellChange(socket, rooms, io, data) {
  if (rooms[socket.room].lastPacketFrom === socket.id) {
    return
  }
  data.push(rooms[socket.room].nextShape)
  if (!rooms[socket.room].cells[data[0]]) {
    rooms[socket.room].cells[data[0]] = rooms[socket.room].nextShape
  }

  if (rooms[socket.room].nextShape === "O") {
    rooms[socket.room].nextShape = "X"
  } else {
    rooms[socket.room].nextShape = "O"
  }


  io.to(socket.room).emit('cellChange', data)
  rooms[socket.room].lastPacketFrom = socket.id
}