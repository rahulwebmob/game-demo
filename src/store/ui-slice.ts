import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Tab } from "../components/nav-bar";

export interface ToastData {
  id: number;
  message: string;
  type: "success" | "purchase";
}

export interface UIState {
  tab: Tab;
  direction: number;
  loading: boolean;
  showPupilTest: boolean;
  showSleepOverlay: boolean;
  toasts: ToastData[];
  toastCounter: number;
}

const TAB_ORDER: Tab[] = [
  "home",
  "games",
  "customize",
  "leaderboard",
  "daily",
  "profile",
];

const initialState: UIState = {
  tab: "home",
  direction: 0,
  loading: false,
  showPupilTest: false,
  showSleepOverlay: true,
  toasts: [],
  toastCounter: 0,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    navigate(state, action: PayloadAction<Tab>) {
      const to = action.payload;
      if (to === state.tab) return;
      state.direction =
        TAB_ORDER.indexOf(to) > TAB_ORDER.indexOf(state.tab) ? 1 : -1;
      state.loading = true;
      state.tab = to;
    },
    finishLoading(state) {
      state.loading = false;
    },
    setShowPupilTest(state, action: PayloadAction<boolean>) {
      state.showPupilTest = action.payload;
    },
    setShowSleepOverlay(state, action: PayloadAction<boolean>) {
      state.showSleepOverlay = action.payload;
    },
    addToast(
      state,
      action: PayloadAction<{ message: string; type?: "success" | "purchase" }>,
    ) {
      state.toastCounter += 1;
      state.toasts.push({
        id: state.toastCounter,
        message: action.payload.message,
        type: action.payload.type || "success",
      });
    },
    dismissToast(state, action: PayloadAction<number>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  navigate,
  finishLoading,
  setShowPupilTest,
  setShowSleepOverlay,
  addToast,
  dismissToast,
} = uiSlice.actions;

export default uiSlice.reducer;
