import { create } from "zustand";

type GameStateType = {
  isTimer: boolean,
  setIsTimer: Function,
  isDisabled: boolean,
  setIsDisabled: Function,
  randomSuggestions: string[],
  setRandomSuggestions: Function,
  wordToDraw: string,
  setWordToDraw: Function,
}

const useGameState = create<GameStateType>(set => ({
  isTimer: false,
  setIsTimer: (bool: boolean) => set(() => ({isTimer: bool})),
  isDisabled: true,
  setIsDisabled: (bool: boolean) => set(() => ({ isDisabled: bool })),
  randomSuggestions: [],
  setRandomSuggestions: (suggestions: string[]) => set(() => ({ randomSuggestions: suggestions })),
  wordToDraw: "",
  setWordToDraw: (word: string) => set(() => ({wordToDraw: word })),
}))

export default useGameState;