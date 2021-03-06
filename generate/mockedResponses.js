/* DOCUMENT INFORMATION
	- Author:   Dominik Maszczyk
	- Email:    Skitionek@gmail.com
	- Created:  2019-05-24
*/

import AlphaVantageAPI from "../src";
import * as variables from "../src/mocks/demoVariableSets";
import { FIELD_TYPES, INTERVALS, obtainStructure } from "../test/utils";
import { timeFormat } from 'd3-time-format';

const fs = require('fs');

const alpha = new AlphaVantageAPI({ key: 'demo' });
alpha.getRaw = true;

function limitArrays(obj) {
	if (Array.isArray(obj)) {
		return [limitArrays(obj[0])]
	} else if (obj instanceof Object) {
		const r = {};
		let entries = Object.entries(obj);
		const [k] = entries[0];
		if (k.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/))
			entries = [entries[0]];
		entries
			.forEach(([ki, v]) => {
				r[ki] = limitArrays(v)
			});
		return r;
	}
	return obj;
}

const alphaStructure = AlphaVantageAPI.prototype;

const formatDate = timeFormat("%Y-%m-%d");
const formatDateTime = timeFormat("%Y-%m-%d %H:%M:%S");

const MathRandom = 0.123456789;
const DateNow = new Date(0);

function mockStructureData(obj) {
	if (Array.isArray(obj)) {
		return [mockStructureData(obj[0])]
	}
	if (typeof obj === 'object' && obj !== undefined) {
		const result = {};
		Object.entries(obj).forEach(([k, v]) => {
			result[k] = mockStructureData(v);
		});
		return result
	}
	if (typeof obj === 'string') {
		switch (obj) {
		case FIELD_TYPES.TIMESTAMP:
			return formatDateTime(DateNow);
		case FIELD_TYPES.DATE:
			return formatDate(DateNow);
		case FIELD_TYPES.FLOAT:
			return MathRandom;
		case FIELD_TYPES.INTERVAL:
			return INTERVALS[Math.floor(MathRandom * INTERVALS.length)];
		case FIELD_TYPES.STRING:
		default:
			return obj
		}
	}
	return undefined
}

['data', 'crypto', 'forex', 'performance', 'technical'].forEach(groupKey => {
	console.group(groupKey);
	Object.keys(alphaStructure[groupKey]).forEach(async (key, done) => {
		let varSet = variables[groupKey][key];
		varSet = Array.isArray(varSet) ? varSet[0] : varSet;
		const response = await alpha[groupKey][key](varSet);
		console.group(key);
		const structure = mockStructureData(obtainStructure(limitArrays(response)));

		const json = JSON.stringify(structure, undefined, 2);
		const path = `src/mocks/functions/${groupKey}/${key}.generated.json`;
		fs.writeFile(path, json, function (err) {
			if (err) throw err;
			console.log("Saved to file: ",path);
		});
		console.groupEnd();
	});
	console.groupEnd();
});

