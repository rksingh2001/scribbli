import { create } from "zustand";

type canvasStateType = {
  color: string
  setColor: Function
}

const useCanvasState = create<canvasStateType>((set) => ({
  color: '#000000',
  setColor: (color: string) => set(() => ({ color: color }))
}))

export default useCanvasState;