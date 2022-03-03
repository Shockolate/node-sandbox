import { assert } from 'chai';

import {main} from '../../src/main';
import {boggle1} from './boggleData';

describe('Boggle', function() {
  describe('boggle1', function() {
    const acceptableWords: string[] = [
      'GBNS',
      'SNBG',
      'GOUI',
      'GNGS',
      'SGNG',
      'IUOG'
    ];
    
    acceptableWords.forEach((acceptableWord: string) => {
      it(`should accept ${acceptableWord}`, function() {
        assert.isTrue(main(boggle1, acceptableWord));
      })
    })

    const unacceptableWords: string[] = [
      'BAGGBS',
      'BAGGBBAGGBBAGGBBAGGB',
      '',
      'ZGBNS'
    ];

    unacceptableWords.forEach((unacceptableWord: string) => {
      it(`should not accept ${unacceptableWord}`, function() {
        assert.isFalse(main(boggle1, unacceptableWord));
      })
    });
  })
});