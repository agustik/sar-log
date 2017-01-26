function serviceUtils($http, $rootScope, $uibModal){

  function returnName( obj ){
    return obj.name;
  }


  return {
    fetchAggrigate : function(field, callback){

      var data = {
       "size": 0,
       "aggs": {
         "request": {
           "terms": {
             "field": field + ".keyword"
           }
         }
       }
     };
     var url =  [ $rootScope.es_server , $rootScope.es_index, $rootScope.es_type, '_search' ].join('/');
     $http({
       method : 'POST',
       url : url,
       data : data
     }).then(callback)
   },
   submitElasticsearch : function(data, id, callback){
     var url = [ $rootScope.es_server , $rootScope.es_index, $rootScope.es_type, id ].join('/');
     $http({
       method : 'POST',
       url : url,
       data : data
     }).then(callback);
   },
   fetchLog : function(callback){
      var url =  [ $rootScope.es_server , $rootScope.es_index, $rootScope.es_type, '_search' ].join('/');
      var query = ['q=*', 'size=200' ].join('&');
      var request = [url, query].join('?');
      $http({
        method : 'GET',
        url : request,
      }).then(callback);
    },
    fetchSingleRecord: function(id, callback){
      var url =  [ $rootScope.es_server , $rootScope.es_index, $rootScope.es_type, id ].join('/');
      $http({
        method : 'GET',
        url : url,
      }).then(callback);

    },
    getBucketsKeys: function(aggregations){
      var fn = function (item){ return item.key;  };
      return aggregations.request.buckets.map(fn);
    },
    parseTags: function(tags){
      return tags.map(function (tag){ return { name : tag }; });
    },
    updateRecord : function(id, data, callback){
      var url =  [ $rootScope.es_server , $rootScope.es_index, $rootScope.es_type, id , '_update' ].join('/');

      $http({
        method : 'POST',
        url : url,
        data : data
      }).then(callback);
    },
    deleteRecord : function (id, callback){
      var url =  [ $rootScope.es_server , $rootScope.es_index, $rootScope.es_type, id ].join('/');
      $http({
        method : 'DELETE',
        url : url
      }).then(callback);

    },
    transFormTags : function(formData){
      var object = {};
      for ( var key in formData ){
        var value = formData[key];
        if ( Array.isArray(value) ){
          object[key] = value.map(returnName);
        }else{
          object[key] = value;
        }
      }
      return object;
    },
    findRecordIndexByID : function(arr, id){
      var index = null;
      arr.forEach(function (item, key){
        if (item._id === id) {
          index = key;
        }
      });
      return index;
    },
    confirm : function (data){
      return $uibModal.open({
        templateUrl: 'templates/confirm.html',
        controller: 'confirmModal',
    
        resolve: {
          data: function () {
            return data;
          }
        }
      });

    }
 }
}
