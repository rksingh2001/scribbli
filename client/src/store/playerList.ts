import { create } from "zustand";

type playerObjType = {
  playerId: string,
  playerName: string,
}

type PlayerListType = {
  playerList: playerObjType[]
  setPlayerList: Function
}

const usePlayerList = create<PlayerListType>((set) => ({
  playerList: [],
  setPlayerList: (playerList: playerObjType[]) => set(() => ({ playerList: playerList }))
}))

export default usePlayerList;