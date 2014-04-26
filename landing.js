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

///////////////////////////////////////////////////////////////////////////////
// Module dependencies.                                                      //
///////////////////////////////////////////////////////////////////////////////
// RUN IN PROD:
// export NODE_ENV=production;export SECRET=mySecret;export MONGO_USER=admin; export MONGO_PASS=admin;node landing.js
var express = require('express'),
    conf = require('./config'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    Account = require('./controllers/account'),
    ejs = require('ejs');

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

    if(conf.autoStart) {
        var mongoUrl = generateMongoUrl(conf.mongoUrl);
        console.log('mongodb connet to', mongoUrl);
        // Connect mongoose
        mongoose.connect(mongoUrl);
        // Check if connected
        mongoose.connection.on('open', function(){
            console.log('mongodb connected to: %s', mongoUrl);
        });
        var server = require('http').createServer(app);
        server.listen(conf.listenPort, conf.ip);
        console.log(conf.listenPort, conf.ip);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Run app                                                                   //
///////////////////////////////////////////////////////////////////////////////
var app = express();

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
app.configure(function() {
    'use strict';

    // Using the .html extension instead of
    // having to name the views as *.ejs
    app.engine('.html', ejs.__express);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: conf.sessionSecret }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    //app.use(express.static(conf.staticPath));
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    'use strict';

    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.logger());
});
app.configure('testing', function() {
    'use strict';

    app.use(express.errorHandler());
});
app.configure('production', function() {
    'use strict';

    app.use(express.errorHandler());
});

///////////////////////////////////////////////////////////////////////////////
// Application rutes                                                         //
///////////////////////////////////////////////////////////////////////////////
// Serve the index page
app.get('/', function(request, response){
    response.render('index', {
        // PLACEHOLDER
        pageTitle: 'Apicatus'
    });
});
app.get('/xxx', ensureAuthenticated, function(request, response) {
    'use strict';
    response.sendfile(conf.staticPath + '/index.html');
});

///////////////////////////////////////////////////////////////////////////////
// User CRUD Methods & Servi                                                 //
///////////////////////////////////////////////////////////////////////////////
/*
app.post('/user/signin', AccountCtl.signIn);
app.get('/user/signout', ensureAuthenticated, AccountCtl.signOut);
app.post('/user', AccountCtl.create);
app.get('/user', ensureAuthenticated, AccountCtl.read);
app.put('/user', ensureAuthenticated, AccountCtl.update);
app.del('/user', ensureAuthenticated, AccountCtl.delete);
app.post('/user/forgot', AccountCtl.resetToken);
app.get('/user/reset/:id/:email', function(req, res) {
    'use strict';

    console.log('GOT IN /reset/:id...');
    var token = req.params.id,
        email = req.params.email,
        messages = flash(null, null);

    if (!token) {
        console.log('Issue getting reset :id');
        //TODO: Error response...
    }
    else {
        console.log('In ELSE ... good to go.');
        //TODO
        //
        //1. find user with reset_token == token .. no match THEN error
        //2. check now.getTime() < reset_link_expires_millis
        //3. if not expired, present reset password page/form
        res.render('resetpass', {email: email});
    }
});
*/
///////////////////////////////////////////////////////////////////////////////
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback
///////////////////////////////////////////////////////////////////////////////

app.get('/auth/github', Account.githubAuth);
app.get('/auth/github/callback', Account.githubAuthCallback);


//app.get('/auth/github', passport.authenticate('github'), function(request, response) {
//    'use strict';
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
//});

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//app.get('/auth/github/callback', passport.authenticate('github', { session: false }), function(request, response) {
//    'use strict';

//    response.json(request.user);
//});
//app.get('/auth/github/callback', AccountCtl.githubCallback);

///////////////////////////////////////////////////////////////////////////////
// socket.io                                                                 //
///////////////////////////////////////////////////////////////////////////////

init();
exports.app = app;
//module.exports = app;

