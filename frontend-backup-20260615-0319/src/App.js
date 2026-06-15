import { Analytics } from '@vercel/analytics/react';

// Recipe: App is a React no-op. The entire landing page lives in /public/index.html.
export default function App() {
  return <Analytics />;
}
