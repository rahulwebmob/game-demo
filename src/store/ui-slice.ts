import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ToastData {
  id: number;
  message: string;
  type: "success" | "purchase" | "error";
}

export interface UIState {
  showPupilTest: boolean;
  showSleepOverlay: boolean;
  toasts: ToastData[];
  toastCounter: number;
}

const initialState: UIState = {
  showPupilTest: false,
  showSleepOverlay: true,
  toasts: [],
  toastCounter: 0,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setShowPupilTest(state, action: PayloadAction<boolean>) {
      state.showPupilTest = action.payload;
    },
    setShowSleepOverlay(state, action: PayloadAction<boolean>) {
      state.showSleepOverlay = action.payload;
    },
    addToast(
      state,
      action: PayloadAction<{ message: string; type?: "success" | "purchase" | "error" }>,
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
  setShowPupilTest,
  setShowSleepOverlay,
  addToast,
  dismissToast,
} = uiSlice.actions;

export default uiSlice.reducer;
