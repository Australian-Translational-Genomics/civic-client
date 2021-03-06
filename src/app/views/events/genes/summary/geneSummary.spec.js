'use strict';
/*jshint expr:true */
describe('geneSummary', function () {
  var $rootScope,
    $compile,
    $state,
    $controller,
    $httpBackend,

    _,

    GenesViewController,
    genesViewScope,
    mockViewElem, // DOM element of mocked events.genes ui-view
    mockViewScope, // scope of mocked events.genes ui-view
    dirElem, // element of entity-view directive
    dirScope; // scope of entity-view directive

  function goFromState(state1, params1) {
    return {
      toState: function (state2, params2) {
        $state.go(state1, params1);
        $rootScope.$digest();
        $state.go(state2, params2);
        $rootScope.$digest();
      }};
  }

  beforeEach(function () {
    // load civic modules
    module('civic.services');
    module('civic.common');
    module('civic.events');
    module('civic.templates'); // load ng-html2js templates
    module('civic.events.common'); // load common events directives
    module('civic.events.genes', function ($provide, $stateProvider) {
      // need to create an initial state to transition from
      $stateProvider
        .state('initial', {
          abstract: false,
          url: '/initial',
          template: '<ui-view></ui-view>'
        })
        .state('events.genes.child', {
          abstract: false,
          url: '/child',
          template:
          '<mock-ui-view>' +
          '<entity-view entity-model="geneModel">' +
          '<entity-tabs entity-model="geneModel"></entity-tabs>' +
          '<gene-summary></gene-summary>' +
          '</entity-view>' +
          '</mock-ui-view>'
        });
    });

    // load json fixtures for httpBackend mocked responses
    module('served/gene238.json');
    module('served/gene238Variants.json');
    module('served/gene238VariantGroups.json');
    module('served/myGeneInfo238.json');

    // inject services
    inject(function(_$rootScope_,
                    _$compile_,
                    _$controller_,
                    _$state_,
                    _$httpBackend_,
                    servedGene238,
                    servedMyGeneInfo238,
                    servedGene238Variants,
                    servedGene238VariantGroups) {
      $state = _$state_;
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $controller = _$controller_;
      $httpBackend = _$httpBackend_;

      _ = window._;

      // setup mocked backend responses
      $httpBackend.when('GET', '/api/genes/238').respond(servedGene238);
      $httpBackend.when('GET', '/api/genes/mygene_info_proxy/238').respond(servedMyGeneInfo238);
      $httpBackend.when('GET', '/api/genes/238/variants').respond(servedGene238Variants);
      $httpBackend.when('GET', '/api/genes/238/variant_groups').respond(servedGene238VariantGroups);

      // instantiate GenesViewController using resolved deps from event.genes state
      goFromState('initial').toState('events.genes.child', { geneId: 238 });
      $httpBackend.flush();
      expect($state.$current.name).to.equal('events.genes.child');
      var deps  = $state.$current.parent.locals.globals;
      genesViewScope = $rootScope.$new();

      GenesViewController = $controller('GenesViewController', {
        $scope: genesViewScope,
        Genes: deps.Genes,
        MyGeneInfo: deps.MyGeneInfo,
        gene: deps.gene,
        variants: deps.variants,
        variantGroups: deps.variantGroups,
        myGeneInfo: deps.myGeneInfo
      });

      expect(GenesViewController).to.exist;
      expect(GenesViewController).to.be.an('object');

      // compile test child template
      mockViewElem = $compile($state.current.template)(genesViewScope);
      mockViewScope  = mockViewElem.scope();
      mockViewScope.$digest();

      expect(mockViewScope.geneModel).to.exist;
      expect(mockViewScope.geneModel).to.be.an('object');

      dirElem = $(mockViewElem).find('gene-summary');
      dirScope = $(dirElem).children(':first').scope();
    });

  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('directive', function(){
    it('is successfully instantiated within the context of event.genes controller and event-view directive', function() {
      expect(dirElem).to.exist;
      expect(dirScope).to.exist;
    });

    it('uses an isolate scope', function() {
      expect(dirScope.geneModel).to.not.exist; // would inherit from GeneViewController if not isolate scope
    });
  });

  describe('controller', function() {
    it('provides the gene data object on scope', function(){
      expect(dirScope.ctrl.gene).to.exist;
      expect(dirScope.ctrl.gene).to.be.an('object');
      expect(dirScope.ctrl.gene.name).to.equal('ALK');
    });

    it('provides myGeneInfo data object on scope', function(){
      expect(dirScope.ctrl.myGeneInfo).to.exist;
      expect(dirScope.ctrl.myGeneInfo).to.be.an('object');
      expect(dirScope.ctrl.myGeneInfo.symbol).to.equal('ALK');
    });

    it('provides variants array on scope', function(){
      expect(dirScope.ctrl.variants).to.exist;
      expect(dirScope.ctrl.variants).to.be.an('array');
      expect(dirScope.ctrl.variants[0].name).to.equal('EML4-ALK');
    });

    it('provides variantGroup array on scope', function(){
      expect(dirScope.ctrl.variantGroups).to.exist;
      expect(dirScope.ctrl.variantGroups).to.be.an('array');
      expect(dirScope.ctrl.variantGroups[0].name).to.equal('Crizotinib Resistance');
    });

    it('unbinds the ctrl.entityModel watch expression after one execution', function() {
      var modelWatcher = _.find(dirScope.$$watchers, function(watch) {
        return watch.exp === 'ctrl.entityModel';
      });
      expect(modelWatcher).to.be.empty;
    });
  });

  describe('template', function() {
    it('updates attribute on local gene object if geneModel entit on GenesViewController is updated', function() {
      expect(dirScope.ctrl.gene.name).to.equal('ALK');
      genesViewScope.geneModel.data.entity.name = 'ALK2';
      $rootScope.$digest();
      expect(dirScope.ctrl.gene.name).to.equal('ALK2');
    });

    it('provides a ui-view directive for events.genes.summary.variants state', function() {
      expect(dirElem.find('ui-view').length).to.be.above(0);
    });
  });
});
