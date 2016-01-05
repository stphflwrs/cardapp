'use strict';

/**
 * @ngdoc function
 * @name yapp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of yapp
 */
angular.module('cardapp')
    .controller('LoginCtrl', function($scope, $state, UsersService) {
        $scope.username = undefined;
        $scope.password = undefined;

        $scope.submit = function() {
            UsersService.login($scope.username, $scope.password).then(
                function successCallback(data) {
                    $state.go('home');
                },
                function errorCallback(data) {
                    console.log(data);
                });

            return false;
        }

  });
