import axios from 'axios';

import config, { fxcm_full_api_host } from '../config';

class fxcmApis {
  get_data_fxcm(pairs, timeType, params) {
    // console.log('get_data_fxcm >> ', )
    return axios(`${fxcm_full_api_host}/candles/${pairs.OfferId}/${timeType.Symbol}`, {
      method: 'GET',
      params: params,
      headers: {
        'Content-Type': 'application/json',
				'Authorization': config.Authorization,
      }
    });
  }

	subscribe(params) {
    // console.log('subscribe >> ', params)
    return axios(`${fxcm_full_api_host}/subscribe`, {
      method: 'POST',
      data: params,
      headers: {
        'Content-Type': 'application/json',
				'Authorization': config.Authorization,
      }
    });
	}

	unSubscribe(params) {
		// console.log('unSubscribe >> ', params)
		return axios(`${fxcm_full_api_host}/unsubscribe`, {
			method: 'POST',
			data: params,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': config.Authorization,
			}
		});
	}
}

export default new fxcmApis();