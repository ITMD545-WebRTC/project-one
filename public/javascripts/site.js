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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      console.log(`Service worker registration succeeded for: ${registration.scope}`);
      registration.addEventListener('updatefound', function() {
        var installingWorker = registration.installing;
        console.log('A new service worker is being installed:', installingWorker);
      })
    })
    .catch(function(error) {
      console.error('Service worker registration failed:', error)
    });
} else {
  console.log('Service workers are not supported.');
}

if ('Notification' in window) {
  console.log('Notification support!');
  var notify_button = document.createElement('button');
  notify_button.id = "notify";
  notify_button.innerText = "Send Notifications";
  notify_button.addEventListener('click', function(event) {
    Notification.requestPermission()
      .then(function(permission) {
        console.log('Permission:', permission);
      })
      .catch(function(error) {
        console.error('Permission error:', error);
      });
  });
  document.querySelector('body').append(notify_button);

  if (Notification.permission == 'granted') {
    var test_button = document.createElement('button');
    test_button.id = "test-notify";
    test_button.innerText = "Send Test Notifications";
    test_button.addEventListener('click', function(event) {
      var notification = new Notification('This is a notification');
      nofitication.addEventListener('click', function(event) {
        notification.close();
      });
    });
    document.querySelector('body').append(test_button);
  }
}