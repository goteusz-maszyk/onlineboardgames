/**
 * 
 * @param {number[]} chances 
 * @returns {string} index of an item, or key if chances is an object
 */
export default function weightedRandom(chances) {
  const random = Math.random();
  let chanceSum = 0;
  for(const i in chances) {
    chanceSum += chances[i];
    if(random < chanceSum) return i
  }
}