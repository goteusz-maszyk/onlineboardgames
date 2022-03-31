const socket = io({
  query: {
    room: new URLSearchParams(document.location.search).get('room') || ""
  }
});

document.querySelectorAll('td').forEach((el) => {
  el.addEventListener("click", (e) => {
    socket.emit('cellChange', [e.target.id])
  })
})


socket.on('roomChange', roomID => {
  const url = new URL(window.location);
  url.searchParams.set('room', roomID);
  window.history.pushState({}, document.title, url);
})

socket.on("cellChange", data => {
  document.getElementById(data[0]).innerHTML = data[1]
});