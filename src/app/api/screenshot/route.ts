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

    // In production (Vercel), we can't use Puppeteer directly
    // So we'll use Google PageSpeed Insights API to get screenshots
    const apiKey = process.env.PAGESPEED_API_KEY || '';
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&screenshot=true${apiKey ? `&key=${apiKey}` : ''}`;

    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract screenshot from PageSpeed results
      const screenshot = data.lighthouseResult?.fullPageScreenshot?.screenshot?.data ||
                        data.lighthouseResult?.audits?.['final-screenshot']?.details?.data ||
                        data.lighthouseResult?.audits?.['screenshot-thumbnails']?.details?.items?.[0]?.data;
      
      if (screenshot) {
        // PageSpeed returns base64 without the data URI prefix
        const screenshotWithPrefix = screenshot.startsWith('data:') ? screenshot : `data:image/jpeg;base64,${screenshot}`;
        return NextResponse.json({ screenshot: screenshotWithPrefix });
      }

      // If no screenshot available, return null
      return NextResponse.json({
        screenshot: null,
        message: 'Screenshot not available from PageSpeed Insights'
      });

    } catch (error) {
      console.error('PageSpeed API error:', error);
      return NextResponse.json({
        screenshot: null,
        message: 'Failed to get screenshot from PageSpeed Insights',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: 'Failed to capture screenshot', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}