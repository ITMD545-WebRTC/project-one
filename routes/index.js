var express = require('express');
var router = express.Router();
const puppeteer = require("puppeteer");
const fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

async function run() {

  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.goto("https://www.worldometers.info/coronavirus/#news");

    const result = await page.evaluate(() => {

      let news = document.querySelector("h2").innerText;
      let newsDate = document.querySelector("h4").innerText;
      let updates = document.querySelector("span.news_category_title").innerText;
      let firstUpdate = document.querySelector("div#newsdate2020-09-23").innerText;
      let secondUpdate = document.querySelector("div#newsdate2020-09-22").innerText;

      return {
        news, newsDate, updates, firstUpdate, secondUpdate
      }

    });

    console.log(result);
    var fs =require('fs');

    fs.writeFile('../views/worldometers_data.txt', JSON.stringify(result),['utf8'],function(err){
      if (err) throw (err);
      console.log('Data Saved in File');
    });
  } catch (error) {
    console.error("Error: " +error.message);
  } finally {
    await browser.close();
  }

}

run();

module.exports = router;
