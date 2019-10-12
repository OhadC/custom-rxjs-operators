import { expect } from 'chai'
import { TestScheduler } from 'rxjs/testing'
import { uniqueEventCounter } from '../src/operators/unique-event-counter'

describe('uniqueEventCounter operator', () => {
    let testScheduler: TestScheduler
    beforeEach(() => {
        testScheduler = new TestScheduler((actual, expected) => {
            expect(actual).deep.equal(expected)
        })
    })

    it('should emit events immediately if maxTimes === 1', () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold('-a-|')
            const subs = '^--!'
            const expected = '-a-|'

            expectObservable(e1.pipe(uniqueEventCounter(2, undefined, 1))).toBe(expected, {
                a: { value: 'a', times: 1 },
            })
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })

    it('should emit events immediately if interval === 0', () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold('-a-|')
            const subs = '^--!'
            const expected = '-a-|'

            expectObservable(e1.pipe(uniqueEventCounter(0, undefined, 2))).toBe(expected, {
                a: { value: 'a', times: 1 },
            })
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })

    it('should emit events only when reaching maxTimes when getting same events', () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold('-aa-|')
            const subs = '^---!'
            const expected = '--a-|'

            expectObservable(e1.pipe(uniqueEventCounter(3, undefined, 2))).toBe(expected, {
                a: { value: 'a', times: 2 },
            })
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })

    it('should emit prev event and not wait for maxTimes when getting different event', () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold('-aac---|')
            const subs = '^------!'
            const expected = '---a--c|'

            expectObservable(e1.pipe(uniqueEventCounter(3, undefined, 3))).toBe(expected, {
                a: { value: 'a', times: 2 },
                c: { value: 'c', times: 1 },
            })
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })

    it('should use simple comperator by default', () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold<{ event: string }>('ac--|', {
                a: { event: 'a' },
                c: { event: 'a' },
            })
            const subs = '^---!'
            const expected = '-a-c|'

            expectObservable(e1.pipe(uniqueEventCounter(2, undefined, 2))).toBe(expected, {
                a: { value: { event: 'a' }, times: 1 },
                c: { value: { event: 'a' }, times: 1 },
            })
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })

    it('should respect comperator', () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold<{ event: string }>('ac-|', {
                a: { event: 'a' },
                c: { event: 'a' },
            })
            const subs = '^--!'
            const expected = '-c-|'

            expectObservable(e1.pipe(uniqueEventCounter(2, (e1, e2) => e1.event === e2.event, 2))).toBe(expected, {
                c: { value: { event: 'a' }, times: 2 },
            })
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })
})
