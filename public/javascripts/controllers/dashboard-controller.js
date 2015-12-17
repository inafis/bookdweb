module.exports = function ($scope, $state, auth, userFactory, businessFactory, uiCalendarConfig, $compile) {
    $scope.activeBusiness = {
        business: {}
    };
    if (userFactory.dashboard.length > 0) {
        $scope.businesses = userFactory.dashboard;
        $scope.activeBusiness.business = $scope.businesses[0];
        businessFactory.getAllAppointments($scope.activeBusiness.business._id)
            .then(function (response) {
                $scope.appointmentsMaster = response;
            });
    }
    var createEventsSources = function (appointments) {
        for (var appointmentIndex = 0; appointmentIndex < $scope.appointments.personalAppointments.length; appointmentIndex++) {
            var tempObj = {
                title: $scope.appointments.personalAppointments[appointmentIndex].title,
                start: $scope.appointments.personalAppointments[appointmentIndex].start.full,
                end: $scope.appointments.personalAppointments[appointmentIndex].end.full,
                appointment: $scope.appointments.personalAppointments[appointmentIndex]
            };
            if ($scope.appointments.personalAppointments[appointmentIndex].status !== 'pending') {
                $scope.personalEvents.push(tempObj);
            } else {
                $scope.pendingEvents.push(tempObj);
            }
        }
        for (var appointmentIndex = 0; appointmentIndex < $scope.appointments.businessAppointments.length; appointmentIndex++) {
            var tempObj = {
                title: $scope.appointments.businessAppointments[appointmentIndex].title,
                start: $scope.appointments.businessAppointments[appointmentIndex].start.full,
                end: $scope.appointments.businessAppointments[appointmentIndex].end.full,
                appointment: $scope.appointments.businessAppointments[appointmentIndex]
            };
            if ($scope.appointments.businessAppointments[appointmentIndex].status !== 'pending') {
                $scope.associateEvents.push(tempObj);
            }
        }
    };
    $scope.statusOne = {
        open: true
    };
    $scope.statusTwo = {
        open: true
    };
    $scope.statusThree = {
        open: true
    };
    $scope.statusCal = {
        open: true
    };
    $scope.calendarEmployees = [];
    $scope.customTexts = {
        buttonDefaultText: 'Select Calendars to View'
    };
    $scope.settings = {
        displayProp: 'name',
        idProp: '_id',
        externalIdProp: '_id',
        smartButtonMaxItems: 3,
        enableSearch: true,
        smartButtonTextConverter: function (itemText, originalItem) {
            return itemText;
        }
    };
    $scope.switchBusiness = function () {
        businessFactory.getAllAppointments($scope.activeBusiness.business._id)
            .then(function (response) {
                $scope.appointmentsMaster = response;
            });
    };
    $scope.dropdownEvents = {
        onItemSelect: function (item) {
            userFactory.getUserAppts(item._id)
                .then(function (response) {
                    console.log(response);
                });
            //make a call to get the users appointments based on item._id
        }
    };
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.changeTo = 'Hungarian';
    /* event source that pulls from google.com */
    //$scope.eventSource = {
    //    url: "https://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
    //    className: 'gcal-event',           // an option!
    //    currentTimezone: 'America/Chicago' // an option!
    //};
    /* event source that contains custom events on the scope */
    $scope.events = [
        {title: 'All Day Event', start: new Date(y, m, 1)},
        {title: 'Long Event', start: new Date(y, m, d - 5), end: new Date(y, m, d - 2)},
        {id: 999, title: 'Repeating Event', start: new Date(y, m, d - 3, 16, 0), allDay: false},
        {id: 999, title: 'Repeating Event', start: new Date(y, m, d + 4, 16, 0), allDay: false},
        {
            title: 'Birthday Party',
            start: new Date(y, m, d + 1, 19, 0),
            end: new Date(y, m, d + 1, 22, 30),
            allDay: false
        },
        {title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29), url: 'http://google.com/'}
    ];
    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, timezone, callback) {
        var s = new Date(start).getTime() / 1000;
        var e = new Date(end).getTime() / 1000;
        var m = new Date(start).getMonth();
        var events = [{
            title: 'Feed Me ' + m,
            start: s + (50000),
            end: s + (100000),
            allDay: false,
            className: ['customFeed']
        }];
        callback(events);
    };

    $scope.calEventsExt = {
        color: '#f00',
        textColor: 'yellow',
        events: [
            {
                type: 'party',
                title: 'Lunch',
                start: new Date(y, m, d, 12, 0),
                end: new Date(y, m, d, 14, 0),
                allDay: false
            },
            {
                type: 'party',
                title: 'Lunch 2',
                start: new Date(y, m, d, 12, 0),
                end: new Date(y, m, d, 14, 0),
                allDay: false
            },
            {
                type: 'party',
                title: 'Click for Google',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                url: 'http://google.com/'
            }
        ]
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function (date, jsEvent, view) {
        $scope.alertMessage = (date.title + ' was clicked ');
    };
    /* alert on Drop */
    $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
        $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function (sources, source) {
        var canAdd = 0;
        angular.forEach(sources, function (value, key) {
            if (sources[key] === source) {
                sources.splice(key, 1);
                canAdd = 1;
            }
        });
        if (canAdd === 0) {
            sources.push(source);
        }
    };
    /* add custom event*/
    $scope.addEvent = function () {
        $scope.events.push({
            title: 'Open Sesame',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            className: ['openSesame']
        });
    };
    /* remove event */
    $scope.remove = function (index) {
        $scope.events.splice(index, 1);
    };
    $scope.getDate = function () {
        var test = uiCalendarConfig.calendars['myCalendar1'].fullCalendar('getDate');
        console.log(test);
    };
    /* Change View */
    $scope.changeView = function (view, calendar) {
        console.log(calendar)
        var test = uiCalendarConfig.calendars[calendar].fullCalendar('getDate');
        var monthYear = moment(test).format('MM/YYYY');
        console.log(monthYear);
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };
    /* Change View */
    $scope.renderCalender = function (calendar) {
        if (uiCalendarConfig.calendars[calendar]) {
            uiCalendarConfig.calendars[calendar].fullCalendar('render');
        }
    };
    /* Render Tooltip */
    $scope.eventRender = function (event, element, view) {
        element.attr({
            'tooltip': event.title,
            'tooltip-append-to-body': true
        });
        $compile(element)($scope);
    };

    /* config object */
    $scope.uiConfig = {
        calendar: {
            height: 450,
            editable: true,
            header: {
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender
        }
    };
    $scope.changeLang = function () {
        if ($scope.changeTo === 'Hungarian') {
            $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
            $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
            $scope.changeTo = 'English';
        } else {
            $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            $scope.changeTo = 'Hungarian';
        }
    };
    /* event sources array*/
    $scope.eventSources = [];
    $scope.eventSources2 = [];
};
