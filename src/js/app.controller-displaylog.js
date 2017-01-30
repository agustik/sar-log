

function controllerDisplayLog($scope, $http, $timeout, $rootScope, $uibModal, utils){


  $scope.activity = [];


  utils.fetchLog(function (res){
    if (res.status >= 200 && res.status < 300 ){
      $scope.activity = res.data.hits.hits;
    }
  });

  $rootScope.$on('sar::newRecord', function (ev, eventData){
    utils.fetchSingleRecord(eventData.response.data._id, function (res){
      if (res.status >= 200 && res.status < 300 ){
        $scope.activity.push(res.data);
      }
    });
  });

  $rootScope.$on('sar::updateRecord', function (ev, eventData){
    utils.fetchSingleRecord(eventData.response.data._id, function (res){
      if (res.status >= 200 && res.status < 300 ){
        var index = utils.findRecordIndexByID($scope.activity, eventData.response.data._id);
        $scope.activity[index]= res.data;
      }
    });
  });

  $scope.openCreateModal = function (item){
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/createlog.html',
      controller: 'createLog',
      size : 'lg',
      resolve: {
        data: function () {
          return item;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      }, function () {
    });
  }


  $scope.deleteRecord = function (id, item){
    var cf = utils.confirm({
      activity : 'Eyða',
      name : item._source.name
    });

    cf.result.then(function (){
      utils.deleteRecord(id, function (res){
        if (res.status >= 200 && res.status < 300){
          var index = utils.findRecordIndexByID($scope.activity, id);
          $scope.activity.splice(index, 1);
        }
      })
    }, function (){
      // dont do it..
    });

  };

  $scope.addUser = function (item){
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/addUserModal.html',
      controller: 'addUserModal',

      resolve: {
        data: function () {
          return item;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      }, function () {
    });

  };
}
