import { lazy, ComponentType } from "react"

type LazyImport = () => Promise<{ default: ComponentType<any> }>

const MAX_RETRIES = 10
const INTERVAL = 500

const retry = (fn: LazyImport, retriesLeft = MAX_RETRIES): Promise<{ default: ComponentType<any> }> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((err) => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject(new Error(`${err} after ${MAX_RETRIES} retries`))
            return
          }
          retry(fn, retriesLeft - 1).then(resolve, reject)
        }, INTERVAL)
      })
  })
}

const load = (fn: LazyImport) => lazy(() => retry(() => fn()))

export const AsyncPage = (pageName: string) =>
  load(
    () =>
      import(
        /* webpackInclude: /\.page.tsx$/ */
        /* webpackChunkName: "[request]" */
        `@fider/pages/${pageName}`
      )
  )
