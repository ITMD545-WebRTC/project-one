var socket = io.connect('/');

socket.on('message', function(data) {
  console.log('Message received: ' + data);
  socket.emit('message received', 'I got your message');
});

socket.on('diffed changes', function(data){
  console.log(`File changed: ${data}`);
});
