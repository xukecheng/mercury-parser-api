const Router = require('express').Router;
const router = new Router();
const Parser = require('@postlight/parser');
const puppeteer = require('puppeteer');
const config = require('./config');
const ParserCustomizer = require('./customizer');
const { cloud_cookie } = require('./tools');
const he = require('he'); // 引入 he 库

ParserCustomizer.customize(Parser);

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
            let html;
            let parserBody;

            const contentType = req.query.contentType || 'html';
            let headers = new Object();
            if (typeof req.query.headers !== 'undefined') {
                headers = JSON.parse(req.query.headers);
            }
            if (config.BROWSERLESS_HOST !== null && config.BROWSERLESS_TOKEN !== null && req.query.browserless) {
                console.log('Server in browserless');
                browser = await puppeteer.connect({
                    browserWSEndpoint: `ws://${config.BROWSERLESS_HOST}/?token=${config.BROWSERLESS_TOKEN}`,
                });
                // Fetch the HTML of the URL using Puppeteer
                const page = await browser.newPage();
                await page.setUserAgent(
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36 Edg/81.0.416.64'
                );

                if (
                    config.COOKIE_CLOUD_HOST !== null &&
                    config.COOKIE_CLOUD_UUID !== null &&
                    config.COOKIE_CLOUD_PASSWORD !== null &&
                    req.query.cloud_cookie
                ) {
                    const cookies = await cloud_cookie(
                        config.COOKIE_CLOUD_HOST,
                        config.COOKIE_CLOUD_UUID,
                        config.COOKIE_CLOUD_PASSWORD,
                        req.query.url
                    );

                    if (cookies.length > 0) {
                        console.log('add cookies');
                        await page.setCookie(...cookies);
                    } else {
                        console.log('no cookies');
                    }
                }
                await page.goto(req.query.url, {
                    timeout: req.query.timeout || '10000',
                    waitUntil: 'networkidle2',
                });
                html = await page.content();
                browser.close();
                parserBody = {
                    html,
                    contentType,
                    headers,
                };
            } else {
                console.log('Server in no browserless');
                parserBody = {
                    contentType,
                    headers,
                };
            }

            // Pass the HTML to the Mercury.parse function
            result = await Parser.parse(req.query.url, parserBody);

            // 解码 HTML 实体
            result.content = he.decode(result.content);
        } catch (error) {
            result = { error: true, messages: error.message };
        }
    }
    return res.json(result);
});

router.route('/parse-html').post(async (req, res) => {
    let result = { message: 'Invalid request body, both url and html are required' };
    if (req.body.url && req.body.html) {
        try {
            result = await Parser.parse(req.body.url, {
                html: req.body.html,
            });
        } catch (error) {
            result = { error: true, messages: error.message };
        }
    }
    return res.json(result);
});

module.exports = router;
