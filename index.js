import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";
import connectionInit from './lib/connectionInit.js';
import expressEjsLayouts from 'express-ejs-layouts';
import initTictactoe from './lib/tictactoe/init.js';
import initAmazonki from './lib/amazonki/init.js';

const app = express()
const server = createServer(app);
const io = new Server(server);

const port = process.argv[2] ? process.argv[2].split(":")[1] : process.env.PORT || 5000
const path = process.argv[2] ? process.argv[2].split(":")[0] : undefined

/**
 * @type {Map<String, import('./lib/types.js').Room>}
 */
let rooms = new Map();

io.of('/amazonki').on('connection', (socket) => {
  connectionInit(socket, rooms);
  initAmazonki(socket, rooms, io);
})

io.of("/tictactoe").on("connection", (socket) => {
  connectionInit(socket, rooms);
  initTictactoe(socket, rooms, io);
})


app.use(express.static('public'))
app.use(expressEjsLayouts)
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/tictactoe', (req, res) => {
  res.render('tictactoe', { room: req.query.room })
})

app.get('/amazonki', (req, res) => {
  res.render('amazonki', { room: req.query.room })
})

server.listen(port, path, () => {
  console.log(`Online board games server listening on http://${path}:${port}`)
})