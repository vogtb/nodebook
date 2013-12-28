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
    .filter('highlight', function() {
      return function(node){
        function labelKeywords(line, word) {
          var regex = new RegExp('(' + word + ')', 'gi');
          return line.replace(regex, '<span class="label info">$1</span>');
        }
        var text =  node.text;
        for (var i = 0; i < node.commonKeywords.length; i++) {
          text = labelKeywords(text, node.commonKeywords[i]);
        }
        return text;
       };
    })
});

