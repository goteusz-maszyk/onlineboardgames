export function trapAmounts(players) {
  return players > 9 ? 3 : 2
}

export function treasureAmounts(players) {
  if (players < 7) return players+2;
  return players;
}

export function emptyAmounts(players) {
  return 5*players - trapAmounts(players) - treasureAmounts(players)
}

export function amazons(players) {
  if(players < 7) return 2;
  if(players < 10) return 3;
  return 4;
}

export function robbers(players) {
  switch(players) {
    case 3:
      return 2;
    case 4, 5:
      return 3;
    case 6:
      return 4;
    case 7:
      return 5;
    case 8, 9:
      return 6;
    case 10:
      return 7
  }
}