#!/usr/bin/env node

// Comprehensive Error Monitoring and Resolution System
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class ErrorMonitor {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.errorLog = [];
    this.healthChecks = [];
    this.startTime = Date.now();
  }

  async runHealthCheck() {
    log('blue', '\n🔍 Running Comprehensive Health Check...\n');

    const checks = [
      { name: 'Main Page', url: '/', expectedStatus: 200 },
      { name: 'Dashboard', url: '/dashboard', expectedStatus: 200 },
      { name: 'eBay API Default', url: '/api/ebay', expectedStatus: 200 },
      { name: 'eBay API Electronics', url: '/api/ebay?q=electronics', expectedStatus: 200 },
      { name: 'eBay API Watches', url: '/api/ebay?q=watches', expectedStatus: 200 },
      { name: 'Invalid API Method', url: '/api/ebay', method: 'POST', expectedStatus: 405 }
    ];

    let passedChecks = 0;
    const results = [];

    for (const check of checks) {
      try {
        const startTime = Date.now();
        const config = {
          method: check.method || 'GET',
          url: `${this.baseUrl}${check.url}`,
          timeout: 10000,
          validateStatus: () => true
        };

        if (check.method === 'POST') {
          config.data = {};
        }

        const response = await axios(config);
        const responseTime = Date.now() - startTime;

        const passed = response.status === check.expectedStatus;
        if (passed) passedChecks++;

        const result = {
          name: check.name,
          status: response.status,
          expected: check.expectedStatus,
          responseTime,
          passed,
          url: check.url
        };

        results.push(result);

        const statusIcon = passed ? '✅' : '❌';
        const color = passed ? 'green' : 'red';
        log(color, `${statusIcon} ${check.name}: ${response.status} (${responseTime}ms)`);

        if (!passed) {
          this.logError(`Health check failed: ${check.name}`, {
            expected: check.expectedStatus,
            actual: response.status,
            url: check.url
          });
        }

      } catch (error) {
        const result = {
          name: check.name,
          status: 'ERROR',
          expected: check.expectedStatus,
          responseTime: 0,
          passed: false,
          error: error.message,
          url: check.url
        };

        results.push(result);
        log('red', `❌ ${check.name}: ERROR - ${error.message}`);
        
        this.logError(`Health check error: ${check.name}`, {
          error: error.message,
          url: check.url
        });
      }

      // Rate limiting
      await this.delay(500);
    }

    this.healthChecks.push({
      timestamp: new Date().toISOString(),
      results,
      passed: passedChecks,
      total: checks.length,
      successRate: (passedChecks / checks.length * 100).toFixed(1)
    });

    log('blue', `\n📊 Health Check Summary: ${passedChecks}/${checks.length} passed (${(passedChecks / checks.length * 100).toFixed(1)}%)\n`);

    return results;
  }

  async testAPIDataQuality() {
    log('blue', '📋 Testing API Data Quality...\n');

    const testQueries = ['watches', 'electronics', 'shoes', 'books'];
    const qualityResults = [];

    for (const query of testQueries) {
      try {
        const response = await axios.get(`${this.baseUrl}/api/ebay?q=${query}`, {
          timeout: 15000
        });

        if (response.status === 200) {
          const data = response.data;
          const quality = this.analyzeDataQuality(data, query);
          qualityResults.push({ query, ...quality });

          const color = quality.score >= 4 ? 'green' : quality.score >= 3 ? 'yellow' : 'red';
          log(color, `📊 ${query}: ${quality.score}/5 quality score (${quality.percentage}%)`);

          if (quality.issues.length > 0) {
            quality.issues.forEach(issue => {
              log('yellow', `  ⚠️  ${issue}`);
            });
          }
        }

      } catch (error) {
        log('red', `❌ Quality test failed for "${query}": ${error.message}`);
        this.logError(`Data quality test failed: ${query}`, { error: error.message });
      }

      await this.delay(1000);
    }

    return qualityResults;
  }

  analyzeDataQuality(data, query) {
    if (!Array.isArray(data) || data.length === 0) {
      return { score: 0, percentage: 0, issues: ['No data returned'] };
    }

    let score = 0;
    const issues = [];

    // Check 1: Has listings
    if (data.length > 0) score++;
    else issues.push('No listings returned');

    // Check 2: Valid titles
    const hasValidTitles = data.every(item => item.title && item.title.length > 5);
    if (hasValidTitles) score++;
    else issues.push('Invalid or missing titles');

    // Check 3: Valid prices
    const hasValidPrices = data.every(item => !isNaN(parseFloat(item.price)) && parseFloat(item.price) > 0);
    if (hasValidPrices) score++;
    else issues.push('Invalid prices');

    // Check 4: Valid URLs
    const hasValidUrls = data.every(item => item.url && (item.url.startsWith('http') || item.url.startsWith('#')));
    if (hasValidUrls) score++;
    else issues.push('Invalid URLs');

    // Check 5: Rich metadata
    const hasMetadata = data.some(item => item.condition && item.shipping);
    if (hasMetadata) score++;
    else issues.push('Missing metadata');

    return {
      score,
      maxScore: 5,
      percentage: (score / 5 * 100).toFixed(0),
      issues,
      itemCount: data.length
    };
  }

  async testErrorHandling() {
    log('blue', '🛡️  Testing Error Handling...\n');

    const errorTests = [
      {
        name: 'Invalid HTTP Method',
        method: 'POST',
        url: '/api/ebay',
        expectedStatus: 405
      },
      {
        name: 'Invalid Route',
        method: 'GET',
        url: '/api/nonexistent',
        expectedStatus: 404
      },
      {
        name: 'Malformed Query',
        method: 'GET',
        url: '/api/ebay?q=%invalid%query%',
        expectedStatus: 200 // Should handle gracefully
      }
    ];

    let passedTests = 0;

    for (const test of errorTests) {
      try {
        const response = await axios({
          method: test.method,
          url: `${this.baseUrl}${test.url}`,
          timeout: 5000,
          validateStatus: () => true,
          data: test.method === 'POST' ? {} : undefined
        });

        const passed = response.status === test.expectedStatus;
        if (passed) passedTests++;

        const color = passed ? 'green' : 'red';
        const icon = passed ? '✅' : '❌';
        log(color, `${icon} ${test.name}: Expected ${test.expectedStatus}, got ${response.status}`);

        if (!passed) {
          this.logError(`Error handling test failed: ${test.name}`, {
            expected: test.expectedStatus,
            actual: response.status
          });
        }

      } catch (error) {
        log('red', `❌ ${test.name}: Exception - ${error.message}`);
        this.logError(`Error handling test exception: ${test.name}`, { error: error.message });
      }

      await this.delay(500);
    }

    log('blue', `\n🛡️  Error Handling: ${passedTests}/${errorTests.length} tests passed\n`);
    return passedTests === errorTests.length;
  }

  async monitorPerformance() {
    log('blue', '⚡ Monitoring Performance...\n');

    const performanceTests = [
      { name: 'Main Page Load', url: '/' },
      { name: 'API Response', url: '/api/ebay?q=test' },
      { name: 'Dashboard Load', url: '/dashboard' }
    ];

    const results = [];

    for (const test of performanceTests) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${this.baseUrl}${test.url}`, {
          timeout: 30000
        });
        const responseTime = Date.now() - startTime;

        results.push({
          name: test.name,
          responseTime,
          status: response.status
        });

        let color;
        let performance;
        if (responseTime < 1000) {
          color = 'green';
          performance = 'Excellent';
        } else if (responseTime < 3000) {
          color = 'blue';
          performance = 'Good';
        } else if (responseTime < 5000) {
          color = 'yellow';
          performance = 'Acceptable';
        } else {
          color = 'red';
          performance = 'Slow';
        }

        log(color, `⚡ ${test.name}: ${responseTime}ms (${performance})`);

      } catch (error) {
        log('red', `❌ ${test.name}: Failed - ${error.message}`);
        this.logError(`Performance test failed: ${test.name}`, { error: error.message });
      }

      await this.delay(1000);
    }

    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    log('blue', `📊 Average Response Time: ${avgResponseTime.toFixed(0)}ms\n`);

    return results;
  }

  logError(message, details = {}) {
    const error = {
      timestamp: new Date().toISOString(),
      message,
      details,
      uptime: Date.now() - this.startTime
    };
    this.errorLog.push(error);
  }

  async generateReport() {
    log('purple', '\n📋 Generating Comprehensive Error Report...\n');

    const report = {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      healthChecks: this.healthChecks,
      errors: this.errorLog,
      summary: {
        totalErrors: this.errorLog.length,
        lastHealthCheck: this.healthChecks[this.healthChecks.length - 1] || null,
        systemStatus: this.errorLog.length === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION'
      }
    };

    // Save report to file
    const reportPath = path.join(__dirname, `../error-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    log('cyan', '📄 Report Summary:');
    log('cyan', `   Uptime: ${Math.round(report.uptime / 1000)}s`);
    log('cyan', `   Total Errors: ${report.summary.totalErrors}`);
    log('cyan', `   System Status: ${report.summary.systemStatus}`);
    log('cyan', `   Report saved: ${reportPath}`);

    if (report.summary.systemStatus === 'HEALTHY') {
      log('green', '\n🎉 System is running smoothly with no errors detected!');
    } else {
      log('yellow', '\n⚠️  Some issues detected. Check the detailed report for more information.');
    }

    return report;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runFullDiagnostic() {
    log('purple', '🚀 Starting Full System Diagnostic...\n');

    try {
      await this.runHealthCheck();
      await this.testAPIDataQuality();
      await this.testErrorHandling();
      await this.monitorPerformance();
      
      const report = await this.generateReport();
      
      log('green', '\n✨ Diagnostic complete! All systems checked.');
      return report;

    } catch (error) {
      log('red', `💥 Diagnostic failed: ${error.message}`);
      this.logError('Diagnostic system failure', { error: error.message });
      throw error;
    }
  }
}

// Main execution
if (require.main === module) {
  const monitor = new ErrorMonitor();
  
  monitor.runFullDiagnostic().then((report) => {
    process.exit(report.summary.systemStatus === 'HEALTHY' ? 0 : 1);
  }).catch((error) => {
    log('red', `💥 System diagnostic crashed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = ErrorMonitor;