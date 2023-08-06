import usePlayerList from "../store/playerList";

export const getPlayerNameFromList = (socketId: string) => {
  const playerList = usePlayerList(state => state.playerList);

  for (let i = 0; i < playerList.length; ++i) {
    const playerObj = playerList[i];
    if (playerObj.playerId === socketId) {
      return playerObj.playerName;
    }
  }
  return "Name Not Found";
}

export const getSortedScoreArray = (scoreObj: Object) => {
  const scoreList = Object.entries(scoreObj);
  scoreList.sort(function (a, b) {
    return b[1] - a[1];
  });

  return scoreList;
}