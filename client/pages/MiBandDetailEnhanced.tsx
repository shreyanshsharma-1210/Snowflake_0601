import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMiBand } from '../miband/MiBandContext';
import { 
  BluetoothDeviceWrapper, 
  authenticate, 
  authKeyStringToKey,
  getDeviceInfo,
  getBatteryLevel,
  getCurrentStatus,
  getCurrentTime,
  setCurrentTime,
  sendAlert,
  setActivityGoal,
  setGoalNotifications,
  startHeartRateMonitoring,
  getHeartRate
} from '../miband/band-connection';
import type { BandLoadingStates } from '../miband/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, 
  ArrowLeft, 
  Activity, 
  Battery, 
  Clock, 
  Info, 
  Bell,
  Settings as SettingsIcon,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Heart,
  Play,
  Pause,
  AlarmClock,
  Plus,
  Trash2,
  Edit,
  Home,
  ChevronRight,
  Watch,
  BarChart3
} from 'lucide-react';
import { FloatingSidebar } from '../components/FloatingSidebar';
import { useSidebar } from '../contexts/SidebarContext';

// Loading Stepper Component
const LoadingStepper: React.FC<{ currentState: BandLoadingStates; error?: string }> = ({ currentState, error }) => {
  const states = [
    { id: 'reauthorizing', text: 'Reauthorizing' },
    { id: 'searching', text: 'Searching for Device' },
    { id: 'connecting', text: 'Connecting' },
    { id: 'getting-service', text: 'Getting Service' },
    { id: 'authenticating', text: 'Authenticating' }
  ];

  const currentIndex = states.findIndex(s => s.id === currentState);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 w-full max-w-md mx-auto">
      {states.map((state, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const hasError = isCurrent && error;

        return (
          <div
            key={state.id}
            className={`w-full p-4 border rounded-lg transition-all ${
              isCompleted
                ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                : hasError
                ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                : isCurrent
                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                : 'bg-gray-50 border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{state.text}</h3>
                {hasError && <p className="text-sm mt-1">{error}</p>}
              </div>
              <div className="ml-4">
                {isCompleted && <CheckCircle2 className="h-5 w-5" />}
                {isCurrent && !error && <Loader2 className="h-5 w-5 animate-spin" />}
                {hasError && <AlertCircle className="h-5 w-5" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MiBandDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bands, getAuthorizedDeviceById, updateBandForId } = useMiBand();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [activeView, setActiveView] = useState<string>('overview');
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState(false);
  
  const [band, setBand] = useState(bands.find(b => b.id === parseInt(id || '0')));
  const [device, setDevice] = useState<BluetoothDeviceWrapper | null>(null);
  const [loadingState, setLoadingState] = useState<BandLoadingStates | 'ready' | null>(null);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  // Device info state
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [batteryInfo, setBatteryInfo] = useState<any>(null);
  const [statusInfo, setStatusInfo] = useState<any>(null);
  const [timeInfo, setTimeInfo] = useState<Date | null>(null);

  // Heart rate state
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [isMonitoringHeartRate, setIsMonitoringHeartRate] = useState(false);
  const [heartRateHistory, setHeartRateHistory] = useState<{ time: Date; rate: number }[]>([]);
  const heartRateCleanupRef = useRef<(() => void) | null>(null);

  // Settings state
  const [activityGoal, setActivityGoalValue] = useState(band?.activityGoal || 8000);
  const [goalNotifications, setGoalNotificationsValue] = useState(band?.goalNotifications || false);
  const [saving, setSaving] = useState(false);

  // Alarms state
  const [alarms, setAlarms] = useState<any[]>(band?.alarms || []);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<any>(null);

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const foundBand = bands.find(b => b.id === parseInt(id || '0'));
    if (foundBand) {
      setBand(foundBand);
      setActivityGoalValue(foundBand.activityGoal || 8000);
      setGoalNotificationsValue(foundBand.goalNotifications || false);
    }
  }, [bands, id]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && connected && device) {
      refreshIntervalRef.current = setInterval(() => {
        loadDeviceData(device, true);
      }, 5000); // Refresh every 5 seconds

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
  }, [autoRefresh, connected, device]);

  const handleConnect = async () => {
    if (!band) return;

    setError('');
    setLoadingState('reauthorizing');

    try {
      // Step 1: Try to get existing authorized device
      let bluetoothDevice = await getAuthorizedDeviceById(band.deviceId);
      
      // If device not found, request new authorization
      if (!bluetoothDevice) {
        setError('Device not found. Requesting new authorization...');
        setLoadingState('searching');
        
        // Import requestDevice and getBandMac functions
        const bandConnection = await import('../miband/band-connection');
        
        // Request device selection
        const newDevice = await bandConnection.requestDevice();
        if (!newDevice) {
          setError('No device selected. Please try again.');
          setLoadingState(null);
          return;
        }
        
        // Get MAC address to verify it's the same band
        const mac = await bandConnection.getBandMac(newDevice);
        
        if (mac !== band.macAddress) {
          setError(`Wrong device selected. Expected ${band.macAddress}, got ${mac}`);
          setLoadingState(null);
          return;
        }
        
        // Update device ID in database
        await updateBandForId(band.id, { deviceId: newDevice.id });
        
        bluetoothDevice = newDevice;
        setError('Device reauthorized successfully!');
      }

      // Step 2: Searching
      setLoadingState('searching');
      await new Promise(resolve => setTimeout(resolve, 500));

      const wrapper = new BluetoothDeviceWrapper(bluetoothDevice);
      const key = await authKeyStringToKey(band.authKey);

      // Step 3-5: Connecting, Getting Service, Authenticating
      await authenticate(wrapper, key, {
        onSearching: () => setLoadingState('searching'),
        onConnecting: () => setLoadingState('connecting'),
        onGettingService: () => setLoadingState('getting-service'),
        onAuthenticating: () => setLoadingState('authenticating'),
      });

      setDevice(wrapper);
      setConnected(true);
      setLoadingState('ready');
      setError(''); // Clear any errors

      // Load initial data
      await loadDeviceData(wrapper);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setConnected(false);
      setLoadingState(null);
    }
  };

  const handleDisconnect = async () => {
    // Stop heart rate monitoring if active
    if (heartRateCleanupRef.current) {
      await heartRateCleanupRef.current();
      heartRateCleanupRef.current = null;
    }
    setIsMonitoringHeartRate(false);
    
    if (device) {
      device.disconnect();
      setDevice(null);
      setConnected(false);
      setLoadingState(null);
      setAutoRefresh(false);
    }
  };

  const loadDeviceData = async (deviceWrapper: BluetoothDeviceWrapper, silent = false) => {
    try {
      const [info, battery, status, time] = await Promise.all([
        getDeviceInfo(deviceWrapper),
        getBatteryLevel(deviceWrapper),
        getCurrentStatus(deviceWrapper),
        getCurrentTime(deviceWrapper)
      ]);

      setDeviceInfo(info);
      setBatteryInfo(battery);
      setStatusInfo(status);
      setTimeInfo(time);
      setLastUpdate(new Date());
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : 'Failed to load device data');
      }
      console.error('Failed to load device data:', err);
    }
  };

  const handleSyncTime = async () => {
    if (!device) return;

    setSaving(true);
    try {
      await setCurrentTime(device, new Date());
      const newTime = await getCurrentTime(device);
      setTimeInfo(newTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync time');
    } finally {
      setSaving(false);
    }
  };

  const handleFindBand = async () => {
    if (!device) return;

    setSaving(true);
    try {
      await sendAlert(device);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send alert');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGoal = async () => {
    if (!device || !band) return;

    setSaving(true);
    try {
      await setActivityGoal(device, activityGoal);
      await setGoalNotifications(device, goalNotifications);
      await updateBandForId(band.id, { activityGoal, goalNotifications });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    if (!device) return;
    await loadDeviceData(device);
  };

  const handleStartHeartRateMonitoring = async () => {
    if (!device || isMonitoringHeartRate) return;

    setSaving(true);
    try {
      const cleanup = await startHeartRateMonitoring(device, (rate) => {
        setHeartRate(rate);
        setHeartRateHistory(prev => {
          const newHistory = [...prev, { time: new Date(), rate }];
          // Keep only last 20 readings
          return newHistory.slice(-20);
        });
      });
      
      heartRateCleanupRef.current = cleanup;
      setIsMonitoringHeartRate(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start heart rate monitoring');
    } finally {
      setSaving(false);
    }
  };

  const handleStopHeartRateMonitoring = async () => {
    if (!heartRateCleanupRef.current) return;

    setSaving(true);
    try {
      await heartRateCleanupRef.current();
      heartRateCleanupRef.current = null;
      setIsMonitoringHeartRate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop heart rate monitoring');
    } finally {
      setSaving(false);
    }
  };

  const handleGetSingleHeartRate = async () => {
    if (!device) return;

    // Temporarily disable auto-refresh to avoid GATT conflicts
    const wasAutoRefreshing = autoRefresh;
    if (wasAutoRefreshing) {
      setAutoRefresh(false);
    }

    setSaving(true);
    setHeartRate(null);
    try {
      // Pass progress callback to show changing values
      const rate = await getHeartRate(device, (progressBPM) => {
        // Update UI with progressive values
        setHeartRate(progressBPM);
      });
      
      // Set final value
      setHeartRate(rate);
      setHeartRateHistory(prev => {
        const newHistory = [...prev, { time: new Date(), rate }];
        return newHistory.slice(-20);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get heart rate');
    } finally {
      setSaving(false);
      // Re-enable auto-refresh if it was on
      if (wasAutoRefreshing) {
        setAutoRefresh(true);
      }
    }
  };

  if (!band) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Floating Sidebar */}
        <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        {/* Main Content */}
        <div 
          className={`transition-all duration-300 ${
            isCollapsed ? 'ml-20' : 'ml-72'
          } p-6`}
        >
          <div className="max-w-7xl mx-auto">
            <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
              <AlertDescription className="text-red-800 dark:text-red-200">
                Band not found
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  // Internal sidebar menu items for device detail page
  const sidebarMenuItems = [
    { id: 'overview', label: 'Overview', icon: Home, description: 'Device status and quick actions' },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity, description: 'Real-time health monitoring' },
    { id: 'data', label: 'Health Data', icon: Heart, description: 'Historical health data' },
    { id: 'settings', label: 'Device Settings', icon: SettingsIcon, description: 'Configure device preferences' },
    { id: 'info', label: 'Device Info', icon: Info, description: 'Hardware and firmware details' },
    { id: 'sync', label: 'Sync & Time', icon: Clock, description: 'Time synchronization settings' },
  ];

  // Breadcrumb component
  const Breadcrumb = () => {
    const currentItem = sidebarMenuItems.find(item => item.id === activeView);
    
    return (
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors hover:underline cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </button>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={() => navigate('/dashboard/miband')}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors hover:underline cursor-pointer"
        >
          <Watch className="w-4 h-4" />
          Wearable Devices
        </button>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={() => setActiveView('overview')}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors hover:underline cursor-pointer"
        >
          <Activity className="w-4 h-4" />
          {band?.nickname || 'Device Details'}
        </button>
        {currentItem && activeView !== 'overview' && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="flex items-center gap-1 text-gray-900 dark:text-white font-medium">
              <currentItem.icon className="w-4 h-4" />
              {currentItem.label}
            </span>
          </>
        )}
      </nav>
    );
  };

  // Function to render content based on active view
  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return renderOverviewContent();
      case 'monitoring':
        return renderMonitoringContent();
      case 'data':
        return renderDataContent();
      case 'settings':
        return renderSettingsContent();
      case 'info':
        return renderInfoContent();
      case 'sync':
        return renderSyncContent();
      default:
        return renderOverviewContent();
    }
  };

  // Overview content (existing tabs)
  const renderOverviewContent = () => {
    return (
      <>
        {/* Content based on current view */}
        {loadingState && loadingState !== 'ready' ? (
          <LoadingStepper currentState={loadingState} error={error} />
        ) : error ? (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        ) : connected ? (
          <>
            {/* Existing tabs content will go here */}
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Device Disconnected</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                Connect to your device to view real-time data and controls
              </p>
              <Button onClick={handleConnect} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Connect Device
              </Button>
            </CardContent>
          </Card>
        )}
      </>
    );
  };

  // Live Monitoring content
  const renderMonitoringContent = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Live Health Monitoring
            </CardTitle>
            <CardDescription>Real-time health data from your device</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your heart rate, activity, and other vital signs in real-time.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Health Data content
  const renderDataContent = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Health Data History
            </CardTitle>
            <CardDescription>View your historical health and fitness data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Access your complete health data history and trends.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Device Settings content
  const renderSettingsContent = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Device Configuration
            </CardTitle>
            <CardDescription>Configure your device settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your device settings, notifications, and preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Device Info content
  const renderInfoContent = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Device Information
            </CardTitle>
            <CardDescription>Hardware and firmware details</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              View detailed information about your device hardware and firmware.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Sync & Time content
  const renderSyncContent = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Synchronization
            </CardTitle>
            <CardDescription>Manage time sync and data synchronization</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Configure time synchronization and data sync settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Floating Sidebar */}
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-72'
        } p-6`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <Breadcrumb />

          {/* Main Content Area with Internal Sidebar */}
          <div className="flex gap-6">
            {/* Internal Sidebar */}
            <div className={`transition-all duration-300 ${internalSidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}>
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 h-fit sticky top-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    {!internalSidebarCollapsed && (
                      <div>
                        <CardTitle className="text-lg">Device Controls</CardTitle>
                        <CardDescription className="text-sm">Manage your device</CardDescription>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setInternalSidebarCollapsed(!internalSidebarCollapsed)}
                      className="h-8 w-8"
                    >
                      <ChevronRight className={`h-4 w-4 transition-transform ${internalSidebarCollapsed ? 'rotate-0' : 'rotate-180'}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <nav className="space-y-1">
                    {sidebarMenuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeView === item.id
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'hover:bg-white/40 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        } ${internalSidebarCollapsed ? 'justify-center' : ''}`}
                        title={internalSidebarCollapsed ? item.label : ''}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!internalSidebarCollapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{item.label}</div>
                            <div className="text-xs opacity-75 truncate">{item.description}</div>
                          </div>
                        )}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Panel */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/miband')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {sidebarMenuItems.find(item => item.id === activeView)?.label || band.nickname}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {activeView === 'overview' ? band.macAddress : sidebarMenuItems.find(item => item.id === activeView)?.description}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {connected && loadingState === 'ready' ? (
              <>
                <Button variant="outline" onClick={handleRefresh} disabled={saving}>
                  <RefreshCw className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="outline" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </>
            ) : (
              <Button onClick={handleConnect} disabled={loadingState !== null && loadingState !== 'ready'}>
                {loadingState && loadingState !== 'ready' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Open Band'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading Stepper */}
        {loadingState && loadingState !== 'ready' && (
          <LoadingStepper currentState={loadingState} error={error} />
        )}

        {/* Main Content - Only show when ready */}
        {loadingState === 'ready' && connected && (
          <>
            {/* Connection Status with Auto-Refresh */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <span className="font-medium">Connected</span>
                      {lastUpdate && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Last updated: {lastUpdate.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={autoRefresh}
                        onCheckedChange={setAutoRefresh}
                      />
                      <Label className="text-sm">Auto-refresh (5s)</Label>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleFindBand} disabled={saving}>
                      <Bell className="mr-2 h-4 w-4" />
                      Find Band
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="status" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="heartrate">Heart Rate</TabsTrigger>
                <TabsTrigger value="battery">Battery</TabsTrigger>
                <TabsTrigger value="alarms">Alarms</TabsTrigger>
                <TabsTrigger value="info">Device Info</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Status Tab */}
              <TabsContent value="status">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-blue-600">{statusInfo?.steps?.toLocaleString() || '0'}</p>
                      <p className="text-sm text-gray-500 mt-2">Today's steps</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-green-500" />
                        Distance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-green-600">
                        {statusInfo?.meters ? `${(statusInfo.meters / 1000).toFixed(2)}` : '0.00'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">Kilometers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-orange-500" />
                        Calories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-orange-600">{statusInfo?.calories || '0'}</p>
                      <p className="text-sm text-gray-500 mt-2">Burned today</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Heart Rate Tab */}
              <TabsContent value="heartrate">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      Heart Rate Monitor
                    </CardTitle>
                    <CardDescription>
                      Measure your heart rate in real-time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Heart Rate Display */}
                    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl">
                      <Heart className={`h-16 w-16 mb-4 ${heartRate ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                      <div className="text-6xl font-bold text-red-600 mb-2">
                        {heartRate || '--'}
                      </div>
                      <p className="text-lg text-gray-600 dark:text-gray-400">BPM (Beats Per Minute)</p>
                      {heartRate && (
                        <p className="text-sm text-gray-500 mt-2">
                          {heartRate < 60 ? '💙 Resting' : heartRate < 100 ? '💚 Normal' : heartRate < 140 ? '💛 Elevated' : '❤️ High'}
                        </p>
                      )}
                    </div>

                    {/* Control Buttons */}
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleGetSingleHeartRate} 
                        disabled={saving || isMonitoringHeartRate}
                        className="flex-1"
                        variant="outline"
                      >
                        {saving && !isMonitoringHeartRate ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Measuring...
                          </>
                        ) : (
                          <>
                            <Heart className="mr-2 h-4 w-4" />
                            Single Measurement
                          </>
                        )}
                      </Button>

                      {!isMonitoringHeartRate ? (
                        <Button 
                          onClick={handleStartHeartRateMonitoring} 
                          disabled={saving}
                          className="flex-1 bg-red-500 hover:bg-red-600"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Continuous
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleStopHeartRateMonitoring} 
                          disabled={saving}
                          className="flex-1"
                          variant="destructive"
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          Stop Monitoring
                        </Button>
                      )}
                    </div>

                    {/* Monitoring Status */}
                    {isMonitoringHeartRate && (
                      <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
                        <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                        <AlertDescription className="text-red-800 dark:text-red-200">
                          Continuous monitoring active - Heart rate updates in real-time
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Heart Rate History */}
                    {heartRateHistory.length > 0 && (
                      <div className="space-y-3">
                        <Label>Recent Readings ({heartRateHistory.length})</Label>
                        <div className="max-h-64 overflow-y-auto space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          {heartRateHistory.slice().reverse().map((reading, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded">
                              <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span className="font-mono text-lg font-semibold">{reading.rate} BPM</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {reading.time.toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Info */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <p>💡 <strong>Tip:</strong> Keep your band snug on your wrist for accurate readings</p>
                      <p>⏱️ <strong>Single Measurement:</strong> Takes 10-30 seconds</p>
                      <p>🔄 <strong>Continuous Monitoring:</strong> Updates every few seconds</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Battery Tab */}
              <TabsContent value="battery">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Battery className="h-5 w-5" />
                      Battery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Battery Level</Label>
                        <span className="text-2xl font-bold">{batteryInfo?.batteryLevel || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all"
                          style={{ width: `${batteryInfo?.batteryLevel || 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Charging Status</Label>
                        <p className="text-lg font-medium mt-1">
                          {batteryInfo?.isCharging ? '🔌 Charging' : '🔋 Not Charging'}
                        </p>
                      </div>
                      <div>
                        <Label>Last Level</Label>
                        <p className="text-lg font-medium mt-1">{batteryInfo?.lastLevel || 0}%</p>
                      </div>
                      <div>
                        <Label>Last Charged</Label>
                        <p className="text-sm mt-1">
                          {batteryInfo?.lastCharge ? new Date(batteryInfo.lastCharge).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label>Last Off</Label>
                        <p className="text-sm mt-1">
                          {batteryInfo?.lastOff ? new Date(batteryInfo.lastOff).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Alarms Tab */}
              <TabsContent value="alarms">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <AlarmClock className="h-5 w-5 text-blue-500" />
                        Alarms
                      </div>
                      <Button onClick={() => setIsAlarmModalOpen(true)} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Alarm
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Manage your band alarms (up to 5 alarms)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {alarms.length === 0 ? (
                      <div className="text-center py-12">
                        <AlarmClock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No alarms set</p>
                        <p className="text-sm text-gray-500 mt-2">Click "Add Alarm" to create one</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {alarms.map((alarm, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                          >
                            <div className="flex items-center gap-4">
                              <AlarmClock className="h-5 w-5 text-blue-500" />
                              <div>
                                <div className="font-semibold text-lg">
                                  {alarm.time.hour.toString().padStart(2, '0')}:
                                  {alarm.time.minute.toString().padStart(2, '0')}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {alarm.repetition || 'Once'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={alarm.enabled}
                                onCheckedChange={(checked) => {
                                  const newAlarms = [...alarms];
                                  newAlarms[index].enabled = checked;
                                  setAlarms(newAlarms);
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingAlarm({ ...alarm, index });
                                  setIsAlarmModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newAlarms = alarms.filter((_, i) => i !== index);
                                  setAlarms(newAlarms);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {alarms.length > 0 && (
                      <div className="mt-6">
                        <Button onClick={() => {/* Save alarms to band */}} disabled={saving} className="w-full">
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving to Band...
                            </>
                          ) : (
                            'Save All Alarms to Band'
                          )}
                        </Button>
                      </div>
                    )}
                    
                    <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <p>💡 <strong>Tip:</strong> Alarms are stored on the band</p>
                      <p>⏰ <strong>Limit:</strong> Maximum 5 alarms</p>
                      <p>🔔 <strong>Vibration:</strong> Band vibrates when alarm triggers</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Device Info Tab */}
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Device Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>MAC Address</Label>
                        <p className="text-sm mt-1 font-mono">{deviceInfo?.macAddress || band.macAddress}</p>
                      </div>
                      <div>
                        <Label>Hardware Revision</Label>
                        <p className="text-sm mt-1">{deviceInfo?.hardwareRevision || 'N/A'}</p>
                      </div>
                      <div>
                        <Label>Firmware Version</Label>
                        <p className="text-sm mt-1">{deviceInfo?.firmwareVersion || 'N/A'}</p>
                      </div>
                      <div>
                        <Label>Vendor ID</Label>
                        <p className="text-sm mt-1 font-mono">
                          {deviceInfo?.vendorId ? `0x${deviceInfo.vendorId.toString(16).toUpperCase()}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label>Product ID</Label>
                        <p className="text-sm mt-1 font-mono">
                          {deviceInfo?.productId ? `0x${deviceInfo.productId.toString(16).toUpperCase()}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Label>Band Time</Label>
                      <p className="text-lg font-medium mt-2">{timeInfo ? timeInfo.toLocaleString() : 'N/A'}</p>
                      <Button onClick={handleSyncTime} disabled={saving} size="sm" className="mt-3">
                        <Clock className="mr-2 h-4 w-4" />
                        Sync Time with System
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SettingsIcon className="h-5 w-5" />
                      Band Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="activityGoal">Daily Step Goal</Label>
                      <Input
                        id="activityGoal"
                        type="number"
                        value={activityGoal}
                        onChange={(e) => setActivityGoalValue(parseInt(e.target.value) || 0)}
                        disabled={saving}
                        min={1000}
                        max={50000}
                        step={1000}
                      />
                      <p className="text-sm text-gray-500">Set your daily step target (1,000 - 50,000)</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="goalNotifications">Goal Notifications</Label>
                        <p className="text-sm text-gray-500">Get notified when you reach your goal</p>
                      </div>
                      <Switch
                        id="goalNotifications"
                        checked={goalNotifications}
                        onCheckedChange={setGoalNotificationsValue}
                        disabled={saving}
                      />
                    </div>
                    <Button onClick={handleSaveGoal} disabled={saving} className="w-full">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Settings'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiBandDetail;
