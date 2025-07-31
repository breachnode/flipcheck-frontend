'use client';

export default function Home() {
  const testAPI = async () => {
    try {
      const response = await fetch('/api/ebay?q=test');
      const data = await response.json();
      alert(`API test successful! Got ${data.length} items`);
    } catch (error) {
      alert(`API test failed: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>FlipCheck Dashboard - Error Resolution</h1>
      <p style={{ color: '#666' }}>✅ Page loading successfully!</p>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f0f8ff', 
        border: '1px solid #ccc',
        borderRadius: '5px'
      }}>
        <h2>🔧 System Status Check</h2>
        <p>✅ Next.js App Router working</p>
        <p>✅ Component rendering properly</p>
        <p>🔄 API connectivity test available</p>
        
        <button 
          onClick={testAPI}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px',
            marginRight: '10px'
          }}
        >
          Test API Endpoint
        </button>

        <a 
          href="/api/ebay" 
          target="_blank"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            marginTop: '10px'
          }}
        >
          View API Direct
        </a>
      </div>
    </div>
  );
}
