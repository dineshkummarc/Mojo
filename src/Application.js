/*
 * Application Class
 *
 * Class representation of your application where you're provided
 * with the capability to inject plugins, as well as, handle
 * dependencies. Also maps all controllers to DOM elements.
 * 
 * @author Jaime Bueza
 */
mojo.define('mojo.Application', function() {

"use strict";

var $ = jQuery;

function Application() {
  if (!this.options) this.options = {};
  
  var self = this, localOptions = self.options;
    localOptions['locale'] = 'en_CA';
    localOptions['plugins'] = [];
    localOptions['pluginSrc'] = 'js/lib/plugins/';
    localOptions['pluginsAsync'] = true;
    localOptions['environment'] = 'dev';
    localOptions['logging'] = false;
    localOptions['selector'] = jQuery || (function() { throw new Error('Unable to find jQuery'); }) ();
    self.siteMap = [];
};
/* 
 * Triggered when application is fully bootstrapped
 */
Application.prototype.onComplete = function() {};

/* 
 * Provides the capability to set/get properties of the application, such as,
 * logging, plugins, mode (dev/prod)
 * 
 * @param key { String }
 * @param value { Object }
 *
 * Additionally, you can get a property from the application by specifying only the key
 * app.configure('logging') 
 *
 * @returns application instance { Object }
 */
Application.prototype.configure = function configure(key, value) {
  
  if ( !arguments.length ) throw new Error("passing no parameters into configure() is invalid");
  if ( arguments.length > 2 ) throw new Error("passing too many parameters into configure() is invalid");
  
  if (arguments.length > 1) {
    this.options[key] = value;
    if (this.options.environment == 'dev' && ('undefined' != typeof this.options.logging && this.options.logging)) try { console.info("Configure: ", key, " -> ", value); } catch(err) {}
    return this;
  } else {
    return this.options[key];
  }
};
/* 
 * Reads the css selector from a map and executes the callback, which is actually 
 * just a function that returns an array of controllers with parameters
 * 
 * @param selector { String | HTML Element } 
 * @param callback { Function }
 * 
 */
Application.prototype.map = function map(selector, callback) {
  
  if ( 'undefined' == typeof selector || !selector ) throw new Error("'selector' is a required parameter");
  if ( 'undefined' == typeof callback || !callback ) throw new Error("'callback' is a required parameter");
  if ( 'string' != typeof selector ) throw new Error("'selector' needs to be a String");
  if ( $.isArray(callback) && callback.length === 0 ) throw new Error("'callback' is an array and is required to have controllers") 
  
  if ( $.isArray(callback) ) {
    $(callback).each(function(index, controller) {
      if (!controller.hasOwnProperty('controller')) throw new Error("'callback' must contain only Mojo Controller objects");
    });
    
  }
  
  var self = this;
  var elements = $(selector);
  elements.each(function(index, item) {
    self.siteMap.push({ context: item, init: callback });
  });
  
  if ('function' == typeof callback) callback.call(this, self);
  return this;
};

Application.prototype.setupController = function setupController(context, controller, params) {
  if ( 'undefined' == typeof context || !context ) throw new Error("'context' is a required parameter");
  if ( 'undefined' == typeof controller || !controller ) throw new Error("'controller' is a required parameter");
  
  var sizzleContext = $(context);

  var controllerObj = mojo.controllers[controller];
  var abstractController = new mojo.Controller()
    , controllerObj = $.extend(controllerObj, controllerObj.methods)
    , controllerObj = $.extend(controllerObj, abstractController);
  mojo.controllers[controller] = controllerObj;
  
  if ( typeof controllerObj == 'undefined') throw new Error("Undefined Controller @ ", controller);
  controllerObj.initialize(context, controller, params);
  if('undefined' == typeof context.mojoControllers) context.mojoControllers = [];
  context.mojoControllers.push({controller: controllerObj});
  if (typeof controllerObj.after != 'undefined' && controllerObj.after['Start'] != 'undefined') { 
    controllerObj.after['Start'].call(controllerObj, null);
  }

  if ('undefined' != typeof controllerObj.methods['Initialize']) {
    controllerObj.methods['Initialize'].call(controllerObj);
  }
  
};

Application.prototype.disconnectController = function disconnectController(node, controller) {
  if ( 'undefined' == typeof node || !node ) throw new Error("'node' is a required parameter");
  if ( 'undefined' == typeof controller || !controller ) throw new Error("'controller' is a required parameter");
  $(node).unbind().undelegate();
  if ('undefined' != typeof $(node)[0].mojoControllers) delete $(node)[0].mojoControllers;
  return this;
};
Application.prototype.disconnectControllers = function disconnectControllers(callback) {
  var self = this;
  $(this.siteMap).each(function(index, silo) {
    $(silo.context).unbind().undelegate();
    if ('undefined' != typeof $(silo.context)[0].mojoControllers) delete $(silo.context)[0].mojoControllers;
  });
  if ('undefined' != typeof callback && 'function' == typeof callback) callback.apply(this);
};

Application.prototype.connectControllers = function connectControllers() {
  var self = this
    , controllers2load = [];
    
  $(self.siteMap).each(function(index, mapping) {
    var silos;
    if ('function' == typeof mapping.init ) { 
      silos = mapping.init.call(this);
    } else {
      silos = mapping.init;
    }
    
    $(silos).each(function(i, silo) {
      if (!mojo.controllers.hasOwnProperty(silo.controller)) { 
        controllers2load.push(silo.controller);
      } else {
        mojo._loaded[silo.controller] = silo.controller;
      }
    });
  });
  
  mojo.require($.unique(controllers2load), function() {
    $(self.siteMap).each(function(index, mapping) {
    
      if (self.options.environment == 'dev' && self.options.logging) {
        try { console.log("Mapping [" + index + "]: ", mapping.context); } catch (err) {}
      } 
      var silos = ('function' == typeof mapping.init ) ? mapping.init.call(this) : mapping.init;

      $(silos).each(function(i, silo) {
        self.setupController(mapping.context, silo.controller, silo.params);
      });
      
      mojo.Messaging.publish("/app/start");
    
    });      
  });
};

Application.prototype.getPlugins = function(callback) {
   var self = this, path = self.options.pluginSrc;
   
   if (!self.options.pluginsAsync) $.ajaxSetup({async: false});
   $(self.options.plugins).each(function(index, plugin) {
     mojo.fetch(path + plugin + ".js");
   });
   if (!self.options.pluginsAsync) $.ajaxSetup({async: true});
   if ('undefined' != typeof callback && 'function' == typeof callback) callback.call(self);
};

/* 
 * Starts the application instance by fetching all plugins, fetching all controllers,
 * mapping the controllers to dom nodes, as well as, emits onComplete
 */
Application.prototype.start = function start() {
  var self = this;
  $(document).ready(function() {
    self.disconnectControllers(function() {
      if (self.options.plugins.length) { 
        self.getPlugins(function() {
          mojo.Messaging.publish("/app/plugins/loaded");
          self.connectControllers();
        });
      } else {
        self.connectControllers();
      }
      self.onComplete();
    });
  });
  
};

Application.prototype.remap = function remap() {
  var self = this;
  self.disconnectControllers(function() {
    self.connectControllers();
    self.onComplete();
  });
};

window.mojo.Application = Application;
if (window.MOJO) window.MOJO.Application = Application;

});
