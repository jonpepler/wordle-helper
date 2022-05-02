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

  report(): void {
    console.log()
    console.log('possible solutions: ', this.possibleSolutions.length)
    console.log(
      this.possibleSolutions.length > 10
        ? this.possibleSolutions.join(' ')
        : this.possibleSolutions.join('\n')
    )
  }
}
