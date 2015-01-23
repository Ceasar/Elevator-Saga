{
    init: function(elevators, floors) {
        $.each(elevators, function(i, elevator) {
            var destinations = {};
            var upPresses = {};
            var downPresses = {};
            $.each(floors, function(i, floor) {
                destinations[i] = false;
                upPresses[i] = 0;
                downPresses[i] = 0;
            });
            elevator.on("idle", function() {
                elevator.stop();
                $.each(floors, function(i, floor) {
                    if (destinations[i]) {
                        elevator.goToFloor(i, true);
                    }
                    if (upPresses[i] || downPresses[i]) {
                        elevator.goToFloor(i);
                    }
                });
                
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                destinations[floorNum] = true;
            });
            elevator.on("passing_floor", function(floorNum, direction) {
                if (elevator.loadFactor() > 0) {
                    if (destinations[floorNum]) {
                        elevator.goToFloor(floorNum, true);
                    }
                } else if (upPresses[floorNum] || downPresses[floorNum]) {
                    elevator.goToFloor(floorNum);
                }
                
            });
            elevator.on("stopped_at_floor", function(floorNum) {
                destinations[floorNum] = false;
                upPresses[floorNum] = 0;
                downPresses[floorNum] = 0;
            });
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
}
