'use strict'

/*--------- REQUIRE ----------*/
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const timeStamp = require('timestamp-to-date');
const moment = require('moment');
const api = require('./config.js');
const Twit = require('twit');
let tweetList = [];
let directMessages = [];
let friendsList = [];
let tweet = {};
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/static', express.static('public'));

const T = new Twit(api);

const count = 5;

app.set('view engine', 'pug');

/*--------- CLASSES ----------*/

//Friends
class Friend {
  constructor(rlName, userImage, scrName, IdStr) {
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
  constructor(messageBody, messageTime, senderID, messageDay) {
    this.messageBody = messageBody;
    this.messageTime = messageTime;
    this.senderID = senderID;
    this.messageDay = messageDay;

  }
}


/*--------- REQUESTS ----------*/

app.get('/', (req, res) => {
  /*--------- POST NEW TWEET ----------*/
  T.post('statuses/update', { status: req.body}, function(err, data, res) {
  });
  //get following list
  T.get('friends/list', { count }, function (err, data, response) {
    for (let i = 0; i < count; i++) {
      let friend = new Friend(data.users[i].name, data.users[i].profile_image_url, data.users[i].screen_name, data.users[i].id_str)
      friendsList.push(friend);
    }

    //get tweet list
    T.get('statuses/user_timeline', { count }, function (err, data, response) {
      for (let i = 0; i < count; i++) {
        let rawDate = new Date(data[i].created_at).toString();
        let date = rawDate.slice(0, 10);
        let tweet = new Tweets(data[i].text, data[i].retweet_count, data[i].favorite_count, data[i].created_at, data[i].user.profile_image_url, data[i].user.screen_name, data[i].user.retweet_count, date, data[i].user.id_str)
        tweetList.push(tweet);
      }

      //get message list
      T.get(`direct_messages/events/list`, { count }, function (err, data, response) {
        let senderIDs = [];
        let imageList = [];
        if (data.events.length < count) {
          for (let i = 0; i < data.events.length; i++) {
            let rawDate = timeStamp(data.events[i].created_timestamp, 'yyyy-MM-dd HH:mm:ss');
            const time = moment(rawDate).startOf('hour').fromNow();
            const day = moment(rawDate).format("MMM Do YY");
            let message = new Messages(data.events[i].message_create.message_data.text, time, data.events[i].message_create.sender_id, day);
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
            T.get('users/show', { user_id: senderIDs[i] }, function (err, data, response) {
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
/*--------- POST NEW TWEET ----------*/

app.post('/', (req, res) => {
    // T.post('statuses/update', { status: req.body.tweet}, function(err, data, res) {
    // });
    let rawDate = new Date().toString();
    let date = rawDate.slice(0, 10);
    tweet = new Tweets(req.body.tweet, '', 0, date, tweetList[0].profileImage, tweetList[0].scrName, '', date, tweetList[0].userIdString);
    console.log(tweet)
    tweetList.pop(tweetList[4]);
    tweetList.unshift(tweet)


      res.render('index', { tweetList, friendsList, directMessages });

});//home page
/*--------- SERVER ----------*/

const port = 3000;

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
