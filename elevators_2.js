{
  init: function(elevators, floors) {
    var state = {
      elevators: {},
      upButtonPressed: {},
      dnButtonPressed: {},
    }
    floors.forEach(function(floor) {
      var floorNum = floor.floorNum();
      state.upButtonPressed[floorNum] = false;
      state.dnButtonPressed[floorNum] = false;
    });
    elevators.forEach(function(elevator, i) {
      state.elevators[i] = {
        destinationQueue: [],
        goingUpIndicator: true,
        goingDnIndicator: true,
      };
    });

    function reduce(state, action) {
      switch (action.type) {
        case "up_button_pressed":
          state.upButtonPressed[action.floorNum] = true;
          return state;
        case "down_button_pressed":
          state.dnButtonPressed[action.floorNum] = true;
          return state;
        case "idle":
          var elevator = state.elevators[action.elevatorNumber];
          elevator.destinationQueue.push(action.currentFloor);
          elevator.goingUpIndicator = true;
          elevator.goingDnIndicator = true;
          return state;
        case "floor_button_pressed":
          var elevator = state.elevators[action.elevatorNumber];
          elevator.destinationQueue.push(action.floorNum);
          elevator.destinationQueue.sort();
          if (elevator.goingDnIndicator) {
            elevator.destinationQueue.reverse();
          }

          if (elevator.destinationQueue[0] > action.currentFloor) {
            elevator.goingDnIndicator = false;
          } else {
            elevator.goingUpIndicator = false;
          }
          return state;
        case "stopped_at_floor":
          var elevator = state.elevators[action.elevatorNumber];
          arrRemove(elevator.destinationQueue, action.floorNum);
          return state;
        default:
          return state;
      }
    }

    function dispatch(action) {
      var nextState = reduce(copy(state), action);
      console.log(state, action, nextState);
      state = nextState;
      elevators.forEach(function(elevator, i) {
        var elevatorState = state.elevators[i];
        elevator.goingUpIndicator(elevatorState.goingUpIndicator);
        elevator.goingDownIndicator(elevatorState.goingDnIndicator);
        elevator.destinationQueue = elevatorState.destinationQueue;
        elevator.checkDestinationQueue();
      });
    }

    floors.forEach(function(floor) {
      var floorNum = floor.floorNum();
      floor.on("up_button_pressed", function() {
        dispatch({
          type: "up_button_pressed",
          floorNum: floorNum,
        });
      });
      floor.on("down_button_pressed", function() {
        dispatch({
          type: "down_button_pressed",
          floorNum: floorNum,
        });
      });
    });

    elevators.forEach(function(elevator, elevatorNumber) {
      elevator.on("idle", function() {
        dispatch({
          type: "idle",
          currentFloor: elevator.currentFloor(),
          elevatorNumber: elevatorNumber,
        });
      });

      elevator.on("floor_button_pressed", function(floorNum) {
        dispatch({
          type: "floor_button_pressed",
          currentFloor: elevator.currentFloor(),
          elevatorNumber: elevatorNumber,
          floorNum: floorNum,
        });
      });

      elevator.on("stopped_at_floor", function(floorNum) {
        dispatch({
          type: "stopped_at_floor",
          elevatorNumber: elevatorNumber,
          floorNum: floorNum,
        });
      });
    });

    // Utilities

    function copy(o) {
      return JSON.parse(JSON.stringify(o));
    }

    function arrRemove(arr, value) {
      var index = arr.indexOf(value);
      if (index > -1) {
        arr.splice(index, 1);
      }
    }

  },
  update: function(dt, elevators, floors) {
      // We normally don't need to do anything here
  }
}
