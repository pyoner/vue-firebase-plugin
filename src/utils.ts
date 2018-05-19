import firebase from 'firebase'
import 'firebase/firestore'

import { User } from '@firebase/auth-types'
import {
  Timestamp,
  GeoPoint,
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
  QuerySnapshot,
  WhereFilterOp,
  FieldPath,
  OrderByDirection,
  Query
} from '@firebase/firestore-types'

export function normalizeUser(user: User) {
  return user.toJSON()
}

export type Where = [string | FieldPath, WhereFilterOp, any]
export type OrderBy = [string | FieldPath, OrderByDirection]
export type StartEnd = DocumentSnapshot | any[]
export type CreateRef = {
  collection: string
  id: string
  where: Where[]
  orderBy: OrderBy[]
  limit: number
  startAt: StartEnd
  startAfter: StartEnd
  endAt: StartEnd
  endBefore: StartEnd
}
export function createRef({
  collection,
  id,
  where,
  orderBy,
  limit,
  startAt,
  startAfter,
  endAt,
  endBefore
}: CreateRef) {
  const db = firebase.firestore()
  let colRef: CollectionReference | Query = db.collection(collection)
  if (id && (colRef as CollectionReference).doc) {
    return (colRef as CollectionReference).doc(id)
  }

  if (where) {
    colRef = where.reduce(
      (ref, [path, op, v]) => ref.where(path, op, v),
      colRef
    )
  }

  if (orderBy) {
    colRef = orderBy.reduce(
      (ref, [path, dir]) => ref.orderBy(path, dir),
      colRef
    )
  }

  if (startAt) {
    colRef = colRef.startAt(startAt)
  } else if (startAfter) {
    colRef = colRef.startAfter(startAfter)
  }

  if (endAt) {
    colRef = colRef.endAt(endAt)
  } else if (endBefore) {
    colRef = colRef.endBefore(endBefore)
  }

  if (limit) {
    colRef = colRef.limit(limit)
  }

  return colRef
}

export function normalizeField(value: any): any {
  if (value instanceof Timestamp) {
    return value.toDate()
  }

  if (value instanceof GeoPoint) {
    return {
      latitude: value.latitude,
      longitude: value.longitude
    }
  }

  if (value instanceof DocumentReference) {
    return {
      id: value.id,
      path: value.path,
      parent: normalizeField(value.parent)
    }
  }

  if (value instanceof CollectionReference) {
    return {
      id: value.id,
      path: value.path,
      parent: normalizeField(value.parent)
    }
  }

  if (value instanceof Array) {
    return value.map(normalizeField)
  }

  if (value instanceof Object) {
    const obj: { [k: string]: any } = {}
    for (let k in value) {
      obj[k] = normalizeField(value[k])
    }

    return obj
  }

  return value
}

export function normalizeDocumentSnapshot(snapshot: DocumentSnapshot) {
  return {
    ...normalizeField(snapshot.data()),
    id: snapshot.id
  }
}

export function normalizeSnapshot(snapshot: DocumentSnapshot | QuerySnapshot) {
  if (snapshot instanceof QuerySnapshot) {
    return snapshot.docs.map(normalizeDocumentSnapshot)
  } else if (snapshot instanceof DocumentSnapshot) {
    return normalizeDocumentSnapshot(snapshot)
  } else {
    throw new Error(`Not implemented normalization for snapshot: ${snapshot}`)
  }
}
