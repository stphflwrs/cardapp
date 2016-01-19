angular.module('cardapp')
	.controller('CardsCtrl', function($scope, CardsService) {
		$scope.display = false;

		$scope.cards = [];

		$scope.deleteCard = function(cardNumber) {
			var cardID = $scope.cards[cardNumber]._id;
			CardsService.deleteCard(cardID).then(
				function successCallback(data) {
					$scope.cards.splice(cardNumber, 1);
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		var init = function() {
			CardsService.retrieveCards().then(
				function successCallback(data) {
					$scope.cards = data;
				},
				function errorCallback(data) {
					console.log(data);
				});
		};

		init();
	});