const config = {
    environment: process.env.NODE_ENV || 'dev',
    server: {
        port: process.env.PORT || 3000,
    },
    BROWSERLESS_HOST: process.env.BROWSERLESS_HOST || null,
    BROWSERLESS_TOKEN: process.env.BROWSERLESS_TOKEN || null,
    COOKIE_CLOUD_HOST: process.env.COOKIE_CLOUD_HOST || null,
    COOKIE_CLOUD_UUID: process.env.COOKIE_CLOUD_UUID || null,
    COOKIE_CLOUD_PASSWORD: process.env.COOKIE_CLOUD_PASSWORD || null,
};

module.exports = config;
