import { create } from "zustand";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
import BleManager from "react-native-ble-manager";
import { Toast } from "toastify-react-native";

interface PrintingState {
  isPrinterConnected: boolean;
  setbleService: (service: any) => void;
  BleService: any;
  togglePrinterConnection: (status: boolean) => void;
  generateReceiptData: (values: {
    title: string;
    qrCodeData: string;
    items: any;
  }) => Promise<any[]>;
}

export const usePrintingStore = create<PrintingState>((set, get) => ({
  isPrinterConnected: false,
  BleService: {},
  setbleService: (service) =>
    set(() => ({
      BleService: service,
    })),
  togglePrinterConnection: (status: boolean) =>
    set(() => ({ isPrinterConnected: status })),
  generateReceiptData: async (values) => {
    const bleService = get().BleService;

    if (!get().isPrinterConnected || !bleService) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No Bluetooth printer connected.",
        visibilityTime: 1000,
        position: "top",
      });
      return [];
    }

    try {
      const ESC = 0x1b; // Escape character
      const LF = 0x0a; // Line feed
      const GS = 0x1d; // Group separator

      // Printer commands
      const INIT = [ESC, 0x40]; // ESC @ - Initialize printer
      const CENTER = [ESC, 0x61, 0x01];
      const LEFT = [ESC, 0x61, 0x00];
      const BOLD_ON = [ESC, 0x45, 0x01];
      const BOLD_OFF = [ESC, 0x45, 0x00];

      // QR setup
      const QR_MODEL = [GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00];
      const QR_SIZE = [GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x06];
      const QR_ERROR_LEVEL = [GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31];
      const QR_PRINT = [GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30];

      // Receipt content
      const TITLE = Array.from(new TextEncoder().encode(`${values.title}\n`));
      const LINE = Array.from(
        new TextEncoder().encode("--------------------\n")
      );
      const ITEM = values.items
        .map((item: any) =>
          Array.from(
            new TextEncoder().encode(`${item.label} - ${item.value}\n`)
          )
        )
        .flat();
      const TIMESTAMP = Array.from(
        new TextEncoder().encode(`Date: ${new Date().toLocaleString()}\n`)
      );
      const LINE_FEED = [LF, LF];

      // QR Data
      const QR_DATA = Array.from(new TextEncoder().encode(values.qrCodeData));
      const QR_STORE = [
        GS,
        0x28,
        0x6b,
        ...[(QR_DATA.length + 3) % 256, (QR_DATA.length + 3) >> 8],
        0x31,
        0x50,
        0x30,
        ...QR_DATA,
      ];

      // Full receipt packet
      const data = [
        ...INIT,
        ...CENTER,
        ...BOLD_ON,
        ...TITLE,
        ...BOLD_OFF,
        ...LINE,
        ...ITEM,
        ...QR_MODEL,
        ...QR_SIZE,
        ...QR_ERROR_LEVEL,
        ...QR_STORE,
        ...QR_PRINT,
        ...LINE,
        ...TIMESTAMP,
        ...LINE_FEED,
      ];

      // 🔑 Make sure we use the correct write characteristic
      await BleManager.writeWithoutResponse(
        bleService.peripheralId,
        bleService.serviceId,
        bleService.transfer,
        data,
        20 // chunk size for safety
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Receipt sent to printer.",
        visibilityTime: 1000,
        position: "top",
      });

      return ["success"];
    } catch (error) {
      console.error("Error generating receipt data:", error);
      Toast.show({
        type: "error",
        text1: "Print Failed",
        text2: "Could not send data to printer.",
        visibilityTime: 1000,
        position: "top",
      });
      return [];
    }
  },
}));
