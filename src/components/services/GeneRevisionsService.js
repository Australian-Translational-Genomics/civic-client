(function() {
  angular.module('civic.services')
    .factory('GeneRevisionsResource', GeneRevisionsResource)
    .factory('GeneRevisions', GeneRevisionsService);

  function GeneRevisionsResource($resource, $cacheFactory) {
    var cache = $cacheFactory('genesRevisionsCache');

    // adding this interceptor to a route will remove cached record
    var cacheInterceptor = function(response) {
      cache.remove(response.config.url);
      return response.$promise;
    };
    return $resource('/api/genes/:geneId/suggested_changes/:revisionId',
      {
        geneId: '@geneId',
        revisionId: '@revisionId'
      },
      {
        // Base Gene Revisions Resources
        query: {
          method: 'GET',
          isArray: true,
          cache: cache
        },
        get: {
          method: 'GET',
          isArray: false,
          cache: cache
        },
        submitRevision: {
          method: 'POST',
          cache: false
        },
        acceptRevision: {
          method: 'POST',
          url: '/api/genes/:geneId/suggested_changes/:revisionId/accept',
          params: {
            geneId: '@geneId',
            revisionId: '@revisionId'
          },
          cache: false
        },
        rejectRevision: {
          method: 'POST',
          url: '/api/genes/:geneId/suggested_changes/:revisionId/reject',
          params: {
            geneId: '@geneId',
            revisionId: '@revisionId'
          },
          cache: false
        },

        // Base Gene Revisions Refresh
        queryFresh: {
          method: 'GET',
          isArray: true,
          cache: false
        },
        getFresh: {
          method: 'GET',
          isArray: false,
          cache: false
        },

        // Gene Revisions Comments Resources
        submitComment: {
          method: 'POST',
          url: '/api/genes/:geneId/suggested_changes/:revisionId/comments',
          params: {
            geneId: '@geneId',
            revisionId: '@revisionId'
          },
          cache: false
        },
        updateComment: {
          method: 'PATCH',
          url: '/api/genes/:geneId/suggested_changes/:revisionId/comments/:commentId',
          params: {
            geneId: '@geneId',
            revisionId: '@revisionId',
            commentId: '@commentId'
          },
          interceptor: {
            response: cacheInterceptor
          },
          cache: false
        },
        queryComments: {
          method: 'GET',
          url: '/api/genes/:geneId/suggested_changes/:revisionId/comments',
          params: {
            geneId: '@geneId',
            revisionId: '@revisionId'
          },
          isArray: true,
          cache: cache
        },
        getComment: {
          method: 'GET',
          url: '/api/genes/:geneId/suggested_changes/:revisionId/comments/:commentId',
          params: {
            geneId: '@geneId',
            revisionId: '@revisionId',
            commentId: '@commentId'
          },
          isArray: false,
          cache: cache
        },
        deleteComment: {
          method: 'DELETE',
          url: '/api/genes/:geneId/suggested_changes/:revisionId/comments/:commentId',
          params: {
            geneId: '@geneId',
            revisionId: '@revisionId',
            commentId: '@commentId'
          },
          interceptor: {
            response: cacheInterceptor
          },
          cache: false
        },

        // Gene Revisions Comments Resources Refresh
        queryCommentsFresh: {
          method: 'GET',
          url: '/api/genes/:geneId/suggested_changes/:revisionId/comments',
          params: {
            geneId: '@geneId',
            revisionId: '@revisionId'
          },
          isArray: true,
          cache: false
        },
        getCommentFresh: {
          method: 'GET',
          url: '/api/genes/:geneId/suggested_changes/:revisionId/comments/:commentId',
          params: {
            geneId: '@geneId',
            revisionId: '@revisionId',
            commentId: '@commentId'
          },
          isArray: false,
          cache: false
        }
      }
    )
  }

  function GeneRevisionsService(GeneRevisionsResource, $q) {
    // Base Gene Revision and Gene Revisions Collection
    var item = {};
    var collection = [];

    // Gene Revisions Comments
    var comment = {};
    var comments = [];

    return {
      initBase: initBase,
      initRevisions: initRevisions,
      data: {
        item: item,
        collection: collection,
        comment: comment,
        comments: comments
      },

      // Gene Revisions Base
      query: query,
      get: get,
      submitRevision: submitRevision,
      acceptRevision: acceptRevision,
      rejectRevision: rejectRevision,

      // Gene Revisions Base Refresh
      queryFresh: queryFresh,
      getFresh: getFresh,

      // Gene Revisions Comments
      queryComments: queryComments,
      getComment: getComment,
      submitComment: submitComment,
      updateComment: updateComment,
      deleteComment: deleteComment,

      // Gene Revisions Comments Refresh
      queryCommentsFresh: queryCommentsFresh,
      getCommentFresh: getCommentFresh
    };

    function initBase(geneId, revisionId) {
      return $q.all([
        get(geneId, revisionId)
      ])
    }

    function initRevisions(geneId) {
      return $q.all([
        query(geneId)
      ])
    }

    // Gene Revisions Base
    function query(geneId) {
      return GeneRevisionsResource.query({ geneId: geneId })
        .then(function(response) {
          angular.copy(response, collection);
          return response.$promise;
        });
    }
    function get(geneId, revisionId) {
      return GeneRevisionsResource.getRevision({ geneId: geneId, revisionId: revisionId })
        .then(function(response) {
          angular.copy(response, item);
          return response.$promise;
        })
    }
    function submitRevision(reqObj) {
      return GeneRevisionsResource.submitRevision(reqObj)
        .then(function(response) {
          queryFresh();
          return response.$promise;
        });
    }
    function acceptRevision(geneId, revisionId) {
      return GeneRevisionsResource.acceptRevision({ geneId: geneId, revisionId: revisionId })
        .then(function(response) {
          queryFresh(geneId);
          getFresh(geneId, revisionId);
          return response.$promise;
        })
    }
    function rejectRevision(geneId, revisionId) {
      return GeneRevisionsResource.rejectRevision({ geneId: geneId, revisionId: revisionId })
        .then(function(response) {
          queryFresh();
          getFresh(geneId, revisionId);
          return response;
        })
    }

    // Gene Revisions Base Refresh
    function queryFresh(geneId) {
      return GeneRevisionsResource.queryFresh({ geneId: geneId }).$promise
        .then(function(response) {
          angular.copy(response, collection);
          return response.$promise;
        });
    }
    function getFresh(geneId, revisionId) {
      return GeneRevisionsResource.getFresh({ geneId: geneId, revisionId: revisionId }).$promise
        .then(function(response) {
          angular.copy(response, item);
          return response.$promise;
        });
    }

    // Gene Revisions Comments
    function queryComments(geneId, revisionId) {
      return GeneRevisionsResource.queryComments({ geneId: geneId, revisionId: revisionId }).$promise
        .then(function(response) {
          angular.copy(response, comments);
          return response.$promise;
        });
    }
    function getComment(geneId, revisionId, commentId) {
      return GeneRevisionsResource.getComment({ geneId: geneId, revisionId: revisionId, commentId: commentId }).$promise
        .then(function(response) {
          angular.copy(response, comment);
          return response.$promise;
        });
    }
    function submitComment(reqObj) {
      return GeneRevisionsResource.submitComment(reqObj).$promise
        .then(function(response) {
          queryCommentsFresh(reqObj);
          return response.$promise;
        });
    }
    function updateComment(reqObj) {
      return GeneRevisionsResource.updateComment(reqObj).$promise
        .then(function(response) {
          angular.copy(response, comment);
          getCommentFresh(reqObj);
          return response.$promise;
        });
    }
    function deleteComment(geneId, revisionId, commentId) {
      return GeneRevisionsResource.deleteComment({ geneId: geneId, revisionId: revisionId, commentId: commentId }).$promise
        .then(function(response) {
          comment = null;
          return response.$promise;
        });
    }

    // Gene Revisions Comments Refresh
    function queryCommentsFresh(geneId, revisionId) {
      return GeneRevisionsResource.queryCommentsFresh({ geneId: geneId, revisionId: revisionId }).$promise
        .then(function(response) {
          angular.copy(response, comments);
          return response.$promise;
        });
    }
    function getCommentFresh(geneId, revisionId, commentId) {
      return GeneRevisionsResource.getCommentFresh({ geneId: geneId, revisionId: revisionId, commentId: commentId }).$promise
        .then(function(response) {
          angular.copy(response   , comment);
          return response.$promise;
        });
    }
  }
})();
