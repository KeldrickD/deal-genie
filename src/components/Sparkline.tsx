'use client';

import React from 'react';
import { Sparklines, SparklinesLine, SparklinesSpots, SparklinesReferenceLine } from 'react-sparklines';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  tooltipFormat?: (value: number) => string;
  showSpots?: boolean;
  showReferenceLine?: boolean;
  label?: string;
  minLabel?: string;
  maxLabel?: string;
}

export default function Sparkline({
  data,
  color = '#3F83F8',
  height = 30,
  width = 100,
  showSpots = true,
  showReferenceLine = false,
  label,
  minLabel,
  maxLabel
}: SparklineProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 italic text-xs">No trend data</div>;
  }
  
  // Find min and max for labeling if needed
  const min = Math.min(...data);
  const max = Math.max(...data);
  const valueChange = ((data[data.length - 1] - data[0]) / data[0]) * 100;
  const isPositive = valueChange >= 0;
  
  return (
    <div className="inline-flex items-center">
      {label && <span className="text-xs mr-1 text-gray-500">{label}</span>}
      <div className="relative">
        <Sparklines data={data} height={height} width={width} margin={2}>
          <SparklinesLine color={color} style={{ fill: 'none' }} />
          {showSpots && <SparklinesSpots size={2} style={{ fill: color }} />}
          {showReferenceLine && <SparklinesReferenceLine type="avg" />}
        </Sparklines>
        
        {/* Optional min/max labels */}
        <div className="flex justify-between text-[9px] text-gray-500 mt-[1px]">
          {minLabel && <span>{minLabel}</span>}
          {maxLabel && <span className="ml-auto">{maxLabel}</span>}
        </div>
        
        {/* Show percentage change */}
        {data.length > 1 && (
          <span className={`text-xs ml-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '↑' : '↓'}{Math.abs(valueChange).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
} 