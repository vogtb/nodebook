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

function AddNodeModalInstanceCtrl($scope, $dialog, dialog, $rootScope, NodeService, GraphService, GlobalService) {
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


// Create Graph Modal and instance control
function CreateGraphModalControl($scope, $dialog, $rootScope) {  
  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template:  'views/create-graph.html',
    controller: 'CreateGraphModalInstanceControl'
  };
    
  $scope.openDialog = function(){
    var d = $dialog.dialog({dialogFade: false});
    d.open('views/create-graph.html', 'CreateGraphModalInstanceControl');
  };
}

function CreateGraphModalInstanceControl($scope, $dialog, dialog, $rootScope, NodeService, GraphService) {
  $scope.close = function(){
    dialog.close();
  };

  $scope.createGraph = function() {
    $rootScope.log($scope.newGraphName);
    GraphService.create($scope.newGraphName, $scope.selectedColor.name, $scope.keywords);
    $scope.close();
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



function FeedbackCtrl($scope, $dialog, $rootScope){
  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template:  'views/feedback.html',
    controller: 'UserModalCtrl'
  };

  $scope.openDialog = function(node){
    $rootScope.currentlyEditing = node;
    var d = $dialog.dialog({dialogFade: false});
    d.open('views/feedback.html', 'FeedbackInstanceCtrl');
  };
}

function FeedbackInstanceCtrl($scope, $dialog, dialog, $rootScope, GlobalService) {
  $scope.feedback;
  
  $scope.close = function(){
    dialog.close();
  };
  
  $scope.send = function() {
    GlobalService.sendFeedback($scope.feedback);
    $scope.close();
    //@TODO: Throw up a notification thanking the user.
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
  $scope.currentGraph = '';
  if ($rootScope.currentlyEditing !== null) {
    var middle_man = $rootScope.currentlyEditing.text;
    $scope.edit_text = middle_man;
    $scope.currentID = $rootScope.currentlyEditing._id;
  }

  $scope.close = function(){
    dialog.close();
  };
  
  $scope.edit = function() {
    NodeService.edit($scope.currentID, $scope.edit_text, function(data) {
      angular.forEach($rootScope.nodes, function(value, index) {
        if (value._id == data._id) {
          $rootScope.nodes[index] = data;
        }
      });
      $rootScope.connections = GlobalService.connectionEngine($rootScope.nodes);
      $rootScope.$broadcast('reloadSys');
      $scope.close();
    });
  };
  
  $scope.delete = function() {
    NodeService.delete($scope.currentID, function(data) {
      var newNodeList = [];
      angular.forEach($rootScope.nodes, function(value, index) {
        if (value._id !== data._id) {
          newNodeList.push(value)
        }
      });
      $rootScope.nodes = newNodeList;
      $rootScope.connections = GlobalService.connectionEngine($rootScope.nodes);
      $rootScope.$broadcast('reloadSys');
      $scope.close();
    });
  };
}


function OverviewModalCtrl($scope, $dialog, $rootScope){
  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    template:  'views/graph-overview.html',
    controller: 'OverviewModalInstanceCtrl'
  };

  $scope.openDialog = function(node){
    $rootScope.currentlyEditing = node;
    var d = $dialog.dialog({dialogFade: false});
    d.open('views/graph-overview.html', 'OverviewModalInstanceCtrl');
  };
}

function OverviewModalInstanceCtrl($scope, $dialog, dialog, $rootScope, GraphService) {
  
  $scope.close = function(){
    dialog.close();
  };
  
  $scope.delete = function(gid){
    GraphService.delete(gid, function(data) {
      var toReturn = [];
      angular.forEach($rootScope.graphs, function(value, key) {
        if (value._id !== gid) {
          toReturn.push(value);
        }
      });
      $rootScope.graphs = toReturn;
      $scope.close();
    });
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


