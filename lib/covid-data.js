const https = require("https");
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
      // isolating and grabbing the information in the news section per line
      // gets only the most recent date of updates on the site
      let news_container = document.querySelector("div#news_block"); // container of news section
      let date = news_container.querySelector("div.news_date").innerText; // ex. October 1 (GMT)
      let latest_news = news_container.querySelector("div[id^='newsdate']"); // latest date's news updates
      let list_news = latest_news.querySelectorAll("div.news_post"); // NodeList of all DOM objects that have update info per country

      // we are passing an object of updates
      // and a prettified/formatted version as a string
      let updates_per_country = {}; // object of countries with respective info {"Belgium": "10 new cases and 3 new deaths"}
      let str_update = date + '\n'; // string of updates

      // loops through each country update from the latest date
      list_news.forEach((item, i) => {
        // update object
        let item_str = item.innerText;
        let str_segments = item_str.split(" in ");
        let country = str_segments[1].replaceAll('[source]', '').trim();
        let country_update = str_segments[0];
        updates_per_country[country] = country_update;
        // update string
        // Belgium: 10 new cases and 3 new deaths
        str_update += country + ": " + country_update + '\n';
      });

      // actual json with info on date and countries
      let data = {date, updates_per_country}

      return {
        data,
        str_update
      } // returns the object and string as result
    }) // end of page.evaluate()

    // return object of scraped data
    return result;

  } catch (error) {
    console.error("Error: " + error.message);
  } finally {
    await browser.close();
  }
}

async function update() {
  // get object {data, str_update}
  // result.data is a json object with the date and countries updated info
  // result.str_update is a prettified string which will be used to write to the txt file
  var result = await scrapeData();
  // var update_obj = result.data;
  fs.writeFile('./views/worldometers_data.txt', result.str_update, {
    encoding: "utf-8"
  }, function(err) {
    if (err) throw (err);
    console.log('Newly fetched data saved in File');
  });
}

module.exports = {update}
