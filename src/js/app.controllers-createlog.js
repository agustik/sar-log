/*

*/

function controllerCreateLog($scope, $http, $timeout, $rootScope, utils ){
  $scope.datepickerOpen = false;

  $scope.format = "dd.MM.yyyy HH:mm";

  $scope.users = [];
  $scope.tags = [];

  function createID(){
    var d = new Date();

    var id = d.getTime() / 1000;
    return id.toFixed();
  }

  $scope.createTag = function (string){
    return { name : string };
  };

  function defaultForm () {
    return {
      timestamp : new Date(),
      hours : 1
    };
  }
  $scope.form = defaultForm();

  function fetchUsers(){
    var users = [];
    utils.fetchAggrigate('users', function (res){
      if (res.status == 200){
        users = utils.getBucketsKeys(res.data.aggregations);
        $scope.users = utils.parseTags(users);
      }
    });
  }

  function fetchTags(){
    var tags = [];
    utils.fetchAggrigate('tags', function (res){
      if (res.status == 200){
        tags = utils.getBucketsKeys(res.data.aggregations);
        $scope.tags = utils.parseTags(tags);
      }
    });
  }


  fetchUsers();
  fetchTags();

  $scope.postLog = function (){

    var id = createID();
    //$scope.form._id = createID();
    $scope.form.created = new Date();

    var postData = utils.transFormTags($scope.form);
    utils.submitElasticsearch(postData, id, function (res){
      console.log('Res from post', res);

      if (res.status >= 200 && res.status < 300){
        $scope.form = defaultForm();
        $timeout(function (){
          fetchUsers();
          fetchTags();
        }, 1000);

        $rootScope.$emit('sar::newlog', postData, res);
      }
    });
  }




}
