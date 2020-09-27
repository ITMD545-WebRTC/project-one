var https = require("https");
const puppeteer = require("puppeteer");
const fs = require('fs');
const diff = require('diff');
const {EventEmitter} = require('events');

async function read() {
  // readFile worldometers_data.txt and find diffs and output to console
  var old_file = fs.readFileSync('../views/worldometers_data.txt', {
    encoding: "utf8"
  });

  var fileEvent = new EventEmitter();
  fileEvent.on('changed file', function(data) {
    console.log('The file was changed and fired an event. This data was received:\n' + data);
  });

  fs.watch('../views/worldometers_data.txt', function(eventType, filename) {
    fs.promises.readFile(`../views/${filename}`, {
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
              return `Added: ${change.value}`;
            }
            if (change.removed) {
              return `Removed: ${change.value}`;
            }
          });
          fileEvent.emit('changed file', all_changes.join('\n'));
        }
        old_file = new_file
      });
  });
}

async function scrapeData() {
  const browser = await puppeteer.launch();

  try {
    // fetch website using puppeteer
    const page = await browser.newPage();
    await page.goto("https://www.worldometers.info/coronavirus/#news");

    // grab and return new data from website
    const result = await page.evaluate(() => {
      let header = document.querySelector("div.content-inner");
      let glbData = document.querySelector("#maincounter-wrap").innerText;
      let news = document.querySelector("h2").innerText;
      let newsDate = document.querySelector("h4").innerText;
      let updates = document.querySelector("span.news_category_title").innerText;
      let firstUpdate = document.querySelector("div#newsdate2020-09-23").innerText;
      let secondUpdate = document.querySelector("div#newsdate2020-09-22").innerText;

      return {
        // glbData,
        // news,
        newsDate,
        // updates,
        firstUpdate,
        secondUpdate
      }
    })
    // return object of scraped data
    return result;

  } catch (error) {
    console.error("Error: " + error.message);
  } finally {
    await browser.close();
  }
}

async function run() {
  // get json of scraped data
  var result = await scrapeData();
  // take scrapped data and write it to a file
  var strResult = JSON.stringify(result);
  //console.log(strResult);
  var formatResult = strResult.replace(/\\n\\n\\n/g, '');
  // console.log("STRING FORMATTED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  // console.log(formatResult);
  var parsedResult = JSON.parse(formatResult);
  console.log("PARSED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log(parsedResult);
  fs.writeFile('../project-one/views/worldometers_data.txt', formatResult, {
    encoding: "utf-8"
  }, function(err) {
    if (err) throw (err);
    console.log('Newly fetched data saved in File');
  });

  return parsedResult;
}

module.exports = {run}
