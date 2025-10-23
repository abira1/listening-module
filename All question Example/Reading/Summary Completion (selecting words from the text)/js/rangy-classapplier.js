/*
 CSS Class Applier module for Rangy.
 Adds, removes and toggles CSS classes on Ranges and Selections

 Part of Rangy, a cross-browser JavaScript range and selection library
 http://code.google.com/p/rangy/

 Depends on Rangy core.

 Copyright 2011, Tim Down
 Licensed under the MIT license.
 Version: 1.2beta
 Build date: 21 July 2011
*/
rangy.createModule("CssClassApplier", function(i, q) {
    function r(a, b) {
        return a.className && RegExp("(?:^|\\s)" + b + "(?:\\s|$)").test(a.className)
    }

    function s(a, b) {
        if (a.className) r(a, b) || (a.className += " " + b);
        else a.className = b
    }

    function n(a) {
        return a.split(/\s+/).sort().join(" ")
    }

    function w(a, b) {
        return n(a.className) == n(b.className)
    }

    function x(a) {
        for (var b = a.parentNode; a.hasChildNodes();) b.insertBefore(a.firstChild, a);
        b.removeChild(a)
    }

    function y(a, b) {
        var c = a.cloneRange();
        c.selectNodeContents(b);
        var d = c.intersection(a);
        d = d ? d.toString() : "";
        c.detach();
        return d != ""
    }

    function z(a, b) {
        if (a.attributes.length != b.attributes.length) return false;
        for (var c = 0, d = a.attributes.length, e, f; c < d; ++c) {
            e = a.attributes[c];
            f = e.name;
            if (f != "class") {
                f = b.attributes.getNamedItem(f);
                if (e.specified != f.specified) return false;
                if (e.specified && e.nodeValue !== f.nodeValue) return false
            }
        }
        return true
    }

    function A(a, b) {
        for (var c = 0, d = a.attributes.length, e; c < d; ++c) {
            e = a.attributes[c].name;
            if (!(b && h.arrayContains(b, e)) && a.attributes[c].specified && e != "class") return true
        }
        return false
    }

    function o(a) {
        return a && a.nodeType == 1 && a.isContentEditable
    }

    function l(a, b, c, d) {
        var e, f = c == 0;
        if (h.isAncestorOf(b, a)) throw q.createError("descendant is ancestor of node");
        if (h.isCharacterDataNode(b))
            if (c == 0) {
                c = h.getNodeIndex(b);
                b = b.parentNode
            } else if (c == b.length) {
            c = h.getNodeIndex(b) + 1;
            b = b.parentNode
        } else throw q.createError("splitNodeAt should not be called with offset in the middle of a data node (" + c + " in " + b.data);
        var g;
        g = b;
        var j = c;
        g = h.isCharacterDataNode(g) ? j == 0 ? !!g.previousSibling : j == g.length ?
            !!g.nextSibling : true : j > 0 && j < g.childNodes.length;
        if (g) {
            if (!e) {
                e = b.cloneNode(false);
                for (e.id && e.removeAttribute("id"); f = b.childNodes[c];) e.appendChild(f);
                h.insertAfter(e, b)
            }
            return b == a ? e : l(a, e.parentNode, h.getNodeIndex(e), d)
        } else if (a != b) {
            e = b.parentNode;
            b = h.getNodeIndex(b);
            f || b++;
            return l(a, e, b, d)
        }
        return a
    }

    function B(a) {
        var b = a ? "nextSibling" : "previousSibling";
        return function(c, d) {
            var e = c.parentNode,
                f = c[b];
            if (f) {
                if (f && f.nodeType == 3) return f
            } else if (d)
                if ((f = e[b]) && f.nodeType == 1 && e.tagName == f.tagName &&
                    w(e, f) && z(e, f)) return f[a ? "firstChild" : "lastChild"];
            return null
        }
    }

    function t(a) {
        this.firstTextNode = (this.isElementMerge = a.nodeType == 1) ? a.lastChild : a;
        this.textNodes = [this.firstTextNode]
    }

    function p(a, b, c) {
        this.cssClass = a;
        var d, e, f = null;
        if (typeof b == "object" && b !== null) {
            c = b.tagNames;
            f = b.elementProperties;
            for (d = 0; e = I[d++];)
                if (b.hasOwnProperty(e)) this[e] = b[e];
            d = b.normalize
        } else d = b;
        this.normalize = typeof d == "undefined" ? true : d;
        this.attrExceptions = [];
        d = document.createElement(this.elementTagName);
        this.elementProperties = {};
        for (var g in f)
            if (f.hasOwnProperty(g)) {
                if (C.hasOwnProperty(g)) g = C[g];
                d[g] = f[g];
                this.elementProperties[g] = d[g];
                this.attrExceptions.push(g)
            }
        this.elementSortedClassName = this.elementProperties.hasOwnProperty("className") ? n(this.elementProperties.className + " " + a) : a;
        this.applyToAnyTagName = false;
        a = typeof c;
        if (a == "string")
            if (c == "*") this.applyToAnyTagName = true;
            else this.tagNames = c.toLowerCase().replace(/^\s\s*/, "").replace(/\s\s*$/, "").split(/\s*,\s*/);
        else if (a == "object" && typeof c.length == "number") {
            this.tagNames = [];
            d = 0;
            for (a = c.length; d < a; ++d)
                if (c[d] == "*") this.applyToAnyTagName = true;
                else this.tagNames.push(c[d].toLowerCase())
        } else this.tagNames = [this.elementTagName]
    }
    i.requireModules(["WrappedSelection", "WrappedRange"]);
    var h = i.dom,
        D = function() {
            function a(b, c, d) {
                return c && d ? " " : ""
            }
            return function(b, c) {
                if (b.className) b.className = b.className.replace(RegExp("(?:^|\\s)" + c + "(?:\\s|$)"), a)
            }
        }(),
        u;
    if (typeof window.getComputedStyle != "undefined") u = function(a, b) {
        return h.getWindow(a).getComputedStyle(a, null)[b]
    };
    else if (typeof document.documentElement.currentStyle !=
        "undefined") u = function(a, b) {
        return a.currentStyle[b]
    };
    else q.fail("No means of obtaining computed style properties found");
    var J = /^(h[1-6]|p|hr|pre|blockquote|ol|ul|li|dl|dt|dd|div|table|caption|colgroup|col|tbody|thead|tfoot|tr|th|td|address)$/i,
        K = /^inline(-block|-table)?$/i,
        L = B(false),
        M = B(true);
    t.prototype = {
        doMerge: function() {
            for (var a = [], b, c, d = 0, e = this.textNodes.length; d < e; ++d) {
                b = this.textNodes[d];
                c = b.parentNode;
                a[d] = b.data;
                if (d) {
                    c.removeChild(b);
                    c.hasChildNodes() || c.parentNode.removeChild(c)
                }
            }
            return this.firstTextNode.data =
                a = a.join("")
        },
        getLength: function() {
            for (var a = this.textNodes.length, b = 0; a--;) b += this.textNodes[a].length;
            return b
        },
        toString: function() {
            for (var a = [], b = 0, c = this.textNodes.length; b < c; ++b) a[b] = "'" + this.textNodes[b].data + "'";
            return "[Merge(" + a.join(",") + ")]"
        }
    };
    var I = ["elementTagName", "ignoreWhiteSpace", "applyToEditableOnly"],
        C = {
            "class": "className"
        };
    p.prototype = {
        elementTagName: "span",
        elementProperties: {},
        ignoreWhiteSpace: true,
        applyToEditableOnly: false,
        hasClass: function(a) {
            return a.nodeType == 1 && h.arrayContains(this.tagNames,
                a.tagName.toLowerCase()) && r(a, this.cssClass)
        },
        getSelfOrAncestorWithClass: function(a) {
            for (; a;) {
                if (this.hasClass(a, this.cssClass)) return a;
                a = a.parentNode
            }
            return null
        },
        isEditable: function(a) {
            return !this.applyToEditableOnly || (o(a) || o(a.parentNode)) && !(a && (a.nodeType == 9 && a.designMode == "on" || o(a) && !o(a.parentNode)))
        },
        isUnwrappable: function(a) {
            if (!a || a.nodeType != 1) return false;
            if (!(h.isCharacterDataNode(a) || a.nodeType == 1 && K.test(u(a, "display"))) || !this.isEditable(a)) return true;
            return J.test(a.tagName)
        },
        isIgnorableWhiteSpaceNode: function(a) {
            return this.ignoreWhiteSpace && a && a.nodeType == 3 && !/[^\r\n\t ]/.test(a.data) && (this.isUnwrappable(a.previousSibling) || this.isUnwrappable(a.nextSibling))
        },
        postApply: function(a, b, c) {
            for (var d = a[0], e = a[a.length - 1], f = [], g, j = d, E = e, F = 0, G = e.length, m, H, k = 0, v = a.length; k < v; ++k) {
                m = a[k];
                if (H = L(m, !c)) {
                    if (!g) {
                        g = new t(H);
                        f.push(g)
                    }
                    g.textNodes.push(m);
                    if (m === d) {
                        j = g.firstTextNode;
                        F = j.length
                    }
                    if (m === e) {
                        E = g.firstTextNode;
                        G = g.getLength()
                    }
                } else g = null
            }
            if (a = M(e, !c)) {
                if (!g) {
                    g = new t(e);
                    f.push(g)
                }
                g.textNodes.push(a)
            }
            if (f.length) {
                k = 0;
                for (v = f.length; k < v; ++k) f[k].doMerge();
                b.setStart(j, F);
                b.setEnd(E, G)
            }
        },
        createContainer: function(a) {
            a = a.createElement(this.elementTagName);
            i.util.extend(a, this.elementProperties);
            s(a, this.cssClass);
            return a
        },
        applyToTextNode: function(a) {
            var b = a.parentNode;
            if (b.childNodes.length == 1 && h.arrayContains(this.tagNames, b.tagName.toLowerCase())) s(b, this.cssClass);
            else {
                b = this.createContainer(h.getDocument(a));
                a.parentNode.insertBefore(b, a);
                b.appendChild(a)
            }
        },
        isRemovable: function(a) {
            var b;
            if (b = a.tagName.toLowerCase() == this.elementTagName) {
                if (b = n(a.className) == this.elementSortedClassName) {
                    var c;
                    a: {
                        b = this.elementProperties;
                        for (c in b)
                            if (b.hasOwnProperty(c) && a[c] !== b[c]) {
                                c = false;
                                break a
                            }
                        c = true
                    }
                    b = c && !A(a, this.attrExceptions) && this.isEditable(a)
                }
                b = b
            }
            return b
        },
        undoToTextNode: function(a, b, c) {
            if (!b.containsNode(c)) {
                a = b.cloneRange();
                a.selectNode(c);
                if (a.isPointInRange(b.endContainer, b.endOffset)) {
                    l(c, b.endContainer, b.endOffset, [b]);
                    b.setEndAfter(c)
                }
                if (a.isPointInRange(b.startContainer, b.startOffset)) c =
                    l(c, b.startContainer, b.startOffset, [b])
            }
            this.isRemovable(c) ? x(c) : D(c, this.cssClass)
        },
        applyToRange: function(a) {
            a.splitBoundaries();
            var b = a.getNodes([3], function(f) {
                return y(a, f)
            });
            if (b.length) {
                for (var c, d = 0, e = b.length; d < e; ++d) {
                    c = b[d];
                    !this.isIgnorableWhiteSpaceNode(c) && !this.getSelfOrAncestorWithClass(c) && this.isEditable(c) && this.applyToTextNode(c)
                }
                a.setStart(b[0], 0);
                c = b[b.length - 1];
                a.setEnd(c, c.length);
                this.normalize && this.postApply(b, a, false)
            }
        },
        applyToSelection: function(a) {
            a = a || window;
            a = i.getSelection(a);
            var b, c = a.getAllRanges();
            a.removeAllRanges();
            for (var d = c.length; d--;) {
                b = c[d];
                this.applyToRange(b);
                a.addRange(b)
            }
        },
        undoToRange: function(a) {
            a.splitBoundaries();
            var b = a.getNodes([3]),
                c, d, e = b[b.length - 1];
            if (b.length) {
                for (var f = 0, g = b.length; f < g; ++f) {
                    c = b[f];
                    (d = this.getSelfOrAncestorWithClass(c)) && this.isEditable(c) && this.undoToTextNode(c, a, d);
                    a.setStart(b[0], 0);
                    a.setEnd(e, e.length)
                }
                this.normalize && this.postApply(b, a, true)
            }
        },
        undoToSelection: function(a) {
            a = a || window;
            a = i.getSelection(a);
            var b = a.getAllRanges(),
                c;
            a.removeAllRanges();
            for (var d = 0, e = b.length; d < e; ++d) {
                c = b[d];
                this.undoToRange(c);
                a.addRange(c)
            }
        },
        getTextSelectedByRange: function(a, b) {
            var c = b.cloneRange();
            c.selectNodeContents(a);
            var d = c.intersection(b);
            d = d ? d.toString() : "";
            c.detach();
            return d
        },
        isAppliedToRange: function(a) {
            if (a.collapsed) return !!this.getSelfOrAncestorWithClass(a.commonAncestorContainer);
            else {
                for (var b = a.getNodes([3]), c = 0, d; d = b[c++];)
                    if (!this.isIgnorableWhiteSpaceNode(d) && y(a, d) && this.isEditable(d) && !this.getSelfOrAncestorWithClass(d)) return false;
                return true
            }
        },
        isAppliedToSelection: function(a) {
            a = a || window;
            a = i.getSelection(a).getAllRanges();
            for (var b = a.length; b--;)
                if (!this.isAppliedToRange(a[b])) return false;
            return true
        },
        toggleRange: function(a) {
            this.isAppliedToRange(a) ? this.undoToRange(a) : this.applyToRange(a)
        },
        toggleSelection: function(a) {
            this.isAppliedToSelection(a) ? this.undoToSelection(a) : this.applyToSelection(a)
        },
        detach: function() {}
    };
    p.util = {
        hasClass: r,
        addClass: s,
        removeClass: D,
        hasSameClasses: w,
        replaceWithOwnChildren: x,
        elementsHaveSameNonClassAttributes: z,
        elementHasNonClassAttributes: A,
        splitNodeAt: l
    };
    i.CssClassApplier = p;
    i.createCssClassApplier = function(a, b, c) {
        return new p(a, b, c)
    }
});