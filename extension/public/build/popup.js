var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	const identity = (x) => x;

	/**
	 * @template T
	 * @template S
	 * @param {T} tar
	 * @param {S} src
	 * @returns {T & S}
	 */
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return /** @type {T & S} */ (tar);
	}

	/** @returns {void} */
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	/** @param {number | string} value
	 * @returns {[number, string]}
	 */
	function split_css_unit(value) {
		const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
		return split ? [parseFloat(split[1]), split[2] || 'px'] : [/** @type {number} */ (value), 'px'];
	}

	const is_client = typeof window !== 'undefined';

	/** @type {() => number} */
	let now = is_client ? () => window.performance.now() : () => Date.now();

	let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;

	const tasks = new Set();

	/**
	 * @param {number} now
	 * @returns {void}
	 */
	function run_tasks(now) {
		tasks.forEach((task) => {
			if (!task.c(now)) {
				tasks.delete(task);
				task.f();
			}
		});
		if (tasks.size !== 0) raf(run_tasks);
	}

	/**
	 * Creates a new task that runs on each raf frame
	 * until it returns a falsy value or is aborted
	 * @param {import('./private.js').TaskCallback} callback
	 * @returns {import('./private.js').Task}
	 */
	function loop(callback) {
		/** @type {import('./private.js').TaskEntry} */
		let task;
		if (tasks.size === 0) raf(run_tasks);
		return {
			promise: new Promise((fulfill) => {
				tasks.add((task = { c: callback, f: fulfill }));
			}),
			abort() {
				tasks.delete(task);
			}
		};
	}

	/** @type {typeof globalThis} */
	const globals =
		typeof window !== 'undefined'
			? window
			: typeof globalThis !== 'undefined'
			? globalThis
			: // @ts-ignore Node typings have this
			  global;

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} node
	 * @returns {ShadowRoot | Document}
	 */
	function get_root_for_style(node) {
		if (!node) return document;
		const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
		if (root && /** @type {ShadowRoot} */ (root).host) {
			return /** @type {ShadowRoot} */ (root);
		}
		return node.ownerDocument;
	}

	/**
	 * @param {Node} node
	 * @returns {CSSStyleSheet}
	 */
	function append_empty_stylesheet(node) {
		const style_element = element('style');
		// For transitions to work without 'style-src: unsafe-inline' Content Security Policy,
		// these empty tags need to be allowed with a hash as a workaround until we move to the Web Animations API.
		// Using the hash for the empty string (for an empty tag) works in all browsers except Safari.
		// So as a workaround for the workaround, when we append empty style tags we set their content to /* empty */.
		// The hash 'sha256-9OlNO0DNEeaVzHL4RZwCLsBHA8WBQ8toBp/4F5XV2nc=' will then work even in Safari.
		style_element.textContent = '/* empty */';
		append_stylesheet(get_root_for_style(node), style_element);
		return style_element.sheet;
	}

	/**
	 * @param {ShadowRoot | Document} node
	 * @param {HTMLStyleElement} style
	 * @returns {CSSStyleSheet}
	 */
	function append_stylesheet(node, style) {
		append(/** @type {Document} */ (node).head || node, style);
		return style.sheet;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @template {keyof SVGElementTagNameMap} K
	 * @param {K} name
	 * @returns {SVGElement}
	 */
	function svg_element(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @returns {(event: any) => any} */
	function prevent_default(fn) {
		return function (event) {
			event.preventDefault();
			// @ts-ignore
			return fn.call(this, event);
		};
	}

	/**
	 * @returns {(event: any) => any} */
	function stop_propagation(fn) {
		return function (event) {
			event.stopPropagation();
			// @ts-ignore
			return fn.call(this, event);
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}
	/**
	 * List of attributes that should always be set through the attr method,
	 * because updating them through the property setter doesn't work reliably.
	 * In the example of `width`/`height`, the problem is that the setter only
	 * accepts numeric values, but the attribute can also be set to a string like `50%`.
	 * If this list becomes too big, rethink this approach.
	 */
	const always_set_through_set_attribute = ['width', 'height'];

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {{ [x: string]: string }} attributes
	 * @returns {void}
	 */
	function set_attributes(node, attributes) {
		// @ts-ignore
		const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
		for (const key in attributes) {
			if (attributes[key] == null) {
				node.removeAttribute(key);
			} else if (key === 'style') {
				node.style.cssText = attributes[key];
			} else if (key === '__value') {
				/** @type {any} */ (node).value = node[key] = attributes[key];
			} else if (
				descriptors[key] &&
				descriptors[key].set &&
				always_set_through_set_attribute.indexOf(key) === -1
			) {
				node[key] = attributes[key];
			} else {
				attr(node, key, attributes[key]);
			}
		}
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @returns {void} */
	function set_style(node, key, value, important) {
		if (value == null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, important ? 'important' : '');
		}
	}

	/**
	 * @returns {void} */
	function toggle_class(element, name, toggle) {
		// The `!!` is required because an `undefined` flag means flipping the current state.
		element.classList.toggle(name, !!toggle);
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	// we need to store the information for multiple documents because a Svelte application could also contain iframes
	// https://github.com/sveltejs/svelte/issues/3624
	/** @type {Map<Document | ShadowRoot, import('./private.d.ts').StyleInformation>} */
	const managed_styles = new Map();

	let active = 0;

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	/**
	 * @param {string} str
	 * @returns {number}
	 */
	function hash(str) {
		let hash = 5381;
		let i = str.length;
		while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
		return hash >>> 0;
	}

	/**
	 * @param {Document | ShadowRoot} doc
	 * @param {Element & ElementCSSInlineStyle} node
	 * @returns {{ stylesheet: any; rules: {}; }}
	 */
	function create_style_information(doc, node) {
		const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
		managed_styles.set(doc, info);
		return info;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {number} a
	 * @param {number} b
	 * @param {number} duration
	 * @param {number} delay
	 * @param {(t: number) => number} ease
	 * @param {(t: number, u: number) => string} fn
	 * @param {number} uid
	 * @returns {string}
	 */
	function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
		const step = 16.666 / duration;
		let keyframes = '{\n';
		for (let p = 0; p <= 1; p += step) {
			const t = a + (b - a) * ease(p);
			keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
		}
		const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
		const name = `__svelte_${hash(rule)}_${uid}`;
		const doc = get_root_for_style(node);
		const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
		if (!rules[name]) {
			rules[name] = true;
			stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
		}
		const animation = node.style.animation || '';
		node.style.animation = `${
		animation ? `${animation}, ` : ''
	}${name} ${duration}ms linear ${delay}ms 1 both`;
		active += 1;
		return name;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {string} [name]
	 * @returns {void}
	 */
	function delete_rule(node, name) {
		const previous = (node.style.animation || '').split(', ');
		const next = previous.filter(
			name
				? (anim) => anim.indexOf(name) < 0 // remove specific animation
				: (anim) => anim.indexOf('__svelte') === -1 // remove all Svelte animations
		);
		const deleted = previous.length - next.length;
		if (deleted) {
			node.style.animation = next.join(', ');
			active -= deleted;
			if (!active) clear_rules();
		}
	}

	/** @returns {void} */
	function clear_rules() {
		raf(() => {
			if (active) return;
			managed_styles.forEach((info) => {
				const { ownerNode } = info.stylesheet;
				// there is no ownerNode if it runs on jsdom.
				if (ownerNode) detach(ownerNode);
			});
			managed_styles.clear();
		});
	}

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](https://svelte.dev/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * @template T
	 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}

	/**
	 * Schedules a callback to run immediately after the component has been updated.
	 *
	 * The first time the callback runs will be after the initial `onMount`
	 *
	 * https://svelte.dev/docs/svelte#afterupdate
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function afterUpdate(fn) {
		get_current_component().$$.after_update.push(fn);
	}

	/**
	 * Schedules a callback to run immediately before the component is unmounted.
	 *
	 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
	 * only one that runs inside a server-side component.
	 *
	 * https://svelte.dev/docs/svelte#ondestroy
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function onDestroy(fn) {
		get_current_component().$$.on_destroy.push(fn);
	}

	/**
	 * Creates an event dispatcher that can be used to dispatch [component events](https://svelte.dev/docs#template-syntax-component-directives-on-eventname).
	 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
	 *
	 * Component events created with `createEventDispatcher` create a
	 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
	 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
	 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
	 * property and can contain any type of data.
	 *
	 * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
	 * ```ts
	 * const dispatch = createEventDispatcher<{
	 *  loaded: never; // does not take a detail argument
	 *  change: string; // takes a detail argument of type string, which is required
	 *  optional: number | null; // takes an optional detail argument of type number
	 * }>();
	 * ```
	 *
	 * https://svelte.dev/docs/svelte#createeventdispatcher
	 * @template {Record<string, any>} [EventMap=any]
	 * @returns {import('./public.js').EventDispatcher<EventMap>}
	 */
	function createEventDispatcher() {
		const component = get_current_component();
		return (type, detail, { cancelable = false } = {}) => {
			const callbacks = component.$$.callbacks[type];
			if (callbacks) {
				// TODO are there situations where events could be dispatched
				// in a server (non-DOM) environment?
				const event = custom_event(/** @type {string} */ (type), detail, { cancelable });
				callbacks.slice().forEach((fn) => {
					fn.call(component, event);
				});
				return !event.defaultPrevented;
			}
			return true;
		};
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	/**
	 * @type {Promise<void> | null}
	 */
	let promise;

	/**
	 * @returns {Promise<void>}
	 */
	function wait() {
		if (!promise) {
			promise = Promise.resolve();
			promise.then(() => {
				promise = null;
			});
		}
		return promise;
	}

	/**
	 * @param {Element} node
	 * @param {INTRO | OUTRO | boolean} direction
	 * @param {'start' | 'end'} kind
	 * @returns {void}
	 */
	function dispatch(node, direction, kind) {
		node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/**
	 * @type {import('../transition/public.js').TransitionConfig}
	 */
	const null_transition = { duration: 0 };

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {TransitionFn} fn
	 * @param {any} params
	 * @returns {{ start(): void; invalidate(): void; end(): void; }}
	 */
	function create_in_transition(node, fn, params) {
		/**
		 * @type {TransitionOptions} */
		const options = { direction: 'in' };
		let config = fn(node, params, options);
		let running = false;
		let animation_name;
		let task;
		let uid = 0;

		/**
		 * @returns {void} */
		function cleanup() {
			if (animation_name) delete_rule(node, animation_name);
		}

		/**
		 * @returns {void} */
		function go() {
			const {
				delay = 0,
				duration = 300,
				easing = identity,
				tick = noop,
				css
			} = config || null_transition;
			if (css) animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
			tick(0, 1);
			const start_time = now() + delay;
			const end_time = start_time + duration;
			if (task) task.abort();
			running = true;
			add_render_callback(() => dispatch(node, true, 'start'));
			task = loop((now) => {
				if (running) {
					if (now >= end_time) {
						tick(1, 0);
						dispatch(node, true, 'end');
						cleanup();
						return (running = false);
					}
					if (now >= start_time) {
						const t = easing((now - start_time) / duration);
						tick(t, 1 - t);
					}
				}
				return running;
			});
		}
		let started = false;
		return {
			start() {
				if (started) return;
				started = true;
				delete_rule(node);
				if (is_function(config)) {
					config = config(options);
					wait().then(go);
				} else {
					go();
				}
			},
			invalidate() {
				started = false;
			},
			end() {
				if (running) {
					cleanup();
					running = false;
				}
			}
		};
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {TransitionFn} fn
	 * @param {any} params
	 * @returns {{ end(reset: any): void; }}
	 */
	function create_out_transition(node, fn, params) {
		/** @type {TransitionOptions} */
		const options = { direction: 'out' };
		let config = fn(node, params, options);
		let running = true;
		let animation_name;
		const group = outros;
		group.r += 1;
		/** @type {boolean} */
		let original_inert_value;

		/**
		 * @returns {void} */
		function go() {
			const {
				delay = 0,
				duration = 300,
				easing = identity,
				tick = noop,
				css
			} = config || null_transition;

			if (css) animation_name = create_rule(node, 1, 0, duration, delay, easing, css);

			const start_time = now() + delay;
			const end_time = start_time + duration;
			add_render_callback(() => dispatch(node, false, 'start'));

			if ('inert' in node) {
				original_inert_value = /** @type {HTMLElement} */ (node).inert;
				node.inert = true;
			}

			loop((now) => {
				if (running) {
					if (now >= end_time) {
						tick(0, 1);
						dispatch(node, false, 'end');
						if (!--group.r) {
							// this will result in `end()` being called,
							// so we don't need to clean up here
							run_all(group.c);
						}
						return false;
					}
					if (now >= start_time) {
						const t = easing((now - start_time) / duration);
						tick(1 - t, t);
					}
				}
				return running;
			});
		}

		if (is_function(config)) {
			wait().then(() => {
				// @ts-ignore
				config = config(options);
				go();
			});
		} else {
			go();
		}

		return {
			end(reset) {
				if (reset && 'inert' in node) {
					node.inert = original_inert_value;
				}
				if (reset && config.tick) {
					config.tick(1, 0);
				}
				if (running) {
					if (animation_name) delete_rule(node, animation_name);
					running = false;
				}
			}
		};
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {{}} */
	function get_spread_update(levels, updates) {
		const update = {};
		const to_null_out = {};
		const accounted_for = { $$scope: 1 };
		let i = levels.length;
		while (i--) {
			const o = levels[i];
			const n = updates[i];
			if (n) {
				for (const key in o) {
					if (!(key in n)) to_null_out[key] = 1;
				}
				for (const key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}
				levels[i] = n;
			} else {
				for (const key in o) {
					accounted_for[key] = 1;
				}
			}
		}
		for (const key in to_null_out) {
			if (!(key in update)) update[key] = undefined;
		}
		return update;
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION = '4.2.19';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Node} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @param {boolean} [has_prevent_default]
	 * @param {boolean} [has_stop_propagation]
	 * @param {boolean} [has_stop_immediate_propagation]
	 * @returns {() => void}
	 */
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation,
		has_stop_immediate_propagation
	) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.data === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = /** @type {string} */ (data);
	}

	function ensure_array_like_dev(arg) {
		if (
			typeof arg !== 'string' &&
			!(arg && typeof arg === 'object' && 'length' in arg) &&
			!(typeof Symbol === 'function' && arg && Symbol.iterator in arg)
		) {
			throw new Error('{#each} only works with iterable values.');
		}
		return ensure_array_like(arg);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	/* src/lib/components/basic/icons/eye.svelte generated by Svelte v4.2.19 */
	const file$z = "src/lib/components/basic/icons/eye.svelte";

	function create_fragment$z(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill-rule", "evenodd");
				attr_dev(path, "clip-rule", "evenodd");
				attr_dev(path, "d", "M2.06518 12.31C2.19518 12.6 5.34018 19.5 12.0002 19.5C18.6602 19.5 21.8052 12.605 21.9352 12.31L22.0802 11.98L21.9152 11.66C21.7652 11.365 18.1352 4.5 12.0002 4.5C5.34018 4.5 2.19518 11.405 2.06518 11.7L1.93018 12.005L2.06518 12.31ZM12.0002 18C7.05018 18 4.24518 13.265 3.58518 12.005C4.24518 10.74 7.05518 6 12.0002 6C16.5252 6 19.6352 10.73 20.4002 12.025C19.7202 13.32 16.9502 18 12.0002 18ZM8.00018 12C8.00018 14.205 9.79518 16 12.0002 16C14.2052 16 16.0002 14.205 16.0002 12C16.0002 9.795 14.2052 8 12.0002 8C9.79518 8 8.00018 9.795 8.00018 12ZM9.50018 12C9.50018 10.62 10.6202 9.5 12.0002 9.5C13.3802 9.5 14.5002 10.62 14.5002 12C14.5002 13.38 13.3802 14.5 12.0002 14.5C10.6202 14.5 9.50018 13.38 9.50018 12Z");
				attr_dev(path, "fill", /*color*/ ctx[0]);
				add_location(path, file$z, 11, 1, 154);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "24");
				attr_dev(svg, "height", "24");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				add_location(svg, file$z, 4, 0, 51);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*color*/ 1) {
					attr_dev(path, "fill", /*color*/ ctx[0]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$z.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$z($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Eye', slots, []);
		let { color = "#85889C" } = $$props;
		const writable_props = ['color'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Eye> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		$$self.$capture_state = () => ({ color });

		$$self.$inject_state = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [color];
	}

	class Eye extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$z, create_fragment$z, safe_not_equal, { color: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Eye",
				options,
				id: create_fragment$z.name
			});
		}

		get color() {
			throw new Error("<Eye>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<Eye>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/dashboard/components/Loader.svelte generated by Svelte v4.2.19 */
	const file$y = "src/lib/components/dashboard/components/Loader.svelte";

	function create_fragment$y(ctx) {
		let div1;
		let div0;

		const block = {
			c: function create() {
				div1 = element("div");
				div0 = element("div");
				attr_dev(div0, "class", "spinner svelte-15gwnn8");
				add_location(div0, file$y, 38, 1, 629);
				attr_dev(div1, "class", "loader svelte-15gwnn8");
				set_style(div1, "--color", /*color*/ ctx[1]);
				set_style(div1, "--duration", /*duration*/ ctx[2] + "s");
				set_style(div1, "width", /*size*/ ctx[0] + "px");
				set_style(div1, "height", /*size*/ ctx[0] + "px");
				add_location(div1, file$y, 34, 0, 518);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*color*/ 2) {
					set_style(div1, "--color", /*color*/ ctx[1]);
				}

				if (dirty & /*duration*/ 4) {
					set_style(div1, "--duration", /*duration*/ ctx[2] + "s");
				}

				if (dirty & /*size*/ 1) {
					set_style(div1, "width", /*size*/ ctx[0] + "px");
				}

				if (dirty & /*size*/ 1) {
					set_style(div1, "height", /*size*/ ctx[0] + "px");
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$y.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$y($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Loader', slots, []);
		let { size = 24 } = $$props;
		let { color = "#000" } = $$props;
		let { duration = 1 } = $$props;
		const writable_props = ['size', 'color', 'duration'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Loader> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('size' in $$props) $$invalidate(0, size = $$props.size);
			if ('color' in $$props) $$invalidate(1, color = $$props.color);
			if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
		};

		$$self.$capture_state = () => ({ size, color, duration });

		$$self.$inject_state = $$props => {
			if ('size' in $$props) $$invalidate(0, size = $$props.size);
			if ('color' in $$props) $$invalidate(1, color = $$props.color);
			if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [size, color, duration];
	}

	class Loader extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$y, create_fragment$y, safe_not_equal, { size: 0, color: 1, duration: 2 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Loader",
				options,
				id: create_fragment$y.name
			});
		}

		get size() {
			throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set size(value) {
			throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get color() {
			throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get duration() {
			throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set duration(value) {
			throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/basic/icons/locked.svelte generated by Svelte v4.2.19 */
	const file$x = "src/lib/components/basic/icons/locked.svelte";

	function create_fragment$x(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill-rule", "evenodd");
				attr_dev(path, "clip-rule", "evenodd");
				attr_dev(path, "d", "M18 8V10.605C19.15 10.935 20 11.995 20 13.25V19.25C20 20.765 18.765 22 17.25 22H6.75C5.235 22 4 20.765 4 19.25V13.25C4 11.99 4.85 10.935 6 10.605V8C6 4.69 8.69 2 12 2C15.31 2 18 4.69 18 8ZM16.5 8C16.5 5.52 14.48 3.5 12 3.5C9.52 3.5 7.5 5.52 7.5 8V10.5H16.5V8ZM17.25 20.5C17.94 20.5 18.5 19.94 18.5 19.25V13.25C18.5 12.56 17.94 12 17.25 12H6.75C6.06 12 5.5 12.56 5.5 13.25V19.25C5.5 19.94 6.06 20.5 6.75 20.5H17.25ZM12 14C12.83 14 13.5 14.67 13.5 15.5C13.5 16.05 13.195 16.53 12.75 16.79V18.5H11.25V16.79C10.805 16.53 10.5 16.055 10.5 15.5C10.5 14.67 11.17 14 12 14Z");
				attr_dev(path, "fill", /*color*/ ctx[0]);
				add_location(path, file$x, 11, 1, 154);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "24");
				attr_dev(svg, "height", "24");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				add_location(svg, file$x, 4, 0, 51);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*color*/ 1) {
					attr_dev(path, "fill", /*color*/ ctx[0]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$x.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$x($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Locked', slots, []);
		let { color = "#89B4FA" } = $$props;
		const writable_props = ['color'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Locked> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		$$self.$capture_state = () => ({ color });

		$$self.$inject_state = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [color];
	}

	class Locked extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$x, create_fragment$x, safe_not_equal, { color: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Locked",
				options,
				id: create_fragment$x.name
			});
		}

		get color() {
			throw new Error("<Locked>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<Locked>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/basic/icons/unlocked.svelte generated by Svelte v4.2.19 */
	const file$w = "src/lib/components/basic/icons/unlocked.svelte";

	function create_fragment$w(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill-rule", "evenodd");
				attr_dev(path, "clip-rule", "evenodd");
				attr_dev(path, "d", "M7.50012 10.5H17.2451C18.7601 10.5 19.9951 11.735 19.9951 13.25V19.25C19.9951 20.765 18.7601 22 17.2451 22H6.74512C5.23012 22 3.99512 20.765 3.99512 19.25V13.25C3.99512 11.99 4.84512 10.935 5.99512 10.605V8.005C5.99512 4.7 8.68512 2.005 11.9951 2.005C14.4151 2.005 16.5851 3.445 17.5251 5.67L16.1451 6.255C15.4401 4.585 13.8151 3.505 12.0001 3.505C9.52012 3.505 7.50012 5.525 7.50012 8.005V10.5ZM17.2501 20.5C17.9401 20.5 18.5001 19.94 18.5001 19.25V13.25C18.5001 12.56 17.9401 12 17.2501 12H6.75012C6.06012 12 5.50012 12.56 5.50012 13.25V19.25C5.50012 19.94 6.06012 20.5 6.75012 20.5H17.2501ZM12.0001 13.9996C12.8301 13.9996 13.5001 14.6696 13.5001 15.4996C13.5001 16.0496 13.1951 16.5296 12.7501 16.7896V18.4996H11.2501V16.7896C10.8051 16.5296 10.5001 16.0546 10.5001 15.4996C10.5001 14.6696 11.1701 13.9996 12.0001 13.9996Z");
				attr_dev(path, "fill", "#85889C");
				add_location(path, file$w, 7, 1, 103);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "24");
				attr_dev(svg, "height", "24");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				add_location(svg, file$w, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$w.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$w($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Unlocked', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Unlocked> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class Unlocked extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Unlocked",
				options,
				id: create_fragment$w.name
			});
		}
	}

	/* src/lib/components/basic/icons/copyIcon.svelte generated by Svelte v4.2.19 */
	const file$v = "src/lib/components/basic/icons/copyIcon.svelte";

	function create_fragment$v(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill-rule", "evenodd");
				attr_dev(path, "clip-rule", "evenodd");
				attr_dev(path, "d", "M7.25 18H19.75C20.44 18 21 17.44 21 16.75V4.25C21 3.56 20.44 3 19.75 3H7.25C6.56 3 6 3.56 6 4.25V16.75C6 17.44 6.56 18 7.25 18ZM19.5 16.5H7.5V4.5H19.5V16.5ZM5.75 21H18V19.5H5.75C5.06 19.5 4.5 18.94 4.5 18.25V6.00003H3V18.25C3 19.765 4.235 21 5.75 21Z");
				attr_dev(path, "fill", /*color*/ ctx[0]);
				add_location(path, file$v, 11, 1, 154);
				attr_dev(svg, "width", "24");
				attr_dev(svg, "height", "24");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$v, 4, 0, 51);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*color*/ 1) {
					attr_dev(path, "fill", /*color*/ ctx[0]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$v.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$v($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('CopyIcon', slots, []);
		let { color = "#85889C" } = $$props;
		const writable_props = ['color'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CopyIcon> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		$$self.$capture_state = () => ({ color });

		$$self.$inject_state = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [color];
	}

	class CopyIcon extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$v, create_fragment$v, safe_not_equal, { color: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "CopyIcon",
				options,
				id: create_fragment$v.name
			});
		}

		get color() {
			throw new Error("<CopyIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<CopyIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/basic/icons/activeCopy.svelte generated by Svelte v4.2.19 */
	const file$u = "src/lib/components/basic/icons/activeCopy.svelte";

	function create_fragment$u(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill-rule", "evenodd");
				attr_dev(path, "clip-rule", "evenodd");
				attr_dev(path, "d", "M7.25 18H19.75C20.44 18 21 17.44 21 16.75V4.25C21 3.56 20.44 3 19.75 3H7.25C6.56 3 6 3.56 6 4.25V16.75C6 17.44 6.56 18 7.25 18ZM19.5 16.5H7.5V4.5H19.5V16.5ZM5.75 21H18V19.5H5.75C5.06 19.5 4.5 18.94 4.5 18.25V6.00003H3V18.25C3 19.765 4.235 21 5.75 21Z");
				attr_dev(path, "fill", "#BFC0CC");
				add_location(path, file$u, 7, 1, 103);
				attr_dev(svg, "width", "24");
				attr_dev(svg, "height", "24");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$u, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$u.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$u($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ActiveCopy', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ActiveCopy> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class ActiveCopy extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$u, create_fragment$u, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "ActiveCopy",
				options,
				id: create_fragment$u.name
			});
		}
	}

	/* src/lib/components/basic/icons/closedEye.svelte generated by Svelte v4.2.19 */
	const file$t = "src/lib/components/basic/icons/closedEye.svelte";

	function create_fragment$t(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill-rule", "evenodd");
				attr_dev(path, "clip-rule", "evenodd");
				attr_dev(path, "d", "M22.0802 11.98L21.9352 12.31C21.8552 12.49 20.6552 15.125 18.2152 17.155L21.2802 20.22L20.2202 21.28L2.72018 3.77997L3.78018 2.71997L7.01518 5.95497C8.38018 5.09997 10.0352 4.49997 12.0002 4.49997C18.1352 4.49997 21.7652 11.37 21.9152 11.66L22.0802 11.98ZM10.8502 9.78997L14.2102 13.15C14.3902 12.805 14.5002 12.415 14.5002 12C14.5002 10.62 13.3802 9.49997 12.0002 9.49997C11.5802 9.49997 11.1952 9.60997 10.8502 9.78997ZM16.0002 12C16.0002 12.835 15.7402 13.605 15.3052 14.245L17.1252 16.065C18.9102 14.615 20.0052 12.765 20.3952 12.02C19.6302 10.725 16.5252 5.99497 11.9952 5.99497C10.5102 5.99497 9.22518 6.42997 8.12518 7.06497L9.75518 8.69497C10.3952 8.25997 11.1702 7.99997 12.0002 7.99997C14.2052 7.99997 16.0002 9.79497 16.0002 12ZM3.58518 12.005C4.24518 13.265 7.05518 18 12.0002 18C12.8702 18 13.6752 17.845 14.4152 17.595L15.5902 18.77C14.5302 19.22 13.3402 19.5 12.0002 19.5C5.34018 19.5 2.19518 12.605 2.06518 12.31L1.93018 12.005L2.06518 11.7C2.06646 11.6973 2.06801 11.6939 2.06982 11.69C2.1668 11.4813 3.02142 9.64201 4.69518 7.875L5.77018 8.95C4.61018 10.175 3.88018 11.44 3.58518 12.005Z");
				attr_dev(path, "fill", /*color*/ ctx[0]);
				add_location(path, file$t, 11, 1, 154);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "24");
				attr_dev(svg, "height", "24");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				add_location(svg, file$t, 4, 0, 51);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*color*/ 1) {
					attr_dev(path, "fill", /*color*/ ctx[0]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$t.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$t($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ClosedEye', slots, []);
		let { color = "#85889C" } = $$props;
		const writable_props = ['color'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ClosedEye> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		$$self.$capture_state = () => ({ color });

		$$self.$inject_state = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [color];
	}

	class ClosedEye extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$t, create_fragment$t, safe_not_equal, { color: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "ClosedEye",
				options,
				id: create_fragment$t.name
			});
		}

		get color() {
			throw new Error("<ClosedEye>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<ClosedEye>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/basic/icons/lens.svelte generated by Svelte v4.2.19 */
	const file$s = "src/lib/components/basic/icons/lens.svelte";

	function create_fragment$s(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "d", "M16.9365 16.9453C16.8199 17.0602 16.6628 17.1247 16.499 17.125C16.3331 17.1243 16.1737 17.06 16.0537 16.9453L12.6787 13.5625C11.2573 14.7564 9.42983 15.3555 7.57746 15.2348C5.72509 15.114 3.99084 14.2828 2.7364 12.9146C1.48197 11.5463 0.804205 9.7465 0.84447 7.89063C0.884735 6.03477 1.63992 4.2661 2.95252 2.9535C4.26512 1.6409 6.03379 0.885712 7.88966 0.845447C9.74552 0.805181 11.5453 1.48294 12.9136 2.73738C14.2819 3.99182 15.1131 5.72607 15.2338 7.57844C15.3545 9.43081 14.7554 11.2583 13.5615 12.6797L16.9365 16.0547C16.9956 16.1128 17.0425 16.1822 17.0745 16.2586C17.1065 16.3351 17.123 16.4171 17.123 16.5C17.123 16.5829 17.1065 16.6649 17.0745 16.7414C17.0425 16.8178 16.9956 16.8872 16.9365 16.9453ZM8.06152 14C9.23585 14 10.3838 13.6518 11.3602 12.9994C12.3366 12.3469 13.0977 11.4196 13.5471 10.3347C13.9965 9.24975 14.114 8.05591 13.8849 6.90415C13.6558 5.75239 13.0903 4.69443 12.26 3.86405C11.4296 3.03368 10.3716 2.46819 9.21987 2.23909C8.06811 2.00999 6.87428 2.12757 5.78934 2.57696C4.7044 3.02636 3.77709 3.78738 3.12467 4.7638C2.47225 5.74022 2.12402 6.88817 2.12402 8.0625C2.12609 9.63659 2.75231 11.1456 3.86536 12.2587C4.97841 13.3717 6.48743 13.9979 8.06152 14Z");
				attr_dev(path, "fill", "#30363D");
				add_location(path, file$s, 7, 1, 103);
				attr_dev(svg, "width", "18");
				attr_dev(svg, "height", "18");
				attr_dev(svg, "viewBox", "0 0 18 18");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$s, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$s.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$s($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Lens', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Lens> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class Lens extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Lens",
				options,
				id: create_fragment$s.name
			});
		}
	}

	/* src/lib/components/basic/icons/downArrow.svelte generated by Svelte v4.2.19 */
	const file$r = "src/lib/components/basic/icons/downArrow.svelte";

	function create_fragment$r(ctx) {
		let svg;
		let path;
		let path_fill_value;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "d", "M11.9997 16.0402C11.6797 16.0402 11.3597 15.9202 11.1147 15.6752L5.21973 9.78021L6.27973 8.72021L11.9997 14.4402L17.7197 8.72021L18.7797 9.78021L12.8847 15.6752C12.6397 15.9202 12.3197 16.0402 11.9997 16.0402Z");
				attr_dev(path, "fill", path_fill_value = setbackground(/*type*/ ctx[0]));
				add_location(path, file$r, 23, 1, 410);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "20");
				attr_dev(svg, "height", "20");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				add_location(svg, file$r, 16, 0, 307);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*type*/ 1 && path_fill_value !== (path_fill_value = setbackground(/*type*/ ctx[0]))) {
					attr_dev(path, "fill", path_fill_value);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$r.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function setbackground(type) {
		const typeToClassMap = {
			reader: "#F9E2AF",
			manager: "#F5C2E7",
			owner: "#A6E3A1",
			common: "#6E7681",
			indicator: "#74C7EC",
			profile: "#85889C",
			profileActive: "#F2F2F0"
		};

		return typeToClassMap[type] || "";
	}

	function instance$r($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('DownArrow', slots, []);
		let { type } = $$props;

		$$self.$$.on_mount.push(function () {
			if (type === undefined && !('type' in $$props || $$self.$$.bound[$$self.$$.props['type']])) {
				console.warn("<DownArrow> was created without expected prop 'type'");
			}
		});

		const writable_props = ['type'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DownArrow> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('type' in $$props) $$invalidate(0, type = $$props.type);
		};

		$$self.$capture_state = () => ({ type, setbackground });

		$$self.$inject_state = $$props => {
			if ('type' in $$props) $$invalidate(0, type = $$props.type);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [type];
	}

	class DownArrow extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$r, create_fragment$r, safe_not_equal, { type: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "DownArrow",
				options,
				id: create_fragment$r.name
			});
		}

		get type() {
			throw new Error("<DownArrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set type(value) {
			throw new Error("<DownArrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/basic/icons/rightArrow.svelte generated by Svelte v4.2.19 */
	const file$q = "src/lib/components/basic/icons/rightArrow.svelte";

	function create_fragment$q(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "d", "M16.04 12.0003C16.04 12.3203 15.92 12.6403 15.675 12.8853L9.77997 18.7803L8.71997 17.7203L14.44 12.0003L8.71997 6.28027L9.77997 5.22027L15.675 11.1153C15.92 11.3603 16.04 11.6803 16.04 12.0003Z");
				attr_dev(path, "fill", /*color*/ ctx[0]);
				add_location(path, file$q, 11, 1, 154);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "20");
				attr_dev(svg, "height", "20");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				add_location(svg, file$q, 4, 0, 51);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*color*/ 1) {
					attr_dev(path, "fill", /*color*/ ctx[0]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$q.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$q($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('RightArrow', slots, []);
		let { color = "#6E7681" } = $$props;
		const writable_props = ['color'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RightArrow> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		$$self.$capture_state = () => ({ color });

		$$self.$inject_state = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [color];
	}

	class RightArrow extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$q, create_fragment$q, safe_not_equal, { color: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "RightArrow",
				options,
				id: create_fragment$q.name
			});
		}

		get color() {
			throw new Error("<RightArrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<RightArrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/basic/icons/add.svelte generated by Svelte v4.2.19 */
	const file$p = "src/lib/components/basic/icons/add.svelte";

	function create_fragment$p(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "d", "M13 11.25V11.5H13.25H20.25V12.5H13.25H13V12.75V19.75H12V12.75V12.5H11.75H4.75V11.5H11.75H12V11.25V4.25H13V11.25Z");
				attr_dev(path, "fill", /*color*/ ctx[0]);
				attr_dev(path, "stroke", /*color*/ ctx[0]);
				attr_dev(path, "stroke-width", "1");
				add_location(path, file$p, 11, 1, 154);
				attr_dev(svg, "width", "20");
				attr_dev(svg, "height", "20");
				attr_dev(svg, "viewBox", "0 0 25 24");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$p, 4, 0, 51);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*color*/ 1) {
					attr_dev(path, "fill", /*color*/ ctx[0]);
				}

				if (dirty & /*color*/ 1) {
					attr_dev(path, "stroke", /*color*/ ctx[0]);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$p.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$p($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Add', slots, []);
		let { color = "#010409" } = $$props;
		const writable_props = ['color'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Add> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		$$self.$capture_state = () => ({ color });

		$$self.$inject_state = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [color];
	}

	class Add extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$p, create_fragment$p, safe_not_equal, { color: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Add",
				options,
				id: create_fragment$p.name
			});
		}

		get color() {
			throw new Error("<Add>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<Add>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/basic/icons/logo.svelte generated by Svelte v4.2.19 */
	const file$o = "src/lib/components/basic/icons/logo.svelte";

	function create_fragment$o(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "d", "M16.196 37.576C13.7 37.576 11.412 36.984 9.332 35.8C7.284 34.616 5.652 33 4.436 30.952C3.22 28.904 2.612 26.584 2.612 23.992C2.612 21.368 3.22 19.048 4.436 17.032C5.652 14.984 7.284 13.384 9.332 12.232C11.38 11.048 13.668 10.456 16.196 10.456C18.756 10.456 21.044 11.048 23.06 12.232C25.108 13.384 26.724 14.984 27.908 17.032C29.124 19.048 29.732 21.368 29.732 23.992C29.732 26.616 29.124 28.952 27.908 31C26.692 33.048 25.06 34.664 23.012 35.848C20.964 37 18.692 37.576 16.196 37.576ZM16.196 32.536C17.732 32.536 19.092 32.168 20.276 31.432C21.46 30.696 22.388 29.688 23.06 28.408C23.764 27.096 24.116 25.624 24.116 23.992C24.116 22.36 23.764 20.904 23.06 19.624C22.388 18.344 21.46 17.336 20.276 16.6C19.092 15.864 17.732 15.496 16.196 15.496C14.692 15.496 13.332 15.864 12.116 16.6C10.932 17.336 9.988 18.344 9.284 19.624C8.612 20.904 8.276 22.36 8.276 23.992C8.276 25.624 8.612 27.096 9.284 28.408C9.988 29.688 10.932 30.696 12.116 31.432C13.332 32.168 14.692 32.536 16.196 32.536ZM44.6274 37.576C41.9714 37.576 39.6354 36.92 37.6194 35.608C35.6354 34.296 34.2434 32.536 33.4434 30.328L37.6194 28.36C38.3234 29.832 39.2834 31 40.4994 31.864C41.7474 32.728 43.1234 33.16 44.6274 33.16C45.9074 33.16 46.9474 32.872 47.7474 32.296C48.5474 31.72 48.9474 30.936 48.9474 29.944C48.9474 29.304 48.7714 28.792 48.4194 28.408C48.0674 27.992 47.6194 27.656 47.0754 27.4C46.5634 27.144 46.0354 26.952 45.4914 26.824L41.4114 25.672C39.1714 25.032 37.4914 24.072 36.3714 22.792C35.2834 21.48 34.7394 19.96 34.7394 18.232C34.7394 16.664 35.1394 15.304 35.9394 14.152C36.7394 12.968 37.8434 12.056 39.2514 11.416C40.6594 10.776 42.2434 10.456 44.0034 10.456C46.3714 10.456 48.4834 11.048 50.3394 12.232C52.1954 13.384 53.5074 15 54.2754 17.08L50.0994 19.048C49.5874 17.8 48.7714 16.808 47.6514 16.072C46.5634 15.336 45.3314 14.968 43.9554 14.968C42.7714 14.968 41.8274 15.256 41.1234 15.832C40.4194 16.376 40.0674 17.096 40.0674 17.992C40.0674 18.6 40.2274 19.112 40.5474 19.528C40.8674 19.912 41.2834 20.232 41.7954 20.488C42.3074 20.712 42.8354 20.904 43.3794 21.064L47.6034 22.312C49.7474 22.92 51.3954 23.88 52.5474 25.192C53.6994 26.472 54.2754 28.008 54.2754 29.8C54.2754 31.336 53.8594 32.696 53.0274 33.88C52.2274 35.032 51.1074 35.944 49.6674 36.616C48.2274 37.256 46.5474 37.576 44.6274 37.576ZM66.6571 37L56.4811 11.032H62.3851L70.2091 32.2H68.0491L75.8731 11.032H81.8251L71.6011 37H66.6571ZM92.3503 37.576C90.5903 37.576 89.0383 37.272 87.6943 36.664C86.3823 36.024 85.3583 35.16 84.6223 34.072C83.8863 32.952 83.5183 31.64 83.5183 30.136C83.5183 28.728 83.8223 27.464 84.4303 26.344C85.0703 25.224 86.0463 24.28 87.3583 23.512C88.6703 22.744 90.3183 22.2 92.3023 21.88L101.326 20.392V24.664L93.3583 26.056C91.9183 26.312 90.8623 26.776 90.1903 27.448C89.5183 28.088 89.1823 28.92 89.1823 29.944C89.1823 30.936 89.5503 31.752 90.2863 32.392C91.0543 33 92.0303 33.304 93.2143 33.304C94.6863 33.304 95.9663 32.984 97.0543 32.344C98.1743 31.704 99.0383 30.856 99.6463 29.8C100.254 28.712 100.558 27.512 100.558 26.2V19.528C100.558 18.248 100.078 17.208 99.1183 16.408C98.1903 15.576 96.9423 15.16 95.3743 15.16C93.9343 15.16 92.6703 15.544 91.5823 16.312C90.5263 17.048 89.7423 18.008 89.2303 19.192L84.7183 16.936C85.1983 15.656 85.9823 14.536 87.0703 13.576C88.1583 12.584 89.4223 11.816 90.8623 11.272C92.3343 10.728 93.8863 10.456 95.5182 10.456C97.5663 10.456 99.3743 10.84 100.942 11.608C102.542 12.376 103.774 13.448 104.638 14.824C105.534 16.168 105.982 17.736 105.982 19.528V37H100.798V32.296L101.902 32.44C101.294 33.496 100.51 34.408 99.5503 35.176C98.6223 35.944 97.5503 36.536 96.3343 36.952C95.1503 37.368 93.8223 37.576 92.3503 37.576ZM121.588 37.576C119.636 37.576 117.924 37.144 116.452 36.28C114.98 35.384 113.828 34.152 112.996 32.584C112.196 30.984 111.796 29.144 111.796 27.064V11.032H117.22V26.584C117.22 27.768 117.46 28.808 117.94 29.704C118.42 30.6 119.092 31.304 119.956 31.816C120.82 32.296 121.812 32.536 122.932 32.536C124.084 32.536 125.092 32.28 125.956 31.768C126.82 31.256 127.492 30.536 127.972 29.608C128.484 28.68 128.74 27.592 128.74 26.344V11.032H134.116V37H128.98V31.912L129.556 32.584C128.948 34.184 127.94 35.416 126.532 36.28C125.124 37.144 123.476 37.576 121.588 37.576ZM140.449 37V0.663999H145.873V37H140.449ZM164.215 37.576C161.719 37.576 159.479 36.984 157.495 35.8C155.543 34.584 153.991 32.952 152.839 30.904C151.719 28.856 151.159 26.552 151.159 23.992C151.159 21.432 151.735 19.128 152.887 17.08C154.039 15.032 155.591 13.416 157.543 12.232C159.495 11.048 161.703 10.456 164.167 10.456C166.247 10.456 168.087 10.872 169.687 11.704C171.287 12.536 172.551 13.688 173.479 15.16L172.663 16.408V0.663999H178.039V37H172.903V31.72L173.527 32.728C172.631 34.296 171.351 35.496 169.687 36.328C168.023 37.16 166.199 37.576 164.215 37.576ZM164.743 32.536C166.247 32.536 167.591 32.168 168.775 31.432C169.991 30.696 170.935 29.688 171.607 28.408C172.311 27.096 172.663 25.624 172.663 23.992C172.663 22.36 172.311 20.904 171.607 19.624C170.935 18.344 169.991 17.336 168.775 16.6C167.591 15.864 166.247 15.496 164.743 15.496C163.239 15.496 161.879 15.864 160.663 16.6C159.447 17.336 158.503 18.344 157.831 19.624C157.159 20.904 156.823 22.36 156.823 23.992C156.823 25.624 157.159 27.096 157.831 28.408C158.503 29.688 159.431 30.696 160.615 31.432C161.831 32.168 163.207 32.536 164.743 32.536Z");
				attr_dev(path, "fill", "#C9D1D9");
				add_location(path, file$o, 7, 1, 105);
				attr_dev(svg, "width", "182");
				attr_dev(svg, "height", "45");
				attr_dev(svg, "viewBox", "0 0 182 45");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$o, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$o.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$o($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Logo', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Logo> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class Logo extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Logo",
				options,
				id: create_fragment$o.name
			});
		}
	}

	const subscriber_queue = [];

	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 *
	 * https://svelte.dev/docs/svelte-store#writable
	 * @template T
	 * @param {T} [value] initial value
	 * @param {import('./public.js').StartStopNotifier<T>} [start]
	 * @returns {import('./public.js').Writable<T>}
	 */
	function writable(value, start = noop) {
		/** @type {import('./public.js').Unsubscriber} */
		let stop;
		/** @type {Set<import('./private.js').SubscribeInvalidateTuple<T>>} */
		const subscribers = new Set();
		/** @param {T} new_value
		 * @returns {void}
		 */
		function set(new_value) {
			if (safe_not_equal(value, new_value)) {
				value = new_value;
				if (stop) {
					// store is ready
					const run_queue = !subscriber_queue.length;
					for (const subscriber of subscribers) {
						subscriber[1]();
						subscriber_queue.push(subscriber, value);
					}
					if (run_queue) {
						for (let i = 0; i < subscriber_queue.length; i += 2) {
							subscriber_queue[i][0](subscriber_queue[i + 1]);
						}
						subscriber_queue.length = 0;
					}
				}
			}
		}

		/**
		 * @param {import('./public.js').Updater<T>} fn
		 * @returns {void}
		 */
		function update(fn) {
			set(fn(value));
		}

		/**
		 * @param {import('./public.js').Subscriber<T>} run
		 * @param {import('./private.js').Invalidator<T>} [invalidate]
		 * @returns {import('./public.js').Unsubscriber}
		 */
		function subscribe(run, invalidate = noop) {
			/** @type {import('./private.js').SubscribeInvalidateTuple<T>} */
			const subscriber = [run, invalidate];
			subscribers.add(subscriber);
			if (subscribers.size === 1) {
				stop = start(set, update) || noop;
			}
			run(value);
			return () => {
				subscribers.delete(subscriber);
				if (subscribers.size === 0 && stop) {
					stop();
					stop = null;
				}
			};
		}
		return { set, update, subscribe };
	}

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var browserPolyfill = {exports: {}};

	(function (module, exports) {
		(function (global, factory) {
		  {
		    factory(module);
		  }
		})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : commonjsGlobal, function (module) {

		  if (!globalThis.chrome?.runtime?.id) {
		    throw new Error("This script should only be loaded in a browser extension.");
		  }

		  if (typeof globalThis.browser === "undefined" || Object.getPrototypeOf(globalThis.browser) !== Object.prototype) {
		    const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received."; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
		    // optimization for Firefox. Since Spidermonkey does not fully parse the
		    // contents of a function until the first time it's called, and since it will
		    // never actually need to be called, this allows the polyfill to be included
		    // in Firefox nearly for free.

		    const wrapAPIs = extensionAPIs => {
		      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
		      // at build time by replacing the following "include" with the content of the
		      // JSON file.
		      const apiMetadata = {
		        "alarms": {
		          "clear": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "clearAll": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "get": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "getAll": {
		            "minArgs": 0,
		            "maxArgs": 0
		          }
		        },
		        "bookmarks": {
		          "create": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "get": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getChildren": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getRecent": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getSubTree": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getTree": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "move": {
		            "minArgs": 2,
		            "maxArgs": 2
		          },
		          "remove": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "removeTree": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "search": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "update": {
		            "minArgs": 2,
		            "maxArgs": 2
		          }
		        },
		        "browserAction": {
		          "disable": {
		            "minArgs": 0,
		            "maxArgs": 1,
		            "fallbackToNoCallback": true
		          },
		          "enable": {
		            "minArgs": 0,
		            "maxArgs": 1,
		            "fallbackToNoCallback": true
		          },
		          "getBadgeBackgroundColor": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getBadgeText": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getPopup": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getTitle": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "openPopup": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "setBadgeBackgroundColor": {
		            "minArgs": 1,
		            "maxArgs": 1,
		            "fallbackToNoCallback": true
		          },
		          "setBadgeText": {
		            "minArgs": 1,
		            "maxArgs": 1,
		            "fallbackToNoCallback": true
		          },
		          "setIcon": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "setPopup": {
		            "minArgs": 1,
		            "maxArgs": 1,
		            "fallbackToNoCallback": true
		          },
		          "setTitle": {
		            "minArgs": 1,
		            "maxArgs": 1,
		            "fallbackToNoCallback": true
		          }
		        },
		        "browsingData": {
		          "remove": {
		            "minArgs": 2,
		            "maxArgs": 2
		          },
		          "removeCache": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "removeCookies": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "removeDownloads": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "removeFormData": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "removeHistory": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "removeLocalStorage": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "removePasswords": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "removePluginData": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "settings": {
		            "minArgs": 0,
		            "maxArgs": 0
		          }
		        },
		        "commands": {
		          "getAll": {
		            "minArgs": 0,
		            "maxArgs": 0
		          }
		        },
		        "contextMenus": {
		          "remove": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "removeAll": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "update": {
		            "minArgs": 2,
		            "maxArgs": 2
		          }
		        },
		        "cookies": {
		          "get": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getAll": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getAllCookieStores": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "remove": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "set": {
		            "minArgs": 1,
		            "maxArgs": 1
		          }
		        },
		        "devtools": {
		          "inspectedWindow": {
		            "eval": {
		              "minArgs": 1,
		              "maxArgs": 2,
		              "singleCallbackArg": false
		            }
		          },
		          "panels": {
		            "create": {
		              "minArgs": 3,
		              "maxArgs": 3,
		              "singleCallbackArg": true
		            },
		            "elements": {
		              "createSidebarPane": {
		                "minArgs": 1,
		                "maxArgs": 1
		              }
		            }
		          }
		        },
		        "downloads": {
		          "cancel": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "download": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "erase": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getFileIcon": {
		            "minArgs": 1,
		            "maxArgs": 2
		          },
		          "open": {
		            "minArgs": 1,
		            "maxArgs": 1,
		            "fallbackToNoCallback": true
		          },
		          "pause": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "removeFile": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "resume": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "search": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "show": {
		            "minArgs": 1,
		            "maxArgs": 1,
		            "fallbackToNoCallback": true
		          }
		        },
		        "extension": {
		          "isAllowedFileSchemeAccess": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "isAllowedIncognitoAccess": {
		            "minArgs": 0,
		            "maxArgs": 0
		          }
		        },
		        "history": {
		          "addUrl": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "deleteAll": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "deleteRange": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "deleteUrl": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getVisits": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "search": {
		            "minArgs": 1,
		            "maxArgs": 1
		          }
		        },
		        "i18n": {
		          "detectLanguage": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getAcceptLanguages": {
		            "minArgs": 0,
		            "maxArgs": 0
		          }
		        },
		        "identity": {
		          "launchWebAuthFlow": {
		            "minArgs": 1,
		            "maxArgs": 1
		          }
		        },
		        "idle": {
		          "queryState": {
		            "minArgs": 1,
		            "maxArgs": 1
		          }
		        },
		        "management": {
		          "get": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getAll": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "getSelf": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "setEnabled": {
		            "minArgs": 2,
		            "maxArgs": 2
		          },
		          "uninstallSelf": {
		            "minArgs": 0,
		            "maxArgs": 1
		          }
		        },
		        "notifications": {
		          "clear": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "create": {
		            "minArgs": 1,
		            "maxArgs": 2
		          },
		          "getAll": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "getPermissionLevel": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "update": {
		            "minArgs": 2,
		            "maxArgs": 2
		          }
		        },
		        "pageAction": {
		          "getPopup": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getTitle": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "hide": {
		            "minArgs": 1,
		            "maxArgs": 1,
		            "fallbackToNoCallback": true
		          },
		          "setIcon": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "setPopup": {
		            "minArgs": 1,
		            "maxArgs": 1,
		            "fallbackToNoCallback": true
		          },
		          "setTitle": {
		            "minArgs": 1,
		            "maxArgs": 1,
		            "fallbackToNoCallback": true
		          },
		          "show": {
		            "minArgs": 1,
		            "maxArgs": 1,
		            "fallbackToNoCallback": true
		          }
		        },
		        "permissions": {
		          "contains": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getAll": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "remove": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "request": {
		            "minArgs": 1,
		            "maxArgs": 1
		          }
		        },
		        "runtime": {
		          "getBackgroundPage": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "getPlatformInfo": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "openOptionsPage": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "requestUpdateCheck": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "sendMessage": {
		            "minArgs": 1,
		            "maxArgs": 3
		          },
		          "sendNativeMessage": {
		            "minArgs": 2,
		            "maxArgs": 2
		          },
		          "setUninstallURL": {
		            "minArgs": 1,
		            "maxArgs": 1
		          }
		        },
		        "sessions": {
		          "getDevices": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "getRecentlyClosed": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "restore": {
		            "minArgs": 0,
		            "maxArgs": 1
		          }
		        },
		        "storage": {
		          "local": {
		            "clear": {
		              "minArgs": 0,
		              "maxArgs": 0
		            },
		            "get": {
		              "minArgs": 0,
		              "maxArgs": 1
		            },
		            "getBytesInUse": {
		              "minArgs": 0,
		              "maxArgs": 1
		            },
		            "remove": {
		              "minArgs": 1,
		              "maxArgs": 1
		            },
		            "set": {
		              "minArgs": 1,
		              "maxArgs": 1
		            }
		          },
		          "managed": {
		            "get": {
		              "minArgs": 0,
		              "maxArgs": 1
		            },
		            "getBytesInUse": {
		              "minArgs": 0,
		              "maxArgs": 1
		            }
		          },
		          "sync": {
		            "clear": {
		              "minArgs": 0,
		              "maxArgs": 0
		            },
		            "get": {
		              "minArgs": 0,
		              "maxArgs": 1
		            },
		            "getBytesInUse": {
		              "minArgs": 0,
		              "maxArgs": 1
		            },
		            "remove": {
		              "minArgs": 1,
		              "maxArgs": 1
		            },
		            "set": {
		              "minArgs": 1,
		              "maxArgs": 1
		            }
		          }
		        },
		        "tabs": {
		          "captureVisibleTab": {
		            "minArgs": 0,
		            "maxArgs": 2
		          },
		          "create": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "detectLanguage": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "discard": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "duplicate": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "executeScript": {
		            "minArgs": 1,
		            "maxArgs": 2
		          },
		          "get": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getCurrent": {
		            "minArgs": 0,
		            "maxArgs": 0
		          },
		          "getZoom": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "getZoomSettings": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "goBack": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "goForward": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "highlight": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "insertCSS": {
		            "minArgs": 1,
		            "maxArgs": 2
		          },
		          "move": {
		            "minArgs": 2,
		            "maxArgs": 2
		          },
		          "query": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "reload": {
		            "minArgs": 0,
		            "maxArgs": 2
		          },
		          "remove": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "removeCSS": {
		            "minArgs": 1,
		            "maxArgs": 2
		          },
		          "sendMessage": {
		            "minArgs": 2,
		            "maxArgs": 3
		          },
		          "setZoom": {
		            "minArgs": 1,
		            "maxArgs": 2
		          },
		          "setZoomSettings": {
		            "minArgs": 1,
		            "maxArgs": 2
		          },
		          "update": {
		            "minArgs": 1,
		            "maxArgs": 2
		          }
		        },
		        "topSites": {
		          "get": {
		            "minArgs": 0,
		            "maxArgs": 0
		          }
		        },
		        "webNavigation": {
		          "getAllFrames": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "getFrame": {
		            "minArgs": 1,
		            "maxArgs": 1
		          }
		        },
		        "webRequest": {
		          "handlerBehaviorChanged": {
		            "minArgs": 0,
		            "maxArgs": 0
		          }
		        },
		        "windows": {
		          "create": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "get": {
		            "minArgs": 1,
		            "maxArgs": 2
		          },
		          "getAll": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "getCurrent": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "getLastFocused": {
		            "minArgs": 0,
		            "maxArgs": 1
		          },
		          "remove": {
		            "minArgs": 1,
		            "maxArgs": 1
		          },
		          "update": {
		            "minArgs": 2,
		            "maxArgs": 2
		          }
		        }
		      };

		      if (Object.keys(apiMetadata).length === 0) {
		        throw new Error("api-metadata.json has not been included in browser-polyfill");
		      }
		      /**
		       * A WeakMap subclass which creates and stores a value for any key which does
		       * not exist when accessed, but behaves exactly as an ordinary WeakMap
		       * otherwise.
		       *
		       * @param {function} createItem
		       *        A function which will be called in order to create the value for any
		       *        key which does not exist, the first time it is accessed. The
		       *        function receives, as its only argument, the key being created.
		       */


		      class DefaultWeakMap extends WeakMap {
		        constructor(createItem, items = undefined) {
		          super(items);
		          this.createItem = createItem;
		        }

		        get(key) {
		          if (!this.has(key)) {
		            this.set(key, this.createItem(key));
		          }

		          return super.get(key);
		        }

		      }
		      /**
		       * Returns true if the given object is an object with a `then` method, and can
		       * therefore be assumed to behave as a Promise.
		       *
		       * @param {*} value The value to test.
		       * @returns {boolean} True if the value is thenable.
		       */


		      const isThenable = value => {
		        return value && typeof value === "object" && typeof value.then === "function";
		      };
		      /**
		       * Creates and returns a function which, when called, will resolve or reject
		       * the given promise based on how it is called:
		       *
		       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
		       *   the promise is rejected with that value.
		       * - If the function is called with exactly one argument, the promise is
		       *   resolved to that value.
		       * - Otherwise, the promise is resolved to an array containing all of the
		       *   function's arguments.
		       *
		       * @param {object} promise
		       *        An object containing the resolution and rejection functions of a
		       *        promise.
		       * @param {function} promise.resolve
		       *        The promise's resolution function.
		       * @param {function} promise.reject
		       *        The promise's rejection function.
		       * @param {object} metadata
		       *        Metadata about the wrapped method which has created the callback.
		       * @param {boolean} metadata.singleCallbackArg
		       *        Whether or not the promise is resolved with only the first
		       *        argument of the callback, alternatively an array of all the
		       *        callback arguments is resolved. By default, if the callback
		       *        function is invoked with only a single argument, that will be
		       *        resolved to the promise, while all arguments will be resolved as
		       *        an array if multiple are given.
		       *
		       * @returns {function}
		       *        The generated callback function.
		       */


		      const makeCallback = (promise, metadata) => {
		        return (...callbackArgs) => {
		          if (extensionAPIs.runtime.lastError) {
		            promise.reject(new Error(extensionAPIs.runtime.lastError.message));
		          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
		            promise.resolve(callbackArgs[0]);
		          } else {
		            promise.resolve(callbackArgs);
		          }
		        };
		      };

		      const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";
		      /**
		       * Creates a wrapper function for a method with the given name and metadata.
		       *
		       * @param {string} name
		       *        The name of the method which is being wrapped.
		       * @param {object} metadata
		       *        Metadata about the method being wrapped.
		       * @param {integer} metadata.minArgs
		       *        The minimum number of arguments which must be passed to the
		       *        function. If called with fewer than this number of arguments, the
		       *        wrapper will raise an exception.
		       * @param {integer} metadata.maxArgs
		       *        The maximum number of arguments which may be passed to the
		       *        function. If called with more than this number of arguments, the
		       *        wrapper will raise an exception.
		       * @param {boolean} metadata.singleCallbackArg
		       *        Whether or not the promise is resolved with only the first
		       *        argument of the callback, alternatively an array of all the
		       *        callback arguments is resolved. By default, if the callback
		       *        function is invoked with only a single argument, that will be
		       *        resolved to the promise, while all arguments will be resolved as
		       *        an array if multiple are given.
		       *
		       * @returns {function(object, ...*)}
		       *       The generated wrapper function.
		       */


		      const wrapAsyncFunction = (name, metadata) => {
		        return function asyncFunctionWrapper(target, ...args) {
		          if (args.length < metadata.minArgs) {
		            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
		          }

		          if (args.length > metadata.maxArgs) {
		            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
		          }

		          return new Promise((resolve, reject) => {
		            if (metadata.fallbackToNoCallback) {
		              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
		              // and so the polyfill will try to call it with a callback first, and it will fallback
		              // to not passing the callback if the first call fails.
		              try {
		                target[name](...args, makeCallback({
		                  resolve,
		                  reject
		                }, metadata));
		              } catch (cbError) {
		                console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);
		                target[name](...args); // Update the API method metadata, so that the next API calls will not try to
		                // use the unsupported callback anymore.

		                metadata.fallbackToNoCallback = false;
		                metadata.noCallback = true;
		                resolve();
		              }
		            } else if (metadata.noCallback) {
		              target[name](...args);
		              resolve();
		            } else {
		              target[name](...args, makeCallback({
		                resolve,
		                reject
		              }, metadata));
		            }
		          });
		        };
		      };
		      /**
		       * Wraps an existing method of the target object, so that calls to it are
		       * intercepted by the given wrapper function. The wrapper function receives,
		       * as its first argument, the original `target` object, followed by each of
		       * the arguments passed to the original method.
		       *
		       * @param {object} target
		       *        The original target object that the wrapped method belongs to.
		       * @param {function} method
		       *        The method being wrapped. This is used as the target of the Proxy
		       *        object which is created to wrap the method.
		       * @param {function} wrapper
		       *        The wrapper function which is called in place of a direct invocation
		       *        of the wrapped method.
		       *
		       * @returns {Proxy<function>}
		       *        A Proxy object for the given method, which invokes the given wrapper
		       *        method in its place.
		       */


		      const wrapMethod = (target, method, wrapper) => {
		        return new Proxy(method, {
		          apply(targetMethod, thisObj, args) {
		            return wrapper.call(thisObj, target, ...args);
		          }

		        });
		      };

		      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
		      /**
		       * Wraps an object in a Proxy which intercepts and wraps certain methods
		       * based on the given `wrappers` and `metadata` objects.
		       *
		       * @param {object} target
		       *        The target object to wrap.
		       *
		       * @param {object} [wrappers = {}]
		       *        An object tree containing wrapper functions for special cases. Any
		       *        function present in this object tree is called in place of the
		       *        method in the same location in the `target` object tree. These
		       *        wrapper methods are invoked as described in {@see wrapMethod}.
		       *
		       * @param {object} [metadata = {}]
		       *        An object tree containing metadata used to automatically generate
		       *        Promise-based wrapper functions for asynchronous. Any function in
		       *        the `target` object tree which has a corresponding metadata object
		       *        in the same location in the `metadata` tree is replaced with an
		       *        automatically-generated wrapper function, as described in
		       *        {@see wrapAsyncFunction}
		       *
		       * @returns {Proxy<object>}
		       */

		      const wrapObject = (target, wrappers = {}, metadata = {}) => {
		        let cache = Object.create(null);
		        let handlers = {
		          has(proxyTarget, prop) {
		            return prop in target || prop in cache;
		          },

		          get(proxyTarget, prop, receiver) {
		            if (prop in cache) {
		              return cache[prop];
		            }

		            if (!(prop in target)) {
		              return undefined;
		            }

		            let value = target[prop];

		            if (typeof value === "function") {
		              // This is a method on the underlying object. Check if we need to do
		              // any wrapping.
		              if (typeof wrappers[prop] === "function") {
		                // We have a special-case wrapper for this method.
		                value = wrapMethod(target, target[prop], wrappers[prop]);
		              } else if (hasOwnProperty(metadata, prop)) {
		                // This is an async method that we have metadata for. Create a
		                // Promise wrapper for it.
		                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
		                value = wrapMethod(target, target[prop], wrapper);
		              } else {
		                // This is a method that we don't know or care about. Return the
		                // original method, bound to the underlying object.
		                value = value.bind(target);
		              }
		            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
		              // This is an object that we need to do some wrapping for the children
		              // of. Create a sub-object wrapper for it with the appropriate child
		              // metadata.
		              value = wrapObject(value, wrappers[prop], metadata[prop]);
		            } else if (hasOwnProperty(metadata, "*")) {
		              // Wrap all properties in * namespace.
		              value = wrapObject(value, wrappers[prop], metadata["*"]);
		            } else {
		              // We don't need to do any wrapping for this property,
		              // so just forward all access to the underlying object.
		              Object.defineProperty(cache, prop, {
		                configurable: true,
		                enumerable: true,

		                get() {
		                  return target[prop];
		                },

		                set(value) {
		                  target[prop] = value;
		                }

		              });
		              return value;
		            }

		            cache[prop] = value;
		            return value;
		          },

		          set(proxyTarget, prop, value, receiver) {
		            if (prop in cache) {
		              cache[prop] = value;
		            } else {
		              target[prop] = value;
		            }

		            return true;
		          },

		          defineProperty(proxyTarget, prop, desc) {
		            return Reflect.defineProperty(cache, prop, desc);
		          },

		          deleteProperty(proxyTarget, prop) {
		            return Reflect.deleteProperty(cache, prop);
		          }

		        }; // Per contract of the Proxy API, the "get" proxy handler must return the
		        // original value of the target if that value is declared read-only and
		        // non-configurable. For this reason, we create an object with the
		        // prototype set to `target` instead of using `target` directly.
		        // Otherwise we cannot return a custom object for APIs that
		        // are declared read-only and non-configurable, such as `chrome.devtools`.
		        //
		        // The proxy handlers themselves will still use the original `target`
		        // instead of the `proxyTarget`, so that the methods and properties are
		        // dereferenced via the original targets.

		        let proxyTarget = Object.create(target);
		        return new Proxy(proxyTarget, handlers);
		      };
		      /**
		       * Creates a set of wrapper functions for an event object, which handles
		       * wrapping of listener functions that those messages are passed.
		       *
		       * A single wrapper is created for each listener function, and stored in a
		       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
		       * retrieve the original wrapper, so that  attempts to remove a
		       * previously-added listener work as expected.
		       *
		       * @param {DefaultWeakMap<function, function>} wrapperMap
		       *        A DefaultWeakMap object which will create the appropriate wrapper
		       *        for a given listener function when one does not exist, and retrieve
		       *        an existing one when it does.
		       *
		       * @returns {object}
		       */


		      const wrapEvent = wrapperMap => ({
		        addListener(target, listener, ...args) {
		          target.addListener(wrapperMap.get(listener), ...args);
		        },

		        hasListener(target, listener) {
		          return target.hasListener(wrapperMap.get(listener));
		        },

		        removeListener(target, listener) {
		          target.removeListener(wrapperMap.get(listener));
		        }

		      });

		      const onRequestFinishedWrappers = new DefaultWeakMap(listener => {
		        if (typeof listener !== "function") {
		          return listener;
		        }
		        /**
		         * Wraps an onRequestFinished listener function so that it will return a
		         * `getContent()` property which returns a `Promise` rather than using a
		         * callback API.
		         *
		         * @param {object} req
		         *        The HAR entry object representing the network request.
		         */


		        return function onRequestFinished(req) {
		          const wrappedReq = wrapObject(req, {}
		          /* wrappers */
		          , {
		            getContent: {
		              minArgs: 0,
		              maxArgs: 0
		            }
		          });
		          listener(wrappedReq);
		        };
		      });
		      const onMessageWrappers = new DefaultWeakMap(listener => {
		        if (typeof listener !== "function") {
		          return listener;
		        }
		        /**
		         * Wraps a message listener function so that it may send responses based on
		         * its return value, rather than by returning a sentinel value and calling a
		         * callback. If the listener function returns a Promise, the response is
		         * sent when the promise either resolves or rejects.
		         *
		         * @param {*} message
		         *        The message sent by the other end of the channel.
		         * @param {object} sender
		         *        Details about the sender of the message.
		         * @param {function(*)} sendResponse
		         *        A callback which, when called with an arbitrary argument, sends
		         *        that value as a response.
		         * @returns {boolean}
		         *        True if the wrapped listener returned a Promise, which will later
		         *        yield a response. False otherwise.
		         */


		        return function onMessage(message, sender, sendResponse) {
		          let didCallSendResponse = false;
		          let wrappedSendResponse;
		          let sendResponsePromise = new Promise(resolve => {
		            wrappedSendResponse = function (response) {
		              didCallSendResponse = true;
		              resolve(response);
		            };
		          });
		          let result;

		          try {
		            result = listener(message, sender, wrappedSendResponse);
		          } catch (err) {
		            result = Promise.reject(err);
		          }

		          const isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
		          // wrappedSendResponse synchronously, we can exit earlier
		          // because there will be no response sent from this listener.

		          if (result !== true && !isResultThenable && !didCallSendResponse) {
		            return false;
		          } // A small helper to send the message if the promise resolves
		          // and an error if the promise rejects (a wrapped sendMessage has
		          // to translate the message into a resolved promise or a rejected
		          // promise).


		          const sendPromisedResult = promise => {
		            promise.then(msg => {
		              // send the message value.
		              sendResponse(msg);
		            }, error => {
		              // Send a JSON representation of the error if the rejected value
		              // is an instance of error, or the object itself otherwise.
		              let message;

		              if (error && (error instanceof Error || typeof error.message === "string")) {
		                message = error.message;
		              } else {
		                message = "An unexpected error occurred";
		              }

		              sendResponse({
		                __mozWebExtensionPolyfillReject__: true,
		                message
		              });
		            }).catch(err => {
		              // Print an error on the console if unable to send the response.
		              console.error("Failed to send onMessage rejected reply", err);
		            });
		          }; // If the listener returned a Promise, send the resolved value as a
		          // result, otherwise wait the promise related to the wrappedSendResponse
		          // callback to resolve and send it as a response.


		          if (isResultThenable) {
		            sendPromisedResult(result);
		          } else {
		            sendPromisedResult(sendResponsePromise);
		          } // Let Chrome know that the listener is replying.


		          return true;
		        };
		      });

		      const wrappedSendMessageCallback = ({
		        reject,
		        resolve
		      }, reply) => {
		        if (extensionAPIs.runtime.lastError) {
		          // Detect when none of the listeners replied to the sendMessage call and resolve
		          // the promise to undefined as in Firefox.
		          // See https://github.com/mozilla/webextension-polyfill/issues/130
		          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
		            resolve();
		          } else {
		            reject(new Error(extensionAPIs.runtime.lastError.message));
		          }
		        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
		          // Convert back the JSON representation of the error into
		          // an Error instance.
		          reject(new Error(reply.message));
		        } else {
		          resolve(reply);
		        }
		      };

		      const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
		        if (args.length < metadata.minArgs) {
		          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
		        }

		        if (args.length > metadata.maxArgs) {
		          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
		        }

		        return new Promise((resolve, reject) => {
		          const wrappedCb = wrappedSendMessageCallback.bind(null, {
		            resolve,
		            reject
		          });
		          args.push(wrappedCb);
		          apiNamespaceObj.sendMessage(...args);
		        });
		      };

		      const staticWrappers = {
		        devtools: {
		          network: {
		            onRequestFinished: wrapEvent(onRequestFinishedWrappers)
		          }
		        },
		        runtime: {
		          onMessage: wrapEvent(onMessageWrappers),
		          onMessageExternal: wrapEvent(onMessageWrappers),
		          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
		            minArgs: 1,
		            maxArgs: 3
		          })
		        },
		        tabs: {
		          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
		            minArgs: 2,
		            maxArgs: 3
		          })
		        }
		      };
		      const settingMetadata = {
		        clear: {
		          minArgs: 1,
		          maxArgs: 1
		        },
		        get: {
		          minArgs: 1,
		          maxArgs: 1
		        },
		        set: {
		          minArgs: 1,
		          maxArgs: 1
		        }
		      };
		      apiMetadata.privacy = {
		        network: {
		          "*": settingMetadata
		        },
		        services: {
		          "*": settingMetadata
		        },
		        websites: {
		          "*": settingMetadata
		        }
		      };
		      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
		    }; // The build process adds a UMD wrapper around this file, which makes the
		    // `module` variable available.


		    module.exports = wrapAPIs(chrome);
		  } else {
		    module.exports = globalThis.browser;
		  }
		});
		
	} (browserPolyfill));

	var browserPolyfillExports = browserPolyfill.exports;
	var browser = /*@__PURE__*/getDefaultExportFromCjs(browserPolyfillExports);

	const getFromStorage = async (key) => {
	    try {
	        const result = await browser.storage.local.get(key);
	        return result[key];
	    }
	    catch (error) {
	        console.error(`Error getting ${key} from storage:`, error);
	        return undefined;
	    }
	};
	const setToStorage = async (key, value) => {
	    try {
	        await browser.storage.local.set({ [key]: value });
	    }
	    catch (error) {
	        console.error(`Error setting ${key} in storage:`, error);
	    }
	};
	const StorageService = {
	    getCertificate: () => getFromStorage("certificate"),
	    setCertificate: (certificate) => setToStorage("certificate", certificate),
	    getToken: () => getFromStorage("token"),
	    setToken: (token) => setToStorage("token", token),
	    getBaseUrl: () => getFromStorage("baseUrl"),
	    setBaseUrl: (url) => setToStorage("baseUrl", url),
	    getIsLoggedIn: () => getFromStorage("isLoggedIn"),
	    setIsLoggedIn: (isLoggedIn) => setToStorage("isLoggedIn", isLoggedIn),
	    getEncryptedCertificate: () => getFromStorage("certificate"),
	    setEncryptedCertificate: (key) => setToStorage("certificate", key),
	    getSalt: () => getFromStorage("salt"),
	    setSalt: (salt) => setToStorage("salt", salt),
	    clearStorage: async () => {
	        try {
	            await browser.storage.local.clear();
	        }
	        catch (error) {
	            console.error("Error clearing storage:", error);
	        }
	    },
	};
	const LocalStorageService = {
	    get: (key, parse = false) => {
	        try {
	            const item = localStorage.getItem(key);
	            if (item === null)
	                return null;
	            return parse ? JSON.parse(item) : item;
	        }
	        catch (error) {
	            console.error(`Error getting item ${key} from localStorage:`, error);
	            return null;
	        }
	    },
	    set: (key, value, stringify = false) => {
	        try {
	            const item = stringify ? JSON.stringify(value) : String(value);
	            localStorage.setItem(key, item);
	        }
	        catch (error) {
	            console.error(`Error setting item ${key} in localStorage:`, error);
	        }
	    },
	    remove: (key) => {
	        try {
	            localStorage.removeItem(key);
	        }
	        catch (error) {
	            console.error(`Error removing item ${key} from localStorage:`, error);
	        }
	    },
	    clear: () => {
	        try {
	            localStorage.clear();
	        }
	        catch (error) {
	            console.error("Error clearing localStorage:", error);
	        }
	    },
	};

	let selectedPage = writable("");
	const storedPage = LocalStorageService.get("selectedPage");
	if (storedPage) {
	    selectedPage.set(storedPage);
	}
	else {
	    selectedPage.set("Folders");
	}
	selectedPage.subscribe((value) => {
	    LocalStorageService.set("selectedPage", value);
	});

	let selectedGroup = writable(null);
	const storedGroup = LocalStorageService.get("selectedGroup", true);
	if (storedGroup) {
	    selectedGroup.set(storedGroup);
	}
	else {
	    selectedGroup.set(null);
	}
	selectedGroup.subscribe((value) => {
	    LocalStorageService.set("selectedGroup", value, true);
	});

	let selectedFolder = writable(undefined);
	selectedFolder.subscribe((value) => {
	    if (value) {
	        LocalStorageService.set("selectedFolder", value, true);
	    }
	});

	/* src/lib/components/basic/icons/tick.svelte generated by Svelte v4.2.19 */
	const file$n = "src/lib/components/basic/icons/tick.svelte";

	function create_fragment$n(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "d", "M8.74973 18.2898C8.42973 18.2898 8.10973 18.1698 7.86473 17.9248L3.21973 13.2748L4.27973 12.2148L8.74973 16.6848L19.7197 5.71484L20.7797 6.77484L9.63473 17.9198C9.38973 18.1648 9.06973 18.2848 8.74973 18.2848V18.2898Z");
				attr_dev(path, "fill", "#00FF00");
				add_location(path, file$n, 7, 1, 103);
				attr_dev(svg, "width", "24");
				attr_dev(svg, "height", "24");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$n, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$n.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$n($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Tick', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tick> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class Tick extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Tick",
				options,
				id: create_fragment$n.name
			});
		}
	}

	/* src/lib/components/basic/icons/folderIcon.svelte generated by Svelte v4.2.19 */
	const file$m = "src/lib/components/basic/icons/folderIcon.svelte";

	function create_fragment$m(ctx) {
		let svg;
		let path;
		let path_fill_value;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "d", "M19.25 21H4.75C3.235 21 2 19.765 2 18.25V5.75C2 4.235 3.235 3 4.75 3H9.56L12.06 5.5H19.25C20.765 5.5 22 6.735 22 8.25V18.25C22 19.765 20.765 21 19.25 21ZM4.75 4.5C4.06 4.5 3.5 5.06 3.5 5.75V18.25C3.5 18.94 4.06 19.5 4.75 19.5H19.25C19.94 19.5 20.5 18.94 20.5 18.25V8.25C20.5 7.56 19.94 7 19.25 7H11.44L8.94 4.5H4.75Z");
				attr_dev(path, "fill", path_fill_value = /*color*/ ctx[0] || '#85889C');
				add_location(path, file$m, 11, 1, 142);
				attr_dev(svg, "width", "20");
				attr_dev(svg, "height", "20");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$m, 4, 0, 39);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*color*/ 1 && path_fill_value !== (path_fill_value = /*color*/ ctx[0] || '#85889C')) {
					attr_dev(path, "fill", path_fill_value);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$m.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$m($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('FolderIcon', slots, []);
		let { color } = $$props;

		$$self.$$.on_mount.push(function () {
			if (color === undefined && !('color' in $$props || $$self.$$.bound[$$self.$$.props['color']])) {
				console.warn("<FolderIcon> was created without expected prop 'color'");
			}
		});

		const writable_props = ['color'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FolderIcon> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		$$self.$capture_state = () => ({ color });

		$$self.$inject_state = $$props => {
			if ('color' in $$props) $$invalidate(0, color = $$props.color);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [color];
	}

	class FolderIcon extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$m, create_fragment$m, safe_not_equal, { color: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "FolderIcon",
				options,
				id: create_fragment$m.name
			});
		}

		get color() {
			throw new Error("<FolderIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<FolderIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	const getTokenAndBaseUrl = async () => {
	    const [token, baseUrl] = await Promise.all([
	        StorageService.getToken(),
	        StorageService.getBaseUrl(),
	    ]);
	    return { token, baseUrl };
	};
	const sendMessage = async (action, data = {}) => {
	    try {
	        const response = await browser.runtime.sendMessage({
	            action,
	            data,
	        });
	        return response;
	    }
	    catch (error) {
	        console.error("Error sending message:", error, "\ndata", data, "action\n", action);
	    }
	};
	const searchObjects = (query, credentials) => {
	    const searchResults = [];
	    for (const credential of credentials) {
	        for (const prop in credential) {
	            if (typeof credential[prop] === "string" &&
	                credential[prop]
	                    .toLowerCase()
	                    .includes(query.toLowerCase())) {
	                searchResults.push(credential);
	                break;
	            }
	        }
	    }
	    return searchResults;
	};
	const transformAddCredentialPayload = (payload) => {
	    const fieldsMap = {};
	    payload.userFields.forEach((userField) => {
	        userField.fields.forEach((field) => {
	            const key = field.fieldName;
	            if (!fieldsMap[key]) {
	                fieldsMap[key] = {
	                    fieldName: field.fieldName,
	                    fieldType: field.fieldType,
	                    fieldValues: [],
	                };
	            }
	            fieldsMap[key].fieldValues.push({
	                userId: userField.userId,
	                fieldValue: field.fieldValue,
	            });
	        });
	    });
	    const transformedFields = Object.values(fieldsMap);
	    return {
	        name: payload.name,
	        description: payload.description,
	        folderId: payload.folderId,
	        credentialType: payload.credentialType,
	        domain: payload.domain,
	        fields: transformedFields,
	    };
	};

	const fetchCredentialById = async (credentialId) => {
	    const headers = new Headers();
	    const { token, baseUrl } = await getTokenAndBaseUrl();
	    headers.append("Authorization", `Bearer ${token}`);
	    headers.append("Content-Type", "application/json");
	    return fetch(`${baseUrl}/credential/${credentialId}`, {
	        headers,
	    }).then((response) => response.json());
	};
	const addCredential = async (payload) => {
	    const headers = new Headers();
	    const transformedPayload = transformAddCredentialPayload(payload);
	    const signatureResponse = await sendMessage("hashAndSign", {
	        message: JSON.stringify(transformedPayload),
	    });
	    headers.append("Signature", signatureResponse.signature);
	    const { token, baseUrl } = await getTokenAndBaseUrl();
	    headers.append("Authorization", `Bearer ${token}`);
	    headers.append("Content-Type", "application/json");
	    const response = await fetch(`${baseUrl}/credential/`, {
	        method: "POST",
	        headers,
	        body: JSON.stringify(transformedPayload),
	    }).then((response) => response.json());
	    return response;
	};
	const fetchCredsByIds = async (credentialIds) => {
	    const headers = new Headers();
	    const { token, baseUrl } = await getTokenAndBaseUrl();
	    headers.append("Authorization", `Bearer ${token}`);
	    const response = await fetch(`${baseUrl}/credentials/by-ids`, {
	        method: "POST",
	        headers,
	        body: JSON.stringify({ credentialIds }),
	    });
	    if (!response.ok) {
	        throw new Error(`HTTP error! status: ${response.status}`);
	    }
	    return response.json();
	};
	const fetchAllUserUrls = async () => {
	    const headers = new Headers();
	    const { token, baseUrl } = await getTokenAndBaseUrl();
	    headers.append("Authorization", `Bearer ${token}`);
	    const response = await fetch(`${baseUrl}/urls`, {
	        method: "GET",
	        headers,
	    });
	    if (!response.ok) {
	        throw new Error(`HTTP error! status: ${response.status}`);
	    }
	    return response.json();
	};
	const fetchSensitiveFieldsByCredentialId = async (credentialId) => {
	    const headers = new Headers();
	    const { token, baseUrl } = await getTokenAndBaseUrl();
	    headers.append("Authorization", `Bearer ${token}`);
	    const response = await fetch(`${baseUrl}/credential/${credentialId}/sensitive`, {
	        method: "GET",
	        headers,
	    });
	    if (!response.ok) {
	        throw new Error(`HTTP error! status: ${response.status}`);
	    }
	    return response.json();
	};
	const getSearchFields = async () => {
	    const headers = new Headers();
	    const { token, baseUrl } = await getTokenAndBaseUrl();
	    headers.append("Authorization", `Bearer ${token}`);
	    const response = await fetch(`${baseUrl}/credentials/search`, {
	        method: "GET",
	        headers,
	    });
	    if (!response.ok) {
	        throw new Error(`HTTP error! status: ${response.status}`);
	    }
	    return response.json();
	};

	const fetchAllFolders = async () => {
	    const { token, baseUrl } = await getTokenAndBaseUrl();
	    const options = {
	        method: "GET",
	        headers: {
	            Authorization: `Bearer ${token}`,
	            "Content-Type": "application/json",
	        },
	    };
	    return fetch(`${baseUrl}/folders/`, options).then((response) => response.json());
	};
	const fetchFolderUsersForDataSync = async (folderId) => {
	    const headers = new Headers();
	    const { token, baseUrl } = await getTokenAndBaseUrl();
	    headers.append("Authorization", `Bearer ${token}`);
	    headers.append("Content-Type", "application/json");
	    return fetch(`${baseUrl}/folder/${folderId}/users-data-sync`, {
	        headers,
	    }).then((response) => response.json());
	};

	const getUser = async () => {
	    const headers = new Headers();
	    const { token, baseUrl } = await getTokenAndBaseUrl();
	    headers.append("Authorization", `Bearer ${token}`);
	    return await fetch(`${baseUrl}/user`, {
	        method: "GET",
	        headers,
	    }).then((response) => response.json());
	};

	const initiateAuth = async (signedText, publicKey) => {
	    const { baseUrl } = await getTokenAndBaseUrl();
	    return await fetch(`${baseUrl}/user/verify`, {
	        method: "POST",
	        body: JSON.stringify({ signature: signedText, publicKey: publicKey }),
	    }).then((res) => res.json());
	};
	const createChallenge = async (publicKey) => {
	    const { baseUrl } = await getTokenAndBaseUrl();
	    return await fetch(`${baseUrl}/user/challenge`, {
	        method: "POST",
	        body: JSON.stringify({ publicKey: publicKey }),
	    }).then((res) => res.json());
	};
	const getRegsitrationChallenge = async (username, tempPassword) => {
	    const { baseUrl } = await getTokenAndBaseUrl();
	    return await fetch(`${baseUrl}/user/temp-login`, {
	        method: "POST",
	        body: JSON.stringify({ username, tempPassword }),
	    }).then((res) => res.json());
	};
	const finalRegistration = async (username, signature, deviceKey, encryptionKey) => {
	    const { baseUrl } = await getTokenAndBaseUrl();
	    return await fetch(`${baseUrl}/user/register`, {
	        method: "POST",
	        body: JSON.stringify({ username, signature, deviceKey, encryptionKey }),
	    }).then((res) => res.json());
	};

	/* src/lib/components/popup/Welcome.svelte generated by Svelte v4.2.19 */
	const file$l = "src/lib/components/popup/Welcome.svelte";

	// (68:4) {:else}
	function create_else_block_1$6(ctx) {
		let eye;
		let current;
		eye = new Eye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(eye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(eye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(eye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(eye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(eye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_1$6.name,
			type: "else",
			source: "(68:4) {:else}",
			ctx
		});

		return block;
	}

	// (66:4) {#if showPassword}
	function create_if_block_1$c(ctx) {
		let closedeye;
		let current;
		closedeye = new ClosedEye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(closedeye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(closedeye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(closedeye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(closedeye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(closedeye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$c.name,
			type: "if",
			source: "(66:4) {#if showPassword}",
			ctx
		});

		return block;
	}

	// (84:3) {:else}
	function create_else_block$b(ctx) {
		let span;

		const block = {
			c: function create() {
				span = element("span");
				span.textContent = "Submit";
				add_location(span, file$l, 87, 4, 2740);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$b.name,
			type: "else",
			source: "(84:3) {:else}",
			ctx
		});

		return block;
	}

	// (82:3) {#if isLoaderActive}
	function create_if_block$d(ctx) {
		let loader;
		let current;

		loader = new Loader({
				props: { size: 24, color: "#1F242A", duration: 1 },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(loader.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(loader, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(loader.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(loader.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(loader, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$d.name,
			type: "if",
			source: "(82:3) {#if isLoaderActive}",
			ctx
		});

		return block;
	}

	function create_fragment$l(ctx) {
		let div1;
		let form;
		let label;
		let t1;
		let div0;
		let input;
		let t2;
		let button0;
		let current_block_type_index;
		let if_block0;
		let t3;
		let span;
		let t4;
		let span_class_value;
		let t5;
		let button1;
		let current_block_type_index_1;
		let if_block1;
		let current;
		let mounted;
		let dispose;
		const if_block_creators = [create_if_block_1$c, create_else_block_1$6];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*showPassword*/ ctx[0]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		const if_block_creators_1 = [create_if_block$d, create_else_block$b];
		const if_blocks_1 = [];

		function select_block_type_1(ctx, dirty) {
			if (/*isLoaderActive*/ ctx[2]) return 0;
			return 1;
		}

		current_block_type_index_1 = select_block_type_1(ctx);
		if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

		const block = {
			c: function create() {
				div1 = element("div");
				form = element("form");
				label = element("label");
				label.textContent = "Enter Passphrase";
				t1 = space();
				div0 = element("div");
				input = element("input");
				t2 = space();
				button0 = element("button");
				if_block0.c();
				t3 = space();
				span = element("span");
				t4 = text("Passphrase doesn't match");
				t5 = space();
				button1 = element("button");
				if_block1.c();
				attr_dev(label, "for", "passphrase");
				add_location(label, file$l, 50, 2, 1626);
				attr_dev(input, "class", "text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0 focus:border-osvauld-activeBorder");
				attr_dev(input, "type", /*type*/ ctx[3]);
				attr_dev(input, "id", "passphrase");
				input.autofocus = true;
				attr_dev(input, "autocomplete", "off");
				add_location(input, file$l, 55, 3, 1822);
				attr_dev(button0, "type", "button");
				attr_dev(button0, "class", "flex justify-center items-center");
				add_location(button0, file$l, 63, 3, 2103);
				attr_dev(div0, "class", "flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack focus-within:border-osvauld-activeBorder");
				add_location(div0, file$l, 52, 2, 1678);
				attr_dev(span, "class", span_class_value = "text-xs text-red-500 font-thin mt-2 " + (/*errorMessage*/ ctx[1] ? 'visible' : 'invisible'));
				add_location(span, file$l, 75, 2, 2316);
				attr_dev(button1, "class", "bg-osvauld-carolinablue py-2 px-10 mt-8 rounded-lg text-osvauld-ninjablack font-medium w-[150px] flex justify-center items-center whitespace-nowrap");
				attr_dev(button1, "type", "submit");
				add_location(button1, file$l, 80, 2, 2455);
				attr_dev(form, "class", "flex flex-col justify-center items-center");
				add_location(form, file$l, 46, 1, 1519);
				attr_dev(div1, "class", "h-auto mt-10 flex justify-center items-center text-base font-normal text-osvauld-sheffieldgrey");
				add_location(div1, file$l, 43, 0, 1407);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, form);
				append_dev(form, label);
				append_dev(form, t1);
				append_dev(form, div0);
				append_dev(div0, input);
				append_dev(div0, t2);
				append_dev(div0, button0);
				if_blocks[current_block_type_index].m(button0, null);
				append_dev(form, t3);
				append_dev(form, span);
				append_dev(span, t4);
				append_dev(form, t5);
				append_dev(form, button1);
				if_blocks_1[current_block_type_index_1].m(button1, null);
				current = true;
				input.focus();

				if (!mounted) {
					dispose = [
						listen_dev(input, "input", /*onInput*/ ctx[6], false, false, false, false),
						listen_dev(button0, "click", /*toggleShowPassword*/ ctx[4], false, false, false, false),
						listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[5]), false, true, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (!current || dirty & /*type*/ 8) {
					attr_dev(input, "type", /*type*/ ctx[3]);
				}

				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index !== previous_block_index) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block0 = if_blocks[current_block_type_index];

					if (!if_block0) {
						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block0.c();
					}

					transition_in(if_block0, 1);
					if_block0.m(button0, null);
				}

				if (!current || dirty & /*errorMessage*/ 2 && span_class_value !== (span_class_value = "text-xs text-red-500 font-thin mt-2 " + (/*errorMessage*/ ctx[1] ? 'visible' : 'invisible'))) {
					attr_dev(span, "class", span_class_value);
				}

				let previous_block_index_1 = current_block_type_index_1;
				current_block_type_index_1 = select_block_type_1(ctx);

				if (current_block_type_index_1 !== previous_block_index_1) {
					group_outros();

					transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
						if_blocks_1[previous_block_index_1] = null;
					});

					check_outros();
					if_block1 = if_blocks_1[current_block_type_index_1];

					if (!if_block1) {
						if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
						if_block1.c();
					}

					transition_in(if_block1, 1);
					if_block1.m(button1, null);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}

				if_blocks[current_block_type_index].d();
				if_blocks_1[current_block_type_index_1].d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$l.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$l($$self, $$props, $$invalidate) {
		let type;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Welcome', slots, []);
		const dispatch = createEventDispatcher();
		let passphrase = "";
		let showPassword = false;
		let errorMessage = false;
		let isLoaderActive = false;

		function toggleShowPassword() {
			$$invalidate(0, showPassword = !showPassword);
		}

		async function handleSubmit() {
			$$invalidate(2, isLoaderActive = true);
			const pubkey = await sendMessage("getPubKey", { passphrase });
			const challengeResponse = await createChallenge(pubkey);

			const signature = await sendMessage("signChallenge", {
				challenge: challengeResponse.data.challenge
			});

			const verificationResponse = await initiateAuth(signature, pubkey);
			const token = verificationResponse.data.token;

			if (token) {
				await StorageService.setToken(token);
				await StorageService.setIsLoggedIn("true");
				dispatch("authenticated", true);
			} else {
				$$invalidate(1, errorMessage = true);
			}

			$$invalidate(2, isLoaderActive = false);
		}

		const onInput = event => {
			passphrase = event.target.value;
		};

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Welcome> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			Eye,
			Loader,
			createEventDispatcher,
			ClosedEye,
			sendMessage,
			createChallenge,
			initiateAuth,
			StorageService,
			dispatch,
			passphrase,
			showPassword,
			errorMessage,
			isLoaderActive,
			toggleShowPassword,
			handleSubmit,
			onInput,
			type
		});

		$$self.$inject_state = $$props => {
			if ('passphrase' in $$props) passphrase = $$props.passphrase;
			if ('showPassword' in $$props) $$invalidate(0, showPassword = $$props.showPassword);
			if ('errorMessage' in $$props) $$invalidate(1, errorMessage = $$props.errorMessage);
			if ('isLoaderActive' in $$props) $$invalidate(2, isLoaderActive = $$props.isLoaderActive);
			if ('type' in $$props) $$invalidate(3, type = $$props.type);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*showPassword*/ 1) {
				$$invalidate(3, type = showPassword ? "text" : "password");
			}
		};

		return [
			showPassword,
			errorMessage,
			isLoaderActive,
			type,
			toggleShowPassword,
			handleSubmit,
			onInput
		];
	}

	class Welcome extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Welcome",
				options,
				id: create_fragment$l.name
			});
		}
	}

	/* src/lib/components/basic/icons/maximize.svelte generated by Svelte v4.2.19 */
	const file$k = "src/lib/components/basic/icons/maximize.svelte";

	function create_fragment$k(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill-rule", "evenodd");
				attr_dev(path, "clip-rule", "evenodd");
				attr_dev(path, "d", "M14 3H19.75C20.44 3 21 3.56 21 4.25V10H19.5V5.56L15.78 9.28L14.72 8.22L18.44 4.5H14V3ZM8.22 14.72L9.28 15.78L5.56 19.5H10V21H4.25C3.56 21 3 20.44 3 19.75V14H4.5V18.44L8.22 14.72ZM3 4.25V10H4.5V5.56L8.22 9.28L9.28 8.22L5.56 4.5H10.5V3H4.25C3.56 3 3 3.56 3 4.25ZM15.78 14.72L19.5 18.44V14H21V19.75C21 20.44 20.44 21 19.75 21H14V19.5H18.44L14.72 15.78L15.78 14.72Z");
				attr_dev(path, "fill", "#6E7681");
				add_location(path, file$k, 7, 1, 103);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "width", "20");
				attr_dev(svg, "height", "20");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				add_location(svg, file$k, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$k.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$k($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Maximize', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Maximize> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class Maximize extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Maximize",
				options,
				id: create_fragment$k.name
			});
		}
	}

	/*
	Adapted from https://github.com/mattdesl
	Distributed under MIT License https://github.com/mattdesl/eases/blob/master/LICENSE.md
	*/

	/**
	 * https://svelte.dev/docs/svelte-easing
	 * @param {number} t
	 * @returns {number}
	 */
	function cubicOut(t) {
		const f = t - 1.0;
		return f * f * f + 1.0;
	}

	/**
	 * Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.
	 *
	 * https://svelte.dev/docs/svelte-transition#fade
	 * @param {Element} node
	 * @param {import('./public').FadeParams} [params]
	 * @returns {import('./public').TransitionConfig}
	 */
	function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
		const o = +getComputedStyle(node).opacity;
		return {
			delay,
			duration,
			easing,
			css: (t) => `opacity: ${t * o}`
		};
	}

	/**
	 * Animates the x and y positions and the opacity of an element. `in` transitions animate from the provided values, passed as parameters to the element's default values. `out` transitions animate from the element's default values to the provided values.
	 *
	 * https://svelte.dev/docs/svelte-transition#fly
	 * @param {Element} node
	 * @param {import('./public').FlyParams} [params]
	 * @returns {import('./public').TransitionConfig}
	 */
	function fly(
		node,
		{ delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}
	) {
		const style = getComputedStyle(node);
		const target_opacity = +style.opacity;
		const transform = style.transform === 'none' ? '' : style.transform;
		const od = target_opacity * (1 - opacity);
		const [xValue, xUnit] = split_css_unit(x);
		const [yValue, yUnit] = split_css_unit(y);
		return {
			delay,
			duration,
			easing,
			css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - od * u}`
		};
	}

	/**
	 * Animates the opacity and scale of an element. `in` transitions animate from an element's current (default) values to the provided values, passed as parameters. `out` transitions animate from the provided values to an element's default values.
	 *
	 * https://svelte.dev/docs/svelte-transition#scale
	 * @param {Element} node
	 * @param {import('./public').ScaleParams} [params]
	 * @returns {import('./public').TransitionConfig}
	 */
	function scale(
		node,
		{ delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}
	) {
		const style = getComputedStyle(node);
		const target_opacity = +style.opacity;
		const transform = style.transform === 'none' ? '' : style.transform;
		const sd = 1 - start;
		const od = target_opacity * (1 - opacity);
		return {
			delay,
			duration,
			easing,
			css: (_t, u) => `
			transform: ${transform} scale(${1 - sd * u});
			opacity: ${target_opacity - od * u}
		`
		};
	}

	/**
	 * A JavaScript implementation of the SHA family of hashes - defined in FIPS PUB 180-4, FIPS PUB 202,
	 * and SP 800-185 - as well as the corresponding HMAC implementation as defined in FIPS PUB 198-1.
	 *
	 * Copyright 2008-2023 Brian Turek, 1998-2009 Paul Johnston & Contributors
	 * Distributed under the BSD License
	 * See http://caligatio.github.com/jsSHA/ for more information
	 */
	const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",n="ARRAYBUFFER not supported by this environment",e="UINT8ARRAY not supported by this environment";function r(t,n,e,r){let i,s,o;const h=n||[0],u=(e=e||0)>>>3,w=-1===r?3:0;for(i=0;i<t.length;i+=1)o=i+u,s=o>>>2,h.length<=s&&h.push(0),h[s]|=t[i]<<8*(w+r*(o%4));return {value:h,binLen:8*t.length+e}}function i(i,s,o){switch(s){case"UTF8":case"UTF16BE":case"UTF16LE":break;default:throw new Error("encoding must be UTF8, UTF16BE, or UTF16LE")}switch(i){case"HEX":return function(t,n,e){return function(t,n,e,r){let i,s,o,h;if(0!=t.length%2)throw new Error("String of HEX type must be in byte increments");const u=n||[0],w=(e=e||0)>>>3,c=-1===r?3:0;for(i=0;i<t.length;i+=2){if(s=parseInt(t.substr(i,2),16),isNaN(s))throw new Error("String of HEX type contains invalid characters");for(h=(i>>>1)+w,o=h>>>2;u.length<=o;)u.push(0);u[o]|=s<<8*(c+r*(h%4));}return {value:u,binLen:4*t.length+e}}(t,n,e,o)};case"TEXT":return function(t,n,e){return function(t,n,e,r,i){let s,o,h,u,w,c,f,a,l=0;const A=e||[0],E=(r=r||0)>>>3;if("UTF8"===n)for(f=-1===i?3:0,h=0;h<t.length;h+=1)for(s=t.charCodeAt(h),o=[],128>s?o.push(s):2048>s?(o.push(192|s>>>6),o.push(128|63&s)):55296>s||57344<=s?o.push(224|s>>>12,128|s>>>6&63,128|63&s):(h+=1,s=65536+((1023&s)<<10|1023&t.charCodeAt(h)),o.push(240|s>>>18,128|s>>>12&63,128|s>>>6&63,128|63&s)),u=0;u<o.length;u+=1){for(c=l+E,w=c>>>2;A.length<=w;)A.push(0);A[w]|=o[u]<<8*(f+i*(c%4)),l+=1;}else for(f=-1===i?2:0,a="UTF16LE"===n&&1!==i||"UTF16LE"!==n&&1===i,h=0;h<t.length;h+=1){for(s=t.charCodeAt(h),!0===a&&(u=255&s,s=u<<8|s>>>8),c=l+E,w=c>>>2;A.length<=w;)A.push(0);A[w]|=s<<8*(f+i*(c%4)),l+=2;}return {value:A,binLen:8*l+r}}(t,s,n,e,o)};case"B64":return function(n,e,r){return function(n,e,r,i){let s,o,h,u,w,c,f,a=0;const l=e||[0],A=(r=r||0)>>>3,E=-1===i?3:0,H=n.indexOf("=");if(-1===n.search(/^[a-zA-Z0-9=+/]+$/))throw new Error("Invalid character in base-64 string");if(n=n.replace(/=/g,""),-1!==H&&H<n.length)throw new Error("Invalid '=' found in base-64 string");for(o=0;o<n.length;o+=4){for(w=n.substr(o,4),u=0,h=0;h<w.length;h+=1)s=t.indexOf(w.charAt(h)),u|=s<<18-6*h;for(h=0;h<w.length-1;h+=1){for(f=a+A,c=f>>>2;l.length<=c;)l.push(0);l[c]|=(u>>>16-8*h&255)<<8*(E+i*(f%4)),a+=1;}}return {value:l,binLen:8*a+r}}(n,e,r,o)};case"BYTES":return function(t,n,e){return function(t,n,e,r){let i,s,o,h;const u=n||[0],w=(e=e||0)>>>3,c=-1===r?3:0;for(s=0;s<t.length;s+=1)i=t.charCodeAt(s),h=s+w,o=h>>>2,u.length<=o&&u.push(0),u[o]|=i<<8*(c+r*(h%4));return {value:u,binLen:8*t.length+e}}(t,n,e,o)};case"ARRAYBUFFER":try{new ArrayBuffer(0);}catch(t){throw new Error(n)}return function(t,n,e){return function(t,n,e,i){return r(new Uint8Array(t),n,e,i)}(t,n,e,o)};case"UINT8ARRAY":try{new Uint8Array(0);}catch(t){throw new Error(e)}return function(t,n,e){return r(t,n,e,o)};default:throw new Error("format must be HEX, TEXT, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY")}}function s(r,i,s,o){switch(r){case"HEX":return function(t){return function(t,n,e,r){const i="0123456789abcdef";let s,o,h="";const u=n/8,w=-1===e?3:0;for(s=0;s<u;s+=1)o=t[s>>>2]>>>8*(w+e*(s%4)),h+=i.charAt(o>>>4&15)+i.charAt(15&o);return r.outputUpper?h.toUpperCase():h}(t,i,s,o)};case"B64":return function(n){return function(n,e,r,i){let s,o,h,u,w,c="";const f=e/8,a=-1===r?3:0;for(s=0;s<f;s+=3)for(u=s+1<f?n[s+1>>>2]:0,w=s+2<f?n[s+2>>>2]:0,h=(n[s>>>2]>>>8*(a+r*(s%4))&255)<<16|(u>>>8*(a+r*((s+1)%4))&255)<<8|w>>>8*(a+r*((s+2)%4))&255,o=0;o<4;o+=1)c+=8*s+6*o<=e?t.charAt(h>>>6*(3-o)&63):i.b64Pad;return c}(n,i,s,o)};case"BYTES":return function(t){return function(t,n,e){let r,i,s="";const o=n/8,h=-1===e?3:0;for(r=0;r<o;r+=1)i=t[r>>>2]>>>8*(h+e*(r%4))&255,s+=String.fromCharCode(i);return s}(t,i,s)};case"ARRAYBUFFER":try{new ArrayBuffer(0);}catch(t){throw new Error(n)}return function(t){return function(t,n,e){let r;const i=n/8,s=new ArrayBuffer(i),o=new Uint8Array(s),h=-1===e?3:0;for(r=0;r<i;r+=1)o[r]=t[r>>>2]>>>8*(h+e*(r%4))&255;return s}(t,i,s)};case"UINT8ARRAY":try{new Uint8Array(0);}catch(t){throw new Error(e)}return function(t){return function(t,n,e){let r;const i=n/8,s=-1===e?3:0,o=new Uint8Array(i);for(r=0;r<i;r+=1)o[r]=t[r>>>2]>>>8*(s+e*(r%4))&255;return o}(t,i,s)};default:throw new Error("format must be HEX, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY")}}const o=4294967296,h=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],u=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428],w=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],c="Chosen SHA variant is not supported",f="Cannot set numRounds with MAC";function a(t,n){let e,r;const i=t.binLen>>>3,s=n.binLen>>>3,o=i<<3,h=4-i<<3;if(i%4!=0){for(e=0;e<s;e+=4)r=i+e>>>2,t.value[r]|=n.value[e>>>2]<<o,t.value.push(0),t.value[r+1]|=n.value[e>>>2]>>>h;return (t.value.length<<2)-4>=s+i&&t.value.pop(),{value:t.value,binLen:t.binLen+n.binLen}}return {value:t.value.concat(n.value),binLen:t.binLen+n.binLen}}function l(t){const n={outputUpper:!1,b64Pad:"=",outputLen:-1},e=t||{},r="Output length must be a multiple of 8";if(n.outputUpper=e.outputUpper||!1,e.b64Pad&&(n.b64Pad=e.b64Pad),e.outputLen){if(e.outputLen%8!=0)throw new Error(r);n.outputLen=e.outputLen;}else if(e.shakeLen){if(e.shakeLen%8!=0)throw new Error(r);n.outputLen=e.shakeLen;}if("boolean"!=typeof n.outputUpper)throw new Error("Invalid outputUpper formatting option");if("string"!=typeof n.b64Pad)throw new Error("Invalid b64Pad formatting option");return n}function A(t,n,e,r){const s=t+" must include a value and format";if(!n){if(!r)throw new Error(s);return r}if(void 0===n.value||!n.format)throw new Error(s);return i(n.format,n.encoding||"UTF8",e)(n.value)}class E{constructor(t,n,e){const r=e||{};if(this.t=n,this.i=r.encoding||"UTF8",this.numRounds=r.numRounds||1,isNaN(this.numRounds)||this.numRounds!==parseInt(this.numRounds,10)||1>this.numRounds)throw new Error("numRounds must a integer >= 1");this.o=t,this.h=[],this.u=0,this.l=!1,this.A=0,this.H=!1,this.S=[],this.p=[];}update(t){let n,e=0;const r=this.m>>>5,i=this.C(t,this.h,this.u),s=i.binLen,o=i.value,h=s>>>5;for(n=0;n<h;n+=r)e+this.m<=s&&(this.U=this.v(o.slice(n,n+r),this.U),e+=this.m);return this.A+=e,this.h=o.slice(e>>>5),this.u=s%this.m,this.l=!0,this}getHash(t,n){let e,r,i=this.R;const o=l(n);if(this.K){if(-1===o.outputLen)throw new Error("Output length must be specified in options");i=o.outputLen;}const h=s(t,i,this.T,o);if(this.H&&this.g)return h(this.g(o));for(r=this.F(this.h.slice(),this.u,this.A,this.L(this.U),i),e=1;e<this.numRounds;e+=1)this.K&&i%32!=0&&(r[r.length-1]&=16777215>>>24-i%32),r=this.F(r,i,0,this.B(this.o),i);return h(r)}setHMACKey(t,n,e){if(!this.M)throw new Error("Variant does not support HMAC");if(this.l)throw new Error("Cannot set MAC key after calling update");const r=i(n,(e||{}).encoding||"UTF8",this.T);this.k(r(t));}k(t){const n=this.m>>>3,e=n/4-1;let r;if(1!==this.numRounds)throw new Error(f);if(this.H)throw new Error("MAC key already set");for(n<t.binLen/8&&(t.value=this.F(t.value,t.binLen,0,this.B(this.o),this.R));t.value.length<=e;)t.value.push(0);for(r=0;r<=e;r+=1)this.S[r]=909522486^t.value[r],this.p[r]=1549556828^t.value[r];this.U=this.v(this.S,this.U),this.A=this.m,this.H=!0;}getHMAC(t,n){const e=l(n);return s(t,this.R,this.T,e)(this.Y())}Y(){let t;if(!this.H)throw new Error("Cannot call getHMAC without first setting MAC key");const n=this.F(this.h.slice(),this.u,this.A,this.L(this.U),this.R);return t=this.v(this.p,this.B(this.o)),t=this.F(n,this.R,this.m,t,this.R),t}}function H(t,n){return t<<n|t>>>32-n}function S(t,n){return t>>>n|t<<32-n}function b(t,n){return t>>>n}function p(t,n,e){return t^n^e}function d(t,n,e){return t&n^~t&e}function m(t,n,e){return t&n^t&e^n&e}function C(t){return S(t,2)^S(t,13)^S(t,22)}function y(t,n){const e=(65535&t)+(65535&n);return (65535&(t>>>16)+(n>>>16)+(e>>>16))<<16|65535&e}function U(t,n,e,r){const i=(65535&t)+(65535&n)+(65535&e)+(65535&r);return (65535&(t>>>16)+(n>>>16)+(e>>>16)+(r>>>16)+(i>>>16))<<16|65535&i}function v(t,n,e,r,i){const s=(65535&t)+(65535&n)+(65535&e)+(65535&r)+(65535&i);return (65535&(t>>>16)+(n>>>16)+(e>>>16)+(r>>>16)+(i>>>16)+(s>>>16))<<16|65535&s}function R(t){return S(t,7)^S(t,18)^b(t,3)}function K(t){return S(t,6)^S(t,11)^S(t,25)}function T(t){return [1732584193,4023233417,2562383102,271733878,3285377520]}function g(t,n){let e,r,i,s,o,h,u;const w=[];for(e=n[0],r=n[1],i=n[2],s=n[3],o=n[4],u=0;u<80;u+=1)w[u]=u<16?t[u]:H(w[u-3]^w[u-8]^w[u-14]^w[u-16],1),h=u<20?v(H(e,5),d(r,i,s),o,1518500249,w[u]):u<40?v(H(e,5),p(r,i,s),o,1859775393,w[u]):u<60?v(H(e,5),m(r,i,s),o,2400959708,w[u]):v(H(e,5),p(r,i,s),o,3395469782,w[u]),o=s,s=i,i=H(r,30),r=e,e=h;return n[0]=y(e,n[0]),n[1]=y(r,n[1]),n[2]=y(i,n[2]),n[3]=y(s,n[3]),n[4]=y(o,n[4]),n}function F(t,n,e,r){let i;const s=15+(n+65>>>9<<4),h=n+e;for(;t.length<=s;)t.push(0);for(t[n>>>5]|=128<<24-n%32,t[s]=4294967295&h,t[s-1]=h/o|0,i=0;i<t.length;i+=16)r=g(t.slice(i,i+16),r);return r}let L=class extends E{constructor(t,n,e){if("SHA-1"!==t)throw new Error(c);super(t,n,e);const r=e||{};this.M=!0,this.g=this.Y,this.T=-1,this.C=i(this.t,this.i,this.T),this.v=g,this.L=function(t){return t.slice()},this.B=T,this.F=F,this.U=[1732584193,4023233417,2562383102,271733878,3285377520],this.m=512,this.R=160,this.K=!1,r.hmacKey&&this.k(A("hmacKey",r.hmacKey,this.T));}};function B(t){let n;return n="SHA-224"==t?u.slice():w.slice(),n}function M(t,n){let e,r,i,s,o,u,w,c,f,a,l;const A=[];for(e=n[0],r=n[1],i=n[2],s=n[3],o=n[4],u=n[5],w=n[6],c=n[7],l=0;l<64;l+=1)A[l]=l<16?t[l]:U(S(E=A[l-2],17)^S(E,19)^b(E,10),A[l-7],R(A[l-15]),A[l-16]),f=v(c,K(o),d(o,u,w),h[l],A[l]),a=y(C(e),m(e,r,i)),c=w,w=u,u=o,o=y(s,f),s=i,i=r,r=e,e=y(f,a);var E;return n[0]=y(e,n[0]),n[1]=y(r,n[1]),n[2]=y(i,n[2]),n[3]=y(s,n[3]),n[4]=y(o,n[4]),n[5]=y(u,n[5]),n[6]=y(w,n[6]),n[7]=y(c,n[7]),n}let k=class extends E{constructor(t,n,e){if("SHA-224"!==t&&"SHA-256"!==t)throw new Error(c);super(t,n,e);const r=e||{};this.g=this.Y,this.M=!0,this.T=-1,this.C=i(this.t,this.i,this.T),this.v=M,this.L=function(t){return t.slice()},this.B=B,this.F=function(n,e,r,i){return function(t,n,e,r,i){let s,h;const u=15+(n+65>>>9<<4),w=n+e;for(;t.length<=u;)t.push(0);for(t[n>>>5]|=128<<24-n%32,t[u]=4294967295&w,t[u-1]=w/o|0,s=0;s<t.length;s+=16)r=M(t.slice(s,s+16),r);return h="SHA-224"===i?[r[0],r[1],r[2],r[3],r[4],r[5],r[6]]:r,h}(n,e,r,i,t)},this.U=B(t),this.m=512,this.R="SHA-224"===t?224:256,this.K=!1,r.hmacKey&&this.k(A("hmacKey",r.hmacKey,this.T));}};class Y{constructor(t,n){this.N=t,this.I=n;}}function N(t,n){let e;return n>32?(e=64-n,new Y(t.I<<n|t.N>>>e,t.N<<n|t.I>>>e)):0!==n?(e=32-n,new Y(t.N<<n|t.I>>>e,t.I<<n|t.N>>>e)):t}function I(t,n){let e;return n<32?(e=32-n,new Y(t.N>>>n|t.I<<e,t.I>>>n|t.N<<e)):(e=64-n,new Y(t.I>>>n|t.N<<e,t.N>>>n|t.I<<e))}function X(t,n){return new Y(t.N>>>n,t.I>>>n|t.N<<32-n)}function z(t,n,e){return new Y(t.N&n.N^t.N&e.N^n.N&e.N,t.I&n.I^t.I&e.I^n.I&e.I)}function x(t){const n=I(t,28),e=I(t,34),r=I(t,39);return new Y(n.N^e.N^r.N,n.I^e.I^r.I)}function _(t,n){let e,r;e=(65535&t.I)+(65535&n.I),r=(t.I>>>16)+(n.I>>>16)+(e>>>16);const i=(65535&r)<<16|65535&e;e=(65535&t.N)+(65535&n.N)+(r>>>16),r=(t.N>>>16)+(n.N>>>16)+(e>>>16);return new Y((65535&r)<<16|65535&e,i)}function O(t,n,e,r){let i,s;i=(65535&t.I)+(65535&n.I)+(65535&e.I)+(65535&r.I),s=(t.I>>>16)+(n.I>>>16)+(e.I>>>16)+(r.I>>>16)+(i>>>16);const o=(65535&s)<<16|65535&i;i=(65535&t.N)+(65535&n.N)+(65535&e.N)+(65535&r.N)+(s>>>16),s=(t.N>>>16)+(n.N>>>16)+(e.N>>>16)+(r.N>>>16)+(i>>>16);return new Y((65535&s)<<16|65535&i,o)}function P(t,n,e,r,i){let s,o;s=(65535&t.I)+(65535&n.I)+(65535&e.I)+(65535&r.I)+(65535&i.I),o=(t.I>>>16)+(n.I>>>16)+(e.I>>>16)+(r.I>>>16)+(i.I>>>16)+(s>>>16);const h=(65535&o)<<16|65535&s;s=(65535&t.N)+(65535&n.N)+(65535&e.N)+(65535&r.N)+(65535&i.N)+(o>>>16),o=(t.N>>>16)+(n.N>>>16)+(e.N>>>16)+(r.N>>>16)+(i.N>>>16)+(s>>>16);return new Y((65535&o)<<16|65535&s,h)}function V(t,n){return new Y(t.N^n.N,t.I^n.I)}function Z(t){const n=I(t,19),e=I(t,61),r=X(t,6);return new Y(n.N^e.N^r.N,n.I^e.I^r.I)}function j(t){const n=I(t,1),e=I(t,8),r=X(t,7);return new Y(n.N^e.N^r.N,n.I^e.I^r.I)}function q(t){const n=I(t,14),e=I(t,18),r=I(t,41);return new Y(n.N^e.N^r.N,n.I^e.I^r.I)}const D=[new Y(h[0],3609767458),new Y(h[1],602891725),new Y(h[2],3964484399),new Y(h[3],2173295548),new Y(h[4],4081628472),new Y(h[5],3053834265),new Y(h[6],2937671579),new Y(h[7],3664609560),new Y(h[8],2734883394),new Y(h[9],1164996542),new Y(h[10],1323610764),new Y(h[11],3590304994),new Y(h[12],4068182383),new Y(h[13],991336113),new Y(h[14],633803317),new Y(h[15],3479774868),new Y(h[16],2666613458),new Y(h[17],944711139),new Y(h[18],2341262773),new Y(h[19],2007800933),new Y(h[20],1495990901),new Y(h[21],1856431235),new Y(h[22],3175218132),new Y(h[23],2198950837),new Y(h[24],3999719339),new Y(h[25],766784016),new Y(h[26],2566594879),new Y(h[27],3203337956),new Y(h[28],1034457026),new Y(h[29],2466948901),new Y(h[30],3758326383),new Y(h[31],168717936),new Y(h[32],1188179964),new Y(h[33],1546045734),new Y(h[34],1522805485),new Y(h[35],2643833823),new Y(h[36],2343527390),new Y(h[37],1014477480),new Y(h[38],1206759142),new Y(h[39],344077627),new Y(h[40],1290863460),new Y(h[41],3158454273),new Y(h[42],3505952657),new Y(h[43],106217008),new Y(h[44],3606008344),new Y(h[45],1432725776),new Y(h[46],1467031594),new Y(h[47],851169720),new Y(h[48],3100823752),new Y(h[49],1363258195),new Y(h[50],3750685593),new Y(h[51],3785050280),new Y(h[52],3318307427),new Y(h[53],3812723403),new Y(h[54],2003034995),new Y(h[55],3602036899),new Y(h[56],1575990012),new Y(h[57],1125592928),new Y(h[58],2716904306),new Y(h[59],442776044),new Y(h[60],593698344),new Y(h[61],3733110249),new Y(h[62],2999351573),new Y(h[63],3815920427),new Y(3391569614,3928383900),new Y(3515267271,566280711),new Y(3940187606,3454069534),new Y(4118630271,4000239992),new Y(116418474,1914138554),new Y(174292421,2731055270),new Y(289380356,3203993006),new Y(460393269,320620315),new Y(685471733,587496836),new Y(852142971,1086792851),new Y(1017036298,365543100),new Y(1126000580,2618297676),new Y(1288033470,3409855158),new Y(1501505948,4234509866),new Y(1607167915,987167468),new Y(1816402316,1246189591)];function G(t){return "SHA-384"===t?[new Y(3418070365,u[0]),new Y(1654270250,u[1]),new Y(2438529370,u[2]),new Y(355462360,u[3]),new Y(1731405415,u[4]),new Y(41048885895,u[5]),new Y(3675008525,u[6]),new Y(1203062813,u[7])]:[new Y(w[0],4089235720),new Y(w[1],2227873595),new Y(w[2],4271175723),new Y(w[3],1595750129),new Y(w[4],2917565137),new Y(w[5],725511199),new Y(w[6],4215389547),new Y(w[7],327033209)]}function J(t,n){let e,r,i,s,o,h,u,w,c,f,a,l;const A=[];for(e=n[0],r=n[1],i=n[2],s=n[3],o=n[4],h=n[5],u=n[6],w=n[7],a=0;a<80;a+=1)a<16?(l=2*a,A[a]=new Y(t[l],t[l+1])):A[a]=O(Z(A[a-2]),A[a-7],j(A[a-15]),A[a-16]),c=P(w,q(o),(H=h,S=u,new Y((E=o).N&H.N^~E.N&S.N,E.I&H.I^~E.I&S.I)),D[a],A[a]),f=_(x(e),z(e,r,i)),w=u,u=h,h=o,o=_(s,c),s=i,i=r,r=e,e=_(c,f);var E,H,S;return n[0]=_(e,n[0]),n[1]=_(r,n[1]),n[2]=_(i,n[2]),n[3]=_(s,n[3]),n[4]=_(o,n[4]),n[5]=_(h,n[5]),n[6]=_(u,n[6]),n[7]=_(w,n[7]),n}let Q=class extends E{constructor(t,n,e){if("SHA-384"!==t&&"SHA-512"!==t)throw new Error(c);super(t,n,e);const r=e||{};this.g=this.Y,this.M=!0,this.T=-1,this.C=i(this.t,this.i,this.T),this.v=J,this.L=function(t){return t.slice()},this.B=G,this.F=function(n,e,r,i){return function(t,n,e,r,i){let s,h;const u=31+(n+129>>>10<<5),w=n+e;for(;t.length<=u;)t.push(0);for(t[n>>>5]|=128<<24-n%32,t[u]=4294967295&w,t[u-1]=w/o|0,s=0;s<t.length;s+=32)r=J(t.slice(s,s+32),r);return h="SHA-384"===i?[r[0].N,r[0].I,r[1].N,r[1].I,r[2].N,r[2].I,r[3].N,r[3].I,r[4].N,r[4].I,r[5].N,r[5].I]:[r[0].N,r[0].I,r[1].N,r[1].I,r[2].N,r[2].I,r[3].N,r[3].I,r[4].N,r[4].I,r[5].N,r[5].I,r[6].N,r[6].I,r[7].N,r[7].I],h}(n,e,r,i,t)},this.U=G(t),this.m=1024,this.R="SHA-384"===t?384:512,this.K=!1,r.hmacKey&&this.k(A("hmacKey",r.hmacKey,this.T));}};const W=[new Y(0,1),new Y(0,32898),new Y(2147483648,32906),new Y(2147483648,2147516416),new Y(0,32907),new Y(0,2147483649),new Y(2147483648,2147516545),new Y(2147483648,32777),new Y(0,138),new Y(0,136),new Y(0,2147516425),new Y(0,2147483658),new Y(0,2147516555),new Y(2147483648,139),new Y(2147483648,32905),new Y(2147483648,32771),new Y(2147483648,32770),new Y(2147483648,128),new Y(0,32778),new Y(2147483648,2147483658),new Y(2147483648,2147516545),new Y(2147483648,32896),new Y(0,2147483649),new Y(2147483648,2147516424)],$=[[0,36,3,41,18],[1,44,10,45,2],[62,6,43,15,61],[28,55,25,21,56],[27,20,39,8,14]];function tt(t){let n;const e=[];for(n=0;n<5;n+=1)e[n]=[new Y(0,0),new Y(0,0),new Y(0,0),new Y(0,0),new Y(0,0)];return e}function nt(t){let n;const e=[];for(n=0;n<5;n+=1)e[n]=t[n].slice();return e}function et(t,n){let e,r,i,s;const o=[],h=[];if(null!==t)for(r=0;r<t.length;r+=2)n[(r>>>1)%5][(r>>>1)/5|0]=V(n[(r>>>1)%5][(r>>>1)/5|0],new Y(t[r+1],t[r]));for(e=0;e<24;e+=1){for(s=tt(),r=0;r<5;r+=1)o[r]=(u=n[r][0],w=n[r][1],c=n[r][2],f=n[r][3],a=n[r][4],new Y(u.N^w.N^c.N^f.N^a.N,u.I^w.I^c.I^f.I^a.I));for(r=0;r<5;r+=1)h[r]=V(o[(r+4)%5],N(o[(r+1)%5],1));for(r=0;r<5;r+=1)for(i=0;i<5;i+=1)n[r][i]=V(n[r][i],h[r]);for(r=0;r<5;r+=1)for(i=0;i<5;i+=1)s[i][(2*r+3*i)%5]=N(n[r][i],$[r][i]);for(r=0;r<5;r+=1)for(i=0;i<5;i+=1)n[r][i]=V(s[r][i],new Y(~s[(r+1)%5][i].N&s[(r+2)%5][i].N,~s[(r+1)%5][i].I&s[(r+2)%5][i].I));n[0][0]=V(n[0][0],W[e]);}var u,w,c,f,a;return n}function rt(t){let n,e,r=0;const i=[0,0],s=[4294967295&t,t/o&2097151];for(n=6;n>=0;n--)e=s[n>>2]>>>8*n&255,0===e&&0===r||(i[r+1>>2]|=e<<8*(r+1),r+=1);return r=0!==r?r:1,i[0]|=r,{value:r+1>4?i:[i[0]],binLen:8+8*r}}function it(t){return a(rt(t.binLen),t)}function st(t,n){let e,r=rt(n);r=a(r,t);const i=n>>>2,s=(i-r.value.length%i)%i;for(e=0;e<s;e++)r.value.push(0);return r.value}let ot=class extends E{constructor(t,n,e){let r=6,s=0;super(t,n,e);const o=e||{};if(1!==this.numRounds){if(o.kmacKey||o.hmacKey)throw new Error(f);if("CSHAKE128"===this.o||"CSHAKE256"===this.o)throw new Error("Cannot set numRounds for CSHAKE variants")}switch(this.T=1,this.C=i(this.t,this.i,this.T),this.v=et,this.L=nt,this.B=tt,this.U=tt(),this.K=!1,t){case"SHA3-224":this.m=s=1152,this.R=224,this.M=!0,this.g=this.Y;break;case"SHA3-256":this.m=s=1088,this.R=256,this.M=!0,this.g=this.Y;break;case"SHA3-384":this.m=s=832,this.R=384,this.M=!0,this.g=this.Y;break;case"SHA3-512":this.m=s=576,this.R=512,this.M=!0,this.g=this.Y;break;case"SHAKE128":r=31,this.m=s=1344,this.R=-1,this.K=!0,this.M=!1,this.g=null;break;case"SHAKE256":r=31,this.m=s=1088,this.R=-1,this.K=!0,this.M=!1,this.g=null;break;case"KMAC128":r=4,this.m=s=1344,this.X(e),this.R=-1,this.K=!0,this.M=!1,this.g=this._;break;case"KMAC256":r=4,this.m=s=1088,this.X(e),this.R=-1,this.K=!0,this.M=!1,this.g=this._;break;case"CSHAKE128":this.m=s=1344,r=this.O(e),this.R=-1,this.K=!0,this.M=!1,this.g=null;break;case"CSHAKE256":this.m=s=1088,r=this.O(e),this.R=-1,this.K=!0,this.M=!1,this.g=null;break;default:throw new Error(c)}this.F=function(t,n,e,i,o){return function(t,n,e,r,i,s,o){let h,u,w=0;const c=[],f=i>>>5,a=n>>>5;for(h=0;h<a&&n>=i;h+=f)r=et(t.slice(h,h+f),r),n-=i;for(t=t.slice(h),n%=i;t.length<f;)t.push(0);for(h=n>>>3,t[h>>2]^=s<<h%4*8,t[f-1]^=2147483648,r=et(t,r);32*c.length<o&&(u=r[w%5][w/5|0],c.push(u.I),!(32*c.length>=o));)c.push(u.N),w+=1,0==64*w%i&&(et(null,r),w=0);return c}(t,n,0,i,s,r,o)},o.hmacKey&&this.k(A("hmacKey",o.hmacKey,this.T));}O(t,n){const e=function(t){const n=t||{};return {funcName:A("funcName",n.funcName,1,{value:[],binLen:0}),customization:A("Customization",n.customization,1,{value:[],binLen:0})}}(t||{});n&&(e.funcName=n);const r=a(it(e.funcName),it(e.customization));if(0!==e.customization.binLen||0!==e.funcName.binLen){const t=st(r,this.m>>>3);for(let n=0;n<t.length;n+=this.m>>>5)this.U=this.v(t.slice(n,n+(this.m>>>5)),this.U),this.A+=this.m;return 4}return 31}X(t){const n=function(t){const n=t||{};return {kmacKey:A("kmacKey",n.kmacKey,1),funcName:{value:[1128353099],binLen:32},customization:A("Customization",n.customization,1,{value:[],binLen:0})}}(t||{});this.O(t,n.funcName);const e=st(it(n.kmacKey),this.m>>>3);for(let t=0;t<e.length;t+=this.m>>>5)this.U=this.v(e.slice(t,t+(this.m>>>5)),this.U),this.A+=this.m;this.H=!0;}_(t){const n=a({value:this.h.slice(),binLen:this.u},function(t){let n,e,r=0;const i=[0,0],s=[4294967295&t,t/o&2097151];for(n=6;n>=0;n--)e=s[n>>2]>>>8*n&255,0===e&&0===r||(i[r>>2]|=e<<8*r,r+=1);return r=0!==r?r:1,i[r>>2]|=r<<8*r,{value:r+1>4?i:[i[0]],binLen:8+8*r}}(t.outputLen));return this.F(n.value,n.binLen,this.A,this.L(this.U),t.outputLen)}};class ht{constructor(t,n,e){if("SHA-1"==t)this.P=new L(t,n,e);else if("SHA-224"==t||"SHA-256"==t)this.P=new k(t,n,e);else if("SHA-384"==t||"SHA-512"==t)this.P=new Q(t,n,e);else {if("SHA3-224"!=t&&"SHA3-256"!=t&&"SHA3-384"!=t&&"SHA3-512"!=t&&"SHAKE128"!=t&&"SHAKE256"!=t&&"CSHAKE128"!=t&&"CSHAKE256"!=t&&"KMAC128"!=t&&"KMAC256"!=t)throw new Error(c);this.P=new ot(t,n,e);}}update(t){return this.P.update(t),this}getHash(t,n){return this.P.getHash(t,n)}setHMACKey(t,n,e){this.P.setHMACKey(t,n,e);}getHMAC(t,n){return this.P.getHMAC(t,n)}}

	class TOTP {
	    static generate(key, options) {
	        const _options = { digits: 6, algorithm: "SHA-1", period: 30, timestamp: Date.now(), ...options };
	        const epoch = Math.floor(_options.timestamp / 1000.0);
	        const time = this.leftpad(this.dec2hex(Math.floor(epoch / _options.period)), 16, "0");
	        const shaObj = new ht(_options.algorithm, "HEX");
	        shaObj.setHMACKey(this.base32tohex(key), "HEX");
	        shaObj.update(time);
	        const hmac = shaObj.getHMAC("HEX");
	        const offset = this.hex2dec(hmac.substring(hmac.length - 1));
	        let otp = (this.hex2dec(hmac.substr(offset * 2, 8)) & this.hex2dec("7fffffff")) + "";
	        const start = Math.max(otp.length - _options.digits, 0);
	        otp = otp.substring(start, start + _options.digits);
	        const expires = Math.ceil((_options.timestamp + 1) / (_options.period * 1000)) * _options.period * 1000;
	        return { otp, expires };
	    }
	    static hex2dec(hex) {
	        return parseInt(hex, 16);
	    }
	    static dec2hex(dec) {
	        return (dec < 15.5 ? "0" : "") + Math.round(dec).toString(16);
	    }
	    static base32tohex(base32) {
	        const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
	        let bits = "";
	        let hex = "";
	        const _base32 = base32.replace(/=+$/, "");
	        for (let i = 0; i < _base32.length; i++) {
	            const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
	            if (val === -1)
	                throw new Error("Invalid base32 character in key");
	            bits += this.leftpad(val.toString(2), 5, "0");
	        }
	        for (let i = 0; i + 8 <= bits.length; i += 8) {
	            const chunk = bits.substr(i, 8);
	            hex = hex + this.leftpad(parseInt(chunk, 2).toString(16), 2, "0");
	        }
	        return hex;
	    }
	    static leftpad(str, len, pad) {
	        if (len + 1 >= str.length) {
	            str = Array(len + 1 - str.length).join(pad) + str;
	        }
	        return str;
	    }
	}

	/* src/lib/components/popup/components/CircularProgressBar.svelte generated by Svelte v4.2.19 */
	const file$j = "src/lib/components/popup/components/CircularProgressBar.svelte";

	function create_fragment$j(ctx) {
		let div2;
		let div1;
		let div0;
		let t0;
		let t1;
		let svg;
		let circle0;
		let circle1;

		const block = {
			c: function create() {
				div2 = element("div");
				div1 = element("div");
				div0 = element("div");
				t0 = text(/*counter*/ ctx[0]);
				t1 = space();
				svg = svg_element("svg");
				circle0 = svg_element("circle");
				circle1 = svg_element("circle");
				attr_dev(div0, "id", "number");
				attr_dev(div0, "class", "svelte-55ppma");
				add_location(div0, file$j, 96, 2, 1844);
				attr_dev(div1, "class", "inner svelte-55ppma");
				add_location(div1, file$j, 95, 1, 1822);
				attr_dev(circle0, "class", "track svelte-55ppma");
				attr_dev(circle0, "cx", "50%");
				attr_dev(circle0, "cy", "50%");
				attr_dev(circle0, "r", "10");
				attr_dev(circle0, "stroke-linecap", "round");
				add_location(circle0, file$j, 105, 2, 1981);
				attr_dev(circle1, "class", "progress svelte-55ppma");
				attr_dev(circle1, "cx", "50%");
				attr_dev(circle1, "cy", "50%");
				attr_dev(circle1, "r", "10");
				attr_dev(circle1, "stroke-linecap", "round");
				add_location(circle1, file$j, 107, 2, 2066);
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				attr_dev(svg, "version", "1.1");
				attr_dev(svg, "width", "24px");
				attr_dev(svg, "height", "24px");
				attr_dev(svg, "class", "svelte-55ppma");
				add_location(svg, file$j, 99, 1, 1887);
				attr_dev(div2, "class", "skill svelte-55ppma");
				add_location(div2, file$j, 94, 0, 1801);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div2, anchor);
				append_dev(div2, div1);
				append_dev(div1, div0);
				append_dev(div0, t0);
				append_dev(div2, t1);
				append_dev(div2, svg);
				append_dev(svg, circle0);
				append_dev(svg, circle1);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*counter*/ 1) set_data_dev(t0, /*counter*/ ctx[0]);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div2);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$j.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function updateCircle(value) {
		const circle = document.querySelector("circle.progress");
		const radius = circle.r.baseVal.value;
		const circumference = radius * 2 * Math.PI;
		circle.style.strokeDasharray = `${circumference}`;
		const offset = value * circumference;
		circle.style.strokeDashoffset = `${circumference - offset}`;
	}

	function instance$j($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('CircularProgressBar', slots, []);
		let { counter } = $$props;
		let progress = 1;

		onMount(() => {
			// Initialize the circle when the component mounts
			updateCircle(progress);
		});

		afterUpdate(() => {
			// Update progress based on the new counter value
			progress = counter / 30; // Assuming 30 is the initial value

			updateCircle(progress);
		});

		$$self.$$.on_mount.push(function () {
			if (counter === undefined && !('counter' in $$props || $$self.$$.bound[$$self.$$.props['counter']])) {
				console.warn("<CircularProgressBar> was created without expected prop 'counter'");
			}
		});

		const writable_props = ['counter'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CircularProgressBar> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('counter' in $$props) $$invalidate(0, counter = $$props.counter);
		};

		$$self.$capture_state = () => ({
			onMount,
			onDestroy,
			afterUpdate,
			counter,
			progress,
			updateCircle
		});

		$$self.$inject_state = $$props => {
			if ('counter' in $$props) $$invalidate(0, counter = $$props.counter);
			if ('progress' in $$props) progress = $$props.progress;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [counter];
	}

	class CircularProgressBar extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$j, create_fragment$j, safe_not_equal, { counter: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "CircularProgressBar",
				options,
				id: create_fragment$j.name
			});
		}

		get counter() {
			throw new Error("<CircularProgressBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set counter(value) {
			throw new Error("<CircularProgressBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/dashboard/credentials/EncryptedField.svelte generated by Svelte v4.2.19 */
	const file$i = "src/lib/components/dashboard/credentials/EncryptedField.svelte";

	// (91:3) {:else}
	function create_else_block_3$1(ctx) {
		let span;

		let t_value = (/*decrypted*/ ctx[4] && /*visibility*/ ctx[3]
		? /*decryptedValue*/ ctx[5]
		: ("*").repeat(8)) + "";

		let t;

		const block = {
			c: function create() {
				span = element("span");
				t = text(t_value);
				attr_dev(span, "class", "overflow-hidden whitespace-nowrap text-ellipsis");
				add_location(span, file$i, 111, 4, 2842);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*decrypted, visibility, decryptedValue*/ 56 && t_value !== (t_value = (/*decrypted*/ ctx[4] && /*visibility*/ ctx[3]
				? /*decryptedValue*/ ctx[5]
				: ("*").repeat(8)) + "")) set_data_dev(t, t_value);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_3$1.name,
			type: "else",
			source: "(91:3) {:else}",
			ctx
		});

		return block;
	}

	// (88:3) {#if fieldType === "totp" && decrypted}
	function create_if_block_5$2(ctx) {
		let span;
		let t0;
		let t1;
		let circularprogressbar;
		let current;

		circularprogressbar = new CircularProgressBar({
				props: { counter: /*timeRemaining*/ ctx[8] },
				$$inline: true
			});

		const block = {
			c: function create() {
				span = element("span");
				t0 = text(/*totpToken*/ ctx[7]);
				t1 = space();
				create_component(circularprogressbar.$$.fragment);
				attr_dev(span, "class", "mr-4");
				add_location(span, file$i, 108, 4, 2734);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t0);
				insert_dev(target, t1, anchor);
				mount_component(circularprogressbar, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (!current || dirty & /*totpToken*/ 128) set_data_dev(t0, /*totpToken*/ ctx[7]);
				const circularprogressbar_changes = {};
				if (dirty & /*timeRemaining*/ 256) circularprogressbar_changes.counter = /*timeRemaining*/ ctx[8];
				circularprogressbar.$set(circularprogressbar_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(circularprogressbar.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(circularprogressbar.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
					detach_dev(t1);
				}

				destroy_component(circularprogressbar, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_5$2.name,
			type: "if",
			source: "(88:3) {#if fieldType === \\\"totp\\\" && decrypted}",
			ctx
		});

		return block;
	}

	// (101:2) {:else}
	function create_else_block$a(ctx) {
		let div;
		let t;
		let button;
		let current_block_type_index;
		let if_block1;
		let current;
		let mounted;
		let dispose;
		let if_block0 = /*fieldType*/ ctx[1] !== "totp" && create_if_block_3$4(ctx);
		const if_block_creators = [create_if_block_1$b, create_if_block_2$6, create_else_block_1$5];
		const if_blocks = [];

		function select_block_type_3(ctx, dirty) {
			if (/*copied*/ ctx[6]) return 0;
			if (/*hoverEffect*/ ctx[2]) return 1;
			return 2;
		}

		current_block_type_index = select_block_type_3(ctx);
		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				div = element("div");
				if (if_block0) if_block0.c();
				t = space();
				button = element("button");
				if_block1.c();
				add_location(button, file$i, 134, 4, 3512);
				attr_dev(div, "class", "max-w-2/5 flex gap-2 items-center justify-end");
				add_location(div, file$i, 121, 3, 3155);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append_dev(div, t);
				append_dev(div, button);
				if_blocks[current_block_type_index].m(button, null);
				current = true;

				if (!mounted) {
					dispose = listen_dev(button, "click", stop_propagation(/*copyToClipboard*/ ctx[11]), false, false, true, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (/*fieldType*/ ctx[1] !== "totp") {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*fieldType*/ 2) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_3$4(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(div, t);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_3(ctx);

				if (current_block_type_index !== previous_block_index) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block1 = if_blocks[current_block_type_index];

					if (!if_block1) {
						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block1.c();
					}

					transition_in(if_block1, 1);
					if_block1.m(button, null);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (if_block0) if_block0.d();
				if_blocks[current_block_type_index].d();
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$a.name,
			type: "else",
			source: "(101:2) {:else}",
			ctx
		});

		return block;
	}

	// (97:2) {#if !decrypted}
	function create_if_block$c(ctx) {
		let button;
		let locked;
		let current;
		let mounted;
		let dispose;

		locked = new Locked({
				props: {
					color: /*hoverEffect*/ ctx[2] ? '#89B4FA' : '#4D4F60'
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				button = element("button");
				create_component(locked.$$.fragment);
				add_location(button, file$i, 117, 3, 3022);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);
				mount_component(locked, button, null);
				current = true;

				if (!mounted) {
					dispose = listen_dev(button, "click", stop_propagation(/*decrypt*/ ctx[9]), false, false, true, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				const locked_changes = {};
				if (dirty & /*hoverEffect*/ 4) locked_changes.color = /*hoverEffect*/ ctx[2] ? '#89B4FA' : '#4D4F60';
				locked.$set(locked_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(locked.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(locked.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(button);
				}

				destroy_component(locked);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$c.name,
			type: "if",
			source: "(97:2) {#if !decrypted}",
			ctx
		});

		return block;
	}

	// (103:4) {#if fieldType !== "totp"}
	function create_if_block_3$4(ctx) {
		let button0;
		let unlocked;
		let t;
		let button1;
		let current_block_type_index;
		let if_block;
		let current;
		let mounted;
		let dispose;
		unlocked = new Unlocked({ $$inline: true });
		const if_block_creators = [create_if_block_4$2, create_else_block_2$1];
		const if_blocks = [];

		function select_block_type_2(ctx, dirty) {
			if (/*visibility*/ ctx[3]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type_2(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				button0 = element("button");
				create_component(unlocked.$$.fragment);
				t = space();
				button1 = element("button");
				if_block.c();
				add_location(button0, file$i, 123, 5, 3251);
				add_location(button1, file$i, 126, 5, 3343);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button0, anchor);
				mount_component(unlocked, button0, null);
				insert_dev(target, t, anchor);
				insert_dev(target, button1, anchor);
				if_blocks[current_block_type_index].m(button1, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", stop_propagation(/*lockCredential*/ ctx[12]), false, false, true, false),
						listen_dev(button1, "click", stop_propagation(/*toggleVisibility*/ ctx[10]), false, false, true, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_2(ctx);

				if (current_block_type_index !== previous_block_index) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(button1, null);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(unlocked.$$.fragment, local);
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(unlocked.$$.fragment, local);
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(button0);
					detach_dev(t);
					detach_dev(button1);
				}

				destroy_component(unlocked);
				if_blocks[current_block_type_index].d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3$4.name,
			type: "if",
			source: "(103:4) {#if fieldType !== \\\"totp\\\"}",
			ctx
		});

		return block;
	}

	// (110:6) {:else}
	function create_else_block_2$1(ctx) {
		let eye;
		let current;
		eye = new Eye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(eye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(eye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(eye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(eye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(eye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_2$1.name,
			type: "else",
			source: "(110:6) {:else}",
			ctx
		});

		return block;
	}

	// (108:6) {#if visibility}
	function create_if_block_4$2(ctx) {
		let closedeye;
		let current;
		closedeye = new ClosedEye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(closedeye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(closedeye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(closedeye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(closedeye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(closedeye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_4$2.name,
			type: "if",
			source: "(108:6) {#if visibility}",
			ctx
		});

		return block;
	}

	// (122:5) {:else}
	function create_else_block_1$5(ctx) {
		let copyicon;
		let current;

		copyicon = new CopyIcon({
				props: { color: '#4D4F60' },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(copyicon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(copyicon, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(copyicon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(copyicon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(copyicon, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_1$5.name,
			type: "else",
			source: "(122:5) {:else}",
			ctx
		});

		return block;
	}

	// (120:27) 
	function create_if_block_2$6(ctx) {
		let activecopy;
		let current;
		activecopy = new ActiveCopy({ $$inline: true });

		const block = {
			c: function create() {
				create_component(activecopy.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(activecopy, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(activecopy.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(activecopy.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(activecopy, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2$6.name,
			type: "if",
			source: "(120:27) ",
			ctx
		});

		return block;
	}

	// (116:5) {#if copied}
	function create_if_block_1$b(ctx) {
		let span;
		let tick_1;
		let span_intro;
		let current;
		tick_1 = new Tick({ $$inline: true });

		const block = {
			c: function create() {
				span = element("span");
				create_component(tick_1.$$.fragment);
				add_location(span, file$i, 136, 6, 3590);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				mount_component(tick_1, span, null);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(tick_1.$$.fragment, local);

				if (local) {
					if (!span_intro) {
						add_render_callback(() => {
							span_intro = create_in_transition(span, scale, {});
							span_intro.start();
						});
					}
				}

				current = true;
			},
			o: function outro(local) {
				transition_out(tick_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				destroy_component(tick_1);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$b.name,
			type: "if",
			source: "(116:5) {#if copied}",
			ctx
		});

		return block;
	}

	function create_fragment$i(ctx) {
		let div2;
		let div0;
		let t0;
		let t1;
		let div1;
		let span;
		let current_block_type_index;
		let if_block0;
		let span_class_value;
		let t2;
		let current_block_type_index_1;
		let if_block1;
		let div1_class_value;
		let div2_intro;
		let div2_outro;
		let current;
		const if_block_creators = [create_if_block_5$2, create_else_block_3$1];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*fieldType*/ ctx[1] === "totp" && /*decrypted*/ ctx[4]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		const if_block_creators_1 = [create_if_block$c, create_else_block$a];
		const if_blocks_1 = [];

		function select_block_type_1(ctx, dirty) {
			if (!/*decrypted*/ ctx[4]) return 0;
			return 1;
		}

		current_block_type_index_1 = select_block_type_1(ctx);
		if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

		const block = {
			c: function create() {
				div2 = element("div");
				div0 = element("div");
				t0 = text(/*fieldName*/ ctx[0]);
				t1 = space();
				div1 = element("div");
				span = element("span");
				if_block0.c();
				t2 = space();
				if_block1.c();
				attr_dev(div0, "class", "label block mb-2 text-left text-osvauld-dusklabel text-xs font-normal cursor-pointer whitespace-nowrap text-ellipsis");
				add_location(div0, file$i, 91, 1, 2127);

				attr_dev(span, "class", span_class_value = "" + (/*fieldType*/ ctx[1] === 'totp'
				? 'min-w-[80%] max-w-[80%] mr-6'
				: 'w-3/5') + " flex justify-between items-center font-normal text-sm");

				add_location(span, file$i, 102, 2, 2537);

				attr_dev(div1, "class", div1_class_value = "py-1 px-3 w-full flex justify-between items-center text-base " + (/*hoverEffect*/ ctx[2]
				? 'text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md '
				: 'text-osvauld-fieldText rounded-none border-b border-osvauld-darkLineSeperator'));

				add_location(div1, file$i, 97, 1, 2286);
				attr_dev(div2, "class", "mb-2 mr-1 max-w-full");
				add_location(div2, file$i, 90, 0, 2076);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div2, anchor);
				append_dev(div2, div0);
				append_dev(div0, t0);
				append_dev(div2, t1);
				append_dev(div2, div1);
				append_dev(div1, span);
				if_blocks[current_block_type_index].m(span, null);
				append_dev(div1, t2);
				if_blocks_1[current_block_type_index_1].m(div1, null);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (!current || dirty & /*fieldName*/ 1) set_data_dev(t0, /*fieldName*/ ctx[0]);
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block0 = if_blocks[current_block_type_index];

					if (!if_block0) {
						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block0.c();
					} else {
						if_block0.p(ctx, dirty);
					}

					transition_in(if_block0, 1);
					if_block0.m(span, null);
				}

				if (!current || dirty & /*fieldType*/ 2 && span_class_value !== (span_class_value = "" + (/*fieldType*/ ctx[1] === 'totp'
				? 'min-w-[80%] max-w-[80%] mr-6'
				: 'w-3/5') + " flex justify-between items-center font-normal text-sm")) {
					attr_dev(span, "class", span_class_value);
				}

				let previous_block_index_1 = current_block_type_index_1;
				current_block_type_index_1 = select_block_type_1(ctx);

				if (current_block_type_index_1 === previous_block_index_1) {
					if_blocks_1[current_block_type_index_1].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
						if_blocks_1[previous_block_index_1] = null;
					});

					check_outros();
					if_block1 = if_blocks_1[current_block_type_index_1];

					if (!if_block1) {
						if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
						if_block1.c();
					} else {
						if_block1.p(ctx, dirty);
					}

					transition_in(if_block1, 1);
					if_block1.m(div1, null);
				}

				if (!current || dirty & /*hoverEffect*/ 4 && div1_class_value !== (div1_class_value = "py-1 px-3 w-full flex justify-between items-center text-base " + (/*hoverEffect*/ ctx[2]
				? 'text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md '
				: 'text-osvauld-fieldText rounded-none border-b border-osvauld-darkLineSeperator'))) {
					attr_dev(div1, "class", div1_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);

				if (local) {
					add_render_callback(() => {
						if (!current) return;
						if (div2_outro) div2_outro.end(1);
						div2_intro = create_in_transition(div2, fly, {});
						div2_intro.start();
					});
				}

				current = true;
			},
			o: function outro(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				if (div2_intro) div2_intro.invalidate();

				if (local) {
					div2_outro = create_out_transition(div2, fly, {});
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div2);
				}

				if_blocks[current_block_type_index].d();
				if_blocks_1[current_block_type_index_1].d();
				if (detaching && div2_outro) div2_outro.end();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$i.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$i($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('EncryptedField', slots, []);
		let { fieldName } = $$props;
		let { fieldValue } = $$props;
		let { fieldType = "sensitive" } = $$props;
		let { hoverEffect } = $$props;
		let visibility = false;
		let decrypted = false;
		let decryptedValue = null;
		let copied = false;
		let totpToken = null;
		let timeRemaining = 0;
		let totpInterval;

		const decrypt = async () => {
			$$invalidate(5, decryptedValue = await sendMessage("decryptField", fieldValue));
			$$invalidate(4, decrypted = true);

			if (fieldType === "totp") {
				generateTotpToken();
			}
		};

		const generateTotpToken = () => {
			const now = Date.now();
			const { otp, expires } = TOTP.generate(decryptedValue || fieldValue);
			$$invalidate(7, totpToken = otp);
			$$invalidate(8, timeRemaining = Math.floor((expires - now) / 1000));

			if (totpInterval) {
				clearInterval(totpInterval);
			}

			totpInterval = setInterval(
				() => {
					const currentTime = Date.now();
					$$invalidate(8, timeRemaining = Math.floor((expires - currentTime) / 1000));

					if (timeRemaining <= 0) {
						const newTotp = TOTP.generate(decryptedValue || fieldValue);
						$$invalidate(7, totpToken = newTotp.otp);
						$$invalidate(8, timeRemaining = Math.floor((newTotp.expires - currentTime) / 1000));
					}
				},
				1000
			);
		};

		const toggleVisibility = () => {
			$$invalidate(3, visibility = !visibility);

			setTimeout(
				() => {
					$$invalidate(3, visibility = false);
				},
				3000
			);
		};

		const copyToClipboard = async () => {
			if (decryptedValue === null) {
				return;
			}

			$$invalidate(6, copied = true);
			await navigator.clipboard.writeText(decryptedValue);

			setTimeout(
				() => {
					$$invalidate(6, copied = false);
				},
				2000
			);
		};

		const lockCredential = async () => {
			$$invalidate(4, decrypted = false);
			clearInterval(totpInterval);
			$$invalidate(5, decryptedValue = null);
		};

		onDestroy(() => {
			if (totpInterval) {
				clearInterval(totpInterval);
			}
		});

		$$self.$$.on_mount.push(function () {
			if (fieldName === undefined && !('fieldName' in $$props || $$self.$$.bound[$$self.$$.props['fieldName']])) {
				console.warn("<EncryptedField> was created without expected prop 'fieldName'");
			}

			if (fieldValue === undefined && !('fieldValue' in $$props || $$self.$$.bound[$$self.$$.props['fieldValue']])) {
				console.warn("<EncryptedField> was created without expected prop 'fieldValue'");
			}

			if (hoverEffect === undefined && !('hoverEffect' in $$props || $$self.$$.bound[$$self.$$.props['hoverEffect']])) {
				console.warn("<EncryptedField> was created without expected prop 'hoverEffect'");
			}
		});

		const writable_props = ['fieldName', 'fieldValue', 'fieldType', 'hoverEffect'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<EncryptedField> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('fieldName' in $$props) $$invalidate(0, fieldName = $$props.fieldName);
			if ('fieldValue' in $$props) $$invalidate(13, fieldValue = $$props.fieldValue);
			if ('fieldType' in $$props) $$invalidate(1, fieldType = $$props.fieldType);
			if ('hoverEffect' in $$props) $$invalidate(2, hoverEffect = $$props.hoverEffect);
		};

		$$self.$capture_state = () => ({
			fly,
			scale,
			Locked,
			Eye,
			Unlocked,
			ActiveCopy,
			ClosedEye,
			CopyIcon,
			Tick,
			TOTP,
			onDestroy,
			sendMessage,
			CircularProgressBar,
			fieldName,
			fieldValue,
			fieldType,
			hoverEffect,
			visibility,
			decrypted,
			decryptedValue,
			copied,
			totpToken,
			timeRemaining,
			totpInterval,
			decrypt,
			generateTotpToken,
			toggleVisibility,
			copyToClipboard,
			lockCredential
		});

		$$self.$inject_state = $$props => {
			if ('fieldName' in $$props) $$invalidate(0, fieldName = $$props.fieldName);
			if ('fieldValue' in $$props) $$invalidate(13, fieldValue = $$props.fieldValue);
			if ('fieldType' in $$props) $$invalidate(1, fieldType = $$props.fieldType);
			if ('hoverEffect' in $$props) $$invalidate(2, hoverEffect = $$props.hoverEffect);
			if ('visibility' in $$props) $$invalidate(3, visibility = $$props.visibility);
			if ('decrypted' in $$props) $$invalidate(4, decrypted = $$props.decrypted);
			if ('decryptedValue' in $$props) $$invalidate(5, decryptedValue = $$props.decryptedValue);
			if ('copied' in $$props) $$invalidate(6, copied = $$props.copied);
			if ('totpToken' in $$props) $$invalidate(7, totpToken = $$props.totpToken);
			if ('timeRemaining' in $$props) $$invalidate(8, timeRemaining = $$props.timeRemaining);
			if ('totpInterval' in $$props) totpInterval = $$props.totpInterval;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			fieldName,
			fieldType,
			hoverEffect,
			visibility,
			decrypted,
			decryptedValue,
			copied,
			totpToken,
			timeRemaining,
			decrypt,
			toggleVisibility,
			copyToClipboard,
			lockCredential,
			fieldValue
		];
	}

	class EncryptedField extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$i, create_fragment$i, safe_not_equal, {
				fieldName: 0,
				fieldValue: 13,
				fieldType: 1,
				hoverEffect: 2
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "EncryptedField",
				options,
				id: create_fragment$i.name
			});
		}

		get fieldName() {
			throw new Error("<EncryptedField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set fieldName(value) {
			throw new Error("<EncryptedField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get fieldValue() {
			throw new Error("<EncryptedField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set fieldValue(value) {
			throw new Error("<EncryptedField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get fieldType() {
			throw new Error("<EncryptedField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set fieldType(value) {
			throw new Error("<EncryptedField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get hoverEffect() {
			throw new Error("<EncryptedField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set hoverEffect(value) {
			throw new Error("<EncryptedField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/dashboard/credentials/PlainField.svelte generated by Svelte v4.2.19 */
	const file$h = "src/lib/components/dashboard/credentials/PlainField.svelte";

	// (37:3) {:else}
	function create_else_block$9(ctx) {
		let copyicon;
		let current;

		copyicon = new CopyIcon({
				props: { color: '#4D4F60' },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(copyicon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(copyicon, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(copyicon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(copyicon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(copyicon, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$9.name,
			type: "else",
			source: "(37:3) {:else}",
			ctx
		});

		return block;
	}

	// (35:25) 
	function create_if_block_1$a(ctx) {
		let activecopy;
		let current;
		activecopy = new ActiveCopy({ $$inline: true });

		const block = {
			c: function create() {
				create_component(activecopy.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(activecopy, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(activecopy.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(activecopy.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(activecopy, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$a.name,
			type: "if",
			source: "(35:25) ",
			ctx
		});

		return block;
	}

	// (31:3) {#if copied}
	function create_if_block$b(ctx) {
		let span;
		let tick_1;
		let span_intro;
		let current;
		tick_1 = new Tick({ $$inline: true });

		const block = {
			c: function create() {
				span = element("span");
				create_component(tick_1.$$.fragment);
				add_location(span, file$h, 33, 4, 1078);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				mount_component(tick_1, span, null);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(tick_1.$$.fragment, local);

				if (local) {
					if (!span_intro) {
						add_render_callback(() => {
							span_intro = create_in_transition(span, scale, {});
							span_intro.start();
						});
					}
				}

				current = true;
			},
			o: function outro(local) {
				transition_out(tick_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				destroy_component(tick_1);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$b.name,
			type: "if",
			source: "(31:3) {#if copied}",
			ctx
		});

		return block;
	}

	function create_fragment$h(ctx) {
		let div1;
		let label;
		let t0;
		let t1;
		let div0;
		let span;
		let t2;
		let t3;
		let button;
		let current_block_type_index;
		let if_block;
		let div0_class_value;
		let current;
		let mounted;
		let dispose;
		const if_block_creators = [create_if_block$b, create_if_block_1$a, create_else_block$9];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*copied*/ ctx[0]) return 0;
			if (/*hoverEffect*/ ctx[3]) return 1;
			return 2;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				div1 = element("div");
				label = element("label");
				t0 = text(/*fieldName*/ ctx[1]);
				t1 = space();
				div0 = element("div");
				span = element("span");
				t2 = text(/*fieldValue*/ ctx[2]);
				t3 = space();
				button = element("button");
				if_block.c();
				attr_dev(label, "class", "label block mb-1 text-left text-osvauld-dusklabel whitespace-nowrap text-ellipsis text-xs font-normal cursor-pointer");
				attr_dev(label, "for", "field");
				add_location(label, file$h, 18, 1, 435);
				attr_dev(span, "class", "w-full text-left overflow-x-hidden font-normal whitespace-nowrap text-ellipsis text-sm");
				add_location(span, file$h, 27, 2, 856);
				add_location(button, file$h, 31, 2, 989);

				attr_dev(div0, "class", div0_class_value = "py-1 px-3 w-full flex justify-between items-center text-base " + (/*hoverEffect*/ ctx[3]
				? 'text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md'
				: 'text-osvauld-fieldText rounded-none border-b border-osvauld-darkLineSeperator'));

				add_location(div0, file$h, 22, 1, 606);
				attr_dev(div1, "class", "mb-2.5 mr-1 max-w-full");
				add_location(div1, file$h, 17, 0, 397);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, label);
				append_dev(label, t0);
				append_dev(div1, t1);
				append_dev(div1, div0);
				append_dev(div0, span);
				append_dev(span, t2);
				append_dev(div0, t3);
				append_dev(div0, button);
				if_blocks[current_block_type_index].m(button, null);
				current = true;

				if (!mounted) {
					dispose = listen_dev(button, "click", stop_propagation(prevent_default(/*copyToClipboard*/ ctx[4])), false, true, true, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (!current || dirty & /*fieldName*/ 2) set_data_dev(t0, /*fieldName*/ ctx[1]);
				if (!current || dirty & /*fieldValue*/ 4) set_data_dev(t2, /*fieldValue*/ ctx[2]);
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index !== previous_block_index) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(button, null);
				}

				if (!current || dirty & /*hoverEffect*/ 8 && div0_class_value !== (div0_class_value = "py-1 px-3 w-full flex justify-between items-center text-base " + (/*hoverEffect*/ ctx[3]
				? 'text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md'
				: 'text-osvauld-fieldText rounded-none border-b border-osvauld-darkLineSeperator'))) {
					attr_dev(div0, "class", div0_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}

				if_blocks[current_block_type_index].d();
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$h.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$h($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('PlainField', slots, []);
		let { fieldName } = $$props;
		let { fieldValue } = $$props;
		let { hoverEffect } = $$props;
		let { copied = false } = $$props;

		const copyToClipboard = async () => {
			$$invalidate(0, copied = true);
			await navigator.clipboard.writeText(fieldValue);

			setTimeout(
				() => {
					$$invalidate(0, copied = false);
				},
				2000
			);
		};

		$$self.$$.on_mount.push(function () {
			if (fieldName === undefined && !('fieldName' in $$props || $$self.$$.bound[$$self.$$.props['fieldName']])) {
				console.warn("<PlainField> was created without expected prop 'fieldName'");
			}

			if (fieldValue === undefined && !('fieldValue' in $$props || $$self.$$.bound[$$self.$$.props['fieldValue']])) {
				console.warn("<PlainField> was created without expected prop 'fieldValue'");
			}

			if (hoverEffect === undefined && !('hoverEffect' in $$props || $$self.$$.bound[$$self.$$.props['hoverEffect']])) {
				console.warn("<PlainField> was created without expected prop 'hoverEffect'");
			}
		});

		const writable_props = ['fieldName', 'fieldValue', 'hoverEffect', 'copied'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PlainField> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('fieldName' in $$props) $$invalidate(1, fieldName = $$props.fieldName);
			if ('fieldValue' in $$props) $$invalidate(2, fieldValue = $$props.fieldValue);
			if ('hoverEffect' in $$props) $$invalidate(3, hoverEffect = $$props.hoverEffect);
			if ('copied' in $$props) $$invalidate(0, copied = $$props.copied);
		};

		$$self.$capture_state = () => ({
			scale,
			ActiveCopy,
			Tick,
			CopyIcon,
			fieldName,
			fieldValue,
			hoverEffect,
			copied,
			copyToClipboard
		});

		$$self.$inject_state = $$props => {
			if ('fieldName' in $$props) $$invalidate(1, fieldName = $$props.fieldName);
			if ('fieldValue' in $$props) $$invalidate(2, fieldValue = $$props.fieldValue);
			if ('hoverEffect' in $$props) $$invalidate(3, hoverEffect = $$props.hoverEffect);
			if ('copied' in $$props) $$invalidate(0, copied = $$props.copied);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [copied, fieldName, fieldValue, hoverEffect, copyToClipboard];
	}

	class PlainField extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$h, create_fragment$h, safe_not_equal, {
				fieldName: 1,
				fieldValue: 2,
				hoverEffect: 3,
				copied: 0
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "PlainField",
				options,
				id: create_fragment$h.name
			});
		}

		get fieldName() {
			throw new Error("<PlainField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set fieldName(value) {
			throw new Error("<PlainField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get fieldValue() {
			throw new Error("<PlainField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set fieldValue(value) {
			throw new Error("<PlainField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get hoverEffect() {
			throw new Error("<PlainField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set hoverEffect(value) {
			throw new Error("<PlainField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get copied() {
			throw new Error("<PlainField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set copied(value) {
			throw new Error("<PlainField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/dashboard/components/CredentialPopupCard.svelte generated by Svelte v4.2.19 */
	const file$g = "src/lib/components/dashboard/components/CredentialPopupCard.svelte";

	function get_each_context$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[3] = list[i];
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[3] = list[i];
		return child_ctx;
	}

	// (18:4) {#if field.fieldName !== "Domain"}
	function create_if_block_1$9(ctx) {
		let plainfield;
		let current;

		plainfield = new PlainField({
				props: {
					fieldName: /*field*/ ctx[3].fieldName,
					fieldValue: /*field*/ ctx[3].fieldValue,
					hoverEffect: true
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(plainfield.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(plainfield, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(plainfield.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(plainfield.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(plainfield, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$9.name,
			type: "if",
			source: "(18:4) {#if field.fieldName !== \\\"Domain\\\"}",
			ctx
		});

		return block;
	}

	// (17:3) {#each nonSensitiveFields as field}
	function create_each_block_1(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*field*/ ctx[3].fieldName !== "Domain" && create_if_block_1$9(ctx);

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (/*field*/ ctx[3].fieldName !== "Domain") if_block.p(ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1.name,
			type: "each",
			source: "(17:3) {#each nonSensitiveFields as field}",
			ctx
		});

		return block;
	}

	// (26:3) {#if sensitiveFields}
	function create_if_block$a(ctx) {
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev(/*sensitiveFields*/ ctx[1]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*sensitiveFields*/ 2) {
					each_value = ensure_array_like_dev(/*sensitiveFields*/ ctx[1]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$2(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$a.name,
			type: "if",
			source: "(26:3) {#if sensitiveFields}",
			ctx
		});

		return block;
	}

	// (27:4) {#each sensitiveFields as field}
	function create_each_block$2(ctx) {
		let encryptedfield;
		let current;

		encryptedfield = new EncryptedField({
				props: {
					fieldName: /*field*/ ctx[3].fieldName,
					fieldValue: /*field*/ ctx[3].fieldValue,
					fieldType: /*field*/ ctx[3].fieldType,
					hoverEffect: true
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(encryptedfield.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(encryptedfield, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(encryptedfield.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(encryptedfield.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(encryptedfield, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$2.name,
			type: "each",
			source: "(27:4) {#each sensitiveFields as field}",
			ctx
		});

		return block;
	}

	function create_fragment$g(ctx) {
		let button1;
		let button0;
		let div0;
		let t0;
		let t1;
		let div2;
		let label;
		let t3;
		let div1;
		let t4_value = /*credential*/ ctx[0].description + "";
		let t4;
		let div1_class_value;
		let div2_class_value;
		let current;
		let each_value_1 = ensure_array_like_dev(/*nonSensitiveFields*/ ctx[2]);
		let each_blocks = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		let if_block = /*sensitiveFields*/ ctx[1] && create_if_block$a(ctx);

		const block = {
			c: function create() {
				button1 = element("button");
				button0 = element("button");
				div0 = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t0 = space();
				if (if_block) if_block.c();
				t1 = space();
				div2 = element("div");
				label = element("label");
				label.textContent = "Description";
				t3 = space();
				div1 = element("div");
				t4 = text(t4_value);
				attr_dev(div0, "class", "w-full h-[90%] overflow-y-scroll scrollbar-thin pr-0 active mt-2");
				add_location(div0, file$g, 23, 2, 623);
				attr_dev(label, "class", "text-osvauld-dusklabel block text-left text-sm font-normal");
				attr_dev(label, "for", "credential-description");
				add_location(label, file$g, 51, 3, 1314);

				attr_dev(div1, "class", div1_class_value = "" + (/*credential*/ ctx[0].description && /*credential*/ ctx[0].description.length !== 0
				? 'h-[4rem]'
				: '') + " mt-4 w-[96%] py-1 px-2 overflow-y-scroll bg-osvauld-fieldActive rounded-lg text-left scrollbar-thin resize-none text-base text-osvauld-fieldTextActive font-normal text-sm");

				attr_dev(div1, "id", "credential-description");
				add_location(div1, file$g, 57, 3, 1461);

				attr_dev(div2, "class", div2_class_value = /*credential*/ ctx[0].description && /*credential*/ ctx[0].description.length !== 0
				? 'visible'
				: 'invisible');

				add_location(div2, file$g, 46, 2, 1193);
				attr_dev(button0, "class", "container mx-auto py-0 pl-3 pr-1 relative group bg-osvauld-cardshade rounded-xl");
				add_location(button0, file$g, 20, 1, 520);
				attr_dev(button1, "class", "mb-1 w-full overflow-x-hidden flex-none rounded-xl text-osvauld-chalkwhite");
				add_location(button1, file$g, 17, 0, 425);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, button1, anchor);
				append_dev(button1, button0);
				append_dev(button0, div0);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div0, null);
					}
				}

				append_dev(div0, t0);
				if (if_block) if_block.m(div0, null);
				append_dev(button0, t1);
				append_dev(button0, div2);
				append_dev(div2, label);
				append_dev(div2, t3);
				append_dev(div2, div1);
				append_dev(div1, t4);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*nonSensitiveFields*/ 4) {
					each_value_1 = ensure_array_like_dev(/*nonSensitiveFields*/ ctx[2]);
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block_1(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(div0, t0);
						}
					}

					group_outros();

					for (i = each_value_1.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}

				if (/*sensitiveFields*/ ctx[1]) if_block.p(ctx, dirty);
				if ((!current || dirty & /*credential*/ 1) && t4_value !== (t4_value = /*credential*/ ctx[0].description + "")) set_data_dev(t4, t4_value);

				if (!current || dirty & /*credential*/ 1 && div1_class_value !== (div1_class_value = "" + (/*credential*/ ctx[0].description && /*credential*/ ctx[0].description.length !== 0
				? 'h-[4rem]'
				: '') + " mt-4 w-[96%] py-1 px-2 overflow-y-scroll bg-osvauld-fieldActive rounded-lg text-left scrollbar-thin resize-none text-base text-osvauld-fieldTextActive font-normal text-sm")) {
					attr_dev(div1, "class", div1_class_value);
				}

				if (!current || dirty & /*credential*/ 1 && div2_class_value !== (div2_class_value = /*credential*/ ctx[0].description && /*credential*/ ctx[0].description.length !== 0
				? 'visible'
				: 'invisible')) {
					attr_dev(div2, "class", div2_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value_1.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(button1);
				}

				destroy_each(each_blocks, detaching);
				if (if_block) if_block.d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$g.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$g($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('CredentialPopupCard', slots, []);
		let { credential } = $$props;
		let sensitiveFields = credential.fields.filter(field => field.fieldType === "totp" || field.fieldType === "sensitive");
		let nonSensitiveFields = credential.fields.filter(field => field.fieldType !== "totp" && field.fieldType !== "sensitive");

		$$self.$$.on_mount.push(function () {
			if (credential === undefined && !('credential' in $$props || $$self.$$.bound[$$self.$$.props['credential']])) {
				console.warn("<CredentialPopupCard> was created without expected prop 'credential'");
			}
		});

		const writable_props = ['credential'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CredentialPopupCard> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('credential' in $$props) $$invalidate(0, credential = $$props.credential);
		};

		$$self.$capture_state = () => ({
			EncryptedField,
			PlainField,
			credential,
			sensitiveFields,
			nonSensitiveFields
		});

		$$self.$inject_state = $$props => {
			if ('credential' in $$props) $$invalidate(0, credential = $$props.credential);
			if ('sensitiveFields' in $$props) $$invalidate(1, sensitiveFields = $$props.sensitiveFields);
			if ('nonSensitiveFields' in $$props) $$invalidate(2, nonSensitiveFields = $$props.nonSensitiveFields);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [credential, sensitiveFields, nonSensitiveFields];
	}

	class CredentialPopupCard extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$g, create_fragment$g, safe_not_equal, { credential: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "CredentialPopupCard",
				options,
				id: create_fragment$g.name
			});
		}

		get credential() {
			throw new Error("<CredentialPopupCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set credential(value) {
			throw new Error("<CredentialPopupCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/popup/components/ListedCredentials.svelte generated by Svelte v4.2.19 */
	const file$f = "src/lib/components/popup/components/ListedCredentials.svelte";

	// (64:3) {:else}
	function create_else_block$8(ctx) {
		let rightarrow;
		let current;
		rightarrow = new RightArrow({ $$inline: true });

		const block = {
			c: function create() {
				create_component(rightarrow.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(rightarrow, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(rightarrow.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(rightarrow.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(rightarrow, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$8.name,
			type: "else",
			source: "(64:3) {:else}",
			ctx
		});

		return block;
	}

	// (62:3) {#if selectedCredentialId === credential.credentialId}
	function create_if_block_1$8(ctx) {
		let downarrow;
		let current;

		downarrow = new DownArrow({
				props: { type: 'common' },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(downarrow.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(downarrow, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(downarrow.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(downarrow.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(downarrow, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$8.name,
			type: "if",
			source: "(62:3) {#if selectedCredentialId === credential.credentialId}",
			ctx
		});

		return block;
	}

	// (69:1) {#if selectedCredentialId == credential.credentialId && credentialClicked}
	function create_if_block$9(ctx) {
		let div;
		let t;
		let credentialpopupcard;
		let current;

		credentialpopupcard = new CredentialPopupCard({
				props: { credential: /*credentialDetails*/ ctx[2] },
				$$inline: true
			});

		const block = {
			c: function create() {
				div = element("div");
				t = space();
				create_component(credentialpopupcard.$$.fragment);
				attr_dev(div, "class", "border-b border-osvauld-iconblack w-full mb-3");
				add_location(div, file$f, 69, 2, 2478);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				insert_dev(target, t, anchor);
				mount_component(credentialpopupcard, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const credentialpopupcard_changes = {};
				if (dirty & /*credentialDetails*/ 4) credentialpopupcard_changes.credential = /*credentialDetails*/ ctx[2];
				credentialpopupcard.$set(credentialpopupcard_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(credentialpopupcard.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(credentialpopupcard.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
					detach_dev(t);
				}

				destroy_component(credentialpopupcard, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$9.name,
			type: "if",
			source: "(69:1) {#if selectedCredentialId == credential.credentialId && credentialClicked}",
			ctx
		});

		return block;
	}

	function create_fragment$f(ctx) {
		let button1;
		let div;
		let span;
		let t0_value = /*credential*/ ctx[1].name + "";
		let t0;
		let t1;
		let button0;
		let current_block_type_index;
		let if_block0;
		let div_class_value;
		let t2;
		let button1_class_value;
		let current;
		let mounted;
		let dispose;
		const if_block_creators = [create_if_block_1$8, create_else_block$8];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*selectedCredentialId*/ ctx[0] === /*credential*/ ctx[1].credentialId) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		let if_block1 = /*selectedCredentialId*/ ctx[0] == /*credential*/ ctx[1].credentialId && /*credentialClicked*/ ctx[3] && create_if_block$9(ctx);

		const block = {
			c: function create() {
				button1 = element("button");
				div = element("div");
				span = element("span");
				t0 = text(t0_value);
				t1 = space();
				button0 = element("button");
				if_block0.c();
				t2 = space();
				if (if_block1) if_block1.c();
				attr_dev(span, "class", "text-base font-normal tracking-wide text-osvauld-fieldText overflow-hidden whitespace-nowrap text-ellipsis");
				add_location(span, file$f, 56, 2, 2047);
				attr_dev(button0, "class", "px-4 py-1 cursor-pointer");
				add_location(button0, file$f, 60, 2, 2205);

				attr_dev(div, "class", div_class_value = "w-full flex justify-between items-center px-4 " + (/*selectedCredentialId*/ ctx[0] === /*credential*/ ctx[1].credentialId
				? 'text-osvauld-quarzowhite mb-2'
				: 'mb-0'));

				add_location(div, file$f, 50, 1, 1879);

				attr_dev(button1, "class", button1_class_value = "rounded-lg hover:shadow-[0_0_0_1px_#B4BEFE] hover:!text-osvauld-fieldTextActive bg-osvauld-cardshade px-1 py-2 font-bold text-osvauld-sheffieldgrey flex flex-col justify-center items-center w-[95%] mx-auto mb-3 cursor-pointer " + (/*selectedCredentialId*/ ctx[0] === /*credential*/ ctx[1].credentiaId
				? 'border border-osvauld-iconblack'
				: ''));

				add_location(button1, file$f, 42, 0, 1505);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, button1, anchor);
				append_dev(button1, div);
				append_dev(div, span);
				append_dev(span, t0);
				append_dev(div, t1);
				append_dev(div, button0);
				if_blocks[current_block_type_index].m(button0, null);
				append_dev(button1, t2);
				if (if_block1) if_block1.m(button1, null);
				current = true;

				if (!mounted) {
					dispose = listen_dev(button1, "click", /*dropDownClicked*/ ctx[4], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if ((!current || dirty & /*credential*/ 2) && t0_value !== (t0_value = /*credential*/ ctx[1].name + "")) set_data_dev(t0, t0_value);
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index !== previous_block_index) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block0 = if_blocks[current_block_type_index];

					if (!if_block0) {
						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block0.c();
					}

					transition_in(if_block0, 1);
					if_block0.m(button0, null);
				}

				if (!current || dirty & /*selectedCredentialId, credential*/ 3 && div_class_value !== (div_class_value = "w-full flex justify-between items-center px-4 " + (/*selectedCredentialId*/ ctx[0] === /*credential*/ ctx[1].credentialId
				? 'text-osvauld-quarzowhite mb-2'
				: 'mb-0'))) {
					attr_dev(div, "class", div_class_value);
				}

				if (/*selectedCredentialId*/ ctx[0] == /*credential*/ ctx[1].credentialId && /*credentialClicked*/ ctx[3]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*selectedCredentialId, credential, credentialClicked*/ 11) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block$9(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(button1, null);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}

				if (!current || dirty & /*selectedCredentialId, credential*/ 3 && button1_class_value !== (button1_class_value = "rounded-lg hover:shadow-[0_0_0_1px_#B4BEFE] hover:!text-osvauld-fieldTextActive bg-osvauld-cardshade px-1 py-2 font-bold text-osvauld-sheffieldgrey flex flex-col justify-center items-center w-[95%] mx-auto mb-3 cursor-pointer " + (/*selectedCredentialId*/ ctx[0] === /*credential*/ ctx[1].credentiaId
				? 'border border-osvauld-iconblack'
				: ''))) {
					attr_dev(button1, "class", button1_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(button1);
				}

				if_blocks[current_block_type_index].d();
				if (if_block1) if_block1.d();
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$f.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$f($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ListedCredentials', slots, []);
		const dispatch = createEventDispatcher();
		let { credential } = $$props;
		let { selectedCredentialId } = $$props;
		let credentialDetails;
		let credentialClicked = false;

		const dropDownClicked = async () => {
			const credentialValues = await Promise.all([
				fetchCredentialById(credential.credentialId),
				fetchSensitiveFieldsByCredentialId(credential.credentialId)
			]);

			$$invalidate(2, credentialDetails = credentialValues[0].data);
			const credentialDecryptedResponse = await sendMessage("decryptMeta", [credentialDetails]);
			$$invalidate(2, credentialDetails = credentialDecryptedResponse[0]);
			$$invalidate(2, credentialDetails.fields = [...credentialDetails.fields, ...credentialValues[1].data], credentialDetails);
			$$invalidate(0, selectedCredentialId = credential.credentialId);
			$$invalidate(3, credentialClicked = !credentialClicked);
			LocalStorageService.set("selectedCredentialId", selectedCredentialId);
			dispatch("credentialClicked", { credentialId: credential.credentialId });
		};

		onMount(async () => {
			if (selectedCredentialId === credential.credentialId) {
				await dropDownClicked();
			}
		});

		$$self.$$.on_mount.push(function () {
			if (credential === undefined && !('credential' in $$props || $$self.$$.bound[$$self.$$.props['credential']])) {
				console.warn("<ListedCredentials> was created without expected prop 'credential'");
			}

			if (selectedCredentialId === undefined && !('selectedCredentialId' in $$props || $$self.$$.bound[$$self.$$.props['selectedCredentialId']])) {
				console.warn("<ListedCredentials> was created without expected prop 'selectedCredentialId'");
			}
		});

		const writable_props = ['credential', 'selectedCredentialId'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ListedCredentials> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('credential' in $$props) $$invalidate(1, credential = $$props.credential);
			if ('selectedCredentialId' in $$props) $$invalidate(0, selectedCredentialId = $$props.selectedCredentialId);
		};

		$$self.$capture_state = () => ({
			onMount,
			fetchCredentialById,
			fetchSensitiveFieldsByCredentialId,
			CredentialPopupCard,
			sendMessage,
			RightArrow,
			DownArrow,
			createEventDispatcher,
			LocalStorageService,
			dispatch,
			credential,
			selectedCredentialId,
			credentialDetails,
			credentialClicked,
			dropDownClicked
		});

		$$self.$inject_state = $$props => {
			if ('credential' in $$props) $$invalidate(1, credential = $$props.credential);
			if ('selectedCredentialId' in $$props) $$invalidate(0, selectedCredentialId = $$props.selectedCredentialId);
			if ('credentialDetails' in $$props) $$invalidate(2, credentialDetails = $$props.credentialDetails);
			if ('credentialClicked' in $$props) $$invalidate(3, credentialClicked = $$props.credentialClicked);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			selectedCredentialId,
			credential,
			credentialDetails,
			credentialClicked,
			dropDownClicked
		];
	}

	class ListedCredentials extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$f, create_fragment$f, safe_not_equal, { credential: 1, selectedCredentialId: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "ListedCredentials",
				options,
				id: create_fragment$f.name
			});
		}

		get credential() {
			throw new Error("<ListedCredentials>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set credential(value) {
			throw new Error("<ListedCredentials>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get selectedCredentialId() {
			throw new Error("<ListedCredentials>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set selectedCredentialId(value) {
			throw new Error("<ListedCredentials>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/popup/components/PasswordNotFound.svelte generated by Svelte v4.2.19 */
	const file$e = "src/lib/components/popup/components/PasswordNotFound.svelte";

	function create_fragment$e(ctx) {
		let div1;
		let div0;
		let span;
		let t1;
		let p;

		const block = {
			c: function create() {
				div1 = element("div");
				div0 = element("div");
				span = element("span");
				span.textContent = "No passwords found!";
				t1 = space();
				p = element("p");
				p.textContent = "Current page doesn't have a password in osvauld.";
				attr_dev(span, "class", "text-lg");
				add_location(span, file$e, 4, 2, 137);
				attr_dev(p, "class", "text-sm mt-4");
				add_location(p, file$e, 5, 2, 188);
				add_location(div0, file$e, 3, 1, 129);
				attr_dev(div1, "class", "bg-osvauld-cardshade rounded-lg h-[10rem] flex flex-col justify-between p-3 text-osvauld-textActive font-normal");
				add_location(div1, file$e, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
				append_dev(div0, span);
				append_dev(div0, t1);
				append_dev(div0, p);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$e.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$e($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('PasswordNotFound', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PasswordNotFound> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class PasswordNotFound extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "PasswordNotFound",
				options,
				id: create_fragment$e.name
			});
		}
	}

	/* src/lib/components/popup/AddCredential.svelte generated by Svelte v4.2.19 */

	const { Error: Error_1 } = globals;
	const file$d = "src/lib/components/popup/AddCredential.svelte";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[26] = list[i];
		child_ctx[28] = i;
		return child_ctx;
	}

	// (114:0) {:else}
	function create_else_block$7(ctx) {
		let div0;

		let t0_value = (/*windowId*/ ctx[3] === "manual"
		? "Enter Details of your credential"
		: "Would you like to add this credential to osvauld?") + "";

		let t0;
		let t1;
		let form;
		let div1;
		let input0;
		let t2;
		let div2;
		let label0;
		let t4;
		let input1;
		let t5;
		let div4;
		let label1;
		let t7;
		let div3;
		let input2;
		let t8;
		let button0;
		let current_block_type_index;
		let if_block;
		let t9;
		let div5;
		let label2;
		let t11;
		let input3;
		let t12;
		let div6;
		let label3;
		let t14;
		let textarea;
		let t15;
		let button1;
		let current;
		let mounted;
		let dispose;

		let input2_levels = [
			{ id: "password" },
			{ type: /*type*/ ctx[11] },
			{ autocomplete: "off" },
			{
				class: "mt-1 block w-[90%] px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md border-0 focus:border-osvauld-iconblack focus:ring-0"
			}
		];

		let input_data_1 = {};

		for (let i = 0; i < input2_levels.length; i += 1) {
			input_data_1 = assign(input_data_1, input2_levels[i]);
		}

		const if_block_creators = [create_if_block_3$3, create_else_block_1$4];
		const if_blocks = [];

		function select_block_type_1(ctx, dirty) {
			if (/*visibility*/ ctx[4]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type_1(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				div0 = element("div");
				t0 = text(t0_value);
				t1 = space();
				form = element("form");
				div1 = element("div");
				input0 = element("input");
				t2 = space();
				div2 = element("div");
				label0 = element("label");
				label0.textContent = "Username";
				t4 = space();
				input1 = element("input");
				t5 = space();
				div4 = element("div");
				label1 = element("label");
				label1.textContent = "Password";
				t7 = space();
				div3 = element("div");
				input2 = element("input");
				t8 = space();
				button0 = element("button");
				if_block.c();
				t9 = space();
				div5 = element("div");
				label2 = element("label");
				label2.textContent = "Domain";
				t11 = space();
				input3 = element("input");
				t12 = space();
				div6 = element("div");
				label3 = element("label");
				label3.textContent = "Description";
				t14 = space();
				textarea = element("textarea");
				t15 = space();
				button1 = element("button");
				button1.textContent = "Next";
				attr_dev(div0, "class", "text-osvauld-textActive text-base max-w-full pl-4");
				add_location(div0, file$d, 126, 1, 4028);
				attr_dev(input0, "id", "name");
				attr_dev(input0, "type", "text");
				input0.required = true;
				attr_dev(input0, "placeholder", "Enter credential name");
				attr_dev(input0, "class", "mt-1 block w-full px-3 py-1 rounded-md shadow-sm sm:text-sm bg-osvauld-cardshade border-osvauld-iconblack focus:border-osvauld-iconblack focus:ring-0");
				attr_dev(input0, "autocomplete", "off");
				add_location(input0, file$d, 135, 3, 4410);
				add_location(div1, file$d, 134, 2, 4401);
				attr_dev(label0, "for", "username");
				attr_dev(label0, "class", "block text-sm font-medium text-osvauld-textActive");
				add_location(label0, file$d, 145, 3, 4732);
				attr_dev(input1, "id", "username");
				attr_dev(input1, "type", "text");
				attr_dev(input1, "autocomplete", "off");
				attr_dev(input1, "class", "mt-1 block w-full px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md border-0 focus:border-osvauld-iconblack focus:ring-0");
				add_location(input1, file$d, 149, 3, 4845);
				add_location(div2, file$d, 144, 2, 4723);
				attr_dev(label1, "for", "password");
				attr_dev(label1, "class", "block text-sm font-medium text-osvauld-textActive");
				add_location(label1, file$d, 157, 3, 5137);
				set_attributes(input2, input_data_1);
				add_location(input2, file$d, 162, 4, 5296);
				attr_dev(button0, "class", "w-[10%] flex justify-center items-center");
				attr_dev(button0, "type", "button");
				add_location(button0, file$d, 168, 4, 5580);
				attr_dev(div3, "class", "flex bg-osvauld-fieldActive");
				add_location(div3, file$d, 161, 3, 5250);
				add_location(div4, file$d, 156, 2, 5128);
				attr_dev(label2, "for", "domain");
				attr_dev(label2, "class", "block text-sm font-medium text-osvauld-textActive");
				add_location(label2, file$d, 181, 3, 5837);
				attr_dev(input3, "id", "domain");
				attr_dev(input3, "type", "text");
				attr_dev(input3, "autocomplete", "off");
				attr_dev(input3, "class", "mt-1 block w-full px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md border-0 focus:border-osvauld-iconblack focus:ring-0");
				add_location(input3, file$d, 184, 3, 5941);
				add_location(div5, file$d, 180, 2, 5828);
				attr_dev(label3, "for", "description");
				attr_dev(label3, "class", "block text-sm font-medium text-osvauld-textActive");
				add_location(label3, file$d, 193, 3, 6230);
				attr_dev(textarea, "id", "description");
				attr_dev(textarea, "rows", "3");
				attr_dev(textarea, "class", "mt-1 block w-full px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-cardshade rounded-md border border-osvauld-iconblack focus:border-osvauld-iconblack focus:ring-0");
				add_location(textarea, file$d, 197, 3, 6349);
				add_location(div6, file$d, 192, 2, 6221);
				attr_dev(button1, "type", "submit");
				attr_dev(button1, "class", "px-4 py-2 bg-osvauld-carolinablue text-osvauld-frameblack font-normal rounded-md active::scale-95 mt-auto mb-12");
				add_location(button1, file$d, 204, 2, 6649);
				attr_dev(form, "class", "flex flex-col p-4 max-w-sm mx-auto text-osvauld-textActive bg-osvauld-cardshade rounded-lg h-[90%] gap-2 relative");
				add_location(form, file$d, 131, 1, 4224);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div0, anchor);
				append_dev(div0, t0);
				insert_dev(target, t1, anchor);
				insert_dev(target, form, anchor);
				append_dev(form, div1);
				append_dev(div1, input0);
				set_input_value(input0, /*name*/ ctx[5]);
				append_dev(form, t2);
				append_dev(form, div2);
				append_dev(div2, label0);
				append_dev(div2, t4);
				append_dev(div2, input1);
				set_input_value(input1, /*username*/ ctx[0]);
				append_dev(form, t5);
				append_dev(form, div4);
				append_dev(div4, label1);
				append_dev(div4, t7);
				append_dev(div4, div3);
				append_dev(div3, input2);
				if (input2.autofocus) input2.focus();
				set_input_value(input2, /*password*/ ctx[1]);
				append_dev(div3, t8);
				append_dev(div3, button0);
				if_blocks[current_block_type_index].m(button0, null);
				append_dev(form, t9);
				append_dev(form, div5);
				append_dev(div5, label2);
				append_dev(div5, t11);
				append_dev(div5, input3);
				set_input_value(input3, /*domain*/ ctx[2]);
				append_dev(form, t12);
				append_dev(form, div6);
				append_dev(div6, label3);
				append_dev(div6, t14);
				append_dev(div6, textarea);
				set_input_value(textarea, /*description*/ ctx[6]);
				append_dev(form, t15);
				append_dev(form, button1);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(input0, "input", /*input0_input_handler*/ ctx[19]),
						listen_dev(input1, "input", /*input1_input_handler*/ ctx[20]),
						listen_dev(input2, "input", /*input2_input_handler*/ ctx[21]),
						listen_dev(button0, "click", /*click_handler_1*/ ctx[22], false, false, false, false),
						listen_dev(input3, "input", /*input3_input_handler*/ ctx[23]),
						listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[24]),
						listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[12]), false, true, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if ((!current || dirty & /*windowId*/ 8) && t0_value !== (t0_value = (/*windowId*/ ctx[3] === "manual"
				? "Enter Details of your credential"
				: "Would you like to add this credential to osvauld?") + "")) set_data_dev(t0, t0_value);

				if (dirty & /*name*/ 32 && input0.value !== /*name*/ ctx[5]) {
					set_input_value(input0, /*name*/ ctx[5]);
				}

				if (dirty & /*username*/ 1 && input1.value !== /*username*/ ctx[0]) {
					set_input_value(input1, /*username*/ ctx[0]);
				}

				set_attributes(input2, input_data_1 = get_spread_update(input2_levels, [
					{ id: "password" },
					dirty & /*type*/ 2048 && { type: /*type*/ ctx[11] },
					{ autocomplete: "off" },
					{
						class: "mt-1 block w-[90%] px-3 py-1 shadow-sm sm:text-sm text-osvauld-fieldTextActive bg-osvauld-fieldActive rounded-md border-0 focus:border-osvauld-iconblack focus:ring-0"
					}
				]));

				if (dirty & /*password*/ 2 && input2.value !== /*password*/ ctx[1]) {
					set_input_value(input2, /*password*/ ctx[1]);
				}

				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_1(ctx);

				if (current_block_type_index !== previous_block_index) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(button0, null);
				}

				if (dirty & /*domain*/ 4 && input3.value !== /*domain*/ ctx[2]) {
					set_input_value(input3, /*domain*/ ctx[2]);
				}

				if (dirty & /*description*/ 64) {
					set_input_value(textarea, /*description*/ ctx[6]);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div0);
					detach_dev(t1);
					detach_dev(form);
				}

				if_blocks[current_block_type_index].d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$7.name,
			type: "else",
			source: "(114:0) {:else}",
			ctx
		});

		return block;
	}

	// (68:0) {#if showFolderList}
	function create_if_block$8(ctx) {
		let div;
		let t1;
		let ul;
		let t2;
		let button;
		let t3;
		let button_class_value;
		let current;
		let mounted;
		let dispose;
		let each_value = ensure_array_like_dev(/*folderData*/ ctx[8]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				div = element("div");
				div.textContent = "Select Folder to add this credential";
				t1 = space();
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t2 = space();
				button = element("button");
				t3 = text("Save");
				attr_dev(div, "class", "text-osvauld-textActive text-base max-w-full pl-4");
				add_location(div, file$d, 80, 1, 2218);
				attr_dev(ul, "class", "flex flex-col p-4 max-w-sm mx-auto space-y-2 text-osvauld-textActive bg-osvauld-cardshade max-h-[26rem] rounded-lg overflow-y-scroll w-full overflow-x-hidden scrollbar-thin");
				add_location(ul, file$d, 83, 1, 2330);

				attr_dev(button, "class", button_class_value = "w-full mt-2 px-4 py-2 font-normal rounded-md active::scale-95 " + (/*selectedFolderId*/ ctx[9] === null
				? 'bg-osvauld-cardshade text-osvauld-textActive border border-osvauld-iconblack'
				: 'bg-osvauld-carolinablue text-osvauld-frameblack'));

				add_location(button, file$d, 117, 1, 3725);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, ul, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ul, null);
					}
				}

				insert_dev(target, t2, anchor);
				insert_dev(target, button, anchor);
				append_dev(button, t3);
				current = true;

				if (!mounted) {
					dispose = listen_dev(button, "click", /*handleSave*/ ctx[14], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (dirty & /*selectedFolderId, folderData, hoveringIndex, handleFolderSelect*/ 9984) {
					each_value = ensure_array_like_dev(/*folderData*/ ctx[8]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$1(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(ul, null);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}

				if (!current || dirty & /*selectedFolderId*/ 512 && button_class_value !== (button_class_value = "w-full mt-2 px-4 py-2 font-normal rounded-md active::scale-95 " + (/*selectedFolderId*/ ctx[9] === null
				? 'bg-osvauld-cardshade text-osvauld-textActive border border-osvauld-iconblack'
				: 'bg-osvauld-carolinablue text-osvauld-frameblack'))) {
					attr_dev(button, "class", button_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
					detach_dev(t1);
					detach_dev(ul);
					detach_dev(t2);
					detach_dev(button);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$8.name,
			type: "if",
			source: "(68:0) {#if showFolderList}",
			ctx
		});

		return block;
	}

	// (163:5) {:else}
	function create_else_block_1$4(ctx) {
		let eye;
		let current;
		eye = new Eye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(eye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(eye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(eye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(eye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(eye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_1$4.name,
			type: "else",
			source: "(163:5) {:else}",
			ctx
		});

		return block;
	}

	// (161:5) {#if visibility}
	function create_if_block_3$3(ctx) {
		let closedeye;
		let current;
		closedeye = new ClosedEye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(closedeye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(closedeye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(closedeye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(closedeye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(closedeye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3$3.name,
			type: "if",
			source: "(161:5) {#if visibility}",
			ctx
		});

		return block;
	}

	// (75:3) {#if folder.accessType === "manager"}
	function create_if_block_1$7(ctx) {
		let li;
		let button;
		let foldericon;
		let t0;
		let span;
		let t1_value = /*folder*/ ctx[26].name + "";
		let t1;
		let span_class_value;
		let t2;
		let t3;
		let li_class_value;
		let current;
		let mounted;
		let dispose;

		foldericon = new FolderIcon({
				props: {
					color: /*selectedFolderId*/ ctx[9] == /*folder*/ ctx[26].id || /*hoveringIndex*/ ctx[10] === /*index*/ ctx[28]
					? '#F2F2F0'
					: '#85889C'
				},
				$$inline: true
			});

		let if_block = /*folder*/ ctx[26].type === "private" && create_if_block_2$5(ctx);

		function click_handler() {
			return /*click_handler*/ ctx[16](/*folder*/ ctx[26]);
		}

		function mouseenter_handler() {
			return /*mouseenter_handler*/ ctx[17](/*index*/ ctx[28]);
		}

		const block = {
			c: function create() {
				li = element("li");
				button = element("button");
				create_component(foldericon.$$.fragment);
				t0 = space();
				span = element("span");
				t1 = text(t1_value);
				t2 = space();
				if (if_block) if_block.c();
				t3 = space();

				attr_dev(span, "class", span_class_value = "max-w-[75%] ml-2 text-base font-light overflow-hidden text-ellipsis whitespace-nowrap " + (/*selectedFolderId*/ ctx[9] == /*folder*/ ctx[26].id || /*hoveringIndex*/ ctx[10] === /*index*/ ctx[28]
				? 'text-osvauld-sideListTextActive'
				: 'text-osvauld-fieldText'));

				add_location(span, file$d, 100, 6, 3270);
				attr_dev(button, "class", "w-full py-1 px-2 text-lg rounded-2xl flex items-center cursor-pointer");
				add_location(button, file$d, 93, 5, 2981);

				attr_dev(li, "class", li_class_value = "" + ((/*selectedFolderId*/ ctx[9] == /*folder*/ ctx[26].id
				? 'bg-osvauld-fieldActive rounded-lg text-osvauld-sideListTextActive'
				: 'hover:bg-osvauld-fieldActive text-osvauld-fieldText') + " rounded-md my-0.5 pl-3 pr-3 mr-1 flex items-center transition-colors duration-100"));

				add_location(li, file$d, 87, 4, 2601);
			},
			m: function mount(target, anchor) {
				insert_dev(target, li, anchor);
				append_dev(li, button);
				mount_component(foldericon, button, null);
				append_dev(button, t0);
				append_dev(button, span);
				append_dev(span, t1);
				append_dev(button, t2);
				if (if_block) if_block.m(button, null);
				append_dev(li, t3);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(button, "click", click_handler, false, false, false, false),
						listen_dev(li, "mouseenter", mouseenter_handler, false, false, false, false),
						listen_dev(li, "mouseleave", /*mouseleave_handler*/ ctx[18], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				const foldericon_changes = {};

				if (dirty & /*selectedFolderId, folderData, hoveringIndex*/ 1792) foldericon_changes.color = /*selectedFolderId*/ ctx[9] == /*folder*/ ctx[26].id || /*hoveringIndex*/ ctx[10] === /*index*/ ctx[28]
				? '#F2F2F0'
				: '#85889C';

				foldericon.$set(foldericon_changes);
				if ((!current || dirty & /*folderData*/ 256) && t1_value !== (t1_value = /*folder*/ ctx[26].name + "")) set_data_dev(t1, t1_value);

				if (!current || dirty & /*selectedFolderId, folderData, hoveringIndex*/ 1792 && span_class_value !== (span_class_value = "max-w-[75%] ml-2 text-base font-light overflow-hidden text-ellipsis whitespace-nowrap " + (/*selectedFolderId*/ ctx[9] == /*folder*/ ctx[26].id || /*hoveringIndex*/ ctx[10] === /*index*/ ctx[28]
				? 'text-osvauld-sideListTextActive'
				: 'text-osvauld-fieldText'))) {
					attr_dev(span, "class", span_class_value);
				}

				if (/*folder*/ ctx[26].type === "private") {
					if (if_block) {
						if (dirty & /*folderData*/ 256) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_2$5(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(button, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				if (!current || dirty & /*selectedFolderId, folderData*/ 768 && li_class_value !== (li_class_value = "" + ((/*selectedFolderId*/ ctx[9] == /*folder*/ ctx[26].id
				? 'bg-osvauld-fieldActive rounded-lg text-osvauld-sideListTextActive'
				: 'hover:bg-osvauld-fieldActive text-osvauld-fieldText') + " rounded-md my-0.5 pl-3 pr-3 mr-1 flex items-center transition-colors duration-100"))) {
					attr_dev(li, "class", li_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(foldericon.$$.fragment, local);
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(foldericon.$$.fragment, local);
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(li);
				}

				destroy_component(foldericon);
				if (if_block) if_block.d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$7.name,
			type: "if",
			source: "(75:3) {#if folder.accessType === \\\"manager\\\"}",
			ctx
		});

		return block;
	}

	// (96:6) {#if folder.type === "private"}
	function create_if_block_2$5(ctx) {
		let span;
		let locked;
		let current;
		locked = new Locked({ $$inline: true });

		const block = {
			c: function create() {
				span = element("span");
				create_component(locked.$$.fragment);
				attr_dev(span, "class", "ml-auto");
				add_location(span, file$d, 108, 7, 3604);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				mount_component(locked, span, null);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(locked.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(locked.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				destroy_component(locked);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2$5.name,
			type: "if",
			source: "(96:6) {#if folder.type === \\\"private\\\"}",
			ctx
		});

		return block;
	}

	// (74:2) {#each folderData as folder, index}
	function create_each_block$1(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*folder*/ ctx[26].accessType === "manager" && create_if_block_1$7(ctx);

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (/*folder*/ ctx[26].accessType === "manager") {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*folderData*/ 256) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_1$7(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$1.name,
			type: "each",
			source: "(74:2) {#each folderData as folder, index}",
			ctx
		});

		return block;
	}

	function create_fragment$d(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block$8, create_else_block$7];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*showFolderList*/ ctx[7]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$d.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$d($$self, $$props, $$invalidate) {
		let type;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('AddCredential', slots, []);
		let { username = "" } = $$props;
		let { password = "" } = $$props;
		let { domain = "" } = $$props;
		let { windowId } = $$props;
		let { currentUrl } = $$props;
		let visibility = false;
		let name = "";
		let description = "";
		let showFolderList = false;
		let folderData = [];
		let selectedFolderId = null;
		let hoveringIndex = null;

		let addCredentialPayload = {
			name,
			folderId: "",
			description,
			credentialType: "Login",
			userFields: [],
			domain
		};

		// Function to handle form submission
		const handleSubmit = async () => {
			const responseJson = await fetchAllFolders();
			$$invalidate(8, folderData = responseJson.data.sort((a, b) => a.name.localeCompare(b.name)));
			$$invalidate(7, showFolderList = true);
		};

		const handleFolderSelect = async folderId => {
			$$invalidate(9, selectedFolderId = folderId);
		};

		const handleSave = async () => {
			if (selectedFolderId === null) {
				throw new Error("Please select a folder to save the credential");
			}

			const response = await fetchFolderUsersForDataSync(selectedFolderId);
			const usersToShare = response.data;

			const fieldPayload = [
				{
					fieldName: "Username",
					fieldValue: username,
					fieldType: "meta"
				},
				{
					fieldName: "Password",
					fieldValue: password,
					fieldType: "sensitive"
				},
				{
					fieldName: "Domain",
					fieldValue: domain,
					fieldType: "additional"
				},
				{
					fieldName: "URL",
					fieldValue: currentUrl,
					fieldType: "meta"
				}
			];

			addCredentialPayload.folderId = selectedFolderId;

			const userFields = await sendMessage("addCredential", {
				users: usersToShare,
				addCredentialFields: fieldPayload
			});

			addCredentialPayload.name = name;
			addCredentialPayload.description = description;
			addCredentialPayload.userFields = userFields;
			await addCredential(addCredentialPayload);
			$$invalidate(7, showFolderList = false);
		};

		$$self.$$.on_mount.push(function () {
			if (windowId === undefined && !('windowId' in $$props || $$self.$$.bound[$$self.$$.props['windowId']])) {
				console.warn("<AddCredential> was created without expected prop 'windowId'");
			}

			if (currentUrl === undefined && !('currentUrl' in $$props || $$self.$$.bound[$$self.$$.props['currentUrl']])) {
				console.warn("<AddCredential> was created without expected prop 'currentUrl'");
			}
		});

		const writable_props = ['username', 'password', 'domain', 'windowId', 'currentUrl'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AddCredential> was created with unknown prop '${key}'`);
		});

		const click_handler = folder => handleFolderSelect(folder.id);
		const mouseenter_handler = index => $$invalidate(10, hoveringIndex = index);
		const mouseleave_handler = () => $$invalidate(10, hoveringIndex = null);

		function input0_input_handler() {
			name = this.value;
			$$invalidate(5, name);
		}

		function input1_input_handler() {
			username = this.value;
			$$invalidate(0, username);
		}

		function input2_input_handler() {
			password = this.value;
			$$invalidate(1, password);
		}

		const click_handler_1 = () => $$invalidate(4, visibility = !visibility);

		function input3_input_handler() {
			domain = this.value;
			$$invalidate(2, domain);
		}

		function textarea_input_handler() {
			description = this.value;
			$$invalidate(6, description);
		}

		$$self.$$set = $$props => {
			if ('username' in $$props) $$invalidate(0, username = $$props.username);
			if ('password' in $$props) $$invalidate(1, password = $$props.password);
			if ('domain' in $$props) $$invalidate(2, domain = $$props.domain);
			if ('windowId' in $$props) $$invalidate(3, windowId = $$props.windowId);
			if ('currentUrl' in $$props) $$invalidate(15, currentUrl = $$props.currentUrl);
		};

		$$self.$capture_state = () => ({
			addCredential,
			fetchAllFolders,
			fetchFolderUsersForDataSync,
			sendMessage,
			Eye,
			ClosedEye,
			FolderIcon,
			Locked,
			username,
			password,
			domain,
			windowId,
			currentUrl,
			visibility,
			name,
			description,
			showFolderList,
			folderData,
			selectedFolderId,
			hoveringIndex,
			addCredentialPayload,
			handleSubmit,
			handleFolderSelect,
			handleSave,
			type
		});

		$$self.$inject_state = $$props => {
			if ('username' in $$props) $$invalidate(0, username = $$props.username);
			if ('password' in $$props) $$invalidate(1, password = $$props.password);
			if ('domain' in $$props) $$invalidate(2, domain = $$props.domain);
			if ('windowId' in $$props) $$invalidate(3, windowId = $$props.windowId);
			if ('currentUrl' in $$props) $$invalidate(15, currentUrl = $$props.currentUrl);
			if ('visibility' in $$props) $$invalidate(4, visibility = $$props.visibility);
			if ('name' in $$props) $$invalidate(5, name = $$props.name);
			if ('description' in $$props) $$invalidate(6, description = $$props.description);
			if ('showFolderList' in $$props) $$invalidate(7, showFolderList = $$props.showFolderList);
			if ('folderData' in $$props) $$invalidate(8, folderData = $$props.folderData);
			if ('selectedFolderId' in $$props) $$invalidate(9, selectedFolderId = $$props.selectedFolderId);
			if ('hoveringIndex' in $$props) $$invalidate(10, hoveringIndex = $$props.hoveringIndex);
			if ('addCredentialPayload' in $$props) addCredentialPayload = $$props.addCredentialPayload;
			if ('type' in $$props) $$invalidate(11, type = $$props.type);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*visibility*/ 16) {
				$$invalidate(11, type = visibility ? "text" : "password");
			}
		};

		return [
			username,
			password,
			domain,
			windowId,
			visibility,
			name,
			description,
			showFolderList,
			folderData,
			selectedFolderId,
			hoveringIndex,
			type,
			handleSubmit,
			handleFolderSelect,
			handleSave,
			currentUrl,
			click_handler,
			mouseenter_handler,
			mouseleave_handler,
			input0_input_handler,
			input1_input_handler,
			input2_input_handler,
			click_handler_1,
			input3_input_handler,
			textarea_input_handler
		];
	}

	class AddCredential extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$d, create_fragment$d, safe_not_equal, {
				username: 0,
				password: 1,
				domain: 2,
				windowId: 3,
				currentUrl: 15
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "AddCredential",
				options,
				id: create_fragment$d.name
			});
		}

		get username() {
			throw new Error_1("<AddCredential>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set username(value) {
			throw new Error_1("<AddCredential>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get password() {
			throw new Error_1("<AddCredential>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set password(value) {
			throw new Error_1("<AddCredential>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get domain() {
			throw new Error_1("<AddCredential>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set domain(value) {
			throw new Error_1("<AddCredential>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get windowId() {
			throw new Error_1("<AddCredential>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set windowId(value) {
			throw new Error_1("<AddCredential>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get currentUrl() {
			throw new Error_1("<AddCredential>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set currentUrl(value) {
			throw new Error_1("<AddCredential>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/popup/components/RangeSlider.svelte generated by Svelte v4.2.19 */

	const { document: document_1 } = globals;
	const file$c = "src/lib/components/popup/components/RangeSlider.svelte";

	// (288:4) {#if holding || thumbHover}
	function create_if_block$7(ctx) {
		let div;
		let t;
		let div_intro;
		let div_outro;
		let current;

		const block = {
			c: function create() {
				div = element("div");
				t = text(/*value*/ ctx[0]);
				attr_dev(div, "class", "range__tooltip svelte-1lm37hk");
				add_location(div, file$c, 285, 5, 7811);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, t);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (!current || dirty[0] & /*value*/ 1) set_data_dev(t, /*value*/ ctx[0]);
			},
			i: function intro(local) {
				if (current) return;

				if (local) {
					add_render_callback(() => {
						if (!current) return;
						if (div_outro) div_outro.end(1);
						div_intro = create_in_transition(div, fly, { y: 7, duration: 200 });
						div_intro.start();
					});
				}

				current = true;
			},
			o: function outro(local) {
				if (div_intro) div_intro.invalidate();

				if (local) {
					div_outro = create_out_transition(div, fade, { duration: 100 });
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (detaching && div_outro) div_outro.end();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$7.name,
			type: "if",
			source: "(288:4) {#if holding || thumbHover}",
			ctx
		});

		return block;
	}

	function create_fragment$c(ctx) {
		let div4;
		let div3;
		let div2;
		let div0;
		let t0;
		let div1;
		let t1;
		let style;
		let mounted;
		let dispose;
		let if_block = (/*holding*/ ctx[7] || /*thumbHover*/ ctx[8]) && create_if_block$7(ctx);

		const block = {
			c: function create() {
				div4 = element("div");
				div3 = element("div");
				div2 = element("div");
				div0 = element("div");
				t0 = space();
				div1 = element("div");
				if (if_block) if_block.c();
				t1 = space();
				style = element("style");
				style.textContent = ".mouse-over-shield {\n\t\t\tposition: fixed;\n\t\t\ttop: 0px;\n\t\t\tleft: 0px;\n\t\t\theight: 100%;\n\t\t\twidth: 100%;\n\t\t\tbackground-color: rgba(255, 0, 0, 0);\n\t\t\tz-index: 10000;\n\t\t\tcursor: grabbing;\n\t\t}";
				attr_dev(div0, "class", "range__track--highlighted svelte-1lm37hk");
				add_location(div0, file$c, 269, 3, 7286);
				attr_dev(div1, "class", "range__thumb svelte-1lm37hk");
				attr_dev(div1, "role", "slider");
				attr_dev(div1, "tabindex", "0");
				attr_dev(div1, "aria-valuenow", /*value*/ ctx[0]);
				toggle_class(div1, "range__thumb--holding", /*holding*/ ctx[7]);
				add_location(div1, file$c, 270, 3, 7361);
				attr_dev(div2, "class", "range__track svelte-1lm37hk");
				add_location(div2, file$c, 268, 2, 7232);
				attr_dev(div3, "class", "range__wrapper svelte-1lm37hk");
				attr_dev(div3, "tabindex", "0");
				attr_dev(div3, "role", "slider");
				attr_dev(div3, "aria-valuemin", /*min*/ ctx[1]);
				attr_dev(div3, "aria-valuemax", /*max*/ ctx[2]);
				attr_dev(div3, "aria-valuenow", /*value*/ ctx[0]);
				add_location(div3, file$c, 256, 1, 6975);
				attr_dev(div4, "class", "range svelte-1lm37hk");
				add_location(div4, file$c, 255, 0, 6954);
				add_location(style, file$c, 299, 1, 8016);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div4, anchor);
				append_dev(div4, div3);
				append_dev(div3, div2);
				append_dev(div2, div0);
				/*div0_binding*/ ctx[17](div0);
				append_dev(div2, t0);
				append_dev(div2, div1);
				if (if_block) if_block.m(div1, null);
				/*div1_binding*/ ctx[18](div1);
				/*div2_binding*/ ctx[23](div2);
				/*div3_binding*/ ctx[24](div3);
				insert_dev(target, t1, anchor);
				append_dev(document_1.head, style);

				if (!mounted) {
					dispose = [
						listen_dev(window, "touchmove", /*updateValueOnEvent*/ ctx[14], { passive: false }, false, false, false),
						listen_dev(window, "touchcancel", /*onDragEnd*/ ctx[12], false, false, false, false),
						listen_dev(window, "touchend", /*onDragEnd*/ ctx[12], false, false, false, false),
						listen_dev(window, "mousemove", /*updateValueOnEvent*/ ctx[14], false, false, false, false),
						listen_dev(window, "mouseup", /*onDragEnd*/ ctx[12], false, false, false, false),
						listen_dev(window, "resize", /*resizeWindow*/ ctx[9], false, false, false, false),
						listen_dev(div1, "touchstart", /*onDragStart*/ ctx[11], false, false, false, false),
						listen_dev(div1, "mousedown", /*onDragStart*/ ctx[11], false, false, false, false),
						listen_dev(div1, "mouseover", /*mouseover_handler*/ ctx[19], false, false, false, false),
						listen_dev(div1, "mouseout", /*mouseout_handler*/ ctx[20], false, false, false, false),
						listen_dev(div1, "blur", /*blur_handler*/ ctx[21], false, false, false, false),
						listen_dev(div1, "focus", /*focus_handler*/ ctx[22], false, false, false, false),
						listen_dev(div3, "keydown", /*onKeyPress*/ ctx[13], false, false, false, false),
						listen_dev(div3, "mousedown", /*onTrackEvent*/ ctx[10], false, false, false, false),
						listen_dev(div3, "touchstart", /*onTrackEvent*/ ctx[10], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (/*holding*/ ctx[7] || /*thumbHover*/ ctx[8]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty[0] & /*holding, thumbHover*/ 384) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$7(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(div1, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				if (dirty[0] & /*value*/ 1) {
					attr_dev(div1, "aria-valuenow", /*value*/ ctx[0]);
				}

				if (dirty[0] & /*holding*/ 128) {
					toggle_class(div1, "range__thumb--holding", /*holding*/ ctx[7]);
				}

				if (dirty[0] & /*min*/ 2) {
					attr_dev(div3, "aria-valuemin", /*min*/ ctx[1]);
				}

				if (dirty[0] & /*max*/ 4) {
					attr_dev(div3, "aria-valuemax", /*max*/ ctx[2]);
				}

				if (dirty[0] & /*value*/ 1) {
					attr_dev(div3, "aria-valuenow", /*value*/ ctx[0]);
				}
			},
			i: function intro(local) {
				transition_in(if_block);
			},
			o: function outro(local) {
				transition_out(if_block);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div4);
					detach_dev(t1);
				}

				/*div0_binding*/ ctx[17](null);
				if (if_block) if_block.d();
				/*div1_binding*/ ctx[18](null);
				/*div2_binding*/ ctx[23](null);
				/*div3_binding*/ ctx[24](null);
				detach_dev(style);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$c.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function isMouseInElement(event, element) {
		let rect = element.getBoundingClientRect();
		let { clientX: x, clientY: y } = event;
		if (x < rect.left || x >= rect.right) return false;
		if (y < rect.top || y >= rect.bottom) return false;
		return true;
	}

	function instance$c($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('RangeSlider', slots, []);
		let { min = 8 } = $$props;
		let { max = 64 } = $$props;
		let { initialValue = 16 } = $$props;

		let { value = typeof initialValue === "string"
		? parseInt(initialValue)
		: initialValue } = $$props;

		// Node Bindings
		let container = null;

		let thumb = null;
		let progressBar = null;
		let element = null;

		// Internal State
		let elementX = null;

		let currentThumb = null;
		let holding = false;
		let thumbHover = false;
		let keydownAcceleration = 0;
		let accelerationTimer = null;

		// Dispatch 'change' events
		const dispatch = createEventDispatcher();

		// Mouse shield used onMouseDown to prevent any mouse events penetrating other elements,
		// ie. hover events on other elements while dragging. Especially for Safari
		const mouseEventShield = document.createElement("div");

		mouseEventShield.setAttribute("class", "mouse-over-shield");

		mouseEventShield.addEventListener("mouseover", e => {
			e.preventDefault();
			e.stopPropagation();
		});

		function resizeWindow() {
			elementX = element.getBoundingClientRect().left;
		}

		// Allows both bind:value and on:change for parent value retrieval
		function setValue(val) {
			$$invalidate(0, value = val);
			dispatch("change", { value });
		}

		function onTrackEvent(e) {
			// Update value immediately before beginning drag
			updateValueOnEvent(e);

			onDragStart(e);
		}

		function onHover(e) {
			$$invalidate(8, thumbHover = thumbHover ? false : true);
		}

		function onDragStart(e) {
			// If mouse event add a pointer events shield
			if (e.type === "mousedown") document.body.append(mouseEventShield);

			$$invalidate(16, currentThumb = thumb);
		}

		function onDragEnd(e) {
			// If using mouse - remove pointer event shield
			if (e.type === "mouseup") {
				if (document.body.contains(mouseEventShield)) document.body.removeChild(mouseEventShield);

				// Needed to check whether thumb and mouse overlap after shield removed
				if (isMouseInElement(e, thumb)) $$invalidate(8, thumbHover = true);
			}

			$$invalidate(16, currentThumb = null);
		}

		// Accessible keypress handling
		function onKeyPress(e) {
			// Max out at +/- 10 to value per event (50 events / 5)
			// 100 below is to increase the amount of events required to reach max velocity
			if (keydownAcceleration < 50) keydownAcceleration++;

			let throttled = Math.ceil(keydownAcceleration / 5);

			if (e.key === "ArrowUp" || e.key === "ArrowRight") {
				if (value + throttled > max || value >= max) {
					setValue(max);
				} else {
					setValue(value + throttled);
				}
			}

			if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
				if (value - throttled < min || value <= min) {
					setValue(min);
				} else {
					setValue(value - throttled);
				}
			}

			// Reset acceleration after 100ms of no events
			clearTimeout(accelerationTimer);

			accelerationTimer = setTimeout(() => keydownAcceleration = 1, 100);
		}

		function calculateNewValue(clientX) {
			// Find distance between cursor and element's left cord (20px / 2 = 10px) - Center of thumb
			let delta = clientX - (elementX + 10);

			// Use width of the container minus (5px * 2 sides) offset for percent calc
			let percent = delta * 100 / (container.clientWidth - 10);

			// Limit percent 0 -> 100
			percent = percent < 0 ? 0 : percent > 100 ? 100 : percent;

			// Limit value min -> max
			setValue(parseInt(percent * (max - min) / 100) + min);
		}

		// Handles both dragging of touch/mouse as well as simple one-off click/touches
		function updateValueOnEvent(e) {
			// touchstart && mousedown are one-off updates, otherwise expect a currentPointer node
			if (!currentThumb && e.type !== "touchstart" && e.type !== "mousedown") return false;

			if (e.stopPropagation) e.stopPropagation();
			if (e.preventDefault) e.preventDefault();

			// Get client's x cord either touch or mouse
			const clientX = e.type === "touchmove" || e.type === "touchstart"
			? e.touches[0].clientX
			: e.clientX;

			calculateNewValue(clientX);
		}

		const writable_props = ['min', 'max', 'initialValue', 'value'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RangeSlider> was created with unknown prop '${key}'`);
		});

		function div0_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				progressBar = $$value;
				((((($$invalidate(5, progressBar), $$invalidate(4, thumb)), $$invalidate(0, value)), $$invalidate(1, min)), $$invalidate(2, max)), $$invalidate(3, container));
			});
		}

		function div1_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				thumb = $$value;
				((((($$invalidate(4, thumb), $$invalidate(5, progressBar)), $$invalidate(0, value)), $$invalidate(1, min)), $$invalidate(2, max)), $$invalidate(3, container));
			});
		}

		const mouseover_handler = () => $$invalidate(8, thumbHover = true);
		const mouseout_handler = () => $$invalidate(8, thumbHover = false);
		const blur_handler = () => $$invalidate(8, thumbHover = false);
		const focus_handler = () => $$invalidate(8, thumbHover = true);

		function div2_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				container = $$value;
				$$invalidate(3, container);
			});
		}

		function div3_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				element = $$value;
				$$invalidate(6, element);
			});
		}

		$$self.$$set = $$props => {
			if ('min' in $$props) $$invalidate(1, min = $$props.min);
			if ('max' in $$props) $$invalidate(2, max = $$props.max);
			if ('initialValue' in $$props) $$invalidate(15, initialValue = $$props.initialValue);
			if ('value' in $$props) $$invalidate(0, value = $$props.value);
		};

		$$self.$capture_state = () => ({
			createEventDispatcher,
			fly,
			fade,
			min,
			max,
			initialValue,
			value,
			container,
			thumb,
			progressBar,
			element,
			elementX,
			currentThumb,
			holding,
			thumbHover,
			keydownAcceleration,
			accelerationTimer,
			dispatch,
			mouseEventShield,
			resizeWindow,
			setValue,
			onTrackEvent,
			onHover,
			onDragStart,
			onDragEnd,
			isMouseInElement,
			onKeyPress,
			calculateNewValue,
			updateValueOnEvent
		});

		$$self.$inject_state = $$props => {
			if ('min' in $$props) $$invalidate(1, min = $$props.min);
			if ('max' in $$props) $$invalidate(2, max = $$props.max);
			if ('initialValue' in $$props) $$invalidate(15, initialValue = $$props.initialValue);
			if ('value' in $$props) $$invalidate(0, value = $$props.value);
			if ('container' in $$props) $$invalidate(3, container = $$props.container);
			if ('thumb' in $$props) $$invalidate(4, thumb = $$props.thumb);
			if ('progressBar' in $$props) $$invalidate(5, progressBar = $$props.progressBar);
			if ('element' in $$props) $$invalidate(6, element = $$props.element);
			if ('elementX' in $$props) elementX = $$props.elementX;
			if ('currentThumb' in $$props) $$invalidate(16, currentThumb = $$props.currentThumb);
			if ('holding' in $$props) $$invalidate(7, holding = $$props.holding);
			if ('thumbHover' in $$props) $$invalidate(8, thumbHover = $$props.thumbHover);
			if ('keydownAcceleration' in $$props) keydownAcceleration = $$props.keydownAcceleration;
			if ('accelerationTimer' in $$props) accelerationTimer = $$props.accelerationTimer;
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty[0] & /*element*/ 64) {
				// React to left position of element relative to window
				if (element) elementX = element.getBoundingClientRect().left;
			}

			if ($$self.$$.dirty[0] & /*currentThumb*/ 65536) {
				// Set a class based on if dragging
				$$invalidate(7, holding = Boolean(currentThumb));
			}

			if ($$self.$$.dirty[0] & /*progressBar, thumb, value, min, max, container*/ 63) {
				// Update progressbar and thumb styles to represent value
				if (progressBar && thumb) {
					// Limit value min -> max
					$$invalidate(0, value = value > min ? value : min);

					$$invalidate(0, value = value < max ? value : max);
					let percent = (value - min) * 100 / (max - min);
					let offsetLeft = (container.clientWidth - 10) * (percent / 100) + 5;

					// Update thumb position + active range track width
					$$invalidate(4, thumb.style.left = `${offsetLeft}px`, thumb);

					$$invalidate(5, progressBar.style.width = `${offsetLeft}px`, progressBar);
				}
			}
		};

		return [
			value,
			min,
			max,
			container,
			thumb,
			progressBar,
			element,
			holding,
			thumbHover,
			resizeWindow,
			onTrackEvent,
			onDragStart,
			onDragEnd,
			onKeyPress,
			updateValueOnEvent,
			initialValue,
			currentThumb,
			div0_binding,
			div1_binding,
			mouseover_handler,
			mouseout_handler,
			blur_handler,
			focus_handler,
			div2_binding,
			div3_binding
		];
	}

	class RangeSlider extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(
				this,
				options,
				instance$c,
				create_fragment$c,
				safe_not_equal,
				{
					min: 1,
					max: 2,
					initialValue: 15,
					value: 0
				},
				null,
				[-1, -1]
			);

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "RangeSlider",
				options,
				id: create_fragment$c.name
			});
		}

		get min() {
			throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set min(value) {
			throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get max() {
			throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set max(value) {
			throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get initialValue() {
			throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set initialValue(value) {
			throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get value() {
			throw new Error("<RangeSlider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set value(value) {
			throw new Error("<RangeSlider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/basic/icons/alertOctagon.svelte generated by Svelte v4.2.19 */
	const file$b = "src/lib/components/basic/icons/alertOctagon.svelte";

	function create_fragment$b(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill-rule", "evenodd");
				attr_dev(path, "clip-rule", "evenodd");
				attr_dev(path, "d", "M16.145 22.005L16.14 22H7.86L2 16.14V7.86L7.86 2H16.145L22.005 7.86V16.145L16.145 22.005ZM8.48 20.5H15.515L20.495 15.52V8.48L15.52 3.5H8.48L3.5 8.48V15.52L8.48 20.5ZM12.75 13.5V8H11.25V13.5H12.75ZM13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16Z");
				attr_dev(path, "fill", "#ff0000");
				add_location(path, file$b, 7, 1, 103);
				attr_dev(svg, "width", "18");
				attr_dev(svg, "height", "18");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$b, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$b.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$b($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('AlertOctagon', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AlertOctagon> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class AlertOctagon extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "AlertOctagon",
				options,
				id: create_fragment$b.name
			});
		}
	}

	/* src/lib/components/basic/icons/checkVerified.svelte generated by Svelte v4.2.19 */
	const file$a = "src/lib/components/basic/icons/checkVerified.svelte";

	function create_fragment$a(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill-rule", "evenodd");
				attr_dev(path, "clip-rule", "evenodd");
				attr_dev(path, "d", "M21.1048 10.28L22.2848 11.47H22.2998C22.5898 11.76 22.5898 12.235 22.2998 12.525L20.1898 14.65L20.6448 17.61C20.7098 18.02 20.4298 18.4 20.0248 18.465L17.0648 18.945L15.6948 21.61C15.5598 21.87 15.2948 22.02 15.0248 22.02C14.9098 22.02 14.7948 21.995 14.6848 21.94L12.0098 20.585L9.33482 21.94C9.22482 21.995 9.10982 22.02 8.99482 22.02C8.71982 22.02 8.45982 21.87 8.32482 21.61L6.95482 18.945L3.99482 18.465C3.58982 18.4 3.30982 18.015 3.37482 17.61L3.83482 14.65L1.72482 12.525C1.43482 12.235 1.43482 11.76 1.72482 11.47L3.83482 9.34501L3.37982 6.38501C3.31482 5.97501 3.59482 5.59501 3.99982 5.53001L6.95982 5.05001L8.32982 2.38501C8.51482 2.02001 8.96482 1.87501 9.33482 2.06001L12.0098 3.41501L14.6848 2.06001C15.0498 1.87001 15.4998 2.02001 15.6898 2.38501L16.4498 3.87001L17.0548 5.05001L20.0148 5.53001C20.4198 5.59501 20.6998 5.98001 20.6348 6.38501L20.1748 9.34501L21.1048 10.28ZM19.0348 17.11L18.5748 14.135H18.5698L20.6898 12L18.5698 9.86501L19.0298 6.89001L16.0598 6.41001L14.6848 3.73001L11.9998 5.09001L9.31482 3.73001L7.93982 6.41001L4.96982 6.89001L5.42982 9.86501L3.30982 12L5.42982 14.135L4.96982 17.11L7.93982 17.59L9.31482 20.27L11.9998 18.91L14.6848 20.27L16.0598 17.59L19.0348 17.11ZM9.27983 11.72L10.7498 13.19L14.7198 9.22003L15.7798 10.28L11.6348 14.425C11.3898 14.67 11.0698 14.79 10.7498 14.79C10.4298 14.79 10.1098 14.67 9.86483 14.425L8.21983 12.78L9.27983 11.72Z");
				attr_dev(path, "fill", "#4D4F60");
				add_location(path, file$a, 7, 1, 103);
				attr_dev(svg, "width", "28");
				attr_dev(svg, "height", "18");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$a, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$a.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$a($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('CheckVerified', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CheckVerified> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class CheckVerified extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "CheckVerified",
				options,
				id: create_fragment$a.name
			});
		}
	}

	/* src/lib/components/basic/icons/crown.svelte generated by Svelte v4.2.19 */
	const file$9 = "src/lib/components/basic/icons/crown.svelte";

	function create_fragment$9(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "d", "M22 20H2V5.95499C2 5.44999 2.305 4.99499 2.77 4.79999C3.24 4.60499 3.775 4.70999 4.13 5.06999L7.37 8.30999L11.11 4.56999C11.595 4.08499 12.39 4.08499 12.88 4.56999L16.62 8.30999L19.86 5.06999C20.22 4.70999 20.755 4.60499 21.22 4.79999C21.685 4.99499 21.99 5.44499 21.99 5.95499V20H22ZM3.5 18.5H20.5V6.55999L16.625 10.435L12 5.80999L7.375 10.435L3.5 6.55999V18.5Z");
				attr_dev(path, "fill", "#FFD700");
				add_location(path, file$9, 7, 1, 103);
				attr_dev(svg, "width", "18");
				attr_dev(svg, "height", "18");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$9, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$9.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$9($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Crown', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Crown> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class Crown extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Crown",
				options,
				id: create_fragment$9.name
			});
		}
	}

	/* src/lib/components/basic/icons/shieldCheck.svelte generated by Svelte v4.2.19 */
	const file$8 = "src/lib/components/basic/icons/shieldCheck.svelte";

	function create_fragment$8(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill-rule", "evenodd");
				attr_dev(path, "clip-rule", "evenodd");
				attr_dev(path, "d", "M6.375 19.115L12 22.365V22.37L17.625 19.12C19.705 17.92 21 15.68 21 13.275V5.10001C21 4.53501 20.62 4.03501 20.075 3.89001L12 1.72501L3.925 3.88501C3.38 4.03501 3 4.53001 3 5.09501V13.27C3 15.675 4.295 17.915 6.375 19.115ZM4.5 13.27V5.28501L12 3.27501L19.5 5.28501V13.27C19.5 15.14 18.495 16.88 16.875 17.815L12 20.63L7.125 17.815C5.505 16.88 4.5 15.14 4.5 13.27ZM9.8657 13.925C10.1107 14.17 10.4307 14.29 10.7507 14.29C11.0707 14.29 11.3907 14.17 11.6357 13.925L16.7807 8.78L15.7207 7.72L10.7507 12.69L8.7807 10.72L7.7207 11.78L9.8657 13.925Z");
				attr_dev(path, "fill", "#A6E3A1");
				add_location(path, file$8, 7, 1, 103);
				attr_dev(svg, "width", "18");
				attr_dev(svg, "height", "18");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$8, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$8.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$8($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ShieldCheck', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ShieldCheck> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class ShieldCheck extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "ShieldCheck",
				options,
				id: create_fragment$8.name
			});
		}
	}

	/* src/lib/components/basic/icons/refresh.svelte generated by Svelte v4.2.19 */
	const file$7 = "src/lib/components/basic/icons/refresh.svelte";

	function create_fragment$7(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill-rule", "evenodd");
				attr_dev(path, "clip-rule", "evenodd");
				attr_dev(path, "d", "M19.5001 7.03V3H21.0001V8.75C21.0001 9.44 20.4401 10 19.7501 10H14.0001V8.5H18.6301C17.3501 6.07 14.8051 4.5 12.0001 4.5C8.95506 4.5 6.23506 6.32 5.07006 9.13L3.68506 8.555C5.08506 5.18 8.34506 3 12.0001 3C15.0601 3 17.8601 4.56 19.5001 7.03ZM5.37 15.5C6.655 17.925 9.205 19.5 12 19.5C15.045 19.5 17.765 17.68 18.93 14.87L20.315 15.445C18.915 18.82 15.655 21 12 21C8.95 21 6.145 19.445 4.5 16.975V21H3V15.25C3 14.56 3.56 14 4.25 14H10V15.5H5.37Z");
				attr_dev(path, "fill", "#4D4F60");
				add_location(path, file$7, 7, 1, 103);
				attr_dev(svg, "width", "24");
				attr_dev(svg, "height", "24");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$7, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$7.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$7($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Refresh', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Refresh> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class Refresh extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Refresh",
				options,
				id: create_fragment$7.name
			});
		}
	}

	/* src/lib/components/popup/PasswordGenerator.svelte generated by Svelte v4.2.19 */
	const file$6 = "src/lib/components/popup/PasswordGenerator.svelte";

	// (143:6) {:else}
	function create_else_block_1$3(ctx) {
		let copyicon;
		let current;

		copyicon = new CopyIcon({
				props: { color: '#4D4F60' },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(copyicon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(copyicon, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(copyicon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(copyicon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(copyicon, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_1$3.name,
			type: "else",
			source: "(143:6) {:else}",
			ctx
		});

		return block;
	}

	// (141:28) 
	function create_if_block_5$1(ctx) {
		let activecopy;
		let current;
		activecopy = new ActiveCopy({ $$inline: true });

		const block = {
			c: function create() {
				create_component(activecopy.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(activecopy, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(activecopy.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(activecopy.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(activecopy, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_5$1.name,
			type: "if",
			source: "(141:28) ",
			ctx
		});

		return block;
	}

	// (137:6) {#if copied}
	function create_if_block_4$1(ctx) {
		let span;
		let tick_1;
		let span_intro;
		let current;
		tick_1 = new Tick({ $$inline: true });

		const block = {
			c: function create() {
				span = element("span");
				create_component(tick_1.$$.fragment);
				add_location(span, file$6, 173, 7, 4700);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				mount_component(tick_1, span, null);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(tick_1.$$.fragment, local);

				if (local) {
					if (!span_intro) {
						add_render_callback(() => {
							span_intro = create_in_transition(span, scale, {});
							span_intro.start();
						});
					}
				}

				current = true;
			},
			o: function outro(local) {
				transition_out(tick_1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				destroy_component(tick_1);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_4$1.name,
			type: "if",
			source: "(137:6) {#if copied}",
			ctx
		});

		return block;
	}

	// (183:5) {:else}
	function create_else_block$6(ctx) {
		let span;
		let t;
		let alertoctagon;
		let current;
		alertoctagon = new AlertOctagon({ $$inline: true });

		const block = {
			c: function create() {
				span = element("span");
				t = text("Weak");
				create_component(alertoctagon.$$.fragment);
				attr_dev(span, "class", "flex justify-end items-center gap-1 w-[6rem] text-[#FF6A6A]");
				add_location(span, file$6, 219, 6, 6148);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t);
				mount_component(alertoctagon, span, null);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(alertoctagon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(alertoctagon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				destroy_component(alertoctagon);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$6.name,
			type: "else",
			source: "(183:5) {:else}",
			ctx
		});

		return block;
	}

	// (179:42) 
	function create_if_block_3$2(ctx) {
		let span;
		let t;
		let checkverified;
		let current;
		checkverified = new CheckVerified({ $$inline: true });

		const block = {
			c: function create() {
				span = element("span");
				t = text("Fair");
				create_component(checkverified.$$.fragment);
				attr_dev(span, "class", "flex justify-end items-center w-[6rem]");
				add_location(span, file$6, 215, 6, 6032);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t);
				mount_component(checkverified, span, null);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(checkverified.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(checkverified.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				destroy_component(checkverified);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3$2.name,
			type: "if",
			source: "(179:42) ",
			ctx
		});

		return block;
	}

	// (174:44) 
	function create_if_block_2$4(ctx) {
		let span;
		let t;
		let shieldcheck;
		let current;
		shieldcheck = new ShieldCheck({ $$inline: true });

		const block = {
			c: function create() {
				span = element("span");
				t = text("Strong ");
				create_component(shieldcheck.$$.fragment);
				attr_dev(span, "class", "flex justify-end items-center gap-1 w-[6rem] text-[#A6E3A1]");
				add_location(span, file$6, 210, 6, 5857);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t);
				mount_component(shieldcheck, span, null);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(shieldcheck.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(shieldcheck.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				destroy_component(shieldcheck);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2$4.name,
			type: "if",
			source: "(174:44) ",
			ctx
		});

		return block;
	}

	// (169:49) 
	function create_if_block_1$6(ctx) {
		let span;
		let t;
		let shieldcheck;
		let current;
		shieldcheck = new ShieldCheck({ $$inline: true });

		const block = {
			c: function create() {
				span = element("span");
				t = text("Very Strong ");
				create_component(shieldcheck.$$.fragment);
				attr_dev(span, "class", "flex justify-end items-center gap-1 w-[6rem] text-[#A6E3A1]");
				add_location(span, file$6, 205, 6, 5675);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t);
				mount_component(shieldcheck, span, null);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(shieldcheck.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(shieldcheck.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				destroy_component(shieldcheck);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$6.name,
			type: "if",
			source: "(169:49) ",
			ctx
		});

		return block;
	}

	// (165:5) {#if strengthSticker === "Chad"}
	function create_if_block$6(ctx) {
		let span;
		let t;
		let crown;
		let current;
		crown = new Crown({ $$inline: true });

		const block = {
			c: function create() {
				span = element("span");
				t = text("Chad ");
				create_component(crown.$$.fragment);
				attr_dev(span, "class", "flex justify-end items-center gap-1 w-[6rem]");
				add_location(span, file$6, 201, 6, 5523);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t);
				mount_component(crown, span, null);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(crown.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(crown.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}

				destroy_component(crown);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$6.name,
			type: "if",
			source: "(165:5) {#if strengthSticker === \\\"Chad\\\"}",
			ctx
		});

		return block;
	}

	function create_fragment$6(ctx) {
		let div18;
		let div17;
		let div3;
		let span0;
		let t1;
		let div2;
		let div0;
		let t2;
		let t3;
		let div1;
		let button0;
		let current_block_type_index;
		let if_block0;
		let t4;
		let button1;
		let refresh;
		let t5;
		let div4;
		let t6;
		let div15;
		let div7;
		let div5;
		let label0;
		let t7;
		let t8_value = Math.floor(/*entropy*/ ctx[5]) + "";
		let t8;
		let t9;
		let t10;
		let current_block_type_index_1;
		let if_block1;
		let t11;
		let div6;
		let rangeslider;
		let t12;
		let div8;
		let t13;
		let div9;
		let span1;
		let t15;
		let label1;
		let span4;
		let span2;
		let span2_class_value;
		let t16;
		let span3;
		let input0;
		let span3_class_value;
		let t17;
		let div10;
		let t18;
		let div11;
		let span5;
		let t20;
		let label2;
		let span8;
		let span6;
		let span6_class_value;
		let t21;
		let span7;
		let input1;
		let span7_class_value;
		let t22;
		let div12;
		let t23;
		let div13;
		let span9;
		let t25;
		let label3;
		let span12;
		let span10;
		let span10_class_value;
		let t26;
		let span11;
		let input2;
		let span11_class_value;
		let t27;
		let div14;
		let t28;
		let div16;
		let button2;
		let current;
		let mounted;
		let dispose;
		const if_block_creators = [create_if_block_4$1, create_if_block_5$1, create_else_block_1$3];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*copied*/ ctx[6]) return 0;
			if (/*hoverEffect*/ ctx[7]) return 1;
			return 2;
		}

		current_block_type_index = select_block_type(ctx);
		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		refresh = new Refresh({ $$inline: true });

		const if_block_creators_1 = [
			create_if_block$6,
			create_if_block_1$6,
			create_if_block_2$4,
			create_if_block_3$2,
			create_else_block$6
		];

		const if_blocks_1 = [];

		function select_block_type_1(ctx, dirty) {
			if (/*strengthSticker*/ ctx[8] === "Chad") return 0;
			if (/*strengthSticker*/ ctx[8] === "Very Strong") return 1;
			if (/*strengthSticker*/ ctx[8] === "Strong") return 2;
			if (/*strengthSticker*/ ctx[8] === "Fair") return 3;
			return 4;
		}

		current_block_type_index_1 = select_block_type_1(ctx);
		if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
		rangeslider = new RangeSlider({ $$inline: true });
		rangeslider.$on("change", /*change_handler*/ ctx[15]);

		const block = {
			c: function create() {
				div18 = element("div");
				div17 = element("div");
				div3 = element("div");
				span0 = element("span");
				span0.textContent = "Generated Password";
				t1 = space();
				div2 = element("div");
				div0 = element("div");
				t2 = text(/*generatedPassword*/ ctx[4]);
				t3 = space();
				div1 = element("div");
				button0 = element("button");
				if_block0.c();
				t4 = space();
				button1 = element("button");
				create_component(refresh.$$.fragment);
				t5 = space();
				div4 = element("div");
				t6 = space();
				div15 = element("div");
				div7 = element("div");
				div5 = element("div");
				label0 = element("label");
				t7 = text("Entropy : ");
				t8 = text(t8_value);
				t9 = text(" bits");
				t10 = space();
				if_block1.c();
				t11 = space();
				div6 = element("div");
				create_component(rangeslider.$$.fragment);
				t12 = space();
				div8 = element("div");
				t13 = space();
				div9 = element("div");
				span1 = element("span");
				span1.textContent = "Special characters (!&*)";
				t15 = space();
				label1 = element("label");
				span4 = element("span");
				span2 = element("span");
				t16 = space();
				span3 = element("span");
				input0 = element("input");
				t17 = space();
				div10 = element("div");
				t18 = space();
				div11 = element("div");
				span5 = element("span");
				span5.textContent = "Capital letters (A-Z)";
				t20 = space();
				label2 = element("label");
				span8 = element("span");
				span6 = element("span");
				t21 = space();
				span7 = element("span");
				input1 = element("input");
				t22 = space();
				div12 = element("div");
				t23 = space();
				div13 = element("div");
				span9 = element("span");
				span9.textContent = "Numbers (0-9)";
				t25 = space();
				label3 = element("label");
				span12 = element("span");
				span10 = element("span");
				t26 = space();
				span11 = element("span");
				input2 = element("input");
				t27 = space();
				div14 = element("div");
				t28 = space();
				div16 = element("div");
				button2 = element("button");
				button2.textContent = "Cancel";
				attr_dev(span0, "class", "text-osvauld-fieldText font-light text-xs");
				add_location(span0, file$6, 155, 3, 4021);
				attr_dev(div0, "class", "bg-osvauld-fieldActive rounded-md text-sm p-2 font-semibold text-osvauld-fieldText break-all min-w-[85%] max-w-[85%] min-h-[70px] max-h-[70px]");
				add_location(div0, file$6, 161, 4, 4210);
				add_location(button0, file$6, 167, 5, 4490);
				attr_dev(button1, "class", "transition-transform duration-300 ease-in rotate-custom svelte-e0u9e4");
				set_style(button1, "--rotation-deg", /*rotationDegree*/ ctx[9] + "deg");
				add_location(button1, file$6, 182, 5, 4885);
				attr_dev(div1, "class", "flex flex-col justify-between items-center gap-2 pr-2");
				add_location(div1, file$6, 166, 4, 4417);
				attr_dev(div2, "class", "text-osvauld-fieldTextActive flex justify-between items-center gap-2");
				add_location(div2, file$6, 158, 3, 4115);
				attr_dev(div3, "class", "px-3 py-2");
				add_location(div3, file$6, 154, 2, 3994);
				attr_dev(div4, "class", "border-b border-osvauld-iconblack w-[90%] translate-x-4 my-3");
				add_location(div4, file$6, 190, 2, 5128);
				attr_dev(label0, "class", "w-[9rem]");
				attr_dev(label0, "for", "lengthSlider");
				add_location(label0, file$6, 197, 5, 5378);
				attr_dev(div5, "class", "flex justify-between items-center gap-2 w-[90%]");
				add_location(div5, file$6, 196, 4, 5311);
				attr_dev(div6, "class", "w-[90%]");
				add_location(div6, file$6, 225, 4, 6298);
				attr_dev(div7, "class", "flex flex-col gap-2 mt-5 items-center");
				add_location(div7, file$6, 195, 3, 5255);
				attr_dev(div8, "class", "border-b border-osvauld-iconblack w-[90%] translate-x-4 my-1");
				add_location(div8, file$6, 229, 3, 6420);
				attr_dev(span1, "class", "");
				add_location(span1, file$6, 235, 4, 6602);

				attr_dev(span2, "class", span2_class_value = "block w-[36px] h-[1.25rem] " + (/*includeSpecialChars*/ ctx[0]
				? 'bg-osvauld-carolinablue'
				: 'bg-osvauld-placeholderblack') + " rounded-full shadow-inner");

				add_location(span2, file$6, 241, 6, 6777);
				attr_dev(input0, "type", "checkbox");
				attr_dev(input0, "id", "specialChar");
				attr_dev(input0, "class", "absolute opacity-0 w-0 h-0");
				add_location(input0, file$6, 251, 7, 7271);

				attr_dev(span3, "class", span3_class_value = "absolute block w-4 h-4 mt-0.5 ml-0.5 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out " + (/*includeSpecialChars*/ ctx[0]
				? 'bg-osvauld-plainwhite translate-x-full'
				: 'bg-osvauld-chalkwhite'));

				add_location(span3, file$6, 246, 6, 6970);
				attr_dev(span4, "class", "relative");
				add_location(span4, file$6, 240, 5, 6747);
				attr_dev(label1, "for", "specialChar");
				attr_dev(label1, "class", "inline-flex items-center cursor-pointer");
				add_location(label1, file$6, 236, 4, 6653);
				attr_dev(div9, "class", "flex items-center justify-between px-4 text-osvauld-quarzowhite");
				add_location(div9, file$6, 232, 3, 6512);
				attr_dev(div10, "class", "border-b border-osvauld-iconblack w-[90%] translate-x-4 my-1");
				add_location(div10, file$6, 261, 3, 7478);
				add_location(span5, file$6, 267, 4, 7660);

				attr_dev(span6, "class", span6_class_value = "block w-[36px] h-[1.25rem] " + (/*includeCapital*/ ctx[2]
				? 'bg-osvauld-carolinablue'
				: 'bg-osvauld-placeholderblack') + " rounded-full shadow-inner");

				add_location(span6, file$6, 270, 6, 7805);
				attr_dev(input1, "type", "checkbox");
				attr_dev(input1, "id", "capitals");
				attr_dev(input1, "class", "absolute opacity-0 w-0 h-0");
				add_location(input1, file$6, 280, 7, 8289);

				attr_dev(span7, "class", span7_class_value = "absolute block w-4 h-4 mt-0.5 ml-0.5 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out " + (/*includeCapital*/ ctx[2]
				? 'bg-osvauld-plainwhite translate-x-full'
				: 'bg-osvauld-chalkwhite'));

				add_location(span7, file$6, 275, 6, 7993);
				attr_dev(span8, "class", "relative");
				add_location(span8, file$6, 269, 5, 7775);
				attr_dev(label2, "for", "capitals");
				attr_dev(label2, "class", "inline-flex items-center cursor-pointer");
				add_location(label2, file$6, 268, 4, 7699);
				attr_dev(div11, "class", "flex items-center justify-between px-4 text-osvauld-quarzowhite");
				add_location(div11, file$6, 264, 3, 7570);
				attr_dev(div12, "class", "border-b border-osvauld-iconblack w-[90%] translate-x-4 my-1");
				add_location(div12, file$6, 290, 3, 8488);
				add_location(span9, file$6, 296, 4, 8670);

				attr_dev(span10, "class", span10_class_value = "block w-[36px] h-[1.25rem] " + (/*includeNumbers*/ ctx[1]
				? 'bg-osvauld-carolinablue'
				: 'bg-osvauld-placeholderblack') + " rounded-full shadow-inner");

				add_location(span10, file$6, 299, 6, 8806);
				attr_dev(input2, "type", "checkbox");
				attr_dev(input2, "id", "numbers");
				attr_dev(input2, "class", "absolute opacity-0 w-0 h-0");
				add_location(input2, file$6, 309, 7, 9290);

				attr_dev(span11, "class", span11_class_value = "absolute block w-4 h-4 mt-0.5 ml-0.5 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out " + (/*includeNumbers*/ ctx[1]
				? 'bg-osvauld-plainwhite translate-x-full'
				: 'bg-osvauld-chalkwhite'));

				add_location(span11, file$6, 304, 6, 8994);
				attr_dev(span12, "class", "relative");
				add_location(span12, file$6, 298, 5, 8776);
				attr_dev(label3, "for", "numbers");
				attr_dev(label3, "class", "inline-flex items-center cursor-pointer");
				add_location(label3, file$6, 297, 4, 8701);
				attr_dev(div13, "class", "flex items-center justify-between px-4 text-osvauld-quarzowhite");
				add_location(div13, file$6, 293, 3, 8580);
				attr_dev(div14, "class", "border-b border-osvauld-iconblack w-[90%] translate-x-4 my-1.5");
				add_location(div14, file$6, 319, 3, 9488);
				attr_dev(div15, "class", "flex flex-col gap-2");
				add_location(div15, file$6, 194, 2, 5218);
				attr_dev(button2, "class", "rounded-md border border-osvauld-iconblack py-1 px-2");
				add_location(button2, file$6, 325, 3, 9667);
				attr_dev(div16, "class", "mt-[6rem] flex justify-start items-center w-full pl-3 my-2");
				add_location(div16, file$6, 324, 2, 9591);
				attr_dev(div17, "class", "w-full h-full rounded-xl bg-osvauld-cardshade text-osvauld-fieldText");
				add_location(div17, file$6, 151, 1, 3905);
				attr_dev(div18, "class", "w-full h-full flex justify-center items-start text-osvauld-quarzowhite box-border");
				add_location(div18, file$6, 148, 0, 3806);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div18, anchor);
				append_dev(div18, div17);
				append_dev(div17, div3);
				append_dev(div3, span0);
				append_dev(div3, t1);
				append_dev(div3, div2);
				append_dev(div2, div0);
				append_dev(div0, t2);
				append_dev(div2, t3);
				append_dev(div2, div1);
				append_dev(div1, button0);
				if_blocks[current_block_type_index].m(button0, null);
				append_dev(div1, t4);
				append_dev(div1, button1);
				mount_component(refresh, button1, null);
				append_dev(div17, t5);
				append_dev(div17, div4);
				append_dev(div17, t6);
				append_dev(div17, div15);
				append_dev(div15, div7);
				append_dev(div7, div5);
				append_dev(div5, label0);
				append_dev(label0, t7);
				append_dev(label0, t8);
				append_dev(label0, t9);
				append_dev(div5, t10);
				if_blocks_1[current_block_type_index_1].m(div5, null);
				append_dev(div7, t11);
				append_dev(div7, div6);
				mount_component(rangeslider, div6, null);
				append_dev(div15, t12);
				append_dev(div15, div8);
				append_dev(div15, t13);
				append_dev(div15, div9);
				append_dev(div9, span1);
				append_dev(div9, t15);
				append_dev(div9, label1);
				append_dev(label1, span4);
				append_dev(span4, span2);
				append_dev(span4, t16);
				append_dev(span4, span3);
				append_dev(span3, input0);
				input0.checked = /*includeSpecialChars*/ ctx[0];
				append_dev(div15, t17);
				append_dev(div15, div10);
				append_dev(div15, t18);
				append_dev(div15, div11);
				append_dev(div11, span5);
				append_dev(div11, t20);
				append_dev(div11, label2);
				append_dev(label2, span8);
				append_dev(span8, span6);
				append_dev(span8, t21);
				append_dev(span8, span7);
				append_dev(span7, input1);
				input1.checked = /*includeCapital*/ ctx[2];
				append_dev(div15, t22);
				append_dev(div15, div12);
				append_dev(div15, t23);
				append_dev(div15, div13);
				append_dev(div13, span9);
				append_dev(div13, t25);
				append_dev(div13, label3);
				append_dev(label3, span12);
				append_dev(span12, span10);
				append_dev(span12, t26);
				append_dev(span12, span11);
				append_dev(span11, input2);
				input2.checked = /*includeNumbers*/ ctx[1];
				append_dev(div15, t27);
				append_dev(div15, div14);
				append_dev(div17, t28);
				append_dev(div17, div16);
				append_dev(div16, button2);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", stop_propagation(prevent_default(/*copyToClipboard*/ ctx[10])), false, true, true, false),
						listen_dev(button0, "mouseenter", /*mouseenter_handler*/ ctx[13], false, false, false, false),
						listen_dev(button0, "mouseleave", /*mouseleave_handler*/ ctx[14], false, false, false, false),
						listen_dev(button1, "click", stop_propagation(/*regenerationHandler*/ ctx[11]), false, false, true, false),
						listen_dev(input0, "change", /*input0_change_handler*/ ctx[16]),
						listen_dev(input1, "change", /*input1_change_handler*/ ctx[17]),
						listen_dev(input2, "change", /*input2_change_handler*/ ctx[18]),
						listen_dev(button2, "click", prevent_default(/*handleCancel*/ ctx[12]), false, true, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (!current || dirty & /*generatedPassword*/ 16) set_data_dev(t2, /*generatedPassword*/ ctx[4]);
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index !== previous_block_index) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block0 = if_blocks[current_block_type_index];

					if (!if_block0) {
						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block0.c();
					}

					transition_in(if_block0, 1);
					if_block0.m(button0, null);
				}

				if (!current || dirty & /*rotationDegree*/ 512) {
					set_style(button1, "--rotation-deg", /*rotationDegree*/ ctx[9] + "deg");
				}

				if ((!current || dirty & /*entropy*/ 32) && t8_value !== (t8_value = Math.floor(/*entropy*/ ctx[5]) + "")) set_data_dev(t8, t8_value);
				let previous_block_index_1 = current_block_type_index_1;
				current_block_type_index_1 = select_block_type_1(ctx);

				if (current_block_type_index_1 !== previous_block_index_1) {
					group_outros();

					transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
						if_blocks_1[previous_block_index_1] = null;
					});

					check_outros();
					if_block1 = if_blocks_1[current_block_type_index_1];

					if (!if_block1) {
						if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
						if_block1.c();
					}

					transition_in(if_block1, 1);
					if_block1.m(div5, null);
				}

				if (!current || dirty & /*includeSpecialChars*/ 1 && span2_class_value !== (span2_class_value = "block w-[36px] h-[1.25rem] " + (/*includeSpecialChars*/ ctx[0]
				? 'bg-osvauld-carolinablue'
				: 'bg-osvauld-placeholderblack') + " rounded-full shadow-inner")) {
					attr_dev(span2, "class", span2_class_value);
				}

				if (dirty & /*includeSpecialChars*/ 1) {
					input0.checked = /*includeSpecialChars*/ ctx[0];
				}

				if (!current || dirty & /*includeSpecialChars*/ 1 && span3_class_value !== (span3_class_value = "absolute block w-4 h-4 mt-0.5 ml-0.5 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out " + (/*includeSpecialChars*/ ctx[0]
				? 'bg-osvauld-plainwhite translate-x-full'
				: 'bg-osvauld-chalkwhite'))) {
					attr_dev(span3, "class", span3_class_value);
				}

				if (!current || dirty & /*includeCapital*/ 4 && span6_class_value !== (span6_class_value = "block w-[36px] h-[1.25rem] " + (/*includeCapital*/ ctx[2]
				? 'bg-osvauld-carolinablue'
				: 'bg-osvauld-placeholderblack') + " rounded-full shadow-inner")) {
					attr_dev(span6, "class", span6_class_value);
				}

				if (dirty & /*includeCapital*/ 4) {
					input1.checked = /*includeCapital*/ ctx[2];
				}

				if (!current || dirty & /*includeCapital*/ 4 && span7_class_value !== (span7_class_value = "absolute block w-4 h-4 mt-0.5 ml-0.5 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out " + (/*includeCapital*/ ctx[2]
				? 'bg-osvauld-plainwhite translate-x-full'
				: 'bg-osvauld-chalkwhite'))) {
					attr_dev(span7, "class", span7_class_value);
				}

				if (!current || dirty & /*includeNumbers*/ 2 && span10_class_value !== (span10_class_value = "block w-[36px] h-[1.25rem] " + (/*includeNumbers*/ ctx[1]
				? 'bg-osvauld-carolinablue'
				: 'bg-osvauld-placeholderblack') + " rounded-full shadow-inner")) {
					attr_dev(span10, "class", span10_class_value);
				}

				if (dirty & /*includeNumbers*/ 2) {
					input2.checked = /*includeNumbers*/ ctx[1];
				}

				if (!current || dirty & /*includeNumbers*/ 2 && span11_class_value !== (span11_class_value = "absolute block w-4 h-4 mt-0.5 ml-0.5 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out " + (/*includeNumbers*/ ctx[1]
				? 'bg-osvauld-plainwhite translate-x-full'
				: 'bg-osvauld-chalkwhite'))) {
					attr_dev(span11, "class", span11_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(refresh.$$.fragment, local);
				transition_in(if_block1);
				transition_in(rangeslider.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block0);
				transition_out(refresh.$$.fragment, local);
				transition_out(if_block1);
				transition_out(rangeslider.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div18);
				}

				if_blocks[current_block_type_index].d();
				destroy_component(refresh);
				if_blocks_1[current_block_type_index_1].d();
				destroy_component(rangeslider);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$6.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	const specialChars = "!#$%&()*+,-.:;<=>?@[]^_{|}~";
	const numbers = "0123456789";
	const lowerCase = "abcdefghijklmnopqrstuvwxyz";
	const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	function shuffleString(str) {
		// The Fisher-Yates (Knuth) shuffle algorithm
		let array = str.split("");

		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}

		return array.join("");
	}

	function instance$6($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('PasswordGenerator', slots, []);
		const dispatch = createEventDispatcher();
		let includeSpecialChars = false;
		let includeNumbers = true;
		let includeCapital = true;
		let passwordLength = 16;
		let generatedPassword = "";
		let entropy;
		let copied = false;
		let hoverEffect = false;
		let strengthSticker = "";
		let rotationDegree = 0;

		function calculateEntropy(password) {
			let N = lowerCase.length;
			if (includeSpecialChars) N += specialChars.length;
			if (includeNumbers) N += numbers.length;
			if (includeCapital) N += upperCase.length;
			const L = password.length;
			$$invalidate(5, entropy = Math.log2(N ** L));
			return entropy;
		}

		function setStrengthSticker(password) {
			const entropy = calculateEntropy(password);

			if (entropy < 40) {
				$$invalidate(8, strengthSticker = "Weak");
			} else if (entropy < 80) {
				$$invalidate(8, strengthSticker = "Fair");
			} else if (entropy < 120) {
				$$invalidate(8, strengthSticker = "Strong");
			} else if (entropy < 280) {
				$$invalidate(8, strengthSticker = "Very Strong");
			} else {
				$$invalidate(8, strengthSticker = "Chad");
			}
		}

		const generatePassword = (passwordLength, includeSpecialChars, includeNumbers, includeCapital) => {
			let allChars = lowerCase;
			let mandatoryChars = "";

			if (includeSpecialChars) {
				allChars += specialChars;
				mandatoryChars += specialChars.charAt(crypto.getRandomValues(new Uint32Array(1))[0] % specialChars.length);
			}

			if (includeNumbers) {
				allChars += numbers;
				mandatoryChars += numbers.charAt(crypto.getRandomValues(new Uint32Array(1))[0] % numbers.length);
			}

			if (includeCapital) {
				allChars += upperCase;
				mandatoryChars += upperCase.charAt(crypto.getRandomValues(new Uint32Array(1))[0] % upperCase.length);
			}

			let array = new Uint32Array(passwordLength - mandatoryChars.length);
			crypto.getRandomValues(array);
			let randomChars = Array.from(array, num => allChars[num % allChars.length]).join("");
			$$invalidate(4, generatedPassword = shuffleString(mandatoryChars + randomChars));
			setStrengthSticker(generatedPassword);
		};

		const copyToClipboard = async () => {
			$$invalidate(6, copied = true);
			await navigator.clipboard.writeText(generatedPassword);

			setTimeout(
				() => {
					$$invalidate(6, copied = false);
				},
				2000
			);
		};

		const regenerationHandler = () => {
			$$invalidate(9, rotationDegree += 180);

			setTimeout(
				() => {
					generatePassword(passwordLength, includeSpecialChars, includeNumbers, includeCapital);
				},
				350
			);
		};

		const handleCancel = () => {
			dispatch("close", true);
		};

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PasswordGenerator> was created with unknown prop '${key}'`);
		});

		const mouseenter_handler = () => $$invalidate(7, hoverEffect = true);
		const mouseleave_handler = () => $$invalidate(7, hoverEffect = false);
		const change_handler = e => $$invalidate(3, passwordLength = e.detail.value);

		function input0_change_handler() {
			includeSpecialChars = this.checked;
			$$invalidate(0, includeSpecialChars);
		}

		function input1_change_handler() {
			includeCapital = this.checked;
			$$invalidate(2, includeCapital);
		}

		function input2_change_handler() {
			includeNumbers = this.checked;
			$$invalidate(1, includeNumbers);
		}

		$$self.$capture_state = () => ({
			scale,
			RangeSlider,
			AlertOctagon,
			CheckVerified,
			Tick,
			Crown,
			ShieldCheck,
			CopyIcon,
			Refresh,
			ActiveCopy,
			createEventDispatcher,
			dispatch,
			includeSpecialChars,
			includeNumbers,
			includeCapital,
			passwordLength,
			generatedPassword,
			entropy,
			copied,
			hoverEffect,
			strengthSticker,
			rotationDegree,
			specialChars,
			numbers,
			lowerCase,
			upperCase,
			calculateEntropy,
			setStrengthSticker,
			shuffleString,
			generatePassword,
			copyToClipboard,
			regenerationHandler,
			handleCancel
		});

		$$self.$inject_state = $$props => {
			if ('includeSpecialChars' in $$props) $$invalidate(0, includeSpecialChars = $$props.includeSpecialChars);
			if ('includeNumbers' in $$props) $$invalidate(1, includeNumbers = $$props.includeNumbers);
			if ('includeCapital' in $$props) $$invalidate(2, includeCapital = $$props.includeCapital);
			if ('passwordLength' in $$props) $$invalidate(3, passwordLength = $$props.passwordLength);
			if ('generatedPassword' in $$props) $$invalidate(4, generatedPassword = $$props.generatedPassword);
			if ('entropy' in $$props) $$invalidate(5, entropy = $$props.entropy);
			if ('copied' in $$props) $$invalidate(6, copied = $$props.copied);
			if ('hoverEffect' in $$props) $$invalidate(7, hoverEffect = $$props.hoverEffect);
			if ('strengthSticker' in $$props) $$invalidate(8, strengthSticker = $$props.strengthSticker);
			if ('rotationDegree' in $$props) $$invalidate(9, rotationDegree = $$props.rotationDegree);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*passwordLength, includeSpecialChars, includeNumbers, includeCapital*/ 15) {
				{
					generatePassword(passwordLength, includeSpecialChars, includeNumbers, includeCapital);
				}
			}
		};

		return [
			includeSpecialChars,
			includeNumbers,
			includeCapital,
			passwordLength,
			generatedPassword,
			entropy,
			copied,
			hoverEffect,
			strengthSticker,
			rotationDegree,
			copyToClipboard,
			regenerationHandler,
			handleCancel,
			mouseenter_handler,
			mouseleave_handler,
			change_handler,
			input0_change_handler,
			input1_change_handler,
			input2_change_handler
		];
	}

	class PasswordGenerator extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "PasswordGenerator",
				options,
				id: create_fragment$6.name
			});
		}
	}

	/* src/lib/components/popup/Home.svelte generated by Svelte v4.2.19 */
	const file$5 = "src/lib/components/popup/Home.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[28] = list[i];
		return child_ctx;
	}

	// (158:2) {#if !addNewCredential && !passwordGenerator}
	function create_if_block_6(ctx) {
		let div0;
		let span0;
		let t0;
		let span1;
		let t1_value = /*domainAssociatedCredentials*/ ctx[10].length + "";
		let t1;
		let span1_class_value;
		let t2;
		let div1;
		let lens;
		let t3;
		let input;
		let current;
		let mounted;
		let dispose;
		let if_block = /*domain*/ ctx[1] && create_if_block_7(ctx);
		lens = new Lens({ $$inline: true });

		const block = {
			c: function create() {
				div0 = element("div");
				span0 = element("span");
				if (if_block) if_block.c();
				t0 = space();
				span1 = element("span");
				t1 = text(t1_value);
				t2 = space();
				div1 = element("div");
				create_component(lens.$$.fragment);
				t3 = space();
				input = element("input");
				attr_dev(span0, "class", "text-base text-osvauld-carolinablue");
				add_location(span0, file$5, 180, 4, 5231);
				attr_dev(span1, "class", span1_class_value = "text-osvauld-sheffieldgrey " + (/*passwordFound*/ ctx[0] ? 'visible' : 'invisible'));
				add_location(span1, file$5, 185, 4, 5342);
				attr_dev(div0, "class", "text-osvauld-highlightwhite mb-3 flex justify-between items-center text-sm");
				add_location(div0, file$5, 178, 3, 5134);
				attr_dev(input, "type", "text");
				attr_dev(input, "class", "h-6 w-[70%] bg-osvauld-frameblack border-0 text-osvauld-quarzowhite placeholder-osvauld-placeholderblack border-transparent text-sm font-light focus:border-transparent focus:ring-0 cursor-pointer");
				attr_dev(input, "placeholder", "Find what you need faster..");
				add_location(input, file$5, 196, 4, 5707);
				attr_dev(div1, "class", "h-9 w-full mx-auto flex justify-start items-center border focus-within:!border-osvauld-activeBorder border-osvauld-iconblack rounded-lg cursor-pointer mb-4 pl-2");
				add_location(div1, file$5, 193, 3, 5511);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div0, anchor);
				append_dev(div0, span0);
				if (if_block) if_block.m(span0, null);
				append_dev(div0, t0);
				append_dev(div0, span1);
				append_dev(span1, t1);
				insert_dev(target, t2, anchor);
				insert_dev(target, div1, anchor);
				mount_component(lens, div1, null);
				append_dev(div1, t3);
				append_dev(div1, input);
				set_input_value(input, /*query*/ ctx[3]);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(input, "keyup", /*handleInputChange*/ ctx[13], false, false, false, false),
						listen_dev(input, "input", /*input_input_handler*/ ctx[20])
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (/*domain*/ ctx[1]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block_7(ctx);
						if_block.c();
						if_block.m(span0, null);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (!current || dirty & /*passwordFound*/ 1 && span1_class_value !== (span1_class_value = "text-osvauld-sheffieldgrey " + (/*passwordFound*/ ctx[0] ? 'visible' : 'invisible'))) {
					attr_dev(span1, "class", span1_class_value);
				}

				if (dirty & /*query*/ 8 && input.value !== /*query*/ ctx[3]) {
					set_input_value(input, /*query*/ ctx[3]);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(lens.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(lens.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div0);
					detach_dev(t2);
					detach_dev(div1);
				}

				if (if_block) if_block.d();
				destroy_component(lens);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_6.name,
			type: "if",
			source: "(158:2) {#if !addNewCredential && !passwordGenerator}",
			ctx
		});

		return block;
	}

	// (162:5) {#if domain}
	function create_if_block_7(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text(/*domain*/ ctx[1]);
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*domain*/ 2) set_data_dev(t, /*domain*/ ctx[1]);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_7.name,
			type: "if",
			source: "(162:5) {#if domain}",
			ctx
		});

		return block;
	}

	// (186:3) {#if !addNewCredential}
	function create_if_block_5(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				div.innerHTML = ``;
				attr_dev(div, "class", "border-b border-osvauld-darkLineSeperator mb-1 w-[calc(100%+1.5rem)] -translate-x-3");
				add_location(div, file$5, 206, 4, 6143);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_5.name,
			type: "if",
			source: "(186:3) {#if !addNewCredential}",
			ctx
		});

		return block;
	}

	// (214:4) {:else}
	function create_else_block$5(ctx) {
		let passwordnotfound;
		let current;
		passwordnotfound = new PasswordNotFound({ $$inline: true });

		const block = {
			c: function create() {
				create_component(passwordnotfound.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(passwordnotfound, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(passwordnotfound.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(passwordnotfound.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(passwordnotfound, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$5.name,
			type: "else",
			source: "(214:4) {:else}",
			ctx
		});

		return block;
	}

	// (208:45) 
	function create_if_block_4(ctx) {
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev(/*listedCredentials*/ ctx[2]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*listedCredentials, storedCredentialId, selectCredential*/ 16900) {
					each_value = ensure_array_like_dev(/*listedCredentials*/ ctx[2]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_4.name,
			type: "if",
			source: "(208:45) ",
			ctx
		});

		return block;
	}

	// (203:32) 
	function create_if_block_3$1(ctx) {
		let passwordgenerator;
		let current;
		passwordgenerator = new PasswordGenerator({ $$inline: true });
		passwordgenerator.$on("close", /*close_handler*/ ctx[21]);

		const block = {
			c: function create() {
				create_component(passwordgenerator.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(passwordgenerator, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(passwordgenerator.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(passwordgenerator.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(passwordgenerator, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3$1.name,
			type: "if",
			source: "(203:32) ",
			ctx
		});

		return block;
	}

	// (195:4) {#if addNewCredential}
	function create_if_block_2$3(ctx) {
		let addcredential;
		let current;

		addcredential = new AddCredential({
				props: {
					username: /*newCredential*/ ctx[11].username,
					password: /*newCredential*/ ctx[11].password,
					domain: /*newCredential*/ ctx[11].domain || /*domain*/ ctx[1],
					windowId: /*newCredential*/ ctx[11].windowId || 'manual',
					currentUrl: /*newCredential*/ ctx[11].url || /*currentUrl*/ ctx[7]
				},
				$$inline: true
			});

		addcredential.$on("close", /*closeAddCredential*/ ctx[17]);

		const block = {
			c: function create() {
				create_component(addcredential.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(addcredential, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const addcredential_changes = {};
				if (dirty & /*domain*/ 2) addcredential_changes.domain = /*newCredential*/ ctx[11].domain || /*domain*/ ctx[1];
				if (dirty & /*currentUrl*/ 128) addcredential_changes.currentUrl = /*newCredential*/ ctx[11].url || /*currentUrl*/ ctx[7];
				addcredential.$set(addcredential_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(addcredential.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(addcredential.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(addcredential, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2$3.name,
			type: "if",
			source: "(195:4) {#if addNewCredential}",
			ctx
		});

		return block;
	}

	// (209:5) {#each listedCredentials as credential}
	function create_each_block(ctx) {
		let listedcredentials;
		let current;

		listedcredentials = new ListedCredentials({
				props: {
					credential: /*credential*/ ctx[28],
					selectedCredentialId: /*storedCredentialId*/ ctx[9]
				},
				$$inline: true
			});

		listedcredentials.$on("credentialClicked", /*selectCredential*/ ctx[14]);

		const block = {
			c: function create() {
				create_component(listedcredentials.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(listedcredentials, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const listedcredentials_changes = {};
				if (dirty & /*listedCredentials*/ 4) listedcredentials_changes.credential = /*credential*/ ctx[28];
				if (dirty & /*storedCredentialId*/ 512) listedcredentials_changes.selectedCredentialId = /*storedCredentialId*/ ctx[9];
				listedcredentials.$set(listedcredentials_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(listedcredentials.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(listedcredentials.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(listedcredentials, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(209:5) {#each listedCredentials as credential}",
			ctx
		});

		return block;
	}

	// (221:1) {#if !addNewCredential}
	function create_if_block$5(ctx) {
		let button;
		let add;
		let t;
		let if_block_anchor;
		let current;
		let mounted;
		let dispose;

		add = new Add({
				props: { color: '#A3A4B5' },
				$$inline: true
			});

		let if_block = /*showAddOptions*/ ctx[6] && create_if_block_1$5(ctx);

		const block = {
			c: function create() {
				button = element("button");
				create_component(add.$$.fragment);
				t = space();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				attr_dev(button, "class", "p-2 border border-osvauld-defaultBorder rounded-md right-4 bottom-4 fixed active:scale-[.98]");
				add_location(button, file$5, 241, 2, 7207);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);
				mount_component(add, button, null);
				insert_dev(target, t, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = listen_dev(button, "click", /*handleOptionsClick*/ ctx[18], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (/*showAddOptions*/ ctx[6]) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block_1$5(ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(add.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(add.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(button);
					detach_dev(t);
					detach_dev(if_block_anchor);
				}

				destroy_component(add);
				if (if_block) if_block.d(detaching);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$5.name,
			type: "if",
			source: "(221:1) {#if !addNewCredential}",
			ctx
		});

		return block;
	}

	// (225:2) {#if showAddOptions}
	function create_if_block_1$5(ctx) {
		let div1;
		let div0;
		let button0;
		let span0;
		let t1;
		let button1;
		let span1;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				div1 = element("div");
				div0 = element("div");
				button0 = element("button");
				span0 = element("span");
				span0.textContent = "Generate Password";
				t1 = space();
				button1 = element("button");
				span1 = element("span");
				span1.textContent = "Add Credential";
				attr_dev(span0, "class", "font-inter font-normal text-sm whitespace-nowrap");
				add_location(span0, file$5, 252, 6, 7879);
				attr_dev(button0, "class", "flex justify-start gap-2 items-center w-full p-2 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-md cursor-pointer");
				add_location(button0, file$5, 249, 5, 7636);
				attr_dev(span1, "class", "font-inter font-normal text-sm whitespace-nowrap");
				add_location(span1, file$5, 258, 6, 8233);
				attr_dev(button1, "class", "flex justify-start gap-2 items-center w-full p-2 text-osvauld-fieldText hover:text-osvauld-sideListTextActive hover:bg-osvauld-modalFieldActive rounded-md cursor-pointer");
				add_location(button1, file$5, 255, 5, 7995);
				attr_dev(div0, "class", "flex flex-col items-start p-2 gap-1 w-full h-full");
				add_location(div0, file$5, 248, 4, 7567);
				attr_dev(div1, "class", "absolute z-50 bg-osvauld-frameblack border border-osvauld-iconblack w-[160px] rounded-lg");
				set_style(div1, "bottom", "35px");
				set_style(div1, "right", "40px");
				add_location(div1, file$5, 245, 3, 7417);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
				append_dev(div0, button0);
				append_dev(button0, span0);
				append_dev(div0, t1);
				append_dev(div0, button1);
				append_dev(button1, span1);

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", /*triggerPasswordGenerator*/ ctx[19], false, false, false, false),
						listen_dev(button1, "click", /*addCredentialManual*/ ctx[16], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}

				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$5.name,
			type: "if",
			source: "(225:2) {#if showAddOptions}",
			ctx
		});

		return block;
	}

	function create_fragment$5(ctx) {
		let div5;
		let div1;
		let h6;
		let t1;
		let div0;
		let button;
		let maximize;
		let t2;
		let div4;
		let t3;
		let div3;
		let t4;
		let div2;
		let current_block_type_index;
		let if_block2;
		let t5;
		let current;
		let mounted;
		let dispose;
		maximize = new Maximize({ $$inline: true });
		let if_block0 = !/*addNewCredential*/ ctx[8] && !/*passwordGenerator*/ ctx[5] && create_if_block_6(ctx);
		let if_block1 = !/*addNewCredential*/ ctx[8] && create_if_block_5(ctx);
		const if_block_creators = [create_if_block_2$3, create_if_block_3$1, create_if_block_4, create_else_block$5];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*addNewCredential*/ ctx[8]) return 0;
			if (/*passwordGenerator*/ ctx[5]) return 1;
			if (/*listedCredentials*/ ctx[2].length !== 0) return 2;
			return 3;
		}

		current_block_type_index = select_block_type(ctx);
		if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		let if_block3 = !/*addNewCredential*/ ctx[8] && create_if_block$5(ctx);

		const block = {
			c: function create() {
				div5 = element("div");
				div1 = element("div");
				h6 = element("h6");
				h6.textContent = "osvauld";
				t1 = space();
				div0 = element("div");
				button = element("button");
				create_component(maximize.$$.fragment);
				t2 = space();
				div4 = element("div");
				if (if_block0) if_block0.c();
				t3 = space();
				div3 = element("div");
				if (if_block1) if_block1.c();
				t4 = space();
				div2 = element("div");
				if_block2.c();
				t5 = space();
				if (if_block3) if_block3.c();
				attr_dev(h6, "class", "text-2xl font-medium text-osvauld-fieldText tracking-wide");
				add_location(h6, file$5, 166, 2, 4839);
				attr_dev(button, "class", "");
				add_location(button, file$5, 170, 3, 4940);
				add_location(div0, file$5, 169, 2, 4931);
				attr_dev(div1, "class", "flex justify-between items-center mb-3 py-0");
				add_location(div1, file$5, 165, 1, 4779);
				attr_dev(div2, "class", "h-[32rem] overflow-y-scroll scrollbar-thin pt-3");
				add_location(div2, file$5, 210, 3, 6269);
				attr_dev(div3, "class", "h-full p-0 scrollbar-thin");
				add_location(div3, file$5, 204, 2, 6072);
				attr_dev(div4, "class", "w-full h-[90%] overflow-hidden");
				add_location(div4, file$5, 176, 1, 5038);
				attr_dev(div5, "class", "w-full h-full px-2 relative");
				add_location(div5, file$5, 164, 0, 4736);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div5, anchor);
				append_dev(div5, div1);
				append_dev(div1, h6);
				append_dev(div1, t1);
				append_dev(div1, div0);
				append_dev(div0, button);
				mount_component(maximize, button, null);
				append_dev(div5, t2);
				append_dev(div5, div4);
				if (if_block0) if_block0.m(div4, null);
				append_dev(div4, t3);
				append_dev(div4, div3);
				if (if_block1) if_block1.m(div3, null);
				append_dev(div3, t4);
				append_dev(div3, div2);
				if_blocks[current_block_type_index].m(div2, null);
				/*div2_binding*/ ctx[22](div2);
				append_dev(div5, t5);
				if (if_block3) if_block3.m(div5, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(button, "click", /*openFullscreenTab*/ ctx[12], false, false, false, false),
						listen_dev(div2, "scroll", /*handleScroll*/ ctx[15], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (!/*addNewCredential*/ ctx[8] && !/*passwordGenerator*/ ctx[5]) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty & /*addNewCredential, passwordGenerator*/ 288) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_6(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(div4, t3);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (!/*addNewCredential*/ ctx[8]) {
					if (if_block1) ; else {
						if_block1 = create_if_block_5(ctx);
						if_block1.c();
						if_block1.m(div3, t4);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block2 = if_blocks[current_block_type_index];

					if (!if_block2) {
						if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block2.c();
					} else {
						if_block2.p(ctx, dirty);
					}

					transition_in(if_block2, 1);
					if_block2.m(div2, null);
				}

				if (!/*addNewCredential*/ ctx[8]) {
					if (if_block3) {
						if_block3.p(ctx, dirty);

						if (dirty & /*addNewCredential*/ 256) {
							transition_in(if_block3, 1);
						}
					} else {
						if_block3 = create_if_block$5(ctx);
						if_block3.c();
						transition_in(if_block3, 1);
						if_block3.m(div5, null);
					}
				} else if (if_block3) {
					group_outros();

					transition_out(if_block3, 1, 1, () => {
						if_block3 = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(maximize.$$.fragment, local);
				transition_in(if_block0);
				transition_in(if_block2);
				transition_in(if_block3);
				current = true;
			},
			o: function outro(local) {
				transition_out(maximize.$$.fragment, local);
				transition_out(if_block0);
				transition_out(if_block2);
				transition_out(if_block3);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div5);
				}

				destroy_component(maximize);
				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if_blocks[current_block_type_index].d();
				/*div2_binding*/ ctx[22](null);
				if (if_block3) if_block3.d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$5.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$5($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Home', slots, []);
		let passwordFound = false;
		let domain = null;
		let listedCredentials = [];
		let domainAssociatedCredentials = [];
		let searchData = [];
		let query = null;
		let scrollPosition = 0;
		let scrollableElement;
		let passwordGenerator = false;
		let showAddOptions = false;
		let currentUrl = "";
		let addNewCredential = false;
		let storedCredentialId = null;

		let newCredential = {
			username: "",
			password: "",
			domain: "",
			windowId: ""
		};

		const openFullscreenTab = async () => {
			await sendMessage("openFullscreenTab");
		};

		const readDomain = async () => {
			const tabs = await browser.tabs.query({ active: true, currentWindow: true });
			const activeTab = tabs[0];

			if (activeTab && activeTab.url) {
				$$invalidate(7, currentUrl = activeTab.url);
				const url = new URL(activeTab.url);
				const hostname = url.hostname;
				const parts = hostname.split(".");

				if (parts.length > 2) {
					$$invalidate(1, domain = parts.slice(-2).join("."));
				} else if (hostname === browser.runtime.id) {
					$$invalidate(1, domain = "Dashboard");
				} else {
					$$invalidate(1, domain = hostname);
				}
			}
		};

		const fetchCredentialsOfCurrentDomin = async () => {
			const responseJson = await fetchAllUserUrls();
			const urls = responseJson.data;
			await readDomain();
			const { credIds } = await sendMessage("updateAllUrls", { urls, domain });

			if (credIds.length > 0) {
				$$invalidate(0, passwordFound = true);
				const responseJson = await fetchCredsByIds(credIds);
				$$invalidate(2, listedCredentials = responseJson.data);
			}
		};

		onMount(async () => {
			$$invalidate(3, query = LocalStorageService.get("query"));

			if (query && query.length >= 1) {
				await prepareSearchData();
				$$invalidate(2, listedCredentials = searchObjects(query, searchData));
			} else {
				await fetchCredentialsOfCurrentDomin();
			}

			const user = await getUser();
			LocalStorageService.set("user", user.data, true);
			$$invalidate(9, storedCredentialId = LocalStorageService.get("selectedCredentialId"));
			const storedScrollPosition = LocalStorageService.get("scrollPosition");

			if (storedScrollPosition !== null) {
				scrollPosition = parseInt(storedScrollPosition);
				$$invalidate(4, scrollableElement.scrollTop = scrollPosition, scrollableElement);
			}
		});

		const prepareSearchData = async () => {
			const searchFieldSResponse = await getSearchFields();
			searchData = searchFieldSResponse.data;
			const urlJson = await fetchAllUserUrls();
			const urls = urlJson.data;
			const decryptedData = await sendMessage("getDecryptedUrls", urls);

			const mergedArray = searchData.map(item => {
				const replacement = decryptedData.find(decryptedItem => decryptedItem.credentialId === item.credentialId);

				if (replacement) {
					return { ...item, domain: replacement.value };
				}

				return item;
			});

			searchData = mergedArray;
		};

		const handleInputChange = async e => {
			const query = e.target.value;

			if (query.length >= 1) {
				if (searchData.length === 0) {
					await prepareSearchData();
				}

				$$invalidate(0, passwordFound = false);
				$$invalidate(2, listedCredentials = searchObjects(query, searchData));
			} else {
				$$invalidate(2, listedCredentials = []);
				await fetchCredentialsOfCurrentDomin();
			}

			LocalStorageService.set("query", query);
		};

		const selectCredential = async e => {
			$$invalidate(9, storedCredentialId = e.detail.credentialId);
		};

		const handleScroll = async e => {
			scrollPosition = e.target.scrollTop;
			LocalStorageService.set("scrollPosition", scrollPosition.toString());
		};

		const addCredentialManual = async () => {
			$$invalidate(6, showAddOptions = false);
			$$invalidate(8, addNewCredential = true);
		};

		const closeAddCredential = async () => {
			$$invalidate(8, addNewCredential = false);
			await fetchCredentialsOfCurrentDomin();
		};

		const handleOptionsClick = () => {
			$$invalidate(6, showAddOptions = !showAddOptions);
		};

		const triggerPasswordGenerator = () => {
			$$invalidate(6, showAddOptions = false);
			$$invalidate(5, passwordGenerator = true);
		};

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
		});

		function input_input_handler() {
			query = this.value;
			$$invalidate(3, query);
		}

		const close_handler = () => {
			$$invalidate(5, passwordGenerator = false);
		};

		function div2_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				scrollableElement = $$value;
				$$invalidate(4, scrollableElement);
			});
		}

		$$self.$capture_state = () => ({
			fetchAllUserUrls,
			fetchCredsByIds,
			browser,
			onMount,
			Maximize,
			Lens,
			sendMessage,
			getUser,
			searchObjects,
			getSearchFields,
			ListedCredentials,
			PasswordNotFound,
			AddCredential,
			Add,
			PasswordGenerator,
			LocalStorageService,
			passwordFound,
			domain,
			listedCredentials,
			domainAssociatedCredentials,
			searchData,
			query,
			scrollPosition,
			scrollableElement,
			passwordGenerator,
			showAddOptions,
			currentUrl,
			addNewCredential,
			storedCredentialId,
			newCredential,
			openFullscreenTab,
			readDomain,
			fetchCredentialsOfCurrentDomin,
			prepareSearchData,
			handleInputChange,
			selectCredential,
			handleScroll,
			addCredentialManual,
			closeAddCredential,
			handleOptionsClick,
			triggerPasswordGenerator
		});

		$$self.$inject_state = $$props => {
			if ('passwordFound' in $$props) $$invalidate(0, passwordFound = $$props.passwordFound);
			if ('domain' in $$props) $$invalidate(1, domain = $$props.domain);
			if ('listedCredentials' in $$props) $$invalidate(2, listedCredentials = $$props.listedCredentials);
			if ('domainAssociatedCredentials' in $$props) $$invalidate(10, domainAssociatedCredentials = $$props.domainAssociatedCredentials);
			if ('searchData' in $$props) searchData = $$props.searchData;
			if ('query' in $$props) $$invalidate(3, query = $$props.query);
			if ('scrollPosition' in $$props) scrollPosition = $$props.scrollPosition;
			if ('scrollableElement' in $$props) $$invalidate(4, scrollableElement = $$props.scrollableElement);
			if ('passwordGenerator' in $$props) $$invalidate(5, passwordGenerator = $$props.passwordGenerator);
			if ('showAddOptions' in $$props) $$invalidate(6, showAddOptions = $$props.showAddOptions);
			if ('currentUrl' in $$props) $$invalidate(7, currentUrl = $$props.currentUrl);
			if ('addNewCredential' in $$props) $$invalidate(8, addNewCredential = $$props.addNewCredential);
			if ('storedCredentialId' in $$props) $$invalidate(9, storedCredentialId = $$props.storedCredentialId);
			if ('newCredential' in $$props) $$invalidate(11, newCredential = $$props.newCredential);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			passwordFound,
			domain,
			listedCredentials,
			query,
			scrollableElement,
			passwordGenerator,
			showAddOptions,
			currentUrl,
			addNewCredential,
			storedCredentialId,
			domainAssociatedCredentials,
			newCredential,
			openFullscreenTab,
			handleInputChange,
			selectCredential,
			handleScroll,
			addCredentialManual,
			closeAddCredential,
			handleOptionsClick,
			triggerPasswordGenerator,
			input_input_handler,
			close_handler,
			div2_binding
		];
	}

	class Home extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Home",
				options,
				id: create_fragment$5.name
			});
		}
	}

	/* src/lib/components/popup/TempLogin.svelte generated by Svelte v4.2.19 */

	const file$4 = "src/lib/components/popup/TempLogin.svelte";

	// (91:3) {:else}
	function create_else_block_1$2(ctx) {
		let eye;
		let current;
		eye = new Eye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(eye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(eye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(eye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(eye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(eye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_1$2.name,
			type: "else",
			source: "(91:3) {:else}",
			ctx
		});

		return block;
	}

	// (89:3) {#if showPassword}
	function create_if_block_2$2(ctx) {
		let closedeye;
		let current;
		closedeye = new ClosedEye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(closedeye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(closedeye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(closedeye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(closedeye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(closedeye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2$2.name,
			type: "if",
			source: "(89:3) {#if showPassword}",
			ctx
		});

		return block;
	}

	// (96:1) {#if showVerificationError}
	function create_if_block_1$4(ctx) {
		let span;

		const block = {
			c: function create() {
				span = element("span");
				span.textContent = "Wrong username or password";
				attr_dev(span, "class", "text-xs text-red-500 font-thin");
				add_location(span, file$4, 104, 2, 3310);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$4.name,
			type: "if",
			source: "(96:1) {#if showVerificationError}",
			ctx
		});

		return block;
	}

	// (105:2) {:else}
	function create_else_block$4(ctx) {
		let span;

		const block = {
			c: function create() {
				span = element("span");
				span.textContent = "Submit";
				add_location(span, file$4, 113, 3, 3677);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$4.name,
			type: "else",
			source: "(105:2) {:else}",
			ctx
		});

		return block;
	}

	// (103:2) {#if isLoaderActive}
	function create_if_block$4(ctx) {
		let loader;
		let current;

		loader = new Loader({
				props: { size: 24, color: "#1F242A", duration: 1 },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(loader.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(loader, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(loader.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(loader.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(loader, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$4.name,
			type: "if",
			source: "(103:2) {#if isLoaderActive}",
			ctx
		});

		return block;
	}

	function create_fragment$4(ctx) {
		let form;
		let label0;
		let t1;
		let div0;
		let input0;
		let t2;
		let label1;
		let t4;
		let div1;
		let input1;
		let t5;
		let label2;
		let t7;
		let div2;
		let input2;
		let t8;
		let button0;
		let current_block_type_index;
		let if_block0;
		let t9;
		let t10;
		let button1;
		let current_block_type_index_1;
		let if_block2;
		let t11;
		let button2;
		let span;
		let current;
		let mounted;
		let dispose;
		const if_block_creators = [create_if_block_2$2, create_else_block_1$2];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*showPassword*/ ctx[2]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		let if_block1 = /*showVerificationError*/ ctx[3] && create_if_block_1$4(ctx);
		const if_block_creators_1 = [create_if_block$4, create_else_block$4];
		const if_blocks_1 = [];

		function select_block_type_1(ctx, dirty) {
			if (/*isLoaderActive*/ ctx[4]) return 0;
			return 1;
		}

		current_block_type_index_1 = select_block_type_1(ctx);
		if_block2 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

		const block = {
			c: function create() {
				form = element("form");
				label0 = element("label");
				label0.textContent = "Enter Base URL";
				t1 = space();
				div0 = element("div");
				input0 = element("input");
				t2 = space();
				label1 = element("label");
				label1.textContent = "Enter Username";
				t4 = space();
				div1 = element("div");
				input1 = element("input");
				t5 = space();
				label2 = element("label");
				label2.textContent = "Enter Password";
				t7 = space();
				div2 = element("div");
				input2 = element("input");
				t8 = space();
				button0 = element("button");
				if_block0.c();
				t9 = space();
				if (if_block1) if_block1.c();
				t10 = space();
				button1 = element("button");
				if_block2.c();
				t11 = space();
				button2 = element("button");
				span = element("span");
				span.textContent = "Account Recovery";
				attr_dev(label0, "for", "baseurl");
				attr_dev(label0, "class", "font-normal mt-6");
				add_location(label0, file$4, 60, 1, 1832);
				attr_dev(input0, "class", "text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0 w-full");
				attr_dev(input0, "type", "text");
				attr_dev(input0, "autocomplete", "off");
				attr_dev(input0, "id", "baseurl");
				add_location(input0, file$4, 63, 2, 2010);
				attr_dev(div0, "class", "flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack w-[260px]");
				add_location(div0, file$4, 61, 1, 1902);
				attr_dev(label1, "for", "username");
				attr_dev(label1, "class", "font-normal mt-6");
				add_location(label1, file$4, 71, 1, 2253);
				attr_dev(input1, "class", "text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0 w-full");
				attr_dev(input1, "type", "text");
				attr_dev(input1, "autocomplete", "off");
				attr_dev(input1, "id", "username");
				add_location(input1, file$4, 74, 2, 2432);
				attr_dev(div1, "class", "flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack w-[260px]");
				add_location(div1, file$4, 72, 1, 2324);
				attr_dev(label2, "for", "password");
				attr_dev(label2, "class", "font-normal mt-6");
				add_location(label2, file$4, 82, 1, 2677);
				attr_dev(input2, "class", "text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0 w-full");
				attr_dev(input2, "type", /*type*/ ctx[5]);
				attr_dev(input2, "autocomplete", "off");
				attr_dev(input2, "id", "password");
				add_location(input2, file$4, 86, 2, 2857);
				attr_dev(button0, "type", "button");
				attr_dev(button0, "class", "flex justify-center items-center");
				add_location(button0, file$4, 92, 2, 3086);
				attr_dev(div2, "class", "flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack w-[260px]");
				add_location(div2, file$4, 84, 1, 2749);
				attr_dev(button1, "class", "bg-osvauld-carolinablue py-2 px-10 mt-8 rounded-lg text-osvauld-ninjablack font-medium w-[150px] flex justify-center items-center whitespace-nowrap");
				attr_dev(button1, "type", "submit");
				add_location(button1, file$4, 107, 1, 3401);
				add_location(span, file$4, 119, 2, 3935);
				attr_dev(button2, "class", "bg-osvauld-ownerGreen py-2 px-10 mt-8 rounded-lg text-osvauld-ownerText font-medium w-[150px] flex justify-center items-center whitespace-nowrap");
				attr_dev(button2, "type", "button");
				add_location(button2, file$4, 115, 1, 3715);
				attr_dev(form, "class", "flex flex-col justify-center items-center box-border w-[90%]");
				add_location(form, file$4, 57, 0, 1711);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, form, anchor);
				append_dev(form, label0);
				append_dev(form, t1);
				append_dev(form, div0);
				append_dev(div0, input0);
				set_input_value(input0, /*baseurl*/ ctx[1]);
				append_dev(form, t2);
				append_dev(form, label1);
				append_dev(form, t4);
				append_dev(form, div1);
				append_dev(div1, input1);
				set_input_value(input1, /*username*/ ctx[0]);
				append_dev(form, t5);
				append_dev(form, label2);
				append_dev(form, t7);
				append_dev(form, div2);
				append_dev(div2, input2);
				append_dev(div2, t8);
				append_dev(div2, button0);
				if_blocks[current_block_type_index].m(button0, null);
				append_dev(form, t9);
				if (if_block1) if_block1.m(form, null);
				append_dev(form, t10);
				append_dev(form, button1);
				if_blocks_1[current_block_type_index_1].m(button1, null);
				append_dev(form, t11);
				append_dev(form, button2);
				append_dev(button2, span);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(input0, "input", /*input0_input_handler*/ ctx[10]),
						listen_dev(input1, "input", /*input1_input_handler*/ ctx[11]),
						listen_dev(input2, "input", /*onInput*/ ctx[7], false, false, false, false),
						listen_dev(button0, "click", /*togglePassword*/ ctx[8], false, false, false, false),
						listen_dev(button2, "click", /*triggerAccountRecovery*/ ctx[9], false, false, false, false),
						listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[6]), false, true, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*baseurl*/ 2 && input0.value !== /*baseurl*/ ctx[1]) {
					set_input_value(input0, /*baseurl*/ ctx[1]);
				}

				if (dirty & /*username*/ 1 && input1.value !== /*username*/ ctx[0]) {
					set_input_value(input1, /*username*/ ctx[0]);
				}

				if (!current || dirty & /*type*/ 32) {
					attr_dev(input2, "type", /*type*/ ctx[5]);
				}

				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index !== previous_block_index) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block0 = if_blocks[current_block_type_index];

					if (!if_block0) {
						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block0.c();
					}

					transition_in(if_block0, 1);
					if_block0.m(button0, null);
				}

				if (/*showVerificationError*/ ctx[3]) {
					if (if_block1) ; else {
						if_block1 = create_if_block_1$4(ctx);
						if_block1.c();
						if_block1.m(form, t10);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				let previous_block_index_1 = current_block_type_index_1;
				current_block_type_index_1 = select_block_type_1(ctx);

				if (current_block_type_index_1 !== previous_block_index_1) {
					group_outros();

					transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
						if_blocks_1[previous_block_index_1] = null;
					});

					check_outros();
					if_block2 = if_blocks_1[current_block_type_index_1];

					if (!if_block2) {
						if_block2 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
						if_block2.c();
					}

					transition_in(if_block2, 1);
					if_block2.m(button1, null);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block2);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block0);
				transition_out(if_block2);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(form);
				}

				if_blocks[current_block_type_index].d();
				if (if_block1) if_block1.d();
				if_blocks_1[current_block_type_index_1].d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$4.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$4($$self, $$props, $$invalidate) {
		let type;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('TempLogin', slots, []);
		const dispatch = createEventDispatcher();
		let username = LocalStorageService.get("username") || "";
		let password = "";
		let baseurl = LocalStorageService.get("baseUrl") || "";
		let showPassword = false;
		let showVerificationError = false;
		let isLoaderActive = false;

		async function handleSubmit() {
			$$invalidate(4, isLoaderActive = true);
			if (baseurl.length === 0) return;
			await StorageService.setBaseUrl(baseurl);

			if (username && password) {
				const challengeResponse = await getRegsitrationChallenge(username, password);

				if (challengeResponse.success === false) {
					$$invalidate(4, isLoaderActive = false);
					$$invalidate(3, showVerificationError = true);
				}

				if (challengeResponse.data.challenge) {
					dispatch("setPassPhrase", {
						challenge: challengeResponse.data.challenge,
						username
					});

					$$invalidate(4, isLoaderActive = false);
				} else $$invalidate(3, showVerificationError = true);
			}
		}

		function onInput(event) {
			password = event.target.value;
		}

		const togglePassword = () => {
			$$invalidate(2, showPassword = !showPassword);
		};

		const triggerAccountRecovery = () => {
			dispatch("recovery", true);
		};

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TempLogin> was created with unknown prop '${key}'`);
		});

		function input0_input_handler() {
			baseurl = this.value;
			$$invalidate(1, baseurl);
		}

		function input1_input_handler() {
			username = this.value;
			$$invalidate(0, username);
		}

		$$self.$capture_state = () => ({
			getRegsitrationChallenge,
			Eye,
			createEventDispatcher,
			Loader,
			ClosedEye,
			LocalStorageService,
			StorageService,
			dispatch,
			username,
			password,
			baseurl,
			showPassword,
			showVerificationError,
			isLoaderActive,
			handleSubmit,
			onInput,
			togglePassword,
			triggerAccountRecovery,
			type
		});

		$$self.$inject_state = $$props => {
			if ('username' in $$props) $$invalidate(0, username = $$props.username);
			if ('password' in $$props) password = $$props.password;
			if ('baseurl' in $$props) $$invalidate(1, baseurl = $$props.baseurl);
			if ('showPassword' in $$props) $$invalidate(2, showPassword = $$props.showPassword);
			if ('showVerificationError' in $$props) $$invalidate(3, showVerificationError = $$props.showVerificationError);
			if ('isLoaderActive' in $$props) $$invalidate(4, isLoaderActive = $$props.isLoaderActive);
			if ('type' in $$props) $$invalidate(5, type = $$props.type);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*showPassword*/ 4) {
				$$invalidate(5, type = showPassword ? "text" : "password");
			}

			if ($$self.$$.dirty & /*username*/ 1) {
				LocalStorageService.set("username", username);
			}

			if ($$self.$$.dirty & /*baseurl*/ 2) {
				LocalStorageService.set("baseUrl", baseurl);
			}
		};

		return [
			username,
			baseurl,
			showPassword,
			showVerificationError,
			isLoaderActive,
			type,
			handleSubmit,
			onInput,
			togglePassword,
			triggerAccountRecovery,
			input0_input_handler,
			input1_input_handler
		];
	}

	class TempLogin extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "TempLogin",
				options,
				id: create_fragment$4.name
			});
		}
	}

	/* src/lib/components/popup/SetPassPhrase.svelte generated by Svelte v4.2.19 */
	const file$3 = "src/lib/components/popup/SetPassPhrase.svelte";

	// (86:3) {:else}
	function create_else_block_3(ctx) {
		let eye;
		let current;
		eye = new Eye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(eye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(eye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(eye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(eye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(eye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_3.name,
			type: "else",
			source: "(86:3) {:else}",
			ctx
		});

		return block;
	}

	// (84:3) {#if showFirstPassword}
	function create_if_block_3(ctx) {
		let closedeye;
		let current;
		closedeye = new ClosedEye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(closedeye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(closedeye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(closedeye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(closedeye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(closedeye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3.name,
			type: "if",
			source: "(84:3) {#if showFirstPassword}",
			ctx
		});

		return block;
	}

	// (111:3) {:else}
	function create_else_block_2(ctx) {
		let eye;
		let current;
		eye = new Eye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(eye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(eye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(eye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(eye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(eye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_2.name,
			type: "else",
			source: "(111:3) {:else}",
			ctx
		});

		return block;
	}

	// (109:3) {#if showSecondPassword}
	function create_if_block_2$1(ctx) {
		let closedeye;
		let current;
		closedeye = new ClosedEye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(closedeye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(closedeye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(closedeye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(closedeye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(closedeye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2$1.name,
			type: "if",
			source: "(109:3) {#if showSecondPassword}",
			ctx
		});

		return block;
	}

	// (123:1) {:else}
	function create_else_block_1$1(ctx) {
		let span;
		let t;
		let span_class_value;

		const block = {
			c: function create() {
				span = element("span");
				t = text("Passphrase doesn't match");

				attr_dev(span, "class", span_class_value = "mt-2 text-xs text-red-400 font-light " + (/*showPassphraseMismatchError*/ ctx[2]
				? 'visible'
				: 'invisible'));

				add_location(span, file$3, 131, 2, 3610);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*showPassphraseMismatchError*/ 4 && span_class_value !== (span_class_value = "mt-2 text-xs text-red-400 font-light " + (/*showPassphraseMismatchError*/ ctx[2]
				? 'visible'
				: 'invisible'))) {
					attr_dev(span, "class", span_class_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_1$1.name,
			type: "else",
			source: "(123:1) {:else}",
			ctx
		});

		return block;
	}

	// (117:1) {#if passphraseEmpty}
	function create_if_block_1$3(ctx) {
		let span;
		let t;
		let span_class_value;

		const block = {
			c: function create() {
				span = element("span");
				t = text("Passphrase Empty!");
				attr_dev(span, "class", span_class_value = "mt-2 text-xs text-red-400 font-light " + (/*passphraseEmpty*/ ctx[3] ? 'visible' : 'invisible'));
				add_location(span, file$3, 125, 2, 3465);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
				append_dev(span, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*passphraseEmpty*/ 8 && span_class_value !== (span_class_value = "mt-2 text-xs text-red-400 font-light " + (/*passphraseEmpty*/ ctx[3] ? 'visible' : 'invisible'))) {
					attr_dev(span, "class", span_class_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$3.name,
			type: "if",
			source: "(117:1) {#if passphraseEmpty}",
			ctx
		});

		return block;
	}

	// (137:2) {:else}
	function create_else_block$3(ctx) {
		let span;

		const block = {
			c: function create() {
				span = element("span");
				span.textContent = "Submit";
				add_location(span, file$3, 145, 3, 4050);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$3.name,
			type: "else",
			source: "(137:2) {:else}",
			ctx
		});

		return block;
	}

	// (135:2) {#if isLoaderActive}
	function create_if_block$3(ctx) {
		let loader;
		let current;

		loader = new Loader({
				props: { size: 24, color: "#1F242A", duration: 1 },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(loader.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(loader, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(loader.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(loader.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(loader, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$3.name,
			type: "if",
			source: "(135:2) {#if isLoaderActive}",
			ctx
		});

		return block;
	}

	function create_fragment$3(ctx) {
		let form;
		let label0;
		let t1;
		let div0;
		let input0;
		let t2;
		let button0;
		let current_block_type_index;
		let if_block0;
		let t3;
		let label1;
		let t5;
		let div1;
		let input1;
		let t6;
		let button1;
		let current_block_type_index_1;
		let if_block1;
		let t7;
		let t8;
		let button2;
		let current_block_type_index_2;
		let if_block3;
		let current;
		let mounted;
		let dispose;
		const if_block_creators = [create_if_block_3, create_else_block_3];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*showFirstPassword*/ ctx[0]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		const if_block_creators_1 = [create_if_block_2$1, create_else_block_2];
		const if_blocks_1 = [];

		function select_block_type_1(ctx, dirty) {
			if (/*showSecondPassword*/ ctx[1]) return 0;
			return 1;
		}

		current_block_type_index_1 = select_block_type_1(ctx);
		if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

		function select_block_type_2(ctx, dirty) {
			if (/*passphraseEmpty*/ ctx[3]) return create_if_block_1$3;
			return create_else_block_1$1;
		}

		let current_block_type = select_block_type_2(ctx);
		let if_block2 = current_block_type(ctx);
		const if_block_creators_2 = [create_if_block$3, create_else_block$3];
		const if_blocks_2 = [];

		function select_block_type_3(ctx, dirty) {
			if (/*isLoaderActive*/ ctx[4]) return 0;
			return 1;
		}

		current_block_type_index_2 = select_block_type_3(ctx);
		if_block3 = if_blocks_2[current_block_type_index_2] = if_block_creators_2[current_block_type_index_2](ctx);

		const block = {
			c: function create() {
				form = element("form");
				label0 = element("label");
				label0.textContent = "Enter Passphrase";
				t1 = space();
				div0 = element("div");
				input0 = element("input");
				t2 = space();
				button0 = element("button");
				if_block0.c();
				t3 = space();
				label1 = element("label");
				label1.textContent = "Confirm Passphrase";
				t5 = space();
				div1 = element("div");
				input1 = element("input");
				t6 = space();
				button1 = element("button");
				if_block1.c();
				t7 = space();
				if_block2.c();
				t8 = space();
				button2 = element("button");
				if_block3.c();
				attr_dev(label0, "for", "passphrase");
				attr_dev(label0, "class", "font-normal mt-6");
				add_location(label0, file$3, 73, 1, 2121);
				attr_dev(input0, "class", "text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0 w-full");
				attr_dev(input0, "type", /*type1*/ ctx[6]);
				attr_dev(input0, "autocomplete", "off");
				attr_dev(input0, "id", "password");
				add_location(input0, file$3, 78, 2, 2297);
				attr_dev(button0, "type", "button");
				attr_dev(button0, "class", "flex justify-center items-center");
				add_location(button0, file$3, 86, 2, 2561);
				attr_dev(div0, "class", "flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack");
				add_location(div0, file$3, 75, 1, 2197);
				attr_dev(label1, "for", "passphrase");
				attr_dev(label1, "class", "font-normal mt-6");
				add_location(label1, file$3, 98, 1, 2775);
				attr_dev(input1, "class", "text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0 w-full");
				attr_dev(input1, "type", /*type2*/ ctx[5]);
				attr_dev(input1, "autocomplete", "off");
				attr_dev(input1, "id", "password");
				add_location(input1, file$3, 103, 2, 2953);
				attr_dev(button1, "type", "button");
				attr_dev(button1, "class", "flex justify-center items-center");
				add_location(button1, file$3, 111, 2, 3224);
				attr_dev(div1, "class", "flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack");
				add_location(div1, file$3, 100, 1, 2853);
				attr_dev(button2, "class", "bg-osvauld-carolinablue py-2 px-10 mt-8 rounded-lg text-osvauld-ninjablack font-medium w-[150px] flex justify-center items-center whitespace-nowrap");
				attr_dev(button2, "type", "submit");
				add_location(button2, file$3, 138, 1, 3772);
				attr_dev(form, "class", "flex flex-col justify-center items-center");
				add_location(form, file$3, 69, 0, 2008);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, form, anchor);
				append_dev(form, label0);
				append_dev(form, t1);
				append_dev(form, div0);
				append_dev(div0, input0);
				append_dev(div0, t2);
				append_dev(div0, button0);
				if_blocks[current_block_type_index].m(button0, null);
				append_dev(form, t3);
				append_dev(form, label1);
				append_dev(form, t5);
				append_dev(form, div1);
				append_dev(div1, input1);
				append_dev(div1, t6);
				append_dev(div1, button1);
				if_blocks_1[current_block_type_index_1].m(button1, null);
				append_dev(form, t7);
				if_block2.m(form, null);
				append_dev(form, t8);
				append_dev(form, button2);
				if_blocks_2[current_block_type_index_2].m(button2, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(input0, "input", /*input_handler*/ ctx[12], false, false, false, false),
						listen_dev(button0, "click", /*click_handler*/ ctx[13], false, false, false, false),
						listen_dev(input1, "input", /*input_handler_1*/ ctx[14], false, false, false, false),
						listen_dev(button1, "click", /*click_handler_1*/ ctx[15], false, false, false, false),
						listen_dev(form, "submit", prevent_default(/*handlePassPhraseSubmit*/ ctx[7]), false, true, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (!current || dirty & /*type1*/ 64) {
					attr_dev(input0, "type", /*type1*/ ctx[6]);
				}

				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index !== previous_block_index) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block0 = if_blocks[current_block_type_index];

					if (!if_block0) {
						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block0.c();
					}

					transition_in(if_block0, 1);
					if_block0.m(button0, null);
				}

				if (!current || dirty & /*type2*/ 32) {
					attr_dev(input1, "type", /*type2*/ ctx[5]);
				}

				let previous_block_index_1 = current_block_type_index_1;
				current_block_type_index_1 = select_block_type_1(ctx);

				if (current_block_type_index_1 !== previous_block_index_1) {
					group_outros();

					transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
						if_blocks_1[previous_block_index_1] = null;
					});

					check_outros();
					if_block1 = if_blocks_1[current_block_type_index_1];

					if (!if_block1) {
						if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
						if_block1.c();
					}

					transition_in(if_block1, 1);
					if_block1.m(button1, null);
				}

				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2.d(1);
					if_block2 = current_block_type(ctx);

					if (if_block2) {
						if_block2.c();
						if_block2.m(form, t8);
					}
				}

				let previous_block_index_2 = current_block_type_index_2;
				current_block_type_index_2 = select_block_type_3(ctx);

				if (current_block_type_index_2 !== previous_block_index_2) {
					group_outros();

					transition_out(if_blocks_2[previous_block_index_2], 1, 1, () => {
						if_blocks_2[previous_block_index_2] = null;
					});

					check_outros();
					if_block3 = if_blocks_2[current_block_type_index_2];

					if (!if_block3) {
						if_block3 = if_blocks_2[current_block_type_index_2] = if_block_creators_2[current_block_type_index_2](ctx);
						if_block3.c();
					}

					transition_in(if_block3, 1);
					if_block3.m(button2, null);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				transition_in(if_block3);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				transition_out(if_block3);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(form);
				}

				if_blocks[current_block_type_index].d();
				if_blocks_1[current_block_type_index_1].d();
				if_block2.d();
				if_blocks_2[current_block_type_index_2].d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$3.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$3($$self, $$props, $$invalidate) {
		let type1;
		let type2;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('SetPassPhrase', slots, []);
		let { challenge } = $$props;
		let { username } = $$props;
		const dispatch = createEventDispatcher();
		let passphrase = "";
		let confirmPassphrase = "";
		let showFirstPassword = false;
		let showSecondPassword = false;
		let showPassphraseMismatchError = false;
		let passphraseEmpty = false;
		let isLoaderActive = false;

		const handlePassPhraseSubmit = async () => {
			if (passphrase.length === 0) {
				$$invalidate(3, passphraseEmpty = true);
				$$invalidate(4, isLoaderActive = false);

				setTimeout(
					() => {
						$$invalidate(3, passphraseEmpty = false);
					},
					1500
				);

				return;
			}

			$$invalidate(4, isLoaderActive = true);

			if (passphrase === confirmPassphrase) {
				const response = await sendMessage("savePassphrase", { passphrase, challenge, username });
				const registrationResponse = await finalRegistration(response.username, response.signature, response.deviceKey, response.encryptionKey);

				if (registrationResponse.success) {
					$$invalidate(4, isLoaderActive = false);
					dispatch("signedUp");
				}
			} else {
				$$invalidate(2, showPassphraseMismatchError = true);
				$$invalidate(4, isLoaderActive = false);

				setTimeout(
					() => {
						$$invalidate(2, showPassphraseMismatchError = false);
					},
					1500
				);
			}
		};

		function onInput(event, type) {
			if (type === "passphrase") passphrase = event.target.value; else confirmPassphrase = event.target.value;
		}

		const togglePassword = identification => {
			identification
			? $$invalidate(0, showFirstPassword = !showFirstPassword)
			: $$invalidate(1, showSecondPassword = !showSecondPassword);
		};

		$$self.$$.on_mount.push(function () {
			if (challenge === undefined && !('challenge' in $$props || $$self.$$.bound[$$self.$$.props['challenge']])) {
				console.warn("<SetPassPhrase> was created without expected prop 'challenge'");
			}

			if (username === undefined && !('username' in $$props || $$self.$$.bound[$$self.$$.props['username']])) {
				console.warn("<SetPassPhrase> was created without expected prop 'username'");
			}
		});

		const writable_props = ['challenge', 'username'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SetPassPhrase> was created with unknown prop '${key}'`);
		});

		const input_handler = e => onInput(e, 'passphrase');
		const click_handler = () => togglePassword(true);
		const input_handler_1 = e => onInput(e, 'confirmPassphrase');
		const click_handler_1 = () => togglePassword(false);

		$$self.$$set = $$props => {
			if ('challenge' in $$props) $$invalidate(10, challenge = $$props.challenge);
			if ('username' in $$props) $$invalidate(11, username = $$props.username);
		};

		$$self.$capture_state = () => ({
			Eye,
			ClosedEye,
			Loader,
			sendMessage,
			createEventDispatcher,
			finalRegistration,
			challenge,
			username,
			dispatch,
			passphrase,
			confirmPassphrase,
			showFirstPassword,
			showSecondPassword,
			showPassphraseMismatchError,
			passphraseEmpty,
			isLoaderActive,
			handlePassPhraseSubmit,
			onInput,
			togglePassword,
			type2,
			type1
		});

		$$self.$inject_state = $$props => {
			if ('challenge' in $$props) $$invalidate(10, challenge = $$props.challenge);
			if ('username' in $$props) $$invalidate(11, username = $$props.username);
			if ('passphrase' in $$props) passphrase = $$props.passphrase;
			if ('confirmPassphrase' in $$props) confirmPassphrase = $$props.confirmPassphrase;
			if ('showFirstPassword' in $$props) $$invalidate(0, showFirstPassword = $$props.showFirstPassword);
			if ('showSecondPassword' in $$props) $$invalidate(1, showSecondPassword = $$props.showSecondPassword);
			if ('showPassphraseMismatchError' in $$props) $$invalidate(2, showPassphraseMismatchError = $$props.showPassphraseMismatchError);
			if ('passphraseEmpty' in $$props) $$invalidate(3, passphraseEmpty = $$props.passphraseEmpty);
			if ('isLoaderActive' in $$props) $$invalidate(4, isLoaderActive = $$props.isLoaderActive);
			if ('type2' in $$props) $$invalidate(5, type2 = $$props.type2);
			if ('type1' in $$props) $$invalidate(6, type1 = $$props.type1);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*showFirstPassword*/ 1) {
				$$invalidate(6, type1 = showFirstPassword ? "text" : "password");
			}

			if ($$self.$$.dirty & /*showSecondPassword*/ 2) {
				$$invalidate(5, type2 = showSecondPassword ? "text" : "password");
			}
		};

		return [
			showFirstPassword,
			showSecondPassword,
			showPassphraseMismatchError,
			passphraseEmpty,
			isLoaderActive,
			type2,
			type1,
			handlePassPhraseSubmit,
			onInput,
			togglePassword,
			challenge,
			username,
			input_handler,
			click_handler,
			input_handler_1,
			click_handler_1
		];
	}

	class SetPassPhrase extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$3, create_fragment$3, safe_not_equal, { challenge: 10, username: 11 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "SetPassPhrase",
				options,
				id: create_fragment$3.name
			});
		}

		get challenge() {
			throw new Error("<SetPassPhrase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set challenge(value) {
			throw new Error("<SetPassPhrase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get username() {
			throw new Error("<SetPassPhrase>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set username(value) {
			throw new Error("<SetPassPhrase>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/popup/ImportPvtKey.svelte generated by Svelte v4.2.19 */
	const file$2 = "src/lib/components/popup/ImportPvtKey.svelte";

	// (62:3) {:else}
	function create_else_block_1(ctx) {
		let eye;
		let current;
		eye = new Eye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(eye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(eye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(eye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(eye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(eye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block_1.name,
			type: "else",
			source: "(62:3) {:else}",
			ctx
		});

		return block;
	}

	// (60:3) {#if showPassword}
	function create_if_block_1$2(ctx) {
		let closedeye;
		let current;
		closedeye = new ClosedEye({ $$inline: true });

		const block = {
			c: function create() {
				create_component(closedeye.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(closedeye, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(closedeye.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(closedeye.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(closedeye, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$2.name,
			type: "if",
			source: "(60:3) {#if showPassword}",
			ctx
		});

		return block;
	}

	// (74:2) {:else}
	function create_else_block$2(ctx) {
		let span;

		const block = {
			c: function create() {
				span = element("span");
				span.textContent = "Submit";
				add_location(span, file$2, 79, 3, 2413);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$2.name,
			type: "else",
			source: "(74:2) {:else}",
			ctx
		});

		return block;
	}

	// (72:2) {#if isLoaderActive}
	function create_if_block$2(ctx) {
		let loader;
		let current;
		loader = new Loader({ $$inline: true });

		const block = {
			c: function create() {
				create_component(loader.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(loader, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(loader.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(loader.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(loader, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$2.name,
			type: "if",
			source: "(72:2) {#if isLoaderActive}",
			ctx
		});

		return block;
	}

	function create_fragment$2(ctx) {
		let div2;
		let div0;
		let h3;
		let t1;
		let label0;
		let t3;
		let textarea;
		let t4;
		let label1;
		let t6;
		let div1;
		let input;
		let input_type_value;
		let t7;
		let button0;
		let current_block_type_index;
		let if_block0;
		let t8;
		let button1;
		let current_block_type_index_1;
		let if_block1;
		let current;
		let mounted;
		let dispose;
		const if_block_creators = [create_if_block_1$2, create_else_block_1];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*showPassword*/ ctx[0]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		const if_block_creators_1 = [create_if_block$2, create_else_block$2];
		const if_blocks_1 = [];

		function select_block_type_1(ctx, dirty) {
			if (/*isLoaderActive*/ ctx[1]) return 0;
			return 1;
		}

		current_block_type_index_1 = select_block_type_1(ctx);
		if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

		const block = {
			c: function create() {
				div2 = element("div");
				div0 = element("div");
				h3 = element("h3");
				h3.textContent = "Account Recovery";
				t1 = space();
				label0 = element("label");
				label0.textContent = "Enter Recovery string";
				t3 = space();
				textarea = element("textarea");
				t4 = space();
				label1 = element("label");
				label1.textContent = "Enter Passphrase";
				t6 = space();
				div1 = element("div");
				input = element("input");
				t7 = space();
				button0 = element("button");
				if_block0.c();
				t8 = space();
				button1 = element("button");
				if_block1.c();
				attr_dev(h3, "class", "font-medium text-3xl mb-6 text-osvauld-ownerText");
				add_location(h3, file$2, 35, 2, 847);
				add_location(div0, file$2, 34, 1, 839);
				attr_dev(label0, "for", "privateKey");
				attr_dev(label0, "class", "font-normal mt-6 mb-2");
				add_location(label0, file$2, 39, 1, 946);
				attr_dev(textarea, "class", "text-osvauld-quarzowhite bg-osvauld-frameblack border border-osvauld-iconblack tracking-wider font-light text-sm font-mono focus:border-osvauld-iconblack focus:ring-0 resize-none w-[300px] min-h-[6rem] max-h-[10rem] rounded-lg scrollbar-thin overflow-y-scroll");
				attr_dev(textarea, "id", "privateKey");
				add_location(textarea, file$2, 42, 1, 1036);
				attr_dev(label1, "for", "passphrase");
				attr_dev(label1, "class", "font-normal mt-6 mb-2");
				add_location(label1, file$2, 48, 1, 1407);
				attr_dev(input, "class", "text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-osvauld-iconblack focus:ring-0 active:outline-none focus:ring-offset-0");
				attr_dev(input, "type", input_type_value = /*showPassword*/ ctx[0] ? 'text' : 'password');
				attr_dev(input, "id", "passphrase");
				add_location(input, file$2, 52, 2, 1621);
				attr_dev(button0, "type", "button");
				attr_dev(button0, "class", "flex justify-center items-center");
				add_location(button0, file$2, 59, 2, 1943);
				attr_dev(div1, "class", "flex justify-between items-center bg-osvauld-frameblack px-3 border rounded-lg border-osvauld-iconblack w-[300px]");
				add_location(div1, file$2, 49, 1, 1487);
				attr_dev(button1, "class", "bg-osvauld-carolinablue py-2 px-10 mt-8 rounded-lg text-osvauld-ninjablack font-medium w-[150px] flex justify-center items-center whitespace-nowrap");
				attr_dev(button1, "type", "button");
				add_location(button1, file$2, 71, 1, 2150);
				attr_dev(div2, "class", "flex flex-col justify-center items-center text-osvauld-sheffieldgrey");
				add_location(div2, file$2, 31, 0, 753);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div2, anchor);
				append_dev(div2, div0);
				append_dev(div0, h3);
				append_dev(div2, t1);
				append_dev(div2, label0);
				append_dev(div2, t3);
				append_dev(div2, textarea);
				append_dev(div2, t4);
				append_dev(div2, label1);
				append_dev(div2, t6);
				append_dev(div2, div1);
				append_dev(div1, input);
				append_dev(div1, t7);
				append_dev(div1, button0);
				if_blocks[current_block_type_index].m(button0, null);
				append_dev(div2, t8);
				append_dev(div2, button1);
				if_blocks_1[current_block_type_index_1].m(button1, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(textarea, "input", /*input_handler*/ ctx[5], false, false, false, false),
						listen_dev(input, "input", /*input_handler_1*/ ctx[6], false, false, false, false),
						listen_dev(button0, "click", /*togglePasswordVisibility*/ ctx[2], false, false, false, false),
						listen_dev(button1, "click", /*handleSubmit*/ ctx[4], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (!current || dirty & /*showPassword*/ 1 && input_type_value !== (input_type_value = /*showPassword*/ ctx[0] ? 'text' : 'password')) {
					attr_dev(input, "type", input_type_value);
				}

				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index !== previous_block_index) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block0 = if_blocks[current_block_type_index];

					if (!if_block0) {
						if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block0.c();
					}

					transition_in(if_block0, 1);
					if_block0.m(button0, null);
				}

				let previous_block_index_1 = current_block_type_index_1;
				current_block_type_index_1 = select_block_type_1(ctx);

				if (current_block_type_index_1 !== previous_block_index_1) {
					group_outros();

					transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
						if_blocks_1[previous_block_index_1] = null;
					});

					check_outros();
					if_block1 = if_blocks_1[current_block_type_index_1];

					if (!if_block1) {
						if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
						if_block1.c();
					}

					transition_in(if_block1, 1);
					if_block1.m(button1, null);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div2);
				}

				if_blocks[current_block_type_index].d();
				if_blocks_1[current_block_type_index_1].d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$2.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$2($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ImportPvtKey', slots, []);
		const dispatch = createEventDispatcher();
		let privateKeys = "";
		let passphrase = "";
		let showPassword = false;
		let isLoaderActive = false;

		function togglePasswordVisibility() {
			$$invalidate(0, showPassword = !showPassword);
		}

		function handleInputChange(event, field) {
			if (field === "privateKey") {
				privateKeys = event.target.value;
			} else if (field === "passphrase") {
				passphrase = event.target.value;
			}
		}

		function handleSubmit() {
			$$invalidate(1, isLoaderActive = true);
			dispatch("submit", { privateKeys, passphrase });
		}

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ImportPvtKey> was created with unknown prop '${key}'`);
		});

		const input_handler = e => handleInputChange(e, 'privateKey');
		const input_handler_1 = e => handleInputChange(e, 'passphrase');

		$$self.$capture_state = () => ({
			Eye,
			Loader,
			ClosedEye,
			createEventDispatcher,
			dispatch,
			privateKeys,
			passphrase,
			showPassword,
			isLoaderActive,
			togglePasswordVisibility,
			handleInputChange,
			handleSubmit
		});

		$$self.$inject_state = $$props => {
			if ('privateKeys' in $$props) privateKeys = $$props.privateKeys;
			if ('passphrase' in $$props) passphrase = $$props.passphrase;
			if ('showPassword' in $$props) $$invalidate(0, showPassword = $$props.showPassword);
			if ('isLoaderActive' in $$props) $$invalidate(1, isLoaderActive = $$props.isLoaderActive);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			showPassword,
			isLoaderActive,
			togglePasswordVisibility,
			handleInputChange,
			handleSubmit,
			input_handler,
			input_handler_1
		];
	}

	class ImportPvtKey extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "ImportPvtKey",
				options,
				id: create_fragment$2.name
			});
		}
	}

	/* src/lib/components/popup/Signup.svelte generated by Svelte v4.2.19 */
	const file$1 = "src/lib/components/popup/Signup.svelte";

	// (39:1) {:else}
	function create_else_block$1(ctx) {
		let templogin;
		let current;
		templogin = new TempLogin({ $$inline: true });
		templogin.$on("setPassPhrase", /*handleTempLogin*/ ctx[4]);
		templogin.$on("recovery", /*handleRecovery*/ ctx[5]);

		const block = {
			c: function create() {
				create_component(templogin.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(templogin, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(templogin.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(templogin.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(templogin, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block$1.name,
			type: "else",
			source: "(39:1) {:else}",
			ctx
		});

		return block;
	}

	// (37:31) 
	function create_if_block_1$1(ctx) {
		let setpassphrase;
		let current;

		setpassphrase = new SetPassPhrase({
				props: {
					challenge: /*challenge*/ ctx[1],
					username: /*username*/ ctx[2]
				},
				$$inline: true
			});

		setpassphrase.$on("signedUp", /*handleSignedUp*/ ctx[7]);

		const block = {
			c: function create() {
				create_component(setpassphrase.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(setpassphrase, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const setpassphrase_changes = {};
				if (dirty & /*challenge*/ 2) setpassphrase_changes.challenge = /*challenge*/ ctx[1];
				if (dirty & /*username*/ 4) setpassphrase_changes.username = /*username*/ ctx[2];
				setpassphrase.$set(setpassphrase_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(setpassphrase.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(setpassphrase.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(setpassphrase, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$1.name,
			type: "if",
			source: "(37:31) ",
			ctx
		});

		return block;
	}

	// (35:1) {#if importPvtKeyFlag}
	function create_if_block$1(ctx) {
		let importpvtkey;
		let current;
		importpvtkey = new ImportPvtKey({ $$inline: true });
		importpvtkey.$on("submit", /*submit_handler*/ ctx[8]);

		const block = {
			c: function create() {
				create_component(importpvtkey.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(importpvtkey, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(importpvtkey.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(importpvtkey.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(importpvtkey, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$1.name,
			type: "if",
			source: "(35:1) {#if importPvtKeyFlag}",
			ctx
		});

		return block;
	}

	function create_fragment$1(ctx) {
		let div;
		let current_block_type_index;
		let if_block;
		let current;
		const if_block_creators = [create_if_block$1, create_if_block_1$1, create_else_block$1];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*importPvtKeyFlag*/ ctx[3]) return 0;
			if (/*isTempLoginVerified*/ ctx[0]) return 1;
			return 2;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				div = element("div");
				if_block.c();
				attr_dev(div, "class", "h-full w-[90%] flex justify-center items-center text-base font-bold text-white");
				add_location(div, file$1, 37, 0, 884);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				if_blocks[current_block_type_index].m(div, null);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if_blocks[current_block_type_index].d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$1.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$1($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Signup', slots, []);
		let isTempLoginVerified = false;
		let challenge = "";
		let username = "";
		let importPvtKeyFlag = false;
		const dispatch = createEventDispatcher();

		const handleTempLogin = e => {
			$$invalidate(1, challenge = e.detail.challenge);
			$$invalidate(2, username = e.detail.username);
			$$invalidate(0, isTempLoginVerified = true);
		};

		const handleRecovery = e => {
			$$invalidate(3, importPvtKeyFlag = e.detail);
		};

		const importPvtKey = async e => {
			const { privateKeys, passphrase } = e.detail;
			await sendMessage("importPvtKey", { passphrase, privateKeys });
			handleSignedUp();
		};

		const handleSignedUp = () => {
			dispatch("signedUp");
		};

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Signup> was created with unknown prop '${key}'`);
		});

		const submit_handler = e => importPvtKey(e);

		$$self.$capture_state = () => ({
			TempLogin,
			SetPassPhrase,
			ImportPvtKey,
			sendMessage,
			createEventDispatcher,
			isTempLoginVerified,
			challenge,
			username,
			importPvtKeyFlag,
			dispatch,
			handleTempLogin,
			handleRecovery,
			importPvtKey,
			handleSignedUp
		});

		$$self.$inject_state = $$props => {
			if ('isTempLoginVerified' in $$props) $$invalidate(0, isTempLoginVerified = $$props.isTempLoginVerified);
			if ('challenge' in $$props) $$invalidate(1, challenge = $$props.challenge);
			if ('username' in $$props) $$invalidate(2, username = $$props.username);
			if ('importPvtKeyFlag' in $$props) $$invalidate(3, importPvtKeyFlag = $$props.importPvtKeyFlag);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			isTempLoginVerified,
			challenge,
			username,
			importPvtKeyFlag,
			handleTempLogin,
			handleRecovery,
			importPvtKey,
			handleSignedUp,
			submit_handler
		];
	}

	class Signup extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Signup",
				options,
				id: create_fragment$1.name
			});
		}
	}

	/* src/lib/Popup.svelte generated by Svelte v4.2.19 */
	const file = "src/lib/Popup.svelte";

	// (43:2) {:else}
	function create_else_block(ctx) {
		let div;
		let logo;
		let t;
		let welcome;
		let current;
		logo = new Logo({ $$inline: true });
		welcome = new Welcome({ $$inline: true });
		welcome.$on("authenticated", /*checkAuth*/ ctx[3]);

		const block = {
			c: function create() {
				div = element("div");
				create_component(logo.$$.fragment);
				t = space();
				create_component(welcome.$$.fragment);
				attr_dev(div, "class", "mb-12 flex justify-center items-center");
				add_location(div, file, 45, 3, 1265);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(logo, div, null);
				insert_dev(target, t, anchor);
				mount_component(welcome, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(logo.$$.fragment, local);
				transition_in(welcome.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(logo.$$.fragment, local);
				transition_out(welcome.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
					detach_dev(t);
				}

				destroy_component(logo);
				destroy_component(welcome, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(43:2) {:else}",
			ctx
		});

		return block;
	}

	// (41:21) 
	function create_if_block_2(ctx) {
		let home;
		let current;
		home = new Home({ $$inline: true });

		const block = {
			c: function create() {
				create_component(home.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(home, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(home.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(home.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(home, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2.name,
			type: "if",
			source: "(41:21) ",
			ctx
		});

		return block;
	}

	// (39:24) 
	function create_if_block_1(ctx) {
		let signup;
		let current;
		signup = new Signup({ $$inline: true });
		signup.$on("signedUp", /*signedUp_handler*/ ctx[4]);

		const block = {
			c: function create() {
				create_component(signup.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(signup, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(signup.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(signup.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(signup, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(39:24) ",
			ctx
		});

		return block;
	}

	// (37:2) {#if isLoaderActive}
	function create_if_block(ctx) {
		let loader;
		let current;
		loader = new Loader({ $$inline: true });

		const block = {
			c: function create() {
				create_component(loader.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(loader, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(loader.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(loader.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(loader, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(37:2) {#if isLoaderActive}",
			ctx
		});

		return block;
	}

	function create_fragment(ctx) {
		let main;
		let div;
		let current_block_type_index;
		let if_block;
		let div_class_value;
		let current;
		const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2, create_else_block];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*isLoaderActive*/ ctx[1]) return 0;
			if (!/*isSignedUp*/ ctx[2]) return 1;
			if (/*loggedIn*/ ctx[0]) return 2;
			return 3;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				main = element("main");
				div = element("div");
				if_block.c();

				attr_dev(div, "class", div_class_value = "w-[22.5rem] h-[36.78rem] p-2 pt-3 flex flex-col !font-sans " + (/*isSignedUp*/ ctx[2] && !/*loggedIn*/ ctx[0]
				? 'justify-center'
				: 'justify-start') + " items-center bg-osvauld-frameblack");

				add_location(div, file, 32, 1, 917);
				add_location(main, file, 31, 0, 909);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, main, anchor);
				append_dev(main, div);
				if_blocks[current_block_type_index].m(div, null);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(div, null);
				}

				if (!current || dirty & /*isSignedUp, loggedIn*/ 5 && div_class_value !== (div_class_value = "w-[22.5rem] h-[36.78rem] p-2 pt-3 flex flex-col !font-sans " + (/*isSignedUp*/ ctx[2] && !/*loggedIn*/ ctx[0]
				? 'justify-center'
				: 'justify-start') + " items-center bg-osvauld-frameblack")) {
					attr_dev(div, "class", div_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(main);
				}

				if_blocks[current_block_type_index].d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Popup', slots, []);
		let loggedIn = true;
		let isLoaderActive = false;
		let isSignedUp = false;

		onMount(async () => {
			$$invalidate(1, isLoaderActive = true);
			const response = await sendMessage("isSignedUp");
			$$invalidate(2, isSignedUp = response.isSignedUp);
			const checkPvtLoad = await sendMessage("checkPvtLoaded");

			if (checkPvtLoad) {
				$$invalidate(0, loggedIn = true);
			} else {
				$$invalidate(0, loggedIn = false);
			}

			$$invalidate(1, isLoaderActive = false);
		}); // isSignedUp.set(false);

		const checkAuth = event => {
			$$invalidate(0, loggedIn = event.detail);
		};

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Popup> was created with unknown prop '${key}'`);
		});

		const signedUp_handler = () => $$invalidate(2, isSignedUp = true);

		$$self.$capture_state = () => ({
			onMount,
			Welcome,
			Home,
			Logo,
			Signup,
			Loader,
			sendMessage,
			loggedIn,
			isLoaderActive,
			isSignedUp,
			checkAuth
		});

		$$self.$inject_state = $$props => {
			if ('loggedIn' in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
			if ('isLoaderActive' in $$props) $$invalidate(1, isLoaderActive = $$props.isLoaderActive);
			if ('isSignedUp' in $$props) $$invalidate(2, isSignedUp = $$props.isSignedUp);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [loggedIn, isLoaderActive, isSignedUp, checkAuth, signedUp_handler];
	}

	class Popup extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Popup",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new Popup({
	    target: document.body,
	});

	return app;

})();
//# sourceMappingURL=popup.js.map
