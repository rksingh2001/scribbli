import { createContext, useState } from "react";

type PlayerTurnContextType = {
  playerTurnId: string
  setplayerTurnId: Function
}

export const PlayerTurnContext = createContext<PlayerTurnContextType>({ playerTurnId : "", setplayerTurnId: () => {} });

export const PlayerTurnProvider = ({ children } : { children: React.ReactNode }) => {
  const [playerTurnId, setplayerTurnId] = useState<string>("");

  return(
    <PlayerTurnContext.Provider value={{playerTurnId, setplayerTurnId}}>
      {children}
    </PlayerTurnContext.Provider>
  )
}