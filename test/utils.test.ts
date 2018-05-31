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

  describe('normalizeField', () => {
    it('should normalize Timestamp', () => {
      const output = new Date()
      const input = firestore.Timestamp.fromDate(output)
      expect(utils.normalizeField(input)).toEqual(output)
    })

    it('should normalize GeoPoint', () => {
      const output = {
        latitude: 0,
        longitude: 0
      }
      const input = new firestore.GeoPoint(output.latitude, output.longitude)
      expect(utils.normalizeField(input)).toEqual(output)
    })

    it('should normalize DocumentReference', () => {
      const input = firestore().doc('/users/1')
      const output = {
        id: '1',
        parent: { id: 'users', parent: null, path: 'users' },
        path: 'users/1'
      }
      expect(utils.normalizeField(input)).toEqual(output)
    })

    it('should normalize CollectionReference', () => {
      const input = firestore().collection('/users')
      const output = { id: 'users', parent: null, path: 'users' }
      expect(utils.normalizeField(input)).toEqual(output)
    })

    it('should normalize Array', () => {
      const input = [1, 'test', firestore().collection('/users')]
      const output = [1, 'test', { id: 'users', parent: null, path: 'users' }]
      expect(utils.normalizeField(input)).toEqual(output)
    })

    it('should normalize Object', () => {
      const input = {
        number: 1,
        string: 'test',
        collection: firestore().collection('/users')
      }
      const output = {
        number: 1,
        string: 'test',
        collection: { id: 'users', parent: null, path: 'users' }
      }

      expect(utils.normalizeField(input)).toEqual(output)
    })

    it('should normalize scalars', () => {
      const scalars = [
        1,
        3.14,
        -5,
        'string',
        true,
        false,
        null,
        undefined
      ].forEach(v => {
        expect(utils.normalizeField(v)).toEqual(v)
      })
    })
  })
})
