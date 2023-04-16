import { create } from "zustand";

type PlayerListType = {
  playerList: string[]
  setPlayerList: Function
}

const usePlayerList = create<PlayerListType>((set) => ({
  playerList: [],
  setPlayerList: (playerList: string[]) => set(() => ({ playerList: playerList }))
}))

export default usePlayerList;