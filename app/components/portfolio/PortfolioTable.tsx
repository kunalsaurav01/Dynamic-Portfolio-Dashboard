'use client';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatGain, formatINR, formatNumber, formatPercent } from '@/app/lib/utils/format';
import type { PortfolioHolding } from '@/app/types';
import { StatusBadge } from '@/app/components/common/StatusBadge';

type SortKey = keyof Pick<PortfolioHolding, 'stockName' | 'purchasePrice' | 'quantity' | 'investment' | 'portfolioPercentage' | 'presentValue' | 'gainLoss' | 'peRatio' | 'latestEarnings'>;

const columns: Array<{ key: SortKey; label: string }> = [
  { key: 'stockName', label: 'Particulars' }, { key: 'purchasePrice', label: 'Purchase Price' }, { key: 'quantity', label: 'Qty' },
  { key: 'investment', label: 'Investment' }, { key: 'portfolioPercentage', label: 'Portfolio %' }, { key: 'presentValue', label: 'Present Value' },
  { key: 'gainLoss', label: 'Gain / Loss' }, { key: 'peRatio', label: 'P/E Ratio' }, { key: 'latestEarnings', label: 'Latest Earnings' },
];

export function PortfolioTable({ holdings }: { holdings: PortfolioHolding[] }) {
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'investment', direction: 'desc' });
  const sorted = useMemo(() => [...holdings].sort((a, b) => {
    const av = a[sort.key]; const bv = b[sort.key];
    if (av === bv) return 0;
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    const result = typeof av === 'string' ? av.localeCompare(String(bv)) : Number(av) - Number(bv);
    return sort.direction === 'asc' ? result : -result;
  }), [holdings, sort]);
  const requestSort = (key: SortKey) => setSort((current) => current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' });
  const sortIcon = (key: SortKey) => sort.key !== key ? <ArrowUpDown size={13} /> : sort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />;

  return <section className="panel overflow-hidden" aria-labelledby="portfolio-table-title">
    <div className="panel-header"><div><h2 id="portfolio-table-title" className="panel-title">Holdings</h2><p className="panel-subtitle">{holdings.length} positions · sorted by investment</p></div></div>
    <div className="table-scroll">
      <table className="portfolio-table">
        <thead><tr>
          {columns.map((column) => <th key={column.key} scope="col"><button className="sort-button" onClick={() => requestSort(column.key)}>{column.label}{sortIcon(column.key)}</button></th>)}
          <th scope="col">NSE / BSE</th><th scope="col">Status</th>
        </tr></thead>
        <tbody>
          {sorted.map((h) => <tr key={h.id}>
            <td><div className="stock-name">{h.stockName}</div><div className="stock-sector">{h.sector}</div></td>
            <td>{formatINR(h.purchasePrice)}</td><td>{formatNumber(h.quantity)}</td><td>{formatINR(h.investment)}</td><td>{formatPercent(h.portfolioPercentage)}</td>
            <td>{formatINR(h.presentValue)}</td><td className={h.gainLoss === null ? 'text-slate-400' : h.gainLoss > 0 ? 'value-positive' : h.gainLoss < 0 ? 'value-negative' : 'value-neutral'}>{formatGain(h.gainLoss)}</td>
            <td>{formatNumber(h.peRatio)}</td><td>{formatNumber(h.latestEarnings)}</td><td>{h.exchangeCode}</td><td><StatusBadge status={h.marketDataStatus} /></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </section>;
}
