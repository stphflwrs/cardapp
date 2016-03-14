'use strict';

/**
 * @ngdoc function
 * @name cardapp.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the cardapp
 */
angular.module('cardapp')
	.controller('RegisterCtrl', function ($scope, $state, UsersService) {
		$scope.username = undefined;
		$scope.password = undefined;
		$scope.passwordConfirm = undefined;

		$scope.errors = {};

		$scope.submit = function () {
			if ($scope.password == $scope.passwordConfirm) {
				UsersService.register($scope.username, $scope.password).then(
					function successCallback(data) {
						$state.go('home');
					},
					function errorCallback(data) {
						console.log(data);
					});
			}
			else {
				$scope.errors.password = "Passwords do not match";
			}
		};
	});