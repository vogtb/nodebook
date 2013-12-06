define(['services/services'],

function(services) {
  
  services.service('GraphService', function(GlobalService, NodeService, $http, $q, $rootScope) {
    
    this.graphs = [];
    
    //When given a name, color, and keywords a new graph will be created
    this.create = function(name, color, keywords, callback) {
      var graph = {
        name: name,
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        color: color,
        keywords: keywords
      };
      $http.post('/api/' + GlobalService.getCookie('uid') +'/graphs', graph)
        .success(function(data, status, headers, config) {
          $rootScope.notify('Graph created in database', 4000);
          callback(data);
        })
        .error(function(data, status, headers, config) {
          console.log(data);
        });
      
    };

    //Loads a specific graph by id
    this.load = function(graph_id, callback) {
      $http.get('/api/' + GlobalService.getCookie('uid') +'/graphs/' + graph_id)
        .success(function(data, status, headers, config) {
          var collection = {
            nodes: data,
            connections: GlobalService.connectionEngine(data)
          };
          callback(collection);
        })
        .error(function(data, status, headers, config) {
          callback([]);
          $rootScope.notify('Sorry, something went wrong :(', 4000);
        });
    }
    
    //Loads the primary graph, which is just all of the nodes.
    this.loadPrimary = function(callback) {
      $http.get('/api/' + GlobalService.getCookie('uid') +'/nodes')
        .success(function(data, status, headers, config) {
          var collection = {
            nodes: data,
            connections: GlobalService.connectionEngine(data)
          };
          callback(collection);
        })
        .error(function(data, status, headers, config) {
          $rootScope.notify('Sorry, something went wrong :(', 4000);
          callback([]);
        });
    }

    //Loads graph data, but only low-level node data.
    this.loadGraphs = function(callback) {
      $http.get('/api/' + GlobalService.getCookie('uid') +'/graphs')
        .success(function(data, status, headers, config) {
          if (data.length < 1 || data == null || data == '' || isEmpty(data)) {
            callback([]);
          } else {
            callback(data);
          }
        })
        .error(function(data, status, headers, config) {
          $rootScope.notify('Sorry, something went wrong :(', 4000);
          callback([]);
        });
    }
    
    this.postToGraph = function(gid, nid, callback) {
      var node = {
        _id: nid
      }
      $http.post('/api/' + GlobalService.getCookie('uid') +'/graphs/' + gid, node)
        .success(function(data, status, headers, config) {
          $rootScope.notify('Node added to graph', 4000);
          callback(data);
        })
        .error(function(data, status, headers, config) {
          $rootScope.notify('Sorry, something went wrong :(', 4000);
        });
    }
    
    this.delete = function(gid, callback) {
      $http.delete('/api/' + GlobalService.getCookie('uid') +'/graphs/' + gid)
        .success(function(data, status, headers, config) {
          $rootScope.notify('Graph deleted from database.', 4000);
          callback(data);
        })
        .error(function(data, status, headers, config) {
          $rootScope.notify('Sorry, something went wrong :(', 4000);
        });
    };
    
    
    function isEmpty(obj) {
      for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
          return false;
      }
      return true;
    }

  });

});//End of services

