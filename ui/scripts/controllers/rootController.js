define(['controllers/controllers', 'services/nodeService'],
  function(controllers) {


    //Root Control
    controllers.controller('RootControl', ['$scope', '$rootScope', 'NodeService', 'FilterService', 'GlobalService',
      function($scope, $rootScope, NodeService, FilterService, GlobalService) {
        $rootScope.currentlyEditing = null;
        $rootScope.focusedNode = null;
        $rootScope.secondFocusedNode = null;
        $rootScope.shift = false;
        $rootScope.maxWeight = 0;
        $rootScope.query;
        $rootScope.nodes = new Array();
        $rootScope.connections = new Array();
        $rootScope.uid = GlobalService.getCookie('uid');

        //Standard alert
        $rootScope.alert = function(text) {
          alert(text);
        };
        //Standard log
        $rootScope.log = function(text) {
          console.log(text);
        };
        //Throw up notification
        $rootScope.notify = function(text, time) {
          $rootScope.notify_text = text;
          $('.notify').fadeIn(100).delay(time).fadeOut(100);
        };

        //When a user focuses on a node, we reflect that change in graph.
        $rootScope.focusFromText = function(nid) {
          angular.forEach($rootScope.nodes, function(value, key) {
            if (value._id === nid) {
              $rootScope.focusedNode = $rootScope.nodes[key];
            }
          });
        }
        
        $rootScope.findConnectionData = function(nodeOne, nodeTwo) {
          var returnData = [];
          for (var i = 0; i < nodeOne.keywords.length; i++) {
            for (var j = 0; j < nodeTwo.keywords.length; j++) {
              if (nodeOne.keywords[i] == nodeTwo.keywords[j]) {
                returnData.push(nodeOne.keywords[i]);
              }
            }
          }
          return returnData;
        }

        $rootScope.focusNode = function(node) {
          
          angular.forEach($rootScope.nodes, function(value, key) {
            if (value._id === node.name) {
              if ($rootScope.shift) {
                //@TODO: This does not seem to work on occasion. Sometimes compares a node to itself....
                $rootScope.secondFocusedNode = $rootScope.nodes[key];
                $rootScope.focusedPairConnectionData = $rootScope.findConnectionData($rootScope.secondFocusedNode, $rootScope.focusedNode);
                $rootScope.focusedNode.mainKeywords = $rootScope.focusedPairConnectionData;
                $rootScope.secondFocusedNode.mainKeywords = $rootScope.focusedPairConnectionData;
                if ($rootScope.focusedPairConnectionData.length > 0) {
                  $rootScope.log($rootScope.focusedPairConnectionData);
                  $('#forceTrigger').trigger('click');
                }
              } else {
                $rootScope.secondFocusedNode = null;
                $rootScope.focusedNode = $rootScope.nodes[key];
                $rootScope.$apply();
              }
            }
          });
        }

        $rootScope.queryNodes = function() {
          NodeService.query($scope.query);
        }

        /*INITIAL LOADING.*/
        NodeService.getAll();
        GlobalService.getUserData($rootScope.uid);
        $rootScope.$watch('nodes', function() {
          GlobalService.connectionEngine($rootScope.nodes);
          $rootScope.$broadcast('loaded');
        });

        //Binding shift key for node comparison
        $(document).bind('keydown', function(e) {
          var code = e.keyCode || e.which;
           if(code == 16) {
             $rootScope.shift = true;
           }
        });
        $(document).bind('keyup', function(e) {
          var code = e.keyCode || e.which;
           if(code == 16) {
             $rootScope.shift = false;
           }
        });

        $rootScope.$watch('focusedNode', function() {
          if ($rootScope.focusedNode !== null && $rootScope.focusedNode !== undefined) {
            $rootScope.$broadcast('refreshCanvas');
            var id = "#" + $rootScope.focusedNode._id.toString();
            $('.inspector').scrollTo($(id), 600);
          }
        });

        //Setting some of the view
        $scope.$on('resize', function(event, windowWidth, windowHeight) {
          var canv = $("canvas");
          var canvHolder = $('#canvas-holder');
          var nav = $('.navigation');
          canv.attr('width', canvHolder.width());
          canv.attr('height', $(window).height() - nav.height() - 1);
          canv.css('width', canvHolder.width());
          canv.css('height', $(window).height() - nav.height() - 1);
          $('.main-holder').css('height', $(window).height() - nav.height() - 1);
        });
        
        var canv = $("canvas");
        var canvHolder = $('#canvas-holder');
        var nav = $('.navigation');
        canv.attr('width', canvHolder.width());
        canv.attr('height', $(window).height() - nav.height() - 1);
        canv.css('width', canvHolder.width());
        canv.css('height', $(window).height() - nav.height() - 1);
        $('.main-holder').css('height', $(window).height() - nav.height() - 1);
      }
    ]);

    //Graph Controller
    controllers.controller('GraphCtrl', ['$scope', '$rootScope', 'GlobalService',
      function($scope, $rootScope, GlobalService) {
        $scope.sys = null;

        $scope.init = function() {
          Renderer = function(canvas) {
            var canvas = $(canvas).get(0);
            var ctx = canvas.getContext("2d");
            var particleSystem;

            var that = {
              init: function(system) {
                particleSystem = system;
                particleSystem.screenSize(canvas.width, canvas.height);
                particleSystem.screenPadding(60);
                that.initMouseHandling();
              },

              redraw: function() {
                particleSystem = $scope.sys;
                particleSystem.screenSize(canvas.width, canvas.height);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                var weight = 0;
                particleSystem.eachEdge(function(edge, pt1, pt2) {
                  weight = ((edge.data.weight / $rootScope.maxWeight)*0.44) + 0.22;
                  if (edge.data.dateLine == true) {
                    ctx.strokeStyle = "rgba(67,141,224, 0.0)";
                  } else {
                    ctx.strokeStyle = "rgba(0,0,0, " + weight + ")";
                  }
                  ctx.lineWidth = 1.1 + weight*1.18;
                  ctx.beginPath();
                  ctx.moveTo(pt1.x, pt1.y);
                  ctx.lineTo(pt2.x, pt2.y);
                  ctx.stroke();
                });
                particleSystem.eachNode(function(node, pt) {
                  ctx.fillStyle = "#333333";
                  var w = 5;
                  if ($rootScope.focusedNode !== null && node.name === $rootScope.focusedNode._id) {
                    ctx.fillStyle = "#438DE0";
                    var w = 8;
                  }
                  ctx.beginPath();
                  ctx.arc(pt.x, pt.y, w, 0, Math.PI * 2, true);
                  ctx.closePath();
                  ctx.fill();
                });
              },
              initMouseHandling: function() {
                var dragged = null;
                var handler = {
                  clicked: function(e) {
                    var pos = $(canvas)
                      .offset();
                    _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);
                    dragged = particleSystem.nearest(_mouseP);
                    if (dragged && dragged.node !== null) {
                      dragged.node.fixed = true;
                    }
                    $(canvas)
                      .bind('mousemove', handler.dragged);
                    $(window)
                      .bind('mouseup', handler.dropped);
                    $scope.sys.eachNode(function(node, pt) {
                      if (_mouseP.x - pt.x < 10 && _mouseP.x - pt.x > -10) {
                        if (_mouseP.y - pt.y < 10 && _mouseP.y - pt.y > -10) {
                          $rootScope.focusNode(node);
                        }
                      }
                    });
                    return false;
                  },
                  dragged: function(e) {
                    var pos = $(canvas)
                      .offset();
                    var s = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);
                    if (dragged && dragged.node !== null) {
                      var p = particleSystem.fromScreen(s);
                      dragged.node.p = p;
                    }
                    return false
                  },
                  dropped: function(e) {
                    if (dragged === null || dragged.node === undefined) return;
                    if (dragged.node !== null) dragged.node.fixed = false;
                    dragged.node.tempMass = 1000;
                    dragged = null;
                    $(canvas)
                      .unbind('mousemove', handler.dragged);
                    $(window)
                      .unbind('mouseup', handler.dropped);
                    _mouseP = null;
                    return false;
                  }
                }
                $(canvas).mousedown(handler.clicked);
              },
            }
            return that;
          }

          $scope.sys = arbor.ParticleSystem({
            friction: .3,
            stiffness: 300,
            repulsion: 10000,
            gravity: true,
            fps: 20,
            precision: 0.1,
            dt: 0.1
          });
          $scope.sys.renderer = Renderer("#viewport");
          $scope.sys.start();
        }
        
        $scope.addEdge = function(a, b) {
          $scope.sys.addEdge(a, b);
        }

        $scope.addNode = function(a) {
          $scope.sys.addNode(a);
        }

        $scope.refresh = function() {
          $scope.sys.renderer.redraw();
        }

        $scope.$on('resize', function() {
          $scope.refresh();
        });

        $rootScope.$on('loaded', function() {
          $scope.sys.eachNode(function(node, pt) {
            $scope.sys.pruneNode(node);
          });
          for (var i = 0; i < $rootScope.nodes.length; i++) {
            $scope.sys.addNode($rootScope.nodes[i]._id);
          }
          for (var i = 0; i < $rootScope.connections.length; i++) {
            $scope.sys.addEdge($rootScope.connections[i].to,
              $rootScope.connections[i].from,
              {
                weight: $rootScope.connections[i].weight,
                dateLine: $rootScope.connections[i].dateLine
              }
            );
            if ($rootScope.connections[i].weight > $rootScope.maxWeight ) {
              $rootScope.maxWeight = $rootScope.connections[i].weight;
            }
          }
          $scope.refresh($scope.sys);
          setTimeout(function() {
            $scope.sys.stop();
          }, 3000);
        });

        //Initialize itself
        $scope.init();

        //Update the canvas only for 0.7 seconds when clicked on.
        $('canvas').on('click', function() {
          $scope.sys.start();
          setTimeout(function() {
            $scope.sys.stop();
          }, 700);
        });

      }

    ]);

});
