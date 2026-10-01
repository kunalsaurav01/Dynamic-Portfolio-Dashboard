import { Activity, RefreshCw } from 'lucide-react';
import { formatUpdated } from '@/app/lib/utils/format';

interface Props { lastUpdated: string | null; isRefreshing: boolean; onRefresh: () => void; }
export function DashboardHeader({ lastUpdated, isRefreshing, onRefresh }: Props) {
  return <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
    <div>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
        <Activity size={14} aria-hidden="true" /> Live portfolio monitor
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Portfolio Dashboard</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">A production-oriented view of your holdings, market value, returns, fundamentals, and sector exposure.</p>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="text-xs text-slate-500 sm:text-right"><span className="block font-medium text-slate-700">Last updated</span>{formatUpdated(lastUpdated)}</div>
      <button type="button" onClick={onRefresh} disabled={isRefreshing} className="button-primary" aria-label="Refresh market data">
        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} /> {isRefreshing ? 'Updating…' : 'Refresh data'}
      </button>
    </div>
  </header>;
}
