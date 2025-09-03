import ConnectedState from "@/components/print/bluetooth/ConnectedState";
import DisconnectedState from "@/components/print/bluetooth/DisconnectedState";
import { PeripheralServices } from "@/types/bluetooth";
import { handleAndroidPermissions } from "@/utils/permission";
import { usePrintingStore } from "@/utils/printing";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import ToastManager, { Toast } from "toastify-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
  Linking,
  TouchableOpacity,
  PermissionsAndroid,
} from "react-native";
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from "react-native-ble-manager";
import AccessControl from "@/components/AccessControl";

declare module "react-native-ble-manager" {
  interface Peripheral {
    connected?: boolean;
    connecting?: boolean;
  }
}

const SECONDS_TO_SCAN_FOR = 5;
const SERVICE_UUIDS: string[] = [];
const ALLOW_DUPLICATES = true;

const BluetoothDemoScreen: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [peripherals, setPeripherals] = useState(
    new Map<Peripheral["id"], Peripheral>()
  );
  const [isConnected, setIsConnected] = useState(false);
  const [bleService, setBleService] = useState<PeripheralServices | undefined>(
    undefined
  );

  const { togglePrinterConnection, setbleService } = usePrintingStore();

  useEffect(() => {
    BleManager.start({ showAlert: false })
      .then(() => console.debug("BleManager started."))
      .catch((error: any) =>
        console.error("BleManager could not be started.", error)
      );

    const listeners: any[] = [
      BleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
      BleManager.onStopScan(handleStopScan),
      BleManager.onConnectPeripheral(handleConnectPeripheral),
      BleManager.onDidUpdateValueForCharacteristic(
        handleUpdateValueForCharacteristic
      ),
      BleManager.onDisconnectPeripheral(handleDisconnectedPeripheral),
    ];

    handleAndroidPermissions();

    return () => {
      for (const listener of listeners) {
        listener.remove();
      }
    };
  }, []);

  const handleDisconnectedPeripheral = (
    event: BleDisconnectPeripheralEvent
  ) => {
    setPeripherals((map) => {
      let p = map.get(event.peripheral);
      if (p) {
        p.connected = false;
        return new Map(map.set(event.peripheral, p));
      }
      return map;
    });
    setIsConnected(false);
    togglePrinterConnection(false);
    setBleService(undefined);
    setbleService(undefined);
  };

  const handleConnectPeripheral = (event: any) => {
    console.debug(`[handleConnectPeripheral][${event.peripheral}] connected.`);
  };

  const handleUpdateValueForCharacteristic = async (
    data: BleManagerDidUpdateValueForCharacteristicEvent
  ) => {
    console.debug(
      `[handleUpdateValueForCharacteristic] received data from '${data.peripheral}' with characteristic='${data.characteristic}' and value='${data.value}'`
    );
  };

  const handleStopScan = () => {
    setIsScanning(false);
    console.debug("[handleStopScan] scan is stopped.");
  };

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    if (!peripheral.name) {
      peripheral.name = "NO NAME";
    }
    setPeripherals((map) => {
      return new Map(map.set(peripheral.id, peripheral));
    });
  };

  const connectPeripheral = async (
    peripheral: Omit<Peripheral, "advertising">
  ) => {
    try {
      console.log(`🔌 Connecting to ${peripheral.name || peripheral.id}`);
      await BleManager.connect(peripheral.id);
      setIsConnected(true);

      const peripheralData = await BleManager.retrieveServices(peripheral.id);
      console.log(
        "📡 Retrieved Services & Characteristics:",
        JSON.stringify(peripheralData.characteristics, null, 2)
      );

      if (peripheralData.characteristics) {
        // ✅ Prefer custom printer services (skip 1800/1801 generic)
        const writeChar = peripheralData.characteristics.find(
          (c) =>
            (c.properties.Write || c.properties.WriteWithoutResponse) &&
            !c.service.toLowerCase().includes("1800") &&
            !c.characteristic.toLowerCase().includes("2a00")
        );

        const notifyChar = peripheralData.characteristics.find(
          (c) => c.properties.Notify
        );

        if (!writeChar) {
          throw new Error("No valid writable characteristic found ❌");
        }

        // Save correct service/characteristic
        setBleService({
          peripheralId: peripheral.id,
          serviceId: writeChar.service,
          transfer: writeChar.characteristic,
          receive: notifyChar?.characteristic || "",
          name: peripheral.name,
        });

        setbleService({
          peripheralId: peripheral.id,
          serviceId: writeChar.service,
          transfer: writeChar.characteristic,
          receive: notifyChar?.characteristic || "",
          name: peripheral.name,
        });

        togglePrinterConnection(true);

        Toast.show({
          type: "success",
          text1: "Connected",
          text2: `Connected to ${peripheral.name || peripheral.id}`,
          visibilityTime: 1000,
          position: "top",
        });

        console.log("✅ Using service:", writeChar.service);
        console.log("✍️ Write characteristic:", writeChar.characteristic);

        if (notifyChar) {
          console.log("🔔 Notify characteristic:", notifyChar.characteristic);
          await BleManager.startNotification(
            peripheral.id,
            notifyChar.service,
            notifyChar.characteristic
          );
        }

        console.log(`✅ Connected to ${peripheral.name || peripheral.id}`);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No characteristics found on device.",
          visibilityTime: 1000,
          position: "top",
        });
      }
    } catch (error) {
      console.error("Connection error", error);
    }
  };

  const disconnectPeripheral = async (peripheralId: string) => {
    try {
      await BleManager.disconnect(peripheralId);
      setBleService(undefined);
      setbleService(undefined);
      setPeripherals(new Map());
      setIsConnected(false);
      togglePrinterConnection(false);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Failed to disconnect: ${error.message}`,
        visibilityTime: 1000,
        position: "top",
      });
    }
  };

  const startScan = async () => {
    const state = await BleManager.checkState();
    if (state !== "on") {
      try {
        await BleManager.enableBluetooth();
      } catch (err) {
        Alert.alert("Enable Bluetooth", "Please enable Bluetooth manually.");
        return;
      }
    }

    // Check location services
    let isLocationEnabled = false;
    try {
      isLocationEnabled = await Location.hasServicesEnabledAsync();
    } catch (err) {
      isLocationEnabled = false;
    }

    if (!isLocationEnabled) {
      Alert.alert(
        "Enable Location",
        "Please enable Location (GPS) in Settings to continue."
      );
      return;
    }

    if (!isScanning) {
      setPeripherals(new Map<Peripheral["id"], Peripheral>());
      try {
        setIsScanning(true);
        await BleManager.scan(
          SERVICE_UUIDS,
          SECONDS_TO_SCAN_FOR,
          ALLOW_DUPLICATES,
          {
            matchMode: BleScanMatchMode.Sticky,
            scanMode: BleScanMode.LowLatency,
            callbackType: BleScanCallbackType.AllMatches,
          }
        );
      } catch (error: any) {
        setIsScanning(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to start scan.",
          visibilityTime: 1000,
          position: "top",
        });
      }
    }
  };

  const write = async () => {
    if (!bleService) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No Bluetooth service available. Please connect to a device.",
        visibilityTime: 1000,
        position: "top",
      });
      return;
    }

    try {
      const ESC = 0x1b;
      const LF = 0x0a;
      const INIT = [ESC, 0x40];
      const CENTER = [ESC, 0x61, 0x01];
      const BOLD_ON = [ESC, 0x45, 0x01];
      const BOLD_OFF = [ESC, 0x45, 0x00];
      const TITLE = Array.from(
        new TextEncoder().encode("Corpwings Parking App\n")
      );
      const LINE = Array.from(
        new TextEncoder().encode("--------------------\n")
      );
      const ITEM = Array.from(new TextEncoder().encode("Item: sample\n"));
      const PRICE = Array.from(new TextEncoder().encode("Price: $10.00\n"));
      const TIMESTAMP = Array.from(
        new TextEncoder().encode(`Date: ${new Date().toLocaleString()}\n`)
      );
      const LINE_FEED = [LF, LF];

      const data = [
        ...INIT,
        ...CENTER,
        ...BOLD_ON,
        ...TITLE,
        ...BOLD_OFF,
        ...LINE,
        ...ITEM,
        ...PRICE,
        ...LINE,
        ...TIMESTAMP,
        ...LINE_FEED,
      ];

      // ✅ Prefer writeWithoutResponse for printers
      await BleManager.writeWithoutResponse(
        bleService.peripheralId,
        bleService.serviceId,
        bleService.transfer,
        data,
        20
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Print command sent to printer.",
        visibilityTime: 1000,
        position: "top",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Failed to send print command: ${error.message}`,
        visibilityTime: 1000,
        position: "top",
      });
    }
  };

  return (
    <AccessControl required="printerSettings">
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Printer Settings</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>
        {!isConnected ? (
          <DisconnectedState
            peripherals={Array.from(peripherals.values())}
            isScanning={isScanning}
            onScanPress={startScan}
            onConnect={connectPeripheral}
          />
        ) : (
          bleService && (
            <ConnectedState
              onWrite={write}
              bleService={bleService}
              onDisconnect={disconnectPeripheral}
            />
          )
        )}
        <ToastManager showCloseIcon={false} />
      </View>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
  },
  headerBox: {
    marginBottom: 16,
    backgroundColor: "#f6f6f6",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#000",
    flex: 1,
  },
  headerSpacer: {
    width: 24,
  },
});

export default BluetoothDemoScreen;
