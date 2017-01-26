var app = angular.module('sar-log', [
  'ui.select',
  'ngSanitize',
  'ui.bootstrap'
]);


app.run([ '$rootScope', function ($rootScope){



  for (var key in config){
    $rootScope[key] = config[key];

  }

  $rootScope.config = config;

}]);

app.controller('createLog', ['$scope', '$http', '$timeout','$rootScope', 'utils',  '$uibModalInstance', 'data', controllerCreateLog ]);
app.controller('displayLog', ['$scope', '$http', '$timeout','$rootScope', '$uibModal', 'utils', controllerDisplayLog ]);
app.controller('addUserModal', ['$scope', '$http', '$uibModalInstance','data','utils', '$rootScope', controllerAddUserModal]);


app.controller('confirmModal', ['$scope', '$uibModalInstance','data', controllerConfirmModal]);

app.service('utils', ['$http','$rootScope', '$uibModal', serviceUtils]);
