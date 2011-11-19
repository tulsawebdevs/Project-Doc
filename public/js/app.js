(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _.templateSettings = {
    escape: /\{\{(.+?)\}\}/g,
    interpolate: /\{\-\{(.+?)\}\}/g,
    evaluate: /\{\=\{(.+?)\}\}/g
  };

  $(function() {
    var Skull, StepCollection, StepItem, StepItemView, StepView, UserSettings, UserView, sio;
    Skull = require('skull');
    StepItem = (function() {

      __extends(StepItem, Skull.Model);

      function StepItem() {
        StepItem.__super__.constructor.apply(this, arguments);
      }

      StepItem.prototype.initialize = function() {
        var _this = this;
        return this.bind('remove', function() {
          if (_this.view) return _this.view.remove();
        });
      };

      return StepItem;

    })();
    StepCollection = (function() {

      __extends(StepCollection, Skull.Collection);

      function StepCollection() {
        StepCollection.__super__.constructor.apply(this, arguments);
      }

      StepCollection.prototype.url = '/steps';

      StepCollection.prototype.model = StepItem;

      return StepCollection;

    })();
    StepItemView = (function() {

      __extends(StepItemView, Backbone.View);

      function StepItemView() {
        this.render = __bind(this.render, this);
        this.startEdit = __bind(this.startEdit, this);
        this.titleClicked = __bind(this.titleClicked, this);
        StepItemView.__super__.constructor.apply(this, arguments);
      }

      StepItemView.prototype.template = _.template($('#step-item').html());

      StepItemView.prototype.tagName = 'section';

      StepItemView.prototype.events = {
        'click .title': 'titleClicked'
      };

      StepItemView.prototype.initialize = function() {
        var _this = this;
        this.model.view = this;
        this.model.bind('change', this.render);
        this.model.bind('locked', function(lockedByMe) {
          if (lockedByMe) return;
          return $(_this.el).addClass('locked');
        });
        return this.model.bind('unlocked', function() {
          return $(_this.el).removeClass('locked');
        });
      };

      StepItemView.prototype.titleClicked = function() {
        var _this = this;
        return this.model.tryLock('edit', function(err) {
          if (!err) {
            return _this.startEdit();
          } else {
            return alert('Lock error');
          }
        });
      };

      StepItemView.prototype.startEdit = function() {
        var input, title;
        var _this = this;
        title = this.$('.title');
        input = this.$('.edit-title');
        title.hide();
        return input.show().unbind().blur(function() {
          input.hide();
          _this.$('.title').show();
          return _this.model.unlock();
        }).keyup(function(e) {
          var text;
          if (e.keyCode === 13) {
            text = $.trim(input.val());
            if (text.length) {
              return _this.model.save({
                title: text
              });
            }
          }
        }).focus().val(this.model.get('title'));
      };

      StepItemView.prototype.render = function() {
        $(this.el).html(this.template({
          item: this.model.toJSON()
        }));
        return this;
      };

      return StepItemView;

    })();
    StepView = (function() {

      __extends(StepView, Backbone.View);

      function StepView() {
        this.addOne = __bind(this.addOne, this);
        this.addAll = __bind(this.addAll, this);
        this.changed = __bind(this.changed, this);
        StepView.__super__.constructor.apply(this, arguments);
      }

      StepView.prototype.initialize = function() {
        var _this = this;
        this.collection.bind('add', this.addOne);
        this.collection.bind('reset', this.addAll);
        this.collection.bind('all', this.changed);
        this.collection.fetch();
        this.list = this.$('.step-items');
        this.input = this.$('input.new-step');
        this.input.keyup(function(e) {
          var text;
          e.preventDefault();
          e.stopPropagation();
          console.log(e);
          console.log(e.keyCode);
          if (e.keyCode === 13) {
            text = $.trim(_this.input.val());
            if (text.length) {
              _this.collection.create({
                title: _this.input.val(),
                duration: 0
              });
              _this.input.val('');
            }
          }
          return false;
        });
        return this.changed();
      };

      StepView.prototype.changed = function() {};

      StepView.prototype.addAll = function() {
        return this.collection.each(this.addOne);
      };

      StepView.prototype.addOne = function(model) {
        var rendered, view;
        view = new StepItemView({
          model: model
        });
        rendered = view.render().el;
        console.log(rendered);
        return this.list.append(rendered);
      };

      return StepView;

    })();
    UserSettings = (function() {

      __extends(UserSettings, Skull.Model);

      function UserSettings() {
        UserSettings.__super__.constructor.apply(this, arguments);
      }

      UserSettings.prototype.url = '/mySettings';

      return UserSettings;

    })();
    UserView = (function() {

      __extends(UserView, Backbone.View);

      function UserView() {
        this.render = __bind(this.render, this);
        this.hideEdit = __bind(this.hideEdit, this);
        this.showEdit = __bind(this.showEdit, this);
        UserView.__super__.constructor.apply(this, arguments);
      }

      UserView.prototype.el = $('.settings');

      UserView.prototype.initialize = function() {
        var input;
        var _this = this;
        this.model.bind('change', this.render);
        this.$('.user-name').click(this.showEdit);
        input = this.$('.user-name-edit');
        input.blur(this.hideEdit).keyup(function(e) {
          var text;
          if (e.keyCode === 13) {
            text = $.trim(input.val());
            if (text.length) {
              _this.model.save({
                name: text
              });
            }
            return _this.hideEdit();
          }
        });
        return this.model.fetch();
      };

      UserView.prototype.showEdit = function() {
        this.$('.user-name').hide();
        return this.$('.user-name-edit').val(this.model.get('name')).show().focus();
      };

      UserView.prototype.hideEdit = function() {
        this.$('.user-name-edit').hide();
        return this.$('.user-name').show();
      };

      UserView.prototype.render = function() {
        return this.$('.user-name').text(this.model.get('name'));
      };

      return UserView;

    })();
    sio = io.connect();
    return sio.on('connect', function() {
      var app, clientNS, globalNS, models, userSettings, userView;
      console.log('Connected to server');
      clientNS = Skull.createClient(sio.of('/app'));
      globalNS = Skull.createClient(sio.of('/global'));
      models = {};
      models['steps'] = clientNS.addModel(new StepCollection);
      userSettings = globalNS.addModel(new UserSettings);
      app = new StepView({
        collection: models['steps'],
        el: $('#steps')
      });
      return userView = new UserView({
        model: userSettings
      });
    });
  });

}).call(this);
