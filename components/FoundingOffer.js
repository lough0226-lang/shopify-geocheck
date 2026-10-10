'use client';

import { useState, useEffect } from 'react';

export default function FoundingOffer(props) {
  var options = props || {};
  var checked = !!options.checked;
  var onCheckedChange = options.onCheckedChange;
  var email = options.email || '';
  var onEmailChange = options.onEmailChange;
  var compact = !!options.compact;
  var disabled = !!options.disabled;

  var _status = useState(null);
  var status = _status[0];
  var setStatus = _status[1];

  useEffect(function () {
    var alive = true;
    fetch('/api/founding-status')
      .then(function (r) { return r.json(); })
      .then(function (d) { if (alive) setStatus(d); })
      .catch(function () { if (alive) setStatus(null); });
    return function () { alive = false; };
  }, []);

  var slotsLeft = status && typeof status.slots_left === 'number' ? status.slots_left : null;
  var isOpen = status ? status.open !== false : true;

  var card = {
    background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
    borderRadius: 16,
    padding: compact ? '20px 22px' : '28px 28px',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 30px -12px rgba(6,78,59,0.5)',
  };

  var pill = {
    display: 'inline-block',
    background: 'rgba(16,185,129,0.22)',
    border: '1px solid rgba(110,231,183,0.5)',
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    padding: '4px 12px',
    borderRadius: 999,
    marginBottom: 14,
    textTransform: 'uppercase',
  };

  return (
    <div style={card}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={pill}>{'🚀 '}Founding Customer Program</span>

        <h3 style={{ fontSize: compact ? 19 : 23, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.25 }}>
          The first 30 stores get every full report free
        </h3>

        <p style={{ fontSize: compact ? 13.5 : 14.5, lineHeight: 1.65, color: '#b7e4d4', margin: '0 0 16px', maxWidth: 620 }}>
          We&apos;re opening 30 founding spots to prove that acting on a report actually lifts your
          visibility in ChatGPT, Perplexity and Google AI Overviews. Claim a spot and unlock the
          complete competitor breakdown and fix list &mdash; normally $29/month &mdash; at no cost.
        </p>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'grid', gap: 8, fontSize: 13.5, color: '#d1fae5' }}>
          {[
            'Free full reports, including every competitor and exact fix',
            'A free 30-day re-check using your same buyer questions',
            'Before vs. after comparison so you can see the change',
          ].map(function (item, i) {
            return (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#6ee7b7', fontWeight: 800 }}>{'\u2713'}</span>
                <span>{item}</span>
              </li>
            );
          })}
        </ul>

        <p style={{ fontSize: 12.5, color: '#9fd3c0', margin: '0 0 16px', lineHeight: 1.6 }}>
          <strong style={{ color: '#d1fae5' }}>The only ask:</strong> come back for a free re-check
          around day 30, tell us what you changed, and let us use your anonymized results as a case study.
        </p>

        {isOpen ? (
          <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: disabled ? 'default' : 'pointer', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(110,231,183,0.3)', borderRadius: 12, padding: '14px 16px' }}>
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={function (e) { if (onCheckedChange) onCheckedChange(e.target.checked); }}
              style={{ width: 18, height: 18, marginTop: 2, accentColor: '#10b981', flexShrink: 0 }}
            />
            <span style={{ fontSize: 13.5, lineHeight: 1.55, color: '#ecfdf5' }}>
              <strong>I want a free founding spot.</strong> I agree to return for a free re-check, share
              what I changed, and allow my anonymized results to be used in a case study.
            </span>
          </label>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', fontSize: 14, color: '#fde68a', fontWeight: 600 }}>
            All 30 founding spots have been claimed.
          </div>
        )}

        {isOpen && checked && (
          <input
            type="email"
            value={email}
            disabled={disabled}
            onChange={function (e) { if (onEmailChange) onEmailChange(e.target.value); }}
            placeholder="Your email to reserve the spot"
            style={{
              marginTop: 12, width: '100%', boxSizing: 'border-box',
              padding: '12px 14px', borderRadius: 10,
              border: '2px solid rgba(110,231,183,0.4)', background: 'rgba(255,255,255,0.95)',
              fontSize: 14.5, outline: 'none',
            }}
          />
        )}

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, color: '#6ee7b7', fontWeight: 700 }}>
            {slotsLeft === null
              ? 'Limited to 30 spots'
              : slotsLeft > 0
                ? slotsLeft + ' of 30 spots still open'
                : 'All spots claimed'}
          </span>
          {slotsLeft !== null && slotsLeft > 0 && slotsLeft <= 10 && (
            <span style={{ fontSize: 11.5, background: '#f59e0b', color: '#1f2937', fontWeight: 800, padding: '3px 10px', borderRadius: 999 }}>
              Almost gone
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
