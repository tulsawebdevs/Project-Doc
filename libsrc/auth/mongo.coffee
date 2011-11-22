mongoose = require 'mongoose'
Schema = mongoose.Schema
mongooseAuth = require('mongoose-auth')

UserSchema = new Schema
  "registered":
    "type" : Date
    "index" : true

module.exports = (app,config) ->
  
  # everyauth.debug = config.get 'debug'
  external = config.get 'auth'
  serverUri = config.get 'server:uri'
  
  UserSchema.plugin mongooseAuth, 
    debug: config.get 'debug'
    everymodule:
      everyauth:
        User: ->
          User
    twitter:
      everyauth:
        myHostname: serverUri
        consumerKey: external.twitter.consumerKey
        consumerSecret: external.twitter.consumerSecret
        redirectPath: "/"
    github:
      everyauth:
        myHostname: serverUri
        appId: external.github.appId
        appSecret: external.github.appSecret
        redirectPath: "/"
  
  mongooseAuth.helpExpress app
  
  mongoose.model 'User', UserSchema
  User = mongoose.model 'User'
  
  return{
    user: User
    middleware: mongooseAuth.middleware
  }