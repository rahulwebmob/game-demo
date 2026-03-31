import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./player-slice";
import uiReducer from "./ui-slice";

export const store = configureStore({
  reducer: {
    player: playerReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
