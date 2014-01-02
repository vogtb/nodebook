define(['services/services'],

function(services) {
  services.service('NodeService', function(GlobalService, $http, $rootScope) {
    
    //When given text, this will add a single node.
    this.add = function(text) {
      var node = {
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        text: text
      };
      $http.post('/api/' + GlobalService.getCookie('uid') +'/nodes', node)
        .success(function(data, status, headers, config) {
          $rootScope.notify('Node added to database', 4000);
          var newNodeList = [];
          newNodeList.push(data);
          angular.forEach($rootScope.nodes, function(value, key) {
            newNodeList.push(value);
          });
          $rootScope.nodes = newNodeList;
          if ($rootScope.nodes.length > 2) {
            $rootScope.focusedNode = $rootScope.nodes[0];
          } else {
            location.reload();
          }
          $rootScope.connections = GlobalService.connectionEngine($rootScope.nodes);
          $rootScope.$broadcast('reloadSys');
        })
        .error(function(data, status, headers, config) {
          $rootScope.notify('Sorry, something went wrong', 4000);
        });
    }
    
    //Will return a single node.
    this.edit = function(nid, text, callback) {
      var node = {
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        text: text
      };
      $http.put('/api/' + GlobalService.getCookie('uid') +'/nodes/' + nid, node)
        .success(function(data, status, headers, config) {
          angular.forEach($rootScope.nodes, function(value, index) {
            if (value._id == data._id) {
              $rootScope.nodes[index] = data;
            }
          });
          GlobalService.connectionEngine();
          $rootScope.$broadcast('loaded');
          $rootScope.notify('Node edited in database', 4000);
        })
        .error(function(data, status, headers, config) {
          $rootScope.notify('Sorry, something went wrong', 4000);
        });
    }
    
    //Will delete a single node
    this.delete = function(nid) {
      $http.delete('/api/' + GlobalService.getCookie('uid') +'/nodes/' + nid)
        .success(function(data, status, headers, config) {
          $rootScope.notify('Node deleted from database', 4000);
          var newNodeList = new Array();
          angular.forEach($rootScope.nodes, function(value, index) {
            if (value._id !== data._id) {
              newNodeList.push(value);
            }
          });
          $rootScope.nodes = newNodeList;
          GlobalService.connectionEngine();
          $rootScope.$broadcast('removeNode', data._id);
        })
        .error(function(data, status, headers, config) {
          $rootScope.notify('Sorry, something went wrong', 4000);
        });
    }
    
    //Will get all nodes
    this.getAll = function(){
      $http.get('/api/' + GlobalService.getCookie('uid') +'/nodes')
        .success(function(data, status, headers, config) {
          $rootScope.nodes = data;
        })
        .error(function(data, status, headers, config) {
          $rootScope.notify('Sorry, something went wrong.', 4000);
        });
    }
    
    //Queries for nodes
    this.query = function(text){
      $rootScope.query = text;
      $http.post('/api/' + GlobalService.getCookie('uid') +'/query', {query: text})
        .success(function(data, status, headers, config) {
          if (data.length > 0) {
            $rootScope.nodes = data;
            $rootScope.maxWeight = 0;
            $rootScope.focusedNode = null;
            $rootScope.queryResult = {
              show: true,
              query: $rootScope.query
            };
          } else {
            $rootScope.notify('No Data Available', 4000);
          }
        })
        .error(function(data, status, headers, config) {
          $rootScope.notify('Sorry, something went wrong', 4000);
        });
    }
    
  });

});//End of services
