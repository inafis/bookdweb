global.$ = require('jquery');

var angular = require('angular');
require('angular-ui-router');

var app = angular.module('cc', ['ui.router',
    //'angularFileUpload',
    //'angularjs-dropdown-multiselect',
    //'angularMoment',
    //'cc.config',
    //'cc.modalInstance',
    //'cc.thumb-directive',
    //'cloudinary',
    //'google.places',
    'ngGeolocation',
    //'ngMap',
    //'stripe.checkout',
    //'timer',
    //'ui.calendar',
    'ui.bootstrap'
]);

app.constant('CLOUDINARY_BASE', 'http://res.cloudinary.com/dvvtn4u9h/image/upload/c_thumb,h_300,w_300/v')
    .constant('CLOUDINARY_Default', 'http://res.cloudinary.com/dvvtn4u9h/image/upload/c_thumb,h_300,w_300/v1432411957/profile/placeholder.jpg')
    .constant('localDevHost', 'localhost')
    .constant('devHost', 'dev.bookd.me')
    .constant('devPort', '8112');

require('./services');
require('./controllers');
require('./directives');

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $stateProvider
            .state('landing', {
                url: '/',
                templateUrl: 'partials/landing.html',
                controller: 'LandingCtrl'
            })
            .state('feed', {
                url: '/feed',
                templateUrl: 'partials/feed.html',
                controller: 'MainCtrl',
                resolve: {
                    isAuthenticated: function ($state, $q, auth) {
                        var redirect = false;
                        if (!auth.isLoggedIn()) {
                            redirect = true;
                            return $q.reject({
                                state: 'error'
                            });
                        }
                        return redirect;
                    }
                }
            })
            .state('business', {
                url: '/business/{businessid}',
                templateUrl: 'partials/business.html',
                controller: 'businessCtrl',
                resolve: {
                    business: ['$stateParams', 'businessFactory', function ($stateParams, businessFactory) {
                        return businessFactory.getBusiness($stateParams.businessid);
                    }],
                    isAuthenticated: function ($state, $q, auth) {
                        var redirect = false;
                        if (!auth.isLoggedIn()) {
                            redirect = true;
                            return $q.reject({
                                state: 'error'
                            });
                        }
                        return redirect;
                    }
                }
            })
            .state('user', {
                url: '/user/:id/profile',
                templateUrl: 'partials/profile.html',
                controller: 'ProfileCtrl',
                resolve: {
                    isAuthenticated: function ($state, $q, auth) {
                        var redirect = false;
                        if (!auth.isLoggedIn()) {
                            redirect = true;
                            return $q.reject({
                                state: 'error'
                            });
                        }
                        return redirect;
                    }
                }
            })
            .state('account', {
                url: '/user/:id/account',
                templateUrl: 'partials/account.html',
                controller: 'AccountCtrl',
                resolve: {
                    isAuthenticated: function ($state, $q, auth) {
                        var redirect = false;
                        if (!auth.isLoggedIn()) {
                            redirect = true;
                            return $q.reject({
                                state: 'error'
                            });
                        }
                        return redirect;
                    }
                }
            })
            .state('partner', {
                url: '/partner',
                templateUrl: 'partials/partner.html',
                controller: 'NavCtrl'
            })
            .state('admin', {
                url: '/admin',
                templateUrl: 'partials/admin.html',
                controller: 'AdminCtrl',
                resolve: {
                    isAuthenticated: function ($state, $q, auth) {
                        var redirect = false;
                        if (!auth.isLoggedIn()) {
                            redirect = true;
                            return $q.reject({
                                state: 'error'
                            });
                        }
                        return redirect;
                    }
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'partials/dashboard.html',
                controller: 'dashboardCtrl',
                resolve: {
                    businesses: ['user', function (user) {
                        return user.getDashboard();
                    }],
                    isAuthenticated: function ($state, $q, auth) {
                        var redirect = false;
                        if (!auth.isLoggedIn()) {
                            redirect = true;
                            return $q.reject({
                                state: 'error'
                            });
                        }
                        return redirect;
                    }
                }
            })
            .state('favorites', {
                url: '/favorites',
                templateUrl: 'partials/favorites.html'
            })
            .state('appointments', {
                url: '/appointments',
                templateUrl: 'partials/appointments.html',
                controller: 'appointmentsCtrl',
                resolve: {
                    appointments: ['user', function (user) {
                        return user.getUserAppts();
                    }],
                    isAuthenticated: function ($state, $q, auth) {
                        var redirect = false;
                        if (!auth.isLoggedIn()) {
                            redirect = true;
                            return $q.reject({
                                state: 'error'
                            });
                        }
                        return redirect;
                    }
                }
            })
            .state('search', {
                url: '/join',
                templateUrl: 'partials/search.html',
                controller: 'searchCtrl'
            })
            .state('about', {
                url: '/about',
                templateUrl: 'partials/about.html'
            })
            .state('contact', {
                url: '/contactUs',
                templateUrl: 'partials/contact.html'
            });
        $urlRouterProvider.otherwise('/');
    }]).run(function ($rootScope, auth, $templateCache, devHost, $geolocation, $http, $state, location, businessFactory, $controller) {
    OAuth.initialize('mPBNkFFrqBA1L6cT0C7og9-xdQM');
    $rootScope.currentUser = auth.currentUser();
    $rootScope.cloudinaryBaseUrl = 'http://res.cloudinary.com/dvvtn4u9h/image/upload/c_thumb,h_200,r_10,w_200/v';
    $rootScope.cloudinaryDefaultPic = 'http://res.cloudinary.com/dvvtn4u9h/image/upload/c_thumb,h_200,r_10,w_200/v1432411957/profile/placeholder.jpg';
    //  var socket = io.connect('//'+devHost+':8112');
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (typeof(current) !== 'undefined') {
            $templateCache.remove(current.templateUrl);
        }
    });
    $rootScope.$on('$stateChangeError', function (event, toState, toStateParams,
                                                  fromState, fromStateParams, error) {

        if (error) {
            $state.go('landing');
            var navViewModel = $rootScope.$new();
            $controller('NavCtrl', {$scope: navViewModel});
            navViewModel.open('md', 'landing');
        }

    });

    $rootScope.query = {
        location: null,
        term: null
    };
    if (!location.currPosition) {
        $geolocation.watchPosition({
            timeout: 60000,
            maximumAge: 250,
            enableHighAccuracy: true
        });
        $rootScope.myPosition = $geolocation.position;
        /**
         *
         * Watch for when the users location changes, make a call to the google maps api to
         * get information about the users current location.
         *
         * Auto populate that information in the query location object, to be displayed int he navbar.
         *
         */
        $rootScope.$watch('myPosition.coords.latitude', function (newVal, oldVal) {
            $rootScope.loadingLocation = true;
            if (newVal !== oldVal) {
                $rootScope.loadingLocation = false;
                $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='
                        + $rootScope.myPosition.coords.latitude + ','
                        + $rootScope.myPosition.coords.longitude)
                    .then(function (data) {
                        $rootScope.loadingLocation = false;
                        if (data) {
                            location.setPosition(data.data.results);
                            $rootScope.currLocation = location.currPosition;
                            $rootScope.query.location = $rootScope.currLocation.city;

                        }
                    });
            }
        });
    }
    /**
     *
     * Concatenates the query term and query location entered in the Navbar
     * to create the query string being sent to the Places API on the backend.
     *
     * If the typeOf the queryLocation is a string, (User typed it in) then concatenate
     * query.location with query.term
     *
     * If the typeOf the queryLocation is !string (an Object) then concatenate query.location.vicinity
     * with query.term
     *
     * @param query - Object with term and location properties. Location will either be a string or an object.
     */

    $rootScope.search = function (query) {
        $rootScope.fetchingQuery = true;
        var formattedQuery;
        if (typeof query.location === 'string') {
            formattedQuery = query.term + ' ' + query.location;
        } else {
            formattedQuery = query.term + ' ' + query.location.vicinity;
        }

        businessFactory.search(formattedQuery)
            .then(function (data) {
                $rootScope.fetchingQuery = false;
                if (!$state.is('feed')) {
                    $state.go('feed');
                }
            });
    };

    $rootScope.openMessages = function (size) {
        var modalInstance = $modal.open({
            //animation: $scope.animationsEnabled,
            templateUrl: 'messagesModal.html',
            controller: 'messagesModalCtrl',
            size: size,
            resolve: {
                //messages: function(){
                //    return
                //}
            }
        });
    };
});
