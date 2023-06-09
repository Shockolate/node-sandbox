export namespace AtmMessages {
  export const AuthRequired = 'Authorization required.' as const;
  export const AuthFailed = 'Authorization failed.' as const;
  export const AuthSuccess = ' successfully authorized.' as const;
  export const CannotDispense = 'Cannot dispense the amount: $' as const;
  export const AccountOverdrawn = 'Your account is overdrawn! You may not make withdrawals at this time.' as const;
  export const EmptyMachine = 'Unable to process your withdrawal at this time.' as const;
  export const PoorMachine = 'Unable to dispense full amount requested at this time.' as const;
  export const AmtDispensed = 'Amount dispensed: $' as const;
  export const Balance = 'Current balance: $' as const;
  export const BalanceWithOverdraft = 'You have been charged an overdraft fee of $5. Current balance: $' as const;
  export const CannotDeposit = 'Cannot deposit the amount: $' as const;
  export const NoHistory = 'No history found' as const;
  export const NoAuth = 'No account is currently authorized.' as const;
}

export interface AutomatedTellerMachine {
  authorize(accountId: string, pin: string): void;
  withdraw(value: number): void;
  deposit(value: number): void;
  balance(): void;
  history(): void;
  logout(): void;
}