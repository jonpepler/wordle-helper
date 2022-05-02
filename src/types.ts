export enum Colour {
  Grey,
  Yellow,
  Green
}

interface LetterGuess {
  letter: string
  colour: Colour
  position: number
}
export type Guess = LetterGuess[]
