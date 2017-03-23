var app = angular.module('sar-log', [
  'ui.select',
  'ngSanitize',
  'ui.bootstrap',
  'ui-notification',
  'webStorageModule'
]);


app.run([ '$rootScope', '$log', 'Notification', 'webStorage', function ($rootScope, $log, Notification, webStorage){

  for (var key in config){
    $rootScope[key] = config[key];

  }

  $rootScope.recordsToSyncKey = 'sar::recordsToSync';


  var _recordsToSync = webStorage.get($rootScope.recordsToSyncKey);

  if (!Array.isArray(_recordsToSync)){
    $rootScope.recordsToSync = [];
  }else{
    $rootScope.recordsToSync = _recordsToSync;
  }

  $rootScope.eventsToProxy = ['sar::newRecord', 'sar::updateRecord'];


  $rootScope.config = config;

  var socket = io(config.websocketServer);

  socket.on('webSocketProxy', function (eventName ,eventData){
    $log.info('webSocketProxy', eventName);
    $rootScope.$emit(eventName, eventData, 'proxy');
  });

  socket.on('reconnect', function (number){
    $log.info('Webscoket - reconnect', number);
    $rootScope.$emit('server::reconnect');
    Notification.success('Reyni að tengjast þjóni...');
  });

  socket.on('connect', function (){
    Notification.success('Tengdur!');
  });

  socket.on('server::reload', function (eventData){
    console.log('Server sent reload all command');
    $rootScope.$emit('server::reload');
  });

  socket.on('disconnect', function (){
    Notification.error('Missti teningu við þjón');
  });

  socket.on('reconnecting', function (attempt){
    Notification.info('Endurtengist.. '+ attempt);
  });

  $rootScope.$on('sar::postError', function (ev, eventData){
    console.log('sar::postError', eventData);
    Notification.warning('Gat ekki búið til skráningu, vista skráning til þess að senda síðar');



    var recordsToSync = webStorage.get($rootScope.recordsToSyncKey) || [];

    recordsToSync.push(eventData);
    $rootScope.recordsToSync = recordsToSync;

    webStorage.set($rootScope.recordsToSyncKey, recordsToSync);


  });


  $rootScope.eventsToProxy.forEach(function (eventName){
    $rootScope.$on(eventName, function (ev, eventData, type){
      if (type === 'proxy')  return;
      $log.info('Anglar Event to Proxy', eventName);
      socket.emit('webSocketProxy', eventName, eventData);
    });
  });
}]);

app.config(['NotificationProvider', function (NotificationProvider){
  /*NotificationProvider.setOptions({
    delay: 10000,
    startTop: 20,
    startRight: 10,
    verticalSpacing: 20,
    horizontalSpacing: 20,
    positionX: 'left',
    positionY: 'bottom'
  });*/
}]);

app.controller('createLog', ['$scope', '$http', '$timeout','$rootScope', 'utils',  '$uibModalInstance', 'data', controllerCreateLog ]);
app.controller('displayLog', ['$scope', '$http', '$timeout','$rootScope', '$uibModal', 'utils', 'webStorage', controllerDisplayLog ]);
app.controller('addUserModal', ['$scope', '$http', '$uibModalInstance','data','utils', '$rootScope', controllerAddUserModal]);

app.controller('syncRecords', ['$scope', '$rootScope', 'webStorage', 'utils', '$uibModalInstance', 'Notification',  controllerSyncRecords]);

app.controller('confirmModal', ['$scope', '$uibModalInstance','data', controllerConfirmModal]);

app.service('utils', ['$http','$rootScope', '$uibModal', 'webStorage', 'Notification', serviceUtils]);
app.filter('orderByObject', [filterOrderByObject]);
