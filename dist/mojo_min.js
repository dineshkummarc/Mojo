(function(c,b){var a=function(){};a.controllers={};a.applications={};a.options={};a._loaded=[];a._resolvedNamespace=function(d){return a._namespace._provided[""+d];};a.resolve=function(d){if(!a._namespace._provided[d]){return d.replace(/\./gi,"/");}return false;};a._namespace=function(g){var h=(""+g).split(/\./),k=h.length,j=[],f=window||{};if(!a._namespace._provided){a._namespace._provided={};}if(a._namespace._provided[g]==g){throw new Error(g+" has already been defined.");}for(var e=0;e<k;e+=1){var d=h[e];if(!f[d]){j[e]=d;f[d]=function(){};a._namespace._provided[j.join(".")]=f[d];}f=f[d];}return f;};a.query=function(){return jQuery.apply(this,arguments);};a.queryFirst=function(){return a.query.apply(this,arguments)[0];};a.require=function(h,l){if("undefined"==typeof h||!h){throw new Error("'dependencies' is required");}if("undefined"==typeof l||!l){throw new Error("'callback' is required");}if(!$.isArray(h)){h=[h];}var k=h.length,m,g=0;var d=a.controllers;for(var f=0;f<k;f++){var j=h[f];m=a.options.baseSrc+a.resolve(j)+".js";a._loaded.push(j);$.getScript(m,function(){g++;});}var e=setInterval(function(){if(l&&g==k){clearInterval(e);l.call(this);}},25);};a.fetch=function(d,e){$.getScript(d,function(){if(e){e.apply(this,arguments);}});};a.define=function(e,d){if("undefined"==typeof e||!e){throw new Error("'id' is required");}if("undefined"==typeof d||!d){throw new Error(e+" missing factory implementation");}if("function"==typeof d){d=d.call(this);}if(typeof e=="string"){if(a.controllers.hasOwnProperty(e)){throw new Error(e+" controller already exists");return false;}a._namespace(e);a._loaded[e]=d;a.controllers[e]=d;}};a.create=function(e,d){if(typeof d=="undefined"){d={};if(!d.baseSrc){d.baseSrc="js/";}}$.extend(this.options,d);return new Application();};window.MOJO=a;})(window,document);MOJO.define("Request",function(){function a(e,b,d,c){if("undefined"==typeof e||!e){throw new Error("'paramsObj' is required");}if("undefined"==typeof b||!b){throw new Error("'callerObj' is required");}if("undefined"==typeof d||!d){throw new Error("'eventObj' is required");}if("undefined"==typeof c||!c){throw new Error("'controllerObj' is required");}this.paramsObj=e;this.callerObj=b;this.eventObj=d;this.controllerObj=c;}a.prototype.getController=function(){return this.controllerObj;};a.prototype.getContextElement=function(){return this.getController().getContextElement();};a.prototype.getCaller=function(){return this.callerObj;};a.prototype.getEvent=function(){return this.eventObj;};window.Request=a;return a;});MOJO.define("Controller",function(){function a(){this.contextElement=null;this.controllerClass=null;this.events;}a.prototype.onInit=function(){};a.prototype.onParamChange=function(){};a.prototype.params={};a.prototype.initialize=function(c,d,e){var b=this;b.contextElement=c;b.controllerClass=d;if("undefined"!=typeof e||!e){b.params=e;}$(b.events).each(function(j,i){var g=$(document),l=i[0],f=i[1],h=i[2],k=i[3];if(l=="context"){g=$(c);}$(g).delegate(f,h,function(m){var n=new Request($(this).data()||{},this,m,b);if(typeof b.before!="undefined"&&typeof b.before[k]!="undefined"){b.before[k].call(b,n);}b.methods[k].call(MOJO.controllers[d],n);if(typeof b.after!="undefined"&&typeof b.after[k]!="undefined"){b.after[k].call(b,n);}});});b.onInit();};a.prototype.getContextElement=function(){if(!this.contextElement){return null;}return this.contextElement;};a.prototype.param=function(b,c){if("undefined"==typeof this.params){this.params={};}if(arguments.length>1){this.params[b]=c;this.onParamChange();return this;}else{return this.params[b];}};window.Controller=a;return a;});MOJO.define("Application",function(){function d(){if(!this.options){this.options={};}var g=this,h=g.options;h.locale="en_CA";h.plugins=[];h.pluginSrc="js/lib/plugins/";h.pluginsAsync=true;h.environment="dev";h.selector=jQuery||(function(){throw new Error("Unable to find jQuery");})();g.siteMap=[];}d.prototype.onComplete=function(){};d.prototype.configure=function(g,i){if(arguments.length>1){this.options[g]=i;if(this.options.environment=="dev"){try{console.info("Configure: ",g," -> ",i);}catch(h){}}return this;}else{return this.options[g];}};d.prototype.map=function c(g,j){var h=this;var i=$(g);i.each(function(k,l){h.siteMap.push({context:l,init:j});});if("function"==typeof j){j.call(this,h);}return this;};d.prototype.setupController=function b(h,g,l){if("undefined"==typeof h||!h){throw new Error("'context' is a required parameter");}if("undefined"==typeof g||!g){throw new Error("'controller' is a required parameter");}var j=$(h);var i=MOJO.controllers[g];var k=new Controller(),i=$.extend(i,i.methods),i=$.extend(i,k);MOJO.controllers[g]=i;if(typeof i=="undefined"){throw new Error("Undefined Controller @ ",g);}i.initialize(h,g,l);if("undefined"==typeof h.mojoControllers){h.mojoControllers=[];}h.mojoControllers.push({controller:i});if(typeof i.after!="undefined"&&i.after.Start!="undefined"){i.after.Start.call(i,null);}};d.prototype.disconnectController=function e(h,g){if("undefined"==typeof h||!h){throw new Error("'node' is a required parameter");}if("undefined"==typeof g||!g){throw new Error("'controller' is a required parameter");}$(h).unbind().undelegate();delete $(h)[0].mojoControllers;return this;};d.prototype.disconnectControllers=function f(h){var g=this;$(this.siteMap).each(function(i,j){$(j.context).unbind().undelegate();delete $(j.context)[0].mojoControllers;});if("undefined"!=typeof h&&"function"==typeof h){h.apply(this);}};d.prototype.connectControllers=function a(){var g=this,h=[];$(g.siteMap).each(function(j,i){var k;if("function"==typeof i.init){k=i.init.call(this);}else{k=i.init;}$(k).each(function(l,m){if(!MOJO.controllers.hasOwnProperty(m.controller)){h.push(m.controller);}else{MOJO._loaded[m.controller]=m.controller;}});});if(g.options.environment=="dev"){MOJO.require($.unique(h),function(){$(g.siteMap).each(function(j,i){if(g.options.environment=="dev"){try{console.log("Mapping ["+j+"]: ",i.context);}catch(l){}}var k=("function"==typeof i.init)?i.init.call(this):i.init;$(k).each(function(m,n){g.setupController(i.context,n.controller,n.params);});});});}};d.prototype.getPlugins=function(i){var g=this,h=g.options.pluginSrc;if(!g.options.pluginsAsync){$.ajaxSetup({async:false});}$(g.options.plugins).each(function(j,k){MOJO.fetch(h+k+".js");});if(!g.options.pluginsAsync){$.ajaxSetup({async:true});}if("undefined"!=typeof i&&"function"==typeof i){i.call(g);}};d.prototype.start=function(){var g=this;$(document).ready(function(){g.disconnectControllers(function(){if(g.options.plugins.length){g.getPlugins(function(){g.connectControllers();});}else{g.connectControllers();}g.onComplete();});});};d.prototype.remap=function(){var g=this;g.disconnectControllers(function(){g.connectControllers();g.onComplete();});};("undefined"==typeof window)?process.Application=d:window.Application=d;window.Application=d;return d;});MOJO.define("Service",function(){function a(c,d,b){if(typeof b=="undefined"){b={};}var e={method:b.method||function(){var f="get";if(c.match(/^get/i)){f="get";}else{if(c.match(/^add|del|update/i)){f="post";}}return f;}(),template:false};this.name=c;this.uri=d;this.options=$.extend({},e,b);}a.prototype.invoke=function(g,i,e){var b=this;var d=this.getOptions()||{},h=d.method,f=b.getURI(),c=d.responseType||"JSON";if(d.template){f=b.parse(f,g);if(h=="get"){g=null;}}$.ajaxSetup({dataTypeString:c,type:h,async:d.async||"true",cache:d.cache||"false",contentType:d.contentType||"application/json; charset=utf-8"});$.ajax({url:f,data:g}).success(function(j){if(c=="JSON"&&this.contentType.match(/javascript/g)){j=$.parseJSON(j);}if("undefined"!=typeof i){if(typeof i=="function"){i.call(e,null,j);}else{e[i](null,j);}}}).error(function(){if("undefined"!=typeof i){i.call(e,"Unable to execute XHR",arguments);}});};a.prototype.getName=function(){return this.name;};a.prototype.getURI=function(){return this.uri;};a.prototype.getOptions=function(){return this.options;};a.prototype.option=function(){if(arguments.length>1){this.options[arguments[0]]=arguments[1];return this;}else{return this.options[arguments[0]];}};a.prototype.parse=function(b,c){$.each(c,function(d,e){b=b.split("{"+d+"}").join(e);});return b;};window.Service=a;return a;});MOJO.define("ServiceLocator",function(){var a={services:{},addService:function(b){this.services[b.name]=b;return this;},getService:function(b){return this.services[b];},removeService:function(b){delete this.services[b];},removeServices:function(){this.services={};}};window.ServiceLocator=a;return a;});