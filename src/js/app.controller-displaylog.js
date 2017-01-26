

function controllerDisplayLog($scope, $http, $timeout, $rootScope, $uibModal, utils){


  $scope.activity = [];


  utils.fetchLog(function (res){
    if (res.status >= 200 && res.status < 300 ){
      console.log(res.data);
      $scope.activity = res.data.hits.hits;
    }
  });

  $rootScope.$on('sar::newRecord', function (ev, data, response){
    console.log('sar::newRecord', data, response);
    console.log('I should fetch a single record with id', response.data._id);
    utils.fetchSingleRecord(response.data._id, function (res){
      if (res.status >= 200 && res.status < 300 ){
        $scope.activity.push(res.data);
      }
    });
  });

  $rootScope.$on('sar::updateRecord', function (ev, data, response){
    console.log('sar::updateRecord', data, response);
    console.log('I should fetch a single record with id', response.data._id, 'and update log');
    utils.fetchSingleRecord(response.data._id, function (res){
      if (res.status >= 200 && res.status < 300 ){
        console.log('Found record, now i need to find the record in log and update it', response.data._id);
        var index = utils.findRecordIndexByID($scope.activity, response.data._id);
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
