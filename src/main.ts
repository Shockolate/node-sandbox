/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
// import axios from 'axios';
// import _ from 'lodash';
// import { v4 as uuidv4 } from 'uuid';
import { readFile } from 'node:fs/promises';
import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';
import { promisify } from 'node:util';

import figlet from 'figlet';

import { ATMError, AtmMessages, AutomatedTellerMachine, InMemoryAutomatedTellerMachine, isATMError } from './atm';

const figletText = promisify(figlet.text);

export async function main(): Promise<void> {
	let running = true;
	const malformedRequest = new ATMError('Malformed request');

	console.log(await figletText('TakeOff ATM'));
	console.log(process.env.PWD);
	const contents = await readFile('./src/initial_accounts.csv');

	const atm: AutomatedTellerMachine = new InMemoryAutomatedTellerMachine(contents);

	const rl = readline.createInterface({input, output });


	while (running) {
		const words = (await rl.question('> ')).split(' ');

		try {
			switch (words[0]) {
				case 'authorize':
					if (words[1] && words[2]) {
						atm.authorize(words[1], words[2]);
					} else {
						throw new ATMError(AtmMessages.AuthFailed);
					}
					break;
		
				case 'withdraw': 
					if (words[1]) {
						const value = parseInt(words[1]);
						if (isNaN(value)) {
							throw malformedRequest;
						}
						atm.withdraw(value);
					} else {
						throw malformedRequest;
					}
					break;

				case 'deposit':
					if (words[1]) {
						const value = parseFloat(words[1]);
						if (isNaN(value)) {
							throw malformedRequest;
						}

						atm.deposit(value);
					} else {
						throw malformedRequest;
					}
					break;

				case 'balance':
					atm.balance();
					break;

				case 'history':
					atm.history();
					break;

				case 'history':
					atm.history();
					break;

				case 'logout':
					atm.logout();
					break;
			
				case 'end':
					running = false;
					console.log('Shutting down...');
					break;
					
				default:
					console.log(`Unknown command: ${words[0]}`);
			}
		} catch (error: unknown) {
			if (isATMError(error)) {
				console.log(error.message);
			} else {
				throw error;
			}
		}
	}
	rl.close();
}
