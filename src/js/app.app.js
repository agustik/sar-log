var app = angular.module('sar-log', [
  'ui.select',
  'ngSanitize',
  'ui.bootstrap'
]);


app.run([ '$rootScope', '$log', function ($rootScope, $log){

  for (var key in config){
    $rootScope[key] = config[key];

  }

  $rootScope.eventsToProxy = ['sar::newRecord', 'sar::updateRecord'];


  $rootScope.config = config;

  var socket = io(config.websocketServer);

  socket.on('webSocketProxy', function (eventName ,eventData){
    $log.info('webSocketProxy', eventName);
    $rootScope.$emit(eventName, eventData, 'proxy');
  });


  $rootScope.eventsToProxy.forEach(function (eventName){
    $rootScope.$on(eventName, function (ev, eventData, type){
      if (type === 'proxy')  return;
      $log.info('Anglar Event to Proxy', eventName);
      socket.emit('webSocketProxy', eventName, eventData);
    });
  });
}]);

app.controller('createLog', ['$scope', '$http', '$timeout','$rootScope', 'utils',  '$uibModalInstance', 'data', controllerCreateLog ]);
app.controller('displayLog', ['$scope', '$http', '$timeout','$rootScope', '$uibModal', 'utils', controllerDisplayLog ]);
app.controller('addUserModal', ['$scope', '$http', '$uibModalInstance','data','utils', '$rootScope', controllerAddUserModal]);


app.controller('confirmModal', ['$scope', '$uibModalInstance','data', controllerConfirmModal]);

app.service('utils', ['$http','$rootScope', '$uibModal', serviceUtils]);
