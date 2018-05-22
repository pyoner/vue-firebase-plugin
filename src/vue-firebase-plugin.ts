// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ..
import _Vue from 'vue'
import firebase, { firestore } from 'firebase'
import { FirebaseOptions } from '@firebase/app-types'
import { Settings, LogLevel } from '@firebase/firestore-types'

import Firestore from './components/Firestore'

export default function install(Vue: typeof _Vue, options: Options): void {
  const app = firebase.initializeApp(options.config)
  Vue.prototype.$firebaseApp = app

  // firestore
  if (options.firestore) {
    const { settings, logLevel } = options.firestore
    if (logLevel) {
      firebase.firestore.setLogLevel(logLevel)
    }

    const firestore = firebase.firestore()
    if (settings) {
      firestore.settings(settings)
    }

    // register Firestore component as global component
    Vue.component(Firestore.name, Firestore)
  }
}

export interface Options {
  config: FirebaseOptions
  firestore: {
    settings?: Settings
    logLevel?: LogLevel
  }
}
