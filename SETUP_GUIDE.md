# 🚀 Setup Guide for Medical Emergency Platform

This guide will help you set up and run the Medical Emergency & MiBand Integration Platform on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js 18.0 or higher** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **Modern web browser** (Chrome 89+, Firefox 90+, Safari 14+, Edge 89+)

### For MiBand Features
- **HTTPS connection** (required for Bluetooth API)
- **Bluetooth-enabled device**
- **MiBand device** (Mi Band 4, 5, 6, or compatible)

## 🛠️ Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd inno
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Setup (Optional)
Create a `.env` file in the root directory if you need custom configuration:
```env
VITE_APP_NAME=Medical Emergency Platform
# Add other environment variables as needed
```

### 4. Start Development Server
```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

The application will be available at: `http://localhost:8080`

## 🌐 HTTPS Setup (Required for Full Features)

For **geolocation** and **Bluetooth** features to work, you need HTTPS. Here are your options:

### Option 1: Use ngrok (Recommended for Development)
1. Install ngrok: `npm install -g ngrok`
2. In one terminal, run: `npm run dev`
3. In another terminal, run: `ngrok http 8080`
4. Use the HTTPS URL provided by ngrok

### Option 2: Local HTTPS Certificate
1. Install mkcert: `npm install -g mkcert`
2. Create local CA: `mkcert -install`
3. Generate certificate: `mkcert localhost 127.0.0.1 ::1`
4. Configure Vite for HTTPS (modify vite.config.ts)

### Option 3: Deploy to Netlify/Vercel
- Push to GitHub and deploy to Netlify or Vercel
- Both provide HTTPS by default

## 🚑 Testing Ambulance Services

### 1. Location Permission
- When you first visit the ambulance page, allow location access
- If denied, click the "Get Location" button to retry

### 2. Map Interaction
- **Hospital markers** (🏥) - Click to see hospital details
- **Ambulance markers** (🚑) - Click to book ambulance
- **Your location** (📍) - Blue marker showing your position

### 3. Booking Process
1. Click any ambulance marker on the map
2. Click "Book Ambulance" in the popup
3. Watch the route calculation and ambulance movement
4. Ambulance will move slowly along real roads to your location

## ⌚ MiBand Setup & Testing

### 1. Prerequisites
- Ensure you're using HTTPS (see HTTPS setup above)
- Have your MiBand nearby and charged
- Know your MiBand's auth key (see `MIBAND_REALTIME_GUIDE.md`)

### 2. Connection Process
1. Navigate to the MiBand section
2. Click "Open Band"
3. Follow the 5-step connection process:
   - 🔄 Reauthorizing
   - 🔍 Searching for Device
   - 🔗 Connecting
   - ⚙️ Getting Service
   - 🔐 Authenticating

### 3. Troubleshooting MiBand
- Ensure Bluetooth is enabled
- Make sure MiBand is not connected to Mi Fit app
- Try refreshing the page and reconnecting
- Check browser console for error messages

## 🏗️ Build for Production

### Development Build
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### Deploy to Netlify
1. Push your code to GitHub
2. Connect GitHub repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Deploy automatically on push

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Build for production
npm run build:client # Build client only
npm run build:server # Build server only

# Production
npm run start        # Start production server

# Code Quality
npm run format.fix   # Format code with Prettier
npm run typecheck    # Run TypeScript type checking
npm run test         # Run tests
```

## 📁 Project Structure Overview

```
inno/
├── client/                    # React frontend
│   ├── components/           # UI components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── miband/              # MiBand integration
│   ├── pages/               # Application pages
│   └── ui/                  # UI library
├── netlify/                 # Netlify functions
├── public/                  # Static assets
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## 🐛 Common Issues & Solutions

### Issue: "Location access denied"
**Solution**: 
- Ensure you're using HTTPS
- Check browser location permissions
- Try the "Get Location" button

### Issue: "Bluetooth not available"
**Solution**:
- Use HTTPS connection
- Enable Bluetooth on your device
- Use a supported browser (Chrome recommended)

### Issue: "MiBand won't connect"
**Solution**:
- Disconnect from Mi Fit app first
- Ensure MiBand is charged and nearby
- Try resetting MiBand connection
- Check auth key is correct

### Issue: "Map not loading"
**Solution**:
- Check internet connection
- Ensure no ad blockers are blocking map tiles
- Try refreshing the page

### Issue: "Ambulance not moving"
**Solution**:
- Ensure location permission is granted
- Check browser console for routing errors
- Try booking a different ambulance

## 📞 Getting Help

If you encounter issues:

1. **Check browser console** for error messages
2. **Verify HTTPS** connection for location/Bluetooth features
3. **Test with different browsers** (Chrome recommended)
4. **Check network connectivity** for map and routing services
5. **Open GitHub issue** with detailed error information

## 🎯 Next Steps

After successful setup:

1. **Explore the ambulance service** - Test location detection and ambulance booking
2. **Try MiBand integration** - Connect your device and monitor heart rate
3. **Customize the UI** - Modify components and styling to your needs
4. **Add new features** - Extend functionality as needed
5. **Deploy to production** - Share with others using Netlify or similar

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Leaflet Documentation](https://leafletjs.com/)
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)

---

**Happy coding! 🚀**
