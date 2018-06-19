'use strict'

//require
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const api = require('./config.js');
const Twit = require('twit');
let tweets = [];

let messages = [];

/*--------- CLASSES ----------*/

//Friends
class Friend {
  constructor(rlName, userImage, scName){
    this.rlName = rlName;
    this.userImage = userImage;
    this.scName = scName;
  }
}

//Tweets
class Tweets {
  constructor(tweetContent, retweetNum, likesNum, dateOfTweet){
    this.tweetContent = tweetContent;
    this.retweetNum = retweetNum;
    this.likesNum = likesNum;
    this.dateOfTweet = dateOfTweet;
  }

//Messages
class Messages {
  constructor(messageBody, messageDate, messageTime){
    this.messageBody = messageBody;
    this.messageDate = messageDate;
    this.messageTime = messageTime;
  }
//
app.use(bodyParser.urlencoded({extended: false}));

app.use('/static',express.static('public'));

const T = new Twit(api)

const count = 5;

app.set('view engine', 'pug')

app.get('/', (req, res) => {
  //get following list
  T.get('friends/list',{count}, function (err, data, response) {
    let friendsList = [];
    for (let i = 0; i < count; i++){
      let friend = new Friend (data.users[i].name, data.users[i].profile_image_url, data.users[i].screen_name)
      friendsList.push(friend);
      }

  res.render('index', {friendsList})
  })

})

const port = 3000

app.listen(port, () => {
  console.log(`The server is running on port ${port}`)
})
