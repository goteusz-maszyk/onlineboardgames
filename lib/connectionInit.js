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
  if (!rooms[socket.room]) {
    rooms[socket.room] = { nextShape: 'O', cells: {}, connections: {}, nextPlayer: socket.id }
  }

  if (Object.keys(rooms[socket.room].connections).length == 2) {
    socket.disconnect(true)
    return
  }

  rooms[socket.room].connections[socket.id] = undefined

  if (Object.keys(rooms[socket.room].connections).length == 1) {
    setTimeout(() => {
      socket.emit('setShape', 'O')
    }, 10)
    rooms[socket.room].connections[socket.id] = 'O'
  } else if (!Object.values(rooms[socket.room].connections).includes('O')) {
    setTimeout(() => {
      socket.emit('setShape', 'O')
    }, 10)
    rooms[socket.room].connections[socket.id] = 'O'
  } else {
    setTimeout(() => {
      socket.emit('setShape', 'X')
    }, 10)
    rooms[socket.room].connections[socket.id] = 'X'
  }
}