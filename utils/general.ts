export function debounce(cb: (...args: any[]) => void, delay: number) {
	let timeout: NodeJS.Timeout
	return (...args: any[]) => {
		clearTimeout(timeout)
		timeout = setTimeout(() => {
			cb(...args)
		}, delay)
	}
}

export function throttle(cb: (...arg: any[]) => void, delay: number) {
	let shouldWait = false
	let waitingArgs: any[] | null = null

	function timeOut() {
		if (waitingArgs == null) {
			shouldWait = false
		} else {
			cb(...waitingArgs)
			waitingArgs = null
			setTimeout(timeOut, delay)
		}
	}

	return (...args: any[]) => {
		if (shouldWait) {
			waitingArgs = args
			return
		}
		cb(...args)
		shouldWait = true
		setTimeout(timeOut, delay)
	}
}
