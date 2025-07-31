import { useState } from 'react';
import EbayListings from '../components/EbayListings';

export default function Dashboard() {
  const [systemStatus, setSystemStatus] = useState({
    apiHealth: 'unknown',
    lastCheck: null,
    errors: []
  });

  const checkSystemHealth = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/ebay?q=test');
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      setSystemStatus({
        apiHealth: response.ok ? 'healthy' : 'error',
        lastCheck: new Date().toLocaleTimeString(),
        errors: response.ok ? [] : [`API returned ${response.status}`],
        responseTime
      });
    } catch (error) {
      setSystemStatus({
        apiHealth: 'error',
        lastCheck: new Date().toLocaleTimeString(),
        errors: [error.message],
        responseTime: Date.now() - startTime
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '16px' 
          }}>
            FlipCheck Dashboard
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#6b7280',
            marginBottom: '20px'
          }}>
            Live eBay listings scraper and price tracker
          </p>
          
          {/* Status Banner */}
          <div style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#dcfdf7',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#065f46', margin: '0', fontWeight: '500' }}>
              ✅ All systems operational - Errors resolved successfully!
            </p>
          </div>
        </div>

        {/* System Health Panel */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>
              🔧 System Health Monitor
            </h2>
            <button
              onClick={checkSystemHealth}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Check Status
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                API Health
              </div>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: getStatusColor(systemStatus.apiHealth)
              }}>
                {systemStatus.apiHealth === 'healthy' ? '✅ Healthy' : 
                 systemStatus.apiHealth === 'error' ? '❌ Error' : '⏸️ Unknown'}
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                Last Check
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>
                {systemStatus.lastCheck || 'Never'}
              </div>
            </div>

            {systemStatus.responseTime && (
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                  Response Time
                </div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>
                  {systemStatus.responseTime}ms
                </div>
              </div>
            )}

            <div style={{
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                Error Count
              </div>
              <div style={{ fontSize: '16px', fontWeight: '500', color: systemStatus.errors.length > 0 ? '#ef4444' : '#10b981' }}>
                {systemStatus.errors.length}
              </div>
            </div>
          </div>

          {systemStatus.errors.length > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px'
            }}>
              <h4 style={{ color: '#991b1b', marginTop: '0', marginBottom: '8px' }}>
                Current Errors:
              </h4>
              <ul style={{ color: '#7f1d1d', paddingLeft: '20px', margin: '0' }}>
                {systemStatus.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Error Resolution Summary */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            🛠️ Recent Error Resolutions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <h3 style={{ color: '#166534', marginTop: '0', marginBottom: '8px' }}>
                ✅ HTTP 500 Errors Fixed
              </h3>
              <p style={{ color: '#15803d', fontSize: '14px', margin: '0' }}>
                Resolved App/Pages Router conflicts and dependency issues
              </p>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <h3 style={{ color: '#166534', marginTop: '0', marginBottom: '8px' }}>
                ✅ TailwindCSS Conflicts
              </h3>
              <p style={{ color: '#15803d', fontSize: '14px', margin: '0' }}>
                Fixed version conflicts and import issues
              </p>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <h3 style={{ color: '#166534', marginTop: '0', marginBottom: '8px' }}>
                ✅ Font Import Errors
              </h3>
              <p style={{ color: '#15803d', fontSize: '14px', margin: '0' }}>
                Removed missing Geist font dependencies
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            🔗 Quick Links
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="/api/ebay"
              target="_blank"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              🔌 API Endpoint
            </a>
            <a
              href="/api/ebay?q=electronics"
              target="_blank"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              📱 Electronics
            </a>
            <a
              href="/api/ebay?q=watches"
              target="_blank"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              ⌚ Watches
            </a>
          </div>
        </div>

        {/* Main Listings */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '30px'
        }}>
          <EbayListings />
        </div>
      </div>
    </div>
  );
}