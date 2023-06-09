/* eslint-disable no-console */
import { parse } from 'csv-parse/sync';
import { DateTime } from 'luxon';
import { v5 as uuidv5 } from 'uuid';

import { ATMError } from './ATMError';
import { Account, InitialAccount, Transaction } from './Account';
import { AtmMessages, AutomatedTellerMachine } from "./AutomatedTellerMachine";

export const PIN_HASH_NAMESPACE = '1c22bcfe-baa1-468a-a7b3-25e4aa51dc5b';

const OVERDRAFT_FEE = 5;

export class InMemoryAutomatedTellerMachine implements AutomatedTellerMachine {
  private authorizationTimeout?: NodeJS.Timeout;
  private authorizedAccountId?: string;

  constructor(
    initialAccountsCsv?: Buffer,
    private cashOnHand: number = 10000.00,
    private readonly accountMap: Map<string, Account> = new Map()) {
      if (initialAccountsCsv) {
        const initialAccounts: InitialAccount[] = parse(initialAccountsCsv, {columns: true});
        for (const account of initialAccounts) {
          const newAccount: Account = {
            accountId: account.ACCOUNT_ID,
            pinHash: uuidv5(account.PIN, PIN_HASH_NAMESPACE),
            balance: parseFloat(account.BALANCE),
            transactions: [],
            overdrawn: false,
          };
          this.accountMap.set(newAccount.accountId, newAccount);
        }
      }
  }

  private handleTimeout(accountId: string) {
    console.log(`${accountId} Timed out!`);
    this.authorizedAccountId = undefined;
    console.log(`> `);
  }

  private refreshAuthorization(accountId: string) {
    this.authorizedAccountId = accountId;

    if (this.authorizationTimeout) {
      clearTimeout(this.authorizationTimeout);
    }
    // 2 minutes = 2minutes * 60s * 1000ms = 120000ms
    this.authorizationTimeout = setTimeout(this.handleTimeout.bind(this), 120000, accountId);
  }

  private assertAuthorized() {
    if (this.authorizedAccountId === undefined) {
      throw new ATMError(AtmMessages.AuthRequired);
    }

    this.refreshAuthorization(this.authorizedAccountId);
  }

  authorize(accountId: string, pin: string): void {
    if (!this.accountMap.has(accountId)) {
      throw new ATMError(AtmMessages.AuthFailed);
    }

    const account = this.accountMap.get(accountId)!;
    if (account.pinHash !== uuidv5(pin, PIN_HASH_NAMESPACE)) {
      throw new ATMError(AtmMessages.AuthFailed);
    }

    this.refreshAuthorization(accountId);
    console.log(`${accountId}${AtmMessages.AuthSuccess}`)
    return;
  }

  withdraw(intendedValue: number): void {
    this.assertAuthorized();
    let actualValue = intendedValue;
    if (intendedValue <= 0 || intendedValue % 20 !== 0) {
      throw new ATMError(`${AtmMessages.CannotDispense}${intendedValue}`);
    }

    const account = this.accountMap.get(this.authorizedAccountId!)!;
    if (account.overdrawn) {
      throw new ATMError(AtmMessages.AccountOverdrawn);
    }

    if (this.cashOnHand === 0) {
      throw new ATMError(AtmMessages.EmptyMachine);
    }

    if (intendedValue >= this.cashOnHand) {
      console.log(AtmMessages.PoorMachine);
      actualValue = this.cashOnHand;
    }

    const transactions: Transaction[] = [];
    const resultingBalance = account.balance - actualValue;
    transactions.push({
      happenedAt: new Date(),
      amount: -1 * actualValue,
      balance: resultingBalance,
    });
    account.balance -= actualValue;
    this.cashOnHand -= actualValue;

    console.log(AtmMessages.AmtDispensed + actualValue.toFixed(2));

    if (resultingBalance < 0) {
      transactions.push({
        happenedAt: new Date(),
        amount: -1 * OVERDRAFT_FEE,
        balance: resultingBalance - OVERDRAFT_FEE,
      });
      account.balance -= OVERDRAFT_FEE;
      account.overdrawn = true;
      console.log(AtmMessages.BalanceWithOverdraft + account.balance);
    } else {
      console.log(AtmMessages.Balance + account.balance.toFixed(2));
    }

    account.transactions.push(...transactions);
  }
  
  deposit(value: number): void {
    this.assertAuthorized();
    if (value <= 0) {
      throw new ATMError(AtmMessages.CannotDeposit + value);
    }
    
    const account = this.accountMap.get(this.authorizedAccountId!)!;
    const newBalance: number = account.balance + value;
    account.transactions.push({
      happenedAt: new Date(),
      amount: value,
      balance: newBalance,
    });
    account.balance = newBalance;

    console.log(AtmMessages.Balance + newBalance.toFixed(2));
  }

  balance(): void {
    this.assertAuthorized();
    const account = this.accountMap.get(this.authorizedAccountId!)!;
    console.log(AtmMessages.Balance + account.balance);
  }

  history(): void {
    this.assertAuthorized();
    const account = this.accountMap.get(this.authorizedAccountId!)!;
    if (!account.transactions.length) {
      console.log(AtmMessages.NoHistory);
    }

    const transactions = new Array(...account.transactions);
    transactions.reverse();
    for (const transaction of transactions) {
      DateTime.fromJSDate(transaction.happenedAt).toFormat('yyyy-mm-dd HH:mm:ss')
      console.log(`${DateTime.fromJSDate(transaction.happenedAt).toFormat('yyyy-mm-dd HH:mm:ss')} ${transaction.amount.toFixed(2)} ${transaction.balance.toFixed(2)}`)
    }
  }

  logout(): void {
    if (!this.authorizedAccountId) {
      console.log(AtmMessages.NoAuth);
    } else {
      console.log(`Account ${this.authorizedAccountId} logged out.`);
      this.authorizedAccountId = undefined;
      clearTimeout(this.authorizationTimeout);
    }
  }
}