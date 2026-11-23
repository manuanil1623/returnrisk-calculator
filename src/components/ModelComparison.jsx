// ModelComparison.jsx
// Shows LR vs RF vs XGBoost: accuracy/AUC bar charts, confusion matrix, ROC curve, version history.

import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

const MOCK = {
  activeModel: 'XGBoost',
  models: [
    { name: 'Logistic Regression', accuracy: 78.2, precision: 74.1, recall: 69.8, f1: 71.9, auc: 0.81, trainedAt: '2026-08-15', confusionMatrix: [[312, 48], [61, 179]], rocPoints: [{fpr:0,tpr:0},{fpr:0.05,tpr:0.42},{fpr:0.12,tpr:0.62},{fpr:0.22,tpr:0.75},{fpr:0.35,tpr:0.84},{fpr:0.5,tpr:0.90},{fpr:1,tpr:1}] },
    { name: 'Random Forest',       accuracy: 83.6, precision: 81.2, recall: 79.4, f1: 80.3, auc: 0.89, trainedAt: '2026-08-22', confusionMatrix: [[328, 32], [46, 194]],  rocPoints: [{fpr:0,tpr:0},{fpr:0.03,tpr:0.52},{fpr:0.08,tpr:0.72},{fpr:0.15,tpr:0.84},{fpr:0.28,tpr:0.91},{fpr:0.45,tpr:0.95},{fpr:1,tpr:1}] },
    { name: 'XGBoost',             accuracy: 87.3, precision: 85.9, recall: 87.5, f1: 86.7,  auc: 0.93, trainedAt: '2026-08-29', confusionMatrix: [[341, 19], [31, 209]],  rocPoints: [{fpr:0,tpr:0},{fpr:0.02,tpr:0.60},{fpr:0.06,tpr:0.80},{fpr:0.10,tpr:0.89},{fpr:0.18,tpr:0.94},{fpr:0.32,tpr:0.97},{fpr:1,tpr:1}] },
  ],
  versionHistory: [
    { version: 'v3.0', model: 'XGBoost',             accuracy: 87.3, auc: 0.93, date: '2026-08-29', note: 'Added COD + shopper history features' },
    { version: 'v2.1', model: 'Random Forest',       accuracy: 83.6, auc: 0.89, date: '2026-08-22', note: 'Hyperparameter tuning (n_estimators=200)' },
    { version: 'v2.0', model: 'Random Forest',       accuracy: 81.1, auc: 0.86, date: '2026-08-10', note: 'Switched from LR baseline' },
    { version: 'v1.0', model: 'Logistic Regression', accuracy: 78.2, auc: 0.81, date: '2026-08-15', note: 'Initial baseline model' },
  ]
};

const MODEL_COLORS = ['#6b7280', '#3b82f6', '#7c3aed'];
const METRIC_KEYS  = ['accuracy', 'precision', 'recall', 'f1'];

export default function ModelComparison() {
  const [data, setData]       = useState(null);
  const [activeTab, setTab]   = useState('metrics'); // metrics | roc | confusion | history
  const [selectedModel, setSel] = useState(0);

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/model-comparison');
        if (res.ok) { setData(await res.json()); return; }
      } catch (e) {}
      setData(MOCK);
    }
    fetch_();
  }, []);

  if (!data) return <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>Loading model comparison…</div>;

  // Reshape for grouped bar chart
  const barData = METRIC_KEYS.map(key => ({
    metric: key.charAt(0).toUpperCase() + key.slice(1),
    ...Object.fromEntries(data.models.map(m => [m.name, m[key]]))
  }));

  const model = data.models[selectedModel];
  const cm    = model.confusionMatrix;
  const TP = cm[1][1], FP = cm[0][1], FN = cm[1][0], TN = cm[0][0];

  const tabs = ['metrics', 'roc', 'confusion', 'history'];
  const tabLabel = { metrics: '📊 Metrics', roc: '📈 ROC Curve', confusion: '🔢 Confusion Matrix', history: '📋 Version History' };

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginTop: '24px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>🤖</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>Model Comparison & Version History</h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Active: <strong style={{ color: '#7c3aed' }}>{data.activeModel}</strong> · Compare LR, RF, XGBoost
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 16px', fontSize: '12px', fontWeight: activeTab === t ? '700' : '500',
            color: activeTab === t ? '#7c3aed' : '#64748b',
            background: 'none', border: 'none', borderBottom: activeTab === t ? '2px solid #7c3aed' : '2px solid transparent',
            cursor: 'pointer', whiteSpace: 'nowrap'
          }}>{tabLabel[t]}</button>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="metric" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} fontSize={11} tickLine={false} axisLine={false} unit="%" />
                <Tooltip formatter={v => [`${v}%`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {data.models.map((m, i) => (
                  <Bar key={m.name} dataKey={m.name} fill={MODEL_COLORS[i]} radius={[4, 4, 0, 0]} barSize={22} />
                ))}
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
              {data.models.map((m, i) => (
                <div key={m.name} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', border: m.name === data.activeModel ? '2px solid #7c3aed' : '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: MODEL_COLORS[i], marginBottom: '6px' }}>
                    {m.name === data.activeModel && '★ '}{m.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#374151' }}>Accuracy: <strong>{m.accuracy}%</strong></div>
                  <div style={{ fontSize: '11px', color: '#374151' }}>AUC: <strong>{m.auc}</strong></div>
                  <div style={{ fontSize: '11px', color: '#374151' }}>Trained: {m.trainedAt}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ROC Tab */}
        {activeTab === 'roc' && (
          <>
            <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {data.models.map((m, i) => (
                <button key={m.name} onClick={() => setSel(i)} style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  background: selectedModel === i ? MODEL_COLORS[i] : '#f1f5f9',
                  color: selectedModel === i ? '#fff' : '#374151', border: 'none'
                }}>{m.name} (AUC={m.auc})</button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={model.rocPoints} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="fpr" tickFormatter={v => `${(v*100).toFixed(0)}%`} fontSize={11} label={{ value: 'FPR', position: 'insideBottom', offset: -4, fontSize: 11 }} />
                <YAxis tickFormatter={v => `${(v*100).toFixed(0)}%`} fontSize={11} label={{ value: 'TPR', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <Tooltip formatter={(v, n) => [`${(v*100).toFixed(1)}%`, n]} />
                <Line type="monotone" dataKey="tpr" stroke={MODEL_COLORS[selectedModel]} strokeWidth={2.5} dot={{ r: 4 }} name="TPR" />
              </LineChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
              AUC = {model.auc} · A random classifier would score 0.5 (diagonal line)
            </p>
          </>
        )}

        {/* Confusion Matrix Tab */}
        {activeTab === 'confusion' && (
          <>
            <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
              {data.models.map((m, i) => (
                <button key={m.name} onClick={() => setSel(i)} style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  background: selectedModel === i ? MODEL_COLORS[i] : '#f1f5f9',
                  color: selectedModel === i ? '#fff' : '#374151', border: 'none'
                }}>{m.name}</button>
              ))}
            </div>
            <div style={{ display: 'inline-grid', gridTemplateColumns: 'auto auto auto', gap: '8px', fontSize: '13px' }}>
              <div />
              <div style={{ textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '11px' }}>Pred: No Return</div>
              <div style={{ textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '11px' }}>Pred: Return</div>
              <div style={{ fontWeight: '700', color: '#374151', fontSize: '11px', display: 'flex', alignItems: 'center' }}>Actual: No Return</div>
              <div style={{ background: '#d1fae5', border: '2px solid #059669', borderRadius: '8px', padding: '16px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669' }}>{TN}</div>
                <div style={{ fontSize: '10px', color: '#065f46', fontWeight: '600' }}>True Negative</div>
              </div>
              <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '8px', padding: '16px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626' }}>{FP}</div>
                <div style={{ fontSize: '10px', color: '#991b1b', fontWeight: '600' }}>False Positive</div>
              </div>
              <div style={{ fontWeight: '700', color: '#374151', fontSize: '11px', display: 'flex', alignItems: 'center' }}>Actual: Return</div>
              <div style={{ background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: '8px', padding: '16px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#d97706' }}>{FN}</div>
                <div style={{ fontSize: '10px', color: '#92400e', fontWeight: '600' }}>False Negative</div>
              </div>
              <div style={{ background: '#d1fae5', border: '2px solid #059669', borderRadius: '8px', padding: '16px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669' }}>{TP}</div>
                <div style={{ fontSize: '10px', color: '#065f46', fontWeight: '600' }}>True Positive</div>
              </div>
            </div>
          </>
        )}

        {/* Version History Tab */}
        {activeTab === 'history' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                {['Version', 'Model', 'Accuracy', 'AUC', 'Date', 'Notes'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.versionHistory.map((v, i) => (
                <tr key={v.version} style={{ borderTop: '1px solid #f1f5f9', background: i === 0 ? '#faf5ff' : '#fff' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '700', color: i === 0 ? '#7c3aed' : '#374151' }}>{v.version} {i === 0 && '★'}</td>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>{v.model}</td>
                  <td style={{ padding: '10px 12px', fontWeight: '600', color: '#059669' }}>{v.accuracy}%</td>
                  <td style={{ padding: '10px 12px', fontWeight: '600', color: '#2563eb' }}>{v.auc}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>{v.date}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: '12px' }}>{v.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
