{
  init: function(elevators, floors) {
    var state = {
      elevators: {},
      presses: [],
      buttonPressed: {},
    }
    floors.forEach(function(floor) {
      var floorNum = floor.floorNum();
      state.buttonPressed[floorNum] = {
        "up": false,
        "down": false,
      };
    });
    elevators.forEach(function(elevator, i) {
      state.elevators[i] = {
        destinationQueue: [],
        goingUpIndicator: true,
        goingDnIndicator: true,
        maxPassengerCount: elevator.maxPassengerCount(),
      };
    });

    function reduce(state, action) {
      switch (action.type) {
        case "up_button_pressed":
          state.buttonPressed[action.floorNum]["up"] = true;
          state.presses.push(action.floorNum);
          return state;
        case "down_button_pressed":
          state.buttonPressed[action.floorNum]["down"] = true;
          state.presses.push(action.floorNum);
          return state;
        case "idle":
          var elevator = state.elevators[action.elevatorNum];
          var press;
          if (state.presses.length > 0) {
            press = state.presses.shift();
            elevator.destinationQueue.push(press);
          } else {
            elevator.destinationQueue.push(action.currentFloor);
          }
          return state;
        case "floor_button_pressed":
          var elevator = state.elevators[action.elevatorNum];
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
        case "passing_floor":
          var elevator = state.elevators[action.elevatorNum];
          var spaceLeft = elevator.maxPassengerCount * (1 - action.loadFactor);
          if (spaceLeft > 1 &&
              action.destinationDirection === action.direction &&
              state.buttonPressed[action.floorNum][action.direction]) {
            elevator.destinationQueue.unshift(action.floorNum);
          }
          return state;
        case "stopped_at_floor":
          var elevator = state.elevators[action.elevatorNum];
          arrRemove(state.presses, action.floorNum);
          arrRemove(elevator.destinationQueue, action.floorNum);
          if (elevator.destinationQueue.length === 0) {
            elevator.goingUpIndicator = true;
            elevator.goingDnIndicator = true;
          }
          if (elevator.goingUpIndicator) {
            state.buttonPressed[action.floorNum]["up"] = false;
          }
          if (elevator.goingDnIndicator) {
            state.buttonPressed[action.floorNum]["down"] = false;
          }
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

    elevators.forEach(function(elevator, elevatorNum) {
      elevator.on("idle", function() {
        dispatch({
          type: "idle",
          currentFloor: elevator.currentFloor(),
          elevatorNum: elevatorNum,
        });
      });

      elevator.on("floor_button_pressed", function(floorNum) {
        dispatch({
          type: "floor_button_pressed",
          currentFloor: elevator.currentFloor(),
          elevatorNum: elevatorNum,
          floorNum: floorNum,
        });
      });

      elevator.on("passing_floor", function(floorNum, direction) {
        dispatch({
          type: "passing_floor",
          destinationDirection: elevator.destinationDirection(),
          direction: direction,
          elevatorNum: elevatorNum,
          floorNum: floorNum,
          loadFactor: elevator.loadFactor(),
        });
      });

      elevator.on("stopped_at_floor", function(floorNum) {
        dispatch({
          type: "stopped_at_floor",
          elevatorNum: elevatorNum,
          floorNum: floorNum,
          loadFactor: elevator.loadFactor(),
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
