import React, { useState, useEffect } from 'react';
import { webBluetoothSupported } from '../miband/band-connection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

/**
 * Test page to verify Mi Band integration
 * Navigate to /dashboard/miband-test to run diagnostics
 */
const MiBandTest: React.FC = () => {
  const [tests, setTests] = useState<{ name: string; status: 'pending' | 'pass' | 'fail'; message?: string }[]>([
    { name: 'Web Bluetooth API Support', status: 'pending' },
    { name: 'MiBandContext Available', status: 'pending' },
    { name: 'Band Connection Module', status: 'pending' },
    { name: 'Local DB Module', status: 'pending' },
    { name: 'Types Module', status: 'pending' },
    { name: 'Utils Module', status: 'pending' },
  ]);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results = [...tests];

    // Test 1: Web Bluetooth API
    try {
      const supported = await webBluetoothSupported();
      results[0] = {
        name: 'Web Bluetooth API Support',
        status: supported ? 'pass' : 'fail',
        message: supported ? 'Web Bluetooth is supported' : 'Web Bluetooth is not supported in this browser'
      };
    } catch (err) {
      results[0] = {
        name: 'Web Bluetooth API Support',
        status: 'fail',
        message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }

    // Test 2: MiBandContext
    try {
      const { useMiBand } = await import('../miband/MiBandContext');
      results[1] = {
        name: 'MiBandContext Available',
        status: 'pass',
        message: 'Context module loaded successfully'
      };
    } catch (err) {
      results[1] = {
        name: 'MiBandContext Available',
        status: 'fail',
        message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }

    // Test 3: Band Connection Module
    try {
      const bandConnection = await import('../miband/band-connection');
      const hasRequiredFunctions = 
        typeof bandConnection.authenticate === 'function' &&
        typeof bandConnection.getBatteryLevel === 'function' &&
        typeof bandConnection.getCurrentStatus === 'function';
      
      results[2] = {
        name: 'Band Connection Module',
        status: hasRequiredFunctions ? 'pass' : 'fail',
        message: hasRequiredFunctions ? 'All connection functions available' : 'Missing required functions'
      };
    } catch (err) {
      results[2] = {
        name: 'Band Connection Module',
        status: 'fail',
        message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }

    // Test 4: Local DB Module
    try {
      const localDb = await import('../miband/local-db');
      const hasRequiredFunctions = 
        typeof localDb.getDb === 'function' &&
        typeof localDb.addBand === 'function' &&
        typeof localDb.removeBand === 'function';
      
      results[3] = {
        name: 'Local DB Module',
        status: hasRequiredFunctions ? 'pass' : 'fail',
        message: hasRequiredFunctions ? 'All DB functions available' : 'Missing required functions'
      };
    } catch (err) {
      results[3] = {
        name: 'Local DB Module',
        status: 'fail',
        message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }

    // Test 5: Types Module
    try {
      const types = await import('../miband/types');
      results[4] = {
        name: 'Types Module',
        status: 'pass',
        message: 'Types module loaded successfully'
      };
    } catch (err) {
      results[4] = {
        name: 'Types Module',
        status: 'fail',
        message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }

    // Test 6: Utils Module
    try {
      const utils = await import('../miband/utils');
      const hasRequiredFunctions = 
        typeof utils.getRepetitionDescriptiveText === 'function' &&
        typeof utils.enumKeys === 'function';
      
      results[5] = {
        name: 'Utils Module',
        status: hasRequiredFunctions ? 'pass' : 'fail',
        message: hasRequiredFunctions ? 'All utility functions available' : 'Missing required functions'
      };
    } catch (err) {
      results[5] = {
        name: 'Utils Module',
        status: 'fail',
        message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      };
    }

    setTests(results);
  };

  const allPassed = tests.every(t => t.status === 'pass');
  const anyFailed = tests.some(t => t.status === 'fail');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Mi Band Integration Test</h1>
          <p className="text-gray-600 dark:text-gray-400">Diagnostic tests for Mi Band 4 integration</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {allPassed && <CheckCircle2 className="h-6 w-6 text-green-500" />}
              {anyFailed && <XCircle className="h-6 w-6 text-red-500" />}
              {!allPassed && !anyFailed && <AlertCircle className="h-6 w-6 text-yellow-500" />}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="mt-1">
                    {test.status === 'pass' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {test.status === 'fail' && <XCircle className="h-5 w-5 text-red-500" />}
                    {test.status === 'pending' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{test.name}</div>
                    {test.message && (
                      <div className={`text-sm mt-1 ${
                        test.status === 'pass' ? 'text-green-600 dark:text-green-400' :
                        test.status === 'fail' ? 'text-red-600 dark:text-red-400' :
                        'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {test.message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <Button onClick={runTests} className="w-full">
                Run Tests Again
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {allPassed ? (
                <>
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    ✅ All tests passed! The Mi Band integration is working correctly.
                  </p>
                  <div className="space-y-2 mt-4">
                    <p className="font-medium">You can now:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                      <li>Navigate to <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">/dashboard/miband</code> to manage your bands</li>
                      <li>Add a Mi Band 4 device using the "Add Band" button</li>
                      <li>Connect to your band and view real-time data</li>
                      <li>Configure activity goals and settings</li>
                    </ul>
                  </div>
                </>
              ) : anyFailed ? (
                <>
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    ❌ Some tests failed. Please check the error messages above.
                  </p>
                  <div className="space-y-2 mt-4">
                    <p className="font-medium">Common issues:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                      <li>Web Bluetooth not supported: Use Chrome or Edge browser</li>
                      <li>Module loading errors: Run <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm install</code></li>
                      <li>TypeScript errors: These are expected in the IDE but won't affect runtime</li>
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-yellow-600 dark:text-yellow-400">
                  ⏳ Tests are running...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MiBandTest;
