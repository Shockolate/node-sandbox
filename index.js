// eslint-disable-next-line strict
'use strict';

require('source-map-support').install();

const application = require('./dist');

module.exports = application;

if (require.main === module) {
	// Run the application
	application.main().catch((err) => {
		// eslint-disable-next-line no-console
		console.error('Cannot start the application.', err);
		process.exit(1);
	});
}
