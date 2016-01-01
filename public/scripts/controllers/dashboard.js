'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('cardapp')
  .controller('DashboardCtrl', function($scope, $state) {

    $scope.$state = $state;

  });
