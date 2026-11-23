// ProductLeaderboard.jsx
// Ranks products by average return risk + top SHAP drivers.
// Calls /api/product-leaderboard; falls back to mock data.

import React, { useEffect, useState } from 'react';

const MOCK_LEADERBOARD = [
  { productName: "Okane Solid Men's Polo Neck T-Shirt", category: 'Clothing', avgRisk: 78, orderCount: 3, riskLabel: 'High', topDrivers: [{ reason: 'Size/fit sensitivity', value: 42 }, { reason: 'Category return rate (Clothing)', value: 28 }, { reason: 'COD payment mode', value: 25 }] },
  { productName: 'Arden Terry Derby Boots', category: 'Footwear', avgRisk: 71, orderCount: 2, riskLabel: 'High', topDrivers: [{ reason: 'Size/fit sensitivity', value: 42 }, { reason: 'Category return rate (Footwear)', value: 24 }, { reason: 'COD payment mode', value: 25 }] },
  { productName: "maggie Women's Empire Waist Dress", category: 'Clothing', avgRisk: 69, orderCount: 1, riskLabel: 'High', topDrivers: [{ reason: 'Size/fit sensitivity', value: 42 }, { reason: 'Category return rate (Clothing)', value: 28 }, { reason: 'Prepaid (lower risk)', value: 8 }] },
  { productName: 'Katalogue Women, Girls Flats', category: 'Footwear', avgRisk: 66, orderCount: 1, riskLabel: 'High', topDrivers: [{ reason: 'Size/fit sensitivity', value: 42 }, { reason: 'Category return rate (Footwear)', value: 24 }, { reason: 'COD payment mode', value: 25 }] },
  { productName: 'Playboy Analog Watch - Women', category: 'Watches', avgRisk: 34, orderCount: 1, riskLabel: 'Moderate', topDrivers: [{ reason: 'Category return rate (Watches)', value: 9 }, { reason: 'Prepaid (lower risk)', value: 8 }, { reason: 'High price point', value: 18 }] },
];

const RISK_COLORS = { High: { bg: '#fef2f2', text: '#dc2626', bar: '#ef4444' }, Moderate: { bg: '#fffbeb', text: '#d97706', bar: '#f59e0b' }, Low: { bg: '#f0fdf4', text: '#059669', bar: '#22c55e' } };
const DRIVER_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

export default function ProductLeaderboard() {
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/product-leaderboard');
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            setData(json);
            return;
          }
        }
      } catch (e) {}
      setData(MOCK_LEADERBOARD);
    }
    fetchLeaderboard();
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
        Loading product leaderboard…
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginTop: '24px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>🏆</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>Product Health Leaderboard</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Ranked by avg return risk · click a row to see SHAP drivers</p>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: '600' }}>#</th>
            <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: '600' }}>Product</th>
            <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Category</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600' }}>Avg Risk</th>
            <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600' }}>Orders</th>
            <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: '600' }}>Risk Bar</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const colors = RISK_COLORS[item.riskLabel] || RISK_COLORS.Moderate;
            const isOpen = expanded === idx;
            return (
              <React.Fragment key={item.productName}>
                <tr
                  onClick={() => setExpanded(isOpen ? null : idx)}
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: isOpen ? '#f8fafc' : '#fff',
                    transition: 'background 0.15s'
                  }}
                >
                  <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: '700', color: idx < 3 ? '#dc2626' : '#6b7280' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#0f172a', maxWidth: '220px' }}>
                    <span style={{ fontWeight: '500' }}>{item.productName}</span>
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '12px', color: '#64748b' }}>{item.category}</td>
                  <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                    <span style={{
                      background: colors.bg, color: colors.text,
                      fontWeight: '700', fontSize: '13px',
                      padding: '3px 10px', borderRadius: '20px'
                    }}>
                      {item.avgRisk}%
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center', fontSize: '13px', color: '#374151' }}>{item.orderCount}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '8px', width: '120px', overflow: 'hidden' }}>
                      <div style={{ background: colors.bar, height: '100%', width: `${item.avgRisk}%`, borderRadius: '4px', transition: 'width 0.5s' }} />
                    </div>
                  </td>
                </tr>
                {isOpen && (
                  <tr style={{ background: '#f8fafc' }}>
                    <td colSpan={6} style={{ padding: '0 20px 16px 20px' }}>
                      <div style={{ fontSize: '12px', color: '#374151', fontWeight: '600', marginBottom: '8px' }}>
                        🔍 Top SHAP Drivers:
                      </div>
                      {item.topDrivers.map((d, di) => (
                        <div key={d.reason} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <div style={{ fontSize: '11px', color: '#374151', width: '220px' }}>{d.reason}</div>
                          <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '10px', flex: 1, overflow: 'hidden' }}>
                            <div style={{ background: DRIVER_COLORS[di % DRIVER_COLORS.length], height: '100%', width: `${d.value}%`, borderRadius: '4px' }} />
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', width: '32px' }}>{d.value}%</div>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
