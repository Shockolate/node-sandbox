import { text } from './input';
import * as _ from 'lodash';

let deviceJoltage = 0;
const cache = {} as any;

class Adapter {
  readonly compatibility: number[];
  constructor(readonly rating: number) {
    this.compatibility = [
      rating + 1,
      rating + 2,
      rating + 3,
    ]
  }
}

export async function main() {
  const adapterRatings =  _.sortBy(text.split('\n').map((t) => (parseInt(t))).sort());

  deviceJoltage = adapterRatings[adapterRatings.length - 1] + 3;
  adapterRatings.push(deviceJoltage);

  const adapters = adapterRatings.map((r) => (new Adapter(r)));
  adapters.unshift(new Adapter(0));
  const permutations = [1, 1, 1, 2, 4, 7, 13]
  let sequenceLength = 0
  let combinationCount = 1
  let maxLength = 0
  const jolts = {
    1: 0,
    3: 0
  } as any;

  adapters.forEach((adapter, index, list) => {
    sequenceLength++;
    const next = list[index + 1];
    if (next) {
      const jolt = next.rating - adapter.rating;
      jolts[jolt]++;
      if (jolt === 3) {
        combinationCount = combinationCount * permutations[sequenceLength];
        sequenceLength = 0;
      }
    }
  });

  console.log(combinationCount);
}
