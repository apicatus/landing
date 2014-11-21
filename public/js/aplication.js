///////////////////////////////////////////////////////////////////////////////
// Main Application                                                          //
///////////////////////////////////////////////////////////////////////////////
var Landing = angular.module('Landing', [
    'ui.bootstrap',
    'ui.bootstrap.tpls',
    'ui.router',
    'ui.utils',
    'ngAnimate',
    'restangular'
]);
Landing.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'RestangularProvider', function($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider) {
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    RestangularProvider.setRestangularFields({
        id: '_id'
    });
    RestangularProvider.setDefaultHeaders({
        'Content-Type': 'application/json'
    });
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('home', {
            url: '/',
            views: {
                'main': {
                    templateUrl: 'home.html',
                    controller: 'HomeCtrl as home'
                },
                'login': {
                    templateUrl: 'login.html',
                    controller: 'LoginCtrl as login'
                }
            }
        })
        .state('tos', {
            url: '/tos',
            views: {
                'main': {
                    templateUrl: 'tos.html',
                    controller: 'HomeCtrl as home'
                }
            }
        });

}]);
Landing.run(['$rootScope', '$state', 'Restangular', function($rootScope, $state, Restangular) {

    $rootScope.user = {
        name: 'Eltiro',
    }
    Restangular.oneUrl('user', 'http://api.apicat.us:8070/user/signin').customPOST({username: 'admin', password: 'admin'}).then(function(response){
        console.log(response)
    });

}]);
Landing.controller('HomeCtrl', ['$scope', function($scope){
}]);
Landing.controller('LoginCtrl', ['$scope', '$window', function($scope, $window){
    console.log('LoginCtrl');

    this.state = 'continue';
    this.recover = function() {
        this.state = 'recover';
    };
    this.goAuth = function(provider) {
        $window.location.assign('/auth/' + provider);
    };

}]);
Landing.controller('MainCtrl', ['$scope', function($scope) {
    console.log("started")
}]);
