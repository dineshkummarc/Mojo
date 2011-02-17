describe("Controller", function() {
  var controller
    , element = $("#an-element")
    , params = { user: 'jbueza'};
    
  beforeEach(function() {
    controller = new Controller();
    controller.initialize(element, 'TestController', params);
  });

  it("should create a Mojo Controller", function() { 
    expect(controller.controllerClass).toEqual('TestController');
  });
  
  it("should have a context element associated to it", function() {
    expect(controller.contextElement).toBeDefined();
  });
  
  it("should have a controller name", function() { 
    expect(controller.controllerClass).toEqual('TestController');
  });
  
  it("should return a context element when callling getContextElement()", function() { 
    expect(controller.getContextElement()).toBeDefined();
  });
  
  describe("events", function() {
    
    it("should have an 'onInit' event", function() { 
      expect(controller.onInit).toBeDefined();
    });
  });
  
  describe("parameters", function() {
    it("should be able to have optional parameters associated with it", function() { 
      expect(controller.params.user).toEqual('jbueza');
    });
  });


});
