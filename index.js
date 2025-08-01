const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const https = require('https');
const fs = require('fs');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

mongoose.set('debug', true);

// Only start the server if not running in serverless environment
if (process.env.AWS_LAMBDA_FUNCTION_NAME === undefined) {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.log('Error connecting to MongoDB', err);
    });

    app.use('/api', routes);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // HTTPS configuration
    const httpsOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH || '/home/ubuntu/ssl-certs/privkey.pem'),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH || '/home/ubuntu/ssl-certs/fullchain.pem')
    };

    https.createServer(httpsOptions, app).listen(port, () => {
        console.log(`HTTPS Server is running on port ${port}`);
    });
}

module.exports = app;