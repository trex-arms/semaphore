import p_defer from './p_defer.mjs'

export default limit => {
	let count = 0
	const waiting = []

	const unlock = () => {
		count--
		const next_in_line = waiting.shift()
		if (next_in_line) {
			next_in_line.resolve()
		}
	}

	return {
		async lock() {
			if (count === limit) {
				const deferred = p_defer()
				waiting.push(deferred)
				await deferred.promise
			}
			count++
			let unlocked = false

			return () => {
				if (!unlocked) {
					unlocked = true
					unlock()
				}
			}
		},
		headroom() {
			return limit - count
		},
	}
}
