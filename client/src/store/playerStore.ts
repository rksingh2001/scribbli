import { create } from "zustand";

type PlayerType = {
  name: string
  setName: Function
}

const usePlayer = create<PlayerType>((set) => ({
  name: 'Not set yet',
  setName: (name: string) => set(() => ({ name: name }))
}))

export default usePlayer;