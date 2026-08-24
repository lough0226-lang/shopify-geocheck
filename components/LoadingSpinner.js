'use client';

export default function LoadingSpinner({ text }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
      <div style={{ position: 'relative', width: 64, height: 64, marginBottom: 24 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '4px solid #e2e8f0',
          animation: 'lsPulse 2s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg style={{ width: 32, height: 32, color: '#1e3a5f', animation: 'lsSpin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
            <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
      <p style={{ color: '#4b5563', fontWeight: 500, fontSize: 18, marginBottom: 8 }}>{text || 'Analyzing...'}</p>
      <p style={{ color: '#9ca3af', fontSize: 14 }}>This usually takes 15-30 seconds</p>
      <div style={{ width: 256, marginTop: 24, height: 6, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#1e3a5f', borderRadius: 999, animation: 'lsLoading 20s ease-in-out infinite' }} />
      </div>
      <style>{`
        @keyframes lsLoading {
          0% { width: 0%; }
          20% { width: 25%; }
          40% { width: 45%; }
          60% { width: 60%; }
          80% { width: 80%; }
          95% { width: 90%; }
          100% { width: 95%; }
        }
        @keyframes lsSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes lsPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
