const config = {
    environment: process.env.NODE_ENV || 'dev',
    server: {
        port: process.env.PORT || 3000,
    },
    browserless_url: process.env.BROWSERLESS_URL || null
};

module.exports = config;
