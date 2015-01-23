({
    init: function(elevators, floors) {
        $.each(elevators, function(i, elevator) {
            // Floors that passengers wish to exit at
            var destinations = {};
            // Floors that passengers have hit the "Up" button at
            var upPresses = {};
            // Floors that passengers have hit the "Down" button at
            var downPresses = {};
            $.each(floors, function(i, floor) {
                destinations[i] = false;
                upPresses[i] = 0;
                downPresses[i] = 0;
            });

            // If there are passengers, go to their floors, otherwise, go
            // to floors where passengers are waiting
            elevator.on("idle", function() {
                elevator.stop();
                if (elevator.loadFactor() > 0) {
                    $.each(floors, function(i, floor) {
                        if (destinations[i]) {
                            elevator.goToFloor(i);
                        }
                    });
                } else {
                    var i, distance;
                    var shortestDistance = floors.length;
                    var bestNonEmptyFloor = 0;
                    for (i = 0; i < floors.length; i++) {
                        distance = Math.abs(i - elevator.currentFloor());
                        if (upPresses[i] || downPresses[i]) {
                            if (distance < shortestDistance) {
                                shortestDistance = distance;
                                bestNonEmptyFloor = i;
                            }
                        }
                    }
                    elevator.goToFloor(bestNonEmptyFloor);
                }
                
            });

            // Mark a floor as one to stop at
            elevator.on("floor_button_pressed", function(floorNum) {
                destinations[floorNum] = true;
            });

            elevator.on("passing_floor", function(floorNum, direction) {
                if (elevator.loadFactor() > 0) {
                    if (destinations[floorNum]) {
                        elevator.goToFloor(floorNum, true);
                    }
                } else if (elevator.loadFactor() < 1) {
                    if (upPresses[floorNum] || downPresses[floorNum]) {
                        elevator.goToFloor(floorNum, true);
                    }
                }
                
            });

            elevator.on("stopped_at_floor", function(floorNum) {
                destinations[floorNum] = false;
                upPresses[floorNum] = 0;
                downPresses[floorNum] = 0;
            });

            // Record the number of presses
            $.each(floors, function(i, floor) {
                floor.on("up_button_pressed", function(event) {
                    upPresses[floor.floorNum()] += 1;
                });
                floor.on("down_button_pressed", function(event) {
                    downPresses[floor.floorNum()] += 1;
                });
            });
        });
    },
    update: function(dt, elevators, floors) {
    }
})
