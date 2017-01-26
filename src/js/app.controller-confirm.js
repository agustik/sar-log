function controllerConfirmModal($scope, $uibModalInstance, data){
  for (var key in data){
    $scope[key] = data[key];
  }

  $scope.ok = function (){
    $uibModalInstance.close();
  }
  $scope.cancel = function (){
    $uibModalInstance.dismiss('cancel');
  }
}
