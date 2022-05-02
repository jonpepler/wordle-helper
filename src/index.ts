import https from 'https'

import { keyIn, keyInSelect } from 'readline-sync'

import { Search } from './Search'
import { getGuessFromString } from './util'

const grey = (letter: string): string => `\u001b[40m${letter}\u001b[0m`
const yellow = (letter: string): string => `\u001b[43;1m${letter}\u001b[0m`
const green = (letter: string): string => `\u001b[42;1m${letter}\u001b[0m`
const colourGuessString = (guess: string): string =>
  guess
    .toUpperCase()
    .split(' ')
    .slice(0, -1)
    .map((letter) =>
      letter[1] === '0'
        ? grey(letter[0])
        : letter[1] === '1'
        ? yellow(letter[0])
        : green(letter[0])
    )
    .join('')

const runSearch = (solutions: string[]): void => {
  const search = new Search(solutions)
  const loop = (wordList: string[] = []): void => {
    let input = ''
    while (input.length < 15) {
      const colour = keyInSelect(['⬛', '🟨', '🟩', 'X'], 'colour? ')
      if (colour === 3) process.exit()
      const letterInput = keyIn('letter? ', { limit: '$<a-z>' })
      input += `${String(letterInput)}${String(colour)} `
      console.clear()
      console.log()
      wordList.forEach((word) => console.log(word))
      console.log(colourGuessString(input))
    }
    search.addGuess(getGuessFromString(input))
    search.filter()
    search.report()

    if (search.possibleSolutions.length > 1) loop([...wordList, colourGuessString(input)])
  }

  loop()
}

https.get(
  'https://static.nytimes.com/newsgraphics/2022/01/25/wordle-solver/assets/solutions.txt',
  (res) => {
    console.log('fetching solutions...')
    let stream = ''
    res.on('data', (d) => {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      stream += d.toString()
    })
    res.on('end', () => {
      runSearch(stream.split('\n'))
    })
  }
)
