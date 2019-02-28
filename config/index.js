const vars = {
  SPREADSHEET: process.env.SPREADSHEET || process.argv[2] === 'oldI18nSupport' ? '127lZtRjV5hqaYQ6twJMagsQmFnSRx0NSyLDayHXyNl4' : '13ctq201NB77AQ5sRf0KMHTNBmxQTePT044Qnxh3IxTQ'
}

module.exports = {
  ...vars
}
