import { Observable, of, Subscription } from 'rxjs'
import { delay } from 'rxjs/operators'

// code based on https://rxjs-dev.firebaseapp.com/guide/v6/pipeable-operators

export const delayAndTakeLast = () => <T>(source: Observable<wrappedWithDelay<T>>) =>
    new Observable<T>(observer => {
        let nextIndex = 0
        let prevFiredIndex = -1
        let delayedEvents: { index: number; event: T; subscription: Subscription }[] = []

        function onDestroy() {
            clearDelayedEvents()
        }

        function dispatch(value: T, index: number) {
            clearDelayedEvents(index)
            observer.next(value)
            prevFiredIndex = index
        }

        function clearDelayedEvents(toIndex = Number.MAX_SAFE_INTEGER) {
            delayedEvents = delayedEvents.filter(delayedEvent => {
                if (delayedEvent.index > toIndex) {
                    return true
                } else {
                    delayedEvent.subscription.unsubscribe()
                    return false
                }
            })
        }

        return source.subscribe({
            next(value) {
                const index = nextIndex++

                if (value.delay) {
                    const subscription = of(0)
                        .pipe(delay(value.delay))
                        .subscribe(() => {
                            if (prevFiredIndex < index) {
                                dispatch(value.event, index)
                            }
                        })

                    delayedEvents.push({
                        event: value.event,
                        index,
                        subscription,
                    })
                } else {
                    dispatch(value.event, index)
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

export type wrappedWithDelay<T> = {
    event: T
    delay?: number
}
