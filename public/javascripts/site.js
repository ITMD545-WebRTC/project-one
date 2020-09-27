var socket = io.connect('/');
var changes = document.querySelector('#changes');

socket.on('message', function(data) {
  console.log('Message received: ' + data);
  socket.emit('message received', 'I got your message');
});

socket.on('diffed changes', function(data){
  console.log(`File changed: ${data}`);
  changes.innerHTML += data;
});
