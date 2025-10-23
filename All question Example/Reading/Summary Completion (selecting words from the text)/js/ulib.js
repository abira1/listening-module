/* Copyright © UCLES, 2014 */

/*global window*/

// Hack to ensure local testing is possible, along side production
if (!window.console) {
    window.console = {};
    window.console.log = function() {};
}

//var ulib, $;
//ulib = $ = function () {
var ulib;
ulib = (function($) {

    var isBoolean, isNumber, isString, isObject, isFunction, trim, normalizeWhitespace, later,
        convertCamel;

    (function() {
        isBoolean = function(value) {
            return typeof value === 'boolean';
        };

        isNumber = function(value) {
            return typeof value === 'number';
        };

        isString = function(value) {
            return typeof value === 'string';
        };

        isObject = function(value) {
            return typeof value === 'object' && value !== null;
        };

        isFunction = function(value) {
            return {}.toString.call(value) === '[object Function]';
        };

        trim = function(text) {
            if (isString(text)) {
                return (text || '').replace(/^\s+|\s+$/g, '');
            } else {
                throw new Error('Invalid string');
            }
        };

        String.prototype.trim = function() {
            return trim(this.toString());
        };

        normalizeWhitespace = function(text) {
            if (isString(text)) {
                return trim(text).replace(/\s+/g, ' ');
            } else {
                throw new Error('Invalid string');
            }
        };

        later = function(f) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            } else if (!isFunction(f)) {
                throw new Error('Invalid function');
            }

            setTimeout(f, 0);
        };

        convertCamel = function(s) {
            return s.replace(/[A-Z]/g, function(c) {
                return '-' + c.toLowerCase();
            });
        };

    })();


    var collectionFunctions, createArray, isArray, isArrayLike,
        createDirectedPair, isDirectedPair, createHash, isHash,
        createIterator, isIterator, isCollection, each, map, reduce, every,
        some, notEvery, none, merge, flatten, filter, findFirst;
    (function() {
        /* Superclass used by collection objects. */
        function Collection() {}
        Collection.prototype = {
            constructor: undefined
        };

        var invalidArgumentError = 'Invalid argument';

        createArray = function(collection) {
            if (arguments.length === 1 && isCollection(collection)) {
                if (isArrayLike(collection)) {
                    return [].slice.call(collection);
                } else {
                    var iterator = createIterator(collection);
                    var array = [];
                    while (iterator.hasNext()) {
                        array.push(iterator.next());
                    }
                    return array;
                }
            } else {
                throw new Error(invalidArgumentError);
            }
        };

        isArray = function(value) {
            if (arguments.length === 1) {
                return {}.toString.call(value) === '[object Array]';
            } else {
                throw new Error(invalidArgumentError);
            }
        };

        isArrayLike = function(value) {
            if (arguments.length === 1) {
                return (typeof value === 'object' ||
                        typeof value === 'function') &&
                    value !== value.window &&
                    value !== null &&
                    value !== undefined &&
                    typeof value.length === 'number' &&
                    value.length >= 0 &&
                    value.length % 1 === 0 &&
                    isFinite(value.length) &&
                    !value.nodeType;
            } else {
                throw new Error(invalidArgumentError);
            }
        };

        var nativeIndexOf = [].indexOf;
        var indexOf;
        if (!isFunction(nativeIndexOf)) {
            indexOf = function(array, value, fromIndex) {
                fromIndex = fromIndex || 0;
                for (var i = fromIndex; i < array.length; ++i) {
                    if (array[i] === value) {
                        return i;
                    }
                }
                return -1;
            };
            Array.prototype.indexOf = function(value, fromIndex) {
                return indexOf(this, value, fromIndex);
            };
        } else {
            indexOf = function(array, value, fromIndex) {
                return nativeIndexOf.call(array, value, fromIndex);
            };
        }

        Array.prototype.remove = function(value) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            }
            var indexOfValue = indexOf(this, value);
            if (indexOfValue >= 0) {
                [].splice.call(this, indexOfValue, 1);
                return true;
            } else {
                return false;
            }
        };

        function DirectedPair() {}
        DirectedPair.prototype = new Collection();

        createDirectedPair = function(key, value) {
            if (arguments.length === 2) {
                key = String(key);
                var directedPair = new DirectedPair();
                directedPair.key = function() {
                    if (arguments.length === 0) {
                        return key;
                    } else {
                        throw new Error(invalidArgumentError);
                    }
                };
                directedPair.value = function() {
                    if (arguments.length === 0) {
                        return value;
                    } else {
                        throw new Error(invalidArgumentError);
                    }
                };
                return directedPair;
            } else {
                throw new Error(invalidArgumentError);
            }
        };

        isDirectedPair = function(value) {
            if (arguments.length === 1) {
                return value instanceof DirectedPair;
            } else {
                throw new Error(invalidArgumentError);
            }
        };

        function Hash() {}
        Hash.prototype = new Collection();

        var hasProperty;
        if (isFunction({}.hasOwnProperty)) {
            hasProperty = function(object, key) {
                return {}.hasOwnProperty.call(object, key);
            };
        } else {
            hasProperty = function(object, key) {
                return key in object &&
                    object[key] !== Object.prototype[key];
            };
        }

        var keyPrefix = 'ulib-hash-';
        var keyPrefixLength = keyPrefix.length;

        createHash = function(value) {
            var hash = new Hash();
            var entries = {};
            var entriesCount = 0;

            hash.get = function(key) {
                if (arguments.length === 1) {
                    key = keyPrefix + key;
                    return entries[key];
                } else {
                    throw new Error(invalidArgumentError);
                }
            };

            hash.set = function(key, value) {
                if (arguments.length === 2) {
                    key = keyPrefix + key;
                    if (!hasProperty(entries, key)) {
                        ++entriesCount;
                    }
                    entries[key] = value;
                    return hash;
                } else {
                    throw new Error(invalidArgumentError);
                }
            };

            hash.has = function(key) {
                if (arguments.length === 1) {
                    key = keyPrefix + key;
                    return hasProperty(entries, key);
                } else {
                    throw new Error(invalidArgumentError);
                }
            };

            hash.remove = function(key) {
                if (arguments.length === 1) {
                    key = keyPrefix + key;
                    if (hasProperty(entries, key)) {
                        --entriesCount;
                        delete entries[key];
                    }
                    return hash;
                } else {
                    throw new Error(invalidArgumentError);
                }
            };

            hash.size = function() {
                if (arguments.length === 0) {
                    return entriesCount;
                } else {
                    throw new Error(invalidArgumentError);
                }
            };

            hash.keys = function() {
                if (arguments.length === 0) {
                    var keys = [];
                    for (var key in entries) {
                        if (hasProperty(entries, key)) {
                            keys.push(key.substr(keyPrefixLength));
                        }
                    }
                    return keys;
                } else {
                    throw new Error(invalidArgumentError);
                }
            };

            hash.values = function() {
                if (arguments.length === 0) {
                    var values = [];
                    for (var key in entries) {
                        if (hasProperty(entries, key)) {
                            values.push(entries[key]);
                        }
                    }
                    return values;
                } else {
                    throw new Error(invalidArgumentError);
                }
            };

            var argumentKey, argumentValue;
            if (arguments.length === 1) {
                if (isDirectedPair(value)) {
                    hash.set(value.key(), value.value());
                } else if (isCollection(value)) {
                    each(value, function(entry) {
                        if (isDirectedPair(entry)) {
                            argumentKey = entry.key();
                            if (hash.has(argumentKey)) {
                                throw new Error(invalidArgumentError);
                            } else {
                                hash.set(argumentKey, entry.value());
                            }
                        } else {
                            throw new Error(invalidArgumentError);
                        }
                    });
                } else if (typeof value === 'object') {
                    for (var objectKey in value) {
                        if (hasProperty(value, objectKey)) {
                            hash.set(objectKey, value[objectKey]);
                        }
                    }
                } else {
                    throw new Error(invalidArgumentError);
                }
            } else if (arguments.length > 1) {
                if (isDirectedPair(value)) {
                    each(arguments, function(argument) {
                        if (isDirectedPair(argument)) {
                            argumentKey = argument.key();
                            if (hash.has(argumentKey)) {
                                throw new Error(invalidArgumentError);
                            } else {
                                hash.set(argumentKey, argument.value());
                            }
                        } else {
                            throw new Error(invalidArgumentError);
                        }
                    });
                } else if (arguments.length / 2 === Math.floor(arguments.length / 2)) {
                    for (var i = 0; i < arguments.length; i += 2) {
                        argumentKey = arguments[i];
                        if (typeof argumentKey === 'string' && !hash.has(argumentKey)) {
                            argumentValue = arguments[i + 1];
                            hash.set(argumentKey, argumentValue);
                        } else {
                            throw new Error(invalidArgumentError);
                        }
                    }
                } else {
                    throw new Error(invalidArgumentError);
                }
            }

            return hash;
        };

        isHash = function(value) {
            if (arguments.length === 1) {
                return value instanceof Hash;
            } else {
                throw new Error(invalidArgumentError);
            }
        };

        function Iterator() {}
        Iterator.prototype = new Collection();

        createIterator = function(collection) {
            var i = 0,
                iterator;
            if (arguments.length === 1) {
                if (isIterator(collection)) {
                    return collection;
                } else if (isArrayLike(collection)) {
                    iterator = new Iterator();
                    iterator.hasNext = function() {
                        if (arguments.length === 0) {
                            return i < collection.length;
                        } else {
                            throw new Error(invalidArgumentError);
                        }
                    };
                    iterator.next = function() {
                        if (arguments.length === 0) {
                            return collection[i++];
                        } else {
                            throw new Error(invalidArgumentError);
                        }
                    };
                } else if (isHash(collection)) {
                    var keys = collection.keys();
                    iterator = new Iterator();
                    iterator.hasNext = function() {
                        if (arguments.length === 0) {
                            return i < keys.length;
                        } else {
                            throw new Error(invalidArgumentError);
                        }
                    };
                    iterator.next = function() {
                        if (arguments.length === 0) {
                            var key = keys[i++];
                            return createDirectedPair(key, collection.get(key));
                        } else {
                            throw new Error(invalidArgumentError);
                        }
                    };
                } else {
                    throw new Error(invalidArgumentError);
                }
            } else if (arguments.length === 2) {
                var hasNext = arguments[0];
                var next = arguments[1];
                if (isFunction(hasNext) && isFunction(next)) {
                    iterator = new Iterator();
                    iterator.hasNext = hasNext;
                    iterator.next = next;
                } else {
                    throw new Error(invalidArgumentError);
                }
            } else {
                throw new Error(invalidArgumentError);
            }
            return iterator;
        };

        isIterator = function(value) {
            if (arguments.length === 1) {
                return value instanceof Iterator;
            } else {
                throw new Error(invalidArgumentError);
            }
        };

        isCollection = function(value) {
            if (arguments.length === 1) {
                return isArrayLike(value) || isHash(value) || isIterator(value);
            } else {
                throw new Error(invalidArgumentError);
            }
        };

        each = function(collection, f) {
            if (arguments.length === 2) {
                var i = 0;
                var iterator = createIterator(collection);
                while (iterator.hasNext()) {
                    f(iterator.next(), i++);
                }
                return collection;
            } else {
                throw new Error(invalidArgumentError);
            }
        };

        map = function(collection, f) {
            if (arguments.length === 2) {
                var iterator = createIterator(collection);
                return createIterator(
                    iterator.hasNext,
                    function() {
                        return f(iterator.next());
                    });
            } else {
                throw new Error(invalidArgumentError);
            }
        };

        reduce = function(collection, initialValue, f) {
            var hasInitialValue = (arguments.length === 3);
            if (!hasInitialValue) {
                if (arguments.length === 2) {
                    f = initialValue;
                } else {
                    throw new Error(invalidArgumentError);
                }
            }

            if (!isFunction(f)) {
                throw new Error(invalidArgumentError);
            }

            var iterator = createIterator(collection);
            var result;
            if (!hasInitialValue) {
                if (iterator.hasNext()) {
                    result = iterator.next();
                    while (iterator.hasNext()) {
                        result = f(result, iterator.next());
                    }
                } else {
                    throw new Error(invalidArgumentError);
                }
            } else {
                result = initialValue;
                while (iterator.hasNext()) {
                    result = f(result, iterator.next());
                }
            }
            return result;
        };

        every = function(collection, f) {
            var iterator = createIterator(collection);
            if (arguments.length === 1) {
                if (isHash(collection)) {
                    f = function(directedPair) {
                        return directedPair.value();
                    };
                } else {
                    f = function(value) {
                        return value;
                    };
                }
            } else if (arguments.length !== 2 || !isFunction(f)) {
                throw new Error(invalidArgumentError);
            }

            while (iterator.hasNext()) {
                if (!f(iterator.next())) {
                    return false;
                }
            }
            return true;
        };

        some = function(collection, f) {
            var iterator = createIterator(collection);
            if (arguments.length === 1) {
                if (isHash(collection)) {
                    f = function(directedPair) {
                        return directedPair.value();
                    };
                } else {
                    f = function(value) {
                        return value;
                    };
                }
            } else if (arguments.length !== 2 || !isFunction(f)) {
                throw new Error(invalidArgumentError);
            }

            while (iterator.hasNext()) {
                if (f(iterator.next())) {
                    return true;
                }
            }
            return false;
        };

        notEvery = function() {
            if (arguments.length === 1 || arguments.length === 2) {
                return !every.apply(this, arguments);
            } else {
                throw new Error(invalidArgumentError);
            }
        };

        none = function() {
            if (arguments.length === 1 || arguments.length === 2) {
                return !some.apply(this, arguments);
            } else {
                throw new Error(invalidArgumentError);
            }
        };

        merge = function() {
            if (arguments.length < 1) {
                throw new Error(invalidArgumentError);
            } else {
                var argumentsIterator = createIterator(arguments);
                var argumentIterator;

                var nextArgumentIterator = function() {
                    var argument = argumentsIterator.next();
                    if (isCollection(argument)) {
                        argumentIterator = createIterator(argument);
                    } else {
                        argumentIterator = createIterator([argument]);
                    }
                };

                nextArgumentIterator();

                var hasNext = function() {
                    while (!argumentIterator.hasNext()) {
                        if (argumentsIterator.hasNext()) {
                            nextArgumentIterator();
                        } else {
                            return false;
                        }
                    }
                    return true;
                };

                var next = function() {
                    while (!argumentIterator.hasNext()) {
                        if (argumentsIterator.hasNext()) {
                            nextArgumentIterator();
                        } else {
                            return undefined;
                        }
                    }
                    return argumentIterator.next();
                };

                return createIterator(hasNext, next);
            }
        };

        flatten = function() {
            return reduce(arguments, [], function(result, argument) {
                if (isArrayLike(argument)) {
                    return merge(result, flatten.apply(this, argument));
                } else {
                    return merge(result, argument);
                }
            });
        };

        filter = function(collection, f) {
            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            } else if (!isCollection(collection)) {
                throw new Error('Invalid collection');
            } else if (!isFunction(f)) {
                throw new Error('Invalid function');
            }

            collection = createIterator(collection);

            var nextItem;
            var foundNextItem = false;

            function skipNonMatching() {
                while (collection.hasNext() && !foundNextItem) {
                    nextItem = collection.next();
                    foundNextItem = f(nextItem);
                }
            }

            function hasNext() {
                skipNonMatching();
                return foundNextItem;
            }

            function next() {
                skipNonMatching();
                if (foundNextItem) {
                    foundNextItem = false;
                    return nextItem;
                } else {
                    return undefined;
                }
            }

            return createIterator(hasNext, next);
        };

        findFirst = function(collection, f) {
            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            } else if (!isCollection(collection)) {
                throw new Error('Invalid collection');
            } else if (!isFunction(f)) {
                throw new Error('Invalid function');
            }

            return filter(collection, f).next();
        };

        var collectionMethods = createHash(
            //'each', each,
            'ulibEach', each,
            'map', map,
            'reduce', reduce,
            'every', every,
            'some', some,
            'notEvery', notEvery,
            'none', none,
            'merge', merge,
            'concat', merge,
            'filter', filter,
            'findFirst', findFirst);

        var collectionConversionMethods = createHash(
            'toArray', createArray,
            'toHash', createHash,
            'toIterator', createIterator);

        var collectionMethodsThatReturnAnIterator = createHash(
            'map', true,
            'merge', true,
            'concat', true,
            'filter', true);

        var nativeConcat = [].concat;

        each(merge(collectionMethods, collectionConversionMethods),
            function(collectionMethod) {
                var name = collectionMethod.key();
                var f = collectionMethod.value();

                var applyMethod = function() {
                    var args = nativeConcat.call([this], createArray(arguments));
                    return f.apply(this, args);
                };

                if (collectionMethodsThatReturnAnIterator.has(name)) {
                    Array.prototype[name] = function() {
                        var args = nativeConcat.call([this], createArray(arguments));
                        return createArray(f.apply(this, args));
                    };

                    Hash.prototype[name] = function() {
                        var args = nativeConcat.call([this], createArray(arguments));
                        return createHash(f.apply(this, args));
                    };
                } else {
                    Array.prototype[name] = applyMethod;
                    Hash.prototype[name] = applyMethod;
                }

                Iterator.prototype[name] = applyMethod;
            });

        Array.prototype.flatten = function() {
            flatten(merge(this, arguments));
        };

        collectionFunctions = createHash(merge(collectionMethods, createHash(
            'createArray', createArray,
            'isArray', isArray,
            'isArrayLike', isArrayLike,
            'createDirectedPair', createDirectedPair,
            'isDirectedPair', isDirectedPair,
            'createHash', createHash,
            'isHash', isHash,
            'createIterator', createIterator,
            'isIterator', isIterator,
            'isCollection', isCollection,
            'flatten', flatten)));

        collectionFunctions.remove('isArray');
        collectionFunctions.remove('merge');
        collectionFunctions.remove('map');
        collectionFunctions.remove('filter');
    })();


    var mathsFunctions, rToD, dToR, rotatePoint;

    (function() {
        rToD = function(radians) {
            return (radians * 360) / (2 * Math.PI);
        };

        dToR = function(degrees) {
            return (degrees * 2 * Math.PI) / 360;
        };

        rotatePoint = function(originX, originY, startX, startY, angle) {
            var endPoint = {};
            var oX = startX - originX;
            var oY = startY - originY;

            endPoint.x = (oX * Math.cos(angle)) + (oY * Math.sin(angle)) + originX;
            endPoint.y = (oX * -Math.sin(angle)) + (oY * Math.cos(angle)) + originY;
            return endPoint;
        };

        mathsFunctions = createHash(
            'rToD', rToD,
            'dToR', dToR,
            'rotatePoint', rotatePoint);
    })();
    /*global window, each, createHash, createArray, isArrayLike, isFunction,
            isString, trim, reduce, flatten, notEvery, isBoolean, some,
            findFirst, isObject, isNumber, filter, createDirectedPair,
            isCollection, map, isDirectedPair */

    var domFunctions, domMethods, domMethodsWrappedWithNamespaceContext,
        copyAttributes, copyNode, getCoordinates, isClassName, classInString, isDOMNode;

    (function() {

        isDOMNode = function(value) {
            // For most DOM nodes, isObject(node) === true. However, bizarrely,
            // for <html:object> nodes, isObject(node) === false,
            // typeof node === 'function', but isFunction(node) === false.
            return (isObject(value) || typeof value === 'function') &&
                isNumber(value.nodeType);
        };

        //Get absolute mouse and node coordinates for a given 
        //node and event. Optionally, return the first scrolling
        //parent of a given node.
        getCoordinates = function(event, node) {
            //Make sure event is valid
            if (typeof event === 'undefined') {
                throw new Error('Event undefined');
            }

            var nodeCoords = {};

            if (typeof event.pageX !== 'undefined') {
                nodeCoords.mouseX = parseInt(event.pageX, 10);
                nodeCoords.mouseY = parseInt(event.pageY, 10);
            } else {
                nodeCoords.mouseX = parseInt(event.clientX + window.pageXOffset, 10);
                nodeCoords.mouseY = parseInt(event.clientY + window.pageYOffset, 10);
            }

            //Relative mouse position
            nodeCoords.mouseRX = event.clientX;
            nodeCoords.mouseRY = event.clientY;

            if (typeof node !== 'undefined') {
                //Make sure context is a DOM node
                if (node && node.nodeType !== 1 && node.nodeType !== 3 &&
                    node.nodeType !== 9) {
                    throw new Error('Invalid context');
                }

                nodeCoords.x1 = parseInt(node.offsetLeft, 10);
                nodeCoords.y1 = parseInt(node.offsetTop, 10);
                var parent = node.offsetParent;

                while (parent) {
                    nodeCoords.x1 += parseInt(parent.offsetLeft, 10);
                    nodeCoords.y1 += parseInt(parent.offsetTop, 10);
                    parent = parent.offsetParent;
                }

                //Allow for nested scrolling elements
                parent = node.parentNode;

                while (parent) {
                    if (parent !== document.documentElement) {
                        if (!isNaN(parseInt(parent.scrollLeft, 10))) {
                            nodeCoords.x1 -= parseInt(parent.scrollLeft, 10);
                            if (parent.scrollWidth !== parent.offsetWidth) {
                                if (!nodeCoords.scrollParent) {
                                    nodeCoords.scrollParent = parent;
                                }
                            }
                        }

                        if (!isNaN(parseInt(parent.scrollTop, 10))) {
                            nodeCoords.y1 -= parseInt(parent.scrollTop, 10);
                            if (parent.scrollHeight !== parent.offsetHeight) {
                                if (!nodeCoords.scrollParent) {
                                    nodeCoords.scrollParent = parent;
                                }
                            }
                        }
                    }
                    parent = parent.parentNode;
                }

                nodeCoords.x2 = parseInt(nodeCoords.x1 + node.offsetWidth, 10);
                nodeCoords.y2 = parseInt(nodeCoords.y1 + node.offsetHeight, 10);
            }

            return nodeCoords;
        };

        function getFirstNodeInSelection(selection) {
            while (isArrayLike(selection)) {
                selection = selection[0];
            }
            return selection;
        }

        function doToNodesInSelection(selection, f) {
            if (isArrayLike(selection)) {
                each(selection, function(node) {
                    doToNodesInSelection(node, f);
                });
            } else {
                f(selection);
            }
        }

        function copyAttributes($, selection, destination) {

            if (arguments.length !== 3) {
                throw new Error('Invalid argument count');
            }

            var fromAttributes = getFirstNodeInSelection(selection);
            var toAttributes = getFirstNodeInSelection(destination);

            if (fromAttributes && fromAttributes.nodeType !== 1 &&
                fromAttributes.nodeType !== 9) {
                throw new Error('Invalid context');
            }

            if (toAttributes && toAttributes.nodeType !== 1 &&
                toAttributes.nodeType !== 9) {
                throw new Error('Invalid context');
            }

            if (fromAttributes.hasAttributes()) {
                each(fromAttributes.attributes, function(attribute) {
                    toAttributes.setAttributeNS(attribute.namespaceURI,
                        attribute.nodeName, attribute.nodeValue);
                });
            }
        }

        function copyNode($, selection, destination, doAttributes) {

            if (arguments.length < 3 || arguments.length > 4) {
                throw new Error('Invalid argument count');
            }

            if (typeof doAttributes === "undefined") {
                doAttributes = false;
            }

            var fromNode = getFirstNodeInSelection(selection);

            if (fromNode && fromNode.nodeType !== 1 && fromNode.nodeType !== 9) {
                throw new Error('Invalid context');
            }

            if (typeof destination !== "string") {
                throw new Error('Invalid context');
            }

            var toNode = document.createElement(destination);
            var tempNode = fromNode.cloneNode(true);

            if (doAttributes) {
                copyAttributes($, tempNode, toNode);
            }

            if (tempNode.hasChildNodes()) {
                while (tempNode.childNodes.length > 0) {
                    toNode.appendChild(tempNode.firstChild);
                }
            }
            return $(toNode);
        }

        function append(selection, content) {
            if (arguments.length < 2) {
                throw new Error('Invalid argument count');
            } else if (arguments.length > 2) {
                content = [].slice.call(arguments, 1);
            }

            if (!isArrayLike(content)) {
                content = [content];
            }

            var parent = getFirstNodeInSelection(selection);
            if (isDOMNode(parent)) {
                doToNodesInSelection(content, function(node) {
                    if (!isDOMNode(node)) {
                        node = parent.ownerDocument.createTextNode(String(node));
                    } else if (node.ownerDocument !== parent.ownerDocument) {
                        node = parent.ownerDocument.adoptNode(node);
                    }

                    parent.appendChild(node);
                });
            }

            return selection;
        }

        function prepend(selection, content) {
            if (arguments.length < 2) {
                throw new Error('Invalid argument count');
            } else if (arguments.length > 2) {
                content = [].slice.call(arguments, 1);
            }

            if (!isArrayLike(content)) {
                content = [content];
            }

            var parent = getFirstNodeInSelection(selection);
            if (isDOMNode(parent)) {
                doToNodesInSelection(content, function(node) {
                    if (!isDOMNode(node)) {
                        node = parent.ownerDocument.createTextNode(String(node));
                    } else if (node.ownerDocument !== parent.ownerDocument) {
                        node = parent.ownerDocument.adoptNode(node);
                    }

                    parent.insertBefore(node, parent.firstChild);
                });
            }

            return selection;
        }

        function appendTo(selection, parent) {
            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            }

            if (!isArrayLike(parent)) {
                parent = [parent];
            }

            append(parent, selection);

            return selection;
        }

        function prependTo(selection, parent) {
            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            }

            if (!isArrayLike(parent)) {
                parent = [parent];
            }

            prepend(parent, selection);

            return selection;
        }

        function remove(selection) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            }

            doToNodesInSelection(selection, function(node) {
                if (isDOMNode(node) && isDOMNode(node.parentNode) &&
                    isFunction(node.parentNode.removeChild)) {
                    node.parentNode.removeChild(node);
                }
            });

            return selection;
        }

        function empty(selection) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            }

            doToNodesInSelection(selection, function(node) {
                if (isDOMNode(node) && isFunction(node.removeChild)) {
                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                }
            });

            return selection;
        }

        function first($, selection) {
            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            }

            return $(getFirstNodeInSelection(selection));
        }

        function firstChild($, selection) {
            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            }

            var firstItem = getFirstNodeInSelection(selection);
            var firstChildNode;

            if (isDOMNode(firstItem) && isDOMNode(firstItem.firstChild)) {
                return $(firstItem.firstChild);
            } else {
                return $([]);
            }
        }

        function children($, selection) {
            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            }

            var childNodes = [];

            doToNodesInSelection(selection, function(node) {
                if (isDOMNode(node) && isArrayLike(node.childNodes)) {
                    childNodes = childNodes.concat(node.childNodes);
                }
            });

            return $(childNodes);
        }

        function parent($, selection) {
            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            }

            var currentNode = getFirstNodeInSelection(selection);
            if (isDOMNode(currentNode) && isDOMNode(currentNode.parentNode)) {
                return $(currentNode.parentNode);
            } else {
                return undefined;
            }
        }

        function attr(namespaceContext, selection, qualifiedName, value) {
            if (arguments.length < 3 || arguments.length > 4) {
                throw new Error('Invalid argument count');
            }

            var m = /^(?:([^:]+):)?([^:]+)$/.exec(qualifiedName);
            if (!isString(qualifiedName) || !m) {
                throw new Error('Invalid qualified name');
            }

            var prefix = m[1];
            var namespaceURI = namespaceContext.getAttributeNamespaceURI(prefix);
            var localName = m[2];

            var removingAttribute;

            if (arguments.length === 3) {
                var node = getFirstNodeInSelection(selection);
                if (isDOMNode(node) && isFunction(node.getAttributeNS)) {
                    return node.getAttributeNS(namespaceURI, localName);
                } else {
                    return null;
                }
            } else {
                if (value === undefined || value === null) {
                    doToNodesInSelection(selection, function(node) {
                        if (isDOMNode(node) &&
                            isFunction(node.removeAttributeNS)) {
                            node.removeAttributeNS(namespaceURI, localName);
                        }
                    });
                } else {
                    doToNodesInSelection(selection, function(node) {
                        if (isDOMNode(node) &&
                            isFunction(node.setAttributeNS)) {
                            node.setAttributeNS(
                                namespaceURI, qualifiedName, value);
                        }
                    });
                }

                return selection;
            }
        }

        function text(selection, textString) {
            if (arguments.length === 1) {
                selection = getFirstNodeInSelection(selection);
                if (isDOMNode(selection) && isString(selection.textContent)) {
                    return selection.textContent;
                } else {
                    return undefined;
                }
            } else if (arguments.length === 2) {
                textString = String(textString);
                doToNodesInSelection(selection, function(node) {
                    if (isDOMNode(node) && isString(node.textContent)) {
                        node.textContent = textString;
                    }
                });

                return selection;
            } else {
                throw new Error('Invalid argument count');
            }
        }

        isClassName = function(value) {
            if (arguments.length === 1) {
                return typeof value === 'string' && !value.match(/\s/);
            } else {
                throw new Error('Invalid argument count');
            }
        };

        classInString = function(classNames, className) {
            if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            } else if (typeof classNames !== 'string') {
                throw new Error('Invalid class names string');
            } else if (!isClassName(className)) {
                throw new Error('Invalid class name');
            }

            return className.indexOf(' ') < 0 &&
                (' ' + classNames + ' ').indexOf(' ' + className + ' ') >= 0;
        };

        function hasClass(namespaceContext, selection,
            attributeName, className) {
            if (arguments.length === 3) {
                className = attributeName;
                attributeName = 'class';
            } else if (arguments.length !== 4) {
                throw new Error('Invalid argument count');
            }

            if (!isClassName(className)) {
                throw new Error('Invalid class name');
            }

            var classNames = attr(namespaceContext, selection, attributeName) || '';
            return classInString(classNames, className);
        }

        function addClass(namespaceContext, selection,
            attributeName, className) {
            if (arguments.length === 3) {
                className = attributeName;
                attributeName = 'class';
            } else if (arguments.length !== 4) {
                throw new Error('Invalid argument count');
            }

            if (!isClassName(className)) {
                throw new Error('Invalid class name');
            }

            doToNodesInSelection(selection, function(node) {
                var classNames = attr(namespaceContext, node, attributeName) || '';
                if (!classInString(classNames, className)) {
                    classNames = trim(classNames + ' ' + className);
                    attr(namespaceContext, [node], attributeName, classNames);
                }
            });

            return selection;
        }

        function removeClass(namespaceContext, selection,
            attributeName, className) {
            if (arguments.length === 3) {
                className = attributeName;
                attributeName = 'class';
            } else if (arguments.length !== 4) {
                throw new Error('Invalid argument count');
            }

            if (!isClassName(className)) {
                throw new Error('Invalid class name');
            }

            doToNodesInSelection(selection, function(node) {
                var classNameWithSpaces = ' ' + className + ' ';
                var classNames = ' ' + (attr(namespaceContext, node,
                    attributeName) || '') + ' ';
                while (classNames.indexOf(classNameWithSpaces) !== -1) {
                    classNames = classNames.replace(classNameWithSpaces, ' ');
                }
                classNames = trim(classNames);
                attr(namespaceContext, node, attributeName, classNames);
            });

            return selection;
        }

        function css(selection, styleName, styleValue) {
            var styles;

            function createStyleDirectedPairFromString(styleString) {
                var m = /^([^:]+?)\s*:\s*([^:]+?)\s*;?\s*$/.exec(styleString);
                if (!m) {
                    throw new Error('Invalid style');
                }
                var styleName = m[1];
                var styleValue = m[2];
                return createDirectedPair(styleName, styleValue);
            }

            var directedPair;
            if (arguments.length === 2) {
                if (isString(arguments[1])) {
                    styles = [arguments[1]];
                } else if (isObject(arguments[1])) {
                    styles = createHash(arguments[1]);
                } else if (isCollection(arguments[1])) {
                    styles = arguments[1];
                } else {
                    throw new Error('Invalid styles');
                }
            } else if (arguments.length === 3) {
                directedPair = createDirectedPair(styleName, String(styleValue));
                styles = [directedPair];
            } else {
                throw new Error('Invalid argument count');
            }

            styles = createHash(map(styles, function(style) {
                if (isString(style)) {
                    style = createStyleDirectedPairFromString(style);
                } else if (!isDirectedPair(style)) {
                    throw new Error('Invalid style');
                }
                return createDirectedPair(trim(style.key()), trim(style.value()));
            }));

            doToNodesInSelection(selection, function(node) {
                if (isDOMNode(node) && isObject(node.style)) {
                    each(styles, function(style) {
                        node.style[style.key()] = style.value();
                    });
                }
            });

            return selection;
        }

        function value(selection) {
            if (arguments.length === 1) {
                var node = getFirstNodeInSelection(selection);
                if (isDOMNode(node)) {
                    if (node.type === 'checkbox' || node.type === 'radio') {
                        var nodes = document.getElementsByName(node.name);
                        if (node.type === 'checkbox') {
                            return reduce(nodes, [], function(value, node) {
                                if (node.checked) {
                                    return value.concat(node.value);
                                } else {
                                    return value;
                                }
                            });
                        } else {
                            var checkedNode = findFirst(nodes, function(node) {
                                return node.checked;
                            });
                            if (checkedNode === undefined) {
                                return undefined;
                            } else {
                                return checkedNode.value;
                            }
                        }
                    } else {
                        return node.value;
                    }
                } else {
                    return undefined;
                }
            } else if (arguments.length >= 2) {
                var values;
                if (arguments.length === 2 && arguments[1] === undefined) {
                    values = [""];
                } else {
                    values = createArray(arguments).slice(1);
                    values = createArray(flatten(values));
                    if (notEvery(values, isString)) {
                        throw new Error('Invalid value');
                    }
                }

                doToNodesInSelection(selection, function(node) {
                    if (!isDOMNode(node)) {
                        return;
                    } else if (node.type === 'checkbox' || node.type === 'radio') {
                        var nodeGroup = document.getElementsByName(node.name);
                        each(nodeGroup, function(node) {
                            if (isBoolean(node.checked) && isString(node.value)) {
                                node.checked = some(values, function(v) {
                                    return v === node.value;
                                });
                            }
                        });
                    } else if (isString(node.value)) {
                        node.value = values[0];
                    }
                });
            } else {
                throw new Error('Invalid argument count');
            }
        }

        function localName(selection, v) {
            var node = getFirstNodeInSelection(selection);
            if (arguments.length === 1) {
                if (isDOMNode(node) && isString(node.localName)) {
                    return node.localName;
                } else {
                    return undefined;
                }
            } else {
                throw new Error('Invalid argument count');
            }
        }

        function checked(selection, v) {
            if (arguments.length === 1) {
                var node = getFirstNodeInSelection(selection);
                if (node && isBoolean(node.checked)) {
                    return node.checked;
                } else {
                    return undefined;
                }
            } else if (arguments.length === 2) {
                doToNodesInSelection(selection, function(node) {
                    if (isDOMNode(node) && isBoolean(node.checked)) {
                        node.checked = Boolean(v);
                    }
                });
                return selection;
            } else {
                throw new Error('Invalid argument count');
            }
        }

        domFunctions = createHash(
            'getCoordinates', getCoordinates,
            'isDOMNode', isDOMNode);
        /* 'isClassName', isClassName,
        'classInString', classInString, */

        domMethods = createHash(
            /* 'append', append,
            'prepend', prepend,
            'appendTo', appendTo,
            'prependTo', prependTo,
            'remove', remove,
            'empty', empty,
            'text', text,
            'css', css, */
            'localName', localName,
            'checked', checked,
            'value', value);

        /* domMethodsWrappedWithNamespaceContext = createHash(
                'attr', attr,
                'hasClass', hasClass,
                'addClass', addClass,
                'removeClass', removeClass,
                'copyAttributes', copyAttributes,
                'copyNode', copyNode,
                'children', children,
                'parent', parent,
                'first', first,
                'firstChild', firstChild); */
        domMethodsWrappedWithNamespaceContext = createHash(
            'attrNS', attr,
            'hasAttrToken', hasClass,
            'addAttrToken', addClass,
            'removeAttrToken', removeClass,
            'copyAttributes', copyAttributes,
            'copyNode', copyNode,
            'firstChild', firstChild);
    }());
    /*global, qti, document, window, console, createHash*/

    var dialogueFunctions, dialogue;

    (function() {

        dialogue = function(options) {
            var container;
            var header;
            var topClose;
            var img;
            var body;
            var content;
            var contentp;
            var actions;
            var overlay;
            var wrapper;

            var openDialogue;
            var closeDialogue;
            var createElements;
            var createButtons;
            var createHandler;

            closeDialogue = function() {
                document.body.removeChild(wrapper);
                document.body.removeChild(overlay);
                container = null;
                header = null;
                img = null;
                body = null;
                content = null;
                contentp = null;
                actions = null;
                overlay = null;
                wrapper = null;
            };

            var defaultOptions = {
                top: 0,
                modal: true,
                buttons: {
                    'OK': 'closeDialogue'
                }
            };

            var actionArray = [];
            actionArray.closeDialogue = closeDialogue;

            for (var option in options) {
                if (option) {
                    defaultOptions[option] = options[option];
                }
            }

            openDialogue = function() {
                var ws = wrapper.style;
                ws.top = (document.body.scrollTop || document.documentElement.scrollTop) + defaultOptions.top + 'px';
                ws.zIndex = 9999;
                if (defaultOptions.modal) {
                    overlay.style.display = 'block';
                } else {
                    overlay.style.display = 'none';
                }
                ws.display = 'block';
                wrapper.focus();
            };

            createElements = function() {
                if (overlay || wrapper) {
                    return;
                }

                overlay = document.createElement('div');
                if (defaultOptions.hideScreen) {
                    overlay.className = 'dialogue-overlay hideScreen';
                } else {
                    overlay.className = 'dialogue-overlay';
                }
                document.body.appendChild(overlay);

                header = document.createElement('div');
                header.className = 'title hasicon';
                header.innerHTML = defaultOptions.title;

                if (defaultOptions.hasTopClose) {
                    topClose = document.createElement('div');
                    topClose.className = 'close';
                    topClose.addEventListener('click', closeDialogue, false);
                    header.appendChild(topClose);
                }

                if (defaultOptions.img) {
                    img = document.createElement('img');
                    img.src = defaultOptions.img;
                    if (defaultOptions.imgWidth) {
                        img.width = defaultOptions.imgWidth;
                    }
                    if (defaultOptions.imgHeight) {
                        img.height = defaultOptions.imgHeight;
                    }
                    header.appendChild(img);
                }

                content = document.createElement('div');
                content.className = 'content';
                contentp = document.createElement('p');
                content.appendChild(contentp);
                contentp.innerHTML = defaultOptions.content;

                if (defaultOptions.controls) {
                    content.appendChild(defaultOptions.controls);
                }

                actions = document.createElement('div');
                actions.className = 'textCentre';

                var buttons = createButtons(defaultOptions.buttons);
                if (buttons.length > 0) {
                    for (var btn in buttons) {
                        if (buttons[btn].nodeType) {
                            actions.appendChild(buttons[btn]);
                        }
                    }
                }

                content.appendChild(actions);

                container = document.createElement('div');
                container.className = 'box2 nontest';
                if (header) {
                    container.appendChild(header);
                }
                container.appendChild(content);

                wrapper = document.createElement('div');
                wrapper.className = 'dialogue-wrapper';
                var ws = wrapper.style;
                ws.position = 'absolute';
                ws.display = 'none';
                ws.outline = 'none';
                wrapper.appendChild(container);

                wrapper = document.body.appendChild(wrapper);
            };

            createButtons = function(buttons) {
                var buttonArray = [];
                for (var buttonText in buttons) {
                    if (buttonText) {
                        var button = document.createElement('button');
                        button.className = 'button';
                        button.innerHTML = buttonText;
                        button.addEventListener('click', createHandler(actionArray[buttons[buttonText]], this), false);
                        buttonArray.push(button);
                    }
                }
                return buttonArray;
            };

            createHandler = function(method, obj) {
                return function(e) {
                    method.call(obj, e);
                };
            };

            createElements();
            openDialogue();

        };

        dialogueFunctions = createHash('dialogue', dialogue);

    }());


    var mouseFunctions, dragScroll, mouseScroll, mouseTrack, svgMouse;

    (function() {

        //Ensure that the specified scrollElement scrolls into view
        //if the scrollElement is enclosed inside a scrolling element
        //and an item is dragged/moved to the edge of the scrolling element.
        //This also works if the browser window has been sized to an
        //area smaller than the scrollElement. Scrolling happens both
        //horizontally and vertically as appropriate.

        function scroll(scrollElement, moveEvent, stopEvent) {
            //Make sure context is a DOM node
            if (scrollElement && scrollElement.nodeType !== 1 && scrollElement.nodeType !== 9) {
                throw new Error('Invalid context');
            }

            var mouseX;
            var mouseY;
            var mousePosX;
            var mousePosY;
            var scrollPageX;
            var scrollPageY;

            scrollElement.addEventListener(moveEvent, function(event) {
                var eCoords = getCoordinates(event);
                mouseX = eCoords.mouseX;
                mouseY = eCoords.mouseY;

                var scrollAreaHeight;
                var scrollAreaTop;
                var scrollAreaWidth;
                var scrollAreaLeft;
                var scrollObject;

                eCoords = getCoordinates(event, event.target);

                if (eCoords.scrollParent) {
                    scrollAreaHeight = eCoords.scrollParent.offsetHeight;
                    scrollAreaTop = eCoords.scrollParent.offsetTop;
                    scrollAreaWidth = eCoords.scrollParent.offsetWidth;
                    scrollAreaLeft = eCoords.scrollParent.offsetLeft;
                    scrollObject = eCoords.scrollParent;
                } else {
                    scrollAreaHeight = window.innerHeight;
                    scrollAreaTop = window.pageYOffset;
                    scrollAreaWidth = window.innerWidth;
                    scrollAreaLeft = window.pageXOffset;
                    scrollObject = document.documentElement;
                }

                var nodeTop = scrollAreaTop - 10;
                var nodeBottom = scrollAreaHeight + scrollAreaTop + 10;
                var nodeLeft = scrollAreaLeft - 10;
                var nodeRight = scrollAreaWidth + scrollAreaLeft + 10;

                //Scroll down page if list of drop targets is below visible page
                if (mouseY > parseInt(scrollAreaHeight + scrollAreaTop - 50, 10)) {
                    mousePosY = mouseY;
                    clearInterval(scrollPageY);
                    //Set scroll rate independent of event refresh rate
                    scrollPageY = setInterval(function() {
                        if (nodeBottom > parseInt(scrollAreaHeight + scrollAreaTop, 10) &&
                            (mouseY >= mousePosY)) {
                            scrollObject.scrollTop += 5;
                        }
                    }, 20);
                }

                //Scroll up page if list of drop targets is above visible page
                if (mouseY < parseInt(scrollAreaTop + 50, 10)) {
                    mousePosY = mouseY;
                    clearInterval(scrollPageY);
                    //Set scroll rate independent of event refresh rate
                    scrollPageY = setInterval(function() {
                        if (nodeTop < parseInt(scrollAreaTop, 10) &&
                            (mouseY <= mousePosY)) {
                            scrollObject.scrollTop -= 5;
                        }
                    }, 20);
                }

                //Scroll page right if list of drop targets is right of visible page
                if (mouseX > parseInt(scrollAreaWidth + scrollAreaLeft - 100, 10)) {
                    mousePosX = mouseX;
                    clearInterval(scrollPageX);
                    //Set scroll rate independent of event refresh rate
                    scrollPageX = setInterval(function() {
                        if (nodeRight > parseInt(scrollAreaWidth + scrollAreaLeft, 10) &&
                            (mouseX >= mousePosX)) {
                            scrollObject.scrollLeft += 5;
                        }
                    }, 0);
                }

                //Scroll page left if list of drop targets is left of visible page
                if (mouseX < parseInt(scrollAreaLeft + 100, 10)) {
                    mousePosX = mouseX;
                    clearInterval(scrollPageX);
                    //Set scroll rate independent of event refresh rate
                    scrollPageX = setInterval(function() {
                        if (nodeLeft < parseInt(scrollAreaLeft, 10) &&
                            (mouseX <= mousePosX)) {
                            scrollObject.scrollLeft -= 5;
                        }
                    }, 0);
                }

            }, true);

            scrollElement.addEventListener(stopEvent, function(event) {
                clearInterval(scrollPageX);
                clearInterval(scrollPageY);
            }, true);
        }

        dragScroll = function(scrollElement) {
            scroll(scrollElement, "dragover", "dragend");
        };

        mouseScroll = function(scrollElement) {
            scroll(scrollElement, "mousemove", "mouseout");
        };


        //Track mouse movements within a chosen DOM node.

        mouseTrack = function(trackNode, scaleFactor, snapValue, accuracy, callBack, callBackUp, callBackDown, rootNode) {

            var mouseX = 0;
            var mouseY = 0;
            var currentX = 0;
            var currentY = 0;
            var moveObjectX;
            var moveObjectY;
            var showResults = false;
            var direction;
            var magnitude = 0;
            var originX;
            var originY;
            var isLinear = true;

            function getAngle() {

                var adj1;
                var adj2;
                var opp1;
                var opp2;
                var tan1;
                var tan2;
                var ang1;
                var ang2;
                var magnitude;
                var direction;

                opp1 = currentX - originX;
                adj1 = originY - currentY;
                tan1 = opp1 / adj1;
                ang1 = rToD(Math.atan(tan1));

                opp2 = originY - mouseY;
                adj2 = mouseX - originX;
                tan2 = opp2 / adj2;
                ang2 = rToD(Math.atan(tan2));

                magnitude = 0;

                if (ang1 > 0 && ang2 > 0) {
                    magnitude = 90 - (ang1 + ang2);
                }

                if (ang1 < 0 && ang2 < 0) {
                    magnitude = -(90 + (ang1 + ang2));
                }

                if (ang1 > 0 && ang2 < 0) {
                    magnitude = -(90 + (ang1 + ang2));
                }

                if (ang1 < 0 && ang2 > 0) {
                    magnitude = 90 - (ang1 + ang2);
                }

                //Skip quadrant borders - keeps calculation simple
                if (magnitude > 100) {
                    magnitude = -(2 * snapValue);
                }
                if (magnitude < -100) {
                    magnitude = (2 * snapValue);
                }

                return magnitude;
            }

            //Make sure context is a DOM node
            if (trackNode && trackNode.nodeType !== 1 && trackNode.nodeType !== 9) {
                throw new Error('Invalid context');
            }

            if (typeof scaleFactor === "object") {
                if (scaleFactor.length > 2) {
                    originX = scaleFactor[0];
                    originY = scaleFactor[1];
                    scaleFactor = scaleFactor[2];
                    isLinear = false;
                } else {
                    scaleFactor = 1;
                }
            }

            if (scaleFactor <= 0) {
                scaleFactor = 1;
            }

            var parent = trackNode.parentNode;
            var svgObject;

            while (parent) {
                if (parent.localName === "svg") {
                    svgObject = parent;
                    break;
                }
                parent = parent.parentNode;
            }

            if (typeof rootNode === 'undefined') {
                if (svgObject) {
                    rootNode = svgObject;
                } else {
                    rootNode = document.documentElement;
                }
            } else if (rootNode.localName === "svg") {
                svgObject = rootNode;
            }

            rootNode.addEventListener("mousemove", function(event) {
                var eCoords = getCoordinates(event);

                if (svgObject) {
                    var svgMatrix = svgObject.getScreenCTM();
                    var svgPoint = svgObject.createSVGPoint();
                    svgPoint.x = eCoords.mouseRX;
                    svgPoint.y = eCoords.mouseRY;
                    svgPoint = svgPoint.matrixTransform(svgMatrix.inverse());
                    mouseX = svgPoint.x;
                    mouseY = svgPoint.y;
                } else {
                    mouseX = eCoords.mouseX;
                    mouseY = eCoords.mouseY;
                }

                if (showResults) {
                    if (mouseX > currentX) {
                        direction = "x";
                        magnitude = (mouseX - currentX) / scaleFactor;
                        if (snapValue !== 0) {
                            magnitude = Math.floor(magnitude / snapValue) *
                                snapValue;
                            if (Math.abs(magnitude) > snapValue && Math.abs(magnitude) < (1 / scaleFactor)) {
                                if (magnitude < 0) {
                                    magnitude = -snapValue;
                                } else {
                                    magnitude = snapValue;
                                }
                            }
                        } else {
                            if (Math.abs(magnitude) <= (1 / scaleFactor)) {
                                if (magnitude < 0) {
                                    magnitude = -accuracy;
                                } else {
                                    magnitude = accuracy;
                                }
                            }
                        }
                        if (magnitude !== 0 && isLinear) {
                            callBack(trackNode, direction, magnitude, mouseX, mouseY);
                            currentX = mouseX;
                        }
                    }

                    if (mouseX < currentX) {
                        direction = "x";
                        magnitude = (mouseX - currentX) / scaleFactor;
                        if (snapValue !== 0) {
                            magnitude = Math.ceil(magnitude / snapValue) *
                                snapValue;
                            if (Math.abs(magnitude) > snapValue && Math.abs(magnitude) < (1 / scaleFactor)) {
                                if (magnitude < 0) {
                                    magnitude = -snapValue;
                                } else {
                                    magnitude = snapValue;
                                }
                            }
                        } else {
                            if (Math.abs(magnitude) <= (1 / scaleFactor)) {
                                if (magnitude < 0) {
                                    magnitude = -accuracy;
                                } else {
                                    magnitude = accuracy;
                                }
                            }
                        }
                        if (magnitude !== 0 && isLinear) {
                            callBack(trackNode, direction, magnitude, mouseX, mouseY);
                            currentX = mouseX;
                        }
                    }

                    if (mouseY > currentY) {
                        direction = "y";
                        magnitude = (currentY - mouseY) / scaleFactor;
                        if (snapValue !== 0) {
                            magnitude = Math.ceil(magnitude / snapValue) *
                                snapValue;
                            if (Math.abs(magnitude) > snapValue && Math.abs(magnitude) < (1 / scaleFactor)) {
                                if (magnitude < 0) {
                                    magnitude = -snapValue;
                                } else {
                                    magnitude = snapValue;
                                }
                            }
                        } else {
                            if (Math.abs(magnitude) <= (1 / scaleFactor)) {
                                if (magnitude < 0) {
                                    magnitude = -accuracy;
                                } else {
                                    magnitude = accuracy;
                                }
                            }
                        }
                        if (magnitude !== 0 && isLinear) {
                            callBack(trackNode, direction, magnitude, mouseX, mouseY);
                            currentY = mouseY;
                        }
                    }

                    if (mouseY < currentY) {
                        direction = "y";
                        magnitude = (currentY - mouseY) / scaleFactor;
                        if (snapValue !== 0) {
                            magnitude = Math.floor(magnitude / snapValue) *
                                snapValue;
                            if (Math.abs(magnitude) > snapValue && Math.abs(magnitude) < (1 / scaleFactor)) {
                                if (magnitude < 0) {
                                    magnitude = -snapValue;
                                } else {
                                    magnitude = snapValue;
                                }
                            }
                        } else {
                            if (Math.abs(magnitude) <= (1 / scaleFactor)) {
                                if (magnitude < 0) {
                                    magnitude = -accuracy;
                                } else {
                                    magnitude = accuracy;
                                }
                            }
                        }
                        if (magnitude !== 0 && isLinear) {
                            callBack(trackNode, direction, magnitude, mouseX, mouseY);
                            currentY = mouseY;
                        }
                    }

                    if (!isLinear) {

                        magnitude = getAngle() / scaleFactor;

                        if (snapValue !== 0) {
                            magnitude = Math.round(magnitude / snapValue) *
                                snapValue;
                            if (magnitude !== 0) {
                                callBack(trackNode, "r", magnitude, mouseX, mouseY);
                                currentX = mouseX;
                                currentY = mouseY;
                            }
                        } else {
                            if (magnitude !== 0) {
                                callBack(trackNode, "r", magnitude, mouseX, mouseY);
                            }
                            currentX = mouseX;
                            currentY = mouseY;
                        }

                    }
                }
            }, true);

            trackNode.addEventListener("mousedown", function(event) {
                // Prevent default prevents notepad textarea from gaining focus
                //event.preventDefault();
                showResults = true;
                currentX = mouseX;
                currentY = mouseY;
                if (callBackDown) {
                    callBackDown();
                }
            }, true);

            trackNode.addEventListener("mouseup", function(event) {
                //event.preventDefault();
                showResults = false;
                currentX = 0;
                currentY = 0;
                if (callBackUp) {
                    callBackUp();
                }
            }, true);

            rootNode.addEventListener("mouseup", function(event) {
                //event.preventDefault();
                showResults = false;
                currentX = 0;
                currentY = 0;
                if (callBackUp) {
                    callBackUp();
                }
            }, true);
        };

        //Get Mouse coordinates within a chosen SVG DOM node.

        svgMouse = function(trackContainer, trackNode, callBack) {

            var mouseX = 0;
            var mouseY = 0;

            //Make sure context is a DOM node
            if (trackContainer && trackContainer.nodeType !== 1 && trackContainer.nodeType !== 9) {
                throw new Error('Invalid context');
            }

            if (trackNode && trackNode.nodeType !== 1 && trackNode.nodeType !== 9) {
                throw new Error('Invalid context');
            }

            var parent = trackContainer.parentNode;
            var svgObject;

            while (parent) {
                if (parent.localName === "svg") {
                    svgObject = parent;
                    break;
                }
                parent = parent.parentNode;
            }

            trackNode.addEventListener("mousedown", function(event) {
                var eCoords = getCoordinates(event);
                if (svgObject) {
                    var svgMatrix = svgObject.getScreenCTM();
                    var svgPoint = svgObject.createSVGPoint();
                    svgPoint.x = eCoords.mouseRX;
                    svgPoint.y = eCoords.mouseRY;
                    svgPoint = svgPoint.matrixTransform(svgMatrix.inverse());
                    mouseX = svgPoint.x;
                    mouseY = svgPoint.y;
                } else {
                    mouseX = eCoords.mouseX;
                    mouseY = eCoords.mouseY;
                }

                callBack(mouseX, mouseY);
            }, true);
        };

        mouseFunctions = createHash(
            'dragScroll', dragScroll,
            'mouseScroll', mouseScroll,
            'mouseTrack', mouseTrack,
            'svgMouse', svgMouse);
    })();

    var ajaxFunctions, ajaxFunctionsWrappedWithNamespaceContext,
        ajax, getText, getXML, getJSON, postJSON, postXML, postText;
    /* postXML, getXML;*/

    (function() {
        /**/
        // checking post data types
        function createXMLDocFromFragment(data, nsURI) {
            var doc = document.implementation.createDocument(nsURI, "", null);
            doc.appendChild(data);
            return doc;
        }

        var check = {};
        check.xml = function(data) {
            if ($.isCollection(data)) {
                data = data[0];
            }
            if (!$.isDOMNode(data)) {
                throw new Error("incorrect xml format");
            }

            var nodeType = data.nodeType;
            if (nodeType === 1) {
                // Either a generated xml fragment or a DOM element - wrap in an xml document
                var nsURI = data.namespaceURI;
                data = createXMLDocFromFragment(data, nsURI);
                return data;
            } else if (nodeType === 9) {
                return data;
            }

            throw new Error("Incorrect DOM Element type");
        };

        check.json = function(data) {
            try {
                JSON.parse(data);
            } catch (er) {
                throw new Error("Incorrect json format");
            }
            return data;
        };

        check.plain = function(data) {
            if (typeof data === "string" || typeof data === "number") {
                return data;
            } else {
                throw new Error("Incorrect data format");
            }
        };

        function checkData(data, contentType) {
            var typeArray = contentType.split("/");
            if (typeArray.length !== 2) {
                throw new Error("incorrect content type");
            }
            var type = typeArray[1];
            if (typeof check[type] !== "function") {
                throw new Error("unknown content type");
            }

            var checkedData = check[type](data);
            return checkedData;
        }

        ajax = function(options) {
            var uri = options.uri || '';
            var method = options.method || 'GET';
            var onSuccess = options.onSuccess || function() {};
            var onError = options.onError || function() {};
            var timeout = options.timeout || 0;
            var onTimeout = options.onTimeout || function() {};
            var data = (options.data === "" || options.data === undefined) ? null : options.data;
            var contentType = options.contentType || "text/plain";
            options = null;

            var request = new XMLHttpRequest();
            var async = true;
            request.open(method, uri.toString(), async);
            request.setRequestHeader("Content-type", contentType);

            var READY_STATE_COMPLETED = 4;
            var HTTP_OK = 200;
            var dfrd = $.Deferred(); // 06/12/2012 UA: jQuery Deferred/Promise object support

            request.onreadystatechange = function(event) {
                if (request.readyState === READY_STATE_COMPLETED) {
                    if (request.status === HTTP_OK || request.status === 0) {
                        onSuccess(request);
                        dfrd.resolve();
                    } else {
                        onError(request);
                        dfrd.reject();
                    }
                }
            };

            if (timeout > 0) {
                setTimeout(function() {
                    request.abort();
                    onSuccess = function() {};
                    onError = function() {};
                    onTimeout();
                }, timeout);
            }

            var checkedData = null;
            if (method === "POST") {
                checkedData = checkData(data, contentType);
            }
            request.send(checkedData);
            return dfrd.promise();
        };

        function get(uri, onSuccess, onError, options) {
            var hasOptions;
            if (arguments.length > 4 || arguments.length < 2) {
                throw new Error('Invalid argument count');
            } else {
                options = arguments[arguments.length - 1];
                if (typeof options === 'object') {
                    hasOptions = true;
                } else {
                    if (arguments.length < 4 || options === undefined ||
                        options === null) {
                        options = {};
                        hasOptions = false;
                    } else {
                        throw new Error('Invalid options');
                    }
                }
            }

            if (!isFunction(onSuccess)) {
                throw new Error('Invalid onSuccess handler');
            }

            if (!isFunction(onError)) {
                if (arguments.length === 3 && !hasOptions &&
                    onError !== undefined && onError !== null) {
                    throw new Error('Invalid onError handler');
                } else {
                    onError = function() {};
                }
            }

            var ajaxOptions = {
                uri: uri,
                method: 'GET',
                contentType: options.contentType || "text/plain",
                onError: function(xmlHttpRequest) {
                    onError(xmlHttpRequest.status, xmlHttpRequest.statusText);
                },
                onTimeout: options.onTimeout,
                timeout: options.timeout,
                onSuccess: onSuccess
            };

            return ajax(ajaxOptions);
        }


        function post(uri, onSuccess, data, onError, options) {
            var hasOptions;
            if (arguments.length > 5 || arguments.length < 3) {
                throw new Error('Invalid argument count');
            } else {
                options = arguments[arguments.length - 1];
                if (typeof options === 'object') {
                    hasOptions = true;
                } else {
                    if (arguments.length < 5 || options === undefined ||
                        options === null) {
                        options = {};
                        hasOptions = false;
                    } else {
                        throw new Error('Invalid options');
                    }
                }
            }

            if (!isFunction(onSuccess)) {
                throw new Error('Invalid onSuccess handler');
            }

            if (!isFunction(onError)) {
                if (arguments.length === 4 && !hasOptions &&
                    onError !== undefined && onError !== null) {
                    throw new Error('Invalid onError handler');
                } else {
                    onError = function() {};
                }
            }

            var ajaxOptions = {
                uri: uri,
                method: 'POST',
                contentType: options.contentType || "application/x-www-form-urlencoded",
                onError: function(xmlHttpRequest) {
                    onError(xmlHttpRequest.status, xmlHttpRequest.statusText);
                },
                onTimeout: options.onTimeout,
                data: data,
                timeout: options.timeout,
                onSuccess: onSuccess
            };

            ajax(ajaxOptions);
        }

        function setOptions(options, contentType) {
            var newOptions = options;
            if (typeof newOptions !== "object") {
                newOptions = {};
            }
            newOptions.contentType = contentType;

            return newOptions;
        }


        getJSON = function(uri, onSuccess, onError, options) {
            var onSuccessWrapper = function(xmlHttpRequest) {
                var jsonObj;
                try {
                    jsonObj = JSON.parse(xmlHttpRequest.responseText);
                } catch (er) {
                    //console.log(er);
                    onError();
                }
                onSuccess(jsonObj);
            };
            var newOptions = setOptions(options, "application/json");
            var args = createArray(arguments);
            args[1] = onSuccessWrapper;
            args[3] = newOptions;
            get.apply(this, args);
        };

        getText = function(uri, onSuccess, onError, options) {
            var onSuccessWrapper = function(xmlHttpRequest) {
                onSuccess(xmlHttpRequest.responseText);
            };
            var args = createArray(arguments);
            args[1] = onSuccessWrapper;
            return get.apply(this, args);
        };

        getXML = function(namespaceContext, uri, onSuccess, onError, options) {
            var onSuccessWrapper = function(xmlHttpRequest) {
                //onSuccess(namespaceContext.find(xmlHttpRequest.responseXML));
                onSuccess($(xmlHttpRequest.responseXML));
            };
            var newOptions = setOptions(options, "text/xml");

            var args = createArray(arguments).slice(1);
            args[1] = onSuccessWrapper;
            args[3] = newOptions;
            return get.apply(this, args);
        };

        postJSON = function(uri, onSuccess, data, onError, options) {
            var newOptions = setOptions(options, "application/json");

            var args = createArray(arguments);
            args[4] = newOptions;
            post.apply(this, args);
        };

        postXML = function(uri, onSuccess, data, onError, options) {
            var onSuccessWrapper = function(xmlHttpRequest) {
                onSuccess(xmlHttpRequest.responseText);
            };
            var newOptions = setOptions(options, "text/xml");

            var args = createArray(arguments);
            args[1] = onSuccessWrapper;
            args[4] = newOptions;
            post.apply(this, args);
        };

        postText = function(uri, onSuccess, data, onError, options) {
            var onSuccessWrapper = function(xmlHttpRequest) {
                onSuccess(xmlHttpRequest.responseText);
            };

            var newOptions = setOptions(options, "text/plain");
            var args = createArray(arguments);
            args[1] = onSuccessWrapper;
            args[4] = newOptions;
            post.apply(this, args);
        };

        ajaxFunctions = createHash(
            'ulibAjax', ajax,
            'getText', getText,
            'ulibGetJSON', getJSON,
            'postJSON', postJSON,
            'postXML', postXML,
            'postText', postText);
        /*
                ajaxFunctions = createHash(
                        'postXML', postXML);
    
                postXML = function (uri, onSuccess, data, onError, options) {
                    var onSuccessWrapper = function (xmlHttpRequest) {
                        onSuccess(xmlHttpRequest.responseText);
                    };
                    // var newOptions = setOptions(options, "text/xml");
    
                    // var args = createArray(arguments);
                    // args[1] = onSuccessWrapper;
                    // args[4] = newOptions;
                    // post.apply(this, args);
        			$.ajax({
        				url: uri,
        				type: "POST",
        				data: data,
        				success: onSuccessWrapper,
        				error: onError,
        				dataType: "xml"
        			});
                };
    
        		getXML = function (namespaceContext, uri, onSuccess, onError, options) {
        			var onSuccessWrapper = function (xmlHttpRequest) {
        				onSuccess($(xmlHttpRequest));
        			};
        			$.ajax({
        				url: uri,
        				success: onSuccessWrapper,
        				error: onError,
        				dataType: "xml"
        			});
        		};
        */
        ajaxFunctionsWrappedWithNamespaceContext = createHash(
            'getXML', getXML);

    }());
    /*global isFunction, each, createHash, createDirectedPair, map, merge,
            createArray*/

    var eventMethods;

    (function() {
        /* var htmlDomEvents = ['abort', 'canplay', 'canplaythrough', 'change',
                'click', 'contextmenu', 'dblclick', 'drag', 'dragend',
                'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop',
                'durationchange', 'emptied', 'ended', 'formchange', 'forminput',
                'input', 'invalid', 'keydown', 'keypress', 'keyup', 'loadeddata',
                'loadedmetadata', 'loadstart', 'mousedown', 'mousemove',
                'mouseout', 'mouseover', 'mouseup', 'mousewheel', 'pause', 'play',
                'playing', 'progress', 'ratechange', 'readystatechange',
                'scroll', 'seeked', 'seeking', 'select', 'show', 'stalled',
                'submit', 'suspend', 'timeupdate', 'volumechange', 'waiting',
                'blur', 'error', 'focus', 'load', 'afterprint', 'beforeprint',
                'beforeunload', 'hashchange', 'message', 'offline', 'online',
                'pagehide', 'pageshow', 'popstate', 'redo', 'resize', 'storage',
                'undo', 'unload']; */
        var htmlDomEvents = ['dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart',
            'drop', 'drag'
        ];

        function addRemoveEventListener(action, selection, eventType, handler) {
            if (arguments.length !== 4) {
                throw new Error('Invalid argument count');
            } else if (typeof eventType !== 'string') {
                throw new Error('Invalid event type');
            } else if (!isFunction(handler)) {
                throw new Error('Invalid event handler');
            }

            // We don't bother checking the type of 'action' or 'selection' since
            // this function can't be called directly from outside ULib.

            each(selection, function(node) {
                if (isFunction(node.addEventListener)) {
                    var useCapture = true;
                    node[action + 'EventListener'](eventType, handler, useCapture);
                }
            });
        }

        function bind(selection, eventType, handler) {
            var args = ['add'].concat(createArray(arguments));
            addRemoveEventListener.apply(this, args);
        }

        function unbind(selection, eventType, handler) {
            var args = ['remove'].concat(createArray(arguments));
            addRemoveEventListener.apply(this, args);
        }

        /* eventMethods = createHash(
                'bind', bind,
                'unbind', unbind); */

        eventMethods = map(htmlDomEvents, function(eventType) {
            var f = function(selection, handler) {
                if (arguments.length !== 2) {
                    throw new Error('Invalid argument count');
                } else {
                    return bind(selection, eventType, handler);
                }
            };
            return createDirectedPair(eventType, f);
        });
    }());
    /*global unescape, createHash, createDirectedPair, window, isArrayLike,
            each, createArray, isString*/

    var uriFunctions, uriMethods, isURIString, createURI, isURI, locationAsURI,
        href, src;

    (function() {

        var uriRx = /^(?:([^#:]+):)?([^#]+)?(?:#(.*))?$/;

        isURIString = function(string) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            }

            return isString(string) && Boolean(uriRx.exec(string));
        };

        function URI() {}
        URI.prototype = {
            constructor: undefined
        };

        isURI = function(uri) {
            return uri instanceof URI;
        };

        createURI = function(initializer) {
            if (arguments.length !== 1) {
                throw new Error('Invalid argument count');
            }

            if (isURI(initializer)) {
                initializer = initializer.toString();
            }

            if (typeof initializer !== 'string') {
                throw new Error('Invalid URI initializer');
            }

            var m = uriRx.exec(initializer);
            if (!m) {
                throw new Error('Invalid URI initializer');
            }
            var scheme = m[1];
            var schemeSpecificPart = m[2];
            var fragment = m[3] && unescape(m[3]);

            var isRelative = (scheme === undefined);
            var isHierarchical = isRelative || (schemeSpecificPart &&
                schemeSpecificPart.charAt(0) === '/');

            var authority;
            var path;
            var query;
            var userInfo;
            var host;
            var port;
            var username;
            var password;
            var queryParts;
            var queryDirectedPairs;
            var queryHash;
            if (isHierarchical) {
                m = /^(?:\/\/([^\/#?]+)?)?([^#?]*)?(?:\?(.*))?$/.
                exec(schemeSpecificPart);
                if (!m) {
                    path = schemeSpecificPart;
                } else {
                    authority = m[1];
                    path = m[2] && unescape(m[2]);
                    query = m[3];
                }

                if (authority !== undefined) {
                    m = /^(?:([^@]*)@)?([^@:]+)(?::([0-9]+)?)?$/.exec(authority);
                    if (m) {
                        userInfo = m[1];
                        host = m[2]; // cannot be escaped
                        port = m[3] && parseInt(m[3], 10); // cannot be escaped
                    }

                    if (userInfo) {
                        m = /^([^:]*)(?::(.*))?$/.exec(userInfo);
                        if (m) {
                            username = m[1] && unescape(m[1]);
                            password = m[2] && unescape(m[2]);
                        }
                    }
                }

                if (query !== undefined) {
                    queryParts = query.split('&');

                    queryDirectedPairs = [];
                    queryHash = createHash();
                    for (var i = 0; i < queryParts.length; ++i) {
                        var queryPart = queryParts[i];
                        var indexOfEquals = queryPart.indexOf('=');
                        if (indexOfEquals > 0) {
                            var key = unescape(queryPart.substr(0, indexOfEquals));
                            var value = unescape(queryPart.substr(indexOfEquals + 1));
                            if (queryHash) {
                                if (queryHash.has(key)) {
                                    queryHash = undefined;
                                } else {
                                    queryHash.set(key, value);
                                }
                            }
                            queryDirectedPairs.push(
                                createDirectedPair(key, value));
                        } else {
                            queryHash = undefined;
                            queryDirectedPairs = undefined;
                            break;
                        }
                    }
                }
            }

            var uri = new URI();

            uri.toString = function() {
                return initializer;
            };

            uri.isRelative = function() {
                return isRelative;
            };

            uri.isHierarchical = function() {
                return isHierarchical;
            };

            uri.getScheme = function() {
                return scheme;
            };

            uri.getSchemeSpecificPart = function() {
                return schemeSpecificPart;
            };

            uri.getFragment = function() {
                return fragment;
            };

            uri.getAuthority = function() {
                return authority;
            };

            uri.getPath = function() {
                return path;
            };

            uri.getQuery = function() {
                return query;
            };

            uri.getUserInfo = function() {
                return userInfo;
            };

            uri.getHost = function() {
                return host;
            };

            uri.getPort = function() {
                return port;
            };

            uri.getUsername = function() {
                return username;
            };

            uri.getPassword = function() {
                return password;
            };

            uri.getQueryParts = function() {
                return queryParts;
            };

            uri.getQueryDirectedPairs = function() {
                return queryDirectedPairs;
            };

            uri.getQueryHash = function() {
                return queryHash;
            };

            var resolve = uri.resolve = function(baseURI) {
                if (arguments.length > 1) {
                    throw new Error('Invalid argument count');
                }

                if (isRelative) {
                    if (baseURI === undefined || baseURI === null) {
                        baseURI = locationAsURI();
                    } else if (typeof baseURI === 'string') {
                        baseURI = createURI(baseURI);
                    } else if (!(isURI(baseURI))) {
                        throw new Error('Invalid base URI');
                    }

                    if (baseURI.isRelative()) {
                        throw new Error('Base URI is relative');
                    } else if (!(baseURI.isHierarchical())) {
                        throw new Error('Base URI is not hierarchical');
                    }

                    var resolvedScheme = baseURI.getScheme();
                    var resolvedAuthority = baseURI.getAuthority();

                    var resolvedPath;
                    if (path.charAt(0) === '/') {
                        resolvedPath = path;
                    } else {
                        var basePath = baseURI.getPath();
                        if (basePath === '') {
                            basePath = '/';
                        } else {
                            var lastIndexOfSlash = basePath.lastIndexOf('/');
                            if (lastIndexOfSlash >= 0) {
                                basePath = basePath.substr(0, lastIndexOfSlash + 1);
                            }
                        }
                        resolvedPath = basePath + path;
                    }

                    var resolvedURIString = resolvedScheme + '://';
                    if (resolvedAuthority !== undefined) {
                        resolvedURIString += resolvedAuthority;
                    }
                    resolvedURIString += resolvedPath;
                    if (query !== undefined) {
                        resolvedURIString += '?' + query;
                    }
                    if (fragment !== undefined) {
                        resolvedURIString += '#' + fragment;
                    }

                    return createURI(resolvedURIString);
                } else {
                    return uri;
                }
            };

            function equals(ignoreFragment, comparisonURI, baseURI) {
                if (arguments.length < 2 || arguments.length > 3) {
                    throw new Error('Invalid argument count');
                }

                if (baseURI === undefined || baseURI === null) {
                    baseURI = locationAsURI();
                } else if (typeof baseURI === 'string') {
                    baseURI = createURI(baseURI);
                } else if (!(isURI(baseURI))) {
                    throw new Error('Invalid base URI');
                }

                if (comparisonURI === undefined || comparisonURI === null) {
                    return false;
                } else if (typeof comparisonURI === 'string') {
                    comparisonURI = createURI(comparisonURI);
                } else if (!(isURI(comparisonURI))) {
                    throw new Error('Invalid comparison URI');
                }

                var resolvedURI = resolve(baseURI);
                comparisonURI = comparisonURI.resolve(baseURI);

                if (ignoreFragment) {
                    return resolvedURI.getScheme() ===
                        comparisonURI.getScheme() &&
                        resolvedURI.getSchemeSpecificPart() ===
                        comparisonURI.getSchemeSpecificPart();
                } else {
                    return resolvedURI.toString() === comparisonURI.toString();
                }
            }

            uri.equals = function(comparisonURI, baseURI) {
                var ignoreFragment = false;
                var args = [ignoreFragment].concat(createArray(arguments));
                return equals.apply(this, args);
            };

            uri.equalsIgnoreFragment = function(comparisonURI, baseURI) {
                var ignoreFragment = true;
                var args = [ignoreFragment].concat(createArray(arguments));
                return equals.apply(this, args);
            };

            return uri;
        };

        locationAsURI = function() {
            if (arguments.length !== 0) {
                throw new Error('Invalid argument count');
            }

            return createURI(window.location.href);
        };

        function createURIGetterSetterMethod(propertyName) {
            return function(selection, uri) {
                if (arguments.length === 1) {
                    while (isArrayLike(selection)) {
                        if (selection[0] === undefined) {
                            return undefined;
                        } else {
                            selection = selection[0];
                        }
                    }
                    if (typeof selection[propertyName] === 'string') {
                        return createURI(selection[propertyName]);
                    } else {
                        return undefined;
                    }
                } else if (arguments.length === 2) {
                    if (isURI(uri)) {
                        uri = uri.toString();
                    } else if (uri === undefined || uri === null) {
                        uri = '';
                    } else if (typeof uri !== 'string') {
                        throw new Error('Invalid URI');
                    }
                    var setURIOnNodeOrSelection = function(nodeOrSelection) {
                        if (isArrayLike(nodeOrSelection)) {
                            each(nodeOrSelection, setURIOnNodeOrSelection);
                        } else {
                            if (typeof nodeOrSelection[propertyName] === 'string') {
                                nodeOrSelection[propertyName] = uri;
                            }
                        }
                    };
                    setURIOnNodeOrSelection(selection);
                }
            };
        }

        href = createURIGetterSetterMethod('href');
        src = createURIGetterSetterMethod('src');

        uriFunctions = createHash(
            'isURIString', isURIString,
            'createURI', createURI,
            'isURI', isURI,
            'location', locationAsURI);

        uriMethods = createHash(
            'href', href,
            'src', src);
    }());
    var tweening;

    (function() {
        function reverse(tween) {
            return function(t) {
                return 1 - tween(1 - t);
            };
        }

        function combine(tweenIn, tweenOut) {
            return function(t) {
                if (t < 0.5) {
                    return tweenIn(t * 2) / 2;
                } else {
                    return tweenOut((t - 0.5) * 2) / 2 + 0.5;
                }
            };
        }

        function linear() {
            return function(t) {
                return t;
            };
        }

        function bezier(p0, p1, p2, p3) {
            return function(t) {
                return (Math.pow((1 - t), 3) * p0) +
                    (3 * Math.pow((1 - t), 2) * t * p1) +
                    (3 * (1 - t) * Math.pow(t, 2) * p2) +
                    (Math.pow(t, 3) * p3);
            };
        }

        function easeIn(strength) {
            strength = strength || 2;
            return function(t) {
                return Math.pow(1, strength - 1) *
                    Math.pow(t, strength);
            };
        }

        function easeOut(strength) {
            return reverse(easeIn(strength));
        }

        function easeBoth(strength) {
            return combine(easeIn(strength), easeOut(strength));
        }

        function overshootOut(amount) {
            amount = amount || 1.70158;
            return function(t) {
                if (t === 0 || t === 1) {
                    return t;
                } else {
                    return ((t -= 1) * t * ((amount + 1) * t + amount) + 1);
                }
            };
        }

        function bounceOut() {
            return function(t) {
                if (t < (1 / 2.75)) {
                    return 7.5625 * t * t;
                } else if (t < (2 / 2.75)) {
                    return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
                } else if (t < (2.5 / 2.75)) {
                    return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
                }
            };
        }

        function bounceIn() {
            return reverse(bounceOut());
        }

        function bounceBoth() {
            return combine(bounceIn(), bounceOut());
        }

        function elasticOut(a, p) {
            p = p || 0.3;
            var s;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else {
                s = p / (2 * Math.PI) * Math.asin(1 / a);
            }
            return function(t) {
                if (t === 0 || t === 1) {
                    return t;
                } else {
                    return a * Math.pow(2, -10 * t) *
                        Math.sin((t - s) * (2 * Math.PI) / p) + 1;
                }
            };
        }

        tweening = {
            reverse: reverse,
            combine: combine,
            linear: linear,
            bezier: bezier,
            easeIn: easeIn,
            easeOut: easeOut,
            easeBoth: easeBoth,
            overshootOut: overshootOut,
            bounceOut: bounceOut,
            bounceIn: bounceIn,
            bounceBoth: bounceBoth,
            elasticOut: elasticOut
        };
    }());
    /*global tweening, isNumber, createHash, each, isFunction, createArray,
            isObject, isArrayLike, map, reduce, createIterator, isString $*/

    var animationFunctions, animationMethods;

    (function() {
        // function declarations
        var convertShortcutToAnimation, sequential, addTickListener,
            removeTickListener;

        (function() {
            var TICK_INTERVAL_MS = 20;
            var tickListeners = createHash();
            var nextListenerId = 0;
            var tickIntervalId;

            function tick() {
                var now = new Date().getTime();
                tickListeners.each(function(directedPair) {
                    var listener = directedPair.value();
                    // Listener may have already been removed by an earlier
                    // listener
                    if (listener !== undefined) {
                        listener(now);
                    }
                });
            }

            function startTicking() {
                if (tickIntervalId === undefined) {
                    tickIntervalId = setInterval(tick, TICK_INTERVAL_MS);
                }
            }

            function stopTicking() {
                if (tickIntervalId !== undefined) {
                    clearInterval(tickIntervalId);
                    tickIntervalId = undefined;
                }
            }

            addTickListener = function(listener) {
                var listenerId = nextListenerId++;
                tickListeners.set(listenerId, listener);
                startTicking();
                return listenerId;
            };

            removeTickListener = function(listenerId) {
                if (!tickListeners.has(listenerId)) {
                    throw new Error('Invalid listener ID');
                }
                tickListeners.remove(listenerId);
                if (tickListeners.size() === 0) {
                    stopTicking();
                }
            };
        }());

        function Animation() {}
        Animation.prototype = {
            constructor: undefined
        };

        function isAnimation(value) {
            if (arguments.length === 1) {
                return value instanceof Animation;
            } else {
                throw new Error('Invalid argument count');
            }
        }

        function createAnimation(duration, options) {
            if (arguments.length === 1) {
                if (isObject(duration)) {
                    options = duration;
                    duration = options.duration;
                } else {
                    options = {};
                }
            } else if (arguments.length === 2) {
                if (options === undefined || options === null) {
                    options = {};
                } else if (!isObject(options)) {
                    throw new Error('Invalid options');
                }
            } else {
                throw new Error('Invalid argument count');
            }
            if (!isNumber(duration) || !isFinite(duration) || duration < 0) {
                throw new Error('Invalid duration');
            }

            var tickListenerId;
            var startTime = 0;
            var timeDelta = 0;
            var done = false;
            var suspended = false;
            var loop = Boolean(options.loop);
            var tweenFunction = options.tweening || tweening.linear();

            if (!isFunction(tweenFunction)) {
                throw new Error('Invalid tweening');
            }

            var animation = new Animation();

            var listeners = createHash(
                'start', [],
                'frame', [],
                'suspend', [],
                'resume', [],
                'end', [],
                'stop', []);

            function fireListeners(eventType) {
                var listenerArguments = [].slice.call(arguments, 1);
                var eventListeners = listeners.get(eventType);
                each(eventListeners, function(listener) {
                    listener.apply(null, listenerArguments);
                });
            }

            var addListener =
                animation.addListener = function(eventType, listener) {
                    if (arguments.length !== 2) {
                        throw new Error('Invalid argument count');
                    } else if (!listeners.has(eventType)) {
                        throw new Error('Invalid event type');
                    } else if (!isFunction(listener)) {
                        throw new Error('Invalid listener');
                    }
                    listeners.get(eventType).push(listener);
                };

            var removeListener =
                animation.removeListener = function(eventType, listener) {
                    if (arguments.length !== 2) {
                        throw new Error('Invalid argument count');
                    } else if (!listeners.has(eventType)) {
                        throw new Error('Invalid event type');
                    } else if (!isFunction(listener)) {
                        throw new Error('Invalid listener');
                    }
                    listeners.get(eventType).remove(listener);
                };

            function stopTicking() {
                if (tickListenerId !== undefined) {
                    removeTickListener(tickListenerId);
                    tickListenerId = undefined;
                }
            }

            var stop = animation.stop = function() {
                stopTicking();
                fireListeners('stop');
            };

            function onTick(now) {
                if (suspended) {
                    return;
                }
                timeDelta = now - startTime;
                if (timeDelta >= duration) {
                    timeDelta = duration;
                    done = true;
                }
                var currentTweenFactor =
                    tweenFunction(timeDelta / duration);
                if (!isNumber(currentTweenFactor)) {
                    stop();
                    throw new Error('Tween function returned non-number');
                }
                fireListeners('frame', currentTweenFactor, timeDelta);
                if (done) {
                    fireListeners('end');
                    if (loop) {
                        animation.start();
                    } else {
                        stopTicking();
                    }
                }
            }

            animation.start = function(missedTimeDelta) {
                if (arguments.length < 0 || arguments.length > 1) {
                    throw new Error('Invalid argument count');
                }

                var now = new Date().getTime();
                if (missedTimeDelta === undefined) {
                    startTime = now;
                    timeDelta = 0;
                } else if (!isNumber(missedTimeDelta) ||
                    !isFinite(missedTimeDelta) ||
                    missedTimeDelta < 0) {
                    throw new Error('Invalid missed time delta');
                } else {
                    startTime = now - missedTimeDelta;
                    timeDelta = missedTimeDelta;
                }

                done = false;
                suspended = false;
                startTime = new Date().getTime();
                fireListeners('start', missedTimeDelta);

                if (tickListenerId === undefined) {
                    tickListenerId = addTickListener(onTick);
                }
            };

            animation.suspend = function() {
                if (arguments.length !== 0) {
                    throw new Error('Invalid argument count');
                }
                suspended = true;
                fireListeners('suspend');
            };

            animation.resume = function() {
                if (arguments.length !== 0) {
                    throw new Error('Invalid argument count');
                }
                var timeSuspended = new Date().getTime() - startTime - timeDelta;
                startTime += timeSuspended;
                suspended = false;
                fireListeners('resume');
            };

            animation.then = function(nextAnimation) {
                if (arguments.length !== 1) {
                    throw new Error('Invalid argument count');
                }

                nextAnimation = convertShortcutToAnimation(nextAnimation);
                if (!isAnimation(nextAnimation)) {
                    throw new Error('Invalid animation');
                }

                return sequential([animation, nextAnimation]);
            };

            animation.isAnimating = function() {
                if (arguments.length !== 0) {
                    throw new Error('Invalid argument count');
                }
                return tickListenerId !== undefined;
            };

            animation.getDuration = function() {
                if (arguments.length !== 0) {
                    throw new Error('Invalid argument count');
                }
                return duration;
            };

            animation.getTimeDelta = function() {
                if (arguments.length !== 0) {
                    throw new Error('Invalid argument count');
                }
                return timeDelta;
            };

            animation.isLoop = function() {
                if (arguments.length !== 0) {
                    throw new Error('Invalid argument count');
                }
                return loop;
            };

            return animation;
        }

        convertShortcutToAnimation = function(value) {
            if (isAnimation(value)) {
                return value;
            } else if (isNumber(value)) {
                var duration = value;
                return createAnimation(duration);
            } else if (isFunction(value)) {
                var f = value;
                var animation = createAnimation(0);
                animation.addListener('start', f);
                return animation;
            } else {
                throw new Error('Invalid animation');
            }
        };

        function concurrent(animations, options) {
            if (arguments.length === 1) {
                if (isObject(animations) && !isArrayLike(animations)) {
                    options = animations;
                    animations = options.animations;
                } else {
                    options = {};
                }
            } else if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            }
            if (!isArrayLike(animations) || animations.length === 0) {
                throw new Error('Invalid animations');
            } else if (!isObject(options) || options.duration !== undefined) {
                throw new Error('Invalid options');
            }

            animations = createArray(map(animations, convertShortcutToAnimation));

            var duration = reduce(animations, 0, function(duration, animation) {
                return Math.max(animation.getDuration(), duration);
            });

            var controlAnimation = createAnimation(duration, options);

            controlAnimation.addListener('start', function(missedTimeDelta) {
                each(animations, function(animation) {
                    animation.start(missedTimeDelta);
                });
            });

            controlAnimation.addListener('suspend', function() {
                each(animations, function(animation) {
                    animation.suspend();
                });
            });

            controlAnimation.addListener('resume', function() {
                each(animations, function(animation) {
                    animation.resume();
                });
            });

            controlAnimation.addListener('stop', function() {
                each(animations, function(animation) {
                    animation.stop();
                });
            });

            return controlAnimation;
        }

        sequential = function(animations, options) {
            if (arguments.length === 1) {
                if (isObject(animations) && !isArrayLike(animations)) {
                    options = animations;
                    animations = options.animations;
                } else {
                    options = {};
                }
            } else if (arguments.length !== 2) {
                throw new Error('Invalid argument count');
            }
            if (!isArrayLike(animations) || animations.length === 0) {
                throw new Error('Invalid animations');
            } else if (!isObject(options) || options.duration !== undefined) {
                throw new Error('Invalid options');
            }

            animations = createArray(map(animations, convertShortcutToAnimation));

            var duration = reduce(animations, 0, function(duration, animation) {
                return duration + animation.getDuration();
            });

            var controlAnimation = createAnimation(duration, options);

            controlAnimation.addListener('start', function(missedTimeDelta) {
                var animationIterator = createIterator(animations);
                var nextStartDelta = 0;

                function startChildAnimation(animation, missedTimeDelta) {
                    function onControlSuspend() {
                        animation.suspend();
                    }

                    function onControlResume() {
                        animation.resume();
                    }

                    function onControlStop() {
                        animation.stop();
                    }

                    function addControlListeners() {
                        controlAnimation.addListener(
                            'suspend', onControlSuspend);
                        controlAnimation.addListener(
                            'resume', onControlResume);
                        controlAnimation.addListener(
                            'stop', onControlStop);
                    }

                    function removeControlListeners() {
                        controlAnimation.removeListener(
                            'suspend', onControlSuspend);
                        controlAnimation.removeListener(
                            'resume', onControlResume);
                        controlAnimation.removeListener(
                            'stop', onControlStop);
                    }

                    function removeAnimationListeners() {
                        animation.removeListener(
                            'stop', removeControlListeners);
                        animation.removeListener(
                            'stop', removeAnimationListeners);
                    }

                    function addAnimationListeners() {
                        animation.addListener(
                            'stop', removeControlListeners);
                        animation.addListener(
                            'stop', removeAnimationListeners);
                    }

                    if (!animation.isAnimating()) {
                        addControlListeners();
                        addAnimationListeners();

                        animation.start(missedTimeDelta);
                    }
                }

                function onFrame(tweenFactor, timeDelta) {
                    while (timeDelta >= nextStartDelta &&
                        animationIterator.hasNext()) {
                        var animation = animationIterator.next();
                        var missedTimeDelta = timeDelta - nextStartDelta;
                        nextStartDelta += animation.getDuration();
                        startChildAnimation(animation, missedTimeDelta);
                    }
                }

                controlAnimation.addListener('frame', onFrame);
                onFrame(0, missedTimeDelta);
            });

            // override 'then' method for greater efficiency.
            controlAnimation.then = function(nextAnimation) {
                if (arguments.length !== 1) {
                    throw new Error('Invalid argument count');
                }

                nextAnimation = convertShortcutToAnimation(nextAnimation);
                if (!isAnimation(nextAnimation)) {
                    throw new Error('Invalid animation');
                }

                return sequential(animations.concat(nextAnimation));
            };

            return controlAnimation;
        };

        function numberZeroToOneParser(value) {
            var floatValue = parseFloat(value);
            if (isNaN(floatValue)) {
                return null;
            }
            return {
                value: Math.min(Math.max(0, floatValue), 1),
                units: ""
            };
        }

        function numberParser(value) {
            var floatValue = parseFloat(value);
            if (isNaN(floatValue)) {
                return null;
            }
            return {
                value: floatValue,
                units: ""
            };
        }

        function cssLengthOrPercentageParser(value) {
            if (!value) {
                return null;
            }
            var parsedValue = value.match(/(?:^\s*(-?\d*(?:\.\d*)*)(em|ex|px|in|cm|mm|pt|pc)\s*$)|(?:^\s*(\d*(?:\.\d*)*))(%)\s*$|(?:^\s*(0)(?:\.0*)*\s*$)/);
            /* 0: match
             * 1: length value
             * 2: units
             * 3: percentage value
             * 4: %
             * 5: 0
             */
            var floatValue = parseFloat(parsedValue[1]);
            if (!isNaN(floatValue) && !!parsedValue[2]) {
                return {
                    value: floatValue,
                    units: parsedValue[2]
                };
            }
            floatValue = parseFloat(parsedValue[3]);
            if (!isNaN(floatValue) && !!parsedValue[4]) {
                return {
                    value: floatValue,
                    units: parsedValue[4]
                };
            }
            floatValue = parseFloat(parsedValue[5]);
            if (!isNaN(floatValue)) {
                return {
                    value: floatValue,
                    units: ""
                };
            }
            return null;
        }

        function cssColorParser(value) {
            var parsedValue = value.match(/(?:^#([0-9a-fA_F]{2})([0-9a-fA_F]{2})([0-9a-fA_F]{2})$|^#([0-9a-fA_F]{1})([0-9a-fA_F]{1})([0-9a-fA_F]{1})$|^(?:rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$)|^(?:rgb\(\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$))/),
                color;
            color = null;
            if (!!parsedValue) {
                if (parsedValue[1] && parsedValue[2] && parsedValue[3]) {
                    color = {
                        red: parseInt(parsedValue[1], 16),
                        green: parseInt(parsedValue[2], 16),
                        blue: parseInt(parsedValue[3], 16)
                    };
                }
                if (parsedValue[4] && parsedValue[5] && parsedValue[6]) {
                    color = {
                        red: parseInt(parsedValue[4], 16),
                        green: parseInt(parsedValue[5], 16),
                        blue: parseInt(parsedValue[6], 16)
                    };
                    color.red |= (color.red << 4);
                    color.green |= (color.green << 4);
                    color.blue |= (color.blue << 4);
                }
                if (parsedValue[7] && parsedValue[8] && parsedValue[9]) {
                    color = {
                        red: parseInt(parsedValue[7], 10),
                        green: parseInt(parsedValue[8], 10),
                        blue: parseInt(parsedValue[9], 10)
                    };
                }
                if (parsedValue[10] && parsedValue[11] && parsedValue[12]) {
                    color = {
                        red: Math.round(parseInt(parsedValue[10], 10) * 2.55),
                        green: Math.round(parseInt(parsedValue[11], 10) * 2.55),
                        blue: Math.round(parseInt(parsedValue[12], 10) * 2.55)
                    };
                }
            }
            return color;
        }

        function getCurrentCssPropertyvalue(element, propertyName) {
            var styles = document.defaultView.getComputedStyle(element, null);
            var currentStyle = styles.getPropertyValue(propertyName);
            return this.parse(currentStyle, element);
        }

        function cssPropertySetter(element, propertyName, propertyDelta, from, units) {
            var fromValue = from.value;
            return function(tweenFactor) {
                element.style[propertyName] = propertyDelta * tweenFactor + fromValue + units;
            };
        }

        function cssColorSetter(element, propertyName, propertyDelta, from, units) {
            var fromRed = from.red;
            var fromGreen = from.green;
            var fromBlue = from.blue;
            var deltaRed = propertyDelta.red;
            var deltaGreen = propertyDelta.green;
            var deltaBlue = propertyDelta.blue;
            return function(tweenFactor) {
                var red = Math.round(deltaRed * tweenFactor + fromRed);
                var green = Math.round(deltaGreen * tweenFactor + fromGreen);
                var blue = Math.round(deltaBlue * tweenFactor + fromBlue);
                var rgb = "rgb(" +
                    Math.min(red, 255).toString(10) + ", " +
                    Math.min(green, 255).toString(10) + ", " +
                    Math.min(blue, 255).toString(10) + ")";
                element.style[propertyName] = rgb;
            };
        }


        function getCurrentAttributeNumberValue(element, propertyName) {
            return {
                value: parseFloat(element.getAttributeNS(null, propertyName)),
                units: ""
            };
        }

        function attributeNumberSetter(element, propertyName, propertyDelta, from, units) {
            return (function(element, propertyName, propertyDelta, fromValue, units) {
                return function(tweenFactor) {
                    element.setAttributeNS(null, propertyName, (propertyDelta * tweenFactor + fromValue));
                };
            })(element, propertyName, propertyDelta, from.value, units);
        }

        function normaliseHorizontalPercentage(containerStyles, percentage) {
            var containerWidth = parseInt.call(null, containerStyles.getPropertyValue("width"));
            containerWidth += parseInt.call(null, containerStyles.getPropertyValue("padding-left")) + parseInt.call(null, containerStyles.getPropertyValue("padding-right"));
            percentage.value = (percentage.value / 100) * containerWidth;
            percentage.units = "px";
        }

        function normaliseVerticalPercentage(containerStyles, percentage) {
            var containerHeight = parseInt.call(null,
                containerStyles.getPropertyValue("height"));
            containerHeight +=
                parseInt.call(null,
                    containerStyles.getPropertyValue("padding-top")) +
                parseInt.call(null,
                    containerStyles.getPropertyValue("padding-bottom"));
            percentage.value = (percentage.value / 100) * containerHeight;
            percentage.units = "px";
        }

        function erroneousNormalisation() {
            throw new Error("Percentage specified for inappropriate property by animation");
        }

        function simpleDelta(from, to) {
            return to.value - from.value;
        }

        function colorDelta(from, to) {
            return {
                red: to.red - from.red,
                green: to.green - from.green,
                blue: to.blue - from.blue
            };
        }

        var propertyTypes = {
            cssNumberZeroToOne: {
                parse: numberZeroToOneParser,
                getCurrentValue: getCurrentCssPropertyvalue,
                setter: cssPropertySetter,
                normalise: erroneousNormalisation,
                calculateDelta: simpleDelta
            },
            cssHorizontalLength: {
                parse: cssLengthOrPercentageParser,
                getCurrentValue: getCurrentCssPropertyvalue,
                setter: cssPropertySetter,
                normalisePercentage: normaliseHorizontalPercentage,
                calculateDelta: simpleDelta
            },
            cssVerticalLength: {
                parse: cssLengthOrPercentageParser,
                getCurrentValue: getCurrentCssPropertyvalue,
                setter: cssPropertySetter,
                normalisePercentage: normaliseVerticalPercentage,
                calculateDelta: simpleDelta
            },
            cssColor: {
                parse: cssColorParser,
                getCurrentValue: getCurrentCssPropertyvalue,
                setter: cssColorSetter,
                normalisePercentage: erroneousNormalisation,
                calculateDelta: colorDelta
            },
            attributeNumber: {
                parse: numberParser,
                getCurrentValue: getCurrentAttributeNumberValue,
                setter: attributeNumberSetter,
                normalisePercentage: erroneousNormalisation,
                calculateDelta: simpleDelta
            }
        };
        propertyTypes["default"] = propertyTypes.attributeNumber;

        var supportedProperties = {
            opacity: propertyTypes.cssNumberZeroToOne,
            // dimensions and position
            height: propertyTypes.cssVerticalLength,
            width: propertyTypes.cssHorizontalLength,
            top: propertyTypes.cssVerticalLength,
            right: propertyTypes.cssHorizontalLength,
            bottom: propertyTypes.cssVerticalLength,
            left: propertyTypes.cssHorizontalLength,
            // margin
            marginTop: propertyTypes.cssVerticalLength,
            marginRight: propertyTypes.cssHorizontalLength,
            marginBottom: propertyTypes.cssVerticalLength,
            marginLeft: propertyTypes.cssHorizontalLength,
            // border
            borderTopWidth: propertyTypes.cssVerticalLength,
            borderRightWidth: propertyTypes.cssHorizontalLength,
            borderBottomWidth: propertyTypes.cssVerticalLength,
            borderLeftWidth: propertyTypes.cssHorizontalLength,
            borderColor: propertyTypes.cssColor,
            // padding
            paddingTop: propertyTypes.cssVerticalLength,
            paddingRight: propertyTypes.cssHorizontalLength,
            paddingBottom: propertyTypes.cssVerticalLength,
            paddingLeft: propertyTypes.cssHorizontalLength,
            // colour
            color: propertyTypes.cssColor,
            backgroundColor: propertyTypes.cssColor,
            // svg: may be removed
            x: propertyTypes.attributeNumber,
            y: propertyTypes.attributeNumber,
            x1: propertyTypes.attributeNumber,
            y2: propertyTypes.attributeNumber
        };

        function convertPercentageToPixels(element, propertyType, percentage) {
            var containingBlock = element.offsetParent;
            var containerStyles = document.defaultView.getComputedStyle(containingBlock, null);
            propertyType.normalisePercentage(containerStyles, percentage);
        }

        function normaliseFromAndTo(element, propertyName, propertyType, from, to) {
            if (!to) {
                throw new Error("to: value not specified by animation");
            }
            if (!from) {
                // set from to be the current state of the element
                from = propertyType.getCurrentValue(element, propertyName);
            }
            if (to.units === "%") {
                convertPercentageToPixels(element, propertyType, to);
            }
            if (from.units === "%") {
                convertPercentageToPixels(element, propertyType, from);
            }
            if (!from.units) {
                from.units = to.units;
            }
            if (!to.units) {
                to.units = from.units;
            }
            if (from.units !== to.units) {
                throw new Error("Mismatched units specified by animation");
            }
            return {
                from: from,
                to: to
            };
        }

        function addTweenFunctions(element, properties) {
            function buildTweenFunction(element, propertyName, propertyType,
                from, to, start) {
                var fromValue = from.value;
                var toValue = to.value;
                var units = from.units;
                var propertyDelta = propertyType.calculateDelta(from, to);
                var setPropertyValue = propertyType.setter(
                    element, propertyName, propertyDelta, from, units);
                return function(tweenFactor) {
                    setPropertyValue(tweenFactor);
                };
            }

            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                var propertyName = property.name;
                var propertyType = property.type;
                if (!propertyType) {
                    if (!!supportedProperties.hasOwnProperty(propertyName)) {
                        propertyType = supportedProperties[propertyName];
                    } else {
                        propertyType = propertyTypes["default"];
                    }
                    property.type = propertyType;
                }
                var from = propertyType.parse(property.from, element);
                var to = propertyType.parse(property.to, element);
                var normalisedValues = normaliseFromAndTo(
                    element, propertyName, propertyType, from, to);
                property.tween = buildTweenFunction(element, property.name,
                    propertyType, normalisedValues.from, normalisedValues.to);
            }
        }

        function buildCssManipulationFunction(element, properties) {
            addTweenFunctions(element, properties);
            return function(currentTweenFactor) {
                properties.forEach(function(property) {
                    property.tween(currentTweenFactor);
                });
            };
        }

        function cssAnimation(selection, propertyName, from, to,
            duration, options) {
            if (arguments.length < 2 || arguments.length > 6) {
                throw new Error('Invalid argument count');
            }
            if (arguments.length < 6) {
                if (isObject(arguments[arguments.length - 1])) {
                    options = arguments[arguments.length - 1];
                    duration = options.duration;
                } else if (arguments.length === 5) {
                    options = {};
                } else {
                    throw new Error('Invalid options');
                }
            }

            if (arguments.length < 3) {
                propertyName = options.property;
            }
            if (arguments.length < 4) {
                from = options.from;
            }
            if (arguments.length < 5) {
                to = options.to;
            }

            if (!isString(propertyName)) {
                throw new Error('Invalid property name');
            } else if (!isString(from)) {
                throw new Error('Invalid from value');
            } else if (!isString(to)) {
                throw new Error('Invalid to value');
            } else if (!isNumber(duration)) {
                throw new Error('Invalid duration');
            }

            var animation = createAnimation(duration, options);
            each(selection, function(element) {
                if (isObject(element) && element.nodeType === 1) {
                    var properties = [{
                        name: propertyName,
                        from: from,
                        to: to
                    }];
                    addTweenFunctions(element, properties);
                    animation.addListener('frame', buildCssManipulationFunction(
                        element, properties));
                }
            });

            function overrideThenMethod(animationToOverride,
                prevPropertyName, prevTo) {
                var overriddenThen = animationToOverride.then;
                animationToOverride.then = function(
                    nextPropertyName, nextFrom, nextTo,
                    nextDuration, nextOptions) {
                    var combinedAnimation;

                    if (arguments.length === 1) {
                        if (isAnimation(arguments[0]) || !isObject(arguments[0])) {
                            combinedAnimation =
                                overriddenThen.apply(animation, arguments);
                            overrideThenMethod(
                                combinedAnimation, prevPropertyName, prevTo);
                            return combinedAnimation;
                        }
                    }

                    var argumentsLengthExcludingOptions;
                    if (arguments.length < 5) {
                        if (isObject(arguments[arguments.length - 1])) {
                            argumentsLengthExcludingOptions = arguments.length - 1;
                            nextOptions = arguments[argumentsLengthExcludingOptions];
                        } else if (arguments.length > 3) {
                            argumentsLengthExcludingOptions = arguments.length;
                            nextOptions = {};
                        } else {
                            throw new Error('Invalid nextOptions');
                        }
                    }

                    if (!isObject(nextOptions)) {
                        throw new Error('Invalid nextOptions');
                    }

                    if (argumentsLengthExcludingOptions < 4 && isNumber(
                            arguments[argumentsLengthExcludingOptions - 1])) {
                        if (argumentsLengthExcludingOptions < 2) {
                            throw new Error('Invalid arguments');
                        }
                        nextDuration = arguments[argumentsLengthExcludingOptions - 1];
                        nextTo = arguments[argumentsLengthExcludingOptions - 2];
                        if (argumentsLengthExcludingOptions === 3) {
                            nextFrom = arguments[0];
                        } else {
                            nextFrom = undefined;
                        }
                        nextPropertyName = undefined;
                    } else {
                        if (argumentsLengthExcludingOptions < 1) {
                            nextPropertyName = nextOptions.property;
                        }
                        if (argumentsLengthExcludingOptions < 2) {
                            nextFrom = nextOptions.from;
                        }
                        if (argumentsLengthExcludingOptions < 3) {
                            nextTo = nextOptions.to;
                        }
                        if (argumentsLengthExcludingOptions < 4) {
                            nextDuration = nextOptions.duration;
                        }
                    }

                    if (nextPropertyName === undefined ||
                        nextPropertyName === null) {
                        nextPropertyName = prevPropertyName;
                        if (nextFrom === undefined || nextFrom === null) {
                            nextFrom = prevTo;
                        }
                    }

                    var nextAnimation = cssAnimation(
                        selection,
                        nextPropertyName, nextFrom, nextTo,
                        nextDuration, nextOptions);

                    combinedAnimation = overriddenThen.call(
                        animation, nextAnimation);
                    overrideThenMethod(
                        combinedAnimation, nextPropertyName, nextTo);

                    return combinedAnimation;
                };
            }

            overrideThenMethod(animation, propertyName, to);

            return animation;
        }

        animationFunctions = createHash(
            "animation", createAnimation,
            "concurrent", concurrent,
            "sequential", sequential);

        animationMethods = createHash(
            "cssAnimation", cssAnimation);
    }());
    /*global window, $, isBoolean, isNumber, isString, isObject, isFunction, trim,
            ajaxFunctions, ajaxFunctionsWrappedWithNamespaceContext,
            collectionFunctions, domFunctions, mathsFunctions, mouseFunctions,
            createHash, isArray, createArray, each, isHash, map, reduce,
            isCollection, isDirectedPair, createDirectedPair, merge, eventMethods,
            domMethods, isArrayLike, domMethodsWrappedWithNamespaceContext,
            uriFunctions, uriMethods, classInString, normalizeWhitespace, later,
            tweening, animationFunctions, animationMethods, dialogueFunctions*/

    var createUlib;
    (function() {
        var reservedPrefixes = createHash(
            '*', '*',
            'xml', 'http://www.w3.org/XML/1998/namespace',
            'xmlns', 'http://www.w3.org/2000/xmlns');

        var uuidPropertyName = "ucles-" + new Date().valueOf() + "-uuid";
        var uuid = 0;

        function getUniqueId(element) {
            if (element[uuidPropertyName]) {
                return element[uuidPropertyName];
            } else {
                return (element[uuidPropertyName] = ++uuid);
            }
        }

        function isXMLDoc(elem) {
            return elem.documentElement && !elem.body ||
                elem.tagName && elem.ownerDocument &&
                elem.ownerDocument.contentType !== 'text/html';
        }

        function hasClass(node, className) {
            return classInString(node.className, className);
        }

        function hasId(node, id) {
            return Boolean(node.ownerDocument &&
                node.ownerDocument.getElementById(id) === node);
        }

        function nodeNameMatches(node, namespaceURI, localName) {
            if (isXMLDoc(node)) {
                return (namespaceURI === '*' || namespaceURI === node.namespaceURI) &&
                    (localName === '*' || localName === node.localName);
            } else {
                return localName === '*' || String(localName).toUpperCase() ===
                    node.nodeName.toUpperCase();
            }
        }

        // Regular expressions and regular expression fragments used for parsing.
        // Based on <http://www.w3.org/TR/css3-selectors/#w3cselgrammar> --
        // most of these regular expressions are equivalent to the correspondingly
        // named rules in the CSS3 grammar.

        var nonasciiRxF = "(?:[^\u0000-\u0177])";
        var unicodeRxF = "(?:\\\\[0-9a-fA-F]{1,6}(?:\\r\\n|[ \\n\\r\\t\\f])?)";
        var escapeRxF = "(?:" + unicodeRxF + "|\\\\[^\\n\\r\\f0-9a-fA-F])";
        var nmstartRxF = "(?:[_a-zA-Z]|" + nonasciiRxF + "|" + escapeRxF + ")";
        var nmcharRxF = "(?:[_a-zA-Z0-9-]|" + nonasciiRxF + "|" + escapeRxF + ")";
        var identRxF = "(?:-?" + nmstartRxF + nmcharRxF + "*)";
        var nameRxF = "(?:" + nmcharRxF + "+)";
        var numRxF = "(?:[0-9]+|[0-9]*\\.[0-9]+)";
        var nlRxF = "(?:\\n|\\r\\n|\\r|\\f)";
        var string1RxF = "(?:\"(?:[^\\n\\r\\f\\\\\"]|\\\\" + nlRxF + "|" +
            nonasciiRxF + "|" + escapeRxF + ")*\")";
        var string2RxF = "(?:'(?:[^\\n\\r\\f\\\\']|\\\\" + nlRxF + "|" +
            nonasciiRxF + "|" + escapeRxF + ")*')";
        var stringRxF = "(?:" + string1RxF + "|" + string2RxF + ")";

        // For efficiency reasons, this fragment does not exactly match the
        // expression rule in the CSS3 grammar. In all cases where it is currently
        // used, valid expressions will still match, but be careful when using
        // this in new code.
        var expressionRxF = "(?:(?:(?:\\+|-|" + numRxF + "|" + stringRxF + "|" +
            identRxF + "|\\|)\\s*)+)";

        var namespacedIdentifierRxF =
            "(?:(?:(?:" + identRxF + "?|\\*)\\|)?" + identRxF + ")";

        var namespacedIdentifierOrWildCardRxF =
            "(?:(?:(?:" + identRxF + "?|\\*)\\|)?(?:" + identRxF + "|\\*))";

        var negationArgRxF = "(?:" + namespacedIdentifierOrWildCardRxF + "|" +
            "[#.]" + identRxF + "|" +
            "\\[\\s*" + namespacedIdentifierRxF +
            "(?:[!^$*~]?=\\s*(?:" + identRxF + "|" +
            stringRxF + ")\\s*)?\\]|::?" + identRxF + "(?:\\(\\s*" +
            expressionRxF + "\\))?)";

        var basicSelectorRxF = "^(?:([>+~])\\s*)?(?:(?:(" + identRxF + "?|\\*)\\|)?" +
            "(" + identRxF + "|\\*))?" +
            "(?:#(" + nameRxF + ")|\\.(" + identRxF + "))?";

        // Regular expression matching a combinator, (namespaced) type selector, 
        // and *either* an ID or class selector all in one step. Each component
        // mentioned is optional.
        // Captures: [ combinator, prefix, localName, id, className ]
        var basicSelectorRx = new RegExp(basicSelectorRxF);

        // Regular expression matching ONE of a type selector, an id selector, a
        // class selector, an attribute selector, a negated simple selector,
        // or a pseudo-class or pseudo-element selector.
        // Note that if this expression matches a pseudo-class or pseudo-element
        // selector named "not", the match is invalid.
        // Captures: [ prefix, localName, id, className, attributePrefix,
        //     attributeLocalName, attributeComparator, attributeValue,
        //     negatedSelector, pseudoColons, pseudoName, pseudoArgument ]
        var filterRx = new RegExp(
            "^(?:(?:(" + identRxF + "?|\\*)\\|)?(" + identRxF + "|\\*)|" +
            "#(" + nameRxF + ")|\\.(" + identRxF + ")|" +
            "\\[\\s*(?:(" + identRxF + "?|\\*)\\|)?(" + identRxF + ")\\s*" +
            "(?:([!^$*~|]?=)\\s*(" + identRxF + "|" + stringRxF + ")\\s*)?\\]|" +
            ":not\\((\\s*" + negationArgRxF + "\\s*)\\)|" +

            "(::?)(" + identRxF + ")(?:\\(\\s*(" + expressionRxF + ")\\))?)");

        var nthChildExpressionRx = new RegExp(
            "^(?:(?:(" + numRxF + "|-)\\s*)?n\\s*\\+?\\s*(" + numRxF + ")?|" +
            "\\+?\\s*(" + numRxF + ")|(odd|even))\\s*$");

        function getAttribute(node, namespaceURI, localName) {
            if (namespaceURI === '*') {
                var attributes = node.attributes,
                    attribute;
                for (var i = 0; Boolean(attribute = attributes.item(i)); ++i) {
                    if (attribute.localName === localName) {
                        return attribute;
                    }
                }
                return null;
            } else {
                return node.getAttributeNodeNS(namespaceURI, localName);
            }
        }

        function unquote(value) {
            var quote = "";
            value = String(value);
            if (value.match(/^['"]/)) {
                quote = value.charAt(0);
                if (value.charAt(value.length - 1) === quote) {
                    value = value.substr(1, value.length - 2);
                    if (value.match(new RegExp("(?:^|[^\\\\])" + quote))) {
                        throw new Error("Invalid quoted value");
                    }
                } else {
                    throw new Error("Invalid quoted value");
                }
            }
            value = value.replace(
                // This is based on escapeRxF but repeated here because we need
                // to capture specific portions. It also deliberately matches invalid
                // escapes, which we handle in the lambda expression.
                /\\(?:([0-9a-fA-F]{1,6})(?:\r\n|[ \n\r\t\f])?|([^\n\r\f])|)/g,
                function(match, charCodeHexString, escapedCharacter) {
                    if (charCodeHexString) {
                        return String.fromCharCode(
                            parseInt(charCodeHexString, 16));
                    } else if (escapedCharacter) {
                        return escapedCharacter;
                    } else {
                        throw new Error("Invalid quoted value");
                    }
                });
            return value;
        }

        /* Internal function: Merge two node arrays without including duplicates.
         * a must be an array, but b may be any array-like value. */
        function mergeNodeArrays(a, b) {
            if (!a || a.length === 0) {
                if (isArray(b)) {
                    return b;
                } else {
                    return createArray(b);
                }
            } else if (!b || b.length === 0) {
                return a;
            } else {
                var pos = a.length;
                for (var i = 0; i < b.length; ++i) {
                    var node = b[i];
                    if (a.indexOf(node) === -1) {
                        a[pos++] = node;
                    }
                }
                return a;
            }
        }

        function applyCombinator(combinator, namespaceURI, localName,
            id, className, workingSet) {
            var resultSet = [];
            var duplicates = {};
            for (var i = 0; i < workingSet.length; ++i) {
                var node;
                if (combinator === '>') {
                    node = workingSet[i].firstChild;
                } else {
                    // combinator === '~' || combinator === '+'
                    node = workingSet[i].nextSibling;
                }
                for (; node; node = node.nextSibling) {
                    if (node.nodeType === 1) {
                        var nodeUID = getUniqueId(node);
                        if (combinator === '~' && duplicates[nodeUID]) {
                            break;
                        }
                        if ((id === undefined || hasId(node, id)) &&
                            (className === undefined || hasClass(node, className)) &&
                            (localName === undefined ||
                                nodeNameMatches(node, namespaceURI, localName))) {
                            if (combinator === '~') {
                                duplicates[nodeUID] = true;
                            }
                            resultSet.push(node);
                        }
                        if (combinator === '+') {
                            break;
                        }
                    }
                }
            }
            return resultSet;
        }

        function applyDescent(namespaceURI, localName, id, className, workingSet) {
            var resultSet = [],
                node;
            for (var i = 0; i < workingSet.length; ++i) {
                var j;
                if (workingSet[i].nodeType === 9 && id !== undefined) {
                    // Select by ID and filter by name.
                    node = workingSet[i].getElementById(id);
                    if (node && (localName === undefined ||
                            nodeNameMatches(node, namespaceURI, localName))) {
                        resultSet.push(node);
                    }
                } else {
                    // Select by name.
                    var nodes = workingSet[i].getElementsByTagNameNS(
                        namespaceURI, localName);
                    if (id !== undefined) {
                        // Filter by ID.
                        for (j = 0; j < nodes.length; ++j) {
                            node = nodes[j];
                            if (hasId(node, id)) {
                                resultSet.push(node);
                            }
                        }
                    } else if (className !== undefined) {
                        // Filter by class.
                        for (j = 0; j < nodes.length; ++j) {
                            node = nodes[j];
                            if (hasClass(node, className)) {
                                resultSet.push(node);
                            }
                        }
                    } else {
                        resultSet = mergeNodeArrays(resultSet, nodes);
                    }
                }
            }
            return resultSet;
        }

        function filterByType(workingSet, namespaceURI, localName, not) {
            var resultSet = [];
            for (var i = 0; workingSet[i]; ++i) {
                var node = workingSet[i];
                if (nodeNameMatches(node, namespaceURI, localName) ^ not) {
                    resultSet.push(node);
                }
            }
            return resultSet;
        }

        function filterById(workingSet, id, not) {
            var resultSet = [];
            for (var i = 0; workingSet[i]; ++i) {
                var node = workingSet[i];
                if (hasId(node, id) ^ not) {
                    resultSet.push(node);
                }
            }
            return resultSet;
        }

        function filterByClass(workingSet, className, not) {
            var resultSet = [];
            for (var i = 0; workingSet[i]; ++i) {
                var node = workingSet[i];
                if (hasClass(node, className) ^ not) {
                    resultSet.push(node);
                }
            }
            return resultSet;
        }

        function isNodeNthChild(node, expression) {
            var m = nthChildExpressionRx.exec(expression);
            if (m) {
                if (node.parentNode) {
                    var magnitude = m[1];
                    var offset = m[2];
                    var absolute = m[3];
                    var keyword = m[4];

                    if (keyword === 'even') {
                        magnitude = 2;
                        offset = 0;
                    } else if (keyword === 'odd') {
                        magnitude = 2;
                        offset = 1;
                    } else if (absolute !== undefined) {
                        magnitude = 0;
                        offset = parseInt(absolute, 10);
                    } else {
                        if (magnitude === '-') {
                            magnitude = -1;
                        } else if (magnitude === undefined) {
                            magnitude = 1;
                        } else {
                            magnitude = parseInt(magnitude, 10);
                        }
                        if (offset === undefined) {
                            offset = 0;
                        } else {
                            offset = parseInt(offset, 10);
                        }
                    }

                    var i = 0;
                    while (node.previousSibling) {
                        node = node.previousSibling;
                        if (node.nodeType === 1) {
                            ++i;
                        }
                    }

                    if (magnitude === 0) {
                        return i + 1 === offset;
                    } else {
                        return ((i + 1 - offset) % magnitude === 0) &&
                            (magnitude > 0 || (i < offset));
                    }
                } else {
                    return false;
                }
            } else {
                throw new Error('Invalid nth-child expression');
            }
        }

        function currentStyle(element, property) {
            var styles = document.defaultView.getComputedStyle(element, null);
            return styles.getPropertyValue(property);
        }

        function nth(cur, result, dir, elem) {
            // nicked from jQuery
            result = result || 1;
            var num = 0;

            for (; cur; cur = cur[dir]) {
                if (cur.nodeType === 1 && ++num === result) {
                    break;
                }
            }

            return cur;
        }

        var expr = {
            // nicked from jQuery
            ":": {
                // Child Checks
                "first-child": function(a) {
                    return a.parentNode.getElementsByTagName("*")[0] === a;
                },
                "last-child": function(a) {
                    return nth(a.parentNode.lastChild, 1, "previousSibling") === a;
                },
                "only-child": function(a) {
                    return !nth(a.parentNode.lastChild, 2, "previousSibling");
                },
                "nth-child": function(node, i, m, workingSet, argument) {
                    return isNodeNthChild(node, argument);
                },
                empty: function(a) {
                    return !a.firstChild;
                },

                // Form attributes
                enabled: function(a) {
                    return !a.disabled;
                },
                disabled: function(a) {
                    return a.disabled;
                },
                checked: function(a) {
                    return a.checked;
                },
                selected: function(a) {
                    return a.selected;
                }
            }
        };

        function grep(elems, callback, inv) {
            // nicked from jQuery
            var ret = [];

            // Go through the array, only saving the items
            // that pass the validator function
            for (var i = 0, length = elems.length; i < length; i++) {
                if (Boolean(inv) !== Boolean(callback(elems[i], i))) {
                    ret.push(elems[i]);
                }
            }
            return ret;
        }

        function filterByPseudo(workingSet, not, pseudoName, pseudoArgument) {
            pseudoName = pseudoName.substr(1); // Strip initial colon.
            var test = expr[':'][pseudoName]; // JQUERY ALERT!
            if (isFunction(test)) { // JQUERY ALERT!
                return grep(workingSet, function(node, i) { // JQUERY ALERT!
                    return test(node, i, ['', ':', pseudoName, unquote(pseudoArgument)],
                        workingSet, pseudoArgument);
                }, not);
            } else {
                throw new Error('Unsupported pseudo-class or pseudo-element selector');
            }
        }

        var htmlNamespaceURI = 'http://www.w3.org/1999/xhtml';
        var htmlElementNames = ['html', 'head', 'title', 'base', 'link', 'meta',
            'style', 'script', 'body', 'section', 'nav', 'article', 'aside',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup', 'header', 'footer',
            'address', 'p', 'hr', 'br', 'pre', 'blockquote', 'ol', 'ul', 'li',
            'dl', 'dt', 'dd', 'div', 'a', 'em', 'strong', 'small', 'cite', 'q',
            'dfn', 'abbr', 'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup',
            'i', 'b', 'mark', 'ruby', 'rt', 'rp', 'bdo', 'span', 'ins', 'del',
            'figure', 'img', 'iframe', 'embed', 'object', 'param', 'video',
            'audio', 'source', 'canvas', 'map', 'area', 'table', 'caption',
            'colgroup', 'col', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th',
            'form', 'fieldset', 'legend', 'label', 'input', 'button', 'select',
            'datalist', 'optgroup', 'option', 'textarea', 'keygen', 'output',
            'progress', 'meter', 'details', 'summary', 'command', 'menu',
            'device'
        ];

        createUlib = function() {
            var defaultNamespaceURI = '*';
            var namespaceURIs = createHash(reservedPrefixes);

            each(arguments, function(argument) {
                if (typeof argument === "object") {
                    argument = createHash(argument);
                }
                if (argument === undefined || argument === null || argument === '') {
                    defaultNamespaceURI = '*';
                } else if (typeof argument === 'string') {
                    defaultNamespaceURI = argument;
                } else if (isHash(argument)) {
                    each(argument, function(directedPair) {
                        var prefix = directedPair.key();
                        var uri = directedPair.value();
                        if (reservedPrefixes.has(prefix) &&
                            uri !== reservedPrefixes.get(prefix)) {
                            throw new Error('Cannot use reserved namespace prefix');
                        } else if (!uri) {
                            namespaceURIs.remove(prefix);
                        } else if (typeof uri === 'string') {
                            namespaceURIs.set(prefix, uri);
                        } else {
                            throw new Error('Invalid namespace URI');
                        }
                    });
                } else {
                    throw new Error('Invalid argument');
                }
            });

            function withNamespace() {
                return createUlib.apply(this, [defaultNamespaceURI, namespaceURIs].concat(
                    createArray(arguments)));
            }

            function getNamespaceURI(prefix) {
                if (prefix === undefined) {
                    return defaultNamespaceURI;
                } else if (prefix === '') {
                    return '';
                } else if (namespaceURIs.has(prefix)) {
                    return namespaceURIs.get(prefix);
                } else {
                    throw new Error('Unregistered namespace prefix');
                }
            }

            function getAttributeNamespaceURI(prefix) {
                if (prefix === undefined) {
                    return '';
                } else {
                    return getNamespaceURI(prefix);
                }
            }

            function filterByAttribute(workingSet, not,
                attributeNamespaceURI, attributeLocalName,
                attributeComparator, attributeComparison) {
                var resultSet = [];
                for (var i = 0; workingSet[i]; ++i) {
                    var node = workingSet[i];
                    var attribute = getAttribute(node,
                        attributeNamespaceURI, attributeLocalName);
                    var attributeValue = (attribute === null ? '' : attribute.nodeValue);
                    if (((!attributeComparator && attribute !== null) ||
                            (attributeComparator === '=' &&
                                attribute !== null &&
                                attributeComparison === attributeValue) ||
                            (attributeComparator === '!=' &&
                                (attribute === null ||
                                    attributeComparison !== attributeValue)) ||
                            (attributeComparator === '^=' &&
                                attribute !== null &&
                                attributeValue.indexOf(attributeComparison) === 0) ||
                            (attributeComparator === '$=' &&
                                attribute !== null &&
                                attributeValue.substr(attributeValue.length -
                                    attributeComparison.length) === attributeComparison) ||
                            (attributeComparator === '*=' &&
                                attribute !== null &&
                                attributeValue.indexOf(attributeComparison) >= 0) ||
                            (attributeComparator === '~=' &&
                                attribute !== null &&
                                classInString(attributeValue, attributeComparison)) ||
                            (attributeComparator === '|=' && (
                                attribute !== null &&
                                attributeValue === attributeComparison ||
                                attributeValue.substr(0, attributeComparison.length + 1) ===
                                attributeComparison + '-'))) ^ not) {
                        resultSet.push(node);
                    }
                }

                return resultSet;
            }

            function applyFilter(expression, workingSet, not) {
                // Continue while we match an attribute selector, a negated simple
                // selector, or a pseudo-class or pseudo-element selector.
                var m;
                while (Boolean(m = filterRx.exec(expression))) {
                    // If we matched a type selector, the prefix, namespace URI and
                    // local name to select by, otherwise undefined.
                    var prefix = m[1] && unquote(m[1]);
                    var namespaceURI = getNamespaceURI(prefix);
                    var localName = m[2] && unquote(m[2]);

                    // If we matched an id selector, the id to select by, otherwise
                    // undefined.
                    var id = m[3] && unquote(m[3]);

                    // if we matched a class selector, the class name to select by,
                    // otherwise undefined.
                    var className = m[4] && unquote(m[4]);

                    // If we matched an attribute selector, the namespace prefix,
                    // namespace URI and local name of the attribute, otherwise
                    // undefined.
                    var attributePrefix = m[5] && unquote(m[5]);
                    var attributeNamespaceURI = getAttributeNamespaceURI(attributePrefix);
                    var attributeLocalName = m[6] && unquote(m[6]);

                    // If we matched an attribute selector, and an attribute
                    // comparator was used, one of '=', '!=', '^=', '$=', '*=', '~=' or
                    // '|=', otherwise undefined.
                    var attributeComparator = m[7];

                    // If we matched an attribute selector, and an attribute comparator
                    // was used, the value to which the attribute is to be compared,
                    // otherwise undefined.
                    var attributeComparison = m[8] && unquote(m[8]);

                    // If we matched a negation selector, the simple selector
                    // expression which is to be negated, otherwise undefined.
                    var negatedSelector = m[9];

                    // If we matched a pseudo-element or pseudo-class selector, the
                    // name of the selector (including colons), otherwise undefined.
                    var pseudoName = m[10] && m[10] + m[11];

                    // If we matched a pseudo-element or pseudo-class selector with
                    // an argument, the text of the argument, otherwise undefined.
                    var pseudoArgument = m[12];

                    if (pseudoName === ':not') {
                        throw new Error('Invalid :not expression');
                    }

                    if (localName) {
                        workingSet = filterByType(workingSet, namespaceURI, localName, not);
                    } else if (id) {
                        workingSet = filterById(workingSet, id, not);
                    } else if (className) {
                        workingSet = filterByClass(workingSet, className, not);
                    } else if (attributeLocalName) {
                        workingSet = filterByAttribute(workingSet, not,
                            attributeNamespaceURI, attributeLocalName,
                            attributeComparator, attributeComparison);
                    } else if (negatedSelector) {
                        var tmp = applyFilter(negatedSelector, workingSet, !not);
                        workingSet = tmp.workingSet;
                    } else if (pseudoName) {
                        workingSet = filterByPseudo(workingSet, not,
                            pseudoName, pseudoArgument);
                    }

                    expression = expression.substr(m[0].length);
                }

                return {
                    expression: expression,
                    workingSet: workingSet
                };
            }

            function applySingleSelector(expression, workingSet) {
                // Match a combinator, type selector, and *either* an id or class
                // selector in one step. This allows us to choose the most
                // efficient selection method for common selectors.
                var m = basicSelectorRx.exec(expression);
                if (m) {
                    // An unmatched combinator is treated as a descendant
                    // combinator.
                    var combinator = m[1] || '';

                    // An unmatched type selector is treated as an implied
                    // universal selector.
                    var prefix = m[2] && unquote(m[2]);
                    var namespaceURI;
                    if (m[2] || m[3]) {
                        namespaceURI = getNamespaceURI(prefix);
                    } else {
                        namespaceURI = '*';
                    }
                    var localName = m[3] && unquote(m[3]) || '*';

                    // At most one of these will be defined.
                    var id = m[4] && unquote(m[4]);
                    var className = m[5] && unquote(m[5]);

                    if (combinator) {
                        // A combinator other than the descendant combinator was
                        // matched, so we walk the tree ourselves instead of using
                        // getElementsByTagName or getElementById.
                        workingSet = applyCombinator(combinator, namespaceURI,
                            localName, id, className, workingSet);
                    } else {
                        // The descendant combinator was matched, so we can
                        // descend the tree any way we choose.
                        workingSet = applyDescent(namespaceURI, localName, id,
                            className, workingSet);
                    }

                    // Remove the matched portion of the expression.
                    expression = expression.substring(m[0].length);

                    // If a selector expression still exists,
                    if (expression) {
                        // Apply any filters to the existing working set.
                        var tmp = applyFilter(expression, workingSet);
                        expression = tmp.expression;
                        workingSet = tmp.workingSet;
                    }
                }

                return {
                    expression: expression,
                    workingSet: workingSet
                };
            }

            function applySelector(expression, context) {
                var result = [],
                    workingSet = [context],
                    lastExpression;

                // Continue while a selector expression exists and we're not looping
                // on ourselves.
                while (expression && lastExpression !== expression) {
                    expression = trim(expression);
                    lastExpression = expression;

                    // Handle multiple expressions.
                    if (expression.indexOf(',') === 0) {
                        if (context === workingSet[0]) {
                            workingSet.shift();
                        }
                        result = mergeNodeArrays(result, workingSet);
                        workingSet = [context];
                        expression = expression.substr(1);
                    } else {
                        var tmp = applySingleSelector(expression, workingSet);
                        expression = tmp.expression;
                        workingSet = tmp.workingSet;
                    }
                }

                // If we haven't consumed the whole expression, a parse error has
                // occurred.
                if (expression) {
                    throw new Error('Invalid selector expression');
                }

                result = mergeNodeArrays(result, workingSet);

                // Remove the root context
                if (result && context === result[0]) {
                    result.shift();
                }

                return result;
            }

            /*var methodsWrappedWithNamespaceContext =
                    domMethodsWrappedWithNamespaceContext;
            
            var methods = eventMethods.merge(
                    domMethods, uriMethods, animationMethods);*/
            // methodsWrappedWithNamespaceContext are merged with methods
            // later, after find and ulib are defined.

            /* function find(expression, context) {
                if (arguments.length < 1 || arguments.length > 2) {
                    throw new Error('Invalid argument count');
                }
                
                var selection;
                
                // Quickly handle non-string expressions.
                if (typeof expression === 'undefined') {
                    throw new Error("Undefined selector");
                } else if (expression === null) {
                    throw new Error("Null selector");
                } else if (isCollection(expression)) {
                    selection = createArray(expression);
                } else if (typeof expression !== 'string') {
                    selection = [expression];
                } else {
                    if (context === undefined || context === null) {
                        context = [document];
                    } else if (!isArrayLike(context)) {
                        context = [context];
                    }
                    
                    selection = reduce(context, [], function (s, node) {
                        if (isArrayLike(node)) {
                            return mergeNodeArrays(s, find(expression, node));
                        } else {
                             return mergeNodeArrays(s,
                                    applySelector(expression, node));
                        }
                    });
                }
                
                selection.find = function (expression) {
                    return find(expression, selection);
                };
                
                each(methods, function (method) {
                    var name = method.key();
                    var f = method.value();
                    
                    selection[name] = function () {
                        var args = [selection].concat(createArray(arguments));
                        return f.apply(this, args);
                    };
                });
                
                return selection;
            }
            
            var ulib = function () {
                return find.apply(this, arguments);
            };*/

            // patch - UA 28/10/2011
            //var methods = uriMethods;
            var methods = eventMethods.merge(domMethods, uriMethods);
            each(methods, function(method) {
                var name = method.key();
                var f = method.value();
                $.fn[name] = function() {
                    var args = [this].concat(createArray(arguments));
                    return f.apply(this, args);
                };
            });
            methods = domMethodsWrappedWithNamespaceContext;
            each(methods, function(method) {
                var name = method.key();
                var f = method.value();
                $.fn[name] = function() {
                    var args = [$, this].concat(createArray(arguments));
                    return f.apply(this, args);
                };
            });

            /* methods = methods.merge(map(methodsWrappedWithNamespaceContext,
                    function (method) {
                        var name = method.key();
                        var f = method.value();
                        var wrappedF = function () {
                            var args = [ulib].concat(createArray(arguments));
                            return f.apply(this, args);
                        };
                        return createDirectedPair(name, wrappedF);
                    })); */

            var element = function(namespaceURI, qualifiedName, attributes) {
                var localName;

                var handleQualifiedName = function(name) {
                    if (typeof name !== 'string') {
                        throw new Error('Invalid qualified name');
                    }

                    var m = /^(?:([^:]+):)?[^:]+$/.exec(name);
                    if (m) {
                        namespaceURI = getNamespaceURI(m[1]);
                        qualifiedName = name;
                    } else {
                        throw new Error('Invalid qualified name');
                    }
                };

                if (arguments.length === 1) {
                    handleQualifiedName(arguments[0]);
                } else if (arguments.length === 2) {
                    if (typeof arguments[1] === 'object' ||
                        arguments[1] === undefined ||
                        arguments[1] === null) {
                        attributes = arguments[1];
                        handleQualifiedName(arguments[0]);
                    } else {
                        localName = qualifiedName;
                    }
                } else if (arguments.length === 3) {
                    localName = qualifiedName;
                } else {
                    throw new Error('Invalid argument count');
                }

                if (namespaceURI === undefined || namespaceURI === null ||
                    namespaceURI === '') {
                    namespaceURI = null;
                } else if (typeof namespaceURI !== 'string') {
                    throw new Error('Invalid namespace URI');
                }

                if (localName !== undefined) {
                    if (typeof localName !== 'string' || localName.match(':')) {
                        throw new Error('Invalid local name');
                    }
                }

                if (attributes === undefined || attributes === null) {
                    attributes = createHash();
                } else if (typeof attributes === 'object') {
                    if (!isCollection(attributes)) {
                        attributes = createHash(attributes);
                    }
                } else {
                    throw new Error('Invalid attributes');
                }

                var element = document.createElementNS(
                    namespaceURI, qualifiedName);

                each(attributes, function(attribute) {
                    if (isDirectedPair(attribute)) {
                        var attributeQualifiedName = attribute.key();
                        var attributeValue = attribute.value();
                        var m = /^(?:([^:]+):)?[^:]+$/.exec(attributeQualifiedName);
                        if (!m) {
                            throw new Error(
                                'Attribute with invalid qualified name');
                        }

                        var attributeNamespaceURI =
                            getAttributeNamespaceURI(m[1]);
                        element.setAttributeNS(attributeNamespaceURI,
                            attributeQualifiedName, attributeValue);
                    }
                });

                //return find(element);
                return $(element);
            };

            var htmlBuilderFunctions = map(htmlElementNames, function(localName) {
                return createDirectedPair(localName, function(attributes) {
                    return element(htmlNamespaceURI, localName, attributes);
                });
            });
            // patch - UA 28/10/2011
            $.ulib = {};
            each(htmlBuilderFunctions, function(ulibMember) {
                var name = ulibMember.key(),
                    f = ulibMember.value();
                $.ulib[name] = f;
            });

            var ulibMembers = createHash(
                'withNamespace', withNamespace,
                'withNamespaces', withNamespace,
                'getNamespaceURI', getNamespaceURI,
                'getAttributeNamespaceURI', getAttributeNamespaceURI,
                //'find', find,
                'isBoolean', isBoolean,
                'isNumber', isNumber,
                'isString', isString,
                'isObject', isObject,
                //'isFunction', isFunction,
                //'trim', trim,
                'normalizeWhitespace', normalizeWhitespace,
                'later', later,
                'el', element
                /* ,
                                    'element', element,
                                    'tweening', tweening */
            );

            /* ulibMembers = merge(ulibMembers, htmlBuilderFunctions,
                    ajaxFunctions, collectionFunctions, domFunctions,
                    mathsFunctions, mouseFunctions, uriFunctions,
                    animationFunctions, dialogueFunctions); */
            ulibMembers = merge(ulibMembers, ajaxFunctions,
                collectionFunctions, dialogueFunctions, domFunctions,
                mathsFunctions, mouseFunctions, uriFunctions);

            each(ulibMembers, function(ulibMember) {
                var name = ulibMember.key(),
                    f = ulibMember.value();
                //ulib[name] = f;
                $[name] = f;
            });

            var ulibFunctionsWrappedWithNamespaceContext =
                ajaxFunctionsWrappedWithNamespaceContext;

            each(ulibFunctionsWrappedWithNamespaceContext,
                function(ulibFunction) {
                    var name = ulibFunction.key(),
                        f = ulibFunction.value();
                    /* ulib[name] = function () {
                        var args = [ulib].concat(createArray(arguments));
                        return f.apply(this, args);
                    }; */
                    $[name] = function() {
                        var args = [$].concat(createArray(arguments));
                        return f.apply(this, args);
                    };
                });

            return $; //ulib;
        };
    })();

    /*global jQuery*/
    return createUlib();
})(jQuery);