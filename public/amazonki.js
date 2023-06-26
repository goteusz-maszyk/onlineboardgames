let nickname = localStorage.getItem("nick")
const nickDisp = document.getElementById('nick')
nickDisp.innerText = nickname;

function changeNick() {
  nickname = prompt("Jak się nazywasz?");
  localStorage.setItem("nick", nickname);
  nickDisp.innerText = nickname;
}

if(!nickname) changeNick();

const socket = io(document.location.host + "/amazonki", {
  query: {
    room: new URLSearchParams(document.location.search).get('room') || ""
  }
});
let amazonsWon = undefined;
let isAmazon = undefined;
const beforeStart = document.getElementById('before-start');
const resetBtn = document.getElementById('reset-game-btn')
const roleInfoLine = document.getElementById('role-info');

const gameStatusDisplay = document.getElementById('game-status');
const gameArea = document.getElementById('game-area');
gameArea.classList.add('template');

let foundTreasures = 0, maxTreasures = 0, foundTraps = 0, maxTraps = 0;

const modal = new bootstrap.Modal('#modal', {})
let currentCards = [0, 0, 0, 0, 0]
socket.on('roomChange', roomID => {
  document.getElementById("room").innerHTML = "POKÓJ: " + roomID
  const url = new URL(window.location);
  url.searchParams.set('room', roomID);
  window.history.pushState({}, document.title, url);
})

socket.on('setRole', data => {
  isAmazon = data
  roleInfoLine.innerText = "Rola: " + (isAmazon ? "Amazonka" : "Grabieżca")
})

socket.on('disconnect', () => alert("Server refused/closed connection.\nIt's mostly because of restart or trying to connect to full room"))

socket.on('reset-game', players => {
  socket.emit('set-nickname', nickname);
  gameArea.classList.remove('template')
  resetBtn.style.display = 'none'
  gameStatusDisplay.innerText = "W TRAKCIE"
  beforeStart.style.display = 'none';
  for (let i = 1; i <= players; i++) {
    const child = document.createElement("div");
    child.classList.add('player-box');
    child.id = "player" + i
    const childPlayerName = document.createElement('p');
    childPlayerName.id = 'player-' + i + '-name';
    childPlayerName.innerText = "GRACZ " + i
    child.appendChild(childPlayerName)
    gameArea.appendChild(child)
  }
})

socket.on('set-round', (round, trasuresAvailable, trapsAvailable) => {
  setTimeout(() => {
    gameStatusDisplay.innerText = `W TRAKCIE, SKARBY: ${foundTreasures}/${maxTreasures}, PUŁAPKI: ${foundTraps}/${maxTraps}`;
    for (let i = 0; i < gameArea.children.length; i++) {
      const child = gameArea.children.item(i);
      if (child.children.length == 2) {
        child.removeChild(child.lastChild)
      }
      const span = document.createElement('span');
      for (let i = 0; i < round; i++) {
        const imgElement = document.createElement('img')
        imgElement.src = '/amazonki/covered.png'
        imgElement.classList.add("covered")
        span.appendChild(imgElement)
      }
      child.appendChild(span)
    }
  }, round == 5 ? 1 : 2000)
  if (maxTreasures == 0) {
    maxTreasures = trasuresAvailable;
    maxTraps = trapsAvailable;
  }
  foundTreasures = maxTreasures - trasuresAvailable
  foundTraps = maxTraps - trapsAvailable
  gameStatusDisplay.innerText = `NASTĘPNA RUNDA, SKARBY: ${foundTreasures}/${maxTreasures}, PUŁAPKI: ${foundTraps}/${maxTraps}`;
})

socket.on('set-cards', cards => {
  currentCards = cards;
  setTimeout(() => {
    modal.show();
  }, cards.length == 5 ? 1 : 2000);
})

socket.on('set-nickname', (playerId, nick) => {
  document.getElementById('player-' + (playerId+1) + '-name').innerText = nick;
})

socket.on('open-card', (playerId, cardId, type) => {
  const imgBox = gameArea.querySelector('#player' + (playerId+1) + " > span");
  imgBox.children.item(cardId).classList.remove('covered');
  switch(type) {
    case 0:
      imgBox.children.item(cardId).src = '/amazonki/empty.png';
      break;
    case 1:
      imgBox.children.item(cardId).src = '/amazonki/treasure.png';
      break;
    case 2:
      imgBox.children.item(cardId).src = '/amazonki/trap.png';
      break;
  }
})
socket.on("gameEnd", (data, trasuresAvailable, trapsAvailable) => {
  amazonsWon = data;

  foundTreasures = maxTreasures - trasuresAvailable;
  foundTraps = maxTraps - trapsAvailable;

  resetBtn.style.display = 'inline'
  modal.show();
})

resetBtn.addEventListener('click', () => {
  socket.emit('reset-game')
})

gameArea.addEventListener('click', clickEvent => {
  if (!clickEvent.target.matches('img.covered')) return;
  const playerBox = clickEvent.target.parentElement.parentElement // div#playerX > span > img.covered
  const playerId = Number(playerBox.id.split("player")[1])
  
  const cardIndex = getChildIndex(clickEvent.target)
  socket.emit("open-card", playerId - 1, cardIndex);
});
  
function getChildIndex(element) {
  return Array.prototype.indexOf.call(element.parentNode.children, element);
}
  
modal._element.addEventListener('show.bs.modal', event => {
  const cardDiv = document.getElementById('modal-cards');
  cardDiv.removeChild(cardDiv.lastChild)
  if (amazonsWon !== undefined) {
    document.querySelector('.modal-title').innerText = amazonsWon ? "Amazonki wygrywają!" : "Grabieżcy wygrywają!"
    document.querySelector('.modal-body').innerHTML = `<p>${(isAmazon === amazonsWon) ? "Gratulacje!": "Cóż, chyba nie tym razem"}</p>`+
    `<p>Odkryte karty:</p><p>SKARB: ${foundTreasures}/${maxTreasures}</p><p>PUŁAPKA: ${foundTraps}/${maxTraps}</p>`
    return
  }
  const cardBox = document.createElement('div');
  currentCards.forEach(cardType => {
    const imgElement = document.createElement('img')
    switch (cardType) {
      case 0:
        imgElement.src = '/amazonki/empty.png';
        break;
      case 1:
        imgElement.src = '/amazonki/treasure.png';
        break;
      case 2:
        imgElement.src = '/amazonki/trap.png';
        break;
    }
    cardBox.appendChild(imgElement)
  })
  cardDiv.appendChild(cardBox);
})

