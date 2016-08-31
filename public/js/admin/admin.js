
var app = angular.module("Admin", []);

// Library directive - html Element
app.directive("admin", [function (){
    return {
        restrict: 'E',
        templateUrl: 'http://localhost:3000/views/admin.html',
        scope: false,
        link: {
            pre: function(scope, element, attr) {

                // Load accounts and requests
                scope.loadAccounts();
                scope.loadRequests();

            },
            post: function(scope, element, attr) {

                // Variables used for sort and search functionality
                scope.sortTypeAcc = '';
                scope.sortReverseAcc = false;
                scope.sortTypeReq = '';
                scope.sortReverseReq = false;
                scope.searchTerm = '';

            }
        }
    };
}]);

// Library controller
app.controller("AdminCtlr", function($scope, $http){

    // Update sort variables
    $scope.updateSortAcc = function(sortBy){
        if ($scope.sortTypeAcc == sortBy)
            $scope.sortReverseAcc = !$scope.sortReverseAcc;
        else
            $scope.sortReverseAcc = false;
        $scope.sortTypeAcc = sortBy;
    };

    // Update sort variables
    $scope.updateSortReq = function(sortBy){
        if ($scope.sortTypeReq == sortBy)
            $scope.sortReverseReq = !$scope.sortReverseReq;
        else
            $scope.sortReverseReq = false;
        $scope.sortTypeReq = sortBy;
    };

    // Populate the list of songs
    $scope.loadAccounts = function(){
        var url = 'http://localhost:3000/api/accounts';
        $http.get(url).then(function(response){
            console.log(response);
            $scope.accounts = response.data;
        }, function(error){
            console.log(error);
        });
    };

    // Populate the list of songs
    $scope.loadRequests = function(){
        var url = 'http://localhost:3000/api/requests';
        $http.get(url).then(function(response){
            console.log(response);
            $scope.requests = response.data;
        }, function(error){
            console.log(error);
        });
    };

    $scope.approveAccount = function(account){
        var id = account.a._id;
        var url = 'http://localhost:3000/api/accounts/' + id + '/approve/';
        $http.get(url).then(function(response){
            console.log(response);
            $scope.loadAccounts();
        }, function(error){
            console.log(error);
        });
    };

    $scope.denyAccount = function(account){
        var id = account.a._id;
        var url = 'http://localhost:3000/api/accounts/' + id + '/deny/';
        $http.get(url).then(function(response){
            console.log(response);
            $scope.loadAccounts();
        }, function(error){
            console.log(error);
        });
    };

    $scope.approveRequest = function(request){
        var id = request.r._id;
        var url = 'http://localhost:3000/api/requests/' + id + '/approve/';
        var data = {
            aid: request.a._id
        };
        $http.post(url, data).then(function(response){
            console.log(response);
            $scope.loadRequests();
        }, function(error){
            console.log(error);
        });
    };
});
