import React, { useCallback, useContext, useEffect, useState } from 'react';

import { MainContext } from '../contexts/MainContext';
import analyzerApis from '../services/analyzerApis';

import { FadingBalls } from "react-cssfx-loading";

const AnalyzersComponents = ({
  data,
  analysisData_fib, setanalysisData_fib,
  analysisData_ml, setanalysisData_ml,
  analysisDataNo, setanalysisDataNo }) => {

  const mainContext = useContext(MainContext);

  const [fib, setfib] = useState(false);
  const [ml, setml] = useState(false);
  const [msg, setmsg] = useState(false);

  /*
  ** Get Data every change by pairs or timetype
  */
  useEffect(() => {
    setfib(false)
    setml(false)
    setmsg(false)
  }, [mainContext.pairs, mainContext.timeType]);

  function percent () {
    if (['m1', 'm5'].includes(mainContext.timeType.Symbol)) {
      return 0.0005;
    } else if (['m15', 'm30'].includes(mainContext.timeType.Symbol)) {
      return 0.003;
    } else if (['h1', 'h2', 'h3'].includes(mainContext.timeType.Symbol)) {
      return 0.006;
    } else if (['h4', 'h6', 'h8'].includes(mainContext.timeType.Symbol)) {
      return 0.03;
    } else {
      return 0.1;
    }
  }

  function getting_event () {
    return <FadingBalls color='green' />
  }

  /*
  ** Get analyzes data from own server
  */
  const fib_OnClick = () => {
    console.log('Geting fib analysis data')
    setmsg(getting_event());
    setml(e => false)
    setanalysisData_fib(null)
    setanalysisData_ml(null)
    setanalysisDataNo(null)

    analyzerApis.analyze_fibonacci(data.slice(-50)).then((res) => {
      // console.log(res); 
      let list = [];
      if (res.data === 'False') {
        setmsg('No Analysis');          
        return;
      }
      for (let i = 1; i <= Object.keys(res.data.time).length; i++) {
        let _list1 = [];
        let _list2 = [];
        for (let j = 0; j < res.data.time[i].length; j++) {
          // const item = {
          let pattern = {
            time: res.data.time[i][res.data.price[i].indexOf(res.data.current_pat[i][j])], 
            // res.data.time[i][j],
            value: res.data.current_pat[i][j] - res.data.current_pat[i][j] * percent(),
          };
          let moving = {
            time: res.data.time[i][j],
            value: res.data.price[i][j] + res.data.price[i][j] * percent(),
          };
            // time: res.data.time[i][j],
            // value: res.data.price[i][j],
            // current_idx: res.data.current_idx[i][j],
            // close: res.data.current_pat[i][j],
            // open: res.data.price[i][j],
            // start: res.data.start[i][j]
          // }
          _list1.push(pattern);
          _list2.push(moving);
        }
        list.push({ pattern: _list1, moving: _list2});
      }
      
      setmsg(`${list.length} Analysis Found`);
      setanalysisData_fib([...list]);
      // console.log(list);
      setanalysisDataNo(e => e = 0);
      setfib(e => true);
    }).catch((err) => {
      setfib(e => false)
      setmsg('Can not reach the server');
    });
  }

  const ml_OnClick = () => {   
    console.log('Geting Ml analysis data')
    setmsg(getting_event());
    setfib(e => false);
    setanalysisData_fib(null)
    setanalysisData_ml(null)
    setanalysisDataNo(null)

    analyzerApis.analyze_ml(data.slice(-50)).then((res) => {
      // console.log(res)
      if (res.data === 'False' || res.data.patternsArr.length === 0) {
        setmsg('No Analysis');          
        return;
      }

      let list = [];
      res.data.xp.map((item, index) => {
        return list.push({
          xp: item,
          currentPattern: res.data.currentPattern[index]
        })
      })

      res.data.patternsArr.forEach(el => {
        el.forEach((_el, index) => {
          if (!('patterns' in list[index])) {
            list[index].patterns = [];
          }

          list[index].patterns = [
            ...list[index].patterns,
            _el
          ];
        })
      })

      let len = list.length;
      for (let i = len + 1; i < (len + 5); i++) {
        list.push({ xp: i })
      }

      list.push({ xp: list.length + 1,
        predictedAvg: res.data.predictedAvg
      }, { xp: list.length + 1 });

      // console.log(list)
      setmsg(`${res.data.patternsArr.length} Pattern Found`);
      setanalysisData_ml(list);
      setanalysisDataNo(e => e = 0);
      setml(e => true);
    }).catch((err) => {
      setml(e => false)
      setmsg('Can not reach the server ');
      console.log(err)
    });
  }

  /*
  ** Change analyze data next/previos analyze 
  */
  const nextAna_CallBack = useCallback(() => setanalysisDataNo((e) => e + 1), [analysisDataNo]);
  const previousAna_CallBack = useCallback(() => setanalysisDataNo((e) => e - 1), [analysisDataNo]);

  // console.log('Analyzer Components render');
  return (
    <div className='analyzerComponents-container'>
      Analysis types
      <div className='row content1'>
        <button className={`col-5 item1 ${fib && 'active'}`}
          disabled={!data?.length}
          onClick={() => fib_OnClick()}>
          {/* Fibonacci Sequence Button */}
          Fibonacci Sequence
        </button>
        <button className={`col-5 item1 ${ml && 'active'}`}
          disabled={!data?.length}
          onClick={() => ml_OnClick()}>
          {/* Machine Learning Button */}
          Machine Learning
        </button>
      </div>

      {msg &&
        <span className='analysis-length'>{msg}</span>
      }

      <div className='row content2'>
        <button className={`col-5 item2 ${fib && 'active'}`}
          disabled={!data?.length || analysisDataNo === undefined || analysisDataNo === 0}
          onClick={() => previousAna_CallBack()}>
          {/* Previos Button */}
          &#60;&#60;
        </button>

        <button className={`col-5 item2 ${fib && 'active'}`}
          disabled={!data?.length || analysisDataNo === undefined ||
            analysisDataNo === analysisData_fib?.length - 1 ||
            analysisDataNo === analysisData_ml?.patternsArr?.length - 1}
          onClick={() => nextAna_CallBack()}>
          {/* Next Button */}
          &#62;&#62;
        </button>
      </div>
    </div>
  );
}

export default React.memo(AnalyzersComponents);