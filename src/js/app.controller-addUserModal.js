

function controllerAddUserModal($scope, $http, $uibModalInstance,  data, utils, $rootScope, Notification){

  $scope.name= data._source.name;


  $scope.showSubmit = false;

  $scope.$watchCollection('form', function (_old, _new){


    if ($scope.form.users.length > 0){
      return $scope.showSubmit = true;
    }

    $scope.showSubmit = false;

  })

  $scope.add = function (string){

    var form = angular.copy($scope.form);

    if (form.users.length < 1)  {
      console.log('No users to add');
      return $uibModalInstance.close();
    }

    data._source.users.forEach(function (user){
      form.users.push({ name : user});
    });

    var d = utils.transFormTags(form);

    var id = data._id;
    var requestData = {
          "doc" : d
    };

    utils.updateRecord(id, requestData, function (err, res){

      if (err){
        Notification.warning('Could not update record');
        return console.error(err);
      }

      $rootScope.$emit('sar::updateRecord', { request :  requestData, response : res});

      $uibModalInstance.close();
    });
  };

  $scope.quickAdd = function (user){
    var id = data._id;

    var requestData = {
      "script" : {
          "inline": "ctx._source.users.add(params.user)",
          "params" : {
              "user" : user
          }
      }
    };

    utils.updateRecord(id, requestData, function (err, res){
      if (err){
        Notification.warning('Could not add user: ' + user );
        return console.error(err);
      }

      Notification.success('Added ' + user + ' to log')

      console.log('Need to remove', user , ' from list.. ');

      $scope.activeUsers.forEach(function (item, key){
        if (item.name === user){
          $scope.activeUsers.splice(key, 1);
        }
      });

      $rootScope.$emit('sar::updateRecord', { request :  requestData, response : res});
    });
  };

  $scope.users = [];

  $scope.form = {
    users : []
  };

  $scope.activeUsers = [];

  function existsArray(array, item){
    return (array.indexOf(item) > -1 );
  }


  function removeAlreadyRegistered(newData, oldData){
    return newData.filter(function (item){
      return ! existsArray(oldData, item);
    });
  }


  function fetchUsers(){
    var users = [];
    utils.fetchAggrigate('users', function (err, res){
      if (err) return console.error(err);

      users = utils.getBucketsKeys(res.data.aggregations);
      users = removeAlreadyRegistered( users, data._source.users);

      $scope.users = utils.parseTags(users);

      $scope.activeUsers = $scope.users.slice(0,15);

    });
  }

  fetchUsers();

  $scope.createTag = function (string){
    return { name : string };
  };
  $scope.close = function (){
    $uibModalInstance.close();
  };


}
