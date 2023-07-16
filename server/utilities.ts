import { io, playerNameMap } from './index';

type playerObjType = {
  playerId: string,
  playerName: string,
}

export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// Picks a count number of random list and return is as a list
export const getRandomValues = (count: number, list: string[]) => {
  if (count >= list.length) {
    return list;
  }

  const randomMembers : Set<number> = new Set();

  while (randomMembers.size !== count) {
    randomMembers.add(Math.floor(Math.random() * list.length));
  }

  const response : string[] = [];
  randomMembers.forEach(num => response.push(list[num]));

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