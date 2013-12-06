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
g = require("gremlin"),
GoogleStrategy = require('passport-google').Strategy,
stopwords = require('./lists/stopwords.json'),
stopwords = SortedList.create({ unique: true }, stopwords),
colors = {
  "dino": "dino",
  "purple": "purple",
  "sky" : "sky",
  "ocean": "ocean",
  "red" : "red",
  "clay" : "clay",
  "pottery": "pottery",
  "goldfish": "goldfish",
  "chedder": "chedder",
  "gameboy": "gameboy",
  "forest": "forest",
  "frog": "frog",
  "kitchen": "kitchen",
  "turq": "turq"
};

/*
TINKER OBJECT DECLARATION
*/
var T = g.Tokens,
    Direction = g.Direction,
    Type = g.ClassTypes;
var TinkerGraphFactory = g.java.import("com.tinkerpop.blueprints.impls.tg.TinkerGraphFactory");
var graphDB = TinkerGraphFactory.createTinkerGraphSync();

/*
MONGOOSE OBJECT DECLARATION
*/
var u, n, b;//user object, node object, and graph(branch) object


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is serialized
//   and deserialized.
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
    // To keep the example simple, the user's Google profile is returned to
    // represent the logged-in user.  In a typical application, you would want
    // to associate the Google account with a user record in your database,
    // and return that user instead.
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
      maxAge: 60480000 // 7 days
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
var graphSchema = new Schema({
  UID: { type: String, index: true },
  name: String,
  nodes: [String],
  keywords: [String],
  date: Date,
  color: String
});
Graph = mongoose.model('Graph', graphSchema);
Node = mongoose.model('Node', nodeSchema);
User = mongoose.model('User', userSchema);


/*
TRADITIONAL ENDPOINTS
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

app.get('/ping', function(req, res){
  res.status(200);
  res.end();
});

app.get('/demo/jacklondon', function(req, res){
  Node.find({UID: 'JACK_LONDON'}, function(err, data) {
    console.log(data);
    res.write(JSON.stringify(data));
    res.end();
  });
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
        Graph.find({UID: req.session.uid}, function(err, data) {
          req.session.graphs = data;
          console.log(req.session);
          res.redirect('/nb');
        });
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

//GET all user graph data (just graphs, not nodes.)
app.get('/api/:user/graphs', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var nid = req.params.nid;
  var uid = req.session.uid;
  if (user == uid) {
    Graph.find({UID: user}, function(err, data) {
      if (data.length > 0) {
        res.write(JSON.stringify(data));
        res.end();
      } else {
        res.write(JSON.stringify([]));
        res.end();
      }
    });
  } else {
    res.status(400);
    res.end();
  }
});

//GET user graph by gid, including nodes
app.get('/api/:user/graphs/:gid', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var gid = req.params.gid;
  var uid = req.session.uid;
  if (user == uid) {
    Graph.find({UID: user, _id: gid}, function(err, data) {
      if (data.length > 0) {
        Node.find({UID: user}, function(err, nodeData){
          var graphKeywords = data[0].keywords;
          var toReturn = [];
          for (var i = 0; i < nodeData.length; i++) {
            if (matchGraphKeywords(graphKeywords, nodeData[i].keywords)) {
              toReturn.push(nodeData[i]);
            } else {
              for (var j = 0; j < data[0].nodes.length; j++) {
                if (data[0].nodes[j] == nodeData[i]._id) {
                  toReturn.push(nodeData[i]);
                }
              }
            }
          }
          toReturn = toReturn.sort(function(a, b) {
            if (moment(a.date, 'YYYY-MM-DD HH:mm:ss').toDate() > moment(b.date, 'YYYY-MM-DD HH:mm:ss').toDate()) {
              return -1;
            } else {
              return 1;
            }
          });
          res.write(JSON.stringify(toReturn));
          res.end();
        });
      } else {
        res.status(404);
        res.end();
      }
    });
  } else {
    res.status(400);
    res.end();
  }
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

//POST a node to a specific graph, returns all graphs.
app.post('/api/:user/graphs/:graph', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var graph = req.params.graph;
  var nid = req.body._id;
  var uid = req.session.uid;
  if (user == uid) {
    Graph.update({UID: user, _id: graph}, {$addToSet: {nodes: nid}}, {upsert:true}, function(err, data) {
      if (err) {
        res.status(400);
        res.end();
      } else {
        //Return all graphs
        Graph.find({UID: user}, function(err, data) {
          if (data.length > 0) {
            res.write(JSON.stringify(data));
          } else {
            res.status(404);
          }
          res.end();
        });        
      }
    });
  } else {
    res.status(400);
    res.end();
  }
});

//POST a new graph
app.post('/api/:user/graphs', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var uid = req.session.uid;
  if (user == uid) {
    b = new Graph({
      UID: req.session.uid,
      nodes: ((req.body.nodes != undefined) ? req.body.nodes : []),
      date: req.body.date,
      color: req.body.color,
      keywords: ((req.body.keywords != undefined) ? getKeywords(req.body.keywords) : []),
      description: req.body.description,
      name: req.body.name
    });
    b.save(function(err) {
      console.log(b);
      if (err) {
        res.status(404);
      } else {
        res.write(JSON.stringify(b));
      }
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
//DELETE a user and all related nodes, and graphs
app.delete('/api/:user', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var uid = req.session.uid;
  if (user == uid) {
    User.remove({UID: uid}, function(err, data) {
      Graph.remove({UID: uid}, function(err, data) {
        Node.remove({UID: uid}, function(err, data) {
          if (err) {
            console.log(err);
          } else {
            res.status(200);
            res.end();
          }
        });
      });
    });
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
        Graph.update({UID: uid, nodes: nid}, {$pull: {nodes: nid}}, function(err, data) {
          if (err) {
            console.log(err);
            res.status(400);
            res.end();
          } else {
            res.status(200);
            res.end();
          }
        });
      }
      res.end();
    });
  } else {
    res.status(400);
    res.end();
  }
});

//DELETE a specific graph
app.delete('/api/:user/graphs/:gid', ensureAuthenticated, function(req, res) {
  var user = req.params.user;
  var uid = req.session.uid;
  var gid = req.params.gid;
  if (user == uid) {
    Graph.remove({UID: uid, _id: gid}, function(err, data) {
      if (err) {
        console.log(err);
        res.status(400);
        res.end();
      } else {
        res.status(200);
        res.end();
      }
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
    if (req.session.g == false || req.session.g == null || req.session.g == undefined) {
      req.session.g = require('gremlin');
      req.session.g.SetGraph(graphDB);
    }
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
