// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ..
import _Vue from 'vue'
import firebase from 'firebase'
import '@firebase/firestore'
import { FirebaseOptions } from '@firebase/app-types'

export default function install(Vue: typeof _Vue, options: Options): void {
  const app = firebase.initializeApp(options.config)
  Vue.prototype.$firebaseApp = app

  // firestore
  // if (options.firestore) {
  //   const firestore = firebase.firestore();
  //   const { settings, logLevel } = options.firestore;

  //   if (settings) {
  //     firestore.settings(settings);
  //   }

  //   if (logLevel) {
  //     // firestore.setLogLevel(logLevel);
  //   }
  //   // register Firestore component as global component
  //   // Vue.component(Firestore.name, Firestore);
  // }
}

export interface Options {
  config: FirebaseOptions
}
