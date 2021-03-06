const https = require('https')
const fs = require('fs')
const mkdirp = require('mkdirp')
const StringDecoder = require('string_decoder').StringDecoder

const en = 'en'
const pl = 'pl'
const languages = [en, pl]

const translate = (spreadsheetId) => {
  if (!spreadsheetId) {
    throw new Error('No spreadsheet id provided')
  }
  languages.forEach(lang => {
    let dir
    let path
    if (process.argv[2] === 'oldI18nSupport') {
      dir = `./locales`
      path = process.cwd() + `/locales/${lang}.json`
    } else {
      dir = `./src/static/locales/${lang}`
      path = process.cwd() + `/src/static/locales/${lang}/common.json`
    }

    // Check if './src/static/locales/${lang} dir exists
    // Create dir if doesn't exist
    if (!fs.existsSync(dir)) {
      mkdirp(dir)
    }

    // Remove old translation files
    try {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path)
      }
    } catch (e) {
      throw e
    }
  })

  https
    .get(
      `https://spreadsheets.google.com/feeds/list/${spreadsheetId}/od6/public/values?alt=json`,
      resp => {
        let data = ''
        const decoder = new StringDecoder('utf8')

        // A chunk of data has been recieved.
        resp.on('data', chunk => {
          data += decoder.write(chunk)
        })
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          const feed = JSON.parse(data).feed.entry
          languages.forEach(lang => {
            let filePath =
              process.argv[2] === 'oldI18nSupport'
                ? `./locales/${lang}.json`
                : `./src/static/locales/${lang}/common.json`

            const obj = {}
            feed.map(row => {
              // if (row['gsx$key']['$t'] && !row[`gsx$${lang}`]['$t']) throw new Error(`Missing "${row['gsx$key']['$t']}" key translation for ${lang} language`)

              obj[row['gsx$key']['$t']] = row[`gsx$${lang}`]['$t']
              return JSON.parse(JSON.stringify(obj))
            })
            // convert obj to json, and append to file
            fs.appendFile(filePath, JSON.stringify(obj, null, 2), err => {
              if (err) throw err
            })
          })
        })
      }
    )
    .on('error', err => {
      throw err
    })
}

module.exports = {
  translate
}
