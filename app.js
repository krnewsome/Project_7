const express = require('express');

const app = express();

app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index');
})

const port = 3000

app.listen(port, () => {
  console.log(`The server is running on port ${port}`)
})
