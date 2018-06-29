'use strict'

//require
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const timeStamp = require('timestamp-to-date');
const moment = require('moment');
const api = require('./config.js');
const Twit = require('twit');
let tweets = [];
let test = 2;
let messages = [];
/*--------- CLASSES ----------*/

//Friends
class Friend {
  constructor(rlName, userImage, scrName,IdStr ) {
    this.rlName = rlName;
    this.userImage = userImage;
    this.scrName = scrName;
    this.IdStr = IdStr;
  }

}

//Tweets
class Tweets {
  constructor(tweetContent, retweetNum, likesNum, dateOfTweet, profileImage, scrName, retweetCount, timeCreated, userIdString){
    this.tweetContent = tweetContent;
    this.retweetNum = retweetNum;
    this.likesNum = likesNum;
    this.dateOfTweet = dateOfTweet;
    this.profileImage = profileImage;
    this.scrName = scrName;
    this.retweetCount = retweetCount;
    this.timeCreated = timeCreated;
    this.userIdString = userIdString;
  }
}

//Messages
class Messages {
  constructor(messageBody, messageDate, senderID){
    this.messageBody = messageBody;
    this.messageDate = messageDate;
    this.senderID = senderID;
  }


}

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
      let friend = new Friend (data.users[i].name, data.users[i].profile_image_url, data.users[i].screen_name, data.users[i].id_str)
      friendsList.push(friend);
      }
      //get tweet list
      T.get('statuses/user_timeline',{count}, function (err, data, response) {
      let tweetList = [];
      for (let i = 0; i < count; i++) {
        let tweet = new Tweets(data[i].text, data[i].retweet_count, data[i].favorite_count, data[i].created_at, data[i].user.profile_image_url, data[i].user.screen_name, data[i].user.retweet_count, data[i].created_at, data[i].user.id_str)
        tweetList.push(tweet);
      }

      //get message list
      T.get(`direct_messages/events/list`, { count }, function (err, data, response) {
        let directMessages = [];
        let senderIDs = [];
        let imageList = [];
        if (data.events.length < count) {
          for (let i = 0; i < data.events.length; i++) {
            let rawDate = timeStamp(data.events[i].created_timestamp, 'yyyy-MM-dd HH:mm:ss');
            const date = moment(rawDate).startOf('day').fromNow();
            let message = new Messages(data.events[i].message_create.message_data.text, date, data.events[i].message_create.sender_id);
            senderIDs.push(message.senderID);
            directMessages.push(message);
          }

        }else {
          for (let i = 0; i <= count; i++) {
            let rawDate = timeStamp(data.events[i].created_timestamp, 'yyyy-MM-dd HH:mm:ss');
            const date = moment(rawDate).startOf('day').fromNow();
            let message = new Messages(data.events[i].message_create.message_data.text, date, data.events[i].message_create.sender_id)
            senderIDs.push(message.senderID);
            directMessages.push(message);
            T.get('users/show', { user_id: senderIDs[i]}, function (err, data, response) {
              directMessages[i].senderImage = data.profile_image_url;
            });//end of get sender img
          }
        }

        //get imageList
        for (let i = 0; i < senderIDs.length; i++) {
          for (let j = 0; j < friendsList.length; j++) {
            if (friendsList[j].IdStr === senderIDs[i]) {
              directMessages[i].senderImage = friendsList[j].userImage;
            }
          }//end of for loop
        }//end of for loop

        //get friends name
        for (let i = 0; i < senderIDs.length; i++) {
          for (let j = 0; j < friendsList.length; j++) {
            if (friendsList[j].IdStr === senderIDs[i]) {
              directMessages[i].senderRlName = friendsList[j].rlName;
            }
          }//end of for loop
        }//end of for loop

        res.render('index', { tweetList, friendsList, directMessages });
      });//end of get messages
    });//end fo get tweets
  });//end of get followers
});//home page
const port = 3000;

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
})
