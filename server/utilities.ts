import { currentActiveSocketId, io, playerStateMap, roomStateMap } from './index';

type playerObjType = {
  playerId: string,
  playerName: string,
  playerColors: string[]
}

export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// Picks a count number of random list and return is as a list
export const getRandomValues = <T>(count: number, list: T[]) => {
  if (count >= list.length) {
    return list;
  }

  const randomMembers: Set<number> = new Set();

  while (randomMembers.size !== count) {
    randomMembers.add(Math.floor(Math.random() * list.length));
  }

  const response: T[] = [];
  randomMembers.forEach(num => response.push(list[num]));

  return response;
}

export const sendOnlyToPlayer = (playerId: string, eventName: string, data: object | null) => {
  const socketId = currentActiveSocketId.get(playerId);
  if (!socketId) return;
  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.emit(eventName, data);
  }
}

// Returns the list of players with their names
export const getPlayersList = (roomId: string) => {
  // const playersSocketId = io.sockets.adapter.rooms.get(roomId);
  const playerIds = roomStateMap.get(roomId)?.playersId;
  if (playerIds) {
    const playersSocketList = [...playerIds];
    const playersList: playerObjType[] = [];

    playersSocketList.forEach(playerId => {
      const playerStateObj = playerStateMap.get(playerId);
      console.log("playerList", playerStateObj)
      if (playerStateObj) {
        playersList.push({
          playerId: playerId,
          playerName: playerStateObj.name ?? "",
          playerColors: playerStateObj.colors ?? ["white", "black"],
        });
      }
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