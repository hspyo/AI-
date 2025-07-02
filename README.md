# Lighthouse Test Application

A Next.js application that runs Lighthouse tests on user-provided URLs and displays performance metrics.

## Features

- Run Lighthouse tests on any URL
- Display performance, accessibility, best practices, and SEO scores
- Show detailed performance metrics
- Clean, responsive UI built with React and Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the application:

### Option 1: Using Google PageSpeed Insights API (Default)
Simply run the Next.js development server:
```bash
npm run dev
```

The app will use Google's PageSpeed Insights API by default. This works without any additional setup but has rate limits.

### Option 2: Using Local Lighthouse (Recommended for Development)
For more accurate results and no rate limits, run the Lighthouse server locally:

1. In one terminal, start the Lighthouse server:
```bash
npm run lighthouse-server
```

2. In another terminal, start the Next.js development server:
```bash
npm run dev
```

3. Visit http://localhost:3000

## Usage

1. Enter a URL in the input field (e.g., https://example.com)
2. Click "Run Test"
3. Wait for the analysis to complete
4. View the scores and metrics

## API Options

The application can use two different backends:

1. **Local Lighthouse Server** (port 3001): Runs full Lighthouse tests locally
2. **Google PageSpeed Insights API**: Falls back to this if local server is not running

## Environment Variables (Optional)

If you want to use your own PageSpeed Insights API key:
```
PAGESPEED_API_KEY=your_api_key_here
```

## Troubleshooting

If you encounter issues with the local Lighthouse server:
- Make sure Chrome/Chromium is installed on your system
- The server needs to launch a headless Chrome instance
- On some systems, you may need to install additional dependencies
