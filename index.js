const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');
const logger = require('./utils/logger');
const { startConnections } = require('./controllers/locationController');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', apiRoutes);

const PORT = process.env.PORT_BE || 5100;



app.listen(PORT, () => {
    logger.log(`Server running on port ${PORT}`);
});

logger.log("Starting RFID connections...");
startConnections();
