import { Search } from './Search'
import { Colour } from './types'
import { getGuessFromString } from './util'

it('assigns grey filters', () => {
  const search = new Search(['salad'])
  expect(search.possibleSolutions).toHaveLength(1)
  search.addGuess(getGuessFromString('t0 h0 o0 r0 n0'))
  search.filter()
  expect(search.filters).toHaveLength(5)
  search.filters.forEach((filter) => expect(filter.type).toEqual(Colour.Grey))
})

it('assigns green filters', () => {
  const search = new Search(['salad'])
  expect(search.possibleSolutions).toHaveLength(1)
  search.addGuess(getGuessFromString('g0 o0 u0 r0 d2'))
  search.filter()
  expect(search.filters).toHaveLength(5)
  expect(
    search.filters.filter(({ type }) => type === Colour.Green)
  ).toHaveLength(1)
})

it('assigns yellow filters', () => {
  const search = new Search(['salad'])
  expect(search.possibleSolutions).toHaveLength(1)
  search.addGuess(getGuessFromString('c0 r0 a1 n0 e0'))
  search.filter()
  expect(search.filters).toHaveLength(5)
  expect(
    search.filters.filter(({ type }) => type === Colour.Yellow)
  ).toHaveLength(1)
})
