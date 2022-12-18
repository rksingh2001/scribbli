import { createContext, useState } from "react";

type RoomIDContextType = {
  roomID: string
  setRoomID: React.Dispatch<React.SetStateAction<string>>
}

export const RoomIdContext = createContext<RoomIDContextType>({roomID : "", setRoomID: () => {}});

export const RoomIDProvider = ({ children } : { children: React.ReactNode }) => {
  const [roomID, setRoomID] = useState("");

  return(
    <RoomIdContext.Provider value={{roomID, setRoomID}}>
      {children}
    </RoomIdContext.Provider>
  )
}