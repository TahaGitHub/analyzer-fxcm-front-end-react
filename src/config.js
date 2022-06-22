var config = {};

// D291175353 Account
config.token = 'e82c25974c65ba8d09b311f1942b3303a78858ce'; // get this from http://fxcmstation.fxcm.com/

config.fxcm_api_host = 'api-demo.fxcm.com';
config.fxcm_api_port = 443;
config.fxcm_api_proto = 'https'; // http or https
config.fxcm_full_api_host = config.fxcm_api_proto + '://' + config.fxcm_api_host + ':' + config.fxcm_api_port;

config.analyzer_api_host = 'analyzer-back-end-iuautt5bsa-uc.a.run.app'; // 'localhost';
// config.analyzer_api_port = 5000;
config.analyzer_api_proto = 'https'; // http or https

config.analyzer_full_api_host = config.analyzer_api_proto + '://' + config.analyzer_api_host; // + ':' + config.analyzer_api_port;

module.exports = config;