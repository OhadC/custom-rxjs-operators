import { expect } from 'chai'
import { TestScheduler } from 'rxjs/testing'
import { uniqueEventCounter } from './unique-event-counter'

describe('unique-event-counter', () => {
    it('should register single clicks', () => {
        const testScheduler = new TestScheduler((actual, expected) => {
            expect(actual).deep.equal(expected)
        })

        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold<string>('-a--b--c-|')
            const subs = '^--------!'
            const expected = '-a--b--c-|'

            expectObservable(e1.pipe(uniqueEventCounter(2, undefined, 1))).toBe(expected, {
                a: { value: 'a', times: 1 },
                b: { value: 'b', times: 1 },
                c: { value: 'c', times: 1 },
            })
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })

    it('should register single and double clicks', () => {
        const testScheduler = new TestScheduler((actual, expected) => {
            expect(actual).deep.equal(expected)
        })

        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold<string>('-aa--b---c----|')
            const subs = '^-------------!'
            const expected = '--a-----b---c-|'

            expectObservable(e1.pipe(uniqueEventCounter(3, undefined, 2))).toBe(expected, {
                a: { value: 'a', times: 2 },
                b: { value: 'b', times: 1 },
                c: { value: 'c', times: 1 },
            })
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })
})
