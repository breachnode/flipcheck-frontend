// flipcheck-frontend/components/EbayListings.js
import { useEffect, useState } from 'react';

export default function EbayListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('vintage watches');

  const fetchListings = async (query = searchQuery) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching eBay listings for: ${query}`);
      const res = await fetch(`/api/ebay?q=${encodeURIComponent(query)}`);
      
      if (!res.ok) {
        throw new Error(`API failed with status: ${res.status} - ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log(`Received ${data.length} listings from API`);
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(`Failed to load listings: ${err.message}`);
      // Set empty array to prevent UI issues
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchListings(searchQuery.trim());
    }
  };

  const handleRetry = () => {
    fetchListings();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{
          display: 'inline-block',
          width: '32px',
          height: '32px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '10px', color: '#666' }}>Loading eBay listings...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{
          backgroundColor: '#fff5f5',
          border: '1px solid #fed7d7',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#c53030', marginTop: '0' }}>⚠️ Error Loading Listings</h3>
          <p style={{ color: '#742a2a', margin: '10px 0' }}>{error}</p>
          <button 
            onClick={handleRetry}
            style={{
              marginTop: '15px',
              backgroundColor: '#c53030',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d3748', marginBottom: '20px' }}>
          Live eBay Listings
        </h2>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search eBay listings..."
              style={{
                flex: '1',
                minWidth: '250px',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                opacity: loading ? 0.5 : 1
              }}
            >
              Search
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <p style={{ color: '#6b7280', margin: '0' }}>
            Found {listings.length} listings
          </p>
          <button 
            onClick={handleRetry}
            disabled={loading}
            style={{
              color: '#3b82f6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              opacity: loading ? 0.5 : 1
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <p style={{ fontSize: '18px' }}>No listings found. Try a different search term.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {listings.map((item) => (
            <div key={item.id} style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s',
              overflow: 'hidden'
            }}>
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
              )}
              <div style={{ padding: '20px' }}>
                <h3 style={{
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontSize: '16px',
                  lineHeight: '1.4',
                  height: '3.2em',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {item.title}
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#059669'
                  }}>
                    ${item.price}
                  </span>
                  {item.condition && (
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      backgroundColor: '#f3f4f6',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {item.condition}
                    </span>
                  )}
                </div>
                
                {item.shipping && (
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    📦 {item.shipping}
                  </p>
                )}
                
                {(item.bids || item.timeLeft) && (
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
                    {item.bids && <span>🔥 {item.bids} bids</span>}
                    {item.bids && item.timeLeft && <span> • </span>}
                    {item.timeLeft && <span>⏰ {item.timeLeft}</span>}
                  </div>
                )}
                
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  View on eBay
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}