import { createContext, useState } from "react";

type PlayersContextType = {
  name: string
  setName: Function
}

export const PlayerContext = createContext<PlayersContextType>({ name : "", setName: () => {} });

export const PlayerProvider = ({ children } : { children: React.ReactNode }) => {
  const [name, setName] = useState<string>("");

  return(
    <PlayerContext.Provider value={{name, setName}}>
      {children}
    </PlayerContext.Provider>
  )
}