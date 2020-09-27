var socket = io.connect('/');
var changes = document.querySelector('#changes');

socket.on('message', function(data) {
  console.log('Message received: ' + data);
  socket.emit('message received', 'I got your message');
});

socket.on('diffed changes', function(data){
  console.log(`File changed: ${data}`);
  var parent_li = document.createElement('li');
  parent_li.innerText = 'Latest changes:';
  var nested_ul = document.createElement('ul');
  nested_ul.innerHTML += data;
  parent_li.append(nested_ul);
  changes.append(parent_li);
});
