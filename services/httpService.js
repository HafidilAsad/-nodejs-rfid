const axios = require('axios');
const { SERVER_URL } = require('../config/dotenv');
const logger = require('../utils/logger');

const postDataToServer = async (rfidHost, location) => {
    try {
        const dataToPost = {
            rfid: rfidHost,
            location: location
        };

        const response = await axios.post(SERVER_URL, dataToPost);

    
        const now = new Date();
        const timestamp = now.toISOString(); 

        logger.log(`[${timestamp}] Data posted to server: ${JSON.stringify(response.data)}`);
    } catch (error) {
        const now = new Date();
        const timestamp = now.toISOString(); 

        logger.error(`[${timestamp}] Error posting data to server (${rfidHost}): ${error.message}`);
    }
};


module.exports = {
    postDataToServer
}