'use client';

import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface RadarChartProps {
  data: Record<string, number>;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

// Convert an object of key-value pairs to the format expected by recharts
const transformDataForChart = (data: Record<string, number>) => {
  const result = Object.entries(data).map(([name, value]) => ({
    subject: name,
    value: value,
    fullMark: 10, // All values normalized to 0-10 scale
  }));
  
  // Sort by category name for consistent display
  return result.sort((a, b) => a.subject.localeCompare(b.subject));
};

export default function RadarChart({ data, size = 'md', title }: RadarChartProps) {
  const chartData = transformDataForChart(data);
  
  // Determine chart dimensions based on size prop
  const getDimensions = () => {
    switch (size) {
      case 'sm': return { height: 200, fontSize: 10 };
      case 'lg': return { height: 400, fontSize: 12 };
      default: return { height: 300, fontSize: 11 };
    }
  };
  
  const { height, fontSize } = getDimensions();
  
  if (!chartData.length) {
    return <div className="text-center text-gray-500 p-4">No data available</div>;
  }
  
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-medium mb-2 text-center">{title}</h3>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fontSize }} 
              tickFormatter={(value) => value.length > 5 ? `${value.substring(0, 5)}...` : value}
            />
            <PolarRadiusAxis angle={30} domain={[0, 10]} />
            <Tooltip />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#1A56DB"
              fill="#3F83F8"
              fillOpacity={0.6}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 