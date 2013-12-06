define(['angular'], function(angular) {
  'use strict';
  return angular.module('filters', [])
    .filter('moment', function() {
      return function(datetime){
        var thisMagic = moment(datetime).format('MMMM Do YYYY, h:mm a');
        return thisMagic;
       };
    })
    .filter('shortmoment', function() {
      return function(datetime){
        var thisMagic = moment(datetime).format('MM/D/YYYY');
        return thisMagic;
       };
    })
    .filter('plus', function() {
      return function(text){
        return text + ' +';
       };
    })
    .filter('graphOrSearch', function() {
      return function(graph){
        if (graph.isQuery) {
          return '<strong>Graph: &nbsp;</strong>' + graph.name;
        } else {
          return '<strong>Query: &nbsp;</strong>' + graph.name;
        }
        
       };
    })
    //@TODO: Doesn't work properly. Only finds first instance of a keyword, not recurring instances
    .filter('highlight', function() {
      return function(node){
        var toReturn = ' ' + node.text + ' ';
        for (var i = 0; i < node.keywords.length; i++) {
          if (toReturn.search(' '+ node.keywords[i]) > -1) {
            var temp = '<span class="label">' + node.keywords[i] + '</span>';
            node.keywords[i]
            if (node.mainKeywords.indexOf(node.keywords[i]) > -1) {
              var temp = '<span class="label label-info">' + node.keywords[i] + '</span>';
            }
            toReturn = toReturn.replace(node.keywords[i], temp);
          }
        }
        return toReturn;
       };
    })
});

