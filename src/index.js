/* DOCUMENT INFORMATION
	- Author:   Dominik Maszczyk
	- Email:    Skitionek@gmail.com
	- Created:  2019-05-01
*/

const { RESTDataSource } = require('apollo-datasource-rest/dist/index');

require('dotenv').config();
const apiKey = 'AV_KEY';
const path = require('path');

/**
 * The Alpha Vantage core module.
 */
class AlphaVantageAPI extends RESTDataSource {
	constructor(config) {
		super();
		this.initialize(config||{});

		this.apikey = config.key || process.env[apiKey];

		// Check for config errors.
		if (!this.apikey) {
			const errorMessage = `Missing Alpha Vantage API key`;
			throw new Error(errorMessage);
		}

		this.baseURL = `https://www.alphavantage.co/query`;

		// autoBind(this);
		// this.fn = AlphaVantageAPI.fn.bind(this);
		//
		const self = this;
		Object.keys(AlphaVantageAPI.prototype).forEach(key => {
			if (self[key] instanceof Object) {
				Object.keys(self[key]).forEach(key2 => {
					self[key][key2] = self[key][key2].bind(self);
				})
			}
		})
	}

	// bindMethods(self) {
	// 	function bind(d) {
	//
	// 	}
	// 	Object.keys(AlphaVantageAPI.prototype).filter(key => typeof this[key] === 'function').forEach(key => {
	// 		this[key] = this[key].bind(this);
	// 	})
	// }

	static extend(extensionPath, alias = path.parse(extensionPath).name) {
		let extension = require(extensionPath);
		if (typeof extension === 'function') extension = extension(this);
		AlphaVantageAPI.prototype[alias] = extension;
	}
}

// // Include all the submodules.
AlphaVantageAPI.extend('./lib/util');
AlphaVantageAPI.extend('./lib/data');
AlphaVantageAPI.extend('./lib/crypto');
AlphaVantageAPI.extend('./lib/forex');
AlphaVantageAPI.extend('./lib/technical');
AlphaVantageAPI.extend('./lib/performance');

export default AlphaVantageAPI;