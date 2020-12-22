import { text } from './input';
import * as _ from 'lodash';

let roomSizeX = 0;
let roomSizeY = 0;

type Room = string[][];

class OutOfBoundsError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

class NoChangeError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

type AdjacentOccupancies = {
  occupants: number;
};

function getSpot(x: number, y: number, room: Room): string {
  return room[y][x];
}

function setSpot(x: number, y: number, room: Room, value: string): void {
  room[y][x] = value;
}

function getAdjacentOccupancies(x: number, y: number, room: string[][]): AdjacentOccupancies {
  if (x < 0 || x >= roomSizeX) {
    throw new OutOfBoundsError(`x: ${x}`);
  }
  if (y < 0 || y >= roomSizeY) {  
    throw new OutOfBoundsError(`y: ${y}`);
  }

  const adjacent: AdjacentOccupancies = { occupants: 0};

  for (let i = -1; i <= 1; i++) {
    const adjX = x + i;
    if (adjX < 0 || adjX >= roomSizeX) {
      continue;
    }
    for (let j = -1; j <= 1; j++) {
      let adjY = y + j;
      if (adjY < 0 || adjY >= roomSizeY) {
        continue;
      }

      if (adjY === y && adjX === x) {
        continue;
      }

      const spot = getSpot(adjX, adjY, room);

      if (spot === 'L') {
        // empty seat
      } else if (spot === '.') {
        // floor
      } else if (spot === '#') {
        // occupied
        adjacent.occupants++;
      }
    }
  }
  return adjacent;
}

function getVisibleOccupancies(x: number, y: number, room: string[][], log: boolean = false): AdjacentOccupancies {
  if (x < 0 || x >= roomSizeX) {
    throw new OutOfBoundsError(`x: ${x}`);
  }
  if (y < 0 || y >= roomSizeY) {
    throw new OutOfBoundsError(`y: ${y}`);
  }

  const visible: AdjacentOccupancies = { occupants: 0};
  if (log) {
    console.log(`Testing for ${x}, ${y}, ${getSpot(x, y, room)}`);
  }

  // left
  for (let cursorX = x - 1; cursorX >= 0; cursorX--) {
    const spot = getSpot(cursorX, y, room);
    if (spot === '#') {
      visible.occupants++;
      break;
    } else if (spot === 'L') {
      break;
    }
  }

  // right
  for (let cursorX = x + 1; cursorX < roomSizeX; cursorX++) {
    const spot = getSpot(cursorX, y, room);
    if (spot === '#') {
      visible.occupants++;
      break;
    } else if (spot === 'L') {
      break;
    }
  }

  // up
  for (let cursorY = y - 1; cursorY >= 0; cursorY--) {
    const spot = getSpot(x, cursorY, room);
    if (spot === '#') {
      visible.occupants++;
      break;
    } else if (spot === 'L') {
      break;
    }
  }

  // down
  for (let cursorY = y + 1; cursorY < roomSizeY; cursorY++) {
    const spot = getSpot(x, cursorY, room);
    if (log) {
      console.log(`${x}, ${cursorY}, ${spot}`);
    }
    if (spot === '#') {
      visible.occupants++;
      break;
    } else if (spot === 'L') {
      break;
    }
  }

  // down left
  let cursorX = x - 1;
  let cursorY = y + 1;
  while (cursorX >= 0 && cursorY < roomSizeY) {
    const spot = getSpot(cursorX, cursorY, room);
    if (log) {
      console.log(`${cursorX}, ${cursorY}, ${spot}`);
    }
    if (spot === '#') {
      visible.occupants++;
      break;
    } else if (spot === 'L') {
      break;
    }
    cursorX--;
    cursorY++;
  }

  // down right
  cursorX = x + 1;
  cursorY = y + 1;
  while (cursorX < roomSizeX && cursorY < roomSizeY) {
    const spot = getSpot(cursorX, cursorY, room);
    if (log) {
      console.log(`${cursorX}, ${cursorY}, ${spot}`);
    }
    if (spot === '#') {
      visible.occupants++;
      break;
    } else if (spot === 'L') {
      break;
    }
    cursorX++;
    cursorY++;
  }

  // up left
  cursorX = x - 1;
  cursorY = y - 1;
  while (cursorX >= 0 && cursorY >= 0) {
    const spot = getSpot(cursorX, cursorY, room);
    if (log) {
      console.log(`${cursorX}, ${cursorY}, ${spot}`);
    }
    if (spot === '#') {
      visible.occupants++;
      break;
    } else if (spot === 'L') {
      break;
    }
    cursorX--;
    cursorY--;
  }

  // up right
  cursorX = x + 1;
  cursorY = y - 1;
  while (cursorX < roomSizeX && cursorY >= 0) {
    const spot = getSpot(cursorX, cursorY, room);
    if (log) {
      console.log(`${cursorX}, ${cursorY}, ${spot}`);
    }
    if (spot === '#') {
      visible.occupants++;
      break;
    } else if (spot === 'L') {
      break;
    }
    cursorX++;
    cursorY--;
  }

  if (log) {
    console.log(`${x}, ${y}, Occupants: ${visible.occupants}`);
  }

  return visible;
}


function calculateNextStateViaAdjacency(roomState: Room): Room {
  const nextState = _.cloneDeep(roomState);
  let hasChanged = false;
  for (let i = 0; i < roomState.length; i++) {
    for (let j = 0; j < roomState[0].length; j++) {
      const spot = getSpot(i,j, roomState);
      if (spot === '.') {
        continue;
      }

      const adjacent = getAdjacentOccupancies(i, j, roomState);
      if (spot === '#' && adjacent.occupants >= 4) {
        setSpot(i, j, nextState, 'L');
        hasChanged = true;
      } else if (spot === 'L' && adjacent.occupants === 0) {
        setSpot(i, j, nextState, '#');
        hasChanged = true;
      }
    }
  }

  if(!hasChanged) {
    throw new NoChangeError();
  }

  return nextState;
}

function calculateNextStateViaVisibility(roomState: Room, log: boolean = false): Room {
  const nextState = _.cloneDeep(roomState);
  let hasChanged = false;
  for (let x = 0; x < roomSizeX; x++) {
    for (let y = 0; y < roomSizeY; y++) {
      const spot = getSpot(x,y, roomState);
      if (spot === '.') {
        continue;
      }

      const adjacent = getVisibleOccupancies(x, y, roomState, log);
      if (spot === '#' && adjacent.occupants >= 5) {
        setSpot(x, y, nextState, 'L');
        hasChanged = true;
      } else if (spot === 'L' && adjacent.occupants === 0) {
        setSpot(x, y, nextState, '#');
        hasChanged = true;
      }
    }
  }

  if(!hasChanged) {
    throw new NoChangeError();
  }

  return nextState;
}

function countOccupied(roomState: Room): number {
  let counter = 0;
  for (let i = 0; i < roomSizeX; i++) {
    for (let j = 0; j < roomSizeY; j++) {
      if (getSpot(i, j, roomState) === '#') {
        counter++;
      }
    }
  }
  return counter;
}

function printRoom(roomState: Room): void {
  const rows = roomState.map((rows) => (rows.reduce((acc, char) => (`${acc}${char}`))));
  console.log(rows.reduce((acc, str) => (`${acc}\n${str}`)));
}

export async function main() {
  let room = text.split('\n').map((v) => v.split(''));
  console.log('Starting Room');
  printRoom(room);
  roomSizeY = room.length;
  roomSizeX = room[0].length;

      // room = calculateNextStateViaVisibility(room, false);

      // printRoom(room);
      // room = calculateNextStateViaVisibility(room, false);

      // printRoom(room);
      // room = calculateNextStateViaVisibility(room, false);
      // printRoom(room);
      // room = calculateNextStateViaVisibility(room, false);
      // printRoom(room);
  try {
    do {
      room = calculateNextStateViaVisibility(room);
      console.log('\nGot Next State\n');
      printRoom(room);
    } while(true)
  } catch (err) {
    if (err instanceof NoChangeError) {
      console.log('Found no change. Counting occupied seats...');
      console.log(countOccupied(room));
    } else {
      throw err;
    }
  }
}

