import { Guess } from './types'

export const getGuessFromString = (guess: string): Guess => {
  const input = guess.match(/[a-z][0-2]/g)
  if (input === null) {
    console.error('Input error. Use format c0 r2 a2 n1 e0')
    process.exit()
  } else {
    return input
      .map((entry) => [entry[0], entry[1]])
      .map((entry, position) => ({
        letter: entry[0],
        colour: parseInt(entry[1]),
        position
      }))
  }
}
