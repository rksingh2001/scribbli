import { io, playerNameMap } from './index';

type playerObjType = {
  playerId: string,
  playerName: string,
}

export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// Picks a count number of random suggestions and return is as a list
export const getRandomSuggestions = (count: number, suggestions: string[]) => {
  if (count >= suggestions.length) {
    return suggestions;
  }

  const randomSuggestions : Set<number> = new Set();

  while (randomSuggestions.size !== count) {
    randomSuggestions.add(Math.floor(Math.random() * suggestions.length));
  }

  const response : string[] = [];
  randomSuggestions.forEach(num => response.push(suggestions[num]));

  return response;
}

export const sendOnlyToSocketId = (socketId: string, eventName: string, data: object | null) => {
  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.emit(eventName, data);
  }
}

// Returns the list of players with their names
export const getPlayersList = (roomId: string) => {
  const playersSocketId = io.sockets.adapter.rooms.get(roomId);
  if (playersSocketId) {
    const playersSocketList = [...playersSocketId];
    const playersList : playerObjType[] = [];

    playersSocketList.forEach(socketId => {
      playersList.push({
        playerId: socketId,
        playerName: playerNameMap.get(socketId) ?? "",
      })
    })

    return playersList;
  } else {
    return [];
  }
}

export const convertToUnderscores = (inputString: string | undefined) => {
  if (!inputString) return "";

  let underscoreString = "";
  for (let char of inputString) {
    if (char === " ") {
      underscoreString += " ";
    } else {
      underscoreString += "_ ";
    }
  }
  return underscoreString;
}