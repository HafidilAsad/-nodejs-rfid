const { createRfidConnection } = require('../services/rfidService');
const locations = require('../data/location');
const { PORT_HF } = require('../config/dotenv');

const startConnections = () => {
  locations.forEach((locationData) => {
    createRfidConnection(locationData, PORT_HF);
  });
};

module.exports = {
  startConnections
};
