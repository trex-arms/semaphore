A [semaphore](https://en.wikipedia.org/wiki/Semaphore_(programming)) library for node/browsers.

Entry point is ESM.

## API

```js
import make_semaphore from '@trex-arms/semaphore'

const delay_1s = () => new Promise(resolve => setTimeout(resolve, 1000))

const semaphore = make_semaphore(2)

const do_stuff = async() => {
	const unlock = await semaphore.lock()
	console.log(`Totally doing work!`)
	await delay_1s()
	unlock()
}

do_stuff() // will start work right away
do_stuff() // will start work right away
do_stuff() // won't start until after one of the other workers finishes
```

### `semaphore = make_semaphore(limit)`

`limit` is how many locks are allowed at once.

Returns a semaphore object with two properties:

### `unlock_function_promise = semaphore.lock()`

Returns a promise that resolves as soon as a lock is free.  It resolves to an `unlock` function.  Calling that function will release the lock.

### `locks_free = semaphore.headroom()`

Returns the number of unclaimed locks that are currently free.
