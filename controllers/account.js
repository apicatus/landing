///////////////////////////////////////////////////////////////////////////////
// @file         : account.js                                                //
// @summary      : account controller                                        //
// @version      : 0.1                                                       //
// @project      : Node.JS + Express boilerplate for cloud9 and appFog       //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Dec 2012                                               //
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

// Controllers
var conf = require('../config'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    Mailer = require('../services/mailer'),
    GitHubStrategy = require('passport-github').Strategy;

// Load model
var account_schema = require('../models/account'),
    Account = mongoose.model('Account', account_schema);

// Github API
var GitHubApi = require("github");
var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: true,
    timeout: 5000
});

///////////////////////////////////////////////////////////////////////////////
// passport session setup & strategy                                         //
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// To support persistent login sessions, Passport needs to be able to        //
// serialize users into and deserialize users out of the session. Typically, //
// this will be as simple as storing the user ID when serializing, and       //
// finding the user by ID when deserializing.                                //
///////////////////////////////////////////////////////////////////////////////

passport.use(Account.createStrategy());
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

///////////////////////////////////////////////////////////////////////////////
// Route to Account signin                                                   //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON Account                                             //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /account/signin                                                  //
///////////////////////////////////////////////////////////////////////////////
exports.signIn = function(request, response, next) {
    'use strict';

    passport.authenticate('local', { session: false }, function(error, user) {
        if (error) {
            response.statusCode = 500;
            return next(error);
        }
        if (user) {
            Account.createUserToken(user.email, function(error, userAndToken) {
                if (error || !userAndToken) {
                    response.statusCode = 500;
                    response.json({error: 'Error generating token'});
                } else {
                    response.json(userAndToken);
                }
            });
        } else {
            response.statusCode = 401;
            return response.json({error: 'unauthorized'});
        }
    })(request, response, next);
};

///////////////////////////////////////////////////////////////////////////////
// Route to get currently authenticated Account                              //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON authenticated account                               //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /account/getAccount                                              //
///////////////////////////////////////////////////////////////////////////////
exports.read = function(request, response, next) {
    'use strict';

    if (request.user.email) {
        // Marshall the user object
        return response.json({
            _id: request.user._id,
            username: request.user.username,
            email: request.user.email,
            name: request.user.name,
            lastName: request.user.lastName,
            country: request.user.country,
            city: request.user.city,
            timeZone: request.user.timeZone,
            avatar: request.user.avatar,
            company: request.user.company,
            birthDate: request.user.birthDate,
            createdAt: request.user.createdAt,
            updatedAt: request.user.updatedAt,
            digestors: request.user.digestors
        });
    } else {
        response.statusCode = 500;
        response.json({error: 'Error decoding api token.'});
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to create a new Account                                             //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON newly created account                               //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /account/createAccount                                           //
///////////////////////////////////////////////////////////////////////////////
exports.create = function(request, response, next) {
    'use strict';

    response.contentType('application/json');
    var username = request.body.username;
    Account.findOne({username: username}, function(error, user) {
        if (error) {
            response.statusCode = 500;
            return next(error);
        } else if (user) {
            response.statusCode = 409;
            return response.json({error: "existingUser", message: 'User already exists'});
        }
        var account = new Account({ username : request.body.username, email: request.body.email});
        account.setPassword(request.body.password, function(error) {
            if (error) {
                response.statusCode = 500;
                return next(error);
            }
            account.save(function(error, account) {
                if (error || !account) {
                    response.statusCode = 500;
                    return response.json({error: "faultSave", message: 'Cannot save user'});
                }
                response.statusCode = 201;
                return response.json(account);
            });
        });
    });
};


exports.resetToken = function(request, response, next) {
    'use strict';

    if (request.body.email) {
        Account.generateResetToken(request.body.email, function(error, user) {
            if(error || !user) {
                response.statusCode = 500;
                return next();
            } else {
                var token = user.reset_token;
                var resetLink = 'http://' + conf.baseUrl + '/reset/'+ token + '/' + user.email;

                //TODO: This is all temporary hackish. When we have email configured
                //properly, all this will be stuffed within that email instead :)
                var message = 'To reset your password follow the url below.\n' + resetLink + '\nIf you did not request your password to be reset please ignore this email and your password will stay as it is.';
                var template = '<h2>Reset Email (simulation)</h2><br><p>To reset your password click the URL below.</p><br>' +
                '<a href=' + resetLink + '>' + resetLink + '</a><br>' +
                'If you did not request your password to be reset please ignore this email and your password will stay as it is.';

                Mailer.sendTemplate(message, template, "Password Reset", ['benjaminmaggi@gmail.com']);
                response.statusCode = 200;
                return response.json({"title": "sucess", "message": "Password reset email sent", "status": "ok"});
            }
        });
    } else {
        response.statusCode = 404;
        response.json({error: 'Missing email.'});
    }
};

///////////////////////////////////////////////////////////////////////////////
// Use the GitHubStrategy within Passport.                                   //
// Strategies in Passport require a `verify` function, which accept          //
// credentials (in this case, an accessToken, refreshToken, and GitHub       //
// profile), and invoke a callback with a user object.                       //
///////////////////////////////////////////////////////////////////////////////
passport.use(new GitHubStrategy({
        clientID: conf.oAuthServices.github.clientId,
        clientSecret: conf.oAuthServices.github.clientSecret,
        //callbackURL: "http://" + conf.baseUrl + ":" + conf.listenPort + "/auth/github/callback",
        callbackURL: "http://apicat.us/auth/github/callback",
        scope: ['user']
    },
    function(accessToken, refreshToken, profile, done) {
        'use strict';

        // OAuth2
        github.authenticate({
            type: "oauth",
            token: accessToken
        });
        github.user.getEmails({}, function(error, emails) {
            console.log("email from github:", JSON.stringify(emails));
            // Get Primary Address
            var primary = emails.filter(function(email){
                return email.primary;
            })[0];

            console.log("primary: ", primary)

            var user = {
                username: profile.username,
                email: primary.email,
                avatar: profile._json.avatar_url,
                company: profile._json.company,
                country: profile._json.location,
                oAuth: {
                    token: accessToken
                }
            };
            console.log("user: ", user);
            Account.findOrCreate({ email: user.email }, user, function (error, user) {
                return done(error, user);
            });
        });
    }
));


exports.githubAuth = function(request, response, next) {
    'use strict';
    passport.authenticate('github', function(request, response, next) {
        // The request will be redirected to GitHub for authentication, so this
        // function will not be called.
    })(request, response, next);
};

exports.githubAuthCallback = function(request, response, next) {
    'use strict';

    passport.authenticate('github', { session: false }, function(error, user) {
        if (error) {
            response.statusCode = 500;
            return next(error);
        }
        if (user) {
            //console.log("githubAuthCallback user:", JSON.stringify(request.user, null, 4));
            Account.createUserToken(user.email, function(error, user) {
                if (error || !user) {
                    response.statusCode = 500;
                    response.json({error: 'Issue generating token'});
                } else {
                    response.cookie('token', user.token.token, { maxAge: 900000, httpOnly: false, domain: 'apicat.us'});
                    response.redirect('http://app.apicat.us/');
                }
            });
        } else {
            response.statusCode = 401;
            return response.json({error: 'unauthorized'});
        }
    })(request, response, next);
};

