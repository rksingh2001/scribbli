import { create } from "zustand";

type canvasStateType = {
  color: string
  setColor: Function
  lineWidth: number
  setLineWidth: Function
}

const useCanvasState = create<canvasStateType>((set) => ({
  color: '#000000',
  setColor: (color: string) => set(() => ({ color: color })),
  lineWidth: 10,
  setLineWidth: (lineWidth: number) => set(() => ({ lineWidth: lineWidth }))
}))

export default useCanvasState;