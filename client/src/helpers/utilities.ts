import usePlayerList from "../store/playerList";

export const getPlayerNameFromList = (socketId: string) => {
  const playerList = usePlayerList(state => state.playerList);

  console.log(playerList, socketId);
  for (let i = 0; i < playerList.length; ++i) {
    const playerObj = playerList[i];
    if (playerObj.playerId === socketId) {
      return playerObj.playerName;
    }
  }
  return "Name Not Found";
}