import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";
import onCellChange from './lib/cellChange.js';
import connectionInit from './lib/connectionInit.js';
process.env.NODE_ENV = "development"
const app = express()
const server = createServer(app);
const io = new Server(server);

const port = process.env.PORT || 5000

let rooms = {}

io.on('connection', (socket) => {
  connectionInit(socket, rooms)

  socket.on('cellChange', data => {
    onCellChange(socket, rooms, io, data)
    console.log(rooms[socket.room])
  })

  setTimeout(() => {
    Object.keys(rooms[socket.room].cells).forEach(cell => {
      socket.emit('cellChange', [cell, rooms[socket.room].cells[cell]])
    })
  }, 100)


  socket.on('disconnect', () => {
    if (rooms[socket.room]) {
      rooms[socket.room].connections.splice(rooms[socket.room].connections.indexOf(socket.id), 1)
      if (rooms[socket.room].connections.length == 0) {
        delete rooms[socket.room]
      }
    }
  })
});

app.use(express.static('public'))
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  res.render('tictactoe')
})

server.listen(port, () => {
  console.log(`Online board games server listening on port ${port}`)
})