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
  round: number,
  setRound: Function,
}

const useGameState = create<GameStateType>(set => ({
  isTimer: false,
  setIsTimer: (bool: boolean) => set(() => ({ isTimer: bool })),
  isDisabled: true,
  setIsDisabled: (bool: boolean) => set(() => ({ isDisabled: bool })),
  randomSuggestions: [],
  setRandomSuggestions: (suggestions: string[]) => set(() => ({ randomSuggestions: suggestions })),
  wordToDraw: "",
  setWordToDraw: (word: string) => set(() => ({ wordToDraw: word })),
  round: 1,
  setRound: (round: number) => set(() => ({ round: round }))
}))

export default useGameState;