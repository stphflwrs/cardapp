angular.module('cardapp')
	.controller('CardsUpdateCtrl', function($scope, $state, $stateParams, CardsService) {
		$scope.display = false;

		$scope.master = {};
		$scope.card = {};

		$scope.saveCard = function() {
			CardsService.updateCard($scope.card).then(
				function successCallback(data) {
					$state.go('cards');
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		$scope.revert = function() {
			$scope.card = angular.copy($scope.master);
		}

		var init = function(cardID) {
			CardsService.retrieveCard(cardID).then(
				function successCallback(data) {
					$scope.master = angular.copy(data);
					$scope.card = data;
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		init($stateParams.card_id);
	});