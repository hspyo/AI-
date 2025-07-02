'use client';

import { useState } from 'react';

interface LighthouseResult {
  url: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    firstContentfulPaint: string;
    speedIndex: string;
    largestContentfulPaint: string;
    timeToInteractive: string;
    totalBlockingTime: string;
    cumulativeLayoutShift: string;
  };
  screenshot?: string;
  timestamp: string;
}

export default function LighthouseTest() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LighthouseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setScreenshot(null);

    // Capture screenshot
    setScreenshotLoading(true);
    try {
      const screenshotResponse = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (screenshotResponse.ok) {
        const screenshotData = await screenshotResponse.json();
        setScreenshot(screenshotData.screenshot);
      }
    } catch (err) {
      console.error('Screenshot error:', err);
    } finally {
      setScreenshotLoading(false);
    }

    // Run Lighthouse test
    try {
      const response = await fetch('/api/lighthouse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to run Lighthouse test');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-500';
    if (score >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.9) return 'bg-green-50';
    if (score >= 0.5) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const formatScore = (score: number) => Math.round(score * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 pb-2">
            PageSpeed Insights
          </h1>
          <p className="text-xl text-gray-600">
            Analyze your website's performance, accessibility, and SEO
          </p>
        </div>
      
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="w-full px-6 py-4 pr-32 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
              <button
                type="submit"
                disabled={loading || screenshotLoading}
                className="absolute right-3 top-3 px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {loading || screenshotLoading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(loading || screenshotLoading) && !screenshot && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-lg text-gray-600">
              {screenshotLoading && !loading ? 'Capturing screenshot...' : 'Running comprehensive analysis...'}
            </p>
            <p className="mt-2 text-sm text-gray-500">This may take up to 30 seconds</p>
          </div>
        )}

        {/* Results */}
        {(result || screenshot) && (
          <div className="space-y-8">

            {/* Screenshot Section */}
            {screenshot && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800">Website Preview</h2>
                  <p className="text-gray-600 mt-1">{url}</p>
                </div>
                <div className="p-6">
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <img 
                      src={screenshot} 
                      alt={`Screenshot of ${url}`}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Performance Scores */}
            {!result && loading && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-lg text-gray-600">Analyzing performance metrics...</p>
                </div>
              </div>
            )}

            {result && (
              <>
                {/* Score Cards */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Scores</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Performance', score: result.scores.performance, icon: '⚡' },
                      { label: 'Accessibility', score: result.scores.accessibility, icon: '♿' },
                      { label: 'Best Practices', score: result.scores.bestPractices, icon: '✓' },
                      { label: 'SEO', score: result.scores.seo, icon: '🔍' },
                    ].map((item) => (
                      <div key={item.label} className={`${getScoreBg(item.score)} rounded-xl p-6 text-center transform hover:scale-105 transition-transform`}>
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <div className={`text-4xl font-bold ${getScoreColor(item.score)} mb-2`}>
                          {formatScore(item.score)}
                        </div>
                        <div className="text-sm font-medium text-gray-700">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Core Web Vitals</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'First Contentful Paint', value: result.metrics.firstContentfulPaint, description: 'Time until the first content appears' },
                      { label: 'Speed Index', value: result.metrics.speedIndex, description: 'How quickly content is visually displayed' },
                      { label: 'Largest Contentful Paint', value: result.metrics.largestContentfulPaint, description: 'Time until the largest content element appears' },
                      { label: 'Time to Interactive', value: result.metrics.timeToInteractive, description: 'Time until the page becomes fully interactive' },
                      { label: 'Total Blocking Time', value: result.metrics.totalBlockingTime, description: 'Sum of all time periods between FCP and TTI' },
                      { label: 'Cumulative Layout Shift', value: result.metrics.cumulativeLayoutShift, description: 'Measure of visual stability' },
                    ].map((metric) => (
                      <div key={metric.label} className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-800">{metric.label}</h3>
                          <span className="text-xl font-bold text-blue-600">{metric.value}</span>
                        </div>
                        <p className="text-sm text-gray-600">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500">
                  Analysis completed at {new Date(result.timestamp).toLocaleString()}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}