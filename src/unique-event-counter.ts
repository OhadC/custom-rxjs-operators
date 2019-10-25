import { Observable, Subscription, of } from 'rxjs'
import { delay } from 'rxjs/operators'

// code based on https://rxjs-dev.firebaseapp.com/guide/v6/pipeable-operators
// Usages:
//  uniqueEventCounter(250, buttonComperator, 2) => for click/double-click, when more than 1 button emit events.
//  uniqueEventCounter(250, trueComperator, 2) => for click/double-click, when only 1 button emit events.

// const trueComperator = (a: any, b: any) => true
const simpleComperator = (a: any, b: any) => a === b
// const buttonComperator = (a: MouseEvent, b: MouseEvent) => a.srcElement === b.srcElement

export const uniqueEventCounter = <T>(interval: number, comperator: Comperator<T> = simpleComperator, maxTimes?: number) => (
    source: Observable<T>
) =>
    new Observable<DispatchedValue<T>>(observer => {
        let prevSubscription: Subscription | undefined
        let prevValue: T | undefined
        let timesCounter = 0

        function onDestroy() {
            clearPrevTimeout()
        }

        function dispatch(value: T, times: number) {
            observer.next({ value, times })
            resetCache()
        }

        function clearPrevTimeout() {
            if (prevSubscription) {
                prevSubscription.unsubscribe()
                prevSubscription = undefined
            }
        }

        function ceateNewSubscription() {
            clearPrevTimeout()

            prevSubscription = of(0)
                .pipe(delay(interval))
                .subscribe(() => {
                    dispatch(prevValue!, timesCounter)
                })
        }

        function resetCache() {
            clearPrevTimeout()

            prevValue = undefined
            timesCounter = 0
        }

        return source.subscribe({
            next(value) {
                if (prevValue !== undefined && comperator(prevValue, value)) {
                    timesCounter++

                    if (maxTimes === timesCounter) {
                        dispatch(value, timesCounter)
                    } else {
                        ceateNewSubscription()
                    }
                } else {
                    if (prevValue !== undefined) {
                        dispatch(prevValue, timesCounter)
                    }

                    timesCounter = 1
                    if (maxTimes === timesCounter) {
                        dispatch(value, timesCounter)
                    } else {
                        ceateNewSubscription()
                        prevValue = value
                    }
                }
            },
            error(err) {
                onDestroy()
                observer.error(err)
            },
            complete() {
                onDestroy()
                observer.complete()
            },
        })
    })

type DispatchedValue<T> = { value: T; times: number }
type Comperator<T> = (a: T, b: T) => boolean
