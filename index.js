const https = require('https');
const fs = require('fs')
const mkdirp = require('mkdirp');
require('dotenv').config()
const { SPREADSHEET } = require('./config')

const en = 'en';
const pl = 'pl';
const languages = [en, pl];

languages.forEach(lang => {
  const dir = `./src/static/locales/${lang}`;
  const path = process.cwd() + `/src/static/locales/${lang}/common.json`
  
  // Check if './src/static/locales/${lang} dir exists
  // Create dir if doesn't exist
  if (!fs.existsSync(dir)){
    mkdirp(`./src/static/locales/${lang}`)
  }
  
  // Remove old translation files
  try {
    fs.accessSync(path)
    fs.unlink(path, (err) => {
      if (err) throw err;
      console.log(`Translation from ${lang} folder deleted!`);
    });
  } catch (e) {
    console.log(`Translation from ${lang} folder not found. Omitting deletion.`)
    return false
  }
})


https.get(`https://spreadsheets.google.com/feeds/list/${SPREADSHEET}/od6/public/values?alt=json`, (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    const feed = JSON.parse(data).feed.entry
    languages.forEach(lang => {
      const obj = {}
      feed.map(row => {
        // throw error when missing translations
        // if (row['gsx$key']['$t'] && !row[`gsx$${lang}`]['$t']) throw new Error(`Missing "${row['gsx$key']['$t']}" key translation for ${lang} language`)
        
        obj[row['gsx$key']['$t']] = row[`gsx$${lang}`]['$t']
        return obj
      })
      // convert obj to json, and append to file
      fs.appendFile(`./src/static/locales/${lang}/common.json`, JSON.stringify(obj,null, 2), (err) => {
        if (err) throw err;
        console.log(`Folder ${lang}, with translation file was saved successfully!`);
      });
    })
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});