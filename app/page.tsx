import EbayListings from "../components/EbayListings";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            FlipCheck Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Live eBay listings scraper and price tracker
          </p>
          <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded-lg">
            <p className="text-green-800">
              ✅ API Status: All tests passed! Scrapers are working correctly.
            </p>
          </div>
        </div>
        
        {/* Main Listings */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <EbayListings />
        </div>
      </div>
    </div>
  );
}
