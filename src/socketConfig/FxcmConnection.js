import io from 'socket.io-client';
import EventEmitter from 'events';
import axios from "axios";

import config from '../config';
// import fxcmApis from '../services/fxcmApis';

var token = config.token;
var fxcm_full_api_host = config.fxcm_full_api_host;
var fxcm_api_host = config.fxcm_api_host;
var fxcm_api_port = config.fxcm_api_port;
var fxcm_api_proto = config.fxcm_api_proto;
if (typeof(token) === 'undefined' || typeof(fxcm_api_host) === 'undefined' || typeof(fxcm_api_port) === 'undefined' || typeof(fxcm_api_proto) === 'undefined') {
	console.log('config.js contents error');
	// process.exit();
}
if (token === 'PASTE_YOUR_TOKEN_HERE') {
	console.log('please paste your token in config.js file');
	// process.exit();
}

let initdone = false;
let cli = new EventEmitter();
let socket;
let globalRequestID = 0;
let request_headers = {
	// 'User-Agent': 'request',
	'Accept': 'application/json',
	// 'Content-Type': 'application/x-www-form-urlencoded'
};

cli.on('send', (params) => {
	if (typeof(params.params) !== 'undefined') {
		params.params = JSON.stringify(params.params);
	}
	request_processor(params);
});

cli.on('price_subscribe', (params) => {
	if(typeof(params) === 'undefined') {
		console.log('command error: "pairs" parameter is missing.');
	} else {
		subscribe(params);
	}
});

cli.on('price_unsubscribe', (params) => {
	if(typeof(params) === 'undefined') {
		console.log('command error: "pairs" parameter is missing.');
	} else {
		unsubscribe(params);
	}
});

const subscribe = (params) => {
	if (initdone) {
		console.log('Can init once');
		return;
	} else {
		initdone = true;
	}
	
	if(typeof(params.pairs) === 'undefined') {
		console.log('command error: "pairs" parameter is missing.');
	} else {
		var callback = (statusCode, requestID, data) => {
			// let [ statusCode, requestID, data ] = [ res.status, globalRequestID, res.data ];

			if (statusCode === 200) {
				try {
					var jsonData = data;
				} catch (e) {
					console.log('subscribe request #', requestID, ' JSON parse error: ', e);
					return;
				}
				if(jsonData.response.executed) {
					try {
						// console.log(jsonData)
						for(var i in jsonData.pairs) {
							socket.on(jsonData.pairs[i].Symbol, params._callback);
						}
					} catch (e) {
						console.log('subscribe request #', requestID, ' "pairs" JSON parse error: ', e);
						return;
					}
				} else {
					console.log('subscribe request #', requestID, ' not executed: ', jsonData);
				}
			} else {
				console.log('subscribe request #', requestID, ' execution error: ', statusCode, ' : ', data);
			}
		}

		cli.emit('send', { "method": "POST", "resource":"/subscribe", "params": { "pairs": params.pairs }, "callback": callback })
		// fxcmApis.subscribe({ 'pairs': params.pairs }).then(callback)
	}
}

const unsubscribe = (params) => {
	if (!initdone) {
		console.log('Not init yet');
		return;
	} else {
		initdone = false;
	}

	if(typeof(params.pairs) === 'undefined') {
		console.log('command error: "pairs" parameter is missing.');
	} else {
		var callback = (statusCode, requestID, data) => {
			// let [ statusCode, requestID, data ] = [ res.status, globalRequestID, res.data ];

			if (statusCode === 200) {
				try {
					var jsonData = data;
				} catch (e) {
					console.log('unsubscribe request #', requestID, ' JSON parse error: ', e);
					return;
				}
				if(jsonData.response.executed) {
					try {
						socket.removeAllListeners();
						// console.log(socket)
						// for(var i in jsonData.pairs) {
						// 	socket.removeListener(jsonData.pairs[i], priceUpdate);
						// 	// socket.off(jsonData.pairs[i], params._callback)
						// }
					} catch (e) {
						console.log('unsubscribe request #', requestID, ' "pairs" JSON parse error: ', e);
						return;
					}
				} else {
					console.log('unsubscribe request #', requestID, ' not executed: ', jsonData);
				}
			} else {
				console.log('unsubscribe request #', requestID, ' execution error: ', statusCode, ' : ', data);
			}
		}
		cli.emit('send',{ "method":"POST", "resource":"/unsubscribe", "params": { "pairs": params.pairs }, "callback": callback })
		// fxcmApis.unSubscribe({ 'pairs': params.pairs }).then(callback)
	}
}

// const priceUpdate = (update) => {
// 	try {
// 		var jsonData = JSON.parse(update);
// 		// JavaScript floating point arithmetic is not accurate, so we need to round rates to 5 digits
// 		// Be aware that .toFixed returns a String
// 		jsonData.Rates = jsonData.Rates.map(function(element){
// 			return element.toFixed(5);
// 		});
// 		console.log(`@${jsonData.Updated} Price update of [${jsonData.Symbol}]: ${jsonData.Rates}`);
// 	} catch (e) {
// 		console.log('price update JSON parse error: ', e);
// 		return;
// 	}
// }

const getNextRequestID = () => {
	return globalRequestID++;
}

const default_callback = (statusCode, requestID, data) => {
	if (statusCode === 200) {
		try {
			var jsonData = JSON.parse(data);
		} catch (e) {
			console.log('request #', requestID, ' JSON parse error:', e);
			return;
		}
		console.log('request #', requestID, ' has been executed:', JSON.stringify(jsonData, null, 2));
	} else {
		console.log('request #', requestID, ' execution error:', statusCode, ' : ', data);
	}
}

function request_processor ({method, resource, params, callback}) {
	var requestID = getNextRequestID();

	if (typeof(callback) === 'undefined') {
		callback = default_callback;
		console.log('request #', requestID, ' sending');
	}
	if (typeof(method) === 'undefined') {
		method = "GET";
	}
	// console.log(params)
	// GET HTTP(S) requests have parameters encoded in URL
	// if (method === "GET") {
	// 	resource += '/?' + params;
	// }

	axios({
		method: method,
		baseURL: fxcm_full_api_host + resource,
		data: method !== 'GET' && typeof(params) !== 'undefined' && JSON.parse(params),
		params: method === 'GET' && typeof(params) !== 'undefined' && JSON.parse(params),
		headers: {
			...request_headers
		}
	}).then((response) => {
		// console.log(response)
		// console.log(response.data)
		callback(response.status, requestID, response.data);
	}).catch((err) => {
		callback(0, requestID, err); // this is called when network request fails
	})
};

// FXCM REST API requires socket.io connection to be open for requests to be processed
// id of this connection is part of the Bearer authorization
function authenticate () {
	console.log('Authenticate Socket...');
	
	return new Promise((resolve, reject) => {
		socket = io(fxcm_full_api_host, {
			query: {
				access_token: token,
			}
		});

		// console.log(socket);
		
		// fired when socket.io connects with no errors
		socket.on('connect', () => {
			console.log('Socket.IO session has been opened: ', socket.id);
			let _token = 'Bearer ' + socket.id + token;

			request_headers.Authorization = _token;
			config.Authorization = _token;

			resolve(true);

			// new SetupLivePrices(cli, socket);

			// request_processor({ "method":"GET", "resource":"/candles/83/m1", "params": { "num": 10 }, "callback": data_callback });

			// Start subscribe curency
			// cli.emit('price_subscribe', {pairs: "EUR/USD"});

			// setTimeout(() => {
			// 	// Stop subscribe currency
			// 	cli.emit('price_unsubscribe', {pairs: "EUR/USD"});
			// }, 5000);

			// var callback = (statusCode, requestID, data) => {
			// 	if (statusCode === 200) {
			// 		try {
			// 			var jsonData = data;
			// 			console.log(jsonData)
			// 		} catch (e) {
			// 			console.log('subscribe request #', requestID, ' JSON parse error: ', e);
			// 			return;
			// 		}
			// 	} else {
			// 		console.log('subscribe request #', requestID, ' execution error: ', statusCode, ' : ', data);
			// 	}
			// }
			// Get History data by number
			// cli.emit('send', { "method":"GET", "resource":"/candles/83/m15", "params": { "num": 1000 }, "callback": data_callback })
			// Get History data by date from-to
			// cli.emit('send', { "method":"GET", "resource":"/candles/1/m1", "params": { "num":1, "from":1519084679, "to":1519430400 }, "callback": callback })
		});

		// fired when socket.io cannot connect (network errors)
		socket.on('connect_error', (error) => {
			console.log('Socket.IO session connect error: ', error);
			reject(error)
		});

		// fired when socket.io cannot connect (login errors)
		socket.on('error', (error) => {
			console.log('Socket.IO session error: ', error);
			reject(error)
		});
		
		// fired when socket.io disconnects from the server
		socket.on('disconnect', () => {
			console.log('Socket disconnected, terminating client.');
			// process.exit(-1);
			resolve(true)
		});
	});
}

export {
	authenticate,
	cli
};