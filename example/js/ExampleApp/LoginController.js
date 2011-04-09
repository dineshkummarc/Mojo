/* 
 * @class   Login Controller
 * @author  Jaime Bueza
 */
MOJO.define('ExampleApp.LoginController', {
  events: [
      ['context', '.btn-login', 'click', 'Login']
    , ['context', '.btn-logout', 'click', 'Logout']    
  ],
  methods: {
    Login: function(requestObj) {
      var context = requestObj.getContextElement();
      
      console.log(this);
      alert("Logged in from " + this.controllerClass);
    },
    Logout: function(requestObj) {
      alert("Logged out from " + this.controllerClass);
    }
  },
  after: {
    Start: function() {
      //Initialization
    }
  }
});