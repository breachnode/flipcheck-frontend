// flipcheck-frontend/components/EbayListings.js
import { useEffect, useState } from 'react';

export default function EbayListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/ebay')
      .then((res) => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then((data) => setListings(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>eBay Listings</h2>
      <ul>
        {listings.map((item) => (
          <li key={item.id}>
            <h3>{item.title}</h3>
            <p>Price: ${item.price}</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              View on eBay
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}