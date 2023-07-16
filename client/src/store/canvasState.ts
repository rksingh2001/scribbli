import { create } from "zustand";

type canvasStateType = {
  color: string
  setColor: Function
  lineWidth: number | undefined
  setLineWidth: Function
  utilitySelected: string | undefined
  setUtilitySelected: Function
}

const useCanvasState = create<canvasStateType>((set) => ({
  color: '#000000',
  setColor: (color: string) => set(() => ({ color: color })),
  lineWidth: 10,
  setLineWidth: (lineWidth: number) => set(() => ({ lineWidth: lineWidth })),
  utilitySelected: undefined,
  setUtilitySelected: (utilityName: string) => set(() => ({ utilitySelected: utilityName })),
}))

export default useCanvasState;