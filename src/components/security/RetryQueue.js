(function() {
  'use strict';
  angular.module('civic.security.retryQueue', [])
    .factory('RetryQueue', RetryQueue);

  /**
   * @name RetryQueue
   * @desc This is a generic retry queue for security failures.  Each item is expected to expose two functions: retry and cancel.
   * @param $q
   * @param $log
   * @returns {{onItemAddedCallbacks: Array, hasMore: hasMore, push: push, pushRetryFn: pushRetryFn, retryReason: retryReason, cancelAll: cancelAll, retryAll: retryAll}}
   * @ngInject
   */
  function RetryQueue($q, $log) {
    var retryQueue = [];
    var service = {
      // The security service puts its own handler in here!
      onItemAddedCallbacks: [],

      hasMore: function() {
        return retryQueue.length > 0;
      },
      push: function(retryItem) {
        $log.info('retryQueue.push() called with item: ' + retryItem);
        retryQueue.push(retryItem);
        // Call all the onItemAdded callbacks
        angular.forEach(service.onItemAddedCallbacks, function(cb) {
          try {
            cb(retryItem);
          } catch(e) {
            $log.error('securityRetryQueue.push(retryItem): callback threw an error' + e);
          }
        });
      },
      pushRetryFn: function(reason, retryFn) {
        // The reason parameter is optional
        if ( arguments.length === 1) {
          retryFn = reason;
          reason = undefined;
        }

        // The deferred object that will be resolved or rejected by calling retry or cancel
        var deferred = $q.defer();
        var retryItem = {
          reason: reason,
          retry: function() {
            // Wrap the result of the retryFn into a promise if it is not already
            $q.when(retryFn()).then(function(value) {
              // If it was successful then resolve our deferred
              deferred.resolve(value);
            }, function(value) {
              // Othewise reject it
              deferred.reject(value);
            });
          },
          cancel: function() {
            // Give up on retrying and reject our deferred
            deferred.reject();
          }
        };
        service.push(retryItem);
        return deferred.promise;
      },
      retryReason: function() {
        return service.hasMore() && retryQueue[0].reason;
      },
      cancelAll: function() {
        while(service.hasMore()) {
          retryQueue.shift().cancel();
        }
      },
      retryAll: function() {
        $log.info('RetryQueue.retryall() called.');
        while(service.hasMore()) {
          retryQueue.shift().retry();
        }
      }
    };
    return service;
  }
})();