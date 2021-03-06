import mapValues from "lodash.mapvalues"

module.exports = AlphaVantageAPI => {

	function formatKey(key) {
		const [f, s] = key.split('_');
		return `${f === 'a' ? 'from' : f === 'b' ? 'to' : f}${s ? `_${s}` : ''}`;
	}

	/**
	 * Util function to get the crypto data.
	 *
	 * @param {String} fn
	 *   The enum fn available for crypto data.
	 *
	 * @returns {Function}
	 *   A data function to accept user input and returns a promise.
	 */
	const series = fn => function ({ symbol, market }) {
		return this.util.fn(
			fn,
			'time_series',
			d => {
				d.data = d.data.map(value => {
					const keys = Object.keys(value);
					const result = {};
					keys.forEach(key => {
						result[formatKey(key)] = value[key];
					});
					return result;
				});
				return d;
			}
		).call(this, {
			symbol,
			market
		})
	};

	const polish_realtime_currency_exchange_rate = data =>
		mapValues(data.realtime_currency_exchange_rate, v => v === '-' ? undefined : v);

	return {
		exchangeRates({ from_currency, to_currency }) {
			return this.util.fn('CURRENCY_EXCHANGE_RATE', polish_realtime_currency_exchange_rate).call(this, {
				from_currency,
				to_currency
			})
		},
		daily: series('DIGITAL_CURRENCY_DAILY'),
		weekly: series('DIGITAL_CURRENCY_WEEKLY'),
		monthly: series('DIGITAL_CURRENCY_MONTHLY'),

		exchangeTimeSeries({ symbol, market, interval }) {
			return this.crypto[interval.toLowerCase()]({
				symbol,
				market
			});
		}
	};
};