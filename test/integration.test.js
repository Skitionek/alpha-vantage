/* DOCUMENT INFORMATION
	- Author:   Dominik Maszczyk
	- Email:    Skitionek@gmail.com
	- Created:  23/04/2019
*/

import AlphaVantageAPI from "../src";
import * as variables from "../src/mocks/demoVariableSets";
import { obtainStructure } from "./utils";

jest.setTimeout(60000);

let alpha;
beforeAll(() => {
	alpha = new AlphaVantageAPI({ key: 'demo' })
});

const alphaStructure = AlphaVantageAPI.prototype;

describe.each(['data', 'crypto', 'forex', 'performance', 'technical'])("%s", groupKey => {
	describe.each(Object.keys(alphaStructure[groupKey]))("%s", key => {
		let varSets = variables[groupKey][key];
		varSets = Array.isArray(varSets) ? varSets : [varSets];
		it.each(varSets)("%j", async varSet => {
			expect.assertions(2);
			const response = await alpha[groupKey][key](varSet);
			const structure = obtainStructure(response);
			expect(structure).toMatchSnapshot();
			expect(JSON.stringify(response).length).toBeGreaterThan(150);
		});
	})
});

