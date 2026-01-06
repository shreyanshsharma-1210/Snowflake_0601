import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Band, Config } from './types';
import { addBand, updateBandForId, removeBand, getDb } from './local-db';

interface MiBandContextType {
  bands: Band[];
  authorizedDevices: BluetoothDevice[];
  config: Config;
  sortBandsByCreated: (direction?: "ASC" | "DESC") => Band[];
  addBand: (bandData: Omit<Band, 'id' | 'dateAdded'>) => Promise<void>;
  updateBandForId: (id: number, bandData: Partial<Band>) => Promise<void>;
  removeBand: (id: number) => Promise<void>;
  addAuthorizedDevice: (device: BluetoothDevice) => void;
  removeAuthorizedDevice: (deviceId: string) => Promise<void>;
  getAuthorizedDeviceById: (id: string) => Promise<BluetoothDevice | undefined>;
  updateConfig: (config: Partial<Config>) => Promise<void>;
}

const MiBandContext = createContext<MiBandContextType | undefined>(undefined);

export const useMiBand = () => {
  const context = useContext(MiBandContext);
  if (!context) {
    throw new Error('useMiBand must be used within a MiBandProvider');
  }
  return context;
};

interface MiBandProviderProps {
  children: ReactNode;
}

export const MiBandProvider: React.FC<MiBandProviderProps> = ({ children }) => {
  const [bands, setBands] = useState<Band[]>([]);
  const [authorizedDevices, setAuthorizedDevices] = useState<BluetoothDevice[]>([]);
  const [config, setConfig] = useState<Config>({ showBetaBanner: true });

  // Load initial data from IndexedDB
  useEffect(() => {
    const loadData = async () => {
      const db = await getDb();
      
      // Load bands
      const tx1 = db.transaction("bands", "readonly");
      const bandsStore = tx1.objectStore("bands");
      const loadedBands = await bandsStore.getAll();
      await tx1.done;
      setBands(loadedBands);

      // Load config
      const tx2 = db.transaction("config", "readonly");
      const configStore = tx2.objectStore("config");
      const keys = await configStore.getAllKeys();
      const rawConfig = await Promise.all(keys.map(async key => ({ key, value: await configStore.get(key) })));
      await tx2.done;
      const loadedConfig = rawConfig.reduce((acc, { key, value }) => ({ ...acc, [key.toString()]: value }), {}) as Partial<Config>;
      setConfig({ showBetaBanner: loadedConfig.showBetaBanner ?? true });

      db.close();
    };

    loadData();
  }, []);

  // Save config changes to IndexedDB
  useEffect(() => {
    const saveConfig = async () => {
      const db = await getDb();
      const tx = db.transaction("config", "readwrite");
      const configStore = tx.objectStore("config");
      await Promise.all(Object.entries(config)
        .map(([key, value]) => configStore.put(value, key as any)));
      await tx.done;
      db.close();
    };

    saveConfig();
  }, [config]);

  const sortBandsByCreated = (direction: "ASC" | "DESC" = "DESC") => {
    const bandDateMs = (band: Band) => Number(band.dateAdded);
    return [...bands].sort((a, b) => direction === "ASC" ? bandDateMs(a) - bandDateMs(b) : bandDateMs(b) - bandDateMs(a));
  };

  const handleAddBand = async (bandData: Omit<Band, 'id' | 'dateAdded'>) => {
    const newBand = await addBand(bandData);
    setBands([...bands, newBand]);
  };

  const handleUpdateBandForId = async (id: number, bandData: Partial<Band>) => {
    await updateBandForId(id, bandData);
    setBands(bands.map(b => b.id === id ? { ...b, ...bandData } : b));
  };

  const handleRemoveBand = async (id: number) => {
    await removeBand(id);
    setBands(bands.filter(b => b.id !== id));
  };

  const addAuthorizedDevice = (device: BluetoothDevice) => {
    if (authorizedDevices.find(({ id }) => id === device.id)) return;
    setAuthorizedDevices([...authorizedDevices, device]);
  };

  const removeAuthorizedDevice = async (deviceId: string) => {
    const device = await getAuthorizedDeviceById(deviceId);
    if (device) {
      if (device.gatt?.connected) device.gatt.disconnect();
      if ("forget" in device) await (device as any).forget();
    }
    setAuthorizedDevices(authorizedDevices.filter(({ id }) => id !== deviceId));
  };

  const getAuthorizedDeviceById = async (id: string) => {
    if ("getDevices" in navigator.bluetooth) {
      const devices = await (navigator.bluetooth as any).getDevices();
      return devices.find((d: BluetoothDevice) => d.id === id);
    }
    return authorizedDevices.find(b => b.id === id);
  };

  const updateConfig = async (newConfig: Partial<Config>) => {
    setConfig({ ...config, ...newConfig });
  };

  const value: MiBandContextType = {
    bands,
    authorizedDevices,
    config,
    sortBandsByCreated,
    addBand: handleAddBand,
    updateBandForId: handleUpdateBandForId,
    removeBand: handleRemoveBand,
    addAuthorizedDevice,
    removeAuthorizedDevice,
    getAuthorizedDeviceById,
    updateConfig,
  };

  return <MiBandContext.Provider value={value}>{children}</MiBandContext.Provider>;
};
