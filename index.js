const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors=require("cors")
const app = express();

require('dotenv').config(); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json()); 
app.use(cors())
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
