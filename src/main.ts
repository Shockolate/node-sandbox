import * as _ from 'lodash';
import { text } from './input';

const instructionRegex = /(nop|acc|jmp) (\+|\-)(\d+)/;

export async function main() {
  const originalLines = text.split('\n');
  const nopLines: number[] = [];
  const jmpLines: number[] = [];
  for (let i = 0; i < originalLines.length; i++) {
    const instruction = originalLines[i].substring(0, 3);
    if (instruction === 'nop') {
      nopLines.push(i);
    } else if (instruction === 'jmp') {
      jmpLines.push(i);
    }
  }

  console.log(`Num nop ${nopLines.length}`);
  console.log(`Num jmp ${jmpLines.length}`);

  for (const nopLine of nopLines) {
    const testLines = [...originalLines];
    testLines[nopLine] = testLines[nopLine].replace('nop', 'jmp');
    if (checkIfTerminates(testLines)) {
      console.log('Success!');
      return;
    }
  }

  for (const jmpLine of jmpLines) {
    const testLines = [...originalLines];
    testLines[jmpLine] = testLines[jmpLine].replace('jmp', 'nop');
    if (checkIfTerminates(testLines)) {
      console.log('Success!');
      return;
    }
  }

  // const result = checkIfTerminates(lines);
  // console.log(result);
}

function checkIfTerminates(lines: string[]) {
  const visitedLines: boolean[] = _.times(lines.length).map(() => (false));
  let accumulator = 0;
  let executingLine = 0;

  do {
    if (visitedLines[executingLine]) {
      console.log(`Already visited line ${executingLine}, accumumlator at ${accumulator}`);
      return false;
    }

    visitedLines[executingLine] = true;

    const results = instructionRegex.exec(lines[executingLine]);
    if (!results) {
      console.log(`${executingLine} - ${lines[executingLine]}`);
      throw new Error('Unexpected result');
    }

    switch (results[1]) {
      case 'nop':
        executingLine += 1;
        break;
      case 'acc':
        executingLine += 1;
        if (results[2] === '+') {
          accumulator += parseInt(results[3]);
        } else if (results[2] === '-') {
          accumulator -= parseInt(results[3]);
        } else {
          throw new Error('unexpected sign');
        }
        break;
      case 'jmp':
        if (results[2] === '+') {
          executingLine += parseInt(results[3]);
        } else if (results[2] === '-') {
          executingLine -= parseInt(results[3]);
        } else {
          throw new Error('unexpected sign');
        }
    }
  } while (executingLine < lines.length && executingLine >= 0);

  console.log(`Exited program ${executingLine}. Accumulator at ${accumulator}`);
  return true;
}
