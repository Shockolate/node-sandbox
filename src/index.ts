import {main} from './main';

/* istanbul ignore next */
if (require.main === module) {
	// Run the application
	main().catch((err) => {
		// eslint-disable-next-line no-console
		console.error('Cannot start the application.', err);
		process.exit(1);
	});
}