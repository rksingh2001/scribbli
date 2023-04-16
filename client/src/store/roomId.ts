import { create } from "zustand";

type roomIdType = {
  roomId: string
  setRoomId: Function
}

const useRoomId = create<roomIdType>((set) => ({
  roomId: '',
  setRoomId: (roomId: string) => set(() => ({ roomId: roomId }))
}))

export default useRoomId;