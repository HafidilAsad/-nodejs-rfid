const net = require('net');
const { postDataToServer } = require('./httpService');
const logger = require('../utils/logger');

const createRfidConnection = (locationData, port) => {
  const { host, location } = locationData;

  const client = new net.Socket();
  client.connect(port, host, () => {
    logger.log(`Connected to ${host}:${port} (${location})`);

    // Send heartbeat every 30 seconds
    setInterval(() => {
      client.write("Heartbeat");
    }, 1*1000);
  });

  client.on("data", (data) => {
    try {
      const startChar = String.fromCharCode(data[0]);
      const endChar = String.fromCharCode(data[data.length - 1]);
      const hexString = data.slice(1, -2).toString();
      const decimalValue = parseInt(hexString, 16);
      const rfidHost = `${decimalValue}`;

      logger.log(`RFID Data (${location}): ${startChar}${rfidHost}${endChar}`);
      postDataToServer(rfidHost, location);
    } catch (err) {
      logger.error(`Failed to process data (${location}): ${err.message}`);

    }
  });

  client.on("close", () => {
    logger.log(`Connection closed for ${host} (${location})`);
  });

  client.on("error", (err) => {
    logger.error(`Error for ${host} (${location}): ${err.message}`);
    process.exit(1)
  });
};

module.exports = {
  createRfidConnection
};
