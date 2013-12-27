/*
DEPENDENCIES
*/
var express = require('express'),
// httpProxy = require('http-proxy'),
passport = require('passport'),
env = (function(){
  var Habitat = require('habitat');
  Habitat.load();
  return new Habitat();
} ()),
Email = require('email').Email,
util = require('util'),
fs = require('fs'),
mongoose = require('mongoose'),
moment = require('moment'),
SortedList = require("sortedlist"),
natural = require('natural'),
tokenizer = new natural.WordTokenizer();
GoogleStrategy = require('passport-google').Strategy,
stopwords = SortedList.create({ unique: true }, require('./lists/stopwords.json'));

/*
MONGOOSE OBJECT DECLARATION
*/
var u, n, f;//user object, node object, and filter object


// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the GoogleStrategy within Passport.
passport.use(new GoogleStrategy({
    returnURL: env.get("RETURN_URL"),
    realm: env.get("REALM")
  },
  function(identifier, profile, done) {
    profile.identifier = identifier;
    console.log('');
    console.log(identifier);
    console.log(profile);
    console.log('');
    return done(null, profile);
  }
));



//Declaring and configuring the actual application.
var app = express();
app.configure(function() {
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({
    secret: env.get("SESSION_SECRET"),
    cookie: {
      maxAge: 1209600
    }
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.csrf());
  app.use(express.static(__dirname + '/ui'));
});

/*
MONGO DATASTRUCTURE
*/
var Schema = mongoose.Schema;
var userSchema = new Schema({
  displayName: String,
  emails: [String],
  name: {
    familyName: String,
    givenName: String
  },
  UID: { type: String, index: { unique: true } }
});
var nodeSchema = new Schema({
  UID: { type: String, index: true },
  text: String,
  keywords: [String],
  date: String
});
var filterSchema = new Schema({
  UID: { type: String, index: true },
  name: String,
  nodes: [String],
  keywords: [String],
  date: Date
});
Filter = mongoose.model('Filter', filterSchema);
Node = mongoose.model('Node', nodeSchema);
User = mongoose.model('User', userSchema);


/*
HARD-CODED ENDPOINTS
*/
app.get('/', function(req, res){
  res.send(fs.readFileSync('ui/home.html', {encoding: 'utf8'}));
});

app.get('/nb', ensureAuthenticated, function(req, res){
  res.cookie('uid', req.session.uid, { maxAge: 900000, httpOnly: false});
  res.send(fs.readFileSync('ui/app.html', {encoding: 'utf8'}));
});

app.get('/seed', function(req, res){
  res.send(fs.readFileSync('ui/seed.html', {encoding: 'utf8'}));
});

app.get('/signin', function(req, res){
  res.send(fs.readFileSync('ui/signin.html', {encoding: 'utf8'}));
});

app.get('/terms', function(req, res){
  res.send(fs.readFileSync('ui/terms.html', {encoding: 'utf8'}));
});

app.get('/goodbye', function(req, res){
  res.send(fs.readFileSync('ui/goodbye.html', {encoding: 'utf8'}));
});

// GET /auth/google
app.get('/auth/google', 
  passport.authenticate('google', { failureRedirect: '/signin' }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/google/return
app.get('/auth/google/return', 
  passport.authenticate('google', { failureRedirect: '/signin' }),
  function(req, res) {
    req.session.uid = req.session.passport.user.identifier.split('=')[1];
    User.find({UID: req.session.uid}, function(err, data) {
      //If user doesnt exist, create user.
      if (data.length == 0) {
        var obj = {
          displayName: req.session.passport.user.displayName,
          name: {
            familyName: req.session.passport.user.name.familyName,
            givenName: req.session.passport.user.name.givenName
          },
          emails: [],
          UID: req.session.uid
        };
        for (var i = 0; i< req.session.passport.user.emails.length; i++) {
          obj.emails.push(req.session.passport.user.emails[i].value);
        }
        u = new User(obj);
        u.save(function(err) {
          console.log(err);
          res.redirect('/nb');
        });
      } else {
        res.redirect('/nb');
      }
    });
  });

app.get('/signout', function(req, res){
  req.logout();
  res.redirect('/');
});


/*
API ENDPOINTS
*/
//GET requests------------------------------------------------------------
//GET standard user information
app.get('/api/:user', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  User.find({UID: user}, function(err, data) {
    if (data.length == 1) {
      res.write(JSON.stringify(data[0]));
    } else {
      res.status(404);
    }
    res.end();
  });
});

//GET user nodes, all of them
app.get('/api/:user/nodes', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var uid = req.session.uid;
  if (user == uid) {
    Node.find({UID: uid}, function(err, data) {
      if (data.length > 0) {
        data = data.sort(function(a, b) {
          if (moment(a.date, 'YYYY-MM-DD HH:mm:ss').toDate() > moment(b.date, 'YYYY-MM-DD HH:mm:ss').toDate()) {
            return -1;
          } else {
            return 1;
          }
        });
        res.write(JSON.stringify(data));
      } else {
        res.write(JSON.stringify([]));
      }
      res.end();
    });
  } else {
    res.status(400);
  }
});

//GET user node by nid
app.get('/api/:user/nodes/:nid', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var nid = req.params.nid;
  var uid = req.session.uid;
  if (user == uid) {
    Node.find({UID: user, _id: nid}, function(err, data) {
      if (data.length > 0) {
        res.write(JSON.stringify(data));
      } else {
        res.status(404);
      }
    });
  } else {
    res.status(400);
  }
  res.end();
});

//POST requests------------------------------------------------------------
//POST a single node for a single user
app.post('/api/:user/nodes', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var uid = req.session.uid;
  if (user == uid) {
    var keywords = getKeywords(req.body.text);
    n = new Node({
      text: req.body.text,
      UID: req.session.uid,
      keywords: keywords,
      date: req.body.date
    });
    n.save(function(err) {
      if (err) {
        res.status(404);
      } else {
        res.write(JSON.stringify(n));
      }
      res.end();
    });
    
  } else {
    res.status(400);
    res.end();
  }
});

//POST query for nodes
app.post('/api/:user/query', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var uid = req.session.uid;
  if (user == uid) {
    var query = getKeywords(req.body.query);
    Node.find({UID: uid, keywords: { $in: query }}, function(err, data) {
      res.write(JSON.stringify(data));
      res.end();
    });
  } else {
    res.status(400);
    res.end();
  }
});

//POST feedback
app.post('/api/feedback', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var mail = new Email(
  {
    from: "feedback@nodebookfeedback.com",
    to: "benjvogt@gmail.com",
    subject: "Nodebook Feedback",
    body: req.body.feedback.toString()
  });
  mail.send();
  res.status(200);
  res.end();
});


//PUT requests------------------------------------------------------------

//PUT node data for a specific node
app.put('/api/:user/nodes/:nid', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var nid = req.params.nid;
  var uid = req.session.uid;
  if (user == uid) {
    var keywords = getKeywords(req.body.text);
    Node.update({UID: user, _id: nid}, {$set:{text: req.body.text, keywords: keywords, date: req.body.date}}, {upsert:true}, function(err, data) {
      if (err) {
        res.status(404);
      } else {
        var data = {
          _id: nid,
          UID: user,
          text: req.body.text,
          keywords: keywords,
          date: req.body.date
        };
        res.write(JSON.stringify(data));
      }
      res.end();
    });
  } else {
    res.status(400);
    res.end();
  }
});

//DELETE requests------------------------------------------------------------
//DELETE a user and all related objects
app.delete('/api/:user', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var uid = req.session.uid;
  if (user == uid) {
    //@TODO: delete everything here.
  }
});

//DELETE a specific node
app.delete('/api/:user/nodes/:nid', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var uid = req.session.uid;
  var nid = req.params.nid;
  if (user == uid) {
    Node.remove({UID: uid, _id: nid}, function(err, data) {
      if (err) {
        console.log(err);
        res.status(400);
      } else {
        res.write(JSON.stringify({_id: nid}));
      }
      res.end();
    });
  } else {
    res.status(400);
    res.end();
  }
});


/*
START THE APPLICATION
-connect to mongo
-list on port 3000
*/
mongoose.connect('mongodb://localhost/nodehub');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  app.listen(3000);
  console.log("Server started. Listening on port 3000.");
});


/*
MIDDLEWARE
*/
//Ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/signin')
  }
}

//When given a block of text will strip down to keywords
function getKeywords(text) {
  var words = tokenizer.tokenize(text);
  words = SortedList.create({ unique: true }, words);
  words = words.toArray();
  for (var i = 0; i < words.length; i++) {
    words[i] = words[i].toLowerCase();
  }
  //Eliminating unfavorable words.
  for (var i = 0; i < words.length; i++) {
    if (words[i].match(/^[A-Za-z]+$/) === null || stopwords.key(words[i]) !== null || words[i].length == 1) {  
      delete words[i];
    }
  }
  words = words.filter(function(element, index, array) {
    if (words[index] !== null && words[index] !== undefined) {
      return words[index];
    }
  });
  return words;
}

function matchGraphKeywords(keywords, others) {
  var match = false;
  for (var i = 0; i < keywords.length; i++) {
    for (var j = 0; j < others.length; j++) {
      if (keywords[i] == others[j]) {
        match = true;
        break;
      }
    }
  }
  return match;
}
