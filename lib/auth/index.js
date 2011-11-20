(function() {
  var everyauth, https;

  everyauth = require('everyauth');

  https = require('https');

  module.exports = function(app, config) {
    var external, normalizeUserData;
    everyauth.debug = config.debug;
    external = config.auth;
    everyauth.everymodule.handleLogout(function(req, res) {
      delete req.session.user;
      req.logout();
      res.writeHead(303, {
        'Location': this.logoutRedirectPath()
      });
      return res.end();
    });
    if ((external != null ? external.facebook : void 0)) {
      everyauth.facebook.appId(external.facebook.appId).appSecret(external.facebook.appSecret).findOrCreateUser(function(session, accessToken, accessTokenExtra, facebookUserMetaData) {
        return true;
      }).redirectPath('/');
    }
    if ((external != null ? external.twitter : void 0)) {
      everyauth.twitter.myHostname(config.server.uri).consumerKey(external.twitter.consumerKey).consumerSecret(external.twitter.consumerSecret).findOrCreateUser(function(session, accessToken, accessSecret, twitterUser) {
        return true;
      }).redirectPath('/');
    }
    if ((external != null ? external.github : void 0)) {
      everyauth.github.myHostname(config.server.uri).appId(external.github.appId).appSecret(external.github.appSecret).findOrCreateUser(function(session, accessToken, accessTokenExtra, githubUser) {
        return true;
      }).redirectPath('/');
    }
    everyauth.helpExpress(app);
    normalizeUserData = function() {
      return function(req, res, next) {
        var user, _ref, _ref2, _ref3;
        if (!((_ref = req.session) != null ? _ref.user : void 0) && ((_ref2 = req.session) != null ? (_ref3 = _ref2.auth) != null ? _ref3.loggedIn : void 0 : void 0)) {
          user = {};
          if (req.session.auth.github) {
            user.image = 'http://1.gravatar.com/avatar/' + req.session.auth.github.user.gravatar_id + '?s=48';
            user.name = req.session.auth.github.user.name;
            user.id = 'github-' + req.session.auth.github.user.id;
          }
          if (req.session.auth.twitter) {
            user.image = req.session.auth.twitter.user.profile_image_url;
            user.name = req.session.auth.twitter.user.name;
            user.id = 'twitter-' + req.session.auth.twitter.user.id_str;
          }
          if (req.session.auth.facebook) {
            user.image = req.session.auth.facebook.user.picture;
            user.name = req.session.auth.facebook.user.name;
            user.id = 'facebook-' + req.session.auth.facebook.user.id;
            return;
          }
          req.session.user = user;
        }
        return next();
      };
    };
    return {
      'middleware': {
        'auth': everyauth.middleware,
        'normalizeUserData': normalizeUserData
      }
    };
  };

}).call(this);
