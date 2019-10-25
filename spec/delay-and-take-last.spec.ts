import { expect } from 'chai'
import { TestScheduler } from 'rxjs/testing'
import { delayAndTakeLast, wrappedWithDelay } from '../src/delay-and-take-last'

describe('delayAndTakeLast operator', () => {
    let testScheduler: TestScheduler
    beforeEach(() => {
        testScheduler = new TestScheduler((actual, expected) => {
            expect(actual).deep.equal(expected)
        })
    })

    it("should not delay events with no 'delay' property", () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold<wrappedWithDelay<string>>('a-|', { a: { event: 'a' } })
            const subs = '^-!'
            const expected = 'a-|'

            expectObservable(e1.pipe(delayAndTakeLast())).toBe(expected)
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })

    it('should emit delayed event when delay time end', () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold<wrappedWithDelay<string>>('a---c-|', { a: { event: 'a', delay: 2 }, c: { event: 'c' } })
            const subs = '^-----!'
            const expected = '--a-c-|'

            expectObservable(e1.pipe(delayAndTakeLast())).toBe(expected)
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })

    it('should throw delayed event if emitting newer events that is not delayed', () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold<wrappedWithDelay<string>>('b-c--|', { b: { event: 'b', delay: 2 }, c: { event: 'c' } })
            const subs = '^----!'
            const expected = '--c--|'

            expectObservable(e1.pipe(delayAndTakeLast())).toBe(expected)
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })

    it('should throw delayed event if emitting newer events that is delayed', () => {
        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold<wrappedWithDelay<string>>('a-c--|', { a: { event: 'a', delay: 4 }, c: { event: 'c', delay: 1 } })
            const subs = '^----!'
            const expected = '---c-|'

            expectObservable(e1.pipe(delayAndTakeLast())).toBe(expected)
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })
})
