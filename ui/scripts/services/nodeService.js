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
            //@TODO: Eliminate this. We need it now because of an error in the refreshing of the canvas.
            window.location = "/nb";
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
          $rootScope.notify('Node edited in database', 4000);
          callback(data);
        })
        .error(function(data, status, headers, config) {
          $rootScope.notify('Sorry, something went wrong', 4000);
        });
    }
    
    //Will delete a single node
    this.delete = function(nid, callback) {
      $http.delete('/api/' + GlobalService.getCookie('uid') +'/nodes/' + nid)
        .success(function(data, status, headers, config) {
          $rootScope.notify('Node deleted from database', 4000);
          callback({_id: nid});
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
    this.query = function(text, callback){
      $rootScope.query = text;
      var dataToSend = {
        query: text
      };
      $http.post('/api/' + GlobalService.getCookie('uid') +'/query', dataToSend)
        .success(function(data, status, headers, config) {
          var collection = {
            nodes: data,
            connections: GlobalService.connectionEngine(data)
          };
          if (collection.nodes.length > 0) {
            $rootScope.currentGraph = null;
            $rootScope.connections = collection.connections;
            $rootScope.nodes = collection.nodes;
            $rootScope.maxWeight = 0;
            $rootScope.focusedNode = null;
            $rootScope.queryResult = {
              show: true,
              query: $rootScope.query
            };
            $rootScope.$broadcast('loaded');
            $rootScope.$broadcast('refreshCanvas');
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
