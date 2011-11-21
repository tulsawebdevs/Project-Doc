# Server requirements
express = require 'express'
path = require 'path'
config = require 'config'

# Create server
app = module.exports = express.createServer()

root = path.resolve __dirname + "/../"

# Static directories
public = root + '/public'
publicsrc = root + '/publicsrc'

auth = require('./auth')(app,config)

app.configure( ->
  app.set 'views', path.resolve __dirname + '/../views'
  app.set 'view engine', 'jade'
  app.set 'view options', {layout: true}
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.cookieParser()
  app.use express.session({
    secret: 'hgk83kc0qdm298xn'
    store: new express.session.MemoryStore
  })
  
  app.use auth.middleware.auth()
  app.use auth.middleware.normalizeUserData()
  
  app.use express.compiler(
    src: publicsrc
    dest: public
    enable: ['coffeescript']
  )
  app.use app.router
  app.use express.static path.resolve __dirname + '/../public'
)

app.configure 'development', ->
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))

app.configure 'production', ->
  app.use express.errorHandler()
  
app.dynamicHelpers {
  session: (req, res) ->
    return req.session;
}

app.get '/', (req, res) ->
  console.log 'Connect.sid ', req.cookies['connect.sid']
  res.render('home', {
    title: 'ORLY'
  })

# steps app
Steps = require('./steps')
steps = new Steps.App
steps.createServer app

# Catch uncaught exceptions
process.on 'uncaughtException', (err) ->
  console.log('\u0007') #ringy dingy
  console.error err
  console.log err.stack
  
app.listen( process.env.PORT || config.server.port || 9000 )
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env)

