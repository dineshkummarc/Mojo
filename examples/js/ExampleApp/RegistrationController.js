/* 
 * @class   Registration Controller
 * @author  Jaime Bueza
 */
MOJO.define('ExampleApp.RegistrationController', {
  events: [
      ['context', '.btn-submit-registration', 'click', 'Register']
    , ['dom', '.btn-test-outside', 'click', 'Register']
  ],
  commands: {
    Register: function(requestObj) {
      var context = requestObj.getContextElement();
      alert("REGISTER from " + this.controllerClass);
    }
  }
});