/*

*/

function controllerCreateLog($scope, $http, $timeout, $rootScope, utils, $uibModalInstance, data ){
  $scope.datepickerOpen = false;
  $scope.isPosting = false;

  $scope.recordID= "";

  $scope.editRecord = false;
  if (data){
    $scope.form = loadExisting(angular.copy(data));
    $scope.recordID= data._id;
    $scope.editRecord = true;


  }else{
    $scope.form = defaultForm();
    data = {};
  }



  $scope.format = "dd.MM.yyyy HH:mm";

  $scope.users = [];
  $scope.tags = [];

  $scope.createTag = function (string){
    if (typeof string !== 'string') return {name : ""};
    return { name : string.toLowerCase() };
  };

  $scope.createUser = function (string){
    return { name : string };
  };

  function loadExisting(object){

    var obj = object._source;

    for (var key in obj){
      var value = obj[key];
      if (Array.isArray(value)){
        obj[key] = value.map(function (name) { return { name : name }});
      }
    }


    if (obj.timestamp){
      obj.timestamp = new Date(obj.timestamp);
    }

    return obj;
  }


  function defaultForm () {
    return {
      timestamp : new Date(),
      hours : 1
    };
  }

  function fetchUsers(){
    var users = [];
    utils.fetchAggrigate('users', function (err, res){

      if (err) return console.error('Error', err);

      users = utils.getBucketsKeys(res.data.aggregations);
      $scope.users = utils.parseTags(users);

    });
  }

  function fetchTags(){
    var tags = [];
    utils.fetchAggrigate('tags', function (err, res){

      if (err) return console.error('Error', err);

      tags = utils.getBucketsKeys(res.data.aggregations);
      $scope.tags = utils.parseTags(tags);

    });
  }


  fetchUsers();
  fetchTags();

  $scope.close = function (){
    $uibModalInstance.close();
  };
  $scope.submitted = false;
  $scope.postLog = function (){
    $scope.submitted = true;
    if ($scope.createLog.$invalid) return;

    var id = $scope.recordID;

    $scope.isPosting = true;

    if (!$scope.form.created){
      $scope.form.created = new Date();
    }

    $scope.form.edit = new Date();

    $scope.form.epoch = new Date().getTime();
    $scope.form.total_users = $scope.form.users.length;
    $scope.form.total_tags = $scope.form.tags.length;
    

    $scope.form.user_ids = $scope.form.user_ids  || [];
    $scope.form.user_ids = $scope.form.users.map(function (user){
      return slug(user.name, {lower: true});
    });

    $scope.form.total_hours = ( $scope.form.hours * $scope.form.users.length );

    var postData = utils.transFormTags($scope.form);
    utils.submitElasticsearch(postData, id, function (err, res){
      if (err){
        $rootScope.$emit('sar::postError', {data : postData, id : id });
        $uibModalInstance.close();
        return console.error('Error', err);
      }

      $uibModalInstance.close();

      if ( $scope.editRecord ){
        $rootScope.$emit('sar::updateRecord', { request: postData, response: res });
      }else{
        $rootScope.$emit('sar::newRecord',    { request: postData, response: res });
      }

    });
  }




}
