import { expect } from 'chai'
import { TestScheduler } from 'rxjs/testing'
import { delayAndTakeLast, wrappedWithDelay } from './delay-and-take-last'

describe('delay-and-take-last', () => {
    it('should not undelayed event', () => {
        const testScheduler = new TestScheduler((actual, expected) => {
            expect(actual).deep.equal(expected)
        })

        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold<wrappedWithDelay<string>>('-a--b--c---|', { a: { event: 'a' }, b: { event: 'b', delay: 0 }, c: { event: 'c' } })
            const subs = '^----------!'
            const expected = '-a--b--c---|'

            expectObservable(e1.pipe(delayAndTakeLast())).toBe(expected)
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })

    it('should throw delayed event', () => {
        const testScheduler = new TestScheduler((actual, expected) => {
            expect(actual).deep.equal(expected)
        })

        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold<{
                event: string
                delay?: number
            }>('-a--b--c---|', { a: { event: 'a' }, b: { event: 'b', delay: 10 }, c: { event: 'c' } })
            const subs = '^----------!'
            const expected = '-a-----c---|'

            expectObservable(e1.pipe(delayAndTakeLast())).toBe(expected)
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })

    it('should emit delayed event', () => {
        const testScheduler = new TestScheduler((actual, expected) => {
            expect(actual).deep.equal(expected)
        })

        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers

            const e1 = cold<{
                event: string
                delay?: number
            }>('a---c|', { a: { event: 'a', delay: 2 }, c: { event: 'c' } })
            const subs = '^----!'
            const expected = '--a-c|'

            expectObservable(e1.pipe(delayAndTakeLast())).toBe(expected)
            expectSubscriptions(e1.subscriptions).toBe(subs)
        })
    })
})
