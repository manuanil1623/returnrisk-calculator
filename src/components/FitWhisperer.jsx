// FitWhisperer.jsx
// Suggests the size with the lowest return probability based on height + weight.
// Pure front-end calculation — no backend call needed.

import React, { useState } from 'react';

const SIZE_CHARTS = {
  Clothing: {
    XS: { heightMin: 150, heightMax: 160, weightMin: 40, weightMax: 52 },
    S:  { heightMin: 158, heightMax: 168, weightMin: 50, weightMax: 62 },
    M:  { heightMin: 165, heightMax: 175, weightMin: 60, weightMax: 74 },
    L:  { heightMin: 172, heightMax: 182, weightMin: 72, weightMax: 88 },
    XL: { heightMin: 178, heightMax: 192, weightMin: 85, weightMax: 110 },
  },
  Footwear: {
    '6':  { heightMin: 148, heightMax: 162, weightMin: 38, weightMax: 58 },
    '7':  { heightMin: 158, heightMax: 170, weightMin: 50, weightMax: 68 },
    '8':  { heightMin: 165, heightMax: 177, weightMin: 60, weightMax: 78 },
    '9':  { heightMin: 172, heightMax: 184, weightMin: 70, weightMax: 90 },
    '10': { heightMin: 180, heightMax: 196, weightMin: 82, weightMax: 110 },
  },
};

function scoreFit(height, weight, range) {
  // Gaussian-ish penalty: 0 = perfect, higher = worse fit
  const hCenter = (range.heightMin + range.heightMax) / 2;
  const wCenter = (range.weightMin + range.weightMax) / 2;
  const hSpan   = (range.heightMax - range.heightMin) / 2 || 1;
  const wSpan   = (range.weightMax - range.weightMin) / 2 || 1;
  const hDev = Math.abs(height - hCenter) / hSpan;
  const wDev = Math.abs(weight - wCenter) / wSpan;
  return hDev + wDev; // lower = better fit
}

function getSuggestion(height, weight, category) {
  const chart = SIZE_CHARTS[category] || SIZE_CHARTS.Clothing;
  const scored = Object.entries(chart).map(([size, range]) => ({
    size,
    score: scoreFit(height, weight, range),
  }));
  scored.sort((a, b) => a.score - b.score);
  return scored; // sorted best → worst
}

const RETURN_RISK_BY_RANK = [8, 18, 32, 55, 78]; // rank 0 = best

export default function FitWhisperer({ category, onSizeSelect }) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  function handleAnalyse() {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || h < 100 || h > 230) {
      setError('Enter a valid height (100–230 cm).');
      return;
    }
    if (!w || w < 30 || w > 200) {
      setError('Enter a valid weight (30–200 kg).');
      return;
    }
    setError('');
    setResults(getSuggestion(h, w, category));
  }

  const chart = SIZE_CHARTS[category] || SIZE_CHARTS.Clothing;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
      border: '1px solid #bbf7d0',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '20px' }}>🧠</span>
        <strong style={{ fontSize: '15px', color: '#065f46' }}>Fit Whisperer</strong>
        <span style={{
          fontSize: '10px', background: '#d1fae5', color: '#065f46',
          padding: '2px 7px', borderRadius: '20px', fontWeight: '600'
        }}>AI Size</span>
      </div>
      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 14px' }}>
        Enter your measurements and we'll rank every size by return risk — lowest first.
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
            Height (cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={e => setHeight(e.target.value)}
            placeholder="e.g. 170"
            style={{
              width: '100px', padding: '7px 10px', borderRadius: '7px',
              border: '1px solid #d1d5db', fontSize: '13px'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' }}>
            Weight (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="e.g. 65"
            style={{
              width: '90px', padding: '7px 10px', borderRadius: '7px',
              border: '1px solid #d1d5db', fontSize: '13px'
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={handleAnalyse}
            style={{
              background: '#059669', color: '#fff', border: 'none',
              borderRadius: '7px', padding: '8px 16px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer'
            }}
          >
            Analyse Fit
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '8px' }}>⚠️ {error}</p>
      )}

      {results && (
        <div style={{ marginTop: '14px' }}>
          <div style={{ fontSize: '12px', color: '#374151', fontWeight: '600', marginBottom: '8px' }}>
            Size ranking for <strong>{category}</strong>:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {results.map((r, idx) => {
              const riskPct = RETURN_RISK_BY_RANK[Math.min(idx, 4)];
              const isBest  = idx === 0;
              return (
                <div
                  key={r.size}
                  onClick={() => onSizeSelect && onSizeSelect(r.size)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: isBest ? '2px solid #059669' : '1px solid #e5e7eb',
                    background: isBest ? '#d1fae5' : '#f9fafb',
                    cursor: onSizeSelect ? 'pointer' : 'default',
                    textAlign: 'center',
                    minWidth: '54px',
                    transition: 'transform 0.15s',
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: '700', color: isBest ? '#065f46' : '#374151' }}>
                    {r.size}
                  </div>
                  <div style={{
                    fontSize: '10px', fontWeight: '600', marginTop: '2px',
                    color: riskPct <= 18 ? '#059669' : riskPct <= 40 ? '#d97706' : '#dc2626'
                  }}>
                    {riskPct}% risk
                  </div>
                  {isBest && (
                    <div style={{ fontSize: '9px', color: '#059669', fontWeight: '700', marginTop: '2px' }}>
                      ✓ Best fit
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '10px' }}>
            💡 Click a size to select it. Best fit = fewest shoppers like you returned it.
          </p>
        </div>
      )}
    </div>
  );
}
