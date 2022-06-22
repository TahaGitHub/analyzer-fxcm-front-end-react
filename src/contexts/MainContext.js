import React, { useMemo, useState } from 'react';
import { MainData } from '../data/MainData';

export const MainContext = React.createContext();

export function MainProvider(Props) {

  const [timeType, settimeType] = useState(MainData.times[3]);
  const [pairs, setpairs] = useState(MainData.pairs[1]);

  const value = useMemo(
    () => ({ timeType, toggleTimeType, pairs, togglePairs }), 
    [timeType, pairs]
  );

  // console.log(`callback ${JSON.stringify(pairs)} && ${JSON.stringify(timeType)}`);

  function toggleTimeType(val) {
    settimeType(e => val);
  }

  function togglePairs(val) {
    setpairs(e => val);
  }

  return (
    <MainContext.Provider value={value}>
      {Props.children}
    </MainContext.Provider>
  );
}