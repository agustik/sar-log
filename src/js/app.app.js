var app = angular.module('sar-log', [
  'ui.select',
  'ngSanitize',
  'ui.bootstrap'
]);


app.controller('elasticsearch', ['$scope', controllerElasticsearch ]);
