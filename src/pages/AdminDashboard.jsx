import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ModelComparison from '../components/ModelComparison';
import DataDriftAlert from '../components/DataDriftAlert';
import { adminStats, activityLog } from '../mockData/mockData';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [retraining, setRetraining] = useState(false);
  const [retrainLog, setRetrainLog] = useState([]);

  function handleRetrain() {
    setRetraining(true);
    setTimeout(() => {
      setRetraining(false);
      const entry = {
        ts: new Date().toLocaleString('en-IN', { hour12: false }),
        version: `v3.${retrainLog.length + 1}`,
        accuracy: (87.3 + Math.random() * 1.5 - 0.5).toFixed(1),
        note: 'Manual retrain triggered from Admin dashboard'
      };
      setRetrainLog(prev => [entry, ...prev]);
    }, 1800);
  }

  return (
    <div className="admin-theme">
      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="brand">ReturnLess</span>
          <span style={{ fontSize: '12px', background: '#0f172a', color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
            🛡️ Admin: {user?.id || 'admin'}
          </span>
        </div>
        <button onClick={logout} className="exit-link admin-exit-link" style={{ cursor: 'pointer', background: 'transparent' }}>
          Log out
        </button>
      </div>

      <div className="container">
        <div className="stat-grid">
          <StatCard label="Sellers on platform"   value={adminStats.totalSellers} />
          <StatCard label="Registered shoppers"   value={adminStats.totalShoppers.toLocaleString()} />
          <StatCard label="Platform return rate"  value={`${adminStats.platformReturnRate}%`} />
          <StatCard label="Model accuracy"        value={`${adminStats.modelAccuracy}%`} tone="good" />
        </div>

        {/* Retrain panel */}
        <div className="model-panel">
          <div>
            <h3 className="model-panel__title">Return-risk model</h3>
            <p className="model-panel__meta">Last trained {adminStats.modelLastTrained}</p>
          </div>
          <button className="model-panel__retrain-btn" onClick={handleRetrain} disabled={retraining}>
            {retraining ? 'Retraining…' : 'Retrain model'}
          </button>
        </div>

        {/* Show inline retrain log if button was used */}
        {retrainLog.length > 0 && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#065f46', marginBottom: '6px' }}>✅ Recent Retrains (this session)</div>
            {retrainLog.map((r, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#374151', marginBottom: '2px' }}>
                <strong>{r.version}</strong> · {r.ts} · Accuracy: {r.accuracy}% · {r.note}
              </div>
            ))}
          </div>
        )}

        {/* Feature 6: Data Drift Alert */}
        <DataDriftAlert />

        {/* Feature 5: Model Comparison + Version History */}
        <ModelComparison />

        <h2 className="section-heading">Activity log</h2>
        <div className="activity-table-wrap">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {activityLog.map((entry) => (
                <tr key={entry.id}>
                  <td className="activity-table__time">{entry.timestamp}</td>
                  <td>{entry.actor}</td>
                  <td>{entry.action}</td>
                  <td className="activity-table__detail">{entry.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
