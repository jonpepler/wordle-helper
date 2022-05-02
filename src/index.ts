import https from 'https'

import { question } from 'readline-sync'

import { Search } from './Search'
import { getGuessFromString } from './util'

const runSearch = (solutions: string[]): void => {
  const search = new Search(solutions)
  const loop = (): void => {
    const input = question('enter guess: ')
    search.addGuess(getGuessFromString(input))
    search.filter()
    search.report()

    if (search.possibleSolutions.length > 1) loop()
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
