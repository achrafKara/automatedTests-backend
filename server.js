const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const {
  MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT,
} = process.env;

const app = express();

// use when starting application as docker container
const mongoUrlDocker = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/automatedTestsDB?authSource=admin`;

const mongoClientOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false,
};

mongoose.connect(
  mongoUrlDocker,
  mongoClientOptions,
).then(() => console.log('\x1b[32m successfully connected to DB\x1b[0m')).catch((e) => console.log(e));

app.enable('trust proxy');

// allow CORS
app.use(cors({
  origin: ['http://localhost:3031', 'http://localhost:80', 'http://localhost'],
}));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.json({ Welcome: 'welcome people' });
  console.log('instance running');
});

app.use(require('./controllers/exec'));

// Static files
// app.use(express.static('./images'));
// app.use(express.static('./translations'));

app.listen(3000, console.log(`\x1b[33m Server started on port: 3000\x1b[0m`));
