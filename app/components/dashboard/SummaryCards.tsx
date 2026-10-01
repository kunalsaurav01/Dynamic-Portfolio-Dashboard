import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, IndianRupee, TrendingUp } from 'lucide-react';
import { formatGain, formatINR, formatPercent } from '@/app/lib/utils/format';
import type { PortfolioSummary } from '@/app/types';

export function SummaryCards({ summary }: { summary: PortfolioSummary }) {
  const gain = summary.totalGainLoss;
  const positive = gain !== null && gain > 0;
  const negative = gain !== null && gain < 0;
  const tone = positive ? 'positive' : negative ? 'negative' : 'neutral';
  const icon = positive ? <ArrowUpRight size={18} /> : negative ? <ArrowDownRight size={18} /> : <TrendingUp size={18} />;
  const cards = [
    { label: 'Current Value', value: formatINR(summary.totalPresentValue), icon: <IndianRupee size={18} /> },
    { label: 'Total Investment', value: formatINR(summary.totalInvestment), icon: <BriefcaseBusiness size={18} /> },
    { label: 'Gain / Loss', value: formatGain(gain), icon, tone },
    { label: 'Overall Return', value: formatPercent(summary.totalReturnPercentage), icon: <TrendingUp size={18} />, tone },
  ];
  return <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Portfolio overview">
    {cards.map((card) => <article key={card.label} className="metric-card">
      <div className="metric-icon">{card.icon}</div>
      <p className="metric-label">{card.label}</p>
      <p className={`metric-value ${card.tone ? `value-${card.tone}` : ''}`}>{card.value}</p>
    </article>)}
  </section>;
}
