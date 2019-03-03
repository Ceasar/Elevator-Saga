{
  init: function(elevators, floors) {
    var upButtonPresses = {};
    var dnButtonPresses = {};

    floors.forEach(function(floor) {
      upButtonPresses[floor] = 0;
      dnButtonPresses[floor] = 0;

      floor.on("up_button_pressed", function() {
        upButtonPresses[floor.floorNum()] += 1;
      });
      floor.on("down_button_pressed", function() {
        dnButtonPresses[floor.floorNum()] += 1;
      });
    });

    elevators.forEach(function(elevator, elevatorNumber) {
      var floorButtonsPressed = {};

      var goingUp = true;
      elevator.goingUpIndicator(true);
      elevator.goingDownIndicator(false);

      elevator.on("idle", function() {
        var floor;
        if (goingUp) {
          floor = floors.length - 1;
        } else {
          floor = 0;
        }
        elevator.goToFloor(floor);
      });

      elevator.on("floor_button_pressed", function(floorNum) {
        floorButtonsPressed[floorNum] = 1;
      });

      elevator.on("passing_floor", function(floorNum) {
        if (floorButtonsPressed[floorNum]) {
          floorButtonsPressed[floorNum] = 0;
          elevator.goToFloor(floorNum, true);
        }
        if (elevator.loadFactor() < 0.9) {
          var direction = elevator.destinationDirection();
          if (direction === "up" && upButtonPresses[floorNum]) {
            upButtonPresses[floorNum] = 0;
            elevator.goToFloor(floorNum, true);
          }
          if (direction === "down" && dnButtonPresses[floorNum]) {
            dnButtonPresses[floorNum] = 0;
            elevator.goToFloor(floorNum, true);
          }
        }
      });

      elevator.on("stopped_at_floor", function(floorNum) {
        console.log(elevatorNumber, "stopped_at_floor", floorNum);

        if (floorNum === 0) {
          goingUp = true;
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(false);
        } else if (floorNum === floors.length - 1) {
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
