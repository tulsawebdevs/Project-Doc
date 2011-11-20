(function() {
  var Steps, app, auth, config, express, path, public, publicsrc, root, steps;

  express = require('express');

  path = require('path');

  config = require('config');

  app = module.exports = express.createServer();

  root = path.resolve(__dirname + "/../");

  public = root + '/public';

  publicsrc = root + '/publicsrc';

  auth = require('./auth')(app, config);

  app.configure(function() {
    app.set('views', path.resolve(__dirname + '/../views'));
    app.set('view engine', 'jade');
    app.set('view options', {
      layout: true
    });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
      secret: 'hgk83kc0qdm298xn',
      store: new express.session.MemoryStore
    }));
    app.use(auth.middleware.auth());
    app.use(auth.middleware.normalizeUserData());
    app.use(express.compiler({
      src: publicsrc,
      dest: public,
      enable: ['coffeescript', 'less']
    }));
    app.use(app.router);
    return app.use(express.static(path.resolve(__dirname + '/../public')));
  });

  app.configure('development', function() {
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.configure('production', function() {
    return app.use(express.errorHandler());
  });

  app.dynamicHelpers({
    session: function(req, res) {
      return req.session;
    }
  });

  app.get('/', function(req, res) {
    console.log('Connect.sid ', req.cookies['connect.sid']);
    return res.render('home', {
      title: 'ORLY'
    });
  });

  Steps = require('./steps');

  steps = new Steps.App;

  steps.createServer(app);

  process.on('uncaughtException', function(err) {
    console.log('\u0007');
    console.error(err);
    return console.log(err.stack);
  });

  app.listen(process.env.PORT || config.server.port || 9000);

  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

}).call(this);
