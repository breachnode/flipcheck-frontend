#!/usr/bin/env node

// Comprehensive API testing script
const axios = require('axios');

const API_BASE = 'http://localhost:3000';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEbayAPI() {
  log('blue', '\n🔍 Testing eBay API Endpoints...\n');
  
  const testCases = [
    { query: 'watches', expectedCategory: 'watches' },
    { query: 'electronics', expectedCategory: 'electronics' },
    { query: 'shoes', expectedCategory: 'shoes' },
    { query: 'random_search_term', expectedCategory: 'default' },
    { query: '', expectedCategory: 'default' } // Empty query test
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    try {
      const queryParam = testCase.query ? `?q=${encodeURIComponent(testCase.query)}` : '';
      const response = await axios.get(`${API_BASE}/api/ebay${queryParam}`, {
        timeout: 15000
      });
      
      // Validate response structure
      if (response.status === 200 && Array.isArray(response.data)) {
        const listings = response.data;
        
        if (listings.length > 0) {
          const firstListing = listings[0];
          const hasRequiredFields = ['id', 'title', 'price', 'url'].every(field => 
            firstListing.hasOwnProperty(field)
          );
          
          if (hasRequiredFields) {
            log('green', `✅ Query "${testCase.query || 'default'}": ${listings.length} listings returned`);
            log('blue', `   Sample: ${firstListing.title} - $${firstListing.price}`);
            passedTests++;
          } else {
            log('red', `❌ Query "${testCase.query}": Missing required fields`);
          }
        } else {
          log('yellow', `⚠️  Query "${testCase.query}": No listings returned`);
        }
      } else {
        log('red', `❌ Query "${testCase.query}": Invalid response format`);
      }
      
      // Rate limiting
      await delay(1000);
      
    } catch (error) {
      log('red', `❌ Query "${testCase.query}": ${error.message}`);
    }
  }
  
  log('blue', `\n📊 eBay API Test Results: ${passedTests}/${totalTests} passed\n`);
  return passedTests === totalTests;
}

async function testErrorHandling() {
  log('blue', '🛡️  Testing Error Handling...\n');
  
  try {
    // Test invalid method
    const response = await axios.post(`${API_BASE}/api/ebay`, {}, {
      timeout: 5000,
      validateStatus: () => true
    });
    
    if (response.status === 405 && response.data.error) {
      log('green', '✅ POST method correctly rejected with 405');
    } else {
      log('red', '❌ POST method handling failed');
      return false;
    }
  } catch (error) {
    log('red', `❌ Error handling test failed: ${error.message}`);
    return false;
  }
  
  return true;
}

async function testDataQuality() {
  log('blue', '📋 Testing Data Quality...\n');
  
  try {
    const response = await axios.get(`${API_BASE}/api/ebay?q=laptops`, {
      timeout: 15000
    });
    
    const listings = response.data;
    let qualityScore = 0;
    const checks = [];
    
    // Check 1: Response has listings
    if (listings.length > 0) {
      qualityScore++;
      checks.push('✅ Has listings');
    } else {
      checks.push('❌ No listings returned');
    }
    
    // Check 2: Listings have realistic data
    const sampleListing = listings[0];
    if (sampleListing.title && sampleListing.title.length > 5) {
      qualityScore++;
      checks.push('✅ Realistic titles');
    } else {
      checks.push('❌ Poor title quality');
    }
    
    // Check 3: Prices are numeric
    const pricesValid = listings.every(item => 
      !isNaN(parseFloat(item.price)) && parseFloat(item.price) > 0
    );
    if (pricesValid) {
      qualityScore++;
      checks.push('✅ Valid prices');
    } else {
      checks.push('❌ Invalid prices found');
    }
    
    // Check 4: URLs are properly formatted
    const urlsValid = listings.every(item => 
      item.url && (item.url.startsWith('http') || item.url.startsWith('#'))
    );
    if (urlsValid) {
      qualityScore++;
      checks.push('✅ Valid URLs');
    } else {
      checks.push('❌ Invalid URLs found');
    }
    
    // Check 5: Has additional metadata
    const hasMetadata = listings.some(item => 
      item.condition && item.shipping
    );
    if (hasMetadata) {
      qualityScore++;
      checks.push('✅ Rich metadata');
    } else {
      checks.push('❌ Missing metadata');
    }
    
    checks.forEach(check => log('blue', `   ${check}`));
    
    const percentage = (qualityScore / 5 * 100).toFixed(0);
    log('blue', `\n📈 Data Quality Score: ${qualityScore}/5 (${percentage}%)`);
    
    return qualityScore >= 4; // Require 80% quality score
    
  } catch (error) {
    log('red', `❌ Data quality test failed: ${error.message}`);
    return false;
  }
}

async function testPerformance() {
  log('blue', '⚡ Testing Performance...\n');
  
  const testQueries = ['watches', 'phones', 'books'];
  const responseTimes = [];
  
  for (const query of testQueries) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${API_BASE}/api/ebay?q=${query}`, {
        timeout: 20000
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      responseTimes.push(responseTime);
      
      if (responseTime < 5000) {
        log('green', `✅ Query "${query}": ${responseTime}ms (Good)`);
      } else if (responseTime < 10000) {
        log('yellow', `⚠️  Query "${query}": ${responseTime}ms (Acceptable)`);
      } else {
        log('red', `❌ Query "${query}": ${responseTime}ms (Slow)`);
      }
      
      await delay(500); // Brief delay between tests
      
    } catch (error) {
      log('red', `❌ Performance test failed for "${query}": ${error.message}`);
    }
  }
  
  if (responseTimes.length > 0) {
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    log('blue', `📊 Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    return avgResponseTime < 8000; // Require under 8 seconds average
  }
  
  return false;
}

async function runAllTests() {
  log('blue', '🚀 Starting Comprehensive API Test Suite...\n');
  
  const results = {
    ebayAPI: false,
    errorHandling: false,
    dataQuality: false,
    performance: false
  };
  
  // Run all tests
  results.ebayAPI = await testEbayAPI();
  results.errorHandling = await testErrorHandling();
  results.dataQuality = await testDataQuality();
  results.performance = await testPerformance();
  
  // Summary
  log('blue', '\n📋 Test Summary:');
  log('blue', '==================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(color, `${test.padEnd(15)}: ${status}`);
  });
  
  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  log('blue', '\n🎯 Overall Results:');
  if (totalPassed === totalTests) {
    log('green', `🎉 All tests passed! (${totalPassed}/${totalTests})`);
    log('green', '✨ Your APIs and scrapers are working correctly!');
  } else {
    log('yellow', `⚠️  ${totalPassed}/${totalTests} tests passed`);
    log('yellow', '🔧 Some functionality may need attention');
  }
  
  return totalPassed === totalTests;
}

// Main execution
if (require.main === module) {
  runAllTests().then((allPassed) => {
    process.exit(allPassed ? 0 : 1);
  }).catch((error) => {
    log('red', `💥 Test suite crashed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runAllTests, testEbayAPI, testErrorHandling, testDataQuality, testPerformance };