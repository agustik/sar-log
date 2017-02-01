function controllerSyncRecords($scope, $rootScope, webStorage, utils, $uibModalInstance, Notification){

  $scope.close = function (){
    $uibModalInstance.close();
  };

  $scope.recordsToSync = webStorage.get( $rootScope.recordsToSyncKey) || [];


  $scope.syncRecord = function (record, index){



    var postData = angular.copy(record.data);


    if (record.synced) return console.log('Already synced');
    record.syncing = true;

    utils.syncRecord(postData, function (err, res){
      if (err){
        record.syncing = false;
        record.syncError = true;

        return console.error('Error', err);
      }

      record.synced = true;

      $uibModalInstance.close();

    })
  };

  $scope.syncAllRecords = function (){

  }




};
