"use client";

import { useState } from "react";
import { axes, type Axis } from "@/lib/compare";
import type { Model } from "@/lib/models";

const firstColors = ["#c7ff63", "#f68ba8", "#7ed9ff", "#ffbd7a"];
export const modelColor = (index: number): string => firstColors[index] ??
  `hsl(${Math.round((index * 137.508 + 20) % 360)} 82% 72%)`;

type Props = {
  models: Model[];
  positions: Record<string, Record<Axis, number>>;
  demo?: boolean;
};

const centerX = 210;
const centerY = 185;
const radius = 113;
const point = (index: number, value: number) => {
  const angle = -Math.PI / 2 + index * 2 * Math.PI / axes.length;
  const distance = radius * value / 100;
  return `${centerX + Math.cos(angle) * distance},${centerY + Math.sin(angle) * distance}`;
};

const labelPosition = (index: number) => {
  const angle = -Math.PI / 2 + index * 2 * Math.PI / axes.length;
  const cosine = Math.cos(angle);
  return { x: centerX + cosine * 145, y: centerY + Math.sin(angle) * 145,
    anchor: Math.abs(cosine) < .2 ? "middle" : cosine > 0 ? "start" : "end" } as const;
};

export function Radar({ models, positions, demo = false }: Props) {
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const focusedId = hoveredId ?? pinnedId;
  const charted = models.filter((model) => positions[model.id]);

  return (
    <div className="chart-content">
    <svg viewBox="0 0 420 370" role="img" aria-label="Relative stat chart; exact values appear in the model cards" className="radar">
      <defs>
        <radialGradient id="pitch-glow"><stop stopColor="#d6ff8c" stopOpacity=".12" /><stop offset="1" stopColor="#d6ff8c" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx={centerX} cy={centerY} r="132" fill="url(#pitch-glow)" />
      {[20, 40, 60, 80].map((level) => (
        <polygon key={level} points={axes.map((_, index) => point(index, level)).join(" ")} fill="none" stroke="#42504b" strokeWidth="1" />
      ))}
      {axes.map((axis, index) => {
        const label = labelPosition(index);
        return <g key={axis.key}>
          <line x1={centerX} y1={centerY} x2={point(index, 80).split(",")[0]} y2={point(index, 80).split(",")[1]} stroke="#42504b" />
          <text x={label.x} y={label.y} textAnchor={label.anchor} className="axis-label">{axis.name}</text>
          <text x={label.x} y={label.y + 15} textAnchor={label.anchor} className="axis-subtitle">{axis.key === "contextWindow" ? "tokens" : axis.key === "outputSpeed" ? "tok/s" : demo ? "Estimate" : axis.subtitle}</text>
        </g>
      })}
      {models.map((model, index) => {
        const values = positions[model.id];
        if (!values) return null;
        const points = axes.map((axis, axisIndex) => point(axisIndex, values[axis.key])).join(" ");
        const faded = focusedId !== null && focusedId !== model.id;
        return <polygon key={model.id} points={points} fill={modelColor(index)} fillOpacity={faded ? ".02" : ".07"} stroke={modelColor(index)} strokeOpacity={faded ? ".12" : "1"} strokeWidth={focusedId === model.id ? "5" : "2.5"} strokeLinejoin="round" />;
      })}
      <circle cx={centerX} cy={centerY} r="3" fill="#a6b3a4" />
    </svg>
    <div className="chart-legend" aria-label="Highlight a model on the chart">
      {charted.map((model) => {
        const index = models.findIndex((item) => item.id === model.id);
        return <button key={model.id} className="legend-button" aria-pressed={pinnedId === model.id}
          onClick={() => setPinnedId(pinnedId === model.id ? null : model.id)}
          onMouseEnter={() => setHoveredId(model.id)} onMouseLeave={() => setHoveredId(null)}
          onFocus={() => setHoveredId(model.id)} onBlur={() => setHoveredId(null)}>
          <span className="legend-swatch" style={{ backgroundColor: modelColor(index) }} />{model.name}
        </button>;
      })}
    </div>
    </div>
  );
}
