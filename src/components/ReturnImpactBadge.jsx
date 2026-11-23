// ReturnImpactBadge.jsx
// Shows the CO₂ / waste saved when shopper picks the lower-risk size,
// and displays an eco-score on the shopper profile card.

import React from 'react';

// Average CO₂ emissions per returned fashion item (transport + repackaging)
// Source: Optoro 2023 sustainability report averages
const CO2_PER_RETURN_KG = 2.4;      // kg CO₂ eq
const WASTE_PER_RETURN_G  = 180;    // grams of packaging waste

// Eco-score tiers
function getEcoTier(savedReturns) {
  if (savedReturns >= 10) return { label: '🌳 Eco Champion', color: '#065f46', bg: '#d1fae5' };
  if (savedReturns >= 5)  return { label: '🌿 Green Shopper', color: '#047857', bg: '#ecfdf5' };
  if (savedReturns >= 2)  return { label: '🌱 Eco Aware', color: '#059669', bg: '#f0fdf4' };
  return                           { label: '♻️ Starting Out', color: '#6b7280', bg: '#f9fafb' };
}

/**
 * Props:
 *   savedReturns    — number of returns avoided (session or lifetime)
 *   showProfile     — if true, renders the compact profile eco-score badge
 *   productName     — optional, to personalise the message
 */
export default function ReturnImpactBadge({ savedReturns = 0, showProfile = false, productName = '' }) {
  const co2Saved   = (savedReturns * CO2_PER_RETURN_KG).toFixed(1);
  const wasteSaved = (savedReturns * WASTE_PER_RETURN_G / 1000).toFixed(2); // kg
  const tier       = getEcoTier(savedReturns);

  if (showProfile) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: tier.bg, border: `1px solid ${tier.color}44`,
        borderRadius: '20px', padding: '6px 14px',
        fontSize: '12px', fontWeight: '600', color: tier.color
      }}>
        {tier.label}
        {savedReturns > 0 && (
          <span style={{ fontWeight: '400', color: tier.color, opacity: 0.85 }}>
            · {co2Saved} kg CO₂ saved
          </span>
        )}
      </div>
    );
  }

  if (savedReturns === 0) {
    return (
      <div style={{
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        borderRadius: '10px', padding: '12px 16px', marginTop: '12px',
        fontSize: '12px', color: '#065f46'
      }}>
        🌱 <strong>Eco tip:</strong> Picking the right size first time avoids a return and saves ~2.4 kg CO₂!
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      border: '1.5px solid #6ee7b7',
      borderRadius: '12px',
      padding: '16px 20px',
      marginTop: '14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ fontSize: '22px' }}>🌱</span>
        <strong style={{ fontSize: '14px', color: '#065f46' }}>Return Impact Saved</strong>
      </div>
      {productName && (
        <p style={{ fontSize: '12px', color: '#374151', margin: '0 0 10px' }}>
          By choosing the right size for <em>{productName}</em>, you helped the planet!
        </p>
      )}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669' }}>{co2Saved} kg</div>
          <div style={{ fontSize: '11px', color: '#374151' }}>CO₂ avoided</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#0369a1' }}>{wasteSaved} kg</div>
          <div style={{ fontSize: '11px', color: '#374151' }}>packaging saved</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#7c3aed' }}>{savedReturns}</div>
          <div style={{ fontSize: '11px', color: '#374151' }}>returns avoided</div>
        </div>
      </div>
      <div style={{
        marginTop: '12px', display: 'inline-block',
        background: tier.bg, color: tier.color,
        borderRadius: '20px', padding: '4px 12px',
        fontSize: '12px', fontWeight: '700', border: `1px solid ${tier.color}55`
      }}>
        {tier.label}
      </div>
      <p style={{ fontSize: '10px', color: '#9ca3af', margin: '8px 0 0' }}>
        * CO₂ est. based on Optoro 2023 avg reverse-logistics data · 180 g packaging per return
      </p>
    </div>
  );
}
