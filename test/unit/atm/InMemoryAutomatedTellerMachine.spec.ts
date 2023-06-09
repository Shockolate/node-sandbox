import { assert } from 'chai';
import Chance from 'chance';
import sinon from 'sinon';
import { v5 as uuidv5 } from 'uuid';

import { ATMError, Account, AutomatedTellerMachine, InMemoryAutomatedTellerMachine, PIN_HASH_NAMESPACE } from "../../../src/atm";

describe(InMemoryAutomatedTellerMachine.name, function() {
  const chance = new Chance();
  let atm: AutomatedTellerMachine;
  let clock: sinon.SinonFakeTimers;
  let map: Map<string, Account>;
  let accountId: string;
  let pin: string;
  let pinHash: string;

  beforeEach(function() {
    accountId = chance.natural().toString();
    pin = chance.string({numeric: true, length: 4});
    pinHash = uuidv5(pin, PIN_HASH_NAMESPACE);
    map = new Map();
    map.set(accountId, {accountId, balance: 80, transactions: [], overdrawn: false, pinHash})
    clock = sinon.useFakeTimers();
    atm = new InMemoryAutomatedTellerMachine(
      undefined,
      100,
      map
    );
  });

  afterEach(function() {
    clock.restore();
  });

  describe('authorize', function() {
    it('should authorize the account', function() {
      atm.authorize(accountId, pin);
      atm.balance();
    });

    it('should expire after 2minutes', function() {
      let thrown = false;
      atm.authorize(accountId, pin);
      clock.tick(120100);
      try {
        atm.balance();
      } catch (err) {
        thrown = true;
        assert.isOk(err);
        assert.instanceOf(err, ATMError);
      }

      assert.isTrue(thrown);
    });

    it('should not authorize with bogus PIN', function() {
      let thrown = false;
      try {
        atm.authorize(accountId, '0000');
      } catch (err) {
        thrown = true;
        assert.isOk(err);
        assert.instanceOf(err, ATMError);
      }

      assert.isTrue(thrown);
    });


    it('should not authorize with bogus accountId', function() {
      let thrown = false;
      try {
        atm.authorize(chance.guid(), pin);
      } catch (err) {
        thrown = true;
        assert.isOk(err);
        assert.instanceOf(err, ATMError);
      }

      assert.isTrue(thrown);
    });
  });

  describe('withdraw', function() {
    it('should throw if we\'re not authorized', function() {
      let thrown = false;
      try {
        atm.withdraw(100); 
      } catch (err) {
        thrown = true;
        assert.isOk(err);
        assert.instanceOf(err, ATMError);
      }

      assert.isTrue(thrown);
    });

    describe('authorized', function() {

    beforeEach(function() {
      atm.authorize(accountId, pin);
    })

      it('should throw if we try to withdraw a negative number', function() {
        let thrown = false;
        try {
          atm.withdraw(-20); 
        } catch (err) {
          thrown = true;
          assert.isOk(err);
          assert.instanceOf(err, ATMError);
        }

        assert.isTrue(thrown);
      });

      it('should throw if we try to withdraw 0', function() {
        let thrown = false;
        try {
          atm.withdraw(0); 
        } catch (err) {
          thrown = true;
          assert.isOk(err);
          assert.instanceOf(err, ATMError);
        }

        assert.isTrue(thrown);
      });

      it('should throw if there is no cash in the machine', function() {
        atm = new InMemoryAutomatedTellerMachine(undefined, 0, map);
        let thrown = false;
        try {
          atm.authorize(accountId, pin);
          atm.withdraw(20); 
        } catch (err) {
          thrown = true;
          assert.isOk(err);
          assert.instanceOf(err, ATMError);
        }

        assert.isTrue(thrown);
      });

      it('should throw if we try to withdraw non-20s', function() {
        let thrown = false;
        try {
          atm.withdraw(19); 
        } catch (err) {
          thrown = true;
          assert.isOk(err);
          assert.instanceOf(err, ATMError);
        }

        assert.isTrue(thrown);
      });


      it('should throw if we try to withdraw from overdrawn', function() {
        let thrown = false;

        const account = map.get(accountId)!;
        account.overdrawn = true;
        account.balance = -1;
        
        try {
          atm.withdraw(20); 
        } catch (err) {
          thrown = true;
          assert.isOk(err);
          assert.instanceOf(err, ATMError);
        }

        assert.isTrue(thrown);
      });

      it('should dispense the all of the cash if requested more', function() {
        const account = map.get(accountId)!;
        account.balance = 100000;

        atm.withdraw(120);
        
        assert.lengthOf(account.transactions, 1);
        assert.strictEqual(account.transactions[0].amount, -100);
      })


      it('should overdraw an account', function() {
        atm.withdraw(100);

        const account = map.get(accountId)!;
        assert.lengthOf(account.transactions, 2);
        assert.strictEqual(account.transactions[0].amount, -100);
        assert.strictEqual(account.transactions[1].amount, -5);
      })
    });
  })

  describe('deposit', function() {
    it('should throw if we\'re not authorized', function() {
      let thrown = false;
      try {
        atm.deposit(100); 
      } catch (err) {
        thrown = true;
        assert.isOk(err);
        assert.instanceOf(err, ATMError);
      }

      assert.isTrue(thrown);
    });

    describe('authorized', function() {
      beforeEach(function() {
        atm.authorize(accountId, pin);
      });

      it('should deposit any amount', function() {
        const deposit = 19.01;

        atm.deposit(deposit);

        const account = map.get(accountId)!;
        assert.strictEqual(account.balance, 80 + deposit);
        assert.lengthOf(account.transactions, 1);
      });
    });
  });

  describe('balance', function() {
    it('should throw if we\'re not authorized', function() {
      let thrown = false;
      try {
        atm.balance(); 
      } catch (err) {
        thrown = true;
        assert.isOk(err);
        assert.instanceOf(err, ATMError);
      }

      assert.isTrue(thrown);
    });

    describe('authorized', function() {
      beforeEach(function() {
        atm.authorize(accountId, pin);
      });

      it('check the balance', function() {
        atm.balance();
      });
    });
  });

  describe('history', function() {
    it('should throw if we\'re not authorized', function() {
      let thrown = false;
      try {
        atm.balance(); 
      } catch (err) {
        thrown = true;
        assert.isOk(err);
        assert.instanceOf(err, ATMError);
      }

      assert.isTrue(thrown);
    });

    describe('authorized', function() {
      beforeEach(function() {
        atm.authorize(accountId, pin);
      });

      it('should display the history', function() {
        atm.history();
      });
    });
  });

  describe('logout', function() {
    it('should throw if we\'re not authorized', function() {
      let thrown = false;
      try {
        atm.balance(); 
      } catch (err) {
        thrown = true;
        assert.isOk(err);
        assert.instanceOf(err, ATMError);
      }

      assert.isTrue(thrown);
    });

    describe('authorized', function() {
      beforeEach(function() {
        atm.authorize(accountId, pin);
      });

      it('should logout, and not timeout', function() {
        atm.logout();
        clock.tick(120100);
      });
    });
  });
})