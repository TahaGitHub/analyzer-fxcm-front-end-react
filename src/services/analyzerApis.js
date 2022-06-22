import axios from 'axios';
import { analyzer_full_api_host } from '../config';

class AnalyzeApis {
  analyze_fibonacci(data) {
    // console.log(data)
    return axios(analyzer_full_api_host + '/projects/analyzer/fibonacci', {
      method: 'POST',
      data: data,
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      }
    });
  }

  analyze_ml(data) {
    // console.log(data)
    return axios(analyzer_full_api_host + '/projects/analyzer/ml', {
      method: 'POST',
      data: data,
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
      }
    });
  }
}

export default new AnalyzeApis();