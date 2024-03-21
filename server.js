const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

//let db = require("./dbConnection");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const routes = require('./routes')
routes(app)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});