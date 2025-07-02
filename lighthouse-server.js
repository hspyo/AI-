const express = require('express');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/run-lighthouse', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  let chrome;
  
  try {
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
    });

    const options = {
      logLevel: 'info',
      output: 'json',
      port: chrome.port,
    };

    // Run Lighthouse
    const runnerResult = await lighthouse(url, options);

    if (!runnerResult || !runnerResult.lhr) {
      throw new Error('Failed to generate Lighthouse report');
    }

    // Extract key metrics
    const { categories, audits } = runnerResult.lhr;
    
    const scores = {
      performance: categories.performance?.score || 0,
      accessibility: categories.accessibility?.score || 0,
      bestPractices: categories['best-practices']?.score || 0,
      seo: categories.seo?.score || 0,
    };

    const metrics = {
      firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 'N/A',
      speedIndex: audits['speed-index']?.displayValue || 'N/A',
      largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 'N/A',
      timeToInteractive: audits['interactive']?.displayValue || 'N/A',
      totalBlockingTime: audits['total-blocking-time']?.displayValue || 'N/A',
      cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 'N/A',
    };

    res.json({
      url,
      scores,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Lighthouse error:', error);
    res.status(500).json({ error: 'Failed to run Lighthouse analysis' });
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Lighthouse server running on http://localhost:${PORT}`);
});