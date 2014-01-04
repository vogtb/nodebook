/*
Controls modals
*/

function AddNodeModalCtrl($scope, $dialog){
  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template:  'views/add-node.html',
    controller: 'AddNodeModalInstanceCtrl'
  };

  $scope.openDialog = function(){
    var d = $dialog.dialog({dialogFade: false});
    d.open('views/add-node.html', 'AddNodeModalInstanceCtrl');
  };
}

function AddNodeModalInstanceCtrl($scope, $dialog, dialog, $rootScope, NodeService, GlobalService) {
  $scope.close = function(){
    dialog.close();
  };
  $scope.addNode = function(){
    NodeService.add($scope.new_text);
    $scope.close();
  };
}


function WelcomeModalCtrl($scope, $dialog){
  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template:  'views/welcome.html',
    controller: 'WelcomeModalInstanceCtrl'
  };

  $scope.openDialog = function(){
    var d = $dialog.dialog({dialogFade: false});
    d.open('views/welcome.html', 'WelcomeModalInstanceCtrl');
  };
}

function WelcomeModalInstanceCtrl($scope, $dialog, dialog, $rootScope) {
  $scope.close = function(){
    dialog.close();
  };
  
  $scope.jack = function(){
    dialog.close();
    setTimeout(function() {
      $('#jack').trigger('click');
    }, 50);
  };
  
  $scope.forceAdd = function() {
    dialog.close();
    setTimeout(function() {
      $('#new').trigger('click');
    }, 50);
  };
  
  $scope.help = function() {
    dialog.close();
    setTimeout(function() {
      $('#help').trigger('click');
    }, 50);
  };
}

function UserModalCtrl($scope, $dialog, $rootScope){
  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template:  'views/user.html',
    controller: 'UserModalCtrl'
  };

  $scope.openDialog = function(node){
    $rootScope.currentlyEditing = node;
    var d = $dialog.dialog({dialogFade: false});
    d.open('views/user.html', 'UserModalInstanceCtrl');
  };
}


function UserModalInstanceCtrl($scope, $dialog, dialog, $rootScope, GlobalService) {
  $scope.close = function(){
    dialog.close();
  };
}


function DeleteUserModalCtrl($scope, $dialog, $rootScope){
  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template:  'views/delete.html',
    controller: 'DeleteUserModalCtrl'
  };

  $scope.openDialog = function(node){
    $rootScope.currentlyEditing = node;
    var d = $dialog.dialog({dialogFade: false});
    d.open('views/delete.html', 'DeleteUserModalInstanceCtrl');
  };
}


function DeleteUserModalInstanceCtrl($scope, $dialog, dialog, $rootScope, GlobalService) {
  $scope.close = function(){
    dialog.close();
  };
  
  $scope.delete = function(){
    GlobalService.deleteAccount();
    dialog.close();
  };
}


function EditNodeModalCtrl($scope, $dialog, $rootScope, NodeService){
  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template:  'views/edit-node.html',
    controller: 'EditNodeModalInstanceCtrl'
  };

  $scope.openDialog = function(node){
    $rootScope.currentlyEditing = node;
    var d = $dialog.dialog({dialogFade: false});
    d.open('views/edit-node.html', 'EditNodeModalInstanceCtrl');
  };
}

function EditNodeModalInstanceCtrl($scope, $dialog, dialog, $rootScope, GlobalService, NodeService) {
  
  $scope.editTextChanged = false;
  $scope.new_text = '';
  if ($rootScope.currentlyEditing !== null) {
    var middle_man = $rootScope.currentlyEditing.text;
    $scope.edit_text = middle_man;
    $scope.currentID = $rootScope.currentlyEditing._id;
  }

  $scope.close = function(){
    dialog.close();
  };
  
  $scope.edit = function() {
    NodeService.edit($scope.currentID, $scope.edit_text);
    $scope.close();
  };
  
  $scope.delete = function() {
    NodeService.delete($scope.currentID);
    $scope.close();
  };
}

function DiffModalCtrl($scope, $dialog, $rootScope) {
  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template:  'views/diff.html',
    controller: 'DiffModalInstanceCtrl'
  };

  $scope.openDialog = function(node){
    $rootScope.currentlyEditing = node;
    var d = $dialog.dialog({dialogFade: false});
    d.open('views/diff.html', 'DiffModalInstanceCtrl');
  };
}

function DiffModalInstanceCtrl($scope, $dialog, dialog, $rootScope) {
  $scope.close = function(){
    dialog.close();
  };
}

function AboutModalCtrl($scope, $dialog, $rootScope) {
  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template:  'views/about.html',
    controller: 'AboutModalInstanceCtrl'
  };

  $scope.openDialog = function(node){
    $rootScope.currentlyEditing = node;
    var d = $dialog.dialog({dialogFade: false});
    d.open('views/about.html', 'AboutModalInstanceCtrl');
  };
}

function AboutModalInstanceCtrl($scope, $dialog, dialog, $rootScope) {
  $scope.close = function(){
    dialog.close();
  };
}


function HelpModalCtrl($scope, $dialog, $rootScope) {
  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template:  'views/help.html',
    controller: 'HelpModalInstanceCtrl'
  };

  $scope.openDialog = function(node){
    $rootScope.currentlyEditing = node;
    var d = $dialog.dialog({dialogFade: false});
    d.open('views/help.html', 'HelpModalInstanceCtrl');
  };
}

function HelpModalInstanceCtrl($scope, $dialog, dialog, $rootScope) {
  $scope.close = function(){
    dialog.close();
  };
}


