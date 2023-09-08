const fetch = require('cross-fetch');
const CryptoJS = require('crypto-js');

async function cloud_cookie(host, uuid, password, link) {
    const content_url = new URL(link);
    const url = host + '/get/' + uuid;
    const ret = await fetch(url);
    const json = await ret.json();
    let cookies = [];
    if (json && json.encrypted) {
        const { cookie_data } = cookie_decrypt(uuid, json.encrypted, password);
        for (const key in cookie_data) {
            if (key === content_url.hostname) {
                // merge cookie_data[key] to cookies
                cookies = cookies.concat(
                    cookie_data[key].map((item) => {
                        if (item.sameSite === 'unspecified') item.sameSite = 'Lax';
                        return item;
                    })
                );
            }
        }
    }
    return cookies;
}

function cookie_decrypt(uuid, encrypted, password) {
    const the_key = CryptoJS.MD5(uuid + '-' + password)
        .toString()
        .substring(0, 16);
    const decrypted = CryptoJS.AES.decrypt(encrypted, the_key).toString(CryptoJS.enc.Utf8);
    const parsed = JSON.parse(decrypted);
    return parsed;
}

module.exports = { cloud_cookie };
