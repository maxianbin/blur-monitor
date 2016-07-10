(function() {
    'use strict';

    angular.module('BlurMonitor.pages.network').controller('NetworkController', [
        '$scope',
        '$timeout',
        'NetworkResource',
        'BandwidthResource',
        NetworkController]);

    function NetworkController($scope, $timeout, NetworkResource, BandwidthResource) {
        var vm = this;

        vm.bindings = [];
        vm.external = null;
        vm.traceroute = [];
        vm.tracerouteLoading = true;
        vm.interfaces = null;

        vm.startDisabled = false;
        vm.startTest = startTest;

        vm.currentDataSet = null;

        vm.getStats = {
            method: 'GET',
            progress: 0,
            total: 0,
            speed: 0,
            response: null,
            loaded: 0,
            lastLoaded: 0,
            lastEnd: null
        };

        vm.postStats = {
            method: 'POST',
            progress: 0,
            total: 0,
            speed: 0,
            response: null,
            loaded: 0,
            lastLoaded: 0,
            lastEnd: null
        };

        NetworkResource.get(function(response) {
            vm.interfaces = response;
        });

        NetworkResource.getExternal(function(response) {
            vm.external = response.ipAddress;
        });

        NetworkResource.getTraceroute(function(response) {
            vm.tracerouteLoading = false;

            angular.forEach(response.traceroute, function(hop) {
                vm.traceroute.push(hop);
            });
        });

        BandwidthResource.addProgressCallback(function(event) {
            progressCallback(vm.currentDataSet, event);
        });

        BandwidthResource.addCompleteCallback(function(event) {
            completeCallback(vm.currentDataSet, event);
        });

        function startTest(dataSet) {
            vm.currentDataSet = dataSet;

            dataSet.progress = 0;
            dataSet.total = 0;
            dataSet.speed = 0;
            dataSet.payload = null;
            dataSet.loaded = 0;
            dataSet.lastLoaded = 0;
            dataSet.lastEnd = performance.now();

            vm.startDisabled = true;

            if(dataSet.method === 'GET') {
                BandwidthResource.get();

                vm.postStats.progress = 0;
                vm.postStats.total = 0;
                vm.postStats.speed = 0;
                vm.postStats.payload = null;
                vm.postStats.loaded = 0;
                vm.postStats.lastLoaded = 0;
                vm.postStats.lastEnd = null;
            } else if(dataSet.method === 'POST') {
                BandwidthResource.post(vm.getStats.response, 'text/plain');
            }
        }

        function progressCallback(dataSet, event) {
            if (event.lengthComputable) {
                if(!dataSet.total) {
                    dataSet.total = Math.round(event.total * 8 / 1000);
                }

                dataSet.loaded = Math.round(event.loaded * 8 / 1000);

                var percentComplete = event.loaded / event.total * 100;
                dataSet.progress = percentComplete.toFixed(2);

                var loadDiff = event.loaded - dataSet.lastLoaded;
                var timeDiff = performance.now() - dataSet.lastEnd;

                var calcSpeed = (loadDiff * 8 / 1000) / (timeDiff / 1000);
                dataSet.speed = dataSet.speed === 0 ? calcSpeed.toFixed(2) : ((parseFloat(dataSet.speed) + calcSpeed) / 2).toFixed(2);

                dataSet.lastLoaded = event.loaded;
                dataSet.lastEnd = performance.now();

                $scope.$apply();
            }
        }

        function completeCallback(dataSet) {
            dataSet.response = BandwidthResource.response;
            $scope.$apply();

            if(dataSet.method === 'GET') {
                startTest(vm.postStats);
            } else if(dataSet.method === 'POST') {
                vm.startDisabled = false;
            }
        }

        function getTraceroute() {

        }
    }
})();