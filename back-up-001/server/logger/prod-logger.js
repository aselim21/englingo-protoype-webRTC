const winston = require('winston')
const { format, transports } = winston
const path = require('path');
require('winston-mongodb');

const logFormat = format.printf(info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`)

function buildProdLogger() {
    return winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.label({ label: path.basename(process.mainModule.filename) }),
    format.timestamp(),
    // Format the metadata object
    format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      )
    }),
    new transports.MongoDB({
        db : 'mongodb+srv://englingo-admin:admin123@cluster0.enlfp.mongodb.net/englingo-matches?retryWrites=true&w=majority',
        useUnifiedTopology: true ,
        collection: 'logs'
    })
  ],
  exitOnError: false
})
}

module.exports = buildProdLogger;