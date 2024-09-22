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

<<<<<<< HEAD
<<<<<<< HEAD
=======
process.env.IS_TAURI;

>>>>>>> 93e33b3 (first version commit)
=======
>>>>>>> e4ce1b7 (working dashboard in webui)
const getTokenAndBaseUrl = async () => {
    const [token, baseUrl] = await Promise.all([
        StorageService.getToken(),
        StorageService.getBaseUrl(),
    ]);
    return { token, baseUrl };
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

let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) {
	return heap[idx];
}

let heap_next = heap.length;

function dropObject(idx) {
	if (idx < 132) return;
	heap[idx] = heap_next;
	heap_next = idx;
}

function takeObject(idx) {
	const ret = getObject(idx);
	dropObject(idx);
	return ret;
}

const cachedTextDecoder =
	typeof TextDecoder !== "undefined"
		? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true })
		: {
				decode: () => {
					throw Error("TextDecoder not available");
				},
			};

if (typeof TextDecoder !== "undefined") {
	cachedTextDecoder.decode();
}

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
	if (
		cachedUint8ArrayMemory0 === null ||
		cachedUint8ArrayMemory0.byteLength === 0
	) {
		cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
	}
	return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
	ptr = ptr >>> 0;
	return cachedTextDecoder.decode(
		getUint8ArrayMemory0().subarray(ptr, ptr + len),
	);
}

function addHeapObject(obj) {
	if (heap_next === heap.length) heap.push(heap.length + 1);
	const idx = heap_next;
	heap_next = heap[idx];

	heap[idx] = obj;
	return idx;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder =
	typeof TextEncoder !== "undefined"
		? new TextEncoder("utf-8")
		: {
				encode: () => {
					throw Error("TextEncoder not available");
				},
			};

const encodeString =
	typeof cachedTextEncoder.encodeInto === "function"
		? function (arg, view) {
				return cachedTextEncoder.encodeInto(arg, view);
			}
		: function (arg, view) {
				const buf = cachedTextEncoder.encode(arg);
				view.set(buf);
				return {
					read: arg.length,
					written: buf.length,
				};
			};

function passStringToWasm0(arg, malloc, realloc) {
	if (realloc === undefined) {
		const buf = cachedTextEncoder.encode(arg);
		const ptr = malloc(buf.length, 1) >>> 0;
		getUint8ArrayMemory0()
			.subarray(ptr, ptr + buf.length)
			.set(buf);
		WASM_VECTOR_LEN = buf.length;
		return ptr;
	}

	let len = arg.length;
	let ptr = malloc(len, 1) >>> 0;

	const mem = getUint8ArrayMemory0();

	let offset = 0;

	for (; offset < len; offset++) {
		const code = arg.charCodeAt(offset);
		if (code > 0x7f) break;
		mem[ptr + offset] = code;
	}

	if (offset !== len) {
		if (offset !== 0) {
			arg = arg.slice(offset);
		}
		ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0;
		const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
		const ret = encodeString(arg, view);

		offset += ret.written;
		ptr = realloc(ptr, len, offset, 1) >>> 0;
	}

	WASM_VECTOR_LEN = offset;
	return ptr;
}

function isLikeNone(x) {
	return x === undefined || x === null;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
	if (
		cachedDataViewMemory0 === null ||
		cachedDataViewMemory0.buffer.detached === true ||
		(cachedDataViewMemory0.buffer.detached === undefined &&
			cachedDataViewMemory0.buffer !== wasm.memory.buffer)
	) {
		cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
	}
	return cachedDataViewMemory0;
}

function debugString(val) {
	// primitive types
	const type = typeof val;
	if (type == "number" || type == "boolean" || val == null) {
		return `${val}`;
	}
	if (type == "string") {
		return `"${val}"`;
	}
	if (type == "symbol") {
		const description = val.description;
		if (description == null) {
			return "Symbol";
		} else {
			return `Symbol(${description})`;
		}
	}
	if (type == "function") {
		const name = val.name;
		if (typeof name == "string" && name.length > 0) {
			return `Function(${name})`;
		} else {
			return "Function";
		}
	}
	// objects
	if (Array.isArray(val)) {
		const length = val.length;
		let debug = "[";
		if (length > 0) {
			debug += debugString(val[0]);
		}
		for (let i = 1; i < length; i++) {
			debug += ", " + debugString(val[i]);
		}
		debug += "]";
		return debug;
	}
	// Test for built-in
	const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
	let className;
	if (builtInMatches.length > 1) {
		className = builtInMatches[1];
	} else {
		// Failed to match the standard '[object ClassName]'
		return toString.call(val);
	}
	if (className == "Object") {
		// we're a user defined class or Object
		// JSON.stringify avoids problems with cycles, and is generally much
		// easier than looping through ownProperties of `val`.
		try {
			return "Object(" + JSON.stringify(val) + ")";
		} catch (_) {
			return "Object";
		}
	}
	// errors
	if (val instanceof Error) {
		return `${val.name}: ${val.message}\n${val.stack}`;
	}
	// TODO we could test for more things here, like `Set`s and `Map`s.
	return className;
}

/**
 * @param {string} password
 * @param {string} username
 * @returns {any}
 */
function generate_and_encrypt_keys(password, username) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			password,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		const ptr1 = passStringToWasm0(
			username,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len1 = WASM_VECTOR_LEN;
		wasm.generate_and_encrypt_keys(retptr, ptr0, len0, ptr1, len1);
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		if (r2) {
			throw takeObject(r1);
		}
		return takeObject(r0);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 * @param {string} username
 * @returns {any}
 */
function generate_keys_without_password(username) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			username,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		wasm.generate_keys_without_password(retptr, ptr0, len0);
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		if (r2) {
			throw takeObject(r1);
		}
		return takeObject(r0);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 * @param {string} encrypted_cert_b64
 * @param {string} salt_b64
 * @param {string} passphrase
 */
function decrypt_and_store_keys(
	encrypted_cert_b64,
	salt_b64,
	passphrase,
) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			encrypted_cert_b64,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		const ptr1 = passStringToWasm0(
			salt_b64,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len1 = WASM_VECTOR_LEN;
		const ptr2 = passStringToWasm0(
			passphrase,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len2 = WASM_VECTOR_LEN;
		wasm.decrypt_and_store_keys(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		if (r1) {
			throw takeObject(r0);
		}
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 * @param {string} message
 * @returns {string}
 */
function sign_message(message) {
	let deferred3_0;
	let deferred3_1;
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			message,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		wasm.sign_message(retptr, ptr0, len0);
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
		var ptr2 = r0;
		var len2 = r1;
		if (r3) {
			ptr2 = 0;
			len2 = 0;
			throw takeObject(r2);
		}
		deferred3_0 = ptr2;
		deferred3_1 = len2;
		return getStringFromWasm0(ptr2, len2);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
		wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
	}
}

/**
 * @param {any} public_keys
 * @param {any} fields
 * @returns {any}
 */
function encrypt_new_credential(public_keys, fields) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		wasm.encrypt_new_credential(
			retptr,
			addHeapObject(public_keys),
			addHeapObject(fields),
		);
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		if (r2) {
			throw takeObject(r1);
		}
		return takeObject(r0);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 * @param {any} credentials
 * @returns {any}
 */
function decrypt_credentials(credentials) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		wasm.decrypt_credentials(retptr, addHeapObject(credentials));
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		if (r2) {
			throw takeObject(r1);
		}
		return takeObject(r0);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 * @param {string} encrypted_text
 * @returns {string}
 */
function decrypt_text(encrypted_text) {
	let deferred3_0;
	let deferred3_1;
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			encrypted_text,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		wasm.decrypt_text(retptr, ptr0, len0);
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
		var ptr2 = r0;
		var len2 = r1;
		if (r3) {
			ptr2 = 0;
			len2 = 0;
			throw takeObject(r2);
		}
		deferred3_0 = ptr2;
		deferred3_1 = len2;
		return getStringFromWasm0(ptr2, len2);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
		wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
	}
}

/**
 * @param {string} text
 * @returns {string}
 */
function sign_and_hash_message(text) {
	let deferred3_0;
	let deferred3_1;
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			text,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		wasm.sign_and_hash_message(retptr, ptr0, len0);
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
		var ptr2 = r0;
		var len2 = r1;
		if (r3) {
			ptr2 = 0;
			len2 = 0;
			throw takeObject(r2);
		}
		deferred3_0 = ptr2;
		deferred3_1 = len2;
		return getStringFromWasm0(ptr2, len2);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
		wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
	}
}

/**
 * @param {string} field_value
 * @param {any} public_keys
 * @returns {any}
 */
function encrypt_field_value(field_value, public_keys) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			field_value,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		wasm.encrypt_field_value(retptr, ptr0, len0, addHeapObject(public_keys));
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		if (r2) {
			throw takeObject(r1);
		}
		return takeObject(r0);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 * @param {any} urls
 * @returns {any}
 */
function decrypt_urls(urls) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		wasm.decrypt_urls(retptr, addHeapObject(urls));
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		if (r2) {
			throw takeObject(r1);
		}
		return takeObject(r0);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 * @param {string} cert_string
 * @param {string} passphrase
 * @returns {any}
 */
function import_certificate(cert_string, passphrase) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			cert_string,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		const ptr1 = passStringToWasm0(
			passphrase,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len1 = WASM_VECTOR_LEN;
		wasm.import_certificate(retptr, ptr0, len0, ptr1, len1);
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		if (r2) {
			throw takeObject(r1);
		}
		return takeObject(r0);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 * @param {string} passphrase
 * @param {string} enc_pvt_key
 * @param {string} salt
 * @returns {string}
 */
function export_certificate(passphrase, enc_pvt_key, salt) {
	let deferred5_0;
	let deferred5_1;
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passStringToWasm0(
			passphrase,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len0 = WASM_VECTOR_LEN;
		const ptr1 = passStringToWasm0(
			enc_pvt_key,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len1 = WASM_VECTOR_LEN;
		const ptr2 = passStringToWasm0(
			salt,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len2 = WASM_VECTOR_LEN;
		wasm.export_certificate(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
		var ptr4 = r0;
		var len4 = r1;
		if (r3) {
			ptr4 = 0;
			len4 = 0;
			throw takeObject(r2);
		}
		deferred5_0 = ptr4;
		deferred5_1 = len4;
		return getStringFromWasm0(ptr4, len4);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
		wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
	}
}

/**
 * @returns {boolean}
 */
function is_cert_loaded() {
	const ret = wasm.is_cert_loaded();
	return ret !== 0;
}

/**
 * @returns {string}
 */
function get_public_key() {
	let deferred2_0;
	let deferred2_1;
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		wasm.get_public_key(retptr);
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
		var ptr1 = r0;
		var len1 = r1;
		if (r3) {
			ptr1 = 0;
			len1 = 0;
			throw takeObject(r2);
		}
		deferred2_0 = ptr1;
		deferred2_1 = len1;
		return getStringFromWasm0(ptr1, len1);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
		wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
	}
}

/**
 * @param {any} input
 * @returns {any}
 */
function create_share_creds_payload(input) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		wasm.create_share_creds_payload(retptr, addHeapObject(input));
		var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
		var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
		var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
		if (r2) {
			throw takeObject(r1);
		}
		return takeObject(r0);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

function handleError(f, args) {
	try {
		return f.apply(this, args);
	} catch (e) {
		wasm.__wbindgen_exn_store(addHeapObject(e));
	}
}

async function __wbg_load(module, imports) {
	if (typeof Response === "function" && module instanceof Response) {
		if (typeof WebAssembly.instantiateStreaming === "function") {
			try {
				return await WebAssembly.instantiateStreaming(module, imports);
			} catch (e) {
				if (module.headers.get("Content-Type") != "application/wasm") {
					console.warn(
						"`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
						e,
					);
				} else {
					throw e;
				}
			}
		}

		const bytes = await module.arrayBuffer();
		return await WebAssembly.instantiate(bytes, imports);
	} else {
		const instance = await WebAssembly.instantiate(module, imports);

		if (instance instanceof WebAssembly.Instance) {
			return { instance, module };
		} else {
			return instance;
		}
	}
}

function __wbg_get_imports() {
	const imports = {};
	imports.wbg = {};
	imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
		takeObject(arg0);
	};
	imports.wbg.__wbindgen_error_new = function (arg0, arg1) {
		const ret = new Error(getStringFromWasm0(arg0, arg1));
		return addHeapObject(ret);
	};
	imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
		const ret = getStringFromWasm0(arg0, arg1);
		return addHeapObject(ret);
	};
	imports.wbg.__wbindgen_string_get = function (arg0, arg1) {
		const obj = getObject(arg1);
		const ret = typeof obj === "string" ? obj : undefined;
		var ptr1 = isLikeNone(ret)
			? 0
			: passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
		var len1 = WASM_VECTOR_LEN;
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
	};
	imports.wbg.__wbindgen_is_object = function (arg0) {
		const val = getObject(arg0);
		const ret = typeof val === "object" && val !== null;
		return ret;
	};
	imports.wbg.__wbindgen_is_undefined = function (arg0) {
		const ret = getObject(arg0) === undefined;
		return ret;
	};
	imports.wbg.__wbindgen_in = function (arg0, arg1) {
		const ret = getObject(arg0) in getObject(arg1);
		return ret;
	};
	imports.wbg.__wbindgen_is_string = function (arg0) {
		const ret = typeof getObject(arg0) === "string";
		return ret;
	};
	imports.wbg.__wbindgen_jsval_loose_eq = function (arg0, arg1) {
		const ret = getObject(arg0) == getObject(arg1);
		return ret;
	};
	imports.wbg.__wbindgen_boolean_get = function (arg0) {
		const v = getObject(arg0);
		const ret = typeof v === "boolean" ? (v ? 1 : 0) : 2;
		return ret;
	};
	imports.wbg.__wbindgen_number_get = function (arg0, arg1) {
		const obj = getObject(arg1);
		const ret = typeof obj === "number" ? obj : undefined;
		getDataViewMemory0().setFloat64(
			arg0 + 8 * 1,
			isLikeNone(ret) ? 0 : ret,
			true,
		);
		getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
	};
	imports.wbg.__wbg_String_91fba7ded13ba54c = function (arg0, arg1) {
		const ret = String(getObject(arg1));
		const ptr1 = passStringToWasm0(
			ret,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len1 = WASM_VECTOR_LEN;
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
	};
	imports.wbg.__wbindgen_number_new = function (arg0) {
		const ret = arg0;
		return addHeapObject(ret);
	};
	imports.wbg.__wbindgen_bigint_from_i64 = function (arg0) {
		const ret = arg0;
		return addHeapObject(ret);
	};
	imports.wbg.__wbindgen_bigint_from_u64 = function (arg0) {
		const ret = BigInt.asUintN(64, arg0);
		return addHeapObject(ret);
	};
	imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
		const ret = getObject(arg0);
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_getwithrefkey_15c62c2b8546208d = function (arg0, arg1) {
		const ret = getObject(arg0)[getObject(arg1)];
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_set_20cbc34131e76824 = function (arg0, arg1, arg2) {
		getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
	};
	imports.wbg.__wbg_crypto_1d1f22824a6a080c = function (arg0) {
		const ret = getObject(arg0).crypto;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_process_4a72847cc503995b = function (arg0) {
		const ret = getObject(arg0).process;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_versions_f686565e586dd935 = function (arg0) {
		const ret = getObject(arg0).versions;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_node_104a2ff8d6ea03a2 = function (arg0) {
		const ret = getObject(arg0).node;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_require_cca90b1a94a0255b = function () {
		return handleError(function () {
			const ret = module.require;
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbindgen_is_function = function (arg0) {
		const ret = typeof getObject(arg0) === "function";
		return ret;
	};
	imports.wbg.__wbg_msCrypto_eb05e62b530a1508 = function (arg0) {
		const ret = getObject(arg0).msCrypto;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_randomFillSync_5c9c955aa56b6049 = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).randomFillSync(takeObject(arg1));
		}, arguments);
	};
	imports.wbg.__wbg_getRandomValues_3aa56aa6edec874c = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).getRandomValues(getObject(arg1));
		}, arguments);
	};
	imports.wbg.__wbg_get_3baa728f9d58d3f6 = function (arg0, arg1) {
		const ret = getObject(arg0)[arg1 >>> 0];
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_length_ae22078168b726f5 = function (arg0) {
		const ret = getObject(arg0).length;
		return ret;
	};
	imports.wbg.__wbg_new_a220cf903aa02ca2 = function () {
		const ret = new Array();
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_newnoargs_76313bd6ff35d0f2 = function (arg0, arg1) {
		const ret = new Function(getStringFromWasm0(arg0, arg1));
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_new_8608a2b51a5f6737 = function () {
		const ret = new Map();
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_next_de3e9db4440638b2 = function (arg0) {
		const ret = getObject(arg0).next;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_next_f9cb570345655b9a = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).next();
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbg_done_bfda7aa8f252b39f = function (arg0) {
		const ret = getObject(arg0).done;
		return ret;
	};
	imports.wbg.__wbg_value_6d39332ab4788d86 = function (arg0) {
		const ret = getObject(arg0).value;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_iterator_888179a48810a9fe = function () {
		const ret = Symbol.iterator;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_get_224d16597dbbfd96 = function () {
		return handleError(function (arg0, arg1) {
			const ret = Reflect.get(getObject(arg0), getObject(arg1));
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbg_call_1084a111329e68ce = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).call(getObject(arg1));
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbg_new_525245e2b9901204 = function () {
		const ret = new Object();
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_self_3093d5d1f7bcb682 = function () {
		return handleError(function () {
			const ret = self.self;
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbg_window_3bcfc4d31bc012f8 = function () {
		return handleError(function () {
			const ret = window.window;
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbg_globalThis_86b222e13bdf32ed = function () {
		return handleError(function () {
			const ret = globalThis.globalThis;
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbg_global_e5a3fe56f8be9485 = function () {
		return handleError(function () {
			const ret = global.global;
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbg_set_673dda6c73d19609 = function (arg0, arg1, arg2) {
		getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
	};
	imports.wbg.__wbg_isArray_8364a5371e9737d8 = function (arg0) {
		const ret = Array.isArray(getObject(arg0));
		return ret;
	};
	imports.wbg.__wbg_instanceof_ArrayBuffer_61dfc3198373c902 = function (arg0) {
		let result;
		try {
			result = getObject(arg0) instanceof ArrayBuffer;
		} catch (_) {
			result = false;
		}
		const ret = result;
		return ret;
	};
	imports.wbg.__wbg_call_89af060b4e1523f2 = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
			return addHeapObject(ret);
		}, arguments);
	};
	imports.wbg.__wbg_set_49185437f0ab06f8 = function (arg0, arg1, arg2) {
		const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_getTime_91058879093a1589 = function (arg0) {
		const ret = getObject(arg0).getTime();
		return ret;
	};
	imports.wbg.__wbg_new0_65387337a95cf44d = function () {
		const ret = new Date();
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_buffer_b7b08af79b0b0974 = function (arg0) {
		const ret = getObject(arg0).buffer;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_newwithbyteoffsetandlength_8a2cb9ca96b27ec9 = function (
		arg0,
		arg1,
		arg2,
	) {
		const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_new_ea1883e1e5e86686 = function (arg0) {
		const ret = new Uint8Array(getObject(arg0));
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_set_d1e79e2388520f18 = function (arg0, arg1, arg2) {
		getObject(arg0).set(getObject(arg1), arg2 >>> 0);
	};
	imports.wbg.__wbg_length_8339fcf5d8ecd12e = function (arg0) {
		const ret = getObject(arg0).length;
		return ret;
	};
	imports.wbg.__wbg_instanceof_Uint8Array_247a91427532499e = function (arg0) {
		let result;
		try {
			result = getObject(arg0) instanceof Uint8Array;
		} catch (_) {
			result = false;
		}
		const ret = result;
		return ret;
	};
	imports.wbg.__wbg_newwithlength_ec548f448387c968 = function (arg0) {
		const ret = new Uint8Array(arg0 >>> 0);
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_subarray_7c2e3576afe181d1 = function (arg0, arg1, arg2) {
		const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
		return addHeapObject(ret);
	};
	imports.wbg.__wbindgen_debug_string = function (arg0, arg1) {
		const ret = debugString(getObject(arg1));
		const ptr1 = passStringToWasm0(
			ret,
			wasm.__wbindgen_malloc,
			wasm.__wbindgen_realloc,
		);
		const len1 = WASM_VECTOR_LEN;
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
	};
	imports.wbg.__wbindgen_throw = function (arg0, arg1) {
		throw new Error(getStringFromWasm0(arg0, arg1));
	};
	imports.wbg.__wbindgen_memory = function () {
		const ret = wasm.memory;
		return addHeapObject(ret);
	};

	return imports;
}

function __wbg_finalize_init(instance, module) {
	wasm = instance.exports;
	__wbg_init.__wbindgen_wasm_module = module;
	cachedDataViewMemory0 = null;
	cachedUint8ArrayMemory0 = null;

	return wasm;
}

async function __wbg_init(module_or_path) {
	if (wasm !== undefined) return wasm;

	if (
		typeof module_or_path !== "undefined" &&
		Object.getPrototypeOf(module_or_path) === Object.prototype
	)
		({ module_or_path } = module_or_path);
	else
		console.warn(
			"using deprecated parameters for the initialization function; pass a single object instead",
		);

	if (typeof module_or_path === "undefined") {
		module_or_path = new URL("wasm_bg.wasm", import.meta.url);
	}
	const imports = __wbg_get_imports();

	if (
		typeof module_or_path === "string" ||
		(typeof Request === "function" && module_or_path instanceof Request) ||
		(typeof URL === "function" && module_or_path instanceof URL)
	) {
		module_or_path = fetch(module_or_path);
	}

	const { instance, module } = await __wbg_load(await module_or_path, imports);

	return __wbg_finalize_init(instance, module);
}

const getPubKeyHandler = async (passphrase) => {
    const certificate = await StorageService.getCertificate();
    const salt = await StorageService.getSalt();
    const startTime = performance.now();
    if (certificate && salt) {
        await decrypt_and_store_keys(certificate, salt, passphrase);
    }
    else {
        throw Error("failed to fetch certificate and salt from storage");
    }
    console.log("Time taken to decrypt and store keys:", performance.now() - startTime);
    return get_public_key();
};
const signChallengeHandler = async (challenge) => {
    return sign_message(challenge);
};
const savePassphraseHandler = async (passphrase, challenge, username) => {
    await __wbg_init();
    const keyPair = await generate_and_encrypt_keys(passphrase, username);
    StorageService.setCertificate(keyPair.get("certificate"));
    StorageService.setSalt(keyPair.get("salt"));
    decrypt_and_store_keys(keyPair.get("certificate"), keyPair.get("salt"), passphrase);
    const signature = sign_message(challenge);
    return {
        username,
        signature,
        deviceKey: keyPair.get("public_key"),
        encryptionKey: keyPair.get("public_key"),
    };
};
const decryptCredentialFieldsHandler = async (credentials) => {
    const response = await decrypt_credentials(credentials);
    return response;
};
const addCredentialHandler = async (payload) => {
    return await encrypt_new_credential(payload.users, payload.addCredentialFields);
};
const decryptFieldHandler = async (text) => {
    const decrypted = await decrypt_text(text);
    return decrypted;
};
const createShareCredsPayload = async (creds, selectedUsers) => {
    const users = selectedUsers.map((user) => {
        return {
            id: user.id,
            publicKey: user.publicKey,
            accessType: user.accessType,
        };
    });
    const input = {
        credentials: creds,
        selectedUsers: users,
    };
    return await create_share_creds_payload(input);
};
const getCertificate = async (passphrase) => {
    const pvtKey = await StorageService.getCertificate();
    const salt = await StorageService.getSalt();
    if (pvtKey && salt) {
        const response = await export_certificate(passphrase, pvtKey, salt);
        const new_response = await import_certificate(response, "test");
        console.log(new_response);
    }
};
const handlePvtKeyImport = async (pvtKeys, passphrase) => {
    await __wbg_init();
    // const { encryptionKey, signKey, baseUrl } = JSON.parse(pvtKeys);
    // await browser.storage.local.set({ baseUrl });
    // const signPubKey = await get_pub_key(signKey);
    // const encPublicKey = await get_pub_key(encryptionKey);
    // const challegeResult = await createChallenge(signPubKey);
    // await decrypt_and_store_keys(encryptionKey, signKey, passphrase);
    // const signedMessage = await sign_message_with_stored_key(
    // 	challegeResult.data.challenge,
    // );
    // const verificationResponse = await initiateAuth(signedMessage, signPubKey);
    // const token = verificationResponse.data.token;
    // if (token) {
    // 	await browser.storage.local.set({ token: token });
    // 	await browser.storage.local.set({ isLoggedIn: true });
    // }
    // await browser.storage.local.set({
    // 	encryptionPvtKey: encryptionKey,
    // 	signPvtKey: signKey,
    // 	encPublicKey: encPublicKey,
    // 	signPublicKey: signPubKey,
    // });
    // return token;
};
const credentialSubmitHandler = async (newCredential, credIds) => {
    if (credIds.length > 0) {
        const responseJson = await fetchCredsByIds(credIds);
        const listedCredentials = responseJson.data;
        const decryptedData = await decryptCredentialFieldsHandler(listedCredentials);
        if (decryptedData) {
            for (const credential of decryptedData) {
                for (const field of credential.fields) {
                    if (field.fieldName == "Username") {
                        if (field.fieldValue == newCredential.username) {
                            return null;
                        }
                    }
                }
            }
        }
    }
    return true;
};
const getCurrentDomain = async () => {
    const queryOptions = { active: true, currentWindow: true };
    const tabs = await browser.tabs.query(queryOptions);
    const url = new URL(tabs[0].url);
    return url; // Returns the domain of the current active tab
};
const sign_hashed_message = async (message) => {
    const response = await sign_and_hash_message(message);
    return response;
};
const generateCliKeys = async (username) => {
    const response = await generate_keys_without_password(username);
    const returnObj = Object.fromEntries(response);
    return returnObj;
};
const encryptEditFields = async (data) => {
    const encryptedFields = await encrypt_field_value(data.fieldValue, data.usersToShare);
    const encryptedFieldsObject = encryptedFields.map((field) => Object.fromEntries(field));
    return encryptedFieldsObject;
};
const getDecryptedUrls = async (urls) => {
    const decryptedUrls = await decrypt_urls(urls);
    return decryptedUrls;
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

const addCredential = async (payload) => {
    const headers = new Headers();
    const transformedPayload = transformAddCredentialPayload(payload);
    const sign = await sign_hashed_message(JSON.stringify(transformedPayload));
    headers.append("Signature", sign);
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
const postLoginCredentialHandler = async ({ description, domain, folderId, password, title, username, }) => {
    let addCredentialPayload = {
        name: title,
        folderId: folderId,
        description: description,
        credentialType: "Login",
        userFields: [],
        domain,
    };
    const response = await fetchFolderUsersForDataSync(folderId);
    const usersToShare = response.data;
    const fieldPayload = [
        { fieldName: "Username", fieldValue: username, fieldType: "meta" },
        {
            fieldName: "Password",
            fieldValue: password,
            fieldType: "sensitive",
        },
        {
            fieldName: "Domain",
            fieldValue: domain,
            fieldType: "additional",
        },
        { fieldName: "URL", fieldValue: domain, fieldType: "meta" },
    ];
    const userFields = await addCredentialHandler({
        users: usersToShare,
        addCredentialFields: fieldPayload,
    });
    addCredentialPayload.userFields = userFields;
    const finalAddCredResp = await addCredential(addCredentialPayload);
    return finalAddCredResp;
};

let newCredential = {
    username: "",
    password: "",
    domain: "",
    url: "",
};
let submitFlag = false;
let urlObj = new Map();
browser.runtime.onInstalled.addListener(async () => {
    browser.tabs.create({ url: browser.runtime.getURL("dashboard.html") });
});
browser.runtime.onMessage.addListener(async (request) => {
    switch (request.action) {
        case "decryptField": {
            return await decryptFieldHandler(request.data);
        }
        case "openFullscreenTab":
            browser.tabs.create({
                url: browser.runtime.getURL("dashboard.html"),
            });
            break;
        case "hashAndSign": {
            const sign = await sign_hashed_message(request.data.message);
            return { signature: sign };
        }
        case "getPubKey": {
            await __wbg_init();
            return getPubKeyHandler(request.data.passphrase);
        }
        case "signChallenge": {
            return signChallengeHandler(request.data.challenge);
        }
        case "isSignedUp": {
            try {
                const certificate = await StorageService.getCertificate();
                await __wbg_init({});
                const SAVE_TIMESTAMP_INTERVAL_MS = 2 * 1000;
                saveTimestamp();
                setInterval(saveTimestamp, SAVE_TIMESTAMP_INTERVAL_MS);
                if (certificate)
                    return { isSignedUp: true };
                else
                    return { isSignedUp: false };
            }
            catch (e) {
                console.error(e, "init");
            }
        }
        case "importPvtKey": {
            await handlePvtKeyImport(request.data.privateKeys, request.data.passphrase);
            return;
        }
        case "savePassphrase":
            if (request.data.passphrase) {
                return savePassphraseHandler(request.data.passphrase, request.data.challenge, request.data.username);
            }
            break;
        case "generateCliKeys":
            return generateCliKeys(request.data.username);
        case "updateAllUrls":
            if (!request.data.domain) {
                return Promise.resolve({
                    credIds: [],
                });
            }
            for (let i = 0; i < request.data.urls.length; i++) {
                const decrypted = await decryptFieldHandler(request.data.urls[i].value);
                const normalizedDecrypted = decrypted.replace(/^www\./, "");
                if (urlObj.has(normalizedDecrypted)) {
                    // @ts-ignore
                    urlObj
                        .get(normalizedDecrypted)
                        .add(request.data.urls[i].credentialId);
                }
                else {
                    urlObj.set(normalizedDecrypted, new Set([request.data.urls[i].credentialId]));
                }
            }
            return Promise.resolve({
                credIds: Array.from(urlObj.get(request.data.domain.replace(/^www\./, "")) || []),
            });
        case "checkPvtLoaded":
            return is_cert_loaded();
        case "decryptMeta":
            return decryptCredentialFieldsHandler(request.data);
        case "addCredential":
            return addCredentialHandler(request.data);
        case "createShareCredPayload":
            return createShareCredsPayload(request.data.creds, request.data.users);
        case "credentialSubmit": {
            if (submitFlag)
                return null;
            submitFlag = true;
            setTimeout(() => {
                submitFlag = false;
            }, 500);
            newCredential.username = request.data.username;
            newCredential.password = request.data.password;
            const urlData = await getCurrentDomain();
            newCredential.domain = urlData.hostname;
            newCredential.url = urlData.href;
            const credIds = Array.from(urlObj.get(newCredential.domain.replace(/^www\./, "")) || []);
            const isNewCredential = await credentialSubmitHandler(newCredential, credIds);
            if (isNewCredential) {
                setTimeout(async () => {
                    const responseJson = await fetchAllFolders();
                    const folderData = responseJson.data.sort((a, b) => a.name.localeCompare(b.name));
                    browser.tabs
                        .query({ active: true, currentWindow: true })
                        .then((tabs) => {
                        if (tabs[0]?.id !== undefined) {
                            browser.tabs.sendMessage(tabs[0].id, {
                                action: "postCredSubmit",
                                data: {
                                    ...newCredential,
                                    folders: [...folderData],
                                    id: "osvauld",
                                },
                            });
                        }
                    });
                }, 3000);
            }
            else {
                console.log("This is not a new credential on this platform");
            }
            return null;
        }
        case "encryptEditFields": {
            return encryptEditFields(request.data);
        }
        case "getDecryptedUrls": {
            return getDecryptedUrls(request.data);
        }
        case "saveCapturedCredentialToFolder": {
            submitFlag = false;
            const credHandlerResponse = await postLoginCredentialHandler(request.data);
            return credHandlerResponse;
        }
        case "exportCertificate": {
            return getCertificate(request.data.passphrase);
        }
        default:
            console.log(request.action);
            break;
    }
});
function saveTimestamp() {
    const timestamp = new Date().toISOString();
    browser.storage.local.set({ timestamp });
}
//# sourceMappingURL=background.js.map
