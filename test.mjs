import { suite } from 'uvu'
import * as assert from 'uvu/assert'

import make_semaphore from './index.mjs'
import defer from './p_defer.mjs'

const test = suite(`semaphore`)

test(`Blocks requests past the limit`, async() => {
	let a_fired = false
	let b_fired = false
	let c_fired = false

	const semaphore = make_semaphore(1)

	semaphore.lock().then(async unlock => {
		a_fired = true
		unlock()
	})
	semaphore.lock().then(async unlock => {
		assert.ok(a_fired)
		assert.not(c_fired)

		b_fired = true
		unlock()
	})
	await semaphore.lock().then(async unlock => {
		assert.ok(b_fired)
		c_fired = true
		unlock()
	})

	assert.ok(c_fired)
})

test(`get headroom`, async() => {
	const deferred = defer()

	const semaphore = make_semaphore(3)

	const lock_then_wait_on_deferred = () => semaphore.lock().then(
		unlock => deferred.promise.then(unlock),
	)

	const first_two = Promise.all([
		lock_then_wait_on_deferred(),
		lock_then_wait_on_deferred(),
	])

	assert.is(semaphore.headroom(), 1)

	deferred.resolve()

	await first_two

	assert.is(semaphore.headroom(), 3)
})

test(`readme example`, async() => {
	const delay_1s = () => new Promise(resolve => setTimeout(resolve, 1000))

	const semaphore = make_semaphore(2)

	const do_stuff = async() => {
		const unlock = await semaphore.lock()
		// console.log(`Totally doing work!`)
		await delay_1s()
		unlock()
	}

	do_stuff() // will start work right away
	do_stuff() // will start work right away
	do_stuff() // won't start until after one of the other workers finishes
})

test.run()
