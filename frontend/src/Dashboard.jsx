export default function Dashboard({ user, onLogout }) {
    return (
        <div style={{ backgroundColor: '#0d1117', padding: '2rem', borderRadius: '12px', border: '1px solid #30363d', color: '#c9d1d9', maxWidth: '800px', margin: '20px auto', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #30363d', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <h2 style={{ color: '#58a6ff', margin: 0 }}>AEGIS-AI // COMMAND CENTER</h2>
                <div>
                    <span style={{ marginRight: '15px', color: '#8b949e' }}>Logged in as: {user}</span>
                    <button onClick={onLogout} style={{ padding: '5px 10px', background: '#da3633', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>LOGOUT</button>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#010409', padding: '1.5rem', borderRadius: '8px', border: '1px solid #30363d' }}>
                    <h3 style={{ color: '#3fb950', marginTop: 0 }}>SYSTEM STATUS</h3>
                    <p>Neural Link: <span style={{ color: '#3fb950' }}>ONLINE</span></p>
                    <p>Biometrics: <span style={{ color: '#3fb950' }}>SYNCED</span></p>
                    <p>Wellness Index: <span style={{ color: '#d2a8ff' }}>CALIBRATING...</span></p>
                </div>
                
                <div style={{ background: '#010409', padding: '1.5rem', borderRadius: '8px', border: '1px solid #30363d' }}>
                    <h3 style={{ color: '#d2a8ff', marginTop: 0 }}>QUICK ACTIONS</h3>
                    <button style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', background: '#1f6feb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>UPLOAD DIAGNOSTIC PDF</button>
                    <button style={{ display: 'block', width: '100%', padding: '10px', background: '#238636', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>INITIATE VOICE SCAN</button>
                </div>
            </div>
        </div>
    );
}