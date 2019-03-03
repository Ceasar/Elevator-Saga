{
  init: function(elevators, floors) {
    var presses = [];
    var upButtonPressed = {};
    var dnButtonPressed = {};

    function arrRemove(arr, value) {
      var index = arr.indexOf(value);
      if (index > -1) {
        arr.splice(index, 1);
      }
    }

    floors.forEach(function(floor) {
      var floorNum = floor.floorNum();
      upButtonPressed[floorNum] = false;
      dnButtonPressed[floorNum] = false;

      floor.on("up_button_pressed", function() {
        upButtonPressed[floorNum] = true;
        presses.push({
          floorNum: floorNum,
          direction: "up",
        });
      });
      floor.on("down_button_pressed", function() {
        dnButtonPressed[floorNum] = true;
        presses.push({
          floorNum: floorNum,
          direction: "down"
        });
      });
    });

    elevators.forEach(function(elevator, elevatorNumber) {
      function findPassenger() {
        console.log(elevatorNumber, 'findPassenger', presses);
        var press = presses.shift();
        if (press !== undefined) {
          if (press.direction === "up") {
            elevator.goingDownIndicator(false);
          } else {
            elevator.goingUpIndicator(false);
          }
          elevator.goToFloor(press.floorNum);
          return;
        }
      }

      function idle() {
        elevator.goingUpIndicator(true);
        elevator.goingDownIndicator(true);

        findPassenger();
      }

      floors.forEach(function(floor) {
        var isIdle = elevator.destinationQueue.length === 0;
        floor.on("up_button_pressed", function() {
          if (isIdle) {
            idle();
          }
        });
        floor.on("down_button_pressed", function() {
          if (isIdle) {
            idle();
          }
        });
      });

      elevator.on("idle", idle);

      elevator.on("floor_button_pressed", function(floorNum) {
        if (elevator.destinationQueue.length === 0) {
          if (floorNum > elevator.currentFloor()) {
            elevator.goingDownIndicator(false);
          } else {
            elevator.goingUpIndicator(false);
          }
        }
        elevator.goToFloor(floorNum);
        elevator.destinationQueue.sort();
        if (elevator.goingDownIndicator()) {
          elevator.destinationQueue.reverse();
        }
        console.log("floor_button_pressed", elevator.destinationQueue);
        elevator.checkDestinationQueue();
      });

      elevator.on("stopped_at_floor", function(floorNum) {
        console.log(elevatorNumber, "stopped_at_floor", floorNum, presses);
        if (elevator.goingUpIndicator()) {
          arrRemove(presses, {
            floorNum: floorNum,
            direction: "up",
          })
        }
        if (elevator.goingDownIndicator()) {
          arrRemove(presses, {
            floorNum: floorNum,
            direction: "down",
          })
        }
      });
    });
  },
  update: function(dt, elevators, floors) {
      // We normally don't need to do anything here
  }
}
