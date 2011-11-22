# attempt to load in different config files for environment settings
# Exg. default.json, your-computers-name.json, development.json, your-computers-name-development.json

OS = require 'os'
nconf = require 'nconf'
path = require 'path'

# config.argv = config.env = true;

configDir = path.resolve __dirname+"/../config/"
  
try
  hostName = OS.hostname()
catch error
  hostName = process.env.HOST || process.env.HOSTNAME
finally
  hostName = hostName.split('.')[0] or null 

# Get the deployment type from NODE_ENV
deployment = process.env.NODE_ENV || 'development';

baseNames = [ 'default', hostName, deployment, hostName + '-' + deployment ]
# baseNames = [  hostName + '-' + deployment, deployment, hostName, 'default' ]

sources = []

load = (file) ->
  if file
    tryFor = path.join configDir, file+".json"
    # don't add if doesn't exist
    if path.existsSync(tryFor)
      sources.push name: file, type:'file', file:tryFor
    
load configFile for configFile in baseNames

config = new nconf.Provider sources: sources

config.load()

module.exports = config