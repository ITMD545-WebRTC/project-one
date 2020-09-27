var https = require("https");
const puppeteer = require("puppeteer");
const fs = require('fs');
const diff = require('diff');
const {EventEmitter} = require('events');

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

async function update() {
  // get json of scraped data
  var result = await scrapeData();
  // take scrapped data and write it to a file
  var strResult = JSON.stringify(result);
  //console.log(strResult);
  var parsedResult = JSON.parse(strResult);
  //console.log(parsedResult);
  var formatResult = strResult.replace(/\\n/g, '\n');
  fs.writeFile('./views/worldometers_data.txt', formatResult, {
    encoding: "utf-8"
  }, function(err) {
    if (err) throw (err);
    console.log('Newly fetched data saved in File');
  });
}

module.exports = {update}
