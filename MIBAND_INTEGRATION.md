# Mi Band 4 Web Integration

This document describes the integration of Mi Band 4 web functionality into the inno project.

## Overview

The Mi Band 4 web functionality has been fully integrated into the inno React application. The original Vue.js application has been ported to React with all features preserved.

## Features Integrated

### Core Functionality
- **Device Management**: Add, edit, and delete Mi Band 4 devices
- **Bluetooth Connection**: Web Bluetooth API integration for device communication
- **Authentication**: Secure device authentication using AES-CBC encryption
- **Data Storage**: IndexedDB for persistent storage of band data and activity history

### Device Features
- **Status Monitoring**: Real-time steps, distance, and calories tracking
- **Battery Information**: Battery level, charging status, and charge history
- **Device Information**: MAC address, firmware version, hardware revision
- **Time Synchronization**: Sync band time with system time
- **Find My Band**: Send vibration alerts to locate the band
- **Activity Goals**: Set daily step goals and enable/disable goal notifications

## File Structure

```
inno/
├── client/
│   ├── miband/
│   │   ├── types.ts                 # TypeScript type definitions
│   │   ├── utils.ts                 # Utility functions
│   │   ├── local-db.ts              # IndexedDB operations
│   │   ├── band-connection.ts       # Bluetooth connection and device control
│   │   └── MiBandContext.tsx        # React context for state management
│   ├── pages/
│   │   ├── MiBand.tsx               # Main Mi Band management page
│   │   └── MiBandDetail.tsx         # Individual band detail and control page
│   ├── components/
│   │   └── FloatingSidebar.tsx      # Updated with Mi Band navigation
│   └── App.tsx                      # Updated with Mi Band routes and provider
└── package.json                     # Updated with new dependencies
```

## Dependencies Added

- `idb@^7.1.1` - IndexedDB wrapper for data persistence
- `chart.js@^4.3.0` - Charting library for activity data visualization
- `react-chartjs-2@^5.2.0` - React wrapper for Chart.js
- `@types/web-bluetooth@^0.0.17` - TypeScript definitions for Web Bluetooth API

## Routes

- `/dashboard/miband` - Main Mi Band management page (list all bands)
- `/dashboard/miband/:id` - Individual band detail and control page

## Browser Compatibility

The Mi Band 4 integration requires Web Bluetooth API support:

### Supported Browsers
- **Chrome**: Version 56+ (Desktop and Android)
- **Edge**: Version 79+
- **Opera**: Version 43+ (requires flag)
- **Samsung Internet**: Version 6.2+

### Supported Operating Systems
- **Chrome OS**: Full support
- **Android**: Version 6.0+
- **macOS**: OS X Yosemite+
- **Windows**: Windows 10 version 1703+
- **Linux**: Requires flag

### Not Supported
- **Safari**: No Web Bluetooth support
- **Firefox**: No Web Bluetooth support (desktop)
- **iOS**: No Web Bluetooth support

## Usage

### Adding a Band

1. Navigate to `/dashboard/miband`
2. Click "Add Band"
3. Enter a nickname for your band
4. Enter the authentication key (32-character hex string)
   - Get this from the Mi Fit app or Gadgetbridge
5. Click "Select Device" to scan for nearby bands
6. Select your Mi Band 4 from the list
7. Click "Add Band" to authenticate and save

### Viewing Band Details

1. Click on a band card in the main Mi Band page
2. Click "Connect" to establish a Bluetooth connection
3. View real-time data in the tabs:
   - **Status**: Steps, distance, calories
   - **Battery**: Battery level and charging information
   - **Device Info**: Hardware and firmware information
   - **Settings**: Configure activity goals and notifications

### Band Controls

- **Find Band**: Make the band vibrate to locate it
- **Sync Time**: Synchronize the band's time with your system time
- **Set Goal**: Configure daily step goals
- **Goal Notifications**: Enable/disable goal achievement notifications

## Technical Details

### State Management

The integration uses React Context API (`MiBandContext`) to manage:
- List of registered bands
- Authorized Bluetooth devices
- Configuration settings

### Data Persistence

All data is stored locally using IndexedDB:
- **bands**: Band information (nickname, MAC address, auth key, etc.)
- **config**: User preferences
- **activityData**: Historical activity data (future feature)

### Bluetooth Communication

The `band-connection.ts` module handles all Bluetooth operations:
- Device discovery and pairing
- Authentication using AES-CBC encryption
- Reading device characteristics (battery, steps, time, etc.)
- Writing device configurations (goals, alarms, time, etc.)

### Security

- Authentication keys are stored locally in IndexedDB
- All Bluetooth communication uses encrypted authentication
- No data is sent to external servers

## Known Limitations

1. **Browser Support**: Limited to browsers with Web Bluetooth API support
2. **Connection Stability**: Bluetooth connections can be unstable; reconnection may be required
3. **Activity Data**: Historical activity data fetching is implemented but not yet exposed in the UI
4. **Advanced Features**: Some features from the original app (alarms, weather, display configuration) are not yet implemented in the UI

## Future Enhancements

- Activity data visualization with charts
- Alarm management interface
- Weather configuration
- Display item customization
- Lift wrist settings
- Night mode configuration
- Band lock configuration

## Integration Notes

- The integration does not affect any existing functionality in the inno project
- All Mi Band code is isolated in the `client/miband` directory
- The MiBandProvider is wrapped around the entire app to provide global access
- Routes are added to the existing routing structure
- Navigation link added to the FloatingSidebar component

## Troubleshooting

### "Web Bluetooth is not supported"
- Use a compatible browser (Chrome, Edge)
- Ensure you're on a supported operating system
- Check that Bluetooth is enabled on your device

### "Failed to connect to device"
- Ensure the band is nearby and powered on
- Try disconnecting and reconnecting
- Check that the band is not connected to another device
- Verify the authentication key is correct

### "Device not found"
- The band may have been forgotten by the browser
- Try re-adding the band
- Check Bluetooth permissions in browser settings

## Credits

This integration is based on the [miband4-web](https://github.com/grimsteel/miband4-web) project by grimsteel, which is licensed under GPL-3.0. The original project was built with Vue.js and has been ported to React for this integration.
