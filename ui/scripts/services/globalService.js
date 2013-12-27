define(['services/services'],

function(services) {

  services.service('GlobalService', function($http, $rootScope) {

    this.getCookie = function(c_name) {
      var c_value = document.cookie;
      var c_start = c_value.indexOf(" " + c_name + "=");
      if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
      }
      if (c_start == -1) {
        c_value = null;
      } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
          c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
      }
      return c_value;
    }
    
    this.arraySame = function(first, second) {
      var same=[];
      for (var i = 0; i < first.length; i++) {
        for (var j = i; j < second.length; j++) {
          if (first[i] == second[i]) {
            same.push(first[i]);
          }
        }
      }
      return same;
    }

    this.getUserData = function(uid) {
      $http.get('/api/' + uid)
        .success(function(data, status, headers, config) {
          $rootScope.user = data;
        })
        .error(function(data, status, headers, config) {
          //@TODO: throw up an error.
        });
    }
    
    //Determines connections for the nodes
    this.connectionEngine = function() {
      $rootScope.connections = new Array();
      for (var i = 0; i < $rootScope.nodes.length-1; i++) {
        for (var j = i+1; j < $rootScope.nodes.length; j++) {
          //Setting the weight of a given node
          var weight = this.arraySame($rootScope.nodes[i].keywords, $rootScope.nodes[j].keywords).length;
          if (weight > 0) {
            $rootScope.connections.push({
              to: $rootScope.nodes[i]._id,
              from: $rootScope.nodes[j]._id,
              weight: weight
            });
          }
        }
      }
      for (var i = 0; i < $rootScope.nodes.length-1; i++) {
        $rootScope.connections.push({from: $rootScope.nodes[i]._id, to: $rootScope.nodes[i+1]._id, dateLine: true, weight: 1});
      }
    }
    
    this.sendFeedback = function(feedback) {
      var send = {
        feedback: feedback
      };
      $http.post('/api/feedback', send)
        .success(function(data, status, headers, config) {
          //@TODO: Throw up notification.
        })
        .error(function(data, status, headers, config) {
          //Fail...silently?
        });
    }
    
    this.deleteAccount = function() {
      $http.delete('/api/' + this.getCookie('uid'))
        .success(function(data, status, headers, config) {
          window.location = "/goodbye";
        })
        .error(function(data, status, headers, config) {
          window.location = "/goodbye";
        });
    }
    
    this.jackLondon = function(callback) {
      $http.get('/demo/jacklondon')
        .success(function(data, status, headers, config) {
          callback(data);
        })
        .error(function(data, status, headers, config) {
          //@TODO: Throw up a notification.
        });
    }

  });

});//End of services
