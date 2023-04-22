import { create } from "zustand";

type GameStateType = {
  isTimer: boolean,
  setIsTimer: Function,
  isDisabled: boolean,
  setIsDisabled: Function,
  randomSuggestions: string[],
  setRandomSuggestions: Function,
}

const useGameState = create<GameStateType>(set => ({
  isTimer: false,
  setIsTimer: (bool: boolean) => set(() => ({isTimer: bool})),
  isDisabled: true,
  setIsDisabled: (bool: boolean) => set(() => ({ isDisabled: bool })),
  randomSuggestions: [],
  setRandomSuggestions: (suggestions: string[]) => set(() => ({ randomSuggestions: suggestions }))
}))

export default useGameState;