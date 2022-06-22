import React, { useCallback, useContext } from 'react';

import { MainData } from '../data/MainData';

import { MainContext } from '../contexts/MainContext';

const CandleTimeFrame = React.memo(() => {
  const mainContext = useContext(MainContext);
  
  /*
  ** Change analyze data next/previos analyze 
  */
  const timeType_OnClick = useCallback((item) => mainContext.toggleTimeType(item), [mainContext.pairs]);
  const pairs_OnClick = useCallback((item) => mainContext.togglePairs(item), [mainContext.timeType]);

  // console.log('CandleTimeFrame js render');
  return (
    <div className='timeFrameComponent-container'>
      <ul className='list-group list-group-horizontal'>
        {MainData.times.map((item, index) =>
          <li key={index} id={item}
            onClick={() => timeType_OnClick(item)}
            className={`list-group-item list-group-item-action ${mainContext.timeType === item ? "list-group-item-dark" : "list-group-item-light"}`}>
            <span>
              {item.Symbol}
            </span>
          </li>
        )}
      </ul>

      <div className="dropdown">
        <button className="btn btn-success dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
          {mainContext.pairs.Symbol}
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
          {MainData.pairs.map((item, index) => 
            <span key={index}
              onClick={() => pairs_OnClick(item)}
              className={`dropdown-item ${item === mainContext.pairs && 'disabled'}`}>{item.Symbol}</span>
          )}
        </ul>
      </div>
    </div>
  );
})

export default CandleTimeFrame;