

function controllerDisplayLog($scope, $http, $timeout, $rootScope, $uibModal, utils, webStorage, Notification){


  $scope.activity = [];

  $scope.showSyncButton = false;

  $scope.order = "_source.epoch";

  $scope.orderFriendlyName = "Skráningu";


  $scope.asc = true;


  $scope.recordsToSyncCount = $rootScope.recordsToSync.length;

  if ($rootScope.recordsToSync.length > 0){
    $scope.showSyncButton = true;
  }

  $rootScope.$watchCollection('recordsToSync', function (_new, _old){

    if (_new.length > 0){
      $scope.showSyncButton = true;
    }else{
      $scope.showSyncButton = false;

    }
    $scope.recordsToSyncCount = _new.length;
  })

  $scope.setOrder = function (order, friendly){

    if (order === $scope.order) $scope.asc = !$scope.asc;

    $scope.order = order;
    $scope.orderFriendlyName = friendly;
  }

  $scope.syncRecords = function(){
    var modalInstance = $uibModal.open({
      templateUrl: 'templates/syncRecords.html',
      controller: 'syncRecords',
      size : 'lg'
    });

    modalInstance.result.then(function (selectedItem) {
      }, function () {
    });
  };

  $scope.syncRecord = function (record){


    var postData = angular.copy(record._source);

    delete postData.offline;


    if (record.synced) return console.log('Already synced');
    record.syncing = true;

    utils.syncRecord(postData, function (err, res){
      if (err){
        record.syncing = false;
        record.syncError = true;
        return console.error('Error', err);
      }
      record.synced = true;
    })
  };

  $rootScope.$on('server::reconnect', fetchAllData);


  $rootScope.$on('server::reload', fetchAllData);


  $rootScope.$on('sar::postError', fetchAllData);


  $rootScope.$on('sar::removeRecord', function (ev, record){
    var index = utils.findRecordIndexByEpoch($scope.activity, record.epoch);
    $scope.activity.splice(index, 1);
  });

  function fetchAllData(){
    utils.fetchLog(function (err, res){
      if (err) return console.error('Error', err);

      var records = res.data.hits.hits;

      var offlineRecords = webStorage.get( $rootScope.recordsToSyncKey) || [];


      offlineRecords.forEach(function (item){

        item.data.offline = true;


        var obj = {};

        obj._source = item.data;

        records.push(obj);

      });



      $scope.activity = records;

    });
  }


  fetchAllData();

  $rootScope.$on('sar::newRecord', function (ev, eventData){
    utils.fetchSingleRecord(eventData.response.data._id, function (err, res){
      if (err) return console.error('Error', err);
      $scope.activity.push(res.data);
    });
  });

  $rootScope.$on('sar::updateRecord', function (ev, eventData){
    utils.fetchSingleRecord(eventData.response.data._id, function (err, res){
      if (err) return console.error('Error', err);

      var index = utils.findRecordIndexByID($scope.activity, eventData.response.data._id);
      $scope.activity[index]= res.data;
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
      utils.deleteRecord(id, function (err, res){

        if (err) return console.error('Error', err);

        Notification.success('Record deleted');

        var index = utils.findRecordIndexByID($scope.activity, id);
        $scope.activity.splice(index, 1);
      });
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
