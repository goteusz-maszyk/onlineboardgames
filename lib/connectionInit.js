import { Socket } from 'socket.io'
import { v4 } from 'uuid'

/**
 * @param {Socket} socket 
 * @param {Map<String, import('./types').Room>} rooms
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
  
  socket.on('disconnect', (reason) => {
    if (rooms.has(socket.room)) {
      rooms.get(socket.room).connections.splice(rooms.get(socket.room).connections.indexOf(socket), 1)
      
      //tictactoe shapes clear
      if (rooms.get(socket.room).shapes) {
        delete rooms.get(socket.room).shapes[socket.id]
      }

      if (rooms.get(socket.room).connections.length == 0) rooms.delete(socket.room)
    }
  })
}