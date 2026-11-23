import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import RiskPopup from '../components/RiskPopup';
import FitWhisperer from '../components/FitWhisperer';
import ReturnImpactBadge from '../components/ReturnImpactBadge';
import { products, shopperScore, checkReturnRisk } from '../mockData/mockData';
import './ShopperDashboard.css';

export default function ShopperDashboard() {
  const { user, logout } = useAuth();
  const [activeReport, setActiveReport]         = useState(null);
  const [activeProductName, setActiveProductName] = useState('');
  const [activeProduct, setActiveProduct]       = useState(null);
  const [savedReturns, setSavedReturns]         = useState(0);
  const [showWhisperer, setShowWhisperer]       = useState(false);
  const [whispererCategory, setWhispererCategory] = useState('Clothing');

  async function handleCheckRisk(product, size) {
    setActiveProduct(product);
    try {
      const res = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          category: product.category,
          price: product.price,
          discountPercent: 35.0,
          size: size,
          paymentMode: 'COD',
          shopperEmail: user?.email || 'shopper.demo@mail.com'
        })
      });
      if (res.ok) {
        const report = await res.json();
        setActiveReport(report);
        setActiveProductName(product.name);
        // Count as eco-save when risk is High and shopper consciously checked
        if (report.riskPercent >= 60) setSavedReturns(prev => prev + 1);
        return;
      }
    } catch (err) {
      console.warn('Backend /predict offline, using fallback', err);
    }
    const report = checkReturnRisk(product.id, size);
    setActiveReport(report);
    setActiveProductName(product.name);
    if (report.riskPercent >= 60) setSavedReturns(prev => prev + 1);
  }

  function openWhispererForProduct(product) {
    setWhispererCategory(product.category);
    setActiveProduct(product);
    setShowWhisperer(true);
  }

  return (
    <div className="shopper-theme">
      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="brand">ReturnLess</span>
          <span style={{ fontSize: '12px', background: '#e2e8f0', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontWeight: '500' }}>
            🛍️ Shopper: {user?.id || 'demo'}
          </span>
        </div>
        <button onClick={logout} className="exit-link shopper-exit-link" style={{ cursor: 'pointer', background: 'transparent' }}>
          Log out
        </button>
      </div>

      <div className="container">
        {/* Profile card with eco badge */}
        <div className="shopper-score-card">
          <div>
            <div className="shopper-score-card__tier">{shopperScore.tier}</div>
            <div className="shopper-score-card__meta">
              {shopperScore.returnsLast90Days} return out of {shopperScore.ordersLast90Days} orders in the last 90 days
            </div>
            {/* Return Impact Badge — compact eco-score */}
            <div style={{ marginTop: '10px' }}>
              <ReturnImpactBadge savedReturns={savedReturns} showProfile />
            </div>
          </div>
          <div className="shopper-score-card__score">
            {shopperScore.score}
            <span className="shopper-score-card__max">/{shopperScore.maxScore}</span>
          </div>
        </div>

        {/* Eco impact summary (shown after at least one risk check) */}
        {savedReturns > 0 && (
          <ReturnImpactBadge
            savedReturns={savedReturns}
            productName={activeProductName}
          />
        )}

        {/* Fit Whisperer panel */}
        {showWhisperer && activeProduct && (
          <FitWhisperer
            category={whispererCategory}
            onSizeSelect={(size) => {
              setShowWhisperer(false);
              handleCheckRisk(activeProduct, size);
            }}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 8px' }}>
          <h2 className="section-heading" style={{ margin: 0 }}>Shop with confidence</h2>
          <button
            onClick={() => setShowWhisperer(v => !v)}
            style={{
              background: '#059669', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '8px 16px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '6px'
            }}
          >
            🧠 {showWhisperer ? 'Close' : 'Fit Whisperer'}
          </button>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} style={{ position: 'relative' }}>
              <ProductCard
                product={product}
                onCheckRisk={handleCheckRisk}
              />
              <button
                onClick={() => openWhispererForProduct(product)}
                title="Open Fit Whisperer for this product"
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  background: '#059669cc', color: '#fff', border: 'none',
                  borderRadius: '6px', padding: '3px 7px', fontSize: '11px',
                  fontWeight: '700', cursor: 'pointer', zIndex: 1
                }}
              >
                🧠 Fit
              </button>
            </div>
          ))}
        </div>
      </div>

      {activeReport && (
        <RiskPopup
          report={activeReport}
          productName={activeProductName}
          onClose={() => setActiveReport(null)}
        />
      )}
    </div>
  );
}
