// Debug Dashboard for monitoring API health and data quality
'use client';
import { useEffect, useState } from 'react';

export default function DebugDashboard() {
  const [debugInfo, setDebugInfo] = useState({
    lastRequest: null,
    responseTime: null,
    dataQuality: null,
    errorCount: 0,
    successCount: 0,
    isLoading: false
  });

  const [testResults, setTestResults] = useState([]);

  const runAPITest = async (query = 'test') => {
    setDebugInfo(prev => ({ ...prev, isLoading: true }));
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(`/api/ebay?q=${encodeURIComponent(query)}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        
        // Analyze data quality
        const quality = analyzeDataQuality(data);
        
        const testResult = {
          timestamp: new Date().toLocaleTimeString(),
          query,
          responseTime,
          status: 'success',
          listingsCount: data.length,
          quality,
          sampleTitle: data[0]?.title || 'No data'
        };
        
        setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results
        
        setDebugInfo(prev => ({
          ...prev,
          lastRequest: new Date().toISOString(),
          responseTime,
          dataQuality: quality,
          successCount: prev.successCount + 1,
          isLoading: false
        }));
        
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
    } catch (error) {
      const testResult = {
        timestamp: new Date().toLocaleTimeString(),
        query,
        responseTime: Date.now() - startTime,
        status: 'error',
        error: error.message,
        quality: { score: 0, issues: ['Request failed'] }
      };
      
      setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
      
      setDebugInfo(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        isLoading: false
      }));
    }
  };

  const analyzeDataQuality = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { score: 0, issues: ['No data returned'] };
    }

    let score = 0;
    const issues = [];
    const maxScore = 5;

    // Check 1: Has listings
    if (data.length > 0) score++;
    else issues.push('No listings');

    // Check 2: Titles are realistic
    const hasGoodTitles = data.every(item => item.title && item.title.length > 5);
    if (hasGoodTitles) score++;
    else issues.push('Poor title quality');

    // Check 3: Prices are valid
    const hasValidPrices = data.every(item => !isNaN(parseFloat(item.price)));
    if (hasValidPrices) score++;
    else issues.push('Invalid prices');

    // Check 4: URLs exist
    const hasValidUrls = data.every(item => item.url);
    if (hasValidUrls) score++;
    else issues.push('Missing URLs');

    // Check 5: Rich metadata
    const hasMetadata = data.some(item => item.condition && item.shipping);
    if (hasMetadata) score++;
    else issues.push('Missing metadata');

    return { score, maxScore, percentage: (score / maxScore * 100).toFixed(0), issues };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🔧 Debug Dashboard</h2>
        <div className="space-x-2">
          <button
            onClick={() => runAPITest('watches')}
            disabled={debugInfo.isLoading}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Watches
          </button>
          <button
            onClick={() => runAPITest('electronics')}
            disabled={debugInfo.isLoading}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Electronics
          </button>
          <button
            onClick={() => runAPITest(Math.random().toString(36).substring(7))}
            disabled={debugInfo.isLoading}
            className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Random Test
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-sm text-gray-400">Success Rate</div>
          <div className="text-2xl font-bold text-green-400">
            {debugInfo.successCount + debugInfo.errorCount > 0 
              ? Math.round(debugInfo.successCount / (debugInfo.successCount + debugInfo.errorCount) * 100)
              : 0}%
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-sm text-gray-400">Avg Response Time</div>
          <div className="text-2xl font-bold text-blue-400">
            {debugInfo.responseTime ? `${debugInfo.responseTime}ms` : 'N/A'}
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-sm text-gray-400">Data Quality</div>
          <div className={`text-2xl font-bold ${getQualityColor(debugInfo.dataQuality?.percentage || 0)}`}>
            {debugInfo.dataQuality?.percentage || 0}%
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-sm text-gray-400">Total Tests</div>
          <div className="text-2xl font-bold text-white">
            {debugInfo.successCount + debugInfo.errorCount}
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {debugInfo.isLoading && (
        <div className="bg-yellow-900 border border-yellow-600 p-4 rounded mb-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
            <span>Running API test...</span>
          </div>
        </div>
      )}

      {/* Recent Test Results */}
      <div className="bg-gray-800 rounded p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Test Results</h3>
        {testResults.length === 0 ? (
          <div className="text-gray-400 text-center py-4">
            No tests run yet. Click a test button above to start.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="bg-gray-700 p-3 rounded text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-gray-300">{result.timestamp}</span>
                    <span className="mx-2">•</span>
                    <span className="font-semibold">"{result.query}"</span>
                    <span className="mx-2">•</span>
                    <span className={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    {result.responseTime}ms
                  </div>
                </div>
                
                {result.status === 'success' ? (
                  <div className="mt-2 text-xs text-gray-300">
                    <span>{result.listingsCount} listings</span>
                    <span className="mx-2">•</span>
                    <span className={getQualityColor(result.quality.percentage)}>
                      Quality: {result.quality.percentage}%
                    </span>
                    <span className="mx-2">•</span>
                    <span className="truncate">{result.sampleTitle}</span>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-red-400">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quality Issues */}
      {debugInfo.dataQuality?.issues && debugInfo.dataQuality.issues.length > 0 && (
        <div className="mt-4 bg-yellow-900 border border-yellow-600 p-4 rounded">
          <h4 className="font-semibold text-yellow-200 mb-2">Data Quality Issues:</h4>
          <ul className="text-sm text-yellow-100 space-y-1">
            {debugInfo.dataQuality.issues.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}