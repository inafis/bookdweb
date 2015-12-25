/**
 * Created by Jonfor on 12/24/15.
 */
module.exports = function ($http, auth, $q) {
    var o = {};
    o.addNotification = function (id, content, type, sendEmail) {
        var body = {
            id: id,
            content: content,
            type: type,
            sendEmail: sendEmail
        };
        return $http.post('/user/notifications/create', body, {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).then(function (response) {
            return response.data;
        }, function (err) {
            handleError(err);
            return err.data;
        });
    };

    o.getAllNotifications = function () {
        return $http.get('/user/notifications', {
            headers: {Authorization: 'Bearer ' + auth.getToken()}
        }).then(function (response) {
            return response.data;
        }, function (err) {
            handleError(err);
            return err.data;
        });
    };

    return o;

    // I transform the error response, unwrapping the application dta from
    // the API response payload.
    function handleError(response) {
        // The API response from the server should be returned in a
        // normalized format. However, if the request was not handled by the
        // server (or what not handles properly - ex. server error), then we
        // may have to normalize it on our end, as best we can.
        if (!angular.isObject(response.data) || !response.data.message) {
            return ( $q.reject('An unknown error occurred.') );
        }
        // Otherwise, use expected error message.
        return ( $q.reject(response.data.message) );
    }
};