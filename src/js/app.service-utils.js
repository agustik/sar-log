function serviceUtils($http, $rootScope, $uibModal, webStorage, Notification){

  function returnName( obj ){

    if (obj.name) return obj.name;

    return obj;
  }

  function deleteFromWebStorage(record){
    // Use epoch to find record and then delete it from webstorage


    var epoch = record.epoch;

    var records = webStorage.get( $rootScope.recordsToSyncKey) || [];

    var recordsToSave = [];

    records.forEach(function (item){

      if (item.data.epoch !== epoch){
        recordsToSave.push(item);
      }
    });

    $rootScope.recordsToSync = recordsToSave;

    webStorage.set( $rootScope.recordsToSyncKey, recordsToSave)


  }


  return {
    fetchAggrigate : function(field, callback){

    var data = {
       "size": 0,
       "aggs": {
         "request": {
           "terms": {
             "field": field + ".keyword",
             "size" : 200
           }
         }
       }
     };


     var offlineKey = field + '::fetchAggrigate';

     var url =  [ $rootScope.es_server , $rootScope.es_index, $rootScope.es_type, '_search' ].join('/');
     $http({
       method : 'POST',
       url : url,
       data : data
     }).then(function success(res){
       console.log(res);
       if (res.status > 300) return callback(res);

       webStorage.set(offlineKey, res);

       callback(null, res);

     }, function (err){

       Notification.warning('Could not fetch from server, using local cache');

       var res = webStorage.get(offlineKey)

       if (!res) return callback(err);

       callback(null, res);
     });
   },

   syncRecord: function (data, callback){
     this.submitElasticsearch(data, "", function (err, res){

       if (err) return callback(err);


       deleteFromWebStorage(data);
       $rootScope.$emit('sar::removeRecord', data);
       $rootScope.$emit('sar::newRecord', { request: data, response: res });

       callback(null, res);


     });
   },
   submitElasticsearch : function(data, id, callback){
     var url = [ $rootScope.es_server , $rootScope.es_index, $rootScope.es_type, id ].join('/');
     $http({
       method : 'POST',
       url : url,
       data : data
     }).then(function success(res){

       if (res.status > 300) return callback(res);

       callback(null, res);

     }, callback);
   },
   fetchLog : function(callback){
      var url =  [ $rootScope.es_server , $rootScope.es_index, $rootScope.es_type, '_search' ].join('/');
      var query = {
        size:500,
        sort : [
          {
            created : {
              order : "desc"
            }
          }
        ],
        query : {
          match_all : { }
        }
      };



      var offlineFetchLogKey = 'sar::fetchLogKey';
      $http({
        method : 'POST',
        url : url,
        data: query,
      }).then(function success(res){

        if (res.status > 300) return callback(res);
        webStorage.set(offlineFetchLogKey, res);

        callback(null, res);

      }, function (err){

        Notification.warning('Could not fetch from server, using local cache');


        var offlineCache = webStorage.get(offlineFetchLogKey);

        if (!offlineCache) return callback(err);

        callback(null, offlineCache);


      });
    },
    fetchSingleRecord: function(id, callback){
      var url =  [ $rootScope.es_server , $rootScope.es_index, $rootScope.es_type, id ].join('/');
      $http({
        method : 'GET',
        url : url,
      }).then(function success(res){

        if (res.status > 300) return callback(res);

        callback(null, res);

      }, callback);

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
      }).then(function success(res){

        if (res.status > 300) return callback(res);

        callback(null, res);

      }, callback);
    },
    deleteRecord : function (id, callback){
      var url =  [ $rootScope.es_server , $rootScope.es_index, $rootScope.es_type, id ].join('/');
      $http({
        method : 'DELETE',
        url : url
      }).then(function success(res){

        if (res.status > 300) return callback(res);

        $rootScope.$emit('sar::deleteRecord', { id : id });

        callback(null, res);

      }, callback);

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
    findRecordIndexByEpoch : function(arr, epoch){
      var index = null;
      arr.forEach(function (item, key){
        if (item._source.epoch === epoch) {
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
