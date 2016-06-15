(function() {
    'use strict';

    angular.module('BlurMonitor.pages.disks').controller('DisksController', [
        '$scope',
        '$interval',
        'refreshInterval',
        'DisksResource',
        DisksController]);

    function DisksController($scope, $interval, refreshInterval, DisksResource) {
        var vm = this;

        vm.disks = [];
        vm.diskColumns = [];

        vm.chartsData = [];
        vm.chartsLabels = [];
        vm.chartOptions = {
            animation: false
        };

        vm.interval = $interval(function() {
            getDisks();
        }, refreshInterval);

        $scope.$on('$destroy', function() {
            $interval.cancel(vm.interval);
        });

        function getDisks() {
            DisksResource.query(function(disks) {
                disks.sort(function(diskA, diskB) {
                    if(diskA.mountpoint < diskB.mountpoint) {
                        return -1;
                    } else if (diskA.mountpoint > diskB.mountpoint) {
                        return 1;
                    } else {
                        return 0;
                    }
                });

                splitDisksForView(disks);

                if(vm.disks.length === 0) {
                    vm.disks = disks;
                }

                angular.forEach(disks, function(disk, index) {
                    if(!angular.isArray(vm.chartsData[index])) {
                        vm.chartsData[index] = [];
                        vm.chartsLabels[index] = [];
                    }

                    vm.chartsData[index][0] = disk.usedPer;
                    vm.chartsData[index][1] = disk.freePer;

                    vm.chartsLabels[index][0] = 'Used: ' + disk.used;
                    vm.chartsLabels[index][1] = 'Free: ' + disk.available;
                });
            });
        }

        function splitDisksForView(disks) {
            var rowSize = 2;
            var curCol = 0;
            var curRow = 0;

            angular.forEach(disks, function(disk) {
                if(curCol === rowSize) {
                    curCol = 0;
                    curRow++;
                }

                if(!angular.isArray(vm.diskColumns[curRow])) {
                    vm.diskColumns[curRow] = [];
                }

                if(!angular.isDefined(vm.diskColumns[curRow][curCol])) {
                    vm.diskColumns[curRow][curCol] = disk;
                } else {
                    angular.merge(vm.diskColumns[curRow][curCol], disk);
                }

                curCol++;
            });
        }
    }
})();