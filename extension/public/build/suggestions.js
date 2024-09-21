var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

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

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
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
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
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

	/** @returns {void} */
	function add_flush_callback(fn) {
		flush_callbacks.push(fn);
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

	/** @returns {void} */
	function bind(component, name, callback) {
		const index = component.$$.props[name];
		if (index !== undefined) {
			component.$$.bound[index] = callback;
			callback(component.$$.ctx[index]);
		}
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

	/* src/lib/components/content/components/SuccessView.svelte generated by Svelte v4.2.19 */
	const file$5 = "src/lib/components/content/components/SuccessView.svelte";

	function create_fragment$5(ctx) {
		let div;
		let t_value = (/*isSuccess*/ ctx[0] ? "Success!" : "failure") + "";
		let t;

		const block = {
			c: function create() {
				div = element("div");
				t = text(t_value);
				attr_dev(div, "class", "flex justify-center items-center w-full h-[160px] bg-osvauld-frameblack text-osvauld-quarzowhite text-lg font-light");
				add_location(div, file$5, 17, 0, 270);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, t);
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*isSuccess*/ 1 && t_value !== (t_value = (/*isSuccess*/ ctx[0] ? "Success!" : "failure") + "")) set_data_dev(t, t_value);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
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
		validate_slots('SuccessView', slots, []);
		let { iframeCustomEvent } = $$props;
		let { isSuccess = true } = $$props;

		onMount(() => {
			setTimeout(
				() => {
					iframeCustomEvent.source.postMessage({ unmount: true }, iframeCustomEvent.origin);
				},
				1000
			);
		});

		$$self.$$.on_mount.push(function () {
			if (iframeCustomEvent === undefined && !('iframeCustomEvent' in $$props || $$self.$$.bound[$$self.$$.props['iframeCustomEvent']])) {
				console.warn("<SuccessView> was created without expected prop 'iframeCustomEvent'");
			}
		});

		const writable_props = ['iframeCustomEvent', 'isSuccess'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SuccessView> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('iframeCustomEvent' in $$props) $$invalidate(1, iframeCustomEvent = $$props.iframeCustomEvent);
			if ('isSuccess' in $$props) $$invalidate(0, isSuccess = $$props.isSuccess);
		};

		$$self.$capture_state = () => ({ onMount, iframeCustomEvent, isSuccess });

		$$self.$inject_state = $$props => {
			if ('iframeCustomEvent' in $$props) $$invalidate(1, iframeCustomEvent = $$props.iframeCustomEvent);
			if ('isSuccess' in $$props) $$invalidate(0, isSuccess = $$props.isSuccess);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [isSuccess, iframeCustomEvent];
	}

	class SuccessView extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$5, create_fragment$5, safe_not_equal, { iframeCustomEvent: 1, isSuccess: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "SuccessView",
				options,
				id: create_fragment$5.name
			});
		}

		get iframeCustomEvent() {
			throw new Error("<SuccessView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set iframeCustomEvent(value) {
			throw new Error("<SuccessView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get isSuccess() {
			throw new Error("<SuccessView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set isSuccess(value) {
			throw new Error("<SuccessView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/basic/ListToggle.svelte generated by Svelte v4.2.19 */
	const file$4 = "src/lib/components/basic/ListToggle.svelte";

	function create_fragment$4(ctx) {
		let div;
		let button;
		let span0;
		let t1;
		let span1;
		let button_aria_labelledby_value;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				div = element("div");
				button = element("button");
				span0 = element("span");
				span0.textContent = "Grid";
				t1 = space();
				span1 = element("span");
				span1.textContent = "List";
				attr_dev(span0, "class", "svelte-1hhsgxf");
				add_location(span0, file$4, 56, 2, 1209);
				attr_dev(span1, "class", "svelte-1hhsgxf");
				add_location(span1, file$4, 57, 2, 1229);
				attr_dev(button, "role", "switch");
				attr_dev(button, "aria-checked", /*checked*/ ctx[0]);
				attr_dev(button, "aria-labelledby", button_aria_labelledby_value = `switch-${/*uniqueID*/ ctx[1]}`);
				attr_dev(button, "class", "svelte-1hhsgxf");
				add_location(button, file$4, 50, 1, 1083);
				attr_dev(div, "class", "s s--inner svelte-1hhsgxf");
				add_location(div, file$4, 49, 0, 1057);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, button);
				append_dev(button, span0);
				append_dev(button, t1);
				append_dev(button, span1);

				if (!mounted) {
					dispose = listen_dev(button, "click", /*handleClick*/ ctx[2], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*checked*/ 1) {
					attr_dev(button, "aria-checked", /*checked*/ ctx[0]);
				}

				if (dirty & /*uniqueID*/ 2 && button_aria_labelledby_value !== (button_aria_labelledby_value = `switch-${/*uniqueID*/ ctx[1]}`)) {
					attr_dev(button, "aria-labelledby", button_aria_labelledby_value);
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				mounted = false;
				dispose();
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
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ListToggle', slots, []);
		let { value = "Grid" } = $$props;
		let checked = true;
		let uniqueID;

		function handleClick(event) {
			const target = event.target;
			const state = target.getAttribute("aria-checked");
			$$invalidate(0, checked = state === "true" ? false : true);
			$$invalidate(3, value = checked === true ? "Grid" : "List");
		}

		onMount(() => {
			$$invalidate(1, uniqueID = Math.floor(Math.random() * 100));
		});

		const writable_props = ['value'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ListToggle> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('value' in $$props) $$invalidate(3, value = $$props.value);
		};

		$$self.$capture_state = () => ({
			onMount,
			value,
			checked,
			uniqueID,
			handleClick
		});

		$$self.$inject_state = $$props => {
			if ('value' in $$props) $$invalidate(3, value = $$props.value);
			if ('checked' in $$props) $$invalidate(0, checked = $$props.checked);
			if ('uniqueID' in $$props) $$invalidate(1, uniqueID = $$props.uniqueID);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [checked, uniqueID, handleClick, value];
	}

	class ListToggle extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$4, create_fragment$4, safe_not_equal, { value: 3 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "ListToggle",
				options,
				id: create_fragment$4.name
			});
		}

		get value() {
			throw new Error("<ListToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set value(value) {
			throw new Error("<ListToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/basic/icons/folderIcon.svelte generated by Svelte v4.2.19 */
	const file$3 = "src/lib/components/basic/icons/folderIcon.svelte";

	function create_fragment$3(ctx) {
		let svg;
		let path;
		let path_fill_value;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "d", "M19.25 21H4.75C3.235 21 2 19.765 2 18.25V5.75C2 4.235 3.235 3 4.75 3H9.56L12.06 5.5H19.25C20.765 5.5 22 6.735 22 8.25V18.25C22 19.765 20.765 21 19.25 21ZM4.75 4.5C4.06 4.5 3.5 5.06 3.5 5.75V18.25C3.5 18.94 4.06 19.5 4.75 19.5H19.25C19.94 19.5 20.5 18.94 20.5 18.25V8.25C20.5 7.56 19.94 7 19.25 7H11.44L8.94 4.5H4.75Z");
				attr_dev(path, "fill", path_fill_value = /*color*/ ctx[0] || '#85889C');
				add_location(path, file$3, 11, 1, 142);
				attr_dev(svg, "width", "20");
				attr_dev(svg, "height", "20");
				attr_dev(svg, "viewBox", "0 0 24 24");
				attr_dev(svg, "fill", "none");
				attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
				add_location(svg, file$3, 4, 0, 39);
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
			id: create_fragment$3.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$3($$self, $$props, $$invalidate) {
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
			init(this, options, instance$3, create_fragment$3, safe_not_equal, { color: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "FolderIcon",
				options,
				id: create_fragment$3.name
			});
		}

		get color() {
			throw new Error("<FolderIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set color(value) {
			throw new Error("<FolderIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/content/components/FolderView.svelte generated by Svelte v4.2.19 */
	const file$2 = "src/lib/components/content/components/FolderView.svelte";

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[10] = list[i];
		return child_ctx;
	}

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[10] = list[i];
		return child_ctx;
	}

	// (61:33) 
	function create_if_block_2(ctx) {
		let ul;
		let current;
		let each_value_1 = ensure_array_like_dev(/*folders*/ ctx[1]);
		let each_blocks = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				ul = element("ul");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(ul, "class", "grid grid-cols-1 max-h-[160px] pb-4 overflow-y-scroll scrollbar-thin");
				add_location(ul, file$2, 73, 2, 1788);
			},
			m: function mount(target, anchor) {
				insert_dev(target, ul, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(ul, null);
					}
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*successAnimation, folders*/ 10) {
					each_value_1 = ensure_array_like_dev(/*folders*/ ctx[1]);
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
							each_blocks[i].m(ul, null);
						}
					}

					group_outros();

					for (i = each_value_1.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value_1.length; i += 1) {
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
					detach_dev(ul);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2.name,
			type: "if",
			source: "(61:33) ",
			ctx
		});

		return block;
	}

	// (44:33) 
	function create_if_block_1$1(ctx) {
		let div;
		let current;
		let each_value = ensure_array_like_dev(/*folders*/ ctx[1]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				div = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(div, "class", "grid grid-cols-2 max-h-[160px] pb-4 overflow-y-scroll scrollbar-thin");
				add_location(div, file$2, 56, 2, 1247);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div, null);
					}
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*successAnimation, folders*/ 10) {
					each_value = ensure_array_like_dev(/*folders*/ ctx[1]);
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
							each_blocks[i].m(div, null);
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
					detach_dev(div);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$1.name,
			type: "if",
			source: "(44:33) ",
			ctx
		});

		return block;
	}

	// (38:1) {#if loading}
	function create_if_block$1(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				div.textContent = "Saving....";
				attr_dev(div, "class", "w-full h-full text-white text-xl flex justify-center items-center");
				add_location(div, file$2, 50, 2, 1102);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$1.name,
			type: "if",
			source: "(38:1) {#if loading}",
			ctx
		});

		return block;
	}

	// (65:3) {#each folders as folder}
	function create_each_block_1(ctx) {
		let button;
		let foldericon;
		let t0;
		let span;
		let t1_value = /*folder*/ ctx[10].name + "";
		let t1;
		let t2;
		let current;
		let mounted;
		let dispose;

		foldericon = new FolderIcon({
				props: { color: '#F2F2F0' },
				$$inline: true
			});

		function click_handler_1() {
			return /*click_handler_1*/ ctx[9](/*folder*/ ctx[10]);
		}

		const block = {
			c: function create() {
				button = element("button");
				create_component(foldericon.$$.fragment);
				t0 = space();
				span = element("span");
				t1 = text(t1_value);
				t2 = space();
				attr_dev(span, "class", "py-2 text-sm max-w-[90%] overflow-hidden whitespace-nowrap text-ellipsis");
				add_location(span, file$2, 82, 5, 2130);
				attr_dev(button, "class", "flex gap-2 w-full justify-start overflow-x-hidden items-center hover:bg-osvauld-fieldActive pl-3");
				add_location(button, file$2, 77, 4, 1909);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);
				mount_component(foldericon, button, null);
				append_dev(button, t0);
				append_dev(button, span);
				append_dev(span, t1);
				append_dev(button, t2);
				current = true;

				if (!mounted) {
					dispose = listen_dev(button, "click", click_handler_1, false, false, false, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if ((!current || dirty & /*folders*/ 2) && t1_value !== (t1_value = /*folder*/ ctx[10].name + "")) set_data_dev(t1, t1_value);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(foldericon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(foldericon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(button);
				}

				destroy_component(foldericon);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1.name,
			type: "each",
			source: "(65:3) {#each folders as folder}",
			ctx
		});

		return block;
	}

	// (48:3) {#each folders as folder}
	function create_each_block(ctx) {
		let button;
		let foldericon;
		let t0;
		let span;
		let t1_value = /*folder*/ ctx[10].name + "";
		let t1;
		let t2;
		let current;
		let mounted;
		let dispose;

		foldericon = new FolderIcon({
				props: { color: '#F2F2F0' },
				$$inline: true
			});

		function click_handler() {
			return /*click_handler*/ ctx[8](/*folder*/ ctx[10]);
		}

		const block = {
			c: function create() {
				button = element("button");
				create_component(foldericon.$$.fragment);
				t0 = space();
				span = element("span");
				t1 = text(t1_value);
				t2 = space();
				attr_dev(span, "class", "py-2 text-sm max-w-[80%] overflow-hidden whitespace-nowrap text-ellipsis");
				add_location(span, file$2, 65, 5, 1591);
				attr_dev(button, "class", "flex gap-2 w-full overflow-x-hidden justify-start items-center hover:bg-osvauld-fieldActive pl-3");
				add_location(button, file$2, 60, 4, 1369);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);
				mount_component(foldericon, button, null);
				append_dev(button, t0);
				append_dev(button, span);
				append_dev(span, t1);
				append_dev(button, t2);
				current = true;

				if (!mounted) {
					dispose = listen_dev(button, "click", click_handler, false, false, false, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if ((!current || dirty & /*folders*/ 2) && t1_value !== (t1_value = /*folder*/ ctx[10].name + "")) set_data_dev(t1, t1_value);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(foldericon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(foldericon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(button);
				}

				destroy_component(foldericon);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(48:3) {#each folders as folder}",
			ctx
		});

		return block;
	}

	function create_fragment$2(ctx) {
		let div;
		let span;
		let listtoggle;
		let updating_value;
		let t;
		let current_block_type_index;
		let if_block;
		let current;

		function listtoggle_value_binding(value) {
			/*listtoggle_value_binding*/ ctx[7](value);
		}

		let listtoggle_props = {};

		if (/*gridDisplay*/ ctx[0] !== void 0) {
			listtoggle_props.value = /*gridDisplay*/ ctx[0];
		}

		listtoggle = new ListToggle({ props: listtoggle_props, $$inline: true });
		binding_callbacks.push(() => bind(listtoggle, 'value', listtoggle_value_binding));
		const if_block_creators = [create_if_block$1, create_if_block_1$1, create_if_block_2];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*loading*/ ctx[2]) return 0;
			if (/*gridDisplay*/ ctx[0] == "Grid") return 1;
			if (/*gridDisplay*/ ctx[0] == "List") return 2;
			return -1;
		}

		if (~(current_block_type_index = select_block_type(ctx))) {
			if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		}

		const block = {
			c: function create() {
				div = element("div");
				span = element("span");
				create_component(listtoggle.$$.fragment);
				t = space();
				if (if_block) if_block.c();
				attr_dev(span, "class", "absolute -top-9 right-2");
				add_location(span, file$2, 45, 1, 992);
				attr_dev(div, "class", "w-full h-[80%] py-3 relative");
				add_location(div, file$2, 44, 0, 948);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, span);
				mount_component(listtoggle, span, null);
				append_dev(div, t);

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].m(div, null);
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				const listtoggle_changes = {};

				if (!updating_value && dirty & /*gridDisplay*/ 1) {
					updating_value = true;
					listtoggle_changes.value = /*gridDisplay*/ ctx[0];
					add_flush_callback(() => updating_value = false);
				}

				listtoggle.$set(listtoggle_changes);
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if (~current_block_type_index) {
						if_blocks[current_block_type_index].p(ctx, dirty);
					}
				} else {
					if (if_block) {
						group_outros();

						transition_out(if_blocks[previous_block_index], 1, 1, () => {
							if_blocks[previous_block_index] = null;
						});

						check_outros();
					}

					if (~current_block_type_index) {
						if_block = if_blocks[current_block_type_index];

						if (!if_block) {
							if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
							if_block.c();
						} else {
							if_block.p(ctx, dirty);
						}

						transition_in(if_block, 1);
						if_block.m(div, null);
					} else {
						if_block = null;
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(listtoggle.$$.fragment, local);
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(listtoggle.$$.fragment, local);
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_component(listtoggle);

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].d();
				}
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
		validate_slots('FolderView', slots, []);
		let { triggerSuccess = false } = $$props;
		let { iframeCustomEvent } = $$props;
		let { isSuccess } = $$props;
		let gridDisplay;
		let folders;
		let loading = false;

		const successAnimation = id => {
			iframeCustomEvent.source.postMessage(
				{
					save: true,
					folderId: id,
					username: iframeCustomEvent.data.username,
					password: iframeCustomEvent.data.password,
					domain: iframeCustomEvent.data.domain
				},
				iframeCustomEvent.origin
			);

			$$invalidate(2, loading = true);

			window.addEventListener("message", event => {
				if (event.data.id !== "osvauld") {
					return;
				}

				if (event.data.confirmation) {
					$$invalidate(5, isSuccess = event.data.success);
					$$invalidate(4, triggerSuccess = true);
				}
			});
		};

		$$self.$$.on_mount.push(function () {
			if (iframeCustomEvent === undefined && !('iframeCustomEvent' in $$props || $$self.$$.bound[$$self.$$.props['iframeCustomEvent']])) {
				console.warn("<FolderView> was created without expected prop 'iframeCustomEvent'");
			}

			if (isSuccess === undefined && !('isSuccess' in $$props || $$self.$$.bound[$$self.$$.props['isSuccess']])) {
				console.warn("<FolderView> was created without expected prop 'isSuccess'");
			}
		});

		const writable_props = ['triggerSuccess', 'iframeCustomEvent', 'isSuccess'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FolderView> was created with unknown prop '${key}'`);
		});

		function listtoggle_value_binding(value) {
			gridDisplay = value;
			$$invalidate(0, gridDisplay);
		}

		const click_handler = folder => successAnimation(folder.id);
		const click_handler_1 = folder => successAnimation(folder.id);

		$$self.$$set = $$props => {
			if ('triggerSuccess' in $$props) $$invalidate(4, triggerSuccess = $$props.triggerSuccess);
			if ('iframeCustomEvent' in $$props) $$invalidate(6, iframeCustomEvent = $$props.iframeCustomEvent);
			if ('isSuccess' in $$props) $$invalidate(5, isSuccess = $$props.isSuccess);
		};

		$$self.$capture_state = () => ({
			ListToggle,
			FolderIcon,
			triggerSuccess,
			iframeCustomEvent,
			isSuccess,
			gridDisplay,
			folders,
			loading,
			successAnimation
		});

		$$self.$inject_state = $$props => {
			if ('triggerSuccess' in $$props) $$invalidate(4, triggerSuccess = $$props.triggerSuccess);
			if ('iframeCustomEvent' in $$props) $$invalidate(6, iframeCustomEvent = $$props.iframeCustomEvent);
			if ('isSuccess' in $$props) $$invalidate(5, isSuccess = $$props.isSuccess);
			if ('gridDisplay' in $$props) $$invalidate(0, gridDisplay = $$props.gridDisplay);
			if ('folders' in $$props) $$invalidate(1, folders = $$props.folders);
			if ('loading' in $$props) $$invalidate(2, loading = $$props.loading);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*iframeCustomEvent*/ 64) {
				if (iframeCustomEvent) {
					$$invalidate(1, folders = iframeCustomEvent.data.folders);
				}
			}
		};

		return [
			gridDisplay,
			folders,
			loading,
			successAnimation,
			triggerSuccess,
			isSuccess,
			iframeCustomEvent,
			listtoggle_value_binding,
			click_handler,
			click_handler_1
		];
	}

	class FolderView extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$2, create_fragment$2, safe_not_equal, {
				triggerSuccess: 4,
				iframeCustomEvent: 6,
				isSuccess: 5
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "FolderView",
				options,
				id: create_fragment$2.name
			});
		}

		get triggerSuccess() {
			throw new Error("<FolderView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set triggerSuccess(value) {
			throw new Error("<FolderView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get iframeCustomEvent() {
			throw new Error("<FolderView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set iframeCustomEvent(value) {
			throw new Error("<FolderView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get isSuccess() {
			throw new Error("<FolderView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set isSuccess(value) {
			throw new Error("<FolderView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/components/content/components/SuggestionView.svelte generated by Svelte v4.2.19 */
	const file$1 = "src/lib/components/content/components/SuggestionView.svelte";

	function create_fragment$1(ctx) {
		let p0;
		let t1;
		let span0;
		let t2;
		let p1;
		let t3;
		let t4;
		let span1;
		let t5;
		let p2;
		let t7;
		let div;
		let button0;
		let t9;
		let button1;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				p0 = element("p");
				p0.textContent = "Would you like to add this credential to osvauld?";
				t1 = space();
				span0 = element("span");
				t2 = text("Username: ");
				p1 = element("p");
				t3 = text(/*usernameContent*/ ctx[0]);
				t4 = space();
				span1 = element("span");
				t5 = text("Password: ");
				p2 = element("p");
				p2.textContent = "***********";
				t7 = space();
				div = element("div");
				button0 = element("button");
				button0.textContent = "Later";
				t9 = space();
				button1 = element("button");
				button1.textContent = "Save";
				attr_dev(p0, "class", "mt-4 mb-3");
				add_location(p0, file$1, 24, 0, 401);
				add_location(p1, file$1, 26, 12, 539);
				attr_dev(span0, "class", "flex gap-2 text-sm items-center mb-3");
				add_location(span0, file$1, 25, 0, 476);
				attr_dev(p2, "class", "flex items-center");
				add_location(p2, file$1, 29, 12, 630);
				attr_dev(span1, "class", "flex gap-2 text-sm items-center");
				add_location(span1, file$1, 28, 0, 572);
				attr_dev(button0, "class", "px-2 py-1 bg-red-600 flex justify-center items-center");
				add_location(button0, file$1, 32, 1, 737);
				attr_dev(button1, "class", "px-2 py-1 bg-green-600 flex justify-center items-center");
				add_location(button1, file$1, 36, 1, 871);
				attr_dev(div, "class", "flex justify-between items-center mt-6");
				add_location(div, file$1, 31, 0, 683);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, p0, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, span0, anchor);
				append_dev(span0, t2);
				append_dev(span0, p1);
				append_dev(p1, t3);
				insert_dev(target, t4, anchor);
				insert_dev(target, span1, anchor);
				append_dev(span1, t5);
				append_dev(span1, p2);
				insert_dev(target, t7, anchor);
				insert_dev(target, div, anchor);
				append_dev(div, button0);
				append_dev(div, t9);
				append_dev(div, button1);

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false, false),
						listen_dev(button1, "click", /*click_handler_1*/ ctx[5], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*usernameContent*/ 1) set_data_dev(t3, /*usernameContent*/ ctx[0]);
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(p0);
					detach_dev(t1);
					detach_dev(span0);
					detach_dev(t4);
					detach_dev(span1);
					detach_dev(t7);
					detach_dev(div);
				}

				mounted = false;
				run_all(dispose);
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
		validate_slots('SuggestionView', slots, []);
		let { iframeCustomEvent } = $$props;
		let { value = false } = $$props;
		let usernameContent = "empty";

		const handleUserInput = input => {
			$$invalidate(2, value = input);

			if (!input) {
				iframeCustomEvent.source.postMessage({ unmount: true }, iframeCustomEvent.origin);
			}
		};

		$$self.$$.on_mount.push(function () {
			if (iframeCustomEvent === undefined && !('iframeCustomEvent' in $$props || $$self.$$.bound[$$self.$$.props['iframeCustomEvent']])) {
				console.warn("<SuggestionView> was created without expected prop 'iframeCustomEvent'");
			}
		});

		const writable_props = ['iframeCustomEvent', 'value'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SuggestionView> was created with unknown prop '${key}'`);
		});

		const click_handler = () => handleUserInput(false);
		const click_handler_1 = () => handleUserInput(true);

		$$self.$$set = $$props => {
			if ('iframeCustomEvent' in $$props) $$invalidate(3, iframeCustomEvent = $$props.iframeCustomEvent);
			if ('value' in $$props) $$invalidate(2, value = $$props.value);
		};

		$$self.$capture_state = () => ({
			iframeCustomEvent,
			value,
			usernameContent,
			handleUserInput
		});

		$$self.$inject_state = $$props => {
			if ('iframeCustomEvent' in $$props) $$invalidate(3, iframeCustomEvent = $$props.iframeCustomEvent);
			if ('value' in $$props) $$invalidate(2, value = $$props.value);
			if ('usernameContent' in $$props) $$invalidate(0, usernameContent = $$props.usernameContent);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*iframeCustomEvent*/ 8) {
				if (iframeCustomEvent) {
					const { username } = iframeCustomEvent.data;
					$$invalidate(0, usernameContent = username);
				}
			}
		};

		return [
			usernameContent,
			handleUserInput,
			value,
			iframeCustomEvent,
			click_handler,
			click_handler_1
		];
	}

	class SuggestionView extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$1, create_fragment$1, safe_not_equal, { iframeCustomEvent: 3, value: 2 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "SuggestionView",
				options,
				id: create_fragment$1.name
			});
		}

		get iframeCustomEvent() {
			throw new Error("<SuggestionView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set iframeCustomEvent(value) {
			throw new Error("<SuggestionView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get value() {
			throw new Error("<SuggestionView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set value(value) {
			throw new Error("<SuggestionView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/lib/suggestions.svelte generated by Svelte v4.2.19 */
	const file = "src/lib/suggestions.svelte";

	// (35:1) {:else}
	function create_else_block(ctx) {
		let suggestionview;
		let updating_value;
		let current;

		function suggestionview_value_binding(value) {
			/*suggestionview_value_binding*/ ctx[6](value);
		}

		let suggestionview_props = {
			iframeCustomEvent: /*iframeCustomEvent*/ ctx[3]
		};

		if (/*folderView*/ ctx[0] !== void 0) {
			suggestionview_props.value = /*folderView*/ ctx[0];
		}

		suggestionview = new SuggestionView({
				props: suggestionview_props,
				$$inline: true
			});

		binding_callbacks.push(() => bind(suggestionview, 'value', suggestionview_value_binding));

		const block = {
			c: function create() {
				create_component(suggestionview.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(suggestionview, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const suggestionview_changes = {};
				if (dirty & /*iframeCustomEvent*/ 8) suggestionview_changes.iframeCustomEvent = /*iframeCustomEvent*/ ctx[3];

				if (!updating_value && dirty & /*folderView*/ 1) {
					updating_value = true;
					suggestionview_changes.value = /*folderView*/ ctx[0];
					add_flush_callback(() => updating_value = false);
				}

				suggestionview.$set(suggestionview_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(suggestionview.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(suggestionview.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(suggestionview, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(35:1) {:else}",
			ctx
		});

		return block;
	}

	// (29:22) 
	function create_if_block_1(ctx) {
		let folderview;
		let updating_isSuccess;
		let updating_triggerSuccess;
		let current;

		function folderview_isSuccess_binding(value) {
			/*folderview_isSuccess_binding*/ ctx[4](value);
		}

		function folderview_triggerSuccess_binding(value) {
			/*folderview_triggerSuccess_binding*/ ctx[5](value);
		}

		let folderview_props = {
			iframeCustomEvent: /*iframeCustomEvent*/ ctx[3]
		};

		if (/*isSuccess*/ ctx[2] !== void 0) {
			folderview_props.isSuccess = /*isSuccess*/ ctx[2];
		}

		if (/*successView*/ ctx[1] !== void 0) {
			folderview_props.triggerSuccess = /*successView*/ ctx[1];
		}

		folderview = new FolderView({ props: folderview_props, $$inline: true });
		binding_callbacks.push(() => bind(folderview, 'isSuccess', folderview_isSuccess_binding));
		binding_callbacks.push(() => bind(folderview, 'triggerSuccess', folderview_triggerSuccess_binding));

		const block = {
			c: function create() {
				create_component(folderview.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(folderview, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const folderview_changes = {};
				if (dirty & /*iframeCustomEvent*/ 8) folderview_changes.iframeCustomEvent = /*iframeCustomEvent*/ ctx[3];

				if (!updating_isSuccess && dirty & /*isSuccess*/ 4) {
					updating_isSuccess = true;
					folderview_changes.isSuccess = /*isSuccess*/ ctx[2];
					add_flush_callback(() => updating_isSuccess = false);
				}

				if (!updating_triggerSuccess && dirty & /*successView*/ 2) {
					updating_triggerSuccess = true;
					folderview_changes.triggerSuccess = /*successView*/ ctx[1];
					add_flush_callback(() => updating_triggerSuccess = false);
				}

				folderview.$set(folderview_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(folderview.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(folderview.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(folderview, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(29:22) ",
			ctx
		});

		return block;
	}

	// (27:1) {#if successView}
	function create_if_block(ctx) {
		let successview;
		let current;

		successview = new SuccessView({
				props: {
					isSuccess: /*isSuccess*/ ctx[2],
					iframeCustomEvent: /*iframeCustomEvent*/ ctx[3]
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(successview.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(successview, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const successview_changes = {};
				if (dirty & /*isSuccess*/ 4) successview_changes.isSuccess = /*isSuccess*/ ctx[2];
				if (dirty & /*iframeCustomEvent*/ 8) successview_changes.iframeCustomEvent = /*iframeCustomEvent*/ ctx[3];
				successview.$set(successview_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(successview.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(successview.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(successview, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(27:1) {#if successView}",
			ctx
		});

		return block;
	}

	function create_fragment(ctx) {
		let div;
		let span;
		let t1;
		let current_block_type_index;
		let if_block;
		let current;
		const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*successView*/ ctx[1]) return 0;
			if (/*folderView*/ ctx[0]) return 1;
			return 2;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				div = element("div");
				span = element("span");
				span.textContent = "osvauld";
				t1 = space();
				if_block.c();
				attr_dev(span, "class", "font-extrabold text-2xl text-white pb-4");
				add_location(span, file, 29, 1, 787);
				attr_dev(div, "class", "w-full h-[200px] bg-osvauld-frameblack text-base text-white overflow-hidden");
				add_location(div, file, 26, 0, 694);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, span);
				append_dev(div, t1);
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
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Suggestions', slots, []);
		let folderView = false;
		let successView = false;
		let isSuccess = false;
		let iframeCustomEvent;

		onMount(async () => {
			window.addEventListener("message", event => {
				if (event.data.id !== "osvauld") {
					return;
				}

				$$invalidate(3, iframeCustomEvent = {
					data: event.data,
					source: event.source,
					origin: event.origin
				});
			});
		});

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Suggestions> was created with unknown prop '${key}'`);
		});

		function folderview_isSuccess_binding(value) {
			isSuccess = value;
			$$invalidate(2, isSuccess);
		}

		function folderview_triggerSuccess_binding(value) {
			successView = value;
			$$invalidate(1, successView);
		}

		function suggestionview_value_binding(value) {
			folderView = value;
			$$invalidate(0, folderView);
		}

		$$self.$capture_state = () => ({
			onMount,
			SuccessView,
			FolderView,
			SuggestionView,
			folderView,
			successView,
			isSuccess,
			iframeCustomEvent
		});

		$$self.$inject_state = $$props => {
			if ('folderView' in $$props) $$invalidate(0, folderView = $$props.folderView);
			if ('successView' in $$props) $$invalidate(1, successView = $$props.successView);
			if ('isSuccess' in $$props) $$invalidate(2, isSuccess = $$props.isSuccess);
			if ('iframeCustomEvent' in $$props) $$invalidate(3, iframeCustomEvent = $$props.iframeCustomEvent);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			folderView,
			successView,
			isSuccess,
			iframeCustomEvent,
			folderview_isSuccess_binding,
			folderview_triggerSuccess_binding,
			suggestionview_value_binding
		];
	}

	class Suggestions extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Suggestions",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new Suggestions({
	    target: document.body,
	});

	return app;

})();
//# sourceMappingURL=suggestions.js.map
