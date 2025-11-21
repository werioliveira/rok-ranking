"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Calendar } from "lucide-react";

interface PlayerStatsChartProps {
  data: any[];
  periodComparison?: boolean;
  formatNumber: (value: number) => string;
}

export function PlayerStatsChart({
  data,
  periodComparison = false,
  formatNumber,
}: PlayerStatsChartProps) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No data available for selected period</p>
        </div>
      </div>
    );
  }

  const mappedData = data.map((item) => ({
    ...item,
    Power: periodComparison ? item.powerDelta : item.power,
    Kills: periodComparison ? item.totalKillsDelta : item.totalKills,
    Killpoints: periodComparison ? item.killpointsDelta : item.killpoints,
  }));

  return (
    <div
      className="
        w-full 
        min-w-0
        overflow-x-auto
        rounded-2xl 
        border 
        bg-card 
        shadow-md 
        p-4
      "
      style={{ minHeight: "320px" }}
    >
      {/* Força o Recharts a respeitar o width disponível */}
      <div className="w-full min-w-[280px] h-full">
        <ResponsiveContainer width="100%" height={300}>
<LineChart
  data={mappedData}
  margin={{
    top: 20,
    right: isMobile ? 10 : 60,
    left: isMobile ? 0 : 0,
    bottom: 10,
  }}
>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" opacity={0.3} />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
              tickLine={{ stroke: "#cbd5e1" }}
            />

            <YAxis
              yAxisId="left"
              tickFormatter={(value) => formatNumber(Number(value))}
              tick={{ fontSize: 12, fill: "#4f46e5" }}
              orientation="left"
              domain={[
                (dataMin: number) => Math.floor(Math.min(0, dataMin) / 100000) * 100000,
                (dataMax: number) => Math.ceil(dataMax / 100000) * 100000,
              ]}
            />

            <YAxis
              yAxisId="rightKills"
              tickFormatter={(value) => formatNumber(Number(value))}
              tick={{ fontSize: 12, fill: "#22c55e" }}
              orientation="right"
              domain={[
                (dataMin: number) => Math.floor(Math.min(0, dataMin) / 1000) * 1000,
                (dataMax: number) => Math.ceil(dataMax / 1000) * 1000,
              ]}
            />

            <YAxis
              yAxisId="rightKP"
              tickFormatter={(value) => formatNumber(Number(value))}
              tick={{ fontSize: 12, fill: "#ef4444" }}
              orientation="right"
              mirror
              domain={[
                (dataMin: number) =>
                  Math.floor(Math.min(0, dataMin) / 1000000) * 1000000,
                (dataMax: number) =>
                  Math.ceil(dataMax / 1000000) * 1000000,
              ]}
            />

            <Tooltip
              formatter={(value: any, name) => [formatNumber(Number(value)), name]}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                padding: "10px",
                color: "#f1f5f9",
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              }}
            />

            <Legend
              wrapperStyle={{ paddingTop: "10px", fontSize: "13px" }}
              formatter={(value) => {
                let color = "#64748b";
                if (value === "Power") color = "#4f46e5";
                if (value === "Kills") color = "#22c55e";
                if (value === "Killpoints") color = "#ef4444";
                return <span style={{ color, fontWeight: 600 }}>{value}</span>;
              }}
            />

            <Line
              yAxisId="left"
              type="natural"
              dataKey="Power"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#4f46e5", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />

            <Line
              yAxisId="rightKills"
              type="natural"
              dataKey="Kills"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#22c55e", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />

            <Line
              yAxisId="rightKP"
              type="natural"
              dataKey="Killpoints"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#ef4444", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
