import firebase, { firestore } from 'firebase'

export function normalizeUser(user: firebase.User) {
  return user.toJSON()
}

export type Where = [string | firestore.FieldPath, firestore.WhereFilterOp, any]
export type OrderBy = [string | firestore.FieldPath, firestore.OrderByDirection]
export type StartEnd = firestore.DocumentSnapshot | any[]
export type CreateRef = {
  collection: string
  id?: string
  where?: Where[]
  orderBy?: OrderBy[]
  limit?: number
  startAt?: StartEnd
  startAfter?: StartEnd
  endAt?: StartEnd
  endBefore?: StartEnd
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
}: CreateRef):
  | firestore.DocumentReference
  | firestore.CollectionReference
  | firestore.Query {
  const db = firebase.firestore()
  let colRef: firestore.CollectionReference | firestore.Query = db.collection(
    collection
  )
  if (id && (colRef as firestore.CollectionReference).doc) {
    return (colRef as firestore.CollectionReference).doc(id)
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
  if (value instanceof firestore.Timestamp) {
    return value.toDate()
  }

  if (value instanceof firestore.GeoPoint) {
    return {
      latitude: value.latitude,
      longitude: value.longitude
    }
  }

  if (value instanceof firestore.DocumentReference) {
    return {
      id: value.id,
      path: value.path,
      parent: normalizeField(value.parent)
    }
  }

  if (value instanceof firestore.CollectionReference) {
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

export function normalizeDocumentSnapshot(
  snapshot: firestore.DocumentSnapshot
) {
  return {
    ...normalizeField(snapshot.data()),
    id: snapshot.id
  }
}

export function normalizeSnapshot(
  snapshot: firestore.DocumentSnapshot | firestore.QuerySnapshot
) {
  if (snapshot instanceof firestore.QuerySnapshot) {
    return snapshot.docs.map(normalizeDocumentSnapshot)
  } else if (snapshot instanceof firestore.DocumentSnapshot) {
    return normalizeDocumentSnapshot(snapshot)
  } else {
    throw new Error(`Not implemented normalization for snapshot: ${snapshot}`)
  }
}
