import { text } from './input';

export async function main() {
  const entries = text.split('\n\n').map((str) => str.replace(/\n/gi, ' '));
  const fieldParserRegex = /([a-z]{3}):([a-z0-9#]*)/;
  const cmRegex = /(\d+)cm/;
  const inRegex = /(\d+)in/;
  const hcRegex = /^#[0-9a-f]{6}$/;
  const eclRegex = /^(?:blu|amb|brn|gry|grn|hzl|oth)$/
  const pidRegex = /^[0-9]{9}$/;
  let validPassports = 0;
  let invalidPassports = 0;
  for (const entry of entries) {
    const fields = entry.split(' ');
    const set = new Set<string>();
    for (const field of fields) {
      const results = fieldParserRegex.exec(field);
      const property = results![1];
      const value = results![2];
      const valueInt = parseInt(value);
      let cmResults;
      let inResults;
      switch (property) {
        case 'byr':
          if (valueInt >=1920 && valueInt <= 2002) {
            set.add(property);
          }
          break;
        case 'iyr':
          if (valueInt >= 2010 && valueInt <= 2020) {
            set.add(property);
          }
          break;
        case 'eyr':
          if (valueInt >= 2020 && valueInt <= 2030) {
            set.add(property);
          }
          break;
        case 'hgt':
          cmResults = cmRegex.exec(value);
          if (cmResults) {
            if (parseInt(cmResults[1]) >= 150 && parseInt(cmResults[1]) <= 193) {
              set.add(property);
            }
          }
          inResults = inRegex.exec(value);
          if(inResults) {
            if(parseInt(inResults[1]) >= 59 && parseInt(inResults[1]) <= 76) {
              set.add(property);
            }
          }
          break;
        case 'hcl':
          if (hcRegex.test(value)) {
            set.add(property);
          }
          break;
        case 'ecl':
          if (eclRegex.test(value)) {
            set.add(property);
          }
          break;
        case 'pid':
          if (pidRegex.test(value)) {
            set.add(property);
          }
          break;
        case 'cid':
          set.add(property);
          break;
        default:
          console.log(`Weird property: ${property}`);
          break;
      }
    }
    if (set.size === 8 || (set.size === 7 && !set.has('cid'))) {
      //console.log(fields.sort() + '\n');
      validPassports++;
    } else {
      invalidPassports++;
    }
  }

  console.log(`Valid: ${validPassports}`);
  console.log(`Invalid: ${invalidPassports}`);
}
