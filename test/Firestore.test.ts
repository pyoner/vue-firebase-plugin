import Firestore from '../src/components/Firestore'

/**
 * Firestore test
 */
describe('Firestore test', () => {
  it('has name', () => {
    expect(Firestore).toHaveProperty('name')
  })
})
