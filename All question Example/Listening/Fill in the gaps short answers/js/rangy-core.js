/*
 Rangy, a cross-browser JavaScript range and selection library
 http://code.google.com/p/rangy/

 Copyright 2011, Tim Down
 Licensed under the MIT license.
 Version: 1.2beta
 Build date: 21 July 2011
*/
window.rangy = function() {
    function k(l, u) {
        var x = typeof l[u];
        return x == "function" || !!(x == "object" && l[u]) || x == "unknown"
    }

    function L(l, u) {
        return !!(typeof l[u] == "object" && l[u])
    }

    function H(l, u) {
        return typeof l[u] != "undefined"
    }

    function I(l) {
        return function(u, x) {
            for (var N = x.length; N--;)
                if (!l(u, x[N])) return false;
            return true
        }
    }

    function A(l) {
        window.alert("Rangy not supported in your browser. Reason: " + l);
        p.initialized = true;
        p.supported = false
    }

    function G() {
        if (!p.initialized) {
            var l, u = false,
                x = false;
            if (k(document, "createRange")) {
                l =
                    document.createRange();
                if (z(l, i) && r(l, P)) u = true;
                l.detach()
            }
            if ((l = L(document, "body") ? document.body : document.getElementsByTagName("body")[0]) && k(l, "createTextRange")) {
                l = l.createTextRange();
                if (z(l, s) && r(l, m)) x = true
            }!u && !x && A("Neither Range nor TextRange are implemented");
            p.initialized = true;
            p.features = {
                implementsDomRange: u,
                implementsTextRange: x
            };
            u = f.concat(e);
            x = 0;
            for (l = u.length; x < l; ++x) try {
                u[x](p)
            } catch (N) {
                L(window, "console") && k(window.console, "log") && window.console.log("Init listener threw an exception. Continuing.",
                    N)
            }
        }
    }

    function J(l) {
        this.name = l;
        this.supported = this.initialized = false
    }
    var P = ["startContainer", "startOffset", "endContainer", "endOffset", "collapsed", "commonAncestorContainer", "START_TO_START", "START_TO_END", "END_TO_START", "END_TO_END"],
        i = ["setStart", "setStartBefore", "setStartAfter", "setEnd", "setEndBefore", "setEndAfter", "collapse", "selectNode", "selectNodeContents", "compareBoundaryPoints", "deleteContents", "extractContents", "cloneContents", "insertNode", "surroundContents", "cloneRange", "toString", "detach"],
        m = ["boundingHeight", "boundingLeft", "boundingTop", "boundingWidth", "htmlText", "text"],
        s = ["collapse", "compareEndPoints", "duplicate", "getBookmark", "moveToBookmark", "moveToElementText", "parentElement", "pasteHTML", "select", "setEndPoint"],
        z = I(k),
        B = I(L),
        r = I(H),
        p = {
            version: "1.2beta",
            initialized: false,
            supported: true,
            util: {
                isHostMethod: k,
                isHostObject: L,
                isHostProperty: H,
                areHostMethods: z,
                areHostObjects: B,
                areHostProperties: r
            },
            features: {},
            modules: {},
            config: {
                alertOnWarn: false,
                preferTextRange: false
            }
        };
    p.fail = A;
    p.warn =
        function(l) {
            l = "Rangy warning: " + l;
            if (p.config.alertOnWarn) window.alert(l);
            else typeof window.console != "undefined" && typeof window.console.log != "undefined" && window.console.log(l)
        };
    if ({}.hasOwnProperty) p.util.extend = function(l, u) {
        for (var x in u)
            if (u.hasOwnProperty(x)) l[x] = u[x]
    };
    else A("hasOwnProperty not supported");
    var e = [],
        f = [];
    p.init = G;
    p.addInitListener = function(l) {
        p.initialized ? l(p) : e.push(l)
    };
    var j = [];
    p.addCreateMissingNativeApiListener = function(l) {
        j.push(l)
    };
    p.createMissingNativeApi = function(l) {
        l =
            l || window;
        G();
        for (var u = 0, x = j.length; u < x; ++u) j[u](l)
    };
    J.prototype.fail = function(l) {
        this.initialized = true;
        this.supported = false;
        throw Error("Module '" + this.name + "' failed to load: " + l);
    };
    J.prototype.warn = function(l) {
        p.warn("Module " + this.name + ": " + l)
    };
    J.prototype.createError = function(l) {
        return Error("Error in Rangy " + this.name + " module: " + l)
    };
    p.createModule = function(l, u) {
        var x = new J(l);
        p.modules[l] = x;
        f.push(function(N) {
            u(N, x);
            x.initialized = true;
            x.supported = true
        })
    };
    p.requireModules = function(l) {
        for (var u =
                0, x = l.length, N, K; u < x; ++u) {
            K = l[u];
            N = p.modules[K];
            if (!N || !(N instanceof J)) throw Error("Module '" + K + "' not found");
            if (!N.supported) throw Error("Module '" + K + "' not supported");
        }
    };
    var t = false;
    B = function() {
        if (!t) {
            t = true;
            p.initialized || G()
        }
    };
    if (typeof window == "undefined") A("No window found");
    else if (typeof document == "undefined") A("No document found");
    else {
        k(document, "addEventListener") && document.addEventListener("DOMContentLoaded", B, false);
        if (k(window, "addEventListener")) window.addEventListener("load",
            B, false);
        else k(window, "attachEvent") ? window.attachEvent("onload", B) : A("Window does not have required addEventListener or attachEvent method");
        return p
    }
}();
rangy.createModule("DomUtil", function(k, L) {
    function H(e) {
        for (var f = 0; e = e.previousSibling;) f++;
        return f
    }

    function I(e, f) {
        var j = [],
            t;
        for (t = e; t; t = t.parentNode) j.push(t);
        for (t = f; t; t = t.parentNode)
            if (p(j, t)) return t;
        return null
    }

    function A(e, f, j) {
        for (j = j ? e : e.parentNode; j;) {
            e = j.parentNode;
            if (e === f) return j;
            j = e
        }
        return null
    }

    function G(e) {
        e = e.nodeType;
        return e == 3 || e == 4 || e == 8
    }

    function J(e, f) {
        var j = f.nextSibling,
            t = f.parentNode;
        j ? t.insertBefore(e, j) : t.appendChild(e);
        return e
    }

    function P(e) {
        if (e.nodeType == 9) return e;
        else if (typeof e.ownerDocument != "undefined") return e.ownerDocument;
        else if (typeof e.document != "undefined") return e.document;
        else if (e.parentNode) return P(e.parentNode);
        else throw Error("getDocument: no document found for node");
    }

    function i(e) {
        if (!e) return "[No node]";
        return G(e) ? '"' + e.data + '"' : e.nodeType == 1 ? "<" + e.nodeName + (e.id ? ' id="' + e.id + '"' : "") + ">[" + e.childNodes.length + "]" : e.nodeName
    }

    function m(e) {
        this._next = this.root = e
    }

    function s(e, f) {
        this.node = e;
        this.offset = f
    }

    function z(e) {
        this.code = this[e];
        this.codeName = e;
        this.message = "DOMException: " + this.codeName
    }
    var B = k.util;
    B.areHostMethods(document, ["createDocumentFragment", "createElement", "createTextNode"]) || L.fail("document missing a Node creation method");
    B.isHostMethod(document, "getElementsByTagName") || L.fail("document missing getElementsByTagName method");
    var r = document.createElement("div");
    B.areHostMethods(r, ["insertBefore", "appendChild", "cloneNode"]) || L.fail("Incomplete Element implementation");
    r = document.createTextNode("test");
    B.areHostMethods(r, ["splitText", "deleteData", "insertData", "appendData", "cloneNode"]) || L.fail("Incomplete Text Node implementation");
    var p = function(e, f) {
        for (var j = e.length; j--;)
            if (e[j] === f) return true;
        return false
    };
    m.prototype = {
        _current: null,
        hasNext: function() {
            return !!this._next
        },
        next: function() {
            var e = this._current = this._next,
                f;
            if (this._current)
                if (f = e.firstChild) this._next = f;
                else {
                    for (f = null; e !== this.root && !(f = e.nextSibling);) e = e.parentNode;
                    this._next = f
                }
            return this._current
        },
        detach: function() {
            this._current = this._next =
                this.root = null
        }
    };
    s.prototype = {
        equals: function(e) {
            return this.node === e.node & this.offset == e.offset
        },
        inspect: function() {
            return "[DomPosition(" + i(this.node) + ":" + this.offset + ")]"
        }
    };
    z.prototype = {
        INDEX_SIZE_ERR: 1,
        HIERARCHY_REQUEST_ERR: 3,
        WRONG_DOCUMENT_ERR: 4,
        NO_MODIFICATION_ALLOWED_ERR: 7,
        NOT_FOUND_ERR: 8,
        NOT_SUPPORTED_ERR: 9,
        INVALID_STATE_ERR: 11
    };
    z.prototype.toString = function() {
        return this.message
    };
    k.dom = {
        arrayContains: p,
        getNodeIndex: H,
        getCommonAncestor: I,
        isAncestorOf: function(e, f, j) {
            for (f = j ? f : f.parentNode; f;)
                if (f ===
                    e) return true;
                else f = f.parentNode;
            return false
        },
        getClosestAncestorIn: A,
        isCharacterDataNode: G,
        insertAfter: J,
        splitDataNode: function(e, f) {
            var j = e.cloneNode(false);
            j.deleteData(0, f);
            e.deleteData(f, e.length - f);
            J(j, e);
            return j
        },
        getDocument: P,
        getWindow: function(e) {
            e = P(e);
            if (typeof e.defaultView != "undefined") return e.defaultView;
            else if (typeof e.parentWindow != "undefined") return e.parentWindow;
            else throw Error("Cannot get a window object for node");
        },
        getIframeWindow: function(e) {
            if (typeof e.contentWindow !=
                "undefined") return e.contentWindow;
            else if (typeof e.contentDocument != "undefined") return e.contentDocument.defaultView;
            else throw Error("getIframeWindow: No Window object found for iframe element");
        },
        getIframeDocument: function(e) {
            if (typeof e.contentDocument != "undefined") return e.contentDocument;
            else if (typeof e.contentWindow != "undefined") return e.contentWindow.document;
            else throw Error("getIframeWindow: No Document object found for iframe element");
        },
        getBody: function(e) {
            return B.isHostObject(e, "body") ?
                e.body : e.getElementsByTagName("body")[0]
        },
        comparePoints: function(e, f, j, t) {
            var l;
            if (e == j) return f === t ? 0 : f < t ? -1 : 1;
            else if (l = A(j, e, true)) return f <= H(l) ? -1 : 1;
            else if (l = A(e, j, true)) return H(l) < t ? -1 : 1;
            else {
                f = I(e, j);
                e = e === f ? f : A(e, f, true);
                j = j === f ? f : A(j, f, true);
                if (e === j) throw Error("comparePoints got to case 4 and childA and childB are the same!");
                else {
                    for (f = f.firstChild; f;) {
                        if (f === e) return -1;
                        else if (f === j) return 1;
                        f = f.nextSibling
                    }
                    throw Error("Should not be here!");
                }
            }
        },
        inspectNode: i,
        createIterator: function(e) {
            return new m(e)
        },
        DomPosition: s
    };
    k.DOMException = z
});
rangy.createModule("DomRange", function(k) {
    function L(a, c) {
        return a.nodeType != 3 && (o.isAncestorOf(a, c.startContainer, true) || o.isAncestorOf(a, c.endContainer, true))
    }

    function H(a) {
        return o.getDocument(a.startContainer)
    }

    function I(a, c, h) {
        if (c = a._listeners[c])
            for (var q = 0, D = c.length; q < D; ++q) c[q].call(a, {
                target: a,
                args: h
            })
    }

    function A(a) {
        return new ea(a.parentNode, o.getNodeIndex(a))
    }

    function G(a) {
        return new ea(a.parentNode, o.getNodeIndex(a) + 1)
    }

    function J(a) {
        return o.isCharacterDataNode(a) ? a.length : a.childNodes ?
            a.childNodes.length : 0
    }

    function P(a, c, h) {
        var q = a.nodeType == 11 ? a.firstChild : a;
        if (o.isCharacterDataNode(c)) h == c.length ? o.insertAfter(a, c) : c.parentNode.insertBefore(a, h == 0 ? c : o.splitDataNode(c, h));
        else h >= c.childNodes.length ? c.appendChild(a) : c.insertBefore(a, c.childNodes[h]);
        return q
    }

    function i(a) {
        for (var c, h, q = H(a.range).createDocumentFragment(); h = a.next();) {
            c = a.isPartiallySelectedSubtree();
            h = h.cloneNode(!c);
            if (c) {
                c = a.getSubtreeIterator();
                h.appendChild(i(c));
                c.detach(true)
            }
            if (h.nodeType == 10) throw new Q("HIERARCHY_REQUEST_ERR");
            q.appendChild(h)
        }
        return q
    }

    function m(a, c, h) {
        var q, D;
        for (h = h || {
                stop: false
            }; q = a.next();)
            if (a.isPartiallySelectedSubtree())
                if (c(q) === false) {
                    h.stop = true;
                    return
                } else {
                    q = a.getSubtreeIterator();
                    m(q, c, h);
                    q.detach(true);
                    if (h.stop) return
                }
        else
            for (q = o.createIterator(q); D = q.next();)
                if (c(D) === false) {
                    h.stop = true;
                    return
                }
    }

    function s(a) {
        for (var c; a.next();)
            if (a.isPartiallySelectedSubtree()) {
                c = a.getSubtreeIterator();
                s(c);
                c.detach(true)
            } else a.remove()
    }

    function z(a) {
        for (var c, h = H(a.range).createDocumentFragment(), q; c =
            a.next();) {
            if (a.isPartiallySelectedSubtree()) {
                c = c.cloneNode(false);
                q = a.getSubtreeIterator();
                c.appendChild(z(q));
                q.detach(true)
            } else a.remove();
            if (c.nodeType == 10) throw new Q("HIERARCHY_REQUEST_ERR");
            h.appendChild(c)
        }
        return h
    }

    function B(a, c, h) {
        var q = !!(c && c.length),
            D, T = !!h;
        if (q) D = RegExp("^(" + c.join("|") + ")$");
        var ba = [];
        m(new p(a, false), function(n) {
            if ((!q || D.test(n.nodeType)) && (!T || h(n))) ba.push(n)
        });
        return ba
    }

    function r(a) {
        return "[" + (typeof a.getName == "undefined" ? "Range" : a.getName()) + "(" + o.inspectNode(a.startContainer) +
            ":" + a.startOffset + ", " + o.inspectNode(a.endContainer) + ":" + a.endOffset + ")]"
    }

    function p(a, c) {
        this.range = a;
        this.clonePartiallySelectedTextNodes = c;
        if (!a.collapsed) {
            this.sc = a.startContainer;
            this.so = a.startOffset;
            this.ec = a.endContainer;
            this.eo = a.endOffset;
            var h = a.commonAncestorContainer;
            if (this.sc === this.ec && o.isCharacterDataNode(this.sc)) {
                this.isSingleCharacterDataNode = true;
                this._first = this._last = this._next = this.sc
            } else {
                this._first = this._next = this.sc === h && !o.isCharacterDataNode(this.sc) ? this.sc.childNodes[this.so] :
                    o.getClosestAncestorIn(this.sc, h, true);
                this._last = this.ec === h && !o.isCharacterDataNode(this.ec) ? this.ec.childNodes[this.eo - 1] : o.getClosestAncestorIn(this.ec, h, true)
            }
        }
    }

    function e(a) {
        this.code = this[a];
        this.codeName = a;
        this.message = "RangeException: " + this.codeName
    }

    function f(a, c, h) {
        this.nodes = B(a, c, h);
        this._next = this.nodes[0];
        this._position = 0
    }

    function j(a) {
        return function(c, h) {
            for (var q, D = h ? c : c.parentNode; D;) {
                q = D.nodeType;
                if (o.arrayContains(a, q)) return D;
                D = D.parentNode
            }
            return null
        }
    }

    function t(a) {
        for (var c; c =
            a.parentNode;) a = c;
        return a
    }

    function l(a, c) {
        if (F(a, c)) throw new e("INVALID_NODE_TYPE_ERR");
    }

    function u(a) {
        if (!a.startContainer) throw new Q("INVALID_STATE_ERR");
    }

    function x(a, c) {
        if (!o.arrayContains(c, a.nodeType)) throw new e("INVALID_NODE_TYPE_ERR");
    }

    function N(a, c) {
        if (c < 0 || c > (o.isCharacterDataNode(a) ? a.length : a.childNodes.length)) throw new Q("INDEX_SIZE_ERR");
    }

    function K(a, c) {
        if (g(a, true) !== g(c, true)) throw new Q("WRONG_DOCUMENT_ERR");
    }

    function V(a) {
        if (C(a, true)) throw new Q("NO_MODIFICATION_ALLOWED_ERR");
    }

    function X(a, c) {
        if (!a) throw new Q(c);
    }

    function M(a) {
        u(a);
        if (!o.arrayContains(Y, a.startContainer.nodeType) && !g(a.startContainer, true) || !o.arrayContains(Y, a.endContainer.nodeType) && !g(a.endContainer, true) || !(a.startOffset <= (o.isCharacterDataNode(a.startContainer) ? a.startContainer.length : a.startContainer.childNodes.length)) || !(a.endOffset <= (o.isCharacterDataNode(a.endContainer) ? a.endContainer.length : a.endContainer.childNodes.length))) throw Error("Range error: Range is no longer valid after DOM mutation (" +
            a.inspect() + ")");
    }

    function Z() {}

    function $(a) {
        a.START_TO_START = aa;
        a.START_TO_END = ja;
        a.END_TO_END = qa;
        a.END_TO_START = la;
        a.NODE_BEFORE = ma;
        a.NODE_AFTER = na;
        a.NODE_BEFORE_AND_AFTER = oa;
        a.NODE_INSIDE = ka
    }

    function ca(a) {
        $(a);
        $(a.prototype)
    }

    function fa(a, c) {
        return function() {
            M(this);
            var h = this.startContainer,
                q = this.startOffset,
                D = this.commonAncestorContainer,
                T = new p(this, true);
            if (h !== D) {
                h = o.getClosestAncestorIn(h, D, true);
                q = G(h);
                h = q.node;
                q = q.offset
            }
            m(T, V);
            T.reset();
            D = a(T);
            T.detach();
            c(this, h, q, h, q);
            return D
        }
    }

    function da(a, c, h) {
        function q(n, v) {
            return function(y) {
                u(this);
                x(y, ga);
                x(t(y), Y);
                y = (n ? A : G)(y);
                (v ? D : T)(this, y.node, y.offset)
            }
        }

        function D(n, v, y) {
            var E = n.endContainer,
                R = n.endOffset;
            if (v !== n.startContainer || y !== this.startOffset) {
                if (t(v) != t(E) || o.comparePoints(v, y, E, R) == 1) {
                    E = v;
                    R = y
                }
                c(n, v, y, E, R)
            }
        }

        function T(n, v, y) {
            var E = n.startContainer,
                R = n.startOffset;
            if (v !== n.endContainer || y !== this.endOffset) {
                if (t(v) != t(E) || o.comparePoints(v, y, E, R) == -1) {
                    E = v;
                    R = y
                }
                c(n, E, R, v, y)
            }
        }

        function ba(n, v, y) {
            if (v !== n.startContainer ||
                y !== this.startOffset || v !== n.endContainer || y !== this.endOffset) c(n, v, y, v, y)
        }
        a.prototype = new Z;
        k.util.extend(a.prototype, {
            setStart: function(n, v) {
                u(this);
                l(n, true);
                N(n, v);
                D(this, n, v)
            },
            setEnd: function(n, v) {
                u(this);
                l(n, true);
                N(n, v);
                T(this, n, v)
            },
            setStartBefore: q(true, true),
            setStartAfter: q(false, true),
            setEndBefore: q(true, false),
            setEndAfter: q(false, false),
            collapse: function(n) {
                M(this);
                n ? c(this, this.startContainer, this.startOffset, this.startContainer, this.startOffset) : c(this, this.endContainer, this.endOffset,
                    this.endContainer, this.endOffset)
            },
            selectNodeContents: function(n) {
                u(this);
                l(n, true);
                c(this, n, 0, n, J(n))
            },
            selectNode: function(n) {
                u(this);
                l(n, false);
                x(n, ga);
                var v = A(n);
                n = G(n);
                c(this, v.node, v.offset, n.node, n.offset)
            },
            extractContents: fa(z, c),
            deleteContents: fa(s, c),
            canSurroundContents: function() {
                M(this);
                V(this.startContainer);
                V(this.endContainer);
                var n = new p(this, true),
                    v = n._first && L(n._first, this) || n._last && L(n._last, this);
                n.detach();
                return !v
            },
            detach: function() {
                h(this)
            },
            splitBoundaries: function() {
                M(this);
                var n = this.startContainer,
                    v = this.startOffset,
                    y = this.endContainer,
                    E = this.endOffset,
                    R = n === y;
                o.isCharacterDataNode(y) && E > 0 && E < y.length && o.splitDataNode(y, E);
                if (o.isCharacterDataNode(n) && v > 0 && v < n.length) {
                    n = o.splitDataNode(n, v);
                    if (R) {
                        E -= v;
                        y = n
                    } else y == n.parentNode && E >= o.getNodeIndex(n) && E++;
                    v = 0
                }
                c(this, n, v, y, E)
            },
            normalizeBoundaries: function() {
                M(this);
                var n = this.startContainer,
                    v = this.startOffset,
                    y = this.endContainer,
                    E = this.endOffset,
                    R = function(U) {
                        var S = U.nextSibling;
                        if (S && S.nodeType == U.nodeType) {
                            y = U;
                            E = U.length;
                            U.appendData(S.data);
                            S.parentNode.removeChild(S)
                        }
                    },
                    pa = function(U) {
                        var S = U.previousSibling;
                        if (S && S.nodeType == U.nodeType) {
                            n = U;
                            var ra = U.length;
                            v = S.length;
                            U.insertData(0, S.data);
                            S.parentNode.removeChild(S);
                            if (n == y) {
                                E += v;
                                y = n
                            } else if (y == U.parentNode) {
                                S = o.getNodeIndex(U);
                                if (E == S) {
                                    y = U;
                                    E = ra
                                } else E > S && E--
                            }
                        }
                    },
                    ha = true;
                if (o.isCharacterDataNode(y)) y.length == E && R(y);
                else {
                    if (E > 0)(ha = y.childNodes[E - 1]) && o.isCharacterDataNode(ha) && R(ha);
                    ha = !this.collapsed
                }
                if (ha)
                    if (o.isCharacterDataNode(n)) v == 0 && pa(n);
                    else {
                        if (v < n.childNodes.length)(R =
                            n.childNodes.startOffset) && o.isCharacterDataNode(R) && pa(R)
                    }
                else {
                    n = y;
                    v = E
                }
                c(this, n, v, y, E)
            },
            collapseToPoint: function(n, v) {
                M(this);
                l(n, true);
                N(n, v);
                ba(this, n, v)
            }
        });
        ca(a)
    }

    function ia(a) {
        a.collapsed = a.startContainer === a.endContainer && a.startOffset === a.endOffset;
        a.commonAncestorContainer = a.collapsed ? a.startContainer : o.getCommonAncestor(a.startContainer, a.endContainer)
    }

    function W(a, c, h, q, D) {
        var T = a.startContainer !== c || a.startOffset !== h,
            ba = a.endContainer !== q || a.endOffset !== D;
        a.startContainer = c;
        a.startOffset =
            h;
        a.endContainer = q;
        a.endOffset = D;
        ia(a);
        I(a, "boundarychange", {
            startMoved: T,
            endMoved: ba
        })
    }

    function w(a) {
        this.startContainer = a;
        this.startOffset = 0;
        this.endContainer = a;
        this.endOffset = 0;
        this._listeners = {
            boundarychange: [],
            detach: []
        };
        ia(this)
    }
    k.requireModules(["DomUtil"]);
    var o = k.dom,
        ea = o.DomPosition,
        Q = k.DOMException;
    p.prototype = {
        _current: null,
        _next: null,
        _first: null,
        _last: null,
        isSingleCharacterDataNode: false,
        reset: function() {
            this._current = null;
            this._next = this._first
        },
        hasNext: function() {
            return !!this._next
        },
        next: function() {
            var a = this._current = this._next;
            if (a) {
                this._next = a !== this._last ? a.nextSibling : null;
                if (o.isCharacterDataNode(a) && this.clonePartiallySelectedTextNodes) {
                    if (a === this.ec)(a = a.cloneNode(true)).deleteData(this.eo, a.length - this.eo);
                    if (this._current === this.sc)(a = a.cloneNode(true)).deleteData(0, this.so)
                }
            }
            return a
        },
        remove: function() {
            var a = this._current,
                c, h;
            if (o.isCharacterDataNode(a) && (a === this.sc || a === this.ec)) {
                c = a === this.sc ? this.so : 0;
                h = a === this.ec ? this.eo : a.length;
                c != h && a.deleteData(c, h - c)
            } else a.parentNode &&
                a.parentNode.removeChild(a)
        },
        isPartiallySelectedSubtree: function() {
            return L(this._current, this.range)
        },
        getSubtreeIterator: function() {
            var a;
            if (this.isSingleCharacterDataNode) {
                a = this.range.cloneRange();
                a.collapse()
            } else {
                a = new w(H(this.range));
                var c = this._current,
                    h = c,
                    q = 0,
                    D = c,
                    T = J(c);
                if (o.isAncestorOf(c, this.sc, true)) {
                    h = this.sc;
                    q = this.so
                }
                if (o.isAncestorOf(c, this.ec, true)) {
                    D = this.ec;
                    T = this.eo
                }
                W(a, h, q, D, T)
            }
            return new p(a, this.clonePartiallySelectedTextNodes)
        },
        detach: function(a) {
            a && this.range.detach();
            this.range =
                this._current = this._next = this._first = this._last = this.sc = this.so = this.ec = this.eo = null
        }
    };
    e.prototype = {
        BAD_BOUNDARYPOINTS_ERR: 1,
        INVALID_NODE_TYPE_ERR: 2
    };
    e.prototype.toString = function() {
        return this.message
    };
    f.prototype = {
        _current: null,
        hasNext: function() {
            return !!this._next
        },
        next: function() {
            this._current = this._next;
            this._next = this.nodes[++this._position];
            return this._current
        },
        detach: function() {
            this._current = this._next = this.nodes = null
        }
    };
    var ga = [1, 3, 4, 5, 7, 8, 10],
        Y = [2, 9, 11],
        b = [1, 3, 4, 5, 7, 8, 10, 11],
        d = [1, 3, 4, 5,
            7, 8
        ],
        g = j([9, 11]),
        C = j([5, 6, 10, 12]),
        F = j([6, 10, 12]),
        O = ["startContainer", "startOffset", "endContainer", "endOffset", "collapsed", "commonAncestorContainer"],
        aa = 0,
        ja = 1,
        qa = 2,
        la = 3,
        ma = 0,
        na = 1,
        oa = 2,
        ka = 3;
    Z.prototype = {
        attachListener: function(a, c) {
            this._listeners[a].push(c)
        },
        compareBoundaryPoints: function(a, c) {
            M(this);
            K(this.startContainer, c.startContainer);
            var h = a == la || a == aa ? "start" : "end",
                q = a == ja || a == aa ? "start" : "end";
            return o.comparePoints(this[h + "Container"], this[h + "Offset"], c[q + "Container"], c[q + "Offset"])
        },
        insertNode: function(a) {
            M(this);
            x(a, b);
            V(this.startContainer);
            if (o.isAncestorOf(a, this.startContainer, true)) throw new Q("HIERARCHY_REQUEST_ERR");
            this.setStartBefore(P(a, this.startContainer, this.startOffset))
        },
        cloneContents: function() {
            M(this);
            var a, c;
            if (this.collapsed) return H(this).createDocumentFragment();
            else {
                if (this.startContainer === this.endContainer && o.isCharacterDataNode(this.startContainer)) {
                    a = this.startContainer.cloneNode(true);
                    a.data = a.data.slice(this.startOffset, this.endOffset);
                    c = H(this).createDocumentFragment();
                    c.appendChild(a);
                    return c
                } else {
                    c = new p(this, true);
                    a = i(c);
                    c.detach()
                }
                return a
            }
        },
        canSurroundContents: function() {
            M(this);
            V(this.startContainer);
            V(this.endContainer);
            var a = new p(this, true),
                c = a._first && L(a._first, this) || a._last && L(a._last, this);
            a.detach();
            return !c
        },
        surroundContents: function(a) {
            x(a, d);
            if (!this.canSurroundContents()) throw new e("BAD_BOUNDARYPOINTS_ERR");
            var c = this.extractContents();
            if (a.hasChildNodes())
                for (; a.lastChild;) a.removeChild(a.lastChild);
            P(a, this.startContainer, this.startOffset);
            a.appendChild(c);
            this.selectNode(a)
        },
        cloneRange: function() {
            M(this);
            for (var a = new w(H(this)), c = O.length, h; c--;) {
                h = O[c];
                a[h] = this[h]
            }
            return a
        },
        toString: function() {
            M(this);
            var a = this.startContainer;
            if (a === this.endContainer && o.isCharacterDataNode(a)) return a.nodeType == 3 || a.nodeType == 4 ? a.data.slice(this.startOffset, this.endOffset) : "";
            else {
                var c = [];
                a = new p(this, true);
                m(a, function(h) {
                    if (h.nodeType == 3 || h.nodeType == 4) c.push(h.data)
                });
                a.detach();
                return c.join("")
            }
        },
        compareNode: function(a) {
            M(this);
            var c = a.parentNode,
                h = o.getNodeIndex(a);
            if (!c) throw new Q("NOT_FOUND_ERR");
            a = this.comparePoint(c, h);
            c = this.comparePoint(c, h + 1);
            return a < 0 ? c > 0 ? oa : ma : c > 0 ? na : ka
        },
        comparePoint: function(a, c) {
            M(this);
            X(a, "HIERARCHY_REQUEST_ERR");
            K(a, this.startContainer);
            if (o.comparePoints(a, c, this.startContainer, this.startOffset) < 0) return -1;
            else if (o.comparePoints(a, c, this.endContainer, this.endOffset) > 0) return 1;
            return 0
        },
        createContextualFragment: function(a) {
            u(this);
            var c = H(this),
                h = c.createElement("div");
            h.innerHTML = a;
            for (a = c.createDocumentFragment(); c = h.firstChild;) a.appendChild(c);
            return a
        },
        toHtml: function() {
            M(this);
            var a = H(this).createElement("div");
            a.appendChild(this.cloneContents());
            return a.innerHTML
        },
        intersectsNode: function(a, c) {
            M(this);
            X(a, "NOT_FOUND_ERR");
            if (o.getDocument(a) !== H(this)) return false;
            var h = a.parentNode,
                q = o.getNodeIndex(a);
            X(h, "NOT_FOUND_ERR");
            var D = o.comparePoints(h, q, this.endContainer, this.endOffset);
            h = o.comparePoints(h, q + 1, this.startContainer, this.startOffset);
            return c ? D <= 0 && h >= 0 : D < 0 && h > 0
        },
        isPointInRange: function(a, c) {
            M(this);
            X(a, "HIERARCHY_REQUEST_ERR");
            K(a, this.startContainer);
            return o.comparePoints(a, c, this.startContainer, this.startOffset) >= 0 && o.comparePoints(a, c, this.endContainer, this.endOffset) <= 0
        },
        intersectsRange: function(a, c) {
            M(this);
            if (H(a) != H(this)) throw new Q("WRONG_DOCUMENT_ERR");
            var h = o.comparePoints(this.startContainer, this.startOffset, a.endContainer, a.endOffset),
                q = o.comparePoints(this.endContainer, this.endOffset, a.startContainer, a.startOffset);
            return c ? h <= 0 && q >= 0 : h < 0 && q > 0
        },
        intersection: function(a) {
            if (this.intersectsRange(a)) {
                var c = o.comparePoints(this.startContainer,
                        this.startOffset, a.startContainer, a.startOffset),
                    h = o.comparePoints(this.endContainer, this.endOffset, a.endContainer, a.endOffset),
                    q = this.cloneRange();
                c == -1 && q.setStart(a.startContainer, a.startOffset);
                h == 1 && q.setEnd(a.endContainer, a.endOffset);
                return q
            }
            return null
        },
        union: function(a) {
            if (this.intersectsRange(a, true)) {
                var c = this.cloneRange();
                o.comparePoints(a.startContainer, a.startOffset, this.startContainer, this.startOffset) == -1 && c.setStart(a.startContainer, a.startOffset);
                o.comparePoints(a.endContainer,
                    a.endOffset, this.endContainer, this.endOffset) == 1 && c.setEnd(a.endContainer, a.endOffset);
                return c
            } else throw new e("Ranges do not intersect");
        },
        containsNode: function(a, c) {
            return c ? this.intersectsNode(a, false) : this.compareNode(a) == ka
        },
        containsNodeContents: function(a) {
            return this.comparePoint(a, 0) >= 0 && this.comparePoint(a, J(a)) <= 0
        },
        containsRange: function(a) {
            return this.intersection(a).equals(a)
        },
        containsNodeText: function(a) {
            var c = this.cloneRange();
            c.selectNode(a);
            var h = c.getNodes([3]);
            if (h.length > 0) {
                c.setStart(h[0],
                    0);
                a = h.pop();
                c.setEnd(a, a.length);
                a = this.containsRange(c);
                c.detach();
                return a
            } else return this.containsNodeContents(a)
        },
        createNodeIterator: function(a, c) {
            M(this);
            return new f(this, a, c)
        },
        getNodes: function(a, c) {
            M(this);
            return B(this, a, c)
        },
        getDocument: function() {
            return H(this)
        },
        collapseBefore: function(a) {
            u(this);
            this.setEndBefore(a);
            this.collapse(false)
        },
        collapseAfter: function(a) {
            u(this);
            this.setStartAfter(a);
            this.collapse(true)
        },
        getName: function() {
            return "DomRange"
        },
        equals: function(a) {
            return w.rangesEqual(this,
                a)
        },
        inspect: function() {
            return r(this)
        }
    };
    da(w, W, function(a) {
        u(a);
        a.startContainer = a.startOffset = a.endContainer = a.endOffset = null;
        a.collapsed = a.commonAncestorContainer = null;
        I(a, "detach", null);
        a._listeners = null
    });
    k.rangePrototype = Z.prototype;
    w.rangeProperties = O;
    w.RangeIterator = p;
    w.copyComparisonConstants = ca;
    w.createPrototypeRange = da;
    w.inspect = r;
    w.getRangeDocument = H;
    w.rangesEqual = function(a, c) {
        return a.startContainer === c.startContainer && a.startOffset === c.startOffset && a.endContainer === c.endContainer && a.endOffset ===
            c.endOffset
    };
    w.getEndOffset = J;
    k.DomRange = w;
    k.RangeException = e
});
rangy.createModule("WrappedRange", function(k) {
    function L(i, m, s, z) {
        var B = i.duplicate();
        B.collapse(s);
        var r = B.parentElement();
        A.isAncestorOf(m, r, true) || (r = m);
        if (!r.canHaveHTML) return new G(r.parentNode, A.getNodeIndex(r));
        m = A.getDocument(r).createElement("span");
        var p, e = s ? "StartToStart" : "StartToEnd";
        do {
            r.insertBefore(m, m.previousSibling);
            B.moveToElementText(m)
        } while ((p = B.compareEndPoints(e, i)) > 0 && m.previousSibling);
        e = m.nextSibling;
        if (p == -1 && e && A.isCharacterDataNode(e)) {
            B.setEndPoint(s ? "EndToStart" : "EndToEnd",
                i);
            if (/[\r\n]/.test(e.data)) {
                r = B.duplicate();
                s = r.text.replace(/\r\n/g, "\r").length;
                for (s = r.moveStart("character", s); r.compareEndPoints("StartToEnd", r) == -1;) {
                    s++;
                    r.moveStart("character", 1)
                }
            } else s = B.text.length;
            r = new G(e, s)
        } else {
            e = (z || !s) && m.previousSibling;
            r = (s = (z || s) && m.nextSibling) && A.isCharacterDataNode(s) ? new G(s, 0) : e && A.isCharacterDataNode(e) ? new G(e, e.length) : new G(r, A.getNodeIndex(m))
        }
        m.parentNode.removeChild(m);
        return r
    }

    function H(i, m) {
        var s, z, B = i.offset,
            r = A.getDocument(i.node),
            p = r.body.createTextRange(),
            e = A.isCharacterDataNode(i.node);
        if (e) {
            s = i.node;
            z = s.parentNode
        } else {
            s = i.node.childNodes;
            s = B < s.length ? s[B] : null;
            z = i.node
        }
        r = r.createElement("span");
        r.innerHTML = "&#feff;";
        s ? z.insertBefore(r, s) : z.appendChild(r);
        p.moveToElementText(r);
        p.collapse(!m);
        z.removeChild(r);
        if (e) p[m ? "moveStart" : "moveEnd"]("character", B);
        return p
    }
    k.requireModules(["DomUtil", "DomRange"]);
    var I, A = k.dom,
        G = A.DomPosition,
        J = k.DomRange;
    if (k.features.implementsDomRange && (!k.features.implementsTextRange || !k.config.preferTextRange)) {
        (function() {
            function i(f) {
                for (var j =
                        s.length, t; j--;) {
                    t = s[j];
                    f[t] = f.nativeRange[t]
                }
            }
            var m, s = J.rangeProperties,
                z, B;
            I = function(f) {
                if (!f) throw Error("Range must be specified");
                this.nativeRange = f;
                i(this)
            };
            J.createPrototypeRange(I, function(f, j, t, l, u) {
                var x = f.endContainer !== l || f.endOffset != u;
                if (f.startContainer !== j || f.startOffset != t || x) {
                    f.setEnd(l, u);
                    f.setStart(j, t)
                }
            }, function(f) {
                f.nativeRange.detach();
                f.detached = true;
                for (var j = s.length, t; j--;) {
                    t = s[j];
                    f[t] = null
                }
            });
            m = I.prototype;
            m.selectNode = function(f) {
                this.nativeRange.selectNode(f);
                i(this)
            };
            m.deleteContents = function() {
                this.nativeRange.deleteContents();
                i(this)
            };
            m.extractContents = function() {
                var f = this.nativeRange.extractContents();
                i(this);
                return f
            };
            m.cloneContents = function() {
                return this.nativeRange.cloneContents()
            };
            m.surroundContents = function(f) {
                this.nativeRange.surroundContents(f);
                i(this)
            };
            m.collapse = function(f) {
                this.nativeRange.collapse(f);
                i(this)
            };
            m.cloneRange = function() {
                return new I(this.nativeRange.cloneRange())
            };
            m.refresh = function() {
                i(this)
            };
            m.toString = function() {
                return this.nativeRange.toString()
            };
            var r = document.createTextNode("test");
            A.getBody(document).appendChild(r);
            var p = document.createRange();
            p.setStart(r, 0);
            p.setEnd(r, 0);
            try {
                p.setStart(r, 1);
                z = true;
                m.setStart = function(f, j) {
                    this.nativeRange.setStart(f, j);
                    i(this)
                };
                m.setEnd = function(f, j) {
                    this.nativeRange.setEnd(f, j);
                    i(this)
                };
                B = function(f) {
                    return function(j) {
                        this.nativeRange[f](j);
                        i(this)
                    }
                }
            } catch (e) {
                z = false;
                m.setStart = function(f, j) {
                    try {
                        this.nativeRange.setStart(f, j)
                    } catch (t) {
                        this.nativeRange.setEnd(f, j);
                        this.nativeRange.setStart(f, j)
                    }
                    i(this)
                };
                m.setEnd = function(f, j) {
                    try {
                        this.nativeRange.setEnd(f, j)
                    } catch (t) {
                        this.nativeRange.setStart(f, j);
                        this.nativeRange.setEnd(f, j)
                    }
                    i(this)
                };
                B = function(f, j) {
                    return function(t) {
                        try {
                            this.nativeRange[f](t)
                        } catch (l) {
                            this.nativeRange[j](t);
                            this.nativeRange[f](t)
                        }
                        i(this)
                    }
                }
            }
            m.setStartBefore = B("setStartBefore", "setEndBefore");
            m.setStartAfter = B("setStartAfter", "setEndAfter");
            m.setEndBefore = B("setEndBefore", "setStartBefore");
            m.setEndAfter = B("setEndAfter", "setStartAfter");
            p.selectNodeContents(r);
            m.selectNodeContents =
                p.startContainer == r && p.endContainer == r && p.startOffset == 0 && p.endOffset == r.length ? function(f) {
                    this.nativeRange.selectNodeContents(f);
                    i(this)
                } : function(f) {
                    this.setStart(f, 0);
                    this.setEnd(f, J.getEndOffset(f))
                };
            p.selectNodeContents(r);
            p.setEnd(r, 3);
            z = document.createRange();
            z.selectNodeContents(r);
            z.setEnd(r, 4);
            z.setStart(r, 2);
            m.compareBoundaryPoints = p.compareBoundaryPoints(p.START_TO_END, z) == -1 & p.compareBoundaryPoints(p.END_TO_START, z) == 1 ? function(f, j) {
                j = j.nativeRange || j;
                if (f == j.START_TO_END) f = j.END_TO_START;
                else if (f == j.END_TO_START) f = j.START_TO_END;
                return this.nativeRange.compareBoundaryPoints(f, j)
            } : function(f, j) {
                return this.nativeRange.compareBoundaryPoints(f, j.nativeRange || j)
            };
            A.getBody(document).removeChild(r);
            p.detach();
            z.detach()
        })();
        k.createNativeRange = function(i) {
            i = i || document;
            return i.createRange()
        }
    } else if (k.features.implementsTextRange) {
        I = function(i) {
            this.textRange = i;
            this.refresh()
        };
        I.prototype = new J(document);
        I.prototype.refresh = function() {
            var i, m, s = this.textRange;
            i = s.parentElement();
            var z =
                s.duplicate();
            z.collapse(true);
            m = z.parentElement();
            z = s.duplicate();
            z.collapse(false);
            s = z.parentElement();
            m = m == s ? m : A.getCommonAncestor(m, s);
            m = m == i ? m : A.getCommonAncestor(i, m);
            if (this.textRange.compareEndPoints("StartToEnd", this.textRange) == 0) m = i = L(this.textRange, m, true, true);
            else {
                i = L(this.textRange, m, true, false);
                m = L(this.textRange, m, false, false)
            }
            this.setStart(i.node, i.offset);
            this.setEnd(m.node, m.offset)
        };
        I.rangeToTextRange = function(i) {
            if (i.collapsed) return H(new G(i.startContainer, i.startOffset), true);
            else {
                var m = H(new G(i.startContainer, i.startOffset), true),
                    s = H(new G(i.endContainer, i.endOffset), false);
                i = A.getDocument(i.startContainer).body.createTextRange();
                i.setEndPoint("StartToStart", m);
                i.setEndPoint("EndToEnd", s);
                return i
            }
        };
        J.copyComparisonConstants(I);
        var P = function() {
            return this
        }();
        if (typeof P.Range == "undefined") P.Range = I;
        k.createNativeRange = function(i) {
            i = i || document;
            return i.body.createTextRange()
        }
    }
    I.prototype.getName = function() {
        return "WrappedRange"
    };
    k.WrappedRange = I;
    k.createRange = function(i) {
        i =
            i || document;
        return new I(k.createNativeRange(i))
    };
    k.createRangyRange = function(i) {
        i = i || document;
        return new J(i)
    };
    k.createIframeRange = function(i) {
        return k.createRange(A.getIframeDocument(i))
    };
    k.createIframeRangyRange = function(i) {
        return k.createRangyRange(A.getIframeDocument(i))
    };
    k.addCreateMissingNativeApiListener(function(i) {
        i = i.document;
        if (typeof i.createRange == "undefined") i.createRange = function() {
            return k.createRange(this)
        };
        i = i = null
    })
});
rangy.createModule("WrappedSelection", function(k, L) {
    function H(b) {
        return (b || window).getSelection()
    }

    function I(b) {
        return (b || window).document.selection
    }

    function A(b, d, g) {
        var C = g ? "end" : "start";
        g = g ? "start" : "end";
        b.anchorNode = d[C + "Container"];
        b.anchorOffset = d[C + "Offset"];
        b.focusNode = d[g + "Container"];
        b.focusOffset = d[g + "Offset"]
    }

    function G(b) {
        b.anchorNode = b.focusNode = null;
        b.anchorOffset = b.focusOffset = 0;
        b.rangeCount = 0;
        b.isCollapsed = true;
        b._ranges.length = 0
    }

    function J(b) {
        var d;
        if (b instanceof j) {
            d = b._selectionNativeRange;
            if (!d) {
                d = k.createNativeRange(e.getDocument(b.startContainer));
                d.setEnd(b.endContainer, b.endOffset);
                d.setStart(b.startContainer, b.startOffset);
                b._selectionNativeRange = d;
                b.attachListener("detach", function() {
                    this._selectionNativeRange = null
                })
            }
        } else if (b instanceof t) d = b.nativeRange;
        else if (k.features.implementsDomRange && b instanceof e.getWindow(b.startContainer).Range) d = b;
        return d
    }

    function P(b) {
        var d = b.getNodes(),
            g;
        a: if (!d.length || d[0].nodeType != 1) g = false;
            else {
                g = 1;
                for (var C = d.length; g < C; ++g)
                    if (!e.isAncestorOf(d[0],
                            d[g])) {
                        g = false;
                        break a
                    }
                g = true
            }
        if (!g) throw Error("getSingleElementFromRange: range " + b.inspect() + " did not consist of a single element");
        return d[0]
    }

    function i(b, d) {
        var g = new t(d);
        b._ranges = [g];
        A(b, g, false);
        b.rangeCount = 1;
        b.isCollapsed = g.collapsed
    }

    function m(b) {
        b._ranges.length = 0;
        if (b.docSelection.type == "None") G(b);
        else {
            var d = b.docSelection.createRange();
            if (d && typeof d.text != "undefined") i(b, d);
            else {
                b.rangeCount = d.length;
                for (var g, C = e.getDocument(d.item(0)), F = 0; F < b.rangeCount; ++F) {
                    g = k.createRange(C);
                    g.selectNode(d.item(F));
                    b._ranges.push(g)
                }
                b.isCollapsed = b.rangeCount == 1 && b._ranges[0].collapsed;
                A(b, b._ranges[b.rangeCount - 1], false)
            }
        }
    }

    function s(b, d) {
        var g = b.docSelection.createRange(),
            C = P(d),
            F = e.getDocument(g.item(0));
        F = e.getBody(F).createControlRange();
        for (var O = 0, aa = g.length; O < aa; ++O) F.add(g.item(O));
        try {
            F.add(C)
        } catch (ja) {
            throw Error("addRange(): Element within the specified Range could not be added to control selection (does it have layout?)");
        }
        F.select();
        m(b)
    }

    function z(b, d, g) {
        this.nativeSelection =
            b;
        this.docSelection = d;
        this._ranges = [];
        this.win = g;
        this.refresh()
    }

    function B(b, d) {
        var g = e.getDocument(d[0].startContainer);
        g = e.getBody(g).createControlRange();
        for (var C = 0, F; C < rangeCount; ++C) {
            F = P(d[C]);
            try {
                g.add(F)
            } catch (O) {
                throw Error("setRanges(): Element within the one of the specified Ranges could not be added to control selection (does it have layout?)");
            }
        }
        g.select();
        m(b)
    }

    function r(b, d) {
        if (b.anchorNode && e.getDocument(b.anchorNode) !== e.getDocument(d)) throw new l("WRONG_DOCUMENT_ERR");
    }

    function p(b) {
        var d = [],
            g = new u(b.anchorNode, b.anchorOffset),
            C = new u(b.focusNode, b.focusOffset),
            F = typeof b.getName == "function" ? b.getName() : "Selection";
        if (typeof b.rangeCount != "undefined")
            for (var O = 0, aa = b.rangeCount; O < aa; ++O) d[O] = j.inspect(b.getRangeAt(O));
        return "[" + F + "(Ranges: " + d.join(", ") + ")(anchor: " + g.inspect() + ", focus: " + C.inspect() + "]"
    }
    k.requireModules(["DomUtil", "DomRange", "WrappedRange"]);
    k.config.checkSelectionRanges = true;
    var e = k.dom,
        f = k.util,
        j = k.DomRange,
        t = k.WrappedRange,
        l = k.DOMException,
        u = e.DomPosition,
        x,
        N, K = k.util.isHostMethod(window, "getSelection"),
        V = k.util.isHostObject(document, "selection"),
        X = V && (!K || k.config.preferTextRange);
    if (X) {
        x = I;
        k.isSelectionValid = function(b) {
            b = (b || window).document;
            var d = b.selection;
            return d.type != "None" || e.getDocument(d.createRange().parentElement()) == b
        }
    } else if (K) {
        x = H;
        k.isSelectionValid = function() {
            return true
        }
    } else L.fail("Neither document.selection or window.getSelection() detected.");
    k.getNativeSelection = x;
    K = x();
    var M = k.createNativeRange(document),
        Z = e.getBody(document),
        $ = f.areHostObjects(K, f.areHostProperties(K, ["anchorOffset", "focusOffset"]));
    k.features.selectionHasAnchorAndFocus = $;
    var ca = f.isHostMethod(K, "extend");
    k.features.selectionHasExtend = ca;
    var fa = typeof K.rangeCount == "number";
    k.features.selectionHasRangeCount = fa;
    var da = false,
        ia = true;
    f.areHostMethods(K, ["addRange", "getRangeAt", "removeAllRanges"]) && typeof K.rangeCount == "number" && k.features.implementsDomRange && function() {
        var b = document.createElement("iframe");
        Z.appendChild(b);
        var d = e.getIframeDocument(b);
        d.open();
        d.write("<html><head></head><body>12</body></html>");
        d.close();
        var g = e.getIframeWindow(b).getSelection(),
            C = d.documentElement.lastChild.firstChild;
        d = d.createRange();
        d.setStart(C, 1);
        d.collapse(true);
        g.addRange(d);
        ia = g.rangeCount == 1;
        g.removeAllRanges();
        var F = d.cloneRange();
        d.setStart(C, 0);
        F.setEnd(C, 2);
        g.addRange(d);
        g.addRange(F);
        da = g.rangeCount == 2;
        d.detach();
        F.detach();
        Z.removeChild(b)
    }();
    k.features.selectionSupportsMultipleRanges = da;
    k.features.collapsedNonEditableSelectionsSupported = ia;
    var W =
        false,
        w;
    if (Z && f.isHostMethod(Z, "createControlRange")) {
        w = Z.createControlRange();
        if (f.areHostProperties(w, ["item", "add"])) W = true
    }
    k.features.implementsControlRange = W;
    N = $ ? function(b) {
        return b.anchorNode === b.focusNode && b.anchorOffset === b.focusOffset
    } : function(b) {
        return b.rangeCount ? b.getRangeAt(b.rangeCount - 1).collapsed : false
    };
    var o;
    if (f.isHostMethod(K, "getRangeAt")) o = function(b, d) {
        try {
            return b.getRangeAt(d)
        } catch (g) {
            return null
        }
    };
    else if ($) o = function(b) {
        var d = e.getDocument(b.anchorNode);
        d = k.createRange(d);
        d.setStart(b.anchorNode, b.anchorOffset);
        d.setEnd(b.focusNode, b.focusOffset);
        if (d.collapsed !== this.isCollapsed) {
            d.setStart(b.focusNode, b.focusOffset);
            d.setEnd(b.anchorNode, b.anchorOffset)
        }
        return d
    };
    k.getSelection = function(b) {
        b = b || window;
        var d = b._rangySelection,
            g = x(b),
            C = V ? I(b) : null;
        if (d) {
            d.nativeSelection = g;
            d.docSelection = C;
            d.refresh(b)
        } else {
            d = new z(g, C, b);
            b._rangySelection = d
        }
        return d
    };
    k.getIframeSelection = function(b) {
        return k.getSelection(e.getIframeWindow(b))
    };
    w = z.prototype;
    if (!X && $ && f.areHostMethods(K, ["removeAllRanges", "addRange"])) {
        w.removeAllRanges = function() {
            this.nativeSelection.removeAllRanges();
            G(this)
        };
        var ea = function(b, d) {
            var g = j.getRangeDocument(d);
            g = k.createRange(g);
            g.collapseToPoint(d.endContainer, d.endOffset);
            b.nativeSelection.addRange(J(g));
            b.nativeSelection.extend(d.startContainer, d.startOffset);
            b.refresh()
        };
        w.addRange = fa ? function(b, d) {
            if (W && V && this.docSelection.type == "Control") s(this, b);
            else if (d && ca) ea(this, b);
            else {
                var g;
                if (da) g = this.rangeCount;
                else {
                    this.removeAllRanges();
                    g = 0
                }
                this.nativeSelection.addRange(J(b));
                this.rangeCount = this.nativeSelection.rangeCount;
                if (this.rangeCount == g + 1) {
                    if (k.config.checkSelectionRanges)
                        if ((g = o(this.nativeSelection, this.rangeCount - 1)) && !j.rangesEqual(g, b)) b = new t(g);
                    this._ranges[this.rangeCount - 1] = b;
                    A(this, b, Y(this.nativeSelection));
                    this.isCollapsed = N(this)
                } else this.refresh()
            }
        } : function(b, d) {
            if (d && ca) ea(this, b);
            else {
                this.nativeSelection.addRange(J(b));
                this.refresh()
            }
        };
        w.setRanges = function(b) {
            if (W && b.length > 1) B(this, b);
            else {
                this.removeAllRanges();
                for (var d = 0, g = b.length; d < g; ++d) this.addRange(b[d])
            }
        }
    } else if (f.isHostMethod(K,
            "empty") && f.isHostMethod(M, "select") && W && X) {
        w.removeAllRanges = function() {
            try {
                this.docSelection.empty();
                if (this.docSelection.type != "None") {
                    var b;
                    if (this.anchorNode) b = e.getDocument(this.anchorNode);
                    else if (this.docSelection.type == "Control") {
                        var d = this.docSelection.createRange();
                        if (d.length) b = e.getDocument(d.item(0)).body.createTextRange()
                    }
                    if (b) {
                        b.body.createTextRange().select();
                        this.docSelection.empty()
                    }
                }
            } catch (g) {}
            G(this)
        };
        w.addRange = function(b) {
            if (this.docSelection.type == "Control") s(this, b);
            else {
                t.rangeToTextRange(b).select();
                this._ranges[0] = b;
                this.rangeCount = 1;
                this.isCollapsed = this._ranges[0].collapsed;
                A(this, b, false)
            }
        };
        w.setRanges = function(b) {
            this.removeAllRanges();
            var d = b.length;
            if (d > 1) B(this, b);
            else d && this.addRange(b[0])
        }
    } else {
        L.fail("No means of selecting a Range or TextRange was found");
        return false
    }
    w.getRangeAt = function(b) {
        if (b < 0 || b >= this.rangeCount) throw new l("INDEX_SIZE_ERR");
        else return this._ranges[b]
    };
    var Q;
    if (X) Q = function(b) {
        var d;
        if (k.isSelectionValid(b.win)) d = b.docSelection.createRange();
        else {
            d = e.getBody(b.win.document).createTextRange();
            d.collapse(true)
        }
        if (b.docSelection.type == "Control") m(b);
        else d && typeof d.text != "undefined" ? i(b, d) : G(b)
    };
    else if (f.isHostMethod(K, "getRangeAt") && typeof K.rangeCount == "number") Q = function(b) {
        if (W && V && b.docSelection.type == "Control") m(b);
        else {
            b._ranges.length = b.rangeCount = b.nativeSelection.rangeCount;
            if (b.rangeCount) {
                for (var d = 0, g = b.rangeCount; d < g; ++d) b._ranges[d] = new k.WrappedRange(b.nativeSelection.getRangeAt(d));
                A(b, b._ranges[b.rangeCount - 1], Y(b.nativeSelection));
                b.isCollapsed = N(b)
            } else G(b)
        }
    };
    else if ($ &&
        typeof K.isCollapsed == "boolean" && typeof M.collapsed == "boolean" && k.features.implementsDomRange) Q = function(b) {
        var d;
        d = b.nativeSelection;
        if (d.anchorNode) {
            d = o(d, 0);
            b._ranges = [d];
            b.rangeCount = 1;
            d = b.nativeSelection;
            b.anchorNode = d.anchorNode;
            b.anchorOffset = d.anchorOffset;
            b.focusNode = d.focusNode;
            b.focusOffset = d.focusOffset;
            b.isCollapsed = N(b)
        } else G(b)
    };
    else {
        L.fail("No means of obtaining a Range or TextRange from the user's selection was found");
        return false
    }
    w.refresh = function(b) {
        var d = b ? this._ranges.slice(0) :
            null;
        Q(this);
        if (b) {
            b = d.length;
            if (b != this._ranges.length) return false;
            for (; b--;)
                if (!j.rangesEqual(d[b], this._ranges[b])) return false;
            return true
        }
    };
    var ga = function(b, d) {
        var g = b.getAllRanges(),
            C = false;
        b.removeAllRanges();
        for (var F = 0, O = g.length; F < O; ++F)
            if (C || d !== g[F]) b.addRange(g[F]);
            else C = true;
        b.rangeCount || G(b)
    };
    w.removeRange = W ? function(b) {
        if (this.docSelection.type == "Control") {
            var d = this.docSelection.createRange();
            b = P(b);
            var g = e.getDocument(d.item(0));
            g = e.getBody(g).createControlRange();
            for (var C,
                    F = false, O = 0, aa = d.length; O < aa; ++O) {
                C = d.item(O);
                if (C !== b || F) g.add(d.item(O));
                else F = true
            }
            g.select();
            m(this)
        } else ga(this, b)
    } : function(b) {
        ga(this, b)
    };
    var Y;
    if (!X && $ && k.features.implementsDomRange) {
        Y = function(b) {
            var d = false;
            if (b.anchorNode) d = e.comparePoints(b.anchorNode, b.anchorOffset, b.focusNode, b.focusOffset) == 1;
            return d
        };
        w.isBackwards = function() {
            return Y(this)
        }
    } else Y = w.isBackwards = function() {
        return false
    };
    w.toString = function() {
        for (var b = [], d = 0, g = this.rangeCount; d < g; ++d) b[d] = "" + this._ranges[d];
        return b.join("")
    };
    w.collapse = function(b, d) {
        r(this, b);
        var g = k.createRange(e.getDocument(b));
        g.collapseToPoint(b, d);
        this.removeAllRanges();
        this.addRange(g);
        this.isCollapsed = true
    };
    w.collapseToStart = function() {
        if (this.rangeCount) {
            var b = this._ranges[0];
            this.collapse(b.startContainer, b.startOffset)
        } else throw new l("INVALID_STATE_ERR");
    };
    w.collapseToEnd = function() {
        if (this.rangeCount) {
            var b = this._ranges[this.rangeCount - 1];
            this.collapse(b.endContainer, b.endOffset)
        } else throw new l("INVALID_STATE_ERR");
    };
    w.selectAllChildren =
        function(b) {
            r(this, b);
            var d = k.createRange(e.getDocument(b));
            d.selectNodeContents(b);
            this.removeAllRanges();
            this.addRange(d)
        };
    w.deleteFromDocument = function() {
        if (W && V && this.docSelection.type == "Control") {
            for (var b = this.docSelection.createRange(), d; b.length;) {
                d = b.item(0);
                b.remove(d);
                d.parentNode.removeChild(d)
            }
            this.refresh()
        } else if (this.rangeCount) {
            b = this.getAllRanges();
            this.removeAllRanges();
            d = 0;
            for (var g = b.length; d < g; ++d) b[d].deleteContents();
            this.addRange(b[g - 1])
        }
    };
    w.getAllRanges = function() {
        return this._ranges.slice(0)
    };
    w.setSingleRange = function(b) {
        this.setRanges([b])
    };
    w.containsNode = function(b, d) {
        for (var g = 0, C = this._ranges.length; g < C; ++g)
            if (this._ranges[g].containsNode(b, d)) return true;
        return false
    };
    w.toHtml = function() {
        var b = "";
        if (this.rangeCount) {
            b = j.getRangeDocument(this._ranges[0]).createElement("div");
            for (var d = 0, g = this._ranges.length; d < g; ++d) b.appendChild(this._ranges[d].cloneContents());
            b = b.innerHTML
        }
        return b
    };
    w.getName = function() {
        return "WrappedSelection"
    };
    w.inspect = function() {
        return p(this)
    };
    w.detach = function() {
        this.win =
            this.anchorNode = this.focusNode = this.win._rangySelection = null
    };
    z.inspect = p;
    k.Selection = z;
    k.selectionPrototype = w;
    k.addCreateMissingNativeApiListener(function(b) {
        if (typeof b.getSelection == "undefined") b.getSelection = function() {
            return k.getSelection(this)
        };
        b = null
    })
});