angular.module('cc.profile-controller', [])
    .controller('ProfileCtrl', ['$scope', 'auth', 'user', '$location', '$sce', 'FileUploader', '$state', '$stateParams',
        function ($scope, auth, user, $location, $sce, FileUploader, $state, $stateParams) {
            $scope.hoveringOver = function (value) {
                $scope.overStar = value;
                $scope.percent = 100 * (value / $scope.max);
            };
            $scope.max = 5;
            $scope.isReadonly = false;
            $scope.rate = 2.5;
            user.get($stateParams.username).then(function (data) {
                $scope.user = data.user;
            });
        }]);