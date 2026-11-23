// DataDriftAlert.jsx
// Shows PSI-based data drift warnings when incoming orders deviate from training baseline.

import React, { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const MOCK_DRIFT = {
  status: 'warning',
  ordersAnalyzed: 7,
  baselinePeriod: 'Aug 2026 (training set)',
  recentPeriod: 'Last 7 orders',
  metrics: { psiCategory: 0.14, psiPayment: 0.07, avgPriceDrift: 8.2, recentAvgRisk: 61.4, baselineAvgRisk: 48.0 },
  alerts: [
    { feature: 'Product Category', psi: 0.14, severity: 'Medium', message: 'Category distribution shifted significantly (PSI=0.14). Retraining may be needed.' }
  ],
  categoryDistribution: {
    baseline: { Clothing: 0.35, Footwear: 0.28, Jewellery: 0.14, Watches: 0.12, 'Bags, Wallets & Belts': 0.11 },
    recent:   { Clothing: 0.43, Footwear: 0.29, Jewellery: 0.14, Watches: 0.14, 'Bags, Wallets & Belts': 0.0 }
  },
  paymentDistribution: {
    baseline: { COD: 0.55, Prepaid: 0.45 },
    recent:   { COD: 0.57, Prepaid: 0.43 }
  }
};

const STATUS_STYLES = {
  ok:       { bg: '#f0fdf4', border: '#bbf7d0', color: '#059669', icon: '✅', label: 'No Drift Detected' },
  warning:  { bg: '#fffbeb', border: '#fde68a', color: '#d97706', icon: '⚠️', label: 'Moderate Drift' },
  critical: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', icon: '🚨', label: 'Critical Drift' },
};

const SEV_COLOR = { High: '#dc2626', Medium: '#d97706', Low: '#059669' };
const PSI_DESC  = psi => psi < 0.1 ? '✓ Stable' : psi < 0.25 ? '⚠ Moderate' : '🚨 High';

export default function DataDriftAlert() {
  const [data, setData]       = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/drift');
        if (res.ok) { setData(await res.json()); return; }
      } catch (e) {}
      setData(MOCK_DRIFT);
    }
    fetch_();
  }, []);

  if (!data) return <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>Checking data drift…</div>;

  const ss = STATUS_STYLES[data.status] || STATUS_STYLES.ok;
  const catDist = data.categoryDistribution;
  const radarData = Object.keys(catDist.baseline).map(k => ({
    category: k.length > 10 ? k.substring(0, 10) + '…' : k,
    Baseline: Math.round(catDist.baseline[k] * 100),
    Recent:   Math.round((catDist.recent[k] || 0) * 100),
  }));

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginTop: '24px' }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ padding: '16px 20px', borderBottom: expanded ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: ss.bg }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{ss.icon}</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: ss.color }}>
              Data Drift Monitor — {ss.label}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {data.ordersAnalyzed} recent orders vs {data.baselinePeriod} · PSI category={data.metrics.psiCategory} · payment={data.metrics.psiPayment}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {data.alerts.length > 0 && (
            <span style={{ background: SEV_COLOR[data.alerts[0].severity], color: '#fff', borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: '700' }}>
              {data.alerts.length} alert{data.alerts.length > 1 ? 's' : ''}
            </span>
          )}
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '20px' }}>
          {/* Alert cards */}
          {data.alerts.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#374151' }}>Active Alerts</h4>
              {data.alerts.map((a, i) => (
                <div key={i} style={{
                  background: a.severity === 'High' ? '#fef2f2' : '#fffbeb',
                  border: `1px solid ${SEV_COLOR[a.severity]}44`,
                  borderLeft: `4px solid ${SEV_COLOR[a.severity]}`,
                  borderRadius: '8px', padding: '12px 16px', marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{a.feature}</strong>
                    <span style={{ fontSize: '11px', background: SEV_COLOR[a.severity], color: '#fff', borderRadius: '4px', padding: '2px 7px', fontWeight: '700' }}>{a.severity}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#374151' }}>{a.message}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#6b7280' }}>PSI = {a.psi} · &lt;0.1 stable · 0.1–0.25 moderate · &gt;0.25 critical</p>
                </div>
              ))}
            </div>
          )}

          {/* PSI Metrics row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {[
              { label: 'Category PSI', value: data.metrics.psiCategory, desc: PSI_DESC(data.metrics.psiCategory) },
              { label: 'Payment PSI',  value: data.metrics.psiPayment,  desc: PSI_DESC(data.metrics.psiPayment) },
              { label: 'Price Drift',  value: `${data.metrics.avgPriceDrift}%`, desc: data.metrics.avgPriceDrift > 20 ? '⚠ High' : '✓ Stable' },
              { label: 'Avg Risk (Recent)', value: `${data.metrics.recentAvgRisk}%`, desc: `Baseline: ${data.metrics.baselineAvgRisk}%` },
            ].map(m => (
              <div key={m.label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>{m.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{m.value}</div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>{m.desc}</div>
              </div>
            ))}
          </div>

          {/* Category distribution radar */}
          <h4 style={{ margin: '0 0 8px', fontSize: '13px', color: '#374151' }}>Category Distribution: Baseline vs Recent</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="category" fontSize={11} />
              <Radar name="Baseline" dataKey="Baseline" stroke="#6b7280" fill="#6b7280" fillOpacity={0.15} />
              <Radar name="Recent"   dataKey="Recent"   stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} />
              <Tooltip formatter={v => [`${v}%`]} />
            </RadarChart>
          </ResponsiveContainer>

          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
            PSI &lt; 0.1: no retraining needed · 0.1–0.25: monitor closely · &gt; 0.25: retrain recommended
          </p>
        </div>
      )}
    </div>
  );
}
