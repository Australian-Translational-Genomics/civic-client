(function() {
  'use strict';
  angular.module('civic.events.genes')
    .config(GenesConfig)
    .factory('GenesViewOptions', GenesViewOptions)
    .controller('GenesController', GenesController);

  // @ngInject
  function GenesConfig($stateProvider) {
    $stateProvider
      .state('events.genes', {
        abstract: true,
        url: '/genes/:geneId',
        templateUrl: 'app/views/events/genes/GenesView.tpl.html',
        resolve: /* @ngInject */ {
          Genes: 'Genes',
          initGene: function(Genes, $stateParams) {
            return Genes.initBase($stateParams.geneId);
          }
        },
        controller: 'GenesController',
        controllerAs: 'vm',
        deepStateRedirect: {params: [ 'geneId' ]},
        onExit: /* @ngInject */ function($deepStateRedirect) {
          $deepStateRedirect.reset();
        }
      })
      .state('events.genes.summary', {
        url: '/summary',
        template: '<gene-summary show-menu="true"></gene-summary>',
        resolve: {
          Genes: 'Genes',
          refreshGene: function(Genes, $stateParams) {
            return Genes.get($stateParams.geneId);
          }
        },
        deepStateRedirect: {params: [ 'geneId' ]},
        data: {
          titleExp: '"Gene " + gene.name + " Summary"',
          navMode: 'sub'
        }
      });
  }

  // @ngInject
  function GenesViewOptions($state, $stateParams) {
    var tabData = [];
    var state = {
      baseParams: {},
      baseState: '',
      baseUrl: ''
    };
    var styles = {};

    function init() {
      angular.copy($stateParams, this.state.baseParams);
      this.state.baseState = 'events.genes';
      this.state.baseUrl = $state.href(this.state.baseState, $stateParams);

      angular.copy([
        {
          heading: 'Gene Summary',
          route: 'events.genes.summary',
          params: { geneId: $stateParams.geneId, '#': 'gene' }
        },
        {
          heading: 'Gene Talk',
          route: 'events.genes.talk.revisions.list',
          params: { geneId: $stateParams.geneId, '#': 'gene' }
        }
      ], this.tabData);

      angular.copy({
        view: {
          backgroundColor: 'pageBackground2'
        },
        summary: {
          backgroundColor: 'pageBackground2'
        },
        myGeneInfo: {
          backgroundColor: 'pageBackground2'
        },
        variantMenu: {
          backgroundColor: 'pageBackground2'
        },
        edit: {
          summaryBackgroundColor: 'pageBackground2'
        }
      }, this.styles);
    }

    return {
      init: init,
      state: state,
      tabData: tabData,
      styles: styles
    };
  }

  // @ngInject
  function GenesController(Genes, GeneRevisions, GenesViewOptions) {
    GenesViewOptions.init();
    // these will be passed to the entity-view directive controller, to be required by child entity component so that they
    // can get references to the view model and view options
    this.GenesViewModel = Genes;
    this.GenesViewRevisions = GeneRevisions;
    this.GenesViewOptions = GenesViewOptions;
  }

})();
