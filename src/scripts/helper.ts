export function debounce(func, delay = 600) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
}

export function throttle(func, delay) {
	let lastCall = 0;

	return function (...args) {
		const now = new Date().getTime();

		if (now - lastCall >= delay) {
			lastCall = now;
			return func.apply(this, args);
		}
	};
}
