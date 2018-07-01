'use strict'

/*--------- REQUIRE ----------*/
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/static', express.static('public'));

app.set('view engine', 'pug');

const mainRoutes = require('./routes');


app.use(mainRoutes);

app.use((req, res, next) => {
  const err = new Error('Sorry, Page Not Found =(...');
  err.status = 404;
  next(err);
});
app.use((err, req, res, next) => {
  res.locals.error = err;
  res.status(err.status);
  res.render('error');
})
/*--------- SERVER ----------*/

const port = 3000;

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
