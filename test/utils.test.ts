import * as utils from '../src/utils'
import firebase, { firestore } from 'firebase'

/**
 * utils test
 */
describe('utils test', () => {
  it('has normalizeUser', () => {
    expect(utils).toHaveProperty('normalizeUser')
  })

  describe('createRef', () => {
    firebase.initializeApp({
      apiKey: 'key',
      authDomain: 'domain',
      databaseURL: 'database',
      projectId: 'project id'
    })

    firestore().settings({ timestampsInSnapshots: true })

    it('should return CollectionReference', () => {
      expect(utils.createRef({ collection: 'users' })).toBeInstanceOf(
        firestore.CollectionReference
      )
    })

    it('should return DocumentReference', () => {
      expect(utils.createRef({ collection: 'users', id: '3' })).toBeInstanceOf(
        firestore.DocumentReference
      )
    })

    it('should return Query', () => {
      expect(
        utils.createRef({
          collection: 'users',
          where: [['name', '==', 'Alice']]
        })
      ).toBeInstanceOf(firestore.Query)
    })
  })
})
