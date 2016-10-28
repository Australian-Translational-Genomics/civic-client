(function() {
  'use strict';
  angular.module('civic.events.variants')
    .controller('VariantSummaryController', VariantSummaryController)
    .directive('variantSummary', function() {
      return {
        restrict: 'E',
        scope: {
          showEvidenceGrid: '='
        },
        controller: 'VariantSummaryController',
        templateUrl: 'app/views/events/variants/summary/variantSummary.tpl.html'
      };
    });

  //@ngInject
  function VariantSummaryController($scope,
                                    $state,
                                    $stateParams,
                                    Security,
                                    Variants,
                                    VariantsViewOptions) {
    $scope.isAuthenticated = Security.isAuthenticated;
    $scope.isEdit = $state.includes('**.edit.**');
    $scope.stateParams = $stateParams;

    $scope.variant = parseVariant(Variants.data.item);
    $scope.evidence = Variants.data.evidence;

    $scope.$watch(function() { return Variants.data.item; }, function(variant) {
      $scope.variant = variant;
      $scope.evidence = variant.evidence_items;
    }, true);

    $scope.$watch(function() { return Variants.data.myVariantInfo;}, function(myVariantInfo) {
      $scope.myVariantInfo = myVariantInfo;
    }, true);

    $scope.VariantsViewOptions = VariantsViewOptions;
    $scope.backgroundColor = VariantsViewOptions.styles.view.backgroundColor;

    $scope.editClick = function() {
      if (Security.isAuthenticated()) {
        $state.go('events.genes.summary.variants.edit.basic', $stateParams);
      }
    };
  }

  function parseVariant(variant) {


    return variant;
  }

  function getName(chromosome, start, stop, refBase, varBase) {
    var template = _.template('chr<%= chromosome %>:<%= start =>_<%= stop %>:<%=refBases=>')
    var parts = [chromosome, start, stop, refBase, varBase];

  };
})();
