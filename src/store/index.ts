import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./player-slice";
import uiReducer from "./ui-slice";
import progressReducer from "./progress-slice";

export const store = configureStore({
  reducer: {
    player: playerReducer,
    ui: uiReducer,
    progress: progressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
