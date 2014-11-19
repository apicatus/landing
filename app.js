///////////////////////////////////////////////////////////////////////////////
// @file         : landing.js                                                //
// @summary      : Landing page application                                  //
// @version      : 0.1                                                       //
// @project      : Apicatus                                                  //
// @description  : Landing site, user signup and signin                      //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 18 Apr 2014                                               //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2013~2014 Benjamin Maggi <benjaminmaggi@gmail.com>              //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////


var conf = require('./config'),
    express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    errorhandler = require('errorhandler'),
    path = require('path'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    Account = require('./controllers/account'),
    http = require('http'),
    https = require('https'),
    jade = require('jade'),
    fs = require('fs');

// Globals
var app = express();
var router = express.Router();
var DB = null;
////////////////////////////////////////////////////////////////////////////////
// Mongo URL generator                                                        //
////////////////////////////////////////////////////////////////////////////////
var generateMongoUrl = function(conf) {
    'use strict';

    if(conf.username && conf.password) {
        return 'mongodb://' + conf.username + ':' + conf.password + '@' + conf.hostname + ':' + conf.port + '/' + conf.db;
    }
    else{
        return 'mongodb://' + conf.hostname + ':' + conf.port + '/' + conf.db;
    }
};
////////////////////////////////////////////////////////////////////////////////
// MongoDB Connection setup                                                   //
////////////////////////////////////////////////////////////////////////////////
var init = function() {
    'use strict';

    var mongoUrl = null;
    var server = null;
    // In some test context it may be a good idea to init the service
    // from whitin the test unit instead
    if(conf.autoStart) {
        mongoUrl = generateMongoUrl(conf.mongoUrl);
        ///////////////////////////////////////////////////////////////////////////////
        // Connect mongoose                                                          //
        ///////////////////////////////////////////////////////////////////////////////
        DB = mongoose.connect(mongoUrl);
        ///////////////////////////////////////////////////////////////////////////////
        // Start listening prod HTTP or HTTPS                                        //
        ///////////////////////////////////////////////////////////////////////////////
        if(conf.ssl) {
            conf.ssl.key = fs.readFileSync(conf.ssl.key);
            conf.ssl.cert = fs.readFileSync(conf.ssl.cert);
            server = https.createServer(conf.ssl, app).listen(conf.listenPort, conf.ip);
        } else {
            server = http.createServer(app).listen(conf.listenPort, conf.ip);
        }
        console.log('connected to: %s:%s', conf.ip, conf.listenPort);
        return server;
    }
};

////////////////////////////////////////////////////////////////////////////////
// Mongoose event listeners                                                   //
////////////////////////////////////////////////////////////////////////////////
mongoose.connection.on('open', function() {
    'use strict';
    console.log('mongodb connected');
});
mongoose.connection.on('error', function(error) {
    'use strict';
    console.log('mongodb connection error: %s', error);
});
// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    'use strict';
    console.log('Mongoose default connection disconnected');
});

// reusable middleware to test authenticated sessions
function ensureAuthenticated(request, response, next) {
    'use strict';

    var token = request.headers.token;

    if(token) {
        AccountMdl.verify(token, function(error, isValid) {
            if(error || !isValid) {
                response.statusCode = 403;
                response.json({error: 'Invalid token !'});
            } else {
                return next();
            }
        });
    } else {
        console.log("req:", request.accepts('html'));
        if(request.accepts('html')) {
            console.log("llego x html");
            response.redirect(conf.baseUrl + '/login');
            //response.contentType('text/html');
            //response.sendfile(conf.staticPath + '/index.html');
        } else {
            response.statusCode = 403;;
            response.json({error: 'No auth token received !'});
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
// Configuration                                                             //
///////////////////////////////////////////////////////////////////////////////
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('title', 'Runner');
// Body Parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
// Cookie Parser
app.use(cookieParser());
// Sessions
app.use(session({
    secret: conf.sessionSecret,
    saveUninitialized: true,
    resave: true
}));
// Passport
app.use(passport.initialize());
app.use(passport.session());

/// Jade to HTML on fly middleware
app.use(function (req, res, next) {
    if ( /\.html$/i.test(req.url) ) {
        var jadeFile = path.join(process.cwd(), 'views', req.url.replace(/\.html$/i, '.jade'));
        console.log("jade: ", jadeFile)

        if (fs.existsSync(jadeFile)) {
            res.send( jade.renderFile( jadeFile ) );

        } else {
            next();
        }
    } else {
        next();
    }
});
// Static files
app.use(express.static(path.join(__dirname, 'public')));

///////////////////////////////////////////////////////////////////////////////
// Setup environments                                                        //
///////////////////////////////////////////////////////////////////////////////
switch(process.env.NODE_ENV) {
    case 'development':
        app.use(errorhandler({ dumpExceptions: true, showStack: true }));
        //app.use(express.logger());
    break;
    case 'test':
        app.use(errorhandler());
    break;
    case 'production':
        app.use(errorhandler());
    break;
}

///////////////////////////////////////////////////////////////////////////////
// Application rutes                                                         //
///////////////////////////////////////////////////////////////////////////////
// Serve the index page
app.get('/', function(request, response){
    response.render('index');
});

///////////////////////////////////////////////////////////////////////////////
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback
///////////////////////////////////////////////////////////////////////////////

app.get('/auth/github', Account.githubAuth);
app.get('/auth/github/callback', Account.githubAuthCallback);

///////////////////////////////////////////////////////////////////////////////
// Init the APP
///////////////////////////////////////////////////////////////////////////////
exports.app = init();

///////////////////////////////////////////////////////////////////////////////
// Gracefully Shuts down the workers.                                        //
///////////////////////////////////////////////////////////////////////////////
process
    .on('SIGTERM', function () {
        'use strict';

        console.log('SIGTERM');
        exports.app.close(function () {
            console.log("express terminated");
            mongoose.connection.close(function () {
                console.log("mongodb terminated");
                process.exit(0);
            });
        });
    })
    .on('SIGHUP', function () {
        //killAllWorkers('SIGTERM');
        //createWorkers(numCPUs * 2);
    })
    .on('SIGINT', function() {
        'use strict';

        console.log('SIGINT');
        exports.app.close(function () {
            mongoose.connection.close(function () {
                process.exit(1);
            });
        });
    });

