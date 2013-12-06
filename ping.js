var http = require('http'),
request = require("request"),
moment = require("moment")
Email = require('email').Email;


var ip = 'http://144.89.178.165';
ip ='http://localhost:3000'
var errorCounter = 0;
var serverDown = false;


setInterval(function() {
  request(ip + '/ping', function(error, response, body) {
    //Increment error counter
    if (error) {
      errorCounter++;
    }   
    
    //If 5 errors, server is down
    if (error > 5 && error < 20) {
      console.log('SERVER DOWN');
      // var mail = new Email(
      // {
      //   from: "nodebookdown@nodebookdown.com",
      //   to: "19208506785@vtext.com",
      //   subject: "Nodebook Server Down",
      //   body: moment()
      // });
      // mail.send();
    }
  });
}, 6000);