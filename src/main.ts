import { text } from './input';

type BoardingPass = {
  row: number;
  column: number;
  id: number;
};

function determinePass(text: string): BoardingPass {
  let lowerRow = 0;
  let upperRow = 127;
  let lowerColumn = 0;
  let upperColumn = 7;
  const rows = text.substring(0, 7);
  const columns = text.substring(7);
  for (const row of rows) {
    if (row === 'F') {
      upperRow = Math.floor((upperRow - lowerRow) / 2) + lowerRow;
    } else if (row === 'B') {
      lowerRow = Math.ceil((upperRow - lowerRow) / 2) + lowerRow;
    } else {
      throw new Error('Not F or B');
    }
  }
  if (lowerRow !== upperRow) {
    throw new Error('non convergent rows');
  }

  for (const column of columns) {
    if (column === 'L') {
      upperColumn = Math.floor((upperColumn - lowerColumn) / 2) + lowerColumn;
    } else if (column === 'R') {
      lowerColumn = Math.ceil((upperColumn - lowerColumn) / 2) + lowerColumn;
    } else {
      throw new Error('Not L or R');
    }
  }
  if (lowerColumn !== upperColumn) {
    throw new Error('non convergent columns');
  }
  return { row: lowerColumn, column: lowerColumn, id: lowerRow * 8 + lowerColumn };
}

export async function main() {
  const lines = text.split('\n').filter((line) => (line));
  const boardingPasses = lines.map((line) => (determinePass(line)));
  const ids = boardingPasses.map((bp) => (bp.id)).sort((a, b) => (a-b));

  let myId = 0;
  let myIndex = 0;

  for (let i = 1; i < ids.length - 1; i++) {
    if (ids[i + 1] !== ids[i] + 1) {
      myId = ids[i];
      myIndex = i;
      break;
    }
  }
  console.log(`MyId: ${myId + 1}, index: ${myIndex}`);
  console.log(`${ids[myIndex - 2]}, ${ids[myIndex - 1]}, ${ids[myIndex]}, ${ids[myIndex + 1]}, ${ids[myIndex + 2]}`);
}
