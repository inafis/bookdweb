module.exports = function ($scope, $state, auth, userFactory, businessFactory, uiCalendarConfig, $compile,
                           $uibModal, socketService, $rootScope, Notification,$interval,$timeout) {
    $scope.radioModel = 'Month';
    /**
     * The business currently selected by the Bookd Associate
     * @type {{business: {}}}
     */
    $scope.activeBusiness = {
        business: {}
    };

    $scope.animationsEnabled = true;
    /**
     * If the business owner has dashboards, store the data is businesses,
     * pre-select the first business in the array as the active business
     *
     */
    if (userFactory.dashboard.length > -1) {
        $scope.businesses = userFactory.dashboard;
        $scope.activeBusiness.business = $scope.businesses[0];
        socketService.emit('joinDashboardRoom', $scope.activeBusiness.business._id);
    }

    /**
     *
     * The arrays of events that will be passed to the eventsSources for the calender
     *
     * @type {Array}
     */
    $scope.events = [];

    /**
     * The filtered list is the list of employees who's calendars we want to view,
     * stored based on which business they are associated with.
     *
     * @type {Array}
     */
    $scope.filteredList = [];
    $scope.filteredList[$scope.activeBusiness.business.name] = {};

    /**
     *
     *
     * @type {{}}
     */
    $scope.masterList = {};
    /**
     *
     * Defines the eventsSources for the calendar.
     *
     * @type {{events: Array}}
     */

    $scope.$on('$destroy',function(){
        socketService.emit('leaveDashboardRoom',$scope.activeBusiness.business._id);
    });
    /**
     *
     *  These are toggles for each accordion group
     *
     *
     * @type {{open: boolean}}
     */
    $scope.statusOne = {
        open: true
    };
    $scope.statusTwo = {
        open: true
    };
    $scope.statusThree = {
        open: true
    };
    $scope.statusFour = {
        open: true
    };
    $scope.statusFive = {
        open: true
    };
    $scope.statusSix = {
        open: true
    };
    $scope.statusCal = {
        open: true
    };

    $scope.calendarEmployees = [];

    /**
     *
     * Removes a service from the business
     *
     * @param service - the service object
     * @param index - the index of the service object in the active business
     *
     * business - resolves the active business, send it into the modal
     */
    $scope.openRemoveServiceModal = function (service, index) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/partials/modals/removeServiceModal.html',
            controller: 'removeServiceModalCtrl',
            resolve: {
                serviceIndex: function () {
                    return index;
                },
                service: function () {
                    return service;
                },
                business: function () {
                    return $scope.activeBusiness.business;
                }
            }
        });

        modalInstance.result.then(function () {
            //when the modal returns the successful promise, we remove the service from the active business
            $scope.activeBusiness.business.services.splice(index, 1);
        }, function () {

        });
    };

    /**
     *
     * Opens the remove employee modal
     *
     *
     * @param employee - employee object
     * @param business - the active business to remove the employee from
     */
    $scope.removeEmployee = function (employee, business) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/partials/modals/removeEmployeeModal.html',
            controller: 'removeEmployeeModalCtrl',
            resolve: {
                employee: function () {
                    return employee;
                },
                businessObj: function () {
                    return business;
                }
            }
        });

        /**
         *
         * After the modal closes get the updated Business from the back-end
         * then update the active business to the business returned
         */
        modalInstance.result.then(function (businessId) {
            businessFactory.getBusinessInfo(businessId)
                .then(function (business) {
                    $scope.activeBusiness.business = business;
                });
        });
    };
    /**
     *
     * Opens a modal to add an employee to a business
     *
     *
     * @param business - the business object
     */
    $scope.openEmployee = function (business) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/partials/modals/addEmployeeModal.html',
            controller: 'addEmployeeModalCtrl',
            resolve: {
                businessInfo: function () {
                    return business;
                }
            }
        });
        /**
         *
         * After the modal closes get the updated Business from the back-end,
         * then update the active business to the business returned
         *
         */
        modalInstance.result.then(function (businessId) {
            businessFactory.getBusinessInfo(businessId)
                .then(function (business) {
                    $scope.activeBusiness.business = business;
                });
        }, function () {
            //console.log('Modal dismissed at: ' + new Date());
        });
    };
    /**
     *
     * Opens a modal to create a new service.
     *
     *
     */
    $scope.newService = function () {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/partials/modals/addServiceModal.html',
            controller: 'addServiceModalCtrl',
            resolve: {
                business: function () {
                    return $scope.activeBusiness.business;
                }
            }
        });
        /**
         *
         * Once the modal is closed we push the new service into the array of
         * services the active business has
         *
         */
        modalInstance.result.then(function (serviceResponse) {
            $scope.activeBusiness.business.services.push(serviceResponse);
        }, function () {

        });
    };
    /**
     * Open a modal to edit a service
     *
     * @param service - Service Object
     * @param serviceIndex - The index of the service to be removed in the business object
     *
     * We resolve the current business to be used in the modal
     */
    $scope.editService = function (service, serviceIndex) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/partials/modals/editServiceModal.html',
            controller: 'editServiceModalCtrl',
            resolve: {
                serviceIndex: function () {
                    return serviceIndex;
                },
                service: function () {
                    return angular.copy(service);
                },
                business: function () {
                    return $scope.activeBusiness.business;
                }
            }
        });
    };
    /**
     *
     * Opens a modal that allows employees to update their availability.
     *
     * @param size - the size of the modal
     */
    $scope.openAvailabilityModal = function (size,employee) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/partials/modals/updateAvailabilityModal.html',
            controller: 'updatedAvailabilityCtrl',
            backdrop: 'static',
            keyboard: false,
            size: size,
            resolve:{
                employee:function(){
                    return employee;
                },
                business: function () {
                    return $scope.activeBusiness.business
                }
            }
        });

    };
    /**
     * The default text that the select employee multi-select dropdown should show
     *
     * @type {{buttonDefaultText: string}}
     */
    $scope.customTexts = {
        buttonDefaultText: 'Filter by Employees'
    };

    /**
     *
     * Settings for the dropdown multiselect
     *
     * @type {{displayProp: string, idProp: string, externalIdProp: string, smartButtonMaxItems: number, enableSearch: boolean, showCheckAll: boolean, showUncheckAll: boolean, smartButtonTextConverter: Function}}
     */
    $scope.settings = {
        displayProp: 'name',
        idProp: '_id',
        externalIdProp: '_id',
        smartButtonMaxItems: 3,
        enableSearch: true,
        showCheckAll: false,
        showUncheckAll: false,
        smartButtonTextConverter: function (itemText, originalItem) {
            return itemText;
        }
    };

    /**
     *
     * Function fired when the Associate changes the active business,
     * switch the activeBusiness and then make a request for that businesses
     * appointments
     *
     * @param business
     */
    $scope.switchBusiness = function (business) {
        $scope.activeBusiness.business = business;
        socketService.emit('joinDashboardRoom', $scope.activeBusiness.business._id);
        $scope.filteredList[$scope.activeBusiness.business.name] = {};
        $scope.viewRender();
    };

    /**
     *
     * Define which actions to take when employees are selected on the multi-select dropdown.
     *
     * @type {{onItemSelect: Function, onItemDeselect: Function, onSelectAll: Function, onUnselectAll: Function}}
     */
    $scope.dropdownEvents = {
        onItemSelect: function (item) {
            uiCalendarConfig.calendars['myCalendar1'].fullCalendar('removeEventSource',$scope.events);
            $scope.filteredList[$scope.activeBusiness.business.name][item._id] = $scope.masterList[$scope.activeBusiness.business.name][item._id];
            createEventsSources($scope.filteredList[$scope.activeBusiness.business.name]);
            uiCalendarConfig.calendars['myCalendar1'].fullCalendar('addEventSource',$scope.events);
        },
        onItemDeselect: function (item) {
            uiCalendarConfig.calendars['myCalendar1'].fullCalendar('removeEventSource',$scope.events);
            $scope.filteredList[$scope.activeBusiness.business.name][item._id] = {};
            createEventsSources($scope.filteredList[$scope.activeBusiness.business.name]);
            uiCalendarConfig.calendars['myCalendar1'].fullCalendar('addEventSource',$scope.events);
        },
        onSelectAll: function () {
            uiCalendarConfig.calendars['myCalendar1'].fullCalendar('removeEventSource',$scope.events);
            $scope.masterList[$scope.activeBusiness.name] = {};
            createEventsSources($scope.masterList[$scope.activeBusiness.business.name]);
            uiCalendarConfig.calendars['myCalendar1'].fullCalendar('addEventSource',$scope.events);
        },
        onUnselectAll: function () {
            //$scope.masterList[$scope.activeBusiness.name] = {};
            //createEventsSources($scope.masterList[$scope.activeBusiness.business.name]);
            uiCalendarConfig.calendars['myCalendar1'].fullCalendar('removeEvents');
        }
    };
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    /**
     *
     * Events for the calendar
     *
     */
    /* alert on eventClick */
    $scope.alertOnEventClick = function (date, jsEvent, view) {
        var personal = false;
        if (date.appointment.customer) {
            personal = true;
        }
        $scope.open('lg', date, personal);
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

    /* remove event */
    $scope.remove = function (index) {
        $scope.events.splice(index, 1);
    };
    /* Change View */
    $scope.changeView = function (view, calendar) {
        uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };
    /* Change View */
    var render = true;
    $scope.renderCalender = function (calendar) {
        if (render) {
            $scope.loadingCal = true;
            $timeout(function () {
                $scope.loadingCal = false;
                uiCalendarConfig.calendars['myCalendar1'].fullCalendar('render');
                render = false;
            }, 0);
        }
    };
    /* Render Tooltip */
    $scope.eventRender = function (event, element, view) {
        for (var employeeIndex = 0; employeeIndex < $scope.activeBusiness.business.employees.length; employeeIndex++) {
            if ($scope.activeBusiness.business.employees[employeeIndex]._id == event.appointment.employee) {
                var employeeName = $scope.activeBusiness.business.employees[employeeIndex].name;
            }
        }
        element.attr({
            'uib-tooltip': employeeName,
            'tooltip-append-to-body': true
        });
        $compile(element)($scope);
    };

    //
    //$scope.refreshCalendar = function(){
    //    $scope.events = [];
    //    businessFactory.getAllAppointments($scope.activeBusiness.business._id, $scope.monthYear)
    //        .then(function (response) {
    //            //take the array of appointments returned and add them to our master entry of appointments for each employee
    //            var masterEntry = createMasterEntry(response);
    //            $scope.masterList[$scope.activeBusiness.business.name] = {};
    //            $scope.masterList[$scope.activeBusiness.business.name] = masterEntry;
    //            localStorage.setItem('masterList', angular.toJson($scope.masterList));
    //            //create events arrays with the appointments for the business in our masterList of businesses
    //            $scope.events = [];
    //            createEventsSources($scope.masterList[$scope.activeBusiness.business.name]);
    //            $scope.lastUpdatedView = moment().calendar();
    //            $scope.lastUpdated = moment();
    //            //add our monthYear and business to localStorage
    //            localStorage['monthYear'] = $scope.monthYear;
    //            localStorage['previousBusiness'] = $scope.activeBusiness.business.name;
    //        });
    //};
    /**
     *
     * Refresh the calendar every thiry seconds
     *
     */
    //var refreshingPromise;
    //var isRefreshing = false;
    //$scope.startRefreshing = function(){
    //    if(isRefreshing) return;
    //    isRefreshing = true;
    //    (function refreshEvery(){
    //        var lastUpdated = moment($scope.lastUpdated);
    //        var now = moment();
    //        if(now.diff(lastUpdated,'seconds')>=30){
    //            $scope.calLoading=true;
    //            uiCalendarConfig.calendars['myCalendar1'].fullCalendar('removeEventSource',$scope.events);
    //            $scope.eventsSource = [];
    //            businessFactory.getAllAppointments($scope.activeBusiness.business._id, $scope.monthYear)
    //                .then(function (response) {
    //                    $scope.events = [];
    //                    //take the array of appointments returned and add them to our master entry of appointments for each employee
    //                    var masterEntry = createMasterEntry(response);
    //                    $scope.masterList[$scope.activeBusiness.business.name] = {};
    //                    $scope.masterList[$scope.activeBusiness.business.name] = masterEntry;
    //                    localStorage.setItem('masterList', angular.toJson($scope.masterList));
    //                    //create events arrays with the appointments for the business in our masterList of businesses
    //                    $scope.events = [];
    //                    $scope.calLoading=false;
    //                    createEventsSources($scope.masterList[$scope.activeBusiness.business.name]);
    //                    $scope.lastUpdatedView = moment().calendar();
    //                    $scope.lastUpdated = moment();
    //                    uiCalendarConfig.calendars['myCalendar1'].fullCalendar('addEventSource',$scope.events);
    //                    //add our monthYear and business to localStorage
    //                    localStorage['monthYear'] = $scope.monthYear;
    //                    localStorage['previousBusiness'] = $scope.activeBusiness.business.name;
    //                    refreshingPromise = $timeout(refreshEvery,30000);
    //                });
    //        }else{
    //            refreshingPromise = $timeout(refreshEvery,30000);
    //        }
    //    }());
    //};
    //$timeout(function(){
    //    $scope.startRefreshing();
    //},30000);
    /**
     *
     *  Creates the events array that will be used to display events on the calendar
     *
     * @param businessArray - The array of businesses an employee owns,
     */
    var createEventsSources = function (businessArray) {
        $scope.events = [];
        _.forEach(businessArray, function (appointments, key) {
            _.forEach(appointments, function (appointment, key) {
                for (var appointmentIndex = 0; appointmentIndex < appointment.length; appointmentIndex++) {
                    var tempObj = {
                        _id: appointment[appointmentIndex]._id,
                        title: appointment[appointmentIndex].title,
                        start: appointment[appointmentIndex].start.full,
                        end: appointment[appointmentIndex].end.full,
                        appointment: appointment[appointmentIndex]
                    };
                    if (appointment[appointmentIndex].status === 'pending') {
                        tempObj.backgroundColor = '#f00';
                        tempObj.borderColor = '#f00';
                        $scope.events.push(tempObj);

                    } else if (appointment[appointmentIndex].status === 'paid') {
                        tempObj.backgroundColor = '#f39';
                        tempObj.borderColor = '#f39';
                        $scope.events.push(tempObj);
                    } else {
                        $scope.events.push(tempObj);
                    }
                }
            });

        });
    };
    /**
     * All appointments for the business, this function sorts them by employee
     *
     * If there are no appointments we create the empty employee arrays and appointments so
     * the business can receive new appointments from sockets
     *
     * @param appointmentArray - All appointments for the business
     * @returns {{}}
     */
    var createMasterEntry = function (appointmentArray) {
        var responseArray = {};
        if(appointmentArray.length > 0){
            for (var appointmentArrayIndex = 0; appointmentArrayIndex < appointmentArray.length; appointmentArrayIndex++) {
                if (!responseArray[appointmentArray[appointmentArrayIndex].employee]) {
                    responseArray[appointmentArray[appointmentArrayIndex].employee] = {};
                    responseArray[appointmentArray[appointmentArrayIndex].employee].appointments = [];
                    responseArray[appointmentArray[appointmentArrayIndex].employee].appointments.push(appointmentArray[appointmentArrayIndex]);
                } else {
                    responseArray[appointmentArray[appointmentArrayIndex].employee].appointments.push(appointmentArray[appointmentArrayIndex]);
                }
            }
        }else{
            for(var employeeIndex = 0; employeeIndex<$scope.activeBusiness.business.employees.length;employeeIndex++){
                responseArray[$scope.activeBusiness.business.employees[employeeIndex]._id] = {};
                responseArray[$scope.activeBusiness.business.employees[employeeIndex]._id].appointments = [];
            }
        }

        return responseArray;
    };
    /**
     *
     * Function that's called whenever actions are taken on the calendar,
     * when a month is switched, day, etc.
     *
     * We get the current date selected on the calendar and format that date
     * into MM/YYYY, the monthYear is used to select all appointmnts in the DB
     * that are in the same month/year
     *
     * We check to see if the previousMonthYear selected or previousBusinessYear selected are the same
     * as the one currently being selected, if not we remove all events on the calendar
     * then make a request for new business for that month.
     *
     * In the getAllAppointments callback we create a new masterEntry list of appointments.
     *
     * The schema of which is:
     *
     *              masterList:{
     *                  businessName:{
     *                      appointments:{
     *                          [0],
     *                          [1].
     *                     }
     *                  },
     *                  businessName:{
     *                          [0],
     *                          [1],
     *                 }
     *              }
     *
     *
     * After the master entry is created we run our create eventsSources function and store
     * the parameters for the getAllAppointments request in localStorage
     *
     *
     * @param view
     * @param element
     */

    //var storedList = localStorage.getItem('masterList');
    $scope.viewRender = function (view, element) {
        //monthYear = current date of the calendar
        var monthYear = uiCalendarConfig.calendars['myCalendar1'].fullCalendar('getDate');
        //convert monthYear into the correct format
        $scope.monthYear = moment(monthYear).format('MM/YYYY');
        //get the previous monthYear/business if they exists
        var previousMonthYear = localStorage['monthYear'];
        var previousBusiness = localStorage['previousBusiness'];
        //if the current monthYear isn't equal to the one stored and there's no master list for the previousBusiness
        if ($scope.monthYear !== previousMonthYear || !$scope.masterList[$scope.activeBusiness.business.name] || previousBusiness !== $scope.activeBusiness.business.name) {
            //remove all events from the calendar
            uiCalendarConfig.calendars['myCalendar1'].fullCalendar('removeEvents');
            //make a request for all appointments for the activeBusiness that are schedueld for the same month of this year
            businessFactory.getAllAppointments($scope.activeBusiness.business._id, $scope.monthYear)
                .then(function (response) {
                    //take the array of appointments returned and add them to our master entry of appointments for each employee
                    var masterEntry = createMasterEntry(response);
                    $scope.masterList[$scope.activeBusiness.business.name] = {};
                    $scope.masterList[$scope.activeBusiness.business.name] = masterEntry;
                    localStorage.setItem('masterList', angular.toJson($scope.masterList));
                    //create events arrays with the appointments for the business in our masterList of businesses
                    $scope.events = [];
                    createEventsSources($scope.masterList[$scope.activeBusiness.business.name]);
                    $scope.eventSources.push($scope.events);
                    $scope.lastUpdatedView = moment().calendar();
                    $scope.lastUpdated = moment();
                    //add our monthYear and business to localStorage
                    localStorage['monthYear'] = $scope.monthYear;
                    localStorage['previousBusiness'] = $scope.activeBusiness.business.name;
                });
        }
    };

    /* config object for UI Calendar*/
    $scope.uiConfig = {
        calendar: {
            height: 700,
            editable: true,
            displayEventEnd: true,
            header: {
                left: 'title',
                center: '',
                right: 'today prev,next'
            },
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender,
            viewRender: $scope.viewRender,
            addEvent: $scope.addEvent
        }
    };
    /* event sources array for ui-calendar*/
    $scope.eventSources = [$scope.events];

    /**
     * Opens the edit Appointment modal, for editing appointments
     *
     * @param size - String - size of the modal to open
     * @param data - Object - the appointment to be edited
     * @param type - Boolean - is the appointment being edited by the user who's appointment it is or an employee/business owner
     */
    $scope.open = function (size, data, type) {
        data.business = $scope.activeBusiness.business;
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/partials/modals/editAppointment.html',
            controller: 'editAppointmentModalCtrl',
            backdrop: 'static',
            keyboard: false,
            size: size,
            resolve: {
                data: function () {
                    return data;
                },
                personal: function () {
                    return type;
                }
            }
        });
        /**
         * Once the modal instance as been closed, we remove all events from the calendar
         * and then render the calendar again with the updated events.
         *
         */
        modalInstance.result.then(function (date) {
            if (date && date.appointment !== 'canceled') {
                if (date.appointment.status == 'paid') {
                    date.backgroundColor = '#f39';
                    date.borderColor = '#f39';
                }
                if (date.appointment.status == 'pending') {
                    uiCalendarConfig.calendars['myCalendar1'].fullCalendar('removeEvents', [date._id]);
                    //date.backgroundColor = '#f00';
                    //date.borderColor = '#f00';
                }
                date.start = date.appointment.start.full;
                date.end = date.appointment.end.full;
                uiCalendarConfig.calendars['myCalendar1'].fullCalendar('updateEvent', date);
            } else if (date && date.appointment === 'canceled') {
                uiCalendarConfig.calendars['myCalendar1'].fullCalendar('removeEvents', [date._id]);
            }
        }, function () {

        });
    };
    /* add custom event*/
    $scope.addEvent = function (appointment) {
        var event = {
            _id:appointment._id,
            title: appointment.title,
            start: appointment.start.full,
            end: appointment.end.full,
            appointment: appointment
        };
        if($scope.events.length === 0){
            uiCalendarConfig.calendars['myCalendar1'].fullCalendar('renderEvent',event);
        }
        $scope.events.push(event);

    };
    /**
     * Block for manually scheduling appointments
     *
     * @param size - size of the modal
     * @param type - type of appointment, personal or not
     * @param service - the service the appointment is for
     */
    $scope.openService = function (size, type, service) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/partials/modals/scheduleAppointmentModal.html',
            controller: 'scheduleAppointmentModalCtrl as ctrl',
            backdrop: 'static',
            keyboard: false,
            size: size,
            resolve: {
                personal: function () {
                    return type;
                },
                tier: function () {
                    return $scope.activeBusiness.business.tier;
                },
                service: function () {
                    return service;
                }
            }
        });
        /**
         *
         * Once the appointment has been scheduled and the modal closed we want to
         * update the calendar.
         *
         */
        modalInstance.result.then(function (appointment) {
            if (appointment) {
                $scope.addEvent(appointment);
            }
        }, function () {

        });
    };
    /**
     *
     * Socket returns any updates made to appointments by employee's or customers,
     * we look for the appointment's event object on the calendar and then update the event
     *
     * Currently update results in an error being thrown, can't read undefined property of clone()
     * we'll need to resolve this eventually
     *
     */
    socketService.on('updatedAppt', function (data) {
        var eventIndex = _.findIndex($scope.events,function(event){
            return event._id === data.appointment._id;
        });
        if(eventIndex !== -1){
            if ($scope.events[eventIndex]._id === data.appointment._id && data.appointment.status !== 'pending') {
                uiCalendarConfig.calendars['myCalendar1'].fullCalendar('removeEvents', [data.appointment._id]);

                $scope.lastUpdatedView = moment().calendar();
                $scope.lastUpdated = moment();
                $scope.events[eventIndex].start = moment(data.appointment.start.full);
                $scope.events[eventIndex].end = moment(data.appointment.end.full);
                $scope.events[eventIndex].appointment = data.appointment;
                if (data.from !== $rootScope.currentUser.user._id && data.appointment.customer !== null) {
                    uiCalendarConfig.calendars['myCalendar1'].fullCalendar('renderEvent', $scope.events[eventIndex]);
                    Notification.info({message: 'A customer has re-scheduled an appointment!'});
                } else if (data.from !== $rootScope.currentUser.user._id && data.appointment.customer === null) {
                    uiCalendarConfig.calendars['myCalendar1'].fullCalendar('renderEvent', $scope.events[eventIndex]);
                    Notification.info({message: 'An employee has re-scheduled an appointment!'});
                } else {
                    Notification.info({message: 'You have re-scheduled an appointment!'});
                }
            } else if (data.appointment.status === 'pending') {
                Notification.info({message: 'An employee has re-scheduled an appointment, ' +
                'it is pending and has been removed from your calendar.'});
                uiCalendarConfig.calendars['myCalendar1'].fullCalendar('removeEvents', [data.appointment._id]);
            }
        }else{
            Notification.info({message: 'A customer has accepted a re-scheduled appointment!'});
            $scope.addEvent(data.appointment);
        }
    });
    /**
     *
     * Socket return a new appointment to add to the business calendar
     *
     */
    socketService.on('newAppt', function (appointment) {
        $scope.addEvent(appointment);
        Notification.success({message: 'New appointment booked!'});
        $scope.masterList[$scope.activeBusiness.business.name][appointment.employee].appointments.push(appointment);
        $scope.lastUpdatedView = moment().calendar();
        $scope.lastUpdated = moment();
        localStorage.setItem('masterList', angular.toJson($scope.masterList));
    });
    /**
     *
     * When an appointment get's canceled we look for it in the event array, if it exists we remove it from
     * the calendar, notify the user.
     *
     */
    socketService.on('canceledAppt', function (data) {
        var eventId;
        var masterList = $scope.masterList[$scope.activeBusiness.business.name][data.appointment.employee].appointments;
        masterList = _.without(masterList, _.findWhere(masterList, {'_id': data.appointment._id}));
        $scope.masterList[$scope.activeBusiness.business.name][data.appointment.employee].appointments = masterList;
        for (var eventIndex = 0; eventIndex < $scope.events.length; eventIndex++) {
            if ($scope.events[eventIndex].appointment._id === data.appointment._id) {
                eventId = $scope.events[eventIndex]._id;
                Notification.warning({message: 'An appointment has been canceled'});
                uiCalendarConfig.calendars['myCalendar1'].fullCalendar('removeEvents', [eventId]);
            }
        }
        $scope.lastUpdatedView = moment().calendar();
        $scope.lastUpdated = moment();
        localStorage.setItem('masterList', angular.toJson($scope.masterList));
    });
};
