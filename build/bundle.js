
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
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
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
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
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function each(items, fn) {
        let str = '';
        for (let i = 0; i < items.length; i += 1) {
            str += fn(items[i], i);
        }
        return str;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
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
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
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
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function buildValidator (validators) {
        return function validate (value, dirty) {
          if (!validators || validators.length === 0) {
            return { dirty, valid: true }
          }
      
          const failing = validators.find(v => v(value) !== true);
      
          return {
            dirty,
            valid: !failing,
            message: failing && failing(value)
          }
        }
      }

    function createFieldValidator (...validators) {
      const { subscribe, set } = writable({ dirty: false, valid: false, message: null });
      const validator = buildValidator(validators);

      function action (node, binding) {
        function validate (value, dirty) {
          const result = validator(value, dirty);
          set(result);
        }
        
        validate(binding, false);

        return {
          update (value) {
            validate(value, true);
          }
        }
      }

      return [ { subscribe }, action ]
    }

    function emailValidator () {
        return function email (value) {
          return (value && !!value.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) || 'Please enter a valid email'
        }
      }

      function telephoneValidator () {
        return function email (value) {
          return (value && !!value.match(/^[\+]?[(]?[0-9]{1,2}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,10}/)) || 'Please enter a valid telephone number'
        }
      }
      
      function requiredValidator () {
        return function required (value) {
          return (value !== undefined && value !== null && value !== '') || 'This field is required'
        }
      }

    const showCustomer = writable(true);

    const selectedIds = writable([]);
    const selectedListSize = writable(0);

    const [ validity, validate ] = createFieldValidator(requiredValidator(), emailValidator());
    const [ telvalidity, telvalidate ] = createFieldValidator( telephoneValidator());

    /* src\components\Header.svelte generated by Svelte v3.44.3 */
    const file$9 = "src\\components\\Header.svelte";

    function create_fragment$9(ctx) {
    	let header;
    	let nav;
    	let div0;
    	let a;
    	let span0;
    	let t1;
    	let div5;
    	let div1;
    	let p;
    	let t3;
    	let div4;
    	let div3;
    	let div2;
    	let button0;
    	let strong;
    	let t4_value = (/*$showCustomer*/ ctx[1] ? 'Customer' : 'Staff') + "";
    	let t4;
    	let t5;
    	let button1;
    	let span1;
    	let t6_value = (/*loggedIn*/ ctx[0] ? 'Log out' : 'Log in') + "";
    	let t6;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			div0 = element("div");
    			a = element("a");
    			span0 = element("span");
    			span0.textContent = "🦌";
    			t1 = space();
    			div5 = element("div");
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Santas Reindeers";
    			t3 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			button0 = element("button");
    			strong = element("strong");
    			t4 = text(t4_value);
    			t5 = space();
    			button1 = element("button");
    			span1 = element("span");
    			t6 = text(t6_value);
    			attr_dev(span0, "class", "icon svelte-1mgc8ng");
    			add_location(span0, file$9, 10, 16, 243);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "navbar-item");
    			add_location(a, file$9, 9, 12, 193);
    			attr_dev(div0, "class", "navbar-brand");
    			add_location(div0, file$9, 8, 8, 153);
    			attr_dev(p, "class", "name has-text-weigt-bold is-size-1 svelte-1mgc8ng");
    			add_location(p, file$9, 17, 16, 449);
    			attr_dev(div1, "class", "navbar-item is-centered");
    			add_location(div1, file$9, 16, 12, 394);
    			add_location(strong, file$9, 23, 28, 799);
    			attr_dev(button0, "class", "button is-primary");
    			add_location(button0, file$9, 22, 24, 685);
    			add_location(span1, file$9, 27, 28, 1010);
    			attr_dev(button1, "class", "button");
    			add_location(button1, file$9, 26, 24, 917);
    			attr_dev(div2, "class", "buttons");
    			add_location(div2, file$9, 21, 20, 638);
    			attr_dev(div3, "class", "navbar-item");
    			add_location(div3, file$9, 20, 16, 591);
    			attr_dev(div4, "class", "navbar-end");
    			add_location(div4, file$9, 19, 12, 549);
    			attr_dev(div5, "class", "navbar-menu");
    			add_location(div5, file$9, 15, 8, 355);
    			attr_dev(nav, "class", "navbar svelte-1mgc8ng");
    			add_location(nav, file$9, 7, 4, 123);
    			add_location(header, file$9, 6, 0, 109);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, div0);
    			append_dev(div0, a);
    			append_dev(a, span0);
    			append_dev(nav, t1);
    			append_dev(nav, div5);
    			append_dev(div5, div1);
    			append_dev(div1, p);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(button0, strong);
    			append_dev(strong, t4);
    			append_dev(div2, t5);
    			append_dev(div2, button1);
    			append_dev(button1, span1);
    			append_dev(span1, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$showCustomer*/ 2 && t4_value !== (t4_value = (/*$showCustomer*/ ctx[1] ? 'Customer' : 'Staff') + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*loggedIn*/ 1 && t6_value !== (t6_value = (/*loggedIn*/ ctx[0] ? 'Log out' : 'Log in') + "")) set_data_dev(t6, t6_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			mounted = false;
    			run_all(dispose);
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

    function instance$9($$self, $$props, $$invalidate) {
    	let $showCustomer;
    	validate_store(showCustomer, 'showCustomer');
    	component_subscribe($$self, showCustomer, $$value => $$invalidate(1, $showCustomer = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let loggedIn = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(showCustomer, $showCustomer = !$showCustomer, $showCustomer);
    	const click_handler_1 = () => $$invalidate(0, loggedIn = !loggedIn);
    	$$self.$capture_state = () => ({ showCustomer, loggedIn, $showCustomer });

    	$$self.$inject_state = $$props => {
    		if ('loggedIn' in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loggedIn, $showCustomer, click_handler, click_handler_1];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    var DragDropTouch;
    (function (DragDropTouchExport) {
        var DataTransfer = (function () {
            function DataTransfer() {
                this._dropEffect = 'move';
                this._effectAllowed = 'all';
                this._data = {};
            }
            Object.defineProperty(DataTransfer.prototype, "dropEffect", {
                enumerable: true, configurable: true,
                get: function () { return this._dropEffect; },
                set: function (value) { this._dropEffect = value; },
            });
            Object.defineProperty(DataTransfer.prototype, "effectAllowed", {
                enumerable: true, configurable: true,
                get: function () { return this._effectAllowed; },
                set: function (value) { this._effectAllowed = value; },
            });
            Object.defineProperty(DataTransfer.prototype, "types", {
                enumerable: true, configurable: true,
                get: function () { return Object.keys(this._data); },
            });
            DataTransfer.prototype.clearData = function (type) {
                if (type == null) {
                    this._data = {};
                }
                else {
                    delete this._data[type.toLowerCase()];
                }
            };
            DataTransfer.prototype.getData = function (type) {
                return this._data[type.toLowerCase()] || '';
            };
            DataTransfer.prototype.setData = function (type, value) {
                this._data[type.toLowerCase()] = value;
            };
            DataTransfer.prototype.setDragImage = function (img, offsetX, offsetY) {
                var ddt = DragDropTouchSingleton._instance;
                ddt._imgCustom = img;
                ddt._imgOffset = { x: offsetX, y: offsetY };
            };
            return DataTransfer;
        }());
        DragDropTouchExport.DataTransfer = DataTransfer;
        var DragDropTouchSingleton = (function () {
            function DragDropTouch() {
                this._lastClick = 0;
                if ((DragDropTouchSingleton != null) &&
                    (DragDropTouchSingleton._instance != null)) {
                    throw new Error('DragDropTouch instance already created.');
                }
                // https://github.com/Modernizr/Modernizr/issues/1894
                var supportsPassive = false;
                document.addEventListener('test', function () { }, {
                    get passive() { supportsPassive = true; return true; }
                });
                if (navigator.maxTouchPoints > 0) {
                    var touchstart = this._touchstart.bind(this);
                    var touchmove = this._touchmove.bind(this);
                    var touchend = this._touchend.bind(this);
                    var Options = (supportsPassive ? { passive: false, capture: false } : false);
                    document.addEventListener('touchstart', touchstart, Options);
                    document.addEventListener('touchmove', touchmove, Options);
                    document.addEventListener('touchend', touchend);
                    document.addEventListener('touchcancel', touchend);
                }
            }
            DragDropTouch.getInstance = function () {
                return DragDropTouchSingleton._instance;
            };
            /**** Event Handlers ****/
            DragDropTouch.prototype._touchstart = function (e) {
                var _this = this;
                if (this._shouldHandle(e)) {
                    if (Date.now() - this._lastClick < DragDropTouchSingleton._DBLCLICK) {
                        if (this._dispatchEvent(e, 'dblclick', e.target)) {
                            e.preventDefault();
                            this._reset();
                            return;
                        }
                    }
                    this._reset();
                    var src_1 = this._closestDraggable(e.target);
                    if (src_1 != null) {
                        if (!this._dispatchEvent(e, 'mousemove', e.target) &&
                            !this._dispatchEvent(e, 'mousedown', e.target)) {
                            this._dragSource = src_1;
                            this._ptDown = this._getPoint(e);
                            this._lastTouch = e;
                            e.preventDefault();
                            setTimeout(function () {
                                if ((_this._dragSource === src_1) && (_this._img == null)) {
                                    if (_this._dispatchEvent(e, 'contextmenu', src_1)) {
                                        _this._reset();
                                    }
                                }
                            }, DragDropTouchSingleton._CTXMENU);
                            if (DragDropTouchSingleton._ISPRESSHOLDMODE) {
                                this._pressHoldInterval = setTimeout(function () {
                                    _this._isDragEnabled = true;
                                    _this._touchmove(e);
                                }, DragDropTouchSingleton._PRESSHOLDAWAIT);
                            }
                        }
                    }
                }
            };
            DragDropTouch.prototype._touchmove = function (e) {
                if (this._shouldCancelPressHoldMove(e)) {
                    this._reset();
                    return;
                }
                if (this._shouldHandleMove(e) || this._shouldHandlePressHoldMove(e)) {
                    var target = this._getTarget(e);
                    if (this._dispatchEvent(e, 'mousemove', target)) {
                        this._lastTouch = e;
                        e.preventDefault();
                        return;
                    }
                    var lastPointOnPage = this._getPoint(this._lastTouch, true);
                    var curPointOnPage = this._getPoint(e, true);
                    this._lastMovementX = curPointOnPage.x - lastPointOnPage.x;
                    this._lastMovementY = curPointOnPage.y - lastPointOnPage.y;
                    var Extras = { movementX: this._lastMovementX, movementY: this._lastMovementY };
                    if (this._dragSource && (this._img == null) && this._shouldStartDragging(e)) {
                        this._dispatchEvent(e, 'dragstart', this._dragSource, Extras);
                        this._createImage(e);
                        this._dispatchEvent(e, 'dragenter', target, Extras);
                    }
                    if (this._img != null) {
                        this._lastTouch = e;
                        e.preventDefault();
                        this._dispatchEvent(e, 'drag', this._dragSource, Extras);
                        if (target != this._lastTarget) {
                            this._dispatchEvent(this._lastTouch, 'dragleave', this._lastTarget, Extras);
                            this._dispatchEvent(e, 'dragenter', target, Extras);
                            this._lastTarget = target;
                        }
                        this._moveImage(e);
                        this._isDropZone = this._dispatchEvent(e, 'dragover', target, Extras);
                    }
                }
            };
            DragDropTouch.prototype._touchend = function (e) {
                if (this._shouldHandle(e)) {
                    if (this._dispatchEvent(this._lastTouch, 'mouseup', e.target)) {
                        e.preventDefault();
                        return;
                    }
                    if (this._img == null) {
                        this._dragSource = null;
                        this._dispatchEvent(this._lastTouch, 'click', e.target);
                        this._lastClick = Date.now();
                    }
                    this._destroyImage();
                    if (this._dragSource) {
                        var Extras = { movementX: this._lastMovementX, movementY: this._lastMovementY };
                        if (e.type.indexOf('cancel') < 0 && this._isDropZone) {
                            this._dispatchEvent(this._lastTouch, 'drop', this._lastTarget, Extras);
                        }
                        this._dispatchEvent(this._lastTouch, 'dragend', this._dragSource, Extras);
                        this._reset();
                    }
                }
            };
            /**** Utility Functions ****/
            DragDropTouch.prototype._shouldHandle = function (e) {
                return ((e != null) && !e.defaultPrevented &&
                    (e.touches != null) && (e.touches.length < 2));
            };
            DragDropTouch.prototype._shouldHandleMove = function (e) {
                return !DragDropTouchSingleton._ISPRESSHOLDMODE && this._shouldHandle(e);
            };
            DragDropTouch.prototype._shouldHandlePressHoldMove = function (e) {
                return (DragDropTouchSingleton._ISPRESSHOLDMODE && this._isDragEnabled &&
                    (e != null) && (e.touches != null) && (e.touches.length > 0));
            };
            DragDropTouch.prototype._shouldCancelPressHoldMove = function (e) {
                return (DragDropTouchSingleton._ISPRESSHOLDMODE && !this._isDragEnabled &&
                    (this._getDelta(e) > DragDropTouchSingleton._PRESSHOLDMARGIN));
            };
            DragDropTouch.prototype._shouldStartDragging = function (e) {
                var delta = this._getDelta(e);
                return ((delta > DragDropTouchSingleton._THRESHOLD) ||
                    DragDropTouchSingleton._ISPRESSHOLDMODE && (delta >= DragDropTouchSingleton._PRESSHOLDTHRESHOLD));
            };
            DragDropTouch.prototype._reset = function () {
                this._destroyImage();
                this._dragSource = null;
                this._lastTouch = null;
                this._lastTarget = null;
                this._ptDown = null;
                this._isDragEnabled = false;
                this._isDropZone = false;
                this._dataTransfer = new DataTransfer();
                this._lastMovementX = 0;
                this._lastMovementY = 0;
                clearInterval(this._pressHoldInterval);
            };
            DragDropTouch.prototype._getPoint = function (e, page) {
                if ((e != null) && (e.touches != null) &&
                    (e.touches.length > 0)) {
                    var Touch_1 = e.touches[0];
                    return { x: page ? Touch_1.pageX : Touch_1.clientX, y: page ? Touch_1.pageY : Touch_1.clientY };
                }
                else {
                    var Event_1 = e;
                    return { x: page ? Event_1.pageX : Event_1.clientX, y: page ? Event_1.pageY : Event_1.clientY };
                }
            };
            DragDropTouch.prototype._getDelta = function (e) {
                if (DragDropTouchSingleton._ISPRESSHOLDMODE && !this._ptDown) {
                    return 0;
                }
                var p = this._getPoint(e);
                return Math.abs(p.x - this._ptDown.x) + Math.abs(p.y - this._ptDown.y);
            };
            DragDropTouch.prototype._getTarget = function (e) {
                var pt = this._getPoint(e);
                var el = document.elementFromPoint(pt.x, pt.y);
                while ((el != null) && (getComputedStyle(el).pointerEvents == 'none')) {
                    el = el.parentElement;
                }
                return el;
            };
            DragDropTouch.prototype._createImage = function (e) {
                if (this._img != null) {
                    this._destroyImage();
                }
                var src = this._imgCustom || this._dragSource;
                this._img = src.cloneNode(true);
                this._copyStyle(src, this._img);
                this._img.style.top = this._img.style.left = '-9999px';
                if (this._imgCustom == null) {
                    var rc = src.getBoundingClientRect();
                    var pt = this._getPoint(e);
                    this._imgOffset = { x: pt.x - rc.left, y: pt.y - rc.top };
                    this._img.style.opacity = DragDropTouchSingleton._OPACITY.toString();
                }
                this._moveImage(e);
                document.body.appendChild(this._img);
            };
            DragDropTouch.prototype._destroyImage = function () {
                if ((this._img != null) && (this._img.parentElement != null)) {
                    this._img.parentElement.removeChild(this._img);
                }
                this._img = null;
                this._imgCustom = null;
            };
            DragDropTouch.prototype._moveImage = function (e) {
                var _this = this;
                requestAnimationFrame(function () {
                    if (_this._img != null) {
                        var pt = _this._getPoint(e, true), s = _this._img.style;
                        s.position = 'absolute';
                        s.pointerEvents = 'none';
                        s.zIndex = '999999';
                        s.left = Math.round(pt.x - _this._imgOffset.x) + 'px';
                        s.top = Math.round(pt.y - _this._imgOffset.y) + 'px';
                    }
                });
            };
            DragDropTouch.prototype._copyProps = function (dst, src, props) {
                for (var i = 0; i < props.length; i++) {
                    var p = props[i];
                    dst[p] = src[p];
                }
            };
            DragDropTouch.prototype._copyStyle = function (src, dst) {
                DragDropTouchSingleton._rmvAtts.forEach(function (att) {
                    dst.removeAttribute(att);
                });
                if (src instanceof HTMLCanvasElement) {
                    var cSrc = src, cDst = dst;
                    cDst.width = cSrc.width;
                    cDst.height = cSrc.height;
                    cDst.getContext('2d').drawImage(cSrc, 0, 0);
                }
                var cs = getComputedStyle(src); // poor trick to satisfy compiler
                for (var i = 0; i < cs.length; i++) {
                    var key = cs[i];
                    if (key.indexOf('transition') < 0) {
                        dst.style[key] = cs[key];
                    }
                }
                dst.style.pointerEvents = 'none';
                for (var i = 0; i < src.children.length; i++) {
                    this._copyStyle(src.children[i], dst.children[i]);
                }
            };
            DragDropTouch.prototype._dispatchEvent = function (e /* poor TypeScript trick */, type, target, Extras) {
                if ((e != null) && (target != null)) {
                    var evt = document.createEvent('Event'); // poor trick to satisfy compiler
                    var t = (e['touches'] != null) ? e['touches'][0] : e;
                    evt.initEvent(type, true, true);
                    evt['button'] = 0;
                    evt['which'] = evt['buttons'] = 1;
                    this._copyProps(evt, e, DragDropTouchSingleton._kbdProps);
                    this._copyProps(evt, t, DragDropTouchSingleton._ptProps);
                    evt['dataTransfer'] = this._dataTransfer;
                    if (Extras != null) {
                        evt['movementX'] = Extras.movementX;
                        evt['movementY'] = Extras.movementY;
                    }
                    target.dispatchEvent(evt);
                    return evt.defaultPrevented;
                }
                return false;
            };
            DragDropTouch.prototype._closestDraggable = function (e) {
                for (; e; e = e.parentElement) {
                    if (e.hasAttribute('draggable') && e.getAttribute('draggable')) {
                        return e;
                    }
                }
                return null;
            };
            // @ts-ignore
            var Singleton = new DragDropTouch();
            Singleton._instance = Singleton;
            return Singleton;
        }());
        DragDropTouchExport.DragDropTouch = DragDropTouchSingleton;
        var Singleton = DragDropTouch.DragDropTouch;
        Singleton._THRESHOLD = 5; // pixels to move before drag starts
        Singleton._OPACITY = 0.5; // drag image opacity
        Singleton._DBLCLICK = 500; // max ms between clicks in a double click
        Singleton._CTXMENU = 900; // ms to hold before raising 'contextmenu' event
        Singleton._ISPRESSHOLDMODE = false; // decides of press & hold mode presence
        Singleton._PRESSHOLDAWAIT = 400; // ms to wait before press & hold is detected
        Singleton._PRESSHOLDMARGIN = 25; // pixels that finger might shiver while pressing
        Singleton._PRESSHOLDTHRESHOLD = 0; // pixels to move before drag starts
        Singleton._rmvAtts = 'id,class,style,draggable'.split(',');
        Singleton._kbdProps = 'altKey,ctrlKey,metaKey,shiftKey'.split(',');
        Singleton._ptProps = 'pageX,pageY,clientX,clientY,screenX,screenY,offsetX,offsetY'.split(',');
    })(DragDropTouch || (DragDropTouch = {}));
    var DragDropTouch$1 = DragDropTouch;

    //----------------------------------------------------------------------------//
    var svelteDragDropTouch = DragDropTouch$1.DragDropTouch;

    /* src\components\TableArea.svelte generated by Svelte v3.44.3 */
    const file$8 = "src\\components\\TableArea.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (211:18) {#if pos != null}
    function create_if_block$4(ctx) {
    	let div;
    	let svg;
    	let rect0;
    	let rect1;
    	let rect2;
    	let text_1;
    	let t_value = /*pos*/ ctx[19].id + "";
    	let t;
    	let div_id_value;
    	let div_class_value;
    	let div_draggable_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*pos*/ ctx[19]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(rect0, "x", "241.704");
    			attr_dev(rect0, "y", "191.51");
    			attr_dev(rect0, "width", "22.781");
    			attr_dev(rect0, "height", "16.577");

    			set_style(rect0, "fill", /*$selectedIds*/ ctx[2].indexOf(/*pos*/ ctx[19].id) != -1
    			? "orange"
    			: /*pos*/ ctx[19].reservId == null ? "green" : "red");

    			set_style(rect0, "stroke", "rgb(0, 0, 0)");
    			add_location(rect0, file$8, 213, 24, 6405);
    			attr_dev(rect1, "x", "241.999");
    			attr_dev(rect1, "y", "230.133");
    			attr_dev(rect1, "width", "22.781");
    			attr_dev(rect1, "height", "16.577");

    			set_style(rect1, "fill", /*$selectedIds*/ ctx[2].indexOf(/*pos*/ ctx[19].id) != -1
    			? "orange"
    			: /*pos*/ ctx[19].reservId == null ? "green" : "red");

    			set_style(rect1, "stroke", "rgb(0, 0, 0)");
    			add_location(rect1, file$8, 214, 24, 6608);
    			attr_dev(rect2, "x", "238.451");
    			attr_dev(rect2, "y", "201.997");
    			attr_dev(rect2, "width", "29.71");
    			attr_dev(rect2, "height", "34.579");

    			set_style(rect2, "fill", /*$selectedIds*/ ctx[2].indexOf(/*pos*/ ctx[19].id) != -1
    			? "orange"
    			: /*pos*/ ctx[19].reservId == null ? "green" : "red");

    			set_style(rect2, "stroke", "rgb(0, 0, 0)");
    			add_location(rect2, file$8, 215, 24, 6812);
    			attr_dev(text_1, "xmlns", "http://www.w3.org/2000/svg");
    			set_style(text_1, "fill", "rgb(51, 51, 51)");
    			set_style(text_1, "font-family", "Arial, sans-serif");
    			set_style(text_1, "font-size", "11px");
    			set_style(text_1, "font-weight", "700");
    			set_style(text_1, "text-anchor", "middle");
    			set_style(text_1, "white-space", "pre");
    			attr_dev(text_1, "transform", "matrix(2.024701, 0, 0, 1.510878, -248.931961, -104.71032)");
    			attr_dev(text_1, "x", "247.903");
    			attr_dev(text_1, "y", "218.044");
    			add_location(text_1, file$8, 216, 24, 7015);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "238.451 191.51 29.71 55.2");
    			attr_dev(svg, "width", "29.71");
    			attr_dev(svg, "height", "55.2");
    			attr_dev(svg, "class", "svelte-pz26kz");
    			add_location(svg, file$8, 212, 20, 6275);
    			attr_dev(div, "id", div_id_value = "table_" + /*pos*/ ctx[19].id);

    			attr_dev(div, "class", div_class_value = "field has-addons has-addons-centered table " + (/*pos*/ ctx[19].reservId == null
    			? "moveable"
    			: /*isStaff*/ ctx[0] == 1 ? "moveable" : "blocked") + " svelte-pz26kz");

    			attr_dev(div, "draggable", div_draggable_value = /*pos*/ ctx[19].reservId == null
    			? "true"
    			: /*isStaff*/ ctx[0] == 1 ? "true" : "false");

    			add_location(div, file$8, 211, 18, 5983);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, rect0);
    			append_dev(svg, rect1);
    			append_dev(svg, rect2);
    			append_dev(svg, text_1);
    			append_dev(text_1, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "drag", /*dragHandler*/ ctx[5], false, false, false),
    					listen_dev(div, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$selectedIds, grid*/ 6) {
    				set_style(rect0, "fill", /*$selectedIds*/ ctx[2].indexOf(/*pos*/ ctx[19].id) != -1
    				? "orange"
    				: /*pos*/ ctx[19].reservId == null ? "green" : "red");
    			}

    			if (dirty & /*$selectedIds, grid*/ 6) {
    				set_style(rect1, "fill", /*$selectedIds*/ ctx[2].indexOf(/*pos*/ ctx[19].id) != -1
    				? "orange"
    				: /*pos*/ ctx[19].reservId == null ? "green" : "red");
    			}

    			if (dirty & /*$selectedIds, grid*/ 6) {
    				set_style(rect2, "fill", /*$selectedIds*/ ctx[2].indexOf(/*pos*/ ctx[19].id) != -1
    				? "orange"
    				: /*pos*/ ctx[19].reservId == null ? "green" : "red");
    			}

    			if (dirty & /*grid*/ 2 && t_value !== (t_value = /*pos*/ ctx[19].id + "")) set_data_dev(t, t_value);

    			if (dirty & /*grid*/ 2 && div_id_value !== (div_id_value = "table_" + /*pos*/ ctx[19].id)) {
    				attr_dev(div, "id", div_id_value);
    			}

    			if (dirty & /*grid, isStaff*/ 3 && div_class_value !== (div_class_value = "field has-addons has-addons-centered table " + (/*pos*/ ctx[19].reservId == null
    			? "moveable"
    			: /*isStaff*/ ctx[0] == 1 ? "moveable" : "blocked") + " svelte-pz26kz")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*grid, isStaff*/ 3 && div_draggable_value !== (div_draggable_value = /*pos*/ ctx[19].reservId == null
    			? "true"
    			: /*isStaff*/ ctx[0] == 1 ? "true" : "false")) {
    				attr_dev(div, "draggable", div_draggable_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(211:18) {#if pos != null}",
    		ctx
    	});

    	return block;
    }

    // (209:9) {#each row as pos}
    function create_each_block_1(ctx) {
    	let div;
    	let mounted;
    	let dispose;
    	let if_block = /*pos*/ ctx[19] != null && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "id", "gridField_" + /*getFieldId*/ ctx[6]());
    			attr_dev(div, "class", "field has-addons has-addons-centered table_field svelte-pz26kz");
    			add_location(div, file$8, 209, 14, 5788);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "dragover", /*allowDrop*/ ctx[4], false, false, false),
    					listen_dev(div, "drop", /*dropHandler*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*pos*/ ctx[19] != null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(209:9) {#each row as pos}",
    		ctx
    	});

    	return block;
    }

    // (207:4) {#each grid as row}
    function create_each_block$1(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*row*/ ctx[16];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "field is-horizontal area_column svelte-pz26kz");
    			add_location(div, file$8, 207, 8, 5698);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getFieldId, allowDrop, dropHandler, grid, isStaff, dragHandler, tableClicked, $selectedIds*/ 255) {
    				each_value_1 = /*row*/ ctx[16];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(207:4) {#each grid as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t;
    	let div0;
    	let each_value = /*grid*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (!src_url_equal(img.src, img_src_value = "./restaurant.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "restaurant");
    			attr_dev(img, "class", "svelte-pz26kz");
    			add_location(img, file$8, 204, 4, 5582);
    			attr_dev(div0, "class", "field table_area svelte-pz26kz");
    			add_location(div0, file$8, 205, 0, 5629);
    			attr_dev(div1, "class", "field");
    			add_location(div1, file$8, 203, 0, 5557);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*grid, getFieldId, allowDrop, dropHandler, isStaff, dragHandler, tableClicked, $selectedIds*/ 255) {
    				each_value = /*grid*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
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

    function getId(NameId) {
    	if (NameId == null || NameId === "") {
    		return [-1, true];
    	}

    	let arr = String(NameId).split("_");
    	let isTable = arr[0] === "table";
    	return [parseInt(arr[1]), isTable];
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $selectedIds;
    	let $selectedListSize;
    	validate_store(selectedIds, 'selectedIds');
    	component_subscribe($$self, selectedIds, $$value => $$invalidate(2, $selectedIds = $$value));
    	validate_store(selectedListSize, 'selectedListSize');
    	component_subscribe($$self, selectedListSize, $$value => $$invalidate(11, $selectedListSize = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TableArea', slots, []);
    	let gridRows = 15;
    	let gridCols = 20;
    	let { isStaff } = $$props;
    	let idDragged = undefined;

    	function dropHandler(ev) {
    		ev.preventDefault();
    		var targetId = getId(ev.target.id);
    		var coords = getCoords(targetId[0]);
    		var src = idDragged;

    		let table = tables.find(e => {
    			return e.id == Number(src);
    		});

    		$$invalidate(1, grid[table.pos[0]][table.pos[1]] = null, grid);
    		$$invalidate(1, grid[coords[0]][coords[1]] = table, grid);
    		table.pos = coords;
    		idDragged = undefined;
    	}

    	function allowDrop(ev) {
    		var targetId = getId(ev.target.id);

    		if (targetId[1]) {
    			return;
    		}

    		var coords = getCoords(targetId[0]);

    		if (coords[0] <= 2 && coords[1] >= 10) {
    			return;
    		}

    		if (coords[0] <= 8 && coords[1] == 8) {
    			return;
    		}

    		if (grid[coords[0]][coords[1]] == null) {
    			ev.preventDefault();
    		}
    	}

    	function dragHandler(ev) {
    		var src = getId(ev.target.id)[0];
    		idDragged = src;
    	}

    	function getCoords(number) {
    		let col = number % Number(gridCols);
    		let row = (number - col) / Number(gridCols);
    		return [row, col];
    	}

    	let tables = [
    		{ id: 1, reservId: null, pos: [0, 0] },
    		{ id: 2, reservId: null, pos: [0, 2] },
    		{ id: 3, reservId: null, pos: [0, 4] },
    		{ id: 4, reservId: 1, pos: [0, 6] },
    		{ id: 5, reservId: 1, pos: [2, 0] },
    		{ id: 6, reservId: 1, pos: [4, 0] },
    		{ id: 7, reservId: 2, pos: [6, 0] },
    		{ id: 8, reservId: 2, pos: [3, 3] },
    		{ id: 9, reservId: 2, pos: [3, 4] },
    		{ id: 10, reservId: 3, pos: [3, 6] },
    		{ id: 11, reservId: 3, pos: [3, 7] },
    		{ id: 12, reservId: 3, pos: [5, 3] },
    		{ id: 13, reservId: null, pos: [5, 4] },
    		{ id: 14, reservId: null, pos: [5, 6] },
    		{ id: 15, reservId: null, pos: [5, 7] },
    		{ id: 16, reservId: null, pos: [8, 4] },
    		{ id: 17, reservId: null, pos: [8, 6] },
    		{ id: 18, reservId: null, pos: [3, 9] },
    		{ id: 19, reservId: null, pos: [3, 10] },
    		{ id: 20, reservId: null, pos: [3, 12] },
    		{ id: 21, reservId: null, pos: [3, 13] },
    		{ id: 22, reservId: null, pos: [5, 9] },
    		{ id: 23, reservId: null, pos: [5, 10] },
    		{ id: 24, reservId: null, pos: [5, 12] },
    		{ id: 25, reservId: null, pos: [5, 13] },
    		{ id: 26, reservId: null, pos: [8, 10] },
    		{ id: 27, reservId: null, pos: [8, 12] },
    		{ id: 28, reservId: null, pos: [3, 15] },
    		{ id: 29, reservId: null, pos: [3, 16] },
    		{ id: 30, reservId: null, pos: [3, 18] },
    		{ id: 31, reservId: null, pos: [3, 19] },
    		{ id: 32, reservId: null, pos: [5, 15] },
    		{ id: 33, reservId: null, pos: [5, 16] },
    		{ id: 34, reservId: null, pos: [5, 18] },
    		{ id: 35, reservId: null, pos: [5, 19] },
    		{ id: 36, reservId: null, pos: [8, 16] },
    		{ id: 37, reservId: null, pos: [8, 18] },
    		{ id: 38, reservId: null, pos: [11, 0] },
    		{ id: 39, reservId: null, pos: [13, 0] },
    		{ id: 40, reservId: null, pos: [11, 3] },
    		{ id: 41, reservId: null, pos: [13, 3] },
    		{ id: 42, reservId: null, pos: [10, 6] },
    		{ id: 43, reservId: null, pos: [11, 6] },
    		{ id: 44, reservId: null, pos: [13, 6] },
    		{ id: 45, reservId: null, pos: [14, 6] },
    		{ id: 46, reservId: null, pos: [10, 9] },
    		{ id: 47, reservId: null, pos: [11, 9] },
    		{ id: 48, reservId: null, pos: [13, 9] },
    		{ id: 49, reservId: null, pos: [14, 9] },
    		{ id: 50, reservId: null, pos: [11, 11] },
    		{ id: 51, reservId: null, pos: [13, 11] },
    		{ id: 52, reservId: null, pos: [10, 17] },
    		{ id: 53, reservId: 4, pos: [11, 17] },
    		{ id: 54, reservId: null, pos: [13, 17] },
    		{ id: 55, reservId: null, pos: [14, 17] }
    	];

    	let grid = new Array(Number(gridRows)).fill().map(() => Array(Number(gridCols)).fill(null));

    	tables.forEach(element => {
    		$$invalidate(1, grid[element.pos[0]][element.pos[1]] = element, grid);
    	});

    	let girdFieldId = 0;

    	function getFieldId() {
    		let id = girdFieldId;
    		girdFieldId++;
    		return id;
    	}

    	function tableClicked(tab) {
    		if (tab.reservId != null && isStaff == 0) {
    			return;
    		}

    		let id = tab.id;
    		let index = $selectedIds.indexOf(id);

    		if (index == -1) {
    			set_store_value(selectedIds, $selectedIds[set_store_value(selectedListSize, $selectedListSize++, $selectedListSize)] = id, $selectedIds);
    		} else {
    			$selectedIds.splice(index, 1);
    			set_store_value(selectedListSize, --$selectedListSize, $selectedListSize);
    			selectedIds.set($selectedIds);
    		}
    	}

    	const writable_props = ['isStaff'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TableArea> was created with unknown prop '${key}'`);
    	});

    	const click_handler = pos => tableClicked(pos);

    	$$self.$$set = $$props => {
    		if ('isStaff' in $$props) $$invalidate(0, isStaff = $$props.isStaff);
    	};

    	$$self.$capture_state = () => ({
    		gridRows,
    		gridCols,
    		isStaff,
    		idDragged,
    		DragDropTouch: svelteDragDropTouch,
    		writable,
    		dropHandler,
    		allowDrop,
    		dragHandler,
    		getId,
    		getCoords,
    		tables,
    		grid,
    		girdFieldId,
    		getFieldId,
    		selectedIds,
    		selectedListSize,
    		tableClicked,
    		$selectedIds,
    		$selectedListSize
    	});

    	$$self.$inject_state = $$props => {
    		if ('gridRows' in $$props) gridRows = $$props.gridRows;
    		if ('gridCols' in $$props) gridCols = $$props.gridCols;
    		if ('isStaff' in $$props) $$invalidate(0, isStaff = $$props.isStaff);
    		if ('idDragged' in $$props) idDragged = $$props.idDragged;
    		if ('tables' in $$props) tables = $$props.tables;
    		if ('grid' in $$props) $$invalidate(1, grid = $$props.grid);
    		if ('girdFieldId' in $$props) girdFieldId = $$props.girdFieldId;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isStaff,
    		grid,
    		$selectedIds,
    		dropHandler,
    		allowDrop,
    		dragHandler,
    		getFieldId,
    		tableClicked,
    		click_handler
    	];
    }

    class TableArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { isStaff: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TableArea",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*isStaff*/ ctx[0] === undefined && !('isStaff' in props)) {
    			console.warn("<TableArea> was created without expected prop 'isStaff'");
    		}
    	}

    	get isStaff() {
    		throw new Error("<TableArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isStaff(value) {
    		throw new Error("<TableArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Reservation.svelte generated by Svelte v3.44.3 */

    const file$7 = "src\\components\\Reservation.svelte";

    // (59:12) {#if $validity.dirty && !$validity.valid}
    function create_if_block_1$1(ctx) {
    	let span;
    	let t0;
    	let t1_value = /*$validity*/ ctx[11].message + "";
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("INVALID - ");
    			t1 = text(t1_value);
    			attr_dev(span, "class", "validation-hint svelte-13bmutu");
    			add_location(span, file$7, 59, 16, 2118);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$validity*/ 2048 && t1_value !== (t1_value = /*$validity*/ ctx[11].message + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(59:12) {#if $validity.dirty && !$validity.valid}",
    		ctx
    	});

    	return block;
    }

    // (71:12) {#if $telvalidity.dirty && !$telvalidity.valid}
    function create_if_block$3(ctx) {
    	let span;
    	let t0;
    	let t1_value = /*$telvalidity*/ ctx[12].message + "";
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("INVALID - ");
    			t1 = text(t1_value);
    			attr_dev(span, "class", "validation-hint svelte-13bmutu");
    			add_location(span, file$7, 71, 16, 2616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$telvalidity*/ 4096 && t1_value !== (t1_value = /*$telvalidity*/ ctx[12].message + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(71:12) {#if $telvalidity.dirty && !$telvalidity.valid}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div10;
    	let div3;
    	let div0;
    	let p0;
    	let t1;
    	let input0;
    	let t2;
    	let div1;
    	let p1;
    	let t4;
    	let input1;
    	let t5;
    	let div2;
    	let p2;
    	let t7;
    	let input2;
    	let t8;
    	let div7;
    	let div4;
    	let p3;
    	let t10;
    	let input3;
    	let t11;
    	let div5;
    	let p4;
    	let t13;
    	let input4;
    	let validate_action;
    	let t14;
    	let t15;
    	let div6;
    	let p5;
    	let t17;
    	let input5;
    	let telvalidate_action;
    	let t18;
    	let t19;
    	let div9;
    	let div8;
    	let p6;
    	let t21;
    	let textarea;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$validity*/ ctx[11].dirty && !/*$validity*/ ctx[11].valid && create_if_block_1$1(ctx);
    	let if_block1 = /*$telvalidity*/ ctx[12].dirty && !/*$telvalidity*/ ctx[12].valid && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Datum";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "Uhrzeit";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			div2 = element("div");
    			p2 = element("p");
    			p2.textContent = "Anzahl Personen";
    			t7 = space();
    			input2 = element("input");
    			t8 = space();
    			div7 = element("div");
    			div4 = element("div");
    			p3 = element("p");
    			p3.textContent = "Name";
    			t10 = space();
    			input3 = element("input");
    			t11 = space();
    			div5 = element("div");
    			p4 = element("p");
    			p4.textContent = "E-Mail";
    			t13 = space();
    			input4 = element("input");
    			t14 = space();
    			if (if_block0) if_block0.c();
    			t15 = space();
    			div6 = element("div");
    			p5 = element("p");
    			p5.textContent = "Telefonnummer";
    			t17 = space();
    			input5 = element("input");
    			t18 = space();
    			if (if_block1) if_block1.c();
    			t19 = space();
    			div9 = element("div");
    			div8 = element("div");
    			p6 = element("p");
    			p6.textContent = "Besondere Wünsche:";
    			t21 = space();
    			textarea = element("textarea");
    			add_location(p0, file$7, 21, 12, 619);
    			attr_dev(input0, "class", "input svelte-13bmutu");
    			attr_dev(input0, "type", "date");
    			attr_dev(input0, "placeholder", "24.12.2022");
    			toggle_class(input0, "is-success", /*isDateValid*/ ctx[9]);
    			toggle_class(input0, "is-danger", !/*isDateValid*/ ctx[9]);
    			add_location(input0, file$7, 22, 12, 645);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file$7, 20, 8, 584);
    			add_location(p1, file$7, 28, 12, 891);
    			attr_dev(input1, "class", "input svelte-13bmutu");
    			attr_dev(input1, "type", "time");
    			attr_dev(input1, "placeholder", "16:00");
    			toggle_class(input1, "is-success", /*isTimeValid*/ ctx[10]);
    			toggle_class(input1, "is-danger", !/*isTimeValid*/ ctx[10]);
    			add_location(input1, file$7, 29, 12, 919);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$7, 27, 8, 857);
    			add_location(p2, file$7, 35, 12, 1161);
    			attr_dev(input2, "class", "input svelte-13bmutu");
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "placeholder", "4");
    			toggle_class(input2, "is-success", /*isPersonsValid*/ ctx[7]);
    			toggle_class(input2, "is-danger", !/*isPersonsValid*/ ctx[7]);
    			add_location(input2, file$7, 36, 12, 1197);
    			attr_dev(div2, "class", "column");
    			add_location(div2, file$7, 34, 8, 1127);
    			attr_dev(div3, "class", "columns");
    			add_location(div3, file$7, 19, 4, 553);
    			add_location(p3, file$7, 45, 12, 1491);
    			attr_dev(input3, "class", "input svelte-13bmutu");
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "Santa Claus");
    			toggle_class(input3, "is-success", /*isNameValid*/ ctx[8]);
    			toggle_class(input3, "is-danger", !/*isNameValid*/ ctx[8]);
    			add_location(input3, file$7, 46, 12, 1516);
    			attr_dev(div4, "class", "column");
    			add_location(div4, file$7, 44, 8, 1457);
    			add_location(p4, file$7, 52, 12, 1764);
    			attr_dev(input4, "class", "input svelte-13bmutu");
    			attr_dev(input4, "type", "email");
    			attr_dev(input4, "placeholder", "santas.reindeers@christmas.com");
    			toggle_class(input4, "is-danger", !/*$validity*/ ctx[11].valid);
    			toggle_class(input4, "is-success", /*$validity*/ ctx[11].valid);
    			add_location(input4, file$7, 53, 12, 1791);
    			attr_dev(div5, "class", "column");
    			add_location(div5, file$7, 51, 8, 1730);
    			add_location(p5, file$7, 65, 12, 2304);
    			attr_dev(input5, "class", "input svelte-13bmutu");
    			attr_dev(input5, "type", "tel");
    			attr_dev(input5, "placeholder", "0511 237475");
    			toggle_class(input5, "is-success", /*$telvalidity*/ ctx[12].valid);
    			add_location(input5, file$7, 66, 12, 2338);
    			attr_dev(div6, "class", "column");
    			add_location(div6, file$7, 64, 8, 2270);
    			attr_dev(div7, "class", "columns");
    			add_location(div7, file$7, 43, 4, 1426);
    			add_location(p6, file$7, 79, 12, 2844);
    			attr_dev(textarea, "class", "textarea");
    			attr_dev(textarea, "placeholder", "Tisch in Nähe von Spielecke");
    			add_location(textarea, file$7, 80, 12, 2883);
    			attr_dev(div8, "class", "column");
    			add_location(div8, file$7, 78, 8, 2810);
    			attr_dev(div9, "class", "columns");
    			add_location(div9, file$7, 77, 4, 2779);
    			attr_dev(div10, "class", "p-4 control");
    			add_location(div10, file$7, 18, 0, 522);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div3);
    			append_dev(div3, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			set_input_value(input0, /*date*/ ctx[0]);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			append_dev(div1, p1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			set_input_value(input1, /*time*/ ctx[1]);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, p2);
    			append_dev(div2, t7);
    			append_dev(div2, input2);
    			set_input_value(input2, /*persons*/ ctx[2]);
    			append_dev(div10, t8);
    			append_dev(div10, div7);
    			append_dev(div7, div4);
    			append_dev(div4, p3);
    			append_dev(div4, t10);
    			append_dev(div4, input3);
    			set_input_value(input3, /*name*/ ctx[3]);
    			append_dev(div7, t11);
    			append_dev(div7, div5);
    			append_dev(div5, p4);
    			append_dev(div5, t13);
    			append_dev(div5, input4);
    			set_input_value(input4, /*email*/ ctx[4]);
    			append_dev(div5, t14);
    			if (if_block0) if_block0.m(div5, null);
    			append_dev(div7, t15);
    			append_dev(div7, div6);
    			append_dev(div6, p5);
    			append_dev(div6, t17);
    			append_dev(div6, input5);
    			set_input_value(input5, /*tel*/ ctx[6]);
    			append_dev(div6, t18);
    			if (if_block1) if_block1.m(div6, null);
    			append_dev(div10, t19);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, p6);
    			append_dev(div8, t21);
    			append_dev(div8, textarea);
    			set_input_value(textarea, /*wishes*/ ctx[5]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[14]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[15]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[16]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[17]),
    					action_destroyer(validate_action = validate.call(null, input4, /*email*/ ctx[4])),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[18]),
    					action_destroyer(telvalidate_action = telvalidate.call(null, input5, /*tel*/ ctx[6])),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[19])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*date*/ 1) {
    				set_input_value(input0, /*date*/ ctx[0]);
    			}

    			if (dirty & /*isDateValid*/ 512) {
    				toggle_class(input0, "is-success", /*isDateValid*/ ctx[9]);
    			}

    			if (dirty & /*isDateValid*/ 512) {
    				toggle_class(input0, "is-danger", !/*isDateValid*/ ctx[9]);
    			}

    			if (dirty & /*time*/ 2) {
    				set_input_value(input1, /*time*/ ctx[1]);
    			}

    			if (dirty & /*isTimeValid*/ 1024) {
    				toggle_class(input1, "is-success", /*isTimeValid*/ ctx[10]);
    			}

    			if (dirty & /*isTimeValid*/ 1024) {
    				toggle_class(input1, "is-danger", !/*isTimeValid*/ ctx[10]);
    			}

    			if (dirty & /*persons*/ 4 && to_number(input2.value) !== /*persons*/ ctx[2]) {
    				set_input_value(input2, /*persons*/ ctx[2]);
    			}

    			if (dirty & /*isPersonsValid*/ 128) {
    				toggle_class(input2, "is-success", /*isPersonsValid*/ ctx[7]);
    			}

    			if (dirty & /*isPersonsValid*/ 128) {
    				toggle_class(input2, "is-danger", !/*isPersonsValid*/ ctx[7]);
    			}

    			if (dirty & /*name*/ 8 && input3.value !== /*name*/ ctx[3]) {
    				set_input_value(input3, /*name*/ ctx[3]);
    			}

    			if (dirty & /*isNameValid*/ 256) {
    				toggle_class(input3, "is-success", /*isNameValid*/ ctx[8]);
    			}

    			if (dirty & /*isNameValid*/ 256) {
    				toggle_class(input3, "is-danger", !/*isNameValid*/ ctx[8]);
    			}

    			if (dirty & /*email*/ 16 && input4.value !== /*email*/ ctx[4]) {
    				set_input_value(input4, /*email*/ ctx[4]);
    			}

    			if (validate_action && is_function(validate_action.update) && dirty & /*email*/ 16) validate_action.update.call(null, /*email*/ ctx[4]);

    			if (dirty & /*$validity*/ 2048) {
    				toggle_class(input4, "is-danger", !/*$validity*/ ctx[11].valid);
    			}

    			if (dirty & /*$validity*/ 2048) {
    				toggle_class(input4, "is-success", /*$validity*/ ctx[11].valid);
    			}

    			if (/*$validity*/ ctx[11].dirty && !/*$validity*/ ctx[11].valid) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div5, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*tel*/ 64) {
    				set_input_value(input5, /*tel*/ ctx[6]);
    			}

    			if (telvalidate_action && is_function(telvalidate_action.update) && dirty & /*tel*/ 64) telvalidate_action.update.call(null, /*tel*/ ctx[6]);

    			if (dirty & /*$telvalidity*/ 4096) {
    				toggle_class(input5, "is-success", /*$telvalidity*/ ctx[12].valid);
    			}

    			if (/*$telvalidity*/ ctx[12].dirty && !/*$telvalidity*/ ctx[12].valid) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(div6, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*wishes*/ 32) {
    				set_input_value(textarea, /*wishes*/ ctx[5]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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

    function instance$7($$self, $$props, $$invalidate) {
    	let $validity;
    	let $telvalidity;
    	validate_store(validity, 'validity');
    	component_subscribe($$self, validity, $$value => $$invalidate(11, $validity = $$value));
    	validate_store(telvalidity, 'telvalidity');
    	component_subscribe($$self, telvalidity, $$value => $$invalidate(12, $telvalidity = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Reservation', slots, []);
    	let { date = null } = $$props;
    	let { time = null } = $$props;
    	let { persons = null } = $$props;
    	let { name = '' } = $$props;
    	let { email = '' } = $$props;
    	let wishes, tel;
    	let isPersonsValid, isNameValid, isDateValid, isTimeValid;
    	const writable_props = ['date', 'time', 'persons', 'name', 'email'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Reservation> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		date = this.value;
    		$$invalidate(0, date);
    	}

    	function input1_input_handler() {
    		time = this.value;
    		$$invalidate(1, time);
    	}

    	function input2_input_handler() {
    		persons = to_number(this.value);
    		$$invalidate(2, persons);
    	}

    	function input3_input_handler() {
    		name = this.value;
    		$$invalidate(3, name);
    	}

    	function input4_input_handler() {
    		email = this.value;
    		$$invalidate(4, email);
    	}

    	function input5_input_handler() {
    		tel = this.value;
    		$$invalidate(6, tel);
    	}

    	function textarea_input_handler() {
    		wishes = this.value;
    		$$invalidate(5, wishes);
    	}

    	$$self.$$set = $$props => {
    		if ('date' in $$props) $$invalidate(0, date = $$props.date);
    		if ('time' in $$props) $$invalidate(1, time = $$props.time);
    		if ('persons' in $$props) $$invalidate(2, persons = $$props.persons);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('email' in $$props) $$invalidate(4, email = $$props.email);
    	};

    	$$self.$capture_state = () => ({
    		date,
    		time,
    		persons,
    		name,
    		email,
    		wishes,
    		tel,
    		isPersonsValid,
    		isNameValid,
    		isDateValid,
    		isTimeValid,
    		validate,
    		validity,
    		telvalidate,
    		telvalidity,
    		$validity,
    		$telvalidity
    	});

    	$$self.$inject_state = $$props => {
    		if ('date' in $$props) $$invalidate(0, date = $$props.date);
    		if ('time' in $$props) $$invalidate(1, time = $$props.time);
    		if ('persons' in $$props) $$invalidate(2, persons = $$props.persons);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('email' in $$props) $$invalidate(4, email = $$props.email);
    		if ('wishes' in $$props) $$invalidate(5, wishes = $$props.wishes);
    		if ('tel' in $$props) $$invalidate(6, tel = $$props.tel);
    		if ('isPersonsValid' in $$props) $$invalidate(7, isPersonsValid = $$props.isPersonsValid);
    		if ('isNameValid' in $$props) $$invalidate(8, isNameValid = $$props.isNameValid);
    		if ('isDateValid' in $$props) $$invalidate(9, isDateValid = $$props.isDateValid);
    		if ('isTimeValid' in $$props) $$invalidate(10, isTimeValid = $$props.isTimeValid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*persons*/ 4) {
    			$$invalidate(7, isPersonsValid = persons > 0 && persons < 17);
    		}

    		if ($$self.$$.dirty & /*name*/ 8) {
    			$$invalidate(8, isNameValid = name !== '');
    		}

    		if ($$self.$$.dirty & /*date*/ 1) {
    			$$invalidate(9, isDateValid = date !== null);
    		}

    		if ($$self.$$.dirty & /*time*/ 2) {
    			$$invalidate(10, isTimeValid = time !== null);
    		}
    	};

    	return [
    		date,
    		time,
    		persons,
    		name,
    		email,
    		wishes,
    		tel,
    		isPersonsValid,
    		isNameValid,
    		isDateValid,
    		isTimeValid,
    		$validity,
    		$telvalidity,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		textarea_input_handler
    	];
    }

    class Reservation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			date: 0,
    			time: 1,
    			persons: 2,
    			name: 3,
    			email: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reservation",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get date() {
    		throw new Error("<Reservation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<Reservation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get time() {
    		throw new Error("<Reservation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set time(value) {
    		throw new Error("<Reservation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persons() {
    		throw new Error("<Reservation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persons(value) {
    		throw new Error("<Reservation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Reservation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Reservation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get email() {
    		throw new Error("<Reservation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set email(value) {
    		throw new Error("<Reservation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Menu.svelte generated by Svelte v3.44.3 */

    const file$6 = "src\\components\\Menu.svelte";

    function create_fragment$6(ctx) {
    	let body;
    	let script;
    	let t1;
    	let div43;
    	let div42;
    	let div13;
    	let div12;
    	let header0;
    	let p0;
    	let t3;
    	let div11;
    	let div10;
    	let div1;
    	let div0;
    	let t5;
    	let div3;
    	let div2;
    	let t7;
    	let div5;
    	let div4;
    	let t9;
    	let div7;
    	let div6;
    	let t11;
    	let div9;
    	let div8;
    	let s;
    	let t13;
    	let div27;
    	let div26;
    	let header1;
    	let p1;
    	let t15;
    	let div25;
    	let div24;
    	let div15;
    	let div14;
    	let t17;
    	let div17;
    	let div16;
    	let t19;
    	let div19;
    	let div18;
    	let t21;
    	let div21;
    	let div20;
    	let t23;
    	let div23;
    	let div22;
    	let t25;
    	let div41;
    	let div40;
    	let header2;
    	let p2;
    	let t27;
    	let div39;
    	let div38;
    	let div29;
    	let div28;
    	let t29;
    	let div31;
    	let div30;
    	let t31;
    	let div33;
    	let div32;
    	let t33;
    	let div35;
    	let div34;
    	let t35;
    	let div37;
    	let div36;

    	const block = {
    		c: function create() {
    			body = element("body");
    			script = element("script");
    			script.textContent = "function changeColor(id) {\r\n        if(id == 15){\r\n            document.getElementById(15).innerHTML = \"schäm dich\";\r\n        }\r\n        else if(document.getElementById(id).classList.contains(\"is-success\")) {\r\n            document.getElementById(id).classList = \"notification\";\r\n        } else {\r\n            document.getElementById(id).classList = \"notification is-success\";\r\n        }\r\n    }";
    			t1 = space();
    			div43 = element("div");
    			div42 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			header0 = element("header");
    			p0 = element("p");
    			p0.textContent = "Hauptgerichte";
    			t3 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Veganer Weihnachtsbraten";
    			t5 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "Vegetarischer Weihnachtsbraten";
    			t7 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div4.textContent = "Kartoffelsalat";
    			t9 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div6.textContent = "Rotkohl und Klöße";
    			t11 = space();
    			div9 = element("div");
    			div8 = element("div");
    			s = element("s");
    			s.textContent = "Rentier";
    			t13 = space();
    			div27 = element("div");
    			div26 = element("div");
    			header1 = element("header");
    			p1 = element("p");
    			p1.textContent = "Plätzchen";
    			t15 = space();
    			div25 = element("div");
    			div24 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div14.textContent = "Liebevoll ausgestochene Plätzchen";
    			t17 = space();
    			div17 = element("div");
    			div16 = element("div");
    			div16.textContent = "Schokomakronen";
    			t19 = space();
    			div19 = element("div");
    			div18 = element("div");
    			div18.textContent = "Marzipanmakronen";
    			t21 = space();
    			div21 = element("div");
    			div20 = element("div");
    			div20.textContent = "Schwarz-Weiß-Gebäck";
    			t23 = space();
    			div23 = element("div");
    			div22 = element("div");
    			div22.textContent = "Frankfurter Bethmännchen";
    			t25 = space();
    			div41 = element("div");
    			div40 = element("div");
    			header2 = element("header");
    			p2 = element("p");
    			p2.textContent = "Glühwein";
    			t27 = space();
    			div39 = element("div");
    			div38 = element("div");
    			div29 = element("div");
    			div28 = element("div");
    			div28.textContent = "Christkindl";
    			t29 = space();
    			div31 = element("div");
    			div30 = element("div");
    			div30.textContent = "Glögg";
    			t31 = space();
    			div33 = element("div");
    			div32 = element("div");
    			div32.textContent = "Der gute von IKEA";
    			t33 = space();
    			div35 = element("div");
    			div34 = element("div");
    			div34.textContent = "Der nicht so gute aus dem Tetra Pak";
    			t35 = space();
    			div37 = element("div");
    			div36 = element("div");
    			div36.textContent = "Feuerzangenbowle";
    			add_location(script, file$6, 2, 0, 10);
    			attr_dev(p0, "class", "card-header-title");
    			add_location(p0, file$6, 21, 20, 617);
    			attr_dev(header0, "class", "card-header");
    			add_location(header0, file$6, 20, 16, 567);
    			attr_dev(div0, "class", "notification");
    			attr_dev(div0, "id", "11");
    			attr_dev(div0, "onclick", "changeColor(11)");
    			add_location(div0, file$6, 28, 28, 904);
    			attr_dev(div1, "class", "container m-2");
    			add_location(div1, file$6, 27, 24, 847);
    			attr_dev(div2, "class", "notification");
    			attr_dev(div2, "id", "12");
    			attr_dev(div2, "onclick", "changeColor(12)");
    			add_location(div2, file$6, 33, 28, 1171);
    			attr_dev(div3, "class", "container m-2");
    			add_location(div3, file$6, 32, 24, 1114);
    			attr_dev(div4, "class", "notification");
    			attr_dev(div4, "id", "13");
    			attr_dev(div4, "onclick", "changeColor(13)");
    			add_location(div4, file$6, 38, 28, 1445);
    			attr_dev(div5, "class", "container m-2");
    			add_location(div5, file$6, 37, 24, 1388);
    			attr_dev(div6, "class", "notification");
    			attr_dev(div6, "id", "14");
    			attr_dev(div6, "onclick", "changeColor(14)");
    			add_location(div6, file$6, 43, 28, 1703);
    			attr_dev(div7, "class", "container m-2");
    			add_location(div7, file$6, 42, 24, 1646);
    			add_location(s, file$6, 49, 32, 2057);
    			attr_dev(div8, "class", "notification");
    			attr_dev(div8, "id", "15");
    			attr_dev(div8, "onclick", "changeColor(15)");
    			add_location(div8, file$6, 48, 28, 1964);
    			attr_dev(div9, "class", "container m-2");
    			add_location(div9, file$6, 47, 24, 1907);
    			attr_dev(div10, "class", "content");
    			add_location(div10, file$6, 26, 20, 800);
    			attr_dev(div11, "class", "card-content");
    			add_location(div11, file$6, 25, 16, 752);
    			attr_dev(div12, "class", "card");
    			add_location(div12, file$6, 19, 12, 531);
    			attr_dev(div13, "class", "column");
    			add_location(div13, file$6, 18, 8, 496);
    			attr_dev(p1, "class", "card-header-title");
    			add_location(p1, file$6, 60, 20, 2359);
    			attr_dev(header1, "class", "card-header");
    			add_location(header1, file$6, 59, 16, 2309);
    			attr_dev(div14, "class", "notification");
    			attr_dev(div14, "id", "21");
    			attr_dev(div14, "onclick", "changeColor(21)");
    			add_location(div14, file$6, 67, 28, 2642);
    			attr_dev(div15, "class", "container m-2");
    			add_location(div15, file$6, 66, 24, 2585);
    			attr_dev(div16, "class", "notification");
    			attr_dev(div16, "id", "22");
    			attr_dev(div16, "onclick", "changeColor(22)");
    			add_location(div16, file$6, 72, 28, 2918);
    			attr_dev(div17, "class", "container m-2");
    			add_location(div17, file$6, 71, 24, 2861);
    			attr_dev(div18, "class", "notification");
    			attr_dev(div18, "id", "23");
    			attr_dev(div18, "onclick", "changeColor(23)");
    			add_location(div18, file$6, 77, 28, 3176);
    			attr_dev(div19, "class", "container m-2");
    			add_location(div19, file$6, 76, 24, 3119);
    			attr_dev(div20, "class", "notification");
    			attr_dev(div20, "id", "24");
    			attr_dev(div20, "onclick", "changeColor(24)");
    			add_location(div20, file$6, 82, 28, 3436);
    			attr_dev(div21, "class", "container m-2");
    			add_location(div21, file$6, 81, 24, 3379);
    			attr_dev(div22, "class", "notification");
    			attr_dev(div22, "id", "25");
    			attr_dev(div22, "onclick", "changeColor(25)");
    			add_location(div22, file$6, 87, 28, 3699);
    			attr_dev(div23, "class", "container m-2");
    			add_location(div23, file$6, 86, 24, 3642);
    			attr_dev(div24, "class", "content");
    			add_location(div24, file$6, 65, 20, 2538);
    			attr_dev(div25, "class", "card-content");
    			add_location(div25, file$6, 64, 16, 2490);
    			attr_dev(div26, "class", "card");
    			add_location(div26, file$6, 58, 12, 2273);
    			attr_dev(div27, "class", "column");
    			add_location(div27, file$6, 57, 8, 2239);
    			attr_dev(p2, "class", "card-header-title");
    			add_location(p2, file$6, 99, 20, 4104);
    			attr_dev(header2, "class", "card-header");
    			add_location(header2, file$6, 98, 16, 4054);
    			attr_dev(div28, "class", "notification");
    			attr_dev(div28, "id", "31");
    			attr_dev(div28, "onclick", "changeColor(31)");
    			add_location(div28, file$6, 106, 28, 4386);
    			attr_dev(div29, "class", "container m-2");
    			add_location(div29, file$6, 105, 24, 4329);
    			attr_dev(div30, "class", "notification");
    			attr_dev(div30, "id", "32");
    			attr_dev(div30, "onclick", "changeColor(32)");
    			add_location(div30, file$6, 111, 28, 4640);
    			attr_dev(div31, "class", "container m-2");
    			add_location(div31, file$6, 110, 24, 4583);
    			attr_dev(div32, "class", "notification");
    			attr_dev(div32, "id", "33");
    			attr_dev(div32, "onclick", "changeColor(33)");
    			add_location(div32, file$6, 116, 28, 4889);
    			attr_dev(div33, "class", "container m-2");
    			add_location(div33, file$6, 115, 24, 4832);
    			attr_dev(div34, "class", "notification");
    			attr_dev(div34, "id", "34");
    			attr_dev(div34, "onclick", "changeColor(34)");
    			add_location(div34, file$6, 121, 28, 5150);
    			attr_dev(div35, "class", "container m-2");
    			add_location(div35, file$6, 120, 24, 5093);
    			attr_dev(div36, "class", "notification");
    			attr_dev(div36, "id", "35");
    			attr_dev(div36, "onclick", "changeColor(35)");
    			add_location(div36, file$6, 126, 28, 5429);
    			attr_dev(div37, "class", "container m-2");
    			add_location(div37, file$6, 125, 24, 5372);
    			attr_dev(div38, "class", "content");
    			add_location(div38, file$6, 104, 20, 4282);
    			attr_dev(div39, "class", "card-content");
    			add_location(div39, file$6, 103, 16, 4234);
    			attr_dev(div40, "class", "card");
    			add_location(div40, file$6, 97, 12, 4018);
    			attr_dev(div41, "class", "column");
    			add_location(div41, file$6, 96, 8, 3984);
    			attr_dev(div42, "class", "columns");
    			add_location(div42, file$6, 17, 4, 465);
    			attr_dev(div43, "class", "p-4 control");
    			add_location(div43, file$6, 16, 0, 434);
    			add_location(body, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, script);
    			append_dev(body, t1);
    			append_dev(body, div43);
    			append_dev(div43, div42);
    			append_dev(div42, div13);
    			append_dev(div13, div12);
    			append_dev(div12, header0);
    			append_dev(header0, p0);
    			append_dev(div12, t3);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div1);
    			append_dev(div1, div0);
    			append_dev(div10, t5);
    			append_dev(div10, div3);
    			append_dev(div3, div2);
    			append_dev(div10, t7);
    			append_dev(div10, div5);
    			append_dev(div5, div4);
    			append_dev(div10, t9);
    			append_dev(div10, div7);
    			append_dev(div7, div6);
    			append_dev(div10, t11);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, s);
    			append_dev(div42, t13);
    			append_dev(div42, div27);
    			append_dev(div27, div26);
    			append_dev(div26, header1);
    			append_dev(header1, p1);
    			append_dev(div26, t15);
    			append_dev(div26, div25);
    			append_dev(div25, div24);
    			append_dev(div24, div15);
    			append_dev(div15, div14);
    			append_dev(div24, t17);
    			append_dev(div24, div17);
    			append_dev(div17, div16);
    			append_dev(div24, t19);
    			append_dev(div24, div19);
    			append_dev(div19, div18);
    			append_dev(div24, t21);
    			append_dev(div24, div21);
    			append_dev(div21, div20);
    			append_dev(div24, t23);
    			append_dev(div24, div23);
    			append_dev(div23, div22);
    			append_dev(div42, t25);
    			append_dev(div42, div41);
    			append_dev(div41, div40);
    			append_dev(div40, header2);
    			append_dev(header2, p2);
    			append_dev(div40, t27);
    			append_dev(div40, div39);
    			append_dev(div39, div38);
    			append_dev(div38, div29);
    			append_dev(div29, div28);
    			append_dev(div38, t29);
    			append_dev(div38, div31);
    			append_dev(div31, div30);
    			append_dev(div38, t31);
    			append_dev(div38, div33);
    			append_dev(div33, div32);
    			append_dev(div38, t33);
    			append_dev(div38, div35);
    			append_dev(div35, div34);
    			append_dev(div38, t35);
    			append_dev(div38, div37);
    			append_dev(div37, div36);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
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

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\icons\Minus.svelte generated by Svelte v3.44.3 */

    const file$5 = "src\\components\\icons\\Minus.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "#7e0f12");
    			attr_dev(path, "d", "M19,11H5a1,1,0,0,0,0,2H19a1,1,0,0,0,0-2Z");
    			add_location(path, file$5, 1, 4, 89);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			add_location(svg, file$5, 0, 0, 0);
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
    			if (detaching) detach_dev(svg);
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

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Minus', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Minus> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Minus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Minus",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\components\icons\Plus.svelte generated by Svelte v3.44.3 */

    const file$4 = "src\\components\\icons\\Plus.svelte";

    function create_fragment$4(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "#7e0f12");
    			attr_dev(path, "d", "M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z");
    			add_location(path, file$4, 1, 4, 89);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			add_location(svg, file$4, 0, 0, 0);
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
    			if (detaching) detach_dev(svg);
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

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Plus', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Plus> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Plus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Plus",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\components\Collapsable.svelte generated by Svelte v3.44.3 */
    const file$3 = "src\\components\\Collapsable.svelte";

    // (19:8) {#if optional}
    function create_if_block_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Optional";
    			attr_dev(span, "class", "tag is-primary is-light");
    			add_location(span, file$3, 19, 12, 419);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(19:8) {#if optional}",
    		ctx
    	});

    	return block;
    }

    // (25:4) {:else}
    function create_else_block$1(ctx) {
    	let minus;
    	let current;
    	minus = new Minus({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(minus.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(minus, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(minus.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(minus.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(minus, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(25:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#if !visible}
    function create_if_block$2(ctx) {
    	let plus;
    	let current;
    	plus = new Plus({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(plus.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(plus, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(plus.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(plus.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(plus, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(23:4) {#if !visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let current_block_type_index;
    	let if_block1;
    	let t3;
    	let div2;
    	let div2_style_value;
    	let t4;
    	let hr;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*optional*/ ctx[1] && create_if_block_1(ctx);
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*visible*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(/*label*/ ctx[0]);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if_block1.c();
    			t3 = space();
    			div2 = element("div");
    			if (default_slot) default_slot.c();
    			t4 = space();
    			hr = element("hr");
    			attr_dev(span, "class", "mr-2");
    			add_location(span, file$3, 15, 8, 324);
    			add_location(div0, file$3, 14, 4, 309);
    			attr_dev(div1, "class", "level");
    			add_location(div1, file$3, 13, 0, 264);
    			attr_dev(div2, "class", "px-8 py-2");
    			attr_dev(div2, "style", div2_style_value = /*visible*/ ctx[2] ? "display: block" : "display: none");
    			add_location(div2, file$3, 29, 0, 592);
    			add_location(hr, file$3, 33, 0, 694);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div0, t1);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div1, t2);
    			if_blocks[current_block_type_index].m(div1, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			insert_dev(target, t4, anchor);
    			insert_dev(target, hr, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*collapse*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*label*/ 1) set_data_dev(t0, /*label*/ ctx[0]);

    			if (/*optional*/ ctx[1]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

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
    				if_block1.m(div1, null);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*visible*/ 4 && div2_style_value !== (div2_style_value = /*visible*/ ctx[2] ? "display: block" : "display: none")) {
    				attr_dev(div2, "style", div2_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(hr);
    			mounted = false;
    			dispose();
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
    	validate_slots('Collapsable', slots, ['default']);
    	let { label } = $$props;
    	let { optional = true } = $$props;
    	let visible = false;

    	function collapse() {
    		$$invalidate(2, visible = !visible);
    	}

    	const writable_props = ['label', 'optional'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Collapsable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    		if ('optional' in $$props) $$invalidate(1, optional = $$props.optional);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Minus,
    		Plus,
    		label,
    		optional,
    		visible,
    		collapse
    	});

    	$$self.$inject_state = $$props => {
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    		if ('optional' in $$props) $$invalidate(1, optional = $$props.optional);
    		if ('visible' in $$props) $$invalidate(2, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, optional, visible, collapse, $$scope, slots];
    }

    class Collapsable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { label: 0, optional: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Collapsable",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*label*/ ctx[0] === undefined && !('label' in props)) {
    			console.warn("<Collapsable> was created without expected prop 'label'");
    		}
    	}

    	get label() {
    		throw new Error("<Collapsable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Collapsable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get optional() {
    		throw new Error("<Collapsable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set optional(value) {
    		throw new Error("<Collapsable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Customer.svelte generated by Svelte v3.44.3 */
    const file$2 = "src\\components\\Customer.svelte";

    // (28:8) <Collapsable              label="Speisekarte"          >
    function create_default_slot(ctx) {
    	let menu;
    	let current;
    	menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(menu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(menu, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(menu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(28:8) <Collapsable              label=\\\"Speisekarte\\\"          >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div6;
    	let div4;
    	let div0;
    	let reservation;
    	let updating_date;
    	let updating_time;
    	let updating_persons;
    	let updating_name;
    	let updating_email;
    	let t0;
    	let div1;
    	let collapsable;
    	let t1;
    	let div3;
    	let div2;
    	let button;
    	let span;
    	let button_disabled_value;
    	let t3;
    	let div5;
    	let tablearea;
    	let current;
    	let mounted;
    	let dispose;

    	function reservation_date_binding(value) {
    		/*reservation_date_binding*/ ctx[8](value);
    	}

    	function reservation_time_binding(value) {
    		/*reservation_time_binding*/ ctx[9](value);
    	}

    	function reservation_persons_binding(value) {
    		/*reservation_persons_binding*/ ctx[10](value);
    	}

    	function reservation_name_binding(value) {
    		/*reservation_name_binding*/ ctx[11](value);
    	}

    	function reservation_email_binding(value) {
    		/*reservation_email_binding*/ ctx[12](value);
    	}

    	let reservation_props = {};

    	if (/*date*/ ctx[0] !== void 0) {
    		reservation_props.date = /*date*/ ctx[0];
    	}

    	if (/*time*/ ctx[1] !== void 0) {
    		reservation_props.time = /*time*/ ctx[1];
    	}

    	if (/*persons*/ ctx[2] !== void 0) {
    		reservation_props.persons = /*persons*/ ctx[2];
    	}

    	if (/*name*/ ctx[3] !== void 0) {
    		reservation_props.name = /*name*/ ctx[3];
    	}

    	if (/*email*/ ctx[4] !== void 0) {
    		reservation_props.email = /*email*/ ctx[4];
    	}

    	reservation = new Reservation({ props: reservation_props, $$inline: true });
    	binding_callbacks.push(() => bind(reservation, 'date', reservation_date_binding));
    	binding_callbacks.push(() => bind(reservation, 'time', reservation_time_binding));
    	binding_callbacks.push(() => bind(reservation, 'persons', reservation_persons_binding));
    	binding_callbacks.push(() => bind(reservation, 'name', reservation_name_binding));
    	binding_callbacks.push(() => bind(reservation, 'email', reservation_email_binding));

    	collapsable = new Collapsable({
    			props: {
    				label: "Speisekarte",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tablearea = new TableArea({ props: { isStaff: "0" }, $$inline: true });

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			create_component(reservation.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(collapsable.$$.fragment);
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			button = element("button");
    			span = element("span");
    			span.textContent = "Reservieren";
    			t3 = space();
    			div5 = element("div");
    			create_component(tablearea.$$.fragment);
    			attr_dev(div0, "class", "box");
    			add_location(div0, file$2, 17, 8, 590);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$2, 26, 8, 814);
    			add_location(span, file$2, 36, 20, 1305);
    			button.disabled = button_disabled_value = !/*isValid*/ ctx[5] || !/*$validity*/ ctx[6].valid || !/*$telvalidity*/ ctx[7];
    			attr_dev(button, "class", "button is-primary");
    			add_location(button, file$2, 35, 16, 1050);
    			attr_dev(div2, "class", "buttons is-right");
    			add_location(div2, file$2, 34, 12, 1002);
    			attr_dev(div3, "class", "column");
    			add_location(div3, file$2, 33, 8, 968);
    			attr_dev(div4, "class", "column is-half");
    			add_location(div4, file$2, 16, 4, 552);
    			attr_dev(div5, "class", "column is-half");
    			add_location(div5, file$2, 41, 4, 1410);
    			attr_dev(div6, "class", "columns m-5");
    			add_location(div6, file$2, 15, 0, 521);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div4);
    			append_dev(div4, div0);
    			mount_component(reservation, div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			mount_component(collapsable, div1, null);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(button, span);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			mount_component(tablearea, div5, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const reservation_changes = {};

    			if (!updating_date && dirty & /*date*/ 1) {
    				updating_date = true;
    				reservation_changes.date = /*date*/ ctx[0];
    				add_flush_callback(() => updating_date = false);
    			}

    			if (!updating_time && dirty & /*time*/ 2) {
    				updating_time = true;
    				reservation_changes.time = /*time*/ ctx[1];
    				add_flush_callback(() => updating_time = false);
    			}

    			if (!updating_persons && dirty & /*persons*/ 4) {
    				updating_persons = true;
    				reservation_changes.persons = /*persons*/ ctx[2];
    				add_flush_callback(() => updating_persons = false);
    			}

    			if (!updating_name && dirty & /*name*/ 8) {
    				updating_name = true;
    				reservation_changes.name = /*name*/ ctx[3];
    				add_flush_callback(() => updating_name = false);
    			}

    			if (!updating_email && dirty & /*email*/ 16) {
    				updating_email = true;
    				reservation_changes.email = /*email*/ ctx[4];
    				add_flush_callback(() => updating_email = false);
    			}

    			reservation.$set(reservation_changes);
    			const collapsable_changes = {};

    			if (dirty & /*$$scope*/ 16384) {
    				collapsable_changes.$$scope = { dirty, ctx };
    			}

    			collapsable.$set(collapsable_changes);

    			if (!current || dirty & /*isValid, $validity, $telvalidity*/ 224 && button_disabled_value !== (button_disabled_value = !/*isValid*/ ctx[5] || !/*$validity*/ ctx[6].valid || !/*$telvalidity*/ ctx[7])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(reservation.$$.fragment, local);
    			transition_in(collapsable.$$.fragment, local);
    			transition_in(tablearea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(reservation.$$.fragment, local);
    			transition_out(collapsable.$$.fragment, local);
    			transition_out(tablearea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(reservation);
    			destroy_component(collapsable);
    			destroy_component(tablearea);
    			mounted = false;
    			dispose();
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
    	let $validity;
    	let $telvalidity;
    	validate_store(validity, 'validity');
    	component_subscribe($$self, validity, $$value => $$invalidate(6, $validity = $$value));
    	validate_store(telvalidity, 'telvalidity');
    	component_subscribe($$self, telvalidity, $$value => $$invalidate(7, $telvalidity = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Customer', slots, []);
    	let date, time, persons, name, email;
    	let isValid = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Customer> was created with unknown prop '${key}'`);
    	});

    	function reservation_date_binding(value) {
    		date = value;
    		$$invalidate(0, date);
    	}

    	function reservation_time_binding(value) {
    		time = value;
    		$$invalidate(1, time);
    	}

    	function reservation_persons_binding(value) {
    		persons = value;
    		$$invalidate(2, persons);
    	}

    	function reservation_name_binding(value) {
    		name = value;
    		$$invalidate(3, name);
    	}

    	function reservation_email_binding(value) {
    		email = value;
    		$$invalidate(4, email);
    	}

    	const click_handler = () => alert('Vielen Dank für Ihre Reservierung, wir haben Ihre Daten erhalten!\nSie haben eine Bestätigung per E-Mail erhalten.');

    	$$self.$capture_state = () => ({
    		TableArea,
    		Reservation,
    		Menu,
    		Collapsable,
    		date,
    		time,
    		persons,
    		name,
    		email,
    		isValid,
    		validity,
    		telvalidity,
    		$validity,
    		$telvalidity
    	});

    	$$self.$inject_state = $$props => {
    		if ('date' in $$props) $$invalidate(0, date = $$props.date);
    		if ('time' in $$props) $$invalidate(1, time = $$props.time);
    		if ('persons' in $$props) $$invalidate(2, persons = $$props.persons);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('email' in $$props) $$invalidate(4, email = $$props.email);
    		if ('isValid' in $$props) $$invalidate(5, isValid = $$props.isValid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*date, time, persons, name, email*/ 31) {
    			$$invalidate(5, isValid = date !== null && time !== null && persons > 0 && persons < 17 && name !== "" && email !== "");
    		}
    	};

    	return [
    		date,
    		time,
    		persons,
    		name,
    		email,
    		isValid,
    		$validity,
    		$telvalidity,
    		reservation_date_binding,
    		reservation_time_binding,
    		reservation_persons_binding,
    		reservation_name_binding,
    		reservation_email_binding,
    		click_handler
    	];
    }

    class Customer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Customer",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\Staff.svelte generated by Svelte v3.44.3 */

    const { console: console_1 } = globals;
    const file$1 = "src\\components\\Staff.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[23] = list;
    	child_ctx[24] = i;
    	return child_ctx;
    }

    // (100:16) {#if res.id != 0}
    function create_if_block$1(ctx) {
    	let li;
    	let div6;
    	let div2;
    	let div0;
    	let t0_value = /*res*/ ctx[22].name + "";
    	let t0;
    	let div0_id_value;
    	let t1;
    	let div1;
    	let t2_value = /*res*/ ctx[22].date + "";
    	let t2;
    	let t3;
    	let t4_value = /*res*/ ctx[22].time + "";
    	let t4;
    	let t5;
    	let t6_value = /*res*/ ctx[22].persons + "";
    	let t6;
    	let div2_id_value;
    	let t7;
    	let div5;
    	let div3;
    	let input0;
    	let t8;
    	let div4;
    	let input1;
    	let t9;
    	let input2;
    	let t10;
    	let input3;
    	let t11;
    	let p0;
    	let strong0;
    	let t13;
    	let p1;
    	let strong1;
    	let div5_id_value;
    	let mounted;
    	let dispose;

    	function input0_input_handler() {
    		/*input0_input_handler*/ ctx[11].call(input0, /*each_value*/ ctx[23], /*res_index*/ ctx[24]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[12].call(input1, /*each_value*/ ctx[23], /*res_index*/ ctx[24]);
    	}

    	function input2_input_handler() {
    		/*input2_input_handler*/ ctx[13].call(input2, /*each_value*/ ctx[23], /*res_index*/ ctx[24]);
    	}

    	function input3_input_handler() {
    		/*input3_input_handler*/ ctx[14].call(input3, /*each_value*/ ctx[23], /*res_index*/ ctx[24]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			t4 = text(t4_value);
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			div5 = element("div");
    			div3 = element("div");
    			input0 = element("input");
    			t8 = space();
    			div4 = element("div");
    			input1 = element("input");
    			t9 = space();
    			input2 = element("input");
    			t10 = space();
    			input3 = element("input");
    			t11 = space();
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Save";
    			t13 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Delete";
    			attr_dev(div0, "class", "message-header");
    			attr_dev(div0, "id", div0_id_value = /*res*/ ctx[22].id + 10);
    			add_location(div0, file$1, 104, 28, 3393);
    			attr_dev(div1, "class", "message-body");
    			set_style(div1, "font-size", "15pt");
    			add_location(div1, file$1, 115, 28, 3954);
    			attr_dev(div2, "id", div2_id_value = /*res*/ ctx[22].id);
    			add_location(div2, file$1, 103, 24, 3346);
    			attr_dev(input0, "placeholder", "Name");
    			add_location(input0, file$1, 126, 28, 4492);
    			attr_dev(div3, "class", "message-header");
    			add_location(div3, file$1, 123, 28, 4331);
    			attr_dev(input1, "placeholder", "Date");
    			add_location(input1, file$1, 130, 28, 4705);
    			attr_dev(input2, "placeholder", "Time");
    			add_location(input2, file$1, 131, 28, 4783);
    			attr_dev(input3, "placeholder", "Persons");
    			add_location(input3, file$1, 132, 28, 4862);
    			add_location(strong0, file$1, 133, 92, 5011);
    			attr_dev(p0, "class", "button is-primary");
    			add_location(p0, file$1, 133, 28, 4947);
    			add_location(strong1, file$1, 134, 94, 5132);
    			attr_dev(p1, "class", "button is-primary");
    			add_location(p1, file$1, 134, 28, 5066);
    			attr_dev(div4, "class", "message-body");
    			set_style(div4, "font-size", "15pt");
    			add_location(div4, file$1, 129, 24, 4624);
    			attr_dev(div5, "id", div5_id_value = -/*res*/ ctx[22].id);
    			set_style(div5, "display", "none");
    			add_location(div5, file$1, 122, 24, 4261);
    			attr_dev(div6, "class", "message mb-2");
    			add_location(div6, file$1, 102, 20, 3294);
    			add_location(li, file$1, 101, 16, 3268);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div6);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, input0);
    			set_input_value(input0, /*res*/ ctx[22].name);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, input1);
    			set_input_value(input1, /*res*/ ctx[22].date);
    			append_dev(div4, t9);
    			append_dev(div4, input2);
    			set_input_value(input2, /*res*/ ctx[22].time);
    			append_dev(div4, t10);
    			append_dev(div4, input3);
    			set_input_value(input3, /*res*/ ctx[22].persons);
    			append_dev(div4, t11);
    			append_dev(div4, p0);
    			append_dev(p0, strong0);
    			append_dev(div4, t13);
    			append_dev(div4, p1);
    			append_dev(p1, strong1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "focus", /*onFocus*/ ctx[5], false, false, false),
    					listen_dev(div0, "blur", /*onBlur*/ ctx[6], false, false, false),
    					listen_dev(
    						div0,
    						"click",
    						function () {
    							if (is_function(/*changeReservation*/ ctx[8](/*res*/ ctx[22].id))) /*changeReservation*/ ctx[8](/*res*/ ctx[22].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div0,
    						"mouseover",
    						function () {
    							if (is_function(hover(/*res*/ ctx[22].id + 10))) hover(/*res*/ ctx[22].id + 10).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div0,
    						"mouseout",
    						function () {
    							if (is_function(hoverNot(/*res*/ ctx[22].id + 10))) hoverNot(/*res*/ ctx[22].id + 10).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(input0, "input", input0_input_handler),
    					listen_dev(
    						div3,
    						"click",
    						function () {
    							if (is_function(/*changeReservation*/ ctx[8](/*res*/ ctx[22].id))) /*changeReservation*/ ctx[8](/*res*/ ctx[22].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(input1, "input", input1_input_handler),
    					listen_dev(input2, "input", input2_input_handler),
    					listen_dev(input3, "input", input3_input_handler),
    					listen_dev(
    						p0,
    						"click",
    						function () {
    							if (is_function(/*saveReservation*/ ctx[9](/*res*/ ctx[22].id))) /*saveReservation*/ ctx[9](/*res*/ ctx[22].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						p1,
    						"click",
    						function () {
    							if (is_function(/*deleteReservation*/ ctx[10](/*res*/ ctx[22].id))) /*deleteReservation*/ ctx[10](/*res*/ ctx[22].id).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*reservations*/ 16 && t0_value !== (t0_value = /*res*/ ctx[22].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*reservations*/ 16 && div0_id_value !== (div0_id_value = /*res*/ ctx[22].id + 10)) {
    				attr_dev(div0, "id", div0_id_value);
    			}

    			if (dirty & /*reservations*/ 16 && t2_value !== (t2_value = /*res*/ ctx[22].date + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*reservations*/ 16 && t4_value !== (t4_value = /*res*/ ctx[22].time + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*reservations*/ 16 && t6_value !== (t6_value = /*res*/ ctx[22].persons + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*reservations*/ 16 && div2_id_value !== (div2_id_value = /*res*/ ctx[22].id)) {
    				attr_dev(div2, "id", div2_id_value);
    			}

    			if (dirty & /*reservations*/ 16 && input0.value !== /*res*/ ctx[22].name) {
    				set_input_value(input0, /*res*/ ctx[22].name);
    			}

    			if (dirty & /*reservations*/ 16 && input1.value !== /*res*/ ctx[22].date) {
    				set_input_value(input1, /*res*/ ctx[22].date);
    			}

    			if (dirty & /*reservations*/ 16 && input2.value !== /*res*/ ctx[22].time) {
    				set_input_value(input2, /*res*/ ctx[22].time);
    			}

    			if (dirty & /*reservations*/ 16 && input3.value !== /*res*/ ctx[22].persons) {
    				set_input_value(input3, /*res*/ ctx[22].persons);
    			}

    			if (dirty & /*reservations*/ 16 && div5_id_value !== (div5_id_value = -/*res*/ ctx[22].id)) {
    				attr_dev(div5, "id", div5_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(100:16) {#if res.id != 0}",
    		ctx
    	});

    	return block;
    }

    // (99:16) {#each reservations as res}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*res*/ ctx[22].id != 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*res*/ ctx[22].id != 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(99:16) {#each reservations as res}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div8;
    	let div6;
    	let div5;
    	let h1;
    	let t1;
    	let div0;
    	let t2;
    	let div4;
    	let ul;
    	let t3;
    	let div3;
    	let div1;
    	let input0;
    	let t4;
    	let div2;
    	let input1;
    	let t5;
    	let input2;
    	let t6;
    	let input3;
    	let t7;
    	let p0;
    	let strong0;
    	let t9;
    	let p1;
    	let strong1;
    	let t11;
    	let div7;
    	let tablearea;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*reservations*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	tablearea = new TableArea({ props: { isStaff: "1" }, $$inline: true });

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Reservations";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div4 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div3 = element("div");
    			div1 = element("div");
    			input0 = element("input");
    			t4 = space();
    			div2 = element("div");
    			input1 = element("input");
    			t5 = space();
    			input2 = element("input");
    			t6 = space();
    			input3 = element("input");
    			t7 = space();
    			p0 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Create";
    			t9 = space();
    			p1 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "New";
    			t11 = space();
    			div7 = element("div");
    			create_component(tablearea.$$.fragment);
    			attr_dev(h1, "class", "svelte-cpgfvq");
    			add_location(h1, file$1, 92, 12, 2981);
    			add_location(div0, file$1, 93, 12, 3017);
    			attr_dev(input0, "placeholder", "Name");
    			add_location(input0, file$1, 144, 24, 5497);
    			attr_dev(div1, "class", "message-header");
    			add_location(div1, file$1, 143, 20, 5443);
    			attr_dev(input1, "placeholder", "Date");
    			add_location(input1, file$1, 147, 24, 5643);
    			attr_dev(input2, "placeholder", "Time");
    			add_location(input2, file$1, 148, 24, 5713);
    			attr_dev(input3, "placeholder", "Nr of Persons");
    			add_location(input3, file$1, 149, 24, 5783);
    			add_location(strong0, file$1, 150, 82, 5923);
    			attr_dev(p0, "class", "button is-primary");
    			add_location(p0, file$1, 150, 24, 5865);
    			attr_dev(div2, "class", "message-body");
    			add_location(div2, file$1, 146, 20, 5591);
    			attr_dev(div3, "id", "input");
    			attr_dev(div3, "class", "message mb-2");
    			set_style(div3, "display", "none");
    			add_location(div3, file$1, 142, 16, 5363);
    			attr_dev(ul, "class", "p-2");
    			set_style(ul, "height", "648px");
    			add_location(ul, file$1, 97, 12, 3114);
    			set_style(div4, "overflow", "hidden");
    			set_style(div4, "overflow-y", "scroll");
    			add_location(div4, file$1, 96, 8, 3050);
    			add_location(strong1, file$1, 154, 67, 6080);
    			attr_dev(p1, "class", "button is-primary");
    			add_location(p1, file$1, 154, 12, 6025);
    			set_style(div5, "border", "solid");
    			set_style(div5, "border-right", "0px");
    			add_location(div5, file$1, 91, 8, 2920);
    			set_style(div6, "flex", "1%");
    			add_location(div6, file$1, 90, 4, 2887);
    			attr_dev(div7, "class", "column");
    			set_style(div7, "border", "solid");
    			add_location(div7, file$1, 159, 4, 6146);
    			attr_dev(div8, "class", "staff svelte-cpgfvq");
    			add_location(div8, file$1, 89, 0, 2862);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div6);
    			append_dev(div6, div5);
    			append_dev(div5, h1);
    			append_dev(div5, t1);
    			append_dev(div5, div0);
    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			append_dev(div4, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t3);
    			append_dev(ul, div3);
    			append_dev(div3, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*name*/ ctx[0]);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, input1);
    			set_input_value(input1, /*date*/ ctx[1]);
    			append_dev(div2, t5);
    			append_dev(div2, input2);
    			set_input_value(input2, /*time*/ ctx[2]);
    			append_dev(div2, t6);
    			append_dev(div2, input3);
    			set_input_value(input3, /*persons*/ ctx[3]);
    			append_dev(div2, t7);
    			append_dev(div2, p0);
    			append_dev(p0, strong0);
    			append_dev(div5, t9);
    			append_dev(div5, p1);
    			append_dev(p1, strong1);
    			append_dev(div8, t11);
    			append_dev(div8, div7);
    			mount_component(tablearea, div7, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[15]),
    					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[16]),
    					listen_dev(input2, "input", /*input2_input_handler_1*/ ctx[17]),
    					listen_dev(input3, "input", /*input3_input_handler_1*/ ctx[18]),
    					listen_dev(p0, "click", /*createReservation*/ ctx[7], false, false, false),
    					listen_dev(p1, "click", newReservation, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*reservations, deleteReservation, saveReservation, changeReservation, onFocus, onBlur, hover, hoverNot*/ 1904) {
    				each_value = /*reservations*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*name*/ 1 && input0.value !== /*name*/ ctx[0]) {
    				set_input_value(input0, /*name*/ ctx[0]);
    			}

    			if (dirty & /*date*/ 2 && input1.value !== /*date*/ ctx[1]) {
    				set_input_value(input1, /*date*/ ctx[1]);
    			}

    			if (dirty & /*time*/ 4 && input2.value !== /*time*/ ctx[2]) {
    				set_input_value(input2, /*time*/ ctx[2]);
    			}

    			if (dirty & /*persons*/ 8 && input3.value !== /*persons*/ ctx[3]) {
    				set_input_value(input3, /*persons*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablearea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablearea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			destroy_each(each_blocks, detaching);
    			destroy_component(tablearea);
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

    function newReservation() {
    	var input = document.getElementById("input");
    	input.style.display = "block";
    }

    function hover(id) {
    	var input = document.getElementById(id);
    	input.style.color = "red";
    }

    function hoverNot(id) {
    	var input = document.getElementById(id);
    	input.style.color = "white";
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let reservations;
    	let $selectedListSize;
    	let $selectedIds;
    	validate_store(selectedListSize, 'selectedListSize');
    	component_subscribe($$self, selectedListSize, $$value => $$invalidate(19, $selectedListSize = $$value));
    	validate_store(selectedIds, 'selectedIds');
    	component_subscribe($$self, selectedIds, $$value => $$invalidate(20, $selectedIds = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Staff', slots, []);
    	let name;
    	let date;
    	let time;
    	let persons;
    	let table;
    	const onFocus = () => isFocused = true;
    	const onBlur = () => isFocused = false;

    	function createReservation() {
    		var input = document.getElementById("input");
    		let id = reservations.length;
    		let table = $selectedIds;
    		let reservation = { id, name, date, time, persons, table };
    		reservations.push(reservation);
    		$$invalidate(4, reservations);
    		console.log(reservations);
    		input.style.display = "none";
    		$$invalidate(0, name = "");
    		$$invalidate(1, date = "");
    		$$invalidate(2, time = "");
    		$$invalidate(3, persons = "");
    		table = [];
    		set_store_value(selectedIds, $selectedIds = [], $selectedIds);
    		set_store_value(selectedListSize, $selectedListSize = 0, $selectedListSize);
    	}

    	function changeReservation(id) {
    		console.log(id);
    		console.log(reservations);
    		set_store_value(selectedIds, $selectedIds = reservations[id].table, $selectedIds);
    		set_store_value(selectedListSize, $selectedListSize = reservations[id].table.length, $selectedListSize);
    		var input = document.getElementById(id);
    		input.style.display = "none";
    		var output = document.getElementById(-id);
    		output.style.display = "block";
    	}

    	function saveReservation(id) {
    		var input = document.getElementById(id);
    		input.style.display = "block";
    		var output = document.getElementById(-id);
    		output.style.display = "none";
    		set_store_value(selectedIds, $selectedIds = [], $selectedIds);
    		set_store_value(selectedListSize, $selectedListSize = 0, $selectedListSize);
    	}

    	function deleteReservation(id) {
    		console.log(reservations);
    		console.log(id - 1);
    		reservations.splice(id, 1);
    		$$invalidate(4, reservations);

    		for (let index = 0; index < reservations.length; index++) {
    			$$invalidate(4, reservations[index].id = index, reservations);
    		}

    		saveReservation(id);
    		console.log(reservations);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Staff> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler(each_value, res_index) {
    		each_value[res_index].name = this.value;
    		$$invalidate(4, reservations);
    	}

    	function input1_input_handler(each_value, res_index) {
    		each_value[res_index].date = this.value;
    		$$invalidate(4, reservations);
    	}

    	function input2_input_handler(each_value, res_index) {
    		each_value[res_index].time = this.value;
    		$$invalidate(4, reservations);
    	}

    	function input3_input_handler(each_value, res_index) {
    		each_value[res_index].persons = this.value;
    		$$invalidate(4, reservations);
    	}

    	function input0_input_handler_1() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	function input1_input_handler_1() {
    		date = this.value;
    		$$invalidate(1, date);
    	}

    	function input2_input_handler_1() {
    		time = this.value;
    		$$invalidate(2, time);
    	}

    	function input3_input_handler_1() {
    		persons = this.value;
    		$$invalidate(3, persons);
    	}

    	$$self.$capture_state = () => ({
    		each,
    		selectedIds,
    		selectedListSize,
    		TableArea,
    		name,
    		date,
    		time,
    		persons,
    		table,
    		onFocus,
    		onBlur,
    		newReservation,
    		createReservation,
    		changeReservation,
    		saveReservation,
    		deleteReservation,
    		hover,
    		hoverNot,
    		reservations,
    		$selectedListSize,
    		$selectedIds
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('date' in $$props) $$invalidate(1, date = $$props.date);
    		if ('time' in $$props) $$invalidate(2, time = $$props.time);
    		if ('persons' in $$props) $$invalidate(3, persons = $$props.persons);
    		if ('table' in $$props) table = $$props.table;
    		if ('reservations' in $$props) $$invalidate(4, reservations = $$props.reservations);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(4, reservations = [
    		{
    			id: 0,
    			name: "Santa",
    			date: "24.12.2021",
    			time: "13:00",
    			persons: 4,
    			table: [1, 2, 3]
    		},
    		{
    			id: 1,
    			name: "Santa",
    			date: "24.12.2021",
    			time: "13:00",
    			persons: 4,
    			table: [4, 5, 6]
    		},
    		{
    			id: 2,
    			name: "Bert",
    			date: "24.12.2021",
    			time: "13:00",
    			persons: 4,
    			table: [7, 8, 9]
    		},
    		{
    			id: 3,
    			name: "Klaus",
    			date: "24.12.2021",
    			time: "13:00",
    			persons: 4,
    			table: [10, 11, 12]
    		},
    		{
    			id: 4,
    			name: "Hubert",
    			date: "24.12.2021",
    			time: "13:00",
    			persons: 4,
    			table: [53]
    		}
    	]);

    	return [
    		name,
    		date,
    		time,
    		persons,
    		reservations,
    		onFocus,
    		onBlur,
    		createReservation,
    		changeReservation,
    		saveReservation,
    		deleteReservation,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input0_input_handler_1,
    		input1_input_handler_1,
    		input2_input_handler_1,
    		input3_input_handler_1
    	];
    }

    class Staff extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Staff",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.3 */
    const file = "src\\App.svelte";

    // (15:4) {:else}
    function create_else_block(ctx) {
    	let staff;
    	let current;
    	staff = new Staff({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(staff.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(staff, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(staff.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(staff.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(staff, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(15:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:4) {#if $showCustomer}
    function create_if_block(ctx) {
    	let customer;
    	let current;
    	customer = new Customer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(customer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(customer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(customer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(customer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(customer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(13:4) {#if $showCustomer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let t0;
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let t1;
    	let footer;
    	let div;
    	let p0;
    	let t3;
    	let p1;
    	let current;
    	header = new Header({ $$inline: true });
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$showCustomer*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if_block.c();
    			t1 = space();
    			footer = element("footer");
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "Santas Reindeers";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Tel.: +299 123456";
    			add_location(main, file, 11, 0, 263);
    			attr_dev(p0, "class", "has-text-weight-light");
    			add_location(p0, file, 21, 8, 440);
    			attr_dev(p1, "class", "has-text-weight-light");
    			add_location(p1, file, 22, 8, 503);
    			attr_dev(div, "class", "content has-text-centered");
    			add_location(div, file, 20, 4, 391);
    			attr_dev(footer, "class", "footer");
    			add_location(footer, file, 19, 0, 362);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    			append_dev(div, p0);
    			append_dev(div, t3);
    			append_dev(div, p1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(footer);
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
    	let $showCustomer;
    	validate_store(showCustomer, 'showCustomer');
    	component_subscribe($$self, showCustomer, $$value => $$invalidate(0, $showCustomer = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Customer,
    		Staff,
    		showCustomer,
    		$showCustomer
    	});

    	return [$showCustomer];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
