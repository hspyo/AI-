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
  timestamp: string;
}

export default function LighthouseTest() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LighthouseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

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
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatScore = (score: number) => Math.round(score * 100);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Lighthouse Test</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL (e.g., https://example.com)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Testing...' : 'Run Test'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Running Lighthouse test... This may take a minute.</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Test Results</h2>
          <p className="text-gray-600 mb-6">URL: {result.url}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold ${getScoreColor(result.scores.performance)}`}>
                {formatScore(result.scores.performance)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Performance</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold ${getScoreColor(result.scores.accessibility)}`}>
                {formatScore(result.scores.accessibility)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Accessibility</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold ${getScoreColor(result.scores.bestPractices)}`}>
                {formatScore(result.scores.bestPractices)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Best Practices</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-3xl font-bold ${getScoreColor(result.scores.seo)}`}>
                {formatScore(result.scores.seo)}
              </div>
              <div className="text-sm text-gray-600 mt-1">SEO</div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">First Contentful Paint</span>
              <span className="font-semibold">{result.metrics.firstContentfulPaint}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Speed Index</span>
              <span className="font-semibold">{result.metrics.speedIndex}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Largest Contentful Paint</span>
              <span className="font-semibold">{result.metrics.largestContentfulPaint}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Time to Interactive</span>
              <span className="font-semibold">{result.metrics.timeToInteractive}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Total Blocking Time</span>
              <span className="font-semibold">{result.metrics.totalBlockingTime}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Cumulative Layout Shift</span>
              <span className="font-semibold">{result.metrics.cumulativeLayoutShift}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Tested at: {new Date(result.timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}