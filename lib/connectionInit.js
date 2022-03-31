import { Socket } from 'socket.io'
import { v4 } from 'uuid'

/**
 * @param {Socket} socket 
 * @param {Array} rooms
 */
export default function connectionInit(socket, rooms) {
  socket.room = socket.handshake.query.room
  if (!socket.room) {
    socket.room = v4()
    setTimeout(() => socket.emit('roomChange', socket.room), 100)
  }

  socket.rooms.forEach((room) => {
    socket.leave(room)
  })
  socket.join(socket.room)
  if (!rooms[socket.room]) rooms[socket.room] = { nextShape: 'O', cells: {}, connections: [] }

  rooms[socket.room].connections.push(socket.id)
}