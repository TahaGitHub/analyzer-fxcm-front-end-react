import React, { useCallback, useContext, useEffect } from 'react';

import { createChart, CrosshairMode } from "lightweight-charts";
import { MainContext } from '../../contexts/MainContext';
import { cli } from '../../socketConfig/FxcmConnection';

import ReCharts from '../recharts/Chart';

var chart1;
var lineSeries_moving;
var lineSeries_pattern;

function ChartLight ({ data, analysisData_fib, analysisData_ml, analysisDataNo }) {
  const mainContext = useContext(MainContext);

  useEffect(() => {
    init();
    // console.log(data)
    // console.log(mainContext.timeType)
  }, []);

  useEffect(() => {
    // console.log(analysisData_fib);
    // console.log(analysisDataNo);
    if (analysisData_fib && analysisDataNo !== undefined) {
      moving_line(analysisData_fib[analysisDataNo].moving);
      pattern_line(analysisData_fib[analysisDataNo].pattern.slice(0, 5));
    } else if (!analysisData_fib || !analysisDataNo) {
      try {
        chart1.removeSeries(lineSeries_moving);
      } catch (error) {}
      try {
        chart1.removeSeries(lineSeries_pattern);
      } catch (error) {}
    }
  }, [analysisData_fib, analysisDataNo]);

  const init = useCallback(() => {
    chart1 = createChart(document.getElementById("chart1"), {
      width: 900,
      height: 400,
      layout: {
        // backgroundColor: "#253248"
        textColor: 'black',
        background: {
          type: 'solid',
          color: 'white',
        }
      },
      crosshair: {
        mode: CrosshairMode.Normal
      },
      priceScale: {
        scaleMargins: {
          top: 0.3,
          bottom: 0.25
        },
      },
      grid: {
        vertLines: {
          color: "rgba(42, 46, 57, .2)"
        },
        horzLines: {
          color: "rgba(42, 46, 57, 0.2)"
        }
      },
      timeScale: {
        timeVisible: true,
        rightOffset: 10,
      },
    });
    
    // resize();
    // window.addEventListener("resize", resize, false);
    // function resize() {
    //   chart.applyOptions({ width: window.innerWidth, height: window.innerHeight });
    //   setTimeout(() => chart.timeScale().fitContent(), 0);
    // }

    var candleSeries = chart1.addCandlestickSeries();
    candleSeries.setData(data);

    var currentBar = {
      open: null,
      high: null,
      low: null,
      close: null,
      time: null
    };
  
    function mergeTickToBar(price) {

      let time = new Date(price.time * 1000);
      // console.log(time)
      
      if (currentBar.open !== null) {
        let lastIndex = data[data.length - 1 ];
        // console.log(lastIndex)
        // console.log(new Date(lastIndex.time * 1000))

        if (['m1', 'm5', 'm15', 'm30'].includes(mainContext.timeType.Symbol) && new Date(lastIndex.time * 1000).getUTCMinutes() !== time.getUTCMinutes()) {
          // console.log(time.getMinutes(), ' minute')
          let min = time.getUTCMinutes();
          if (mainContext.timeType.Symbol === 'm30' && min % 30 === 0) {
            currentBar.open = null;
            // console.log('30')
          } else if (mainContext.timeType.Symbol === 'm15' && min % 15 === 0) {
            currentBar.open = null;
            // console.log('15')
          } else if (mainContext.timeType.Symbol === 'm5' && min % 5 === 0) {
            currentBar.open = null;
            // console.log('5')
          } else if (mainContext.timeType.Symbol === 'm1') {
            // console.log('1')
            currentBar.open = null;
          }
        } else if (['h1', 'h2', 'h3', 'h4', 'h6', 'h8'].includes(mainContext.timeType.Symbol)) {
          // console.log(time.getHours(), ' hour')
        }
        // else {
        //   console.log('Out of date');
        // }
      }

      // console.log(newPrice)
      // console.log(currentBar)
      if (currentBar.open === null) {
        // console.log('new price')
        currentBar.open = price.open;
        currentBar.high = price.high;
        currentBar.low = price.low;
        currentBar.close = price.close;
        currentBar.time = price.time;

        data.push(currentBar);
      } else {
        // console.log('old price')
        currentBar.close = price.close;
        currentBar.high = Math.max(currentBar.high, price.high);
        currentBar.low = Math.min(currentBar.low, price.low);
      }

      candleSeries.update(currentBar);
    }

    const priceUpdate = (update) => {
      try {
        var jsonData = JSON.parse(update);
        // console.log(jsonData)
        
        let price = {
          time: jsonData.Updated / 1000,
          open: jsonData.Rates[0],
          close: jsonData.Rates[0],
          low: jsonData.Rates[0],
          high: jsonData.Rates[0],
        };
        
        mergeTickToBar(price);

      } catch (e) {
        console.log('price update JSON parse error: ', e);
        return;
      }
    }

    console.log('The pairs will subscribing ', mainContext.pairs);
    cli.emit('price_subscribe', {pairs: mainContext.pairs.Symbol, _callback: priceUpdate});  
    
  }, []);

  const moving_line = useCallback((list) => {
    // console.log('lineSeries_moving ', list);

    if (lineSeries_moving) {
      try {
        chart1.removeSeries(lineSeries_moving);
      } catch (error) {}
    }

    lineSeries_moving = chart1.addLineSeries({ color: 'red' });
    lineSeries_moving.setData(list);
    
  }, []);

  const pattern_line = useCallback((list) => {
    // console.log('lineSeries_pattern ', list);

    if (lineSeries_pattern) {
      try {
        chart1.removeSeries(lineSeries_pattern);
      } catch (error) {}
    }

    setTimeout(() => {
      lineSeries_pattern = chart1.addLineSeries({ color: 'blue' });
      lineSeries_pattern.setData(list);  
    }, 0);
    
  }, []);

  return (
    <div>
      <div id="chart1" />
      { analysisData_ml && <ReCharts analysisData_ml={analysisData_ml} analysisDataNo={analysisDataNo} />  } 
    </div>
  );
}

export default ChartLight;