const https = require('https')
const fs = require('fs')
const mkdirp = require('mkdirp')
const { SPREADSHEET } = require('./config')

const en = 'en'
const pl = 'pl'
const languages = [en, pl]

languages.forEach(lang => {
  const dir = `./src/static/locales/${lang}`
  const path = process.cwd() + `/src/static/locales/${lang}/common.json`

  // Check if './src/static/locales/${lang} dir exists
  // Create dir if doesn't exist
  if (!fs.existsSync(dir)) {
    mkdirp(`./src/static/locales/${lang}`)
  }

  // Remove old translation files
  try {
    fs.accessSync(path)
    fs.unlink(path)
  } catch (e) {
    throw e
  }
})

https.get(`https://spreadsheets.google.com/feeds/list/${SPREADSHEET}/od6/public/values?alt=json`, (resp) => {
  let data = ''

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk
  })

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    const feed = JSON.parse(data).feed.entry
    languages.forEach(lang => {
      const obj = {}
      feed.map(row => {
        if (row['gsx$key']['$t'] && !row[`gsx$${lang}`]['$t']) throw new Error(`Missing "${row['gsx$key']['$t']}" key translation for ${lang} language`)

        obj[row['gsx$key']['$t']] = row[`gsx$${lang}`]['$t']
        return JSON.parse(JSON.stringify(obj))
      })
      // convert obj to json, and append to file
      fs.appendFile(`./src/static/locales/${lang}/common.json`, JSON.stringify(obj, null, 2), (err) => {
        if (err) throw err
      })
    })
  })
}).on('error', (err) => {
  throw err
})
