import Vue, { CreateElement, VNode } from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'

import firebase, { firestore } from 'firebase/app'

import {
  createRef,
  normalizeSnapshot,
  Where,
  OrderBy,
  StartEnd,
  CreateRef
} from '../utils'

interface Inner {
  unsubscribe?: () => void
  snapFirst?: firestore.DocumentSnapshot
  snapLast?: firestore.DocumentSnapshot
  snapHistory: firestore.DocumentSnapshot[]
}

@Component
export default class Firestore extends Vue {
  // props
  @Prop({ required: true })
  collection: string = ''

  @Prop({ type: String })
  id?: string

  @Prop({ type: Array })
  where?: Where[]

  @Prop({ type: Array })
  orderBy?: OrderBy[]

  @Prop({ type: Number })
  limit?: number

  // data
  doc = null
  docs = []
  loading = true
  nextCursor: firestore.DocumentSnapshot | null = null
  prevCursor: firestore.DocumentSnapshot | null = null

  // not reactive
  private inner?: Inner

  // watch
  @Watch('collection')
  onCollectionChanged() {
    this.reSubscribe()
  }

  @Watch('id')
  onIdChanged() {
    this.reSubscribe()
  }

  @Watch('where')
  onWhereChanged() {
    this.reSubscribe()
  }

  @Watch('orderBy')
  onOrderByChanged() {
    this.reSubscribe()
  }

  @Watch('limit')
  onLimitChanged() {
    this.reSubscribe()
  }

  // methods
  subscribe() {
    if (this.inner) {
      const vm = this
      const { collection, id, where, orderBy, limit } = this
      const params: CreateRef = { collection, id, where, orderBy, limit }
      const ref = createRef(params)
      if (ref instanceof firestore.DocumentReference) {
        this.inner.unsubscribe = ref.onSnapshot(
          (snap: firestore.DocumentSnapshot) => {
            vm.doc = normalizeSnapshot(snap)
          }
        )
      } else {
        this.inner.unsubscribe = ref.onSnapshot(
          (snap: firestore.QuerySnapshot) => {
            if (vm.inner) {
              vm.inner.snapFirst = snap.docs[0]
              vm.inner.snapLast = snap.docs[snap.docs.length - 1]
            }
            vm.docs = normalizeSnapshot(snap)
          }
        )
      }
      console.log('Firestore subscribe')
    }
  }

  unsubscribe() {
    if (this.inner) {
      const { unsubscribe } = this.inner
      if (unsubscribe) {
        unsubscribe()
        delete this.inner.unsubscribe
        delete this.inner.snapFirst
        delete this.inner.snapLast
        console.log('Firestore unsubscribe')
      }
    }
  }

  reSubscribe() {
    this.unsubscribe()
    this.subscribe()
  }

  next() {
    console.log('next')
    this.$nextTick(function() {
      if (this.inner) {
        this.prevCursor = null
        if (this.inner.snapLast) {
          this.nextCursor = this.inner.snapLast
        }
        if (this.inner.snapFirst) {
          this.inner.snapHistory.push(this.inner.snapFirst)
        }
        console.log('snapHistory', this.inner.snapHistory)
        this.reSubscribe()
      }
    })
  }

  prev() {
    console.log('prev')
    this.$nextTick(function() {
      if (this.inner) {
        this.nextCursor = null
        this.prevCursor = this.inner.snapHistory.pop() || null
        console.log('snapHistory', this.inner.snapHistory)
        this.reSubscribe()
      }
    })
  }

  // hooks
  created() {
    console.log('Firestore created')
    this.inner = {
      snapHistory: []
    }

    this.subscribe()
  }

  destroyed() {
    console.log('Firestore destroyed')
    this.unsubscribe()
    delete this.inner
  }

  render(h: CreateElement): VNode {
    const props = this.id
      ? { doc: this.doc }
      : {
          docs: this.docs,
          next: this.next,
          prev: this.prev
        }
    return h('div', [this.$scopedSlots.default(props)])
  }
}
