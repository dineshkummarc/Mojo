(function(win, doc) {
  
  "use strict";
  
  var $ = jQuery;

  var mojo = function() {};
  mojo.controllers = {};
  mojo.applications = {};
  mojo.options = {};
  mojo._loaded = [];
  
  mojo.resolve = function(name) {
    if (!mojo._namespace._provided[name]) {
      return name.replace(/\./gi, '/');
    }
    
    return false;
  };
  /*
   * @private
   */
  mojo._namespace = function(namespace) {
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
  /* 
   * Returns an array of DOM nodes
   */
  mojo.query = function() {
    return $.apply(this, arguments);
  };
  /* 
   * Returns the first element in a node list
   */
  mojo.queryFirst = function() {
    return mojo.query.apply(this, arguments)[0];
  };

  /* 
   * Fetch an array of dependencies, then fire a callback when done
   * @param dependencies {Array}
   * @param callback {Function}
   */
  mojo.require = function(dependencies, callback) {
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
  
  mojo.fetch = function(path, callback) {
    $.getScript(path, function() {
      if (callback) callback.apply(this, arguments);
    });
  };

  mojo.define = function(id, factory) { 
    if ('undefined' == typeof id || !id) throw new Error("'id' is required");
    if ('undefined' == typeof factory || !factory) throw new Error(id + " missing factory implementation");
    if ('function' == typeof factory) {
      factory = factory.call(this);
    }
    if('string' == typeof id) {
      mojo._namespace( id );
      mojo._loaded[ id ] = factory;
      mojo.controllers[ id ] = factory;
    }    
  };

  mojo.create = function(options) {
    
    if ('undefined' == typeof options) {
      options = {};
      if (!options.baseSrc) options.baseSrc = 'js/';
    }
    $.extend(this.options, options);
    return new Application();
  };
  
  window.mojo = mojo;
   
})(window, document);
