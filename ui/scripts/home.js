//When the document is ready.
$(document).ready(function() {
  sys = null;

  init = function() {
    //Initialize the renderer right away.
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
          particleSystem.screenSize(canvas.width, canvas.height);
          canvas.width = canvas.width;
          var weight = 0;
          particleSystem.eachEdge(function(edge, pt1, pt2) {
            ctx.strokeStyle = "rgba(0,0,0, 0.5)";
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(pt1.x, pt1.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.stroke();
          });
          particleSystem.eachNode(function(node, pt) {
            ctx.fillStyle = "#333333";
            ctx.beginPath();
            var w = 5;
            ctx.arc(pt.x, pt.y, w, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
          });
        },
        refresh: function(system) {  
          particleSystem = system;
          particleSystem.screenSize(canvas.width, canvas.height);
          canvas.width = canvas.width;
          var weight = 0;
          particleSystem.eachEdge(function(edge, pt1, pt2) {
            ctx.strokeStyle = "rgba(0,0,0, 0.7)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pt1.x, pt1.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.stroke();
          });
          particleSystem.eachNode(function(node, pt) {
            var w = 5;
            ctx.fillStyle = "#333333";
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
          $(canvas)
            .mousedown(handler.clicked);
        },
      }
      return that;
    }

    sys = arbor.ParticleSystem({
      friction: .3,
      stiffness: 1000,
      repulsion: 1000,
      gravity: false,
      fps: 20,
      precision: 0.1,
      dt: 0.1
    });
    sys.renderer = Renderer("#viewport");
    sys.start();
  }

  init();

  var count = 10;
  var edges = count*9;
  var popMoreNumber = 20;

  for (var i = 0; i < count; i++) {
    sys.addNode(i.toString());
  }
  
  
  var done = false;
    setTimeout(function(){
      setInterval(function() {
        if (i < edges) {
          sys.addEdge(Math.floor(Math.random()*popMoreNumber), Math.floor(Math.random()*popMoreNumber));
          i++;
        }
        if (i == edges && !done) {
          setTimeout(function() {
            sys.stop();
          }, 2500);
          done = true;
        }
      }, 60);
    }, 800);

  
});

