import { create } from "zustand";

type PlayerTurnIdType = {
  playerTurnId: string,
  setPlayerTurnId: Function,
}

const usePlayerTurnId = create<PlayerTurnIdType>((set) => ({
  playerTurnId: '',
  setPlayerTurnId: (playerTurnId: string) => set(() => ({ playerTurnId: playerTurnId }))
}))

export default usePlayerTurnId;