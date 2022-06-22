import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default class ReCharts extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      analysisData_ml: this.props.analysisData_ml,
      analysisDataNo: this.props.analysisDataNo
    };
  }

  render() {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          width={900}
          height={200}
          data={this.state.analysisData_ml}
          margin={{
            top: 5,
            right: 40,
            left: 0,
            bottom: 5,
          }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="xp" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" name='Current Pattern' dataKey="currentPattern" stroke="blue" activeDot={{ r: 8 }} />
          <Line type="monotone" name='Pattern' dataKey={`patterns[${this.state.analysisDataNo}]`} stroke="#82ca9d" />
          <Line type="monotone" name='Expected Movement Avg' dataKey="predictedAvg" stroke="red" />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}
