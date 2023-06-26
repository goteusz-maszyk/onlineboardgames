const socket = io(document.location.host + "/tictactoe", {
  query: {
    room: new URLSearchParams(document.location.search).get('room') || ""
  }
});
let shape
const cellList = ['a1', 'b1', 'c1', 'a2', 'b2', 'c2', 'a3', 'b3', 'c3']
const gameStatusDisplay = document.getElementById('game-status')
document.querySelectorAll('td').forEach((el) => {
  el.addEventListener("click", (e) => {
    socket.emit('cellChange', [e.target.id])
  })
})

const resetBtn = document.getElementById('reset-game-btn')

resetBtn.style.display = 'none'

socket.on('roomChange', roomID => {
  document.getElementById("room").innerHTML = "ROOM: " + roomID
  const url = new URL(window.location);
  url.searchParams.set('room', roomID);
  window.history.pushState({}, document.title, url);
})

socket.on("cellChange", data => {
  document.getElementById(data[0]).innerHTML = data[1]
});

socket.on("gameEnd", data => {
  resetBtn.style.display = 'inline'
  if (!data.winner) {
    alert("Game ended! It's a draw!")
    gameStatusDisplay.innerText = "ENDED, DRAW"
  } else if (data.winner == shape) {
    alert('You won the game!')
    gameStatusDisplay.innerText = "ENDED, WIN"
  } else {
    alert("Your opponent won the game!")
    gameStatusDisplay.innerText = "ENDED, DEFEAT"
  }
  data.cells.forEach((cell) => {
    document.getElementById(cell).classList.add("won-cell")
  })
})

socket.on('setShape', data => {
  shape = data
})

socket.on('disconnect', () => {
  alert("Server refused/closed connection.\nIt's mostly because of restart or trying to connect to full room")
})

socket.on('reset-game', () => {
  resetBtn.style.display = 'none'
  gameStatusDisplay.innerText = "PENDING"
  cellList.forEach((cell) => {
    document.getElementById(cell).classList.remove("won-cell")
  })
})

resetBtn.addEventListener('click', () => {
  socket.emit('reset-game')
})