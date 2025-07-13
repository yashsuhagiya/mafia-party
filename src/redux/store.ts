import { createSlice, configureStore } from '@reduxjs/toolkit';
import type { Player, RoleCount } from '@/types/game';

// Initial state
const initialState = {
  mafiaRoles: {
    silencer: 0,
    mafia: 2,
  },
  villageRoles: {
    villager: 3,
    police: 0,
    doctor: 0,
  },
  playerNames: [],
  allocation: [],
  alert: {
    show: false,
    header: "",
    body: "",
  },
  toast: {
    variant: "success",
    show: false,
    header: "",
    body: "",
  },
};

// Create slice with Redux Toolkit
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    updateMafiaRoles: (state, action) => {
      state.mafiaRoles = action.payload;
    },
    updateVillageRoles: (state, action) => {
      state.villageRoles = action.payload;
    },
    updatePlayerNames: (state, action) => {
      state.playerNames = action.payload;
    },
    updateAllocation: (state, action) => {
      state.allocation = action.payload;
    },
    showAlert: (state, action) => {
      state.alert = {
        show: true,
        header: action.payload.header || "",
        body: action.payload.body || action.payload,
      };
    },
    hideAlert: (state) => {
      state.alert = {
        show: false,
        header: "",
        body: "",
      };
    },
    showToast: (state, action) => {
      state.toast = {
        show: true,
        variant: action.payload.variant || "success",
        header: action.payload.header || "",
        body: action.payload.body || action.payload,
      };
    },
    hideToast: (state) => {
      state.toast = {
        show: false,
        variant: "success",
        header: "",
        body: "",
      };
    },
  },
});

// Export actions
export const {
  updateMafiaRoles,
  updateVillageRoles,
  updatePlayerNames,
  updateAllocation,
  showAlert,
  hideAlert,
  showToast,
  hideToast,
} = gameSlice.actions;

// Legacy action creators for compatibility
export const updateMafia = (mafiaRoles: RoleCount) => updateMafiaRoles(mafiaRoles);
export const updateVillage = (villageRoles: RoleCount) => updateVillageRoles(villageRoles);
export const updatePlayers = (playerNames: Player[]) => updatePlayerNames(playerNames);

// Create store
export const store = configureStore({
  reducer: {
    game: gameSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['game/showAlert'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.body'],
        // Ignore these paths in the state
        ignoredPaths: ['game.alert.body'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
