everyauth = require 'everyauth'
https = require 'https'

module.exports = ( app, config ) ->
  
  everyauth.debug = config.get 'debug'
  external = config.get 'auth'
  serverUri = config.get 'server:uri'
  
  everyauth.everymodule.handleLogout (req, res) ->
    delete req.session.user
    req.logout()
    # res.redirect()
    res.writeHead(303, { 'Location': @logoutRedirectPath() })
    res.end()
  
  # Facebook
  if (external?.facebook)
    everyauth.facebook.appId(external.facebook.appId)
    .appSecret(external.facebook.appSecret)
    .findOrCreateUser (session, accessToken, accessTokenExtra, facebookUserMetaData) ->
      true
    .redirectPath('/')
  
  # Twitter
  if (external?.twitter)
    everyauth.twitter
    .myHostname(serverUri)
    .consumerKey(external.twitter.consumerKey)
    .consumerSecret(external.twitter.consumerSecret)
    .findOrCreateUser (session, accessToken, accessSecret, twitterUser) ->
      # actually create user here
      true
    .redirectPath('/')
  
  # Github
  if (external?.github)
    everyauth.github
    .myHostname(serverUri)
    .appId(external.github.appId)
    .appSecret(external.github.appSecret)
    .findOrCreateUser (session, accessToken, accessTokenExtra, githubUser) ->
      true
    .redirectPath('/')
  
  everyauth.helpExpress(app)
  
    # Fetch and format data so we have an easy object with user data to work with.
  normalizeUserData = ->
    return (req, res, next) ->
      if ( !req.session?.user && req.session?.auth?.loggedIn)
        # possibly se a switch here
        user = {}
        if (req.session.auth.github)
          user.image = 'http://1.gravatar.com/avatar/'+req.session.auth.github.user.gravatar_id+'?s=48'
          user.name = req.session.auth.github.user.name
          user.id = 'github-'+req.session.auth.github.user.id
          
        if (req.session.auth.twitter)
          user.image = req.session.auth.twitter.user.profile_image_url
          user.name = req.session.auth.twitter.user.name
          user.id = 'twitter-'+req.session.auth.twitter.user.id_str
         
        if (req.session.auth.facebook)
          user.image = req.session.auth.facebook.user.picture
          user.name = req.session.auth.facebook.user.name
          user.id = 'facebook-'+req.session.auth.facebook.user.id
   
          # // Need to fetch the users image...
          # https.get({
          #   'host': 'graph.facebook.com'
          #   'path': '/me/picture?access_token='+req.session.auth.facebook.accessToken
          # }, (response) ->
          #   user.image = response.headers.location
          #   req.session.user = user
          #   next()
          # .on 'error', (e) ->
          #   req.session.user = user
          #   next()
           
          return
         
        req.session.user = user
         
      next()
   
  return {
   'middleware': {
      'auth': everyauth.middleware
      'normalizeUserData': normalizeUserData
    }
  }