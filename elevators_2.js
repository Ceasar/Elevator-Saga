{
  init: function(elevators, floors) {
    var upButtonPressed = {};
    var dnButtonPressed = {};

    floors.forEach(function(floor) {
      var floorNum = floor.floorNum();
      upButtonPressed[floorNum] = false;
      dnButtonPressed[floorNum] = false;

      floor.on("up_button_pressed", function() {
        upButtonPressed[floorNum] = true;
      });
      floor.on("down_button_pressed", function() {
        dnButtonPressed[floorNum] = true;
      });
    });

    elevators.forEach(function(elevator, elevatorNumber) {
      elevator.on("idle", function() {
        elevator.goingUpIndicator(true);
        elevator.goingDownIndicator(true);
      });

      elevator.on("floor_button_pressed", function(floorNum) {
        if (elevator.destinationQueue.length === 0) {
          if (floorNum > elevator.currentFloor()) {
            elevator.goingUpIndicator(true);
          } else {
            elevator.goingDownIndicator(true);
          }
        }
        elevator.goToFloor(floorNum);
        elevator.destinationQueue.sort();
        if (elevator.goingDownIndicator()) {
          elevator.destinationQueue.reverse();
        }
        elevator.checkDestinationQueue();
      });

      elevator.on("passing_floor", function(floorNum) {
        var direction = elevator.destinationDirection();
        if (elevator.loadFactor() < 0.5) {
          if (direction === "up" && upButtonPressed[floorNum]) {
            upButtonPressed[floorNum] = false;
            elevator.goToFloor(floorNum, true);
          }
          if (direction === "down" && dnButtonPressed[floorNum]) {
            dnButtonPressed[floorNum] = false;
            elevator.goToFloor(floorNum, true);
          }
        }
      });

      elevator.on("stopped_at_floor", function(floorNum) {
        console.log(elevatorNumber, "stopped_at_floor", floorNum);
      });
    });
  },
  update: function(dt, elevators, floors) {
      // We normally don't need to do anything here
  }
}
