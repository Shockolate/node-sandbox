import { text } from './input';

export async function main() {
  const numbers: number[] = text.split('\n').map((v) => (parseInt(v)));
  const weakness = findOutOfPlace(25, numbers);
  const {lowerRange, upperRange} = findRange(weakness, numbers)!;

  let lowestValue = Number.MAX_SAFE_INTEGER;
  let highestValue = Number.MIN_SAFE_INTEGER;
  
  for (let i = lowerRange; i <= upperRange; i++) {
    lowestValue = Math.min(lowestValue, numbers[i]);
    highestValue = Math.max(highestValue, numbers[i]);
  }

  console.log(`${lowestValue} + ${highestValue} = ${lowestValue + highestValue}`);
}

function findRange(weakness: {index: number, value: number}, numbers: number[]) {
  for (let i = 0; i < weakness.index; i++) {
    let count = 0;
    let cursor = i;
    do {
      count += numbers[cursor];
      // console.log(`${i} (${numbers[i]}) - ${cursor} (${numbers[cursor]}) : ${count}`);
      if (count === weakness.value) {
        console.log(`SUCCESS! ${i} (${numbers[i]}) - ${cursor} (${numbers[cursor]}) : ${count}`);
        return {lowerRange: i, upperRange: cursor};
      }
      cursor += 1;
    } while (count < weakness.value);
  }
  throw new Error('Ruh roh');
}

function findOutOfPlace(preambleLength: number, numbers: number[]) {
  for (let i = preambleLength; i < numbers.length; i++) {
    if (!checkCurrent(preambleLength, numbers, i)) {
      console.log(`${numbers[i]} doesn't fit!`);
      return {index: i, value: numbers[i]};
    }
  }
  throw new Error('All fit.')
}


function checkCurrent(preambleLength: number, numbers: number[], currentIndex: number): boolean {
  const current = numbers[currentIndex];
  for(let i = currentIndex - preambleLength; i < currentIndex; i++) {
    for (let j = i + 1; j < currentIndex; j++) {
      if (numbers[i] + numbers[j] === current) {
        return true;
      }
    }
  }
  return false;
}