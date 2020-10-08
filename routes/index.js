const express = require('express');
const router = express.Router();
const covid = require('../lib/covid-data');

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    res.render('index', {title: 'COVID-19 Tracker'});
    await covid.update();
  } catch (err) {
    res.status(err)
    console.log("Caught error! " + err.message);
  }
});

module.exports = router;
