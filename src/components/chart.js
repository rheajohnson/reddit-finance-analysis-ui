import React from "react";
import { ResponsiveContainer } from "recharts";

const Chart = ({ children, title }) => {
  return (
    <div className="chart-container">
      <h3 className="section-title">{title}</h3>
      <div className="chart mention-chart">
        <ResponsiveContainer className="responsive-container" minWidth={440}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;
