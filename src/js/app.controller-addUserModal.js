

function controllerAddUserModal($scope, $http, $uibModalInstance,  data, utils, $rootScope){

  $scope.name= data._source.name;
  $scope.add = function (string){


    // add existing users
    //
    //
    var form = angular.copy($scope.form);

    data._source.users.forEach(function (user){
      form.users.push({ name : user});
    })

    var d = utils.transFormTags(form);
    console.log(d, data);

    var id = data._id;
    var requestData = {
          "doc" : d
    };

    utils.updateRecord(id, requestData, function (res){
      console.log(res);

      $rootScope.$emit('sar::updateRecord', requestData, res);
    });
  };

  $scope.quickAdd = function (user){
    console.log(user);
    var id = data._id;

    var requestData = {
      "script" : {
          "inline": "ctx._source.users.add(params.user)",
          "params" : {
              "user" : user
          }
      }
    };

    utils.updateRecord(id, requestData, function (res){

      if (res.status >= 200 && res.status < 300){

        console.log('Need to remove', user , ' from list.. ');

        $scope.activeUsers.forEach(function (item, key){
          if (item.name === user){
            $scope.activeUsers.splice(key, 1);
          }
        });


        $rootScope.$emit('sar::updateRecord', requestData, res);
      }


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
    utils.fetchAggrigate('users', function (res){
      if (res.status == 200){
        users = utils.getBucketsKeys(res.data.aggregations);
        users = removeAlreadyRegistered( users, data._source.users);

        $scope.users = utils.parseTags(users);

        $scope.activeUsers = $scope.users.slice(0,15);
      }
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
