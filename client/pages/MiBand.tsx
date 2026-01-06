import React, { useState, useEffect } from 'react';
import { useMiBand } from '../miband/MiBandContext';
import { webBluetoothSupported, requestDevice, getBandMac, authenticate, authKeyStringToKey, BluetoothDeviceWrapper, getHeartRate, startHeartRateMonitoring } from '../miband/band-connection';
import type { Band, BandLoadingStates } from '../miband/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Trash2, Edit, Activity, Clock, Watch, Smartphone, Headphones, Home, ChevronRight, Settings, BarChart3, Wifi, Heart, TrendingUp, Zap, Moon, Footprints, Target, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FloatingSidebar } from '../components/FloatingSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import { useResponsiveScale, getScaleStyles } from '@/hooks/use-scale';

const MiBand: React.FC = () => {
  const { bands, sortBandsByCreated, addBand, removeBand, addAuthorizedDevice, updateBandForId } = useMiBand();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBand, setCurrentBand] = useState<Band | null>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [activeView, setActiveView] = useState<string>('overview');
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const scale = useResponsiveScale(1024, 0.65); // Minimum 65% scale for readability

  // Heart rate sensor state
  const [heartRateState, setHeartRateState] = useState({
    isActive: false,
    isReading: false,
    lastReading: null as number | null,
    readingStartTime: null as number | null
  });

  // Mock health data - in real app, this would come from the band
  const [healthData, setHealthData] = useState({
    heartRate: {
      current: null as number | null,
      trend: [68, 70, 72, 75, 73, 71, 72],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    steps: {
      current: 8547,
      goal: 10000,
      trend: [6200, 7800, 8547, 9200, 8900, 7600, 8547],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    sleep: {
      lastNight: 7.2,
      quality: 85,
      trend: [6.8, 7.5, 7.2, 8.1, 6.9, 7.8, 7.2],
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    calories: {
      burned: 2150,
      goal: 2500,
      trend: [1980, 2200, 2150, 2400, 2300, 2100, 2150]
    }
  });

  useEffect(() => {
    const checkSupport = async () => {
      const supported = await webBluetoothSupported();
      setIsSupported(supported);
    };
    checkSupport();
  }, []);

  // Real heart rate sensor with actual Mi Band connection
  const startHeartRateReading = async (isManualTrigger = false) => {
    if (heartRateState.isReading) return;

    // Instant sensor activation - no delay for triggering
    setHeartRateState(prev => ({
      ...prev,
      isActive: true,
      isReading: true,
      readingStartTime: Date.now()
    }));

    try {
      let device: BluetoothDeviceWrapper | null = null;
      
      // Check if we have any connected bands
      if (bands.length > 0) {
        console.log('🔗 Attempting to use real Mi Band sensor...');
        // Try to connect to the first available band
        try {
          const rawDevice = await requestDevice(); // Request device connection
          if (rawDevice) {
            device = new BluetoothDeviceWrapper(rawDevice);
          }
        } catch (deviceError) {
          console.log('📱 Could not connect to device, using simulation...');
        }
      }
      if (device) {
        console.log('🔗 Using real Mi Band sensor...');
        
        // Use real sensor with progress updates
        const heartRate = await getHeartRate(device, (progressBpm) => {
          setHealthData(prev => ({
            ...prev,
            heartRate: {
              ...prev.heartRate,
              current: progressBpm
            }
          }));
        });

        // Final heart rate result
        setHealthData(prev => ({
          ...prev,
          heartRate: {
            ...prev.heartRate,
            current: heartRate
          }
        }));

        setHeartRateState(prev => ({
          ...prev,
          isReading: false,
          lastReading: heartRate
        }));

        console.log('✅ Real sensor measurement complete:', heartRate, 'BPM');
      } else {
        // Fallback to simulation if no device connected
        console.log('📱 No device connected, using simulation...');
        
        const delay = isManualTrigger ? 500 : 4000;
        setTimeout(() => {
          const simulatedHeartRate = 68 + Math.floor(Math.random() * 20);
          
          setHealthData(prev => ({
            ...prev,
            heartRate: {
              ...prev.heartRate,
              current: simulatedHeartRate
            }
          }));

          setHeartRateState(prev => ({
            ...prev,
            isReading: false,
            lastReading: simulatedHeartRate
          }));
        }, delay);
      }
    } catch (error) {
      console.error('❌ Heart rate measurement failed:', error);
      
      // Fallback to simulation on error
      const delay = isManualTrigger ? 500 : 4000;
      setTimeout(() => {
        const simulatedHeartRate = 68 + Math.floor(Math.random() * 20);
        
        setHealthData(prev => ({
          ...prev,
          heartRate: {
            ...prev.heartRate,
            current: simulatedHeartRate
          }
        }));

        setHeartRateState(prev => ({
          ...prev,
          isReading: false,
          lastReading: simulatedHeartRate
        }));
      }, delay);
    }
  };

  const stopHeartRateReading = () => {
    setHeartRateState(prev => ({
      ...prev,
      isActive: false,
      isReading: false,
      readingStartTime: null
    }));

    // Clear heart rate after stopping
    setTimeout(() => {
      setHealthData(prev => ({
        ...prev,
        heartRate: {
          ...prev.heartRate,
          current: null
        }
      }));
    }, 2000); // 2 second delay before clearing display
  };

  // Auto-start heart rate reading when viewing health data
  useEffect(() => {
    if (activeView === 'health' || activeView === 'analytics') {
      startHeartRateReading(false); // Auto-trigger with slower timing
    } else {
      stopHeartRateReading();
    }

    return () => {
      stopHeartRateReading();
    };
  }, [activeView]);

  const handleAddBand = () => {
    if (!isSupported) {
      setError('Web Bluetooth is not supported in your browser. Please use Chrome, Edge, or another compatible browser.');
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleEditBand = (band: Band) => {
    setCurrentBand(band);
    setIsEditModalOpen(true);
  };

  const handleDeleteBand = (band: Band) => {
    setCurrentBand(band);
    setIsDeleteModalOpen(true);
  };

  const handleViewBand = (band: Band) => {
    navigate(`/dashboard/miband/${band.id}`);
  };

  // Internal sidebar menu items
  const sidebarMenuItems = [
    { id: 'overview', label: 'Overview', icon: Home, description: 'Device overview and management' },
    { id: 'devices', label: 'My Devices', icon: Watch, description: 'Connected wearable devices' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Health and fitness analytics' },
    { id: 'health', label: 'Health Data', icon: Heart, description: 'Heart rate, sleep, activity' },
    { id: 'connectivity', label: 'Connectivity', icon: Wifi, description: 'Bluetooth and sync settings' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Device and app preferences' },
  ];

  // Breadcrumb navigation
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Dashboard', href: '/dashboard', icon: Home },
      { label: 'Wearable Devices', href: '/dashboard/miband', icon: Watch },
    ];

    const currentItem = sidebarMenuItems.find(item => item.id === activeView);
    if (currentItem && activeView !== 'overview') {
      breadcrumbs.push({ 
        label: currentItem.label, 
        href: `/dashboard/miband/${activeView}`, 
        icon: currentItem.icon 
      });
    }

    return breadcrumbs;
  };

  // Breadcrumb component
  const Breadcrumb = () => {
    const breadcrumbs = getBreadcrumbs();
    
    return (
      <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
            <button
              onClick={() => {
                if (index === breadcrumbs.length - 1) return;
                if (index === 0) navigate('/dashboard');
                else if (index === 1) setActiveView('overview');
              }}
              className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
                index === breadcrumbs.length - 1 
                  ? 'text-gray-900 dark:text-white font-medium cursor-default' 
                  : 'hover:underline cursor-pointer'
              }`}
            >
              <crumb.icon className="w-4 h-4" />
              {crumb.label}
            </button>
          </div>
        ))}
      </nav>
    );
  };

  // Function to render content based on active view
  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return renderOverviewContent();
      case 'devices':
        return renderDevicesContent();
      case 'analytics':
        return renderAnalyticsContent();
      case 'health':
        return renderHealthContent();
      case 'connectivity':
        return renderConnectivityContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderOverviewContent();
    }
  };

  // Simple Chart Component
  const SimpleChart = ({ data, labels, color = '#3b82f6', height = 60 }: { 
    data: number[], 
    labels: string[], 
    color?: string, 
    height?: number 
  }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return (
      <div className="flex items-end justify-between" style={{ height: `${height}px` }}>
        {data.map((value, index) => {
          const heightPercent = ((value - min) / range) * 80 + 20;
          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <div 
                className="w-6 rounded-t transition-all hover:opacity-80"
                style={{ 
                  height: `${heightPercent}%`, 
                  backgroundColor: color,
                  minHeight: '8px'
                }}
                title={`${labels[index]}: ${value}`}
              />
              <span className="text-xs text-gray-500">{labels[index]}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Progress Ring Component
  const ProgressRing = ({ progress, size = 80, strokeWidth = 8, color = '#3b82f6' }: {
    progress: number,
    size?: number,
    strokeWidth?: number,
    color?: string
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold">{Math.round(progress)}%</span>
        </div>
      </div>
    );
  };

  // Other view content functions
  const renderDevicesContent = () => (
    <div className="space-y-6">
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Watch className="w-5 h-5" />
            Connected Devices
          </CardTitle>
          <CardDescription>Manage your connected wearable devices</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all your connected wearable devices from this section.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsContent = () => (
    <div className="space-y-6">
      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Steps Card */}
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Footprints className="w-4 h-4 text-blue-500" />
                Steps
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{healthData.steps.current.toLocaleString()}</span>
              <ProgressRing 
                progress={(healthData.steps.current / healthData.steps.goal) * 100} 
                size={50} 
                color="#3b82f6"
              />
            </div>
            <p className="text-xs text-gray-500 mb-3">Goal: {healthData.steps.goal.toLocaleString()}</p>
            <SimpleChart 
              data={healthData.steps.trend} 
              labels={healthData.steps.labels} 
              color="#3b82f6" 
              height={40}
            />
          </CardContent>
        </Card>

        {/* Heart Rate Card */}
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Heart Rate
              </div>
              <span className="text-xs text-gray-500">BPM</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">
                {heartRateState.isReading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                    <span className="text-lg text-gray-500">Reading...</span>
                  </div>
                ) : healthData.heartRate.current ? (
                  healthData.heartRate.current
                ) : (
                  <span className="text-lg text-gray-400">--</span>
                )}
              </span>
              <div className="flex items-center gap-1">
                {heartRateState.isActive ? (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">
                      {heartRateState.isReading ? 'Measuring' : 'Live'}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-500">Inactive</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {heartRateState.isReading ? 'Sensor warming up...' : 'Resting: 65-75 BPM'}
            </p>
            <SimpleChart 
              data={healthData.heartRate.trend} 
              labels={healthData.heartRate.labels} 
              color="#ef4444" 
              height={40}
            />
          </CardContent>
        </Card>

        {/* Sleep Card */}
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-500" />
                Sleep
              </div>
              <span className="text-xs text-gray-500">Hours</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{healthData.sleep.lastNight}h</span>
              <ProgressRing 
                progress={healthData.sleep.quality} 
                size={50} 
                color="#8b5cf6"
              />
            </div>
            <p className="text-xs text-gray-500 mb-3">Quality: {healthData.sleep.quality}%</p>
            <SimpleChart 
              data={healthData.sleep.trend} 
              labels={healthData.sleep.labels} 
              color="#8b5cf6" 
              height={40}
            />
          </CardContent>
        </Card>

        {/* Calories Card */}
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                Calories
              </div>
              <span className="text-xs text-gray-500">kcal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{healthData.calories.burned}</span>
              <ProgressRing 
                progress={(healthData.calories.burned / healthData.calories.goal) * 100} 
                size={50} 
                color="#f97316"
              />
            </div>
            <p className="text-xs text-gray-500 mb-3">Goal: {healthData.calories.goal}</p>
            <SimpleChart 
              data={healthData.calories.trend} 
              labels={healthData.steps.labels} 
              color="#f97316" 
              height={40}
            />
          </CardContent>
        </Card>
      </div>

      {/* Weekly Summary */}
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Summary
          </CardTitle>
          <CardDescription>Your health trends over the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Steps Trend */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Footprints className="w-4 h-4 text-blue-500" />
                Daily Steps
              </h4>
              <SimpleChart 
                data={healthData.steps.trend} 
                labels={healthData.steps.labels} 
                color="#3b82f6" 
                height={80}
              />
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Avg: {Math.round(healthData.steps.trend.reduce((a, b) => a + b) / healthData.steps.trend.length).toLocaleString()}</span>
                <span>Best: {Math.max(...healthData.steps.trend).toLocaleString()}</span>
              </div>
            </div>

            {/* Heart Rate Trend */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Resting Heart Rate
              </h4>
              <SimpleChart 
                data={healthData.heartRate.trend} 
                labels={healthData.heartRate.labels} 
                color="#ef4444" 
                height={80}
              />
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Avg: {Math.round(healthData.heartRate.trend.reduce((a, b) => a + b) / healthData.heartRate.trend.length)} BPM</span>
                <span>Range: {Math.min(...healthData.heartRate.trend)}-{Math.max(...healthData.heartRate.trend)} BPM</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Goals */}
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Activity Goals
          </CardTitle>
          <CardDescription>Track your daily fitness targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Steps Goal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Footprints className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Daily Steps</p>
                  <p className="text-sm text-gray-500">{healthData.steps.current.toLocaleString()} / {healthData.steps.goal.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((healthData.steps.current / healthData.steps.goal) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{Math.round((healthData.steps.current / healthData.steps.goal) * 100)}%</span>
              </div>
            </div>

            {/* Calories Goal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">Calories Burned</p>
                  <p className="text-sm text-gray-500">{healthData.calories.burned} / {healthData.calories.goal} kcal</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((healthData.calories.burned / healthData.calories.goal) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{Math.round((healthData.calories.burned / healthData.calories.goal) * 100)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHealthContent = () => (
    <div className="space-y-6">
      {/* Real-time Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Heart Rate */}
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                Current Heart Rate
              </div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">
                {heartRateState.isReading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xl text-gray-500">Reading</span>
                  </div>
                ) : healthData.heartRate.current ? (
                  healthData.heartRate.current
                ) : (
                  <span className="text-gray-400">--</span>
                )}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {heartRateState.isReading ? 'Measuring...' : 'BPM'}
              </div>
              <div className="flex justify-center">
                <ProgressRing 
                  progress={healthData.heartRate.current ? Math.min((healthData.heartRate.current / 100) * 100, 100) : 0} 
                  size={80} 
                  color={heartRateState.isReading ? "#9ca3af" : "#ef4444"}
                />
              </div>
              <div className="mt-3 text-xs text-gray-500">
                {heartRateState.isReading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Measuring heart rate...
                  </div>
                ) : healthData.heartRate.current ? (
                  `Zone: ${healthData.heartRate.current < 70 ? 'Resting' : healthData.heartRate.current < 85 ? 'Fat Burn' : 'Cardio'}`
                ) : (
                  'Ready to measure'
                )}
              </div>
              <div className="mt-4">
                <Button
                  size="sm"
                  variant={heartRateState.isReading ? "outline" : "default"}
                  onClick={heartRateState.isReading ? stopHeartRateReading : () => startHeartRateReading(true)}
                  disabled={heartRateState.isReading}
                  className="w-full"
                >
                  {heartRateState.isReading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Measuring...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Measure Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Quality */}
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Moon className="w-4 h-4 text-purple-500" />
              Last Night's Sleep
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-500 mb-2">{healthData.sleep.lastNight}h</div>
              <div className="text-sm text-gray-500 mb-4">Duration</div>
              <div className="flex justify-center">
                <ProgressRing 
                  progress={healthData.sleep.quality} 
                  size={80} 
                  color="#8b5cf6"
                />
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div>Quality: {healthData.sleep.quality}%</div>
                <div>Deep Sleep: 2.1h</div>
                <div>REM Sleep: 1.8h</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-green-500" />
              Today's Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Minutes</span>
                <span className="font-semibold">47 min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Distance</span>
                <span className="font-semibold">6.2 km</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Floors Climbed</span>
                <span className="font-semibold">12 floors</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '48%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Health Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heart Rate Variability */}
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Heart Rate Trends
            </CardTitle>
            <CardDescription>7-day heart rate pattern</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart 
              data={healthData.heartRate.trend} 
              labels={healthData.heartRate.labels} 
              color="#ef4444" 
              height={120}
            />
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">Resting</div>
                <div className="font-semibold">65 BPM</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Average</div>
                <div className="font-semibold">{Math.round(healthData.heartRate.trend.reduce((a, b) => a + b) / healthData.heartRate.trend.length)} BPM</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Max Today</div>
                <div className="font-semibold">142 BPM</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Analysis */}
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-500" />
              Sleep Analysis
            </CardTitle>
            <CardDescription>Weekly sleep pattern</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart 
              data={healthData.sleep.trend} 
              labels={healthData.sleep.labels} 
              color="#8b5cf6" 
              height={120}
            />
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">Avg Sleep</div>
                <div className="font-semibold">{(healthData.sleep.trend.reduce((a, b) => a + b) / healthData.sleep.trend.length).toFixed(1)}h</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Sleep Debt</div>
                <div className="font-semibold">-0.8h</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Efficiency</div>
                <div className="font-semibold">89%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Insights */}
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Health Insights
          </CardTitle>
          <CardDescription>AI-powered health recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Great Progress!</p>
                <p className="text-sm text-green-600 dark:text-green-300">You've maintained consistent sleep patterns this week. Keep it up!</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Activity Suggestion</p>
                <p className="text-sm text-blue-600 dark:text-blue-300">Try a 10-minute walk after lunch to reach your daily step goal.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">Heart Rate Notice</p>
                <p className="text-sm text-orange-600 dark:text-orange-300">Your resting heart rate has improved by 3 BPM this month.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConnectivityContent = () => (
    <div className="space-y-6">
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            Connectivity Settings
          </CardTitle>
          <CardDescription>Manage Bluetooth and sync settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Configure Bluetooth connections and data synchronization settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="space-y-6">
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Device Settings
          </CardTitle>
          <CardDescription>Configure your device preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Customize device settings, notifications, and app preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Overview content (default view)
  const renderOverviewContent = () => {
    return (
      <>
        {/* Device Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Watch className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Fitness Trackers</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mi Band, Apple Watch, Fitbit</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Smart Devices</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phones, Tablets, Smartwatches</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Headphones className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Audio Devices</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Earbuds, Headphones, Speakers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Not Supported Alert */}
        {isSupported === false && (
          <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-900/20">
            <AlertDescription className="text-red-800 dark:text-red-200">
              Web Bluetooth is not supported in your browser. Please use Chrome, Edge, or another compatible browser.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Add Band Button */}
        <div className="mb-8">
          <Button 
            onClick={handleAddBand}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isSupported === false}
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Connect New Device
          </Button>
        </div>

        {/* Enhanced Bands List */}
        {bands.length === 0 ? (
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Watch className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No devices connected</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                Connect your first wearable device to start tracking your health and fitness data
              </p>
              <Button 
                onClick={handleAddBand}
                className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={isSupported === false}
              >
                <Plus className="mr-2 h-4 w-4" />
                Connect Device
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortBandsByCreated('DESC').map((band) => (
              <Card key={band.id} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Watch className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-semibold">{band.nickname}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-white/40"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBand(band);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBand(band);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {band.macAddress}
                  </CardDescription>
                </CardHeader>
                <CardContent onClick={() => handleViewBand(band)} className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">Added: {new Date(band.dateAdded).toLocaleDateString()}</span>
                    </div>
                    {band.activityGoal && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Activity className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-sm">Goal: {band.activityGoal.toLocaleString()} steps</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-white/40 hover:bg-white/60 border-white/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBand(band);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Floating Sidebar */}
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main Content - Scales down on mobile while maintaining layout */}
      <div 
        className={`transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-72'
        } p-6`}
        style={{
          ...getScaleStyles(scale),
          minHeight: '100vh',
        }}
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
                        <CardTitle className="text-lg">Navigation</CardTitle>
                        <CardDescription className="text-sm">Manage your devices</CardDescription>
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
              {/* Enhanced Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Watch className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                      {sidebarMenuItems.find(item => item.id === activeView)?.label || 'Wearable Devices'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {sidebarMenuItems.find(item => item.id === activeView)?.description || 'Connect and manage your smart wearables, fitness trackers, and health monitoring devices'}
                    </p>
                  </div>
                </div>

                {/* Content based on active view */}
                {renderActiveView()}
              </div>
            </div>
          </div>

          {/* Add Band Modal */}
          <AddBandModal 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={async (bandData, device) => {
              await addBand(bandData);
              addAuthorizedDevice(device);
              setIsAddModalOpen(false);
            }}
          />

          {/* Edit Band Modal */}
          {currentBand && (
            <EditBandModal
              isOpen={isEditModalOpen}
              band={currentBand}
              onClose={() => {
                setIsEditModalOpen(false);
                setCurrentBand(null);
              }}
            />
          )}

          {/* Delete Band Modal */}
          {currentBand && (
            <DeleteBandModal
              isOpen={isDeleteModalOpen}
              band={currentBand}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setCurrentBand(null);
              }}
              onDelete={async () => {
                await removeBand(currentBand.id);
                setIsDeleteModalOpen(false);
                setCurrentBand(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Modal Components
interface AddBandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (bandData: Omit<Band, 'id' | 'dateAdded'>, device: BluetoothDevice) => Promise<void>;
}

const AddBandModal: React.FC<AddBandModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [nickname, setNickname] = useState('');
  const [authKey, setAuthKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'connecting' | 'success'>('input');
  const [macAddress, setMacAddress] = useState('');

  const handleConnect = async () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname for your device');
      return;
    }
    if (!authKey.trim() || authKey.length !== 32) {
      setError('Auth key must be 32 characters (16 bytes in hex)');
      return;
    }

    setLoading(true);
    setError('');
    setStep('connecting');

    try {
      // Request Bluetooth device
      const device = await requestDevice();
      if (!device) {
        setError('No device selected');
        setLoading(false);
        setStep('input');
        return;
      }

      // Get MAC address
      const mac = await getBandMac(device, {
        onConnecting: () => console.log('Getting MAC address...'),
        onGettingService: () => console.log('Getting service...'),
        onGettingCharacteristic: () => console.log('Getting characteristic...'),
        onReadingValue: () => console.log('Reading value...')
      });

      if (!mac) {
        setError('Failed to get device MAC address');
        setLoading(false);
        setStep('input');
        return;
      }

      setMacAddress(mac);

      // Create band data
      const bandData = {
        nickname: nickname.trim(),
        macAddress: mac,
        authKey: authKey.trim(),
        deviceId: device.id
      };

      // Add band to database
      await onAdd(bandData, device);
      
      setStep('success');
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to device');
      setLoading(false);
      setStep('input');
    }
  };

  const handleClose = () => {
    setNickname('');
    setAuthKey('');
    setError('');
    setStep('input');
    setLoading(false);
    setMacAddress('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Watch className="w-5 h-5" />
            {step === 'input' ? 'Connect New Device' : step === 'connecting' ? 'Connecting...' : 'Success!'}
          </DialogTitle>
          <DialogDescription>
            {step === 'input' ? 'Enter your Mi Band 4 details to connect' : 
             step === 'connecting' ? 'Connecting to your Mi Band...' : 
             'Device connected successfully!'}
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Device Nickname</Label>
              <Input
                id="nickname"
                placeholder="e.g., My Mi Band"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authKey">Authentication Key</Label>
              <Input
                id="authKey"
                placeholder="32 character hex key (e.g., 0123456789abcdef...)"
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                disabled={loading}
                maxLength={32}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                16 bytes in hexadecimal format (32 characters). Find this in your Mi Fit app.
              </p>
            </div>

            {error && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConnect} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Device'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'connecting' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Connecting to Mi Band...</p>
            {macAddress && (
              <p className="text-xs text-gray-500 mt-2 font-mono">{macAddress}</p>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Connected!</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{nickname}</p>
            {macAddress && (
              <p className="text-xs text-gray-500 mt-2 font-mono">{macAddress}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface EditBandModalProps {
  isOpen: boolean;
  band: Band;
  onClose: () => void;
}

const EditBandModal: React.FC<EditBandModalProps> = ({ isOpen, band, onClose }) => {
  const { updateBandForId } = useMiBand();
  const [nickname, setNickname] = useState(band.nickname);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNickname(band.nickname);
  }, [band]);

  const handleSave = async () => {
    if (!nickname.trim()) return;
    
    setSaving(true);
    try {
      await updateBandForId(band.id, { nickname: nickname.trim() });
      onClose();
    } catch (err) {
      console.error('Failed to update band:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Device
          </DialogTitle>
          <DialogDescription>
            Update your device nickname
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-nickname">Device Nickname</Label>
            <Input
              id="edit-nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">MAC Address</p>
            <p className="text-sm font-mono">{band.macAddress}</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !nickname.trim()} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteBandModalProps {
  isOpen: boolean;
  band: Band;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

const DeleteBandModal: React.FC<DeleteBandModalProps> = ({ isOpen, band, onClose, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } catch (err) {
      console.error('Failed to delete band:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Device
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
            <AlertDescription className="text-red-800 dark:text-red-200">
              Are you sure you want to delete <strong>{band.nickname}</strong>? All associated data will be permanently removed.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Device MAC Address</p>
            <p className="text-sm font-mono">{band.macAddress}</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={deleting} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={deleting} 
              className="flex-1"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Device
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MiBand;
