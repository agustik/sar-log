var app = angular.module('sar-log', [
  'ui.select',
  'ngSanitize',
  'ui.bootstrap'
]);


app.run([ '$rootScope', function ($rootScope){
  $rootScope.es_index="bfa";
  $rootScope.es_type="useractivity";
  $rootScope.es_server = "http://localhost:9200";
}]);

app.controller('createLog', ['$scope', '$http', '$timeout','$rootScope', 'utils', controllerCreateLog ]);
app.controller('displayLog', ['$scope', '$http', '$timeout','$rootScope', '$uibModal', 'utils', controllerDisplayLog ]);
app.controller('addUserModal', ['$scope', '$http', '$uibModalInstance','data','utils', '$rootScope', controllerAddUserModal]);


app.controller('confirmModal', ['$scope', '$uibModalInstance','data', controllerConfirmModal]);

app.service('utils', ['$http','$rootScope', '$uibModal', serviceUtils]);
