'use strict'

//require
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const api = require('./config.js');
const Twit = require('twit');
let tweets = [];
let friendsList = [];
let messages = [];

//
app.use(bodyParser.urlencoded({extended: false}));

app.use('/static',express.static('public'));

const T = new Twit(api)


app.set('view engine', 'pug')

app.get('/', (req, res) => {
  T.get('friends/list',{count: 5}, function (err, data, response) {
    let friend = {
      rlName: data.users[1].name
    };
    // friendsList.push(friend)
  res.render('index', {friend})

    // friends.image = ;

    // friends.scName = ;
  })

})


//get tweet info
// T.get('friends/list',{count: 5}, function (err, data, response) {
//   tweets.content = ;
//   tweets.retweetNum.rlName = data.users[1].name;
//   tweets.likesNum = ;
//   tweets.datesTweeted = ;
// })
//get friends info

//
// //get messages info
// T.get('friends/list',{count: 5}, function (err, data, response) {
//   messages.body = ;
//   messages.dateSent = ;
//   messages.timeSent = ;
// })


const port = 3000

app.listen(port, () => {
  console.log(`The server is running on port ${port}`)
})
