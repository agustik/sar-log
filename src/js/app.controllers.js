/*

*/

function controllerElasticsearch($scope, $http){
  $scope.es_index="bfa";
  $scope.es_type="useractivity";

  $scope.es_server = "http://localhost:9200";

  $scope.datepickerOpen = false;

  $scope.format = "dd.MM.yyyy HH:mm";

  $scope.users = [
    'Ágúst Ingi Kjartansson',
    'Björgvin Óli Ingvarsson',
    'Elvar Már Ölversson'
  ];


  function createID(){
    var d = new Date();

    var id = d.getTime() / 1000;
    return id.toFixed();
  }


  $scope.tags = [
    'foo',
    'bar',
    'baz'
  ];

  function defaultForm () {
    return {
      timestamp : new Date(),
      hours : 1
    };
  }


  $scope.form = defaultForm();


  $scope.fetchUsers = function (){

  };

  $scope.postLog = function (){
    console.log($scope.form);

    $scope.form._id = createID();

    submitElasticsearch($scope.form);

    $scope.form = defaultForm();
  }


  function submitElasticsearch(data, callback){
    var url = [ $scope.es_server , $scope.es_index, $scope.es_type ].join('/');

    console.log(data)
    //
    $http({

      method : 'POST',
      url : url,
      data : data
    } , function (err, res){
      console.log(err, res)
    })

    //
  }

}
