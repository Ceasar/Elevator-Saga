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
      var floorButtonsPressed = {};

      var goingUp = true;
      elevator.goingUpIndicator(true);
      elevator.goingDownIndicator(false);

      elevator.on("idle", function() {
        var floor;
        if (elevator.loadFactor() > 0) {
          if (goingUp) {
            floor = floors.length - 1;
          } else {
            floor = 0;
          }
        } else {
          floor = 0;
        }
        elevator.goToFloor(floor);
      });

      elevator.on("floor_button_pressed", function(floorNum) {
        floorButtonsPressed[floorNum] = 1;
      });

      elevator.on("passing_floor", function(floorNum) {
        var direction = elevator.destinationDirection();
        if (floorButtonsPressed[floorNum]) {
          floorButtonsPressed[floorNum] = 0;
          elevator.goToFloor(floorNum, true);
        }
        if (elevator.loadFactor() < 1.0) {
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

        if (floorNum === 0) {
          floorButtonsPressed[floorNum] = 0;
          goingUp = true;
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(false);
        } else if (floorNum === floors.length - 1) {
          floorButtonsPressed[floorNum] = 0;
          goingUp = false;
          elevator.goingUpIndicator(false);
          elevator.goingDownIndicator(true);
        }
      });
    });
  },
  update: function(dt, elevators, floors) {
      // We normally don't need to do anything here
  }
}
