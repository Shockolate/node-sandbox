import { text } from './input';

export async function main() {
  let questionSum = 0;
  const groups = text.split('\n\n');
  for (const group of groups) {
    const answerMap: Map<string, number> = new Map();
    const people = group.split('\n');
    for (const person of people) {
      for (const question of person) {
        if (answerMap.has(question)) {
          let num = answerMap.get(question)!;
          num += 1;
          answerMap.set(question, num);
        } else {
          answerMap.set(question, 1);
        }
      }
    }
    for (const value of answerMap.values()) {
      if (value === people.length) {
        questionSum += 1;
      }
    }
  }

  console.log(questionSum);
}

