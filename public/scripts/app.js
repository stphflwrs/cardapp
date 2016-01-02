'use strict';

/**
 * @ngdoc overview
 * @name yapp
 * @description
 * # yapp
 *
 * Main module of the application.
 */
angular
    .module('cardapp', [
        'ui.router',
        'ngAnimate',
        'oc.lazyLoad',
        'ui.bootstrap'
    ])
    .config(function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {

        $ocLazyLoadProvider.config({
            debug:false,
            events:true
        });

        $urlRouterProvider.when('/management', '/management/cards');
        $urlRouterProvider.otherwise('/home');

        $stateProvider
            .state('base', {
              abstract: true,
              url: '',
              templateUrl: 'views/dashboard.html',
              controller: 'DashboardCtrl'
            })
            .state('home', {
              url: '/home',
              parent: 'base',
              templateUrl: 'views/dashboard/overview.html'
            })
            .state('cards', {
                url: '/cards',
                parent: 'base',
                templateUrl: 'views/manage/cards/index.html',
                controller: 'CardsCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/manage/cards/index.js',
                            'scripts/services/cards.js'
                            ]
                        });
                    }
                }
            })
            .state('cards-create', {
                url: '/cards/new',
                parent: 'base',
                templateUrl: 'views/manage/cards/create.html',
                controller: 'CardsCreateCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/manage/cards/create.js',
                            'scripts/services/cards.js'
                            ]
                        });
                    }
                }
            })
            .state('cards-update', {
                url: '/cards/edit/:card_id',
                parent: 'base',
                templateUrl: 'views/manage/cards/update.html',
                controller: 'CardsUpdateCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/manage/cards/update.js',
                            'scripts/services/cards.js'
                            ]
                        });
                    }
                }
            })
            .state('deck_types', {
                url: '/decktypes',
                parent: 'base',
                templateUrl: 'views/manage/deck_types/index.html',
                controller: 'DeckTypesCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/manage/deck_types/index.js',
                            'scripts/services/deck_types.js'
                            ]
                        });
                    }
                }
            })
            .state('deck_types-create', {
                url: '/deck_types/new',
                parent: 'base',
                templateUrl: 'views/manage/deck_types/create.html',
                controller: 'DeckTypesCreateCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/manage/deck_types/create.js',
                            'scripts/services/deck_types.js'
                            ]
                        });
                    }
                }
            })
            .state('deck_types-update', {
                url: '/decktypes/edit/:deck_type_id',
                parent: 'base',
                templateUrl: 'views/manage/deck_types/update.html',
                controller: 'DeckTypesUpdateCtrl',
                resolve: {
                    loadMyFiles: function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'cardapp',
                            files: [
                            'scripts/controllers/manage/deck_types/update.js',
                            'scripts/services/deck_types.js',
                            'scripts/services/cards.js'
                            ]
                        });
                    }
                }
            });


    //$stateProvider
    //  .state('base', {
    //    abstract: true,
    //    url: '',
    //    templateUrl: 'views/base.html'
    //  })
    //    .state('login', {
    //      url: '/login',
    //      parent: 'base',
    //      templateUrl: 'views/login.html',
    //      controller: 'LoginCtrl'
    //    })
    //    .state('home', {
    //      url: '/home',
    //      parent: 'base',
    //      templateUrl: 'views/dashboard.html',
    //      controller: 'DashboardCtrl'
    //    })
    //      .state('overview', {
    //        url: '/overview',
    //        parent: 'home',
    //        templateUrl: 'views/dashboard/overview.html'
    //      })
    //      .state('reports', {
    //        url: '/reports',
    //        parent: 'home',
    //        templateUrl: 'views/dashboard/reports.html'
    //      });

  });
