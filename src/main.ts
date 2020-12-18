import { text } from './input';


const ruleRegex = /(\d+) (\w+ \w+) bags?/g
type Rule = {color: string, quantity: number};

const containingMap: Map<string, {color: string, quantity: number}[]> = new Map();
export async function main() {
  for (const line of text.split('\n')) {
    const splitLine = line.split(' bags contain ');
    if (splitLine[1] === 'no other bags.') {
      continue;
    }
    let match;
    while(match = ruleRegex.exec(splitLine[1])) {
      if (containingMap.has(splitLine[0])) {
        const rules = containingMap.get(splitLine[0])!;
        rules!.push({color: match[2], quantity: parseInt(match[1])});
      } else {
        containingMap.set(splitLine[0], [{color: match[2]!, quantity: parseInt(match[1])}]);
      }
    }
  }

  console.log(countContainingBags('shiny gold'));
}

function countContainingBags(color: string): number {
  console.log(`Counting Color: ${color}`);
  const rules = containingMap.get(color);
  if (!rules) {
    console.log(`BaseCase returning 0 - ${color}`)
    return 0;
  }

  let count = 0;
  for (const rule of rules) {
    const containingBags  = countContainingBags(rule.color);
    console.log(`${color} + ${rule.color} Adding to count: ${rule.quantity} + ${rule.quantity} * ${containingBags} = ${rule.quantity + (rule.quantity * containingBags)}`);
    count += rule.quantity + (rule.quantity * containingBags);
  }
  return count;
}

function dfs(color: string, visited: Set<string>) {
  if (color === 'shiny gold') {
    return true;
  }
  visited.add(color);
  const rules = containingMap.get(color);

  if (!rules) {
    return false;
  }

  for (const rule of rules!) {
    if (visited.has(rule.color)) {
      continue;
    }

    if (dfs(rule.color, visited)) {
      return true;
    }
  }
  return false;
}
