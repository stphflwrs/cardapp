'use strict';

angular
    .module('cardapp')
    .controller('SimulateCtrl', SimulateCtrl);

SimulateCtrl.$inject = ['GamesService'];

function SimulateCtrl(GamesService) {
    var vm = this;

    // View model

    vm.test = "Hello world";

    activate();

    // View methods

    // Private methods

    function activate() {
        
    }
}