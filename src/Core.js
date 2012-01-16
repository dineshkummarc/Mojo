(function(win, doc) {
  
  "use strict";
  
  var $ = jQuery;

  var mojo = function() {};
  mojo.controllers = {};
  mojo.applications = {};
  mojo.options = {};
  mojo._loaded = [];
  
  mojo.resolve = function resolve(name) {
    if (!mojo._namespace._provided[name]) {
      return name.replace(/\./gi, '/');
    }
    
    return false;
  };
  /*
   * @private
   */
  mojo._namespace = function namespace(namespace) {
    var list = ('' + namespace).split(/\./)
      , listLength = list.length
      , obj = []
      , context = window || {};

    if (!mojo._namespace._provided) mojo._namespace._provided = {};
    
    if (mojo._namespace._provided[namespace] == namespace) throw new Error (namespace + " has already been defined.");


    for (var i = 0; i < listLength; i += 1) {
      var name = list[i];

      if (!context[ name ]) {
        obj[i] = name;
        context[name] = function() {};
        mojo._namespace._provided[obj.join('.')] = context[ name ];
      }
      context = context[ name ];
    }
    return context;
  };

  mojo.template = function template(template, data, partials) {
    if ('undefined' == typeof Mustache) return false;
    if ('undefined' == typeof template || !template) throw new Error("'template' is required");
    if ('undefined' == typeof data || !data) throw new Error("'data' is required");
    return Mustache.to_html(template, data, partials);
  };
  /* 
   * Returns an array of DOM nodes
   */
  mojo.query = function query() {
    if (!arguments.length) { return false; }
    return $.apply(this, arguments);
  };
  /* 
   * Returns the first element in a node list
   */
  mojo.queryFirst = function queryFirst() {
    if (!arguments.length) { return false; }
    var result = mojo.query.apply(this, arguments);
    if (!result.length) { return false; }
    return result[0];
  };
  
  mojo.guid = function guid() {
    var s = [], itoh = '0123456789ABCDEF';

    // Make array of random hex digits. The UUID only has 32 digits in it, but we
    // allocate an extra items to make room for the '-'s we'll be inserting.
    for (var i = 0; i <36; i++) s[i] = Math.floor(Math.random()*0x10);

    // Conform to RFC-4122, section 4.4
    s[14] = 4;  // Set 4 high bits of time_high field to version
    s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence

    // Convert to hex chars
    for (var i = 0; i <36; i++) s[i] = itoh[s[i]];

    // Insert '-'s
    s[8] = s[13] = s[18] = s[23] = '-';

    return s.join('');
  };

  /* 
   * Fetch an array of dependencies, then fire a callback when done
   * @param dependencies {Array}
   * @param callback {Function}
   */
  mojo.require = function require(dependencies, callback) {
    if ('undefined' == typeof dependencies || !dependencies) throw new Error("'dependencies' is required");
    if ('undefined' == typeof callback || !callback) throw new Error("'callback' is required");
    
    if (!$.isArray(dependencies)) dependencies = [ dependencies ];
    
    var last = dependencies.length
      , path
      , callbackIndex = 0; 
      
    var allocated = mojo.controllers;
    for ( var i = 0; i < last; i++ ) {
      var dep = dependencies[i];
      path = mojo.options.baseSrc + mojo.resolve(dep) + ".js";
      mojo._loaded.push(dep);
      $.getScript(path, function() {
        //these are all loaded asynchronously
        callbackIndex++;  //callback counter so we can invoke a resolution event
                          //at the end of loading all dependencies
      });
    }

    var interval = setInterval(function() {
      if(callback && callbackIndex == last) { 
        clearInterval(interval);
        callback.call(this);
      }
    }, 25);
    
  };
  /* 
   * Synchronously load a module
   */
  mojo.requireSync = function requireSync(name) {
    var path = mojo.options.baseSrc + mojo.resolve(name) + ".js";
    $.ajaxSetup({async: false});
    $.getScript(path);
    $.ajaxSetup({async: true});
  };
  /* 
   * Get Controller Reference
   */
  mojo.getController = function getController(controllerName) {
    if ('undefined' == typeof mojo.controllers[controllerName]) return false;
    if ('string' != typeof controllerName) return false;
    return mojo.controllers[controllerName];
  };

  /* 
   * Retrieves a plugin
   * @param path {String} The location of the module on the file system
   * @param callback {Function} A callback to be executed when the plugin has completed loading
   * @deprecated 
   */
  mojo.fetch = function fetch(path, callback) {
    $.getScript(path, function() {
      if (callback) callback.apply(this, arguments);
    });
  };
  /* 
   * Defines a controller into mojo.controller namespace
   * @param id {String} The unique location of a Controller
   * @param factory {Function | Object} A body of a Controller
   */
  mojo.define = function(id, factory) { 
    if ('undefined' == typeof id || !id) throw new Error("'id' is required");
    if ('undefined' == typeof factory || !factory) throw new Error(id + " missing factory implementation");
    if ('function' == typeof factory) {
      factory = factory.call(this, jQuery);
    }
    
    if ('string' != typeof id) return false;
  
    if('string' == typeof id) {
      mojo._namespace( id );
      mojo._loaded[ id ] = factory;
      mojo.controllers[ id ] = factory;
    }    
  };

  /* 
   * Creates an mojo application instance. One web site can contain multiple mojo applications.
   * @param options {Object} A set of default options for particular mojo application
   */
  mojo.create = function create(options) {
    if (arguments.length > 1) throw new Error("Incorrect arguments");
    if ('undefined' == typeof options) {
      options = {};
      if (!options.baseSrc) options.baseSrc = 'js/';
    }
    $.extend(this.options, options);
    return new mojo.Application();
  };
  
  window.mojo = mojo;
   
})(window, document);
