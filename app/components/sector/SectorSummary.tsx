'use client';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { formatGain, formatINR, formatPercent } from '@/app/lib/utils/format';
import type { PortfolioHolding, SectorSummary as SectorSummaryType } from '@/app/types';

export function SectorSummary({ summaries, holdings }: { summaries: SectorSummaryType[]; holdings: PortfolioHolding[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return <section className="panel" aria-labelledby="sector-title">
    <div className="panel-header"><div><h2 id="sector-title" className="panel-title">Sector breakdown</h2><p className="panel-subtitle">Investment and current value by sector</p></div></div>
    <div className="divide-y divide-slate-100">
      {summaries.map((summary) => {
        const expanded = open[summary.sector] ?? true;
        const sectorHoldings = holdings.filter((h) => h.sector === summary.sector);
        const positive = summary.gainLoss !== null && summary.gainLoss > 0;
        return <div key={summary.sector} className="py-1">
          <button className="sector-row" onClick={() => setOpen((state) => ({ ...state, [summary.sector]: !expanded }))} aria-expanded={expanded}>
            {expanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}<span className="flex-1 text-left font-semibold text-slate-800">{summary.sector}</span><span className="hidden text-xs text-slate-400 sm:block">{summary.holdingsCount} holdings</span>
            <span className={positive ? 'value-positive font-semibold' : summary.gainLoss !== null && summary.gainLoss < 0 ? 'value-negative font-semibold' : 'value-neutral font-semibold'}>{formatGain(summary.gainLoss)}</span>
          </button>
          {expanded && <div className="grid grid-cols-1 gap-3 pb-4 pl-8 pt-2 sm:grid-cols-3">
            <div className="submetric"><span>Investment</span><strong>{formatINR(summary.totalInvestment)}</strong></div>
            <div className="submetric"><span>Present Value</span><strong>{formatINR(summary.totalPresentValue)}</strong></div>
            <div className="submetric"><span>Return</span><strong className={summary.returnPercentage !== null && summary.returnPercentage > 0 ? 'value-positive' : summary.returnPercentage !== null && summary.returnPercentage < 0 ? 'value-negative' : ''}>{formatPercent(summary.returnPercentage)}</strong></div>
            <div className="col-span-full flex flex-wrap gap-2">{sectorHoldings.map((h) => <span key={h.id} className="chip">{h.stockName}</span>)}</div>
          </div>}
        </div>;
      })}
    </div>
  </section>;
}
