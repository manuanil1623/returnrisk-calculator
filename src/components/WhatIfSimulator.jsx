// WhatIfSimulator.jsx
// Real-time risk simulation: tweak price/discount/payment → watch risk change.
// Calls /api/whatif; falls back to /predict; falls back to local heuristic.

import React, { useState, useCallback, useRef } from 'react';

const CATEGORIES = ['Clothing', 'Footwear', 'Jewellery', 'Watches', 'Bags, Wallets & Belts'];
const SIZES_BY_CAT = {
  Clothing: ['XS', 'S', 'M', 'L', 'XL'],
  Footwear: ['6', '7', '8', '9', '10'],
  default: ['One Size'],
};

function localRisk({ category, price, discountPercent, paymentMode }) {
  const catPriors = { Clothing: 28, Footwear: 24, Jewellery: 12, Watches: 9, 'Bags, Wallets & Belts': 8 };
  const base = catPriors[category] || 15;
  const risk = Math.min(95, Math.max(5, Math.round(base + discountPercent * 0.4 + (paymentMode === 'COD' ? 20 : 0) - (price > 1500 ? 5 : 0))));
  return { riskPercent: risk, riskLabel: risk >= 60 ? 'High' : risk >= 35 ? 'Moderate' : 'Low' };
}

const RISK_COLOR = { High: '#ef4444', Moderate: '#f59e0b', Low: '#22c55e' };
const RISK_BG    = { High: '#fef2f2', Moderate: '#fffbeb', Low: '#f0fdf4' };
const RISK_TEXT  = { High: '#dc2626', Moderate: '#d97706', Low: '#059669' };

export default function WhatIfSimulator() {
  const [category,        setCategory]        = useState('Clothing');
  const [price,           setPrice]           = useState(899);
  const [discountPercent, setDiscountPercent] = useState(35);
  const [paymentMode,     setPaymentMode]     = useState('COD');
  const [size,            setSize]            = useState('M');
  const [result,          setResult]          = useState(null);
  const [loading,         setLoading]         = useState(false);
  const debounceRef = useRef(null);

  const sizes = SIZES_BY_CAT[category] || SIZES_BY_CAT.default;

  const runSimulation = useCallback(async (params) => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/whatif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        setResult(await res.json());
        setLoading(false);
        return;
      }
    } catch (e) {}
    // Local fallback
    const local = localRisk(params);
    setResult({ ...local, breakdown: [], suggestedAction: local.riskLabel === 'High' ? 'Consider switching to Prepaid or reducing discount.' : 'Order looks good for dispatch.' });
    setLoading(false);
  }, []);

  function scheduleRun(overrides = {}) {
    const params = { category, price, discountPercent, paymentMode, size, ...overrides };
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSimulation(params), 350);
  }

  function handleChange(setter, field, value) {
    setter(value);
    scheduleRun({ [field]: value });
  }

  // eslint-disable-next-line no-unused-vars
  const label = s => ({ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '4px' })[s] || {};

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '18px' }}>⚡</span>
        <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>What-If Risk Simulator</h3>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748b' }}>
        Adjust any parameter and watch the return-risk score update live.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
        {/* Category */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Category</label>
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setSize(SIZES_BY_CAT[e.target.value]?.[0] || 'One Size'); scheduleRun({ category: e.target.value, size: SIZES_BY_CAT[e.target.value]?.[0] || 'One Size' }); }}
            style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '13px' }}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Size */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Size</label>
          <select
            value={size}
            onChange={e => handleChange(setSize, 'size', e.target.value)}
            style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '13px' }}
          >
            {sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Payment Mode */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Payment Mode</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['COD', 'Prepaid'].map(pm => (
              <button
                key={pm}
                onClick={() => handleChange(setPaymentMode, 'paymentMode', pm)}
                style={{
                  flex: 1, padding: '7px', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  border: paymentMode === pm ? '2px solid #2563eb' : '1px solid #d1d5db',
                  background: paymentMode === pm ? '#eff6ff' : '#fff',
                  color: paymentMode === pm ? '#1d4ed8' : '#374151',
                }}
              >{pm}</button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
            Price: ₹{price}
          </label>
          <input
            type="range" min={200} max={6000} step={50} value={price}
            onChange={e => handleChange(setPrice, 'price', Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' }}>
            <span>₹200</span><span>₹6,000</span>
          </div>
        </div>

        {/* Discount */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
            Discount: {discountPercent}%
          </label>
          <input
            type="range" min={0} max={80} step={5} value={discountPercent}
            onChange={e => handleChange(setDiscountPercent, 'discountPercent', Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' }}>
            <span>0%</span><span>80%</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div style={{ marginTop: '20px', padding: '16px', borderRadius: '10px', background: result ? RISK_BG[result.riskLabel] : '#f8fafc', border: `1.5px solid ${result ? RISK_COLOR[result.riskLabel] + '55' : '#e2e8f0'}`, transition: 'all 0.3s' }}>
        {loading && <div style={{ fontSize: '13px', color: '#6b7280' }}>⏳ Calculating…</div>}
        {!loading && !result && (
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            👆 Adjust any parameter above to see the live risk score.
          </div>
        )}
        {!loading && result && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '900', color: RISK_TEXT[result.riskLabel], lineHeight: 1 }}>
                {result.riskPercent}%
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: RISK_TEXT[result.riskLabel], marginTop: '2px' }}>
                {result.riskLabel} Risk
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ background: '#e5e7eb', borderRadius: '6px', height: '12px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ background: RISK_COLOR[result.riskLabel], width: `${result.riskPercent}%`, height: '100%', borderRadius: '6px', transition: 'width 0.4s ease' }} />
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#374151' }}>
                💡 {result.suggestedAction}
              </p>
            </div>
          </div>
        )}
        {!loading && result?.breakdown?.length > 0 && (
          <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Risk drivers:</div>
            {result.breakdown.map((b, i) => (
              <div key={b.reason} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', width: '180px', flexShrink: 0 }}>{b.reason}</div>
                <div style={{ background: '#e5e7eb', borderRadius: '3px', height: '6px', flex: 1 }}>
                  <div style={{ background: ['#2563eb','#7c3aed','#059669'][i] || '#6b7280', width: `${b.value}%`, height: '100%', borderRadius: '3px' }} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', width: '28px' }}>{b.value}%</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
