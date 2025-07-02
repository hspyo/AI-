import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Try to use local Lighthouse server first
    try {
      const response = await fetch('http://localhost:3001/run-lighthouse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch {
      console.log('Local Lighthouse server not available, falling back to PageSpeed Insights API');
    }

    // Fallback to Google's PageSpeed Insights API
    const apiKey = 'AIzaSyD16q5Rl8C5ukuyQnjnYLRlJfLmq-eU0MQ';
    const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=${categories.join('&category=')}${apiKey ? `&key=${apiKey}` : ''}`;

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to analyze URL');
    }

    const data = await response.json();
    
    // Extract scores
    const scores = {
      performance: data.lighthouseResult?.categories?.performance?.score || 0,
      accessibility: data.lighthouseResult?.categories?.accessibility?.score || 0,
      bestPractices: data.lighthouseResult?.categories?.['best-practices']?.score || 0,
      seo: data.lighthouseResult?.categories?.seo?.score || 0,
    };

    // Extract metrics
    const audits = data.lighthouseResult?.audits || {};
    const metrics = {
      firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 'N/A',
      speedIndex: audits['speed-index']?.displayValue || 'N/A',
      largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 'N/A',
      timeToInteractive: audits['interactive']?.displayValue || 'N/A',
      totalBlockingTime: audits['total-blocking-time']?.displayValue || 'N/A',
      cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 'N/A',
    };

    return NextResponse.json({
      url,
      scores,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('PageSpeed Insights error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website. Please try again later.' },
      { status: 500 }
    );
  }
}