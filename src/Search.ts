import { Colour, Guess } from './types'

interface GreenFilter {
  letter: string
  position: number
  type: Colour.Green
}

interface YellowFilter {
  letter: string
  positions: number[]
  type: Colour.Yellow
}

interface GreyFilter {
  letter: string
  type: Colour.Grey
}

type SearchFilter = GreenFilter | YellowFilter | GreyFilter

export class Search {
  possibleSolutions: string[]
  filters: SearchFilter[]

  constructor(solutions: string[]) {
    this.possibleSolutions = solutions
    this.filters = []
  }

  addFilter(filter: SearchFilter): void {
    let yellowFilter
    if (
      filter.type === Colour.Yellow &&
      (yellowFilter = this.filters.find(
        (f) => f.type === Colour.Yellow && f.letter === filter.letter
      ) as YellowFilter) !== undefined
    ) {
      yellowFilter.positions.push(...filter.positions)
    } else {
      this.filters.push(filter)
    }
  }

  addGuess = (guess: Guess): void => {
    guess.forEach(({ colour, letter, position }) => {
      const filter =
        colour === Colour.Grey
          ? {
              type: colour,
              letter: letter
            }
          : colour === Colour.Yellow
          ? {
              type: colour,
              letter: letter,
              positions: [position]
            }
          : {
              type: colour,
              letter: letter,
              position: position
            }

      this.addFilter(filter)
    })
  }

  filter = (): string[] => {
    this.possibleSolutions = this.possibleSolutions.filter((word) =>
      this.filters.every((filter) => {
        switch (filter.type) {
          case Colour.Green:
            return word[filter.position] === filter.letter
          case Colour.Yellow:
            return (
              filter.positions.every((pos) => word[pos] !== filter.letter) &&
              word.includes(filter.letter)
            )
          case Colour.Grey:
            return !word.includes(filter.letter)
          default:
            return false
        }
      })
    )
    return this.possibleSolutions
  }

  getGreenFilterLetters = (): string[] =>
    this.filters
      .filter(({ type }) => type === Colour.Green)
      .map(({ letter }) => letter)

  getYellowFilterLetters = (): string[] =>
    this.filters
      .filter(({ type }) => type === Colour.Yellow)
      .map(({ letter }) => letter)

  colourWord(
    word: string,
    yellowLetters: string[],
    greenLetters: string[]
  ): string {
    const green = (letter: string): string => `\u001b[38;5;2m${letter}\u001b[0m`
    const yellow = (letter: string): string =>
      `\u001b[38;5;3m${letter}\u001b[0m`

    return word
      .split('')
      .map((letter) =>
        yellowLetters.includes(letter) ? yellow(letter) : letter
      )
      .map((letter) => (greenLetters.includes(letter) ? green(letter) : letter))
      .join('')
  }

  makeBestGuesses(
    ignoreLetters: string[]
  ): Array<{ word: string; score: number }> {
    const frequencies = this.possibleSolutions
      .join('')
      .split('')
      .reduce<{ [letter: string]: number }>((total, letter) => {
        if (!ignoreLetters.includes(letter))
          total[letter] !== undefined ? total[letter]++ : (total[letter] = 1)
        return total
      }, {})
    const score = (word: string): number =>
      [...new Set(word.split(''))].reduce(
        (total: number, letter) => total + (frequencies[letter] ?? 0),
        0
      )

    return this.possibleSolutions
      .map((word) => ({ word, score: score(word) }))
      .sort((a, b) => b.score - a.score)
  }

  report(): void {
    console.log()
    console.log('possible solutions: ', this.possibleSolutions.length)
    const yellowLetters = this.getYellowFilterLetters()
    const greenLetters = this.getGreenFilterLetters()
    const solutions = this.possibleSolutions.map((word) =>
      this.colourWord(word, yellowLetters, greenLetters)
    )
    console.log(
      solutions.length > 10 ? solutions.join(' ') : solutions.join('\n')
    )
    const bestGuesses = this.makeBestGuesses(
      yellowLetters.concat(greenLetters)
    ).slice(0, 3)
    console.log(
      'Best guess: ' +
        bestGuesses.map(({ word, score }) => `${word}(${score})`).join(', ')
    )
  }

  chooseStartingWord(): void {
    console.log()
    const bestWord = this.makeBestGuesses([])[0]
    console.log('Best starting word: ', bestWord.word, `(${bestWord.score})`)
  }
}
