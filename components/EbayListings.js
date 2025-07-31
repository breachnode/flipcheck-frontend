// flipcheck-frontend/components/EbayListings.js
'use client';
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
        throw new Error(`API failed with status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log(`Received ${data.length} listings from API`);
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err.message);
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading eBay listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-red-800 font-semibold">Error Loading Listings</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button 
            onClick={() => fetchListings()}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Live eBay Listings</h2>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search eBay listings..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Found {listings.length} listings
          </p>
          <button 
            onClick={() => fetchListings()}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No listings found. Try a different search term.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold text-green-600">
                    ${item.price}
                  </span>
                  {item.condition && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {item.condition}
                    </span>
                  )}
                </div>
                {item.shipping && (
                  <p className="text-sm text-gray-600 mb-3">{item.shipping}</p>
                )}
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
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