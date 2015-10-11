angular.module('cc', ['ui.router',
    'cc.config',
    'cc.main-controller',
    'cc.auth-controller',
    'cc.nav-controller',
    'cc.account-controller',
    'cc.auth-factory',
    'cc.business-factory',
    'cc.profile-controller',
    'cc.user-factory',
    'angularFileUpload',
    'cc.thumb-directive',
    'cc.landing-controller',
    'ui.bootstrap',
    'cc.modalInstance',
    'ngGeolocation',
    'cloudinary',
    'cc.location-factory',
    'google.places',
    'cc.bizlist-controller',
    'cc.business-controller',
    'ui.calendar',
    'cc.claim-controller',
    'cc.admin-controller',
    'cc.admin-service',
    'cc.search-controller',
    'cc.dashboard-controller',
    'cc.socket-service',
    'angularjs-dropdown-multiselect',
    'angularMoment',
    'stripe.checkout',
    'cc.appointments-controller'
])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {
            $locationProvider.html5Mode(true);
            $stateProvider
                .state('landing', {
                    url: '/',
                    templateUrl: 'partials/landing2.html',
                    controller: 'LandingCtrl'
                })
                .state('feed', {
                    url: '/feed',
                    templateUrl: 'partials/feed.html',
                    controller: 'MainCtrl',
                    onEnter: ['$state', 'auth', function ($state, auth) {
                        if (!auth.isLoggedIn()) {
                            $state.go('login');
                        }
                    }]
                })
                //.state('bizlist', {
                //    url: '/category/{cat}/{location}',
                //    templateUrl: 'partials/bizlist.html',
                //    controller: 'bizlistCtrl'
                //    // resolve: {
                //    //   businesses:['$http','$stateParams',function($http,$stateParams){
                //    //     var cat = $stateParams.cat;
                //    //     var location = $stateParams.location;
                //    //     return businesses = yelpService.search(cat,location);
                //    //   }]
                //    // }
                //})
                .state('business', {
                    url: '/business/{businessid}',
                    templateUrl: 'partials/business.html',
                    controller: 'businessCtrl',
                    resolve: {
                        business: ['$stateParams', 'businessFactory', function ($stateParams, businessFactory) {
                            return businessFactory.getBusiness($stateParams.businessid);
                        }]
                    }
                })
                //.state('login', {
                //    url: '/login',
                //    templateUrl: 'partials/login.html',
                //    controller: 'AuthCtrl',
                //    onEnter: ['$state', 'auth', function ($state, auth) {
                //        if (auth.isLoggedIn()) {
                //            $state.go('feed');
                //        }
                //    }]
                //})
                .state('register', {
                    url: '/register',
                    templateUrl: 'partials/register.html',
                    controller: 'AuthCtrl',
                    onEnter: ['$state', 'auth', function ($state, auth) {
                        if (auth.isLoggedIn()) {
                            $state.go('feed');
                        }
                    }]
                })
                .state('user', {
                    url: '/user/:username/profile',
                    templateUrl: 'partials/profile.html',
                    controller: 'ProfileCtrl',
                    onEnter: ['$state', 'auth', function ($state, auth) {
                        if (!auth.isLoggedIn()) {
                            $state.go('landing');
                        }
                    }]
                })
                .state('account', {
                    url: '/user/:username/account',
                    templateUrl: 'partials/account.html',
                    controller: 'AccountCtrl',
                    onEnter: ['$state', 'auth', function ($state, auth) {
                        if (!auth.isLoggedIn()) {
                            $state.go('landing');
                        }
                    }]
                })
                .state('partner',{
                    url:'/partner',
                    templateUrl:'partials/partner.html'
                    //controllers:'partnerCtrl'
                })
                .state('admin', {
                    url: '/admin',
                    templateUrl: 'partials/admin.html',
                    controller: 'AdminCtrl',
                    onEnter: ['$state', 'auth', function ($state, auth) {
                        if (!auth.currentUser().isAdmin) {
                            $state.go('landing');
                        }
                    }]
                    //resolve:{
                    //  pendingRequests:['$http','adminService', function($http,businessFactory){
                    //    var pendingRequests;
                    //    return pendingRequests = businessFactory.getRequests();
                    //  }]
                    //}
                })
                .state('dashboard', {
                    url: '/dashboard',
                    templateUrl: 'partials/dashboard.html',
                    controller: 'dashboardCtrl',
                    resolve: {
                        businesses: ['user', function (user) {
                            return user.getDashboard();
                        }]
                    }
                })
                .state('favorites', {
                    url: '/favorites',
                    templateUrl: 'partials/favorites.html',
                    //controller:'favoritesCtrl'
                    //resolve: {
                    //    appointments: ['user', function (user) {
                    //        return user.getDashboard();
                    //    }]
                    //}
                })
                .state('appointments', {
                    url: '/appointments',
                    templateUrl: 'partials/appointments.html',
                    controller: 'appointmentsCtrl',
                    resolve: {
                        appointments: ['user', function (user) {
                            return user.getUserAppts();
                        }]
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
        }]).run(function ($rootScope, auth, $templateCache, devHost, $modal, $geolocation, $http, $state, location, businessFactory) {
        $rootScope.currentUser = auth.currentUser();
        $rootScope.cloudinaryBaseUrl = 'http://res.cloudinary.com/dvvtn4u9h/image/upload/c_thumb,h_150,r_10,w_150/v';
        $rootScope.cloudinaryDefaultPic = 'http://res.cloudinary.com/dvvtn4u9h/image/upload/c_thumb,h_100,r_10,w_100/v1432411957/profile/placeholder.jpg';
        //  var socket = io.connect('//'+devHost+':8112');
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if (typeof(current) !== 'undefined') {
                $templateCache.remove(current.templateUrl);
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
