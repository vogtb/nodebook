define(['services/services'],

function(services) {

  services.service('GlobalService', function($http) {

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

    this.getUserData = function(uid, callback) {
      $http.get('/api/' + uid)
        .success(function(data, status, headers, config) {
          callback(data);
        })
        .error(function(data, status, headers, config) {
          callback(data);
        });
    }
    
    //Determines connections when given a set of nodes
    this.connectionEngine = function(nodes) {
      var connections = [];
      //Matching.
      for (var i = 0; i < nodes.length-1; i++) {
        for (var j = i+1; j < nodes.length; j++) {
          //Setting the weight of a given node
          var weight = this.arraySame(nodes[i].keywords, nodes[j].keywords).length;
          if (weight > 0) {
            var connection = {
              to: nodes[i]._id,
              from: nodes[j]._id,
              weight: weight
            };
            connections.push(connection);
          }
        }
      }
      for (var i = 0; i < nodes.length-1; i++) {
        connections.push({from: nodes[i]._id, to: nodes[i+1]._id, dateLine: true, weight: 1});
      }
      return connections;
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
