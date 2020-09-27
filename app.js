'use strict';

const createError = require('http-errors');
const express = require('express');
const {EventEmitter} = require('events');
const fs = require('fs');
const diff = require('diff');
const puppeteer = require("puppeteer");
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const io = require('socket.io')();

const indexRouter = require('./routes/index');
//const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//app.use('/users', usersRouter);

// pasting code from routes/index.js
var fileEvent = new EventEmitter();
async function run() {

  const browser = await puppeteer.launch();

  try {
    // readFile worldometers_data.txt and find diffs and output to console
        var old_file = fs.readFileSync('views/worldometers_data.txt', {encoding:"utf8"});
        //var fileEvent = new EventEmitter();

        fileEvent.on('changed file', function(data){
          console.log('The file was changed and fired an event. This data was received:\n' + data);
        });

        fs.watch('views/worldometers_data.txt', function(eventType, filename) {
          fs.promises.readFile(`views/${filename}`, {encoding:"utf8"})
            .then(function(data) {
            // only flash this message if the file's content has changed
            var new_file = data;
            if (new_file !== old_file) {
              console.log(`\nThe content of ${filename} has changed: it was a ${eventType} event.`)
              var file_changes = diff.diffLines(old_file,new_file);
              /*
              console.log(`Here are the changes (promise!):`);
              */
              var all_changes = file_changes.map((change, i) => {
                if (change.added) {
                  return `<li class="ins">Added: ${change.value}</li>`;
                }
                if (change.removed) {
                  return `<li class="del">Removed: ${change.value}</li>`;
                }
              });
              fileEvent.emit('changed file', all_changes.join('\n'));
            }
            old_file = new_file
          });
          }
        );

  } catch (error) {
    console.error("Error: " +error.message);
  } finally {
    await browser.close();
  }
}

run();
// end of routes/index.js code

// send a message on successful socket connection
io.on('connection', function(socket){
  socket.emit('message', 'Successfully connected.');
  socket.on('message received', function(data){
    console.log('Client is saying a message was received: ' + data);
  });
  fileEvent.on('changed file', function(data) {
    socket.emit('diffed changes', data);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {app, io};
