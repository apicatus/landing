///////////////////////////////////////////////////////////////////////////////
// Primary configuration file                                                //
///////////////////////////////////////////////////////////////////////////////
var os = require("os");

var environments = {
    ///////////////////////////////////////////////////////////////////////////
    // Development options                                                   //
    ///////////////////////////////////////////////////////////////////////////
    'development': {
        sessionSecret: "developmentSecret",
        oAuthServices: {
            github: {
                clientId: "659885325324038a81b3",
                clientSecret: "9e216730e716f898d3803eba0e3a77f28054423f"
            }
        },
        email: {
            user: "",
            password: ""
        },
        environment: process.env.NODE_ENV,
        listenPort: process.env.PORT || 7080,
        ip: process.env.IP || '127.0.0.1',
        baseUrl: 'apicat.us',
        autoStart: true,
        ttl: (1000 * 60 * 100), // 10 minutes
        resetTokenExpiresMinutes: 20,
        mongoUrl: {
            hostname: "paulo.mongohq.com",
            port: 10026,
            username: process.env.MONGO_USER,
            password: process.env.MONGO_PASS,
            name: "",
            db: "apicatus"
        }
    },
    ///////////////////////////////////////////////////////////////////////////
    // Testing options                                                       //
    // Warning: DB must be empty, do not use dev or prod databases           //
    ///////////////////////////////////////////////////////////////////////////
    'test': {
        sessionSecret: "testSecret",
        oAuthServices: {
            github: {
                clientId: "1b147fb22f603248b539",
                clientSecret: "d388480af4a706862f25b9fa493356fac09f7cee"
            }
        },
        email: {
            user: "",
            password: ""
        },
        environment: process.env.NODE_ENV,
        listenPort: process.env.PORT || 7080,
        ip: process.env.IP || os.hostname(),
        baseUrl: 'apicat.us',
        autoStart: false,
        ttl: (1000 * 60 * 100),
        resetTokenExpiresMinutes: 20,
        mongoUrl: {
            hostname: "paulo.mongohq.com",
            port: 10026,
            username: process.env.MONGO_USER,
            password: process.env.MONGO_PASS,
            name: "",
            db: "apicatus"
        }
    },
    ///////////////////////////////////////////////////////////////////////////
    // Production options OpenShift                                          //
    ///////////////////////////////////////////////////////////////////////////
    'production': {
        sessionSecret: process.env.SECRET,
        oAuthServices: {
            github: {
                clientId: "04c495deb650a963c1b7",
                clientSecret: "2a5570677ff43455b6394836612661bec492e525"
            }
        },
        email: {
            user: "",
            password: ""
        },
        environment: process.env.NODE_ENV,
        listenPort: process.env.PORT || 7080,
        ip: process.env.IP || '127.0.0.1',
        baseUrl: 'apicat.us',
        autoStart: true,
        ttl: 3600000,
        resetTokenExpiresMinutes: 20,
        mongoUrl: {
            hostname: "paulo.mongohq.com",
            port: 10026,
            username: process.env.MONGO_USER,
            password: process.env.MONGO_PASS,
            name: "",
            db: "apicatus"
        }
    }
}
module.exports = (function(){
    var env = process.env.NODE_ENV || 'production';
    return environments[env];
})();
