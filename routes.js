const Router = require('express').Router;
const router = new Router();
const Parser = require('@postlight/parser');
const puppeteer = require('puppeteer');
const config = require('./config');


router.route('/').get((req, res) => {
  res.json({
    message: 'Welcome to 🚀mercury-parser-api API! Endpoint: /parser',
  });
});

router.route('/parser').get(async (req, res) => {
  let result = { message: 'No URL was provided' };

  if (req.query.url) {
    try {
      let browser;

      if (config.browserless_url !== null) {
        browser = await puppeteer.connect({
          browserWSEndpoint: config.browserless_url,
        });
      } else {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'], });
      }

      // Fetch the HTML of the URL using Puppeteer
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36 Edg/81.0.416.64"
      );
      await page.goto(req.query.url, { "timeout": "10000", "waitUntil": 'networkidle2', });
      const html = await page.content();
      browser.close();

      // Pass the HTML to the Mercury.parse function
      const contentType = req.query.contentType || 'html';
      let headers = new Object();
      if (typeof req.query.headers !== 'undefined') {
        headers = JSON.parse(req.query.headers);
      }
      result = await Parser.parse(req.query.url, {
        html,
        contentType,
        headers,
      });

    } catch (error) {
      result = { error: true, messages: error.message };
    }
  }
  return res.json(result);
});

module.exports = router;
