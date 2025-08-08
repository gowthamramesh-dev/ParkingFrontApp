import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const URL = "https://parkingservers.vercel.app/";
// const URL = "https://q8dcnx0t-5000.inc1.devtunnels.ms/";

interface StaffPerformance {
  username: string;
  checkIns: number;
  checkOuts: number;
  revenue: number;
}

interface TransactionLog {
  id: string;
  type: "checkin" | "checkout";
  vehicleType: string;
  timestamp: string;
  staff: string;
  amount: number;
  paymentMethod: string | null;
}

interface VehicleData {
  checkins: { [key: string]: number };
  checkouts: { [key: string]: number };
  allData: { [key: string]: number };
  fullData: any[];
  PaymentMethod: { [key: string]: number };
  VehicleTotalMoney: { [key: string]: number };
  staffData: StaffPerformance[];
  transactionLogs: TransactionLog[];
}

interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  staff?: T;
}

interface VehicleReport {
  name: string;
  numberPlate: string;
  vehicleType: string;
  amount: string;
  createdBy: string;
}

interface MonthlyPass {
  _id: string;
  name: string;
  vehicleNo: string;
  mobile: string;
  startDate: string;
  endDate: string;
  amount: number;
  duration: number;
  vehicleType: string;
  paymentMode: string;
  isExpired: boolean;
}

interface FormData {
  name: string;
  vehicleNo: string;
  mobile: string;
  vehicleType: string;
  duration: string;
  startDate: string;
  endDate: string;
  paymentMethod: string;
  amount?: number;
  transactionId?: string;
}

interface Staff {
  _id: string;
  username: string;
  buildingId?: {
    name: string;
  };
}

interface Report {
  role: string;
  totalVehicles: number;
  revenue: number;
  vehicles: {
    type: string;
    count: number;
    amount: number;
  }[];
}

type VehicleType = "cycle" | "bike" | "car" | "van" | "lorry" | "bus";

type PriceForm = {
  [key in VehicleType]: {
    daily: string;
    monthly: string;
  };
};

interface UserAuthState extends Partial<VehicleData> {
  user: any;
  token: string | null;
  prices: Partial<PriceForm>;
  priceData?: {
    dailyPrices?: { [key in VehicleType]?: string };
    monthlyPrices?: { [key in VehicleType]?: string };
  };
  VehicleListData: any[];
  Reciept: object;
  isLoading: boolean;
  isLogged: boolean;
  staffs: Staff[];
  staffPermission: string[];
  role: string;
  permissions: string[];
  report: Report | null;
  monthlyPassActive: MonthlyPass[] | null;
  monthlyPassExpired: MonthlyPass[] | null;
  hydrated: boolean;
  isHydrated: boolean;
  revenueData: Report | null;

  fetchRevenueReport: (staffId?: string) => Promise<void>;
  fetchCheckins: (vehicle: string, staffId?: string) => Promise<void>;
  fetchCheckouts: (vehicle: string, staffId?: string) => Promise<void>;
  vehicleList: (
    vehicle: string,
    checkType: string,
    staffId?: string
  ) => Promise<{ success: boolean; error?: any }>;
  signup: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: any }>;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: any }>;
  logOut: () => Promise<void>;
  fetchPrices: (adminId: string, token: string) => Promise<void>;
  updateDailyPrices: (
    adminId: string,
    dailyPrices: any,
    token: string
  ) => Promise<string>;
  updateMonthlyPrices: (
    adminId: string,
    monthlyPrices: any,
    token: string
  ) => Promise<string>;
  loadPricesIfNotSet: () => Promise<void>;
  getTodayVehicles: () => Promise<void>;
  getDashboardData: () => Promise<void>;
  checkIn: (
    name: string,
    vehicleNo: string,
    vehicleType: string,
    mobile: string,
    paymentMethod: string,
    days: string,
    amount: number
  ) => Promise<{ success: boolean; error?: any }>;
  checkOut: (
    tokenId: string,
    isExpired: boolean
  ) => Promise<{ success: boolean; error?: any }>;
  getAllStaffs: () => Promise<{
    success: boolean;
    staffs?: Staff[];
    error?: any;
  }>;
  getStaffTodayVehicles: () => Promise<void>;
  getStaffTodayRevenue: () => Promise<void>;
  updateProfile: (
    id: string,
    username: string,
    newPassword?: string,
    avatar?: string,
    oldPassword?: string
  ) => Promise<{ success: boolean; error?: any }>;
  createStaff: (
    username: string,
    password: string,
    building: { name: string; location: string }
  ) => Promise<{ success: boolean; staff?: any; error?: any }>;
  updateStaff: (staffId: string, updates: any) => Promise<ApiResponse>;
  deleteStaff: (
    staffId: string
  ) => Promise<{ success: boolean; error?: string }>;
  createMonthlyPass: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string; data?: any }>;
  getMonthlyPass: (
    status: "active" | "expired"
  ) => Promise<{ success: boolean; error?: string; data?: any }>;
  extendMonthlyPass: (
    passId: string,
    months: number
  ) => Promise<{ success: boolean; error?: string; data?: any }>;
  restoreSession: () => Promise<void>;
  setStaffPermission: (
    staffId: string,
    permissions: string[]
  ) => Promise<{
    success: boolean;
    error?: string;
    data?: any;
  }>;
  getStaffPermission: (staffId: string) => Promise<void>;
  hydrate: () => Promise<void>;
  selectedStaffRevenue: any[];
  totalRevenue: number;
  totalVehicles: number;
}

const userAuthStore = create<UserAuthState>((set, get) => ({
  user: null,
  token: null,
  prices: {},
  priceData: {},
  isLoading: false,
  isLogged: false,
  VehicleListData: [],
  Reciept: {},
  staffs: [],
  permissions: [],
  checkins: {},
  checkouts: {},
  allData: {},
  VehicleTotalMoney: {},
  PaymentMethod: {},
  staffData: [],
  transactionLogs: [],
  report: null,
  monthlyPassActive: null,
  monthlyPassExpired: null,
  hydrated: false,
  revenueData: null,
  selectedStaffRevenue: [],
  totalRevenue: 0,
  totalVehicles: 0,
  staffPermission: [],
  role: "",
  isHydrated: false,

  hydrate: async () => {
    try {
      const role = await AsyncStorage.getItem("role");
      const staffPermission = await AsyncStorage.getItem("staffPermission");

      set({
        role: role || "",
        staffPermission: staffPermission ? JSON.parse(staffPermission) : [],
        isHydrated: true,
      });
    } catch (err) {
      console.error("❌ Error hydrating store:", err);
      set({ isHydrated: true });
    }
  },

  restoreSession: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");
      const role = await AsyncStorage.getItem("role");
      const staffPermission = await AsyncStorage.getItem("staffPermission");
      const storedPrices = await AsyncStorage.getItem("prices");

      if (token && user) {
        const decoded = jwtDecode(token);
        const exp = decoded?.exp;

        if (exp && exp * 1000 > Date.now()) {
          const parsedUser = JSON.parse(user);
          set({
            token,
            user: parsedUser,
            role: role || "",
            staffPermission: staffPermission ? JSON.parse(staffPermission) : [],
            prices: storedPrices ? JSON.parse(storedPrices) : {}, // Load prices from AsyncStorage
            isLogged: true,
          });

          // Fetch fresh permissions for staff users
          if (parsedUser.role === "staff") {
            await get().getStaffPermission(parsedUser.id);
          }

          // Fetch price data from server
          await get().fetchPrices(parsedUser.id, token);
        } else {
          await get().logOut();
        }
      }
    } catch (err) {
      console.error("❌ Error restoring session:", err);
    } finally {
      set({ hydrated: true, isHydrated: true });
    }
  },

  loadPricesIfNotSet: async () => {
    const currentPrices = get().prices;
    if (!currentPrices || Object.keys(currentPrices).length === 0) {
      const storedPrices = await AsyncStorage.getItem("prices");
      if (storedPrices) {
        set({ prices: JSON.parse(storedPrices) });
      }
    }
  },

  signup: async (username, email, password) => {
    try {
      set({ isLoading: true });
      const res = await fetch(`${URL}api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      set({ isLoading: false });
      return { success: true };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.message };
    }
  },

  login: async (username, password) => {
    try {
      set({ isLoading: true });

      const res = await fetch(`${URL}api/loginUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      await get().fetchPrices(data.user.id, data.token);

      if (data.user.role === "staff") {
        await get().getStaffPermission(data.user.id);
        const permissions = get().permissions;
        set({ staffPermission: permissions, role: data.user.role });

        try {
          await AsyncStorage.setItem(
            "staffPermission",
            JSON.stringify(permissions)
          );
          await AsyncStorage.setItem("role", data.user.role);
          await AsyncStorage.getItem("staffPermission");
        } catch (err) {
          console.error(
            "Error saving permissions or role to AsyncStorage:",
            err
          );
        }
      } else {
        set({ staffPermission: [], role: data.user.role });
        try {
          await AsyncStorage.setItem("role", data.user.role);
          await AsyncStorage.setItem("staffPermission", JSON.stringify([]));
        } catch (err) {
          console.error("Error saving role or permissions for non-staff:", err);
        }
        await get().getDashboardData();
      }

      set({
        user: data.user,
        token: data.token,
        isLoading: false,
        isLogged: true,
      });

      return { success: true };
    } catch (err: any) {
      console.error("Login failed:", err.message);
      set({ isLoading: false });
      return { success: false, error: err.message };
    }
  },

  logOut: async () => {
    await AsyncStorage.multiRemove(["user", "token", "prices"]);
    await AsyncStorage.clear();
    set({
      user: null,
      token: null,
      prices: {},
      priceData: {},
      isLoading: false,
      isLogged: false,
      VehicleListData: [],
      Reciept: {},
      staffs: [],
      permissions: [],
      checkins: {},
      checkouts: {},
      allData: {},
      VehicleTotalMoney: {},
      PaymentMethod: {},
      staffData: [],
      transactionLogs: [],
      report: null,
      monthlyPassActive: null,
      monthlyPassExpired: null,
      hydrated: false,
      revenueData: null,
      selectedStaffRevenue: [],
      totalRevenue: 0,
      totalVehicles: 0,
      staffPermission: [],
      role: "",
      isHydrated: false,
    });
  },

  fetchPrices: async (adminId, token) => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${URL}api/getPrices/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      set({ priceData: res.data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false });
    }
  },

  updateDailyPrices: async (adminId, dailyPrices, token) => {
    try {
      const res = await axios.post(
        `${URL}api/updatePrice/daily`,
        { adminId, dailyPrices },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      set((state) => ({
        priceData: {
          ...state.priceData,
          dailyPrices: res.data.data.dailyPrices,
        },
      }));
      return res.data.message;
    } catch (err: any) {
      throw err.response?.data?.message || "Failed to update daily prices";
    }
  },

  updateMonthlyPrices: async (adminId, monthlyPrices, token) => {
    try {
      const res = await axios.post(
        `${URL}api/updatePrice/monthly`,
        { adminId, monthlyPrices },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      set((state) => ({
        priceData: {
          ...state.priceData,
          monthlyPrices: res.data.data.monthlyPrices,
        },
      }));
      return res.data.message;
    } catch (err: any) {
      throw err.response?.data?.message || "Failed to update monthly prices";
    }
  },

  fetchCheckins: async (vehicle = "all", staffId = "") => {
    try {
      set({ isLoading: true });
      const token = get().token || (await AsyncStorage.getItem("token"));

      const query = `vehicle=${vehicle}${staffId ? `&staffId=${staffId}` : ""}`;

      const res = await axios.get(`${URL}api/checkins?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ checkins: res.data.vehicle });
    } catch (error) {
      set({ checkins: {} });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCheckouts: async (vehicle = "all", staffId = "") => {
    try {
      set({ isLoading: true });
      const token = get().token || (await AsyncStorage.getItem("token"));

      const query = `vehicle=${vehicle}${staffId ? `&staffId=${staffId}` : ""}`;

      const res = await axios.get(`${URL}api/checkouts?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ checkouts: res.data.vehicle });
    } catch (error) {
      set({ checkouts: {} });
    } finally {
      set({ isLoading: false });
    }
  },

  vehicleList: async (vehicle: string, checkType: string, staffId) => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem("token");

      let url = `${URL}api/${checkType}`;
      const query = `vehicle=${vehicle}${staffId ? `&staffId=${staffId}` : ""}`;
      url += `?${query}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Something went wrong!");

      set({ VehicleListData: data.vehicle || data.vehicles });
      return { success: true };
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  checkIn: async (
    name,
    vehicleNo,
    vehicleType,
    mobile,
    paymentMethod,
    days,
    amount
  ) => {
    try {
      set({ isLoading: true });

      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${URL}api/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          vehicleNo,
          vehicleType,
          mobile,
          paymentMethod,
          days,
          amount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return { success: true, tokenId: data.tokenId };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      set({ isLoading: false });
    }
  },

  checkOut: async (tokenId, isExpired) => {
    try {
      set({ isLoading: true });

      const token = await AsyncStorage.getItem("token");
      let res;
      if (isExpired) {
        res = await fetch(`${URL}api/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tokenId, previewOnly: isExpired }),
        });
      } else {
        res = await fetch(`${URL}api/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tokenId }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Checkout failed");
      }
      if (isExpired) {
        return { success: true, data: data.data };
      }

      return {
        success: true,
        receipt: data.receipt,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Something went wrong",
      };
    } finally {
      set({ isLoading: false });
    }
  },

  getAllStaffs: async () => {
    try {
      set({ isLoading: true });

      const token = get().token || (await AsyncStorage.getItem("token"));

      const res = await fetch(`${URL}api/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      set({ staffs: data.staffs });

      return { success: true, staffs: data.staffs };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      set({ isLoading: false });
    }
  },

  getStaffTodayVehicles: async () => {
    try {
      const token = get().token || (await AsyncStorage.getItem("token"));
      const res = await fetch(`${URL}api/today-checkins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      console.log("Today's Vehicles:", data.vehicles);
    } catch (err: any) {
      console.log("Error:", err.message);
    }
  },

  getStaffTodayRevenue: async () => {
    try {
      const token = get().token || (await AsyncStorage.getItem("token"));
      const res = await fetch(`${URL}api/today-revenue`, {
        headers: { Authorization: `Bearer ${token} ` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      console.log("Today's revenue:", data.revenue);
    } catch (err: any) {
      console.log("Error:", err.message);
    }
  },

  getTodayVehicles: async () => {
    try {
      const token = get().token || (await AsyncStorage.getItem("token"));
      const res = await fetch(`${URL}api/getTodayVehicle`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Fetch error");
      set({
        checkins: data.checkinsCount,
        checkouts: data.checkoutsCount,
        allData: data.allDataCount,
        VehicleTotalMoney: data.money,
        PaymentMethod: data.PaymentMethod,
        fullData: data.fullData,
      });
    } catch (err: any) {
      console.error("Today vehicle error:", err.message);
    }
  },

  getDashboardData: async () => {
    try {
      set({ isLoading: true });
      const token = get().token || (await AsyncStorage.getItem("token"));
      if (!token) throw new Error("No token found");

      const res = await axios.get(`${URL}api/getDashboardData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { data } = res.data;
      set({
        checkins: data.checkins || {},
        checkouts: data.checkouts || {},
        allData: data.allData || {},
        VehicleTotalMoney: data.VehicleTotalMoney || {},
        PaymentMethod: data.PaymentMethod || {},
        staffData: data.staffData || [],
        transactionLogs: data.transactionLogs || [],
      });
    } catch (err: any) {
      console.error("Dashboard data error:", err.message);
      set({
        checkins: {},
        checkouts: {},
        allData: {},
        VehicleTotalMoney: {},
        PaymentMethod: {},
        staffData: [],
        transactionLogs: [],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (id, username, newPassword, avatar, oldPassword) => {
    try {
      const token = get().token || (await AsyncStorage.getItem("token"));
      const updateBody: any = { username, oldPassword };
      if (newPassword) updateBody.password = newPassword;
      if (avatar) updateBody.profileImage = avatar;
      const res = await fetch(`${URL}api/updateAdmin/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateBody),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await AsyncStorage.setItem("user", JSON.stringify(data.admin));
      set({ user: data.admin });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  createStaff: async (username, password, building) => {
    try {
      const token = get().token || (await AsyncStorage.getItem("token"));
      const admin =
        get().user || JSON.parse((await AsyncStorage.getItem("user")) || "{}");
      const adminId = admin?.id;
      if (!adminId) throw new Error("Admin ID not found");

      const res = await fetch(`${URL}api/create/${adminId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          password,
          building,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return { success: true, staff: data.staff };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  fetchRevenueReport: async (staffId) => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${URL}api/getRevenueReport?staffId=${staffId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch revenue");

      set({
        selectedStaffRevenue: data.vehicles,
        totalRevenue: data.revenue,
        totalVehicles: data.totalVehicles,
        isLoading: false,
      });
    } catch (err) {
      console.error("Error fetching revenue:", err);
      set({ isLoading: false });
    }
  },

  updateStaff: async (staffId, updates) => {
    try {
      const token = get().token || (await AsyncStorage.getItem("token"));

      const res = await fetch(`${URL}api/update/${staffId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      set((state) => ({
        staffs: state.staffs.map((staff) =>
          staff._id === staffId ? { ...staff, ...data.staff } : staff
        ),
      }));

      return { success: true, staff: data.staff };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  deleteStaff: async (staffId) => {
    try {
      const token = get().token || (await AsyncStorage.getItem("token"));
      const res = await fetch(`${URL}api/delete/${staffId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  createMonthlyPass: async (formData) => {
    if (
      !formData.name ||
      !formData.vehicleNo ||
      !formData.mobile ||
      !formData.vehicleType ||
      !formData.duration ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.paymentMethod
    ) {
      return { success: false, error: "All required fields must be provided" };
    }

    try {
      set({ isLoading: true });
      const token = get().token || (await AsyncStorage.getItem("token"));
      if (!token) throw new Error("No token found");

      const res = await fetch(`${URL}api/createMonthlyPass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          vehicleNo: formData.vehicleNo.toUpperCase().replace(/\s/g, ""),
          mobile: formData.mobile,
          vehicleType: formData.vehicleType.toLowerCase(),
          startDate: formData.startDate,
          duration: Number(formData.duration),
          endDate: formData.endDate,
          amount: formData.amount,
          paymentMode: formData.paymentMethod || "cash",
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to create monthly pass");

      set({ isLoading: false });
      return { success: true, data: { pass: data.pass, qrCode: data.qrCode } };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.message };
    }
  },

  getMonthlyPass: async (status) => {
    if (!["active", "expired"].includes(status)) {
      return { success: false, error: "Status must be 'active' or 'expired'" };
    }

    try {
      set({ isLoading: true });
      const token = get().token || (await AsyncStorage.getItem("token"));
      if (!token) throw new Error("No token found");

      const res = await fetch(`${URL}api/getMontlyPass/${status}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch passes");

      if (status === "active") {
        set({ monthlyPassActive: data });
      } else {
        set({ monthlyPassExpired: data });
      }

      set({ isLoading: false });
      return { success: true, data };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.message };
    }
  },

  extendMonthlyPass: async (passId: string, months: number) => {
    try {
      set({ isLoading: true });
      const token = get().token || (await AsyncStorage.getItem("token"));
      if (!token) throw new Error("No token found");

      const res = await fetch(`${URL}api/extendPass/${passId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ months }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to extend pass");
      }

      await get().getMonthlyPass("active");

      return { success: true };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.message };
    }
  },
  setStaffPermission: async (staffId, permissions) => {
    set({ isLoading: true });
    try {
      const token = get().token || (await AsyncStorage.getItem("token"));
      if (!token) throw new Error("No token found");

      const res = await fetch(`${URL}api/setPermissions/${staffId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          staffId,
          permissions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to set Permission");
      }

      return { success: true, data: data.staff.permissions };
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
  getStaffPermission: async (staffId) => {
    try {
      const token = get().token || (await AsyncStorage.getItem("token"));
      if (!token) throw new Error("No token found");
      const res = await fetch(`${URL}api/staff/getPermissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          staffId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to set Permission");
      }
      set({ permissions: data.permissions });
    } catch (error: any) {
      console.log(error.message);
    }
  },
}));

export default userAuthStore;
