/**
 * @param {T[]} array 
 * @returns {T[]} array
 */
export default function shuffle(array) {
  const shuffled = [...array]
  var m = shuffled.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = shuffled[m];
    shuffled[m] = shuffled[i];
    shuffled[i] = t;
  }

  return shuffled;
}