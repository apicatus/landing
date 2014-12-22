///////////////////////////////////////////////////////////////////////////////
// Main Application                                                          //
///////////////////////////////////////////////////////////////////////////////
var Landing = angular.module('Landing', [
    'ui.bootstrap',
    'ui.bootstrap.tpls',
    'ui.router',
    'ui.utils',
    'ngAnimate',
    'restangular',
    'duScroll'
]);
Landing.constant('skrollr', skrollr);
Landing.constant('Modernizr', Modernizr);
Landing.constant('Trianglify', Trianglify);
Landing.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'RestangularProvider', function($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider) {
    //$locationProvider.html5Mode(true);
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
                'nav': {
                    templateUrl: 'nav.html',
                },
                'footer': {
                    templateUrl: 'footer.html',
                },
                'login': {
                    templateUrl: 'login.html',
                    controller: 'LoginCtrl as login'
                }
            }
        })
        .state('features', {
            url: '/features',
            views: {
                'main': {
                    templateUrl: 'tos.html',
                    controller: 'HomeCtrl as home'
                },
                'nav': {
                    templateUrl: 'nav-simple.html',
                },
                'footer': {
                    templateUrl: 'footer.html',
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
                },
                'nav': {
                    templateUrl: 'nav-simple.html',
                },
                'footer': {
                    templateUrl: 'footer.html',
                },
                'login': {
                    templateUrl: 'login.html',
                    controller: 'LoginCtrl as login'
                }
            }
        });

}]);
// http://stackoverflow.com/questions/23715337/integrating-skrollr-w-angularjs-single-page-app
Landing.directive('skrollr', function() {
    var directiveDefinitionObject = {
        link: function(scope, element, attrs) {
            var skrl = skrollr.init({
                forceHeight: false
            });
            setTimeout(function(){
                skrl.refresh();
            }, 500);
            //This will watch for any new elements being added as children to whatever element this directive is placed on. If new elements are added, Skrollr will be refreshed (pulling in the new elements
           scope.$watch(
               function () { return element[0].childNodes.length; },
               function (newValue, oldValue) {
               if (newValue !== oldValue) {
                    skrl = skrollr.init({
                        forceHeight: false
                    });
                    skrl.refresh();
               }
           });
        }
    };
    if(Modernizr.mq('only screen and (min-width: 800px)')){
        return directiveDefinitionObject;
    } else {
        return {};
    }
});
Landing.directive('trianglify', ['$interval', function($interval){
    function scale(valueIn, baseMin, baseMax, limitMin, limitMax) {
        return ((limitMax - limitMin) * (valueIn - baseMin) / (baseMax - baseMin)) + limitMin;
    }
    return {
        restrict: 'A',
        scope: {
            cellsize: '@',
            bleed: '@',
            cellpadding: '@',
            noiseIntensity: '@',
            txGradient: '=',
            tyGradient: '=',
            fillOpacity: '@',
            strokeOpacity: '@'
        },
        link: function(scope, element, attrs) {
            console.log("scope", scope);
            var polygons = new Trianglify({
                cellsize: scope.cellsize,
                bleed: scope.bleed,
                cellpadding: scope.cellpadding,
                noiseIntensity: scope.noiseIntensity || 0,
                x_gradient: scope.txGradient,
                y_gradient: scope.tyGradient,
                fillOpacity: scope.fillOpacity || 1,
                strokeOpacity: scope.strokeOpacity || 1
            });
            var pattern = polygons.generate(element.width(), element.height());
            element.css('background-image', pattern.dataUrl);
        }
    };
}]);
Landing.run(['$rootScope', '$state', 'Restangular', function($rootScope, $state, Restangular) {
    $rootScope.$on('$stateChangeSuccess',function(){
        $("html, body").animate({ scrollTop: 0 }, 200);
    });
    $rootScope.$on('duScrollspy:becameActive', function($event, $element){
        $('nav.menu > input[type=checkbox]').removeAttr('checked');
    });
}]);
Landing.controller('HomeCtrl', ['$scope', function($scope){
    var home = this;
    home.login = {};
    home.login.state = 'continue';

    home.login.recover = function() {
        home.login.state = 'recover';
    };
}]);
Landing.controller('LoginCtrl', ['$scope', '$window', function($scope, $window){
    this.state = 'continue';
    this.recover = function() {
        this.state = 'recover';
    };
}]);
Landing.controller('MainCtrl', ['$rootScope', '$scope', '$window', function($rootScope, $scope, $window){
    this.goAuth = function(provider) {
        $window.location.assign('/auth/' + provider);
    };
}]);
