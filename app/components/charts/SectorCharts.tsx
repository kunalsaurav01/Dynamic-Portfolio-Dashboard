'use client';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SectorSummary } from '@/app/types';
import { formatINR, formatGain } from '@/app/lib/utils/format';

export function SectorCharts({ summaries }: { summaries: SectorSummary[] }) {
  const allocation = summaries.map((s) => ({ name: s.sector.replace(' Sector', ''), value: s.totalInvestment }));
  const comparison = summaries.map((s) => ({ name: s.sector.replace(' Sector', ''), investment: s.totalInvestment, presentValue: s.totalPresentValue ?? 0 }));
  const gains = summaries.map((s) => ({ name: s.sector.replace(' Sector', ''), gainLoss: s.gainLoss ?? 0 }));
  return <section className="grid grid-cols-1 gap-5 xl:grid-cols-3" aria-label="Portfolio charts">
    <div className="panel chart-panel"><div className="panel-header"><div><h2 className="panel-title">Sector allocation</h2><p className="panel-subtitle">Invested capital</p></div></div><div className="h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={allocation} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={2}>{allocation.map((_, i) => <Cell key={i} />)}</Pie><Tooltip formatter={(v: unknown) => formatINR(Number(v))} /></PieChart></ResponsiveContainer></div></div>
    <div className="panel chart-panel"><div className="panel-header"><div><h2 className="panel-title">Investment vs value</h2><p className="panel-subtitle">Sector comparison</p></div></div><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={comparison} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}><XAxis dataKey="name" angle={-30} textAnchor="end" height={58} fontSize={11} /><YAxis tickFormatter={(v: unknown) => `₹${Math.round(Number(v) / 1000)}k`} fontSize={11} /><Tooltip formatter={(v: unknown) => formatINR(Number(v))} /><Bar dataKey="investment" name="Investment" /><Bar dataKey="presentValue" name="Present value" /></BarChart></ResponsiveContainer></div></div>
    <div className="panel chart-panel"><div className="panel-header"><div><h2 className="panel-title">Sector gain / loss</h2><p className="panel-subtitle">Absolute return</p></div></div><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={gains} margin={{ top: 8, right: 8, bottom: 24, left: 0 }}><XAxis dataKey="name" angle={-30} textAnchor="end" height={58} fontSize={11} /><YAxis tickFormatter={(v: unknown) => `₹${Math.round(Number(v) / 1000)}k`} fontSize={11} /><Tooltip formatter={(v: unknown) => formatGain(Number(v))} /><Bar dataKey="gainLoss" name="Gain / Loss" /></BarChart></ResponsiveContainer></div></div>
  </section>;
}
