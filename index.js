import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";
import onCellChange from './lib/cellChange.js';
import connectionInit from './lib/connectionInit.js';
import checkWin from './lib/winChecker.js';

const app = express()
const server = createServer(app);
const io = new Server(server);

const port = process.argv[2] ? process.argv[2].split(":")[1] : process.env.PORT || 5000
const path = process.argv[2] ? process.argv[2].split(":")[0] : undefined

let rooms = {}

io.on('connection', (socket) => {
  connectionInit(socket, rooms)

  socket.on('cellChange', data => {
    if (rooms[socket.room].gameEnded) return
    onCellChange(socket, rooms, io, data)
    checkWin(socket, rooms, io)
  })

  setTimeout(() => {
    if (!rooms[socket.room]) return
    Object.keys(rooms[socket.room].cells).forEach(cell => {
      socket.emit('cellChange', [cell, rooms[socket.room].cells[cell]])
    })
    if (rooms[socket.room].gameEnded) socket.emit('gameEnd', rooms[socket.room].gameEndData)
  }, 100)



  socket.on('disconnect', () => {
    if (rooms[socket.room]) {
      delete rooms[socket.room].connections[socket.id]
      if (Object.keys(rooms[socket.room].connections) == 0) delete rooms[socket.room]
    }
  })

  socket.on('reset-game', () => {
    rooms[socket.room].cells = {}
    rooms[socket.room].gameEnded = false
    io.to(socket.room).emit('reset-game')
    for (const i of ['a1', 'b1', 'c1', 'a2', 'b2', 'c2', 'a3', 'b3', 'c3'])
      io.to(socket.room).emit('cellChange', [i, ""])
  })
});

app.use(express.static('public'))
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('tictactoe', { room: req.query.room })
})

server.listen(port, path, () => {
  console.log(`Online board games server listening on ${path}:${port}`)
})