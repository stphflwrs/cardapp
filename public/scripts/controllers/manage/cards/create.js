angular.module('cardapp')
	.controller('CardsCreateCtrl', function($scope, $state, CardsService) {
		$scope.display = false;

		$scope.card = {};

		$scope.saveCard = function() {
			CardsService.createCard($scope.card).then(
				function successCallback(data) {
					$state.go('cards');
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		$scope.revert = function() {
			$scope.card = {};
		}

		var init = function() {

		};

		init();
	});