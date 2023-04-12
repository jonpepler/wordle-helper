import https from 'https'
import { keyIn, keyInSelect } from 'readline-sync'

import * as cheerio from 'cheerio'

import { Search } from './Search'
import { getGuessFromString } from './util'

const greyBackground = (letter: string): string =>
  `\u001b[38;5;15;48;5;240m  ${letter} \u001b[0m`
const yellowBackground = (letter: string): string =>
  `\u001b[38;5;0;48;5;3m ${letter} \u001b[0m`
const greenBackground = (letter: string): string =>
  `\u001b[38;5;15;48;5;2m ${letter} \u001b[0m`

const colourGuessString = (guess: string): string =>
  guess
    .toUpperCase()
    .split(' ')
    .slice(0, -1)
    .map((letter) =>
      letter[1] === '0'
        ? greyBackground(letter[0])
        : letter[1] === '1'
        ? yellowBackground(letter[0])
        : greenBackground(letter[0])
    )
    .join('')

const runSearch = (solutions: string[]): void => {
  const search = new Search(solutions)
  search.chooseStartingWord()
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

    if (search.possibleSolutions.length > 1)
      loop([...wordList, colourGuessString(input)])
  }

  loop()
}

const getPossibleSolutions = async (): Promise<string[]> => {
  return await new Promise((resolve) => {
    https.get(
      'https://gist.githubusercontent.com/cfreshman/d97dbe7004522f7bc52ed2a6e22e2c04/raw/633058e11743065ad2822e1d2e6505682a01a9e6/wordle-nyt-words-14855.txt',
      (res) => {
        let stream = ''
        res.on('data', (d) => {
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          stream += d.toString()
        })
        res.on('end', () => {
          resolve(stream.split('\n'))
        })
      }
    )
  })
}

const getPreviousSolutions = async (): Promise<string[]> => {
  return await new Promise((resolve) => {
    const options = {
      hostname: 'www.rockpapershotgun.com',
      path: 'wordle-past-answers',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
      }
    }
    https.get(options, (res) => {
      let stream = ''
      res.on('data', (d) => {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        stream += d.toString()
      })
      res.on('end', () => {
        const $ = cheerio.load(stream)
        resolve(
          $('.article_body_content > ul.inline')
            .slice(0, 2)
            .text()
            .split('\n')
            .filter((text) => text !== '')
            .map((text) => text.toLowerCase())
        )
      })
    })
  })
}

console.log('fetching solutions...')
Promise.all([getPossibleSolutions(), getPreviousSolutions()])
  .then(([possibleSolutions, previousSolutions]) => {
    runSearch(
      possibleSolutions.filter((word) => !previousSolutions.includes(word))
    )
  })
  .catch((error) => console.error(error))
