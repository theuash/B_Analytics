# Frontend - Dashboard Analytics UI

Modern React + Vite frontend for the Dashboard Analytics system.

## Setup

```bash
npm install
npm run dev
```

## Building for Production

```bash
npm run build
npm run preview
```

## Environment Variables

Create a `.env.local` file:

```env
VITE_API_BASE=http://localhost:8000
```

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── QueryInput.jsx   # Query input form
│   ├── Dashboard.jsx    # Dashboard display
│   ├── ChartRenderer.jsx # Chart rendering
│   └── SampleQueries.jsx # Sample query suggestions
├── services/
│   └── api.js           # API client
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Features

- Natural language query input
- Real-time chart generation
- Multiple chart types (line, bar, pie, scatter, table)
- CSV file upload
- Responsive design
- Interactive visualizations
- Sample query suggestions
- Error handling with user-friendly messages

## Building Custom Components

To add new components, follow this pattern:

```jsx
import React from 'react'

const MyComponent = ({ ...props }) => {
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  )
}

export default MyComponent
```

## Tailwind CSS

All components use Tailwind CSS for styling. Key color scheme:
- Primary: Blue (#3b82f6)
- Secondary: Purple (#8b5cf6)
- Accent: Pink (#ec4899)
- Theme: Dark mode (slate-900 background)

## Performance Tips

- Charts are memoized to prevent unnecessary re-renders
- API calls are debounced
- Images are lazy-loaded
- CSS is minified in production

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

**Port 5173 already in use:**
```bash
vite --port 3000
```

**API connection issues:**
Check that backend is running on http://localhost:8000

**Build errors:**
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```
