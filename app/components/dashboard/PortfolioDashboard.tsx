'use client';
import { AlertTriangle, CheckCircle2, Clock3, Database, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MARKET_REFRESH_INTERVAL_MS } from '@/app/constants';
import { marketApi, portfolioApi } from '@/app/lib/api/client';
import { buildPortfolioHoldings, calculateSectorSummary } from '@/app/lib/calculations';
import { formatUpdated } from '@/app/lib/utils/format';
import type { Holding, MarketQuote, PortfolioHolding, PortfolioSummary } from '@/app/types';
import { DashboardHeader } from './DashboardHeader';
import { SummaryCards } from './SummaryCards';
import { PortfolioTable } from '@/app/components/portfolio/PortfolioTable';
import { SectorSummary } from '@/app/components/sector/SectorSummary';
import { SectorCharts } from '@/app/components/charts/SectorCharts';

export function PortfolioDashboard() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [marketData, setMarketData] = useState<MarketQuote[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketWarning, setMarketWarning] = useState<string | null>(null);
  const refreshLock = useRef(false);
  const mounted = useRef(true);

  const loadPortfolio = useCallback(async (signal?: AbortSignal) => {
    const response = await portfolioApi.get(signal);
    if (!mounted.current) return;
    setHoldings(response.data.holdings);
  }, []);

  const refreshMarketData = useCallback(async (signal?: AbortSignal) => {
    if (!holdings.length || refreshLock.current) return;
    refreshLock.current = true;
    setIsRefreshing(true);
    try {
      const symbols = holdings.map((h) => h.marketSymbol).filter((s): s is string => Boolean(s));
      const response = await marketApi.get(symbols, signal);
      if (!mounted.current) return;
      setMarketData(response.data);
      const providerErrors = response.data.filter((item) => item.error).length;
      setMarketWarning(providerErrors ? `${providerErrors} symbols could not be refreshed; the latest available workbook values are being shown where possible.` : null);
      setLastUpdated(response.timestamp);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      if (mounted.current) setMarketWarning('Live market data is temporarily unavailable. Showing the latest available values where possible.');
    } finally {
      refreshLock.current = false;
      if (mounted.current) setIsRefreshing(false);
    }
  }, [holdings]);

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    (async () => {
      try { await loadPortfolio(controller.signal); }
      catch (e) { if (!(e instanceof DOMException && e.name === 'AbortError') && mounted.current) setError('The portfolio could not be loaded. Please refresh the page.'); }
      finally { if (mounted.current) setLoading(false); }
    })();
    return () => { mounted.current = false; controller.abort(); };
  }, [loadPortfolio]);

  useEffect(() => {
    if (!holdings.length) return;
    const controller = new AbortController();
    void refreshMarketData(controller.signal);
    const interval = window.setInterval(() => { void refreshMarketData(); }, MARKET_REFRESH_INTERVAL_MS);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, [holdings, refreshMarketData]);

  const marketMap = useMemo(() => new Map(marketData.map((item) => [item.symbol, item])), [marketData]);
  const calculatedHoldings = useMemo<PortfolioHolding[]>(() => buildPortfolioHoldings(holdings, marketMap), [holdings, marketMap]);
  const sectorSummaries = useMemo(() => calculateSectorSummary(calculatedHoldings), [calculatedHoldings]);
  const summary = useMemo<PortfolioSummary>(() => {
    const totalInvestment = calculatedHoldings.reduce((sum, h) => sum + h.investment, 0);
    const values = calculatedHoldings.map((h) => h.presentValue).filter((v): v is number => v !== null);
    const totalPresentValue = values.length === calculatedHoldings.length ? values.reduce((sum, v) => sum + v, 0) : null;
    const totalGainLoss = totalPresentValue === null ? null : totalPresentValue - totalInvestment;
    return { totalInvestment, totalPresentValue, totalGainLoss, totalReturnPercentage: totalGainLoss === null || totalInvestment === 0 ? null : totalGainLoss / totalInvestment, holdingsCount: calculatedHoldings.length, lastUpdated };
  }, [calculatedHoldings, lastUpdated]);

  const manualRefresh = useCallback(() => { void refreshMarketData(); }, [refreshMarketData]);

  if (loading) return <LoadingDashboard />;
  if (error) return <main className="page-shell"><div className="error-state"><AlertTriangle size={28} /><h1>Unable to load portfolio</h1><p>{error}</p></div></main>;

  return <main className="page-shell">
    <DashboardHeader lastUpdated={lastUpdated} isRefreshing={isRefreshing} onRefresh={manualRefresh} />
    <div className="mt-6 space-y-5">
      <SummaryCards summary={summary} />
      {marketWarning && <div className="notice warning"><AlertTriangle size={17} /><span>{marketWarning}</span></div>}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="info-strip"><CheckCircle2 size={17} /><div><strong>Automatic refresh</strong><span>Every 15 seconds while this page is open.</span></div></div>
        <div className="info-strip"><Database size={17} /><div><strong>Server-side cache</strong><span>Requests are deduplicated before reaching the provider.</span></div></div>
        <div className="info-strip"><ShieldCheck size={17} /><div><strong>Protected architecture</strong><span>External market requests never run from the browser.</span></div></div>
      </div>
      <SectorCharts summaries={sectorSummaries} />
      <SectorSummary summaries={sectorSummaries} holdings={calculatedHoldings} />
      <PortfolioTable holdings={calculatedHoldings} />
      <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Data is informational and may be delayed or unavailable.</span><span className="inline-flex items-center gap-1"><Clock3 size={13} /> Updated {formatUpdated(lastUpdated)}</span>
      </footer>
    </div>
  </main>;
}

function LoadingDashboard() {
  return <main className="page-shell"><div className="space-y-6"><div className="h-32 animate-pulse rounded-3xl bg-slate-200/70" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200/70" />)}</div><div className="h-[500px] animate-pulse rounded-2xl bg-slate-200/70" /></div></main>;
}
