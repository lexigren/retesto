//MainCtrl.js

angular.module('app').controller('MainCtrl',function($scope,CRUDRequest,$timeout, Identity, Notifier){


    CRUDRequest.query("latest").$promise.then(function (result) {
        $scope.items = result;
        $scope.isFirstRun=Identity.isFirstRun();
    }, function (reason) {
        Notifier.error(reason.data.reason);
    });

    //видалення привітання після кліку по ньому мишею
    $(".greetSplash").on("click", function () {
        $(this).css({
            opacity:0
        });
        $timeout(function () {
            $(this).remove();
        }.bind(this),1900)
    })

});