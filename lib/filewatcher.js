const fs = require('fs');
const diff = require('diff');

// create IIFE which watches changes made to file
function watch (fileEvent) {
  // readFile worldometers_data.txt and find diffs and output to console
  var old_file = fs.readFileSync('output/worldometers_data.txt', {
    encoding: "utf8"
  });

  fileEvent.on('changed file', function(data) {
    console.log('The file was changed and fired an event. This data was received:\n' + data);
  });

  fs.watch('output/worldometers_data.txt', function(eventType, filename) {
    fs.promises.readFile(`output/${filename}`, {
        encoding: "utf8"
      })
      .then(function(data) {
        // only flash this message if the file's content has changed
        var new_file = data;
        if (new_file !== old_file) {
          console.log(`\nThe content of ${filename} has changed: it was a ${eventType} event.`)
          var file_changes = diff.diffLines(old_file, new_file);
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
  });
}

module.exports = {
  watch
}
