import React, { useContext, useEffect, useState } from 'react';

import AnalyzersComponents from '../../components/Analyzers';
import CandleTimeFrame from '../../components/CandleTimeFrame';
import ChartLight from '../../components/lightweight-charts/Chart';
import { MainContext } from '../../contexts/MainContext';

import fxcmApis from '../../services/fxcmApis';
import { cli } from '../../socketConfig/FxcmConnection';

function Home () {
  const mainContext = useContext(MainContext);

  const [data, setdata] = useState();
  const [analysisData_fib, setanalysisData_fib] = useState();
  const [analysisData_ml, setanalysisData_ml] = useState();

  const [msg, setmsg] = useState('Getting The Data');
  const [analysisDataNo, setanalysisDataNo] = useState();

  /*
  ** Get Data every change by pairs or timetype
  */
  useEffect(() => {
    // console.log('Geting data')
    get_data(mainContext.pairs, mainContext.timeType)
  }, [mainContext.pairs, mainContext.timeType]);

  

  const get_data = (_pairs, _timeType) => {
    if (data) {
      // console.log('Reseting The Data')

      cli.emit('price_unsubscribe', { pairs: _pairs.Symbol });
      setdata(e => null);
      setanalysisData_fib(e => null);
      setanalysisData_ml(e => null);
      setanalysisDataNo(e => undefined);
    };

    fxcmApis.get_data_fxcm(_pairs, _timeType, { "num": 1000 }).then((res) => {
      // console.log(res)
      if (res.status === 200) {
        try {
          // console.log(res.data)
          let list = [];
          res.data.candles.forEach(element => {
            if (!element) {
              setmsg('No data retured from fxcm');
              return;
            }
            
            let item = {
              time: element[0],
              open: element[1],
              close: element[2],
              high: element[3],
              low: element[4],
              
              // askopen: element[5],
              // askclose: element[6],
              // askhigh: element[7],
              // asklow: element[8],
              // tickqty: element[9]
            }
            list.push(item);
          });
          setdata(e => [...list]);
        } catch (e) {
          console.log('subscribe request # JSON parse error: ', e);
          return;
        }
      } else {
        console.log('subscribe request # execution error: ', res.status, ' : ', data);
      }
    })
  }
  
  // console.log('Home js render');
  return (
    <div className='home-page'>
      <AnalyzersComponents
        data={data}
        analysisData_fib={analysisData_fib}
        setanalysisData_fib={(list) => setanalysisData_fib(list)}
        analysisData_ml={analysisData_ml}
        setanalysisData_ml={(list) => setanalysisData_ml(list)}
        analysisDataNo={analysisDataNo}
        setanalysisDataNo={setanalysisDataNo} />

      <div className='chart-container'>
        {data ? 
          <ChartLight data={data} 
            analysisData_fib={analysisData_fib}
            analysisData_ml={analysisData_ml}
            analysisDataNo={analysisDataNo} />
          :
          <div>{msg}...</div>
        }
      </div>

      <CandleTimeFrame />
    </div>
  )
}

export default Home;