import { createContext, useState } from "react";

type PlayersContextType = {
  players: string[]
  setPlayers: Function
}

export const PlayersContext = createContext<PlayersContextType>({ players : [], setPlayers: () => {} });

export const PlayersProvider = ({ children } : { children: React.ReactNode }) => {
  const [players, setPlayers] = useState<string[]>([]);

  return(
    <PlayersContext.Provider value={{players, setPlayers}}>
      {children}
    </PlayersContext.Provider>
  )
}