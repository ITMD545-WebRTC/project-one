var express = require('express');
var router = express.Router();
const puppeteer = require("puppeteer")

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
      let firstUpdate = document.querySelector("div.news_post").innerText
      
      return {
        news, newsDate, updates, firstUpdate
      }
      
    });

    console.log(result);
  } catch (error) {
    console.error("Error: " +error.message);
  } finally {
    await browser.close();
  }
  
}

run();

module.exports = router;
