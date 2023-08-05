import { create } from "zustand";

type playerObjType = {
  playerId: string,
  playerName: string,
  playerColors: string[],
}

type PlayerListType = {
  playerList: playerObjType[]
  setPlayerList: Function,
  getPlayerColors: Function
}

const usePlayerList = create<PlayerListType>((set, get) => ({
  playerList: [],
  setPlayerList: (playerList: playerObjType[]) => set(() => ({ playerList: playerList })),
  getPlayerColors: (playerId: string) => {
    return get().playerList.filter(playerObj => playerObj.playerId === playerId)[0].playerColors
  }
}))

export default usePlayerList;