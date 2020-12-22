import { exampleText, fullText } from './input';

const movementRegex = /(N|S|E|W|L|R|F)(\d+)/;

export async function main() {
  const movements = fullText.split('\n');
  const pose = {x: 0, y: 0, orientation: 0};
  const waypoint = {x: 10, y: 1};
  for (const movement of movements) {
    const results = movementRegex.exec(movement)!;
    const direction = results[1];
    const value = parseInt(results[2]);


    let startingX = waypoint.x;
    let startingY = waypoint.y;
    switch (direction) {
      case 'N':
        waypoint.y += value;
        break;
      case 'S':
        waypoint.y -= value;
        break;
      case 'E':
        waypoint.x += value;
        break;
      case 'W':
        waypoint.x -= value;
        break;
      case 'L':
        switch (value) {
          case 0:
            break;
          case 90:
            waypoint.x = -startingY;
            waypoint.y = startingX;
            break;
          case 180:
            waypoint.x = -startingX;
            waypoint.y = -startingY;
            break;
          case 270:
            waypoint.x = startingY;
            waypoint.y = -startingX;
            break;
          default:
            throw new Error('Unknown pose');
        }
        break;
      case 'R':
        switch(value) {
          case 0:
            break;
          case 90:
            waypoint.x = startingY;
            waypoint.y = -startingX;
            break;
          case 180:
            waypoint.x = -startingX;
            waypoint.y = -startingY;
            break;
          case 270:
            waypoint.x = -startingY;
            waypoint.y = startingX;
            break;
          default:
            throw new Error('Unknown pose');
        }
        break;
      case 'F':
        pose.x += waypoint.x * value;
        pose.y += waypoint.y * value;
        break;
    }
    console.log(pose);
  }

  console.log(`Manhattan Distance ${Math.abs(pose.x) + Math.abs(pose.y)}`);
}
