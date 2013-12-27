define(['services/services'],

function(services) {
  
  services.service('FilterService', function(GlobalService, NodeService, $http, $q, $rootScope) {

    //When given a name and keywords a new filter will be created
    this.create = function(name, keywords) {
      var filter = {
        name: name,
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        keywords: keywords
      };
      $http.post('/api/' + GlobalService.getCookie('uid') +'/filter', filter)
        .success(function(data, status, headers, config) {
          $rootScope.notify('Filter added.', 4000);
        })
        .error(function(data, status, headers, config) {
          rootScope.notify('Sorry, something went wrong', 4000);
        });
      
    };
    
    //Delete a specific filter.
    this.delete = function(id, callback) {
      $http.delete('/api/' + GlobalService.getCookie('uid') +'/filter/' + id)
        .success(function(data, status, headers, config) {
          $rootScope.notify('Filter deleted.', 4000);
          callback(data);
        })
        .error(function(data, status, headers, config) {
          $rootScope.notify('Sorry, something went wrong', 4000);
        });
    };

  });

});//End of services

