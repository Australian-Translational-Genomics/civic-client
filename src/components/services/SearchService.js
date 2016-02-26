(function() {
  'use strict';
  angular.module('civic.services')
    .factory('SearchResource',SearchResource)
    .factory('Search', SearchService);

  // @ngInject
  function SearchResource($resource) {
    var SearchService = $resource('/api/evidence_items/search/:token',
      {
        token: '@token'
      },
      {
        post: {
          method: 'POST',
          isArray: false,
          cache: false
        }
      },
      {
        get: {
          method: 'GET',
          isArray: false,
          cache: false
        }
      }
    );

    return SearchService;
  }

  // @ngInject
  function SearchService(SearchResource) {
    var results = [];

    return {
      results: results,
      post: post,
      get: get
    };

    // @ngInject
    function post(reqObj) {
      reqObj.save = true;
      console.log('SearchService.post: ');
      console.log(JSON.stringify(reqObj));
      return SearchResource.post(reqObj).$promise
        .then(function(response) {
          angular.copy(response, results);
          return response.$promise;
        });
    }

    // @ngInject
    function get(token) {
      return SearchResource.get({token: token}).$promise
        .then(function(response) {
          console.log('SearchService.get: ');
          console.log(JSON.stringify(response.params));
          angular.copy(response, results);
          return response.$promise;
        });
    }

  }

})();
