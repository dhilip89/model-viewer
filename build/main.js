var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
System.register("Progressable", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function avg(L) {
        var s = 0;
        L.forEach(function (i) { return s += i; });
        s /= L.length;
        return s;
    }
    function setTimeoutProgressable(n) {
        var p = new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(n);
            }, n);
        });
        var pr = new Progressable(p);
        var start = +(new Date());
        function tick() {
            var ms = +(new Date());
            var t = (ms - start) / n;
            pr.setProgress(t);
            if (t < 1)
                window.requestAnimationFrame(tick);
        }
        tick();
        return pr;
    }
    var Progressable;
    return {
        setters: [],
        execute: function () {
            Progressable = /** @class */ (function () {
                function Progressable(promise, initialProgress) {
                    if (initialProgress === void 0) { initialProgress = 0; }
                    this.promise = promise;
                    this.onProgress = null;
                    this.progress = initialProgress;
                }
                Progressable.prototype.setProgress = function (n) {
                    this.progress = n;
                    if (this.onProgress)
                        this.onProgress();
                };
                Progressable.prototype.then = function (onfulfilled) {
                    var _this = this;
                    // The rough idea is that any then-able is implicitly at the same progress as this one.
                    var pr = new Progressable(this.promise.then(onfulfilled), this.progress);
                    this.onProgress = function () {
                        pr.setProgress(_this.progress);
                    };
                    return pr;
                };
                Progressable.all = function (progressables) {
                    var p = Promise.all(progressables.map(function (p) { return p.promise; }));
                    function calcProgress() {
                        var progresses = progressables.map(function (p) { return p.progress; });
                        pr.progress = avg(progresses);
                        if (pr.onProgress !== null)
                            pr.onProgress();
                    }
                    progressables.forEach(function (p) {
                        p.onProgress = calcProgress;
                    });
                    var pr = new Progressable(p);
                    return pr;
                };
                return Progressable;
            }());
            exports_1("default", Progressable);
        }
    };
});
System.register("util", ["ArrayBufferSlice", "Progressable"], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    function fetch(path) {
        var request = new XMLHttpRequest();
        request.open("GET", path, true);
        request.responseType = "arraybuffer";
        request.send();
        var p = new Promise(function (resolve, reject) {
            request.onload = function () {
                pr.setProgress(1);
                var buffer = request.response;
                var slice = new ArrayBufferSlice_1.default(buffer);
                resolve(slice);
            };
            request.onerror = function () {
                reject();
            };
            request.onprogress = function (e) {
                if (e.lengthComputable)
                    pr.setProgress(e.loaded / e.total);
            };
        });
        var pr = new Progressable_1.default(p);
        return pr;
    }
    exports_2("fetch", fetch);
    function assert(b) {
        if (!b)
            throw new Error("Assert fail");
    }
    exports_2("assert", assert);
    function readString(buffer, offs, length, nulTerminated) {
        if (length === void 0) { length = -1; }
        if (nulTerminated === void 0) { nulTerminated = true; }
        var buf = buffer.createTypedArray(Uint8Array, offs);
        var S = '';
        var i = 0;
        while (true) {
            if (length > 0 && i >= length)
                break;
            if (nulTerminated && buf[i] === 0)
                break;
            S += String.fromCharCode(buf[i]);
            i++;
        }
        return S;
    }
    exports_2("readString", readString);
    function align(n, multiple) {
        var mask = (multiple - 1);
        return (n + mask) & ~mask;
    }
    exports_2("align", align);
    function generateFormID() {
        return "FormGeneratedID_" + counter++;
    }
    exports_2("generateFormID", generateFormID);
    var ArrayBufferSlice_1, Progressable_1, counter;
    return {
        setters: [
            function (ArrayBufferSlice_1_1) {
                ArrayBufferSlice_1 = ArrayBufferSlice_1_1;
            },
            function (Progressable_1_1) {
                Progressable_1 = Progressable_1_1;
            }
        ],
        execute: function () {
            counter = 0;
        }
    };
});
System.register("ArrayBufferSlice", ["util"], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    function isAligned(n, m) {
        return (n & (m - 1)) === 0;
    }
    var util_1, ArrayBuffer_slice, ArrayBufferSlice;
    return {
        setters: [
            function (util_1_1) {
                util_1 = util_1_1;
            }
        ],
        execute: function () {
            // This implements a "saner" ArrayBuffer, since the JS one is absurd.
            //
            // The biggest issue is that ArrayBuffer.prototype.slice does not make a read-only view, but instead
            // a copy, and most browsers do not implement it as a COW buffer but instead a separate buffer backed
            // by a separate memcpy. There is no way to create a read-only or ArrayBufferView, since that goal is
            // mostly relegated to the typed arrays or DataViews, which have unmatching and different APIs.
            //
            // ArrayBufferSlice's are designed to be read-only, however, JavaScript has no way of enforcing this
            // currently...
            // Install our dummy ArrayBuffer.prototype.slice to catch any rogue offenders.
            ArrayBuffer_slice = ArrayBuffer.prototype.slice;
            ArrayBuffer.prototype.slice = function (begin, end) {
                throw new Error("Do not use ArrayBuffer.prototype.slice");
            };
            ArrayBufferSlice = /** @class */ (function () {
                function ArrayBufferSlice(
                // The name arrayBuffer is chosen so that someone can't easily mistake an ArrayBufferSlice
                // for an ArrayBuffer or ArrayBufferView, which is important for native APIs like OpenGL that
                // will silently choke on something like this. TypeScript has no way to explicitly mark our
                // class as incompatible with the ArrayBuffer interface.
                arrayBuffer, byteOffset, byteLength) {
                    if (byteOffset === void 0) { byteOffset = 0; }
                    if (byteLength === void 0) { byteLength = arrayBuffer.byteLength; }
                    this.arrayBuffer = arrayBuffer;
                    this.byteOffset = byteOffset;
                    this.byteLength = byteLength;
                    util_1.assert(byteOffset >= 0 && byteLength >= 0 && (byteOffset + byteLength) <= this.arrayBuffer.byteLength);
                }
                ArrayBufferSlice.prototype.slice = function (begin, end) {
                    var absBegin = this.byteOffset + begin;
                    var absEnd = this.byteOffset + (end !== undefined ? end : this.byteLength);
                    return new ArrayBufferSlice(this.arrayBuffer, absBegin, absEnd - absBegin);
                };
                ArrayBufferSlice.prototype.subarray = function (begin, byteLength) {
                    var absBegin = this.byteOffset + begin;
                    if (byteLength === undefined)
                        byteLength = this.byteLength - begin;
                    util_1.assert(byteLength >= 0 && byteLength <= this.byteLength);
                    return new ArrayBufferSlice(this.arrayBuffer, absBegin, byteLength);
                };
                ArrayBufferSlice.prototype.copyToBuffer = function (offs, length) {
                    if (offs === void 0) { offs = 0; }
                    var start = this.byteOffset + offs;
                    var end = length !== undefined ? start + length : this.byteOffset + this.byteLength;
                    return ArrayBuffer_slice.call(this.arrayBuffer, start, end);
                };
                ArrayBufferSlice.prototype.castToBuffer = function () {
                    if (this.byteOffset === 0 && this.byteLength === this.arrayBuffer.byteLength) {
                        return this.arrayBuffer;
                    }
                    else {
                        return this.copyToBuffer();
                    }
                };
                ArrayBufferSlice.prototype.createDataView = function (offs, length) {
                    if (offs === void 0) { offs = 0; }
                    if (offs === 0 && length === undefined) {
                        return new DataView(this.arrayBuffer, this.byteOffset, this.byteLength);
                    }
                    else {
                        return this.subarray(offs, length).createDataView();
                    }
                };
                ArrayBufferSlice.prototype.createTypedArray = function (clazz, offs, count) {
                    if (offs === void 0) { offs = 0; }
                    var begin = this.byteOffset + offs;
                    var byteLength;
                    if (count !== undefined) {
                        byteLength = clazz.BYTES_PER_ELEMENT * count;
                    }
                    else {
                        byteLength = this.byteLength - offs;
                        // Ensure it's aligned if we're relying on implicit length as a safety net
                        // so we don't try to silently copy the rest of the ArrayBuffer.
                        var end = begin + byteLength;
                        util_1.assert(isAligned(end, clazz.BYTES_PER_ELEMENT));
                        count = byteLength / clazz.BYTES_PER_ELEMENT;
                    }
                    // Typed arrays require 
                    if (isAligned(begin, clazz.BYTES_PER_ELEMENT))
                        return new clazz(this.arrayBuffer, begin, count);
                    else
                        return new clazz(this.copyToBuffer(offs, byteLength), 0);
                };
                return ArrayBufferSlice;
            }());
            exports_3("default", ArrayBufferSlice);
        }
    };
});
System.register("CodeEditor", [], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    function visibleRAF(elem, func) {
        var window = elem.ownerDocument.defaultView;
        var isRunning = false;
        function setRunning(running) {
            if (isRunning == running)
                return;
            isRunning = running;
            if (isRunning)
                window.requestAnimationFrame(update);
        }
        function update(t) {
            func(t);
            if (isRunning)
                window.requestAnimationFrame(update);
        }
        function callback(entries) {
            var intersectionRatio = entries[entries.length - 1].intersectionRatio;
            var shouldBeRunning = intersectionRatio > 0;
            setRunning(shouldBeRunning);
        }
        var observer = new IntersectionObserver(callback);
        observer.observe(elem);
    }
    // #region Color Utilities
    function colorLerp(ca, cb, t) {
        console.assert(ca[0] === '#' && ca.length === 7);
        var ar = parseInt(ca.slice(1, 3), 16), ag = parseInt(ca.slice(3, 5), 16), ab = parseInt(ca.slice(5, 7), 16);
        console.assert(cb[0] === '#' && cb.length === 7);
        var br = parseInt(cb.slice(1, 3), 16), bg = parseInt(cb.slice(3, 5), 16), bb = parseInt(cb.slice(5, 7), 16);
        var nr = ar + (br - ar) * t, ng = ag + (bg - ag) * t, nb = ab + (bb - ab) * t;
        var r = (nr | 0).toString(16), g = (ng | 0).toString(16), b = (nb | 0).toString(16);
        return "#" + r + g + b;
    }
    function colorGrayscale(c) {
        console.assert(c[0] === '#' && c.length === 7);
        var r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
        // NTSC primaries.
        var ny = r * 0.299 + g * 0.587 + b * 0.114;
        var y = (ny | 0).toString(16);
        return "#" + y + y + y;
    }
    // #endregion
    // #region NumberDragger
    // Gross number formatting function used to lop unlucky floating points off...
    // e.g. 12345.100000007 => '12345.1'
    function formatDecimal(value, places) {
        if (places === void 0) { places = 2; }
        var valueStr = value.toFixed(places);
        while (valueStr.includes('.') && '.0'.includes(valueStr.slice(-1)))
            valueStr = valueStr.slice(0, -1);
        return valueStr;
    }
    // #endregion
    // XXX: Differing browsers have inconsistent ways of drawing text... specifically,
    // they don't always agree on what 'top' baseline alignment is. This tries to
    // accurately measure the top margin by drawing a character and scanning where the top is...
    function expensiveMeasureTextMargin(document, width, height, font) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.font = font;
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'black';
        ctx.fillText('l', 0, 0);
        var image = ctx.getImageData(0, 0, width, height);
        for (var y = 0; y < image.height; y++)
            for (var x = 0; x < image.width; x++)
                if (image.data[4 * (y * image.width + x) + 3])
                    return y;
        throw new Error('wtf');
    }
    var MONOSPACE, CursorOverride, NumberDragger, CodeEditor;
    return {
        setters: [],
        execute: function () {
            // The monospace font we use...
            MONOSPACE = '"Source Code Pro", "Droid Sans Mono", monospace';
            // #endregion
            // #region Cursor
            // Helper class to globally set a cursor.
            CursorOverride = /** @class */ (function () {
                function CursorOverride(_document) {
                    this._document = _document;
                    this._styleElem = this._document.createElement('style');
                    this._document.head.appendChild(this._styleElem);
                    this._style = this._styleElem.sheet;
                    this._owner = null;
                }
                CursorOverride.prototype.setCursor = function (owner, cursor) {
                    // If we have a current owner, don't let modifications by other owners...
                    if (this._owner && owner !== this._owner)
                        return;
                    if (this._style.cssRules.length)
                        this._style.deleteRule(0);
                    if (cursor) {
                        var rule = "* { cursor: " + cursor + " !important; }";
                        this._style.insertRule(rule, 0);
                        this._owner = owner;
                    }
                    else {
                        this._owner = null;
                    }
                };
                return CursorOverride;
            }());
            NumberDragger = /** @class */ (function () {
                function NumberDragger(_document, _cursorOverride) {
                    this._document = _document;
                    this._cursorOverride = _cursorOverride;
                    // User callback.
                    this.onvalue = null;
                    this.onend = null;
                    this._toplevel = this._document.createElement('div');
                    this._toplevel.style.position = 'absolute';
                    this._toplevel.style.transform = 'translate(0, -50%)';
                    this._toplevel.style.fontFamily = MONOSPACE;
                    this._toplevel.style.backgroundColor = '#232323';
                    this._toplevel.style.color = '#c93';
                    this._toplevel.style.border = '2px solid #c93';
                    this._toplevel.style.lineHeight = '2em';
                    this._toplevel.style.marginLeft = '1em';
                    this._toplevel.style.borderRadius = '6px';
                    this._toplevel.style.boxShadow = 'rgba(0, 0, 0, .4) 0px 4px 16px';
                    this._toplevel.style.zIndex = '9999';
                    this._segments = [];
                    for (var exp = 2; exp >= -2; exp--) {
                        var incr = Math.pow(10, exp);
                        var segment = this._document.createElement('div');
                        segment._incr = incr;
                        segment.style.padding = '.5em 1em';
                        segment.textContent = '' + incr;
                        this._toplevel.appendChild(segment);
                        this._segments.push(segment);
                    }
                    this._anchorMouseX = 0;
                    this._anchorValue = undefined;
                    this._value = undefined;
                    this._onMouseMove = this._onMouseMove.bind(this);
                    this._onMouseUp = this._onMouseUp.bind(this);
                }
                NumberDragger.prototype._onMouseMove = function (e) {
                    e.stopPropagation();
                    var accel = 15;
                    var dx = Math.round((e.clientX - this._anchorMouseX) / accel);
                    var newValue = this._anchorValue + (dx * this._currentIncr);
                    if (this._value !== newValue) {
                        this._value = newValue;
                        this.onvalue(this._value);
                    }
                    var y = e.clientY;
                    try {
                        for (var _a = __values(this._segments), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var segment = _b.value;
                            var bbox = segment.getBoundingClientRect();
                            if (y < bbox.bottom) {
                                if (this._selectSegment(segment)) {
                                    // Set new anchor.
                                    if (this._anchorValue !== this._value) {
                                        this._anchorMouseX = e.clientX;
                                        this._anchorValue = this._value;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    var e_1, _c;
                };
                NumberDragger.prototype._onMouseUp = function (e) {
                    this._cursorOverride.setCursor(this, '');
                    this._document.documentElement.removeEventListener('mouseup', this._onMouseUp);
                    this.onend();
                    if (this._showTimeout) {
                        clearTimeout(this._showTimeout);
                        this._showTimeout = 0;
                        return;
                    }
                    this._document.documentElement.removeEventListener('mousemove', this._onMouseMove, { capture: true });
                    this._document.body.removeChild(this._toplevel);
                };
                NumberDragger.prototype._selectSegment = function (segment) {
                    var incr = segment._incr;
                    if (this._currentIncr === incr)
                        return false;
                    this._currentIncr = incr;
                    try {
                        for (var _a = __values(this._segments), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var seg = _b.value;
                            var hilite = seg === segment;
                            seg.style.backgroundColor = hilite ? '#c93' : '';
                            seg.style.color = hilite ? '#222' : '';
                            seg.style.fontWeight = hilite ? 'bold' : '';
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    return true;
                    var e_2, _c;
                };
                NumberDragger.prototype._show = function () {
                    this._showTimeout = 0;
                    this._document.body.appendChild(this._toplevel);
                    this._document.documentElement.addEventListener('mousemove', this._onMouseMove, { capture: true });
                };
                NumberDragger.prototype.setPosition = function (x, y) {
                    this._toplevel.style.left = x + 'px';
                    this._toplevel.style.top = y + 'px';
                };
                NumberDragger.prototype.show = function (value, e) {
                    this._anchorMouseX = e.clientX;
                    this._anchorValue = value;
                    // reset
                    this._selectSegment(this._segments[2]);
                    this._document.documentElement.addEventListener('mouseup', this._onMouseUp);
                    // Delay the show a tiny bit...
                    this._showTimeout = setTimeout(this._show.bind(this), 100);
                    this._cursorOverride.setCursor(this, 'e-resize');
                };
                return NumberDragger;
            }());
            ;
            ;
            ;
            CodeEditor = /** @class */ (function () {
                function CodeEditor(_document) {
                    this._document = _document;
                    this.onvaluechanged = null;
                    this._prefix = '';
                    this._suffix = '';
                    // Padding, in units of line height.
                    this._paddingTop = .2;
                    this._paddingBottom = 1.5;
                    this._toplevel = this._document.createElement('div');
                    this._toplevel.style.position = 'relative';
                    // We need to append this to the body to measure / get metrics... :(
                    // Setup is particularly wacky... maybe clean it up at some point?
                    this._document.body.appendChild(this._toplevel);
                    this._textarea = this._document.createElement('textarea');
                    this._textarea.style.fontFamily = MONOSPACE;
                    this._textarea.oninput = this._onInput.bind(this);
                    this._textarea.onkeydown = this._onKeyDown.bind(this);
                    this._toplevel.appendChild(this._textarea);
                    this._canvas = this._document.createElement('canvas');
                    this._toplevel.appendChild(this._canvas);
                    this._onMouseDown = this._onMouseDown.bind(this);
                    this._onMouseMove = this._onMouseMove.bind(this);
                    this._onMouseUp = this._onMouseUp.bind(this);
                    this._onMouseLeave = this._onMouseLeave.bind(this);
                    this._canvas.onmousedown = this._onMouseDown;
                    this._canvas.onmouseleave = this._onMouseLeave;
                    this._canvas.onmousemove = this._onMouseMove;
                    this._textarea.style.whiteSpace = 'pre-wrap';
                    this._textarea.style.wordBreak = 'break-all';
                    // Hide the textarea the canvas now that we've sized it...
                    this._textarea.style.position = 'absolute';
                    this._textarea.style.left = '-99999px';
                    this._canvas.style.position = 'absolute';
                    this._needsRecalculate = false;
                    this._valueChanged = false;
                    // Redraw-internal state.
                    this._redraw_cursorPosition = undefined;
                    this._redraw_cursorBlinkStart = undefined;
                    this._cursorOverride = new CursorOverride(this._document);
                    this._numberDragger = new NumberDragger(this._document, this._cursorOverride);
                    this._numberDragger.onvalue = this._onNumberDraggerValue.bind(this);
                    this._numberDragger.onend = this._onNumberDraggerEnd.bind(this);
                    this.elem = this._toplevel;
                    visibleRAF(this._canvas, this._redraw.bind(this));
                }
                CodeEditor.prototype._setNeedsRecalculate = function () {
                    this._needsRecalculate = true;
                };
                CodeEditor.prototype._setValueChanged = function () {
                    this._valueChanged = true;
                };
                // Sets a chunk of text at the beginning and end that the user cannot modify.
                CodeEditor.prototype.setPrefixSuffix = function (prefix, suffix) {
                    this._prefix = prefix;
                    this._suffix = suffix;
                    this._setNeedsRecalculate();
                };
                CodeEditor.prototype.setFontSize = function (size) {
                    this._textarea.style.fontSize = size;
                    this._setNeedsRecalculate();
                };
                CodeEditor.prototype.setLineFlairs = function (lineFlairs) {
                    this._lineFlairs = lineFlairs;
                };
                // Sets the size. The height here is actually a minimum height. Since we don't
                // yet have scrolling, the Editor always expands to fill however many lines it
                // takes up...
                CodeEditor.prototype.setSize = function (w, h) {
                    if (h !== undefined)
                        this._minHeight = h;
                    if (w !== undefined) {
                        this._width = w;
                        this._canvas.style.width = w + "px";
                        this._toplevel.style.width = w + "px";
                        // Calculate cols immediately.
                        this._cols = this._xyToRowCol(w, 0).col;
                        this._textarea.style.width = this._cols + "ch";
                    }
                    if (w !== undefined || h !== undefined)
                        this._setNeedsRecalculate();
                };
                CodeEditor.prototype.getValue = function () {
                    return this._textarea.value;
                };
                CodeEditor.prototype.setValue = function (t) {
                    this._textarea.value = t;
                    this._setValueChanged();
                    this._setNeedsRecalculate();
                };
                CodeEditor.prototype.getFullText = function () {
                    return this._prefix + this._textarea.value + this._suffix;
                };
                CodeEditor.prototype._isLineLocked = function (line) {
                    if (line.lineno < this._prefixLines)
                        return true;
                    if (line.lineno >= this._suffixLines)
                        return true;
                    return false;
                };
                CodeEditor.prototype._recalculate = function () {
                    if (!this._needsRecalculate)
                        return;
                    // If we aren't attached to a parent node, recalculating is futile...
                    if (!this._toplevel.parentNode)
                        return;
                    // Recalculate our line model.
                    var chars = this.getFullText() + '\n';
                    var lineModel = [];
                    var idx = 0, row = 0, lineno = 0;
                    while (true) {
                        var newIdx = chars.indexOf('\n', idx);
                        if (newIdx < 0)
                            break;
                        var start = idx, end = newIdx + 1;
                        var length_1 = end - start - 1;
                        var startRow = row;
                        var rows = Math.max(Math.ceil(length_1 / this._cols), 1);
                        lineModel.push({ start: start, end: end, length: length_1, rows: rows, startRow: startRow, lineno: lineno });
                        row += rows;
                        lineno++;
                        idx = end;
                    }
                    this._lineModel = lineModel;
                    this._prefixLines = this._prefix.split('\n').length - 1;
                    this._suffixLines = this._lineModel.length - (this._suffix.split('\n').length - 1);
                    // Compute syntax highlights.
                    var syntaxRuns = [];
                    var draggableNumbers = [];
                    var match;
                    // Colors taken from the railscasts color scheme.
                    var keywords = (/\b(function|for|while|if|else|break|continue|in|out|attribute|uniform|varying|return|struct|layout|precision|mediump|lowp|highp|discard)\b/g);
                    while ((match = keywords.exec(chars)) !== null)
                        syntaxRuns.push({ start: match.index, end: match.index + match[0].length, color: '#c26230' });
                    var types = (/\b(void|bool|float|[ui]?vec[234]|mat[234]|mat[234]x[234]|[u]?int|sampler[23]D)\b/g);
                    while ((match = types.exec(chars)) !== null)
                        syntaxRuns.push({ start: match.index, end: match.index + match[0].length, color: '#6d9cbe' });
                    var numbers = (/\W-?\d+(\.\d+)?\b/g); // Don't bother supporting scientific notation on numbers...
                    while ((match = numbers.exec(chars)) !== null) {
                        syntaxRuns.push({ start: match.index + 1, end: match.index + match[0].length, color: '#a5c261' });
                        draggableNumbers.push({ start: match.index + 1, end: match.index + match[0].length });
                    }
                    var strings = (/("[^"]*")|('[^']*')/g);
                    while ((match = strings.exec(chars)) !== null)
                        syntaxRuns.push({ start: match.index, end: match.index + match[0].length, color: '#6d9cbe' });
                    var comments = (/\/\/.*$/gm);
                    while ((match = comments.exec(chars)) !== null)
                        syntaxRuns.push({ start: match.index, end: match.index + match[0].length, color: '#bc9458', style: 'italic' });
                    syntaxRuns.sort(function (a, b) { return a.start - b.start; });
                    this._syntaxRuns = syntaxRuns;
                    this._draggableNumbers = draggableNumbers;
                    var textareaStyle = this._document.defaultView.getComputedStyle(this._textarea);
                    this._textareaStyle = textareaStyle;
                    var ctx = this._canvas.getContext('2d');
                    ctx.font = textareaStyle.fontSize + " " + textareaStyle.fontFamily;
                    // We're using a monospace font. It should have identical metrics for all characters,
                    // so just measuring one should be fine...
                    this._charWidth = ctx.measureText(' ').width;
                    var rowHeight = textareaStyle.lineHeight;
                    var rowHeightN;
                    // XXX: This seems to be a Chrome default for the line-height? Not sure how else I can
                    // calculate this guy... grr...
                    if (rowHeight === 'normal')
                        rowHeightN = 1.3 * parseFloat(textareaStyle.fontSize);
                    else
                        rowHeightN = parseFloat(rowHeight);
                    this._rowHeight = Math.ceil(rowHeightN);
                    if (this._charMarginTop === undefined) {
                        var stdMargin = 4;
                        this._charMarginTop = stdMargin - expensiveMeasureTextMargin(this._document, this._charWidth, this._rowHeight, ctx.font);
                    }
                    // Recalculate geometry.
                    var numLines = this._lineModel.length;
                    var gutterChars = ('' + numLines).length;
                    this._gutterMargin = 10;
                    this._gutterWidth = this._charWidth * Math.max(gutterChars, 2) + this._gutterMargin * 2;
                    this._textMargin = 10;
                    var lastRow = this._lineModel[this._lineModel.length - 1];
                    var numRows = lastRow.startRow + lastRow.rows - 1;
                    var newHeight = Math.ceil(Math.max(this._minHeight, this._rowHeight * (numRows + this._paddingTop + this._paddingBottom)));
                    if (newHeight !== this._height) {
                        this._height = newHeight;
                        this._canvas.style.height = this._height + "px";
                        this._toplevel.style.height = this._height + "px";
                        // Resize the textarea so the window doesn't scroll back in when we click on it...
                        this._textarea.style.height = (this._height - this._rowHeight) + 'px';
                    }
                    this._needsRecalculate = false;
                    this._recalculateMouseIdx();
                    if (this._valueChanged && this.onvaluechanged)
                        this.onvaluechanged();
                    this._valueChanged = false;
                };
                CodeEditor.prototype._recalculateMouseIdx = function () {
                    if (this._mouseX === undefined || this._mouseY === undefined) {
                        this._mouseIdx = undefined;
                    }
                    else {
                        var _a = this._xyToRowCol(this._mouseX, this._mouseY), row = _a.row, col = _a.col;
                        var _b = this._rowColToLineIdx(row, col, false), line = _b.line, idx = _b.idx;
                        var isLineLocked = this._isLineLocked(line);
                        this._mouseIdx = isLineLocked ? undefined : idx;
                    }
                };
                CodeEditor.prototype._calculateIndentedLineStart = function (line) {
                    var chars = this.getFullText();
                    var idx = line.start;
                    while (chars.charAt(idx) === ' ' && idx <= line.end)
                        idx++;
                    return idx;
                };
                CodeEditor.prototype._onInput = function () {
                    this._setValueChanged();
                    this._setNeedsRecalculate();
                };
                CodeEditor.prototype._onKeyDown = function (e) {
                    if (e.key === 'Tab' && !e.shiftKey) {
                        // XXX: If we have a selection, then indent the selection.
                        if (!this._hasSelection()) {
                            this._insertAtCursor('    ');
                        }
                        e.preventDefault();
                    }
                    else if (e.key === 'Tab' && e.shiftKey) {
                        // XXX: If we have a selection, then unindent the selection.
                        e.preventDefault();
                    }
                    else if (e.key === 'Home') {
                        // Move to the start of indentation.
                        var cursorIdx = this._getCursorIdx();
                        var _a = this._getCharPos(cursorIdx), line = _a.line, lineIdx = _a.lineIdx;
                        var indentedIdx = this._calculateIndentedLineStart(line);
                        if (cursorIdx !== indentedIdx) {
                            if (e.shiftKey) {
                                var _b = __read(this._getSelection(), 1), selectionPoint = _b[0];
                                this._setSelection(this._idxToTextarea(selectionPoint), this._idxToTextarea(indentedIdx));
                            }
                            else {
                                this._setCursor(this._idxToTextarea(indentedIdx));
                            }
                            e.preventDefault();
                        }
                    }
                };
                CodeEditor.prototype._onMouseDown = function (e) {
                    e.preventDefault();
                    var _a = this._xyToRowCol(e.offsetX, e.offsetY), row = _a.row, col = _a.col;
                    var line = this._rowColToLineIdx(row, 0, true).line;
                    if (this._isLineLocked(line)) {
                        this._textarea.blur();
                    }
                    else if (col === -1) {
                        this._setSelection(this._idxToTextarea(line.start), this._idxToTextarea(line.end));
                        this._textarea.focus();
                    }
                    else {
                        var idx = this._rowColToLineIdx(row, col, true).idx;
                        this._textarea.focus();
                        this._dragStartX = e.clientX;
                        this._dragStartY = e.clientY;
                        var exactIdx = this._rowColToLineIdx(row, col, false).idx;
                        var draggableNumber = this._findDraggableNumber(exactIdx);
                        if (!e.shiftKey && draggableNumber) {
                            var start = this._idxToTextarea(draggableNumber.start);
                            var end = this._idxToTextarea(draggableNumber.end);
                            var value = +this.getValue().slice(start, end);
                            this._draggingNumber = { start: start, end: end, value: value };
                            this._syncNumberDraggerPosition();
                            this._setCursor(this._idxToTextarea(idx));
                            this._numberDragger.show(value, e);
                        }
                        else {
                            if (e.shiftKey) {
                                // If we don't have a selection, start a new one where the cursor is...
                                // If we have an existing selection, just keep the current dragStartIdx,
                                // since it's still valid.
                                if (!this._hasSelection())
                                    this._dragStartIdx = this._textarea.selectionStart;
                                this._setSelection(this._dragStartIdx, this._idxToTextarea(idx));
                            }
                            else {
                                this._dragStartIdx = this._idxToTextarea(idx);
                                this._setCursor(this._dragStartIdx);
                            }
                            this._dragging = 'selection';
                            this._document.documentElement.addEventListener('mousemove', this._onMouseMove, { capture: true });
                            this._document.documentElement.addEventListener('mouseup', this._onMouseUp);
                        }
                    }
                };
                CodeEditor.prototype._onMouseUp = function (e) {
                    this._dragging = undefined;
                    this._document.documentElement.removeEventListener('mousemove', this._onMouseMove, { capture: true });
                    this._document.documentElement.removeEventListener('mouseup', this._onMouseUp);
                };
                CodeEditor.prototype._onMouseMove = function (e) {
                    e.stopPropagation();
                    this._mouseX = e.offsetX;
                    this._mouseY = e.offsetY;
                    this._recalculateMouseIdx();
                    var _a = this._xyToRowCol(this._mouseX, this._mouseY), row = _a.row, col = _a.col;
                    var _b = this._rowColToLineIdx(row, col, true), line = _b.line, idx = _b.idx;
                    if (this._dragging === 'selection') {
                        this._setSelection(this._dragStartIdx, this._idxToTextarea(idx));
                        this._textarea.focus();
                    }
                    var _c = this._rowColToLineIdx(row, col, false), exactLine = _c.line, exactIdx = _c.idx;
                    var isLineLocked = this._isLineLocked(line);
                    // Dragging takes priority.
                    var cursor;
                    if (this._dragging === 'selection') {
                        cursor = 'text';
                    }
                    else if (col === -1 || isLineLocked) {
                        cursor = 'default';
                    }
                    else if (!e.shiftKey && this._findDraggableNumber(exactIdx)) {
                        cursor = 'e-resize';
                    }
                    else {
                        cursor = 'text';
                    }
                    this._canvas.style.cursor = cursor;
                    if (this._dragging)
                        this._cursorOverride.setCursor(this, cursor);
                    else
                        this._cursorOverride.setCursor(this, '');
                };
                CodeEditor.prototype._onMouseLeave = function (e) {
                    this._mouseX = undefined;
                    this._mouseY = undefined;
                    this._mouseIdx = undefined;
                };
                CodeEditor.prototype._onNumberDraggerValue = function (newValue) {
                    this._textarea.blur();
                    var _a = this._draggingNumber, start = _a.start, end = _a.end;
                    var newValueString = formatDecimal(newValue);
                    this.setValue(this._spliceValue(start, end, newValueString));
                    this._draggingNumber.end = this._draggingNumber.start + newValueString.length;
                    this._syncNumberDraggerPosition();
                };
                CodeEditor.prototype._onNumberDraggerEnd = function () {
                    this._draggingNumber = null;
                };
                CodeEditor.prototype._syncNumberDraggerPosition = function () {
                    var _a = this._draggingNumber, start = _a.start, end = _a.end;
                    var endPos = this._getCharPos(this._textareaToIdx(end));
                    var _b = this._rowColToXY(endPos.row, endPos.col), x = _b.x, y = _b.y;
                    var bbox = this._toplevel.getBoundingClientRect();
                    var absX = bbox.left + x;
                    var absY = bbox.top + y + this._rowHeight / 2 + this._document.defaultView.scrollY;
                    this._numberDragger.setPosition(absX, absY);
                };
                CodeEditor.prototype._spliceValue = function (start, end, v) {
                    var chars = this.getValue();
                    return chars.slice(0, start) + v + chars.slice(end);
                };
                CodeEditor.prototype._findDraggableNumber = function (idx) {
                    this._recalculate();
                    return this._draggableNumbers.find(function (_a) {
                        var start = _a.start, end = _a.end;
                        return idx >= start && idx <= end;
                    });
                };
                CodeEditor.prototype._idxToTextarea = function (idx) {
                    return idx - this._prefix.length;
                };
                CodeEditor.prototype._textareaToIdx = function (idx) {
                    return idx + this._prefix.length;
                };
                CodeEditor.prototype._rowColToLineIdx = function (row, col, clampIdx) {
                    this._recalculate();
                    var line;
                    try {
                        for (var _a = __values(this._lineModel), _b = _a.next(); !_b.done; _b = _a.next()) {
                            line = _b.value;
                            if (row >= line.startRow && row < line.startRow + line.rows)
                                break;
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    var lineIdx;
                    // Fast path.
                    if (line.rows === 1) {
                        lineIdx = col;
                    }
                    else {
                        lineIdx = (row - line.startRow) * this._cols + col;
                    }
                    var idx;
                    if (clampIdx)
                        idx = line.start + Math.min(Math.max(lineIdx, 0), line.length);
                    else if (lineIdx > line.length)
                        idx = -1;
                    else
                        idx = line.start + lineIdx;
                    return { line: line, idx: idx };
                    var e_3, _c;
                };
                CodeEditor.prototype._xyToRowCol = function (x, y) {
                    this._recalculate();
                    y -= this._paddingTop * this._rowHeight;
                    var row = Math.floor(y / this._rowHeight);
                    var col;
                    if (x < this._gutterWidth)
                        col = -1;
                    x -= this._gutterWidth;
                    if (col === undefined && x < this._textMargin)
                        col = 0;
                    x -= this._textMargin;
                    if (col === undefined)
                        col = Math.round(x / this._charWidth);
                    return { row: row, col: col };
                };
                CodeEditor.prototype._rowColToXY = function (row, col) {
                    var x = this._gutterWidth + this._textMargin + col * this._charWidth;
                    var y = (this._paddingTop + row) * this._rowHeight;
                    return { x: x, y: y };
                };
                CodeEditor.prototype._getRowLength = function (row) {
                    this._recalculate();
                    var line;
                    try {
                        for (var _a = __values(this._lineModel), _b = _a.next(); !_b.done; _b = _a.next()) {
                            line = _b.value;
                            if (row >= line.startRow && row < line.startRow + line.rows)
                                break;
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                    // Fast path.
                    if (line.rows === 1)
                        return line.length;
                    if (row === line.startRow + line.rows - 1)
                        return line.length % this._cols;
                    else
                        return this._cols;
                    var e_4, _c;
                };
                CodeEditor.prototype._getCharPos = function (idx) {
                    this._recalculate();
                    var line;
                    try {
                        for (var _a = __values(this._lineModel), _b = _a.next(); !_b.done; _b = _a.next()) {
                            line = _b.value;
                            if (idx >= line.start && idx < line.end)
                                break;
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                    var lineIdx = idx - line.start;
                    // Fast path.
                    if (line.rows === 1)
                        return { line: line, lineIdx: lineIdx, row: line.startRow, col: lineIdx };
                    // Slow path.
                    var col = lineIdx % this._cols;
                    var row = line.startRow + Math.min((lineIdx / this._cols) | 0, line.rows);
                    return { line: line, lineIdx: lineIdx, row: row, col: col };
                    var e_5, _c;
                };
                CodeEditor.prototype._hasSelection = function () {
                    return this._textarea.selectionStart !== this._textarea.selectionEnd;
                };
                CodeEditor.prototype._getSelection = function () {
                    var selStartIdx = this._textareaToIdx(this._textarea.selectionStart);
                    var selEndIdx = this._textareaToIdx(this._textarea.selectionEnd);
                    // [selectionStart, cursor]
                    if (this._textarea.selectionDirection === 'forward')
                        return [selStartIdx, selEndIdx];
                    else
                        return [selEndIdx, selStartIdx];
                };
                CodeEditor.prototype._getCursorIdx = function () {
                    var _a = __read(this._getSelection(), 2), selectionPointIdx = _a[0], cursorIdx = _a[1];
                    return cursorIdx;
                };
                CodeEditor.prototype._setSelection = function (a, b) {
                    // The selection starts at "a" and ends with the cursor position being at "b".
                    var start = Math.min(a, b), end = Math.max(a, b);
                    var direction = a < b ? 'forward' : 'backward';
                    this._textarea.setSelectionRange(start, end, direction);
                };
                CodeEditor.prototype._setCursor = function (a) {
                    this._textarea.setSelectionRange(a, a);
                };
                CodeEditor.prototype._insertAtCursor = function (s) {
                    this._textarea.focus();
                    if (!this._document.execCommand('insertText', false, s)) {
                        // execCommand failed. Fall back to setting value manually. This happens in Firefox:
                        // https://github.com/w3c/editing/issues/160
                        // https://bugzilla.mozilla.org/show_bug.cgi?id=1220696
                        // On modern Firefox versions, it will also wipe the undo buffer unfortunately.
                        // The """web platform"" is a piece of trash and I don't like it.
                        var value = this._textarea.value;
                        var selStart = this._textarea.selectionStart;
                        var selEnd = this._textarea.selectionEnd;
                        this._textarea.value = value.slice(0, selStart) + s + value.slice(selEnd);
                        this._textarea.focus();
                    }
                    this._setValueChanged();
                    this._setNeedsRecalculate();
                };
                CodeEditor.prototype._redraw = function (t) {
                    var _this = this;
                    var hasFocus = this._textarea.matches(':focus');
                    // Skip redrawing if we're up to date to cut down on costs...
                    if (!this._needsRecalculate && !hasFocus)
                        return;
                    this._recalculate();
                    var canvasRect = this._canvas.getBoundingClientRect();
                    var ratio = this._document.defaultView.devicePixelRatio;
                    var canvasWidth = this._width * ratio;
                    var canvasHeight = this._height * ratio;
                    var sizeChanged = false;
                    if (this._canvas.width !== canvasWidth || this._canvas.height !== canvasHeight) {
                        this._canvas.width = canvasWidth;
                        this._canvas.height = canvasHeight;
                        sizeChanged = true;
                    }
                    // Clip to viewport.
                    var scissorX1 = Math.max(0, canvasRect.left);
                    var scissorY1 = Math.max(0, canvasRect.top);
                    var viewportWidth = this._document.defaultView.innerWidth;
                    var viewportHeight = this._document.defaultView.innerHeight;
                    var scissorX2 = Math.min(viewportWidth, canvasRect.right);
                    var scissorY2 = Math.min(viewportHeight, canvasRect.bottom);
                    // Put in canvas space.
                    var clipRectX = scissorX1 - canvasRect.left;
                    var clipRectY = scissorY1 - canvasRect.top;
                    var clipRectW = scissorX2 - scissorX1;
                    var clipRectH = scissorY2 - scissorY1;
                    var ctx = this._canvas.getContext('2d');
                    ctx.save();
                    if (!sizeChanged) {
                        ctx.rect(clipRectX, clipRectY, clipRectW, clipRectH);
                        ctx.clip();
                    }
                    ctx.scale(ratio, ratio);
                    var bgcolor = '#232323';
                    ctx.fillStyle = bgcolor;
                    ctx.fillRect(0, 0, this._width, this._height);
                    if (hasFocus) {
                        // Has a cursor.
                        var cursorPosition = this._idxToTextarea(this._getCursorIdx());
                        if (this._redraw_cursorPosition !== cursorPosition) {
                            this._redraw_cursorPosition = cursorPosition;
                            // Set it blinking again.
                            this._redraw_cursorBlinkStart = t;
                        }
                    }
                    else {
                        this._redraw_cursorPosition = undefined;
                    }
                    var textareaStyleFontSize = this._textareaStyle.fontSize;
                    var textareaStyleFontFamily = this._textareaStyle.fontFamily;
                    ctx.font = textareaStyleFontSize + " " + textareaStyleFontFamily;
                    var drawFlair = function (line, flair) {
                        var y = (_this._paddingTop + line.startRow) * _this._rowHeight;
                        var height = line.rows * _this._rowHeight;
                        ctx.fillStyle = flair.color;
                        ctx.fillRect(0, y, _this._canvas.width, _this._rowHeight);
                    };
                    if (this._redraw_cursorPosition) {
                        var line = this._getCharPos(this._textareaToIdx(this._redraw_cursorPosition)).line;
                        drawFlair(line, { color: '#2f2a34', lineno: -1 });
                    }
                    if (this._lineFlairs) {
                        try {
                            for (var _a = __values(this._lineFlairs), _b = _a.next(); !_b.done; _b = _a.next()) {
                                var flair = _b.value;
                                var line = this._lineModel[flair.lineno];
                                if (!line)
                                    continue;
                                drawFlair(line, flair);
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                    }
                    // Gutter
                    ctx.save();
                    ctx.fillStyle = '#445';
                    ctx.fillRect(0, 0, this._gutterWidth, this._canvas.height);
                    ctx.restore();
                    // Gutter text.
                    for (var i = 0; i < this._lineModel.length; i++) {
                        var line = this._lineModel[i];
                        var no = line.lineno + 1;
                        var y = (this._paddingTop + line.startRow) * this._rowHeight;
                        ctx.fillStyle = this._isLineLocked(line) ? '#888' : '#ccc';
                        ctx.textBaseline = 'top';
                        ctx.textAlign = 'right';
                        var noString = '' + no;
                        ctx.fillText(noString, this._gutterWidth - this._gutterMargin, this._charMarginTop + y);
                    }
                    // Add a newline at the end to make paint logic simpler.
                    var chars = this.getFullText() + '\n';
                    ctx.save();
                    ctx.translate(this._gutterWidth + this._textMargin, 0);
                    if (this._hasSelection()) {
                        // Draw selection bounds.
                        var inSelection = false;
                        var startPos = this._getCharPos(this._textareaToIdx(this._textarea.selectionStart));
                        var endPos = this._getCharPos(this._textareaToIdx(this._textarea.selectionEnd));
                        for (var row = startPos.row; row <= endPos.row; row++) {
                            var colStart = (row === startPos.row) ? startPos.col : 0;
                            var colEnd = (row === endPos.row) ? endPos.col : this._getRowLength(row);
                            var selectionColor = hasFocus ? '#336' : '#333';
                            var startX = colStart * this._charWidth;
                            var endX = colEnd * this._charWidth;
                            var y = (this._paddingTop + row) * this._rowHeight;
                            ctx.fillStyle = selectionColor;
                            ctx.fillRect(startX, y, endX - startX, this._rowHeight);
                        }
                    }
                    var syntaxRuns = this._syntaxRuns;
                    var currentSyntaxRun = 0;
                    // Anything interesting under the mouse?
                    var draggableNumber;
                    if (this._draggingNumber) {
                        var _d = this._draggingNumber, start = _d.start, end = _d.end;
                        draggableNumber = { start: this._textareaToIdx(start), end: this._textareaToIdx(end) };
                    }
                    else if (!this._dragging && this._mouseIdx > -1) {
                        draggableNumber = this._findDraggableNumber(this._mouseIdx);
                    }
                    // Setting the font on a CanvasRenderingContext2D in Firefox is expensive, so try
                    // to set it as little as possible by only setting it when it changes.
                    var currentFont;
                    // Now for the actual paint.
                    for (var m = 0; m < this._lineModel.length; m++) {
                        var line = this._lineModel[m];
                        var row = line.startRow, col = 0;
                        for (var i = line.start; i < line.end; i++) {
                            if (col === this._cols && (row - line.startRow) < line.rows - 1) {
                                row++;
                                col = 0;
                            }
                            // XXX: Use something else other than charAt for Unicode compliance.
                            var char = chars.charAt(i);
                            var x = col * this._charWidth, y = (this._paddingTop + row) * this._rowHeight;
                            if (i === this._textareaToIdx(this._redraw_cursorPosition)) {
                                // Draw cursor.
                                ctx.save();
                                ctx.fillStyle = '#fff';
                                var blinkAnimationT = (t - this._redraw_cursorBlinkStart) / 1000;
                                var blinkAlpha = (Math.sin(blinkAnimationT * 6) + 1);
                                ctx.globalAlpha = blinkAlpha;
                                ctx.fillRect(Math.floor(x), y, 2, this._rowHeight);
                                ctx.restore();
                            }
                            if (char === '\n')
                                break;
                            if (draggableNumber !== undefined && i >= draggableNumber.start && i < draggableNumber.end) {
                                ctx.save();
                                ctx.beginPath();
                                ctx.moveTo(x | 0, y + this._rowHeight);
                                ctx.lineTo((x + this._charWidth) | 0, y + this._rowHeight);
                                ctx.setLineDash([1, 1]);
                                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                                ctx.lineWidth = 1;
                                ctx.stroke();
                                ctx.restore();
                            }
                            var color = '#e6e1dc';
                            var style = '';
                            while (currentSyntaxRun < syntaxRuns.length && i >= syntaxRuns[currentSyntaxRun].end)
                                currentSyntaxRun++;
                            if (currentSyntaxRun < syntaxRuns.length) {
                                var run = syntaxRuns[currentSyntaxRun];
                                if (i >= run.start && i < run.end) {
                                    if (run.color)
                                        color = run.color;
                                    if (run.style)
                                        style = run.style;
                                }
                            }
                            if (this._isLineLocked(line)) {
                                color = colorLerp(color, colorGrayscale(color), 0.75);
                            }
                            ctx.textBaseline = 'top';
                            ctx.textAlign = 'left';
                            ctx.fillStyle = color;
                            var newFont = style + " " + textareaStyleFontSize + " " + textareaStyleFontFamily;
                            if (currentFont !== newFont) {
                                ctx.font = newFont;
                                currentFont = newFont;
                            }
                            ctx.fillText(char, x, y + this._charMarginTop);
                            col++;
                        }
                    }
                    ctx.restore();
                    ctx.restore();
                    var e_6, _c;
                };
                return CodeEditor;
            }());
            exports_4("default", CodeEditor);
        }
    };
});
System.register("endian", ["ArrayBufferSlice"], function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    function isLittleEndian() {
        return _isLittle;
    }
    exports_5("isLittleEndian", isLittleEndian);
    function bswap16(m) {
        var a = m.createTypedArray(Uint8Array);
        var o = new Uint8Array(a.byteLength);
        for (var i = 0; i < a.byteLength; i += 2) {
            o[i + 0] = a[i + 1];
            o[i + 1] = a[i + 0];
        }
        return new ArrayBufferSlice_2.default(o.buffer);
    }
    function bswap32(m) {
        var a = m.createTypedArray(Uint8Array);
        var o = new Uint8Array(a.byteLength);
        for (var i = 0; i < a.byteLength; i += 4) {
            o[i + 0] = a[i + 3];
            o[i + 1] = a[i + 2];
            o[i + 2] = a[i + 1];
            o[i + 3] = a[i + 0];
        }
        return new ArrayBufferSlice_2.default(o.buffer);
    }
    function be16toh(m) {
        if (isLittleEndian())
            return bswap16(m);
        else
            return m;
    }
    function le16toh(m) {
        if (!isLittleEndian())
            return bswap16(m);
        else
            return m;
    }
    function be32toh(m) {
        if (isLittleEndian())
            return bswap32(m);
        else
            return m;
    }
    function le32toh(m) {
        if (!isLittleEndian())
            return bswap32(m);
        else
            return m;
    }
    function betoh(m, componentSize) {
        switch (componentSize) {
            case 1:
                return m;
            case 2:
                return be16toh(m);
            case 4:
                return be32toh(m);
        }
    }
    exports_5("betoh", betoh);
    var ArrayBufferSlice_2, _test, _testView, _isLittle;
    return {
        setters: [
            function (ArrayBufferSlice_2_1) {
                ArrayBufferSlice_2 = ArrayBufferSlice_2_1;
            }
        ],
        execute: function () {
            _test = new Uint16Array([0xFEFF]);
            _testView = new DataView(_test.buffer);
            _isLittle = _testView.getUint8(0) == 0xFF;
        }
    };
});
System.register("lz77", ["ArrayBufferSlice"], function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    // Nintendo DS LZ77 format.
    // LZ10:
    // Header (4 bytes):
    //   Magic: "\x10" (1 byte)
    //   Uncompressed size (3 bytes, little endian)
    // Data:
    //   Flags (1 byte)
    //   For each bit in the flags byte, from MSB to LSB:
    //     If flag is 1:
    //       LZ77 (2 bytes, big endian):
    //         Length: bits 0-3
    //         Offset: bits 4-15
    //         Copy Length+3 bytes from Offset back in the output buffer.
    //     If flag is 0:
    //       Literal: copy one byte from src to dest.
    function decompressLZ10(srcView) {
        var uncompressedSize = srcView.getUint32(0x00, true) >> 8;
        var dstBuffer = new Uint8Array(uncompressedSize);
        var srcOffs = 0x04;
        var dstOffs = 0x00;
        while (true) {
            var commandByte = srcView.getUint8(srcOffs++);
            var i = 8;
            while (i--) {
                if (commandByte & (1 << i)) {
                    var tmp = srcView.getUint16(srcOffs, false);
                    srcOffs += 2;
                    var windowOffset = (tmp & 0x0FFF) + 1;
                    var windowLength = (tmp >> 12) + 3;
                    var copyOffs = dstOffs - windowOffset;
                    uncompressedSize -= windowLength;
                    while (windowLength--)
                        dstBuffer[dstOffs++] = dstBuffer[copyOffs++];
                }
                else {
                    // Literal.
                    uncompressedSize--;
                    dstBuffer[dstOffs++] = srcView.getUint8(srcOffs++);
                }
                if (uncompressedSize <= 0)
                    return new ArrayBufferSlice_3.default(dstBuffer.buffer);
            }
        }
    }
    exports_6("decompressLZ10", decompressLZ10);
    // LZ11:
    // Header (4 bytes):
    //   Magic: "\x11" (1 byte)
    //   Uncompressed size (3 bytes, little endian)
    // Data:
    //   Flags (1 byte)
    //   For each bit in the flags byte, from MSB to LSB:
    //     If flag is 1:
    //       Fancy LZ77. See below for more details. Flag switches on 4-7 of newly read byte.
    //     If flag is 0:
    //       Literal: copy one byte from src to dest.
    function decompressLZ11(srcView) {
        var uncompressedSize = srcView.getUint32(0x00, true) >> 8;
        var dstBuffer = new Uint8Array(uncompressedSize);
        var srcOffs = 0x04;
        var dstOffs = 0x00;
        while (true) {
            var commandByte = srcView.getUint8(srcOffs++);
            var i = 8;
            while (i--) {
                if (commandByte & (1 << i)) {
                    var tmp = srcView.getUint32(srcOffs, false);
                    var windowOffset = void 0;
                    var windowLength = void 0;
                    var indicator = (tmp >>> 28);
                    if (indicator > 1) {
                        // Two bytes. AB CD xx xx
                        // Length: A + 1
                        // Offset: BCD + 1
                        windowLength = indicator + 1;
                        windowOffset = ((tmp >>> 16) & 0x0FFF) + 1;
                    }
                    else if (indicator === 0) {
                        // Three bytes: AB CD EF xx
                        // Length: BC + 0x11
                        // Offset: DEF + 1
                        windowLength = (tmp >>> 20) + 0x11;
                        windowOffset = ((tmp >>> 8) & 0x0FFF) + 1;
                        srcOffs += 3;
                    }
                    else if (indicator === 1) {
                        // Four bytes. AB CD EF GH
                        // Length: BCDE + 0x11
                        // Offset: FGH + 1
                        windowLength = ((tmp >>> 12) & 0xFFFF) + 0x111;
                        windowOffset = (tmp & 0x0FFF) + 1;
                        srcOffs += 4;
                    }
                    var copyOffs = dstOffs - windowOffset;
                    uncompressedSize -= windowLength;
                    while (windowLength--)
                        dstBuffer[dstOffs++] = dstBuffer[copyOffs++];
                }
                else {
                    // Literal.
                    uncompressedSize--;
                    dstBuffer[dstOffs++] = srcView.getUint8(srcOffs++);
                }
                if (uncompressedSize <= 0)
                    return new ArrayBufferSlice_3.default(dstBuffer.buffer);
            }
        }
    }
    exports_6("decompressLZ11", decompressLZ11);
    function decompress(srcBuffer) {
        var srcView = srcBuffer.createDataView();
        var magic = srcView.getUint8(0x00);
        if (magic === 0x10)
            return decompressLZ10(srcView);
        else if (magic === 0x11)
            return decompressLZ11(srcView);
        else
            throw new Error("Not Nintendo LZ77");
    }
    exports_6("decompress", decompress);
    var ArrayBufferSlice_3;
    return {
        setters: [
            function (ArrayBufferSlice_3_1) {
                ArrayBufferSlice_3 = ArrayBufferSlice_3_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("render", ["gl-matrix", "util", "CodeEditor"], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    function compileShader(gl, str, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (DEBUG && !gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(str);
            if (gl.getExtension('WEBGL_debug_shaders'))
                console.error(gl.getExtension('WEBGL_debug_shaders').getTranslatedShaderSource(shader));
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    function pushAndReturn(a, v) {
        a.push(v);
        return v;
    }
    function coalesceBuffer(gl, target, datas) {
        var dataLength = 0;
        try {
            for (var datas_1 = __values(datas), datas_1_1 = datas_1.next(); !datas_1_1.done; datas_1_1 = datas_1.next()) {
                var data = datas_1_1.value;
                dataLength += data.byteLength;
                dataLength = util_2.align(dataLength, 4);
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (datas_1_1 && !datas_1_1.done && (_a = datas_1.return)) _a.call(datas_1);
            }
            finally { if (e_7) throw e_7.error; }
        }
        var buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, dataLength, gl.STATIC_DRAW);
        var coalescedBuffers = [];
        var offset = 0;
        try {
            for (var datas_2 = __values(datas), datas_2_1 = datas_2.next(); !datas_2_1.done; datas_2_1 = datas_2.next()) {
                var data = datas_2_1.value;
                var size = data.byteLength;
                coalescedBuffers.push({ buffer: buffer, offset: offset });
                gl.bufferSubData(target, offset, data.createTypedArray(Uint8Array));
                offset += size;
                offset = util_2.align(offset, 4);
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (datas_2_1 && !datas_2_1.done && (_b = datas_2.return)) _b.call(datas_2);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return coalescedBuffers;
        var e_7, _a, e_8, _b;
    }
    exports_7("coalesceBuffer", coalesceBuffer);
    var gl_matrix_1, util_2, CodeEditor_1, CompareMode, FrontFaceMode, CullMode, BlendFactor, BlendMode, RenderFlags, RenderTarget, RealOnscreenRenderTarget, DEBUG, Program, ProgramCache, RenderArena, BufferCoalescer, FullscreenProgram, FullscreenCopyProgram, RenderState;
    return {
        setters: [
            function (gl_matrix_1_1) {
                gl_matrix_1 = gl_matrix_1_1;
            },
            function (util_2_1) {
                util_2 = util_2_1;
            },
            function (CodeEditor_1_1) {
                CodeEditor_1 = CodeEditor_1_1;
            }
        ],
        execute: function () {
            (function (CompareMode) {
                CompareMode[CompareMode["NEVER"] = WebGLRenderingContext.NEVER] = "NEVER";
                CompareMode[CompareMode["LESS"] = WebGLRenderingContext.LESS] = "LESS";
                CompareMode[CompareMode["EQUAL"] = WebGLRenderingContext.EQUAL] = "EQUAL";
                CompareMode[CompareMode["LEQUAL"] = WebGLRenderingContext.LEQUAL] = "LEQUAL";
                CompareMode[CompareMode["GREATER"] = WebGLRenderingContext.GREATER] = "GREATER";
                CompareMode[CompareMode["NEQUAL"] = WebGLRenderingContext.NOTEQUAL] = "NEQUAL";
                CompareMode[CompareMode["GEQUAL"] = WebGLRenderingContext.GEQUAL] = "GEQUAL";
                CompareMode[CompareMode["ALWAYS"] = WebGLRenderingContext.ALWAYS] = "ALWAYS";
            })(CompareMode || (CompareMode = {}));
            exports_7("CompareMode", CompareMode);
            (function (FrontFaceMode) {
                FrontFaceMode[FrontFaceMode["CCW"] = WebGLRenderingContext.CCW] = "CCW";
                FrontFaceMode[FrontFaceMode["CW"] = WebGLRenderingContext.CW] = "CW";
            })(FrontFaceMode || (FrontFaceMode = {}));
            exports_7("FrontFaceMode", FrontFaceMode);
            (function (CullMode) {
                CullMode[CullMode["NONE"] = 0] = "NONE";
                CullMode[CullMode["FRONT"] = 1] = "FRONT";
                CullMode[CullMode["BACK"] = 2] = "BACK";
                CullMode[CullMode["FRONT_AND_BACK"] = 3] = "FRONT_AND_BACK";
            })(CullMode || (CullMode = {}));
            exports_7("CullMode", CullMode);
            (function (BlendFactor) {
                BlendFactor[BlendFactor["ZERO"] = WebGLRenderingContext.ZERO] = "ZERO";
                BlendFactor[BlendFactor["ONE"] = WebGLRenderingContext.ONE] = "ONE";
                BlendFactor[BlendFactor["SRC_COLOR"] = WebGLRenderingContext.SRC_COLOR] = "SRC_COLOR";
                BlendFactor[BlendFactor["ONE_MINUS_SRC_COLOR"] = WebGLRenderingContext.ONE_MINUS_SRC_COLOR] = "ONE_MINUS_SRC_COLOR";
                BlendFactor[BlendFactor["DST_COLOR"] = WebGLRenderingContext.DST_COLOR] = "DST_COLOR";
                BlendFactor[BlendFactor["ONE_MINUS_DST_COLOR"] = WebGLRenderingContext.ONE_MINUS_DST_COLOR] = "ONE_MINUS_DST_COLOR";
                BlendFactor[BlendFactor["SRC_ALPHA"] = WebGLRenderingContext.SRC_ALPHA] = "SRC_ALPHA";
                BlendFactor[BlendFactor["ONE_MINUS_SRC_ALPHA"] = WebGLRenderingContext.ONE_MINUS_SRC_ALPHA] = "ONE_MINUS_SRC_ALPHA";
                BlendFactor[BlendFactor["DST_ALPHA"] = WebGLRenderingContext.DST_ALPHA] = "DST_ALPHA";
                BlendFactor[BlendFactor["ONE_MINUS_DST_ALPHA"] = WebGLRenderingContext.ONE_MINUS_DST_ALPHA] = "ONE_MINUS_DST_ALPHA";
            })(BlendFactor || (BlendFactor = {}));
            exports_7("BlendFactor", BlendFactor);
            (function (BlendMode) {
                BlendMode[BlendMode["NONE"] = 0] = "NONE";
                BlendMode[BlendMode["ADD"] = WebGLRenderingContext.FUNC_ADD] = "ADD";
                BlendMode[BlendMode["SUBTRACT"] = WebGLRenderingContext.FUNC_SUBTRACT] = "SUBTRACT";
                BlendMode[BlendMode["REVERSE_SUBTRACT"] = WebGLRenderingContext.FUNC_REVERSE_SUBTRACT] = "REVERSE_SUBTRACT";
            })(BlendMode || (BlendMode = {}));
            exports_7("BlendMode", BlendMode);
            RenderFlags = /** @class */ (function () {
                function RenderFlags() {
                    this.depthWrite = undefined;
                    this.depthTest = undefined;
                    this.depthFunc = undefined;
                    this.blendSrc = undefined;
                    this.blendDst = undefined;
                    this.blendMode = undefined;
                    this.cullMode = undefined;
                    this.frontFace = undefined;
                }
                RenderFlags.flatten = function (dst, src) {
                    if (dst.depthWrite === undefined)
                        dst.depthWrite = src.depthWrite;
                    if (dst.depthTest === undefined)
                        dst.depthTest = src.depthTest;
                    if (dst.depthFunc === undefined)
                        dst.depthFunc = src.depthFunc;
                    if (dst.blendMode === undefined)
                        dst.blendMode = src.blendMode;
                    if (dst.blendSrc === undefined)
                        dst.blendSrc = src.blendSrc;
                    if (dst.blendDst === undefined)
                        dst.blendDst = src.blendDst;
                    if (dst.cullMode === undefined)
                        dst.cullMode = src.cullMode;
                    if (dst.frontFace === undefined)
                        dst.frontFace = src.frontFace;
                };
                RenderFlags.apply = function (gl, oldFlags, newFlags) {
                    if (oldFlags.depthWrite !== newFlags.depthWrite) {
                        gl.depthMask(newFlags.depthWrite);
                    }
                    if (oldFlags.depthTest !== newFlags.depthTest) {
                        if (newFlags.depthTest)
                            gl.enable(gl.DEPTH_TEST);
                        else
                            gl.disable(gl.DEPTH_TEST);
                    }
                    if (oldFlags.blendMode !== newFlags.blendMode) {
                        if (newFlags.blendMode !== BlendMode.NONE) {
                            gl.enable(gl.BLEND);
                            gl.blendEquation(newFlags.blendMode);
                        }
                        else {
                            gl.disable(gl.BLEND);
                        }
                    }
                    if (oldFlags.blendSrc !== newFlags.blendSrc || oldFlags.blendDst !== newFlags.blendDst) {
                        gl.blendFunc(newFlags.blendSrc, newFlags.blendDst);
                    }
                    if (oldFlags.depthFunc !== newFlags.depthFunc) {
                        gl.depthFunc(newFlags.depthFunc);
                    }
                    if (oldFlags.cullMode !== newFlags.cullMode) {
                        if (oldFlags.cullMode === CullMode.NONE)
                            gl.enable(gl.CULL_FACE);
                        else if (newFlags.cullMode === CullMode.NONE)
                            gl.disable(gl.CULL_FACE);
                        if (newFlags.cullMode === CullMode.BACK)
                            gl.cullFace(gl.BACK);
                        else if (newFlags.cullMode === CullMode.FRONT)
                            gl.cullFace(gl.FRONT);
                        else if (newFlags.cullMode === CullMode.FRONT_AND_BACK)
                            gl.cullFace(gl.FRONT_AND_BACK);
                    }
                    if (oldFlags.frontFace !== newFlags.frontFace) {
                        gl.frontFace(newFlags.frontFace);
                    }
                };
                RenderFlags.default = new RenderFlags();
                return RenderFlags;
            }());
            exports_7("RenderFlags", RenderFlags);
            RenderFlags.default.blendMode = BlendMode.NONE;
            RenderFlags.default.blendSrc = BlendFactor.SRC_ALPHA;
            RenderFlags.default.blendDst = BlendFactor.ONE_MINUS_SRC_ALPHA;
            RenderFlags.default.cullMode = CullMode.NONE;
            RenderFlags.default.depthTest = false;
            RenderFlags.default.depthWrite = true;
            RenderFlags.default.depthFunc = CompareMode.LEQUAL;
            RenderFlags.default.frontFace = FrontFaceMode.CCW;
            RenderTarget = /** @class */ (function () {
                function RenderTarget() {
                }
                RenderTarget.prototype.destroy = function (gl) {
                    if (this.msaaFramebuffer)
                        gl.deleteFramebuffer(this.msaaFramebuffer);
                    if (this.msaaColorRenderbuffer)
                        gl.deleteRenderbuffer(this.msaaColorRenderbuffer);
                    if (this.msaaDepthRenderbuffer)
                        gl.deleteRenderbuffer(this.msaaDepthRenderbuffer);
                    if (this.resolvedFramebuffer)
                        gl.deleteFramebuffer(this.resolvedFramebuffer);
                    if (this.resolvedColorTexture)
                        gl.deleteTexture(this.resolvedColorTexture);
                };
                RenderTarget.prototype.setParameters = function (gl, width, height, samples) {
                    if (samples === void 0) { samples = 0; }
                    if (this.width === width && this.height === height && this.samples == samples)
                        return;
                    this.destroy(gl);
                    this.width = width;
                    this.height = height;
                    this.samples = samples;
                    gl.getExtension('EXT_color_buffer_float');
                    // MSAA FB.
                    this.msaaColorRenderbuffer = gl.createRenderbuffer();
                    gl.bindRenderbuffer(gl.RENDERBUFFER, this.msaaColorRenderbuffer);
                    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.RGBA8, this.width, this.height);
                    this.msaaDepthRenderbuffer = gl.createRenderbuffer();
                    gl.bindRenderbuffer(gl.RENDERBUFFER, this.msaaDepthRenderbuffer);
                    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH24_STENCIL8, this.width, this.height);
                    this.msaaFramebuffer = gl.createFramebuffer();
                    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.msaaFramebuffer);
                    gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.msaaColorRenderbuffer);
                    gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.msaaDepthRenderbuffer);
                    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
                    // Resolved.
                    this.resolvedColorTexture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, this.resolvedColorTexture);
                    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, this.width, this.height);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    this.resolvedFramebuffer = gl.createFramebuffer();
                    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.resolvedFramebuffer);
                    gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.resolvedColorTexture, 0);
                    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
                };
                RenderTarget.prototype.resolve = function (gl) {
                    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.msaaFramebuffer);
                    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.resolvedFramebuffer);
                    gl.blitFramebuffer(0, 0, this.width, this.height, 0, 0, this.width, this.height, gl.COLOR_BUFFER_BIT, gl.LINEAR);
                };
                return RenderTarget;
            }());
            exports_7("RenderTarget", RenderTarget);
            // XXX(jstpierre): Dumb polymorphic hack
            RealOnscreenRenderTarget = /** @class */ (function (_super) {
                __extends(RealOnscreenRenderTarget, _super);
                function RealOnscreenRenderTarget() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                RealOnscreenRenderTarget.prototype.setParameters = function (gl, width, height) {
                    this.width = width;
                    this.height = height;
                    this.msaaFramebuffer = null;
                };
                return RealOnscreenRenderTarget;
            }(RenderTarget));
            DEBUG = true;
            Program = /** @class */ (function () {
                function Program() {
                    this.forceRecompile = false;
                }
                Program.prototype.compile = function (gl, programCache) {
                    if (!this.glProg || this.forceRecompile) {
                        this.forceRecompile = false;
                        var vert = this.preprocessShader(gl, this.vert, "vert");
                        var frag = this.preprocessShader(gl, this.frag, "frag");
                        var newProg = programCache.compileProgram(vert, frag);
                        if (newProg !== null) {
                            this.glProg = newProg;
                            this.bind(gl, this.glProg);
                        }
                    }
                    if (!this.glProg) {
                        throw new Error();
                    }
                    return this.glProg;
                };
                Program.prototype.preprocessShader = function (gl, source, type) {
                    // Garbage WebGL2 shader compiler until I get something better down the line...
                    var lines = source.split('\n').map(function (n) {
                        // Remove comments.
                        return n.replace(/[/][/].*$/, '');
                    }).filter(function (n) {
                        // Filter whitespace.
                        var isEmpty = !n || /^\s+$/.test(n);
                        return !isEmpty;
                    });
                    var precision = lines.find(function (line) { return line.startsWith('precision'); }) || 'precision mediump float;';
                    var extensionLines = lines.filter(function (line) { return line.startsWith('#extension'); });
                    var extensions = extensionLines.filter(function (line) {
                        return line.indexOf('GL_EXT_frag_depth') === -1 ||
                            line.indexOf('GL_OES_standard_derivatives') === -1;
                    }).join('\n');
                    var rest = lines.filter(function (line) { return !line.startsWith('precision') && !line.startsWith('#extension'); }).join('\n');
                    var extensionDefines = gl.getSupportedExtensions().map(function (s) {
                        return "#define HAS_" + s;
                    }).join('\n');
                    return ("\n#version 300 es\n#define attribute in\n#define varying " + (type === 'vert' ? 'out' : 'in') + "\n" + extensionDefines + "\n#define gl_FragColor o_color\n#define gl_FragDepthEXT gl_FragDepth\n#define texture2D texture\n" + extensions + "\n" + precision + "\nout vec4 o_color;\n" + rest + "\n").trim();
                };
                Program.prototype.bind = function (gl, prog) {
                    this.modelViewLocation = gl.getUniformLocation(prog, "u_modelView");
                    this.projectionLocation = gl.getUniformLocation(prog, "u_projection");
                };
                Program.prototype.track = function (arena) {
                    arena.programs.push(this);
                };
                Program.prototype.destroy = function (gl) {
                    // TODO(jstpierre): Refcounting in the program cache?
                };
                Program.prototype._editShader = function (n) {
                    var _this = this;
                    var win = window.open('about:blank', undefined, "location=off, resizable, alwaysRaised, left=20, top=20, width=1200, height=900");
                    var init = function () {
                        var editor = new CodeEditor_1.default(win.document);
                        var document = win.document;
                        var title = n === 'vert' ? _this.name + " - Vertex Shader" : _this.name + " - Fragment Shader";
                        document.title = title;
                        document.body.style.margin = '0';
                        var shader = _this[n];
                        editor.setValue(shader);
                        editor.setFontSize('16px');
                        var timeout = 0;
                        editor.onvaluechanged = function () {
                            if (timeout > 0)
                                clearTimeout(timeout);
                            timeout = setTimeout(tryCompile, 500);
                        };
                        win.onresize = function () {
                            editor.setSize(document.body.offsetWidth, window.innerHeight);
                        };
                        win.onresize(null);
                        var tryCompile = function () {
                            timeout = 0;
                            _this[n] = editor.getValue();
                            _this.forceRecompile = true;
                        };
                        win.editor = editor;
                        win.document.body.appendChild(editor.elem);
                    };
                    if (win.document.readyState === 'complete')
                        init();
                    else
                        win.onload = init;
                };
                Program.prototype.editv = function () {
                    this._editShader('vert');
                };
                Program.prototype.editf = function () {
                    this._editShader('frag');
                };
                return Program;
            }());
            exports_7("Program", Program);
            ProgramCache = /** @class */ (function () {
                function ProgramCache(gl) {
                    this.gl = gl;
                    this._cache = new Map();
                }
                ProgramCache.prototype._compileProgram = function (vert, frag) {
                    var gl = this.gl;
                    var vertShader = compileShader(gl, vert, gl.VERTEX_SHADER);
                    var fragShader = compileShader(gl, frag, gl.FRAGMENT_SHADER);
                    if (!vertShader || !fragShader)
                        return null;
                    var prog = gl.createProgram();
                    gl.attachShader(prog, vertShader);
                    gl.attachShader(prog, fragShader);
                    gl.linkProgram(prog);
                    gl.deleteShader(vertShader);
                    gl.deleteShader(fragShader);
                    if (DEBUG && !gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                        console.error(vert);
                        console.error(frag);
                        console.error(gl.getProgramInfoLog(prog));
                        gl.deleteProgram(prog);
                        return null;
                    }
                    return prog;
                };
                ProgramCache.prototype.compileProgram = function (vert, frag) {
                    var key = vert + '$' + frag;
                    if (!this._cache.has(key))
                        this._cache.set(key, this._compileProgram(vert, frag));
                    return this._cache.get(key);
                };
                return ProgramCache;
            }());
            // Optional helper providing a lazy attempt at arena-style garbage collection.
            RenderArena = /** @class */ (function () {
                function RenderArena() {
                    this.textures = [];
                    this.samplers = [];
                    this.buffers = [];
                    this.vaos = [];
                    this.programs = [];
                }
                RenderArena.prototype.createTexture = function (gl) {
                    return pushAndReturn(this.textures, gl.createTexture());
                };
                RenderArena.prototype.createSampler = function (gl) {
                    return pushAndReturn(this.samplers, gl.createSampler());
                };
                RenderArena.prototype.createBuffer = function (gl) {
                    return pushAndReturn(this.buffers, gl.createBuffer());
                };
                RenderArena.prototype.createVertexArray = function (gl) {
                    return pushAndReturn(this.vaos, gl.createVertexArray());
                };
                RenderArena.prototype.trackProgram = function (program) {
                    program.track(this);
                };
                RenderArena.prototype.destroy = function (gl) {
                    try {
                        for (var _a = __values(this.textures), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var texture = _b.value;
                            gl.deleteTexture(texture);
                        }
                    }
                    catch (e_9_1) { e_9 = { error: e_9_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_9) throw e_9.error; }
                    }
                    this.textures = [];
                    try {
                        for (var _d = __values(this.samplers), _e = _d.next(); !_e.done; _e = _d.next()) {
                            var sampler = _e.value;
                            gl.deleteSampler(sampler);
                        }
                    }
                    catch (e_10_1) { e_10 = { error: e_10_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_f = _d.return)) _f.call(_d);
                        }
                        finally { if (e_10) throw e_10.error; }
                    }
                    this.samplers = [];
                    try {
                        for (var _g = __values(this.buffers), _h = _g.next(); !_h.done; _h = _g.next()) {
                            var buffer = _h.value;
                            gl.deleteBuffer(buffer);
                        }
                    }
                    catch (e_11_1) { e_11 = { error: e_11_1 }; }
                    finally {
                        try {
                            if (_h && !_h.done && (_j = _g.return)) _j.call(_g);
                        }
                        finally { if (e_11) throw e_11.error; }
                    }
                    this.buffers = [];
                    try {
                        for (var _k = __values(this.vaos), _l = _k.next(); !_l.done; _l = _k.next()) {
                            var vao = _l.value;
                            gl.deleteVertexArray(vao);
                        }
                    }
                    catch (e_12_1) { e_12 = { error: e_12_1 }; }
                    finally {
                        try {
                            if (_l && !_l.done && (_m = _k.return)) _m.call(_k);
                        }
                        finally { if (e_12) throw e_12.error; }
                    }
                    this.vaos = [];
                    try {
                        for (var _o = __values(this.programs), _p = _o.next(); !_p.done; _p = _o.next()) {
                            var program = _p.value;
                            program.destroy(gl);
                        }
                    }
                    catch (e_13_1) { e_13 = { error: e_13_1 }; }
                    finally {
                        try {
                            if (_p && !_p.done && (_q = _o.return)) _q.call(_o);
                        }
                        finally { if (e_13) throw e_13.error; }
                    }
                    this.programs = [];
                    var e_9, _c, e_10, _f, e_11, _j, e_12, _m, e_13, _q;
                };
                return RenderArena;
            }());
            exports_7("RenderArena", RenderArena);
            BufferCoalescer = /** @class */ (function () {
                function BufferCoalescer(gl, vertexDatas, indexDatas) {
                    util_2.assert(vertexDatas.length === indexDatas.length);
                    var vertexCoalescedBuffers = coalesceBuffer(gl, gl.ARRAY_BUFFER, vertexDatas);
                    var indexCoalescedBuffers = coalesceBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indexDatas);
                    var coalescedBuffers = [];
                    for (var i = 0; i < vertexCoalescedBuffers.length; i++) {
                        var vertexBuffer = vertexCoalescedBuffers[i];
                        var indexBuffer = indexCoalescedBuffers[i];
                        coalescedBuffers.push({ vertexBuffer: vertexBuffer, indexBuffer: indexBuffer });
                    }
                    this.coalescedBuffers = coalescedBuffers;
                    this.vertexBuffer = this.coalescedBuffers[0].vertexBuffer.buffer;
                    this.indexBuffer = this.coalescedBuffers[0].indexBuffer.buffer;
                }
                BufferCoalescer.prototype.destroy = function (gl) {
                    gl.deleteBuffer(this.vertexBuffer);
                    gl.deleteBuffer(this.indexBuffer);
                };
                return BufferCoalescer;
            }());
            exports_7("BufferCoalescer", BufferCoalescer);
            FullscreenProgram = /** @class */ (function (_super) {
                __extends(FullscreenProgram, _super);
                function FullscreenProgram() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.vert = "\nout vec2 v_TexCoord;\n\nvoid main() {\n    v_TexCoord.x = (gl_VertexID == 1) ? 2.0 : 0.0;\n    v_TexCoord.y = (gl_VertexID == 2) ? 2.0 : 0.0;\n    gl_Position.xy = v_TexCoord * vec2(2) - vec2(1);\n    gl_Position.zw = vec2(1);\n}\n";
                    return _this;
                }
                return FullscreenProgram;
            }(Program));
            exports_7("FullscreenProgram", FullscreenProgram);
            FullscreenCopyProgram = /** @class */ (function (_super) {
                __extends(FullscreenCopyProgram, _super);
                function FullscreenCopyProgram() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.frag = "\nuniform sampler2D u_Texture;\nin vec2 v_TexCoord;\n\nvoid main() {\n    vec4 color = texture(u_Texture, v_TexCoord);\n    gl_FragColor = vec4(color.rgb, 1.0);\n}\n";
                    return _this;
                }
                return FullscreenCopyProgram;
            }(FullscreenProgram));
            RenderState = /** @class */ (function () {
                function RenderState(gl) {
                    this.gl = gl;
                    // State.
                    this.currentProgram = null;
                    this.currentFlags = new RenderFlags();
                    this.currentRenderTarget = null;
                    this.programCache = new ProgramCache(this.gl);
                    this.time = 0;
                    this.fov = Math.PI / 4;
                    this.projection = gl_matrix_1.mat4.create();
                    this.view = gl_matrix_1.mat4.create();
                    this.scratchMatrix = gl_matrix_1.mat4.create();
                    this.realOnscreenRenderTarget = new RealOnscreenRenderTarget();
                    this.fullscreenCopyProgram = new FullscreenCopyProgram();
                    this.fullscreenFlags = new RenderFlags();
                    this.fullscreenFlags.depthTest = false;
                    this.fullscreenFlags.blendMode = BlendMode.NONE;
                    this.fullscreenFlags.cullMode = CullMode.NONE;
                }
                RenderState.prototype.reset = function () {
                    this.drawCallCount = 0;
                    this.frameStartTime = window.performance.now();
                    this.useRenderTarget(this.onscreenRenderTarget);
                    this.useFlags(RenderFlags.default);
                };
                RenderState.prototype.setView = function (m) {
                    gl_matrix_1.mat4.copy(this.view, m);
                };
                RenderState.prototype.blitRenderTargetDepth = function (srcRenderTarget) {
                    var gl = this.gl;
                    // Blit depth.
                    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, srcRenderTarget.msaaFramebuffer);
                    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.currentRenderTarget.msaaFramebuffer);
                    gl.blitFramebuffer(0, 0, srcRenderTarget.width, srcRenderTarget.height, 0, 0, this.onscreenRenderTarget.width, this.onscreenRenderTarget.height, gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT, gl.NEAREST);
                };
                // XXX(jstpierre): Design a better API than this.
                RenderState.prototype.runFullscreen = function (flags) {
                    if (flags === void 0) { flags = null; }
                    var gl = this.gl;
                    this.useFlags(flags !== null ? flags : this.fullscreenFlags);
                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                };
                RenderState.prototype.blitRenderTarget = function (srcRenderTarget, flags) {
                    if (flags === void 0) { flags = null; }
                    var gl = this.gl;
                    // First, resolve MSAA buffer to a standard buffer.
                    srcRenderTarget.resolve(gl);
                    // Make sure to re-bind our destination RT, since the resolve screws things up...
                    this.useRenderTarget(this.currentRenderTarget);
                    // Now, copy the onscreen RT to the screen.
                    this.useProgram(this.fullscreenCopyProgram);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, srcRenderTarget.resolvedColorTexture);
                    gl.bindSampler(0, null);
                    this.runFullscreen(flags);
                };
                RenderState.prototype.useRenderTarget = function (renderTarget) {
                    var gl = this.gl;
                    this.currentRenderTarget = renderTarget !== null ? renderTarget : this.onscreenRenderTarget;
                    this.bindViewport();
                    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.currentRenderTarget.msaaFramebuffer);
                };
                // Should only be used by viewer, basically...
                RenderState.prototype.useRealOnscreenRenderTarget = function (width, height) {
                    var gl = this.gl;
                    this.realOnscreenRenderTarget.setParameters(null, width, height);
                    this.currentRenderTarget = this.realOnscreenRenderTarget;
                    gl.viewport(0, 0, width, height);
                };
                RenderState.prototype.bindViewport = function () {
                    var gl = this.gl;
                    var width = this.currentRenderTarget.width, height = this.currentRenderTarget.height;
                    gl_matrix_1.mat4.perspective(this.projection, this.fov, width / height, this.nearClipPlane, this.farClipPlane);
                    gl.viewport(0, 0, width, height);
                };
                RenderState.prototype.setClipPlanes = function (near, far) {
                    this.nearClipPlane = near;
                    this.farClipPlane = far;
                    if (this.currentRenderTarget) {
                        var width = this.currentRenderTarget.width, height = this.currentRenderTarget.height;
                        gl_matrix_1.mat4.perspective(this.projection, this.fov, width / height, this.nearClipPlane, this.farClipPlane);
                    }
                };
                RenderState.prototype.setOnscreenRenderTarget = function (renderTarget) {
                    var gl = this.gl;
                    this.onscreenRenderTarget = renderTarget;
                    util_2.assert(this.onscreenRenderTarget.samples === 0);
                };
                RenderState.prototype.compileProgram = function (prog) {
                    return prog.compile(this.gl, this.programCache);
                };
                RenderState.prototype.useProgram = function (prog) {
                    var gl = this.gl;
                    this.currentProgram = prog;
                    gl.useProgram(this.compileProgram(prog));
                };
                RenderState.prototype.updateModelView = function (isSkybox, model) {
                    if (isSkybox === void 0) { isSkybox = false; }
                    if (model === void 0) { model = null; }
                    var scratch = this.scratchMatrix;
                    gl_matrix_1.mat4.copy(scratch, this.view);
                    if (isSkybox) {
                        scratch[12] = 0;
                        scratch[13] = 0;
                        scratch[14] = 0;
                    }
                    if (model)
                        gl_matrix_1.mat4.mul(scratch, scratch, model);
                    return scratch;
                };
                RenderState.prototype.bindModelView = function (isSkybox, model) {
                    if (isSkybox === void 0) { isSkybox = false; }
                    if (model === void 0) { model = null; }
                    var gl = this.gl;
                    var prog = this.currentProgram;
                    var scratch = this.updateModelView(isSkybox, model);
                    gl.uniformMatrix4fv(prog.projectionLocation, false, this.projection);
                    gl.uniformMatrix4fv(prog.modelViewLocation, false, scratch);
                };
                RenderState.prototype.useFlags = function (flags) {
                    var gl = this.gl;
                    // TODO(jstpierre): Move the flattening to a stack, possibly?
                    RenderFlags.flatten(flags, this.currentFlags);
                    RenderFlags.apply(gl, this.currentFlags, flags);
                    this.currentFlags = flags;
                };
                return RenderState;
            }());
            exports_7("RenderState", RenderState);
        }
    };
});
// New UI system
System.register("ui", ["viewer"], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    function createDOMFromString(s) {
        return document.createRange().createContextualFragment(s);
    }
    function setElementHighlighted(elem, highlighted, normalTextColor) {
        if (normalTextColor === void 0) { normalTextColor = ''; }
        elem.classList.toggle('Highlighted', highlighted);
        if (highlighted) {
            elem.style.backgroundColor = HIGHLIGHT_COLOR;
            elem.style.color = 'black';
        }
        else {
            elem.style.backgroundColor = '';
            elem.style.color = normalTextColor;
        }
    }
    function highlightFlair(i) {
        return { index: i, background: HIGHLIGHT_COLOR, color: 'black' };
    }
    function cloneCanvas(dst, src) {
        dst.width = src.width;
        dst.height = src.height;
        var ctx = dst.getContext('2d');
        ctx.drawImage(src, 0, 0);
    }
    var Viewer, HIGHLIGHT_COLOR, ScrollSelect, SingleSelect, SimpleSingleSelect, MultiSelect, Panel, OPEN_ICON, SceneSelect, CHECKERBOARD_IMAGE, TEXTURES_ICON, TextureViewer, FRUSTUM_ICON, ViewerSettings, ABOUT_ICON, About, LAYER_ICON, LayerPanel, UI;
    return {
        setters: [
            function (Viewer_1) {
                Viewer = Viewer_1;
            }
        ],
        execute: function () {
            HIGHLIGHT_COLOR = 'rgb(255, 66, 95)';
            ScrollSelect = /** @class */ (function () {
                function ScrollSelect() {
                    this.toplevel = document.createElement('div');
                    this.scrollContainer = document.createElement('div');
                    this.scrollContainer.style.height = "200px";
                    this.scrollContainer.style.overflow = 'auto';
                    this.toplevel.appendChild(this.scrollContainer);
                    this.elem = this.toplevel;
                }
                ScrollSelect.prototype.setStrings = function (strings) {
                    var _this = this;
                    this.scrollContainer.style.display = (strings.length > 0) ? '' : 'none';
                    this.scrollContainer.innerHTML = '';
                    var _loop_1 = function (i) {
                        var selector = document.createElement('div');
                        selector.style.display = 'list-item';
                        selector.style.cursor = 'pointer';
                        var textSpan = document.createElement('span');
                        textSpan.style.fontWeight = 'bold';
                        textSpan.textContent = strings[i];
                        selector.appendChild(textSpan);
                        var index = i;
                        selector.onclick = function () {
                            _this.itemClicked(index);
                        };
                        this_1.scrollContainer.appendChild(selector);
                    };
                    var this_1 = this;
                    for (var i = 0; i < strings.length; i++) {
                        _loop_1(i);
                    }
                };
                ScrollSelect.prototype.getNumItems = function () {
                    return this.scrollContainer.childElementCount;
                };
                ScrollSelect.prototype.setFlairs = function (flairs) {
                    var _loop_2 = function (i) {
                        var selector = this_2.scrollContainer.children.item(i);
                        var flair = flairs.find(function (flair) { return flair.index === i; });
                        var background = (flair !== undefined && flair.background !== undefined) ? flair.background : '';
                        selector.style.background = background;
                        var textSpan = selector.querySelector('span');
                        var color = (flair !== undefined && flair.color !== undefined) ? flair.color : '';
                        textSpan.style.color = color;
                        if (flair !== undefined && flair.bulletColor !== undefined) {
                            selector.style.listStyleType = 'disc';
                            selector.style.listStylePosition = 'inside';
                            selector.style.marginLeft = '4px';
                            selector.style.color = flair.bulletColor;
                        }
                        else {
                            selector.style.listStyleType = '';
                            selector.style.color = '';
                            selector.style.marginLeft = '';
                        }
                    };
                    var this_2 = this;
                    for (var i = 0; i < this.getNumItems(); i++) {
                        _loop_2(i);
                    }
                };
                return ScrollSelect;
            }());
            exports_8("ScrollSelect", ScrollSelect);
            SingleSelect = /** @class */ (function (_super) {
                __extends(SingleSelect, _super);
                function SingleSelect() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                SingleSelect.prototype.itemClicked = function (index) {
                    this.selectItem(index);
                };
                SingleSelect.prototype.selectItem = function (index) {
                    this.onselectionchange(index);
                };
                SingleSelect.prototype.setHighlighted = function (highlightedIndex) {
                    this.setFlairs([highlightFlair(highlightedIndex)]);
                };
                return SingleSelect;
            }(ScrollSelect));
            exports_8("SingleSelect", SingleSelect);
            SimpleSingleSelect = /** @class */ (function (_super) {
                __extends(SimpleSingleSelect, _super);
                function SimpleSingleSelect() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                SimpleSingleSelect.prototype.selectItem = function (index) {
                    _super.prototype.selectItem.call(this, index);
                    this.setHighlighted(index);
                };
                return SimpleSingleSelect;
            }(SingleSelect));
            exports_8("SimpleSingleSelect", SimpleSingleSelect);
            MultiSelect = /** @class */ (function (_super) {
                __extends(MultiSelect, _super);
                function MultiSelect() {
                    var _this = _super.call(this) || this;
                    _this.itemIsOn = [];
                    var allNone = createDOMFromString("\n<div style=\"display: grid; grid-template-columns: 1fr 1fr; grid-gap: 4px;\">\n<style>\n.AllButton, .NoneButton {\n    text-align: center;\n    line-height: 32px;\n    cursor: pointer;\n    background: #666;\n    font-weight: bold;\n}\n</style>\n<div class=\"AllButton\">All</div><div class=\"NoneButton\">None</div>\n</div>\n");
                    _this.toplevel.insertBefore(allNone, _this.toplevel.firstChild);
                    var allButton = _this.toplevel.querySelector('.AllButton');
                    allButton.onclick = function () {
                        for (var i = 0; i < _this.getNumItems(); i++)
                            _this.setItemIsOn(i, true);
                        _this.syncFlairs();
                    };
                    var noneButton = _this.toplevel.querySelector('.NoneButton');
                    noneButton.onclick = function () {
                        for (var i = 0; i < _this.getNumItems(); i++)
                            _this.setItemIsOn(i, false);
                        _this.syncFlairs();
                    };
                    return _this;
                }
                MultiSelect.prototype.setItemIsOn = function (index, v) {
                    this.itemIsOn[index] = v;
                    this.onitemchanged(index, this.itemIsOn[index]);
                };
                MultiSelect.prototype.itemClicked = function (index) {
                    this.setItemIsOn(index, !this.itemIsOn[index]);
                    this.syncFlairs();
                };
                MultiSelect.prototype.syncFlairs = function () {
                    var flairs = [];
                    for (var i = 0; i < this.getNumItems(); i++) {
                        var bulletColor = !!this.itemIsOn[i] ? HIGHLIGHT_COLOR : '#aaa';
                        var color = !!this.itemIsOn[i] ? 'white' : '#aaa';
                        flairs.push({ index: i, bulletColor: bulletColor, color: color });
                    }
                    this.setFlairs(flairs);
                };
                MultiSelect.prototype.setItemsSelected = function (isOn) {
                    this.itemIsOn = isOn;
                    this.syncFlairs();
                };
                MultiSelect.prototype.setItemSelected = function (index, v) {
                    this.itemIsOn[index] = v;
                    this.syncFlairs();
                };
                return MultiSelect;
            }(ScrollSelect));
            exports_8("MultiSelect", MultiSelect);
            Panel = /** @class */ (function () {
                function Panel() {
                    var _this = this;
                    this.toplevel = document.createElement('div');
                    this.toplevel.style.color = 'white';
                    this.toplevel.style.font = '16px monospace';
                    this.toplevel.style.overflow = 'hidden';
                    this.toplevel.style.display = 'grid';
                    this.toplevel.style.gridAutoFlow = 'column';
                    this.toplevel.style.gridGap = '20px';
                    this.toplevel.style.transition = '.25s ease-out';
                    this.toplevel.style.alignItems = 'start';
                    this.mainPanel = document.createElement('div');
                    this.mainPanel.style.overflow = 'hidden';
                    this.mainPanel.style.transition = '.25s ease-out';
                    this.mainPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    this.mainPanel.style.pointerEvents = 'auto';
                    this.toplevel.appendChild(this.mainPanel);
                    this.extraRack = document.createElement('div');
                    this.extraRack.style.display = 'grid';
                    this.extraRack.style.gridAutoFlow = 'column';
                    this.extraRack.style.gridGap = '20px';
                    this.extraRack.style.transition = '.15s ease-out .10s';
                    this.extraRack.style.pointerEvents = 'auto';
                    this.toplevel.appendChild(this.extraRack);
                    this.header = document.createElement('h1');
                    this.header.style.lineHeight = '28px';
                    this.header.style.width = '400px';
                    this.header.style.margin = '0';
                    this.header.style.color = HIGHLIGHT_COLOR;
                    this.header.style.fontSize = '100%';
                    this.header.style.textAlign = 'center';
                    this.header.style.cursor = 'pointer';
                    this.header.style.userSelect = 'none';
                    this.header.style.webkitUserSelect = 'none';
                    this.header.style.display = 'grid';
                    this.header.style.gridTemplateColumns = '28px 1fr';
                    this.header.style.alignItems = 'center';
                    this.header.style.justifyItems = 'center';
                    this.header.style.gridAutoFlow = 'column';
                    this.toplevel.onmouseover = this.syncSize.bind(this);
                    this.toplevel.onmouseout = this.syncSize.bind(this);
                    this.header.onclick = function () {
                        _this.toggleExpanded();
                    };
                    this.mainPanel.appendChild(this.header);
                    this.contents = document.createElement('div');
                    this.contents.style.width = '400px';
                    this.mainPanel.appendChild(this.contents);
                    this.elem = this.toplevel;
                }
                Panel.prototype.syncSize = function () {
                    var widthExpanded = this.expanded || this.mainPanel.matches(':hover');
                    this.mainPanel.style.width = widthExpanded ? '400px' : '28px';
                    var heightExpanded = this.expanded;
                    if (heightExpanded) {
                        var height = this.header.offsetHeight + this.contents.offsetHeight;
                        this.toplevel.style.height = height + "px";
                        this.extraRack.style.opacity = '1';
                    }
                    else {
                        this.toplevel.style.transition = '.25s ease-out';
                        this.toplevel.style.height = '28px';
                        this.extraRack.style.opacity = '0';
                    }
                };
                Panel.prototype.setVisible = function (v) {
                    this.toplevel.style.display = v ? 'grid' : 'none';
                };
                Panel.prototype.setTitle = function (icon, title) {
                    var svgIcon = createDOMFromString(icon).querySelector('svg');
                    this.svgIcon = svgIcon;
                    this.svgIcon.style.gridColumn = '1';
                    this.header.textContent = title;
                    this.header.appendChild(this.svgIcon);
                    this.setExpanded(false);
                };
                Panel.prototype.syncHeaderStyle = function () {
                    this.svgIcon.style.fill = this.expanded ? 'black' : '';
                    setElementHighlighted(this.header, this.expanded, HIGHLIGHT_COLOR);
                };
                Panel.prototype.setExpanded = function (expanded) {
                    this.expanded = expanded;
                    this.syncHeaderStyle();
                    this.syncSize();
                };
                Panel.prototype.toggleExpanded = function () {
                    this.setExpanded(!this.expanded);
                };
                return Panel;
            }());
            exports_8("Panel", Panel);
            OPEN_ICON = "<svg viewBox=\"0 0 100 100\" height=\"20\" fill=\"white\"><path d=\"M84.3765045,45.2316481 L77.2336539,75.2316205 L77.2336539,75.2316205 C77.1263996,75.6820886 76.7239081,76 76.2608477,76 L17.8061496,76 C17.2538649,76 16.8061496,75.5522847 16.8061496,75 C16.8061496,74.9118841 16.817796,74.8241548 16.8407862,74.739091 L24.7487983,45.4794461 C24.9845522,44.607157 25.7758952,44.0012839 26.6794815,44.0012642 L83.4036764,44.0000276 L83.4036764,44.0000276 C83.9559612,44.0000156 84.4036862,44.4477211 84.4036982,45.0000058 C84.4036999,45.0780163 84.3945733,45.155759 84.3765045,45.2316481 L84.3765045,45.2316481 Z M15,24 L26.8277004,24 L26.8277004,24 C27.0616369,24 27.2881698,24.0820162 27.4678848,24.2317787 L31.799078,27.8411064 L31.799078,27.8411064 C32.697653,28.5899189 33.8303175,29 35,29 L75,29 C75.5522847,29 76,29.4477153 76,30 L76,38 L76,38 C76,38.5522847 75.5522847,39 75,39 L25.3280454,39 L25.3280454,39 C23.0690391,39 21.0906235,40.5146929 20.5012284,42.6954549 L14.7844016,63.8477139 L14.7844016,63.8477139 C14.7267632,64.0609761 14.5071549,64.1871341 14.2938927,64.1294957 C14.1194254,64.0823423 13.9982484,63.9240598 13.9982563,63.7433327 L13.9999561,25 L14,25 C14.0000242,24.4477324 14.4477324,24.0000439 15,24.0000439 L15,24 Z\"/></svg>";
            SceneSelect = /** @class */ (function (_super) {
                __extends(SceneSelect, _super);
                function SceneSelect(viewer) {
                    var _this = _super.call(this) || this;
                    _this.viewer = viewer;
                    _this.sceneGroups = [];
                    _this.sceneDescs = [];
                    _this.setTitle(OPEN_ICON, 'Scenes');
                    _this.sceneGroupList = new SingleSelect();
                    _this.contents.appendChild(_this.sceneGroupList.elem);
                    _this.sceneDescList = new SingleSelect();
                    _this.sceneDescList.elem.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    _this.sceneDescList.elem.style.width = '400px';
                    _this.extraRack.appendChild(_this.sceneDescList.elem);
                    _this.sceneGroupList.onselectionchange = function (i) {
                        _this.selectSceneGroup(i);
                    };
                    _this.sceneDescList.onselectionchange = function (i) {
                        _this.selectSceneDesc(i);
                    };
                    return _this;
                }
                SceneSelect.prototype.setProgressable = function (p) {
                    var _this = this;
                    this.setLoadProgress(p.progress);
                    p.onProgress = function () {
                        _this.setLoadProgress(p.progress);
                    };
                };
                SceneSelect.prototype.setCurrentDesc = function (sceneGroup, sceneDesc) {
                    this.selectedSceneGroup = sceneGroup;
                    this.currentSceneGroup = sceneGroup;
                    this.currentSceneDesc = sceneDesc;
                    this.syncSceneDescs();
                };
                SceneSelect.prototype.setSceneGroups = function (sceneGroups) {
                    this.sceneGroups = sceneGroups;
                    var strings = this.sceneGroups.filter(function (g) { return g.sceneDescs.length > 0; }).map(function (g) { return g.name; });
                    this.sceneGroupList.setStrings(strings);
                    this.syncSceneDescs();
                };
                SceneSelect.prototype.setLoadProgress = function (pct) {
                    this.loadProgress = pct;
                    this.syncFlairs();
                    this.syncHeaderStyle();
                };
                SceneSelect.prototype.selectSceneDesc = function (i) {
                    this.onscenedescselected(this.selectedSceneGroup, this.sceneDescs[i]);
                };
                SceneSelect.prototype.getLoadingGradient = function () {
                    var pct = Math.round(this.loadProgress * 100) + "%";
                    var loadingGradient = "linear-gradient(to right, " + HIGHLIGHT_COLOR + " " + pct + ", transparent " + pct + ")";
                    return loadingGradient;
                };
                SceneSelect.prototype.syncHeaderStyle = function () {
                    _super.prototype.syncHeaderStyle.call(this);
                    setElementHighlighted(this.header, this.expanded);
                    if (this.expanded)
                        this.header.style.background = HIGHLIGHT_COLOR;
                    else
                        this.header.style.background = this.getLoadingGradient();
                };
                SceneSelect.prototype.syncFlairs = function () {
                    var selectedGroupIndex = this.sceneGroups.indexOf(this.selectedSceneGroup);
                    var flairs = [{ index: selectedGroupIndex, background: HIGHLIGHT_COLOR, color: 'black' }];
                    var currentGroupIndex = this.sceneGroups.indexOf(this.currentSceneGroup);
                    if (currentGroupIndex >= 0)
                        flairs.push({ index: currentGroupIndex, background: '#aaa' });
                    this.sceneGroupList.setFlairs(flairs);
                    var selectedDescIndex = this.sceneDescs.indexOf(this.currentSceneDesc);
                    if (selectedDescIndex >= 0) {
                        var loadingGradient = this.getLoadingGradient();
                        this.sceneDescList.setFlairs([{ index: selectedDescIndex, background: loadingGradient }]);
                    }
                };
                SceneSelect.prototype.selectSceneGroup = function (i) {
                    var sceneGroup = this.sceneGroups[i];
                    this.selectedSceneGroup = sceneGroup;
                    this.syncSceneDescs();
                };
                SceneSelect.prototype.syncSceneDescs = function () {
                    if (this.selectedSceneGroup)
                        this.setSceneDescs(this.selectedSceneGroup.sceneDescs);
                    else if (this.currentSceneGroup)
                        this.setSceneDescs(this.currentSceneGroup.sceneDescs);
                    else
                        this.setSceneDescs([]);
                };
                SceneSelect.prototype.setSceneDescs = function (sceneDescs) {
                    this.sceneDescs = sceneDescs;
                    var strings = sceneDescs.map(function (desc) { return desc.name; });
                    this.sceneDescList.setStrings(strings);
                    this.syncFlairs();
                };
                return SceneSelect;
            }(Panel));
            CHECKERBOARD_IMAGE = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGElEQVQYlWNgYGCQwoKxgqGgcJA5h3yFAAs8BRWVSwooAAAAAElFTkSuQmCC")';
            TEXTURES_ICON = "<svg viewBox=\"0 0 512 512\" height=\"20\" fill=\"white\"><path d=\"M143.5,143.5v300h300v-300H143.5z M274.8,237.2c10.3,0,18.7,8.4,18.7,18.9c0,10.3-8.4,18.7-18.7,18.7   c-10.3,0-18.7-8.4-18.7-18.7C256,245.6,264.4,237.2,274.8,237.2z M406,406H181v-56.2l56.2-56.1l37.5,37.3l75-74.8l56.2,56.1V406z\"/><polygon points=\"387.2,68.6 68.5,68.6 68.5,368.5 106,368.5 106,106 387.2,106\"/></svg>";
            TextureViewer = /** @class */ (function (_super) {
                __extends(TextureViewer, _super);
                function TextureViewer() {
                    var _this = _super.call(this) || this;
                    _this.textureList = [];
                    _this.setTitle(TEXTURES_ICON, 'Textures');
                    _this.scrollList = new SingleSelect();
                    _this.scrollList.elem.style.height = "200px";
                    _this.scrollList.elem.style.overflow = 'auto';
                    _this.scrollList.onselectionchange = function (i) {
                        _this.selectTexture(i);
                    };
                    _this.contents.appendChild(_this.scrollList.elem);
                    _this.surfaceView = document.createElement('div');
                    _this.surfaceView.style.width = '100%';
                    _this.surfaceView.style.height = '200px';
                    _this.surfaceView.style.cursor = 'pointer';
                    // TODO(jstpierre): Explicit icons.
                    _this.surfaceView.onmouseover = function () {
                        // Checkerboard
                        _this.surfaceView.style.backgroundColor = 'white';
                        _this.surfaceView.style.backgroundImage = CHECKERBOARD_IMAGE;
                    };
                    _this.surfaceView.onmouseout = function () {
                        _this.surfaceView.style.backgroundColor = 'black';
                        _this.surfaceView.style.backgroundImage = '';
                    };
                    _this.surfaceView.onclick = function () {
                        _this.fullSurfaceView.style.display = 'block';
                    };
                    _this.surfaceView.onmouseout(null);
                    _this.contents.appendChild(_this.surfaceView);
                    _this.properties = document.createElement('div');
                    _this.contents.appendChild(_this.properties);
                    _this.fullSurfaceView = document.createElement('canvas');
                    _this.fullSurfaceView.style.backgroundColor = 'white';
                    _this.fullSurfaceView.style.backgroundImage = CHECKERBOARD_IMAGE;
                    _this.fullSurfaceView.style.display = 'none';
                    _this.extraRack.appendChild(_this.fullSurfaceView);
                    return _this;
                }
                TextureViewer.prototype.selectSurface = function (surface) {
                    this.surfaceView.innerHTML = '';
                    surface.style.width = '100%';
                    surface.style.height = '100%';
                    surface.style.objectFit = 'scale-down';
                    this.surfaceView.appendChild(surface);
                    cloneCanvas(this.fullSurfaceView, surface);
                };
                TextureViewer.prototype.selectTexture = function (i) {
                    var texture = this.textureList[i];
                    this.scrollList.setHighlighted(i);
                    this.properties.innerHTML = "\n<div style=\"display: grid; grid-template-columns: 1fr 1fr\">\n<span>Mipmaps</span><span style=\"text-align: right\">" + texture.surfaces.length + "</span>\n<span>Width</span><span style=\"text-align: right\">" + texture.surfaces[0].width + "</span>\n<span>Height</span><span style=\"text-align: right\">" + texture.surfaces[0].height + "</span>\n</div>\n";
                    this.selectSurface(texture.surfaces[0]);
                    this.fullSurfaceView.style.display = 'none';
                };
                TextureViewer.prototype.setTextureList = function (textures) {
                    this.setVisible(textures.length > 0);
                    if (textures.length === 0)
                        return;
                    var strings = textures.map(function (texture) { return texture.name; });
                    this.scrollList.setStrings(strings);
                    this.textureList = textures;
                };
                return TextureViewer;
            }(Panel));
            exports_8("TextureViewer", TextureViewer);
            FRUSTUM_ICON = "<svg viewBox=\"0 0 100 100\" height=\"20\" fill=\"white\"><polygon points=\"48.2573,19.8589 33.8981,15.0724 5,67.8384 48.2573,90.3684\" /><polygon points=\"51.5652,19.8738 51.5652,90.3734 95,67.8392 65.9366,15.2701\" /><polygon points=\"61.3189,13.2756 49.9911,9.6265 38.5411,13.1331 49.9213,16.9268\" /></svg>";
            ViewerSettings = /** @class */ (function (_super) {
                __extends(ViewerSettings, _super);
                function ViewerSettings(viewer) {
                    var _this = _super.call(this) || this;
                    _this.viewer = viewer;
                    _this.setTitle(FRUSTUM_ICON, 'Viewer Settings');
                    // TODO(jstpierre): make css not leak
                    _this.contents.innerHTML = "\n<style>\n.Slider {\n    -webkit-appearance: none;\n    width: 100%;\n    height: 24px;\n    margin: 0;\n}\n.Slider::-moz-range-thumb {\n    width: 16px;\n    height: 24px;\n    cursor: pointer;\n    background: " + HIGHLIGHT_COLOR + ";\n    border-radius: 0;\n    border: none;\n}\n.Slider::-webkit-slider-thumb {\n    width: 16px;\n    height: 24px;\n    cursor: pointer;\n    background: " + HIGHLIGHT_COLOR + ";\n    border-radius: 0;\n    border: none;\n}\n.Slider::-moz-range-track {\n    height: 24px;\n    cursor: pointer;\n    background: #444;\n}\n.Slider::-webkit-slider-runnable-track {\n    height: 24px;\n    cursor: pointer;\n    background: #444;\n}\n.Slider::-moz-range-progress {\n    height: 24px;\n    cursor: pointer;\n    background: #aaa;\n}\n.SettingsHeader, .CameraControllerWASD, .CameraControllerOrbit {\n    text-align: center;\n    font-weight: bold;\n    line-height: 24px;\n}\n.CameraControllerWASD, .CameraControllerOrbit {\n    background: #444;\n    line-height: 32px;\n    cursor: pointer;\n}\n</style>\n<div class=\"SettingsHeader\">Field of View</div>\n<div><input class=\"Slider FoVSlider\" type=\"range\" min=\"1\" max=\"100\"></div>\n<div class=\"SettingsHeader\">Camera Controller</div>\n<div style=\"display: grid; grid-template-columns: 1fr 1fr;\">\n<div class=\"CameraControllerWASD\">WASD</div><div class=\"CameraControllerOrbit\">Orbit</div>\n</div>\n";
                    _this.fovSlider = _this.contents.querySelector('.FoVSlider');
                    _this.fovSlider.oninput = _this.onFovSliderChange.bind(_this);
                    _this.cameraControllerWASD = _this.contents.querySelector('.CameraControllerWASD');
                    _this.cameraControllerWASD.onclick = function () {
                        _this.setCameraControllerClass(Viewer.FPSCameraController);
                    };
                    _this.cameraControllerOrbit = _this.contents.querySelector('.CameraControllerOrbit');
                    _this.cameraControllerOrbit.onclick = function () {
                        _this.setCameraControllerClass(Viewer.OrbitCameraController);
                    };
                    return _this;
                }
                ViewerSettings.prototype._getSliderT = function (slider) {
                    return (+slider.value - +slider.min) / (+slider.max - +slider.min);
                };
                ViewerSettings.prototype.onFovSliderChange = function (e) {
                    var slider = e.target;
                    var value = this._getSliderT(slider);
                    this.viewer.renderState.fov = value * (Math.PI * 0.995);
                };
                ViewerSettings.prototype.setCameraControllerClass = function (cameraControllerClass) {
                    this.viewer.setCameraControllerClass(cameraControllerClass);
                    this.cameraControllerSelected(cameraControllerClass);
                };
                ViewerSettings.prototype.cameraControllerSelected = function (cameraControllerClass) {
                    setElementHighlighted(this.cameraControllerWASD, cameraControllerClass === Viewer.FPSCameraController);
                    setElementHighlighted(this.cameraControllerOrbit, cameraControllerClass === Viewer.OrbitCameraController);
                };
                return ViewerSettings;
            }(Panel));
            ABOUT_ICON = "\n<svg viewBox=\"0 0 100 100\" height=\"16\" fill=\"white\"><path d=\"M50,1.1C23,1.1,1.1,23,1.1,50S23,98.9,50,98.9C77,98.9,98.9,77,98.9,50S77,1.1,50,1.1z M55.3,77.7c0,1.7-1.4,3.1-3.1,3.1  h-7.9c-1.7,0-3.1-1.4-3.1-3.1v-5.1c0-1.7,1.4-3.1,3.1-3.1h7.9c1.7,0,3.1,1.4,3.1,3.1V77.7z M67.8,47.3c-2.1,2.9-4.7,5.2-7.9,6.9  c-1.8,1.2-3,2.4-3.6,3.8c-0.4,0.9-0.7,2.1-0.9,3.5c-0.1,1.1-1.1,1.9-2.2,1.9h-9.7c-1.3,0-2.3-1.1-2.2-2.3c0.2-2.7,0.9-4.8,2-6.4  c1.4-1.9,3.9-4.2,7.5-6.7c1.9-1.2,3.3-2.6,4.4-4.3c1.1-1.7,1.6-3.7,1.6-6c0-2.3-0.6-4.2-1.9-5.6c-1.3-1.4-3-2.1-5.3-2.1  c-1.9,0-3.4,0.6-4.7,1.7c-0.8,0.7-1.3,1.6-1.6,2.8c-0.4,1.4-1.7,2.3-3.2,2.3l-9-0.2c-1.1,0-2-1-1.9-2.1c0.3-4.8,2.2-8.4,5.5-11  c3.8-2.9,8.7-4.4,14.9-4.4c6.6,0,11.8,1.7,15.6,5c3.8,3.3,5.7,7.8,5.7,13.5C70.9,41.2,69.8,44.4,67.8,47.3z\"/></svg>";
            About = /** @class */ (function (_super) {
                __extends(About, _super);
                function About() {
                    var _this = _super.call(this) || this;
                    _this.setTitle(ABOUT_ICON, 'About');
                    _this.contents.innerHTML = "\n<div id=\"About\">\n<style>\n#About {\n    padding: 12px;\n    line-height: 1.2;\n}\n#About a {\n    color: white;\n}\n#About li span {\n    color: #aaa;\n}\n#About h2 {\n    vertical-align: middle;\n    font-size: 2em;\n    text-align: center;\n    margin: 0px;\n}\n</style>\n\n<h2><img style=\"vertical-align: middle;\" src=\"logo.png\">MODEL VIEWER</h2>\n\n<p> <strong>CLICK AND DRAG</strong> to look around and use <strong>WASD</strong> to move the camera </p>\n<p> Hold <strong>SHIFT</strong> to go faster, and use <strong>MOUSE WHEEL</strong> to go faster than that.\n<strong>B</strong> resets the camera, and <strong>Z</strong> toggles the UI. </p>\n\n<p><strong>CODE PRIMARILY WRITTEN</strong> by <a href=\"https://github.com/magcius\">Jasper</a></p>\n\n<p><strong>MODELS</strong> \u00A9 Nintendo, SEGA, Retro Studios, FROM Software</p>\n\n<p><strong>CODE HELP AND FRIENDSHIP</strong> from\n<a href=\"https://twitter.com/beholdnec\">N.E.C.</a>,\n<a href=\"https://twitter.com/LordNed\">LordNed</a>,\n<a href=\"https://twitter.com/SageOfMirrors\">SageOfMirrors</a>,\n<a href=\"https://github.com/blank63\">blank63</a>,\n<a href=\"https://twitter.com/StapleButter\">StapleButter</a>,\n<a href=\"https://twitter.com/xdanieldzd\">xdanieldzd</a>,\n<a href=\"https://github.com/vlad001\">vlad001</a>,\n<a href=\"https://twitter.com/Jewelots_\">Jewel</a>,\n<a href=\"https://twitter.com/instant_grat\">Instant Grat</a>,\nand <a href=\"https://twitter.com/__Aruki\">Aruki</a></p>\n\n<p><strong>ICONS</strong> from <a href=\"https://thenounproject.com/\">The Noun Project</a>, used under Creative Commons CC-BY:</p>\n<ul>\n<li> Truncated Pyramid <span>by</span> Bohdan Burmich\n<li> Images <span>by</span> Creative Stall\n<li> Help <span>by</span> Gregor Cresnar\n<li> Open <span>by</span> Landan Lloyd\n<li> Nightshift <span>by</span> mikicon\n<li> Layer <span>by</span> Chameleon Design\n</ul>\n</div>\n";
                    return _this;
                }
                return About;
            }(Panel));
            LAYER_ICON = "<svg viewBox=\"0 0 16 16\" height=\"20\" fill=\"white\"><g transform=\"translate(0,-1036.3622)\"><path d=\"m 8,1039.2486 -0.21875,0.125 -4.90625,2.4375 5.125,2.5625 5.125,-2.5625 L 8,1039.2486 z m -3,4.5625 -2.125,0.9688 5.125,2.5625 5.125,-2.5625 -2.09375,-0.9688 -3.03125,1.5 -1,-0.5 -0.90625,-0.4375 L 5,1043.8111 z m 0,3 -2.125,0.9688 5.125,2.5625 5.125,-2.5625 -2.09375,-0.9688 -3.03125,1.5 -1,-0.5 -0.90625,-0.4375 L 5,1046.8111 z\"/></g></svg>";
            LayerPanel = /** @class */ (function (_super) {
                __extends(LayerPanel, _super);
                function LayerPanel() {
                    var _this = _super.call(this) || this;
                    _this.setTitle(LAYER_ICON, 'Layers');
                    _this.multiSelect = new MultiSelect();
                    _this.multiSelect.onitemchanged = _this._onItemChanged.bind(_this);
                    _this.contents.appendChild(_this.multiSelect.elem);
                    return _this;
                }
                LayerPanel.prototype._onItemChanged = function (index, visible) {
                    this.layers[index].setVisible(visible);
                };
                ;
                LayerPanel.prototype.setLayers = function (layers) {
                    this.layers = layers;
                    var strings = layers.map(function (layer) { return layer.name; });
                    var isOn = strings.map(function () { return true; });
                    this.multiSelect.setStrings(strings);
                    this.multiSelect.setItemsSelected(isOn);
                };
                return LayerPanel;
            }(Panel));
            exports_8("LayerPanel", LayerPanel);
            UI = /** @class */ (function () {
                function UI(viewer) {
                    this.viewer = viewer;
                    this.visible = false;
                    this.toplevel = document.createElement('div');
                    this.toplevel.style.display = 'grid';
                    this.toplevel.style.gridTemplateColumns = '1fr';
                    this.toplevel.style.gridGap = '20px';
                    this.toplevel.style.pointerEvents = 'none';
                    this.sceneSelect = new SceneSelect(viewer);
                    this.textureViewer = new TextureViewer();
                    this.viewerSettings = new ViewerSettings(viewer);
                    this.about = new About();
                    this.setScenePanels([]);
                    this.elem = this.toplevel;
                }
                UI.prototype.sceneChanged = function () {
                    var scene = this.viewer.scene;
                    var cameraControllerClass = this.viewer.cameraController.constructor;
                    // Set up UI.
                    this.viewerSettings.cameraControllerSelected(cameraControllerClass);
                    this.textureViewer.setTextureList(scene !== null ? scene.textures : []);
                };
                UI.prototype.setPanels = function (panels) {
                    this.toplevel.innerHTML = '';
                    try {
                        for (var panels_1 = __values(panels), panels_1_1 = panels_1.next(); !panels_1_1.done; panels_1_1 = panels_1.next()) {
                            var panel = panels_1_1.value;
                            this.toplevel.appendChild(panel.elem);
                        }
                    }
                    catch (e_14_1) { e_14 = { error: e_14_1 }; }
                    finally {
                        try {
                            if (panels_1_1 && !panels_1_1.done && (_a = panels_1.return)) _a.call(panels_1);
                        }
                        finally { if (e_14) throw e_14.error; }
                    }
                    var e_14, _a;
                };
                UI.prototype.setScenePanels = function (panels) {
                    this.setPanels(__spread([this.sceneSelect], panels, [this.textureViewer, this.viewerSettings, this.about]));
                };
                return UI;
            }());
            exports_8("UI", UI);
        }
    };
});
// tslint:disable:no-console
System.register("viewer", ["gl-matrix", "render"], function (exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    function clamp(v, min, max) {
        return Math.max(min, Math.min(v, max));
    }
    function clampRange(v, lim) {
        return clamp(v, -lim, lim);
    }
    var gl_matrix_2, render_1, InputManager, FPSCameraController, OrbitCameraController, Viewer;
    return {
        setters: [
            function (gl_matrix_2_1) {
                gl_matrix_2 = gl_matrix_2_1;
            },
            function (render_1_1) {
                render_1 = render_1_1;
            }
        ],
        execute: function () {
            InputManager = /** @class */ (function () {
                function InputManager(toplevel) {
                    this.grabbing = false;
                    this.toplevel = toplevel;
                    this.keysDown = new Map();
                    window.addEventListener('keydown', this._onKeyDown.bind(this));
                    window.addEventListener('keyup', this._onKeyUp.bind(this));
                    this.toplevel.addEventListener('wheel', this._onWheel.bind(this), { passive: false });
                    this.resetMouse();
                    this.toplevel.addEventListener('mousedown', this._onMouseDown.bind(this));
                    this.toplevel.addEventListener('mouseup', this._onMouseUp.bind(this));
                    this.toplevel.addEventListener('mousemove', this._onMouseMove.bind(this));
                }
                InputManager.prototype.isKeyDown = function (key) {
                    return this.keysDown.get(key.charCodeAt(0));
                };
                InputManager.prototype.isKeyDownRaw = function (keyCode) {
                    return this.keysDown.get(keyCode);
                };
                InputManager.prototype.isDragging = function () {
                    return this.grabbing;
                };
                InputManager.prototype.resetMouse = function () {
                    this.dx = 0;
                    this.dy = 0;
                    this.dz = 0;
                };
                InputManager.prototype._onKeyDown = function (e) {
                    this.keysDown.set(e.keyCode, true);
                };
                InputManager.prototype._onKeyUp = function (e) {
                    this.keysDown.delete(e.keyCode);
                };
                InputManager.prototype._onWheel = function (e) {
                    e.preventDefault();
                    this.dz += Math.sign(e.deltaY) * -4;
                };
                InputManager.prototype._setGrabbing = function (v) {
                    this.grabbing = v;
                    this.toplevel.style.cursor = v ? '-webkit-grabbing' : '-webkit-grab';
                    this.toplevel.style.cursor = v ? 'grabbing' : 'grab';
                    document.body.style.setProperty('pointer-events', v ? 'none' : '', 'important');
                    this.toplevel.style.setProperty('pointer-events', v ? 'auto' : '', 'important');
                };
                InputManager.prototype._onMouseMove = function (e) {
                    if (!this.grabbing)
                        return;
                    var dx = e.pageX - this.lastX;
                    var dy = e.pageY - this.lastY;
                    this.lastX = e.pageX;
                    this.lastY = e.pageY;
                    this.dx += dx;
                    this.dy += dy;
                };
                InputManager.prototype._onMouseUp = function (e) {
                    this._setGrabbing(false);
                    this.button = 0;
                };
                InputManager.prototype._onMouseDown = function (e) {
                    this.button = e.button;
                    this.lastX = e.pageX;
                    this.lastY = e.pageY;
                    this._setGrabbing(true);
                    // Needed to make the cursor update in Chrome. See:
                    // https://bugs.chromium.org/p/chromium/issues/detail?id=676644
                    this.toplevel.focus();
                    e.preventDefault();
                };
                return InputManager;
            }());
            FPSCameraController = /** @class */ (function () {
                function FPSCameraController() {
                    this.tmp = gl_matrix_2.mat4.create();
                    this.camera = gl_matrix_2.mat4.create();
                    this.speed = 10;
                }
                FPSCameraController.prototype.setInitialCamera = function (camera) {
                    gl_matrix_2.mat4.invert(this.camera, camera);
                };
                FPSCameraController.prototype.update = function (outCamera, inputManager, dt) {
                    var SHIFT = 16;
                    var tmp = this.tmp;
                    var camera = this.camera;
                    this.speed += inputManager.dz;
                    this.speed = Math.max(this.speed, 1);
                    var mult = this.speed;
                    if (inputManager.isKeyDownRaw(SHIFT))
                        mult *= 5;
                    mult *= (dt / 16.0);
                    var amt;
                    amt = 0;
                    if (inputManager.isKeyDown('W')) {
                        amt = -mult;
                    }
                    else if (inputManager.isKeyDown('S')) {
                        amt = mult;
                    }
                    tmp[14] = amt;
                    amt = 0;
                    if (inputManager.isKeyDown('A')) {
                        amt = -mult;
                    }
                    else if (inputManager.isKeyDown('D')) {
                        amt = mult;
                    }
                    tmp[12] = amt;
                    amt = 0;
                    if (inputManager.isKeyDown('Q')) {
                        amt = -mult;
                    }
                    else if (inputManager.isKeyDown('E')) {
                        amt = mult;
                    }
                    tmp[13] = amt;
                    if (inputManager.isKeyDown('B')) {
                        gl_matrix_2.mat4.identity(camera);
                    }
                    if (inputManager.isKeyDown('C')) {
                        console.log(camera);
                    }
                    var cu = gl_matrix_2.vec3.fromValues(camera[1], camera[5], camera[9]);
                    gl_matrix_2.vec3.normalize(cu, cu);
                    gl_matrix_2.mat4.rotate(camera, camera, -inputManager.dx / 500, cu);
                    gl_matrix_2.mat4.rotate(camera, camera, -inputManager.dy / 500, [1, 0, 0]);
                    gl_matrix_2.mat4.multiply(camera, camera, tmp);
                    // XXX: Is there any way to do this without the expensive inverse?
                    gl_matrix_2.mat4.invert(outCamera, camera);
                };
                return FPSCameraController;
            }());
            exports_9("FPSCameraController", FPSCameraController);
            OrbitCameraController = /** @class */ (function () {
                function OrbitCameraController() {
                    this.x = 0.15;
                    this.y = 0.35;
                    this.z = -150;
                    this.xVel = 0;
                    this.yVel = 0;
                    this.zVel = 0;
                    this.tx = 0;
                    this.ty = 0;
                    this.txVel = 0;
                    this.tyVel = 0;
                }
                OrbitCameraController.prototype.setInitialCamera = function (camera) {
                    // TODO(jstpierre)
                };
                OrbitCameraController.prototype.update = function (camera, inputManager, dt) {
                    // Get new velocities from inputs.
                    if (inputManager.button === 1) {
                        this.txVel += inputManager.dx * (-10 - Math.min(this.z, 0.01)) / 5000;
                        this.tyVel += inputManager.dy * (-10 - Math.min(this.z, 0.01)) / -5000;
                    }
                    else {
                        this.xVel += inputManager.dx / 200;
                        this.yVel += inputManager.dy / 200;
                    }
                    this.zVel += inputManager.dz;
                    if (inputManager.isKeyDown('A')) {
                        this.xVel += 0.05;
                    }
                    if (inputManager.isKeyDown('D')) {
                        this.xVel -= 0.05;
                    }
                    if (inputManager.isKeyDown('W')) {
                        this.yVel += 0.05;
                    }
                    if (inputManager.isKeyDown('S')) {
                        this.yVel -= 0.05;
                    }
                    // Apply velocities.
                    this.xVel = clampRange(this.xVel, 2);
                    this.yVel = clampRange(this.yVel, 2);
                    var drag = inputManager.isDragging() ? 0.92 : 0.96;
                    this.x += this.xVel / 10;
                    this.xVel *= drag;
                    this.y += this.yVel / 10;
                    this.yVel *= drag;
                    this.tx += this.txVel;
                    this.txVel *= drag;
                    this.ty += this.tyVel;
                    this.tyVel *= drag;
                    if (this.y < 0.04) {
                        this.y = 0.04;
                        this.yVel = 0;
                    }
                    if (this.y > 1.50) {
                        this.y = 1.50;
                        this.yVel = 0;
                    }
                    this.z += this.zVel;
                    this.zVel *= 0.8;
                    if (this.z > -10) {
                        this.z = -10;
                        this.zVel = 0;
                    }
                    // Calculate new camera from new x/y/z.
                    var sinX = Math.sin(this.x);
                    var cosX = Math.cos(this.x);
                    var sinY = Math.sin(this.y);
                    var cosY = Math.cos(this.y);
                    gl_matrix_2.mat4.copy(camera, gl_matrix_2.mat4.fromValues(cosX, sinY * sinX, -cosY * sinX, 0, 0, cosY, sinY, 0, sinX, -sinY * cosX, cosY * cosX, 0, this.tx, this.ty, this.z, 1));
                };
                return OrbitCameraController;
            }());
            exports_9("OrbitCameraController", OrbitCameraController);
            Viewer = /** @class */ (function () {
                function Viewer(canvas) {
                    this.canvas = canvas;
                    var gl = canvas.getContext("webgl2", { alpha: false, antialias: false });
                    this.renderState = new render_1.RenderState(gl);
                    this.inputManager = new InputManager(this.canvas);
                    this.camera = gl_matrix_2.mat4.create();
                    this.cameraController = null;
                    this.onscreenRenderTarget = new render_1.RenderTarget();
                }
                Viewer.prototype.reset = function () {
                    var gl = this.renderState.gl;
                    gl.activeTexture(gl.TEXTURE0);
                    gl.clearColor(0.88, 0.88, 0.88, 1);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    this.renderState.setClipPlanes(0.2, 50000);
                };
                Viewer.prototype.render = function () {
                    var gl = this.renderState.gl;
                    if (!this.scene)
                        return;
                    this.onscreenRenderTarget.setParameters(gl, this.canvas.width, this.canvas.height);
                    this.renderState.setOnscreenRenderTarget(this.onscreenRenderTarget);
                    this.renderState.reset();
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    // Main scene. This renders to the onscreen target.
                    this.scene.render(this.renderState);
                    this.renderState.useRealOnscreenRenderTarget(this.canvas.width, this.canvas.height);
                    this.renderState.blitRenderTarget(this.onscreenRenderTarget);
                    var frameEndTime = window.performance.now();
                    var diff = frameEndTime - this.renderState.frameStartTime;
                    // console.log(`Time: ${diff} Draw calls: ${state.drawCallCount}`);
                };
                Viewer.prototype.setCameraControllerClass = function (cameraController) {
                    this.cameraController = new cameraController();
                };
                Viewer.prototype.setScene = function (scene) {
                    var gl = this.renderState.gl;
                    this.reset();
                    if (this.scene) {
                        this.scene.destroy(gl);
                    }
                    if (scene) {
                        this.scene = scene;
                        if (this.scene.resetCamera) {
                            this.scene.resetCamera(this.camera);
                        }
                        else {
                            gl_matrix_2.mat4.identity(this.camera);
                        }
                        this.cameraController.setInitialCamera(this.camera);
                    }
                    else {
                        this.scene = null;
                    }
                };
                Viewer.prototype.start = function () {
                    var _this = this;
                    var camera = this.camera;
                    var canvas = this.canvas;
                    var t = 0;
                    var update = function (nt) {
                        var dt = nt - t;
                        t = nt;
                        if (_this.cameraController) {
                            _this.cameraController.update(camera, _this.inputManager, dt);
                        }
                        _this.inputManager.resetMouse();
                        _this.renderState.setView(camera);
                        _this.renderState.time += dt;
                        _this.render();
                        window.requestAnimationFrame(update);
                    };
                    update(0);
                };
                return Viewer;
            }());
            exports_9("Viewer", Viewer);
        }
    };
});
// Nintendo Yaz0 format.
System.register("yaz0", ["util", "ArrayBufferSlice"], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    function decompress(srcBuffer) {
        var srcView = srcBuffer.createDataView();
        util_3.assert(util_3.readString(srcBuffer, 0x00, 0x04) === 'Yaz0');
        var uncompressedSize = srcView.getUint32(0x04, false);
        var dstBuffer = new Uint8Array(uncompressedSize);
        var srcOffs = 0x10;
        var dstOffs = 0x00;
        while (true) {
            var commandByte = srcView.getUint8(srcOffs++);
            var i = 8;
            while (i--) {
                if (commandByte & (1 << i)) {
                    // Literal.
                    uncompressedSize--;
                    dstBuffer[dstOffs++] = srcView.getUint8(srcOffs++);
                }
                else {
                    var tmp = srcView.getUint16(srcOffs, false);
                    srcOffs += 2;
                    var windowOffset = (tmp & 0x0FFF) + 1;
                    var windowLength = (tmp >> 12) + 2;
                    if (windowLength === 2) {
                        windowLength += srcView.getUint8(srcOffs++) + 0x10;
                    }
                    util_3.assert(windowLength >= 3 && windowLength <= 0x111);
                    var copyOffs = dstOffs - windowOffset;
                    uncompressedSize -= windowLength;
                    while (windowLength--)
                        dstBuffer[dstOffs++] = dstBuffer[copyOffs++];
                }
                if (uncompressedSize <= 0)
                    return new ArrayBufferSlice_4.default(dstBuffer.buffer);
            }
        }
    }
    exports_10("decompress", decompress);
    var util_3, ArrayBufferSlice_4;
    return {
        setters: [
            function (util_3_1) {
                util_3 = util_3_1;
            },
            function (ArrayBufferSlice_4_1) {
                ArrayBufferSlice_4 = ArrayBufferSlice_4_1;
            }
        ],
        execute: function () {
        }
    };
});
// GX constants. Mostly taken from libogc.
System.register("gx/gx_enum", [], function (exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
// GX display list parsing.
System.register("gx/gx_displaylist", ["util"], function (exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    function getComponentSize(dataType) {
        switch (dataType) {
            case 0 /* U8 */:
            case 1 /* S8 */:
            case 5 /* RGBA8 */:
                return 1;
            case 2 /* U16 */:
            case 3 /* S16 */:
                return 2;
            case 4 /* F32 */:
                return 4;
        }
    }
    exports_12("getComponentSize", getComponentSize);
    function getNumComponents(vtxAttrib, componentCount) {
        switch (vtxAttrib) {
            case 0 /* PNMTXIDX */:
            case 1 /* TEX0MTXIDX */:
            case 2 /* TEX1MTXIDX */:
            case 3 /* TEX2MTXIDX */:
            case 4 /* TEX3MTXIDX */:
            case 5 /* TEX4MTXIDX */:
            case 6 /* TEX5MTXIDX */:
            case 7 /* TEX6MTXIDX */:
            case 8 /* TEX7MTXIDX */:
                return 1;
            case 9 /* POS */:
                if (componentCount === 0 /* POS_XY */)
                    return 2;
                else if (componentCount === 1 /* POS_XYZ */)
                    return 3;
            case 10 /* NRM */:
            case 25 /* NBT */:
                if (componentCount === 0 /* NRM_XYZ */)
                    return 3;
                else
                    throw new Error("whoops");
            case 11 /* CLR0 */:
            case 12 /* CLR1 */:
                if (componentCount === 0 /* CLR_RGB */)
                    return 3;
                else if (componentCount === 1 /* CLR_RGBA */)
                    return 4;
            case 13 /* TEX0 */:
            case 14 /* TEX1 */:
            case 15 /* TEX2 */:
            case 16 /* TEX3 */:
            case 17 /* TEX4 */:
            case 18 /* TEX5 */:
            case 19 /* TEX6 */:
            case 20 /* TEX7 */:
                if (componentCount === 0 /* TEX_S */)
                    return 1;
                else if (componentCount === 1 /* TEX_ST */)
                    return 2;
            case 255 /* NULL */:
                // Shouldn't ever happen
                throw new Error("whoops");
        }
    }
    exports_12("getNumComponents", getNumComponents);
    function getAttrName(vtxAttrib) {
        switch (vtxAttrib) {
            case 0 /* PNMTXIDX */: return "PNMTXIDX";
            case 1 /* TEX0MTXIDX */: return "TEX0MTXIDX';";
            case 2 /* TEX1MTXIDX */: return "TEX1MTXIDX';";
            case 3 /* TEX2MTXIDX */: return "TEX2MTXIDX';";
            case 4 /* TEX3MTXIDX */: return "TEX3MTXIDX';";
            case 5 /* TEX4MTXIDX */: return "TEX4MTXIDX';";
            case 6 /* TEX5MTXIDX */: return "TEX5MTXIDX';";
            case 7 /* TEX6MTXIDX */: return "TEX6MTXIDX';";
            case 8 /* TEX7MTXIDX */: return "TEX7MTXIDX';";
            case 9 /* POS */: return "POS";
            case 10 /* NRM */: return "NRM";
            case 25 /* NBT */: return "NBT";
            case 11 /* CLR0 */: return "CLR0";
            case 12 /* CLR1 */: return "CLR1";
            case 13 /* TEX0 */: return "TEX0";
            case 14 /* TEX1 */: return "TEX1";
            case 15 /* TEX2 */: return "TEX2";
            case 16 /* TEX3 */: return "TEX3";
            case 17 /* TEX4 */: return "TEX4";
            case 18 /* TEX5 */: return "TEX5";
            case 19 /* TEX6 */: return "TEX6";
            case 20 /* TEX7 */: return "TEX7";
            case 255 /* NULL */: throw new Error("whoops");
        }
    }
    function translateVattrLayout(vat, vtxDescs) {
        // First, set up our vertex layout.
        var dstAttrOffsets = [];
        var srcAttrSizes = [];
        var srcVertexSize = 0;
        var dstVertexSize = 0;
        var firstCompSize;
        for (var vtxAttrib = 0; vtxAttrib < vat.length; vtxAttrib++) {
            var vtxDesc = vtxDescs[vtxAttrib];
            if (!vtxDesc)
                continue;
            var compSize = getComponentSize(vat[vtxAttrib].compType);
            var compCnt = getNumComponents(vtxAttrib, vat[vtxAttrib].compCnt);
            var attrByteSize = compSize * compCnt;
            switch (vtxDesc.type) {
                case 0 /* NONE */:
                    continue;
                case 1 /* DIRECT */:
                    srcVertexSize += attrByteSize;
                    break;
                case 2 /* INDEX8 */:
                    srcVertexSize += 1;
                    break;
                case 3 /* INDEX16 */:
                    srcVertexSize += 2;
                    break;
            }
            dstVertexSize = util_4.align(dstVertexSize, compSize);
            dstAttrOffsets[vtxAttrib] = dstVertexSize;
            srcAttrSizes[vtxAttrib] = attrByteSize;
            dstVertexSize += attrByteSize;
        }
        // Align the whole thing to our minimum required alignment (F32).
        dstVertexSize = util_4.align(dstVertexSize, 4);
        return { dstVertexSize: dstVertexSize, dstAttrOffsets: dstAttrOffsets, srcAttrSizes: srcAttrSizes, srcVertexSize: srcVertexSize };
    }
    function _compileVtxLoader(vat, vtxDescs) {
        var vattrLayout = translateVattrLayout(vat, vtxDescs);
        function compileVattr(vtxAttrib) {
            if (!vtxDescs[vtxAttrib])
                return '';
            var srcAttrSize = vattrLayout.srcAttrSizes[vtxAttrib];
            if (srcAttrSize === undefined)
                return '';
            function readIndexTemplate(readIndex, drawCallIdxIncr) {
                var attrOffs = "vtxArrays[" + vtxAttrib + "].offs + (" + srcAttrSize + " * " + readIndex + ")";
                return ("\n        dstVertexData.set(vtxArrays[" + vtxAttrib + "].buffer.createTypedArray(Uint8Array, " + attrOffs + ", " + srcAttrSize + "), " + dstOffs + ");\n        drawCallIdx += " + drawCallIdxIncr + ";").trim();
            }
            var dstOffs = "dstVertexDataOffs + " + vattrLayout.dstAttrOffsets[vtxAttrib];
            var readVertex = '';
            switch (vtxDescs[vtxAttrib].type) {
                case 0 /* NONE */:
                    return '';
                case 2 /* INDEX8 */:
                    readVertex = readIndexTemplate("view.getUint8(drawCallIdx)", 1);
                    break;
                case 3 /* INDEX16 */:
                    readVertex = readIndexTemplate("view.getUint16(drawCallIdx)", 2);
                    break;
                case 1 /* DIRECT */:
                    readVertex = ("\n        dstVertexData.set(srcBuffer.createTypedArray(Uint8Array, drawCallIdx, " + srcAttrSize + "), " + dstOffs + ");\n        drawCallIdx += " + srcAttrSize + ";\n        ").trim();
                    break;
                default:
                    throw new Error("whoops");
            }
            return ("\n        // " + getAttrName(vtxAttrib) + "\n        " + readVertex).trim();
        }
        function compileVattrs() {
            var sources = [];
            for (var vtxAttrib = 0; vtxAttrib < vat.length; vtxAttrib++) {
                sources.push(compileVattr(vtxAttrib));
            }
            return sources.join('');
        }
        var source = "\n\"use strict\";\n\n// Parse display list.\nconst view = srcBuffer.createDataView();\nconst drawCalls = [];\nlet totalVertexCount = 0;\nlet totalTriangleCount = 0;\nlet drawCallIdx = 0;\nwhile (true) {\n    if (drawCallIdx >= srcBuffer.byteLength)\n        break;\n    const cmd = view.getUint8(drawCallIdx);\n    if (cmd === 0)\n        break;\n\n    const primType = cmd & 0xF8;\n    const vertexFormat = cmd & 0x07;\n\n    const vertexCount = view.getUint16(drawCallIdx + 0x01);\n    drawCallIdx += 0x03;\n    const srcOffs = drawCallIdx;\n    const first = totalVertexCount;\n    totalVertexCount += vertexCount;\n\n    switch (primType) {\n    case " + 160 /* TRIANGLEFAN */ + ":\n    case " + 152 /* TRIANGLESTRIP */ + ":\n        totalTriangleCount += (vertexCount - 2);\n        break;\n    default:\n        throw \"whoops\";\n    }\n\n    drawCalls.push({ primType, vertexFormat, srcOffs, vertexCount });\n\n    // Skip over the index data.\n    drawCallIdx += " + vattrLayout.srcVertexSize + " * vertexCount;\n}\n\n// Now make the data.\nlet indexDataIdx = 0;\nconst dstIndexData = new Uint16Array(totalTriangleCount * 3);\nlet vertexId = 0;\n\nconst dstVertexDataSize = " + vattrLayout.dstVertexSize + " * totalVertexCount;\nconst dstVertexData = new Uint8Array(dstVertexDataSize);\nlet dstVertexDataOffs = 0;\nfor (let z = 0; z < drawCalls.length; z++) {\n    const drawCall = drawCalls[z];\n\n    // Convert topology to triangles.\n    const firstVertex = vertexId;\n\n    // First triangle is the same for all topo.\n    for (let i = 0; i < 3; i++)\n        dstIndexData[indexDataIdx++] = vertexId++;\n\n    switch (drawCall.primType) {\n    case " + 152 /* TRIANGLESTRIP */ + ":\n        for (let i = 3; i < drawCall.vertexCount; i++) {\n            dstIndexData[indexDataIdx++] = vertexId - ((i & 1) ? 1 : 2);\n            dstIndexData[indexDataIdx++] = vertexId - ((i & 1) ? 2 : 1);\n            dstIndexData[indexDataIdx++] = vertexId++;\n        }\n        break;\n    case " + 160 /* TRIANGLEFAN */ + ":\n        for (let i = 3; i < drawCall.vertexCount; i++) {\n            dstIndexData[indexDataIdx++] = firstVertex;\n            dstIndexData[indexDataIdx++] = vertexId - 1;\n            dstIndexData[indexDataIdx++] = vertexId++;\n        }\n        break;\n    }\n\n    let drawCallIdx = drawCall.srcOffs;\n    // Scratch.\n    for (let j = 0; j < drawCall.vertexCount; j++) {\n" + compileVattrs() + "\n        dstVertexDataOffs += " + vattrLayout.dstVertexSize + ";\n    }\n}\nreturn { indexData: dstIndexData, packedVertexData: dstVertexData, totalVertexCount: totalVertexCount, totalTriangleCount: totalTriangleCount };\n";
        var runVertices = new Function('vtxArrays', 'srcBuffer', source);
        return { vattrLayout: vattrLayout, runVertices: runVertices };
    }
    function coalesceLoadedDatas(loadedDatas) {
        var totalTriangleCount = 0;
        var totalVertexCount = 0;
        var indexDataSize = 0;
        var packedVertexDataSize = 0;
        try {
            for (var loadedDatas_1 = __values(loadedDatas), loadedDatas_1_1 = loadedDatas_1.next(); !loadedDatas_1_1.done; loadedDatas_1_1 = loadedDatas_1.next()) {
                var loadedData = loadedDatas_1_1.value;
                totalTriangleCount += loadedData.totalTriangleCount;
                totalVertexCount += loadedData.totalVertexCount;
                indexDataSize += loadedData.indexData.byteLength;
                packedVertexDataSize += loadedData.packedVertexData.byteLength;
            }
        }
        catch (e_15_1) { e_15 = { error: e_15_1 }; }
        finally {
            try {
                if (loadedDatas_1_1 && !loadedDatas_1_1.done && (_a = loadedDatas_1.return)) _a.call(loadedDatas_1);
            }
            finally { if (e_15) throw e_15.error; }
        }
        var indexData = new Uint16Array(indexDataSize);
        var packedVertexData = new Uint8Array(packedVertexDataSize);
        var indexDataOffs = 0;
        var packedVertexDataOffs = 0;
        try {
            for (var loadedDatas_2 = __values(loadedDatas), loadedDatas_2_1 = loadedDatas_2.next(); !loadedDatas_2_1.done; loadedDatas_2_1 = loadedDatas_2.next()) {
                var loadedData = loadedDatas_2_1.value;
                indexData.set(loadedData.indexData, indexDataOffs);
                packedVertexData.set(loadedData.packedVertexData, packedVertexDataOffs);
                indexDataOffs += loadedData.indexData.byteLength;
                packedVertexDataOffs += loadedData.packedVertexData.byteLength;
            }
        }
        catch (e_16_1) { e_16 = { error: e_16_1 }; }
        finally {
            try {
                if (loadedDatas_2_1 && !loadedDatas_2_1.done && (_b = loadedDatas_2.return)) _b.call(loadedDatas_2);
            }
            finally { if (e_16) throw e_16.error; }
        }
        return { indexData: indexData, packedVertexData: packedVertexData, totalTriangleCount: totalTriangleCount, totalVertexCount: totalVertexCount };
        var e_15, _a, e_16, _b;
    }
    exports_12("coalesceLoadedDatas", coalesceLoadedDatas);
    var util_4, VtxLoaderCache, cache, compileVtxLoader;
    return {
        setters: [
            function (util_4_1) {
                util_4 = util_4_1;
            }
        ],
        execute: function () {
            VtxLoaderCache = /** @class */ (function () {
                function VtxLoaderCache() {
                    var _this = this;
                    this.cache = new Map();
                    this.compileVtxLoader = function (vat, vtxDescs) {
                        var key = _this.makeKey(vat, vtxDescs);
                        if (!_this.cache.has(key))
                            _this.cache.set(key, _compileVtxLoader(vat, vtxDescs));
                        return _this.cache.get(key);
                    };
                }
                VtxLoaderCache.prototype.makeKey = function (vat, vtxDescs) {
                    return JSON.stringify({ vat: vat, vtxDescs: vtxDescs });
                };
                return VtxLoaderCache;
            }());
            cache = new VtxLoaderCache();
            exports_12("compileVtxLoader", compileVtxLoader = cache.compileVtxLoader);
        }
    };
});
System.register("sm64ds/nitro_tex", [], function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    function expand3to8(n) {
        return (n << (8 - 3)) | (n << (8 - 6)) | (n >>> (9 - 8));
    }
    function expand5to8(n) {
        return (n << (8 - 5)) | (n >>> (10 - 8));
    }
    function s3tcblend(a, b) {
        // return (a*3 + b*5) / 8;
        return (((a << 1) + a) + ((b << 2) + b)) >>> 3;
    }
    function bgr5(pixels, dstOffs, p) {
        pixels[dstOffs + 0] = expand5to8(p & 0x1F);
        pixels[dstOffs + 1] = expand5to8((p >>> 5) & 0x1F);
        pixels[dstOffs + 2] = expand5to8((p >>> 10) & 0x1F);
    }
    exports_13("bgr5", bgr5);
    function readTexture_A3I5(width, height, texData, palData) {
        var pixels = new Uint8Array(width * height * 4);
        var texView = texData.createDataView();
        var palView = palData.createDataView();
        var srcOffs = 0;
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var texBlock = texView.getUint8(srcOffs++);
                var palIdx = (texBlock & 0x1F) << 1;
                var alpha = texBlock >>> 5;
                var p = palView.getUint16(palIdx, true);
                var dstOffs = 4 * ((y * width) + x);
                bgr5(pixels, dstOffs, p);
                pixels[dstOffs + 3] = expand3to8(alpha);
            }
        }
        return pixels;
    }
    function readTexture_Palette16(width, height, texData, palData, color0) {
        var pixels = new Uint8Array(width * height * 4);
        var texView = texData.createDataView();
        var palView = palData.createDataView();
        var srcOffs = 0;
        for (var y = 0; y < height; y++) {
            for (var xx = 0; xx < width; xx += 4) {
                var texBlock = texView.getUint16(srcOffs, true);
                srcOffs += 2;
                for (var x = 0; x < 4; x++) {
                    var palIdx = texBlock & 0x0F;
                    var p = palView.getUint16(palIdx * 2, true);
                    var dstOffs = 4 * ((y * width) + xx + x);
                    bgr5(pixels, dstOffs, p);
                    pixels[dstOffs + 3] = palIdx === 0 ? (color0 ? 0x00 : 0xFF) : 0xFF;
                    texBlock >>= 4;
                }
            }
        }
        return pixels;
    }
    function readTexture_Palette256(width, height, texData, palData, color0) {
        var pixels = new Uint8Array(width * height * 4);
        var texView = texData.createDataView();
        var palView = palData.createDataView();
        var srcOffs = 0;
        for (var y = 0; y < height; y++) {
            for (var xx = 0; xx < width; xx++) {
                var palIdx = texView.getUint8(srcOffs++);
                var p = palView.getUint16(palIdx * 2, true);
                var dstOffs = 4 * ((y * width) + xx);
                bgr5(pixels, dstOffs, p);
                pixels[dstOffs + 3] = palIdx === 0 ? (color0 ? 0x00 : 0xFF) : 0xFF;
            }
        }
        return pixels;
    }
    function readTexture_CMPR_4x4(width, height, texData, palData) {
        function getPal16(offs) {
            return offs < palView.byteLength ? palView.getUint16(offs, true) : 0;
        }
        function buildColorTable(palBlock) {
            var palMode = palBlock >> 14;
            var palOffs = (palBlock & 0x3FFF) << 2;
            var colorTable = new Uint8Array(16);
            var p0 = getPal16(palOffs + 0x00);
            bgr5(colorTable, 0, p0);
            colorTable[3] = 0xFF;
            var p1 = getPal16(palOffs + 0x02);
            bgr5(colorTable, 4, p1);
            colorTable[7] = 0xFF;
            if (palMode === 0) {
                // PTY=0, A=0
                var p2 = getPal16(palOffs + 0x04);
                bgr5(colorTable, 8, p2);
                colorTable[11] = 0xFF;
                // Color4 is transparent black.
            }
            else if (palMode === 1) {
                // PTY=1, A=0
                // Color3 is a blend of Color1/Color2.
                colorTable[8] = (colorTable[0] + colorTable[4]) >>> 1;
                colorTable[9] = (colorTable[1] + colorTable[5]) >>> 1;
                colorTable[10] = (colorTable[2] + colorTable[6]) >>> 1;
                colorTable[11] = 0xFF;
                // Color4 is transparent black.
            }
            else if (palMode === 2) {
                // PTY=0, A=1
                var p2 = getPal16(palOffs + 0x04);
                bgr5(colorTable, 8, p2);
                colorTable[11] = 0xFF;
                var p3 = getPal16(palOffs + 0x06);
                bgr5(colorTable, 12, p3);
                colorTable[15] = 0xFF;
            }
            else {
                colorTable[8] = s3tcblend(colorTable[4], colorTable[0]);
                colorTable[9] = s3tcblend(colorTable[5], colorTable[1]);
                colorTable[10] = s3tcblend(colorTable[6], colorTable[2]);
                colorTable[11] = 0xFF;
                colorTable[12] = s3tcblend(colorTable[0], colorTable[4]);
                colorTable[13] = s3tcblend(colorTable[1], colorTable[5]);
                colorTable[14] = s3tcblend(colorTable[2], colorTable[6]);
                colorTable[15] = 0xFF;
            }
            return colorTable;
        }
        var pixels = new Uint8Array(width * height * 4);
        var texView = texData.createDataView();
        var palView = palData.createDataView();
        var palIdxStart = (width * height) / 4;
        var srcOffs = 0;
        for (var yy = 0; yy < height; yy += 4) {
            for (var xx = 0; xx < width; xx += 4) {
                var texBlock = texView.getUint32((srcOffs * 0x04), true);
                var palBlock = texView.getUint16(palIdxStart + (srcOffs * 0x02), true);
                var colorTable = buildColorTable(palBlock);
                for (var y = 0; y < 4; y++) {
                    for (var x = 0; x < 4; x++) {
                        var colorIdx = texBlock & 0x03;
                        var dstOffs = 4 * (((yy + y) * width) + xx + x);
                        pixels[dstOffs + 0] = colorTable[colorIdx * 4 + 0];
                        pixels[dstOffs + 1] = colorTable[colorIdx * 4 + 1];
                        pixels[dstOffs + 2] = colorTable[colorIdx * 4 + 2];
                        pixels[dstOffs + 3] = colorTable[colorIdx * 4 + 3];
                        texBlock >>= 2;
                    }
                }
                srcOffs++;
            }
        }
        return pixels;
    }
    function readTexture_A5I3(width, height, texData, palData) {
        var pixels = new Uint8Array(width * height * 4);
        var texView = texData.createDataView();
        var palView = palData.createDataView();
        var srcOffs = 0;
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var texBlock = texView.getUint8(srcOffs++);
                var palIdx = (texBlock & 0x03) << 1;
                var alpha = texBlock >>> 3;
                var p = palView.getUint16(palIdx, true);
                var dstOffs = 4 * ((y * width) + x);
                bgr5(pixels, dstOffs, p);
                pixels[dstOffs + 3] = expand5to8(alpha);
            }
        }
        return pixels;
    }
    function readTexture_Direct(width, height, texData) {
        var pixels = new Uint8Array(width * height * 4);
        var texView = texData.createDataView();
        var srcOffs = 0;
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var p = texView.getUint16(srcOffs, true);
                var dstOffs = 4 * ((y * width) + x);
                bgr5(pixels, dstOffs, p);
                pixels[dstOffs + 3] = 0xFF;
                srcOffs += 2;
            }
        }
        return pixels;
    }
    function readTexture(format, width, height, texData, palData, color0) {
        switch (format) {
            case Format.Tex_A3I5:
                return readTexture_A3I5(width, height, texData, palData);
            case Format.Tex_Palette16:
                return readTexture_Palette16(width, height, texData, palData, color0);
            case Format.Tex_Palette256:
                return readTexture_Palette256(width, height, texData, palData, color0);
            case Format.Tex_CMPR_4x4:
                return readTexture_CMPR_4x4(width, height, texData, palData);
            case Format.Tex_A5I3:
                return readTexture_A5I3(width, height, texData, palData);
            case Format.Tex_Direct:
                return readTexture_Direct(width, height, texData);
            default:
                throw new Error("Unsupported texture type! " + format);
        }
    }
    exports_13("readTexture", readTexture);
    var Format;
    return {
        setters: [],
        execute: function () {
            // Read DS texture formats.
            (function (Format) {
                Format[Format["Tex_None"] = 0] = "Tex_None";
                Format[Format["Tex_A3I5"] = 1] = "Tex_A3I5";
                Format[Format["Tex_Palette4"] = 2] = "Tex_Palette4";
                Format[Format["Tex_Palette16"] = 3] = "Tex_Palette16";
                Format[Format["Tex_Palette256"] = 4] = "Tex_Palette256";
                Format[Format["Tex_CMPR_4x4"] = 5] = "Tex_CMPR_4x4";
                Format[Format["Tex_A5I3"] = 6] = "Tex_A5I3";
                Format[Format["Tex_Direct"] = 7] = "Tex_Direct";
            })(Format || (Format = {}));
            exports_13("Format", Format);
        }
    };
});
// Read DS Geometry Engine commands.
System.register("sm64ds/nitro_gx", ["sm64ds/nitro_tex"], function (exports_14, context_14) {
    "use strict";
    var __moduleName = context_14 && context_14.id;
    function bgr5(pixel) {
        nitro_tex_1.bgr5(tmp, 0, pixel);
        var r = tmp[0], g = tmp[1], b = tmp[2];
        return { r: r, g: g, b: b };
    }
    exports_14("bgr5", bgr5);
    function cmd_MTX_RESTORE(ctx) {
        // XXX: We don't implement the matrix stack yet.
        ctx.readParam();
    }
    function cmd_COLOR(ctx) {
        var param = ctx.readParam();
        ctx.s_color = bgr5(param);
    }
    function cmd_NORMAL(ctx) {
        var param = ctx.readParam();
    }
    function cmd_TEXCOORD(ctx) {
        var param = ctx.readParam();
        var s = param & 0xFFFF;
        var t = param >> 16;
        // Sign extend.
        s = (s << 16 >> 16);
        t = (t << 16 >> 16);
        // Fixed point.
        s = s / 16.0;
        t = t / 16.0;
        ctx.s_texCoord = { s: s, t: t };
    }
    function cmd_VTX_16(ctx) {
        var param1 = ctx.readParam();
        var x = (param1 & 0xFFFF);
        var y = (param1 >> 16) & 0xFFFF;
        var param2 = ctx.readParam();
        var z = (param2 & 0xFFFF);
        // Sign extend.
        x = (x << 16 >> 16);
        y = (y << 16 >> 16);
        z = (z << 16 >> 16);
        // Fixed point.
        x = x / 4096.0;
        y = y / 4096.0;
        z = z / 4096.0;
        ctx.vtx(x, y, z);
    }
    function cmd_VTX_10(ctx) {
        var param = ctx.readParam();
        var x = (param & 0x03FF);
        var y = (param >> 10) & 0x03FF;
        var z = (param >> 20) & 0x03FF;
        // Sign extend.
        x = (x << 22 >> 22);
        y = (y << 22 >> 22);
        z = (z << 22 >> 22);
        // Fixed point.
        x = x / 64.0;
        y = y / 64.0;
        z = z / 64.0;
        ctx.vtx(x, y, z);
    }
    function cmd_VTX_XY(ctx) {
        var param = ctx.readParam();
        var x = (param & 0xFFFF);
        var y = (param >> 16) & 0xFFFF;
        // Sign extend.
        x = (x << 16 >> 16);
        y = (y << 16 >> 16);
        // Fixed point.
        x = x / 4096.0;
        y = y / 4096.0;
        ctx.vtx(x, y, ctx.s_vtx.z);
    }
    function cmd_VTX_XZ(ctx) {
        var param = ctx.readParam();
        var x = (param & 0xFFFF);
        var z = (param >> 16) & 0xFFFF;
        // Sign extend.
        x = (x << 16 >> 16);
        z = (z << 16 >> 16);
        // Fixed point.
        x = x / 4096.0;
        z = z / 4096.0;
        ctx.vtx(x, ctx.s_vtx.y, z);
    }
    function cmd_VTX_YZ(ctx) {
        var param = ctx.readParam();
        var y = (param & 0xFFFF);
        var z = (param >> 16) & 0xFFFF;
        // Sign extend.
        y = (y << 16 >> 16);
        z = (z << 16 >> 16);
        // Fixed point.
        y = y / 4096.0;
        z = z / 4096.0;
        ctx.vtx(ctx.s_vtx.x, y, z);
    }
    function cmd_VTX_DIFF(ctx) {
        var param = ctx.readParam();
        var x = (param & 0x03FF);
        var y = (param >> 10) & 0x03FF;
        var z = (param >> 20) & 0x03FF;
        // Sign extend.
        x = (x << 22 >> 22);
        y = (y << 22 >> 22);
        z = (z << 22 >> 22);
        // Fixed point.
        x = x / 4096.0;
        y = y / 4096.0;
        z = z / 4096.0;
        // Add on the difference...
        x += ctx.s_vtx.x;
        y += ctx.s_vtx.y;
        z += ctx.s_vtx.z;
        ctx.vtx(x, y, z);
    }
    function cmd_DIF_AMB(ctx) {
        var param = ctx.readParam();
        // TODO: lighting
    }
    function cmd_BEGIN_VTXS(ctx) {
        var param = ctx.readParam();
        var polyType = param & 0x03;
        ctx.s_polyType = polyType;
        ctx.vtxs = [];
    }
    function cmd_END_VTXS(ctx) {
        var nVerts = ctx.vtxs.length;
        var vtxBuffer = new Float32Array(nVerts * VERTEX_SIZE);
        for (var i = 0; i < nVerts; i++) {
            var v = ctx.vtxs[i];
            var vtxArray = new Float32Array(vtxBuffer.buffer, i * VERTEX_BYTES, VERTEX_SIZE);
            vtxArray[0] = v.pos.x;
            vtxArray[1] = v.pos.y;
            vtxArray[2] = v.pos.z;
            vtxArray[3] = v.color.r / 0xFF;
            vtxArray[4] = v.color.g / 0xFF;
            vtxArray[5] = v.color.b / 0xFF;
            vtxArray[6] = ctx.alpha / 0xFF;
            vtxArray[7] = v.uv.s;
            vtxArray[8] = v.uv.t;
        }
        var idxBuffer;
        if (ctx.s_polyType === PolyType.TRIANGLES) {
            idxBuffer = new Uint16Array(nVerts);
            for (var i = 0; i < nVerts; i++)
                idxBuffer[i] = i;
        }
        else if (ctx.s_polyType === PolyType.QUADS) {
            idxBuffer = new Uint16Array(nVerts / 4 * 6);
            var dst = 0;
            for (var i = 0; i < nVerts; i += 4) {
                idxBuffer[dst++] = i + 0;
                idxBuffer[dst++] = i + 1;
                idxBuffer[dst++] = i + 2;
                idxBuffer[dst++] = i + 2;
                idxBuffer[dst++] = i + 3;
                idxBuffer[dst++] = i + 0;
            }
        }
        else if (ctx.s_polyType === PolyType.TRIANGLE_STRIP) {
            idxBuffer = new Uint16Array((nVerts - 2) * 3);
            var dst = 0;
            for (var i = 0; i < nVerts - 2; i++) {
                if (i % 2 === 0) {
                    idxBuffer[dst++] = i + 0;
                    idxBuffer[dst++] = i + 1;
                    idxBuffer[dst++] = i + 2;
                }
                else {
                    idxBuffer[dst++] = i + 1;
                    idxBuffer[dst++] = i + 0;
                    idxBuffer[dst++] = i + 2;
                }
            }
        }
        else if (ctx.s_polyType === PolyType.QUAD_STRIP) {
            idxBuffer = new Uint16Array(((nVerts - 2) / 2) * 6);
            var dst = 0;
            for (var i = 0; i < nVerts; i += 2) {
                idxBuffer[dst++] = i + 0;
                idxBuffer[dst++] = i + 1;
                idxBuffer[dst++] = i + 3;
                idxBuffer[dst++] = i + 3;
                idxBuffer[dst++] = i + 2;
                idxBuffer[dst++] = i + 0;
            }
        }
        var packet = { vertData: vtxBuffer, idxData: idxBuffer, polyType: ctx.s_polyType };
        ctx.packets.push(packet);
    }
    function runCmd(ctx, cmd) {
        switch (cmd) {
            case 0: return;
            case CmdType.MTX_RESTORE: return cmd_MTX_RESTORE(ctx);
            case CmdType.COLOR: return cmd_COLOR(ctx);
            case CmdType.NORMAL: return cmd_NORMAL(ctx);
            case CmdType.TEXCOORD: return cmd_TEXCOORD(ctx);
            case CmdType.VTX_16: return cmd_VTX_16(ctx);
            case CmdType.VTX_10: return cmd_VTX_10(ctx);
            case CmdType.VTX_XY: return cmd_VTX_XY(ctx);
            case CmdType.VTX_XZ: return cmd_VTX_XZ(ctx);
            case CmdType.VTX_YZ: return cmd_VTX_YZ(ctx);
            case CmdType.VTX_DIFF: return cmd_VTX_DIFF(ctx);
            case CmdType.DIF_AMB: return cmd_DIF_AMB(ctx);
            case CmdType.BEGIN_VTXS: return cmd_BEGIN_VTXS(ctx);
            case CmdType.END_VTXS: return cmd_END_VTXS(ctx);
            default: console.warn("Missing command", cmd.toString(16));
        }
    }
    function readCmds(buffer, baseCtx) {
        var ctx = new ContextInternal(buffer, baseCtx);
        while (ctx.offs < buffer.byteLength) {
            // Commands are packed 4 at a time...
            var cmd0 = ctx.view.getUint8(ctx.offs++);
            var cmd1 = ctx.view.getUint8(ctx.offs++);
            var cmd2 = ctx.view.getUint8(ctx.offs++);
            var cmd3 = ctx.view.getUint8(ctx.offs++);
            runCmd(ctx, cmd0);
            runCmd(ctx, cmd1);
            runCmd(ctx, cmd2);
            runCmd(ctx, cmd3);
        }
        return ctx.packets;
    }
    exports_14("readCmds", readCmds);
    var nitro_tex_1, CmdType, PolyType, VERTEX_SIZE, VERTEX_BYTES, tmp, Context, ContextInternal;
    return {
        setters: [
            function (nitro_tex_1_1) {
                nitro_tex_1 = nitro_tex_1_1;
            }
        ],
        execute: function () {
            // tslint:disable:variable-name
            (function (CmdType) {
                CmdType[CmdType["MTX_RESTORE"] = 20] = "MTX_RESTORE";
                CmdType[CmdType["COLOR"] = 32] = "COLOR";
                CmdType[CmdType["NORMAL"] = 33] = "NORMAL";
                CmdType[CmdType["TEXCOORD"] = 34] = "TEXCOORD";
                CmdType[CmdType["VTX_16"] = 35] = "VTX_16";
                CmdType[CmdType["VTX_10"] = 36] = "VTX_10";
                CmdType[CmdType["VTX_XY"] = 37] = "VTX_XY";
                CmdType[CmdType["VTX_XZ"] = 38] = "VTX_XZ";
                CmdType[CmdType["VTX_YZ"] = 39] = "VTX_YZ";
                CmdType[CmdType["VTX_DIFF"] = 40] = "VTX_DIFF";
                CmdType[CmdType["DIF_AMB"] = 48] = "DIF_AMB";
                CmdType[CmdType["BEGIN_VTXS"] = 64] = "BEGIN_VTXS";
                CmdType[CmdType["END_VTXS"] = 65] = "END_VTXS";
            })(CmdType || (CmdType = {}));
            (function (PolyType) {
                PolyType[PolyType["TRIANGLES"] = 0] = "TRIANGLES";
                PolyType[PolyType["QUADS"] = 1] = "QUADS";
                PolyType[PolyType["TRIANGLE_STRIP"] = 2] = "TRIANGLE_STRIP";
                PolyType[PolyType["QUAD_STRIP"] = 3] = "QUAD_STRIP";
            })(PolyType || (PolyType = {}));
            // 3 pos + 4 color + 2 uv
            VERTEX_SIZE = 9;
            VERTEX_BYTES = VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT;
            tmp = new Uint8Array(3);
            Context = /** @class */ (function () {
                function Context() {
                }
                return Context;
            }());
            exports_14("Context", Context);
            ContextInternal = /** @class */ (function () {
                function ContextInternal(buffer, baseCtx) {
                    this.offs = 0;
                    this.alpha = baseCtx.alpha;
                    this.s_color = baseCtx.color;
                    this.view = buffer.createDataView();
                    this.s_texCoord = { s: 0, t: 0 };
                    this.packets = [];
                }
                ContextInternal.prototype.readParam = function () {
                    return this.view.getUint32((this.offs += 4) - 4, true);
                };
                ContextInternal.prototype.vtx = function (x, y, z) {
                    this.s_vtx = { x: x, y: y, z: z };
                    this.vtxs.push({ pos: this.s_vtx, nrm: this.s_nrm, color: this.s_color, uv: this.s_texCoord });
                };
                return ContextInternal;
            }());
        }
    };
});
System.register("sm64ds/nitro_bmd", ["gl-matrix", "sm64ds/nitro_gx", "sm64ds/nitro_tex", "util"], function (exports_15, context_15) {
    "use strict";
    var __moduleName = context_15 && context_15.id;
    function parseModel(bmd, buffer, idx) {
        var offs = bmd.modelOffsBase + idx * 0x40;
        var view = buffer.createDataView();
        var model = new Model();
        model.id = view.getUint32(offs + 0x00, true);
        model.name = util_5.readString(buffer, view.getUint32(offs + 0x04, true), 0xFF);
        model.parentID = view.getUint16(offs + 0x08, true);
        // Local transform.
        var xs = view.getUint32(offs + 0x10, true);
        var ys = view.getUint32(offs + 0x14, true);
        var zs = view.getUint32(offs + 0x18, true);
        var xr = view.getUint16(offs + 0x1C, true);
        var yr = view.getUint16(offs + 0x1E, true);
        var zr = view.getUint16(offs + 0x20, true);
        var xt = view.getUint16(offs + 0x24, true);
        var yt = view.getUint16(offs + 0x28, true);
        var zt = view.getUint16(offs + 0x2C, true);
        // A "batch" is a combination of a material and a poly.
        var batchCount = view.getUint32(offs + 0x30, true);
        var batchMaterialOffs = view.getUint32(offs + 0x34, true);
        var batchPolyOffs = view.getUint32(offs + 0x38, true);
        model.batches = [];
        for (var i = 0; i < batchCount; i++) {
            var materialIdx = view.getUint8(batchMaterialOffs + i);
            var material = parseMaterial(bmd, buffer, materialIdx);
            var baseCtx = { color: material.diffuse, alpha: material.alpha };
            var polyIdx = view.getUint8(batchPolyOffs + i);
            var poly = parsePoly(bmd, buffer, polyIdx, baseCtx);
            model.batches.push({ material: material, poly: poly });
        }
        return model;
    }
    function parsePoly(bmd, buffer, idx, baseCtx) {
        var view = buffer.createDataView();
        var offs = view.getUint32((bmd.polyOffsBase + idx * 0x08) + 0x04, true);
        var gxCmdSize = view.getUint32(offs + 0x08, true);
        var gxCmdOffs = view.getUint32(offs + 0x0C, true);
        var gxCmdBuf = buffer.slice(gxCmdOffs, gxCmdOffs + gxCmdSize);
        var packets = NITRO_GX.readCmds(gxCmdBuf, baseCtx);
        return { packets: packets };
    }
    function parseMaterial(bmd, buffer, idx) {
        var view = buffer.createDataView();
        var offs = bmd.materialOffsBase + idx * 0x30;
        var material = new Material();
        material.name = util_5.readString(buffer, view.getUint32(offs + 0x00, true), 0xFF);
        material.texCoordMat = gl_matrix_3.mat2d.create();
        var textureIdx = view.getUint32(offs + 0x04, true);
        if (textureIdx !== 0xFFFFFFFF) {
            var paletteIdx = view.getUint32(offs + 0x08, true);
            var textureKey = new TextureKey(textureIdx, paletteIdx);
            material.texture = parseTexture(bmd, buffer, textureKey);
            material.texParams = material.texture.params | view.getUint32(offs + 0x20, true);
            if (material.texParams >> 30) {
                var scaleS = view.getInt32(offs + 0x0C, true) / 4096.0;
                var scaleT = view.getInt32(offs + 0x10, true) / 4096.0;
                var transS = view.getInt32(offs + 0x18, true) / 4096.0;
                var transT = view.getInt32(offs + 0x1C, true) / 4096.0;
                gl_matrix_3.mat2d.translate(material.texCoordMat, material.texCoordMat, [transS, transT, 0.0]);
                gl_matrix_3.mat2d.scale(material.texCoordMat, material.texCoordMat, [scaleS, scaleT, 1.0]);
            }
            var texScale = [1 / material.texture.width, 1 / material.texture.height, 1];
            gl_matrix_3.mat2d.scale(material.texCoordMat, material.texCoordMat, texScale);
        }
        else {
            material.texture = null;
            material.texParams = 0;
        }
        var polyAttribs = view.getUint32(offs + 0x24, true);
        var alpha = (polyAttribs >> 16) & 0x1F;
        alpha = (alpha << (8 - 5)) | (alpha >>> (10 - 8));
        var renderWhichFaces = (polyAttribs >> 6) & 0x03;
        material.renderWhichFaces = renderWhichFaces;
        // NITRO's Rendering Engine uses two passes. Opaque, then Transparent.
        // A transparent polygon is one that has an alpha of < 0xFF, or uses
        // A5I3 / A3I5 textures.
        material.isTranslucent = (alpha < 0xFF) || (material.texture && material.texture.isTranslucent);
        // Do transparent polys write to the depth buffer?
        var xl = (polyAttribs >>> 11) & 0x01;
        if (xl)
            material.depthWrite = true;
        else
            material.depthWrite = !material.isTranslucent;
        var difAmb = view.getUint32(offs + 0x28, true);
        if (difAmb & 0x8000)
            material.diffuse = NITRO_GX.bgr5(difAmb);
        else
            material.diffuse = { r: 0xFF, g: 0xFF, b: 0xFF };
        material.alpha = alpha;
        return material;
    }
    function parseTexture(bmd, buffer, key) {
        if (bmd.textureCache.has(key.toString()))
            return bmd.textureCache.get(key.toString());
        var view = buffer.createDataView();
        var texOffs = bmd.textureOffsBase + key.texIdx * 0x14;
        var texture = new Texture();
        texture.id = key.texIdx;
        texture.name = util_5.readString(buffer, view.getUint32(texOffs + 0x00, true), 0xFF);
        var texDataOffs = view.getUint32(texOffs + 0x04, true);
        var texDataSize = view.getUint32(texOffs + 0x08, true);
        var texData = buffer.slice(texDataOffs);
        texture.params = view.getUint32(texOffs + 0x10, true);
        texture.format = (texture.params >> 26) & 0x07;
        texture.width = 8 << ((texture.params >> 20) & 0x07);
        texture.height = 8 << ((texture.params >> 23) & 0x07);
        var color0 = !!((texture.params >> 29) & 0x01);
        var palData = null;
        if (key.palIdx !== 0xFFFFFFFF) {
            var palOffs = bmd.paletteOffsBase + key.palIdx * 0x10;
            texture.paletteName = util_5.readString(buffer, view.getUint32(palOffs + 0x00, true), 0xFF);
            var palDataOffs = view.getUint32(palOffs + 0x04, true);
            var palDataSize = view.getUint32(palOffs + 0x08, true);
            palData = buffer.slice(palDataOffs, palDataOffs + palDataSize);
        }
        texture.pixels = NITRO_Tex.readTexture(texture.format, texture.width, texture.height, texData, palData, color0);
        texture.isTranslucent = (texture.format === NITRO_Tex.Format.Tex_A5I3 ||
            texture.format === NITRO_Tex.Format.Tex_A3I5);
        bmd.textures.push(texture);
        bmd.textureCache.set(key.toString(), texture);
        return texture;
    }
    function parse(buffer) {
        var view = buffer.createDataView();
        var bmd = new BMD();
        bmd.scaleFactor = (1 << view.getUint32(0x00, true));
        bmd.modelCount = view.getUint32(0x04, true);
        bmd.modelOffsBase = view.getUint32(0x08, true);
        bmd.polyCount = view.getUint32(0x0C, true);
        bmd.polyOffsBase = view.getUint32(0x10, true);
        bmd.textureCount = view.getUint32(0x14, true);
        bmd.textureOffsBase = view.getUint32(0x18, true);
        bmd.paletteCount = view.getUint32(0x1C, true);
        bmd.paletteOffsBase = view.getUint32(0x20, true);
        bmd.materialCount = view.getUint32(0x24, true);
        bmd.materialOffsBase = view.getUint32(0x28, true);
        bmd.textureCache = new Map();
        bmd.textures = [];
        bmd.models = [];
        for (var i = 0; i < bmd.modelCount; i++)
            bmd.models.push(parseModel(bmd, buffer, i));
        return bmd;
    }
    exports_15("parse", parse);
    var gl_matrix_3, NITRO_GX, NITRO_Tex, util_5, Material, Model, TextureKey, Texture, BMD;
    return {
        setters: [
            function (gl_matrix_3_1) {
                gl_matrix_3 = gl_matrix_3_1;
            },
            function (NITRO_GX_1) {
                NITRO_GX = NITRO_GX_1;
            },
            function (NITRO_Tex_1) {
                NITRO_Tex = NITRO_Tex_1;
            },
            function (util_5_1) {
                util_5 = util_5_1;
            }
        ],
        execute: function () {
            Material = /** @class */ (function () {
                function Material() {
                }
                return Material;
            }());
            exports_15("Material", Material);
            Model = /** @class */ (function () {
                function Model() {
                }
                return Model;
            }());
            exports_15("Model", Model);
            TextureKey = /** @class */ (function () {
                function TextureKey(texIdx, palIdx) {
                    this.texIdx = texIdx;
                    this.palIdx = palIdx;
                }
                TextureKey.prototype.toString = function () {
                    return "TextureKey " + this.texIdx + " " + this.palIdx;
                };
                return TextureKey;
            }());
            Texture = /** @class */ (function () {
                function Texture() {
                }
                return Texture;
            }());
            exports_15("Texture", Texture);
            BMD = /** @class */ (function () {
                function BMD() {
                }
                return BMD;
            }());
            exports_15("BMD", BMD);
        }
    };
});
// GX materials.
System.register("gx/gx_material", ["render", "util"], function (exports_16, context_16) {
    "use strict";
    var __moduleName = context_16 && context_16.id;
    function getVertexAttribLocation(vtxAttrib) {
        return vtxAttributeGenDefs.findIndex(function (genDef) { return genDef.attrib === vtxAttrib; });
    }
    exports_16("getVertexAttribLocation", getVertexAttribLocation);
    // #endregion
    // #region Material flags generation.
    function translateCullMode(cullMode) {
        switch (cullMode) {
            case 3 /* ALL */:
                return render_2.CullMode.FRONT_AND_BACK;
            case 1 /* FRONT */:
                return render_2.CullMode.FRONT;
            case 2 /* BACK */:
                return render_2.CullMode.BACK;
            case 0 /* NONE */:
                return render_2.CullMode.NONE;
        }
    }
    function translateBlendFactorCommon(blendFactor) {
        switch (blendFactor) {
            case 0 /* ZERO */:
                return render_2.BlendFactor.ZERO;
            case 1 /* ONE */:
                return render_2.BlendFactor.ONE;
            case 4 /* SRCALPHA */:
                return render_2.BlendFactor.SRC_ALPHA;
            case 5 /* INVSRCALPHA */:
                return render_2.BlendFactor.ONE_MINUS_SRC_ALPHA;
            case 6 /* DSTALPHA */:
                return render_2.BlendFactor.DST_ALPHA;
            case 7 /* INVDSTALPHA */:
                return render_2.BlendFactor.ONE_MINUS_DST_ALPHA;
            default:
                throw new Error("whoops");
        }
    }
    function translateBlendSrcFactor(blendFactor) {
        switch (blendFactor) {
            case 2 /* SRCCLR */:
                return render_2.BlendFactor.DST_COLOR;
            case 3 /* INVSRCCLR */:
                return render_2.BlendFactor.ONE_MINUS_DST_COLOR;
            default:
                return translateBlendFactorCommon(blendFactor);
        }
    }
    function translateBlendDstFactor(blendFactor) {
        switch (blendFactor) {
            case 2 /* SRCCLR */:
                return render_2.BlendFactor.SRC_COLOR;
            case 3 /* INVSRCCLR */:
                return render_2.BlendFactor.ONE_MINUS_SRC_COLOR;
            default:
                return translateBlendFactorCommon(blendFactor);
        }
    }
    function translateCompareType(compareType) {
        switch (compareType) {
            case 0 /* NEVER */:
                return render_2.CompareMode.NEVER;
            case 1 /* LESS */:
                return render_2.CompareMode.LESS;
            case 2 /* EQUAL */:
                return render_2.CompareMode.EQUAL;
            case 3 /* LEQUAL */:
                return render_2.CompareMode.LEQUAL;
            case 4 /* GREATER */:
                return render_2.CompareMode.GREATER;
            case 5 /* NEQUAL */:
                return render_2.CompareMode.NEQUAL;
            case 6 /* GEQUAL */:
                return render_2.CompareMode.GEQUAL;
            case 7 /* ALWAYS */:
                return render_2.CompareMode.ALWAYS;
        }
    }
    function translateRenderFlags(material) {
        var renderFlags = new render_2.RenderFlags();
        renderFlags.cullMode = translateCullMode(material.cullMode);
        renderFlags.depthWrite = material.ropInfo.depthWrite;
        renderFlags.depthTest = material.ropInfo.depthTest;
        renderFlags.depthFunc = translateCompareType(material.ropInfo.depthFunc);
        renderFlags.frontFace = render_2.FrontFaceMode.CW;
        if (material.ropInfo.blendMode.type === 0 /* NONE */) {
            renderFlags.blendMode = render_2.BlendMode.NONE;
        }
        else if (material.ropInfo.blendMode.type === 1 /* BLEND */) {
            renderFlags.blendMode = render_2.BlendMode.ADD;
            renderFlags.blendSrc = translateBlendSrcFactor(material.ropInfo.blendMode.srcFactor);
            renderFlags.blendDst = translateBlendDstFactor(material.ropInfo.blendMode.dstFactor);
        }
        else if (material.ropInfo.blendMode.type === 3 /* SUBTRACT */) {
            renderFlags.blendMode = render_2.BlendMode.REVERSE_SUBTRACT;
            renderFlags.blendSrc = render_2.BlendFactor.ONE;
            renderFlags.blendDst = render_2.BlendFactor.ONE;
        }
        else if (material.ropInfo.blendMode.type === 2 /* LOGIC */) {
            throw new Error("whoops");
        }
        return renderFlags;
    }
    exports_16("translateRenderFlags", translateRenderFlags);
    // #endregion
    // XXX(jstpierre): Put this somewhere better.
    // Mip levels in GX are assumed to be relative to the GameCube's embedded framebuffer (EFB) size,
    // which is hardcoded to be 640x528. We need to bias our mipmap LOD selection by this amount to
    // make sure textures are sampled correctly...
    function getTextureLODBias(state) {
        var viewportWidth = state.currentRenderTarget.width;
        var viewportHeight = state.currentRenderTarget.height;
        var textureLODBias = Math.log2(Math.min(viewportWidth / EFB_WIDTH, viewportHeight / EFB_HEIGHT));
        return textureLODBias;
    }
    exports_16("getTextureLODBias", getTextureLODBias);
    var render_2, util_6, EFB_WIDTH, EFB_HEIGHT, Color, vtxAttributeGenDefs, scaledVtxAttributes, GX_Program;
    return {
        setters: [
            function (render_2_1) {
                render_2 = render_2_1;
            },
            function (util_6_1) {
                util_6 = util_6_1;
            }
        ],
        execute: function () {
            exports_16("EFB_WIDTH", EFB_WIDTH = 640);
            exports_16("EFB_HEIGHT", EFB_HEIGHT = 528);
            Color = /** @class */ (function () {
                function Color(r, g, b, a) {
                    this.r = r;
                    this.g = g;
                    this.b = b;
                    this.a = a;
                }
                return Color;
            }());
            exports_16("Color", Color);
            vtxAttributeGenDefs = [
                { attrib: 0 /* PNMTXIDX */, name: "PosMtxIdx", storage: "float", scale: false },
                { attrib: 9 /* POS */, name: "Position", storage: "vec3", scale: true },
                { attrib: 10 /* NRM */, name: "Normal", storage: "vec3", scale: true },
                { attrib: 11 /* CLR0 */, name: "Color0", storage: "vec4", scale: false },
                { attrib: 12 /* CLR1 */, name: "Color1", storage: "vec4", scale: false },
                { attrib: 13 /* TEX0 */, name: "Tex0", storage: "vec2", scale: true },
                { attrib: 14 /* TEX1 */, name: "Tex1", storage: "vec2", scale: true },
                { attrib: 15 /* TEX2 */, name: "Tex2", storage: "vec2", scale: true },
                { attrib: 16 /* TEX3 */, name: "Tex3", storage: "vec2", scale: true },
                { attrib: 17 /* TEX4 */, name: "Tex4", storage: "vec2", scale: true },
                { attrib: 18 /* TEX5 */, name: "Tex5", storage: "vec2", scale: true },
                { attrib: 19 /* TEX6 */, name: "Tex6", storage: "vec2", scale: true },
                { attrib: 20 /* TEX7 */, name: "Tex7", storage: "vec2", scale: true },
            ];
            exports_16("scaledVtxAttributes", scaledVtxAttributes = vtxAttributeGenDefs.filter(function (a) { return a.scale; }).map(function (a) { return a.attrib; }));
            while (scaledVtxAttributes.length < util_6.align(scaledVtxAttributes.length, 4))
                scaledVtxAttributes.push(-1);
            GX_Program = /** @class */ (function (_super) {
                __extends(GX_Program, _super);
                function GX_Program(material) {
                    var _this = _super.call(this) || this;
                    _this.material = material;
                    _this.generateShaders();
                    return _this;
                }
                GX_Program.prototype.bind = function (gl, prog) {
                    _super.prototype.bind.call(this, gl, prog);
                    gl.uniformBlockBinding(prog, gl.getUniformBlockIndex(prog, "ub_SceneParams"), GX_Program.ub_SceneParams);
                    gl.uniformBlockBinding(prog, gl.getUniformBlockIndex(prog, "ub_MaterialParams"), GX_Program.ub_MaterialParams);
                    gl.uniformBlockBinding(prog, gl.getUniformBlockIndex(prog, "ub_PacketParams"), GX_Program.ub_PacketParams);
                    this.u_Texture = gl.getUniformLocation(prog, "u_Texture");
                };
                GX_Program.prototype.generateFloat = function (v) {
                    var s = v.toString();
                    if (!s.includes('.'))
                        s += '.0';
                    return s;
                };
                GX_Program.prototype.generateColorConstant = function (c) {
                    return "vec4(" + c.r + ", " + c.g + ", " + c.b + ", " + c.a + ")";
                };
                // Color Channels
                GX_Program.prototype.generateMaterialSource = function (chan, i) {
                    switch (chan.matColorSource) {
                        case 1 /* VTX */: return "ReadAttrib_Color" + i + "()";
                        case 0 /* REG */: return "u_ColorMatReg[" + i + "]";
                    }
                };
                GX_Program.prototype.generateAmbientSource = function (chan, i) {
                    switch (chan.ambColorSource) {
                        case 1 /* VTX */: return "ReadAttrib_Color" + i + "()";
                        // TODO(jstpierre): amb regs
                        case 0 /* REG */: return "vec4(1.0)"; // return `u_ColorMatReg[${i}]`;
                    }
                };
                GX_Program.prototype.generateColorChannel = function (chan, i) {
                    // TODO(jstpierre): amb & lighting
                    var matSource = this.generateMaterialSource(chan, i);
                    if (chan.lightingEnabled) {
                        // XXX(jstpierre): This is awful but seems to work.
                        var ambSource = this.generateAmbientSource(chan, i);
                        return "(0.3 * " + ambSource + " * " + matSource + ")";
                    }
                    else {
                        // If lighting is off, it's the material color.
                        return matSource;
                    }
                };
                GX_Program.prototype.generateLightChannel = function (lightChannel, i) {
                    return "vec4(" + this.generateColorChannel(lightChannel.colorChannel, i) + ".rgb, " + this.generateColorChannel(lightChannel.alphaChannel, i) + ".a)";
                };
                GX_Program.prototype.generateLightChannels = function () {
                    var _this = this;
                    return this.material.lightChannels.map(function (lightChannel, i) {
                        return "    v_Color" + i + " = " + _this.generateLightChannel(lightChannel, i) + ";";
                    }).join('\n');
                };
                // TexGen
                GX_Program.prototype.generateTexGenSource = function (src) {
                    switch (src) {
                        case 0 /* POS */: return "v_Position";
                        case 1 /* NRM */: return "v_Normal";
                        case 20 /* COLOR0 */: return "v_Color0";
                        case 21 /* COLOR1 */: return "v_Color1";
                        case 4 /* TEX0 */: return "vec3(ReadAttrib_Tex0(), 1.0)";
                        case 5 /* TEX1 */: return "vec3(ReadAttrib_Tex1(), 1.0)";
                        case 6 /* TEX2 */: return "vec3(ReadAttrib_Tex2(), 1.0)";
                        case 7 /* TEX3 */: return "vec3(ReadAttrib_Tex3(), 1.0)";
                        case 8 /* TEX4 */: return "vec3(ReadAttrib_Tex4(), 1.0)";
                        case 9 /* TEX5 */: return "vec3(ReadAttrib_Tex5(), 1.0)";
                        case 10 /* TEX6 */: return "vec3(ReadAttrib_Tex6(), 1.0)";
                        case 11 /* TEX7 */: return "vec3(ReadAttrib_Tex7(), 1.0)";
                        // Use a previously generated texcoordgen.
                        case 12 /* TEXCOORD0 */: return "v_TexCoord0";
                        case 13 /* TEXCOORD1 */: return "v_TexCoord1";
                        case 14 /* TEXCOORD2 */: return "v_TexCoord2";
                        case 15 /* TEXCOORD3 */: return "v_TexCoord3";
                        case 16 /* TEXCOORD4 */: return "v_TexCoord4";
                        case 18 /* TEXCOORD5 */: return "v_TexCoord5";
                        case 19 /* TEXCOORD6 */: return "v_TexCoord6";
                        default:
                            throw new Error("whoops");
                    }
                };
                GX_Program.prototype.generateTexGenMatrix = function (src, texCoordGen) {
                    var matrix = texCoordGen.matrix;
                    if (matrix === 60 /* IDENTITY */) {
                        return "" + src;
                    }
                    else {
                        var matrixIdx = (matrix - 30 /* TEXMTX0 */) / 3;
                        return "(u_TexMtx[" + matrixIdx + "] * vec4(" + src + ", 1.0))";
                    }
                };
                GX_Program.prototype.generateTexGenType = function (texCoordGen) {
                    var src = this.generateTexGenSource(texCoordGen.source);
                    switch (texCoordGen.type) {
                        case 10 /* SRTG */:
                            // Expected to be used with colors, I suspect...
                            return "vec3(" + src + ".rg, 1.0)";
                        case 1 /* MTX2x4 */:
                            return "vec3(" + this.generateTexGenMatrix("vec3(" + src + ".xy, 1.0)", texCoordGen) + ".xy, 1.0)";
                        case 0 /* MTX3x4 */:
                            return "" + this.generateTexGenMatrix(src, texCoordGen);
                        default:
                            throw new Error("whoops");
                    }
                };
                GX_Program.prototype.generateTexGenNrm = function (texCoordGen) {
                    var type = this.generateTexGenType(texCoordGen);
                    if (texCoordGen.normalize)
                        return "normalize(" + type + ")";
                    else
                        return type;
                };
                GX_Program.prototype.generateTexGenPost = function (texCoordGen) {
                    var nrm = this.generateTexGenNrm(texCoordGen);
                    if (texCoordGen.postMatrix === 125 /* PTIDENTITY */) {
                        return nrm;
                    }
                    else {
                        var matrixIdx = (texCoordGen.postMatrix - 64 /* PTTEXMTX0 */) / 3;
                        return "u_PostTexMtx[" + matrixIdx + "] * vec4(" + nrm + ", 1.0)";
                    }
                };
                GX_Program.prototype.generateTexGen = function (texCoordGen) {
                    var i = texCoordGen.index;
                    return "\n    // TexGen " + i + "  Type: " + texCoordGen.type + " Source: " + texCoordGen.source + " Matrix: " + texCoordGen.matrix + "\n    v_TexCoord" + i + " = " + this.generateTexGenPost(texCoordGen) + ";";
                };
                GX_Program.prototype.generateTexGens = function (texGens) {
                    var _this = this;
                    return texGens.map(function (tg) {
                        return _this.generateTexGen(tg);
                    }).join('');
                };
                GX_Program.prototype.generateTexCoordGetters = function () {
                    return this.material.texGens.map(function (n, i) {
                        return "vec2 ReadTexCoord" + i + "() { return v_TexCoord" + i + ".xy / v_TexCoord" + i + ".z; }\n";
                    }).join('');
                };
                // IndTex
                GX_Program.prototype.generateIndTexStageScaleN = function (scale) {
                    switch (scale) {
                        case 0 /* _1 */: return "1.0";
                        case 1 /* _2 */: return "1.0/2.0";
                        case 2 /* _4 */: return "1.0/4.0";
                        case 3 /* _8 */: return "1.0/8.0";
                        case 4 /* _16 */: return "1.0/16.0";
                        case 5 /* _32 */: return "1.0/32.0";
                        case 6 /* _64 */: return "1.0/64.0";
                        case 7 /* _128 */: return "1.0/128.0";
                        case 8 /* _256 */: return "1.0/256.0";
                    }
                };
                GX_Program.prototype.generateIndTexStageScale = function (stage) {
                    var baseCoord = "ReadTexCoord" + stage.texCoordId + "()";
                    if (stage.scaleS === 0 /* _1 */ && stage.scaleT === 0 /* _1 */)
                        return baseCoord;
                    else
                        return baseCoord + " * vec2(" + this.generateIndTexStageScaleN(stage.scaleS) + ", " + this.generateIndTexStageScaleN(stage.scaleT) + ")";
                };
                GX_Program.prototype.generateIndTexStage = function (stage) {
                    var i = stage.index;
                    return "\n    // Indirect " + i + "\n    vec3 t_IndTexCoord" + i + " = TextureSample(" + stage.texture + ", " + this.generateIndTexStageScale(stage) + ").abg;";
                };
                GX_Program.prototype.generateIndTexStages = function (stages) {
                    var _this = this;
                    return stages.map(function (stage) {
                        return _this.generateIndTexStage(stage);
                    }).join('');
                };
                // TEV
                GX_Program.prototype.generateKonstColorSel = function (konstColor) {
                    switch (konstColor) {
                        case 0 /* KCSEL_1 */: return 'vec3(8.0/8.0)';
                        case 1 /* KCSEL_7_8 */: return 'vec3(7.0/8.0)';
                        case 2 /* KCSEL_3_4 */: return 'vec3(6.0/8.0)';
                        case 3 /* KCSEL_5_8 */: return 'vec3(5.0/8.0)';
                        case 4 /* KCSEL_1_2 */: return 'vec3(4.0/8.0)';
                        case 5 /* KCSEL_3_8 */: return 'vec3(3.0/8.0)';
                        case 6 /* KCSEL_1_4 */: return 'vec3(2.0/8.0)';
                        case 7 /* KCSEL_1_8 */: return 'vec3(1.0/8.0)';
                        case 12 /* KCSEL_K0 */: return 's_kColor0.rgb';
                        case 16 /* KCSEL_K0_R */: return 's_kColor0.rrr';
                        case 20 /* KCSEL_K0_G */: return 's_kColor0.ggg';
                        case 24 /* KCSEL_K0_B */: return 's_kColor0.bbb';
                        case 28 /* KCSEL_K0_A */: return 's_kColor0.aaa';
                        case 13 /* KCSEL_K1 */: return 's_kColor1.rgb';
                        case 17 /* KCSEL_K1_R */: return 's_kColor1.rrr';
                        case 21 /* KCSEL_K1_G */: return 's_kColor1.ggg';
                        case 25 /* KCSEL_K1_B */: return 's_kColor1.bbb';
                        case 29 /* KCSEL_K1_A */: return 's_kColor1.aaa';
                        case 14 /* KCSEL_K2 */: return 's_kColor2.rgb';
                        case 18 /* KCSEL_K2_R */: return 's_kColor2.rrr';
                        case 22 /* KCSEL_K2_G */: return 's_kColor2.ggg';
                        case 26 /* KCSEL_K2_B */: return 's_kColor2.bbb';
                        case 30 /* KCSEL_K2_A */: return 's_kColor2.aaa';
                        case 15 /* KCSEL_K3 */: return 's_kColor3.rgb';
                        case 19 /* KCSEL_K3_R */: return 's_kColor3.rrr';
                        case 23 /* KCSEL_K3_G */: return 's_kColor3.ggg';
                        case 27 /* KCSEL_K3_B */: return 's_kColor3.bbb';
                        case 31 /* KCSEL_K3_A */: return 's_kColor3.aaa';
                    }
                };
                GX_Program.prototype.generateKonstAlphaSel = function (konstAlpha) {
                    switch (konstAlpha) {
                        case 0 /* KASEL_1 */: return '(8.0/8.0)';
                        case 1 /* KASEL_7_8 */: return '(7.0/8.0)';
                        case 2 /* KASEL_3_4 */: return '(6.0/8.0)';
                        case 3 /* KASEL_5_8 */: return '(5.0/8.0)';
                        case 4 /* KASEL_1_2 */: return '(4.0/8.0)';
                        case 5 /* KASEL_3_8 */: return '(3.0/8.0)';
                        case 6 /* KASEL_1_4 */: return '(2.0/8.0)';
                        case 7 /* KASEL_1_8 */: return '(1.0/8.0)';
                        case 16 /* KASEL_K0_R */: return 's_kColor0.r';
                        case 20 /* KASEL_K0_G */: return 's_kColor0.g';
                        case 24 /* KASEL_K0_B */: return 's_kColor0.b';
                        case 28 /* KASEL_K0_A */: return 's_kColor0.a';
                        case 17 /* KASEL_K1_R */: return 's_kColor1.r';
                        case 21 /* KASEL_K1_G */: return 's_kColor1.g';
                        case 25 /* KASEL_K1_B */: return 's_kColor1.b';
                        case 29 /* KASEL_K1_A */: return 's_kColor1.a';
                        case 18 /* KASEL_K2_R */: return 's_kColor2.r';
                        case 22 /* KASEL_K2_G */: return 's_kColor2.g';
                        case 26 /* KASEL_K2_B */: return 's_kColor2.b';
                        case 30 /* KASEL_K2_A */: return 's_kColor2.a';
                        case 19 /* KASEL_K3_R */: return 's_kColor3.r';
                        case 23 /* KASEL_K3_G */: return 's_kColor3.g';
                        case 27 /* KASEL_K3_B */: return 's_kColor3.b';
                        case 31 /* KASEL_K3_A */: return 's_kColor3.a';
                    }
                };
                GX_Program.prototype.generateRas = function (stage) {
                    switch (stage.channelId) {
                        case 0 /* COLOR0 */: return "v_Color0.rgb";
                        case 1 /* COLOR1 */: return "v_Color1.rgb";
                        case 4 /* COLOR0A0 */: return "v_Color0";
                        case 5 /* COLOR1A1 */: return "v_Color1";
                        case 6 /* COLOR_ZERO */: return "vec4(0, 0, 0, 0)";
                        default:
                            throw new Error("whoops " + stage.channelId);
                    }
                };
                GX_Program.prototype.generateTexAccess = function (stage) {
                    return "TextureSample(" + stage.texMap + ", t_TexCoord)";
                };
                GX_Program.prototype.generateColorIn = function (stage, colorIn) {
                    var i = stage.index;
                    switch (colorIn) {
                        case 0 /* CPREV */: return "t_ColorPrev.rgb";
                        case 1 /* APREV */: return "t_ColorPrev.aaa";
                        case 2 /* C0 */: return "t_Color0.rgb";
                        case 3 /* A0 */: return "t_Color0.aaa";
                        case 4 /* C1 */: return "t_Color1.rgb";
                        case 5 /* A1 */: return "t_Color1.aaa";
                        case 6 /* C2 */: return "t_Color2.rgb";
                        case 7 /* A2 */: return "t_Color2.aaa";
                        case 8 /* TEXC */: return this.generateTexAccess(stage) + ".rgb";
                        case 9 /* TEXA */: return this.generateTexAccess(stage) + ".aaa";
                        case 10 /* RASC */: return this.generateRas(stage) + ".rgb";
                        case 11 /* RASA */: return this.generateRas(stage) + ".aaa";
                        case 12 /* ONE */: return "vec3(1)";
                        case 13 /* HALF */: return "vec3(1.0/2.0)";
                        case 14 /* KONST */: return "" + this.generateKonstColorSel(stage.konstColorSel);
                        case 15 /* ZERO */: return "vec3(0)";
                    }
                };
                GX_Program.prototype.generateAlphaIn = function (stage, alphaIn) {
                    var i = stage.index;
                    switch (alphaIn) {
                        case 0 /* APREV */: return "t_ColorPrev.a";
                        case 1 /* A0 */: return "t_Color0.a";
                        case 2 /* A1 */: return "t_Color1.a";
                        case 3 /* A2 */: return "t_Color2.a";
                        case 4 /* TEXA */: return this.generateTexAccess(stage) + ".a";
                        case 5 /* RASA */: return this.generateRas(stage) + ".a";
                        case 6 /* KONST */: return "" + this.generateKonstAlphaSel(stage.konstAlphaSel);
                        case 7 /* ZERO */: return "0.0";
                    }
                };
                GX_Program.prototype.generateTevRegister = function (regId) {
                    switch (regId) {
                        case 0 /* PREV */: return "t_ColorPrev";
                        case 1 /* REG0 */: return "t_Color0";
                        case 2 /* REG1 */: return "t_Color1";
                        case 3 /* REG2 */: return "t_Color2";
                    }
                };
                GX_Program.prototype.generateTevOpBiasScaleClamp = function (value, bias, scale) {
                    var v = value;
                    if (bias === 1 /* ADDHALF */)
                        v = "TevBias(" + v + ", 0.5)";
                    else if (bias === 2 /* SUBHALF */)
                        v = "TevBias(" + v + ", -0.5)";
                    if (scale === 1 /* SCALE_2 */)
                        v = "(" + v + ") * 2.0";
                    else if (scale === 2 /* SCALE_4 */)
                        v = "(" + v + ") * 4.0";
                    else if (scale === 3 /* DIVIDE_2 */)
                        v = "(" + v + ") * 0.5";
                    return v;
                };
                GX_Program.prototype.generateTevOp = function (op, bias, scale, a, b, c, d) {
                    switch (op) {
                        case 0 /* ADD */:
                        case 1 /* SUB */:
                            var o = (op === 0 /* ADD */) ? '+' : '-';
                            var v = "mix(" + a + ", " + b + ", " + c + ") " + o + " " + d;
                            return this.generateTevOpBiasScaleClamp(v, bias, scale);
                        case 8 /* COMP_R8_GT */:
                            return "TevCompR8GT(" + a + ", " + b + ", " + c + ") + " + d;
                        default:
                            throw new Error("whoops");
                    }
                };
                GX_Program.prototype.generateTevOpValue = function (op, bias, scale, clamp, a, b, c, d) {
                    var expr = this.generateTevOp(op, bias, scale, a, b, c, d);
                    if (clamp)
                        return "TevSaturate(" + expr + ")";
                    else
                        return expr;
                };
                GX_Program.prototype.generateColorOp = function (stage) {
                    var a = "TevOverflow(" + this.generateColorIn(stage, stage.colorInA) + ")";
                    var b = "TevOverflow(" + this.generateColorIn(stage, stage.colorInB) + ")";
                    var c = "TevOverflow(" + this.generateColorIn(stage, stage.colorInC) + ")";
                    var d = this.generateColorIn(stage, stage.colorInD);
                    var value = this.generateTevOpValue(stage.colorOp, stage.colorBias, stage.colorScale, stage.colorClamp, a, b, c, d);
                    return this.generateTevRegister(stage.colorRegId) + ".rgb = " + value;
                };
                GX_Program.prototype.generateAlphaOp = function (stage) {
                    var a = "TevOverflow(" + this.generateAlphaIn(stage, stage.alphaInA) + ")";
                    var b = "TevOverflow(" + this.generateAlphaIn(stage, stage.alphaInB) + ")";
                    var c = "TevOverflow(" + this.generateAlphaIn(stage, stage.alphaInC) + ")";
                    var d = this.generateAlphaIn(stage, stage.alphaInD);
                    var value = this.generateTevOpValue(stage.alphaOp, stage.alphaBias, stage.alphaScale, stage.alphaClamp, a, b, c, d);
                    return this.generateTevRegister(stage.alphaRegId) + ".a = " + value;
                };
                GX_Program.prototype.generateTevTexCoordWrapN = function (texCoord, wrap) {
                    switch (wrap) {
                        case 0 /* OFF */: return texCoord;
                        case 6 /* _0 */: return '0.0';
                        case 1 /* _256 */: return "mod(" + texCoord + ", 256.0)";
                        case 2 /* _128 */: return "mod(" + texCoord + ", 128.0)";
                        case 3 /* _64 */: return "mod(" + texCoord + ", 64.0)";
                        case 4 /* _32 */: return "mod(" + texCoord + ", 32.0)";
                        case 5 /* _16 */: return "mod(" + texCoord + ", 16.0)";
                    }
                };
                GX_Program.prototype.generateTevTexCoordWrap = function (stage) {
                    var baseCoord = "ReadTexCoord" + stage.texCoordId + "()";
                    if (stage.indTexWrapS === 0 /* OFF */ && stage.indTexWrapT === 0 /* OFF */)
                        return baseCoord;
                    else
                        return "vec2(" + this.generateTevTexCoordWrapN(baseCoord + ".x", stage.indTexWrapS) + ", " + this.generateTevTexCoordWrapN(baseCoord + ".y", stage.indTexWrapT) + ")";
                };
                GX_Program.prototype.generateTevTexCoordIndTexCoordBias = function (stage) {
                    var bias = (stage.indTexFormat === 0 /* _8 */) ? '-128.0' : "1.0";
                    switch (stage.indTexBiasSel) {
                        case 0 /* NONE */: return "";
                        case 1 /* S */: return " + vec3(" + bias + ", 0.0, 0.0)";
                        case 3 /* ST */: return " + vec3(" + bias + ", " + bias + ", 0.0)";
                        case 5 /* SU */: return " + vec3(" + bias + ", 0.0, " + bias + ")";
                        case 2 /* T */: return " + vec3(0.0, " + bias + ", 0.0)";
                        case 6 /* TU */: return " + vec3(0.0, " + bias + ", " + bias + ")";
                        case 4 /* U */: return " + vec3(0.0, 0.0, " + bias + ")";
                        case 7 /* STU */: return " + vec3(" + bias + ")";
                    }
                };
                GX_Program.prototype.generateTevTexCoordIndTexCoord = function (stage) {
                    var baseCoord = "(t_IndTexCoord" + stage.indTexStage + " * 255.0)";
                    switch (stage.indTexFormat) {
                        case 0 /* _8 */: return baseCoord;
                        default:
                        case 1 /* _5 */: throw new Error("whoops");
                    }
                };
                GX_Program.prototype.generateTevTexCoordIndirectMtx = function (stage) {
                    var indTevCoord = "(" + this.generateTevTexCoordIndTexCoord(stage) + this.generateTevTexCoordIndTexCoordBias(stage) + ")";
                    switch (stage.indTexMatrix) {
                        case 1 /* _0 */: return "(u_IndTexMtx[0] * vec4(" + indTevCoord + ", 0.0))";
                        case 2 /* _1 */: return "(u_IndTexMtx[1] * vec4(" + indTevCoord + ", 0.0))";
                        case 3 /* _2 */: return "(u_IndTexMtx[2] * vec4(" + indTevCoord + ", 0.0))";
                        default:
                        case 0 /* OFF */: throw new Error("whoops");
                    }
                };
                GX_Program.prototype.generateTevTexCoordIndirectTranslation = function (stage) {
                    return "(" + this.generateTevTexCoordIndirectMtx(stage) + " / TextureSize(" + stage.texCoordId + "))";
                };
                GX_Program.prototype.generateTevTexCoordIndirect = function (stage) {
                    var baseCoord = this.generateTevTexCoordWrap(stage);
                    if (stage.indTexMatrix !== 0 /* OFF */)
                        return baseCoord + " + " + this.generateTevTexCoordIndirectTranslation(stage);
                    else
                        return baseCoord;
                };
                GX_Program.prototype.generateTevTexCoord = function (stage) {
                    if (stage.texCoordId === 255 /* NULL */)
                        return '';
                    var finalCoord = this.generateTevTexCoordIndirect(stage);
                    if (stage.indTexAddPrev) {
                        return "t_TexCoord += " + finalCoord + ";";
                    }
                    else {
                        return "t_TexCoord = " + finalCoord + ";";
                    }
                };
                GX_Program.prototype.generateTevStage = function (stage) {
                    var i = stage.index;
                    return "\n    // TEV Stage " + i + "\n    " + this.generateTevTexCoord(stage) + "\n    // Color Combine\n    // colorIn: " + stage.colorInA + " " + stage.colorInB + " " + stage.colorInC + " " + stage.colorInD + "  colorOp: " + stage.colorOp + " colorBias: " + stage.colorBias + " colorScale: " + stage.colorScale + " colorClamp: " + stage.colorClamp + " colorRegId: " + stage.colorRegId + "\n    // alphaIn: " + stage.alphaInA + " " + stage.alphaInB + " " + stage.alphaInC + " " + stage.alphaInD + "  alphaOp: " + stage.alphaOp + " alphaBias: " + stage.alphaBias + " alphaScale: " + stage.alphaScale + " alphaClamp: " + stage.alphaClamp + " alphaRegId: " + stage.alphaRegId + "\n    // texCoordId: " + stage.texCoordId + " texMap: " + stage.texMap + " channelId: " + stage.channelId + "\n    " + this.generateColorOp(stage) + ";\n    " + this.generateAlphaOp(stage) + ";";
                };
                GX_Program.prototype.generateTevStages = function (tevStages) {
                    var _this = this;
                    return tevStages.map(function (s) { return _this.generateTevStage(s); }).join("\n");
                };
                GX_Program.prototype.generateAlphaTestCompare = function (compare, reference) {
                    var reg = this.generateTevRegister(0 /* PREV */);
                    var ref = this.generateFloat(reference);
                    switch (compare) {
                        case 0 /* NEVER */: return "false";
                        case 1 /* LESS */: return reg + ".a <  " + ref;
                        case 2 /* EQUAL */: return reg + ".a == " + ref;
                        case 3 /* LEQUAL */: return reg + ".a <= " + ref;
                        case 4 /* GREATER */: return reg + ".a >  " + ref;
                        case 5 /* NEQUAL */: return reg + ".a != " + ref;
                        case 6 /* GEQUAL */: return reg + ".a >= " + ref;
                        case 7 /* ALWAYS */: return "true";
                    }
                };
                GX_Program.prototype.generateAlphaTestOp = function (op) {
                    switch (op) {
                        case 0 /* AND */: return "t_alphaTestA && t_alphaTestB";
                        case 1 /* OR */: return "t_alphaTestA || t_alphaTestB";
                        case 2 /* XOR */: return "t_alphaTestA != t_alphaTestB";
                        case 3 /* XNOR */: return "t_alphaTestA == t_alphaTestB";
                    }
                };
                GX_Program.prototype.generateAlphaTest = function (alphaTest) {
                    return "\n    // Alpha Test: Op " + alphaTest.op + "\n    // Compare A: " + alphaTest.compareA + " Reference A: " + this.generateFloat(alphaTest.referenceA) + "\n    // Compare B: " + alphaTest.compareB + " Reference B: " + this.generateFloat(alphaTest.referenceB) + "\n    bool t_alphaTestA = " + this.generateAlphaTestCompare(alphaTest.compareA, alphaTest.referenceA) + ";\n    bool t_alphaTestB = " + this.generateAlphaTestCompare(alphaTest.compareB, alphaTest.referenceB) + ";\n    if (!(" + this.generateAlphaTestOp(alphaTest.op) + "))\n        discard;\n";
                };
                GX_Program.prototype.generateVertAttributeDefs = function () {
                    return vtxAttributeGenDefs.map(function (a, i) {
                        var scaleIdx = scaledVtxAttributes.indexOf(a.attrib);
                        var scaleVecIdx = scaleIdx >> 2;
                        var scaleScalarIdx = scaleIdx & 3;
                        return "\nlayout(location = " + i + ") in " + a.storage + " a_" + a.name + ";\n" + a.storage + " ReadAttrib_" + a.name + "() {\n    return a_" + a.name + (a.scale ? " * u_AttrScale[" + scaleVecIdx + "][" + scaleScalarIdx + "]" : "") + ";\n}\n";
                    }).join('');
                };
                GX_Program.prototype.generateUBO = function () {
                    var scaledVecCount = scaledVtxAttributes.length >> 2;
                    return "\n// Expected to be constant across the entire scene.\nlayout(std140) uniform ub_SceneParams {\n    mat4 u_Projection;\n    vec4 u_AttrScale[" + scaledVecCount + "];\n    vec4 u_Misc0;\n};\n\n#define u_SceneTextureLODBias u_Misc0[0]\n\n// Expected to change with each material.\nlayout(row_major, std140) uniform ub_MaterialParams {\n    vec4 u_ColorMatReg[2];\n    vec4 u_KonstColor[8];\n    mat4x3 u_TexMtx[10];\n    mat4x3 u_PostTexMtx[20];\n    mat4x2 u_IndTexMtx[3];\n    // SizeX, SizeY, 0, Bias\n    vec4 u_TextureParams[8];\n};\n\n// Expected to change with each shape packet.\nlayout(std140) uniform ub_PacketParams {\n    mat4 u_ModelView;\n    mat4 u_PosMtx[10];\n};\n";
                };
                GX_Program.prototype.generateShaders = function () {
                    var ubo = this.generateUBO();
                    this.vert = "\n// " + this.material.name + "\nprecision mediump float;\n" + ubo + "\n" + this.generateVertAttributeDefs() + "\nout vec3 v_Position;\nout vec3 v_Normal;\nout vec4 v_Color0;\nout vec4 v_Color1;\nout vec3 v_TexCoord0;\nout vec3 v_TexCoord1;\nout vec3 v_TexCoord2;\nout vec3 v_TexCoord3;\nout vec3 v_TexCoord4;\nout vec3 v_TexCoord5;\nout vec3 v_TexCoord6;\nout vec3 v_TexCoord7;\n\nvoid main() {\n    mat4 t_PosMtx = u_PosMtx[int(ReadAttrib_PosMtxIdx() / 3.0)];\n    vec4 t_Position = t_PosMtx * vec4(ReadAttrib_Position(), 1.0);\n    v_Position = t_Position.xyz;\n    v_Normal = ReadAttrib_Normal();\n" + this.generateLightChannels() + "\n" + this.generateTexGens(this.material.texGens) + "\n    gl_Position = u_Projection * u_ModelView * t_Position;\n}\n";
                    var tevStages = this.material.tevStages;
                    var indTexStages = this.material.indTexStages;
                    var alphaTest = this.material.alphaTest;
                    var kColors = this.material.colorConstants;
                    var rColors = this.material.colorRegisters;
                    this.frag = "\n// " + this.material.name + "\nprecision mediump float;\n" + ubo + "\nuniform sampler2D u_Texture[8];\n\nin vec3 v_Position;\nin vec3 v_Normal;\nin vec4 v_Color0;\nin vec4 v_Color1;\nin vec3 v_TexCoord0;\nin vec3 v_TexCoord1;\nin vec3 v_TexCoord2;\nin vec3 v_TexCoord3;\nin vec3 v_TexCoord4;\nin vec3 v_TexCoord5;\nin vec3 v_TexCoord6;\nin vec3 v_TexCoord7;\n" + this.generateTexCoordGetters() + "\n\nfloat TextureLODBias(int index) { return u_SceneTextureLODBias + u_TextureParams[index].w; }\nvec2 TextureSize(int index) { return u_TextureParams[index].xy; }\nvec4 TextureSample(int index, vec2 coord) { return texture(u_Texture[index], coord, TextureLODBias(index)); }\n\nvec3 TevBias(vec3 a, float b) { return a + vec3(b); }\nfloat TevBias(float a, float b) { return a + b; }\nvec3 TevSaturate(vec3 a) { return clamp(a, vec3(0), vec3(1)); }\nfloat TevSaturate(float a) { return clamp(a, 0.0, 1.0); }\nvec3 TevOverflow(vec3 a) { return fract(a*(255.0/256.0))*(256.0/255.0); }\nfloat TevOverflow(float a) { return float(int(a * 255.0) % 256) / 255.0; }\nvec3 TevCompR8GT(vec3 a, vec3 b, vec3 c) { return (a.r > b.r) ? c : vec3(0); }\nfloat TevCompR8GT(float a, float b, float c) { return (a > b) ? c : 0.0; }\n\nvoid main() {\n    vec4 s_kColor0   = u_KonstColor[0]; // " + this.generateColorConstant(kColors[0]) + "\n    vec4 s_kColor1   = u_KonstColor[1]; // " + this.generateColorConstant(kColors[1]) + "\n    vec4 s_kColor2   = u_KonstColor[2]; // " + this.generateColorConstant(kColors[2]) + "\n    vec4 s_kColor3   = u_KonstColor[3]; // " + this.generateColorConstant(kColors[3]) + "\n\n    vec4 t_Color0    = u_KonstColor[4]; // " + this.generateColorConstant(rColors[0]) + "\n    vec4 t_Color1    = u_KonstColor[5]; // " + this.generateColorConstant(rColors[1]) + "\n    vec4 t_Color2    = u_KonstColor[6]; // " + this.generateColorConstant(rColors[2]) + "\n    vec4 t_ColorPrev = u_KonstColor[7]; // " + this.generateColorConstant(rColors[3]) + "\n\n    vec2 t_TexCoord = vec2(0.0, 0.0);\n" + this.generateIndTexStages(indTexStages) + "\n" + this.generateTevStages(tevStages) + "\n\n    t_ColorPrev.rgb = TevOverflow(t_ColorPrev.rgb);\n    t_ColorPrev.a = TevOverflow(t_ColorPrev.a);\n" + this.generateAlphaTest(alphaTest) + "\n    gl_FragColor = t_ColorPrev;\n}\n";
                };
                GX_Program.ub_SceneParams = 0;
                GX_Program.ub_MaterialParams = 1;
                GX_Program.ub_PacketParams = 2;
                return GX_Program;
            }(render_2.Program));
            exports_16("GX_Program", GX_Program);
        }
    };
});
// Implements Nintendo's J3D formats (BMD, BDL, BTK, etc.)
System.register("j3d/j3d", ["gl-matrix", "ArrayBufferSlice", "endian", "util", "gx/gx_displaylist", "gx/gx_material"], function (exports_17, context_17) {
    "use strict";
    var __moduleName = context_17 && context_17.id;
    function readStringTable(buffer, offs) {
        var view = buffer.createDataView(offs);
        var stringCount = view.getUint16(0x00);
        var tableIdx = 0x06;
        var strings = [];
        for (var i = 0; i < stringCount; i++) {
            var stringOffs = view.getUint16(tableIdx);
            var str = util_7.readString(buffer, offs + stringOffs, 255);
            strings.push(str);
            tableIdx += 0x04;
        }
        return strings;
    }
    function readINF1Chunk(bmd, buffer, chunkStart, chunkSize) {
        var view = buffer.createDataView(chunkStart, chunkSize);
        // unk
        var packetCount = view.getUint32(0x0C);
        var vertexCount = view.getUint32(0x10);
        var hierarchyOffs = view.getUint32(0x14);
        var node = { type: HierarchyType.End, children: [] };
        var parentStack = [node];
        var offs = hierarchyOffs;
        outer: while (true) {
            var type = view.getUint16(offs + 0x00);
            var value = view.getUint16(offs + 0x02);
            offs += 0x04;
            switch (type) {
                case HierarchyType.End:
                    break outer;
                case HierarchyType.Open:
                    parentStack.unshift(node);
                    break;
                case HierarchyType.Close:
                    node = parentStack.shift();
                    break;
                case HierarchyType.Joint:
                    node = { type: type, children: [], jointIdx: value };
                    parentStack[0].children.unshift(node);
                    break;
                case HierarchyType.Material:
                    node = { type: type, children: [], materialIdx: value };
                    parentStack[0].children.unshift(node);
                    break;
                case HierarchyType.Shape:
                    node = { type: type, children: [], shapeIdx: value };
                    parentStack[0].children.unshift(node);
                    break;
            }
        }
        util_7.assert(parentStack.length === 1);
        bmd.inf1 = { sceneGraph: parentStack.pop() };
    }
    function readVTX1Chunk(bmd, buffer, chunkStart, chunkSize) {
        var view = buffer.createDataView(chunkStart, chunkSize);
        var formatOffs = view.getUint32(0x08);
        var dataOffsLookupTable = 0x0C;
        // Data tables are stored in this order. Assumed to be hardcoded in a
        // struct somewhere inside JSystem.
        var dataTables = [
            9 /* POS */,
            10 /* NRM */,
            25 /* NBT */,
            11 /* CLR0 */,
            12 /* CLR1 */,
            13 /* TEX0 */,
            14 /* TEX1 */,
            15 /* TEX2 */,
            16 /* TEX3 */,
            17 /* TEX4 */,
            18 /* TEX5 */,
            19 /* TEX6 */,
            20 /* TEX7 */,
        ];
        var offs = formatOffs;
        var vertexArrays = new Map();
        while (true) {
            var vtxAttrib = view.getUint32(offs + 0x00);
            if (vtxAttrib === 255 /* NULL */)
                break;
            var compCnt = view.getUint32(offs + 0x04);
            var compType = view.getUint32(offs + 0x08);
            var decimalPoint = view.getUint8(offs + 0x0C);
            var scale = Math.pow(0.5, decimalPoint);
            offs += 0x10;
            var formatIdx = dataTables.indexOf(vtxAttrib);
            if (formatIdx < 0)
                continue;
            // Each attrib in the VTX1 chunk also has a corresponding data chunk containing
            // the data for that attribute, in the format stored above.
            // BMD doesn't tell us how big each data chunk is, but we need to know to figure
            // out how much data to upload. We assume the data offset lookup table is sorted
            // in order, and can figure it out by finding the next offset above us.
            var dataOffsLookupTableEntry = dataOffsLookupTable + formatIdx * 0x04;
            var dataOffsLookupTableEnd = dataOffsLookupTable + dataTables.length * 0x04;
            var dataStart = view.getUint32(dataOffsLookupTableEntry);
            var dataEnd = getDataEnd(dataOffsLookupTableEntry, dataOffsLookupTableEnd);
            var dataOffs = chunkStart + dataStart;
            var dataSize = dataEnd - dataStart;
            var compSize = gx_displaylist_1.getComponentSize(compType);
            var compCount = gx_displaylist_1.getNumComponents(vtxAttrib, compCnt);
            var vtxDataBuffer = endian_1.betoh(buffer.subarray(dataOffs, dataSize), compSize);
            var vertexArray = { vtxAttrib: vtxAttrib, compType: compType, compCount: compCount, compCnt: compCnt, scale: scale, dataOffs: dataOffs, dataSize: dataSize, buffer: vtxDataBuffer };
            vertexArrays.set(vtxAttrib, vertexArray);
        }
        bmd.vtx1 = { vertexArrays: vertexArrays };
        function getDataEnd(dataOffsLookupTableEntry, dataOffsLookupTableEnd) {
            var offs = dataOffsLookupTableEntry + 0x04;
            while (offs < dataOffsLookupTableEnd) {
                var dataOffs = view.getUint32(offs);
                if (dataOffs !== 0)
                    return dataOffs;
                offs += 0x04;
            }
            // If we can't find anything in the array, the chunks end at the chunk size.
            return chunkSize;
        }
    }
    function readDRW1Chunk(bmd, buffer, chunkStart, chunkSize) {
        var view = buffer.createDataView(chunkStart, chunkSize);
        var weightedJointCount = view.getUint16(0x08);
        var isWeightedTableOffs = view.getUint32(0x0C);
        var jointIndexTableOffs = view.getUint32(0x10);
        var isAnyWeighted = false;
        var weightedJoints = [];
        for (var i = 0; i < weightedJointCount; i++) {
            var isWeighted = !!view.getUint8(isWeightedTableOffs + i);
            if (isWeighted)
                isAnyWeighted = true;
            var jointIndex = view.getUint16(jointIndexTableOffs + i * 0x02);
            weightedJoints.push({ isWeighted: isWeighted, jointIndex: jointIndex });
        }
        bmd.drw1 = { weightedJoints: weightedJoints, isAnyWeighted: isAnyWeighted };
    }
    function readJNT1Chunk(bmd, buffer, chunkStart, chunkSize) {
        var view = buffer.createDataView(chunkStart, chunkSize);
        var boneDataCount = view.getUint16(0x08);
        util_7.assert(view.getUint16(0x0A) === 0xFFFF);
        var boneDataTableOffs = view.getUint32(0x0C);
        var remapTableOffs = view.getUint32(0x10);
        var remapTable = [];
        for (var i = 0; i < boneDataCount; i++)
            remapTable[i] = view.getUint16(remapTableOffs + i * 0x02);
        var nameTableOffs = view.getUint32(0x14);
        var nameTable = readStringTable(buffer, chunkStart + nameTableOffs);
        var q = gl_matrix_4.quat.create();
        var bones = [];
        var boneDataTableIdx = boneDataTableOffs;
        for (var i = 0; i < boneDataCount; i++) {
            var name_1 = nameTable[i];
            var scaleX = view.getFloat32(boneDataTableIdx + 0x04);
            var scaleY = view.getFloat32(boneDataTableIdx + 0x08);
            var scaleZ = view.getFloat32(boneDataTableIdx + 0x0C);
            var rotationX = view.getUint16(boneDataTableIdx + 0x10) / 0x7FFF;
            var rotationY = view.getUint16(boneDataTableIdx + 0x12) / 0x7FFF;
            var rotationZ = view.getUint16(boneDataTableIdx + 0x14) / 0x7FFF;
            var translationX = view.getFloat32(boneDataTableIdx + 0x18);
            var translationY = view.getFloat32(boneDataTableIdx + 0x1C);
            var translationZ = view.getFloat32(boneDataTableIdx + 0x20);
            // Skipping bounding box data for now.
            gl_matrix_4.quat.fromEuler(q, rotationX * 180, rotationY * 180, rotationZ * 180);
            var matrix = gl_matrix_4.mat4.create();
            gl_matrix_4.mat4.fromRotationTranslationScale(matrix, q, [translationX, translationY, translationZ], [scaleX, scaleY, scaleZ]);
            bones.push({ name: name_1, matrix: matrix });
            boneDataTableIdx += 0x40;
        }
        bmd.jnt1 = { remapTable: remapTable, bones: bones };
    }
    function readIndex(view, offs, type) {
        switch (type) {
            case 2 /* INDEX8 */:
                return view.getUint8(offs);
            case 3 /* INDEX16 */:
                return view.getUint16(offs);
            default:
                throw new Error("Unknown index data type " + type + "!");
        }
    }
    function readSHP1Chunk(bmd, buffer, chunkStart, chunkSize) {
        var view = buffer.createDataView(chunkStart, chunkSize);
        var shapeCount = view.getUint16(0x08);
        var shapeTableOffs = view.getUint32(0x0C);
        var attribTableOffs = view.getUint32(0x18);
        var matrixTableOffs = view.getUint32(0x1C);
        var primDataOffs = view.getUint32(0x20);
        var matrixDataOffs = view.getUint32(0x24);
        var packetTableOffs = view.getUint32(0x28);
        // We have a number of "shapes". Each shape has a number of vertex attributes
        // (e.g. pos, nrm, txc) and a list of packets. Each packet has a list of draw
        // calls, and each draw call has a list of indices into *each* of the vertex
        // arrays, one per vertex.
        //
        // Instead of one global index per draw call like OGL and some amount of packed
        // vertex data, the GX instead allows specifying separate indices per attribute.
        // So you can have POS's indexes be 0 1 2 3 and NRM's indexes be 0 0 0 0.
        //
        // What we end up doing is similar to what Dolphin does with its vertex loader
        // JIT. We construct buffers for each of the components that are shape-specific.
        // Build vattrs for VTX1.
        var vattrs = [];
        var vtxArrays = [];
        // Hardcoded by the J3D engine.
        for (var i = 0 /* PNMTXIDX */; i < 8 /* TEX7MTXIDX */; i++) {
            vattrs[i] = { compCnt: 1, compType: 0 /* U8 */ };
        }
        try {
            for (var _a = __values(bmd.vtx1.vertexArrays.entries()), _b = _a.next(); !_b.done; _b = _a.next()) {
                var _c = __read(_b.value, 2), attr = _c[0], vertexArray = _c[1];
                vattrs[attr] = { compCnt: vertexArray.compCnt, compType: vertexArray.compType };
                vtxArrays[attr] = { buffer: vertexArray.buffer, offs: 0 };
            }
        }
        catch (e_17_1) { e_17 = { error: e_17_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
            }
            finally { if (e_17) throw e_17.error; }
        }
        var shapes = [];
        var shapeIdx = shapeTableOffs;
        for (var i = 0; i < shapeCount; i++) {
            var displayFlags = view.getUint8(shapeIdx + 0x00);
            util_7.assert(view.getUint8(shapeIdx + 0x01) == 0xFF);
            var packetCount = view.getUint16(shapeIdx + 0x02);
            var attribOffs = view.getUint16(shapeIdx + 0x04);
            var firstMatrix = view.getUint16(shapeIdx + 0x06);
            var firstPacket = view.getUint16(shapeIdx + 0x08);
            var vtxDescs = [];
            var attribIdx = attribTableOffs + attribOffs;
            while (true) {
                var vtxAttrib = view.getUint32(attribIdx + 0x00);
                if (vtxAttrib === 255 /* NULL */)
                    break;
                var indexDataType = view.getUint32(attribIdx + 0x04);
                vtxDescs[vtxAttrib] = { type: indexDataType };
                attribIdx += 0x08;
            }
            var vtxLoader = gx_displaylist_1.compileVtxLoader(vattrs, vtxDescs);
            var packedVertexAttributes = [];
            for (var vtxAttrib = 0; vtxAttrib < vtxLoader.vattrLayout.dstAttrOffsets.length; vtxAttrib++) {
                if (!vtxDescs[vtxAttrib])
                    continue;
                // TODO(jstpierre): Support DIRECT attributes.
                if (vtxArrays[vtxAttrib] === undefined)
                    continue;
                var indexDataType = vtxDescs[vtxAttrib].type;
                var offset = vtxLoader.vattrLayout.dstAttrOffsets[vtxAttrib];
                packedVertexAttributes.push({ vtxAttrib: vtxAttrib, indexDataType: indexDataType, offset: offset });
            }
            var packedVertexSize = vtxLoader.vattrLayout.dstVertexSize;
            // Now parse out the packets.
            var packetIdx = packetTableOffs + (firstPacket * 0x08);
            var packets = [];
            var loadedDatas = [];
            var totalTriangleCount = 0;
            for (var j = 0; j < packetCount; j++) {
                var packetSize = view.getUint32(packetIdx + 0x00);
                var packetStart = primDataOffs + view.getUint32(packetIdx + 0x04);
                var packetMatrixDataOffs = matrixDataOffs + (firstMatrix + j) * 0x08;
                var matrixCount = view.getUint16(packetMatrixDataOffs + 0x02);
                var matrixFirstIndex = view.getUint32(packetMatrixDataOffs + 0x04);
                var packetMatrixTableOffs = chunkStart + matrixTableOffs + matrixFirstIndex * 0x02;
                var packetMatrixTableSize = matrixCount * 0x02;
                var weightedJointTable = endian_1.betoh(buffer.subarray(packetMatrixTableOffs, packetMatrixTableSize), 2).createTypedArray(Uint16Array);
                var srcOffs = chunkStart + packetStart;
                var subBuffer = buffer.subarray(srcOffs, packetSize);
                var loadedSubData = vtxLoader.runVertices(vtxArrays, subBuffer);
                loadedDatas.push(loadedSubData);
                var firstTriangle = totalTriangleCount;
                var numTriangles = loadedSubData.totalTriangleCount;
                totalTriangleCount += numTriangles;
                packets.push({ weightedJointTable: weightedJointTable, firstTriangle: firstTriangle, numTriangles: numTriangles });
                packetIdx += 0x08;
            }
            // Coalesce shape data.
            var loadedData = gx_displaylist_1.coalesceLoadedDatas(loadedDatas);
            var indexData = new ArrayBufferSlice_5.default(loadedData.indexData.buffer);
            var packedData = new ArrayBufferSlice_5.default(loadedData.packedVertexData.buffer);
            // Now we should have a complete shape. Onto the next!
            shapes.push({ displayFlags: displayFlags, indexData: indexData, packedData: packedData, packedVertexSize: packedVertexSize, packedVertexAttributes: packedVertexAttributes, packets: packets });
            shapeIdx += 0x28;
        }
        var shp1 = { shapes: shapes };
        bmd.shp1 = shp1;
        var e_17, _d;
    }
    function createTexMtx(m, scaleS, scaleT, rotation, translationS, translationT, centerS, centerT, centerQ) {
        // TODO(jstpierre): Remove these.
        gl_matrix_4.mat4.fromTranslation(c, [centerS, centerT, centerQ]);
        gl_matrix_4.mat4.fromTranslation(ci, [-centerS, -centerT, -centerQ]);
        gl_matrix_4.mat4.fromTranslation(m, [translationS, translationT, 0]);
        gl_matrix_4.mat4.fromScaling(t, [scaleS, scaleT, 1]);
        gl_matrix_4.mat4.rotateZ(t, t, rotation * Math.PI);
        gl_matrix_4.mat4.mul(t, t, ci);
        gl_matrix_4.mat4.mul(t, c, t);
        gl_matrix_4.mat4.mul(m, m, t);
        return m;
    }
    function readColor32(view, srcOffs) {
        var r = view.getUint8(srcOffs + 0x00) / 255;
        var g = view.getUint8(srcOffs + 0x01) / 255;
        var b = view.getUint8(srcOffs + 0x02) / 255;
        var a = view.getUint8(srcOffs + 0x03) / 255;
        return new GX_Material.Color(r, g, b, a);
    }
    function readColorShort(view, srcOffs) {
        var r = view.getInt16(srcOffs + 0x00) / 255;
        var g = view.getInt16(srcOffs + 0x02) / 255;
        var b = view.getInt16(srcOffs + 0x04) / 255;
        var a = view.getInt16(srcOffs + 0x06) / 255;
        return new GX_Material.Color(r, g, b, a);
    }
    function readMAT3Chunk(bmd, buffer, chunkStart, chunkSize) {
        var view = buffer.createDataView(chunkStart, chunkSize);
        var materialCount = view.getUint16(0x08);
        var remapTableOffs = view.getUint32(0x10);
        var remapTable = [];
        for (var i = 0; i < materialCount; i++)
            remapTable[i] = view.getUint16(remapTableOffs + i * 0x02);
        var maxIndex = Math.max.apply(null, remapTable);
        var nameTableOffs = view.getUint32(0x14);
        var nameTable = readStringTable(buffer, chunkStart + nameTableOffs);
        var indirectTableOffset = view.getUint32(0x18);
        var cullModeTableOffs = view.getUint32(0x1C);
        var materialColorTableOffs = view.getUint32(0x20);
        var colorChanCountTableOffs = view.getUint32(0x24);
        var colorChanTableOffs = view.getUint32(0x28);
        var texGenTableOffs = view.getUint32(0x38);
        var postTexGenTableOffs = view.getUint32(0x3C);
        var textureTableOffs = view.getUint32(0x48);
        var texMtxTableOffs = view.getUint32(0x40);
        var postTexMtxTableOffs = view.getUint32(0x44);
        var tevOrderTableOffs = view.getUint32(0x4C);
        var colorRegisterTableOffs = view.getUint32(0x50);
        var colorConstantTableOffs = view.getUint32(0x54);
        var tevStageTableOffs = view.getUint32(0x5C);
        var alphaTestTableOffs = view.getUint32(0x6C);
        var blendModeTableOffs = view.getUint32(0x70);
        var depthModeTableOffs = view.getUint32(0x74);
        var materialEntries = [];
        var materialEntryIdx = view.getUint32(0x0C);
        for (var i = 0; i <= maxIndex; i++) {
            var index = i;
            var name_2 = nameTable[i];
            var flags = view.getUint8(materialEntryIdx + 0x00);
            var cullModeIndex = view.getUint8(materialEntryIdx + 0x01);
            var colorChanCountIndex = view.getUint8(materialEntryIdx + 0x02);
            var texGenCountIndex = view.getUint8(materialEntryIdx + 0x03);
            var tevCountIndex = view.getUint8(materialEntryIdx + 0x04);
            // unk
            var depthModeIndex = view.getUint8(materialEntryIdx + 0x06);
            // unk
            var colorMatRegs = [null, null];
            for (var j = 0; j < 2; j++) {
                var matColorIndex = view.getUint16(materialEntryIdx + 0x08 + j * 0x02);
                var matColorOffs = materialColorTableOffs + matColorIndex * 0x04;
                var matColorReg = readColor32(view, matColorOffs);
                colorMatRegs[j] = matColorReg;
            }
            var lightChannelCount = view.getUint8(colorChanCountTableOffs + colorChanCountIndex);
            var lightChannels = [];
            for (var j = 0; j < lightChannelCount; j++) {
                var colorChannelIndex = view.getInt16(materialEntryIdx + 0x0C + ((j * 2 + 0) * 0x02));
                var colorChannel = readColorChannel(colorChanTableOffs, colorChannelIndex);
                var alphaChannelIndex = view.getInt16(materialEntryIdx + 0x0C + ((j * 2 + 1) * 0x02));
                var alphaChannel = readColorChannel(colorChanTableOffs, alphaChannelIndex);
                lightChannels.push({ colorChannel: colorChannel, alphaChannel: alphaChannel });
            }
            var texGens = [];
            for (var j = 0; j < 8; j++) {
                var texGenIndex = view.getInt16(materialEntryIdx + 0x28 + j * 0x02);
                if (texGenIndex < 0)
                    continue;
                var index_1 = j;
                var type = view.getUint8(texGenTableOffs + texGenIndex * 0x04 + 0x00);
                var source = view.getUint8(texGenTableOffs + texGenIndex * 0x04 + 0x01);
                var matrix = view.getUint8(texGenTableOffs + texGenIndex * 0x04 + 0x02);
                util_7.assert(view.getUint8(texGenTableOffs + texGenIndex * 0x04 + 0x03) === 0xFF);
                var postMatrix = 125 /* PTIDENTITY */;
                var postTexGenIndex = view.getInt16(materialEntryIdx + 0x38 + j * 0x02);
                if (postTexGenTableOffs > 0 && postTexGenIndex >= 0) {
                    postMatrix = view.getUint8(postTexGenTableOffs + texGenIndex * 0x04 + 0x02);
                    util_7.assert(view.getUint8(postTexGenTableOffs + postTexGenIndex * 0x04 + 0x03) === 0xFF);
                }
                var normalize = false;
                var texGen = { index: index_1, type: type, source: source, matrix: matrix, normalize: normalize, postMatrix: postMatrix };
                texGens.push(texGen);
            }
            var texMatrices = [];
            for (var j = 0; j < 10; j++) {
                texMatrices[j] = null;
                var texMtxIndex = view.getInt16(materialEntryIdx + 0x48 + j * 0x02);
                if (texMtxIndex < 0)
                    continue;
                texMatrices[j] = readTexMatrix(texMtxTableOffs, j, texMtxIndex);
            }
            var postTexMatrices = [];
            for (var j = 0; j < 20; j++) {
                postTexMatrices[j] = null;
                var postTexMtxIndex = view.getInt16(materialEntryIdx + 0x5C + j * 0x02);
                if (postTexMtxIndex < 0)
                    continue;
                postTexMatrices[j] = readTexMatrix(postTexMtxTableOffs, j, postTexMtxIndex);
            }
            var colorConstants = [];
            for (var j = 0; j < 4; j++) {
                var colorIndex = view.getUint16(materialEntryIdx + 0x94 + j * 0x02);
                var color = readColor32(view, colorConstantTableOffs + colorIndex * 0x04);
                colorConstants.push(color);
            }
            var colorRegisters = [];
            for (var j = 0; j < 4; j++) {
                var colorIndex = view.getUint16(materialEntryIdx + 0xDC + j * 0x02);
                var color = readColorShort(view, colorRegisterTableOffs + colorIndex * 0x08);
                colorRegisters.push(color);
            }
            var textureIndexTableIdx = materialEntryIdx + 0x84;
            var textureIndexes = [];
            for (var j = 0; j < 8; j++) {
                var textureTableIndex = view.getInt16(textureIndexTableIdx);
                if (textureTableIndex >= 0) {
                    var textureIndex = view.getUint16(textureTableOffs + textureTableIndex * 0x02);
                    textureIndexes.push(textureIndex);
                }
                else {
                    textureIndexes.push(-1);
                }
                textureIndexTableIdx += 0x02;
            }
            var indirectEntryOffs = indirectTableOffset + i * 0x138;
            var indirectStageCount = view.getUint8(indirectEntryOffs + 0x00);
            util_7.assert(indirectStageCount <= 4);
            var indTexStages = [];
            for (var j = 0; j < indirectStageCount; j++) {
                var index_2 = j;
                // SetIndTexOrder
                var indTexOrderOffs = indirectEntryOffs + 0x04 + j * 0x04;
                var texCoordId = view.getUint8(indTexOrderOffs + 0x00);
                var texture = view.getUint8(indTexOrderOffs + 0x01);
                // SetIndTexCoordScale
                var indTexScaleOffs = indirectEntryOffs + 0x04 + (0x04 * 4) + (0x1C * 3) + j * 0x04;
                var scaleS = view.getUint8(indTexScaleOffs + 0x00);
                var scaleT = view.getUint8(indTexScaleOffs + 0x01);
                indTexStages.push({ index: index_2, texCoordId: texCoordId, texture: texture, scaleS: scaleS, scaleT: scaleT });
            }
            // SetIndTexMatrix
            var indTexMatrices = [];
            for (var j = 0; j < 3; j++) {
                var indTexMatrixOffs = indirectEntryOffs + 0x04 + (0x04 * 4) + j * 0x1C;
                var p00 = view.getFloat32(indTexMatrixOffs + 0x00);
                var p01 = view.getFloat32(indTexMatrixOffs + 0x04);
                var p02 = view.getFloat32(indTexMatrixOffs + 0x08);
                var p10 = view.getFloat32(indTexMatrixOffs + 0x0C);
                var p11 = view.getFloat32(indTexMatrixOffs + 0x10);
                var p12 = view.getFloat32(indTexMatrixOffs + 0x14);
                var scale = Math.pow(2, view.getInt8(indTexMatrixOffs + 0x18));
                var m = new Float32Array([
                    p00 * scale, p01 * scale, p02 * scale,
                    p10 * scale, p11 * scale, p12 * scale,
                ]);
                indTexMatrices.push(m);
            }
            var tevStages = [];
            for (var j = 0; j < 16; j++) {
                // TevStage
                var tevStageIndex = view.getInt16(materialEntryIdx + 0xE4 + j * 0x02);
                if (tevStageIndex < 0)
                    continue;
                var index_3 = j;
                var tevStageOffs = tevStageTableOffs + tevStageIndex * 0x14;
                // const unknown0 = view.getUint8(tevStageOffs + 0x00);
                var colorInA = view.getUint8(tevStageOffs + 0x01);
                var colorInB = view.getUint8(tevStageOffs + 0x02);
                var colorInC = view.getUint8(tevStageOffs + 0x03);
                var colorInD = view.getUint8(tevStageOffs + 0x04);
                var colorOp = view.getUint8(tevStageOffs + 0x05);
                var colorBias = view.getUint8(tevStageOffs + 0x06);
                var colorScale = view.getUint8(tevStageOffs + 0x07);
                var colorClamp = !!view.getUint8(tevStageOffs + 0x08);
                var colorRegId = view.getUint8(tevStageOffs + 0x09);
                var alphaInA = view.getUint8(tevStageOffs + 0x0A);
                var alphaInB = view.getUint8(tevStageOffs + 0x0B);
                var alphaInC = view.getUint8(tevStageOffs + 0x0C);
                var alphaInD = view.getUint8(tevStageOffs + 0x0D);
                var alphaOp = view.getUint8(tevStageOffs + 0x0E);
                var alphaBias = view.getUint8(tevStageOffs + 0x0F);
                var alphaScale = view.getUint8(tevStageOffs + 0x10);
                var alphaClamp = !!view.getUint8(tevStageOffs + 0x11);
                var alphaRegId = view.getUint8(tevStageOffs + 0x12);
                // const unknown1 = view.getUint8(tevStageOffs + 0x13);
                // TevOrder
                var tevOrderIndex = view.getUint16(materialEntryIdx + 0xBC + j * 0x02);
                var tevOrderOffs = tevOrderTableOffs + tevOrderIndex * 0x04;
                var texCoordId = view.getUint8(tevOrderOffs + 0x00);
                var texMap = view.getUint8(tevOrderOffs + 0x01);
                var channelId = view.getUint8(tevOrderOffs + 0x02);
                util_7.assert(view.getUint8(tevOrderOffs + 0x03) === 0xFF);
                // KonstSel
                var konstColorSel = view.getUint8(materialEntryIdx + 0x9C + j);
                var konstAlphaSel = view.getUint8(materialEntryIdx + 0xAC + j);
                // SetTevIndirect
                var indTexStageOffs = indirectEntryOffs + 0x04 + (0x04 * 4) + (0x1C * 3) + (0x04 * 4) + j * 0x0C;
                var indTexStage = view.getUint8(indTexStageOffs + 0x00);
                var indTexFormat = view.getUint8(indTexStageOffs + 0x01);
                var indTexBiasSel = view.getUint8(indTexStageOffs + 0x02);
                var indTexMatrix = view.getUint8(indTexStageOffs + 0x03);
                util_7.assert(indTexMatrix <= 11 /* T2 */);
                var indTexWrapS = view.getUint8(indTexStageOffs + 0x04);
                var indTexWrapT = view.getUint8(indTexStageOffs + 0x05);
                var indTexAddPrev = !!view.getUint8(indTexStageOffs + 0x06);
                var indTexUseOrigLOD = !!view.getUint8(indTexStageOffs + 0x07);
                // bumpAlpha
                var tevStage = {
                    index: index_3,
                    colorInA: colorInA, colorInB: colorInB, colorInC: colorInC, colorInD: colorInD, colorOp: colorOp, colorBias: colorBias, colorScale: colorScale, colorClamp: colorClamp, colorRegId: colorRegId,
                    alphaInA: alphaInA, alphaInB: alphaInB, alphaInC: alphaInC, alphaInD: alphaInD, alphaOp: alphaOp, alphaBias: alphaBias, alphaScale: alphaScale, alphaClamp: alphaClamp, alphaRegId: alphaRegId,
                    texCoordId: texCoordId, texMap: texMap, channelId: channelId,
                    konstColorSel: konstColorSel, konstAlphaSel: konstAlphaSel,
                    indTexStage: indTexStage,
                    indTexFormat: indTexFormat,
                    indTexBiasSel: indTexBiasSel,
                    indTexMatrix: indTexMatrix,
                    indTexWrapS: indTexWrapS,
                    indTexWrapT: indTexWrapT,
                    indTexAddPrev: indTexAddPrev,
                    indTexUseOrigLOD: indTexUseOrigLOD,
                };
                tevStages.push(tevStage);
            }
            // SetAlphaCompare
            var alphaTestIndex = view.getUint16(materialEntryIdx + 0x146);
            var blendModeIndex = view.getUint16(materialEntryIdx + 0x148);
            var alphaTestOffs = alphaTestTableOffs + alphaTestIndex * 0x08;
            var compareA = view.getUint8(alphaTestOffs + 0x00);
            var referenceA = view.getUint8(alphaTestOffs + 0x01) / 0xFF;
            var op = view.getUint8(alphaTestOffs + 0x02);
            var compareB = view.getUint8(alphaTestOffs + 0x03);
            var referenceB = view.getUint8(alphaTestOffs + 0x04) / 0xFF;
            var alphaTest = { compareA: compareA, referenceA: referenceA, op: op, compareB: compareB, referenceB: referenceB };
            // SetBlendMode
            var blendModeOffs = blendModeTableOffs + blendModeIndex * 0x04;
            var blendType = view.getUint8(blendModeOffs + 0x00);
            var blendSrc = view.getUint8(blendModeOffs + 0x01);
            var blendDst = view.getUint8(blendModeOffs + 0x02);
            var blendLogicOp = view.getUint8(blendModeOffs + 0x03);
            var blendMode = { type: blendType, srcFactor: blendSrc, dstFactor: blendDst, logicOp: blendLogicOp };
            var cullMode = view.getUint32(cullModeTableOffs + cullModeIndex * 0x04);
            var depthModeOffs = depthModeTableOffs + depthModeIndex * 4;
            var depthTest = !!view.getUint8(depthModeOffs + 0x00);
            var depthFunc = view.getUint8(depthModeOffs + 0x01);
            var depthWrite = !!view.getUint8(depthModeOffs + 0x02);
            var ropInfo = { blendMode: blendMode, depthTest: depthTest, depthFunc: depthFunc, depthWrite: depthWrite };
            var translucent = !(flags & 0x03);
            var gxMaterial = {
                index: index, name: name_2,
                cullMode: cullMode,
                lightChannels: lightChannels,
                texGens: texGens,
                colorRegisters: colorRegisters,
                colorConstants: colorConstants,
                tevStages: tevStages,
                indTexStages: indTexStages,
                alphaTest: alphaTest,
                ropInfo: ropInfo,
            };
            materialEntries.push({
                index: index, name: name_2,
                translucent: translucent,
                textureIndexes: textureIndexes,
                texMatrices: texMatrices,
                postTexMatrices: postTexMatrices,
                gxMaterial: gxMaterial,
                colorMatRegs: colorMatRegs,
                indTexMatrices: indTexMatrices,
            });
            materialEntryIdx += 0x014C;
        }
        bmd.mat3 = { remapTable: remapTable, materialEntries: materialEntries };
        function readColorChannel(tableOffs, colorChanIndex) {
            var colorChanOffs = colorChanTableOffs + colorChanIndex * 0x08;
            var lightingEnabled = !!view.getUint8(colorChanOffs + 0x00);
            util_7.assert(view.getUint8(colorChanOffs + 0x00) < 2);
            var matColorSource = view.getUint8(colorChanOffs + 0x01);
            var litMask = view.getUint8(colorChanOffs + 0x02);
            var diffuseFunction = view.getUint8(colorChanOffs + 0x03);
            var attenuationFunction = view.getUint8(colorChanOffs + 0x04);
            var ambColorSource = view.getUint8(colorChanOffs + 0x05);
            var colorChan = { lightingEnabled: lightingEnabled, matColorSource: matColorSource, ambColorSource: ambColorSource };
            return colorChan;
        }
        function readTexMatrix(tableOffs, j, texMtxIndex) {
            if (tableOffs === 0)
                return null;
            var texMtxOffs = tableOffs + texMtxIndex * 0x64;
            var projection = view.getUint8(texMtxOffs + 0x00);
            var type = view.getUint8(texMtxOffs + 0x01);
            util_7.assert(view.getUint16(texMtxOffs + 0x02) === 0xFFFF);
            var centerS = view.getFloat32(texMtxOffs + 0x04);
            var centerT = view.getFloat32(texMtxOffs + 0x08);
            var centerQ = view.getFloat32(texMtxOffs + 0x0C);
            var scaleS = view.getFloat32(texMtxOffs + 0x10);
            var scaleT = view.getFloat32(texMtxOffs + 0x14);
            var rotation = view.getInt16(texMtxOffs + 0x18) / 0x7FFF;
            util_7.assert(view.getUint16(texMtxOffs + 0x1A) === 0xFFFF);
            var translationS = view.getFloat32(texMtxOffs + 0x1C);
            var translationT = view.getFloat32(texMtxOffs + 0x20);
            // A second matrix?
            var p00 = view.getFloat32(texMtxOffs + 0x24);
            var p01 = view.getFloat32(texMtxOffs + 0x28);
            var p02 = view.getFloat32(texMtxOffs + 0x2C);
            var p03 = view.getFloat32(texMtxOffs + 0x30);
            var p10 = view.getFloat32(texMtxOffs + 0x34);
            var p11 = view.getFloat32(texMtxOffs + 0x38);
            var p12 = view.getFloat32(texMtxOffs + 0x3C);
            var p13 = view.getFloat32(texMtxOffs + 0x40);
            var p20 = view.getFloat32(texMtxOffs + 0x44);
            var p21 = view.getFloat32(texMtxOffs + 0x48);
            var p22 = view.getFloat32(texMtxOffs + 0x4C);
            var p23 = view.getFloat32(texMtxOffs + 0x50);
            var p30 = view.getFloat32(texMtxOffs + 0x54);
            var p31 = view.getFloat32(texMtxOffs + 0x58);
            var p32 = view.getFloat32(texMtxOffs + 0x5C);
            var p33 = view.getFloat32(texMtxOffs + 0x60);
            var projectionMatrix = gl_matrix_4.mat4.fromValues(p00, p10, p20, p30, p01, p11, p21, p31, p02, p12, p22, p32, p03, p13, p23, p33);
            var matrix = gl_matrix_4.mat4.create();
            createTexMtx(matrix, scaleS, scaleT, rotation, translationS, translationT, centerS, centerT, centerQ);
            var texMtx = { type: type, projection: projection, projectionMatrix: projectionMatrix, matrix: matrix };
            return texMtx;
        }
    }
    function readBTI_Texture(buffer, name) {
        var view = buffer.createDataView();
        var format = view.getUint8(0x00);
        var width = view.getUint16(0x02);
        var height = view.getUint16(0x04);
        var wrapS = view.getUint8(0x06);
        var wrapT = view.getUint8(0x07);
        var paletteFormat = view.getUint8(0x09);
        var paletteNumEntries = view.getUint16(0x0A);
        var paletteOffs = view.getUint16(0x0C);
        var minFilter = view.getUint8(0x14);
        var magFilter = view.getUint8(0x15);
        var minLOD = view.getInt8(0x16) * 1 / 8;
        var maxLOD = view.getInt8(0x17) * 1 / 8;
        var mipCount = view.getUint8(0x18);
        var lodBias = view.getInt16(0x1A) * 1 / 100;
        var dataOffs = view.getUint32(0x1C);
        util_7.assert(minLOD === 0);
        var data = null;
        if (dataOffs !== 0)
            data = buffer.slice(dataOffs);
        return { name: name, format: format, width: width, height: height, wrapS: wrapS, wrapT: wrapT, minFilter: minFilter, magFilter: magFilter, minLOD: minLOD, maxLOD: maxLOD, mipCount: mipCount, lodBias: lodBias, data: data };
    }
    function readTEX1Chunk(bmd, buffer, chunkStart, chunkSize) {
        var view = buffer.createDataView(chunkStart, chunkSize);
        var textureCount = view.getUint16(0x08);
        var textureHeaderOffs = view.getUint32(0x0C);
        var nameTableOffs = view.getUint32(0x10);
        var nameTable = readStringTable(buffer, chunkStart + nameTableOffs);
        var samplers = [];
        var textureDatas = [];
        var _loop_3 = function (i) {
            var textureIdx = textureHeaderOffs + i * 0x20;
            var name_3 = nameTable[i];
            var btiTexture = readBTI_Texture(buffer.slice(chunkStart + textureIdx), name_3);
            var textureDataIndex = -1;
            // Try to find existing texture data.
            if (btiTexture.data !== null) {
                textureDataIndex = textureDatas.findIndex(function (tex) { return tex.data && tex.data.byteOffset === btiTexture.data.byteOffset; });
            }
            if (textureDataIndex < 0) {
                var textureData = {
                    name: btiTexture.name,
                    width: btiTexture.width,
                    height: btiTexture.height,
                    format: btiTexture.format,
                    mipCount: btiTexture.mipCount,
                    data: btiTexture.data,
                };
                textureDatas.push(textureData);
                textureDataIndex = textureDatas.length - 1;
            }
            // Sampler.
            var sampler = {
                index: i,
                name: btiTexture.name,
                wrapS: btiTexture.wrapS,
                wrapT: btiTexture.wrapT,
                minFilter: btiTexture.minFilter,
                magFilter: btiTexture.magFilter,
                minLOD: btiTexture.minLOD,
                maxLOD: btiTexture.maxLOD,
                lodBias: btiTexture.lodBias,
                textureDataIndex: textureDataIndex,
            };
            samplers.push(sampler);
        };
        for (var i = 0; i < textureCount; i++) {
            _loop_3(i);
        }
        bmd.tex1 = { textureDatas: textureDatas, samplers: samplers };
    }
    function readTTK1Chunk(btk, buffer, chunkStart, chunkSize) {
        var view = buffer.createDataView(chunkStart, chunkSize);
        var loopMode = view.getUint8(0x08);
        var rotationDecimal = view.getUint8(0x09);
        var duration = view.getUint16(0x0A);
        var animationCount = view.getUint16(0x0C) / 3;
        var sCount = view.getUint16(0x0E);
        var rCount = view.getUint16(0x10);
        var tCount = view.getUint16(0x12);
        var animationTableOffs = view.getUint32(0x14);
        var remapTableOffs = view.getUint32(0x18);
        var materialNameTableOffs = view.getUint32(0x1C);
        var texMtxIndexTableOffs = view.getUint32(0x20);
        var textureCenterTableOffs = view.getUint32(0x24);
        var sTableOffs = chunkStart + view.getUint32(0x28);
        var rTableOffs = chunkStart + view.getUint32(0x2C);
        var tTableOffs = chunkStart + view.getUint32(0x30);
        var rotationScale = Math.pow(2, rotationDecimal) / 32767;
        function convertRotationTable(table) {
            var v = new Float32Array(table.length);
            for (var i = 0; i < table.length; i++)
                v[i] = table[i] * rotationScale;
            return v;
        }
        var sTable = endian_1.betoh(buffer.subarray(sTableOffs, sCount * 4), 4).createTypedArray(Float32Array);
        var rTable = convertRotationTable(endian_1.betoh(buffer.subarray(rTableOffs, rCount * 2), 2).createTypedArray(Int16Array));
        var tTable = endian_1.betoh(buffer.subarray(tTableOffs, tCount * 4), 4).createTypedArray(Float32Array);
        var materialNameTable = readStringTable(buffer, chunkStart + materialNameTableOffs);
        var animationTableIdx = animationTableOffs;
        function readAnimationTrack(data) {
            var count = view.getUint16(animationTableIdx + 0x00);
            var index = view.getUint16(animationTableIdx + 0x02);
            var tangent = view.getUint16(animationTableIdx + 0x04);
            animationTableIdx += 0x06;
            // Special exception.
            if (count === 1) {
                var value = data[index];
                var frames_1 = [{ time: 0, value: value, tangentIn: 0, tangentOut: 0 }];
                return { frames: frames_1 };
            }
            else {
                var frames_2 = [];
                if (tangent === 0 /* IN */) {
                    for (var i = index; i < index + 3 * count; i += 3) {
                        var time = data[i + 0], value = data[i + 1], tangentIn = data[i + 2], tangentOut = tangentIn;
                        frames_2.push({ time: time, value: value, tangentIn: tangentIn, tangentOut: tangentOut });
                    }
                }
                else if (tangent === 1 /* IN_OUT */) {
                    for (var i = index; i < index + 4 * count; i += 4) {
                        var time = data[i + 0], value = data[i + 1], tangentIn = data[i + 2], tangentOut = data[i + 3];
                        frames_2.push({ time: time, value: value, tangentIn: tangentIn, tangentOut: tangentOut });
                    }
                }
                return { frames: frames_2 };
            }
        }
        function readAnimationComponent() {
            var scale = readAnimationTrack(sTable);
            var rotation = readAnimationTrack(rTable);
            var translation = readAnimationTrack(tTable);
            return { scale: scale, rotation: rotation, translation: translation };
        }
        var materialAnimationEntries = [];
        for (var i = 0; i < animationCount; i++) {
            var materialName = materialNameTable[i];
            var remapIndex = view.getUint16(remapTableOffs + i * 0x02);
            var texMtxIndex = view.getUint8(texMtxIndexTableOffs + i);
            var centerS = view.getFloat32(textureCenterTableOffs + i * 0x0C + 0x00);
            var centerT = view.getFloat32(textureCenterTableOffs + i * 0x0C + 0x04);
            var centerQ = view.getFloat32(textureCenterTableOffs + i * 0x0C + 0x08);
            var s = readAnimationComponent();
            var t_1 = readAnimationComponent();
            var q = readAnimationComponent();
            materialAnimationEntries.push({ materialName: materialName, remapIndex: remapIndex, texMtxIndex: texMtxIndex, centerS: centerS, centerT: centerT, centerQ: centerQ, s: s, t: t_1, q: q });
        }
        btk.ttk1 = { duration: duration, loopMode: loopMode, materialAnimationEntries: materialAnimationEntries };
    }
    function applyLoopMode(t, loopMode) {
        switch (loopMode) {
            case 0 /* ONCE */:
                return Math.min(t, 1);
            case 2 /* REPEAT */:
                return t % 1;
            case 3 /* MIRRORED_ONCE */:
                return 1 - Math.abs((Math.min(t, 2) - 1));
            case 4 /* MIRRORED_REPEAT */:
                return 1 - Math.abs((t % 2) - 1);
        }
    }
    function cubicEval(cf0, cf1, cf2, cf3, t) {
        return (((cf0 * t + cf1) * t + cf2) * t + cf3);
    }
    function lerp(k0, k1, t) {
        return k0.value + (k1.value - k0.value) * t;
    }
    function hermiteInterpolate(k0, k1, t) {
        var length = k1.time - k0.time;
        var p0 = k0.value;
        var p1 = k1.value;
        var s0 = k0.tangentOut * length;
        var s1 = k1.tangentIn * length;
        var cf0 = (p0 * 2) + (p1 * -2) + (s0 * 1) + (s1 * 1);
        var cf1 = (p0 * -3) + (p1 * 3) + (s0 * -2) + (s1 * -1);
        var cf2 = (p0 * 0) + (p1 * 0) + (s0 * 1) + (s1 * 0);
        var cf3 = (p0 * 1) + (p1 * 0) + (s0 * 0) + (s1 * 0);
        return cubicEval(cf0, cf1, cf2, cf3, t);
    }
    function sampleAnimationData(track, frame) {
        var frames = track.frames;
        if (frames.length === 1)
            return frames[0].value;
        // Find the first frame.
        var idx1 = frames.findIndex(function (key) { return (frame < key.time); });
        if (idx1 < 0)
            return frames[frames.length - 1].value;
        var idx0 = idx1 - 1;
        var k0 = frames[idx0];
        var k1 = frames[idx1];
        // HACK(jstpierre): Nintendo sometimes uses weird "reset" tangents
        // which aren't supposed to be visible. They are visible for us because
        // "frame" can have a non-zero fractional component. In this case, pick
        // a value completely.
        if ((k1.time - k0.time) === 1)
            return k0.value;
        var t = (frame - k0.time) / (k1.time - k0.time);
        return hermiteInterpolate(k0, k1, t);
    }
    var gl_matrix_4, ArrayBufferSlice_5, endian_1, util_7, gx_displaylist_1, GX_Material, HierarchyType, t, c, ci, BMD, BTK, BMT, BTI;
    return {
        setters: [
            function (gl_matrix_4_1) {
                gl_matrix_4 = gl_matrix_4_1;
            },
            function (ArrayBufferSlice_5_1) {
                ArrayBufferSlice_5 = ArrayBufferSlice_5_1;
            },
            function (endian_1_1) {
                endian_1 = endian_1_1;
            },
            function (util_7_1) {
                util_7 = util_7_1;
            },
            function (gx_displaylist_1_1) {
                gx_displaylist_1 = gx_displaylist_1_1;
            },
            function (GX_Material_1) {
                GX_Material = GX_Material_1;
            }
        ],
        execute: function () {
            (function (HierarchyType) {
                HierarchyType[HierarchyType["End"] = 0] = "End";
                HierarchyType[HierarchyType["Open"] = 1] = "Open";
                HierarchyType[HierarchyType["Close"] = 2] = "Close";
                HierarchyType[HierarchyType["Joint"] = 16] = "Joint";
                HierarchyType[HierarchyType["Material"] = 17] = "Material";
                HierarchyType[HierarchyType["Shape"] = 18] = "Shape";
            })(HierarchyType || (HierarchyType = {}));
            exports_17("HierarchyType", HierarchyType);
            // temp, center, center inverse
            t = gl_matrix_4.mat4.create(), c = gl_matrix_4.mat4.create(), ci = gl_matrix_4.mat4.create();
            BMD = /** @class */ (function () {
                function BMD() {
                }
                BMD.parse = function (buffer) {
                    var bmd = new BMD();
                    var view = buffer.createDataView();
                    var magic = util_7.readString(buffer, 0, 8);
                    util_7.assert(magic === 'J3D2bmd3' || magic === 'J3D2bdl4');
                    var size = view.getUint32(0x08);
                    var numChunks = view.getUint32(0x0C);
                    var offs = 0x20;
                    var parseFuncs = {
                        INF1: readINF1Chunk,
                        VTX1: readVTX1Chunk,
                        EVP1: null,
                        DRW1: readDRW1Chunk,
                        JNT1: readJNT1Chunk,
                        SHP1: readSHP1Chunk,
                        MAT3: readMAT3Chunk,
                        TEX1: readTEX1Chunk,
                        MDL3: null,
                    };
                    for (var i = 0; i < numChunks; i++) {
                        var chunkStart = offs;
                        var chunkId = util_7.readString(buffer, chunkStart + 0x00, 4);
                        var chunkSize = view.getUint32(chunkStart + 0x04);
                        var parseFunc = parseFuncs[chunkId];
                        if (parseFunc === undefined)
                            throw new Error("Unknown chunk " + chunkId + "!");
                        if (parseFunc !== null)
                            parseFunc(bmd, buffer, chunkStart, chunkSize);
                        offs += chunkSize;
                    }
                    return bmd;
                };
                return BMD;
            }());
            exports_17("BMD", BMD);
            BTK = /** @class */ (function () {
                function BTK() {
                }
                BTK.parse = function (buffer) {
                    var btk = new BTK();
                    var view = buffer.createDataView();
                    var magic = util_7.readString(buffer, 0, 8);
                    util_7.assert(magic === 'J3D1btk1');
                    var size = view.getUint32(0x08);
                    var numChunks = view.getUint32(0x0C);
                    var offs = 0x20;
                    var parseFuncs = {
                        TTK1: readTTK1Chunk,
                    };
                    for (var i = 0; i < numChunks; i++) {
                        var chunkStart = offs;
                        var chunkId = util_7.readString(buffer, chunkStart + 0x00, 4);
                        var chunkSize = view.getUint32(chunkStart + 0x04);
                        var parseFunc = parseFuncs[chunkId];
                        if (parseFunc === undefined)
                            throw new Error("Unknown chunk " + chunkId + "!");
                        if (parseFunc !== null)
                            parseFunc(btk, buffer, chunkStart, chunkSize - 0x04);
                        offs += chunkSize;
                    }
                    return btk;
                };
                BTK.prototype.findAnimationEntry = function (materialName, texMtxIndex) {
                    return this.ttk1.materialAnimationEntries.find(function (e) { return e.materialName === materialName && e.texMtxIndex === texMtxIndex; });
                };
                BTK.prototype.calcAnimatedTexMtx = function (dst, materialName, texMtxIndex, frame) {
                    var animationEntry = this.findAnimationEntry(materialName, texMtxIndex);
                    if (!animationEntry)
                        return false;
                    var lastFrame = this.ttk1.duration - 1;
                    var normTime = frame / lastFrame;
                    var animFrame = applyLoopMode(normTime, this.ttk1.loopMode) * lastFrame;
                    var centerS = animationEntry.centerS;
                    var centerT = animationEntry.centerT;
                    var centerQ = animationEntry.centerQ;
                    var scaleS = sampleAnimationData(animationEntry.s.scale, animFrame);
                    var scaleT = sampleAnimationData(animationEntry.t.scale, animFrame);
                    var rotation = sampleAnimationData(animationEntry.q.rotation, animFrame);
                    var translationS = sampleAnimationData(animationEntry.s.translation, animFrame);
                    var translationT = sampleAnimationData(animationEntry.t.translation, animFrame);
                    createTexMtx(dst, scaleS, scaleT, rotation, translationS, translationT, centerS, centerT, centerQ);
                    return true;
                };
                return BTK;
            }());
            exports_17("BTK", BTK);
            BMT = /** @class */ (function () {
                function BMT() {
                }
                BMT.parse = function (buffer) {
                    var bmt = new BMT();
                    var view = buffer.createDataView();
                    var magic = util_7.readString(buffer, 0, 8);
                    util_7.assert(magic === 'J3D2bmt3');
                    var size = view.getUint32(0x08);
                    var numChunks = view.getUint32(0x0C);
                    var offs = 0x20;
                    var parseFuncs = {
                        MAT3: readMAT3Chunk,
                        TEX1: readTEX1Chunk,
                        MDL3: null,
                    };
                    for (var i = 0; i < numChunks; i++) {
                        var chunkStart = offs;
                        var chunkId = util_7.readString(buffer, chunkStart + 0x00, 4);
                        var chunkSize = view.getUint32(chunkStart + 0x04);
                        var parseFunc = parseFuncs[chunkId];
                        if (parseFunc === undefined)
                            throw new Error("Unknown chunk " + chunkId + "!");
                        if (parseFunc !== null)
                            parseFunc(bmt, buffer, chunkStart, chunkSize);
                        offs += chunkSize;
                    }
                    return bmt;
                };
                return BMT;
            }());
            exports_17("BMT", BMT);
            BTI = /** @class */ (function () {
                function BTI() {
                }
                BTI.parse = function (buffer, name) {
                    if (name === void 0) { name = null; }
                    var bti = new BTI();
                    bti.texture = readBTI_Texture(buffer, name);
                    return bti;
                };
                return BTI;
            }());
            exports_17("BTI", BTI);
        }
    };
});
// Nintendo RARC file format.
System.register("j3d/rarc", ["util"], function (exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    function parse(buffer) {
        var view = buffer.createDataView();
        util_8.assert(util_8.readString(buffer, 0x00, 0x04) === 'RARC');
        var size = view.getUint32(0x04);
        var dataOffs = view.getUint32(0x0C) + 0x20;
        var dirCount = view.getUint32(0x20);
        var dirTableOffs = view.getUint32(0x24) + 0x20;
        var fileEntryCount = view.getUint32(0x28);
        var fileEntryTableOffs = view.getUint32(0x2C) + 0x20;
        var strTableOffs = view.getUint32(0x34) + 0x20;
        var dirTableIdx = dirTableOffs;
        var dirEntries = [];
        var allFiles = [];
        for (var i = 0; i < dirCount; i++) {
            var type = util_8.readString(buffer, dirTableIdx + 0x00, 0x04, false);
            var nameOffs = view.getUint32(dirTableIdx + 0x04);
            var name_4 = util_8.readString(buffer, strTableOffs + nameOffs, -1, true);
            var nameHash = view.getUint16(dirTableIdx + 0x08);
            var fileEntryCount_1 = view.getUint16(dirTableIdx + 0x0A);
            var fileEntryFirstIndex = view.getUint32(dirTableIdx + 0x0C);
            var files = [];
            var subdirIndexes = [];
            // Go through and parse the file table.
            var fileEntryIdx = fileEntryTableOffs + (fileEntryFirstIndex * 0x14);
            for (var i_1 = 0; i_1 < fileEntryCount_1; i_1++) {
                var id = view.getUint16(fileEntryIdx + 0x00);
                var nameHash_1 = view.getUint16(fileEntryIdx + 0x02);
                var flags = view.getUint8(fileEntryIdx + 0x04);
                var nameOffs_1 = view.getUint16(fileEntryIdx + 0x06);
                var name_5 = util_8.readString(buffer, strTableOffs + nameOffs_1, -1, true);
                var entryDataOffs = view.getUint32(fileEntryIdx + 0x08);
                var entryDataSize = view.getUint32(fileEntryIdx + 0x0C);
                fileEntryIdx += 0x14;
                if (name_5 === '.' || name_5 === '..')
                    continue;
                var isDirectory = !!(flags & 0x02);
                if (isDirectory) {
                    var subdirEntryIndex = entryDataOffs;
                    subdirIndexes.push(subdirEntryIndex);
                }
                else {
                    var offs = dataOffs + entryDataOffs;
                    var fileBuffer = buffer.slice(offs, offs + entryDataSize);
                    var file = { name: name_5, buffer: fileBuffer };
                    files.push(file);
                    allFiles.push(file);
                }
            }
            dirEntries.push({ name: name_4, type: type, files: files, subdirIndexes: subdirIndexes });
            dirTableIdx += 0x10;
        }
        var dirs = [];
        function translateDirEntry(i) {
            if (dirs[i] !== undefined)
                return dirs[i];
            var dirEntry = dirEntries[i];
            var name = dirEntry.name, type = dirEntry.type, files = dirEntry.files;
            var subdirs = dirEntry.subdirIndexes.map(function (i) { return translateDirEntry(i); });
            var dir = { name: name, type: type, files: files, subdirs: subdirs };
            dirs[i] = dir;
            return dir;
        }
        var root = translateDirEntry(0);
        util_8.assert(root.type === 'ROOT');
        var rarc = new RARC();
        rarc.files = allFiles;
        rarc.root = root;
        return rarc;
    }
    exports_18("parse", parse);
    var util_8, RARC;
    return {
        setters: [
            function (util_8_1) {
                util_8 = util_8_1;
            }
        ],
        execute: function () {
            RARC = /** @class */ (function () {
                function RARC() {
                }
                RARC.prototype.findDirParts = function (parts) {
                    var dir = this.root;
                    var _loop_4 = function (part) {
                        dir = dir.subdirs.find(function (subdir) { return subdir.name === part; });
                        if (dir === undefined)
                            return { value: null };
                    };
                    try {
                        for (var parts_1 = __values(parts), parts_1_1 = parts_1.next(); !parts_1_1.done; parts_1_1 = parts_1.next()) {
                            var part = parts_1_1.value;
                            var state_1 = _loop_4(part);
                            if (typeof state_1 === "object")
                                return state_1.value;
                        }
                    }
                    catch (e_18_1) { e_18 = { error: e_18_1 }; }
                    finally {
                        try {
                            if (parts_1_1 && !parts_1_1.done && (_a = parts_1.return)) _a.call(parts_1);
                        }
                        finally { if (e_18) throw e_18.error; }
                    }
                    return dir;
                    var e_18, _a;
                };
                RARC.prototype.findDir = function (path) {
                    return this.findDirParts(path.split('/'));
                };
                RARC.prototype.findFile = function (path) {
                    var parts = path.split('/');
                    var filename = parts.pop();
                    var dir = this.findDirParts(parts);
                    if (dir === null)
                        return null;
                    return dir.files.find(function (file) { return file.name === filename; });
                };
                return RARC;
            }());
            exports_18("RARC", RARC);
        }
    };
});
// GX texture decoding
System.register("gx/gx_texture", [], function (exports_19, context_19) {
    "use strict";
    var __moduleName = context_19 && context_19.id;
    function expand3to8(n) {
        return (n << (8 - 3)) | (n << (8 - 6)) | (n >>> (9 - 8));
    }
    function expand4to8(n) {
        return (n << 4) | n;
    }
    function expand5to8(n) {
        return (n << (8 - 5)) | (n >>> (10 - 8));
    }
    function expand6to8(n) {
        return (n << (8 - 6)) | (n >>> (12 - 8));
    }
    // GX uses a HW approximation of 3/8 + 5/8 instead of 1/3 + 2/3.
    function s3tcblend(a, b) {
        // return (a*3 + b*5) / 8;
        return (((a << 1) + a) + ((b << 2) + b)) >>> 3;
    }
    function calcPaletteSize(format, palette) {
        var paletteSize = 0;
        switch (format) {
            case 8 /* C4 */:
                paletteSize = 16;
                break;
            case 9 /* C8 */:
                paletteSize = 256;
                break;
            case 10 /* C14X2 */:
            default:
                throw new Error("whoops");
        }
        // All palette-formats are 16-bit.
        return paletteSize * 2;
    }
    exports_19("calcPaletteSize", calcPaletteSize);
    function calcTextureSize(format, width, height) {
        var numPixels = width * height;
        switch (format) {
            case 0 /* I4 */:
                return numPixels / 2;
            case 1 /* I8 */:
                return numPixels;
            case 2 /* IA4 */:
                return numPixels;
            case 3 /* IA8 */:
                return numPixels * 2;
            case 8 /* C4 */:
                return numPixels / 2;
            case 9 /* C8 */:
                return numPixels;
            case 4 /* RGB565 */:
                return numPixels * 2;
            case 5 /* RGB5A3 */:
                return numPixels * 2;
            case 6 /* RGBA8 */:
                return numPixels * 4;
            case 14 /* CMPR */:
                return numPixels / 2;
            default:
                throw new Error("whoops");
        }
    }
    exports_19("calcTextureSize", calcTextureSize);
    function calcFullTextureSize(format, width, height, mipCount) {
        var textureSize = 0;
        while (mipCount--) {
            textureSize += calcTextureSize(format, width, height);
            width /= 2;
            height /= 2;
        }
        return textureSize;
    }
    exports_19("calcFullTextureSize", calcFullTextureSize);
    // GX's CMPR format is S3TC but using GX's tiled addressing.
    function decode_CMPR_to_S3TC(texture) {
        // CMPR goes in 2x2 "macro-blocks" of four S3TC normal blocks.
        function reverseByte(v) {
            // Reverse the order of the four half-nibbles.
            return ((v & 0x03) << 6) | ((v & 0x0c) << 2) | ((v & 0x30) >>> 2) | ((v & 0xc0) >>> 6);
        }
        var pixels = new Uint8Array(texture.width * texture.height / 2);
        var view = texture.data.createDataView();
        // "Macroblocks"
        var w4 = texture.width >>> 2;
        var h4 = texture.height >>> 2;
        var srcOffs = 0;
        for (var yy = 0; yy < h4; yy += 2) {
            for (var xx = 0; xx < w4; xx += 2) {
                // S3TC blocks.
                for (var y = 0; y < 2; y++) {
                    for (var x = 0; x < 2; x++) {
                        var dstBlock = (yy + y) * w4 + xx + x;
                        var dstOffs = dstBlock * 8;
                        pixels[dstOffs + 0] = view.getUint8(srcOffs + 1);
                        pixels[dstOffs + 1] = view.getUint8(srcOffs + 0);
                        pixels[dstOffs + 2] = view.getUint8(srcOffs + 3);
                        pixels[dstOffs + 3] = view.getUint8(srcOffs + 2);
                        pixels[dstOffs + 4] = reverseByte(view.getUint8(srcOffs + 4));
                        pixels[dstOffs + 5] = reverseByte(view.getUint8(srcOffs + 5));
                        pixels[dstOffs + 6] = reverseByte(view.getUint8(srcOffs + 6));
                        pixels[dstOffs + 7] = reverseByte(view.getUint8(srcOffs + 7));
                        srcOffs += 8;
                    }
                }
            }
        }
        return { type: "S3TC", pixels: pixels, width: texture.width, height: texture.height };
    }
    // Software decodes from standard S3TC (not CMPR!) to RGBA.
    function decode_S3TC(texture) {
        var pixels = new Uint8Array(texture.width * texture.height * 4);
        var view = new DataView(texture.pixels.buffer);
        var colorTable = new Uint8Array(16);
        var srcOffs = 0;
        for (var yy = 0; yy < texture.height; yy += 4) {
            for (var xx = 0; xx < texture.width; xx += 4) {
                var color1 = view.getUint16(srcOffs + 0x00, true);
                var color2 = view.getUint16(srcOffs + 0x02, true);
                // Fill in first two colors in color table.
                colorTable[0] = expand5to8((color1 >> 11) & 0x1F);
                colorTable[1] = expand6to8((color1 >> 5) & 0x3F);
                colorTable[2] = expand5to8(color1 & 0x1F);
                colorTable[3] = 0xFF;
                colorTable[4] = expand5to8((color2 >> 11) & 0x1F);
                colorTable[5] = expand6to8((color2 >> 5) & 0x3F);
                colorTable[6] = expand5to8(color2 & 0x1F);
                colorTable[7] = 0xFF;
                if (color1 > color2) {
                    // Predict gradients.
                    colorTable[8] = s3tcblend(colorTable[4], colorTable[0]);
                    colorTable[9] = s3tcblend(colorTable[5], colorTable[1]);
                    colorTable[10] = s3tcblend(colorTable[6], colorTable[2]);
                    colorTable[11] = 0xFF;
                    colorTable[12] = s3tcblend(colorTable[0], colorTable[4]);
                    colorTable[13] = s3tcblend(colorTable[1], colorTable[5]);
                    colorTable[14] = s3tcblend(colorTable[2], colorTable[6]);
                    colorTable[15] = 0xFF;
                }
                else {
                    colorTable[8] = (colorTable[0] + colorTable[4]) >>> 1;
                    colorTable[9] = (colorTable[1] + colorTable[5]) >>> 1;
                    colorTable[10] = (colorTable[2] + colorTable[6]) >>> 1;
                    colorTable[11] = 0xFF;
                    // GX difference: GX fills with an alpha 0 midway point here.
                    colorTable[12] = colorTable[8];
                    colorTable[13] = colorTable[9];
                    colorTable[14] = colorTable[10];
                    colorTable[15] = 0x00;
                }
                var bits = view.getUint32(srcOffs + 0x04, true);
                for (var y = 0; y < 4; y++) {
                    for (var x = 0; x < 4; x++) {
                        var dstPx = (yy + y) * texture.width + xx + x;
                        var dstOffs = dstPx * 4;
                        var colorIdx = bits & 0x03;
                        pixels[dstOffs + 0] = colorTable[colorIdx * 4 + 0];
                        pixels[dstOffs + 1] = colorTable[colorIdx * 4 + 1];
                        pixels[dstOffs + 2] = colorTable[colorIdx * 4 + 2];
                        pixels[dstOffs + 3] = colorTable[colorIdx * 4 + 3];
                        bits >>= 2;
                    }
                }
                srcOffs += 8;
            }
        }
        return { type: "RGBA", pixels: pixels, width: texture.width, height: texture.height };
    }
    function decode_Tiled(texture, bw, bh, decoder) {
        var pixels = new Uint8Array(texture.width * texture.height * 4);
        for (var yy = 0; yy < texture.height; yy += bh) {
            for (var xx = 0; xx < texture.width; xx += bw) {
                for (var y = 0; y < bh; y++) {
                    for (var x = 0; x < bw; x++) {
                        var dstPixel = (texture.width * (yy + y)) + xx + x;
                        var dstOffs = dstPixel * 4;
                        decoder(pixels, dstOffs);
                    }
                }
            }
        }
        return { type: "RGBA", pixels: pixels, width: texture.width, height: texture.height };
    }
    function decode_RGB565(texture) {
        var view = texture.data.createDataView();
        var srcOffs = 0;
        return decode_Tiled(texture, 4, 4, function (pixels, dstOffs) {
            var p = view.getUint16(srcOffs);
            pixels[dstOffs + 0] = expand5to8((p >> 11) & 0x1F);
            pixels[dstOffs + 1] = expand6to8((p >> 5) & 0x3F);
            pixels[dstOffs + 2] = expand5to8(p & 0x1F);
            pixels[dstOffs + 3] = 0xFF;
            srcOffs += 2;
        });
    }
    function decode_RGB5A3(texture) {
        var view = texture.data.createDataView();
        var srcOffs = 0;
        return decode_Tiled(texture, 4, 4, function (pixels, dstOffs) {
            var p = view.getUint16(srcOffs);
            if (p & 0x8000) {
                // RGB5
                pixels[dstOffs + 0] = expand5to8((p >> 10) & 0x1F);
                pixels[dstOffs + 1] = expand5to8((p >> 5) & 0x1F);
                pixels[dstOffs + 2] = expand5to8(p & 0x1F);
                pixels[dstOffs + 3] = 0xFF;
            }
            else {
                // A3RGB4
                pixels[dstOffs + 0] = expand4to8((p >> 8) & 0x0F);
                pixels[dstOffs + 1] = expand4to8((p >> 4) & 0x0F);
                pixels[dstOffs + 2] = expand4to8(p & 0x0F);
                pixels[dstOffs + 3] = expand3to8(p >> 12);
            }
            srcOffs += 2;
        });
    }
    function decode_RGBA8(texture) {
        var view = texture.data.createDataView();
        var srcOffs = 0;
        // RGBA8 is a bit special, so we hand-code this one.
        var bw = 4;
        var bh = 4;
        var pixels = new Uint8Array(texture.width * texture.height * 4);
        for (var yy = 0; yy < texture.height; yy += bh) {
            for (var xx = 0; xx < texture.width; xx += bw) {
                for (var y = 0; y < bh; y++) {
                    for (var x = 0; x < bw; x++) {
                        var dstPixel = (texture.width * (yy + y)) + xx + x;
                        var dstOffs = dstPixel * 4;
                        pixels[dstOffs + 3] = view.getUint8(srcOffs + 0);
                        pixels[dstOffs + 0] = view.getUint8(srcOffs + 1);
                        srcOffs += 2;
                    }
                }
                for (var y = 0; y < bh; y++) {
                    for (var x = 0; x < bw; x++) {
                        var dstPixel = (texture.width * (yy + y)) + xx + x;
                        var dstOffs = dstPixel * 4;
                        pixels[dstOffs + 1] = view.getUint8(srcOffs + 0);
                        pixels[dstOffs + 2] = view.getUint8(srcOffs + 1);
                        srcOffs += 2;
                    }
                }
            }
        }
        return { type: "RGBA", pixels: pixels, width: texture.width, height: texture.height };
    }
    function decode_I4(texture) {
        var view = texture.data.createDataView();
        var srcOffs = 0;
        return decode_Tiled(texture, 8, 8, function (pixels, dstOffs) {
            var ii = view.getUint8(srcOffs >> 1);
            var i4 = ii >>> ((srcOffs & 1) ? 0 : 4) & 0x0F;
            var i = expand4to8(i4);
            pixels[dstOffs + 0] = i;
            pixels[dstOffs + 1] = i;
            pixels[dstOffs + 2] = i;
            pixels[dstOffs + 3] = i;
            srcOffs++;
        });
    }
    function decode_I8(texture) {
        var view = texture.data.createDataView();
        var srcOffs = 0;
        return decode_Tiled(texture, 8, 4, function (pixels, dstOffs) {
            var i = view.getUint8(srcOffs);
            pixels[dstOffs + 0] = i;
            pixels[dstOffs + 1] = i;
            pixels[dstOffs + 2] = i;
            pixels[dstOffs + 3] = i;
            srcOffs++;
        });
    }
    function decode_IA4(texture) {
        var view = texture.data.createDataView();
        var srcOffs = 0;
        return decode_Tiled(texture, 8, 4, function (pixels, dstOffs) {
            var ia = view.getUint8(srcOffs);
            var a = expand4to8(ia >>> 4);
            var i = expand4to8(ia & 0x0F);
            pixels[dstOffs + 0] = i;
            pixels[dstOffs + 1] = i;
            pixels[dstOffs + 2] = i;
            pixels[dstOffs + 3] = a;
            srcOffs++;
        });
    }
    function decode_IA8(texture) {
        var view = texture.data.createDataView();
        var srcOffs = 0;
        return decode_Tiled(texture, 4, 4, function (pixels, dstOffs) {
            var a = view.getUint8(srcOffs + 0);
            var i = view.getUint8(srcOffs + 1);
            pixels[dstOffs + 0] = i;
            pixels[dstOffs + 1] = i;
            pixels[dstOffs + 2] = i;
            pixels[dstOffs + 3] = a;
            srcOffs += 2;
        });
    }
    function decode_Dummy(texture) {
        var pixels = new Uint8Array(texture.width * texture.height * 4);
        pixels.fill(0xFF);
        return { type: "RGBA", width: texture.width, height: texture.height, pixels: pixels };
    }
    function decodeTexture(texture, supportsS3TC) {
        if (texture.data === null)
            return decode_Dummy(texture);
        switch (texture.format) {
            case 14 /* CMPR */:
                var s3tc = decode_CMPR_to_S3TC(texture);
                if (supportsS3TC)
                    return s3tc;
                else
                    return decode_S3TC(s3tc);
            case 4 /* RGB565 */:
                return decode_RGB565(texture);
            case 5 /* RGB5A3 */:
                return decode_RGB5A3(texture);
            case 6 /* RGBA8 */:
                return decode_RGBA8(texture);
            case 0 /* I4 */:
                return decode_I4(texture);
            case 1 /* I8 */:
                return decode_I8(texture);
            case 2 /* IA4 */:
                return decode_IA4(texture);
            case 3 /* IA8 */:
                return decode_IA8(texture);
            case 8 /* C4 */:
            case 9 /* C8 */:
            case 10 /* C14X2 */:
            default:
                console.error("Unsupported texture format " + texture.format + " on texture " + texture.name);
                return decode_Dummy(texture);
        }
    }
    exports_19("decodeTexture", decodeTexture);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("j3d/render", ["gl-matrix", "j3d/j3d", "gx/gx_material", "gx/gx_texture", "render"], function (exports_20, context_20) {
    "use strict";
    var __moduleName = context_20 && context_20.id;
    function translateCompType(gl, compType) {
        switch (compType) {
            case 4 /* F32 */:
                return { type: gl.FLOAT, normalized: false };
            case 1 /* S8 */:
                return { type: gl.BYTE, normalized: false };
            case 3 /* S16 */:
                return { type: gl.SHORT, normalized: false };
            case 2 /* U16 */:
                return { type: gl.UNSIGNED_SHORT, normalized: false };
            case 0 /* U8 */:
                return { type: gl.UNSIGNED_BYTE, normalized: false };
            case 5 /* RGBA8 */: // XXX: Is this right?
                return { type: gl.UNSIGNED_BYTE, normalized: true };
            default:
                throw new Error("Unknown CompType " + compType);
        }
    }
    var gl_matrix_5, j3d_1, GX_Material, GX_Texture, render_3, packetParamsData, modelViewScratch, Command_Shape, materialParamsData, Command_Material, ColorOverride, sceneParamsData, Scene;
    return {
        setters: [
            function (gl_matrix_5_1) {
                gl_matrix_5 = gl_matrix_5_1;
            },
            function (j3d_1_1) {
                j3d_1 = j3d_1_1;
            },
            function (GX_Material_2) {
                GX_Material = GX_Material_2;
            },
            function (GX_Texture_1) {
                GX_Texture = GX_Texture_1;
            },
            function (render_3_1) {
                render_3 = render_3_1;
            }
        ],
        execute: function () {
            packetParamsData = new Float32Array(11 * 16);
            modelViewScratch = gl_matrix_5.mat4.create();
            Command_Shape = /** @class */ (function () {
                function Command_Shape(gl, scene, shape, coalescedBuffers, jointMatrices) {
                    this.scene = scene;
                    this.bmd = this.scene.bmd;
                    this.shape = shape;
                    this.coalescedBuffers = coalescedBuffers;
                    this.jointMatrices = jointMatrices;
                    this.packetParamsBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.UNIFORM_BUFFER, this.packetParamsBuffer);
                    gl.bufferData(gl.UNIFORM_BUFFER, packetParamsData, gl.DYNAMIC_DRAW);
                    this.vao = gl.createVertexArray();
                    gl.bindVertexArray(this.vao);
                    gl.bindBuffer(gl.ARRAY_BUFFER, coalescedBuffers.vertexBuffer.buffer);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coalescedBuffers.indexBuffer.buffer);
                    try {
                        for (var _a = __values(this.shape.packedVertexAttributes), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var attrib = _b.value;
                            var vertexArray = this.bmd.vtx1.vertexArrays.get(attrib.vtxAttrib);
                            var compType = vertexArray.compType;
                            var compCount = vertexArray.compCount;
                            var attribLocation = GX_Material.getVertexAttribLocation(attrib.vtxAttrib);
                            gl.enableVertexAttribArray(attribLocation);
                            var _c = translateCompType(gl, compType), type = _c.type, normalized = _c.normalized;
                            gl.vertexAttribPointer(attribLocation, compCount, type, normalized, this.shape.packedVertexSize, coalescedBuffers.vertexBuffer.offset + attrib.offset);
                            if (gl.getError() !== gl.NO_ERROR)
                                throw new Error();
                        }
                    }
                    catch (e_19_1) { e_19 = { error: e_19_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_19) throw e_19.error; }
                    }
                    gl.bindVertexArray(null);
                    var e_19, _d;
                }
                Command_Shape.prototype.computeModelView = function (modelView, state) {
                    gl_matrix_5.mat4.copy(modelView, state.view);
                    if (this.scene.isSkybox) {
                        modelView[12] = 0;
                        modelView[13] = 0;
                        modelView[14] = 0;
                    }
                    switch (this.shape.displayFlags) {
                        case 0 /* NORMAL */:
                        case 3 /* USE_PNMTXIDX */:
                            // We should already be using PNMTXIDX in the normal case -- it's hardwired to 0.
                            break;
                        case 1 /* BILLBOARD */:
                        case 2 /* Y_BILLBOARD */:
                            // TODO(jstpierre): Proper Y
                            var tx = modelView[12];
                            var ty = modelView[13];
                            var tz = modelView[14];
                            gl_matrix_5.mat4.fromTranslation(modelView, [tx, ty, tz]);
                            break;
                        default:
                            throw new Error("whoops");
                    }
                    gl_matrix_5.mat4.mul(modelView, modelView, this.scene.modelMatrix);
                };
                Command_Shape.prototype.exec = function (state) {
                    var _this = this;
                    if (!this.scene.currentMaterialCommand.visible)
                        return;
                    var gl = state.gl;
                    gl.bindVertexArray(this.vao);
                    var indexOffset = this.coalescedBuffers.indexBuffer.offset;
                    gl.bindBuffer(gl.UNIFORM_BUFFER, this.packetParamsBuffer);
                    gl.bindBufferBase(gl.UNIFORM_BUFFER, GX_Material.GX_Program.ub_PacketParams, this.packetParamsBuffer);
                    var offs = 0;
                    this.computeModelView(modelViewScratch, state);
                    packetParamsData.set(modelViewScratch, 0);
                    offs += 4 * 4;
                    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, packetParamsData, 0, offs);
                    this.shape.packets.forEach(function (packet, packetIndex) {
                        // Update our matrix table.
                        var updated = false;
                        for (var i = 0; i < packet.weightedJointTable.length; i++) {
                            var weightedJointIndex = packet.weightedJointTable[i];
                            // Leave existing joint.
                            if (weightedJointIndex === 0xFFFF)
                                continue;
                            var weightedJoint = _this.bmd.drw1.weightedJoints[weightedJointIndex];
                            if (weightedJoint.isWeighted)
                                throw new Error("whoops");
                            var posMtx = _this.jointMatrices[weightedJoint.jointIndex];
                            packetParamsData.set(posMtx, offs + i * 16);
                            updated = true;
                        }
                        if (updated)
                            gl.bufferSubData(gl.UNIFORM_BUFFER, offs * Float32Array.BYTES_PER_ELEMENT, packetParamsData, offs, 10 * 16);
                        gl.drawElements(gl.TRIANGLES, packet.numTriangles * 3, gl.UNSIGNED_SHORT, indexOffset + packet.firstTriangle * 3 * 2);
                    });
                    gl.bindVertexArray(null);
                };
                Command_Shape.prototype.destroy = function (gl) {
                    gl.deleteVertexArray(this.vao);
                    gl.deleteBuffer(this.packetParamsBuffer);
                };
                return Command_Shape;
            }());
            materialParamsData = new Float32Array(4 * 2 + 4 * 8 + 4 * 3 * 10 + 4 * 3 * 20 + 4 * 2 * 3 + 4 * 8);
            Command_Material = /** @class */ (function () {
                function Command_Material(gl, scene, material) {
                    this.visible = true;
                    this.name = material.name;
                    this.scene = scene;
                    this.bmd = scene.bmd;
                    this.btk = scene.btk;
                    this.bmt = scene.bmt;
                    this.material = material;
                    this.program = new GX_Material.GX_Program(material.gxMaterial);
                    this.program.name = this.name;
                    this.renderFlags = GX_Material.translateRenderFlags(this.material.gxMaterial);
                    this.materialParamsBuffer = gl.createBuffer();
                }
                Command_Material.prototype.exec = function (state) {
                    this.scene.currentMaterialCommand = this;
                    if (!this.scene.currentMaterialCommand.visible)
                        return;
                    var gl = state.gl;
                    state.useProgram(this.program);
                    state.useFlags(this.renderFlags);
                    var offs = 0;
                    for (var i = 0; i < 2; i++) {
                        var color = this.material.colorMatRegs[i];
                        if (color !== null) {
                            materialParamsData[offs + i * 4 + 0] = color.r;
                            materialParamsData[offs + i * 4 + 1] = color.g;
                            materialParamsData[offs + i * 4 + 2] = color.b;
                            materialParamsData[offs + i * 4 + 3] = color.a;
                        }
                    }
                    offs += 4 * 2;
                    for (var i = 0; i < 8; i++) {
                        var fallbackColor = void 0;
                        if (i >= 4)
                            fallbackColor = this.material.gxMaterial.colorRegisters[i - 4];
                        else
                            fallbackColor = this.material.gxMaterial.colorConstants[i];
                        var color = void 0;
                        if (this.scene.colorOverrides[i]) {
                            color = this.scene.colorOverrides[i];
                        }
                        else {
                            color = fallbackColor;
                        }
                        var alpha = void 0;
                        if (this.scene.alphaOverrides[i] !== undefined) {
                            alpha = this.scene.alphaOverrides[i];
                        }
                        else {
                            alpha = fallbackColor.a;
                        }
                        materialParamsData[offs + i * 4 + 0] = color.r;
                        materialParamsData[offs + i * 4 + 1] = color.g;
                        materialParamsData[offs + i * 4 + 2] = color.b;
                        materialParamsData[offs + i * 4 + 3] = alpha;
                    }
                    offs += 4 * 8;
                    // Bind our texture matrices.
                    var matrixScratch = Command_Material.matrixScratch;
                    for (var i = 0; i < this.material.texMatrices.length; i++) {
                        var texMtx = this.material.texMatrices[i];
                        if (texMtx === null)
                            continue;
                        var finalMatrix = matrixScratch;
                        if (this.btk && this.btk.calcAnimatedTexMtx(matrixScratch, this.material.name, i, this.scene.getTimeInFrames(state.time))) {
                            ;
                        }
                        else {
                            gl_matrix_5.mat4.copy(finalMatrix, texMtx.matrix);
                        }
                        switch (texMtx.type) {
                            case 0x00: // Normal. Does nothing.
                                break;
                            case 0x01: // Defino Plaza
                            case 0x0B: // Luigi Circuit
                                break;
                            case 0x06: // Rainbow Road
                                gl_matrix_5.mat4.mul(finalMatrix, finalMatrix, gl_matrix_5.mat4.fromValues(0.5, 0, 0, 0, 0, -0.5, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 1, 0));
                                gl_matrix_5.mat4.mul(finalMatrix, finalMatrix, state.view);
                                finalMatrix[12] = 0;
                                finalMatrix[13] = 0;
                                finalMatrix[14] = 0;
                                break;
                            case 0x07: // Rainbow Road
                                gl_matrix_5.mat4.mul(finalMatrix, finalMatrix, gl_matrix_5.mat4.fromValues(0.5, 0, 0, 0, 0, -0.5, 0, 0, 0.5, 0.5, 1, 0, 0, 0, 0, 0));
                                gl_matrix_5.mat4.mul(finalMatrix, finalMatrix, state.view);
                                finalMatrix[12] = 0;
                                finalMatrix[13] = 0;
                                finalMatrix[14] = 0;
                                break;
                            case 0x08: // Peach Beach
                                gl_matrix_5.mat4.mul(finalMatrix, finalMatrix, gl_matrix_5.mat4.fromValues(0.5, 0, 0, 0, 0, -0.5, 0, 0, 0.5, 0.5, 1, 0, 0, 0, 0, 0));
                                gl_matrix_5.mat4.mul(finalMatrix, finalMatrix, texMtx.projectionMatrix);
                                break;
                            case 0x09: // Rainbow Road
                                gl_matrix_5.mat4.mul(finalMatrix, finalMatrix, gl_matrix_5.mat4.fromValues(0.5, 0, 0, 0, 0, -0.5, 0, 0, 0.5, 0.5, 1, 0, 0, 0, 0, 0));
                                gl_matrix_5.mat4.mul(finalMatrix, finalMatrix, texMtx.projectionMatrix);
                                gl_matrix_5.mat4.mul(finalMatrix, finalMatrix, state.view);
                                break;
                            default:
                                throw "whoops";
                        }
                        // We bind texture matrices as row-major for memory usage purposes.
                        materialParamsData[offs + i * 12 + 0] = finalMatrix[0];
                        materialParamsData[offs + i * 12 + 1] = finalMatrix[4];
                        materialParamsData[offs + i * 12 + 2] = finalMatrix[8];
                        materialParamsData[offs + i * 12 + 3] = finalMatrix[12];
                        materialParamsData[offs + i * 12 + 4] = finalMatrix[1];
                        materialParamsData[offs + i * 12 + 5] = finalMatrix[5];
                        materialParamsData[offs + i * 12 + 6] = finalMatrix[9];
                        materialParamsData[offs + i * 12 + 7] = finalMatrix[13];
                        materialParamsData[offs + i * 12 + 8] = finalMatrix[2];
                        materialParamsData[offs + i * 12 + 9] = finalMatrix[6];
                        materialParamsData[offs + i * 12 + 10] = finalMatrix[10];
                        materialParamsData[offs + i * 12 + 11] = finalMatrix[14];
                    }
                    offs += 4 * 3 * 10;
                    for (var i = 0; i < this.material.postTexMatrices.length; i++) {
                        var postTexMtx = this.material.postTexMatrices[i];
                        if (postTexMtx === null)
                            continue;
                        var finalMatrix = postTexMtx.matrix;
                        materialParamsData[offs + i * 12 + 0] = finalMatrix[0];
                        materialParamsData[offs + i * 12 + 1] = finalMatrix[3];
                        materialParamsData[offs + i * 12 + 2] = finalMatrix[6];
                        materialParamsData[offs + i * 12 + 3] = 0;
                        materialParamsData[offs + i * 12 + 4] = finalMatrix[1];
                        materialParamsData[offs + i * 12 + 5] = finalMatrix[4];
                        materialParamsData[offs + i * 12 + 6] = finalMatrix[7];
                        materialParamsData[offs + i * 12 + 7] = 0;
                        materialParamsData[offs + i * 12 + 8] = finalMatrix[2];
                        materialParamsData[offs + i * 12 + 9] = finalMatrix[5];
                        materialParamsData[offs + i * 12 + 10] = finalMatrix[9];
                        materialParamsData[offs + i * 12 + 11] = 0;
                    }
                    offs += 4 * 3 * 20;
                    for (var i = 0; i < this.material.indTexMatrices.length; i++) {
                        var indTexMtx = this.material.indTexMatrices[i];
                        if (indTexMtx === null)
                            continue;
                        var finalMatrix = indTexMtx;
                        materialParamsData[offs + i * 8 + 0] = finalMatrix[0];
                        materialParamsData[offs + i * 8 + 1] = finalMatrix[1];
                        materialParamsData[offs + i * 8 + 2] = finalMatrix[2];
                        materialParamsData[offs + i * 8 + 3] = 0;
                        materialParamsData[offs + i * 8 + 4] = finalMatrix[3];
                        materialParamsData[offs + i * 8 + 5] = finalMatrix[4];
                        materialParamsData[offs + i * 8 + 6] = finalMatrix[5];
                        materialParamsData[offs + i * 8 + 7] = 0;
                    }
                    offs += 4 * 2 * 3;
                    // Bind textures.
                    var textureScratch = Command_Material.textureScratch;
                    for (var i = 0; i < this.material.textureIndexes.length; i++) {
                        var texIndex = this.material.textureIndexes[i];
                        if (texIndex < 0)
                            continue;
                        var textureBindData = this.scene.getTextureBindData(texIndex);
                        gl.activeTexture(gl.TEXTURE0 + i);
                        gl.bindTexture(gl.TEXTURE_2D, textureBindData.glTexture);
                        gl.bindSampler(i, textureBindData.glSampler);
                        textureScratch[i] = i;
                        materialParamsData[offs + i * 4 + 0] = textureBindData.width;
                        materialParamsData[offs + i * 4 + 1] = textureBindData.height;
                        materialParamsData[offs + i * 4 + 3] = textureBindData.lodBias;
                    }
                    gl.uniform1iv(this.program.u_Texture, textureScratch);
                    offs += 4 * 8;
                    gl.bindBufferBase(gl.UNIFORM_BUFFER, GX_Material.GX_Program.ub_SceneParams, this.scene.sceneParamsBuffer);
                    gl.bindBuffer(gl.UNIFORM_BUFFER, this.materialParamsBuffer);
                    gl.bufferData(gl.UNIFORM_BUFFER, materialParamsData, gl.DYNAMIC_DRAW);
                    gl.bindBufferBase(gl.UNIFORM_BUFFER, GX_Material.GX_Program.ub_MaterialParams, this.materialParamsBuffer);
                };
                Command_Material.prototype.destroy = function (gl) {
                    this.program.destroy(gl);
                    gl.deleteBuffer(this.materialParamsBuffer);
                };
                Command_Material.matrixScratch = gl_matrix_5.mat4.create();
                Command_Material.textureScratch = new Int32Array(8);
                return Command_Material;
            }());
            exports_20("Command_Material", Command_Material);
            (function (ColorOverride) {
                ColorOverride[ColorOverride["K0"] = 0] = "K0";
                ColorOverride[ColorOverride["K1"] = 1] = "K1";
                ColorOverride[ColorOverride["K2"] = 2] = "K2";
                ColorOverride[ColorOverride["K3"] = 3] = "K3";
                ColorOverride[ColorOverride["C0"] = 4] = "C0";
                ColorOverride[ColorOverride["C1"] = 5] = "C1";
                ColorOverride[ColorOverride["C2"] = 6] = "C2";
                ColorOverride[ColorOverride["C3"] = 7] = "C3";
            })(ColorOverride || (ColorOverride = {}));
            exports_20("ColorOverride", ColorOverride);
            sceneParamsData = new Float32Array(4 * 4 + GX_Material.scaledVtxAttributes.length + 4);
            Scene = /** @class */ (function () {
                function Scene(gl, bmd, btk, bmt, extraTextures) {
                    if (extraTextures === void 0) { extraTextures = []; }
                    this.bmd = bmd;
                    this.btk = btk;
                    this.bmt = bmt;
                    this.extraTextures = extraTextures;
                    this.name = '';
                    this.visible = true;
                    this.isSkybox = false;
                    this.fps = 30;
                    this.colorOverrides = [];
                    this.alphaOverrides = [];
                    this.textureOverrides = new Map();
                    this.translateModel(gl);
                    this.sceneParamsBuffer = gl.createBuffer();
                    this.modelMatrix = gl_matrix_5.mat4.create();
                    // TODO(jstpierre): Support weighted joints.
                    if (this.bmd.drw1.isAnyWeighted)
                        this.visible = false;
                }
                Scene.prototype.destroy = function (gl) {
                    this.bufferCoalescer.destroy(gl);
                    this.materialCommands.forEach(function (command) { return command.destroy(gl); });
                    this.shapeCommands.forEach(function (command) { return command.destroy(gl); });
                    this.glSamplers.forEach(function (sampler) { return gl.deleteSampler(sampler); });
                    this.glTextures.forEach(function (texture) { return gl.deleteTexture(texture); });
                    gl.deleteBuffer(this.sceneParamsBuffer);
                };
                Scene.prototype.setColorOverride = function (i, color) {
                    this.colorOverrides[i] = color;
                };
                Scene.prototype.setAlphaOverride = function (i, alpha) {
                    this.alphaOverrides[i] = alpha;
                };
                Scene.prototype.setIsSkybox = function (v) {
                    this.isSkybox = v;
                };
                Scene.prototype.setFPS = function (v) {
                    this.fps = v;
                };
                Scene.prototype.setTextureOverride = function (name, override) {
                    this.textureOverrides.set(name, override);
                };
                Scene.prototype.setVisible = function (v) {
                    this.visible = v;
                };
                Scene.prototype.getTextureBindData = function (texIndex) {
                    var tex1Sampler = this.tex1Samplers[texIndex];
                    var textureOverride = this.textureOverrides.get(tex1Sampler.name);
                    var glTexture;
                    var width;
                    var height;
                    if (textureOverride !== undefined) {
                        glTexture = textureOverride.glTexture;
                        width = textureOverride.width;
                        height = textureOverride.height;
                    }
                    else {
                        glTexture = this.glTextures[tex1Sampler.textureDataIndex];
                    }
                    var tex1TextureData = this.tex1TextureDatas[tex1Sampler.textureDataIndex];
                    if (width === undefined)
                        width = tex1TextureData.width;
                    if (height === undefined)
                        height = tex1TextureData.height;
                    var glSampler = this.glSamplers[tex1Sampler.index];
                    return {
                        glSampler: glSampler,
                        glTexture: glTexture,
                        width: width,
                        height: height,
                        lodBias: tex1Sampler.lodBias,
                    };
                };
                Scene.prototype.getTimeInFrames = function (milliseconds) {
                    return (milliseconds / 1000) * this.fps;
                };
                Scene.prototype.bindState = function (state) {
                    if (!this.visible)
                        return false;
                    var gl = state.gl;
                    state.setClipPlanes(10, 500000);
                    // Update our SceneParams UBO.
                    var offs = 0;
                    sceneParamsData.set(state.projection, offs);
                    offs += 4 * 4;
                    sceneParamsData.set(this.attrScaleData, offs);
                    offs += GX_Material.scaledVtxAttributes.length;
                    sceneParamsData[offs++] = GX_Material.getTextureLODBias(state);
                    gl.bindBuffer(gl.UNIFORM_BUFFER, this.sceneParamsBuffer);
                    gl.bufferData(gl.UNIFORM_BUFFER, sceneParamsData, gl.DYNAMIC_DRAW);
                    return true;
                };
                Scene.prototype.renderOpaque = function (state) {
                    this.execCommands(state, this.opaqueCommands);
                };
                Scene.prototype.renderTransparent = function (state) {
                    this.execCommands(state, this.transparentCommands);
                };
                Scene.prototype.render = function (state) {
                    if (!this.bindState(state))
                        return;
                    this.renderOpaque(state);
                    this.renderTransparent(state);
                };
                Scene.prototype.execCommands = function (state, commands) {
                    commands.forEach(function (command, i) {
                        command.exec(state);
                    });
                };
                Scene.prototype.loadExtraTexture = function (texture) {
                    // XXX(jstpierre): Better texture replacement API, this one is ZTP specific...
                    var textureName = texture.name.toLowerCase().replace('.tga', '');
                    try {
                        for (var _a = __values(this.extraTextures), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var extraTexture = _b.value;
                            if (extraTexture.name.toLowerCase() === textureName)
                                return extraTexture;
                        }
                    }
                    catch (e_20_1) { e_20 = { error: e_20_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_20) throw e_20.error; }
                    }
                    return texture;
                    var e_20, _c;
                };
                Scene.translateTexFilter = function (gl, texFilter) {
                    switch (texFilter) {
                        case 3 /* LIN_MIP_NEAR */:
                            return gl.LINEAR_MIPMAP_NEAREST;
                        case 5 /* LIN_MIP_LIN */:
                            return gl.LINEAR_MIPMAP_LINEAR;
                        case 1 /* LINEAR */:
                            return gl.LINEAR;
                        case 2 /* NEAR_MIP_NEAR */:
                            return gl.NEAREST_MIPMAP_NEAREST;
                        case 4 /* NEAR_MIP_LIN */:
                            return gl.NEAREST_MIPMAP_LINEAR;
                        case 0 /* NEAR */:
                            return gl.NEAREST;
                    }
                };
                Scene.translateWrapMode = function (gl, wrapMode) {
                    switch (wrapMode) {
                        case 0 /* CLAMP */:
                            return gl.CLAMP_TO_EDGE;
                        case 2 /* MIRROR */:
                            return gl.MIRRORED_REPEAT;
                        case 1 /* REPEAT */:
                            return gl.REPEAT;
                    }
                };
                Scene.translateSampler = function (gl, sampler) {
                    var glSampler = gl.createSampler();
                    gl.samplerParameteri(glSampler, gl.TEXTURE_MIN_FILTER, this.translateTexFilter(gl, sampler.minFilter));
                    gl.samplerParameteri(glSampler, gl.TEXTURE_MAG_FILTER, this.translateTexFilter(gl, sampler.magFilter));
                    gl.samplerParameteri(glSampler, gl.TEXTURE_WRAP_S, this.translateWrapMode(gl, sampler.wrapS));
                    gl.samplerParameteri(glSampler, gl.TEXTURE_WRAP_T, this.translateWrapMode(gl, sampler.wrapT));
                    gl.samplerParameterf(glSampler, gl.TEXTURE_MIN_LOD, sampler.minLOD);
                    gl.samplerParameterf(glSampler, gl.TEXTURE_MAX_LOD, sampler.maxLOD);
                    return glSampler;
                };
                Scene.translateTexture = function (gl, texture) {
                    var texId = gl.createTexture();
                    texId.name = texture.name;
                    gl.bindTexture(gl.TEXTURE_2D, texId);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, texture.mipCount - 1);
                    var ext_compressed_texture_s3tc = gl.getExtension('WEBGL_compressed_texture_s3tc');
                    var format = texture.format;
                    var offs = 0, width = texture.width, height = texture.height;
                    for (var i = 0; i < texture.mipCount; i++) {
                        var name_6 = texture.name;
                        var size = GX_Texture.calcTextureSize(format, width, height);
                        var data = texture.data !== null ? texture.data.subarray(offs, size) : null;
                        var surface = { name: name_6, format: format, width: width, height: height, data: data };
                        var decodedTexture = GX_Texture.decodeTexture(surface, !!ext_compressed_texture_s3tc);
                        if (decodedTexture.type === 'RGBA') {
                            gl.texImage2D(gl.TEXTURE_2D, i, gl.RGBA8, decodedTexture.width, decodedTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, decodedTexture.pixels);
                        }
                        else if (decodedTexture.type === 'S3TC') {
                            gl.compressedTexImage2D(gl.TEXTURE_2D, i, ext_compressed_texture_s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT, decodedTexture.width, decodedTexture.height, 0, decodedTexture.pixels);
                        }
                        offs += size;
                        width /= 2;
                        height /= 2;
                    }
                    return texId;
                };
                Scene.translateTextureToViewer = function (texture) {
                    var surfaces = [];
                    var width = texture.width, height = texture.height, offs = 0;
                    var format = texture.format;
                    for (var i = 0; i < texture.mipCount; i++) {
                        var name_7 = texture.name;
                        var size = GX_Texture.calcTextureSize(format, width, height);
                        var data = texture.data !== null ? texture.data.subarray(offs, size) : null;
                        var surface = { name: name_7, format: format, width: width, height: height, data: data };
                        var rgbaTexture = GX_Texture.decodeTexture(surface, false);
                        // Should never happen.
                        if (rgbaTexture.type === 'S3TC')
                            throw new Error("whoops");
                        var canvas = document.createElement('canvas');
                        canvas.width = rgbaTexture.width;
                        canvas.height = rgbaTexture.height;
                        canvas.title = texture.name + " " + texture.format;
                        var ctx = canvas.getContext('2d');
                        var imgData = new ImageData(rgbaTexture.width, rgbaTexture.height);
                        imgData.data.set(new Uint8Array(rgbaTexture.pixels.buffer));
                        ctx.putImageData(imgData, 0, 0);
                        surfaces.push(canvas);
                        offs += size;
                        width /= 2;
                        height /= 2;
                    }
                    return { name: texture.name, surfaces: surfaces };
                };
                Scene.prototype.translateTextures = function (gl) {
                    var tex1 = this.bmt !== null ? this.bmt.tex1 : this.bmd.tex1;
                    this.glTextures = [];
                    this.textures = [];
                    try {
                        for (var _a = __values(tex1.textureDatas), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var textureData = _b.value;
                            if (textureData.data === null) {
                                textureData = this.loadExtraTexture(textureData);
                            }
                            this.glTextures.push(Scene.translateTexture(gl, textureData));
                            this.textures.push(Scene.translateTextureToViewer(textureData));
                        }
                    }
                    catch (e_21_1) { e_21 = { error: e_21_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_21) throw e_21.error; }
                    }
                    this.glSamplers = [];
                    try {
                        for (var _d = __values(tex1.samplers), _e = _d.next(); !_e.done; _e = _d.next()) {
                            var sampler = _e.value;
                            this.glSamplers.push(Scene.translateSampler(gl, sampler));
                        }
                    }
                    catch (e_22_1) { e_22 = { error: e_22_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_f = _d.return)) _f.call(_d);
                        }
                        finally { if (e_22) throw e_22.error; }
                    }
                    this.tex1TextureDatas = tex1.textureDatas;
                    this.tex1Samplers = tex1.samplers;
                    var e_21, _c, e_22, _f;
                };
                Scene.prototype.translateModel = function (gl) {
                    var _this = this;
                    var attrScaleCount = GX_Material.scaledVtxAttributes.length;
                    var attrScaleData = new Float32Array(attrScaleCount);
                    for (var i = 0; i < GX_Material.scaledVtxAttributes.length; i++) {
                        var attrib = GX_Material.scaledVtxAttributes[i];
                        var vtxArray = this.bmd.vtx1.vertexArrays.get(attrib);
                        var scale = vtxArray !== undefined ? vtxArray.scale : 1;
                        attrScaleData[i] = scale;
                    }
                    this.attrScaleData = attrScaleData;
                    this.opaqueCommands = [];
                    this.transparentCommands = [];
                    this.jointMatrices = [];
                    this.translateTextures(gl);
                    var mat3 = this.bmt !== null ? this.bmt.mat3 : this.bmd.mat3;
                    this.materialCommands = mat3.materialEntries.map(function (material) {
                        return new Command_Material(gl, _this, material);
                    });
                    this.bufferCoalescer = new render_3.BufferCoalescer(gl, this.bmd.shp1.shapes.map(function (shape) { return shape.packedData; }), this.bmd.shp1.shapes.map(function (shape) { return shape.indexData; }));
                    this.shapeCommands = this.bmd.shp1.shapes.map(function (shape, i) {
                        return new Command_Shape(gl, _this, shape, _this.bufferCoalescer.coalescedBuffers[i], _this.jointMatrices);
                    });
                    // Iterate through scene graph.
                    var context = {
                        commandList: null,
                        parentJointMatrix: gl_matrix_5.mat4.create(),
                    };
                    this.translateSceneGraph(this.bmd.inf1.sceneGraph, context);
                };
                Scene.prototype.translateSceneGraph = function (node, context) {
                    var mat3 = this.bmt ? this.bmt.mat3 : this.bmd.mat3;
                    var jnt1 = this.bmd.jnt1;
                    var commandList = context.commandList;
                    var parentJointMatrix = context.parentJointMatrix;
                    switch (node.type) {
                        case j3d_1.HierarchyType.Shape:
                            commandList.push(this.shapeCommands[node.shapeIdx]);
                            break;
                        case j3d_1.HierarchyType.Joint:
                            var boneMatrix = jnt1.bones[jnt1.remapTable[node.jointIdx]].matrix;
                            var jointMatrix = gl_matrix_5.mat4.create();
                            gl_matrix_5.mat4.mul(jointMatrix, boneMatrix, parentJointMatrix);
                            this.jointMatrices[node.jointIdx] = jointMatrix;
                            parentJointMatrix = jointMatrix;
                            break;
                        case j3d_1.HierarchyType.Material:
                            var materialIdx = mat3.remapTable[node.materialIdx];
                            var materialCommand = this.materialCommands[materialIdx];
                            commandList = materialCommand.material.translucent ? this.transparentCommands : this.opaqueCommands;
                            commandList.push(materialCommand);
                            break;
                    }
                    var childContext = { commandList: commandList, parentJointMatrix: parentJointMatrix };
                    try {
                        for (var _a = __values(node.children), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var child = _b.value;
                            this.translateSceneGraph(child, childContext);
                        }
                    }
                    catch (e_23_1) { e_23 = { error: e_23_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_23) throw e_23.error; }
                    }
                    var e_23, _c;
                };
                return Scene;
            }());
            exports_20("Scene", Scene);
        }
    };
});
System.register("j3d/ztp_scenes", ["Progressable", "util", "yaz0", "ui", "j3d/j3d", "j3d/rarc", "j3d/render", "render", "gx/gx_material"], function (exports_21, context_21) {
    "use strict";
    var __moduleName = context_21 && context_21.id;
    function collectTextures(scenes) {
        var textures = [];
        try {
            for (var scenes_1 = __values(scenes), scenes_1_1 = scenes_1.next(); !scenes_1_1.done; scenes_1_1 = scenes_1.next()) {
                var scene = scenes_1_1.value;
                if (scene)
                    textures.push.apply(textures, scene.textures);
            }
        }
        catch (e_24_1) { e_24 = { error: e_24_1 }; }
        finally {
            try {
                if (scenes_1_1 && !scenes_1_1.done && (_a = scenes_1.return)) _a.call(scenes_1);
            }
            finally { if (e_24) throw e_24.error; }
        }
        return textures;
        var e_24, _a;
    }
    function createScene(gl, bmdFile, btkFile, bmtFile, extraTextures) {
        var bmd = j3d_2.BMD.parse(bmdFile.buffer);
        var btk = btkFile ? j3d_2.BTK.parse(btkFile.buffer) : null;
        var bmt = bmtFile ? j3d_2.BMT.parse(bmtFile.buffer) : null;
        var scene = new render_4.Scene(gl, bmd, btk, bmt, extraTextures);
        return scene;
    }
    function createScenesFromRARC(gl, rarcName, rarc, extraTextures) {
        var bmdFiles = rarc.files.filter(function (f) { return f.name.endsWith('.bmd') || f.name.endsWith('.bdl'); });
        var scenes = bmdFiles.map(function (bmdFile) {
            var basename = bmdFile.name.split('.')[0];
            var btkFile = rarc.files.find(function (f) { return f.name === basename + ".btk"; });
            var bmtFile = rarc.files.find(function (f) { return f.name === basename + ".bmt"; });
            var scene = createScene(gl, bmdFile, btkFile, bmtFile, extraTextures);
            scene.name = rarcName + "/" + basename;
            return scene;
        });
        return scenes.filter(function (s) { return !!s; });
    }
    var Progressable_2, util_9, Yaz0, UI, j3d_2, RARC, render_4, render_5, gx_material_1, TwilightPrincessRenderer, TwilightPrincessSceneDesc, id, name, sceneDescs, sceneGroup;
    return {
        setters: [
            function (Progressable_2_1) {
                Progressable_2 = Progressable_2_1;
            },
            function (util_9_1) {
                util_9 = util_9_1;
            },
            function (Yaz0_1) {
                Yaz0 = Yaz0_1;
            },
            function (UI_1) {
                UI = UI_1;
            },
            function (j3d_2_1) {
                j3d_2 = j3d_2_1;
            },
            function (RARC_1) {
                RARC = RARC_1;
            },
            function (render_4_1) {
                render_4 = render_4_1;
            },
            function (render_5_1) {
                render_5 = render_5_1;
            },
            function (gx_material_1_1) {
                gx_material_1 = gx_material_1_1;
            }
        ],
        execute: function () {
            TwilightPrincessRenderer = /** @class */ (function () {
                function TwilightPrincessRenderer(stageRarc, roomRarcs, skyboxScenes, roomScenes) {
                    var _this = this;
                    this.stageRarc = stageRarc;
                    this.roomRarcs = roomRarcs;
                    this.skyboxScenes = skyboxScenes;
                    this.roomScenes = roomScenes;
                    this.textures = [];
                    this.mainRenderTarget = new render_5.RenderTarget();
                    this.opaqueScenes = [];
                    this.indTexScenes = [];
                    this.transparentScenes = [];
                    this.windowScenes = [];
                    this.textures = collectTextures(__spread(this.skyboxScenes, this.roomScenes));
                    this.roomScenes.forEach(function (scene) {
                        if (scene.name.endsWith('model')) {
                            _this.opaqueScenes.push(scene);
                        }
                        else if (scene.name.endsWith('model1')) {
                            _this.indTexScenes.push(scene);
                        }
                        else if (scene.name.endsWith('model2')) {
                            _this.transparentScenes.push(scene);
                        }
                        else if (scene.name.endsWith('model3')) {
                            _this.windowScenes.push(scene);
                        }
                        else if (scene.name.endsWith('model4')) {
                            _this.transparentScenes.push(scene);
                        }
                        else {
                            throw "whoops";
                        }
                    });
                }
                TwilightPrincessRenderer.prototype.createPanels = function () {
                    var layers = new UI.LayerPanel();
                    layers.setLayers(this.roomScenes);
                    return [layers];
                };
                TwilightPrincessRenderer.prototype.render = function (state) {
                    var _this = this;
                    var gl = state.gl;
                    // Draw skybox + opaque to main RT.
                    this.mainRenderTarget.setParameters(gl, state.currentRenderTarget.width, state.currentRenderTarget.height);
                    state.useRenderTarget(this.mainRenderTarget);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    this.skyboxScenes.forEach(function (scene) {
                        scene.render(state);
                    });
                    gl.clear(gl.DEPTH_BUFFER_BIT);
                    this.opaqueScenes.forEach(function (scene) {
                        scene.render(state);
                    });
                    // Copy to main render target.
                    state.useRenderTarget(null);
                    state.blitRenderTarget(this.mainRenderTarget);
                    state.blitRenderTargetDepth(this.mainRenderTarget);
                    // IndTex.
                    this.indTexScenes.forEach(function (indirectScene) {
                        var texProjection = indirectScene.materialCommands[0].material.texMatrices[0].projectionMatrix;
                        // The normal texture projection is hardcoded for the Gamecube's projection matrix. Copy in our own.
                        texProjection[0] = state.projection[0];
                        texProjection[5] = -state.projection[5];
                        var textureOverride = { glTexture: _this.mainRenderTarget.resolvedColorTexture, width: gx_material_1.EFB_WIDTH, height: gx_material_1.EFB_HEIGHT };
                        indirectScene.setTextureOverride("fbtex_dummy", textureOverride);
                        indirectScene.render(state);
                    });
                    // Transparent.
                    this.transparentScenes.forEach(function (scene) {
                        scene.render(state);
                    });
                    // Window & Doorway fades. Separate so that the renderer can override color registers separately.
                    // We don't do anything about this yet...
                    this.windowScenes.forEach(function (scene) {
                        scene.render(state);
                    });
                };
                TwilightPrincessRenderer.prototype.destroy = function (gl) {
                    this.skyboxScenes.forEach(function (scene) { return scene.destroy(gl); });
                    this.roomScenes.forEach(function (scene) { return scene.destroy(gl); });
                };
                return TwilightPrincessRenderer;
            }());
            TwilightPrincessSceneDesc = /** @class */ (function () {
                function TwilightPrincessSceneDesc(name, folder, roomPaths) {
                    this.name = name;
                    this.folder = folder;
                    this.roomPaths = roomPaths;
                    this.id = this.folder;
                }
                TwilightPrincessSceneDesc.prototype.createScene = function (gl) {
                    var _this = this;
                    var basePath = "data/j3d/ztp/" + this.folder;
                    var paths = __spread(["STG_00.arc"], this.roomPaths).map(function (path) { return basePath + "/" + path; });
                    return Progressable_2.default.all(paths.map(function (path) { return util_9.fetch(path); })).then(function (buffers) {
                        var stageBuffer = Yaz0.decompress(buffers.shift());
                        var stageRarc = RARC.parse(stageBuffer);
                        var texcFolder = stageRarc.findDir("texc");
                        var extraTextureFiles = texcFolder !== null ? texcFolder.files : [];
                        var extraTextures = extraTextureFiles.map(function (file) {
                            var name = file.name.split('.')[0];
                            return j3d_2.BTI.parse(file.buffer, name).texture;
                        });
                        var skyboxScenes = ["vrbox_sora", "vrbox_kasumim"].map(function (basename) {
                            var bmdFile = stageRarc.findFile("bmdp/" + basename + ".bmd");
                            if (!bmdFile)
                                return null;
                            var btkFile = stageRarc.findFile("btk/" + basename + ".btk");
                            var scene = createScene(gl, bmdFile, btkFile, null, extraTextures);
                            scene.setIsSkybox(true);
                            return scene;
                        }).filter(function (s) { return !!s; });
                        var roomBuffers = buffers;
                        var roomRarcs = roomBuffers.map(function (buffer) {
                            buffer = Yaz0.decompress(buffer);
                            return RARC.parse(buffer);
                        });
                        var roomScenes_ = roomRarcs.map(function (rarc, i) {
                            var rarcBasename = _this.roomPaths[i].split('.')[0];
                            return createScenesFromRARC(gl, rarcBasename, rarc, extraTextures);
                        });
                        var roomScenes = [];
                        roomScenes_.forEach(function (scenes) { return roomScenes.push.apply(roomScenes, scenes); });
                        return new TwilightPrincessRenderer(stageRarc, roomRarcs, skyboxScenes, roomScenes);
                    });
                };
                return TwilightPrincessSceneDesc;
            }());
            id = "ztp";
            name = "The Legend of Zelda: Twilight Princess";
            sceneDescs = [
                new TwilightPrincessSceneDesc("Forest Temple", "D_MN05", ["R02_00.arc", "R03_00.arc", "R04_00.arc", "R05_00.arc", "R07_00.arc", "R09_00.arc", "R10_00.arc", "R11_00.arc", "R12_00.arc", "R19_00.arc", "R22_00.arc", "R00_00.arc", "R01_00.arc"]),
                new TwilightPrincessSceneDesc("Goron Mines", "D_MN04", ["R11_00.arc", "R12_00.arc", "R13_00.arc", "R14_00.arc", "R16_00.arc", "R17_00.arc", "R01_00.arc", "R03_00.arc", "R04_00.arc", "R05_00.arc", "R06_00.arc", "R07_00.arc", "R09_00.arc"]),
                new TwilightPrincessSceneDesc("Lakebed Temple", "D_MN01", ["R00_00.arc", "R01_00.arc", "R02_00.arc", "R03_00.arc", "R05_00.arc", "R06_00.arc", "R07_00.arc", "R08_00.arc", "R09_00.arc", "R10_00.arc", "R11_00.arc", "R12_00.arc", "R13_00.arc"]),
                new TwilightPrincessSceneDesc("Arbiter's Grounds", "D_MN10", ["R01_00.arc", "R02_00.arc", "R03_00.arc", "R04_00.arc", "R05_00.arc", "R06_00.arc", "R07_00.arc", "R08_00.arc", "R09_00.arc", "R10_00.arc", "R11_00.arc", "R12_00.arc", "R13_00.arc", "R14_00.arc", "R15_00.arc", "R16_00.arc", "R00_00.arc"]),
                new TwilightPrincessSceneDesc("Snowpeak Ruins", "D_MN11", ["R00_00.arc", "R01_00.arc", "R02_00.arc", "R03_00.arc", "R04_00.arc", "R05_00.arc", "R06_00.arc", "R07_00.arc", "R08_00.arc", "R09_00.arc", "R11_00.arc", "R13_00.arc"]),
                new TwilightPrincessSceneDesc("Temple of Time", "D_MN06", ["R08_00.arc", "R00_00.arc", "R01_00.arc", "R02_00.arc", "R03_00.arc", "R04_00.arc", "R05_00.arc", "R06_00.arc", "R07_00.arc"]),
                new TwilightPrincessSceneDesc("City in the Sky", "D_MN07", ["R00_00.arc", "R01_00.arc", "R02_00.arc", "R03_00.arc", "R04_00.arc", "R05_00.arc", "R06_00.arc", "R07_00.arc", "R08_00.arc", "R10_00.arc", "R11_00.arc", "R12_00.arc", "R13_00.arc", "R14_00.arc", "R15_00.arc", "R16_00.arc"]),
                new TwilightPrincessSceneDesc("Palace of Twilight", "D_MN08", ["R00_00.arc", "R01_00.arc", "R02_00.arc", "R04_00.arc", "R05_00.arc", "R07_00.arc", "R08_00.arc", "R09_00.arc", "R10_00.arc", "R11_00.arc"]),
                new TwilightPrincessSceneDesc("Hyrule Castle", "D_MN09", ["R03_00.arc", "R04_00.arc", "R05_00.arc", "R06_00.arc", "R08_00.arc", "R09_00.arc", "R11_00.arc", "R12_00.arc", "R13_00.arc", "R14_00.arc", "R15_00.arc", "R01_00.arc", "R02_00.arc"]),
                new TwilightPrincessSceneDesc("Hyrule Field", "F_SP102", ["R00_00.arc"]),
                new TwilightPrincessSceneDesc("Fishing Pond", "F_SP127", ["R00_00.arc"]),
            ];
            exports_21("sceneGroup", sceneGroup = { id: id, name: name, sceneDescs: sceneDescs });
        }
    };
});
System.register("j3d/scenes", ["util", "yaz0", "j3d/j3d", "j3d/rarc", "j3d/render"], function (exports_22, context_22) {
    "use strict";
    var __moduleName = context_22 && context_22.id;
    function createScene(gl, bmdFile, btkFile, bmtFile) {
        var bmd = j3d_3.BMD.parse(bmdFile.buffer);
        var btk = btkFile ? j3d_3.BTK.parse(btkFile.buffer) : null;
        var bmt = bmtFile ? j3d_3.BMT.parse(bmtFile.buffer) : null;
        return new render_6.Scene(gl, bmd, btk, bmt);
    }
    exports_22("createScene", createScene);
    function boolSort(a, b) {
        if (a && !b)
            return -1;
        else if (b && !a)
            return 1;
        else
            return 0;
    }
    function createScenesFromBuffer(gl, buffer) {
        if (util_10.readString(buffer, 0, 4) === 'Yaz0')
            buffer = Yaz0.decompress(buffer);
        if (util_10.readString(buffer, 0, 4) === 'RARC') {
            var rarc_1 = RARC.parse(buffer);
            var bmdFiles = rarc_1.files.filter(function (f) { return f.name.endsWith('.bmd') || f.name.endsWith('.bdl'); });
            var scenes = bmdFiles.map(function (bmdFile) {
                // Find the corresponding btk.
                var basename = bmdFile.name.split('.')[0];
                var btkFile = rarc_1.files.find(function (f) { return f.name === basename + ".btk"; });
                var bmtFile = rarc_1.files.find(function (f) { return f.name === basename + ".bmt"; });
                var scene = createScene(gl, bmdFile, btkFile, bmtFile);
                scene.name = basename;
                if (basename.includes('_sky'))
                    scene.setIsSkybox(true);
                return scene;
            });
            // Sort skyboxen before non-skyboxen.
            scenes = scenes.sort(function (a, b) {
                return boolSort(a.isSkybox, b.isSkybox);
            });
            return scenes;
        }
        if (['J3D2bmd3', 'J3D2bdl4'].includes(util_10.readString(buffer, 0, 8))) {
            var bmd = j3d_3.BMD.parse(buffer);
            return [new render_6.Scene(gl, bmd, null, null)];
        }
        return null;
    }
    exports_22("createScenesFromBuffer", createScenesFromBuffer);
    function createMultiSceneFromBuffer(gl, buffer) {
        return new MultiScene(createScenesFromBuffer(gl, buffer));
    }
    exports_22("createMultiSceneFromBuffer", createMultiSceneFromBuffer);
    var util_10, Yaz0, j3d_3, RARC, render_6, MultiScene;
    return {
        setters: [
            function (util_10_1) {
                util_10 = util_10_1;
            },
            function (Yaz0_2) {
                Yaz0 = Yaz0_2;
            },
            function (j3d_3_1) {
                j3d_3 = j3d_3_1;
            },
            function (RARC_2) {
                RARC = RARC_2;
            },
            function (render_6_1) {
                render_6 = render_6_1;
            }
        ],
        execute: function () {
            MultiScene = /** @class */ (function () {
                function MultiScene(scenes) {
                    this.setScenes(scenes);
                }
                MultiScene.prototype.render = function (renderState) {
                    this.scenes.forEach(function (scene) {
                        scene.render(renderState);
                    });
                };
                MultiScene.prototype.destroy = function (gl) {
                    this.scenes.forEach(function (scene) { return scene.destroy(gl); });
                };
                MultiScene.prototype.setScenes = function (scenes) {
                    this.scenes = scenes;
                    this.textures = [];
                    try {
                        for (var _a = __values(this.scenes), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var scene = _b.value;
                            this.textures = this.textures.concat(scene.textures);
                        }
                    }
                    catch (e_25_1) { e_25 = { error: e_25_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_25) throw e_25.error; }
                    }
                    var e_25, _c;
                };
                return MultiScene;
            }());
            exports_22("MultiScene", MultiScene);
        }
    };
});
System.register("j3d/mkdd_scenes", ["j3d/scenes", "util"], function (exports_23, context_23) {
    "use strict";
    var __moduleName = context_23 && context_23.id;
    var scenes_2, util_11, id, name, MKDDSceneDesc, sceneDescs, sceneGroup;
    return {
        setters: [
            function (scenes_2_1) {
                scenes_2 = scenes_2_1;
            },
            function (util_11_1) {
                util_11 = util_11_1;
            }
        ],
        execute: function () {
            id = "mkdd";
            name = "Mario Kart: Double Dash!!";
            MKDDSceneDesc = /** @class */ (function () {
                function MKDDSceneDesc(name, path) {
                    this.name = name;
                    this.path = path;
                    this.id = this.path;
                }
                MKDDSceneDesc.prototype.createScene = function (gl) {
                    var path = "data/j3d/mkdd/Course/" + this.path;
                    return util_11.fetch(path).then(function (buffer) {
                        var multiScene = scenes_2.createMultiSceneFromBuffer(gl, buffer);
                        multiScene.scenes.forEach(function (scene) {
                            // Kill skybox flag.
                            scene.setIsSkybox(false);
                        });
                        return multiScene;
                    });
                };
                return MKDDSceneDesc;
            }());
            sceneDescs = [
                new MKDDSceneDesc("Luigi Circuit", 'Luigi.arc'),
                new MKDDSceneDesc("Peach Beach", 'Peach.arc'),
                new MKDDSceneDesc("Baby Park", 'BabyLuigi.arc'),
                new MKDDSceneDesc("Dry Dry Desert", 'Desert.arc'),
                new MKDDSceneDesc("Mushroom Bridge", 'Nokonoko.arc'),
                new MKDDSceneDesc("Mario Circuit", 'Mario.arc'),
                new MKDDSceneDesc("Daisy Cruiser", 'Daisy.arc'),
                new MKDDSceneDesc("Waluigi Stadium", 'Waluigi.arc'),
                new MKDDSceneDesc("Sherbet Land", 'Snow.arc'),
                new MKDDSceneDesc("Mushroom City", 'Patapata.arc'),
                new MKDDSceneDesc("Yoshi Circuit", 'Yoshi.arc'),
                new MKDDSceneDesc("DK Mountain", 'Donkey.arc'),
                new MKDDSceneDesc("Wario Colosseum", 'Wario.arc'),
                new MKDDSceneDesc("Dino Dino Jungle", 'Diddy.arc'),
                new MKDDSceneDesc("Bowser's Castle", 'Koopa.arc'),
                new MKDDSceneDesc("Rainbow Road", 'Rainbow.arc'),
            ];
            exports_23("sceneGroup", sceneGroup = { id: id, name: name, sceneDescs: sceneDescs });
        }
    };
});
System.register("j3d/zww_scenes", ["gl-matrix", "Progressable", "util", "yaz0", "ui", "gx/gx_material", "j3d/j3d", "j3d/rarc", "j3d/render"], function (exports_24, context_24) {
    "use strict";
    var __moduleName = context_24 && context_24.id;
    function collectTextures(scenes) {
        var textures = [];
        try {
            for (var scenes_3 = __values(scenes), scenes_3_1 = scenes_3.next(); !scenes_3_1.done; scenes_3_1 = scenes_3.next()) {
                var scene = scenes_3_1.value;
                if (scene)
                    textures.push.apply(textures, scene.textures);
            }
        }
        catch (e_26_1) { e_26 = { error: e_26_1 }; }
        finally {
            try {
                if (scenes_3_1 && !scenes_3_1.done && (_a = scenes_3.return)) _a.call(scenes_3);
            }
            finally { if (e_26) throw e_26.error; }
        }
        return textures;
        var e_26, _a;
    }
    var gl_matrix_6, Progressable_3, util_12, Yaz0, UI, GX_Material, j3d_4, RARC, render_7, CameraPos, TIME_OF_DAY_ICON, WindWakerRenderer, WindWakerSceneDesc, sceneDescs, id, name, sceneGroup;
    return {
        setters: [
            function (gl_matrix_6_1) {
                gl_matrix_6 = gl_matrix_6_1;
            },
            function (Progressable_3_1) {
                Progressable_3 = Progressable_3_1;
            },
            function (util_12_1) {
                util_12 = util_12_1;
            },
            function (Yaz0_3) {
                Yaz0 = Yaz0_3;
            },
            function (UI_2) {
                UI = UI_2;
            },
            function (GX_Material_3) {
                GX_Material = GX_Material_3;
            },
            function (j3d_4_1) {
                j3d_4 = j3d_4_1;
            },
            function (RARC_3) {
                RARC = RARC_3;
            },
            function (render_7_1) {
                render_7 = render_7_1;
            }
        ],
        execute: function () {
            CameraPos = /** @class */ (function () {
                function CameraPos(x, y, z, lx, ly, lz) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
                    this.lx = lx;
                    this.ly = ly;
                    this.lz = lz;
                }
                CameraPos.prototype.set = function (m) {
                    gl_matrix_6.mat4.lookAt(m, [this.x, this.y, this.z], [this.lx, this.ly, this.lz], [0, 1, 0]);
                };
                return CameraPos;
            }());
            TIME_OF_DAY_ICON = "<svg viewBox=\"0 0 100 100\" height=\"20\" fill=\"white\"><path d=\"M50,93.4C74,93.4,93.4,74,93.4,50C93.4,26,74,6.6,50,6.6C26,6.6,6.6,26,6.6,50C6.6,74,26,93.4,50,93.4z M37.6,22.8  c-0.6,2.4-0.9,5-0.9,7.6c0,18.2,14.7,32.9,32.9,32.9c2.6,0,5.1-0.3,7.6-0.9c-4.7,10.3-15.1,17.4-27.1,17.4  c-16.5,0-29.9-13.4-29.9-29.9C20.3,37.9,27.4,27.5,37.6,22.8z\"/></svg>";
            WindWakerRenderer = /** @class */ (function () {
                function WindWakerRenderer(gl, roomIdx, stageRarc, roomRarc, cameraPos) {
                    this.cameraPos = cameraPos;
                    this.roomIdx = roomIdx;
                    this.stageRarc = stageRarc;
                    this.roomRarc = roomRarc;
                    // Skybox.
                    this.vr_sky = this.createScene(gl, stageRarc, "vr_sky", true);
                    this.vr_kasumi_mae = this.createScene(gl, stageRarc, "vr_kasumi_mae", true);
                    this.vr_uso_umi = this.createScene(gl, stageRarc, "vr_uso_umi", true);
                    this.vr_back_cloud = this.createScene(gl, stageRarc, "vr_back_cloud", true);
                    this.model = this.createScene(gl, roomRarc, "model", false);
                    // Ocean.
                    this.model1 = this.createScene(gl, roomRarc, "model1", false);
                    // Windows / doors.
                    this.model3 = this.createScene(gl, roomRarc, "model3", false);
                    this.textures = collectTextures([this.vr_sky, this.vr_kasumi_mae, this.vr_uso_umi, this.vr_back_cloud, this.model, this.model1, this.model3]);
                }
                WindWakerRenderer.getColorsFromDZS = function (buffer, roomIdx, timeOfDay) {
                    var view = buffer.createDataView();
                    var chunkCount = view.getUint32(0x00);
                    var chunkOffsets = new Map();
                    var chunkTableIdx = 0x04;
                    for (var i = 0; i < chunkCount; i++) {
                        var type = util_12.readString(buffer, chunkTableIdx + 0x00, 0x04);
                        var offs = view.getUint32(chunkTableIdx + 0x08);
                        chunkOffsets.set(type, offs);
                        chunkTableIdx += 0x0C;
                    }
                    var coloIdx = view.getUint8(chunkOffsets.get('EnvR') + (roomIdx * 0x08));
                    var coloOffs = chunkOffsets.get('Colo') + (coloIdx * 0x0C);
                    var whichPale = timeOfDay;
                    var paleIdx = view.getUint8(coloOffs + whichPale);
                    var paleOffs = chunkOffsets.get('Pale') + (paleIdx * 0x2C);
                    var virtIdx = view.getUint8(paleOffs + 0x21);
                    var virtOffs = chunkOffsets.get('Virt') + (virtIdx * 0x24);
                    var ambR = view.getUint8(paleOffs + 0x06) / 0xFF;
                    var ambG = view.getUint8(paleOffs + 0x07) / 0xFF;
                    var ambB = view.getUint8(paleOffs + 0x08) / 0xFF;
                    var amb = new GX_Material.Color(ambR, ambG, ambB, 1);
                    var lightR = view.getUint8(paleOffs + 0x09) / 0xFF;
                    var lightG = view.getUint8(paleOffs + 0x0A) / 0xFF;
                    var lightB = view.getUint8(paleOffs + 0x0B) / 0xFF;
                    var light = new GX_Material.Color(lightR, lightG, lightB, 1);
                    var waveR = view.getUint8(paleOffs + 0x0C) / 0xFF;
                    var waveG = view.getUint8(paleOffs + 0x0D) / 0xFF;
                    var waveB = view.getUint8(paleOffs + 0x0E) / 0xFF;
                    var wave = new GX_Material.Color(waveR, waveG, waveB, 1);
                    var oceanR = view.getUint8(paleOffs + 0x0F) / 0xFF;
                    var oceanG = view.getUint8(paleOffs + 0x10) / 0xFF;
                    var oceanB = view.getUint8(paleOffs + 0x11) / 0xFF;
                    var ocean = new GX_Material.Color(oceanR, oceanG, oceanB, 1);
                    var splashR = view.getUint8(paleOffs + 0x12) / 0xFF;
                    var splashG = view.getUint8(paleOffs + 0x13) / 0xFF;
                    var splashB = view.getUint8(paleOffs + 0x14) / 0xFF;
                    var splash = new GX_Material.Color(splashR, splashG, splashB, 1);
                    var splash2R = view.getUint8(paleOffs + 0x15) / 0xFF;
                    var splash2G = view.getUint8(paleOffs + 0x16) / 0xFF;
                    var splash2B = view.getUint8(paleOffs + 0x17) / 0xFF;
                    var splash2 = new GX_Material.Color(splash2R, splash2G, splash2B, 1);
                    var doorsR = view.getUint8(paleOffs + 0x18) / 0xFF;
                    var doorsG = view.getUint8(paleOffs + 0x19) / 0xFF;
                    var doorsB = view.getUint8(paleOffs + 0x1A) / 0xFF;
                    var doors = new GX_Material.Color(doorsR, doorsG, doorsB, 1);
                    var vr_back_cloudR = view.getUint8(virtOffs + 0x10) / 0xFF;
                    var vr_back_cloudG = view.getUint8(virtOffs + 0x11) / 0xFF;
                    var vr_back_cloudB = view.getUint8(virtOffs + 0x12) / 0xFF;
                    var vr_back_cloudA = view.getUint8(virtOffs + 0x13) / 0xFF;
                    var vr_back_cloud = new GX_Material.Color(vr_back_cloudR, vr_back_cloudG, vr_back_cloudB, vr_back_cloudA);
                    var vr_skyR = view.getUint8(virtOffs + 0x18) / 0xFF;
                    var vr_skyG = view.getUint8(virtOffs + 0x19) / 0xFF;
                    var vr_skyB = view.getUint8(virtOffs + 0x1A) / 0xFF;
                    var vr_sky = new GX_Material.Color(vr_skyR, vr_skyG, vr_skyB, 1);
                    var vr_uso_umiR = view.getUint8(virtOffs + 0x1B) / 0xFF;
                    var vr_uso_umiG = view.getUint8(virtOffs + 0x1C) / 0xFF;
                    var vr_uso_umiB = view.getUint8(virtOffs + 0x1D) / 0xFF;
                    var vr_uso_umi = new GX_Material.Color(vr_uso_umiR, vr_uso_umiG, vr_uso_umiB, 1);
                    var vr_kasumi_maeG = view.getUint8(virtOffs + 0x1F) / 0xFF;
                    var vr_kasumi_maeR = view.getUint8(virtOffs + 0x1E) / 0xFF;
                    var vr_kasumi_maeB = view.getUint8(virtOffs + 0x20) / 0xFF;
                    var vr_kasumi_mae = new GX_Material.Color(vr_kasumi_maeR, vr_kasumi_maeG, vr_kasumi_maeB, 1);
                    return { amb: amb, light: light, wave: wave, ocean: ocean, splash: splash, splash2: splash2, doors: doors, vr_back_cloud: vr_back_cloud, vr_sky: vr_sky, vr_uso_umi: vr_uso_umi, vr_kasumi_mae: vr_kasumi_mae };
                };
                WindWakerRenderer.prototype.setTimeOfDay = function (timeOfDay) {
                    var dzsFile = this.stageRarc.findFile("dzs/stage.dzs");
                    var colors = timeOfDay === 0 ? undefined : WindWakerRenderer.getColorsFromDZS(dzsFile.buffer, this.roomIdx, timeOfDay - 1);
                    if (colors !== undefined) {
                        this.model.setColorOverride(render_7.ColorOverride.K0, colors.light);
                        this.model.setColorOverride(render_7.ColorOverride.C0, colors.amb);
                        if (this.model1) {
                            this.model1.setColorOverride(render_7.ColorOverride.K0, colors.ocean);
                            this.model1.setColorOverride(render_7.ColorOverride.C0, colors.wave);
                            this.model1.setColorOverride(render_7.ColorOverride.C1, colors.splash);
                            this.model1.setColorOverride(render_7.ColorOverride.K1, colors.splash2);
                        }
                        if (this.model3)
                            this.model3.setColorOverride(render_7.ColorOverride.C0, colors.doors);
                        this.vr_sky.setColorOverride(render_7.ColorOverride.K0, colors.vr_sky);
                        this.vr_uso_umi.setColorOverride(render_7.ColorOverride.K0, colors.vr_uso_umi);
                        this.vr_kasumi_mae.setColorOverride(render_7.ColorOverride.C0, colors.vr_kasumi_mae);
                        this.vr_back_cloud.setColorOverride(render_7.ColorOverride.K0, colors.vr_back_cloud);
                        this.vr_back_cloud.setAlphaOverride(render_7.ColorOverride.K0, colors.vr_back_cloud.a);
                    }
                    else {
                        this.model.setColorOverride(render_7.ColorOverride.K0, undefined);
                        this.model.setColorOverride(render_7.ColorOverride.C0, undefined);
                        if (this.model1) {
                            this.model1.setColorOverride(render_7.ColorOverride.K0, undefined);
                            this.model1.setColorOverride(render_7.ColorOverride.C0, undefined);
                            this.model1.setColorOverride(render_7.ColorOverride.C1, undefined);
                            this.model1.setColorOverride(render_7.ColorOverride.K1, undefined);
                        }
                        if (this.model3)
                            this.model3.setColorOverride(render_7.ColorOverride.C0, undefined);
                        this.vr_sky.setColorOverride(render_7.ColorOverride.K0, undefined);
                        this.vr_uso_umi.setColorOverride(render_7.ColorOverride.K0, undefined);
                        this.vr_kasumi_mae.setColorOverride(render_7.ColorOverride.C0, undefined);
                        this.vr_back_cloud.setColorOverride(render_7.ColorOverride.K0, undefined);
                        this.vr_back_cloud.setAlphaOverride(render_7.ColorOverride.K0, undefined);
                    }
                };
                WindWakerRenderer.prototype.createPanels = function () {
                    var _this = this;
                    var timeOfDayPanel = new UI.Panel();
                    timeOfDayPanel.setTitle(TIME_OF_DAY_ICON, "Time of Day");
                    var selector = new UI.SimpleSingleSelect();
                    selector.setStrings(['(no palette)', 'Dusk', 'Morning', 'Day', 'Afternoon', 'Evening', 'Night']);
                    selector.onselectionchange = function (index) {
                        _this.setTimeOfDay(index);
                    };
                    selector.selectItem(3); // Day
                    timeOfDayPanel.contents.appendChild(selector.elem);
                    return [timeOfDayPanel];
                };
                WindWakerRenderer.prototype.resetCamera = function (m) {
                    this.cameraPos.set(m);
                };
                WindWakerRenderer.prototype.render = function (state) {
                    var gl = state.gl;
                    // Render skybox.
                    this.vr_sky.render(state);
                    this.vr_kasumi_mae.render(state);
                    this.vr_uso_umi.render(state);
                    this.vr_back_cloud.render(state);
                    gl.clear(gl.DEPTH_BUFFER_BIT);
                    this.model.render(state);
                    if (this.model1)
                        this.model1.render(state);
                    if (this.model3)
                        this.model3.render(state);
                };
                WindWakerRenderer.prototype.destroy = function (gl) {
                    this.vr_sky.destroy(gl);
                    this.vr_kasumi_mae.destroy(gl);
                    this.vr_uso_umi.destroy(gl);
                    this.vr_back_cloud.destroy(gl);
                    this.model.destroy(gl);
                    if (this.model1)
                        this.model1.destroy(gl);
                    if (this.model3)
                        this.model3.destroy(gl);
                };
                WindWakerRenderer.prototype.createScene = function (gl, rarc, name, isSkybox) {
                    var bdlFile = rarc.findFile("bdl/" + name + ".bdl");
                    if (!bdlFile)
                        return null;
                    var btkFile = rarc.findFile("btk/" + name + ".btk");
                    var bdl = j3d_4.BMD.parse(bdlFile.buffer);
                    var btk = btkFile ? j3d_4.BTK.parse(btkFile.buffer) : null;
                    var scene = new render_7.Scene(gl, bdl, btk, null);
                    scene.setIsSkybox(isSkybox);
                    return scene;
                };
                return WindWakerRenderer;
            }());
            WindWakerSceneDesc = /** @class */ (function () {
                function WindWakerSceneDesc(path, name, cameraPos) {
                    this.path = path;
                    this.name = name;
                    this.cameraPos = cameraPos;
                    this.id = path;
                }
                WindWakerSceneDesc.prototype.createScene = function (gl) {
                    var _this = this;
                    var roomIdx = parseInt(this.path.match(/Room(\d+)/)[1], 10);
                    return Progressable_3.default.all([
                        util_12.fetch("data/j3d/ww/sea/Stage.arc"),
                        util_12.fetch(this.path),
                    ]).then(function (_a) {
                        var _b = __read(_a, 2), stage = _b[0], room = _b[1];
                        var stageRarc = RARC.parse(Yaz0.decompress(stage));
                        var roomRarc = RARC.parse(room);
                        return new WindWakerRenderer(gl, roomIdx, stageRarc, roomRarc, _this.cameraPos);
                    });
                };
                return WindWakerSceneDesc;
            }());
            sceneDescs = [
                new WindWakerSceneDesc("data/j3d/ww/sea/Room11.arc", "Windfall Island", new CameraPos(-148, 1760, 7560, -1000, 1000, -5000)),
                new WindWakerSceneDesc("data/j3d/ww/sea/Room13.arc", "Dragon Roost Island", new CameraPos(-8000, 1760, 280, 0, 500, -1000)),
                new WindWakerSceneDesc("data/j3d/ww/sea/Room41.arc", "Forest Haven", new CameraPos(20000, 1760, -5500, 16000, 1000, 0)),
                new WindWakerSceneDesc("data/j3d/ww/sea/Room44.arc", "Outset Island", new CameraPos(6000, 6000, 6000, 0, 0, 20000)),
            ];
            id = "zww";
            name = "The Legend of Zelda: The Wind Waker";
            exports_24("sceneGroup", sceneGroup = { id: id, name: name, sceneDescs: sceneDescs });
        }
    };
});
System.register("j3d/sms_scenes", ["util", "render", "yaz0", "j3d/rarc", "j3d/scenes", "gx/gx_material"], function (exports_25, context_25) {
    "use strict";
    var __moduleName = context_25 && context_25.id;
    function collectTextures(scenes) {
        var textures = [];
        try {
            for (var scenes_4 = __values(scenes), scenes_4_1 = scenes_4.next(); !scenes_4_1.done; scenes_4_1 = scenes_4.next()) {
                var scene = scenes_4_1.value;
                if (scene)
                    textures.push.apply(textures, scene.textures);
            }
        }
        catch (e_27_1) { e_27 = { error: e_27_1 }; }
        finally {
            try {
                if (scenes_4_1 && !scenes_4_1.done && (_a = scenes_4.return)) _a.call(scenes_4);
            }
            finally { if (e_27) throw e_27.error; }
        }
        return textures;
        var e_27, _a;
    }
    var util_13, render_8, Yaz0, RARC, scenes_5, gx_material_2, SunshineRenderer, SunshineSceneDesc, id, name, sceneDescs, sceneGroup;
    return {
        setters: [
            function (util_13_1) {
                util_13 = util_13_1;
            },
            function (render_8_1) {
                render_8 = render_8_1;
            },
            function (Yaz0_4) {
                Yaz0 = Yaz0_4;
            },
            function (RARC_4) {
                RARC = RARC_4;
            },
            function (scenes_5_1) {
                scenes_5 = scenes_5_1;
            },
            function (gx_material_2_1) {
                gx_material_2 = gx_material_2_1;
            }
        ],
        execute: function () {
            SunshineRenderer = /** @class */ (function () {
                function SunshineRenderer(skyScene, mapScene, seaScene, seaIndirectScene, extraScenes, rarc) {
                    if (rarc === void 0) { rarc = null; }
                    this.skyScene = skyScene;
                    this.mapScene = mapScene;
                    this.seaScene = seaScene;
                    this.seaIndirectScene = seaIndirectScene;
                    this.extraScenes = extraScenes;
                    this.rarc = rarc;
                    this.textures = [];
                    this.mainRenderTarget = new render_8.RenderTarget();
                    this.textures = collectTextures([skyScene, mapScene, seaScene, seaIndirectScene].concat(extraScenes));
                }
                SunshineRenderer.prototype.render = function (state) {
                    var gl = state.gl;
                    this.mainRenderTarget.setParameters(gl, state.currentRenderTarget.width, state.currentRenderTarget.height);
                    state.useRenderTarget(this.mainRenderTarget);
                    gl.clearColor(0, 0, 0.125, 1);
                    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
                    if (this.skyScene) {
                        this.skyScene.render(state);
                        gl.clear(gl.DEPTH_BUFFER_BIT);
                    }
                    if (this.mapScene)
                        this.mapScene.render(state);
                    if (this.seaScene)
                        this.seaScene.render(state);
                    try {
                        for (var _a = __values(this.extraScenes), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var scene = _b.value;
                            scene.render(state);
                        }
                    }
                    catch (e_28_1) { e_28 = { error: e_28_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_28) throw e_28.error; }
                    }
                    // Copy to main render target.
                    state.useRenderTarget(null);
                    state.blitRenderTarget(this.mainRenderTarget);
                    state.blitRenderTargetDepth(this.mainRenderTarget);
                    // XXX(jstpierre): does sea go before or after seaindirect?
                    if (this.seaIndirectScene) {
                        var indirectScene = this.seaIndirectScene;
                        var texProjection = indirectScene.materialCommands[0].material.texMatrices[1].projectionMatrix;
                        // The normal texture projection is hardcoded for the Gamecube's projection matrix. Copy in our own.
                        texProjection[0] = state.projection[0];
                        texProjection[5] = -state.projection[5];
                        var textureOverride = { glTexture: this.mainRenderTarget.resolvedColorTexture, width: gx_material_2.EFB_WIDTH, height: gx_material_2.EFB_HEIGHT };
                        indirectScene.setTextureOverride("indirectdummy", textureOverride);
                        indirectScene.render(state);
                    }
                    var e_28, _c;
                };
                SunshineRenderer.prototype.destroy = function (gl) {
                    if (this.skyScene)
                        this.skyScene.destroy(gl);
                    if (this.mapScene)
                        this.mapScene.destroy(gl);
                    if (this.seaScene)
                        this.seaScene.destroy(gl);
                    this.extraScenes.forEach(function (scene) { return scene.destroy(gl); });
                };
                return SunshineRenderer;
            }());
            exports_25("SunshineRenderer", SunshineRenderer);
            SunshineSceneDesc = /** @class */ (function () {
                function SunshineSceneDesc(path, name) {
                    this.path = path;
                    this.name = name;
                    this.name = name;
                    this.path = path;
                    this.id = this.name;
                }
                SunshineSceneDesc.createSunshineSceneForBasename = function (gl, rarc, basename, isSkybox) {
                    var bmdFile = rarc.findFile("map/map/" + basename + ".bmd");
                    if (!bmdFile)
                        return null;
                    var btkFile = rarc.findFile("map/map/" + basename + ".btk");
                    var bmtFile = rarc.findFile("map/map/" + basename + ".bmt");
                    var scene = scenes_5.createScene(gl, bmdFile, btkFile, bmtFile);
                    scene.name = basename;
                    scene.setIsSkybox(isSkybox);
                    return scene;
                };
                SunshineSceneDesc.prototype.createScene = function (gl) {
                    return util_13.fetch(this.path).then(function (result) {
                        var rarc = RARC.parse(Yaz0.decompress(result));
                        // For those curious, the "actual" way the engine loads files is done through
                        // the scene description in scene.bin, with the "map/map" paths hardcoded in
                        // the binary, and for a lot of objects, too. My heuristics below are a cheap
                        // approximation of the actual scene data...
                        var skyScene = SunshineSceneDesc.createSunshineSceneForBasename(gl, rarc, 'sky', true);
                        var mapScene = SunshineSceneDesc.createSunshineSceneForBasename(gl, rarc, 'map', false);
                        var seaScene = SunshineSceneDesc.createSunshineSceneForBasename(gl, rarc, 'sea', false);
                        var seaIndirectScene = SunshineSceneDesc.createSunshineSceneForBasename(gl, rarc, 'seaindirect', false);
                        var extraScenes = [];
                        try {
                            for (var _a = __values(rarc.findDir('map/map').files), _b = _a.next(); !_b.done; _b = _a.next()) {
                                var file = _b.value;
                                var _c = __read(file.name.split('.'), 2), basename = _c[0], extension = _c[1];
                                if (extension !== 'bmd')
                                    continue;
                                if (['sky', 'map', 'sea', 'seaindirect'].includes(basename))
                                    continue;
                                var scene = SunshineSceneDesc.createSunshineSceneForBasename(gl, rarc, basename, false);
                                extraScenes.push(scene);
                            }
                        }
                        catch (e_29_1) { e_29 = { error: e_29_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                            }
                            finally { if (e_29) throw e_29.error; }
                        }
                        return new SunshineRenderer(skyScene, mapScene, seaScene, seaIndirectScene, extraScenes, rarc);
                        var e_29, _d;
                    });
                };
                return SunshineSceneDesc;
            }());
            exports_25("SunshineSceneDesc", SunshineSceneDesc);
            id = "sms";
            name = "Super Mario Sunshine";
            sceneDescs = [
                new SunshineSceneDesc("data/j3d/dolpic0.szs", "Delfino Plaza"),
                new SunshineSceneDesc("data/j3d/mare0.szs", "Noki Bay"),
                new SunshineSceneDesc("data/j3d/sirena0.szs", "Sirena Beach"),
                new SunshineSceneDesc("data/j3d/ricco0.szs", "Ricco Harbor"),
                new SunshineSceneDesc("data/j3d/delfino0.szs", "Delfino Hotel"),
                new SunshineSceneDesc("data/j3d/monte3.szs", "Pianta Village"),
            ];
            exports_25("sceneGroup", sceneGroup = { id: id, name: name, sceneDescs: sceneDescs });
        }
    };
});
System.register("j3d/smg_scenes", ["Progressable", "util", "render", "j3d/scenes", "gx/gx_material"], function (exports_26, context_26) {
    "use strict";
    var __moduleName = context_26 && context_26.id;
    function collectTextures(scenes) {
        var textures = [];
        try {
            for (var scenes_6 = __values(scenes), scenes_6_1 = scenes_6.next(); !scenes_6_1.done; scenes_6_1 = scenes_6.next()) {
                var scene = scenes_6_1.value;
                if (scene)
                    textures.push.apply(textures, scene.textures);
            }
        }
        catch (e_30_1) { e_30 = { error: e_30_1 }; }
        finally {
            try {
                if (scenes_6_1 && !scenes_6_1.done && (_a = scenes_6.return)) _a.call(scenes_6);
            }
            finally { if (e_30) throw e_30.error; }
        }
        return textures;
        var e_30, _a;
    }
    var Progressable_4, util_14, render_9, scenes_7, gx_material_3, BloomPassBlurProgram, BloomPassBokehProgram, SMGRenderer, SMGSceneDesc, id, name, sceneDescs, sceneGroup;
    return {
        setters: [
            function (Progressable_4_1) {
                Progressable_4 = Progressable_4_1;
            },
            function (util_14_1) {
                util_14 = util_14_1;
            },
            function (render_9_1) {
                render_9 = render_9_1;
            },
            function (scenes_7_1) {
                scenes_7 = scenes_7_1;
            },
            function (gx_material_3_1) {
                gx_material_3 = gx_material_3_1;
            }
        ],
        execute: function () {
            // Should I try to do this with GX? lol.
            BloomPassBlurProgram = /** @class */ (function (_super) {
                __extends(BloomPassBlurProgram, _super);
                function BloomPassBlurProgram() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.frag = "\nuniform sampler2D u_Texture;\nin vec2 v_TexCoord;\n\nvec3 TevOverflow(vec3 a) { return fract(a*(255.0/256.0))*(256.0/255.0); }\nvoid main() {\n    // Nintendo does this in two separate draws. We combine into one here...\n    vec3 c = vec3(0.0);\n    // Pass 1.\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.00562, -1.0 *  0.00000)).rgb * 0.15686);\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.00281, -1.0 * -0.00866)).rgb * 0.15686);\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.00281, -1.0 * -0.00866)).rgb * 0.15686);\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.00562, -1.0 *  0.00000)).rgb * 0.15686);\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.00281, -1.0 *  0.00866)).rgb * 0.15686);\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.00281, -1.0 *  0.00866)).rgb * 0.15686);\n    // Pass 2.\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.00977, -1.0 * -0.00993)).rgb * 0.15686);\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.00004, -1.0 * -0.02000)).rgb * 0.15686);\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.00972, -1.0 * -0.01006)).rgb * 0.15686);\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.00976, -1.0 *  0.00993)).rgb * 0.15686);\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.00004, -1.0 *  0.02000)).rgb * 0.15686);\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.00972, -1.0 *  0.01006)).rgb * 0.15686);\n    gl_FragColor = vec4(c.rgb, 1.0);\n}\n";
                    return _this;
                }
                return BloomPassBlurProgram;
            }(render_9.FullscreenProgram));
            BloomPassBokehProgram = /** @class */ (function (_super) {
                __extends(BloomPassBokehProgram, _super);
                function BloomPassBokehProgram() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.frag = "\nuniform sampler2D u_Texture;\nin vec2 v_TexCoord;\n\nvec3 TevOverflow(vec3 a) { return fract(a*(255.0/256.0))*(256.0/255.0); }\nvoid main() {\n    vec3 f = vec3(0.0);\n    vec3 c;\n\n    // TODO(jstpierre): Double-check these passes. It seems weighted towards the top left. IS IT THE BLUR???\n\n    // Pass 1.\n    c = vec3(0.0);\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.02250, -1.0 *  0.00000)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.01949, -1.0 * -0.02000)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.01125, -1.0 * -0.03464)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.00000, -1.0 * -0.04000)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.01125, -1.0 * -0.03464)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.01948, -1.0 * -0.02001)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.02250, -1.0 *  0.00000)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.01949, -1.0 *  0.02000)).rgb) * 0.23529;\n    f += TevOverflow(c);\n    // Pass 2.\n    c = vec3(0.0);\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.01125, -1.0 *  0.03464)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.00000, -1.0 *  0.04000)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.01125, -1.0 *  0.03464)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.01948, -1.0 *  0.02001)).rgb) * 0.23529;\n    f += TevOverflow(c);\n    // Pass 3.\n    c = vec3(0.0);\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.03937, -1.0 *  0.00000)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.03410, -1.0 * -0.03499)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.01970, -1.0 * -0.06061)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.00000, -1.0 * -0.07000)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.01968, -1.0 * -0.06063)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.03409, -1.0 * -0.03502)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.03937, -1.0 *  0.00000)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.03410, -1.0 *  0.03499)).rgb) * 0.23529;\n    f += TevOverflow(c);\n    // Pass 4.\n    c = vec3(0.0);\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.01970, -1.0 *  0.06061)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.00000, -1.0 *  0.07000)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.01968, -1.0 *  0.06063)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.03409, -1.0 *  0.03502)).rgb) * 0.23529;\n    f += TevOverflow(c);\n    // Pass 5.\n    c = vec3(0.0);\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.05063, -1.0 *  0.00000)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.04385, -1.0 * -0.04499)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.02532, -1.0 * -0.07793)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.00000, -1.0 * -0.09000)).rgb) * 0.23529;\n    f += TevOverflow(c);\n    // Pass 6.\n    c = vec3(0.0);\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.02532, -1.0 *  0.07793)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2( 0.00000, -1.0 *  0.09000)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.02531, -1.0 *  0.07795)).rgb) * 0.23529;\n    c += (texture(u_Texture, v_TexCoord + vec2(-0.04384, -1.0 *  0.04502)).rgb) * 0.23529;\n    f += TevOverflow(c);\n\n    f = clamp(f, 0.0, 1.0);\n\n    // Combine pass.\n    vec3 g;\n    g = (texture(u_Texture, v_TexCoord).rgb * 0.43137);\n    g += f * 0.43137;\n\n    gl_FragColor = vec4(g, 1.0);\n}\n";
                    return _this;
                }
                return BloomPassBokehProgram;
            }(render_9.FullscreenProgram));
            SMGRenderer = /** @class */ (function () {
                function SMGRenderer(gl, mainScene, skyboxScene, bloomScene, indirectScene) {
                    this.mainScene = mainScene;
                    this.skyboxScene = skyboxScene;
                    this.bloomScene = bloomScene;
                    this.indirectScene = indirectScene;
                    this.textures = [];
                    this.mainRenderTarget = new render_9.RenderTarget();
                    // Bloom stuff.
                    this.bloomRenderTarget1 = new render_9.RenderTarget();
                    this.bloomRenderTarget2 = new render_9.RenderTarget();
                    this.bloomRenderTarget3 = new render_9.RenderTarget();
                    this.bloomPassBlurProgram = new BloomPassBlurProgram();
                    this.bloomPassBokehProgram = new BloomPassBokehProgram();
                    this.textures = collectTextures([mainScene, skyboxScene, bloomScene, indirectScene]);
                    this.bloomCombineFlags = new render_9.RenderFlags();
                    this.bloomCombineFlags.blendMode = render_9.BlendMode.ADD;
                    this.bloomCombineFlags.blendSrc = render_9.BlendFactor.ONE;
                    this.bloomCombineFlags.blendDst = render_9.BlendFactor.ONE;
                }
                SMGRenderer.prototype.render = function (state) {
                    var gl = state.gl;
                    this.mainRenderTarget.setParameters(gl, state.currentRenderTarget.width, state.currentRenderTarget.height);
                    state.useRenderTarget(this.mainRenderTarget);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                    this.skyboxScene.bindState(state);
                    this.skyboxScene.renderOpaque(state);
                    gl.clear(gl.DEPTH_BUFFER_BIT);
                    this.mainScene.bindState(state);
                    this.mainScene.renderOpaque(state);
                    this.mainScene.renderTransparent(state);
                    // Copy to main render target.
                    state.useRenderTarget(null);
                    state.blitRenderTarget(this.mainRenderTarget);
                    state.blitRenderTargetDepth(this.mainRenderTarget);
                    if (this.indirectScene) {
                        var texProjection = this.indirectScene.materialCommands[0].material.texMatrices[0].projectionMatrix;
                        // The normal texture projection is hardcoded for the Gamecube's projection matrix. Copy in our own.
                        texProjection[0] = state.projection[0];
                        texProjection[5] = -state.projection[5];
                        var textureOverride = { glTexture: this.mainRenderTarget.resolvedColorTexture, width: gx_material_3.EFB_WIDTH, height: gx_material_3.EFB_HEIGHT };
                        this.indirectScene.setTextureOverride("IndDummy", textureOverride);
                        this.indirectScene.bindState(state);
                        this.indirectScene.renderOpaque(state);
                    }
                    if (this.bloomScene) {
                        var gl_1 = state.gl;
                        var bloomRenderTargetScene = this.bloomRenderTarget1;
                        bloomRenderTargetScene.setParameters(gl_1, state.currentRenderTarget.width, state.currentRenderTarget.height);
                        state.useRenderTarget(bloomRenderTargetScene);
                        state.blitRenderTargetDepth(this.mainRenderTarget);
                        gl_1.clearColor(0, 0, 0, 0);
                        gl_1.clear(gl_1.COLOR_BUFFER_BIT);
                        this.bloomScene.render(state);
                        // First downsample.
                        var bloomRenderTargetDownsample = this.bloomRenderTarget2;
                        var bloomWidth = state.currentRenderTarget.width >> 2;
                        var bloomHeight = state.currentRenderTarget.height >> 2;
                        bloomRenderTargetDownsample.setParameters(gl_1, bloomWidth, bloomHeight);
                        state.useRenderTarget(bloomRenderTargetDownsample);
                        state.blitRenderTarget(bloomRenderTargetScene);
                        // First pass is a blur.
                        var bloomRenderTargetBlur = this.bloomRenderTarget3;
                        bloomRenderTargetDownsample.resolve(gl_1);
                        bloomRenderTargetBlur.setParameters(gl_1, bloomRenderTargetDownsample.width, bloomRenderTargetDownsample.height);
                        state.useRenderTarget(bloomRenderTargetBlur);
                        state.useProgram(this.bloomPassBlurProgram);
                        gl_1.bindTexture(gl_1.TEXTURE_2D, bloomRenderTargetDownsample.resolvedColorTexture);
                        state.runFullscreen();
                        // TODO(jstpierre): Downsample blur / bokeh as well.
                        // Second pass is bokeh-ify.
                        // We can ditch the second render target now, so just reuse it.
                        var bloomRenderTargetBokeh = this.bloomRenderTarget2;
                        bloomRenderTargetBlur.resolve(gl_1);
                        state.useRenderTarget(bloomRenderTargetBokeh);
                        state.useProgram(this.bloomPassBokehProgram);
                        gl_1.clear(gl_1.COLOR_BUFFER_BIT);
                        gl_1.bindTexture(gl_1.TEXTURE_2D, bloomRenderTargetBlur.resolvedColorTexture);
                        state.runFullscreen();
                        // Third pass combines.
                        state.useRenderTarget(null);
                        state.blitRenderTarget(bloomRenderTargetBokeh, this.bloomCombineFlags);
                    }
                };
                SMGRenderer.prototype.destroy = function (gl) {
                    this.mainScene.destroy(gl);
                    this.skyboxScene.destroy(gl);
                    this.bloomScene.destroy(gl);
                    this.indirectScene.destroy(gl);
                    this.bloomRenderTarget1.destroy(gl);
                    this.bloomRenderTarget2.destroy(gl);
                    this.bloomRenderTarget3.destroy(gl);
                };
                return SMGRenderer;
            }());
            SMGSceneDesc = /** @class */ (function () {
                function SMGSceneDesc(name, mainScenePath, skyboxScenePath, bloomScenePath, indirectScenePath) {
                    if (skyboxScenePath === void 0) { skyboxScenePath = null; }
                    if (bloomScenePath === void 0) { bloomScenePath = null; }
                    if (indirectScenePath === void 0) { indirectScenePath = null; }
                    this.name = name;
                    this.mainScenePath = mainScenePath;
                    this.skyboxScenePath = skyboxScenePath;
                    this.bloomScenePath = bloomScenePath;
                    this.indirectScenePath = indirectScenePath;
                    this.id = mainScenePath;
                }
                SMGSceneDesc.prototype.createScene = function (gl) {
                    return Progressable_4.default.all([
                        this.fetchScene(gl, this.mainScenePath, false),
                        this.fetchScene(gl, this.skyboxScenePath, true),
                        this.fetchScene(gl, this.bloomScenePath, false),
                        this.fetchScene(gl, this.indirectScenePath, false),
                    ]).then(function (scenes) {
                        var _a = __read(scenes, 4), mainScene = _a[0], skyboxScene = _a[1], bloomScene = _a[2], indirectScene = _a[3];
                        return new SMGRenderer(gl, mainScene, skyboxScene, bloomScene, indirectScene);
                    });
                };
                SMGSceneDesc.prototype.fetchScene = function (gl, filename, isSkybox) {
                    var _this = this;
                    if (filename === null)
                        return new Progressable_4.default(Promise.resolve(null));
                    var path = "data/j3d/smg/" + filename;
                    return util_14.fetch(path).then(function (buffer) { return _this.createSceneFromBuffer(gl, buffer, isSkybox); });
                };
                SMGSceneDesc.prototype.createSceneFromBuffer = function (gl, buffer, isSkybox) {
                    var scenes = scenes_7.createScenesFromBuffer(gl, buffer);
                    util_14.assert(scenes.length === 1);
                    var scene = scenes[0];
                    scene.setFPS(60);
                    scene.setIsSkybox(isSkybox);
                    return scene;
                };
                return SMGSceneDesc;
            }());
            id = "smg";
            name = "Super Mario Galaxy";
            sceneDescs = [
                new SMGSceneDesc("Peach's Castle Garden", "PeachCastleGardenPlanet.arc", "GalaxySky.arc", "PeachCastleGardenPlanetBloom.arc", "PeachCastleGardenPlanetIndirect.arc"),
            ];
            exports_26("sceneGroup", sceneGroup = { id: id, name: name, sceneDescs: sceneDescs });
        }
    };
});
System.register("sm64ds/crg0", ["util"], function (exports_27, context_27) {
    "use strict";
    var __moduleName = context_27 && context_27.id;
    function parse(buffer) {
        var view = buffer.createDataView();
        util_15.assert(util_15.readString(buffer, 0, 0x04) === 'CRG0');
        var levelTableCount = view.getUint32(0x08, false);
        var levelTableOffs = view.getUint32(0x0C, false);
        var levels = [];
        var levelTableIdx = levelTableOffs;
        for (var i = 0; i < levelTableCount; i++) {
            util_15.assert(view.getUint8(levelTableIdx) === 0x4d);
            var levelId = view.getUint8(levelTableIdx + 0x01);
            var levelAttributesCount = view.getUint8(levelTableIdx + 0x02);
            var levelMaterialsCount = view.getUint8(levelTableIdx + 0x03);
            levelTableIdx += 0x04;
            var levelAttributes = new Map();
            for (var j = 0; j < levelAttributesCount; j++) {
                var keyOffs = view.getUint32(levelTableIdx + 0x00, false);
                var valueOffs = view.getUint32(levelTableIdx + 0x04, false);
                var key = util_15.readString(buffer, keyOffs, 0x20);
                var value = util_15.readString(buffer, valueOffs, 0x20);
                levelTableIdx += 0x08;
                levelAttributes.set(key, value);
            }
            var materials = [];
            for (var j = 0; j < levelMaterialsCount; j++) {
                var materialNameOffs = view.getUint32(levelTableIdx + 0x00, false);
                var materialName = util_15.readString(buffer, materialNameOffs, 0x20);
                levelTableIdx += 0x04;
                var scaleOffs = view.getUint32(levelTableIdx + 0x00, false);
                var scaleCount = view.getUint32(levelTableIdx + 0x04, false);
                var scaleValues = buffer.createTypedArray(Float32Array, scaleOffs, scaleCount);
                levelTableIdx += 0x08;
                var rotationOffs = view.getUint32(levelTableIdx + 0x00, false);
                var rotationCount = view.getUint32(levelTableIdx + 0x04, false);
                var rotationValues = buffer.createTypedArray(Float32Array, rotationOffs, rotationCount);
                levelTableIdx += 0x08;
                var translationXOffs = view.getUint32(levelTableIdx + 0x00, false);
                var translationXCount = view.getUint32(levelTableIdx + 0x04, false);
                var translationXValues = buffer.createTypedArray(Float32Array, translationXOffs, translationXCount);
                levelTableIdx += 0x08;
                var translationYOffs = view.getUint32(levelTableIdx + 0x00, false);
                var translationYCount = view.getUint32(levelTableIdx + 0x04, false);
                var translationYValues = buffer.createTypedArray(Float32Array, translationYOffs, translationYCount);
                levelTableIdx += 0x08;
                var animations = [
                    { property: 'scale', values: scaleValues },
                    { property: 'rotation', values: rotationValues },
                    { property: 'x', values: translationXValues },
                    { property: 'x', values: translationYValues },
                ];
                materials.push({ name: materialName, animations: animations });
            }
            var id = '' + levelId;
            levels.push({ id: id, attributes: levelAttributes, materials: materials });
        }
        return { levels: levels };
    }
    exports_27("parse", parse);
    var util_15;
    return {
        setters: [
            function (util_15_1) {
                util_15 = util_15_1;
            }
        ],
        execute: function () {
        }
    };
});
// SM64DS's LZ10 wrapper, which is just a "LZ77" prefix for the file.
System.register("sm64ds/lz77", ["lz77", "util"], function (exports_28, context_28) {
    "use strict";
    var __moduleName = context_28 && context_28.id;
    function isLZ77(srcBuffer) {
        return (util_16.readString(srcBuffer, 0x00, 0x05) === 'LZ77\x10');
    }
    exports_28("isLZ77", isLZ77);
    function maybeDecompress(srcBuffer) {
        if (isLZ77(srcBuffer))
            return lz77_1.decompress(srcBuffer.slice(4));
        else
            return srcBuffer;
    }
    exports_28("maybeDecompress", maybeDecompress);
    var lz77_1, util_16;
    return {
        setters: [
            function (lz77_1_1) {
                lz77_1 = lz77_1_1;
            },
            function (util_16_1) {
                util_16 = util_16_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("sm64ds/render", ["gl-matrix", "sm64ds/crg0", "sm64ds/lz77", "sm64ds/nitro_bmd", "render", "util"], function (exports_29, context_29) {
    "use strict";
    var __moduleName = context_29 && context_29.id;
    function textureToCanvas(bmdTex) {
        var canvas = document.createElement("canvas");
        canvas.width = bmdTex.width;
        canvas.height = bmdTex.height;
        canvas.title = bmdTex.name + " (" + bmdTex.format + ")";
        var ctx = canvas.getContext("2d");
        var imgData = ctx.createImageData(canvas.width, canvas.height);
        imgData.data.set(bmdTex.pixels);
        ctx.putImageData(imgData, 0, 0);
        var surfaces = [canvas];
        return { name: bmdTex.name, surfaces: surfaces };
    }
    function collectTextures(scenes) {
        var textures = [];
        try {
            for (var scenes_8 = __values(scenes), scenes_8_1 = scenes_8.next(); !scenes_8_1.done; scenes_8_1 = scenes_8.next()) {
                var scene = scenes_8_1.value;
                if (scene)
                    textures.push.apply(textures, scene.textures);
            }
        }
        catch (e_31_1) { e_31 = { error: e_31_1 }; }
        finally {
            try {
                if (scenes_8_1 && !scenes_8_1.done && (_a = scenes_8.return)) _a.call(scenes_8);
            }
            finally { if (e_31) throw e_31.error; }
        }
        return textures;
        var e_31, _a;
    }
    var gl_matrix_7, CRG0, LZ77, NITRO_BMD, render_10, util_17, NITRO_Program, VERTEX_SIZE, VERTEX_BYTES, BMDRenderer, SM64DSRenderer, SceneDesc;
    return {
        setters: [
            function (gl_matrix_7_1) {
                gl_matrix_7 = gl_matrix_7_1;
            },
            function (CRG0_1) {
                CRG0 = CRG0_1;
            },
            function (LZ77_1) {
                LZ77 = LZ77_1;
            },
            function (NITRO_BMD_1) {
                NITRO_BMD = NITRO_BMD_1;
            },
            function (render_10_1) {
                render_10 = render_10_1;
            },
            function (util_17_1) {
                util_17 = util_17_1;
            }
        ],
        execute: function () {
            NITRO_Program = /** @class */ (function (_super) {
                __extends(NITRO_Program, _super);
                function NITRO_Program() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.vert = "\nprecision mediump float;\nuniform mat4 u_modelView;\nuniform mat4 u_projection;\nuniform mat3 u_texCoordMat;\nlayout(location = " + NITRO_Program.a_position + ") in vec3 a_position;\nlayout(location = " + NITRO_Program.a_uv + ") in vec2 a_uv;\nlayout(location = " + NITRO_Program.a_color + ") in vec4 a_color;\nout vec4 v_color;\nout vec2 v_uv;\n\nvoid main() {\n    gl_Position = u_projection * u_modelView * vec4(a_position, 1.0);\n    v_color = a_color;\n    v_uv = (u_texCoordMat * vec3(a_uv, 1.0)).st;\n}\n";
                    _this.frag = "\nprecision mediump float;\nin vec2 v_uv;\nin vec4 v_color;\nuniform sampler2D u_texture;\n\nvoid main() {\n    gl_FragColor = texture2D(u_texture, v_uv);\n    gl_FragColor *= v_color;\n    if (gl_FragColor.a == 0.0)\n        discard;\n}\n";
                    return _this;
                }
                NITRO_Program.prototype.bind = function (gl, prog) {
                    _super.prototype.bind.call(this, gl, prog);
                    this.texCoordMatLocation = gl.getUniformLocation(prog, "u_texCoordMat");
                };
                NITRO_Program.a_position = 0;
                NITRO_Program.a_uv = 1;
                NITRO_Program.a_color = 2;
                return NITRO_Program;
            }(render_10.Program));
            // 3 pos + 4 color + 2 uv
            VERTEX_SIZE = 9;
            VERTEX_BYTES = VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT;
            BMDRenderer = /** @class */ (function () {
                function BMDRenderer(gl, bmd, localScale, crg0Level) {
                    this.opaqueCommands = [];
                    this.transparentCommands = [];
                    this.bmd = bmd;
                    this.localScale = localScale;
                    this.crg0Level = crg0Level;
                    this.isSkybox = false;
                    this.arena = new render_10.RenderArena();
                    this.textures = bmd.textures.map(function (texture) {
                        return textureToCanvas(texture);
                    });
                    this.translateBMD(gl, this.bmd);
                    var scaleFactor = this.bmd.scaleFactor * this.localScale;
                    this.localMatrix = gl_matrix_7.mat4.create();
                    gl_matrix_7.mat4.fromScaling(this.localMatrix, [scaleFactor, scaleFactor, scaleFactor]);
                }
                BMDRenderer.prototype.translatePacket = function (gl, packet) {
                    var vertBuffer = this.arena.createBuffer(gl);
                    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, packet.vertData, gl.STATIC_DRAW);
                    var idxBuffer = this.arena.createBuffer(gl);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, packet.idxData, gl.STATIC_DRAW);
                    var vao = this.arena.createVertexArray(gl);
                    gl.bindVertexArray(vao);
                    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
                    gl.vertexAttribPointer(NITRO_Program.a_position, 3, gl.FLOAT, false, VERTEX_BYTES, 0);
                    gl.vertexAttribPointer(NITRO_Program.a_color, 4, gl.FLOAT, false, VERTEX_BYTES, 3 * Float32Array.BYTES_PER_ELEMENT);
                    gl.vertexAttribPointer(NITRO_Program.a_uv, 2, gl.FLOAT, false, VERTEX_BYTES, 7 * Float32Array.BYTES_PER_ELEMENT);
                    gl.enableVertexAttribArray(NITRO_Program.a_position);
                    gl.enableVertexAttribArray(NITRO_Program.a_color);
                    gl.enableVertexAttribArray(NITRO_Program.a_uv);
                    gl.bindVertexArray(null);
                    return function (renderState) {
                        gl.bindVertexArray(vao);
                        gl.drawElements(gl.TRIANGLES, packet.idxData.length, gl.UNSIGNED_SHORT, 0);
                        gl.bindVertexArray(null);
                    };
                };
                BMDRenderer.prototype.translatePoly = function (gl, poly) {
                    var _this = this;
                    var funcs = poly.packets.map(function (packet) { return _this.translatePacket(gl, packet); });
                    return function (state) {
                        funcs.forEach(function (f) { f(state); });
                    };
                };
                BMDRenderer.prototype.translateCullMode = function (renderWhichFaces) {
                    switch (renderWhichFaces) {
                        case 0x00: // Render Nothing
                            return render_10.CullMode.FRONT_AND_BACK;
                        case 0x01: // Render Back
                            return render_10.CullMode.FRONT;
                        case 0x02: // Render Front
                            return render_10.CullMode.BACK;
                        case 0x03: // Render Front and Back
                            return render_10.CullMode.NONE;
                        default:
                            throw new Error("Unknown renderWhichFaces");
                    }
                };
                BMDRenderer.prototype.translateMaterial = function (gl, material) {
                    var texture = material.texture;
                    var texId;
                    function wrapMode(repeat, flip) {
                        if (repeat)
                            return flip ? gl.MIRRORED_REPEAT : gl.REPEAT;
                        else
                            return gl.CLAMP_TO_EDGE;
                    }
                    if (texture !== null) {
                        texId = this.arena.createTexture(gl);
                        gl.bindTexture(gl.TEXTURE_2D, texId);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        var repeatS = !!((material.texParams >> 16) & 0x01);
                        var repeatT = !!((material.texParams >> 17) & 0x01);
                        var flipS = !!((material.texParams >> 18) & 0x01);
                        var flipT = !!((material.texParams >> 19) & 0x01);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode(repeatS, flipS));
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode(repeatT, flipT));
                        gl.bindTexture(gl.TEXTURE_2D, texId);
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texture.width, texture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, texture.pixels);
                    }
                    // Find any possible material animations.
                    var crg0mat = this.crg0Level.materials.find(function (c) { return c.name === material.name; });
                    var texCoordMat = gl_matrix_7.mat3.create();
                    gl_matrix_7.mat3.fromMat2d(texCoordMat, material.texCoordMat);
                    var renderFlags = new render_10.RenderFlags();
                    renderFlags.blendMode = render_10.BlendMode.ADD;
                    renderFlags.depthTest = true;
                    renderFlags.depthWrite = material.depthWrite;
                    renderFlags.cullMode = this.translateCullMode(material.renderWhichFaces);
                    return function (state) {
                        if (crg0mat !== undefined) {
                            var texAnimMat = gl_matrix_7.mat3.create();
                            try {
                                for (var _a = __values(crg0mat.animations), _b = _a.next(); !_b.done; _b = _a.next()) {
                                    var anim = _b.value;
                                    var time = state.time / 30;
                                    var value = anim.values[(time | 0) % anim.values.length];
                                    if (anim.property === 'x')
                                        gl_matrix_7.mat3.translate(texAnimMat, texAnimMat, [0, value]);
                                    else if (anim.property === 'y')
                                        gl_matrix_7.mat3.translate(texAnimMat, texAnimMat, [value, 0]);
                                    else if (anim.property === 'scale')
                                        gl_matrix_7.mat3.scale(texAnimMat, texAnimMat, [value, value]);
                                    else if (anim.property === 'rotation')
                                        gl_matrix_7.mat3.rotate(texAnimMat, texAnimMat, value / 180 * Math.PI);
                                }
                            }
                            catch (e_32_1) { e_32 = { error: e_32_1 }; }
                            finally {
                                try {
                                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                }
                                finally { if (e_32) throw e_32.error; }
                            }
                            gl_matrix_7.mat3.fromMat2d(texCoordMat, material.texCoordMat);
                            gl_matrix_7.mat3.multiply(texCoordMat, texAnimMat, texCoordMat);
                        }
                        if (texture !== null) {
                            var prog = state.currentProgram;
                            gl.uniformMatrix3fv(prog.texCoordMatLocation, false, texCoordMat);
                            gl.bindTexture(gl.TEXTURE_2D, texId);
                        }
                        state.useFlags(renderFlags);
                        var e_32, _c;
                    };
                };
                BMDRenderer.prototype.translateBatch = function (gl, batch) {
                    var applyMaterial = this.translateMaterial(gl, batch.material);
                    var renderPoly = this.translatePoly(gl, batch.poly);
                    var func = function (state) {
                        applyMaterial(state);
                        renderPoly(state);
                    };
                    if (batch.material.isTranslucent)
                        this.transparentCommands.push(func);
                    else
                        this.opaqueCommands.push(func);
                };
                BMDRenderer.prototype.translateBMD = function (gl, bmd) {
                    try {
                        for (var _a = __values(bmd.models), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var model = _b.value;
                            try {
                                for (var _c = __values(model.batches), _d = _c.next(); !_d.done; _d = _c.next()) {
                                    var batch = _d.value;
                                    this.translateBatch(gl, batch);
                                }
                            }
                            catch (e_33_1) { e_33 = { error: e_33_1 }; }
                            finally {
                                try {
                                    if (_d && !_d.done && (_e = _c.return)) _e.call(_c);
                                }
                                finally { if (e_33) throw e_33.error; }
                            }
                        }
                    }
                    catch (e_34_1) { e_34 = { error: e_34_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_f = _a.return)) _f.call(_a);
                        }
                        finally { if (e_34) throw e_34.error; }
                    }
                    var e_34, _f, e_33, _e;
                };
                BMDRenderer.prototype.destroy = function (gl) {
                    this.arena.destroy(gl);
                };
                return BMDRenderer;
            }());
            SM64DSRenderer = /** @class */ (function () {
                function SM64DSRenderer(mainBMD, skyboxBMD) {
                    this.mainBMD = mainBMD;
                    this.skyboxBMD = skyboxBMD;
                    this.textures = collectTextures([this.mainBMD, this.skyboxBMD]);
                    this.program = new NITRO_Program();
                }
                SM64DSRenderer.prototype.runCommands = function (state, funcs) {
                    funcs.forEach(function (func) {
                        func(state);
                    });
                };
                SM64DSRenderer.prototype.render = function (renderState) {
                    var gl = renderState.gl;
                    renderState.useProgram(this.program);
                    if (this.skyboxBMD) {
                        renderState.bindModelView(true, this.skyboxBMD.localMatrix);
                        this.runCommands(renderState, this.skyboxBMD.opaqueCommands);
                        gl.clear(gl.DEPTH_BUFFER_BIT);
                    }
                    else {
                        // No skybox? Black.
                        gl.clearColor(0, 0, 0, 1.0);
                        gl.clear(gl.COLOR_BUFFER_BIT);
                    }
                    renderState.bindModelView(false, this.mainBMD.localMatrix);
                    this.runCommands(renderState, this.mainBMD.opaqueCommands);
                    this.runCommands(renderState, this.mainBMD.transparentCommands);
                };
                SM64DSRenderer.prototype.destroy = function (gl) {
                    this.mainBMD.destroy(gl);
                    this.skyboxBMD.destroy(gl);
                };
                return SM64DSRenderer;
            }());
            SceneDesc = /** @class */ (function () {
                function SceneDesc(name, levelId) {
                    this.name = name;
                    this.levelId = levelId;
                    this.id = '' + this.levelId;
                }
                SceneDesc.prototype.createScene = function (gl) {
                    var _this = this;
                    return util_17.fetch('data/sm64ds/sm64ds.crg0').then(function (result) {
                        var crg0 = CRG0.parse(result);
                        return _this._createSceneFromCRG0(gl, crg0);
                    });
                };
                SceneDesc.prototype._createBMDRenderer = function (gl, filename, localScale, level, isSkybox) {
                    return util_17.fetch("data/sm64ds/" + filename).then(function (result) {
                        result = LZ77.maybeDecompress(result);
                        var bmd = NITRO_BMD.parse(result);
                        var renderer = new BMDRenderer(gl, bmd, localScale, level);
                        renderer.isSkybox = isSkybox;
                        return renderer;
                    });
                };
                SceneDesc.prototype._createSceneFromCRG0 = function (gl, crg0) {
                    var level = crg0.levels[this.levelId];
                    var renderers = [this._createBMDRenderer(gl, level.attributes.get('bmd'), 100, level, false)];
                    if (level.attributes.get('vrbox'))
                        renderers.push(this._createBMDRenderer(gl, level.attributes.get('vrbox'), 0.8, level, true));
                    return Promise.all(renderers).then(function (_a) {
                        var _b = __read(_a, 2), mainBMD = _b[0], skyboxBMD = _b[1];
                        return new SM64DSRenderer(mainBMD, skyboxBMD);
                    });
                };
                return SceneDesc;
            }());
            exports_29("SceneDesc", SceneDesc);
        }
    };
});
System.register("sm64ds/scenes", ["sm64ds/render"], function (exports_30, context_30) {
    "use strict";
    var __moduleName = context_30 && context_30.id;
    var render_11, id, name, sceneDescs, sceneGroup;
    return {
        setters: [
            function (render_11_1) {
                render_11 = render_11_1;
            }
        ],
        execute: function () {
            id = "sm64ds";
            name = "Super Mario 64 DS";
            sceneDescs = [
                { 'id': 1, 'name': "Princess Peach's Castle - Gardens" },
                { 'id': 2, 'name': "Princess Peach's Castle - 1st Floor" },
                { 'id': 5, 'name': "Princess Peach's Castle - 2nd Floor" },
                { 'id': 4, 'name': "Princess Peach's Castle - Basement" },
                { 'id': 3, 'name': "Princess Peach's Castle - Courtyard" },
                { 'id': 50, 'name': "Princess Peach's Castle - Playroom" },
                { 'id': 6, 'name': 'Bob-omb Battlefield' },
                { 'id': 7, 'name': "Whomp's Fortress" },
                { 'id': 8, 'name': 'Jolly Roger Bay' },
                { 'id': 9, 'name': 'Jolly Roger Bay - Inside the Ship' },
                { 'id': 10, 'name': 'Cool, Cool Mountain' },
                { 'id': 11, 'name': 'Cool, Cool Mountain - Inside the Slide' },
                { 'id': 12, 'name': "Big Boo's Haunt" },
                { 'id': 13, 'name': 'Hazy Maze Cave' },
                { 'id': 14, 'name': 'Lethal Lava Land' },
                { 'id': 15, 'name': 'Lethal Lava Land - Inside the Volcano' },
                { 'id': 16, 'name': 'Shifting Sand Land' },
                { 'id': 17, 'name': 'Shifting Sand Land - Inside the Pyramid' },
                { 'id': 18, 'name': 'Dire, Dire Docks' },
                { 'id': 19, 'name': "Snowman's Land" },
                { 'id': 20, 'name': "Snowman's Land - Inside the Igloo" },
                { 'id': 21, 'name': 'Wet-Dry World' },
                { 'id': 22, 'name': 'Tall Tall Mountain' },
                { 'id': 23, 'name': 'Tall Tall Mountain - Inside the Slide' },
                { 'id': 25, 'name': 'Tiny-Huge Island - Tiny' },
                { 'id': 24, 'name': 'Tiny-Huge Island - Huge' },
                { 'id': 26, 'name': "Tiny-Huge Island - Inside Wiggler's Cavern" },
                { 'id': 27, 'name': 'Tick Tock Clock' },
                { 'id': 28, 'name': 'Rainbow Ride' },
                { 'id': 35, 'name': 'Bowser in the Dark World' },
                { 'id': 36, 'name': 'Bowser in the Dark World - Battle' },
                { 'id': 37, 'name': 'Bowser in the Fire Sea' },
                { 'id': 38, 'name': 'Bowser in the Fire Sea - Battle' },
                { 'id': 39, 'name': 'Bowser in the Sky' },
                { 'id': 40, 'name': 'Bowser in the Sky - Battle' },
                { 'id': 29, 'name': 'The Princess\'s Secret Slide' },
                { 'id': 30, 'name': 'The Secret Aquarium' },
                { 'id': 34, 'name': 'Wing Mario over the Rainbow' },
                { 'id': 31, 'name': 'Tower of the Wing Cap' },
                { 'id': 32, 'name': 'Vanish Cap Under the Moat' },
                { 'id': 33, 'name': 'Cavern of the Metal Cap' },
                { 'id': 46, 'name': 'Big Boo Battle' },
                { 'id': 47, 'name': 'Big Boo Battle - Battle' },
                { 'id': 44, 'name': 'Goomboss Battle' },
                { 'id': 45, 'name': 'Goomboss Battle - Battle' },
                { 'id': 48, 'name': 'Chief Chilly Challenge' },
                { 'id': 49, 'name': 'Chief Chilly Challenge - Battle' },
                { 'id': 42, 'name': 'VS Map - The Secret of Battle Fort' },
                { 'id': 43, 'name': 'VS Map - Sunshine Isles' },
                { 'id': 51, 'name': 'VS Map - Castle Gardens' },
                { 'id': 0, 'name': 'Test Map A' },
                { 'id': 41, 'name': 'Test Map B' },
            ].map(function (entry) {
                return new render_11.SceneDesc(entry.name, entry.id);
            });
            exports_30("sceneGroup", sceneGroup = { id: id, name: name, sceneDescs: sceneDescs });
        }
    };
});
System.register("mdl0/mdl0", ["util"], function (exports_31, context_31) {
    "use strict";
    var __moduleName = context_31 && context_31.id;
    function parse(buffer) {
        ;
        var view = buffer.createDataView();
        util_18.assert(util_18.readString(buffer, 0, 4, false) === 'MDL\0');
        var flags = view.getUint8(0x04);
        var primType = view.getUint8(0x05);
        var vertCount = view.getUint16(0x06, true);
        var animCount = view.getUint16(0x08, true);
        var offs = 0x0A;
        if (flags & 2 /* HAS_UV */) {
            // XXX: How to parse UV?
            var start = offs;
            var end = start + vertCount * 8;
            offs = end;
        }
        var clrData;
        if (flags & 4 /* HAS_COLOR */) {
            clrData = buffer.createTypedArray(Uint8Array, offs, vertCount * 4);
            offs += clrData.byteLength;
        }
        else {
            clrData = new Uint8Array(vertCount * 4);
        }
        // Read in index buffer.
        var idxCount = view.getUint16(offs, true);
        offs += 0x02;
        var idxData;
        {
            var idxArr = buffer.createTypedArray(Uint16Array, offs, idxCount);
            if (primType === 3) {
                idxData = idxArr;
            }
            else if (primType === 4) {
                idxCount = (idxCount / 4 * 6);
                idxData = new Uint16Array(idxCount);
                for (var i = 0, j = 0; i < idxCount; i += 6) {
                    idxData[i + 0] = idxArr[j + 0];
                    idxData[i + 1] = idxArr[j + 1];
                    idxData[i + 2] = idxArr[j + 2];
                    idxData[i + 3] = idxArr[j + 2];
                    idxData[i + 4] = idxArr[j + 3];
                    idxData[i + 5] = idxArr[j + 0];
                    j += 4;
                }
            }
            offs += idxArr.byteLength;
        }
        var vtxData;
        var vertSize = 4 * (3 + ((flags & 1 /* HAS_NORMAL */) ? 3 : 0));
        var animSize = vertCount * vertSize;
        {
            vtxData = buffer.createTypedArray(Float32Array, offs, (animCount * animSize) / 4);
            offs += vtxData.byteLength;
        }
        util_18.assert(offs === buffer.byteLength);
        return { clrData: clrData, idxData: idxData, vtxData: vtxData, animCount: animCount, animSize: animSize, vertCount: vertCount, vertSize: vertSize };
    }
    exports_31("parse", parse);
    var util_18;
    return {
        setters: [
            function (util_18_1) {
                util_18 = util_18_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("mdl0/render", ["mdl0/mdl0", "viewer", "render", "util"], function (exports_32, context_32) {
    "use strict";
    var __moduleName = context_32 && context_32.id;
    var MDL0, Viewer, render_12, util_19, FancyGrid_Program, FancyGrid, MDL0_Program, Scene, SceneDesc;
    return {
        setters: [
            function (MDL0_1) {
                MDL0 = MDL0_1;
            },
            function (Viewer_2) {
                Viewer = Viewer_2;
            },
            function (render_12_1) {
                render_12 = render_12_1;
            },
            function (util_19_1) {
                util_19 = util_19_1;
            }
        ],
        execute: function () {
            FancyGrid_Program = /** @class */ (function (_super) {
                __extends(FancyGrid_Program, _super);
                function FancyGrid_Program() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.vert = "\nprecision mediump float;\n\nuniform mat4 u_modelView;\nuniform mat4 u_projection;\n\nattribute vec3 a_position;\nvarying float v_eyeFade;\nvarying vec2 v_surfCoord;\n\nvoid main() {\n    v_surfCoord = a_position.xz;\n\n    float scale = 200.0;\n    gl_Position = u_projection * u_modelView * vec4(a_position * scale, 1.0);\n\n    vec3 V = (vec4(0.0, 0.0, 1.0, 0.0) * u_modelView).xyz;\n    vec3 N = vec3(0.0, 1.0, 0.0);\n    v_eyeFade = dot(V, N);\n}\n";
                    _this.frag = "\n#extension GL_EXT_frag_depth : enable\n#extension GL_OES_standard_derivatives : enable\n\nprecision highp float;\nvarying float v_eyeFade;\nvarying vec2 v_surfCoord;\n\nvoid main() {\n    float distFromCenter = distance(v_surfCoord, vec2(0.0));\n    vec2 uv = (v_surfCoord + 1.0) * 0.5;\n\n    vec4 color;\n    color.a = 1.0;\n\n    // Base Grid color.\n    color.rgb = mix(vec3(0.8, 0.0, 0.8), vec3(0.4, 0.2, 0.8), clamp(distFromCenter * 1.5, 0.0, 1.0));\n    color.a *= clamp(mix(2.0, 0.0, distFromCenter), 0.0, 1.0);\n\n    // Grid lines mask.\n    uv *= 80.0;\n    float sharpDx = clamp(1.0 / min(abs(dFdx(uv.x)), abs(dFdy(uv.y))), 2.0, 20.0);\n    float sharpMult = sharpDx * 10.0;\n    float sharpOffs = sharpDx * 4.40;\n    vec2 gridM = (abs(fract(uv) - 0.5)) * sharpMult - sharpOffs;\n    float gridMask = max(gridM.x, gridM.y);\n    color.a *= clamp(gridMask, 0.0, 1.0);\n\n    color.a += (1.0 - clamp(distFromCenter * 1.2, 0.0, 1.0)) * 0.5 * v_eyeFade;\n\n    // Eye fade.\n    color.a *= clamp(v_eyeFade, 0.3, 1.0);\n    gl_FragColor = color;\n\n    gl_FragDepthEXT = gl_FragCoord.z + 1e-6;\n}\n";
                    return _this;
                }
                FancyGrid_Program.prototype.bind = function (gl, prog) {
                    _super.prototype.bind.call(this, gl, prog);
                    this.positionLocation = gl.getAttribLocation(prog, "a_position");
                };
                return FancyGrid_Program;
            }(render_12.Program));
            FancyGrid = /** @class */ (function () {
                function FancyGrid(gl) {
                    this.program = new FancyGrid_Program();
                    this._createBuffers(gl);
                    this.renderFlags = new render_12.RenderFlags();
                    this.renderFlags.blendMode = render_12.BlendMode.ADD;
                }
                FancyGrid.prototype.render = function (state) {
                    var gl = state.gl;
                    state.useProgram(this.program);
                    state.bindModelView();
                    state.useFlags(this.renderFlags);
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vtxBuffer);
                    gl.vertexAttribPointer(this.program.positionLocation, 3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(this.program.positionLocation);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    gl.disableVertexAttribArray(this.program.positionLocation);
                };
                FancyGrid.prototype._createBuffers = function (gl) {
                    this.vtxBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vtxBuffer);
                    var vtx = new Float32Array(4 * 3);
                    vtx[0] = -1;
                    vtx[1] = 0;
                    vtx[2] = -1;
                    vtx[3] = 1;
                    vtx[4] = 0;
                    vtx[5] = -1;
                    vtx[6] = -1;
                    vtx[7] = 0;
                    vtx[8] = 1;
                    vtx[9] = 1;
                    vtx[10] = 0;
                    vtx[11] = 1;
                    gl.bufferData(gl.ARRAY_BUFFER, vtx, gl.STATIC_DRAW);
                };
                FancyGrid.prototype.destroy = function (gl) {
                    this.program.destroy(gl);
                    gl.deleteBuffer(this.vtxBuffer);
                };
                return FancyGrid;
            }());
            MDL0_Program = /** @class */ (function (_super) {
                __extends(MDL0_Program, _super);
                function MDL0_Program() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.vert = "\nprecision mediump float;\n\nuniform mat4 u_modelView;\nuniform mat4 u_projection;\n\nattribute vec3 a_position;\nattribute vec4 a_color;\nvarying vec4 v_color;\n\nvoid main() {\n    v_color = a_color.bgra;\n    gl_Position = u_projection * u_modelView * vec4(a_position, 1.0);\n}\n";
                    _this.frag = "\nprecision mediump float;\n\nvarying vec4 v_color;\n\nvoid main() {\n    gl_FragColor = v_color;\n}\n";
                    return _this;
                }
                MDL0_Program.prototype.bind = function (gl, prog) {
                    _super.prototype.bind.call(this, gl, prog);
                    this.positionLocation = gl.getAttribLocation(prog, "a_position");
                    this.colorLocation = gl.getAttribLocation(prog, "a_color");
                };
                return MDL0_Program;
            }(render_12.Program));
            Scene = /** @class */ (function () {
                function Scene(gl, mdl0) {
                    this.textures = [];
                    this.fancyGrid = new FancyGrid(gl);
                    this.program = new MDL0_Program();
                    this.mdl0 = mdl0;
                    this._createBuffers(gl);
                    this.renderFlags = new render_12.RenderFlags();
                    this.renderFlags.depthTest = true;
                }
                Scene.prototype.render = function (state) {
                    var gl = state.gl;
                    state.useProgram(this.program);
                    state.bindModelView();
                    state.useFlags(this.renderFlags);
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.clrBuffer);
                    gl.vertexAttribPointer(this.program.colorLocation, 4, gl.UNSIGNED_BYTE, true, 0, 0);
                    gl.enableVertexAttribArray(this.program.colorLocation);
                    var frameNumber = ((state.time / 16) % this.mdl0.animCount) | 0;
                    var vtxOffset = frameNumber * this.mdl0.animSize;
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vtxBuffer);
                    gl.vertexAttribPointer(this.program.positionLocation, 3, gl.FLOAT, false, this.mdl0.vertSize, vtxOffset);
                    gl.enableVertexAttribArray(this.program.positionLocation);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuffer);
                    gl.drawElements(gl.TRIANGLES, this.mdl0.idxData.length, gl.UNSIGNED_SHORT, 0);
                    gl.disableVertexAttribArray(this.program.colorLocation);
                    gl.disableVertexAttribArray(this.program.positionLocation);
                    this.fancyGrid.render(state);
                };
                Scene.prototype._createBuffers = function (gl) {
                    this.clrBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.clrBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, this.mdl0.clrData, gl.STATIC_DRAW);
                    this.idxBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.mdl0.idxData, gl.STATIC_DRAW);
                    this.vtxBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.vtxBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, this.mdl0.vtxData, gl.STATIC_DRAW);
                };
                Scene.prototype.destroy = function (gl) {
                    gl.deleteBuffer(this.clrBuffer);
                    gl.deleteBuffer(this.vtxBuffer);
                    gl.deleteBuffer(this.idxBuffer);
                    this.program.destroy(gl);
                };
                return Scene;
            }());
            SceneDesc = /** @class */ (function () {
                function SceneDesc(name, path) {
                    this.defaultCameraController = Viewer.OrbitCameraController;
                    this.name = name;
                    this.path = path;
                    this.id = this.path;
                }
                SceneDesc.prototype.createScene = function (gl) {
                    return util_19.fetch(this.path).then(function (result) {
                        var mdl0 = MDL0.parse(result);
                        return new Scene(gl, mdl0);
                    });
                };
                return SceneDesc;
            }());
            exports_32("SceneDesc", SceneDesc);
        }
    };
});
System.register("mdl0/scenes", ["mdl0/render"], function (exports_33, context_33) {
    "use strict";
    var __moduleName = context_33 && context_33.id;
    var render_13, name, id, sceneDescs, sceneGroup;
    return {
        setters: [
            function (render_13_1) {
                render_13 = render_13_1;
            }
        ],
        execute: function () {
            name = "Sonic Mania";
            id = "mdl0";
            sceneDescs = [
                'Meshes/Continue/Count0.bin',
                'Meshes/Continue/Count1.bin',
                'Meshes/Continue/Count2.bin',
                'Meshes/Continue/Count3.bin',
                'Meshes/Continue/Count4.bin',
                'Meshes/Continue/Count5.bin',
                'Meshes/Continue/Count6.bin',
                'Meshes/Continue/Count7.bin',
                'Meshes/Continue/Count8.bin',
                'Meshes/Continue/Count9.bin',
                'Meshes/Decoration/Bird.bin',
                'Meshes/Decoration/Fish.bin',
                'Meshes/Decoration/Flower1.bin',
                'Meshes/Decoration/Flower2.bin',
                'Meshes/Decoration/Flower3.bin',
                'Meshes/Decoration/Pillar1.bin',
                'Meshes/Decoration/Pillar2.bin',
                'Meshes/Decoration/Tree.bin',
                'Meshes/Global/Sonic.bin',
                'Meshes/Global/SpecialRing.bin',
                'Meshes/Special/EmeraldBlue.bin',
                'Meshes/Special/EmeraldCyan.bin',
                'Meshes/Special/EmeraldGreen.bin',
                'Meshes/Special/EmeraldGrey.bin',
                'Meshes/Special/EmeraldPurple.bin',
                'Meshes/Special/EmeraldRed.bin',
                'Meshes/Special/EmeraldYellow.bin',
                'Meshes/Special/ItemBox.bin',
                'Meshes/Special/KnuxBall.bin',
                'Meshes/Special/KnuxDash.bin',
                'Meshes/Special/KnuxJog.bin',
                'Meshes/Special/KnuxJump.bin',
                'Meshes/Special/KnuxTumble.bin',
                'Meshes/Special/Shadow.bin',
                'Meshes/Special/SonicBall.bin',
                'Meshes/Special/SonicDash.bin',
                'Meshes/Special/SonicJog.bin',
                'Meshes/Special/SonicJump.bin',
                'Meshes/Special/SonicTumble.bin',
                'Meshes/Special/Springboard.bin',
                'Meshes/Special/TailsBall.bin',
                'Meshes/Special/TailsDash.bin',
                'Meshes/Special/TailsJog.bin',
                'Meshes/Special/TailsJump.bin',
                'Meshes/Special/TailsTumble.bin',
                'Meshes/Special/UFOChase.bin',
                'Meshes/SSZ/EggTower.bin',
                'Meshes/TMZ/MonarchBG.bin',
                'Meshes/TMZ/OrbNet.bin',
            ].map(function (filename) {
                var path = "data/mdl0/" + filename;
                var name = filename;
                return new render_13.SceneDesc(name, path);
            });
            exports_33("sceneGroup", sceneGroup = { id: id, name: name, sceneDescs: sceneDescs });
        }
    };
});
System.register("zelview/zelview0", ["gl-matrix", "zelview/f3dex2", "util"], function (exports_34, context_34) {
    "use strict";
    var __moduleName = context_34 && context_34.id;
    function readZELVIEW0(buffer) {
        var view = buffer.createDataView();
        var MAGIC = "ZELVIEW0";
        if (util_20.readString(buffer, 0, MAGIC.length, false) !== MAGIC)
            throw new Error("Invalid ZELVIEW0 file");
        var offs = 0x08;
        var count = view.getUint8(offs);
        offs += 0x04;
        var mainFile = view.getUint8(offs);
        offs += 0x04;
        function readVFSEntry() {
            var entry = new VFSEntry();
            entry.filename = util_20.readString(buffer, offs, 0x30);
            offs += 0x30;
            entry.pStart = view.getUint32(offs, true);
            entry.pEnd = view.getUint32(offs + 0x04, true);
            entry.vStart = view.getUint32(offs + 0x08, true);
            entry.vEnd = view.getUint32(offs + 0x0C, true);
            offs += 0x10;
            return entry;
        }
        var entries = [];
        for (var i = 0; i < count; i++)
            entries.push(readVFSEntry());
        var zelview0 = new ZELVIEW0();
        zelview0.entries = entries;
        zelview0.sceneFile = entries[mainFile];
        zelview0.view = view;
        zelview0.buffer = buffer;
        return zelview0;
    }
    exports_34("readZELVIEW0", readZELVIEW0);
    function readHeaders(gl, rom, offs, banks) {
        var headers = new Headers();
        function loadAddress(addr) {
            return rom.loadAddress(banks, addr);
        }
        function readCollision(collisionAddr) {
            var offs = rom.lookupAddress(banks, collisionAddr);
            function readVerts(N, addr) {
                var offs = rom.lookupAddress(banks, addr);
                var verts = new Uint16Array(N * 3);
                for (var i = 0; i < N; i++) {
                    verts[i * 3 + 0] = rom.view.getInt16(offs + 0x00, false);
                    verts[i * 3 + 1] = rom.view.getInt16(offs + 0x02, false);
                    verts[i * 3 + 2] = rom.view.getInt16(offs + 0x04, false);
                    offs += 0x06;
                }
                return verts;
            }
            var vertsN = rom.view.getUint16(offs + 0x0C, false);
            var vertsAddr = rom.view.getUint32(offs + 0x10, false);
            var verts = readVerts(vertsN, vertsAddr);
            function readPolys(N, addr) {
                var offs = rom.lookupAddress(banks, addr);
                var polys = new Uint16Array(N * 3);
                for (var i = 0; i < N; i++) {
                    polys[i * 3 + 0] = rom.view.getUint16(offs + 0x02, false) & 0x0FFF;
                    polys[i * 3 + 1] = rom.view.getUint16(offs + 0x04, false) & 0x0FFF;
                    polys[i * 3 + 2] = rom.view.getUint16(offs + 0x06, false) & 0x0FFF;
                    offs += 0x10;
                }
                return polys;
            }
            var polysN = rom.view.getUint16(offs + 0x14, false);
            var polysAddr = rom.view.getUint32(offs + 0x18, false);
            var polys = readPolys(polysN, polysAddr);
            function readWaters(N, addr) {
                // XXX: While we should probably keep the actual stuff about
                // water boxes, I'm just drawing them, so let's just record
                // a quad.
                var offs = rom.lookupAddress(banks, addr);
                var waters = new Uint16Array(N * 3 * 4);
                for (var i = 0; i < N; i++) {
                    var x = rom.view.getInt16(offs + 0x00, false);
                    var y = rom.view.getInt16(offs + 0x02, false);
                    var z = rom.view.getInt16(offs + 0x04, false);
                    var sx = rom.view.getInt16(offs + 0x06, false);
                    var sz = rom.view.getInt16(offs + 0x08, false);
                    waters[i * 3 * 4 + 0] = x;
                    waters[i * 3 * 4 + 1] = y;
                    waters[i * 3 * 4 + 2] = z;
                    waters[i * 3 * 4 + 3] = x + sx;
                    waters[i * 3 * 4 + 4] = y;
                    waters[i * 3 * 4 + 5] = z;
                    waters[i * 3 * 4 + 6] = x;
                    waters[i * 3 * 4 + 7] = y;
                    waters[i * 3 * 4 + 8] = z + sz;
                    waters[i * 3 * 4 + 9] = x + sx;
                    waters[i * 3 * 4 + 10] = y;
                    waters[i * 3 * 4 + 11] = z + sz;
                    offs += 0x10;
                }
                return waters;
            }
            var watersN = rom.view.getUint16(offs + 0x24, false);
            var watersAddr = rom.view.getUint32(offs + 0x28, false);
            var waters = readWaters(watersN, watersAddr);
            function readCamera(addr) {
                var skyboxCamera = loadAddress(addr + 0x04);
                var offs = rom.lookupAddress(banks, skyboxCamera);
                var x = rom.view.getInt16(offs + 0x00, false);
                var y = rom.view.getInt16(offs + 0x02, false);
                var z = rom.view.getInt16(offs + 0x04, false);
                var a = rom.view.getUint16(offs + 0x06, false) / 0xFFFF * (Math.PI * 2);
                var b = rom.view.getUint16(offs + 0x08, false) / 0xFFFF * (Math.PI * 2) + Math.PI;
                var c = rom.view.getUint16(offs + 0x0A, false) / 0xFFFF * (Math.PI * 2);
                var d = rom.view.getUint16(offs + 0x0C, false);
                var mtx = gl_matrix_8.mat4.create();
                gl_matrix_8.mat4.translate(mtx, mtx, [x, y, z]);
                gl_matrix_8.mat4.rotateZ(mtx, mtx, c);
                gl_matrix_8.mat4.rotateY(mtx, mtx, b);
                gl_matrix_8.mat4.rotateX(mtx, mtx, -a);
                return mtx;
            }
            var cameraAddr = rom.view.getUint32(offs + 0x20, false);
            var camera = readCamera(cameraAddr);
            return { verts: verts, polys: polys, waters: waters, camera: camera };
        }
        function readRoom(file) {
            var banks2 = { scene: banks.scene, room: file };
            return readHeaders(gl, rom, file.vStart, banks2);
        }
        function readRooms(nRooms, roomTableAddr) {
            var rooms = [];
            for (var i = 0; i < nRooms; i++) {
                var pStart = loadAddress(roomTableAddr);
                var file = rom.lookupFile(pStart);
                var room = readRoom(file);
                room.filename = file.filename;
                rooms.push(room);
                roomTableAddr += 8;
            }
            return rooms;
        }
        function loadImage(gl, src) {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var texId = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texId);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            var img = document.createElement('img');
            img.src = src;
            var aspect = 1;
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                gl.bindTexture(gl.TEXTURE_2D, texId);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imgData.width, imgData.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imgData.data);
            };
            // XXX: Should pull this dynamically at runtime.
            var imgWidth = 320;
            var imgHeight = 240;
            var imgAspect = imgWidth / imgHeight;
            // const viewportAspect = gl.viewportWidth / gl.viewportHeight;
            var x = imgAspect;
            var vertData = new Float32Array([
                /* x   y   z   u  v */
                -x, -1, 0, 0, 1,
                x, -1, 0, 1, 1,
                -x, 1, 0, 0, 0,
                x, 1, 0, 1, 0,
            ]);
            var vertBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.STATIC_DRAW);
            var idxData = new Uint8Array([
                0, 1, 2, 3,
            ]);
            var idxBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxData, gl.STATIC_DRAW);
            // 3 pos + 2 uv
            var VERTEX_SIZE = 5;
            var VERTEX_BYTES = VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT;
            return function (renderState) {
                var gl = renderState.gl;
                var prog = renderState.currentProgram;
                gl.disable(gl.BLEND);
                gl.disable(gl.DEPTH_TEST);
                gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
                gl.vertexAttribPointer(prog.positionLocation, 3, gl.FLOAT, false, VERTEX_BYTES, 0);
                gl.vertexAttribPointer(prog.uvLocation, 2, gl.FLOAT, false, VERTEX_BYTES, 3 * Float32Array.BYTES_PER_ELEMENT);
                gl.enableVertexAttribArray(prog.positionLocation);
                gl.enableVertexAttribArray(prog.uvLocation);
                gl.bindTexture(gl.TEXTURE_2D, texId);
                gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_BYTE, 0);
            };
        }
        function readMesh(meshAddr) {
            var hdr = loadAddress(meshAddr);
            var type = (hdr >> 24);
            var nEntries = (hdr >> 16) & 0xFF;
            var entriesAddr = loadAddress(meshAddr + 4);
            var mesh = new Mesh();
            function readDL(addr) {
                var dlStart = loadAddress(addr);
                if (dlStart === 0)
                    return null;
                return F3DEX2.readDL(gl, rom, banks, dlStart);
            }
            if (type === 0) {
                for (var i = 0; i < nEntries; i++) {
                    mesh.opaque.push(readDL(entriesAddr));
                    mesh.transparent.push(readDL(entriesAddr + 4));
                    entriesAddr += 8;
                }
            }
            else if (type === 1) {
                // The last entry always seems to contain the BG. Not sure
                // what the other data is about... maybe the VR skybox for rotating scenes?
                var lastEntry = nEntries - 1;
                var bg = loadAddress(meshAddr + (lastEntry * 0x0C) + 0x08);
                var bgOffs = rom.lookupAddress(banks, bg);
                var buffer = rom.buffer.slice(bgOffs);
                var blob = new Blob([buffer.castToBuffer()], { type: 'image/jpeg' });
                var url = window.URL.createObjectURL(blob);
                mesh.bg = loadImage(gl, url);
            }
            else if (type === 2) {
                for (var i = 0; i < nEntries; i++) {
                    mesh.opaque.push(readDL(entriesAddr + 8));
                    mesh.transparent.push(readDL(entriesAddr + 12));
                    entriesAddr += 16;
                }
            }
            mesh.opaque = mesh.opaque.filter(function (dl) { return !!dl; });
            mesh.transparent = mesh.transparent.filter(function (dl) { return !!dl; });
            mesh.textures = [];
            mesh.opaque.forEach(function (dl) { mesh.textures = mesh.textures.concat(dl.textures); });
            mesh.transparent.forEach(function (dl) { mesh.textures = mesh.textures.concat(dl.textures); });
            return mesh;
        }
        headers.rooms = [];
        headers.mesh = null;
        var startOffs = offs;
        while (true) {
            var cmd1 = rom.view.getUint32(offs, false);
            var cmd2 = rom.view.getUint32(offs + 4, false);
            offs += 8;
            var cmdType = cmd1 >> 24;
            if (cmdType === HeaderCommands.End)
                break;
            switch (cmdType) {
                case HeaderCommands.Collision:
                    headers.collision = readCollision(cmd2);
                    break;
                case HeaderCommands.Rooms:
                    var nRooms = (cmd1 >> 16) & 0xFF;
                    headers.rooms = readRooms(nRooms, cmd2);
                    break;
                case HeaderCommands.Mesh:
                    headers.mesh = readMesh(cmd2);
                    break;
            }
        }
        return headers;
    }
    function readScene(gl, zelview0, file) {
        var banks = { scene: file };
        return readHeaders(gl, zelview0, file.vStart, banks);
    }
    var gl_matrix_8, F3DEX2, util_20, VFSEntry, ZELVIEW0, Mesh, Headers, HeaderCommands;
    return {
        setters: [
            function (gl_matrix_8_1) {
                gl_matrix_8 = gl_matrix_8_1;
            },
            function (F3DEX2_1) {
                F3DEX2 = F3DEX2_1;
            },
            function (util_20_1) {
                util_20 = util_20_1;
            }
        ],
        execute: function () {
            // Loads the ZELVIEW0 format.
            VFSEntry = /** @class */ (function () {
                function VFSEntry() {
                }
                return VFSEntry;
            }());
            ZELVIEW0 = /** @class */ (function () {
                function ZELVIEW0() {
                }
                ZELVIEW0.prototype.lookupFile = function (pStart) {
                    try {
                        for (var _a = __values(this.entries), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var entry = _b.value;
                            if (entry.pStart === pStart)
                                return entry;
                        }
                    }
                    catch (e_35_1) { e_35 = { error: e_35_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_35) throw e_35.error; }
                    }
                    return null;
                    var e_35, _c;
                };
                ZELVIEW0.prototype.lookupAddress = function (banks, addr) {
                    var bankIdx = addr >>> 24;
                    var offs = addr & 0x00FFFFFF;
                    function findBank() {
                        switch (bankIdx) {
                            case 0x02: return banks.scene;
                            case 0x03: return banks.room;
                            default: return null;
                        }
                    }
                    var bank = findBank();
                    if (bank === null)
                        return null;
                    var absOffs = bank.vStart + offs;
                    if (absOffs > bank.vEnd)
                        return null;
                    return absOffs;
                };
                ZELVIEW0.prototype.loadAddress = function (banks, addr) {
                    var offs = this.lookupAddress(banks, addr);
                    return this.view.getUint32(offs);
                };
                ZELVIEW0.prototype.loadScene = function (gl, scene) {
                    return readScene(gl, this, scene);
                };
                ZELVIEW0.prototype.loadMainScene = function (gl) {
                    return this.loadScene(gl, this.sceneFile);
                };
                return ZELVIEW0;
            }());
            exports_34("ZELVIEW0", ZELVIEW0);
            Mesh = /** @class */ (function () {
                function Mesh() {
                    this.opaque = [];
                    this.transparent = [];
                }
                return Mesh;
            }());
            exports_34("Mesh", Mesh);
            Headers = /** @class */ (function () {
                function Headers() {
                    this.rooms = [];
                }
                return Headers;
            }());
            exports_34("Headers", Headers);
            (function (HeaderCommands) {
                HeaderCommands[HeaderCommands["Spawns"] = 0] = "Spawns";
                HeaderCommands[HeaderCommands["Actors"] = 1] = "Actors";
                HeaderCommands[HeaderCommands["Camera"] = 2] = "Camera";
                HeaderCommands[HeaderCommands["Collision"] = 3] = "Collision";
                HeaderCommands[HeaderCommands["Rooms"] = 4] = "Rooms";
                HeaderCommands[HeaderCommands["WindSettings"] = 5] = "WindSettings";
                HeaderCommands[HeaderCommands["EntranceList"] = 6] = "EntranceList";
                HeaderCommands[HeaderCommands["SpecialObjects"] = 7] = "SpecialObjects";
                HeaderCommands[HeaderCommands["SpecialBehavior"] = 8] = "SpecialBehavior";
                // 0x09 is unknown
                HeaderCommands[HeaderCommands["Mesh"] = 10] = "Mesh";
                HeaderCommands[HeaderCommands["Objects"] = 11] = "Objects";
                // 0x0C is unused
                HeaderCommands[HeaderCommands["Waypoints"] = 13] = "Waypoints";
                HeaderCommands[HeaderCommands["Transitions"] = 14] = "Transitions";
                HeaderCommands[HeaderCommands["Environment"] = 15] = "Environment";
                HeaderCommands[HeaderCommands["Time"] = 16] = "Time";
                HeaderCommands[HeaderCommands["Skybox"] = 17] = "Skybox";
                HeaderCommands[HeaderCommands["End"] = 20] = "End";
            })(HeaderCommands || (HeaderCommands = {}));
        }
    };
});
System.register("zelview/f3dex2", ["gl-matrix", "zelview/render", "render"], function (exports_35, context_35) {
    "use strict";
    var __moduleName = context_35 && context_35.id;
    function readVertex(state, which, addr) {
        var rom = state.rom;
        var offs = state.lookupAddress(addr);
        var posX = rom.view.getInt16(offs + 0, false);
        var posY = rom.view.getInt16(offs + 2, false);
        var posZ = rom.view.getInt16(offs + 4, false);
        var pos = gl_matrix_9.vec3.clone([posX, posY, posZ]);
        gl_matrix_9.vec3.transformMat4(pos, pos, state.mtx);
        var txU = rom.view.getInt16(offs + 8, false) * (1 / 32);
        var txV = rom.view.getInt16(offs + 10, false) * (1 / 32);
        var vtxArray = new Float32Array(state.vertexBuffer.buffer, which * VERTEX_BYTES, VERTEX_SIZE);
        vtxArray[0] = pos[0];
        vtxArray[1] = pos[1];
        vtxArray[2] = pos[2];
        vtxArray[3] = txU;
        vtxArray[4] = txV;
        vtxArray[5] = rom.view.getUint8(offs + 12) / 255;
        vtxArray[6] = rom.view.getUint8(offs + 13) / 255;
        vtxArray[7] = rom.view.getUint8(offs + 14) / 255;
        vtxArray[8] = rom.view.getUint8(offs + 15) / 255;
    }
    function cmd_VTX(state, w0, w1) {
        var N = (w0 >> 12) & 0xFF;
        var V0 = ((w0 >> 1) & 0x7F) - N;
        var addr = w1;
        for (var i = 0; i < N; i++) {
            var which = V0 + i;
            readVertex(state, which, addr);
            addr += 16;
        }
    }
    function flushDraw(state) {
        var gl = state.gl;
        var vtxBufSize = state.vertexData.length / VERTEX_SIZE;
        var vtxOffs = state.vertexOffs;
        var vtxCount = vtxBufSize - vtxOffs;
        state.vertexOffs = vtxBufSize;
        if (vtxCount === 0)
            return;
        state.cmds.push(function (renderState) {
            var gl = renderState.gl;
            gl.drawArrays(gl.TRIANGLES, vtxOffs, vtxCount);
        });
    }
    function translateTRI(state, idxData) {
        idxData.forEach(function (idx, i) {
            var offs = idx * VERTEX_SIZE;
            for (var i_2 = 0; i_2 < VERTEX_SIZE; i_2++) {
                state.vertexData.push(state.vertexBuffer[offs + i_2]);
            }
        });
    }
    function tri(idxData, offs, cmd) {
        idxData[offs + 0] = (cmd >> 17) & 0x7F;
        idxData[offs + 1] = (cmd >> 9) & 0x7F;
        idxData[offs + 2] = (cmd >> 1) & 0x7F;
    }
    function flushTexture(state) {
        if (state.textureTile)
            loadTile(state, state.textureTile);
    }
    function cmd_TRI1(state, w0, w1) {
        flushTexture(state);
        var idxData = new Uint8Array(3);
        tri(idxData, 0, w0);
        translateTRI(state, idxData);
    }
    function cmd_TRI2(state, w0, w1) {
        flushTexture(state);
        var idxData = new Uint8Array(6);
        tri(idxData, 0, w0);
        tri(idxData, 3, w1);
        translateTRI(state, idxData);
    }
    function cmd_GEOMETRYMODE(state, w0, w1) {
        state.geometryMode = state.geometryMode & ((~w0) & 0x00FFFFFF) | w1;
        var newMode = state.geometryMode;
        var renderFlags = new render_14.RenderFlags();
        var cullFront = newMode & GeometryMode.CULL_FRONT;
        var cullBack = newMode & GeometryMode.CULL_BACK;
        if (cullFront && cullBack)
            renderFlags.cullMode = render_14.CullMode.FRONT_AND_BACK;
        else if (cullFront)
            renderFlags.cullMode = render_14.CullMode.FRONT;
        else if (cullBack)
            renderFlags.cullMode = render_14.CullMode.BACK;
        else
            renderFlags.cullMode = render_14.CullMode.NONE;
        flushDraw(state);
        state.cmds.push(function (renderState) {
            var gl = renderState.gl;
            var prog = renderState.currentProgram;
            renderState.useFlags(renderFlags);
            var lighting = newMode & GeometryMode.LIGHTING;
            var useVertexColors = lighting ? 0 : 1;
            gl.uniform1i(prog.useVertexColorsLocation, useVertexColors);
        });
    }
    function cmd_SETOTHERMODE_L(state, w0, w1) {
        var mode = 31 - (w0 & 0xFF);
        if (mode === 3) {
            var renderFlags_1 = new render_14.RenderFlags();
            var newMode_1 = w1;
            renderFlags_1.depthTest = !!(newMode_1 & OtherModeL.Z_CMP);
            renderFlags_1.depthWrite = !!(newMode_1 & OtherModeL.Z_UPD);
            var alphaTestMode_1;
            if (newMode_1 & OtherModeL.FORCE_BL) {
                alphaTestMode_1 = 0;
                renderFlags_1.blendMode = render_14.BlendMode.ADD;
            }
            else {
                alphaTestMode_1 = ((newMode_1 & OtherModeL.CVG_X_ALPHA) ? 0x1 : 0 |
                    (newMode_1 & OtherModeL.ALPHA_CVG_SEL) ? 0x2 : 0);
                renderFlags_1.blendMode = render_14.BlendMode.NONE;
            }
            flushDraw(state);
            state.cmds.push(function (renderState) {
                var gl = renderState.gl;
                var prog = renderState.currentProgram;
                renderState.useFlags(renderFlags_1);
                if (newMode_1 & OtherModeL.ZMODE_DEC) {
                    gl.enable(gl.POLYGON_OFFSET_FILL);
                    gl.polygonOffset(-0.5, -0.5);
                }
                else {
                    gl.disable(gl.POLYGON_OFFSET_FILL);
                }
                gl.uniform1i(prog.alphaTestLocation, alphaTestMode_1);
            });
        }
    }
    function cmd_DL(state, w0, w1) {
        runDL(state, w1);
    }
    function cmd_MTX(state, w0, w1) {
        if (w1 & 0x80000000)
            state.mtx = state.mtxStack.pop();
        w1 &= ~0x80000000;
        state.geometryMode = 0;
        state.otherModeL = 0;
        state.mtxStack.push(state.mtx);
        state.mtx = gl_matrix_9.mat4.clone(state.mtx);
        var rom = state.rom;
        var offs = state.lookupAddress(w1);
        var mtx = gl_matrix_9.mat4.create();
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                var mt1 = rom.view.getUint16(offs, false);
                var mt2 = rom.view.getUint16(offs + 32, false);
                mtx[(x * 4) + y] = ((mt1 << 16) | (mt2)) * (1 / 0x10000);
                offs += 2;
            }
        }
        gl_matrix_9.mat4.multiply(state.mtx, state.mtx, mtx);
    }
    function cmd_POPMTX(state, w0, w1) {
        state.mtx = state.mtxStack.pop();
    }
    function cmd_TEXTURE(state, w0, w1) {
        // XXX(jstpierre): Bring this back at some point.
        /*
        const boundTexture = {};
        state.boundTexture = boundTexture;
    
        const s = w1 >> 16;
        const t = w1 & 0x0000FFFF;
    
        state.boundTexture.scaleS = (s + 1) / 0x10000;
        state.boundTexture.scaleT = (t + 1) / 0x10000;
        */
    }
    function r5g5b5a1(dst, dstOffs, p) {
        var r, g, b, a;
        r = (p & 0xF800) >> 11;
        r = (r << (8 - 5)) | (r >> (10 - 8));
        g = (p & 0x07C0) >> 6;
        g = (g << (8 - 5)) | (g >> (10 - 8));
        b = (p & 0x003E) >> 1;
        b = (b << (8 - 5)) | (b >> (10 - 8));
        a = (p & 0x0001) ? 0xFF : 0x00;
        dst[dstOffs + 0] = r;
        dst[dstOffs + 1] = g;
        dst[dstOffs + 2] = b;
        dst[dstOffs + 3] = a;
    }
    function cmd_SETTIMG(state, w0, w1) {
        var format = (w0 >> 21) & 0x7;
        var size = (w0 >> 19) & 0x3;
        var width = (w0 & 0x1000) + 1;
        var addr = w1;
        state.textureImageAddr = addr;
    }
    function cmd_SETTILE(state, w0, w1) {
        state.currentTile = {
            format: (w0 >> 16) & 0xFF,
            cms: (w1 >> 8) & 0x3,
            cmt: (w1 >> 18) & 0x3,
            // tmem: w0 & 0x1FF,
            lineSize: (w0 >> 9) & 0x1FF,
            // palette: (w1 >> 20) & 0xF,
            // shiftS: w1 & 0xF,
            // shiftT: (w1 >> 10) & 0xF,
            maskS: (w1 >> 4) & 0xF,
            maskT: (w1 >> 14) & 0xF,
            width: 0, height: 0, dstFormat: null,
            pixels: null, addr: 0, glTextureId: null,
            uls: 0, ult: 0, lrs: 0, lrt: 0,
        };
    }
    function cmd_SETTILESIZE(state, w0, w1) {
        var tileIdx = (w1 >> 24) & 0x7;
        // XXX(jstpierre): Multiple tiles?
        var tile = state.currentTile;
        tile.uls = (w0 >> 14) & 0x3FF;
        tile.ult = (w0 >> 2) & 0x3FF;
        tile.lrs = (w1 >> 14) & 0x3FF;
        tile.lrt = (w1 >> 2) & 0x3FF;
        calcTextureSize(tile);
    }
    function cmd_LOADTLUT(state, w0, w1) {
        var rom = state.rom;
        // XXX: properly implement uls/ult/lrs/lrt
        var size = ((w1 & 0x00FFF000) >> 14) + 1;
        var dst = new Uint8Array(size * 4);
        var srcOffs = state.lookupAddress(state.textureImageAddr);
        var dstOffs = 0;
        for (var i = 0; i < size; i++) {
            var pixel = rom.view.getUint16(srcOffs, false);
            r5g5b5a1(dst, dstOffs, pixel);
            srcOffs += 2;
            dstOffs += 4;
        }
        state.palettePixels = dst;
    }
    function tileCacheKey(state, tile) {
        // XXX: Do we need more than this?
        var srcOffs = state.lookupAddress(tile.addr);
        return srcOffs;
    }
    function loadTile(state, texture) {
        if (texture.glTextureId)
            return;
        var key = tileCacheKey(state, texture);
        var otherTile = tileCache.get(key);
        if (!otherTile) {
            translateTexture(state, texture);
            tileCache.set(key, texture);
        }
        else if (texture !== otherTile) {
            texture.glTextureId = otherTile.glTextureId;
        }
    }
    function convert_CI4(state, texture) {
        var palette = state.palettePixels;
        if (!palette)
            return;
        var nBytes = texture.width * texture.height * 4;
        var dst = new Uint8Array(nBytes);
        var srcOffs = state.lookupAddress(texture.addr);
        var i = 0;
        for (var y = 0; y < texture.height; y++) {
            for (var x = 0; x < texture.width; x += 2) {
                var b = state.rom.view.getUint8(srcOffs++);
                var idx = void 0;
                idx = ((b & 0xF0) >> 4) * 4;
                dst[i++] = palette[idx++];
                dst[i++] = palette[idx++];
                dst[i++] = palette[idx++];
                dst[i++] = palette[idx++];
                idx = (b & 0x0F) * 4;
                dst[i++] = palette[idx++];
                dst[i++] = palette[idx++];
                dst[i++] = palette[idx++];
                dst[i++] = palette[idx++];
            }
        }
        texture.pixels = dst;
    }
    function convert_I4(state, texture) {
        var nBytes = texture.width * texture.height * 2;
        var dst = new Uint8Array(nBytes);
        var srcOffs = state.lookupAddress(texture.addr);
        var i = 0;
        for (var y = 0; y < texture.height; y++) {
            for (var x = 0; x < texture.width; x += 2) {
                var b = state.rom.view.getUint8(srcOffs++);
                var p = void 0;
                p = (b & 0xF0) >> 4;
                p = p << 4 | p;
                dst[i++] = p;
                dst[i++] = p;
                p = (b & 0x0F);
                p = p << 4 | p;
                dst[i++] = p;
                dst[i++] = p;
            }
        }
        texture.pixels = dst;
    }
    function convert_IA4(state, texture) {
        var nBytes = texture.width * texture.height * 2;
        var dst = new Uint8Array(nBytes);
        var srcOffs = state.lookupAddress(texture.addr);
        var i = 0;
        for (var y = 0; y < texture.height; y++) {
            for (var x = 0; x < texture.width; x += 2) {
                var b = state.rom.view.getUint8(srcOffs++);
                var p = void 0;
                var pm = void 0;
                p = (b & 0xF0) >> 4;
                pm = p & 0x0E;
                dst[i++] = (pm << 4 | pm);
                dst[i++] = (p & 0x01) ? 0xFF : 0x00;
                p = (b & 0x0F);
                pm = p & 0x0E;
                dst[i++] = (pm << 4 | pm);
                dst[i++] = (p & 0x01) ? 0xFF : 0x00;
            }
        }
        texture.pixels = dst;
    }
    function convert_CI8(state, texture) {
        var palette = state.palettePixels;
        if (!palette)
            return;
        var nBytes = texture.width * texture.height * 4;
        var dst = new Uint8Array(nBytes);
        var srcOffs = state.lookupAddress(texture.addr);
        var i = 0;
        for (var y = 0; y < texture.height; y++) {
            for (var x = 0; x < texture.width; x++) {
                var idx = state.rom.view.getUint8(srcOffs) * 4;
                dst[i++] = palette[idx++];
                dst[i++] = palette[idx++];
                dst[i++] = palette[idx++];
                dst[i++] = palette[idx++];
                srcOffs++;
            }
        }
        texture.pixels = dst;
    }
    function convert_I8(state, texture) {
        var nBytes = texture.width * texture.height * 2;
        var dst = new Uint8Array(nBytes);
        var srcOffs = state.lookupAddress(texture.addr);
        var i = 0;
        for (var y = 0; y < texture.height; y++) {
            for (var x = 0; x < texture.width; x++) {
                var p = state.rom.view.getUint8(srcOffs++);
                dst[i++] = p;
                dst[i++] = p;
            }
        }
        texture.pixels = dst;
    }
    function convert_IA8(state, texture) {
        var nBytes = texture.width * texture.height * 2;
        var dst = new Uint8Array(nBytes);
        var srcOffs = state.lookupAddress(texture.addr);
        var i = 0;
        for (var y = 0; y < texture.height; y++) {
            for (var x = 0; x < texture.width; x++) {
                var b = state.rom.view.getUint8(srcOffs++);
                var p = void 0;
                p = (b & 0xF0) >> 4;
                p = p << 4 | p;
                dst[i++] = p;
                p = (b & 0x0F);
                p = p >> 4 | p;
                dst[i++] = p;
            }
        }
        texture.pixels = dst;
    }
    function convert_RGBA16(state, texture) {
        var rom = state.rom;
        var nBytes = texture.width * texture.height * 4;
        var dst = new Uint8Array(nBytes);
        var srcOffs = state.lookupAddress(texture.addr);
        var i = 0;
        for (var y = 0; y < texture.height; y++) {
            for (var x = 0; x < texture.width; x++) {
                var pixel = rom.view.getUint16(srcOffs, false);
                r5g5b5a1(dst, i, pixel);
                i += 4;
                srcOffs += 2;
            }
        }
        texture.pixels = dst;
    }
    function convert_IA16(state, texture) {
        var nBytes = texture.width * texture.height * 2;
        var dst = new Uint8Array(nBytes);
        var srcOffs = state.lookupAddress(texture.addr);
        var i = 0;
        for (var y = 0; y < texture.height; y++) {
            for (var x = 0; x < texture.width; x++) {
                dst[i++] = state.rom.view.getUint8(srcOffs++);
                dst[i++] = state.rom.view.getUint8(srcOffs++);
            }
        }
        texture.pixels = dst;
    }
    function textureToCanvas(texture) {
        var canvas = document.createElement("canvas");
        canvas.width = texture.width;
        canvas.height = texture.height;
        var ctx = canvas.getContext("2d");
        var imgData = ctx.createImageData(canvas.width, canvas.height);
        if (texture.dstFormat === "i8") {
            for (var si = 0, di = 0; di < imgData.data.length; si++, di += 4) {
                imgData.data[di + 0] = texture.pixels[si];
                imgData.data[di + 1] = texture.pixels[si];
                imgData.data[di + 2] = texture.pixels[si];
                imgData.data[di + 3] = 255;
            }
        }
        else if (texture.dstFormat === "i8_a8") {
            for (var si = 0, di = 0; di < imgData.data.length; si += 2, di += 4) {
                imgData.data[di + 0] = texture.pixels[si];
                imgData.data[di + 1] = texture.pixels[si];
                imgData.data[di + 2] = texture.pixels[si];
                imgData.data[di + 3] = texture.pixels[si + 1];
            }
        }
        else if (texture.dstFormat === "rgba8") {
            imgData.data.set(texture.pixels);
        }
        canvas.title = '0x' + texture.addr.toString(16) + '  ' + texture.format.toString(16) + '  ' + texture.dstFormat;
        ctx.putImageData(imgData, 0, 0);
        var surfaces = [canvas];
        return { name: canvas.title, surfaces: surfaces };
    }
    function translateTexture(state, texture) {
        var gl = state.gl;
        function convertTexturePixels() {
            switch (texture.format) {
                // 4-bit
                case 0x40: return convert_CI4(state, texture); // CI
                case 0x60: return convert_IA4(state, texture); // IA
                case 0x80: return convert_I4(state, texture); // I
                // 8-bit
                case 0x48: return convert_CI8(state, texture); // CI
                case 0x68: return convert_IA8(state, texture); // IA
                case 0x88: return convert_I8(state, texture); // I
                // 16-bit
                case 0x10: return convert_RGBA16(state, texture); // RGBA
                case 0x70: return convert_IA16(state, texture); // IA
                default: console.error("Unsupported texture", texture.format.toString(16));
            }
        }
        texture.dstFormat = calcTextureDestFormat(texture);
        var srcOffs = state.lookupAddress(texture.addr);
        if (srcOffs !== null)
            convertTexturePixels();
        if (!texture.pixels) {
            if (texture.dstFormat === "i8")
                texture.pixels = new Uint8Array(texture.width * texture.height);
            else if (texture.dstFormat === "i8_a8")
                texture.pixels = new Uint8Array(texture.width * texture.height * 2);
            else if (texture.dstFormat === "rgba8")
                texture.pixels = new Uint8Array(texture.width * texture.height * 4);
        }
        function translateWrap(cm) {
            switch (cm) {
                case 1: return gl.MIRRORED_REPEAT;
                case 2: return gl.CLAMP_TO_EDGE;
                case 3: return gl.CLAMP_TO_EDGE;
                default: return gl.REPEAT;
            }
        }
        var texId = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texId);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, translateWrap(texture.cms));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, translateWrap(texture.cmt));
        var glFormat;
        if (texture.dstFormat === "i8")
            glFormat = gl.LUMINANCE;
        else if (texture.dstFormat === "i8_a8")
            glFormat = gl.LUMINANCE_ALPHA;
        else if (texture.dstFormat === "rgba8")
            glFormat = gl.RGBA;
        gl.texImage2D(gl.TEXTURE_2D, 0, glFormat, texture.width, texture.height, 0, glFormat, gl.UNSIGNED_BYTE, texture.pixels);
        texture.glTextureId = texId;
        state.textures.push(textureToCanvas(texture));
    }
    function calcTextureDestFormat(texture) {
        switch (texture.format & 0xE0) {
            case 0x00: return "rgba8"; // RGBA
            case 0x40: return "rgba8"; // CI -- XXX -- do we need to check the palette type?
            case 0x60: return "i8_a8"; // IA
            case 0x80: return "i8_a8"; // I
            default: throw new Error("Invalid texture type");
        }
    }
    function calcTextureSize(texture) {
        var maxTexel, lineShift;
        switch (texture.format) {
            // 4-bit
            case 0x00:
                maxTexel = 4096;
                lineShift = 4;
                break; // RGBA
            case 0x40:
                maxTexel = 4096;
                lineShift = 4;
                break; // CI
            case 0x60:
                maxTexel = 8196;
                lineShift = 4;
                break; // IA
            case 0x80:
                maxTexel = 8196;
                lineShift = 4;
                break; // I
            // 8-bit
            case 0x08:
                maxTexel = 2048;
                lineShift = 3;
                break; // RGBA
            case 0x48:
                maxTexel = 2048;
                lineShift = 3;
                break; // CI
            case 0x68:
                maxTexel = 4096;
                lineShift = 3;
                break; // IA
            case 0x88:
                maxTexel = 4096;
                lineShift = 3;
                break; // I
            // 16-bit
            case 0x10:
                maxTexel = 2048;
                lineShift = 2;
                break; // RGBA
            case 0x50:
                maxTexel = 2048;
                lineShift = 0;
                break; // CI
            case 0x70:
                maxTexel = 2048;
                lineShift = 2;
                break; // IA
            case 0x90:
                maxTexel = 2048;
                lineShift = 0;
                break; // I
            // 32-bit
            case 0x18:
                maxTexel = 1024;
                lineShift = 2;
                break; // RGBA
            default:
                throw "whoops";
        }
        var lineW = texture.lineSize << lineShift;
        var tileW = texture.lrs - texture.uls + 1;
        var tileH = texture.lrt - texture.ult + 1;
        var maskW = 1 << texture.maskS;
        var maskH = 1 << texture.maskT;
        var lineH;
        if (lineW > 0)
            lineH = Math.min(maxTexel / lineW, tileH);
        else
            lineH = 0;
        var width;
        if (texture.maskS > 0 && (maskW * maskH) <= maxTexel)
            width = maskW;
        else if ((tileW * tileH) <= maxTexel)
            width = tileW;
        else
            width = lineW;
        var height;
        if (texture.maskT > 0 && (maskW * maskH) <= maxTexel)
            height = maskH;
        else if ((tileW * tileH) <= maxTexel)
            height = tileH;
        else
            height = lineH;
        texture.width = width;
        texture.height = height;
    }
    function loadTextureBlock(state, cmds) {
        var tileIdx = (cmds[5][1] >> 24) & 0x7;
        if (tileIdx !== 0)
            return;
        cmd_SETTIMG(state, cmds[0][0], cmds[0][1]);
        cmd_SETTILE(state, cmds[5][0], cmds[5][1]);
        cmd_SETTILESIZE(state, cmds[6][0], cmds[6][1]);
        state.textureTile = state.currentTile;
        var tile = state.textureTile;
        tile.addr = state.textureImageAddr;
        flushDraw(state);
        state.cmds.push(function (renderState) {
            var gl = renderState.gl;
            gl.bindTexture(gl.TEXTURE_2D, tile.glTextureId);
            var prog = renderState.currentProgram;
            gl.uniform2fv(prog.txsLocation, [1 / tile.width, 1 / tile.height]);
        });
    }
    function runDL(state, addr) {
        function collectNextCmds() {
            var L = [];
            var voffs = offs;
            for (var i = 0; i < 8; i++) {
                var cmd0 = rom.view.getUint32(voffs, false);
                var cmd1 = rom.view.getUint32(voffs + 4, false);
                L.push([cmd0, cmd1]);
                voffs += 8;
            }
            return L;
        }
        function matchesCmdStream(cmds, needle) {
            for (var i = 0; i < needle.length; i++)
                if (cmds[i][0] >>> 24 !== needle[i])
                    return false;
            return true;
        }
        var rom = state.rom;
        var offs = state.lookupAddress(addr);
        if (offs === null)
            return;
        while (true) {
            var cmd0 = rom.view.getUint32(offs, false);
            var cmd1 = rom.view.getUint32(offs + 4, false);
            var cmdType = cmd0 >>> 24;
            if (cmdType === 223 /* ENDDL */)
                break;
            // Texture uploads need to be special.
            if (cmdType === 253 /* SETTIMG */) {
                var nextCmds = collectNextCmds();
                if (matchesCmdStream(nextCmds, [253 /* SETTIMG */, 245 /* SETTILE */, 230 /* RDPLOADSYNC */, 243 /* LOADBLOCK */, 231 /* RDPPIPESYNC */, 245 /* SETTILE */, 242 /* SETTILESIZE */])) {
                    loadTextureBlock(state, nextCmds);
                    offs += 7 * 8;
                    continue;
                }
            }
            var func = CommandDispatch[cmdType];
            if (func)
                func(state, cmd0, cmd1);
            offs += 8;
        }
        flushDraw(state);
    }
    function readDL(gl, rom, banks, startAddr) {
        var state = new State();
        state.gl = gl;
        state.cmds = [];
        state.textures = [];
        state.mtx = gl_matrix_9.mat4.create();
        state.mtxStack = [state.mtx];
        state.vertexBuffer = new Float32Array(32 * VERTEX_SIZE);
        state.vertexData = [];
        state.vertexOffs = 0;
        state.rom = rom;
        state.banks = banks;
        runDL(state, startAddr);
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        var vertBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(state.vertexData), gl.STATIC_DRAW);
        gl.vertexAttribPointer(Render.F3DEX2Program.a_Position, 3, gl.FLOAT, false, VERTEX_BYTES, 0);
        gl.vertexAttribPointer(Render.F3DEX2Program.a_UV, 2, gl.FLOAT, false, VERTEX_BYTES, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribPointer(Render.F3DEX2Program.a_Color, 4, gl.FLOAT, false, VERTEX_BYTES, 5 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(Render.F3DEX2Program.a_Position);
        gl.enableVertexAttribArray(Render.F3DEX2Program.a_UV);
        gl.enableVertexAttribArray(Render.F3DEX2Program.a_Color);
        gl.bindVertexArray(null);
        return new DL(vao, state.cmds, state.textures);
    }
    exports_35("readDL", readDL);
    var gl_matrix_9, Render, render_14, State, VERTEX_SIZE, VERTEX_BYTES, GeometryMode, OtherModeL, tileCache, CommandDispatch, F3DEX2, DL;
    return {
        setters: [
            function (gl_matrix_9_1) {
                gl_matrix_9 = gl_matrix_9_1;
            },
            function (Render_1) {
                Render = Render_1;
            },
            function (render_14_1) {
                render_14 = render_14_1;
            }
        ],
        execute: function () {
            State = /** @class */ (function () {
                function State() {
                }
                State.prototype.lookupAddress = function (addr) {
                    return this.rom.lookupAddress(this.banks, addr);
                };
                return State;
            }());
            // 3 pos + 2 uv + 4 color/nrm
            VERTEX_SIZE = 9;
            VERTEX_BYTES = VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT;
            GeometryMode = {
                CULL_FRONT: 0x0200,
                CULL_BACK: 0x0400,
                LIGHTING: 0x020000,
            };
            OtherModeL = {
                Z_CMP: 0x0010,
                Z_UPD: 0x0020,
                ZMODE_DEC: 0x0C00,
                CVG_X_ALPHA: 0x1000,
                ALPHA_CVG_SEL: 0x2000,
                FORCE_BL: 0x4000,
            };
            // XXX: This is global to cut down on resources between DLs.
            tileCache = new Map();
            CommandDispatch = {};
            CommandDispatch[1 /* VTX */] = cmd_VTX;
            CommandDispatch[5 /* TRI1 */] = cmd_TRI1;
            CommandDispatch[6 /* TRI2 */] = cmd_TRI2;
            CommandDispatch[217 /* GEOMETRYMODE */] = cmd_GEOMETRYMODE;
            CommandDispatch[222 /* DL */] = cmd_DL;
            CommandDispatch[218 /* MTX */] = cmd_MTX;
            CommandDispatch[216 /* POPMTX */] = cmd_POPMTX;
            CommandDispatch[226 /* SETOTHERMODE_L */] = cmd_SETOTHERMODE_L;
            CommandDispatch[240 /* LOADTLUT */] = cmd_LOADTLUT;
            CommandDispatch[215 /* TEXTURE */] = cmd_TEXTURE;
            CommandDispatch[253 /* SETTIMG */] = cmd_SETTIMG;
            CommandDispatch[245 /* SETTILE */] = cmd_SETTILE;
            CommandDispatch[242 /* SETTILESIZE */] = cmd_SETTILESIZE;
            F3DEX2 = {};
            DL = /** @class */ (function () {
                function DL(vao, cmds, textures) {
                    this.vao = vao;
                    this.cmds = cmds;
                    this.textures = textures;
                }
                DL.prototype.render = function (renderState) {
                    var gl = renderState.gl;
                    gl.bindVertexArray(this.vao);
                    this.cmds.forEach(function (cmd) {
                        cmd(renderState);
                    });
                    gl.bindVertexArray(null);
                };
                return DL;
            }());
            exports_35("DL", DL);
        }
    };
});
System.register("zelview/render", ["zelview/zelview0", "render", "util"], function (exports_36, context_36) {
    "use strict";
    var __moduleName = context_36 && context_36.id;
    var ZELVIEW0, render_15, util_21, BillboardBGProgram, F3DEX2Program, CollisionProgram, WaterboxProgram, Scene, SceneDesc;
    return {
        setters: [
            function (ZELVIEW0_1) {
                ZELVIEW0 = ZELVIEW0_1;
            },
            function (render_15_1) {
                render_15 = render_15_1;
            },
            function (util_21_1) {
                util_21 = util_21_1;
            }
        ],
        execute: function () {
            BillboardBGProgram = /** @class */ (function (_super) {
                __extends(BillboardBGProgram, _super);
                function BillboardBGProgram() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.vert = "\nattribute vec3 a_position;\nattribute vec2 a_uv;\nvarying vec2 v_uv;\n\nvoid main() {\n    gl_Position = vec4(a_position, 1.0);\n    v_uv = a_uv;\n}\n";
                    _this.frag = "\nprecision mediump float;\nvarying vec2 v_uv;\nuniform sampler2D u_texture;\n\nvoid main() {\n    gl_FragColor = texture2D(u_texture, v_uv);\n}\n";
                    return _this;
                }
                BillboardBGProgram.prototype.bind = function (gl, prog) {
                    _super.prototype.bind.call(this, gl, prog);
                    this.positionLocation = gl.getAttribLocation(prog, "a_position");
                    this.uvLocation = gl.getAttribLocation(prog, "a_uv");
                };
                return BillboardBGProgram;
            }(render_15.Program));
            exports_36("BillboardBGProgram", BillboardBGProgram);
            F3DEX2Program = /** @class */ (function (_super) {
                __extends(F3DEX2Program, _super);
                function F3DEX2Program() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.vert = "\nuniform mat4 u_modelView;\nuniform mat4 u_projection;\nlayout(location = " + F3DEX2Program.a_Position + ") attribute vec3 a_Position;\nlayout(location = " + F3DEX2Program.a_UV + ") attribute vec2 a_UV;\nlayout(location = " + F3DEX2Program.a_Color + ") attribute vec4 a_Color;\nout vec4 v_color;\nout vec2 v_uv;\nuniform vec2 u_txs;\n\nvoid main() {\n    gl_Position = u_projection * u_modelView * vec4(a_Position, 1.0);\n    v_uv = a_UV * u_txs;\n    v_color = a_Color;\n}\n";
                    _this.frag = "\nprecision mediump float;\nvarying vec2 v_uv;\nvarying vec4 v_color;\nuniform sampler2D u_texture;\nuniform bool u_useVertexColors;\nuniform int u_alphaTest;\n\nvoid main() {\n    gl_FragColor = texture2D(u_texture, v_uv);\n    if (u_useVertexColors)\n        gl_FragColor *= v_color;\n    if (u_alphaTest > 0 && gl_FragColor.a < 0.0125)\n        discard;\n}\n";
                    return _this;
                }
                F3DEX2Program.prototype.bind = function (gl, prog) {
                    _super.prototype.bind.call(this, gl, prog);
                    this.txsLocation = gl.getUniformLocation(prog, "u_txs");
                    this.useVertexColorsLocation = gl.getUniformLocation(prog, "u_useVertexColors");
                    this.alphaTestLocation = gl.getUniformLocation(prog, "u_alphaTest");
                };
                F3DEX2Program.a_Position = 0;
                F3DEX2Program.a_UV = 1;
                F3DEX2Program.a_Color = 2;
                return F3DEX2Program;
            }(render_15.Program));
            exports_36("F3DEX2Program", F3DEX2Program);
            CollisionProgram = /** @class */ (function (_super) {
                __extends(CollisionProgram, _super);
                function CollisionProgram() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.vert = "\nuniform mat4 u_modelView;\nuniform mat4 u_projection;\nattribute vec3 a_position;\n\nvoid main() {\n    gl_Position = u_projection * u_modelView * vec4(a_position, 1.0);\n}\n";
                    _this.frag = "\n#extension GL_EXT_frag_depth : enable\n\nvoid main() {\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.2);\n    gl_FragDepthEXT = gl_FragCoord.z - 1e-6;\n}\n";
                    return _this;
                }
                CollisionProgram.prototype.bind = function (gl, prog) {
                    _super.prototype.bind.call(this, gl, prog);
                    this.positionLocation = gl.getAttribLocation(prog, "a_position");
                };
                return CollisionProgram;
            }(render_15.Program));
            WaterboxProgram = /** @class */ (function (_super) {
                __extends(WaterboxProgram, _super);
                function WaterboxProgram() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.vert = "\nuniform mat4 u_modelView;\nuniform mat4 u_projection;\nattribute vec3 a_position;\n\nvoid main() {\n    gl_Position = u_projection * u_modelView * vec4(a_position, 1.0);\n}\n";
                    _this.frag = "\nvoid main() {\n    gl_FragColor = vec4(0.2, 0.6, 1.0, 0.2);\n}\n";
                    return _this;
                }
                WaterboxProgram.prototype.bind = function (gl, prog) {
                    _super.prototype.bind.call(this, gl, prog);
                    this.positionLocation = gl.getAttribLocation(prog, "a_position");
                };
                return WaterboxProgram;
            }(render_15.Program));
            Scene = /** @class */ (function () {
                function Scene(gl, zelview0) {
                    var _this = this;
                    this.zelview0 = zelview0;
                    this.textures = [];
                    this.program_BG = new BillboardBGProgram();
                    this.program_COLL = new CollisionProgram();
                    this.program_DL = new F3DEX2Program();
                    this.program_WATERS = new WaterboxProgram();
                    var mainScene = zelview0.loadMainScene(gl);
                    mainScene.rooms.forEach(function (room) {
                        _this.textures = _this.textures.concat(room.mesh.textures);
                    });
                    var renderScene = this.translateScene(gl, mainScene);
                    var renderCollision = this.translateCollision(gl, mainScene);
                    var renderWaterBoxes = this.translateWaterBoxes(gl, mainScene);
                    this.render = function (state) {
                        renderScene(state);
                        renderCollision(state);
                        renderWaterBoxes(state);
                    };
                }
                Scene.prototype.translateScene = function (gl, scene) {
                    var _this = this;
                    return function (state) {
                        var gl = state.gl;
                        var renderDL = function (dl) {
                            dl.render(state);
                        };
                        var renderMesh = function (mesh) {
                            if (mesh.bg) {
                                state.useProgram(_this.program_BG);
                                state.bindModelView();
                                mesh.bg(state);
                            }
                            state.useProgram(_this.program_DL);
                            state.bindModelView();
                            mesh.opaque.forEach(renderDL);
                            mesh.transparent.forEach(renderDL);
                        };
                        var renderRoom = function (room) {
                            renderMesh(room.mesh);
                        };
                        state.useProgram(_this.program_DL);
                        scene.rooms.forEach(function (room) { return renderRoom(room); });
                    };
                };
                Scene.prototype.translateCollision = function (gl, scene) {
                    var _this = this;
                    var coll = scene.collision;
                    function stitchLines(ibd) {
                        var lines = new Uint16Array(ibd.length * 2);
                        var o = 0;
                        for (var i = 0; i < ibd.length; i += 3) {
                            lines[o++] = ibd[i + 0];
                            lines[o++] = ibd[i + 1];
                            lines[o++] = ibd[i + 1];
                            lines[o++] = ibd[i + 2];
                            lines[o++] = ibd[i + 2];
                            lines[o++] = ibd[i + 0];
                        }
                        return lines;
                    }
                    var collIdxBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, collIdxBuffer);
                    var lineData = stitchLines(coll.polys);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lineData, gl.STATIC_DRAW);
                    var nLinePrim = lineData.length;
                    var collVertBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, collVertBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, coll.verts, gl.STATIC_DRAW);
                    var renderFlags = new render_15.RenderFlags();
                    renderFlags.depthTest = true;
                    renderFlags.blendMode = render_15.BlendMode.ADD;
                    return function (state) {
                        var prog = _this.program_COLL;
                        state.useProgram(prog);
                        state.bindModelView();
                        state.useFlags(renderFlags);
                        gl.bindBuffer(gl.ARRAY_BUFFER, collVertBuffer);
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, collIdxBuffer);
                        gl.vertexAttribPointer(prog.positionLocation, 3, gl.SHORT, false, 0, 0);
                        gl.enableVertexAttribArray(prog.positionLocation);
                        gl.drawElements(gl.LINES, nLinePrim, gl.UNSIGNED_SHORT, 0);
                        gl.disableVertexAttribArray(prog.positionLocation);
                    };
                };
                Scene.prototype.translateWaterBoxes = function (gl, scene) {
                    var _this = this;
                    var coll = scene.collision;
                    var wbVtx = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, wbVtx);
                    gl.bufferData(gl.ARRAY_BUFFER, coll.waters, gl.STATIC_DRAW);
                    var wbIdxData = new Uint16Array(coll.waters.length / 3);
                    for (var i = 0; i < wbIdxData.length; i++)
                        wbIdxData[i] = i;
                    var wbIdx = gl.createBuffer();
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wbIdx);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, wbIdxData, gl.STATIC_DRAW);
                    var renderFlags = new render_15.RenderFlags();
                    renderFlags.blendMode = render_15.BlendMode.ADD;
                    renderFlags.cullMode = render_15.CullMode.NONE;
                    return function (state) {
                        var prog = _this.program_WATERS;
                        state.useProgram(prog);
                        state.bindModelView();
                        state.useFlags(renderFlags);
                        gl.bindBuffer(gl.ARRAY_BUFFER, wbVtx);
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wbIdx);
                        gl.vertexAttribPointer(prog.positionLocation, 3, gl.SHORT, false, 0, 0);
                        gl.enableVertexAttribArray(prog.positionLocation);
                        for (var i = 0; i < wbIdxData.length; i += 4)
                            gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_SHORT, i * 2);
                        gl.disableVertexAttribArray(prog.positionLocation);
                    };
                };
                Scene.prototype.destroy = function (gl) {
                    // TODO(jstpierre): Implement destroy for zelview.
                };
                return Scene;
            }());
            SceneDesc = /** @class */ (function () {
                function SceneDesc(name, path) {
                    this.name = name;
                    this.path = path;
                    this.id = this.path;
                }
                SceneDesc.prototype.createScene = function (gl) {
                    return util_21.fetch(this.path).then(function (result) {
                        var zelview0 = ZELVIEW0.readZELVIEW0(result);
                        return new Scene(gl, zelview0);
                    });
                };
                return SceneDesc;
            }());
            exports_36("SceneDesc", SceneDesc);
        }
    };
});
System.register("zelview/scenes", ["zelview/render"], function (exports_37, context_37) {
    "use strict";
    var __moduleName = context_37 && context_37.id;
    var render_16, id, name, sceneDescs, sceneGroup;
    return {
        setters: [
            function (render_16_1) {
                render_16 = render_16_1;
            }
        ],
        execute: function () {
            id = "zelview";
            name = "Ocarina of Time";
            sceneDescs = [
                {
                    filename: "ydan_scene",
                    label: "Inside the Deku Tree",
                },
                {
                    filename: "ddan_scene",
                    label: "Dodongo's Cavern",
                },
                {
                    filename: "bdan_scene",
                    label: "Inside Jabu-Jabu's Belly",
                },
                {
                    filename: "Bmori1_scene",
                    label: "Forest Temple",
                },
                {
                    filename: "HIDAN_scene",
                    label: "Fire Temple",
                },
                {
                    filename: "MIZUsin_scene",
                    label: "Water Temple",
                },
                {
                    filename: "jyasinzou_scene",
                    label: "Spirit Temple",
                },
                {
                    filename: "HAKAdan_scene",
                    label: "Shadow Temple",
                },
                {
                    filename: "HAKAdanCH_scene",
                    label: "Bottom of the Well",
                },
                {
                    filename: "ice_doukutu_scene",
                    label: "Ice Cavern",
                },
                {
                    filename: "ganon_scene",
                    label: "Ganon's Castle Tower",
                },
                {
                    filename: "men_scene",
                    label: "Gerudo Training Grounds",
                },
                {
                    filename: "gerudoway_scene",
                    label: "Thieves' Hideout",
                },
                {
                    filename: "ganontika_scene",
                    label: "Ganon's Castle",
                },
                {
                    filename: "ganon_sonogo_scene",
                    label: "Ganon's Castle Tower (Crumbling)",
                },
                {
                    filename: "ganontikasonogo_scene",
                    label: "Ganon's Castle (Crumbling)",
                },
                {
                    filename: "takaraya_scene",
                    label: "Treasure Chest Contest",
                },
                {
                    filename: "ydan_boss_scene",
                    label: "Inside the Deku Tree (Boss)",
                },
                {
                    filename: "ddan_boss_scene",
                    label: "Dodongo's Cavern (Boss)",
                },
                {
                    filename: "bdan_boss_scene",
                    label: "Inside Jabu-Jabu's Belly (Boss)",
                },
                {
                    filename: "moribossroom_scene",
                    label: "Forest Temple (Boss)",
                },
                {
                    filename: "FIRE_bs_scene",
                    label: "Fire Temple (Boss)",
                },
                {
                    filename: "MIZUsin_bs_scene",
                    label: "Water Temple (Boss)",
                },
                {
                    filename: "jyasinboss_scene",
                    label: "Spirit Temple (Mid-Boss)",
                },
                {
                    filename: "HAKAdan_bs_scene",
                    label: "Shadow Temple (Boss)",
                },
                {
                    filename: "ganon_boss_scene",
                    label: "Second-To-Last Boss Ganondorf",
                },
                {
                    filename: "ganon_final_scene",
                    label: "Ganondorf, Death Scene",
                },
                {
                    filename: "entra_scene",
                    label: "Market Entrance (Day)",
                },
                {
                    filename: "entra_n_scene",
                    label: "Market Entrance (Night)",
                },
                {
                    filename: "enrui_scene",
                    label: "Market Entrance (Adult)",
                },
                {
                    filename: "market_alley_scene",
                    label: "Back Alley (Day)",
                },
                {
                    filename: "market_alley_n_scene",
                    label: "Back Alley (Night)",
                },
                {
                    filename: "market_day_scene",
                    label: "Market (Day)",
                },
                {
                    filename: "market_night_scene",
                    label: "Market (Night)",
                },
                {
                    filename: "market_ruins_scene",
                    label: "Market (Adult)",
                },
                {
                    filename: "shrine_scene",
                    label: "Temple of Time (Outside, Day)",
                },
                {
                    filename: "shrine_n_scene",
                    label: "Temple of Time (Outside, Night)",
                },
                {
                    filename: "shrine_r_scene",
                    label: "Temple of Time (Outside, Adult)",
                },
                {
                    filename: "kokiri_home_scene",
                    label: "Know-it-all Brothers",
                },
                {
                    filename: "kokiri_home3_scene",
                    label: "House of Twins",
                },
                {
                    filename: "kokiri_home4_scene",
                    label: "Mido's House",
                },
                {
                    filename: "kokiri_home5_scene",
                    label: "Saria's House",
                },
                {
                    filename: "kakariko_scene",
                    label: "Kakariko Village House",
                },
                {
                    filename: "kakariko3_scene",
                    label: "Back Alley Village House",
                },
                {
                    filename: "shop1_scene",
                    label: "Kakariko Bazaar",
                },
                {
                    filename: "kokiri_shop_scene",
                    label: "Kokiri Shop",
                },
                {
                    filename: "golon_scene",
                    label: "Goron Shop",
                },
                {
                    filename: "zoora_scene",
                    label: "Zora Shop",
                },
                {
                    filename: "drag_scene",
                    label: "Kakariko Potion Shop",
                },
                {
                    filename: "alley_shop_scene",
                    label: "Market Potion Shop",
                },
                {
                    filename: "night_shop_scene",
                    label: "Bombchu Shop",
                },
                {
                    filename: "face_shop_scene",
                    label: "Happy Mask Shop",
                },
                {
                    filename: "link_home_scene",
                    label: "Link's House",
                },
                {
                    filename: "impa_scene",
                    label: "Puppy Woman's House",
                },
                {
                    filename: "malon_stable_scene",
                    label: "Stables",
                },
                {
                    filename: "labo_scene",
                    label: "Impa's House",
                },
                {
                    filename: "hylia_labo_scene",
                    label: "Lakeside Laboratory",
                },
                {
                    filename: "tent_scene",
                    label: "Carpenter's Tent",
                },
                {
                    filename: "hut_scene",
                    label: "Dampé's Hut",
                },
                {
                    filename: "daiyousei_izumi_scene",
                    label: "Great Fairy Fountain",
                },
                {
                    filename: "yousei_izumi_tate_scene",
                    label: "Small Fairy Fountain",
                },
                {
                    filename: "yousei_izumi_yoko_scene",
                    label: "Magic Fairy Fountain",
                },
                {
                    filename: "kakusiana_scene",
                    label: "Grottos",
                },
                {
                    filename: "hakaana_scene",
                    label: "Grave (1)",
                },
                {
                    filename: "hakaana2_scene",
                    label: "Grave (2)",
                },
                {
                    filename: "hakaana_ouke_scene",
                    label: "Royal Family's Tomb",
                },
                {
                    filename: "syatekijyou_scene",
                    label: "Shooting Gallery",
                },
                {
                    filename: "tokinoma_scene",
                    label: "Temple of Time Inside",
                },
                {
                    filename: "kenjyanoma_scene",
                    label: "Chamber of Sages",
                },
                {
                    filename: "hairal_niwa_scene",
                    label: "Castle Courtyard (Day)",
                },
                {
                    filename: "hairal_niwa_n_scene",
                    label: "Castle Courtyard (Night)",
                },
                {
                    filename: "hiral_demo_scene",
                    label: "Cutscene Map",
                },
                {
                    filename: "hakasitarelay_scene",
                    label: "Dampé's Grave & Kakariko Windmill",
                },
                {
                    filename: "turibori_scene",
                    label: "Fishing Pond",
                },
                {
                    filename: "nakaniwa_scene",
                    label: "Zelda's Courtyard",
                },
                {
                    filename: "bowling_scene",
                    label: "Bombchu Bowling Alley",
                },
                {
                    filename: "souko_scene",
                    label: "Talon's House",
                },
                {
                    filename: "miharigoya_scene",
                    label: "Lots'o Pots",
                },
                {
                    filename: "mahouya_scene",
                    label: "Granny's Potion Shop",
                },
                {
                    filename: "ganon_demo_scene",
                    label: "Final Battle against Ganon",
                },
                {
                    filename: "kinsuta_scene",
                    label: "Skulltula House",
                },
                {
                    filename: "spot00_scene",
                    label: "Hyrule Field",
                },
                {
                    filename: "spot01_scene",
                    label: "Kakariko Village",
                },
                {
                    filename: "spot02_scene",
                    label: "Kakariko Graveyard",
                },
                {
                    filename: "spot03_scene",
                    label: "Zora's River",
                },
                {
                    filename: "spot04_scene",
                    label: "Kokiri Forest",
                },
                {
                    filename: "spot05_scene",
                    label: "Sacred Forest Meadow",
                },
                {
                    filename: "spot06_scene",
                    label: "Lake Hylia",
                },
                {
                    filename: "spot07_scene",
                    label: "Zora's Domain",
                },
                {
                    filename: "spot08_scene",
                    label: "Zora's Fountain",
                },
                {
                    filename: "spot09_scene",
                    label: "Gerudo Valley",
                },
                {
                    filename: "spot10_scene",
                    label: "Lost Woods",
                },
                {
                    filename: "spot11_scene",
                    label: "Desert Colossus",
                },
                {
                    filename: "spot12_scene",
                    label: "Gerudo's Fortress",
                },
                {
                    filename: "spot13_scene",
                    label: "Haunted Wasteland",
                },
                {
                    filename: "spot15_scene",
                    label: "Hyrule Castle",
                },
                {
                    filename: "spot16_scene",
                    label: "Death Mountain",
                },
                {
                    filename: "spot17_scene",
                    label: "Death Mountain Crater",
                },
                {
                    filename: "spot18_scene",
                    label: "Goron City",
                },
                {
                    filename: "spot20_scene",
                    label: "Lon Lon Ranch",
                },
                {
                    filename: "ganon_tou_scene",
                    label: "Ganon's Tower (Outside)",
                },
                {
                    filename: "test01_scene",
                    label: "Collision Testing Area",
                },
                {
                    filename: "besitu_scene",
                    label: "Besitu / Treasure Chest Warp",
                },
                {
                    filename: "depth_test_scene",
                    label: "Depth Test",
                },
                {
                    filename: "syotes_scene",
                    label: "Stalfos Middle Room",
                },
                {
                    filename: "syotes2_scene",
                    label: "Stalfos Boss Room",
                },
                {
                    filename: "sutaru_scene",
                    label: "Dark Link Testing Area",
                },
                {
                    filename: "hairal_niwa2_scene",
                    label: "Beta Castle Courtyard",
                },
                {
                    filename: "sasatest_scene",
                    label: "Action Testing Room",
                },
                {
                    filename: "testroom_scene",
                    label: "Item Testing Room",
                },
            ].map(function (entry) {
                var path = "data/zelview/" + entry.filename + ".zelview0";
                return new render_16.SceneDesc(entry.label, path);
            });
            exports_37("sceneGroup", sceneGroup = { id: id, name: name, sceneDescs: sceneDescs });
        }
    };
});
System.register("oot3d/cmb", ["util"], function (exports_38, context_38) {
    "use strict";
    var __moduleName = context_38 && context_38.id;
    function readMatsChunk(cmb, buffer) {
        var view = buffer.createDataView();
        util_22.assert(util_22.readString(buffer, 0x00, 0x04) === 'mats');
        var count = view.getUint32(0x08, true);
        var offs = 0x0C;
        for (var i = 0; i < count; i++) {
            var mat = new Material();
            var bindingOffs = offs + 0x10;
            for (var j = 0; j < 3; j++) {
                var binding = new TextureBinding();
                binding.textureIdx = view.getInt16(bindingOffs + 0x00, true);
                binding.minFilter = view.getUint16(bindingOffs + 0x04, true);
                binding.magFilter = view.getUint16(bindingOffs + 0x06, true);
                binding.wrapS = view.getUint16(bindingOffs + 0x08, true);
                binding.wrapT = view.getUint16(bindingOffs + 0x0A, true);
                mat.textureBindings.push(binding);
                bindingOffs += 0x18;
            }
            mat.alphaTestEnable = !!view.getUint8(offs + 0x130);
            cmb.materials.push(mat);
            offs += 0x15C;
        }
    }
    function expand4to8(n) {
        return (n << 4) | n;
    }
    function expand5to8(n) {
        return (n << (8 - 5)) | (n >>> (10 - 8));
    }
    function expand6to8(n) {
        return (n << (8 - 6)) | (n >>> (12 - 8));
    }
    function decodeTexture_ETC1_4x4_Color(dst, w1, w2, dstOffs, stride) {
        // w1 = Upper 32-bit word, "control" data
        // w2 = Lower 32-bit word, "pixel" data
        // Table 3.17.2 -- Intensity tables for each codeword.
        var intensityTableMap = [
            [-8, -2, 2, 8],
            [-17, -5, 5, 17],
            [-29, -9, 9, 29],
            [-42, -13, 13, 42],
            [-60, -18, 18, 60],
            [-80, -24, 24, 80],
            [-106, -33, 33, 106],
            [-183, -47, 48, 183],
        ];
        // Table 3.17.3 -- MSB/LSB colors to modifiers.
        //
        //  msb lsb
        //  --- ---
        //   0  0   small colitive value (2nd intensity)
        //   0  1   large positive value (3rd intensity)
        //   1  0   small negative value (1st intensity)
        //   1  1   large negative value (0th intensity)
        //
        // Why the spec doesn't lay out the intensity map in this order,
        // I'll never know...
        var pixelToColorIndex = [2, 3, 1, 0];
        var diff = (w1 & 2);
        var flip = (w1 & 1);
        // Intensity tables for each block.
        var intensityIndex1 = (w1 >> 5) & 0x7;
        var intensityIndex2 = (w1 >> 2) & 0x7;
        var intensityTable1 = intensityTableMap[intensityIndex1];
        var intensityTable2 = intensityTableMap[intensityIndex2];
        function signed3(n) {
            // Sign-extend.
            return n << 29 >> 29;
        }
        function clamp(n) {
            if (n < 0)
                return 0;
            if (n > 255)
                return 255;
            return n;
        }
        // Get the color table for a given block.
        function getColors(colors, r, g, b, intensityMap) {
            for (var i = 0; i < 4; i++) {
                colors[(i * 3) + 0] = clamp(r + intensityMap[i]);
                colors[(i * 3) + 1] = clamp(g + intensityMap[i]);
                colors[(i * 3) + 2] = clamp(b + intensityMap[i]);
            }
        }
        var colors1 = new Uint8Array(3 * 4);
        var colors2 = new Uint8Array(3 * 4);
        if (diff) {
            var baseR1a = (w1 >>> 27) & 0x1F;
            var baseR2d = signed3((w1 >>> 24) & 0x07);
            var baseG1a = (w1 >>> 19) & 0x1F;
            var baseG2d = signed3((w1 >>> 16) & 0x07);
            var baseB1a = (w1 >>> 11) & 0x1F;
            var baseB2d = signed3((w1 >>> 8) & 0x07);
            var baseR1 = expand5to8(baseR1a);
            var baseR2 = expand5to8(baseR1a + baseR2d);
            var baseG1 = expand5to8(baseG1a);
            var baseG2 = expand5to8(baseG1a + baseG2d);
            var baseB1 = expand5to8(baseB1a);
            var baseB2 = expand5to8(baseB1a + baseB2d);
            getColors(colors1, baseR1, baseG1, baseB1, intensityTable1);
            getColors(colors2, baseR2, baseG2, baseB2, intensityTable2);
        }
        else {
            var baseR1 = expand4to8((w1 >>> 28) & 0x0F);
            var baseR2 = expand4to8((w1 >>> 24) & 0x0F);
            var baseG1 = expand4to8((w1 >>> 20) & 0x0F);
            var baseG2 = expand4to8((w1 >>> 16) & 0x0F);
            var baseB1 = expand4to8((w1 >>> 12) & 0x0F);
            var baseB2 = expand4to8((w1 >>> 8) & 0x0F);
            getColors(colors1, baseR1, baseG1, baseB1, intensityTable1);
            getColors(colors2, baseR2, baseG2, baseB2, intensityTable2);
        }
        // Go through each pixel and copy the color into the right spot...
        for (var i = 0; i < 16; i++) {
            var lsb = (w2 >>> i) & 0x01;
            var msb = (w2 >>> (16 + i)) & 0x01;
            var lookup = (msb << 1) | lsb;
            var colorsIndex = pixelToColorIndex[lookup];
            // Indexes march down and to the right here.
            var y = i & 0x03;
            var x = i >> 2;
            var dstIndex = dstOffs + ((y * stride) + x) * 4;
            // Whether we're in block 1 or block 2;
            var whichBlock = void 0;
            // If flipbit=0, the block is divided into two 2x4
            // subblocks side-by-side.
            if (flip === 0)
                whichBlock = x & 2;
            else
                whichBlock = y & 2;
            var colors = whichBlock ? colors2 : colors1;
            dst[dstIndex + 0] = colors[(colorsIndex * 3) + 0];
            dst[dstIndex + 1] = colors[(colorsIndex * 3) + 1];
            dst[dstIndex + 2] = colors[(colorsIndex * 3) + 2];
        }
    }
    function decodeTexture_ETC1_4x4_Alpha(dst, a1, a2, dstOffs, stride) {
        for (var ax = 0; ax < 2; ax++) {
            for (var ay = 0; ay < 4; ay++) {
                var dstIndex = dstOffs + ((ay * stride) + ax) * 4;
                dst[dstIndex + 3] = expand4to8(a2 & 0x0F);
                a2 >>= 4;
            }
        }
        for (var ax = 2; ax < 4; ax++) {
            for (var ay = 0; ay < 4; ay++) {
                var dstIndex = dstOffs + ((ay * stride) + ax) * 4;
                dst[dstIndex + 3] = expand4to8(a1 & 0x0F);
                a1 >>= 4;
            }
        }
    }
    function decodeTexture_ETC1(texture, texData, alpha) {
        var pixels = new Uint8Array(texture.width * texture.height * 4);
        var stride = texture.width;
        var src = texData.createDataView();
        var offs = 0;
        for (var yy = 0; yy < texture.height; yy += 8) {
            for (var xx = 0; xx < texture.width; xx += 8) {
                // Order of each set of 4 blocks: top left, top right, bottom left, bottom right...
                for (var y = 0; y < 8; y += 4) {
                    for (var x = 0; x < 8; x += 4) {
                        var dstOffs = ((yy + y) * stride + (xx + x)) * 4;
                        var a1 = void 0;
                        var a2 = void 0;
                        if (alpha) {
                            // In ETC1A4 mode, we have 8 bytes of per-pixel alpha data preceeding the tile.
                            a2 = src.getUint32(offs + 0x00, true);
                            a1 = src.getUint32(offs + 0x04, true);
                            offs += 0x08;
                        }
                        else {
                            a2 = 0xFFFFFFFF;
                            a1 = 0xFFFFFFFF;
                        }
                        decodeTexture_ETC1_4x4_Alpha(pixels, a1, a2, dstOffs, stride);
                        var w2 = src.getUint32(offs + 0x00, true);
                        var w1 = src.getUint32(offs + 0x04, true);
                        decodeTexture_ETC1_4x4_Color(pixels, w1, w2, dstOffs, stride);
                        offs += 0x08;
                    }
                }
            }
        }
        return pixels;
    }
    function decodeTexture_Tiled(texture, texData, decoder) {
        var pixels = new Uint8Array(texture.width * texture.height * 4);
        var stride = texture.width;
        function morton7(n) {
            // 0a0b0c => 000abc
            return ((n >> 2) & 0x04) | ((n >> 1) & 0x02) | (n & 0x01);
        }
        for (var yy = 0; yy < texture.height; yy += 8) {
            for (var xx = 0; xx < texture.width; xx += 8) {
                // Iterate in Morton order inside each tile.
                for (var i = 0; i < 0x40; i++) {
                    var x = morton7(i);
                    var y = morton7(i >> 1);
                    var dstOffs = ((yy + y) * stride + xx + x) * 4;
                    decoder(pixels, dstOffs);
                }
            }
        }
        return pixels;
    }
    function decodeTexture_RGBA5551(texture, texData) {
        var src = texData.createDataView();
        var srcOffs = 0;
        return decodeTexture_Tiled(texture, texData, function (pixels, dstOffs) {
            var p = src.getUint16(srcOffs, true);
            pixels[dstOffs + 0] = expand5to8((p >> 11) & 0x1F);
            pixels[dstOffs + 1] = expand5to8((p >> 6) & 0x1F);
            pixels[dstOffs + 2] = expand5to8((p >> 1) & 0x1F);
            pixels[dstOffs + 3] = (p & 0x01) ? 0xFF : 0x00;
            srcOffs += 2;
        });
    }
    function decodeTexture_RGB565(texture, texData) {
        var src = texData.createDataView();
        var srcOffs = 0;
        return decodeTexture_Tiled(texture, texData, function (pixels, dstOffs) {
            var p = src.getUint16(srcOffs, true);
            pixels[dstOffs + 0] = expand5to8((p >> 11) & 0x1F);
            pixels[dstOffs + 1] = expand6to8((p >> 5) & 0x3F);
            pixels[dstOffs + 2] = expand5to8(p & 0x1F);
            pixels[dstOffs + 3] = 0xFF;
            srcOffs += 2;
        });
    }
    function decodeTexture_A8(texture, texData) {
        var src = texData.createDataView();
        var srcOffs = 0;
        return decodeTexture_Tiled(texture, texData, function (pixels, dstOffs) {
            var A = src.getUint8(srcOffs++);
            pixels[dstOffs + 0] = 0xFF;
            pixels[dstOffs + 1] = 0xFF;
            pixels[dstOffs + 2] = 0xFF;
            pixels[dstOffs + 3] = A;
        });
    }
    function decodeTexture_L8(texture, texData) {
        var src = texData.createDataView();
        var srcOffs = 0;
        return decodeTexture_Tiled(texture, texData, function (pixels, dstOffs) {
            var L = src.getUint8(srcOffs++);
            pixels[dstOffs + 0] = L;
            pixels[dstOffs + 1] = L;
            pixels[dstOffs + 2] = L;
            pixels[dstOffs + 3] = L;
        });
    }
    function decodeTexture_LA8(texture, texData) {
        var src = texData.createDataView();
        var srcOffs = 0;
        return decodeTexture_Tiled(texture, texData, function (pixels, dstOffs) {
            var L = src.getUint8(srcOffs++);
            var A = src.getUint8(srcOffs++);
            pixels[dstOffs + 0] = L;
            pixels[dstOffs + 1] = L;
            pixels[dstOffs + 2] = L;
            pixels[dstOffs + 3] = A;
        });
    }
    function decodeTexture(texture, texData) {
        switch (texture.format) {
            case TextureFormat.ETC1:
                return decodeTexture_ETC1(texture, texData, false);
            case TextureFormat.ETC1A4:
                return decodeTexture_ETC1(texture, texData, true);
            case TextureFormat.RGBA5551:
                return decodeTexture_RGBA5551(texture, texData);
            case TextureFormat.RGB565:
                return decodeTexture_RGB565(texture, texData);
            case TextureFormat.A8:
                return decodeTexture_A8(texture, texData);
            case TextureFormat.L8:
                return decodeTexture_L8(texture, texData);
            case TextureFormat.LA8:
                return decodeTexture_LA8(texture, texData);
            default:
                throw new Error("Unsupported texture type! " + texture.format);
        }
    }
    function readTexChunk(cmb, buffer, texData) {
        var view = buffer.createDataView();
        util_22.assert(util_22.readString(buffer, 0x00, 0x04) === 'tex ');
        var count = view.getUint32(0x08, true);
        var offs = 0x0C;
        for (var i = 0; i < count; i++) {
            var texture = new Texture();
            var size = view.getUint32(offs + 0x00, true);
            texture.width = view.getUint16(offs + 0x08, true);
            texture.height = view.getUint16(offs + 0x0A, true);
            texture.format = view.getUint32(offs + 0x0C, true);
            var dataOffs = view.getUint32(offs + 0x10, true);
            texture.name = util_22.readString(buffer, offs + 0x14, 0x10);
            texture.name = texture.name + "  (" + texture.format + ")";
            offs += 0x24;
            texture.pixels = decodeTexture(texture, texData.slice(dataOffs, dataOffs + size));
            cmb.textures.push(texture);
        }
    }
    function readVatrChunk(cmb, buffer) {
        var view = buffer.createDataView();
        util_22.assert(util_22.readString(buffer, 0x00, 0x04) === 'vatr');
        cmb.vertexBufferSlices = new VertexBufferSlices();
        var posSize = view.getUint32(0x0C, true);
        var posOffs = view.getUint32(0x10, true);
        cmb.vertexBufferSlices.posBuffer = buffer.slice(posOffs, posOffs + posSize);
        var nrmSize = view.getUint32(0x14, true);
        var nrmOffs = view.getUint32(0x18, true);
        cmb.vertexBufferSlices.nrmBuffer = buffer.slice(nrmOffs, nrmOffs + nrmSize);
        var colSize = view.getUint32(0x1C, true);
        var colOffs = view.getUint32(0x20, true);
        cmb.vertexBufferSlices.colBuffer = buffer.slice(colOffs, colOffs + colSize);
        var txcSize = view.getUint32(0x24, true);
        var txcOffs = view.getUint32(0x28, true);
        cmb.vertexBufferSlices.txcBuffer = buffer.slice(txcOffs, txcOffs + txcSize);
    }
    function readMshsChunk(cmb, buffer) {
        var view = buffer.createDataView();
        util_22.assert(util_22.readString(buffer, 0x00, 0x04) === 'mshs');
        var count = view.getUint32(0x08, true);
        var offs = 0x10;
        for (var i = 0; i < count; i++) {
            var mesh = new Mesh();
            mesh.sepdIdx = view.getUint16(offs, true);
            mesh.matsIdx = view.getUint8(offs + 2);
            cmb.meshs.push(mesh);
            offs += 0x04;
        }
    }
    function readPrmChunk(cmb, buffer) {
        var view = buffer.createDataView();
        util_22.assert(util_22.readString(buffer, 0x00, 0x04) === 'prm ');
        var prm = new Prm();
        prm.indexType = view.getUint32(0x10, true);
        prm.count = view.getUint16(0x14, true);
        prm.offset = view.getUint16(0x16, true);
        return prm;
    }
    function readPrmsChunk(cmb, buffer) {
        var view = buffer.createDataView();
        util_22.assert(util_22.readString(buffer, 0x00, 0x04) === 'prms');
        var prmOffs = view.getUint32(0x14, true);
        return readPrmChunk(cmb, buffer.slice(prmOffs));
    }
    function readSepdChunk(cmb, buffer) {
        var view = buffer.createDataView();
        util_22.assert(util_22.readString(buffer, 0x00, 0x04) === 'sepd');
        var count = view.getUint16(0x08, true);
        var sepd = new Sepd();
        var offs = 0x108;
        for (var i = 0; i < count; i++) {
            var prmsOffs = view.getUint32(offs, true);
            sepd.prms.push(readPrmsChunk(cmb, buffer.slice(prmsOffs)));
            offs += 0x02;
        }
        sepd.posStart = view.getUint32(0x24, true);
        sepd.posScale = view.getFloat32(0x28, true);
        sepd.posType = view.getUint16(0x2C, true);
        sepd.nrmStart = view.getUint32(0x40, true);
        sepd.nrmScale = view.getFloat32(0x44, true);
        sepd.nrmType = view.getUint16(0x48, true);
        sepd.colStart = view.getUint32(0x5C, true);
        sepd.colScale = view.getFloat32(0x60, true);
        sepd.colType = view.getUint16(0x64, true);
        sepd.txcStart = view.getUint32(0x78, true);
        sepd.txcScale = view.getFloat32(0x7C, true);
        sepd.txcType = view.getUint16(0x80, true);
        return sepd;
    }
    function readShpChunk(cmb, buffer) {
        var view = buffer.createDataView();
        util_22.assert(util_22.readString(buffer, 0x00, 0x04) === 'shp ');
        var count = view.getUint32(0x08, true);
        var offs = 0x10;
        for (var i = 0; i < count; i++) {
            var sepdOffs = view.getUint16(offs, true);
            var sepd = readSepdChunk(cmb, buffer.slice(sepdOffs));
            cmb.sepds.push(sepd);
            offs += 0x02;
        }
    }
    function readSklmChunk(cmb, buffer) {
        var view = buffer.createDataView();
        util_22.assert(util_22.readString(buffer, 0x00, 0x04) === 'sklm');
        var mshsChunkOffs = view.getUint32(0x08, true);
        readMshsChunk(cmb, buffer.slice(mshsChunkOffs));
        var shpChunkOffs = view.getUint32(0x0C, true);
        readShpChunk(cmb, buffer.slice(shpChunkOffs));
    }
    function parse(buffer) {
        var view = buffer.createDataView();
        var cmb = new CMB();
        util_22.assert(util_22.readString(buffer, 0x00, 0x04) === 'cmb ');
        var size = view.getUint32(0x04, true);
        cmb.name = util_22.readString(buffer, 0x10, 0x10);
        var matsChunkOffs = view.getUint32(0x28, true);
        readMatsChunk(cmb, buffer.slice(matsChunkOffs));
        var texDataOffs = view.getUint32(0x40, true);
        var texChunkOffs = view.getUint32(0x2C, true);
        readTexChunk(cmb, buffer.slice(texChunkOffs), buffer.slice(texDataOffs));
        var vatrChunkOffs = view.getUint32(0x38, true);
        readVatrChunk(cmb, buffer.slice(vatrChunkOffs));
        var sklmChunkOffs = view.getUint32(0x30, true);
        readSklmChunk(cmb, buffer.slice(sklmChunkOffs));
        var idxDataOffs = view.getUint32(0x3C, true);
        var idxDataCount = view.getUint32(0x20, true);
        cmb.indexBuffer = buffer.slice(idxDataOffs, idxDataOffs + idxDataCount * 2);
        return cmb;
    }
    exports_38("parse", parse);
    var util_22, VertexBufferSlices, CMB, TextureFilter, TextureWrapMode, TextureBinding, Material, TextureFormat, Texture, Mesh, DataType, Prm, Sepd;
    return {
        setters: [
            function (util_22_1) {
                util_22 = util_22_1;
            }
        ],
        execute: function () {
            VertexBufferSlices = /** @class */ (function () {
                function VertexBufferSlices() {
                }
                return VertexBufferSlices;
            }());
            CMB = /** @class */ (function () {
                function CMB() {
                    this.textures = [];
                    this.materials = [];
                    this.sepds = [];
                    this.meshs = [];
                }
                return CMB;
            }());
            exports_38("CMB", CMB);
            (function (TextureFilter) {
                TextureFilter[TextureFilter["NEAREST"] = 9728] = "NEAREST";
                TextureFilter[TextureFilter["LINEAR"] = 9729] = "LINEAR";
                TextureFilter[TextureFilter["NEAREST_MIPMAP_NEAREST"] = 9984] = "NEAREST_MIPMAP_NEAREST";
                TextureFilter[TextureFilter["LINEAR_MIPMAP_NEAREST"] = 9985] = "LINEAR_MIPMAP_NEAREST";
                TextureFilter[TextureFilter["NEAREST_MIPMIP_LINEAR"] = 9986] = "NEAREST_MIPMIP_LINEAR";
                TextureFilter[TextureFilter["LINEAR_MIPMAP_LINEAR"] = 9987] = "LINEAR_MIPMAP_LINEAR";
            })(TextureFilter || (TextureFilter = {}));
            exports_38("TextureFilter", TextureFilter);
            (function (TextureWrapMode) {
                TextureWrapMode[TextureWrapMode["CLAMP"] = 10496] = "CLAMP";
                TextureWrapMode[TextureWrapMode["REPEAT"] = 10497] = "REPEAT";
            })(TextureWrapMode || (TextureWrapMode = {}));
            exports_38("TextureWrapMode", TextureWrapMode);
            TextureBinding = /** @class */ (function () {
                function TextureBinding() {
                }
                return TextureBinding;
            }());
            Material = /** @class */ (function () {
                function Material() {
                    this.textureBindings = [];
                }
                return Material;
            }());
            exports_38("Material", Material);
            (function (TextureFormat) {
                TextureFormat[TextureFormat["ETC1"] = 26458] = "ETC1";
                TextureFormat[TextureFormat["ETC1A4"] = 26459] = "ETC1A4";
                TextureFormat[TextureFormat["RGBA5551"] = 2150917970] = "RGBA5551";
                TextureFormat[TextureFormat["RGB565"] = 2204329812] = "RGB565";
                TextureFormat[TextureFormat["A8"] = 335636310] = "A8";
                TextureFormat[TextureFormat["L8"] = 335636311] = "L8";
                TextureFormat[TextureFormat["LA8"] = 335636312] = "LA8";
            })(TextureFormat || (TextureFormat = {}));
            Texture = /** @class */ (function () {
                function Texture() {
                }
                return Texture;
            }());
            exports_38("Texture", Texture);
            Mesh = /** @class */ (function () {
                function Mesh() {
                }
                return Mesh;
            }());
            exports_38("Mesh", Mesh);
            (function (DataType) {
                DataType[DataType["Byte"] = 5120] = "Byte";
                DataType[DataType["UByte"] = 5121] = "UByte";
                DataType[DataType["Short"] = 5122] = "Short";
                DataType[DataType["UShort"] = 5123] = "UShort";
                DataType[DataType["Int"] = 5124] = "Int";
                DataType[DataType["UInt"] = 5125] = "UInt";
                DataType[DataType["Float"] = 5126] = "Float";
            })(DataType || (DataType = {}));
            exports_38("DataType", DataType);
            Prm = /** @class */ (function () {
                function Prm() {
                }
                return Prm;
            }());
            exports_38("Prm", Prm);
            Sepd = /** @class */ (function () {
                function Sepd() {
                    this.prms = [];
                }
                return Sepd;
            }());
            exports_38("Sepd", Sepd);
        }
    };
});
System.register("oot3d/zsi", ["oot3d/cmb", "util"], function (exports_39, context_39) {
    "use strict";
    var __moduleName = context_39 && context_39.id;
    function readRooms(buffer, nRooms, offs) {
        var rooms = [];
        for (var i = 0; i < nRooms; i++) {
            rooms.push(util_23.readString(buffer, offs, 0x44));
            offs += 0x44;
        }
        return rooms;
    }
    function readMesh(buffer, offs) {
        var mesh = new Mesh();
        var view = buffer.createDataView();
        var hdr = view.getUint32(offs);
        var type = (hdr >> 24);
        var nEntries = (hdr >> 16) & 0xFF;
        var entriesAddr = view.getUint32(offs + 4, true);
        util_23.assert(type === 0x02);
        util_23.assert(nEntries === 0x01);
        var opaqueAddr = view.getUint32(entriesAddr + 0x08, true);
        var transparentAddr = view.getUint32(entriesAddr + 0x0C, true);
        if (opaqueAddr !== 0)
            mesh.opaque = CMB.parse(buffer.slice(opaqueAddr));
        if (transparentAddr !== 0)
            mesh.transparent = CMB.parse(buffer.slice(transparentAddr));
        mesh.textures = [];
        if (mesh.opaque)
            mesh.textures = mesh.textures.concat(mesh.opaque.textures);
        if (mesh.transparent)
            mesh.textures = mesh.textures.concat(mesh.transparent.textures);
        return mesh;
    }
    function readCollision(buffer, offs) {
        var view = buffer.createDataView();
        var waterboxTableCount = view.getUint16(offs + 0x14, true);
        var waterboxTableOffs = view.getUint32(offs + 0x28, true);
        var waterboxes = new Uint16Array(waterboxTableCount * 3 * 4);
        var waterboxTableIdx = waterboxTableOffs;
        for (var i = 0; i < waterboxTableCount; i++) {
            var x = view.getInt16(waterboxTableIdx + 0x00, true);
            var y = view.getInt16(waterboxTableIdx + 0x02, true);
            var z = view.getInt16(waterboxTableIdx + 0x04, true);
            var sx = view.getInt16(waterboxTableIdx + 0x06, true);
            var sz = view.getInt16(waterboxTableIdx + 0x08, true);
            waterboxes[i * 3 * 4 + 0] = x;
            waterboxes[i * 3 * 4 + 1] = y;
            waterboxes[i * 3 * 4 + 2] = z;
            waterboxes[i * 3 * 4 + 3] = x + sx;
            waterboxes[i * 3 * 4 + 4] = y;
            waterboxes[i * 3 * 4 + 5] = z;
            waterboxes[i * 3 * 4 + 6] = x;
            waterboxes[i * 3 * 4 + 7] = y;
            waterboxes[i * 3 * 4 + 8] = z + sz;
            waterboxes[i * 3 * 4 + 9] = x + sx;
            waterboxes[i * 3 * 4 + 10] = y;
            waterboxes[i * 3 * 4 + 11] = z + sz;
            waterboxTableIdx += 0x10;
        }
        return { waterboxes: waterboxes };
    }
    // ZSI headers are a slight modification of the original Z64 headers.
    function readHeaders(buffer) {
        var view = buffer.createDataView();
        var offs = 0;
        var zsi = new ZSI();
        while (true) {
            var cmd1 = view.getUint32(offs, false);
            var cmd2 = view.getUint32(offs + 4, true);
            offs += 8;
            var cmdType = cmd1 >> 24;
            if (cmdType == HeaderCommands.End)
                break;
            switch (cmdType) {
                case HeaderCommands.Rooms:
                    var nRooms = (cmd1 >> 16) & 0xFF;
                    zsi.rooms = readRooms(buffer, nRooms, cmd2);
                    break;
                case HeaderCommands.Mesh:
                    zsi.mesh = readMesh(buffer, cmd2);
                    break;
                case HeaderCommands.Collision:
                    zsi.collision = readCollision(buffer, cmd2);
                    break;
            }
        }
        return zsi;
    }
    function parse(buffer) {
        util_23.assert(util_23.readString(buffer, 0x00, 0x04) === 'ZSI\x01');
        var name = util_23.readString(buffer, 0x04, 0x0C);
        // ZSI header is done. It's that simple! Now for the actual data.
        var headersBuf = buffer.slice(0x10);
        return readHeaders(headersBuf);
    }
    exports_39("parse", parse);
    var CMB, util_23, ZSI, HeaderCommands, Mesh;
    return {
        setters: [
            function (CMB_1) {
                CMB = CMB_1;
            },
            function (util_23_1) {
                util_23 = util_23_1;
            }
        ],
        execute: function () {
            ZSI = /** @class */ (function () {
                function ZSI() {
                }
                return ZSI;
            }());
            exports_39("ZSI", ZSI);
            // Subset of Z64 command types.
            (function (HeaderCommands) {
                HeaderCommands[HeaderCommands["Collision"] = 3] = "Collision";
                HeaderCommands[HeaderCommands["Rooms"] = 4] = "Rooms";
                HeaderCommands[HeaderCommands["Mesh"] = 10] = "Mesh";
                HeaderCommands[HeaderCommands["End"] = 20] = "End";
            })(HeaderCommands || (HeaderCommands = {}));
            Mesh = /** @class */ (function () {
                function Mesh() {
                }
                return Mesh;
            }());
            exports_39("Mesh", Mesh);
        }
    };
});
System.register("oot3d/render", ["oot3d/cmb", "oot3d/zsi", "Progressable", "render", "util"], function (exports_40, context_40) {
    "use strict";
    var __moduleName = context_40 && context_40.id;
    function textureToCanvas(texture) {
        var canvas = document.createElement("canvas");
        canvas.width = texture.width;
        canvas.height = texture.height;
        canvas.title = texture.name;
        var ctx = canvas.getContext("2d");
        var imgData = ctx.createImageData(canvas.width, canvas.height);
        for (var i = 0; i < imgData.data.length; i++)
            imgData.data[i] = texture.pixels[i];
        ctx.putImageData(imgData, 0, 0);
        var surfaces = [canvas];
        return { name: texture.name, surfaces: surfaces };
    }
    function dirname(path) {
        var parts = path.split('/');
        parts.pop();
        return parts.join('/');
    }
    var CMB, ZSI, Progressable_5, render_17, util_24, OoT3D_Program, Scene, MultiScene, SceneDesc;
    return {
        setters: [
            function (CMB_2) {
                CMB = CMB_2;
            },
            function (ZSI_1) {
                ZSI = ZSI_1;
            },
            function (Progressable_5_1) {
                Progressable_5 = Progressable_5_1;
            },
            function (render_17_1) {
                render_17 = render_17_1;
            },
            function (util_24_1) {
                util_24 = util_24_1;
            }
        ],
        execute: function () {
            OoT3D_Program = /** @class */ (function (_super) {
                __extends(OoT3D_Program, _super);
                function OoT3D_Program() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.vert = "\nprecision mediump float;\n\nuniform mat4 u_modelView;\nuniform mat4 u_localMatrix;\nuniform mat4 u_projection;\nuniform float u_posScale;\nuniform float u_uvScale;\nlayout(location = " + OoT3D_Program.a_position + ") in vec3 a_position;\nlayout(location = " + OoT3D_Program.a_uv + ") in vec2 a_uv;\nlayout(location = " + OoT3D_Program.a_color + ") in vec4 a_color;\nvarying vec4 v_color;\nvarying vec2 v_uv;\n\nvoid main() {\n    gl_Position = u_projection * u_modelView * vec4(a_position, 1.0) * u_posScale;\n    v_color = a_color;\n    v_uv = a_uv * u_uvScale;\n    v_uv.t = 1.0 - v_uv.t;\n}";
                    _this.frag = "\nprecision mediump float;\nvarying vec2 v_uv;\nvarying vec4 v_color;\nuniform sampler2D u_texture;\nuniform bool u_alphaTest;\n\nvoid main() {\n    gl_FragColor = texture2D(u_texture, v_uv);\n    gl_FragColor *= v_color;\n    if (u_alphaTest && gl_FragColor.a <= 0.8)\n        discard;\n}";
                    return _this;
                }
                OoT3D_Program.prototype.bind = function (gl, prog) {
                    _super.prototype.bind.call(this, gl, prog);
                    this.posScaleLocation = gl.getUniformLocation(prog, "u_posScale");
                    this.uvScaleLocation = gl.getUniformLocation(prog, "u_uvScale");
                    this.alphaTestLocation = gl.getUniformLocation(prog, "u_alphaTest");
                };
                OoT3D_Program.a_position = 0;
                OoT3D_Program.a_color = 1;
                OoT3D_Program.a_uv = 2;
                return OoT3D_Program;
            }(render_17.Program));
            Scene = /** @class */ (function () {
                function Scene(gl, zsi) {
                    this.program = new OoT3D_Program();
                    this.textures = zsi.mesh.textures.map(function (texture) {
                        return textureToCanvas(texture);
                    });
                    this.zsi = zsi;
                    this.arena = new render_17.RenderArena();
                    this.model = this.translateModel(gl, zsi.mesh);
                }
                Scene.prototype.render = function (state) {
                    var gl = state.gl;
                    state.useProgram(this.program);
                    state.bindModelView();
                    this.model(state);
                };
                Scene.prototype.translateDataType = function (gl, dataType) {
                    switch (dataType) {
                        case CMB.DataType.Byte: return gl.BYTE;
                        case CMB.DataType.UByte: return gl.UNSIGNED_BYTE;
                        case CMB.DataType.Short: return gl.SHORT;
                        case CMB.DataType.UShort: return gl.UNSIGNED_SHORT;
                        case CMB.DataType.Int: return gl.INT;
                        case CMB.DataType.UInt: return gl.UNSIGNED_INT;
                        case CMB.DataType.Float: return gl.FLOAT;
                        default: throw new Error();
                    }
                };
                Scene.prototype.dataTypeSize = function (dataType) {
                    switch (dataType) {
                        case CMB.DataType.Byte: return 1;
                        case CMB.DataType.UByte: return 1;
                        case CMB.DataType.Short: return 2;
                        case CMB.DataType.UShort: return 2;
                        case CMB.DataType.Int: return 4;
                        case CMB.DataType.UInt: return 4;
                        case CMB.DataType.Float: return 4;
                        default: throw new Error();
                    }
                };
                Scene.prototype.translateSepd = function (gl, cmbContext, sepd) {
                    var _this = this;
                    var vao = this.arena.createVertexArray(gl);
                    gl.bindVertexArray(vao);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cmbContext.idxBuffer);
                    gl.bindBuffer(gl.ARRAY_BUFFER, cmbContext.posBuffer);
                    gl.vertexAttribPointer(OoT3D_Program.a_position, 3, this.translateDataType(gl, sepd.posType), false, 0, sepd.posStart);
                    gl.bindBuffer(gl.ARRAY_BUFFER, cmbContext.colBuffer);
                    gl.vertexAttribPointer(OoT3D_Program.a_color, 4, this.translateDataType(gl, sepd.colType), true, 0, sepd.colStart);
                    gl.bindBuffer(gl.ARRAY_BUFFER, cmbContext.txcBuffer);
                    gl.vertexAttribPointer(OoT3D_Program.a_uv, 2, this.translateDataType(gl, sepd.txcType), false, 0, sepd.txcStart);
                    gl.enableVertexAttribArray(OoT3D_Program.a_position);
                    gl.enableVertexAttribArray(OoT3D_Program.a_color);
                    gl.enableVertexAttribArray(OoT3D_Program.a_uv);
                    gl.bindVertexArray(null);
                    return function () {
                        gl.uniform1f(_this.program.uvScaleLocation, sepd.txcScale);
                        gl.uniform1f(_this.program.posScaleLocation, sepd.posScale);
                        gl.bindVertexArray(vao);
                        try {
                            for (var _a = __values(sepd.prms), _b = _a.next(); !_b.done; _b = _a.next()) {
                                var prm = _b.value;
                                gl.drawElements(gl.TRIANGLES, prm.count, _this.translateDataType(gl, prm.indexType), prm.offset * _this.dataTypeSize(prm.indexType));
                            }
                        }
                        catch (e_36_1) { e_36 = { error: e_36_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_36) throw e_36.error; }
                        }
                        gl.bindVertexArray(null);
                        var e_36, _c;
                    };
                };
                Scene.prototype.translateTexture = function (gl, texture) {
                    var texId = this.arena.createTexture(gl);
                    gl.bindTexture(gl.TEXTURE_2D, texId);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texture.width, texture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, texture.pixels);
                    return texId;
                };
                Scene.prototype.translateMaterial = function (gl, cmbContext, material) {
                    var _this = this;
                    function translateWrapMode(wrapMode) {
                        switch (wrapMode) {
                            case CMB.TextureWrapMode.CLAMP: return gl.CLAMP_TO_EDGE;
                            case CMB.TextureWrapMode.REPEAT: return gl.REPEAT;
                            default: throw new Error();
                        }
                    }
                    function translateTextureFilter(filter) {
                        switch (filter) {
                            case CMB.TextureFilter.LINEAR: return gl.LINEAR;
                            case CMB.TextureFilter.NEAREST: return gl.NEAREST;
                            case CMB.TextureFilter.LINEAR_MIPMAP_LINEAR: return gl.NEAREST;
                            case CMB.TextureFilter.LINEAR_MIPMAP_NEAREST: return gl.NEAREST;
                            case CMB.TextureFilter.NEAREST_MIPMAP_NEAREST: return gl.NEAREST;
                            case CMB.TextureFilter.NEAREST_MIPMIP_LINEAR: return gl.NEAREST;
                            default: throw new Error();
                        }
                    }
                    return function () {
                        for (var i = 0; i < 1; i++) {
                            var binding = material.textureBindings[i];
                            if (binding.textureIdx === -1)
                                continue;
                            gl.uniform1i(_this.program.alphaTestLocation, material.alphaTestEnable ? 1 : 0);
                            gl.activeTexture(gl.TEXTURE0 + i);
                            gl.bindTexture(gl.TEXTURE_2D, cmbContext.textures[binding.textureIdx]);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, translateTextureFilter(binding.minFilter));
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, translateTextureFilter(binding.magFilter));
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, translateWrapMode(binding.wrapS));
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, translateWrapMode(binding.wrapT));
                        }
                    };
                };
                Scene.prototype.translateMesh = function (gl, cmbContext, mesh) {
                    var mat = cmbContext.matFuncs[mesh.matsIdx];
                    var sepd = cmbContext.sepdFuncs[mesh.sepdIdx];
                    return function () {
                        mat(mesh);
                        sepd();
                    };
                };
                Scene.prototype.translateCmb = function (gl, cmb) {
                    var _this = this;
                    if (!cmb)
                        return function () { };
                    var posBuffer = this.arena.createBuffer(gl);
                    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, cmb.vertexBufferSlices.posBuffer.castToBuffer(), gl.STATIC_DRAW);
                    var colBuffer = this.arena.createBuffer(gl);
                    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, cmb.vertexBufferSlices.colBuffer.castToBuffer(), gl.STATIC_DRAW);
                    var nrmBuffer = this.arena.createBuffer(gl);
                    gl.bindBuffer(gl.ARRAY_BUFFER, nrmBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, cmb.vertexBufferSlices.nrmBuffer.castToBuffer(), gl.STATIC_DRAW);
                    var txcBuffer = this.arena.createBuffer(gl);
                    gl.bindBuffer(gl.ARRAY_BUFFER, txcBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, cmb.vertexBufferSlices.txcBuffer.castToBuffer(), gl.STATIC_DRAW);
                    var textures = cmb.textures.map(function (texture) {
                        return _this.translateTexture(gl, texture);
                    });
                    var idxBuffer = this.arena.createBuffer(gl);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cmb.indexBuffer.castToBuffer(), gl.STATIC_DRAW);
                    var cmbContext = {
                        posBuffer: posBuffer,
                        colBuffer: colBuffer,
                        nrmBuffer: nrmBuffer,
                        txcBuffer: txcBuffer,
                        idxBuffer: idxBuffer,
                        textures: textures,
                    };
                    cmbContext.sepdFuncs = cmb.sepds.map(function (sepd) { return _this.translateSepd(gl, cmbContext, sepd); });
                    cmbContext.matFuncs = cmb.materials.map(function (material) { return _this.translateMaterial(gl, cmbContext, material); });
                    var meshFuncs = cmb.meshs.map(function (mesh) { return _this.translateMesh(gl, cmbContext, mesh); });
                    return function () {
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
                        try {
                            for (var meshFuncs_1 = __values(meshFuncs), meshFuncs_1_1 = meshFuncs_1.next(); !meshFuncs_1_1.done; meshFuncs_1_1 = meshFuncs_1.next()) {
                                var func = meshFuncs_1_1.value;
                                func();
                            }
                        }
                        catch (e_37_1) { e_37 = { error: e_37_1 }; }
                        finally {
                            try {
                                if (meshFuncs_1_1 && !meshFuncs_1_1.done && (_a = meshFuncs_1.return)) _a.call(meshFuncs_1);
                            }
                            finally { if (e_37) throw e_37.error; }
                        }
                        var e_37, _a;
                    };
                };
                Scene.prototype.translateModel = function (gl, mesh) {
                    var opaque = this.translateCmb(gl, mesh.opaque);
                    var transparent = this.translateCmb(gl, mesh.transparent);
                    var renderFlags = new render_17.RenderFlags();
                    renderFlags.blendMode = render_17.BlendMode.ADD;
                    renderFlags.depthTest = true;
                    renderFlags.cullMode = render_17.CullMode.BACK;
                    return function (state) {
                        state.useFlags(renderFlags);
                        opaque();
                        transparent();
                    };
                };
                Scene.prototype.destroy = function (gl) {
                    this.arena.destroy(gl);
                };
                return Scene;
            }());
            MultiScene = /** @class */ (function () {
                function MultiScene(scenes) {
                    this.scenes = scenes;
                    this.textures = [];
                    try {
                        for (var _a = __values(this.scenes), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var scene = _b.value;
                            this.textures = this.textures.concat(scene.textures);
                        }
                    }
                    catch (e_38_1) { e_38 = { error: e_38_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_38) throw e_38.error; }
                    }
                    var e_38, _c;
                }
                MultiScene.prototype.render = function (renderState) {
                    this.scenes.forEach(function (scene) {
                        scene.render(renderState);
                    });
                };
                MultiScene.prototype.destroy = function (gl) {
                    this.scenes.forEach(function (scene) { return scene.destroy(gl); });
                };
                return MultiScene;
            }());
            SceneDesc = /** @class */ (function () {
                function SceneDesc(name, path) {
                    this.name = name;
                    this.path = path;
                    this.id = this.path;
                }
                SceneDesc.prototype.createScene = function (gl) {
                    var _this = this;
                    return util_24.fetch(this.path).then(function (result) {
                        return _this._createSceneFromData(gl, result);
                    });
                };
                SceneDesc.prototype._createRoomSceneFromData = function (gl, result) {
                    var zsi = ZSI.parse(result);
                    util_24.assert(zsi.mesh !== null);
                    return new Progressable_5.default(Promise.resolve(new Scene(gl, zsi)));
                };
                SceneDesc.prototype._createSceneFromData = function (gl, result) {
                    var _this = this;
                    var zsi = ZSI.parse(result);
                    util_24.assert(zsi.rooms !== null);
                    var basePath = dirname(this.path);
                    var roomFilenames = zsi.rooms.map(function (romPath) {
                        var filename = romPath.split('/').pop();
                        return basePath + '/' + filename;
                    });
                    return Progressable_5.default.all(roomFilenames.map(function (filename) {
                        return util_24.fetch(filename).then(function (roomResult) { return _this._createRoomSceneFromData(gl, roomResult); });
                    })).then(function (scenes) {
                        return new MultiScene(scenes);
                    });
                };
                return SceneDesc;
            }());
            exports_40("SceneDesc", SceneDesc);
        }
    };
});
System.register("oot3d/scenes", ["oot3d/render"], function (exports_41, context_41) {
    "use strict";
    var __moduleName = context_41 && context_41.id;
    var render_18, id, name, sceneDescs, sceneGroup;
    return {
        setters: [
            function (render_18_1) {
                render_18 = render_18_1;
            }
        ],
        execute: function () {
            id = "oot3d";
            name = "Ocarina of Time 3D";
            sceneDescs = [
                { name: "Inside the Deku Tree", filename: "ydan_info.zsi" },
                { name: "Inside the Deku Tree (Boss)", filename: "ydan_boss_info.zsi" },
                { name: "Dodongo's Cavern", filename: "ddan_info.zsi" },
                { name: "Dodongo's Cavern (Boss)", filename: "ddan_boss_info.zsi" },
                { name: "Jabu-Jabu's Belly", filename: 'bdan_info.zsi' },
                { name: "Jabu-Jabu's Belly (Boss)", filename: 'bdan_boss_info.zsi' },
                { name: "Forest Temple", filename: 'bmori1_info.zsi' },
                { name: "Forest Temple (Boss)", filename: "moriboss_info.zsi" },
                { name: "Fire Temple", filename: "hidan_info.zsi" },
                { name: "Fire Temple (Boss)", filename: "fire_bs_info.zsi" },
                { name: "Water Temple", filename: "mizusin_info.zsi" },
                { name: "Water Temple (Boss)", filename: "mizusin_boss_info.zsi" },
                { name: "Spirit Temple", filename: "jyasinzou_info.zsi" },
                { name: "Spirit Temple (Mid-Boss)", filename: "jyasinzou_boss_info.zsi" },
                { name: "Shadow Temple", filename: "hakadan_info.zsi" },
                { name: "Shadow Temple (Boss)", filename: "hakadan_boss_info.zsi" },
                { name: "Bottom of the Well", filename: "hakadan_ch_info.zsi" },
                { name: "Ice Cavern", filename: "ice_doukutu_info.zsi" },
                { name: "Gerudo Training Grounds", filename: "men_info.zsi" },
                { name: "Thieve's Hideout", filename: "gerudoway_info.zsi" },
                { name: "Ganon's Castle", filename: "ganontika_info.zsi" },
                { name: "Ganon's Castle (Crumbling)", filename: "ganontikasonogo_info.zsi" },
                { name: "Ganon's Castle (Outside)", filename: "ganon_tou_info.zsi" },
                { name: "Ganon's Castle Tower", filename: "ganon_info.zsi" },
                { name: "Ganon's Castle Tower (Crumbling)", filename: "ganon_sonogo_info.zsi" },
                { name: "Second-To-Last Boss Ganondorf", filename: "ganon_boss_info.zsi" },
                { name: "Final Battle Against Ganon", filename: "ganon_demo_info.zsi" },
                { name: "Ganondorf's Death", filename: "ganon_final_info.zsi" },
                { name: "Hyrule Field", filename: "spot00_info.zsi" },
                { name: "Kakariko Village", filename: "spot01_info.zsi" },
                { name: "Kakariko Graveyard", filename: "spot02_info.zsi" },
                { name: "Zora's River", filename: "spot03_info.zsi" },
                { name: "Kokiri Firest", filename: "spot04_info.zsi" },
                { name: "Sacred Forest Meadow", filename: "spot05_info.zsi" },
                { name: "Lake Hylia", filename: "spot06_info.zsi" },
                { name: "Zora's Domain", filename: "spot07_info.zsi" },
                { name: "Zora's Fountain", filename: "spot08_info.zsi" },
                { name: "Gerudo Valley", filename: "spot09_info.zsi" },
                { name: "Lost Woods", filename: "spot10_info.zsi" },
                { name: "Desert Colossus", filename: "spot11_info.zsi" },
                { name: "Gerudo's Fortress", filename: "spot12_info.zsi" },
                { name: "Haunted Wasteland", filename: "spot13_info.zsi" },
                { name: "Hyrule Castle", filename: "spot15_info.zsi" },
                { name: "Death Mountain", filename: "spot16_info.zsi" },
                { name: "Death Mountain Crater", filename: "spot17_info.zsi" },
                { name: "Goron City", filename: "spot18_info.zsi" },
                { name: "Lon Lon Ranch", filename: "spot20_info.zsi" },
                { name: "", filename: "spot99_info.zsi" },
                { name: "Market Entrance (Day)", filename: "entra_day_info.zsi" },
                { name: "Market Entrance (Night)", filename: "entra_night_info.zsi" },
                { name: "Market Entrance (Ruins)", filename: "entra_ruins_info.zsi" },
                { name: "Market (Day)", filename: "market_day_info.zsi" },
                { name: "Market (Night)", filename: "market_night_info.zsi" },
                { name: "Market (Ruins)", filename: "market_ruins_info.zsi" },
                { name: "Market Back-Alley (Day)", filename: "market_alley_info.zsi" },
                { name: "Market Back-Alley (Night)", filename: "market_alley_n_info.zsi" },
                { name: "Lots'o'Pots", filename: "miharigoya_info.zsi" },
                { name: "Bombchu Bowling Alley", filename: 'bowling_info.zsi' },
                { name: "Temple of Time (Outside, Day)", filename: "shrine_info.zsi" },
                { name: "Temple of Time (Outside, Night)", filename: "shrine_n_info.zsi" },
                { name: "Temple of Time (Outside, Adult)", filename: "shrine_r_info.zsi" },
                { name: "Temple of Time (Interior)", filename: "tokinoma_info.zsi" },
                { name: "Chamber of Sages", filename: "kenjyanoma_info.zsi" },
                { name: "Zora Shop", filename: "zoora_info.zsi" },
                { name: "Dampe's Hut", filename: "hut_info.zsi" },
                { name: "Great Fairy Fountain", filename: "daiyousei_izumi_info.zsi" },
                { name: "Small Fairy Fountain", filename: "yousei_izumi_tate_info.zsi" },
                { name: "Magic Fairy Fountain", filename: "yousei_izumi_yoko_info.zsi" },
                { name: "Castle Courtyard", filename: "hairal_niwa_info.zsi" },
                { name: "Castle Courtyard (Night)", filename: "hairal_niwa_n_info.zsi" },
                { name: '', filename: "hakaana_info.zsi" },
                { name: "Grottos", filename: "kakusiana_info.zsi" },
                { name: "Royal Family's Tomb", filename: "hakaana_ouke_info.zsi" },
                { name: "Dampe's Grave & Windmill Hut", filename: "hakasitarelay_info.zsi" },
                { name: "Cutscene Map", filename: "hiral_demo_info.zsi" },
                { name: "Hylia Lakeside Laboratory", filename: "hylia_labo_info.zsi" },
                { name: "Puppy Woman's House", filename: "kakariko_impa_info.zsi" },
                { name: "Skulltula House", filename: "kinsuta_info.zsi" },
                { name: "Impa's House", filename: "labo_info.zsi" },
                { name: "Granny's Potion Shop", filename: "mahouya_info.zsi" },
                { name: "Zelda's Courtyard", filename: "nakaniwa_info.zsi" },
                { name: "Market Potion Shop", filename: "shop_alley_info.zsi" },
                { name: "Kakariko Potion Shop", filename: "shop_drag_info.zsi" },
                { name: "Happy Mask Shop", filename: "shop_face_info.zsi" },
                { name: "Goron Shop", filename: "shop_golon_info.zsi" },
                { name: "Bombchu Shop", filename: "shop_night_info.zsi" },
                { name: "Talon's House", filename: "souko_info.zsi" },
                { name: "Stables", filename: "stable_info.zsi" },
                { name: "Shooting Gallery", filename: "syatekijyou_info.zsi" },
                { name: "Treasure Chest Game", filename: "takaraya_info.zsi" },
                { name: "Carpenter's Tent", filename: "tent_info.zsi" },
                { name: '', filename: "k_home_info.zsi" },
                { name: '', filename: "kakariko_info.zsi" },
                { name: '', filename: "kokiri_info.zsi" },
                { name: '', filename: "link_info.zsi" },
                { name: '', filename: "shop_info.zsi" },
                { name: "Fishing Pond", filename: "turibori_info.zsi" },
            ].map(function (entry) {
                var path = "data/oot3d/" + entry.filename;
                var name = entry.name || entry.filename;
                return new render_18.SceneDesc(name, path);
            });
            exports_41("sceneGroup", sceneGroup = { id: id, name: name, sceneDescs: sceneDescs });
        }
    };
});
System.register("fres/gx2_enum", [], function (exports_42, context_42) {
    "use strict";
    var __moduleName = context_42 && context_42.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("fres/gx2_surface", ["util"], function (exports_43, context_43) {
    "use strict";
    var __moduleName = context_43 && context_43.id;
    function parseGX2Surface(buffer, gx2SurfaceOffs) {
        var view = buffer.slice(gx2SurfaceOffs, gx2SurfaceOffs + 0x9C).createDataView();
        var dimension = view.getUint32(0x00, false);
        util_25.assert(dimension === 1 /* _2D */);
        var width = view.getUint32(0x04, false);
        var height = view.getUint32(0x08, false);
        var depth = view.getUint32(0x0C, false);
        var numMips = view.getUint32(0x10, false);
        var format = view.getUint32(0x14, false);
        var aaMode = view.getUint32(0x18, false);
        var texDataSize = view.getUint32(0x20, false);
        var mipDataSize = view.getUint32(0x28, false);
        var tileMode = view.getUint32(0x30, false);
        var swizzle = view.getUint32(0x34, false);
        var align = view.getUint32(0x38, false);
        var pitch = view.getUint32(0x3C, false);
        var mipDataOffsetTableIdx = 0x40;
        var mipDataOffsets = [];
        for (var i = 0; i < 13; i++) {
            mipDataOffsets.push(view.getUint32(mipDataOffsetTableIdx, false));
            mipDataOffsetTableIdx += 0x04;
        }
        var surface = { format: format, tileMode: tileMode, swizzle: swizzle, width: width, height: height, depth: depth, pitch: pitch, numMips: numMips, aaMode: aaMode, texDataSize: texDataSize, mipDataSize: mipDataSize, mipDataOffsets: mipDataOffsets };
        return surface;
    }
    exports_43("parseGX2Surface", parseGX2Surface);
    var util_25;
    return {
        setters: [
            function (util_25_1) {
                util_25 = util_25_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("worker_util", [], function (exports_44, context_44) {
    "use strict";
    var __moduleName = context_44 && context_44.id;
    function makeWorkerFromSource(sources) {
        var blob = new Blob(sources, { type: 'application/javascript' });
        var url = window.URL.createObjectURL(blob);
        var w = new Worker(url);
        window.URL.revokeObjectURL(url);
        return w;
    }
    exports_44("makeWorkerFromSource", makeWorkerFromSource);
    var WorkerManager, WorkerPool;
    return {
        setters: [],
        execute: function () {
            WorkerManager = /** @class */ (function () {
                function WorkerManager(worker) {
                    this.worker = worker;
                    this.currentRequest = null;
                    this.worker.onmessage = this._workerOnMessage.bind(this);
                }
                WorkerManager.prototype._workerOnMessage = function (e) {
                    var resp = e.data;
                    this.currentRequest.resolve(resp);
                    this.currentRequest = null;
                    this.onworkerdone();
                };
                WorkerManager.prototype.execute = function (req) {
                    this.currentRequest = req;
                    this.worker.postMessage(req.request);
                };
                WorkerManager.prototype.isFree = function () {
                    return this.currentRequest === null;
                };
                WorkerManager.prototype.terminate = function () {
                    return this.worker.terminate();
                };
                return WorkerManager;
            }());
            WorkerPool = /** @class */ (function () {
                function WorkerPool(workerConstructor, numWorkers) {
                    if (numWorkers === void 0) { numWorkers = 8; }
                    this.workerConstructor = workerConstructor;
                    this.numWorkers = numWorkers;
                    this.outstandingRequests = [];
                    this.workers = [];
                }
                WorkerPool.prototype.terminate = function () {
                    try {
                        for (var _a = __values(this.workers), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var worker = _b.value;
                            worker.terminate();
                        }
                    }
                    catch (e_39_1) { e_39 = { error: e_39_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_39) throw e_39.error; }
                    }
                    this.workers = [];
                    var e_39, _c;
                };
                WorkerPool.prototype.build = function () {
                    if (this.workers.length > 0)
                        return;
                    var numWorkers = this.numWorkers;
                    while (numWorkers--) {
                        var manager = new WorkerManager(this.workerConstructor());
                        manager.onworkerdone = this._onWorkerDone.bind(this);
                        this.workers.push(manager);
                    }
                };
                WorkerPool.prototype.execute = function (request) {
                    this.build();
                    var resolve;
                    var p = new Promise(function (resolve_, reject) {
                        resolve = resolve_;
                    });
                    var workerManagerRequest = { request: request, resolve: resolve };
                    this.insertRequest(workerManagerRequest);
                    this.pumpQueue();
                    return p;
                };
                WorkerPool.prototype.insertRequest = function (workerManagerRequest) {
                    var i;
                    for (i = 0; i < this.outstandingRequests.length; i++) {
                        if (this.outstandingRequests[i].request.priority > workerManagerRequest.request.priority)
                            break;
                    }
                    this.outstandingRequests.splice(i, 0, workerManagerRequest);
                };
                WorkerPool.prototype.pumpQueue = function () {
                    try {
                        for (var _a = __values(this.workers), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var worker = _b.value;
                            if (this.outstandingRequests.length === 0)
                                return;
                            if (worker.isFree()) {
                                var req = this.outstandingRequests.shift();
                                worker.execute(req);
                            }
                        }
                    }
                    catch (e_40_1) { e_40 = { error: e_40_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_40) throw e_40.error; }
                    }
                    var e_40, _c;
                };
                WorkerPool.prototype._onWorkerDone = function () {
                    this.pumpQueue();
                };
                return WorkerPool;
            }());
            exports_44("WorkerPool", WorkerPool);
        }
    };
});
System.register("fres/gx2_swizzle", ["worker_util"], function (exports_45, context_45) {
    "use strict";
    var __moduleName = context_45 && context_45.id;
    // This is all contained in one function in order to make it easier to Worker-ize.
    function _deswizzle(inSurface, srcBuffer, mipLevel) {
        var numPipes = 2;
        var numBanks = 4;
        var microTileWidth = 8;
        var microTileHeight = 8;
        var macroTileWidth = 8 * numBanks;
        var macroTileHeight = 8 * numPipes;
        var microTilePixels = microTileWidth * microTileHeight;
        var pipeInterleaveBytes = 256;
        var numPipeBits = 1;
        var numBankBits = 2;
        var numGroupBits = 8;
        var rowSize = 2048;
        var swapSize = 256;
        var splitSize = 2048;
        function memcpy(dst, dstOffs, src, srcOffs, length) {
            dst.set(new Uint8Array(src, srcOffs, length), dstOffs);
        }
        function alignPow2(n) {
            var x = 1;
            while (x < n)
                x *= 2;
            return x;
        }
        function align(n, multiple) {
            var mask = (multiple - 1);
            return (n + mask) & ~mask;
        }
        function computeSurfaceMipLevelTileMode(surface, mipLevel) {
            // Level starts at 0.
            if (mipLevel > 0) {
                surface.width = Math.max(alignPow2(surface.width >> mipLevel), 1);
                surface.pitch = Math.max(alignPow2(surface.pitch >> mipLevel), 1);
                surface.height = Math.max(alignPow2(surface.height >> mipLevel), 1);
                var numSamples = 1 << surface.aaMode;
                var thickness = computeSurfaceThickness(surface.tileMode);
                var bytesPerBlock_1 = computeSurfaceBytesPerBlock(surface.format);
                var microTileThickness = computeSurfaceThickness(surface.tileMode);
                var bytesPerSample = bytesPerBlock_1 * microTileThickness * microTilePixels;
                var microTileBytes = bytesPerSample * numSamples;
                var pitchAlignFactor = Math.max(pipeInterleaveBytes / microTileBytes, 1) | 0;
                var macroTileHeightBlocks = macroTileHeight * computeSurfaceBlockWidth(surface.format);
                if (surface.tileMode === 4 /* _2D_TILED_THIN1 */ && (surface.pitch < pitchAlignFactor * macroTileWidth || surface.height < macroTileHeightBlocks))
                    surface.tileMode = 2 /* _1D_TILED_THIN1 */;
            }
        }
        function computePipeFromCoordWoRotation(x, y) {
            // NumPipes = 2
            var x3 = (x >>> 3) & 1;
            var y3 = (y >>> 3) & 1;
            var pipeBit0 = (y3 ^ x3);
            return (pipeBit0 << 0);
        }
        function computeBankFromCoordWoRotation(x, y) {
            var ty = (y / numPipes) | 0;
            var x3 = (x >>> 3) & 1;
            var x4 = (x >>> 4) & 1;
            var ty3 = (ty >>> 3) & 1;
            var ty4 = (ty >>> 4) & 1;
            var p0 = ty4 ^ x3;
            var p1 = ty3 ^ x4;
            return (p1 << 1) | (p0 << 0);
        }
        function computeSurfaceThickness(tileMode) {
            switch (tileMode) {
                case 2 /* _1D_TILED_THIN1 */:
                case 4 /* _2D_TILED_THIN1 */:
                    return 1;
            }
        }
        function computeSurfaceBlockWidth(format) {
            switch (format & 63 /* FMT_MASK */) {
                case 49 /* FMT_BC1 */:
                case 51 /* FMT_BC3 */:
                case 52 /* FMT_BC4 */:
                case 53 /* FMT_BC5 */:
                    return 4;
                default:
                    return 1;
            }
        }
        function computeSurfaceBytesPerBlock(format) {
            switch (format & 63 /* FMT_MASK */) {
                case 49 /* FMT_BC1 */:
                case 52 /* FMT_BC4 */:
                    return 8;
                case 51 /* FMT_BC3 */:
                case 53 /* FMT_BC5 */:
                    return 16;
                // For non-block formats, a "block" is a pixel.
                case 26 /* FMT_TCS_R8_G8_B8_A8 */:
                    return 4;
                default:
                    throw new Error("Unsupported surface format " + format);
            }
        }
        function computePixelIndexWithinMicroTile(x, y, bytesPerBlock) {
            var x0 = (x >>> 0) & 1;
            var x1 = (x >>> 1) & 1;
            var x2 = (x >>> 2) & 1;
            var y0 = (y >>> 0) & 1;
            var y1 = (y >>> 1) & 1;
            var y2 = (y >>> 2) & 1;
            var pixelBits;
            if (bytesPerBlock === 8) {
                pixelBits = [y2, y1, x2, x1, y0, x0];
            }
            else if (bytesPerBlock === 16) {
                pixelBits = [y2, y1, x2, x1, x0, y0];
            }
            else if (bytesPerBlock === 4) {
                pixelBits = [y2, y1, y0, x2, x1, x0];
            }
            else {
                throw new Error("Invalid bpp");
            }
            var p5 = pixelBits[0];
            var p4 = pixelBits[1];
            var p3 = pixelBits[2];
            var p2 = pixelBits[3];
            var p1 = pixelBits[4];
            var p0 = pixelBits[5];
            return (p5 << 5) | (p4 << 4) | (p3 << 3) | (p2 << 2) | (p1 << 1) | (p0 << 0);
        }
        function computeSurfaceRotationFromTileMode(tileMode) {
            switch (tileMode) {
                case 4 /* _2D_TILED_THIN1 */:
                    return numPipes * ((numBanks >> 1) - 1);
                default:
                    throw new Error("Unsupported tile mode " + tileMode);
            }
        }
        function computeTileModeAspectRatio(tileMode) {
            switch (tileMode) {
                case 4 /* _2D_TILED_THIN1 */:
                    return 1;
                default:
                    throw new Error("Unsupported tile mode " + tileMode);
            }
        }
        function computeMacroTilePitch(tileMode) {
            return macroTileWidth / computeTileModeAspectRatio(tileMode);
        }
        function computeMacroTileHeight(tileMode) {
            return macroTileHeight / computeTileModeAspectRatio(tileMode);
        }
        function computeSurfaceAddrFromCoordMicroTiled(x, y, surface) {
            // XXX(jstpierre): 3D Textures
            var slice = 0;
            var bytesPerBlock = computeSurfaceBytesPerBlock(surface.format);
            var microTileThickness = computeSurfaceThickness(surface.tileMode);
            var microTileBytes = bytesPerBlock * microTileThickness * microTilePixels;
            var microTilesPerRow = surface.pitch / microTileWidth;
            var microTileIndexX = (x / microTileWidth) | 0;
            var microTileIndexY = (y / microTileHeight) | 0;
            var microTileIndexZ = (slice / microTileThickness) | 0;
            var microTileOffset = microTileBytes * (microTileIndexX + microTileIndexY * microTilesPerRow);
            var sliceBytes = surface.pitch * surface.height * microTileThickness * bytesPerBlock;
            var sliceOffset = microTileIndexZ * sliceBytes;
            var pixelIndex = computePixelIndexWithinMicroTile(x, y, bytesPerBlock);
            var pixelOffset = bytesPerBlock * pixelIndex;
            return pixelOffset + microTileOffset + sliceOffset;
        }
        function computeSurfaceAddrFromCoordMacroTiled(x, y, surface) {
            // XXX(jstpierre): AA textures
            var sample = 0;
            // XXX(jstpierre): 3D Textures
            var slice = 0;
            var numSamples = 1 << surface.aaMode;
            var pipeSwizzle = (surface.swizzle >> 8) & 0x01;
            var bankSwizzle = (surface.swizzle >> 9) & 0x03;
            var bytesPerBlock = computeSurfaceBytesPerBlock(surface.format);
            var microTileThickness = computeSurfaceThickness(surface.tileMode);
            var bytesPerSample = bytesPerBlock * microTileThickness * microTilePixels;
            var microTileBytes = bytesPerSample * numSamples;
            var isSamplesSplit = numSamples > 1 && (microTileBytes > splitSize);
            var samplesPerSlice = Math.max(isSamplesSplit ? (splitSize / bytesPerSample) : numSamples, 1);
            var numSampleSplits = isSamplesSplit ? (numSamples / samplesPerSlice) : 1;
            var numSurfaceSamples = isSamplesSplit ? samplesPerSlice : numSamples;
            var rotation = computeSurfaceRotationFromTileMode(surface.tileMode);
            var macroTilePitch = computeMacroTilePitch(surface.tileMode);
            var macroTileHeight = computeMacroTileHeight(surface.tileMode);
            var groupMask = (1 << numGroupBits) - 1;
            var pixelIndex = computePixelIndexWithinMicroTile(x, y, bytesPerBlock);
            var pixelOffset = pixelIndex * bytesPerBlock;
            var sampleOffset = sample * (microTileBytes / numSamples);
            var elemOffset = pixelOffset + sampleOffset;
            var sampleSlice;
            if (isSamplesSplit) {
                var tileSliceBytes = microTileBytes / numSampleSplits;
                sampleSlice = (elemOffset / tileSliceBytes) | 0;
                elemOffset = elemOffset % tileSliceBytes;
            }
            else {
                sampleSlice = 0;
            }
            var pipe1 = computePipeFromCoordWoRotation(x, y);
            var bank1 = computeBankFromCoordWoRotation(x, y);
            var bankPipe = pipe1 + numPipes * bank1;
            var sliceIn = slice / (microTileThickness > 1 ? 4 : 1);
            var swizzle = pipeSwizzle + numPipes * bankSwizzle;
            bankPipe = bankPipe ^ (numPipes * sampleSlice * ((numBanks >> 1) + 1) ^ (swizzle + sliceIn * rotation));
            bankPipe = bankPipe % (numPipes * numBanks);
            var pipe = (bankPipe % numPipes) | 0;
            var bank = (bankPipe / numPipes) | 0;
            var sliceBytes = surface.height * surface.pitch * microTileThickness * bytesPerBlock * numSamples;
            var sliceOffset = sliceBytes * ((sampleSlice / microTileThickness) | 0);
            var numSwizzleBits = numBankBits + numPipeBits;
            var macroTilesPerRow = (surface.pitch / macroTilePitch) | 0;
            var macroTileBytes = (numSamples * microTileThickness * bytesPerBlock * macroTileHeight * macroTilePitch);
            var macroTileIndexX = (x / macroTilePitch) | 0;
            var macroTileIndexY = (y / macroTileHeight) | 0;
            var macroTileOffset = (macroTileIndexX + macroTilesPerRow * macroTileIndexY) * macroTileBytes;
            var totalOffset = (elemOffset + ((macroTileOffset + sliceOffset) >> numSwizzleBits));
            var offsetHigh = (totalOffset & ~groupMask) << numSwizzleBits;
            var offsetLow = (totalOffset & groupMask);
            var pipeBits = pipe << (numGroupBits);
            var bankBits = bank << (numPipeBits + numGroupBits);
            var addr = (bankBits | pipeBits | offsetLow | offsetHigh);
            return addr;
        }
        // Have to spell this thing out the long way...
        var surface = {
            format: inSurface.format,
            tileMode: inSurface.tileMode,
            aaMode: inSurface.aaMode,
            swizzle: inSurface.swizzle,
            width: inSurface.width,
            height: inSurface.height,
            depth: inSurface.depth,
            pitch: inSurface.pitch,
            numMips: inSurface.numMips,
            texDataSize: inSurface.texDataSize,
            mipDataSize: inSurface.mipDataSize,
            mipDataOffsets: inSurface.mipDataOffsets,
        };
        computeSurfaceMipLevelTileMode(surface, mipLevel);
        // For non-BC formats, "block" = 1 pixel.
        var blockSize = computeSurfaceBlockWidth(surface.format);
        var srcWidthBlocks = ((surface.width + blockSize - 1) / blockSize) | 0;
        var srcHeightBlocks = ((surface.height + blockSize - 1) / blockSize) | 0;
        var dstWidth = inSurface.width >>> mipLevel;
        var dstHeight = inSurface.height >>> mipLevel;
        var dstWidthBlocks = ((dstWidth + blockSize - 1) / blockSize) | 0;
        var dstHeightBlocks = ((dstHeight + blockSize - 1) / blockSize) | 0;
        var bytesPerBlock = computeSurfaceBytesPerBlock(surface.format);
        var dst = new Uint8Array(dstWidthBlocks * dstHeightBlocks * bytesPerBlock);
        for (var y = 0; y < dstHeightBlocks; y++) {
            for (var x = 0; x < dstWidthBlocks; x++) {
                var srcIdx = void 0;
                switch (surface.tileMode) {
                    case 2 /* _1D_TILED_THIN1 */:
                        srcIdx = computeSurfaceAddrFromCoordMicroTiled(x, y, surface);
                        break;
                    case 4 /* _2D_TILED_THIN1 */:
                        srcIdx = computeSurfaceAddrFromCoordMacroTiled(x, y, surface);
                        break;
                    default:
                        var tileMode_ = surface.tileMode;
                        throw new Error("Unsupported tile mode " + tileMode_.toString(16));
                }
                var dstIdx = (y * dstWidthBlocks + x) * bytesPerBlock;
                memcpy(dst, dstIdx, srcBuffer, srcIdx, bytesPerBlock);
            }
        }
        var pixels = dst.buffer;
        var width = dstWidth;
        var height = dstHeight;
        return { width: width, height: height, pixels: pixels };
    }
    function deswizzleWorker(global) {
        global.onmessage = function (e) {
            var req = e.data;
            var deswizzledSurface = _deswizzle(req.surface, req.buffer, req.mipLevel);
            global.postMessage(deswizzledSurface, [deswizzledSurface.pixels]);
        };
    }
    function makeDeswizzleWorker() {
        return worker_util_1.makeWorkerFromSource([
            _deswizzle.toString(),
            deswizzleWorker.toString(),
            'deswizzleWorker(this)',
        ]);
    }
    var worker_util_1, Deswizzler, deswizzler;
    return {
        setters: [
            function (worker_util_1_1) {
                worker_util_1 = worker_util_1_1;
            }
        ],
        execute: function () {
            Deswizzler = /** @class */ (function () {
                function Deswizzler() {
                    this.pool = new worker_util_1.WorkerPool(makeDeswizzleWorker);
                }
                Deswizzler.prototype.deswizzle = function (surface, buffer, mipLevel) {
                    var req = { surface: surface, buffer: buffer, mipLevel: mipLevel, priority: mipLevel };
                    return this.pool.execute(req);
                };
                Deswizzler.prototype.terminate = function () {
                    this.pool.terminate();
                };
                Deswizzler.prototype.build = function () {
                    this.pool.build();
                };
                return Deswizzler;
            }());
            exports_45("deswizzler", deswizzler = new Deswizzler());
        }
    };
});
System.register("fres/gx2_texture", ["fres/gx2_swizzle"], function (exports_46, context_46) {
    "use strict";
    var __moduleName = context_46 && context_46.id;
    // #region Texture Decode
    function expand5to8(n) {
        return (n << (8 - 5)) | (n >>> (10 - 8));
    }
    function expand6to8(n) {
        return (n << (8 - 6)) | (n >>> (12 - 8));
    }
    // Use the fast GX approximation.
    function s3tcblend(a, b) {
        // return (a*3 + b*5) / 8;
        return (((a << 1) + a) + ((b << 2) + b)) >>> 3;
    }
    // Software decompresses from standard BC1 (DXT1) to RGBA.
    function decompressBC1Surface(surface) {
        var bytesPerPixel = 4;
        var width = surface.width;
        var height = surface.height;
        var dst = new Uint8Array(width * height * bytesPerPixel);
        var view = new DataView(surface.pixels);
        var colorTable = new Uint8Array(16);
        var srcOffs = 0;
        for (var yy = 0; yy < height; yy += 4) {
            for (var xx = 0; xx < width; xx += 4) {
                var color1 = view.getUint16(srcOffs + 0x00, true);
                var color2 = view.getUint16(srcOffs + 0x02, true);
                // Fill in first two colors in color table.
                // TODO(jstpierre): SRGB-correct blending.
                colorTable[0] = expand5to8((color1 >> 11) & 0x1F);
                colorTable[1] = expand6to8((color1 >> 5) & 0x3F);
                colorTable[2] = expand5to8(color1 & 0x1F);
                colorTable[3] = 0xFF;
                colorTable[4] = expand5to8((color2 >> 11) & 0x1F);
                colorTable[5] = expand6to8((color2 >> 5) & 0x3F);
                colorTable[6] = expand5to8(color2 & 0x1F);
                colorTable[7] = 0xFF;
                if (color1 > color2) {
                    // Predict gradients.
                    colorTable[8] = s3tcblend(colorTable[4], colorTable[0]);
                    colorTable[9] = s3tcblend(colorTable[5], colorTable[1]);
                    colorTable[10] = s3tcblend(colorTable[6], colorTable[2]);
                    colorTable[11] = 0xFF;
                    colorTable[12] = s3tcblend(colorTable[0], colorTable[4]);
                    colorTable[13] = s3tcblend(colorTable[1], colorTable[5]);
                    colorTable[14] = s3tcblend(colorTable[2], colorTable[6]);
                    colorTable[15] = 0xFF;
                }
                else {
                    colorTable[8] = (colorTable[0] + colorTable[4]) >>> 1;
                    colorTable[9] = (colorTable[1] + colorTable[5]) >>> 1;
                    colorTable[10] = (colorTable[2] + colorTable[6]) >>> 1;
                    colorTable[11] = 0xFF;
                    colorTable[12] = 0x00;
                    colorTable[13] = 0x00;
                    colorTable[14] = 0x00;
                    colorTable[15] = 0x00;
                }
                var bits = view.getUint32(srcOffs + 0x04, true);
                for (var y = 0; y < 4; y++) {
                    for (var x = 0; x < 4; x++) {
                        var dstPx = (yy + y) * width + xx + x;
                        var dstOffs = dstPx * 4;
                        var colorIdx = bits & 0x03;
                        dst[dstOffs + 0] = colorTable[colorIdx * 4 + 0];
                        dst[dstOffs + 1] = colorTable[colorIdx * 4 + 1];
                        dst[dstOffs + 2] = colorTable[colorIdx * 4 + 2];
                        dst[dstOffs + 3] = colorTable[colorIdx * 4 + 3];
                        bits >>= 2;
                    }
                }
                srcOffs += 0x08;
            }
        }
        var pixels = dst.buffer;
        return { type: 'RGBA', flag: surface.flag, width: width, height: height, pixels: pixels };
    }
    // Software decompresses from standard BC3 (DXT5) to RGBA.
    function decompressBC3Surface(surface) {
        var bytesPerPixel = 4;
        var width = surface.width;
        var height = surface.height;
        var dst = new Uint8Array(width * height * bytesPerPixel);
        var view = new DataView(surface.pixels);
        var colorTable = new Uint8Array(16);
        var alphaTable = new Uint8Array(8);
        var srcOffs = 0;
        for (var yy = 0; yy < height; yy += 4) {
            for (var xx = 0; xx < width; xx += 4) {
                var alpha1 = view.getUint8(srcOffs + 0x00);
                var alpha2 = view.getUint8(srcOffs + 0x01);
                alphaTable[0] = alpha1;
                alphaTable[1] = alpha2;
                if (alpha1 > alpha2) {
                    alphaTable[2] = (6 * alpha1 + 1 * alpha2) / 7;
                    alphaTable[3] = (5 * alpha1 + 2 * alpha2) / 7;
                    alphaTable[4] = (4 * alpha1 + 3 * alpha2) / 7;
                    alphaTable[5] = (3 * alpha1 + 4 * alpha2) / 7;
                    alphaTable[6] = (2 * alpha1 + 5 * alpha2) / 7;
                    alphaTable[7] = (1 * alpha1 + 6 * alpha2) / 7;
                }
                else {
                    alphaTable[2] = (4 * alpha1 + 1 * alpha2) / 5;
                    alphaTable[3] = (3 * alpha1 + 2 * alpha2) / 5;
                    alphaTable[4] = (2 * alpha1 + 3 * alpha2) / 5;
                    alphaTable[5] = (1 * alpha1 + 4 * alpha2) / 5;
                    alphaTable[6] = 0;
                    alphaTable[7] = 255;
                }
                var alphaBits0 = view.getUint32(srcOffs + 0x02, true) & 0x00FFFFFF;
                var alphaBits1 = view.getUint32(srcOffs + 0x04, true) >>> 8;
                for (var y = 0; y < 4; y++) {
                    for (var x = 0; x < 4; x++) {
                        var dstIdx = ((yy + y) * width) + xx + x;
                        var dstOffs = (dstIdx * bytesPerPixel);
                        var fullShift = (y * 4 + x) * 3;
                        var alphaBits = fullShift < 24 ? alphaBits0 : alphaBits1;
                        var shift = fullShift % 24;
                        var index = (alphaBits >>> shift) & 0x07;
                        dst[dstOffs + 3] = alphaTable[index];
                    }
                }
                srcOffs += 0x08;
                var color1 = view.getUint16(srcOffs + 0x00, true);
                var color2 = view.getUint16(srcOffs + 0x02, true);
                // Fill in first two colors in color table.
                // TODO(jstpierre): SRGB-correct blending.
                colorTable[0] = expand5to8((color1 >> 11) & 0x1F);
                colorTable[1] = expand6to8((color1 >> 5) & 0x3F);
                colorTable[2] = expand5to8(color1 & 0x1F);
                colorTable[3] = 0xFF;
                colorTable[4] = expand5to8((color2 >> 11) & 0x1F);
                colorTable[5] = expand6to8((color2 >> 5) & 0x3F);
                colorTable[6] = expand5to8(color2 & 0x1F);
                colorTable[7] = 0xFF;
                if (color1 > color2) {
                    // Predict gradients.
                    colorTable[8] = s3tcblend(colorTable[4], colorTable[0]);
                    colorTable[9] = s3tcblend(colorTable[5], colorTable[1]);
                    colorTable[10] = s3tcblend(colorTable[6], colorTable[2]);
                    colorTable[11] = 0xFF;
                    colorTable[12] = s3tcblend(colorTable[0], colorTable[4]);
                    colorTable[13] = s3tcblend(colorTable[1], colorTable[5]);
                    colorTable[14] = s3tcblend(colorTable[2], colorTable[6]);
                    colorTable[15] = 0xFF;
                }
                else {
                    colorTable[8] = (colorTable[0] + colorTable[4]) >>> 1;
                    colorTable[9] = (colorTable[1] + colorTable[5]) >>> 1;
                    colorTable[10] = (colorTable[2] + colorTable[6]) >>> 1;
                    colorTable[11] = 0xFF;
                    colorTable[12] = 0x00;
                    colorTable[13] = 0x00;
                    colorTable[14] = 0x00;
                    colorTable[15] = 0xFF;
                }
                var colorBits = view.getUint32(srcOffs + 0x04, true);
                for (var y = 0; y < 4; y++) {
                    for (var x = 0; x < 4; x++) {
                        var dstIdx = (yy + y) * width + xx + x;
                        var dstOffs = (dstIdx * bytesPerPixel);
                        var colorIdx = colorBits & 0x03;
                        dst[dstOffs + 0] = colorTable[colorIdx * 4 + 0];
                        dst[dstOffs + 1] = colorTable[colorIdx * 4 + 1];
                        dst[dstOffs + 2] = colorTable[colorIdx * 4 + 2];
                        colorBits >>= 2;
                    }
                }
                srcOffs += 0x08;
            }
        }
        var pixels = dst.buffer;
        return { type: 'RGBA', flag: surface.flag, width: width, height: height, pixels: pixels };
    }
    // Software decompresses from standard BC4/BC5 to RGBA.
    function decompressBC45Surface(surface) {
        var bytesPerPixel = 4;
        var width = surface.width;
        var height = surface.height;
        var signed = surface.flag === 'SNORM';
        var view = new DataView(surface.pixels);
        var dst;
        var colorTable;
        var srcBytesPerPixel;
        if (surface.type === 'BC4')
            srcBytesPerPixel = 1;
        else
            srcBytesPerPixel = 2;
        if (signed) {
            dst = new Int8Array(width * height * bytesPerPixel);
            colorTable = new Int8Array(8);
        }
        else {
            dst = new Uint8Array(width * height * bytesPerPixel);
            colorTable = new Uint8Array(8);
        }
        var srcOffs = 0;
        for (var yy = 0; yy < height; yy += 4) {
            for (var xx = 0; xx < width; xx += 4) {
                for (var ch = 0; ch < srcBytesPerPixel; ch++) {
                    var red0 = void 0;
                    var red1 = void 0;
                    if (signed) {
                        red0 = view.getInt8(srcOffs + 0x00);
                        red1 = view.getInt8(srcOffs + 0x01);
                    }
                    else {
                        red0 = view.getUint8(srcOffs + 0x00);
                        red1 = view.getUint8(srcOffs + 0x01);
                    }
                    colorTable[0] = red0;
                    colorTable[1] = red1;
                    if (red0 > red1) {
                        colorTable[2] = (6 * red0 + 1 * red1) / 7;
                        colorTable[3] = (5 * red0 + 2 * red1) / 7;
                        colorTable[4] = (4 * red0 + 3 * red1) / 7;
                        colorTable[5] = (3 * red0 + 4 * red1) / 7;
                        colorTable[6] = (2 * red0 + 5 * red1) / 7;
                        colorTable[7] = (1 * red0 + 6 * red1) / 7;
                    }
                    else {
                        colorTable[2] = (4 * red0 + 1 * red1) / 5;
                        colorTable[3] = (3 * red0 + 2 * red1) / 5;
                        colorTable[4] = (2 * red0 + 3 * red1) / 5;
                        colorTable[5] = (1 * red0 + 4 * red1) / 5;
                        colorTable[6] = signed ? -128 : 0;
                        colorTable[7] = signed ? 127 : 255;
                    }
                    var colorBits0 = view.getUint32(srcOffs + 0x02, true) & 0x00FFFFFF;
                    var colorBits1 = view.getUint32(srcOffs + 0x04, true) >>> 8;
                    for (var y = 0; y < 4; y++) {
                        for (var x = 0; x < 4; x++) {
                            var dstIdx = ((yy + y) * width) + xx + x;
                            var dstOffs = (dstIdx * bytesPerPixel);
                            var fullShift = (y * 4 + x) * 3;
                            var colorBits = fullShift < 24 ? colorBits0 : colorBits1;
                            var shift = fullShift % 24;
                            var index = (colorBits >>> shift) & 0x07;
                            if (srcBytesPerPixel === 1) {
                                dst[dstOffs + 0] = colorTable[index];
                                dst[dstOffs + 1] = colorTable[index];
                                dst[dstOffs + 2] = colorTable[index];
                                dst[dstOffs + 3] = signed ? 127 : 255;
                            }
                            else {
                                if (ch === 0) {
                                    dst[dstOffs + 0] = colorTable[index];
                                }
                                else if (ch === 1) {
                                    dst[dstOffs + 1] = colorTable[index];
                                    dst[dstOffs + 2] = signed ? 127 : 255;
                                    dst[dstOffs + 3] = signed ? 127 : 255;
                                }
                            }
                        }
                    }
                    srcOffs += 0x08;
                }
            }
        }
        var pixels = dst.buffer;
        return { type: 'RGBA', flag: surface.flag, width: width, height: height, pixels: pixels };
    }
    function decompressBC(surface) {
        switch (surface.type) {
            case 'BC1':
                return decompressBC1Surface(surface);
            case 'BC3':
                return decompressBC3Surface(surface);
            case 'BC4':
            case 'BC5':
                return decompressBC45Surface(surface);
        }
    }
    exports_46("decompressBC", decompressBC);
    function deswizzleSurface(surface, texData, mipLevel) {
        return gx2_swizzle_1.deswizzler.deswizzle(surface, texData.castToBuffer(), mipLevel);
    }
    exports_46("deswizzleSurface", deswizzleSurface);
    function decodeSurface(surface, texData, mipData, mipLevel) {
        var levelData;
        if (mipLevel === 0) {
            levelData = texData;
        }
        else if (mipLevel === 1) {
            levelData = mipData;
        }
        else {
            var offset = surface.mipDataOffsets[mipLevel - 1];
            levelData = mipData.slice(offset);
        }
        var width = surface.width;
        var height = surface.height;
        return deswizzleSurface(surface, levelData, mipLevel).then(function (deswizzledSurface) {
            switch (surface.format) {
                case 49 /* BC1_UNORM */:
                    return __assign({ type: 'BC1', flag: 'UNORM' }, deswizzledSurface);
                case 1073 /* BC1_SRGB */:
                    return __assign({ type: 'BC1', flag: 'SRGB' }, deswizzledSurface);
                case 51 /* BC3_UNORM */:
                    return __assign({ type: 'BC3', flag: 'UNORM' }, deswizzledSurface);
                case 1075 /* BC3_SRGB */:
                    return __assign({ type: 'BC3', flag: 'SRGB' }, deswizzledSurface);
                case 52 /* BC4_UNORM */:
                    return __assign({ type: 'BC4', flag: 'UNORM' }, deswizzledSurface);
                case 564 /* BC4_SNORM */:
                    return __assign({ type: 'BC4', flag: 'SNORM' }, deswizzledSurface);
                case 53 /* BC5_UNORM */:
                    return __assign({ type: 'BC5', flag: 'UNORM' }, deswizzledSurface);
                case 565 /* BC5_SNORM */:
                    return __assign({ type: 'BC5', flag: 'SNORM' }, deswizzledSurface);
                case 26 /* TCS_R8_G8_B8_A8_UNORM */:
                    return __assign({ type: 'RGBA', flag: 'UNORM' }, deswizzledSurface);
                case 1050 /* TCS_R8_G8_B8_A8_SRGB */:
                    return __assign({ type: 'RGBA', flag: 'SRGB' }, deswizzledSurface);
                default:
                    throw new Error("Bad format in decodeSurface: " + surface.format.toString(16));
            }
        });
    }
    exports_46("decodeSurface", decodeSurface);
    function surfaceToCanvas(canvas, surface) {
        var ctx = canvas.getContext('2d');
        var width = surface.width;
        var height = surface.height;
        var imageData = new ImageData(width, height);
        switch (surface.type) {
            case 'RGBA':
                if (surface.flag === 'UNORM') {
                    var src = new Uint8Array(surface.pixels);
                    imageData.data.set(src);
                }
                else if (surface.flag === 'SRGB') {
                    // XXX(jstpierre): SRGB
                    var src = new Uint8Array(surface.pixels);
                    imageData.data.set(src);
                }
                else if (surface.flag === 'SNORM') {
                    var src = new Int8Array(surface.pixels);
                    var data = new Uint8Array(surface.pixels.byteLength);
                    for (var i = 0; i < src.length; i++) {
                        data[i] = src[i] + 128;
                    }
                    imageData.data.set(data);
                }
                break;
        }
        ctx.putImageData(imageData, 0, 0);
    }
    exports_46("surfaceToCanvas", surfaceToCanvas);
    function decompressSurface(texture) {
        switch (texture.type) {
            case 'RGBA':
                return texture;
            case 'BC1':
            case 'BC3':
            case 'BC4':
            case 'BC5':
                return decompressBC(texture);
        }
    }
    exports_46("decompressSurface", decompressSurface);
    var gx2_swizzle_1;
    return {
        setters: [
            function (gx2_swizzle_1_1) {
                gx2_swizzle_1 = gx2_swizzle_1_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("fres/bfres", ["fres/gx2_surface", "util"], function (exports_47, context_47) {
    "use strict";
    var __moduleName = context_47 && context_47.id;
    function readBinPtrT(view, offs, littleEndian) {
        var offs2 = view.getInt32(offs, littleEndian);
        if (offs2 === 0)
            return 0;
        else
            return offs + offs2;
    }
    function parseResDic(buffer, tableOffs, littleEndian) {
        if (tableOffs === 0)
            return [];
        var view = buffer.createDataView();
        var tableSize = view.getUint32(tableOffs + 0x00, littleEndian);
        var tableCount = view.getUint32(tableOffs + 0x04, littleEndian);
        util_26.assert(tableCount === tableCount);
        var entries = [];
        var tableIdx = tableOffs + 0x08;
        // Skip root entry.
        tableIdx += 0x10;
        for (var i = 0; i < tableCount; i++) {
            // There's a fancy search tree in here which I don't care about at all...
            var name_8 = util_26.readString(buffer, readBinPtrT(view, tableIdx + 0x08, littleEndian));
            var offs = readBinPtrT(view, tableIdx + 0x0C, littleEndian);
            entries.push({ name: name_8, offs: offs });
            tableIdx += 0x10;
        }
        return entries;
    }
    function parseFTEX(buffer, entry, littleEndian) {
        var offs = entry.offs;
        var view = buffer.createDataView();
        util_26.assert(util_26.readString(buffer, offs + 0x00, 0x04) === 'FTEX');
        // GX2 is Wii U which is a little-endian system.
        util_26.assert(!littleEndian);
        var gx2SurfaceOffs = offs + 0x04;
        var surface = gx2_surface_1.parseGX2Surface(buffer, gx2SurfaceOffs);
        var texDataOffs = readBinPtrT(view, offs + 0xB0, littleEndian);
        var mipDataOffs = readBinPtrT(view, offs + 0xB4, littleEndian);
        var texData = buffer.subarray(texDataOffs, surface.texDataSize);
        var mipData = buffer.subarray(mipDataOffs, surface.mipDataSize);
        return { surface: surface, texData: texData, mipData: mipData };
    }
    function parseFMDL(buffer, entry, littleEndian) {
        var offs = entry.offs;
        var view = buffer.createDataView();
        util_26.assert(util_26.readString(buffer, offs + 0x00, 0x04) === 'FMDL');
        var fileName = readBinPtrT(view, offs + 0x04, littleEndian);
        var filePath = readBinPtrT(view, offs + 0x08, littleEndian);
        var fsklOffs = readBinPtrT(view, offs + 0x0C, littleEndian);
        var fvtxOffs = readBinPtrT(view, offs + 0x10, littleEndian);
        var fshpResDic = parseResDic(buffer, readBinPtrT(view, offs + 0x14, littleEndian), littleEndian);
        var fmatResDic = parseResDic(buffer, readBinPtrT(view, offs + 0x18, littleEndian), littleEndian);
        var fvtxCount = view.getUint16(offs + 0x20, littleEndian);
        var fshpCount = view.getUint16(offs + 0x22, littleEndian);
        var fmatCount = view.getUint16(offs + 0x24, littleEndian);
        util_26.assert(fshpCount === fshpResDic.length);
        util_26.assert(fmatCount === fmatResDic.length);
        function readBufferData(offs) {
            var size = view.getUint32(offs + 0x04, littleEndian);
            var stride = view.getUint16(offs + 0x02, littleEndian);
            var dataOffs = readBinPtrT(view, offs + 0x14, littleEndian);
            var data = buffer.subarray(dataOffs, size);
            return { data: data, stride: stride };
        }
        function parseShaderAssignDict(offs) {
            var resDic = parseResDic(buffer, offs, littleEndian);
            var entries = [];
            try {
                for (var resDic_1 = __values(resDic), resDic_1_1 = resDic_1.next(); !resDic_1_1.done; resDic_1_1 = resDic_1.next()) {
                    var entry_1 = resDic_1_1.value;
                    var key = entry_1.name;
                    var value = util_26.readString(buffer, entry_1.offs);
                    entries.push({ key: key, value: value });
                }
            }
            catch (e_41_1) { e_41 = { error: e_41_1 }; }
            finally {
                try {
                    if (resDic_1_1 && !resDic_1_1.done && (_a = resDic_1.return)) _a.call(resDic_1);
                }
                finally { if (e_41) throw e_41.error; }
            }
            return entries;
            var e_41, _a;
        }
        // Vertex buffers.
        var fvtxIdx = fvtxOffs;
        var fvtx = [];
        for (var i = 0; i < fvtxCount; i++) {
            util_26.assert(util_26.readString(buffer, fvtxIdx + 0x00, 0x04) === 'FVTX');
            var attribCount = view.getUint8(fvtxIdx + 0x04);
            var bufferCount = view.getUint8(fvtxIdx + 0x05);
            var sectionIndex = view.getUint16(fvtxIdx + 0x06);
            util_26.assert(i === sectionIndex);
            var vtxCount = view.getUint16(fvtxIdx + 0x08);
            var attribArrayOffs = readBinPtrT(view, fvtxIdx + 0x10, littleEndian);
            var bufferArrayOffs = readBinPtrT(view, fvtxIdx + 0x18, littleEndian);
            var attribs = [];
            var attribArrayIdx = attribArrayOffs;
            for (var j = 0; j < attribCount; j++) {
                var name_9 = util_26.readString(buffer, readBinPtrT(view, attribArrayIdx + 0x00, littleEndian));
                var bufferIndex = view.getUint8(attribArrayIdx + 0x04);
                var bufferStart = view.getUint16(attribArrayIdx + 0x06, littleEndian);
                var format = view.getUint32(attribArrayIdx + 0x08, littleEndian);
                attribs.push({ name: name_9, bufferIndex: bufferIndex, bufferStart: bufferStart, format: format });
                attribArrayIdx += 0x0C;
            }
            var buffers = [];
            var bufferArrayIdx = bufferArrayOffs;
            for (var j = 0; j < bufferCount; j++) {
                var bufferData = readBufferData(bufferArrayIdx);
                util_26.assert(bufferData.stride === 0);
                buffers.push(bufferData);
                bufferArrayIdx += 0x18;
            }
            fvtx.push({ buffers: buffers, attribs: attribs, vtxCount: vtxCount });
            fvtxIdx += 0x20;
        }
        // Shapes.
        var fshp = [];
        try {
            for (var fshpResDic_1 = __values(fshpResDic), fshpResDic_1_1 = fshpResDic_1.next(); !fshpResDic_1_1.done; fshpResDic_1_1 = fshpResDic_1.next()) {
                var fshpEntry = fshpResDic_1_1.value;
                var offs_1 = fshpEntry.offs;
                util_26.assert(util_26.readString(buffer, offs_1 + 0x00, 0x04) === 'FSHP');
                var name_10 = util_26.readString(buffer, readBinPtrT(view, offs_1 + 0x04, littleEndian));
                var fmatIndex = view.getUint16(offs_1 + 0x0E, littleEndian);
                var fsklIndex = view.getUint16(offs_1 + 0x10, littleEndian);
                var fvtxIndex = view.getUint16(offs_1 + 0x12, littleEndian);
                // Each mesh corresponds to one LoD.
                var meshArrayCount = view.getUint8(offs_1 + 0x17);
                var meshArrayOffs = readBinPtrT(view, offs_1 + 0x24, littleEndian);
                var meshArrayIdx = meshArrayOffs;
                var meshes = [];
                for (var i = 0; i < meshArrayCount; i++) {
                    var primType = view.getUint32(meshArrayIdx + 0x00, littleEndian);
                    var indexFormat = view.getUint32(meshArrayIdx + 0x04, littleEndian);
                    var indexBufferOffs = readBinPtrT(view, meshArrayIdx + 0x14, littleEndian);
                    var indexBufferData = readBufferData(indexBufferOffs);
                    var submeshArrayCount = view.getUint16(meshArrayIdx + 0x0C, littleEndian);
                    var submeshArrayOffs = readBinPtrT(view, meshArrayIdx + 0x10, littleEndian);
                    var submeshArrayIdx = submeshArrayOffs;
                    var submeshes = [];
                    for (var j = 0; j < submeshArrayCount; j++) {
                        var indexBufferOffset = view.getUint32(submeshArrayIdx + 0x00, littleEndian);
                        var indexBufferCount = view.getUint32(submeshArrayIdx + 0x04, littleEndian);
                        submeshes.push({ indexBufferOffset: indexBufferOffset, indexBufferCount: indexBufferCount });
                        submeshArrayIdx += 0x08;
                    }
                    meshes.push({ primType: primType, indexFormat: indexFormat, indexBufferData: indexBufferData, submeshes: submeshes });
                    meshArrayIdx += 0x1C;
                }
                fshp.push({ name: name_10, fmatIndex: fmatIndex, fvtxIndex: fvtxIndex, meshes: meshes });
            }
        }
        catch (e_42_1) { e_42 = { error: e_42_1 }; }
        finally {
            try {
                if (fshpResDic_1_1 && !fshpResDic_1_1.done && (_a = fshpResDic_1.return)) _a.call(fshpResDic_1);
            }
            finally { if (e_42) throw e_42.error; }
        }
        // Materials.
        var fmat = [];
        try {
            for (var fmatResDic_1 = __values(fmatResDic), fmatResDic_1_1 = fmatResDic_1.next(); !fmatResDic_1_1.done; fmatResDic_1_1 = fmatResDic_1.next()) {
                var fmatEntry = fmatResDic_1_1.value;
                var offs_2 = fmatEntry.offs;
                util_26.assert(util_26.readString(buffer, offs_2 + 0x00, 0x04) === 'FMAT');
                var name_11 = util_26.readString(buffer, readBinPtrT(view, offs_2 + 0x04, littleEndian));
                var renderInfoParameterCount = view.getUint16(offs_2 + 0x0E, littleEndian);
                var textureReferenceCount = view.getUint8(offs_2 + 0x10);
                var textureSamplerCount = view.getUint8(offs_2 + 0x11);
                var materialParameterCount = view.getUint16(offs_2 + 0x12);
                var materialParameterDataLength = view.getUint16(offs_2 + 0x16);
                var renderInfoParameterResDic = parseResDic(buffer, readBinPtrT(view, offs_2 + 0x1C, littleEndian), littleEndian);
                var renderStateOffs = readBinPtrT(view, offs_2 + 0x20, littleEndian);
                var shaderAssignOffs = readBinPtrT(view, offs_2 + 0x24, littleEndian);
                var textureReferenceArrayOffs = readBinPtrT(view, offs_2 + 0x28, littleEndian);
                var textureSamplerArrayOffs = readBinPtrT(view, offs_2 + 0x2C, littleEndian);
                var materialParameterArrayOffs = readBinPtrT(view, offs_2 + 0x34, littleEndian);
                var materialParameterDataOffs = readBinPtrT(view, offs_2 + 0x3C, littleEndian);
                var materialParameterDataBuffer = buffer.subarray(materialParameterDataOffs, materialParameterDataLength);
                var renderInfoParameters = [];
                try {
                    for (var renderInfoParameterResDic_1 = __values(renderInfoParameterResDic), renderInfoParameterResDic_1_1 = renderInfoParameterResDic_1.next(); !renderInfoParameterResDic_1_1.done; renderInfoParameterResDic_1_1 = renderInfoParameterResDic_1.next()) {
                        var renderInfoParameterEntry = renderInfoParameterResDic_1_1.value;
                        var offs_3 = renderInfoParameterEntry.offs;
                        var arrayLength = view.getUint16(offs_3 + 0x00, littleEndian);
                        var type = view.getUint8(offs_3 + 0x02);
                        var name_12 = util_26.readString(buffer, readBinPtrT(view, offs_3 + 0x04, littleEndian));
                        var arrayIdx = offs_3 + 0x08;
                        switch (type) {
                            case RenderInfoParameterType.Int: {
                                var data = [];
                                for (var i = 0; i < arrayLength; i++) {
                                    data.push(view.getInt32(arrayIdx, littleEndian));
                                    arrayIdx += 0x04;
                                }
                                renderInfoParameters.push({ type: type, name: name_12, data: data });
                                break;
                            }
                            case RenderInfoParameterType.Float: {
                                var data = [];
                                for (var i = 0; i < arrayLength; i++) {
                                    data.push(view.getFloat32(arrayIdx, littleEndian));
                                    arrayIdx += 0x04;
                                }
                                renderInfoParameters.push({ type: type, name: name_12, data: data });
                                break;
                            }
                            case RenderInfoParameterType.String: {
                                var data = [];
                                for (var i = 0; i < arrayLength; i++) {
                                    data.push(util_26.readString(buffer, readBinPtrT(view, arrayIdx, littleEndian)));
                                    arrayIdx += 0x04;
                                }
                                renderInfoParameters.push({ type: type, name: name_12, data: data });
                                break;
                            }
                        }
                    }
                }
                catch (e_43_1) { e_43 = { error: e_43_1 }; }
                finally {
                    try {
                        if (renderInfoParameterResDic_1_1 && !renderInfoParameterResDic_1_1.done && (_b = renderInfoParameterResDic_1.return)) _b.call(renderInfoParameterResDic_1);
                    }
                    finally { if (e_43) throw e_43.error; }
                }
                util_26.assert(textureSamplerCount === textureReferenceCount);
                var textureSamplerArrayIdx = textureSamplerArrayOffs;
                var textureReferenceArrayIdx = textureReferenceArrayOffs;
                var textureAssigns = [];
                for (var i = 0; i < textureSamplerCount; i++) {
                    var samplerParam0 = view.getUint32(textureSamplerArrayIdx + 0x00, littleEndian);
                    var samplerParam1 = view.getUint32(textureSamplerArrayIdx + 0x04, littleEndian);
                    var samplerParam2 = view.getUint32(textureSamplerArrayIdx + 0x08, littleEndian);
                    var attribName = util_26.readString(buffer, readBinPtrT(view, textureSamplerArrayIdx + 0x10, littleEndian));
                    var index = view.getUint8(textureSamplerArrayIdx + 0x14);
                    util_26.assert(index === i);
                    textureSamplerArrayIdx += 0x18;
                    var textureName = util_26.readString(buffer, readBinPtrT(view, textureReferenceArrayIdx + 0x00, littleEndian));
                    var ftexOffs = readBinPtrT(view, textureReferenceArrayIdx + 0x04, littleEndian);
                    textureReferenceArrayIdx += 0x08;
                    var texClampU = (samplerParam0 >>> 0) & 0x07;
                    var texClampV = (samplerParam0 >>> 3) & 0x07;
                    var texFilterMag = (samplerParam0 >>> 9) & 0x03;
                    var texFilterMin = (samplerParam0 >>> 12) & 0x03;
                    var texFilterMip = (samplerParam0 >>> 17) & 0x03;
                    textureAssigns.push({ attribName: attribName, textureName: textureName, ftexOffs: ftexOffs, texClampU: texClampU, texClampV: texClampV, texFilterMin: texFilterMin, texFilterMag: texFilterMag, texFilterMip: texFilterMip });
                }
                var materialParameterArrayIdx = materialParameterArrayOffs;
                var materialParameters = [];
                for (var i = 0; i < materialParameterCount; i++) {
                    var type = view.getUint8(materialParameterArrayIdx + 0x00);
                    var size = view.getUint8(materialParameterArrayIdx + 0x01);
                    var dataOffs = view.getUint16(materialParameterArrayIdx + 0x02, littleEndian);
                    var index = view.getUint16(materialParameterArrayIdx + 0x0C, littleEndian);
                    util_26.assert(index === i);
                    var name_13 = util_26.readString(buffer, readBinPtrT(view, materialParameterArrayIdx + 0x10, littleEndian));
                    materialParameterArrayIdx += 0x14;
                    materialParameters.push({ type: type, size: size, dataOffs: dataOffs, name: name_13 });
                }
                // Shader assign.
                var shaderArchiveName = util_26.readString(buffer, readBinPtrT(view, shaderAssignOffs + 0x00, littleEndian));
                var shadingModelName = util_26.readString(buffer, readBinPtrT(view, shaderAssignOffs + 0x04, littleEndian));
                var vertShaderInputCount = view.getUint8(shaderAssignOffs + 0x0C);
                var vertShaderInputDict = parseShaderAssignDict(readBinPtrT(view, shaderAssignOffs + 0x10, littleEndian));
                util_26.assert(vertShaderInputDict.length === vertShaderInputCount);
                var fragShaderInputCount = view.getUint8(shaderAssignOffs + 0x0D);
                var fragShaderInputDict = parseShaderAssignDict(readBinPtrT(view, shaderAssignOffs + 0x14, littleEndian));
                util_26.assert(fragShaderInputDict.length === fragShaderInputCount);
                var paramDict = parseShaderAssignDict(readBinPtrT(view, shaderAssignOffs + 0x18, littleEndian));
                var paramCount = view.getUint16(shaderAssignOffs + 0x0E);
                util_26.assert(paramDict.length === paramCount);
                var shaderAssign = {
                    shaderArchiveName: shaderArchiveName,
                    shadingModelName: shadingModelName,
                    vertShaderInputDict: vertShaderInputDict,
                    fragShaderInputDict: fragShaderInputDict,
                    paramDict: paramDict,
                };
                // Render state.
                var renderState0 = view.getUint32(renderStateOffs + 0x00, littleEndian);
                var renderState1 = view.getUint32(renderStateOffs + 0x04, littleEndian);
                var renderState2 = view.getUint32(renderStateOffs + 0x08, littleEndian);
                var cullFront = !!((renderState1 >>> 0) & 0x01);
                var cullBack = !!((renderState1 >>> 1) & 0x01);
                var frontFaceMode = (renderState1 >>> 2) & 0x01;
                var depthTest = !!((renderState2 >>> 1) & 0x01);
                var depthWrite = !!((renderState2 >>> 2) & 0x01);
                var depthCompareFunc = (renderState2 >> 4) & 0x07;
                var renderState = { cullFront: cullFront, cullBack: cullBack, frontFaceMode: frontFaceMode, depthTest: depthTest, depthWrite: depthWrite, depthCompareFunc: depthCompareFunc };
                fmat.push({ name: name_11, renderInfoParameters: renderInfoParameters, textureAssigns: textureAssigns, materialParameterDataBuffer: materialParameterDataBuffer, materialParameters: materialParameters, shaderAssign: shaderAssign, renderState: renderState });
            }
        }
        catch (e_44_1) { e_44 = { error: e_44_1 }; }
        finally {
            try {
                if (fmatResDic_1_1 && !fmatResDic_1_1.done && (_c = fmatResDic_1.return)) _c.call(fmatResDic_1);
            }
            finally { if (e_44) throw e_44.error; }
        }
        return { fvtx: fvtx, fshp: fshp, fmat: fmat };
        var e_42, _a, e_44, _c, e_43, _b;
    }
    function parse(buffer) {
        var view = buffer.createDataView();
        util_26.assert(util_26.readString(buffer, 0x00, 0x04) === 'FRES');
        var littleEndian;
        switch (view.getUint16(0x08, false)) {
            case 0xFEFF:
                littleEndian = false;
                break;
            case 0xFFFE:
                littleEndian = true;
                break;
            default:
                throw new Error("Invalid BOM");
        }
        var version = view.getUint32(0x04, littleEndian);
        var supportedVersions = [
            0x03050003,
        ];
        util_26.assert(supportedVersions.includes(version));
        var fileNameOffs = readBinPtrT(view, 0x14, littleEndian);
        var fileName = util_26.readString(buffer, fileNameOffs);
        function parseResDicIdx(idx) {
            var tableOffs = readBinPtrT(view, 0x20 + idx * 0x04, littleEndian);
            var tableCount = view.getUint16(0x50 + idx * 0x02, littleEndian);
            var resDic = parseResDic(buffer, tableOffs, littleEndian);
            util_26.assert(tableCount === resDic.length);
            return resDic;
        }
        var fmdlTable = parseResDicIdx(0x00);
        var ftexTable = parseResDicIdx(0x01);
        var fskaTable = parseResDicIdx(0x02);
        var textures = [];
        try {
            for (var ftexTable_1 = __values(ftexTable), ftexTable_1_1 = ftexTable_1.next(); !ftexTable_1_1.done; ftexTable_1_1 = ftexTable_1.next()) {
                var entry = ftexTable_1_1.value;
                var texture = parseFTEX(buffer, entry, littleEndian);
                textures.push({ entry: entry, texture: texture });
            }
        }
        catch (e_45_1) { e_45 = { error: e_45_1 }; }
        finally {
            try {
                if (ftexTable_1_1 && !ftexTable_1_1.done && (_a = ftexTable_1.return)) _a.call(ftexTable_1);
            }
            finally { if (e_45) throw e_45.error; }
        }
        var models = [];
        try {
            for (var fmdlTable_1 = __values(fmdlTable), fmdlTable_1_1 = fmdlTable_1.next(); !fmdlTable_1_1.done; fmdlTable_1_1 = fmdlTable_1.next()) {
                var entry = fmdlTable_1_1.value;
                var fmdl = parseFMDL(buffer, entry, littleEndian);
                models.push({ entry: entry, fmdl: fmdl });
            }
        }
        catch (e_46_1) { e_46 = { error: e_46_1 }; }
        finally {
            try {
                if (fmdlTable_1_1 && !fmdlTable_1_1.done && (_b = fmdlTable_1.return)) _b.call(fmdlTable_1);
            }
            finally { if (e_46) throw e_46.error; }
        }
        return { textures: textures, models: models };
        var e_45, _a, e_46, _b;
    }
    exports_47("parse", parse);
    var gx2_surface_1, util_26, UBOParameterType, RenderInfoParameterType;
    return {
        setters: [
            function (gx2_surface_1_1) {
                gx2_surface_1 = gx2_surface_1_1;
            },
            function (util_26_1) {
                util_26 = util_26_1;
            }
        ],
        execute: function () {
            (function (UBOParameterType) {
                UBOParameterType[UBOParameterType["Bool1"] = 0] = "Bool1";
                UBOParameterType[UBOParameterType["Bool2"] = 1] = "Bool2";
                UBOParameterType[UBOParameterType["Bool3"] = 2] = "Bool3";
                UBOParameterType[UBOParameterType["Bool4"] = 3] = "Bool4";
                UBOParameterType[UBOParameterType["Int1"] = 4] = "Int1";
                UBOParameterType[UBOParameterType["Int2"] = 5] = "Int2";
                UBOParameterType[UBOParameterType["Int3"] = 6] = "Int3";
                UBOParameterType[UBOParameterType["Int4"] = 7] = "Int4";
                UBOParameterType[UBOParameterType["Uint1"] = 8] = "Uint1";
                UBOParameterType[UBOParameterType["Uint2"] = 9] = "Uint2";
                UBOParameterType[UBOParameterType["Uint3"] = 10] = "Uint3";
                UBOParameterType[UBOParameterType["Uint4"] = 11] = "Uint4";
                UBOParameterType[UBOParameterType["Float1"] = 12] = "Float1";
                UBOParameterType[UBOParameterType["Float2"] = 13] = "Float2";
                UBOParameterType[UBOParameterType["Float3"] = 14] = "Float3";
                UBOParameterType[UBOParameterType["Float4"] = 15] = "Float4";
                UBOParameterType[UBOParameterType["_Reserved_0"] = 16] = "_Reserved_0";
                UBOParameterType[UBOParameterType["Float2x2"] = 17] = "Float2x2";
                UBOParameterType[UBOParameterType["Float2x3"] = 18] = "Float2x3";
                UBOParameterType[UBOParameterType["Float2x4"] = 19] = "Float2x4";
                UBOParameterType[UBOParameterType["_Reserved_1"] = 20] = "_Reserved_1";
                UBOParameterType[UBOParameterType["Float3x2"] = 21] = "Float3x2";
                UBOParameterType[UBOParameterType["Float3x3"] = 22] = "Float3x3";
                UBOParameterType[UBOParameterType["Float3x4"] = 23] = "Float3x4";
                UBOParameterType[UBOParameterType["_Reserved_2"] = 24] = "_Reserved_2";
                UBOParameterType[UBOParameterType["Float4x2"] = 25] = "Float4x2";
                UBOParameterType[UBOParameterType["Float4x3"] = 26] = "Float4x3";
                UBOParameterType[UBOParameterType["Float4x4"] = 27] = "Float4x4";
                UBOParameterType[UBOParameterType["SRT2D"] = 28] = "SRT2D";
                UBOParameterType[UBOParameterType["SRT3D"] = 29] = "SRT3D";
                UBOParameterType[UBOParameterType["TextureSRT"] = 30] = "TextureSRT";
            })(UBOParameterType || (UBOParameterType = {}));
            (function (RenderInfoParameterType) {
                RenderInfoParameterType[RenderInfoParameterType["Int"] = 0] = "Int";
                RenderInfoParameterType[RenderInfoParameterType["Float"] = 1] = "Float";
                RenderInfoParameterType[RenderInfoParameterType["String"] = 2] = "String";
            })(RenderInfoParameterType || (RenderInfoParameterType = {}));
            ;
        }
    };
});
// Nintendo SARC archive format.
System.register("fres/sarc", ["util"], function (exports_48, context_48) {
    "use strict";
    var __moduleName = context_48 && context_48.id;
    function parse(buffer) {
        var view = buffer.createDataView();
        util_27.assert(util_27.readString(buffer, 0x00, 0x04) === 'SARC');
        var littleEndian;
        switch (view.getUint16(0x06, false)) {
            case 0xFEFF:
                littleEndian = false;
                break;
            case 0xFFFE:
                littleEndian = true;
                break;
            default:
                throw new Error("Invalid BOM");
        }
        util_27.assert(view.getUint16(0x04, littleEndian) === 0x14); // Header length.
        var dataOffset = view.getUint32(0x0C, littleEndian);
        var version = view.getUint16(0x10, littleEndian);
        util_27.assert(version === 0x100);
        util_27.assert(util_27.readString(buffer, 0x14, 0x04) === 'SFAT');
        util_27.assert(view.getUint16(0x18, littleEndian) === 0x0C);
        var fileCount = view.getUint16(0x1A, littleEndian);
        var sfntTableOffs = 0x20 + 0x10 * fileCount;
        util_27.assert(util_27.readString(buffer, sfntTableOffs, 0x04) === 'SFNT');
        util_27.assert(view.getUint16(sfntTableOffs + 0x04, littleEndian) === 0x08);
        var sfntStringTableOffs = sfntTableOffs + 0x08;
        var files = [];
        var fileTableIdx = 0x20;
        for (var i = 0; i < fileCount; i++) {
            var nameHash = view.getUint32(fileTableIdx + 0x00, littleEndian);
            var flags = view.getUint16(fileTableIdx + 0x04, littleEndian);
            var name_14 = void 0;
            if (flags & 0x0100) {
                var nameOffs = (view.getUint16(fileTableIdx + 0x06, littleEndian) * 4);
                name_14 = util_27.readString(buffer, sfntStringTableOffs + nameOffs, 0xFF);
            }
            else {
                name_14 = null;
            }
            var fileStart = view.getUint32(fileTableIdx + 0x08, littleEndian);
            var fileEnd = view.getUint32(fileTableIdx + 0x0C, littleEndian);
            var startOffs = dataOffset + fileStart;
            var endOffs = dataOffset + fileEnd;
            files.push({ name: name_14, offset: startOffs, buffer: buffer.slice(startOffs, endOffs) });
            fileTableIdx += 0x10;
        }
        return { buffer: buffer, files: files };
    }
    exports_48("parse", parse);
    var util_27;
    return {
        setters: [
            function (util_27_1) {
                util_27 = util_27_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("fres/render", ["fres/gx2_swizzle", "fres/gx2_texture", "render", "endian", "util"], function (exports_49, context_49) {
    "use strict";
    var __moduleName = context_49 && context_49.id;
    function getAttribFormatInfo(format) {
        switch (format) {
            case 768 /* _8_SINT */:
                return { size: 1, elemSize: 1, type: WebGL2RenderingContext.BYTE, normalized: false };
            case 512 /* _8_SNORM */:
                return { size: 1, elemSize: 1, type: WebGL2RenderingContext.BYTE, normalized: true };
            case 256 /* _8_UINT */:
                return { size: 1, elemSize: 1, type: WebGL2RenderingContext.UNSIGNED_BYTE, normalized: false };
            case 0 /* _8_UNORM */:
                return { size: 1, elemSize: 1, type: WebGL2RenderingContext.UNSIGNED_BYTE, normalized: true };
            case 4 /* _8_8_UNORM */:
                return { size: 2, elemSize: 1, type: WebGL2RenderingContext.UNSIGNED_BYTE, normalized: true };
            case 516 /* _8_8_SNORM */:
                return { size: 2, elemSize: 1, type: WebGL2RenderingContext.UNSIGNED_BYTE, normalized: true };
            case 7 /* _16_16_UNORM */:
                return { size: 2, elemSize: 2, type: WebGL2RenderingContext.UNSIGNED_SHORT, normalized: true };
            case 519 /* _16_16_SNORM */:
                return { size: 2, elemSize: 2, type: WebGL2RenderingContext.SHORT, normalized: true };
            case 2056 /* _16_16_FLOAT */:
                return { size: 2, elemSize: 2, type: WebGL2RenderingContext.HALF_FLOAT, normalized: false };
            case 2063 /* _16_16_16_16_FLOAT */:
                return { size: 4, elemSize: 2, type: WebGL2RenderingContext.HALF_FLOAT, normalized: false };
            case 2061 /* _32_32_FLOAT */:
                return { size: 2, elemSize: 4, type: WebGL2RenderingContext.FLOAT, normalized: false };
            case 2065 /* _32_32_32_FLOAT */:
                return { size: 4, elemSize: 4, type: WebGL2RenderingContext.FLOAT, normalized: false };
            default:
                var m_ = format;
                throw new Error("Unsupported attribute format " + format);
        }
    }
    var gx2_swizzle_2, GX2Texture, render_19, endian_2, util_28, ProgramGambit_UBER, Scene;
    return {
        setters: [
            function (gx2_swizzle_2_1) {
                gx2_swizzle_2 = gx2_swizzle_2_1;
            },
            function (GX2Texture_1) {
                GX2Texture = GX2Texture_1;
            },
            function (render_19_1) {
                render_19 = render_19_1;
            },
            function (endian_2_1) {
                endian_2 = endian_2_1;
            },
            function (util_28_1) {
                util_28 = util_28_1;
            }
        ],
        execute: function () {
            ProgramGambit_UBER = /** @class */ (function (_super) {
                __extends(ProgramGambit_UBER, _super);
                function ProgramGambit_UBER() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.$a = ProgramGambit_UBER.attribLocations;
                    _this.vert = "\nuniform mat4 u_modelView;\nuniform mat4 u_projection;\nlayout(location = " + _this.$a._p0 + ") in vec3 _p0;\nlayout(location = " + _this.$a._u0 + ") in vec2 _u0;\nout vec2 a_u0;\n\nvoid main() {\n    gl_Position = u_projection * u_modelView * vec4(_p0, 1.0);\n    a_u0 = _u0;\n}\n";
                    _this.frag = "\nin vec2 a_u0;\nuniform sampler2D _a0;\nuniform sampler2D _e0;\n\nvec4 textureSRGB(sampler2D s, vec2 uv) {\n    vec4 srgba = texture(s, uv);\n    vec3 srgb = srgba.rgb;\n#ifdef NOPE_HAS_WEBGL_compressed_texture_s3tc_srgb\n    vec3 rgb = srgb;\n#else\n    // http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html\n    vec3 rgb = srgb * (srgb * (srgb * 0.305306011 + 0.682171111) + 0.012522878);\n#endif\n    return vec4(rgb, srgba.a);\n}\n\nvoid main() {\n    o_color = textureSRGB(_a0, a_u0);\n    // TODO(jstpierre): Configurable alpha test\n    if (o_color.a < 0.5)\n        discard;\n    o_color.rgb += textureSRGB(_e0, a_u0).rgb;\n    o_color.rgb = pow(o_color.rgb, vec3(1.0 / 2.2));\n}\n";
                    return _this;
                }
                ProgramGambit_UBER.prototype.bind = function (gl, prog) {
                    _super.prototype.bind.call(this, gl, prog);
                    this.a0Location = gl.getUniformLocation(prog, "_a0");
                    this.e0Location = gl.getUniformLocation(prog, "_e0");
                };
                ProgramGambit_UBER.attribLocations = {
                    _p0: 0,
                    _u0: 1,
                };
                return ProgramGambit_UBER;
            }(render_19.Program));
            Scene = /** @class */ (function () {
                function Scene(gl, fres, isSkybox) {
                    this.fres = fres;
                    this.isSkybox = isSkybox;
                    this.fres = fres;
                    this.arena = new render_19.RenderArena();
                    this.blankTexture = this.arena.createTexture(gl);
                    gl.bindTexture(gl.TEXTURE_2D, this.blankTexture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
                    this.textures = [];
                    this.modelFuncs = this.translateFRES(gl, this.fres);
                }
                Scene.prototype.translateFVTXBuffers = function (fvtx, vertexDatas) {
                    for (var i = 0; i < fvtx.attribs.length; i++) {
                        var attrib = fvtx.attribs[i];
                        var location_1 = ProgramGambit_UBER.attribLocations[attrib.name];
                        if (location_1 === undefined)
                            continue;
                        var buffer = fvtx.buffers[attrib.bufferIndex];
                        util_28.assert(buffer.stride === 0);
                        util_28.assert(attrib.bufferStart === 0);
                        var vertexData = endian_2.betoh(buffer.data, getAttribFormatInfo(attrib.format).elemSize);
                        vertexDatas.push(vertexData);
                    }
                };
                Scene.prototype.translateFVTX = function (gl, fvtx, coalescedVertex) {
                    var vao = this.arena.createVertexArray(gl);
                    gl.bindVertexArray(vao);
                    for (var i = 0; i < fvtx.attribs.length; i++) {
                        var attrib = fvtx.attribs[i];
                        var location_2 = ProgramGambit_UBER.attribLocations[attrib.name];
                        if (location_2 === undefined)
                            continue;
                        var formatInfo = getAttribFormatInfo(attrib.format);
                        var buffer = coalescedVertex.shift();
                        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
                        gl.vertexAttribPointer(location_2, formatInfo.size, formatInfo.type, formatInfo.normalized, 0, buffer.offset);
                        gl.enableVertexAttribArray(location_2);
                    }
                    return vao;
                };
                Scene.prototype.translateTexClamp = function (gl, clampMode) {
                    switch (clampMode) {
                        case 2 /* CLAMP */:
                            return gl.CLAMP_TO_EDGE;
                        case 0 /* WRAP */:
                            return gl.REPEAT;
                        case 1 /* MIRROR */:
                            return gl.MIRRORED_REPEAT;
                        default:
                            throw new Error("Unknown tex clamp mode " + clampMode);
                    }
                };
                Scene.prototype.translateTexFilter = function (gl, filter, mipFilter) {
                    if (mipFilter === 2 /* LINEAR */ && filter === 1 /* BILINEAR */)
                        return gl.LINEAR_MIPMAP_LINEAR;
                    if (mipFilter === 2 /* LINEAR */ && filter === 0 /* POINT */)
                        return gl.NEAREST_MIPMAP_LINEAR;
                    if (mipFilter === 1 /* POINT */ && filter === 1 /* BILINEAR */)
                        return gl.LINEAR_MIPMAP_NEAREST;
                    if (mipFilter === 1 /* POINT */ && filter === 0 /* POINT */)
                        return gl.NEAREST_MIPMAP_LINEAR;
                    if (mipFilter === 0 /* NO_MIP */ && filter === 1 /* BILINEAR */)
                        return gl.LINEAR;
                    if (mipFilter === 0 /* NO_MIP */ && filter === 0 /* POINT */)
                        return gl.NEAREST;
                    throw new Error("Unknown texture filter mode");
                };
                Scene.prototype.translateFrontFaceMode = function (frontFaceMode) {
                    switch (frontFaceMode) {
                        case 0 /* CCW */:
                            return render_19.FrontFaceMode.CCW;
                        case 1 /* CW */:
                            return render_19.FrontFaceMode.CW;
                    }
                };
                Scene.prototype.translateCompareFunction = function (compareFunc) {
                    switch (compareFunc) {
                        case 0 /* NEVER */:
                            return render_19.CompareMode.NEVER;
                        case 1 /* LESS */:
                            return render_19.CompareMode.LESS;
                        case 2 /* EQUAL */:
                            return render_19.CompareMode.EQUAL;
                        case 3 /* LEQUAL */:
                            return render_19.CompareMode.LEQUAL;
                        case 4 /* GREATER */:
                            return render_19.CompareMode.GREATER;
                        case 5 /* NOTEQUAL */:
                            return render_19.CompareMode.NEQUAL;
                        case 6 /* GEQUAL */:
                            return render_19.CompareMode.GEQUAL;
                        case 7 /* ALWAYS */:
                            return render_19.CompareMode.ALWAYS;
                    }
                };
                Scene.prototype.translateCullMode = function (cullFront, cullBack) {
                    if (cullFront && cullBack)
                        return render_19.CullMode.FRONT_AND_BACK;
                    else if (cullFront)
                        return render_19.CullMode.FRONT;
                    else if (cullBack)
                        return render_19.CullMode.BACK;
                    else
                        return render_19.CullMode.NONE;
                };
                Scene.prototype.translateRenderState = function (renderState) {
                    var renderFlags = new render_19.RenderFlags();
                    renderFlags.frontFace = this.translateFrontFaceMode(renderState.frontFaceMode);
                    renderFlags.depthTest = renderState.depthTest;
                    renderFlags.depthFunc = this.translateCompareFunction(renderState.depthCompareFunc);
                    renderFlags.depthWrite = renderState.depthWrite;
                    renderFlags.cullMode = this.translateCullMode(renderState.cullFront, renderState.cullBack);
                    return renderFlags;
                };
                Scene.prototype.translateFMAT = function (gl, fmat) {
                    var _this = this;
                    // We only support the albedo/emissive texture.
                    var attribNames = ['_a0', '_e0'];
                    var textureAssigns = fmat.textureAssigns.filter(function (textureAssign) {
                        return attribNames.includes(textureAssign.attribName);
                    });
                    var samplers = [];
                    try {
                        for (var textureAssigns_1 = __values(textureAssigns), textureAssigns_1_1 = textureAssigns_1.next(); !textureAssigns_1_1.done; textureAssigns_1_1 = textureAssigns_1.next()) {
                            var textureAssign = textureAssigns_1_1.value;
                            var sampler = this.arena.createSampler(gl);
                            gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, this.translateTexClamp(gl, textureAssign.texClampU));
                            gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, this.translateTexClamp(gl, textureAssign.texClampV));
                            // XXX(jstpierre): Introduce this when we start decoding mipmaps.
                            var texFilterMip = 0 /* NO_MIP */;
                            gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, this.translateTexFilter(gl, textureAssign.texFilterMag, texFilterMip));
                            gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, this.translateTexFilter(gl, textureAssign.texFilterMin, texFilterMip));
                            samplers.push(sampler);
                        }
                    }
                    catch (e_47_1) { e_47 = { error: e_47_1 }; }
                    finally {
                        try {
                            if (textureAssigns_1_1 && !textureAssigns_1_1.done && (_a = textureAssigns_1.return)) _a.call(textureAssigns_1);
                        }
                        finally { if (e_47) throw e_47.error; }
                    }
                    var prog = new ProgramGambit_UBER();
                    this.arena.trackProgram(prog);
                    var renderFlags = this.translateRenderState(fmat.renderState);
                    return function (state) {
                        state.useProgram(prog);
                        state.bindModelView(_this.isSkybox);
                        state.useFlags(renderFlags);
                        var _loop_5 = function (i) {
                            var attribName = attribNames[i];
                            gl.activeTexture(gl.TEXTURE0 + i);
                            var uniformLocation = void 0;
                            if (attribName === '_a0')
                                uniformLocation = prog.a0Location;
                            else if (attribName === '_e0')
                                uniformLocation = prog.e0Location;
                            else
                                util_28.assert(false);
                            gl.uniform1i(uniformLocation, i);
                            var textureAssignIndex = textureAssigns.findIndex(function (textureAssign) { return textureAssign.attribName === attribName; });
                            if (textureAssignIndex >= 0) {
                                var textureAssign_1 = textureAssigns[textureAssignIndex];
                                var ftexIndex = _this.fres.textures.findIndex(function (textureEntry) { return textureEntry.entry.offs === textureAssign_1.ftexOffs; });
                                var ftex = _this.fres.textures[ftexIndex];
                                util_28.assert(ftex.entry.name === textureAssign_1.textureName);
                                var glTexture = _this.glTextures[ftexIndex];
                                gl.bindTexture(gl.TEXTURE_2D, glTexture);
                                var sampler = samplers[textureAssignIndex];
                                gl.bindSampler(i, sampler);
                            }
                            else {
                                // If we have no binding for this texture, replace it with something harmless...
                                gl.bindTexture(gl.TEXTURE_2D, _this.blankTexture);
                            }
                        };
                        // Textures.
                        for (var i = 0; i < attribNames.length; i++) {
                            _loop_5(i);
                        }
                    };
                    var e_47, _a;
                };
                Scene.prototype.translateIndexBuffer = function (indexFormat, indexBufferData) {
                    switch (indexFormat) {
                        case 0 /* U16_LE */:
                        case 1 /* U32_LE */:
                            return indexBufferData;
                        case 4 /* U16 */:
                            return endian_2.betoh(indexBufferData, 2);
                        case 9 /* U32 */:
                            return endian_2.betoh(indexBufferData, 4);
                    }
                };
                Scene.prototype.translateFSHPBuffers = function (fshp, indexDatas) {
                    try {
                        for (var _a = __values(fshp.meshes), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var mesh = _b.value;
                            util_28.assert(mesh.indexBufferData.stride === 0);
                            var indexData = this.translateIndexBuffer(mesh.indexFormat, mesh.indexBufferData.data);
                            indexDatas.push(indexData);
                        }
                    }
                    catch (e_48_1) { e_48 = { error: e_48_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_48) throw e_48.error; }
                    }
                    var e_48, _c;
                };
                Scene.prototype.translateIndexFormat = function (gl, indexFormat) {
                    // Little-endian translation was done above.
                    switch (indexFormat) {
                        case 4 /* U16 */:
                        case 0 /* U16_LE */:
                            return gl.UNSIGNED_SHORT;
                        case 9 /* U32 */:
                        case 1 /* U32_LE */:
                            return gl.UNSIGNED_INT;
                        default:
                            throw new Error("Unsupported index format " + indexFormat);
                    }
                };
                Scene.prototype.translatePrimType = function (gl, primType) {
                    switch (primType) {
                        case 4 /* TRIANGLES */:
                            return gl.TRIANGLES;
                        default:
                            throw new Error("Unsupported primitive type " + primType);
                    }
                };
                Scene.prototype.translateFSHP = function (gl, fshp, coalescedIndex) {
                    var _this = this;
                    var glIndexBuffers = [];
                    try {
                        for (var _a = __values(fshp.meshes), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var mesh = _b.value;
                            glIndexBuffers.push(coalescedIndex.shift());
                        }
                    }
                    catch (e_49_1) { e_49 = { error: e_49_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_49) throw e_49.error; }
                    }
                    return function (state) {
                        var lod = 0;
                        var mesh = fshp.meshes[lod];
                        var glIndexBuffer = glIndexBuffers[lod];
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glIndexBuffer.buffer);
                        try {
                            for (var _a = __values(mesh.submeshes), _b = _a.next(); !_b.done; _b = _a.next()) {
                                var submesh = _b.value;
                                gl.drawElements(_this.translatePrimType(gl, mesh.primType), submesh.indexBufferCount, _this.translateIndexFormat(gl, mesh.indexFormat), glIndexBuffer.offset + submesh.indexBufferOffset);
                            }
                        }
                        catch (e_50_1) { e_50 = { error: e_50_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_50) throw e_50.error; }
                        }
                        var e_50, _c;
                    };
                    var e_49, _c;
                };
                Scene.prototype.translateModel = function (gl, model, coalescedVertex, coalescedIndex) {
                    var _this = this;
                    var fmdl = model.fmdl;
                    var fvtxVaos = fmdl.fvtx.map(function (fvtx) { return _this.translateFVTX(gl, fvtx, coalescedVertex); });
                    var fmatFuncs = fmdl.fmat.map(function (fmat) { return _this.translateFMAT(gl, fmat); });
                    var fshpFuncs = fmdl.fshp.map(function (fshp) { return _this.translateFSHP(gl, fshp, coalescedIndex); });
                    return function (state) {
                        // _drcmap is the map used for the Gamepad. It does nothing but cause Z-fighting.
                        if (model.entry.name.endsWith('_drcmap'))
                            return;
                        // "_DV" seems to be the skybox. There are additional models which are powered
                        // by skeleton animation, which we don't quite support yet. Kill them for now.
                        if (model.entry.name.indexOf('_DV_') !== -1)
                            return;
                        var gl = state.gl;
                        for (var i = 0; i < fmdl.fshp.length; i++) {
                            var fshp = fmdl.fshp[i];
                            // XXX(jstpierre): Sun is dynamically moved by the game engine, I think...
                            // ... unless it's SKL animation. For now, skip it.
                            if (fshp.name === 'Sun__VRL_Sun')
                                continue;
                            gl.bindVertexArray(fvtxVaos[fshp.fvtxIndex]);
                            // Set up our material state.
                            fmatFuncs[fshp.fmatIndex](state);
                            // Draw our meshes.
                            fshpFuncs[i](state);
                        }
                    };
                };
                Scene.prototype.getCompressedFormat = function (gl, tex) {
                    switch (tex.type) {
                        case 'BC4':
                        case 'BC5':
                            return null;
                    }
                    var ext_compressed_texture_s3tc = gl.getExtension('WEBGL_compressed_texture_s3tc');
                    // const ext_compressed_texture_s3tc_srgb = gl.getExtension('WEBGL_compressed_texture_s3tc_srgb');
                    // XXX(jstpierre): Don't use sRGB for now since we sometimes fall back to SW decode.
                    /*
                    if (tex.flag === 'SRGB' && ext_compressed_texture_s3tc_srgb) {
                        switch (tex.type) {
                        case 'BC1':
                            return ext_compressed_texture_s3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
                        case 'BC3':
                            return ext_compressed_texture_s3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
                        }
                    }
                    */
                    if (ext_compressed_texture_s3tc) {
                        switch (tex.type) {
                            case 'BC1':
                                return ext_compressed_texture_s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT;
                            case 'BC3':
                                return ext_compressed_texture_s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT;
                        }
                    }
                    return null;
                };
                Scene.prototype.translateTexture = function (gl, textureEntry) {
                    var _this = this;
                    var glTexture = this.arena.createTexture(gl);
                    gl.bindTexture(gl.TEXTURE_2D, glTexture);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
                    var texture = textureEntry.texture;
                    var surface = texture.surface;
                    var canvases = [];
                    var _loop_6 = function (i) {
                        var mipLevel = i;
                        var canvas = document.createElement('canvas');
                        canvas.width = 0;
                        canvas.height = 0;
                        canvases.push(canvas);
                        GX2Texture.decodeSurface(surface, texture.texData, texture.mipData, mipLevel).then(function (decodedSurface) {
                            // Sometimes the surfaces appear to have garbage sizes.
                            if (decodedSurface.width === 0 || decodedSurface.height === 0)
                                return;
                            gl.bindTexture(gl.TEXTURE_2D, glTexture);
                            // Decodes should show up in order, thanks to priority. Change this if we ever
                            // change the logic, because it is indeed sketchy...
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, mipLevel);
                            // XXX(jstpierre): Sometimes Splatoon uses non-block-sized textures. OpenGL does
                            // not like this one bit. If this is the case, decompress in software.
                            var isBlockSized = !!(texture.surface.width & 0x03) || !!(texture.surface.height & 0x03);
                            // First check if we have to decompress compressed textures.
                            switch (decodedSurface.type) {
                                case "BC1":
                                case "BC3":
                                case "BC4":
                                case "BC5":
                                    var compressedFormat = _this.getCompressedFormat(gl, decodedSurface);
                                    if (compressedFormat === null || !isBlockSized)
                                        decodedSurface = GX2Texture.decompressBC(decodedSurface);
                                    break;
                            }
                            var pixels = decodedSurface.pixels;
                            var width = decodedSurface.width;
                            var height = decodedSurface.height;
                            util_28.assert(pixels.byteLength > 0);
                            switch (decodedSurface.type) {
                                case "RGBA": {
                                    var internalFormat = decodedSurface.flag === 'SRGB' ? gl.SRGB8_ALPHA8 : decodedSurface.flag === 'SNORM' ? gl.RGBA8_SNORM : gl.RGBA8;
                                    var type = decodedSurface.flag === 'SNORM' ? gl.BYTE : gl.UNSIGNED_BYTE;
                                    var data = decodedSurface.flag === 'SNORM' ? new Int8Array(pixels) : new Uint8Array(pixels);
                                    gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, width, height, 0, gl.RGBA, type, data);
                                    break;
                                }
                                case "BC1":
                                case "BC3":
                                case "BC4":
                                case "BC5": {
                                    var compressedFormat = _this.getCompressedFormat(gl, decodedSurface);
                                    util_28.assert(compressedFormat !== null);
                                    gl.compressedTexImage2D(gl.TEXTURE_2D, mipLevel, compressedFormat, width, height, 0, new Uint8Array(pixels));
                                    break;
                                }
                            }
                            // XXX(jstpierre): Do this on a worker as well?
                            var canvas = canvases[mipLevel];
                            var decompressedSurface = GX2Texture.decompressSurface(decodedSurface);
                            canvas.width = decompressedSurface.width;
                            canvas.height = decompressedSurface.height;
                            canvas.title = textureEntry.entry.name + " " + surface.format + " (" + surface.width + "x" + surface.height + ")";
                            GX2Texture.surfaceToCanvas(canvas, decompressedSurface);
                        });
                    };
                    for (var i = 0; i < surface.numMips; i++) {
                        _loop_6(i);
                    }
                    this.textures.push({ name: textureEntry.entry.name, surfaces: canvases });
                    return glTexture;
                };
                Scene.prototype.translateModelBuffers = function (modelEntry, vertexDatas, indexDatas) {
                    var _this = this;
                    // Translate vertex data.
                    modelEntry.fmdl.fvtx.forEach(function (fvtx) { return _this.translateFVTXBuffers(fvtx, vertexDatas); });
                    modelEntry.fmdl.fshp.forEach(function (fshp) { return _this.translateFSHPBuffers(fshp, indexDatas); });
                };
                Scene.prototype.translateFRES = function (gl, fres) {
                    var _this = this;
                    this.glTextures = fres.textures.map(function (ftex) { return _this.translateTexture(gl, ftex); });
                    // Gather buffers.
                    var vertexDatas = [];
                    var indexDatas = [];
                    fres.models.forEach(function (modelEntry) {
                        _this.translateModelBuffers(modelEntry, vertexDatas, indexDatas);
                    });
                    var coalescedVertex = render_19.coalesceBuffer(gl, gl.ARRAY_BUFFER, vertexDatas);
                    var coalescedIndex = render_19.coalesceBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indexDatas);
                    this.arena.buffers.push(coalescedVertex[0].buffer);
                    this.arena.buffers.push(coalescedIndex[0].buffer);
                    return fres.models.map(function (modelEntry) { return _this.translateModel(gl, modelEntry, coalescedVertex, coalescedIndex); });
                };
                Scene.prototype.render = function (state) {
                    this.modelFuncs.forEach(function (func) {
                        func(state);
                    });
                };
                Scene.prototype.destroy = function (gl) {
                    // Tear down the deswizzle workers.
                    gx2_swizzle_2.deswizzler.terminate();
                    this.arena.destroy(gl);
                };
                return Scene;
            }());
            exports_49("Scene", Scene);
        }
    };
});
System.register("fres/scenes", ["fres/bfres", "fres/sarc", "yaz0", "fres/render", "Progressable", "util"], function (exports_50, context_50) {
    "use strict";
    var __moduleName = context_50 && context_50.id;
    function collectTextures(scenes) {
        var textures = [];
        try {
            for (var scenes_9 = __values(scenes), scenes_9_1 = scenes_9.next(); !scenes_9_1.done; scenes_9_1 = scenes_9.next()) {
                var scene = scenes_9_1.value;
                if (scene)
                    textures.push.apply(textures, scene.textures);
            }
        }
        catch (e_51_1) { e_51 = { error: e_51_1 }; }
        finally {
            try {
                if (scenes_9_1 && !scenes_9_1.done && (_a = scenes_9.return)) _a.call(scenes_9);
            }
            finally { if (e_51) throw e_51.error; }
        }
        return textures;
        var e_51, _a;
    }
    function createSceneFromFRESBuffer(gl, buffer, isSkybox) {
        if (isSkybox === void 0) { isSkybox = false; }
        var fres = BFRES.parse(buffer);
        return new SplatoonRenderer(null, new render_20.Scene(gl, fres, isSkybox));
    }
    exports_50("createSceneFromFRESBuffer", createSceneFromFRESBuffer);
    function createSceneFromSARCBuffer(gl, buffer, isSkybox) {
        if (isSkybox === void 0) { isSkybox = false; }
        if (util_29.readString(buffer, 0, 4) === 'Yaz0')
            buffer = Yaz0.decompress(buffer);
        var sarc = SARC.parse(buffer);
        var file = sarc.files.find(function (file) { return file.name.endsWith('.bfres'); });
        return createSceneFromFRESBuffer(gl, file.buffer, isSkybox);
    }
    exports_50("createSceneFromSARCBuffer", createSceneFromSARCBuffer);
    var BFRES, SARC, Yaz0, render_20, Progressable_6, util_29, SplatoonRenderer, SplatoonSceneDesc, name, id, sceneDescs, sceneGroup;
    return {
        setters: [
            function (BFRES_1) {
                BFRES = BFRES_1;
            },
            function (SARC_1) {
                SARC = SARC_1;
            },
            function (Yaz0_5) {
                Yaz0 = Yaz0_5;
            },
            function (render_20_1) {
                render_20 = render_20_1;
            },
            function (Progressable_6_1) {
                Progressable_6 = Progressable_6_1;
            },
            function (util_29_1) {
                util_29 = util_29_1;
            }
        ],
        execute: function () {
            SplatoonRenderer = /** @class */ (function () {
                function SplatoonRenderer(mainScene, skyScene) {
                    this.mainScene = mainScene;
                    this.skyScene = skyScene;
                    this.textures = collectTextures([this.mainScene, this.skyScene]);
                }
                SplatoonRenderer.prototype.render = function (state) {
                    var gl = state.gl;
                    state.setClipPlanes(0.2, 500000);
                    if (this.skyScene) {
                        this.skyScene.render(state);
                    }
                    gl.clear(gl.DEPTH_BUFFER_BIT);
                    if (this.mainScene) {
                        this.mainScene.render(state);
                    }
                };
                SplatoonRenderer.prototype.destroy = function (gl) {
                    if (this.skyScene)
                        this.skyScene.destroy(gl);
                    if (this.mainScene)
                        this.mainScene.destroy(gl);
                };
                return SplatoonRenderer;
            }());
            SplatoonSceneDesc = /** @class */ (function () {
                function SplatoonSceneDesc(name, path) {
                    this.name = name;
                    this.path = path;
                    this.id = this.path;
                }
                SplatoonSceneDesc.prototype.createScene = function (gl) {
                    return Progressable_6.default.all([
                        this._createSceneFromPath(gl, "data/spl/" + this.path, false),
                        this._createSceneFromPath(gl, 'data/spl/VR_SkyDayCumulonimbus.szs', true),
                    ]).then(function (scenes) {
                        var _a = __read(scenes, 2), mainScene = _a[0], skyScene = _a[1];
                        return new SplatoonRenderer(mainScene, skyScene);
                    });
                };
                SplatoonSceneDesc.prototype._createSceneFromPath = function (gl, path, isSkybox) {
                    return util_29.fetch(path).then(function (result) {
                        return createSceneFromSARCBuffer(gl, result, isSkybox);
                    });
                };
                return SplatoonSceneDesc;
            }());
            // Splatoon Models
            name = "Splatoon";
            id = "splatoon";
            sceneDescs = [
                new SplatoonSceneDesc('Inkopolis Plaza', 'Fld_Plaza00.szs'),
                new SplatoonSceneDesc('Inkopolis Plaza Lobby', 'Fld_PlazaLobby.szs'),
                new SplatoonSceneDesc('Ancho-V Games', 'Fld_Office00.szs'),
                new SplatoonSceneDesc('Arrowana Mall', 'Fld_UpDown00.szs'),
                new SplatoonSceneDesc('Blackbelly Skatepark', 'Fld_SkatePark00.szs'),
                new SplatoonSceneDesc('Bluefin Depot', 'Fld_Ruins00.szs'),
                new SplatoonSceneDesc('Camp Triggerfish', 'Fld_Athletic00.szs'),
                new SplatoonSceneDesc('Flounder Heights', 'Fld_Jyoheki00.szs'),
                new SplatoonSceneDesc('Hammerhead Bridge', 'Fld_Kaisou00.szs'),
                new SplatoonSceneDesc('Kelp Dome', 'Fld_Maze00.szs'),
                new SplatoonSceneDesc('Mahi-Mahi Resort', 'Fld_Hiagari00.szs'),
                new SplatoonSceneDesc('Moray Towers', 'Fld_Tuzura00.szs'),
                new SplatoonSceneDesc('Museum d\'Alfonsino', 'Fld_Pivot00.szs'),
                new SplatoonSceneDesc('Pirahna Pit', 'Fld_Quarry00.szs'),
                new SplatoonSceneDesc('Port Mackerel', 'Fld_Amida00.szs'),
                new SplatoonSceneDesc('Saltspray Rig', 'Fld_SeaPlant00.szs'),
                new SplatoonSceneDesc('Urchin Underpass (New)', 'Fld_Crank01.szs'),
                new SplatoonSceneDesc('Urchin Underpass (Old)', 'Fld_Crank00.szs'),
                new SplatoonSceneDesc('Walleye Warehouse', 'Fld_Warehouse00.szs'),
                new SplatoonSceneDesc('Octo Valley', 'Fld_World00.szs'),
                new SplatoonSceneDesc('Object: Tree', 'Obj_Tree02.szs'),
            ];
            exports_50("sceneGroup", sceneGroup = { id: id, name: name, sceneDescs: sceneDescs });
        }
    };
});
System.register("dksiv/iv", [], function (exports_51, context_51) {
    "use strict";
    var __moduleName = context_51 && context_51.id;
    function parseIV(buffer) {
        var view = buffer.createDataView();
        var numChunks = view.getUint32(0x00, true);
        var r = view.getFloat32(0x04, true);
        var g = view.getFloat32(0x08, true);
        var b = view.getFloat32(0x0C, true);
        var color = new Float32Array([r, g, b]);
        var chunks = [];
        var chunkTableIdx = 0x10;
        for (var i = 0; i < numChunks; i++) {
            var idxDataOffs = view.getUint32(chunkTableIdx + 0x00, true);
            var idxDataCount = view.getUint32(chunkTableIdx + 0x04, true);
            var posDataOffs = view.getUint32(chunkTableIdx + 0x08, true);
            var posDataCount = view.getUint32(chunkTableIdx + 0x0C, true);
            var indexData = buffer.createTypedArray(Uint16Array, idxDataOffs, idxDataCount);
            var positionData = buffer.createTypedArray(Float32Array, posDataOffs, posDataCount * 3);
            chunks.push({ indexData: indexData, positionData: positionData });
            chunkTableIdx += 0x10;
        }
        return { color: color, chunks: chunks };
    }
    exports_51("parseIV", parseIV);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("dksiv/render", ["gl-matrix", "render"], function (exports_52, context_52) {
    "use strict";
    var __moduleName = context_52 && context_52.id;
    var gl_matrix_10, render_21, IVProgram, Chunk, Scene;
    return {
        setters: [
            function (gl_matrix_10_1) {
                gl_matrix_10 = gl_matrix_10_1;
            },
            function (render_21_1) {
                render_21 = render_21_1;
            }
        ],
        execute: function () {
            IVProgram = /** @class */ (function (_super) {
                __extends(IVProgram, _super);
                function IVProgram() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.vert = "\nprecision mediump float;\n\nuniform mat4 u_modelView;\nuniform mat4 u_projection;\n\nlayout(location = " + IVProgram.a_Position + ") attribute vec3 a_Position;\nlayout(location = " + IVProgram.a_Normal + ") attribute vec3 a_Normal;\n\nout vec3 v_Normal;\n\nvoid main() {\n    const float t_ModelScale = 20.0;\n    gl_Position = u_projection * u_modelView * vec4(a_Position * t_ModelScale, 1.0);\n    v_Normal = a_Normal;\n}\n";
                    _this.frag = "\nprecision mediump float;\n\nuniform vec3 u_Color;\n\nin vec3 v_Normal;\n\nvoid main() {\n    vec3 u_LightDirection = normalize(vec3(.2, -1, .5));\n    float t_LightIntensity = dot(-v_Normal, u_LightDirection);\n    vec3 t_LightColor = t_LightIntensity * vec3(0.3);\n    gl_FragColor = vec4(u_Color + t_LightColor, 1.0);\n}\n";
                    return _this;
                }
                IVProgram.prototype.bind = function (gl, prog) {
                    _super.prototype.bind.call(this, gl, prog);
                    this.u_Color = gl.getUniformLocation(prog, 'u_Color');
                };
                IVProgram.a_Position = 0;
                IVProgram.a_Normal = 1;
                return IVProgram;
            }(render_21.Program));
            Chunk = /** @class */ (function () {
                function Chunk(gl, chunk) {
                    this.chunk = chunk;
                    this.createTopology(gl, chunk);
                }
                Chunk.prototype.createTopology = function (gl, chunk) {
                    // Run through our data, calculate normals and such.
                    var t = gl_matrix_10.vec3.create();
                    var posData = new Float32Array(chunk.indexData.length * 3);
                    var nrmData = new Float32Array(chunk.indexData.length * 3);
                    for (var i = 0; i < chunk.indexData.length; i += 3) {
                        var i0 = chunk.indexData[i + 0];
                        var i1 = chunk.indexData[i + 1];
                        var i2 = chunk.indexData[i + 2];
                        var t0x = chunk.positionData[i0 * 3 + 0];
                        var t0y = chunk.positionData[i0 * 3 + 1];
                        var t0z = chunk.positionData[i0 * 3 + 2];
                        var t1x = chunk.positionData[i1 * 3 + 0];
                        var t1y = chunk.positionData[i1 * 3 + 1];
                        var t1z = chunk.positionData[i1 * 3 + 2];
                        var t2x = chunk.positionData[i2 * 3 + 0];
                        var t2y = chunk.positionData[i2 * 3 + 1];
                        var t2z = chunk.positionData[i2 * 3 + 2];
                        gl_matrix_10.vec3.cross(t, [t0x - t1x, t0y - t1y, t0z - t1z], [t0x - t2x, t0y - t2y, t0z - t2z]);
                        gl_matrix_10.vec3.normalize(t, t);
                        posData[(i + 0) * 3 + 0] = t0x;
                        posData[(i + 0) * 3 + 1] = t0y;
                        posData[(i + 0) * 3 + 2] = t0z;
                        posData[(i + 1) * 3 + 0] = t1x;
                        posData[(i + 1) * 3 + 1] = t1y;
                        posData[(i + 1) * 3 + 2] = t1z;
                        posData[(i + 2) * 3 + 0] = t2x;
                        posData[(i + 2) * 3 + 1] = t2y;
                        posData[(i + 2) * 3 + 2] = t2z;
                        nrmData[(i + 0) * 3 + 0] = t[0];
                        nrmData[(i + 0) * 3 + 1] = t[1];
                        nrmData[(i + 0) * 3 + 2] = t[2];
                        nrmData[(i + 1) * 3 + 0] = t[0];
                        nrmData[(i + 1) * 3 + 1] = t[1];
                        nrmData[(i + 1) * 3 + 2] = t[2];
                        nrmData[(i + 2) * 3 + 0] = t[0];
                        nrmData[(i + 2) * 3 + 1] = t[1];
                        nrmData[(i + 2) * 3 + 2] = t[2];
                    }
                    this.vao = gl.createVertexArray();
                    gl.bindVertexArray(this.vao);
                    this.posBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, posData, gl.STATIC_DRAW);
                    gl.vertexAttribPointer(IVProgram.a_Position, 3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(IVProgram.a_Position);
                    this.nrmBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.nrmBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, nrmData, gl.STATIC_DRAW);
                    gl.vertexAttribPointer(IVProgram.a_Normal, 3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(IVProgram.a_Normal);
                    this.numVertices = chunk.indexData.length;
                };
                Chunk.prototype.render = function (state) {
                    var gl = state.gl;
                    gl.bindVertexArray(this.vao);
                    gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
                };
                Chunk.prototype.destroy = function (gl) {
                    gl.deleteVertexArray(this.vao);
                    gl.deleteBuffer(this.posBuffer);
                    gl.deleteBuffer(this.nrmBuffer);
                };
                return Chunk;
            }());
            Scene = /** @class */ (function () {
                function Scene(gl, name, iv) {
                    this.name = name;
                    this.iv = iv;
                    this.textures = [];
                    this.visible = true;
                    this.chunks = this.iv.chunks.map(function (chunk) { return new Chunk(gl, chunk); });
                    this.program = new IVProgram();
                    this.renderFlags = new render_21.RenderFlags();
                    this.renderFlags.cullMode = render_21.CullMode.BACK;
                    this.renderFlags.depthTest = true;
                }
                Scene.prototype.setVisible = function (v) {
                    this.visible = v;
                };
                Scene.prototype.render = function (state) {
                    if (!this.visible)
                        return;
                    var gl = state.gl;
                    state.setClipPlanes(10, 500000);
                    state.useProgram(this.program);
                    state.bindModelView();
                    state.useFlags(this.renderFlags);
                    gl.uniform3fv(this.program.u_Color, this.iv.color);
                    this.chunks.forEach(function (chunk) {
                        chunk.render(state);
                    });
                };
                Scene.prototype.destroy = function (gl) {
                    this.chunks.forEach(function (chunk) {
                        chunk.destroy(gl);
                    });
                    this.program.destroy(gl);
                };
                return Scene;
            }());
            exports_52("Scene", Scene);
        }
    };
});
System.register("dksiv/scenes", ["dksiv/iv", "dksiv/render", "ui", "Progressable", "util"], function (exports_53, context_53) {
    "use strict";
    var __moduleName = context_53 && context_53.id;
    var iv_1, render_22, UI, Progressable_7, util_30, dks1Paths, dks2Paths, MultiScene, SceneDesc, sceneDescs, name, id, sceneGroup;
    return {
        setters: [
            function (iv_1_1) {
                iv_1 = iv_1_1;
            },
            function (render_22_1) {
                render_22 = render_22_1;
            },
            function (UI_3) {
                UI = UI_3;
            },
            function (Progressable_7_1) {
                Progressable_7 = Progressable_7_1;
            },
            function (util_30_1) {
                util_30 = util_30_1;
            }
        ],
        execute: function () {
            dks1Paths = [
                "data/dksiv/dks1/15-0 Sens Fortress.iv",
                "data/dksiv/dks1/15-1 Anor Londo.iv",
                "data/dksiv/dks1/16-0 New Londo Ruins+Valley of Drakes.iv",
                "data/dksiv/dks1/17-0 Duke's Archive+Crystal Caves.iv",
                "data/dksiv/dks1/18-0 Kiln of the first Flame.iv",
                "data/dksiv/dks1/18-1 Undead Asylum.iv",
                "data/dksiv/dks1/10-0 Depths.iv",
                "data/dksiv/dks1/10-1 Undead Burg.iv",
                "data/dksiv/dks1/10-2 Firelink Shrine.iv",
                "data/dksiv/dks1/11-0 Painted World of Ariamis.iv",
                "data/dksiv/dks1/12-0 Darkroot Garden+Basin.iv",
                "data/dksiv/dks1/12-1 Oolacile.iv",
                "data/dksiv/dks1/13-0 Catacombs.iv",
                "data/dksiv/dks1/13-1 Tomb of the Giants.iv",
                "data/dksiv/dks1/13-2 Ash Lake.iv",
                "data/dksiv/dks1/14-0 Blighttown+Quelaags Domain.iv",
                "data/dksiv/dks1/14-1 Demon Ruins+Lost Izalith.iv",
            ];
            dks2Paths = [
                "data/dksiv/dks2/10_25_The Gutter & Black Gulch.iv",
                "data/dksiv/dks2/10_27_Dragon Aerie & Dragon Shrine.iv",
                "data/dksiv/dks2/10_29_Majula.iv",
                "data/dksiv/dks2/10_30_Heide's Tower of Flame.iv",
                "data/dksiv/dks2/10_31_Heide's Tower of Flame & Cathedral of Blue.iv",
                "data/dksiv/dks2/10_32_Shaded Woods & Shrine of Winter.iv",
                "data/dksiv/dks2/10_33_Doors of Pharros.iv",
                "data/dksiv/dks2/10_34_Grave of Saints.iv",
                "data/dksiv/dks2/20_10_Memory of Vammar, Orro, Jeigh.iv",
                "data/dksiv/dks2/20_11_Shrine of Amana.iv",
                "data/dksiv/dks2/20_21_Drangleic Castle & King's Passage & Throne of Want.iv",
                "data/dksiv/dks2/20_24_Undead Crypt.iv",
                "data/dksiv/dks2/20_26_Dragon Memories.iv",
                "data/dksiv/dks2/40_03_Dark Chasm of Old.iv",
                "data/dksiv/dks2/10_02_Things Betwixt.iv",
                "data/dksiv/dks2/10_04_Majula.iv",
                "data/dksiv/dks2/10_10_Forest of Fallen Giants.iv",
                "data/dksiv/dks2/10_14_Brightstone Cove Tseldora & Lord's Private Chamber.iv",
                "data/dksiv/dks2/10_15_Aldia's Keep.iv",
                "data/dksiv/dks2/10_16_The Lost Bastille & Sinners' Rise & Belfry Luna.iv",
                "data/dksiv/dks2/10_17_Harvest Valley & Earthen Peak.iv",
                "data/dksiv/dks2/10_18_No-man's Wharf.iv",
                "data/dksiv/dks2/10_19_Iron Keep & Belfry Sol.iv",
                "data/dksiv/dks2/10_23_Huntsman's Copse & Undead Purgatory.iv",
            ];
            MultiScene = /** @class */ (function () {
                function MultiScene(scenes) {
                    this.scenes = scenes;
                    this.textures = [];
                    try {
                        for (var _a = __values(this.scenes), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var scene = _b.value;
                            this.textures = this.textures.concat(scene.textures);
                        }
                    }
                    catch (e_52_1) { e_52 = { error: e_52_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_52) throw e_52.error; }
                    }
                    var e_52, _c;
                }
                MultiScene.prototype.createPanels = function () {
                    var layers = new UI.LayerPanel();
                    layers.setLayers(this.scenes);
                    return [layers];
                };
                MultiScene.prototype.render = function (renderState) {
                    this.scenes.forEach(function (scene) {
                        scene.render(renderState);
                    });
                };
                MultiScene.prototype.destroy = function (gl) {
                    this.scenes.forEach(function (scene) { return scene.destroy(gl); });
                };
                return MultiScene;
            }());
            SceneDesc = /** @class */ (function () {
                function SceneDesc(id, name, paths) {
                    this.id = id;
                    this.name = name;
                    this.paths = paths;
                }
                SceneDesc.prototype.createScene = function (gl) {
                    var _this = this;
                    return Progressable_7.default.all(this.paths.map(function (path) {
                        return _this.createSceneForPath(gl, path);
                    })).then(function (scenes) {
                        return new MultiScene(scenes);
                    });
                };
                SceneDesc.prototype.createSceneForPath = function (gl, path) {
                    return util_30.fetch(path).then(function (result) {
                        var iv = iv_1.parseIV(result);
                        var basename = path.split('/').pop();
                        return new render_22.Scene(gl, basename, iv);
                    });
                };
                return SceneDesc;
            }());
            sceneDescs = [
                new SceneDesc('dks1', 'Dark Souls 1', dks1Paths),
                new SceneDesc('dks2', 'Dark Souls 2', dks2Paths),
            ];
            name = "Dark Souls Collision Data";
            id = "dksiv";
            exports_53("sceneGroup", sceneGroup = { id: id, name: name, sceneDescs: sceneDescs });
        }
    };
});
// Implements Retro's PAK format as seen in Metroid Prime 1.
System.register("metroid_prime/pak", ["util"], function (exports_54, context_54) {
    "use strict";
    var __moduleName = context_54 && context_54.id;
    function parse(buffer) {
        var view = buffer.createDataView();
        util_31.assert(view.getUint32(0x00) === 0x00030005);
        // Named resource table.
        var offs = 0x08;
        var namedResourceTableEntries = [];
        var namedResourceTableCount = view.getUint32(offs);
        offs += 0x04;
        for (var i = 0; i < namedResourceTableCount; i++) {
            var fourCC = util_31.readString(buffer, offs + 0x00, 4, false);
            var fileID = util_31.readString(buffer, offs + 0x04, 4, false);
            var fileNameLength = view.getUint32(offs + 0x08);
            var fileName = util_31.readString(buffer, offs + 0x0C, fileNameLength, false);
            namedResourceTableEntries.push({ fourCC: fourCC, fileID: fileID, fileName: fileName });
            offs += 0x0C + fileNameLength;
        }
        var namedResourceTable = new Map();
        var resourceTable = new Map();
        // Regular resource table.
        var resourceTableCount = view.getUint32(offs + 0x00);
        offs += 0x04;
        var _loop_7 = function (i) {
            var isCompressed = !!view.getUint32(offs + 0x00);
            var fourCC = util_31.readString(buffer, offs + 0x04, 4, false);
            var fileID = util_31.readString(buffer, offs + 0x08, 4, false);
            var fileSize = view.getUint32(offs + 0x0C);
            var fileOffset = view.getUint32(offs + 0x10);
            offs += 0x14;
            var decompressedSize = fileSize;
            if (isCompressed) {
                decompressedSize = view.getUint32(fileOffset);
                fileOffset += 0x04;
                fileSize -= 0x04;
            }
            if (resourceTable.has(fileID)) {
                var existingResource = resourceTable.get(fileID);
                // Skip files that are apparently the same.
                util_31.assert(fourCC === existingResource.fourCC);
                util_31.assert(fileSize === existingResource.fileSize);
                return "continue";
            }
            // Check for a named resource.
            var name_15 = null;
            var namedResourceTableEntry = namedResourceTableEntries.find(function (nr) { return nr.fileID === fileID; });
            if (namedResourceTableEntry) {
                name_15 = namedResourceTableEntry.fileName;
                util_31.assert(namedResourceTableEntry.fourCC === fourCC);
            }
            var fileBuffer = buffer.slice(fileOffset, fileOffset + fileSize);
            var fileResource = { name: name_15, fourCC: fourCC, fileID: fileID, fileSize: fileSize, fileOffset: fileOffset, isCompressed: isCompressed, decompressedSize: decompressedSize, buffer: fileBuffer };
            resourceTable.set(fileResource.fileID, fileResource);
            if (name_15 !== null)
                namedResourceTable.set(fileResource.name, fileResource);
        };
        for (var i = 0; i < resourceTableCount; i++) {
            _loop_7(i);
        }
        return { namedResourceTable: namedResourceTable, resourceTable: resourceTable };
    }
    exports_54("parse", parse);
    var util_31;
    return {
        setters: [
            function (util_31_1) {
                util_31 = util_31_1;
            }
        ],
        execute: function () {
        }
    };
});
// Implements Retro's TXTR (texture) format as seen in Metroid Prime 1.
System.register("metroid_prime/txtr", ["gx/gx_texture"], function (exports_55, context_55) {
    "use strict";
    var __moduleName = context_55 && context_55.id;
    function parse(resourceSystem, buffer) {
        var view = buffer.createDataView();
        var txtrFormat = view.getUint32(0x00);
        var format = txtrFormatRemap[txtrFormat];
        var width = view.getUint16(0x04);
        var height = view.getUint16(0x06);
        var mipCount = view.getUint32(0x08);
        var offs = 0x0C;
        var paletteFormat = 0;
        var paletteData = null;
        switch (format) {
            case 8 /* C4 */:
            case 9 /* C8 */:
                paletteFormat = view.getUint32(offs + 0x00);
                var palWidth = view.getUint32(offs + 0x04);
                var palHeight = view.getUint32(offs + 0x06);
                offs += 0x08;
                var palSize = GX_Texture.calcPaletteSize(format, paletteFormat);
                paletteData = buffer.slice(offs, offs + palSize);
                offs += palSize;
            case 10 /* C14X2 */:
                throw "whoops";
        }
        var data = buffer.slice(offs);
        return { format: format, width: width, height: height, mipCount: mipCount, data: data, paletteFormat: paletteFormat, paletteData: paletteData };
    }
    exports_55("parse", parse);
    var GX_Texture, txtrFormatRemap;
    return {
        setters: [
            function (GX_Texture_2) {
                GX_Texture = GX_Texture_2;
            }
        ],
        execute: function () {
            txtrFormatRemap = [
                0 /* I4 */,
                1 /* I8 */,
                2 /* IA4 */,
                3 /* IA8 */,
                8 /* C4 */,
                9 /* C8 */,
                10 /* C14X2 */,
                4 /* RGB565 */,
                5 /* RGB5A3 */,
                6 /* RGBA8 */,
                14 /* CMPR */,
            ];
        }
    };
});
// Implements Retro's MREA format as seen in Metroid Prime 1.
System.register("metroid_prime/mrea", ["gx/gx_material", "util", "endian"], function (exports_56, context_56) {
    "use strict";
    var __moduleName = context_56 && context_56.id;
    function parseMaterialSet(resourceSystem, buffer, offs) {
        var view = buffer.createDataView();
        var textureCount = view.getUint32(offs + 0x00);
        offs += 0x04;
        var textures = [];
        var textureRemapTable = [];
        for (var i = 0; i < textureCount; i++) {
            var materialTXTRID = util_32.readString(buffer, offs, 0x04, false);
            var txtr = resourceSystem.loadAssetByID(materialTXTRID, 'TXTR');
            var txtrIndex = textures.indexOf(txtr);
            if (txtrIndex >= 0) {
                textureRemapTable.push(txtrIndex);
            }
            else {
                var newIndex = textures.push(txtr) - 1;
                textureRemapTable.push(newIndex);
            }
            offs += 0x04;
        }
        var materialCount = view.getUint32(offs + 0x00);
        offs += 0x04;
        var materialEndTable = [];
        for (var i = 0; i < materialCount; i++) {
            var materialEndOffs = view.getUint32(offs);
            materialEndTable.push(materialEndOffs);
            offs += 0x04;
        }
        var materialsStart = offs;
        var materials = [];
        for (var i = 0; i < materialCount; i++) {
            var flags = view.getUint32(offs + 0x00);
            var textureIndexCount = view.getUint32(offs + 0x04);
            offs += 0x08;
            var textureIndexes = [];
            util_32.assert(textureIndexCount < 8);
            for (var j = 0; j < textureIndexCount; j++) {
                var textureIndex = view.getUint32(offs);
                textureIndexes.push(textureIndex);
                offs += 0x04;
            }
            var vtxAttrFormat = view.getUint32(offs + 0x00);
            var groupIndex = view.getUint32(offs + 0x04);
            offs += 0x08;
            var colorConstants = [];
            if (flags & 8 /* HAS_KONST */) {
                var konstCount = view.getUint32(offs);
                offs += 0x04;
                for (var j = 0; j < konstCount; j++) {
                    var r = view.getUint8(offs + 0x00);
                    var g = view.getUint8(offs + 0x01);
                    var b = view.getUint8(offs + 0x02);
                    var a = view.getUint8(offs + 0x03);
                    colorConstants.push(new GX_Material.Color(r, g, b, a));
                    offs += 0x04;
                }
            }
            for (var j = colorConstants.length; j < 4; j++) {
                // Push default colors.
                // XXX(jstpierre): Should this stuff be moved outside GXMaterial?
                colorConstants.push(new GX_Material.Color(0, 0, 0, 0));
            }
            var blendDstFactor = view.getUint16(offs + 0x00);
            var blendSrcFactor = view.getUint16(offs + 0x02);
            offs += 0x04;
            if (flags & 16384 /* HAS_INDTX_REFL */) {
                var reflectionIndtexSlot = view.getUint32(offs);
                offs += 0x04;
            }
            var colorChannelFlagsTableCount = view.getUint32(offs);
            util_32.assert(colorChannelFlagsTableCount <= 4);
            offs += 0x04;
            var lightChannels = [];
            // Only color channel 1 is stored in the format.
            for (var j = 0; j < 1; j++) {
                var colorChannelFlags = view.getUint32(offs);
                var lightingEnabled = !!(colorChannelFlags & 0x01);
                var ambColorSource = (colorChannelFlags >>> 1) & 0x01;
                var matColorSource = (colorChannelFlags >>> 2) & 0x01;
                var colorChannel = { lightingEnabled: lightingEnabled, ambColorSource: ambColorSource, matColorSource: matColorSource };
                // XXX(jstpierre): What's with COLOR0A0?
                var alphaChannel = { lightingEnabled: false, ambColorSource: 0 /* REG */, matColorSource: 0 /* REG */ };
                lightChannels.push({ colorChannel: colorChannel, alphaChannel: alphaChannel });
            }
            offs += 0x04 * colorChannelFlagsTableCount;
            // Fake other channel.
            lightChannels.push({
                colorChannel: { lightingEnabled: false, ambColorSource: 0 /* REG */, matColorSource: 0 /* REG */ },
                alphaChannel: { lightingEnabled: false, ambColorSource: 0 /* REG */, matColorSource: 0 /* REG */ },
            });
            var tevStageCount = view.getUint32(offs);
            util_32.assert(tevStageCount <= 8);
            offs += 0x04;
            var tevOrderTableOffs = offs + tevStageCount * 0x14;
            var tevStages = [];
            for (var j = 0; j < tevStageCount; j++) {
                var colorInputSel = view.getUint32(offs + 0x00);
                var alphaInputSel = view.getUint32(offs + 0x04);
                var colorCombineFlags = view.getUint32(offs + 0x08);
                var alphaCombineFlags = view.getUint32(offs + 0x0C);
                var konstAlphaSel = view.getUint8(offs + 0x11);
                var konstColorSel = view.getUint8(offs + 0x12);
                var channelId = view.getUint8(offs + 0x13);
                var colorInA = (colorInputSel >>> 0) & 0x1F;
                var colorInB = (colorInputSel >>> 5) & 0x1F;
                var colorInC = (colorInputSel >>> 10) & 0x1F;
                var colorInD = (colorInputSel >>> 15) & 0x1F;
                var alphaInA = (alphaInputSel >>> 0) & 0x1F;
                var alphaInB = (alphaInputSel >>> 5) & 0x1F;
                var alphaInC = (alphaInputSel >>> 10) & 0x1F;
                var alphaInD = (alphaInputSel >>> 15) & 0x1F;
                var colorOp = (colorCombineFlags >>> 0) & 0x0F;
                var colorBias = (colorCombineFlags >>> 4) & 0x03;
                var colorScale = (colorCombineFlags >>> 6) & 0x03;
                var colorClamp = !!(colorCombineFlags >>> 8);
                var colorRegId = (colorCombineFlags >>> 9) & 0x03;
                var alphaOp = (alphaCombineFlags >>> 0) & 0x0F;
                var alphaBias = (alphaCombineFlags >>> 4) & 0x03;
                var alphaScale = (alphaCombineFlags >>> 6) & 0x03;
                var alphaClamp = !!(alphaCombineFlags >>> 8);
                var alphaRegId = (alphaCombineFlags >>> 9) & 0x03;
                var texCoordId = view.getUint8(tevOrderTableOffs + 0x03);
                var texMap = view.getUint8(tevOrderTableOffs + 0x02);
                var index_4 = j;
                var tevStage = {
                    index: index_4,
                    colorInA: colorInA, colorInB: colorInB, colorInC: colorInC, colorInD: colorInD, colorOp: colorOp, colorBias: colorBias, colorScale: colorScale, colorClamp: colorClamp, colorRegId: colorRegId,
                    alphaInA: alphaInA, alphaInB: alphaInB, alphaInC: alphaInC, alphaInD: alphaInD, alphaOp: alphaOp, alphaBias: alphaBias, alphaScale: alphaScale, alphaClamp: alphaClamp, alphaRegId: alphaRegId,
                    texCoordId: texCoordId, texMap: texMap, channelId: channelId,
                    konstColorSel: konstColorSel, konstAlphaSel: konstAlphaSel,
                    // We don't use indtex.
                    indTexStage: 0 /* STAGE0 */,
                    indTexMatrix: 0 /* OFF */,
                    indTexFormat: 0 /* _8 */,
                    indTexBiasSel: 0 /* NONE */,
                    indTexWrapS: 0 /* OFF */,
                    indTexWrapT: 0 /* OFF */,
                    indTexAddPrev: false,
                    indTexUseOrigLOD: false,
                };
                tevStages.push(tevStage);
                offs += 0x14;
                tevOrderTableOffs += 0x04;
            }
            // Skip past TEV order table.
            offs = tevOrderTableOffs;
            var texGenCount = view.getUint32(offs);
            util_32.assert(texGenCount <= 8);
            offs += 0x04;
            var texGens = [];
            for (var j = 0; j < texGenCount; j++) {
                var index_5 = j;
                var flags_1 = view.getUint32(offs);
                var type = (flags_1 >>> 0) & 0x0F;
                var source = (flags_1 >>> 4) & 0x0F;
                var matrix = ((flags_1 >>> 9) & 0x1F) + 30;
                var normalize = !!(flags_1 & 14);
                var postMatrix = ((flags_1 >>> 15) & 0x3F) + 64;
                texGens.push({ index: index_5, type: type, source: source, matrix: matrix, normalize: normalize, postMatrix: postMatrix });
                offs += 0x04;
            }
            var uvAnimations = [];
            var uvAnimationsSize = view.getUint32(offs + 0x00);
            var uvAnimationsCount = view.getUint32(offs + 0x04);
            offs += 0x08;
            for (var j = 0; j < uvAnimationsCount; j++) {
                var type = view.getUint32(offs + 0x00);
                offs += 0x04;
                switch (type) {
                    case 0 /* INV_MAT_SKY */:
                    case 1 /* INV_MAT */:
                    case 6 /* MODEL_MAT */:
                        uvAnimations.push({ type: type });
                        // These guys have no parameters.
                        break;
                    case 2 /* UV_SCROLL */: {
                        var offsetA = view.getUint32(offs + 0x00);
                        var offsetB = view.getUint32(offs + 0x04);
                        var scaleA = view.getUint32(offs + 0x08);
                        var scaleB = view.getUint32(offs + 0x0C);
                        uvAnimations.push({ type: type, offsetA: offsetA, offsetB: offsetB, scaleA: scaleA, scaleB: scaleB });
                        offs += 0x10;
                        break;
                    }
                    case 3 /* ROTATION */: {
                        var offset = view.getUint32(offs + 0x00);
                        var scale = view.getUint32(offs + 0x04);
                        uvAnimations.push({ type: type, offset: offset, scale: scale });
                        offs += 0x08;
                        break;
                    }
                    case 4 /* FLIPBOOK_U */:
                    case 5 /* FLIPBOOK_V */: {
                        var scale = view.getUint32(offs + 0x00);
                        var numFrames = view.getUint32(offs + 0x04);
                        var step = view.getUint32(offs + 0x08);
                        var offset = view.getUint32(offs + 0x0C);
                        uvAnimations.push({ type: type, scale: scale, numFrames: numFrames, step: step, offset: offset });
                        offs += 0x10;
                        break;
                    }
                    case 7 /* CYLINDER */: {
                        var theta = view.getUint32(offs + 0x00);
                        var phi = view.getUint32(offs + 0x04);
                        uvAnimations.push({ type: type, theta: theta, phi: phi });
                        offs += 0x08;
                        break;
                    }
                }
            }
            var index = i;
            var translucent = flags & 16 /* IS_TRANSPARENT */;
            var name_16 = "PrimeGen_" + i;
            var cullMode = 2 /* BACK */;
            var colorRegisters = [];
            colorRegisters.push(new GX_Material.Color(1, 1, 1, 0));
            colorRegisters.push(new GX_Material.Color(1, 1, 1, 0));
            colorRegisters.push(new GX_Material.Color(0, 0, 0, 0));
            colorRegisters.push(new GX_Material.Color(0, 0, 0, 0));
            var alphaTest = {
                op: 1 /* OR */,
                compareA: 4 /* GREATER */,
                referenceA: 0.25,
                compareB: 0 /* NEVER */,
                referenceB: 0,
            };
            var blendMode = {
                type: translucent ? 1 /* BLEND */ : 0 /* NONE */,
                srcFactor: blendSrcFactor,
                dstFactor: blendDstFactor,
                logicOp: 0 /* CLEAR */,
            };
            var ropInfo = {
                blendMode: blendMode,
                depthTest: true,
                depthFunc: 1 /* LESS */,
                depthWrite: (!!(flags & 128 /* DEPTH_WRITE */)) && !translucent,
            };
            var gxMaterial = {
                index: index, name: name_16,
                cullMode: cullMode,
                colorRegisters: colorRegisters,
                colorConstants: colorConstants,
                lightChannels: lightChannels,
                texGens: texGens,
                tevStages: tevStages,
                alphaTest: alphaTest,
                ropInfo: ropInfo,
                indTexStages: [],
            };
            materials.push({ flags: flags, groupIndex: groupIndex, textureIndexes: textureIndexes, vtxAttrFormat: vtxAttrFormat, gxMaterial: gxMaterial, uvAnimations: uvAnimations });
            util_32.assert((offs - materialsStart) === materialEndTable[i]);
        }
        return { textures: textures, textureRemapTable: textureRemapTable, materials: materials };
    }
    function readIndex(view, offs, type) {
        switch (type) {
            case 0 /* U8 */:
            case 1 /* S8 */:
                return view.getUint8(offs);
            case 2 /* U16 */:
            case 3 /* S16 */:
                return view.getUint16(offs);
            default:
                throw new Error("Unknown index data type " + type + "!");
        }
    }
    function parseGeometry(resourceSystem, buffer, materialSet, sectionTables, sectionIndex) {
        var sectionOffsTable = sectionTables.dataSectionOffsTable;
        var sectionSizeTable = sectionTables.dataSectionSizeTable;
        var view = buffer.createDataView();
        var posSectionOffs = sectionOffsTable[sectionIndex++];
        var nrmSectionOffs = sectionOffsTable[sectionIndex++];
        var colSectionOffs = sectionOffsTable[sectionIndex++];
        var uvfSectionOffs = sectionOffsTable[sectionIndex++];
        var uvsSectionOffs = sectionOffsTable[sectionIndex++];
        var surfaceTableOffs = sectionOffsTable[sectionIndex++];
        var firstSurfaceOffs = sectionOffsTable[sectionIndex];
        var surfaceCount = view.getUint32(surfaceTableOffs + 0x00);
        var surfaces = [];
        var _loop_8 = function (i) {
            var surfaceOffs = sectionOffsTable[sectionIndex];
            var surfaceEnd = firstSurfaceOffs + view.getUint32(surfaceTableOffs + 0x04 + i * 0x04);
            var centerX = view.getFloat32(surfaceOffs + 0x00);
            var centerY = view.getFloat32(surfaceOffs + 0x04);
            var centerZ = view.getFloat32(surfaceOffs + 0x08);
            var materialIndex = view.getUint32(surfaceOffs + 0x0C);
            var mantissa = view.getUint16(surfaceOffs + 0x10);
            var displayListSizeExceptNotReally = view.getUint16(surfaceOffs + 0x12);
            var extraDataSize = view.getUint32(surfaceOffs + 0x1C);
            var normalX = view.getFloat32(surfaceOffs + 0x20);
            var normalY = view.getFloat32(surfaceOffs + 0x24);
            var normalZ = view.getFloat32(surfaceOffs + 0x28);
            // XXX(jstpierre): 0x30 or 0x2C?
            var surfaceHeaderEnd = surfaceOffs + 0x2C + extraDataSize;
            var primitiveDataOffs = util_32.align(surfaceHeaderEnd, 32);
            // Build our vertex format.
            var material = materialSet.materials[materialIndex];
            var vtxAttrFormat = material.vtxAttrFormat;
            var packedVertexSize = 0;
            var vertexIndexSize = 0;
            try {
                for (var vtxAttrFormats_1 = __values(vtxAttrFormats), vtxAttrFormats_1_1 = vtxAttrFormats_1.next(); !vtxAttrFormats_1_1.done; vtxAttrFormats_1_1 = vtxAttrFormats_1.next()) {
                    var format = vtxAttrFormats_1_1.value;
                    if (!(vtxAttrFormat & format.mask))
                        continue;
                    packedVertexSize += format.compCount;
                    vertexIndexSize += 0x02;
                }
            }
            catch (e_53_1) { e_53 = { error: e_53_1 }; }
            finally {
                try {
                    if (vtxAttrFormats_1_1 && !vtxAttrFormats_1_1.done && (_a = vtxAttrFormats_1.return)) _a.call(vtxAttrFormats_1);
                }
                finally { if (e_53) throw e_53.error; }
            }
            var totalVertexCount = 0;
            var totalTriangleCount = 0;
            var drawCallIdx = primitiveDataOffs;
            var drawCalls = [];
            while (true) {
                if (drawCallIdx >= surfaceEnd)
                    break;
                var cmd = view.getUint8(drawCallIdx);
                if (cmd === 0x00)
                    break;
                var primType = cmd & 0xF8;
                var vertexFormat = cmd & 0x07;
                var vertexCount = view.getUint16(drawCallIdx + 0x01);
                drawCallIdx += 0x03;
                var srcOffs = drawCallIdx;
                var first = totalVertexCount;
                totalVertexCount += vertexCount;
                switch (primType) {
                    case 144 /* TRIANGLES */:
                        totalTriangleCount += vertexCount;
                        break;
                    case 160 /* TRIANGLEFAN */:
                    case 152 /* TRIANGLESTRIP */:
                        totalTriangleCount += (vertexCount - 2);
                        break;
                    default:
                        throw "whoops";
                }
                drawCalls.push({ primType: primType, vertexFormat: vertexFormat, srcOffs: srcOffs, vertexCount: vertexCount });
                // Skip over the index data.
                drawCallIdx += vertexIndexSize * vertexCount;
            }
            // Make sure the whole thing fits in 16 bits.
            util_32.assert(totalVertexCount <= 0xFFFF);
            // Now make the data.
            var indexDataIdx = 0;
            var indexData = new Uint16Array(totalTriangleCount * 3);
            var vertexId = 0;
            var packedDataSize = packedVertexSize * totalVertexCount;
            var packedDataView = new Float32Array(packedDataSize);
            var littleEndian = endian_3.isLittleEndian();
            var packedDataOffs = 0;
            drawCalls.forEach(function (drawCall) {
                // Convert topology to triangles.
                var firstVertex = vertexId;
                // First triangle is the same for all topo.
                for (var i_3 = 0; i_3 < 3; i_3++)
                    indexData[indexDataIdx++] = vertexId++;
                switch (drawCall.primType) {
                    case 144 /* TRIANGLES */:
                        for (var i_4 = 3; i_4 < drawCall.vertexCount; i_4++) {
                            indexData[indexDataIdx++] = vertexId++;
                        }
                        break;
                    case 152 /* TRIANGLESTRIP */:
                        for (var i_5 = 3; i_5 < drawCall.vertexCount; i_5++) {
                            indexData[indexDataIdx++] = vertexId - ((i_5 & 1) ? 1 : 2);
                            indexData[indexDataIdx++] = vertexId - ((i_5 & 1) ? 2 : 1);
                            indexData[indexDataIdx++] = vertexId++;
                        }
                        break;
                    case 160 /* TRIANGLEFAN */:
                        for (var i_6 = 3; i_6 < drawCall.vertexCount; i_6++) {
                            indexData[indexDataIdx++] = firstVertex;
                            indexData[indexDataIdx++] = vertexId - 1;
                            indexData[indexDataIdx++] = vertexId++;
                        }
                        break;
                }
                util_32.assert((vertexId - firstVertex) === drawCall.vertexCount);
                var drawCallIdx = drawCall.srcOffs;
                for (var j = 0; j < drawCall.vertexCount; j++) {
                    // Copy attribute data.
                    var packedDataOffs_ = packedDataOffs;
                    for (var k = 0; k < vtxAttrFormats.length; k++) {
                        var format = vtxAttrFormats[k];
                        var packedDataOffs__ = packedDataOffs;
                        if (!(vtxAttrFormat & format.mask))
                            continue;
                        var index = readIndex(view, drawCallIdx, 2 /* U16 */);
                        var indexDataSize = 2;
                        drawCallIdx += indexDataSize;
                        var vertexFormat = drawCall.vertexFormat;
                        switch (format.vtxAttrib) {
                            case 9 /* POS */:
                                packedDataView[packedDataOffs++] = view.getFloat32(posSectionOffs + ((index * 3) + 0) * 0x04);
                                packedDataView[packedDataOffs++] = view.getFloat32(posSectionOffs + ((index * 3) + 1) * 0x04);
                                packedDataView[packedDataOffs++] = view.getFloat32(posSectionOffs + ((index * 3) + 2) * 0x04);
                                break;
                            case 10 /* NRM */:
                                // GX_VTXFMT0 | GX_VA_NRM = GX_F32
                                // GX_VTXFMT1 | GX_VA_NRM = GX_S16
                                // GX_VTXFMT2 | GX_VA_NRM = GX_S16
                                switch (vertexFormat) {
                                    case 0 /* VTXFMT0 */:
                                        packedDataView[packedDataOffs++] = view.getFloat32(nrmSectionOffs + ((index * 3) + 0) * 0x04);
                                        packedDataView[packedDataOffs++] = view.getFloat32(nrmSectionOffs + ((index * 3) + 1) * 0x04);
                                        packedDataView[packedDataOffs++] = view.getFloat32(nrmSectionOffs + ((index * 3) + 2) * 0x04);
                                        break;
                                    case 1 /* VTXFMT1 */:
                                    case 2 /* VTXFMT2 */:
                                        packedDataView[packedDataOffs++] = view.getUint16(nrmSectionOffs + ((index * 3) + 0) * 0x02) / mantissa;
                                        packedDataView[packedDataOffs++] = view.getUint16(nrmSectionOffs + ((index * 3) + 1) * 0x02) / mantissa;
                                        packedDataView[packedDataOffs++] = view.getUint16(nrmSectionOffs + ((index * 3) + 2) * 0x02) / mantissa;
                                        break;
                                }
                                break;
                            case 11 /* CLR0 */:
                            case 12 /* CLR1 */:
                                packedDataView[packedDataOffs++] = view.getUint8(colSectionOffs + ((index * 4) + 0) * 0x04);
                                packedDataView[packedDataOffs++] = view.getUint8(colSectionOffs + ((index * 4) + 1) * 0x04);
                                packedDataView[packedDataOffs++] = view.getUint8(colSectionOffs + ((index * 4) + 2) * 0x04);
                                packedDataView[packedDataOffs++] = view.getUint8(colSectionOffs + ((index * 4) + 3) * 0x04);
                                break;
                            case 13 /* TEX0 */:
                                // GX_VTXFMT0 | GX_VA_TEX0 = GX_F32
                                // GX_VTXFMT1 | GX_VA_TEX0 = GX_F32
                                // GX_VTXFMT2 | GX_VA_TEX0 = GX_S16
                                switch (vertexFormat) {
                                    case 0 /* VTXFMT0 */:
                                    case 1 /* VTXFMT1 */:
                                        packedDataView[packedDataOffs++] = view.getFloat32(uvfSectionOffs + ((index * 2) + 0) * 0x04);
                                        packedDataView[packedDataOffs++] = view.getFloat32(uvfSectionOffs + ((index * 2) + 1) * 0x04);
                                        break;
                                    case 2 /* VTXFMT2 */:
                                        packedDataView[packedDataOffs++] = view.getUint16(uvsSectionOffs + ((index * 2) + 0) * 0x02) / mantissa;
                                        packedDataView[packedDataOffs++] = view.getUint16(uvsSectionOffs + ((index * 2) + 1) * 0x02) / mantissa;
                                        break;
                                }
                                break;
                            case 14 /* TEX1 */:
                            case 15 /* TEX2 */:
                            case 16 /* TEX3 */:
                            case 17 /* TEX4 */:
                            case 18 /* TEX5 */:
                            case 19 /* TEX6 */:
                                packedDataView[packedDataOffs++] = view.getFloat32(uvfSectionOffs + ((index * 2) + 0) * 0x04);
                                packedDataView[packedDataOffs++] = view.getFloat32(uvfSectionOffs + ((index * 2) + 1) * 0x04);
                                break;
                        }
                        util_32.assert((packedDataOffs - packedDataOffs__) === format.compCount);
                    }
                    util_32.assert((packedDataOffs - packedDataOffs_) === packedVertexSize);
                }
            });
            var surface = {
                materialIndex: materialIndex,
                vtxAttrFormat: vtxAttrFormat,
                packedVertexSize: packedVertexSize,
                packedData: packedDataView,
                indexData: indexData,
                numTriangles: totalTriangleCount,
            };
            surfaces.push(surface);
            sectionIndex++;
            var e_53, _a;
        };
        for (var i = 0; i < surfaceCount; i++) {
            _loop_8(i);
        }
        var geometry = { surfaces: surfaces };
        return [geometry, sectionIndex];
    }
    function parse(resourceSystem, buffer) {
        var view = buffer.createDataView();
        util_32.assert(view.getUint32(0x00) === 0xDEADBEEF);
        var version = view.getUint32(0x04);
        util_32.assert(version === 0x0F);
        // 0x10 - 0x34: Transform matrix
        var worldModelCount = view.getUint32(0x38);
        var dataSectionCount = view.getUint32(0x3C);
        var worldGeometrySectionIndex = view.getUint32(0x40);
        var dataSectionSizeTable = [];
        var dataSectionSizeTableIdx = 0x60;
        for (var i = 0; i < dataSectionCount; i++) {
            var size = view.getUint32(dataSectionSizeTableIdx + 0x00);
            dataSectionSizeTable.push(size);
            dataSectionSizeTableIdx += 0x04;
        }
        var firstDataSectionOffs = util_32.align(dataSectionSizeTableIdx, 32);
        var dataSectionOffsTable = [firstDataSectionOffs];
        for (var i = 1; i < dataSectionCount; i++) {
            var prevOffs = dataSectionOffsTable[i - 1];
            var prevSize = dataSectionSizeTable[i - 1];
            dataSectionOffsTable.push(util_32.align(prevOffs + prevSize, 32));
        }
        // In practice.
        util_32.assert(worldGeometrySectionIndex === 0);
        // The materials section is always the first index in the world geometry section indexes...
        var materialSectionOffs = dataSectionOffsTable[worldGeometrySectionIndex + 0];
        // Parse out materials.
        var materialSet = parseMaterialSet(resourceSystem, buffer, materialSectionOffs);
        // Now do geometry.
        var sectionTables = { dataSectionOffsTable: dataSectionOffsTable, dataSectionSizeTable: dataSectionSizeTable };
        var geometrySectionIndex = worldGeometrySectionIndex + 1;
        var worldModels = [];
        for (var i = 0; i < worldModelCount; i++) {
            // World model header.
            var worldModelHeaderOffs = dataSectionOffsTable[geometrySectionIndex];
            var visorFlags = view.getUint32(worldModelHeaderOffs + 0x00);
            worldModelHeaderOffs += 4 * 12; // World transform matrix
            worldModelHeaderOffs += 4 * 6; // AABB
            geometrySectionIndex += 1;
            var worldModelGeometry = void 0;
            _a = __read(parseGeometry(resourceSystem, buffer, materialSet, sectionTables, geometrySectionIndex), 2), worldModelGeometry = _a[0], geometrySectionIndex = _a[1];
            worldModels.push(worldModelGeometry);
        }
        return { materialSet: materialSet, worldModels: worldModels };
        var _a;
    }
    exports_56("parse", parse);
    var GX_Material, util_32, endian_3, vtxAttrFormats;
    return {
        setters: [
            function (GX_Material_4) {
                GX_Material = GX_Material_4;
            },
            function (util_32_1) {
                util_32 = util_32_1;
            },
            function (endian_3_1) {
                endian_3 = endian_3_1;
            }
        ],
        execute: function () {
            exports_56("vtxAttrFormats", vtxAttrFormats = [
                { vtxAttrib: 9 /* POS */, mask: 0x00000003, compCount: 3 },
                { vtxAttrib: 10 /* NRM */, mask: 0x0000000C, compCount: 3 },
                { vtxAttrib: 11 /* CLR0 */, mask: 0x00000030, compCount: 4 },
                { vtxAttrib: 12 /* CLR1 */, mask: 0x000000C0, compCount: 4 },
                { vtxAttrib: 13 /* TEX0 */, mask: 0x00000300, compCount: 2 },
                { vtxAttrib: 14 /* TEX1 */, mask: 0x00000C00, compCount: 2 },
                { vtxAttrib: 15 /* TEX2 */, mask: 0x00003000, compCount: 2 },
                { vtxAttrib: 16 /* TEX3 */, mask: 0x0000C000, compCount: 2 },
                { vtxAttrib: 17 /* TEX4 */, mask: 0x00030000, compCount: 2 },
                { vtxAttrib: 18 /* TEX5 */, mask: 0x000C0000, compCount: 2 },
                { vtxAttrib: 19 /* TEX6 */, mask: 0x00300000, compCount: 2 },
            ]);
        }
    };
});
// Implements Retro's STRG (string table resource group) format as seen in Metroid Prime 1.
System.register("metroid_prime/strg", ["util"], function (exports_57, context_57) {
    "use strict";
    var __moduleName = context_57 && context_57.id;
    function readUTF16String(buffer, offs) {
        var arr = buffer.createTypedArray(Uint8Array, offs, 0xFF);
        var raw = utf16Decoder.decode(arr);
        var nul = raw.indexOf('\u0000');
        var str;
        if (nul >= 0)
            str = raw.slice(0, nul);
        else
            str = raw;
        return str;
    }
    function parse(resourceSystem, buffer) {
        var view = buffer.createDataView();
        util_33.assert(view.getUint32(0x00) === 0x87654321);
        var version = view.getUint32(0x04);
        util_33.assert(version === 0x00); // Metroid Prime 1
        var languageCount = view.getUint32(0x08);
        var stringCount = view.getUint32(0x0C);
        var languageTableOffs = 0x10;
        var stringsTableOffs = languageTableOffs + languageCount * 0x08;
        var languageTableIdx = languageTableOffs;
        var strings = [];
        for (var i = 0; i < languageCount; i++) {
            var languageID = util_33.readString(buffer, languageTableIdx + 0x00, 4, false);
            var languageStringsOffs = view.getUint32(languageTableIdx + 0x04);
            languageTableIdx += 0x08;
            // Load English for now because I am a dirty American.
            if (languageID === 'ENGL') {
                var stringTableIdx = stringsTableOffs + languageStringsOffs;
                var stringTableSize = view.getUint32(stringTableIdx + 0x00);
                stringTableIdx += 0x04;
                var stringTableDataOffs = stringTableIdx;
                for (var j = 0; j < stringCount; j++) {
                    var stringOffs = view.getUint32(stringTableIdx);
                    var string = readUTF16String(buffer, stringTableDataOffs + stringOffs);
                    strings.push(string);
                    stringTableIdx += 0x04;
                }
            }
        }
        return { strings: strings };
    }
    exports_57("parse", parse);
    var util_33, utf16Decoder;
    return {
        setters: [
            function (util_33_1) {
                util_33 = util_33_1;
            }
        ],
        execute: function () {
            utf16Decoder = new TextDecoder('utf-16be');
        }
    };
});
// Resource System
System.register("metroid_prime/resource", ["pako", "metroid_prime/mlvl", "metroid_prime/mrea", "metroid_prime/strg", "metroid_prime/txtr", "util", "ArrayBufferSlice"], function (exports_58, context_58) {
    "use strict";
    var __moduleName = context_58 && context_58.id;
    var pako_1, MLVL, MREA, STRG, TXTR, util_34, ArrayBufferSlice_6, FourCCLoaders, ResourceSystem;
    return {
        setters: [
            function (pako_1_1) {
                pako_1 = pako_1_1;
            },
            function (MLVL_1) {
                MLVL = MLVL_1;
            },
            function (MREA_1) {
                MREA = MREA_1;
            },
            function (STRG_1) {
                STRG = STRG_1;
            },
            function (TXTR_1) {
                TXTR = TXTR_1;
            },
            function (util_34_1) {
                util_34 = util_34_1;
            },
            function (ArrayBufferSlice_6_1) {
                ArrayBufferSlice_6 = ArrayBufferSlice_6_1;
            }
        ],
        execute: function () {
            FourCCLoaders = {
                'MLVL': MLVL.parse,
                'MREA': MREA.parse,
                'STRG': STRG.parse,
                'TXTR': TXTR.parse,
            };
            ResourceSystem = /** @class */ (function () {
                function ResourceSystem(paks) {
                    this.paks = paks;
                    this._cache = new Map();
                }
                ResourceSystem.prototype.loadResourceBuffer = function (resource) {
                    if (resource.isCompressed) {
                        var deflated = resource.buffer.createTypedArray(Uint8Array);
                        var inflated = pako_1.default.inflate(deflated);
                        return new ArrayBufferSlice_6.default(inflated.buffer);
                    }
                    else {
                        return resource.buffer;
                    }
                };
                ResourceSystem.prototype.findResourceByID = function (assetID) {
                    util_34.assert(assetID.length === 4);
                    try {
                        for (var _a = __values(this.paks), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var pak = _b.value;
                            var resource = pak.resourceTable.get(assetID);
                            if (resource)
                                return resource;
                        }
                    }
                    catch (e_54_1) { e_54 = { error: e_54_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_54) throw e_54.error; }
                    }
                    return null;
                    var e_54, _c;
                };
                ResourceSystem.prototype.loadAssetByID = function (assetID, fourCC) {
                    var cached = this._cache.get(assetID);
                    if (cached !== undefined)
                        return cached;
                    var loaderFunc = FourCCLoaders[fourCC];
                    if (!loaderFunc)
                        return null;
                    var resource = this.findResourceByID(assetID);
                    util_34.assert(resource.fourCC === fourCC);
                    var buffer = this.loadResourceBuffer(resource);
                    var inst = loaderFunc(this, buffer);
                    this._cache.set(assetID, inst);
                    return inst;
                };
                return ResourceSystem;
            }());
            exports_58("ResourceSystem", ResourceSystem);
        }
    };
});
// Implements Retro's MLVL format as seen in Metroid Prime 1.
System.register("metroid_prime/mlvl", ["util"], function (exports_59, context_59) {
    "use strict";
    var __moduleName = context_59 && context_59.id;
    function parse(resourceSystem, buffer) {
        var view = buffer.createDataView();
        util_35.assert(view.getUint32(0x00) == 0xDEAFBABE);
        var version = view.getUint32(0x04);
        // Version that appears in Metroid Prime 1.
        util_35.assert(version === 0x11);
        // STRG file ID?
        var worldNameSTRGID = util_35.readString(buffer, 0x08, 4, false);
        var worldNameSTRG = resourceSystem.findResourceByID(worldNameSTRGID);
        resourceSystem.loadAssetByID(worldNameSTRGID, 'STRG');
        var worldSaveID = view.getUint32(0x0C);
        var skyboxID = view.getUint32(0x10);
        // Memory Relay junk.
        var memoryRelayTableIdx = 0x14;
        var memoryRelayTableCount = view.getUint32(memoryRelayTableIdx + 0x00);
        memoryRelayTableIdx += 0x04;
        for (var i = 0; i < memoryRelayTableCount; i++) {
            var memoryRelayInstanceID = view.getUint32(memoryRelayTableIdx + 0x00);
            var targetInstanceID = view.getUint32(memoryRelayTableIdx + 0x04);
            var messageType = view.getUint16(memoryRelayTableIdx + 0x08);
            var active = !!view.getUint8(memoryRelayTableIdx + 0x0A);
            memoryRelayTableIdx += 0x0B;
        }
        var areaTableOffs = memoryRelayTableIdx;
        var areaTableCount = view.getUint32(areaTableOffs + 0x00);
        util_35.assert(view.getUint32(areaTableOffs + 0x04) === 0x01);
        var areaTableIdx = areaTableOffs + 0x08;
        var areaTable = [];
        for (var i = 0; i < areaTableCount; i++) {
            var areaSTRGID = util_35.readString(buffer, areaTableIdx, 4, false);
            var areaSTRG = resourceSystem.findResourceByID(areaSTRGID);
            util_35.assert(areaSTRG !== null);
            areaTableIdx += 0x04;
            areaTableIdx += 0x04 * 12; // Transform matrix
            areaTableIdx += 0x04 * 6; // AABB
            var areaMREAID = util_35.readString(buffer, areaTableIdx + 0x00, 4, false);
            var areaMREA = resourceSystem.findResourceByID(areaMREAID);
            util_35.assert(areaMREA !== null);
            var areaInternalID = view.getUint32(areaTableIdx + 0x04);
            areaTableIdx += 0x08;
            var attachedAreaCount = view.getUint32(areaTableIdx + 0x00);
            areaTableIdx += 0x04;
            for (var j = 0; j < attachedAreaCount; j++) {
                areaTableIdx += 0x02; // Attached Area Index Array
            }
            // TODO(jstpierre): Verify with Aruki. Seems to be undocumented?
            areaTableIdx += 0x04;
            var dependencyTableCount = view.getUint32(areaTableIdx);
            areaTableIdx += 0x04;
            for (var j = 0; j < dependencyTableCount; j++) {
                var dependencyID = view.getUint32(areaTableIdx + 0x00);
                var dependencyFOURCC = view.getUint32(areaTableIdx + 0x04);
                areaTableIdx += 0x08;
            }
            var dependencyOffsetTableCount = view.getUint32(areaTableIdx);
            areaTableIdx += 0x04;
            for (var j = 0; j < dependencyOffsetTableCount; j++) {
                var dependencyOffset = view.getUint32(areaTableIdx + 0x00);
                areaTableIdx += 0x04;
            }
            var dockCount = view.getUint32(areaTableIdx);
            areaTableIdx += 0x04;
            for (var j = 0; j < dockCount; j++) {
                var connectingDockCount = view.getUint32(areaTableIdx);
                areaTableIdx += 0x04;
                for (var k = 0; k < connectingDockCount; k++) {
                    var connectingDockAreaIndex = view.getUint32(areaTableIdx + 0x00);
                    var connectingDockDockIndex = view.getUint32(areaTableIdx + 0x04);
                    areaTableIdx += 0x08;
                }
                var dockCoordinateCount = view.getUint32(areaTableIdx);
                areaTableIdx += 0x04;
                for (var k = 0; k < dockCoordinateCount; k++) {
                    areaTableIdx += 0x0C; // xyz floats
                }
            }
            areaTable.push({ areaSTRGID: areaSTRGID, areaMREAID: areaMREAID });
        }
        return { areaTable: areaTable };
    }
    exports_59("parse", parse);
    var util_35;
    return {
        setters: [
            function (util_35_1) {
                util_35 = util_35_1;
            }
        ],
        execute: function () {
        }
    };
});
//
System.register("metroid_prime/render", ["gl-matrix", "metroid_prime/mrea", "gx/gx_texture", "gx/gx_material", "render", "util", "ArrayBufferSlice"], function (exports_60, context_60) {
    "use strict";
    var __moduleName = context_60 && context_60.id;
    var gl_matrix_11, mrea_1, GX_Texture, GX_Material, render_23, util_36, ArrayBufferSlice_7, sceneParamsData, attrScaleData, textureScratch, Scene, Command_Surface, fixPrimeUsingTheWrongConventionYesIKnowItsFromMayaButMayaIsStillWrong, materialParamsSize, packetParamsOffs, packetParamsSize, paramsData, Command_Material;
    return {
        setters: [
            function (gl_matrix_11_1) {
                gl_matrix_11 = gl_matrix_11_1;
            },
            function (mrea_1_1) {
                mrea_1 = mrea_1_1;
            },
            function (GX_Texture_3) {
                GX_Texture = GX_Texture_3;
            },
            function (GX_Material_5) {
                GX_Material = GX_Material_5;
            },
            function (render_23_1) {
                render_23 = render_23_1;
            },
            function (util_36_1) {
                util_36 = util_36_1;
            },
            function (ArrayBufferSlice_7_1) {
                ArrayBufferSlice_7 = ArrayBufferSlice_7_1;
            }
        ],
        execute: function () {
            sceneParamsData = new Float32Array(4 * 4 + GX_Material.scaledVtxAttributes.length + 4);
            attrScaleData = new Float32Array(GX_Material.scaledVtxAttributes.map(function () { return 1; }));
            // Cheap bad way to do a scale up.
            attrScaleData[0] = 10.0;
            textureScratch = new Int32Array(8);
            Scene = /** @class */ (function () {
                function Scene(gl, mrea) {
                    var _this = this;
                    this.mrea = mrea;
                    this.textures = [];
                    this.glTextures = [];
                    this.materialCommands = [];
                    this.surfaceCommands = [];
                    var textureSet = this.mrea.materialSet.textures;
                    this.glTextures = textureSet.map(function (txtr) { return Scene.translateTexture(gl, txtr); });
                    this.translateModel(gl);
                    this.sceneParamsBuffer = gl.createBuffer();
                    this.textures = textureSet.map(function (txtr, i) { return _this.translateTXTRToViewer("Texture" + i, txtr); });
                }
                Scene.translateTexture = function (gl, texture) {
                    var texId = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, texId);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, texture.mipCount - 1);
                    var ext_compressed_texture_s3tc = gl.getExtension('WEBGL_compressed_texture_s3tc');
                    var format = texture.format;
                    var offs = 0, width = texture.width, height = texture.height;
                    for (var i = 0; i < texture.mipCount; i++) {
                        var name_17 = "";
                        var size = GX_Texture.calcTextureSize(format, width, height);
                        var data = texture.data.subarray(offs, size);
                        var surface = { name: name_17, format: format, width: width, height: height, data: data };
                        var decodedTexture = GX_Texture.decodeTexture(surface, !!ext_compressed_texture_s3tc);
                        if (decodedTexture.type === 'RGBA') {
                            gl.texImage2D(gl.TEXTURE_2D, i, gl.RGBA8, decodedTexture.width, decodedTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, decodedTexture.pixels);
                        }
                        else if (decodedTexture.type === 'S3TC') {
                            gl.compressedTexImage2D(gl.TEXTURE_2D, i, ext_compressed_texture_s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT, decodedTexture.width, decodedTexture.height, 0, decodedTexture.pixels);
                        }
                        offs += size;
                        width /= 2;
                        height /= 2;
                    }
                    return texId;
                };
                Scene.prototype.coalesceSurfaces = function () {
                    // XXX(jstpierre): TODO: Coalesce surfaces with the same material ID
                    // into the same draw call. Seems to happen quite a lot, actually.
                    var surfaces = [];
                    this.mrea.worldModels.forEach(function (worldModel) {
                        worldModel.surfaces.forEach(function (surface) {
                            surfaces.push(surface);
                        });
                    });
                    return surfaces;
                };
                Scene.prototype.translateModel = function (gl) {
                    var _this = this;
                    // Pull out the first material of each group, which should be identical except for textures.
                    var groupMaterials = [];
                    for (var i_7 = 0; i_7 < this.mrea.materialSet.materials.length; i_7++) {
                        var material = this.mrea.materialSet.materials[i_7];
                        if (!groupMaterials[material.groupIndex])
                            groupMaterials[material.groupIndex] = material;
                    }
                    this.materialCommands = groupMaterials.map(function (material) {
                        return new Command_Material(gl, _this, material);
                    });
                    var vertexDatas = [];
                    var indexDatas = [];
                    var surfaces = this.coalesceSurfaces();
                    surfaces.forEach(function (surface) {
                        vertexDatas.push(new ArrayBufferSlice_7.default(surface.packedData.buffer));
                        indexDatas.push(new ArrayBufferSlice_7.default(surface.indexData.buffer));
                    });
                    this.bufferCoalescer = new render_23.BufferCoalescer(gl, vertexDatas, indexDatas);
                    var i = 0;
                    surfaces.forEach(function (surface) {
                        _this.surfaceCommands.push(new Command_Surface(gl, surface, _this.bufferCoalescer.coalescedBuffers[i]));
                        ++i;
                    });
                };
                Scene.prototype.translateTXTRToViewer = function (name, texture) {
                    var surfaces = [];
                    var width = texture.width, height = texture.height, offs = 0;
                    var format = texture.format;
                    for (var i = 0; i < texture.mipCount; i++) {
                        var name_18 = "";
                        var size = GX_Texture.calcTextureSize(format, width, height);
                        var data = texture.data.subarray(offs, size);
                        var surface = { name: name_18, format: format, width: width, height: height, data: data };
                        var rgbaTexture = GX_Texture.decodeTexture(surface, false);
                        // Should never happen.
                        if (rgbaTexture.type === 'S3TC')
                            throw "whoops";
                        var canvas = document.createElement('canvas');
                        canvas.width = rgbaTexture.width;
                        canvas.height = rgbaTexture.height;
                        var ctx = canvas.getContext('2d');
                        var imgData = new ImageData(rgbaTexture.width, rgbaTexture.height);
                        imgData.data.set(new Uint8Array(rgbaTexture.pixels.buffer));
                        ctx.putImageData(imgData, 0, 0);
                        surfaces.push(canvas);
                        offs += size;
                        width /= 2;
                        height /= 2;
                    }
                    return { name: "" + name, surfaces: surfaces };
                };
                Scene.prototype.bindTextures = function (state, material) {
                    var gl = state.gl;
                    var prog = state.currentProgram;
                    // Bind textures.
                    for (var i = 0; i < material.textureIndexes.length; i++) {
                        var textureIndex = material.textureIndexes[i];
                        if (textureIndex === -1)
                            continue;
                        var texture = this.glTextures[this.mrea.materialSet.textureRemapTable[textureIndex]];
                        gl.activeTexture(gl.TEXTURE0 + i);
                        gl.bindTexture(gl.TEXTURE_2D, texture);
                        textureScratch[i] = i;
                    }
                    gl.uniform1iv(prog.u_Texture, textureScratch);
                };
                Scene.prototype.render = function (state) {
                    var _this = this;
                    var gl = state.gl;
                    // Update our SceneParams UBO.
                    var offs = 0;
                    sceneParamsData.set(state.projection, offs);
                    offs += 4 * 4;
                    sceneParamsData.set(attrScaleData, offs);
                    offs += GX_Material.scaledVtxAttributes.length;
                    sceneParamsData[offs++] = GX_Material.getTextureLODBias(state);
                    gl.bindBuffer(gl.UNIFORM_BUFFER, this.sceneParamsBuffer);
                    gl.bufferData(gl.UNIFORM_BUFFER, sceneParamsData, gl.DYNAMIC_DRAW);
                    var currentMaterialIndex = -1;
                    var currentGroupIndex = -1;
                    var surfaces = this.surfaceCommands;
                    surfaces.forEach(function (surfaceCmd) {
                        var materialIndex = surfaceCmd.surface.materialIndex;
                        var material = _this.mrea.materialSet.materials[materialIndex];
                        // Don't render occluder meshes.
                        if (material.flags & 512 /* OCCLUDER */)
                            return;
                        if (currentMaterialIndex !== materialIndex) {
                            var groupIndex = _this.mrea.materialSet.materials[materialIndex].groupIndex;
                            if (groupIndex !== currentGroupIndex) {
                                var materialCommand = _this.materialCommands[groupIndex];
                                materialCommand.exec(state);
                                currentGroupIndex = groupIndex;
                            }
                            _this.bindTextures(state, material);
                            currentMaterialIndex = materialIndex;
                        }
                        surfaceCmd.exec(state);
                    });
                };
                Scene.prototype.destroy = function (gl) {
                    this.glTextures.forEach(function (texture) { return gl.deleteTexture(texture); });
                    this.materialCommands.forEach(function (cmd) { return cmd.destroy(gl); });
                    this.surfaceCommands.forEach(function (cmd) { return cmd.destroy(gl); });
                    this.bufferCoalescer.destroy(gl);
                    gl.deleteBuffer(this.sceneParamsBuffer);
                };
                return Scene;
            }());
            exports_60("Scene", Scene);
            Command_Surface = /** @class */ (function () {
                function Command_Surface(gl, surface, coalescedBuffers) {
                    this.surface = surface;
                    this.coalescedBuffers = coalescedBuffers;
                    this.vao = gl.createVertexArray();
                    gl.bindVertexArray(this.vao);
                    gl.bindBuffer(gl.ARRAY_BUFFER, coalescedBuffers.vertexBuffer.buffer);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coalescedBuffers.indexBuffer.buffer);
                    var offset = 0;
                    try {
                        for (var vtxAttrFormats_2 = __values(mrea_1.vtxAttrFormats), vtxAttrFormats_2_1 = vtxAttrFormats_2.next(); !vtxAttrFormats_2_1.done; vtxAttrFormats_2_1 = vtxAttrFormats_2.next()) {
                            var attrib = vtxAttrFormats_2_1.value;
                            if (!(this.surface.vtxAttrFormat & attrib.mask))
                                continue;
                            var attribLocation = GX_Material.getVertexAttribLocation(attrib.vtxAttrib);
                            gl.enableVertexAttribArray(attribLocation);
                            gl.vertexAttribPointer(attribLocation, attrib.compCount, gl.FLOAT, false, 4 * this.surface.packedVertexSize, coalescedBuffers.vertexBuffer.offset + offset);
                            offset += 4 * attrib.compCount;
                        }
                    }
                    catch (e_55_1) { e_55 = { error: e_55_1 }; }
                    finally {
                        try {
                            if (vtxAttrFormats_2_1 && !vtxAttrFormats_2_1.done && (_a = vtxAttrFormats_2.return)) _a.call(vtxAttrFormats_2);
                        }
                        finally { if (e_55) throw e_55.error; }
                    }
                    gl.bindVertexArray(null);
                    var e_55, _a;
                }
                Command_Surface.prototype.exec = function (state) {
                    var gl = state.gl;
                    gl.bindVertexArray(this.vao);
                    gl.drawElements(gl.TRIANGLES, this.surface.numTriangles * 3, gl.UNSIGNED_SHORT, this.coalescedBuffers.indexBuffer.offset);
                    gl.bindVertexArray(null);
                    state.drawCallCount++;
                };
                Command_Surface.prototype.destroy = function (gl) {
                    gl.deleteVertexArray(this.vao);
                };
                return Command_Surface;
            }());
            fixPrimeUsingTheWrongConventionYesIKnowItsFromMayaButMayaIsStillWrong = gl_matrix_11.mat4.fromValues(1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1);
            materialParamsSize = 4 * 2 + 4 * 8 + 4 * 3 * 10 + 4 * 3 * 20 + 4 * 2 * 3 + 4 * 8;
            packetParamsOffs = util_36.align(materialParamsSize, 64);
            packetParamsSize = 11 * 16;
            paramsData = new Float32Array(packetParamsOffs + packetParamsSize);
            Command_Material = /** @class */ (function () {
                function Command_Material(gl, scene, material) {
                    this.scene = scene;
                    this.material = material;
                    this.program = new GX_Material.GX_Program(this.material.gxMaterial);
                    this.renderFlags = GX_Material.translateRenderFlags(this.material.gxMaterial);
                    this.paramsBuffer = gl.createBuffer();
                }
                Command_Material.prototype.exec = function (state) {
                    var gl = state.gl;
                    state.useProgram(this.program);
                    state.useFlags(this.renderFlags);
                    var offs = 0;
                    // color mat regs not used.
                    offs += 4 * 2;
                    for (var i = 0; i < 8; i++) {
                        var fallbackColor = void 0;
                        if (i >= 4)
                            fallbackColor = this.material.gxMaterial.colorRegisters[i - 4];
                        else
                            fallbackColor = this.material.gxMaterial.colorConstants[i];
                        var color = fallbackColor;
                        paramsData[offs + 4 * i + 0] = color.r;
                        paramsData[offs + 4 * i + 1] = color.g;
                        paramsData[offs + 4 * i + 2] = color.b;
                        paramsData[offs + 4 * i + 3] = color.a;
                    }
                    offs += 4 * 8;
                    // XXX(jstpierre): UV animations.
                    var matrixScratch = Command_Material.matrixScratch;
                    for (var i = 0; i < 10; i++) {
                        var finalMatrix = matrixScratch;
                        paramsData[offs + i * 12 + 0] = finalMatrix[0];
                        paramsData[offs + i * 12 + 1] = finalMatrix[3];
                        paramsData[offs + i * 12 + 2] = finalMatrix[6];
                        paramsData[offs + i * 12 + 3] = 0;
                        paramsData[offs + i * 12 + 4] = finalMatrix[1];
                        paramsData[offs + i * 12 + 5] = finalMatrix[4];
                        paramsData[offs + i * 12 + 6] = finalMatrix[7];
                        paramsData[offs + i * 12 + 7] = 0;
                        paramsData[offs + i * 12 + 8] = finalMatrix[2];
                        paramsData[offs + i * 12 + 9] = finalMatrix[5];
                        paramsData[offs + i * 12 + 10] = finalMatrix[9];
                        paramsData[offs + i * 12 + 11] = 0;
                    }
                    offs += 4 * 3 * 10;
                    for (var i = 0; i < 20; i++) {
                        var finalMatrix = matrixScratch;
                        paramsData[offs + i * 12 + 0] = finalMatrix[0];
                        paramsData[offs + i * 12 + 1] = finalMatrix[3];
                        paramsData[offs + i * 12 + 2] = finalMatrix[6];
                        paramsData[offs + i * 12 + 3] = 0;
                        paramsData[offs + i * 12 + 4] = finalMatrix[1];
                        paramsData[offs + i * 12 + 5] = finalMatrix[4];
                        paramsData[offs + i * 12 + 6] = finalMatrix[7];
                        paramsData[offs + i * 12 + 7] = 0;
                        paramsData[offs + i * 12 + 8] = finalMatrix[2];
                        paramsData[offs + i * 12 + 9] = finalMatrix[5];
                        paramsData[offs + i * 12 + 10] = finalMatrix[9];
                        paramsData[offs + i * 12 + 11] = 0;
                    }
                    offs += 4 * 3 * 20;
                    // IndTexMtx. Indirect texturing isn't used.
                    offs += 4 * 3 * 2;
                    // Texture parameters. SizeX/SizeY are only used for indtex, and LodBias is always 0.
                    // We can leave this blank.
                    offs += 4 * 8;
                    // MV matrix.
                    offs = packetParamsOffs;
                    paramsData.set(state.updateModelView(), offs);
                    offs += 4 * 4;
                    // Position matrix.
                    paramsData.set(fixPrimeUsingTheWrongConventionYesIKnowItsFromMayaButMayaIsStillWrong, offs);
                    offs += 4 * 4;
                    gl.bindBufferBase(gl.UNIFORM_BUFFER, GX_Material.GX_Program.ub_SceneParams, this.scene.sceneParamsBuffer);
                    gl.bindBuffer(gl.UNIFORM_BUFFER, this.paramsBuffer);
                    gl.bufferData(gl.UNIFORM_BUFFER, paramsData, gl.DYNAMIC_DRAW);
                    gl.bindBufferRange(gl.UNIFORM_BUFFER, GX_Material.GX_Program.ub_MaterialParams, this.paramsBuffer, 0, materialParamsSize * 4);
                    gl.bindBufferRange(gl.UNIFORM_BUFFER, GX_Material.GX_Program.ub_PacketParams, this.paramsBuffer, packetParamsOffs * 4, packetParamsSize * 4);
                };
                Command_Material.prototype.destroy = function (gl) {
                    this.program.destroy(gl);
                    gl.deleteBuffer(this.paramsBuffer);
                };
                Command_Material.attrScaleData = new Float32Array(GX_Material.scaledVtxAttributes.map(function () { return 1; }));
                Command_Material.matrixScratch = gl_matrix_11.mat3.create();
                Command_Material.colorScratch = new Float32Array(4 * 8);
                return Command_Material;
            }());
        }
    };
});
System.register("metroid_prime/scenes", ["metroid_prime/pak", "metroid_prime/resource", "metroid_prime/render", "util", "Progressable"], function (exports_61, context_61) {
    "use strict";
    var __moduleName = context_61 && context_61.id;
    // Files are too big for GitHub.
    function findPakBase() {
        if (document.location.protocol === 'file:') {
            return "data/metroid_prime/mp1/";
        }
        else {
            return "https://funny.computer/cloud/MetroidPrime1/";
        }
    }
    var PAK, resource_1, render_24, util_37, Progressable_8, pakBase, MultiScene, MP1SceneDesc, id, name, sceneDescs, sceneGroup;
    return {
        setters: [
            function (PAK_1) {
                PAK = PAK_1;
            },
            function (resource_1_1) {
                resource_1 = resource_1_1;
            },
            function (render_24_1) {
                render_24 = render_24_1;
            },
            function (util_37_1) {
                util_37 = util_37_1;
            },
            function (Progressable_8_1) {
                Progressable_8 = Progressable_8_1;
            }
        ],
        execute: function () {
            pakBase = findPakBase();
            MultiScene = /** @class */ (function () {
                function MultiScene(scenes) {
                    this.setScenes(scenes);
                }
                MultiScene.prototype.setScenes = function (scenes) {
                    this.scenes = scenes;
                    this.textures = [];
                    try {
                        for (var _a = __values(this.scenes), _b = _a.next(); !_b.done; _b = _a.next()) {
                            var scene = _b.value;
                            this.textures = this.textures.concat(scene.textures);
                        }
                    }
                    catch (e_56_1) { e_56 = { error: e_56_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_56) throw e_56.error; }
                    }
                    var e_56, _c;
                };
                MultiScene.prototype.render = function (renderState) {
                    this.scenes.forEach(function (scene) {
                        scene.render(renderState);
                    });
                };
                MultiScene.prototype.destroy = function (gl) {
                    this.scenes.forEach(function (scene) { return scene.destroy(gl); });
                };
                return MultiScene;
            }());
            exports_61("MultiScene", MultiScene);
            MP1SceneDesc = /** @class */ (function () {
                function MP1SceneDesc(filename, name) {
                    this.filename = filename;
                    this.name = name;
                    this.id = filename;
                }
                MP1SceneDesc.prototype.fetchPak = function (path) {
                    return util_37.fetch(path).then(function (buffer) {
                        return PAK.parse(buffer);
                    });
                };
                MP1SceneDesc.prototype.createScene = function (gl) {
                    var _this = this;
                    var paks = [pakBase + "/" + this.filename, pakBase + "/Strings.pak"];
                    return Progressable_8.default.all(paks.map(function (pakPath) { return _this.fetchPak(pakPath); })).then(function (paks) {
                        var resourceSystem = new resource_1.ResourceSystem(paks);
                        var levelPak = paks[0];
                        try {
                            for (var _a = __values(levelPak.namedResourceTable.values()), _b = _a.next(); !_b.done; _b = _a.next()) {
                                var mlvlEntry = _b.value;
                                util_37.assert(mlvlEntry.fourCC === 'MLVL');
                                var mlvl = resourceSystem.loadAssetByID(mlvlEntry.fileID, mlvlEntry.fourCC);
                                // Crash my browser please.
                                var areas = mlvl.areaTable.slice(0, 10);
                                var scenes = areas.map(function (mreaEntry) {
                                    var mrea = resourceSystem.loadAssetByID(mreaEntry.areaMREAID, 'MREA');
                                    return new render_24.Scene(gl, mrea);
                                });
                                return new MultiScene(scenes);
                            }
                        }
                        catch (e_57_1) { e_57 = { error: e_57_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_57) throw e_57.error; }
                        }
                        return null;
                        var e_57, _c;
                    });
                };
                return MP1SceneDesc;
            }());
            id = "mp1";
            name = "Metroid Prime 1";
            sceneDescs = [
                new MP1SceneDesc("Metroid1.pak", "Space Pirate Frigate"),
                new MP1SceneDesc("Metroid4.pak", "Tallon Overworld"),
            ];
            exports_61("sceneGroup", sceneGroup = { id: id, name: name, sceneDescs: sceneDescs });
        }
    };
});
System.register("main", ["viewer", "ArrayBufferSlice", "Progressable", "j3d/ztp_scenes", "j3d/mkdd_scenes", "j3d/zww_scenes", "j3d/sms_scenes", "j3d/smg_scenes", "sm64ds/scenes", "mdl0/scenes", "zelview/scenes", "oot3d/scenes", "fres/scenes", "dksiv/scenes", "metroid_prime/scenes", "j3d/scenes", "ui"], function (exports_62, context_62) {
    "use strict";
    var __moduleName = context_62 && context_62.id;
    var viewer_1, ArrayBufferSlice_8, Progressable_9, ZTP, MKDD, ZWW, SMS, SMG, SM64DS, MDL0, ZELVIEW, OOT3D, FRES, DKSIV, MP1, J3D, ui_1, sceneGroups, DroppedFileSceneDesc, SceneLoader, Main;
    return {
        setters: [
            function (viewer_1_1) {
                viewer_1 = viewer_1_1;
            },
            function (ArrayBufferSlice_8_1) {
                ArrayBufferSlice_8 = ArrayBufferSlice_8_1;
            },
            function (Progressable_9_1) {
                Progressable_9 = Progressable_9_1;
            },
            function (ZTP_1) {
                ZTP = ZTP_1;
            },
            function (MKDD_1) {
                MKDD = MKDD_1;
            },
            function (ZWW_1) {
                ZWW = ZWW_1;
            },
            function (SMS_1) {
                SMS = SMS_1;
            },
            function (SMG_1) {
                SMG = SMG_1;
            },
            function (SM64DS_1) {
                SM64DS = SM64DS_1;
            },
            function (MDL0_2) {
                MDL0 = MDL0_2;
            },
            function (ZELVIEW_1) {
                ZELVIEW = ZELVIEW_1;
            },
            function (OOT3D_1) {
                OOT3D = OOT3D_1;
            },
            function (FRES_1) {
                FRES = FRES_1;
            },
            function (DKSIV_1) {
                DKSIV = DKSIV_1;
            },
            function (MP1_1) {
                MP1 = MP1_1;
            },
            function (J3D_1) {
                J3D = J3D_1;
            },
            function (ui_1_1) {
                ui_1 = ui_1_1;
            }
        ],
        execute: function () {
            sceneGroups = [
                ZTP.sceneGroup,
                MKDD.sceneGroup,
                ZWW.sceneGroup,
                SMS.sceneGroup,
                SMG.sceneGroup,
                SM64DS.sceneGroup,
                MDL0.sceneGroup,
                ZELVIEW.sceneGroup,
                OOT3D.sceneGroup,
                FRES.sceneGroup,
                DKSIV.sceneGroup,
                MP1.sceneGroup,
            ];
            DroppedFileSceneDesc = /** @class */ (function () {
                function DroppedFileSceneDesc(file) {
                    this.file = file;
                    this.id = file.name;
                    this.name = file.name;
                }
                DroppedFileSceneDesc.prototype._loadFileAsPromise = function (file) {
                    var request = new FileReader();
                    request.readAsArrayBuffer(file);
                    var p = new Promise(function (resolve, reject) {
                        request.onload = function () {
                            var buffer = request.result;
                            var slice = new ArrayBufferSlice_8.default(buffer);
                            resolve(slice);
                        };
                        request.onerror = function () {
                            reject();
                        };
                        request.onprogress = function (e) {
                            if (e.lengthComputable)
                                pr.setProgress(e.loaded / e.total);
                        };
                    });
                    var pr = new Progressable_9.default(p);
                    return pr;
                };
                DroppedFileSceneDesc.prototype.createSceneFromFile = function (gl, file, buffer) {
                    var scene;
                    if (file.name.endsWith('.bfres'))
                        return FRES.createSceneFromFRESBuffer(gl, buffer);
                    scene = J3D.createMultiSceneFromBuffer(gl, buffer);
                    if (scene)
                        return scene;
                    return null;
                };
                DroppedFileSceneDesc.prototype.createScene = function (gl) {
                    var _this = this;
                    return this._loadFileAsPromise(this.file).then(function (result) {
                        return _this.createSceneFromFile(gl, _this.file, result);
                    });
                };
                return DroppedFileSceneDesc;
            }());
            SceneLoader = /** @class */ (function () {
                function SceneLoader(viewer) {
                    this.viewer = viewer;
                }
                SceneLoader.prototype.setScene = function (scene, sceneDesc) {
                    this.currentScene = scene;
                    var cameraControllerClass;
                    if (sceneDesc !== undefined)
                        cameraControllerClass = sceneDesc.defaultCameraController;
                    if (cameraControllerClass === undefined)
                        cameraControllerClass = viewer_1.FPSCameraController;
                    var viewer = this.viewer;
                    viewer.setCameraControllerClass(cameraControllerClass);
                    viewer.setScene(scene);
                    this.onscenechanged();
                };
                SceneLoader.prototype.loadSceneDesc = function (sceneDesc) {
                    var _this = this;
                    this.setScene(null);
                    var gl = this.viewer.renderState.gl;
                    var progressable = sceneDesc.createScene(gl);
                    progressable.then(function (scene) {
                        _this.setScene(scene, sceneDesc);
                    });
                    return progressable;
                };
                return SceneLoader;
            }());
            Main = /** @class */ (function () {
                function Main() {
                    var _this = this;
                    this.canvas = document.createElement('canvas');
                    this.canvas.onmousedown = function () {
                        _this._deselectUI();
                    };
                    this.canvas.ondragover = function (e) {
                        _this.dragHighlight.style.display = 'block';
                        e.preventDefault();
                    };
                    this.canvas.ondragleave = function (e) {
                        _this.dragHighlight.style.display = 'none';
                        e.preventDefault();
                    };
                    this.canvas.ondrop = this._onDrop.bind(this);
                    document.body.appendChild(this.canvas);
                    window.onresize = this._onResize.bind(this);
                    this._onResize();
                    window.addEventListener('keydown', this._onKeyDown.bind(this));
                    this.viewer = new viewer_1.Viewer(this.canvas);
                    this.viewer.start();
                    this.sceneLoader = new SceneLoader(this.viewer);
                    this.sceneLoader.onscenechanged = this._onSceneChanged.bind(this);
                    this._makeUI();
                    this.groups = sceneGroups;
                    this.droppedFileGroup = { id: "drops", name: "Dropped Files", sceneDescs: [] };
                    this.groups.push(this.droppedFileGroup);
                    this._loadSceneGroups();
                    // Load the state from the hash
                    this._loadState(window.location.hash.slice(1));
                    // Make the user choose a scene if there's nothing loaded by default...
                    if (this.currentSceneDesc === undefined)
                        this.ui.sceneSelect.setExpanded(true);
                }
                Main.prototype._deselectUI = function () {
                    this.canvas.focus();
                };
                Main.prototype._onDrop = function (e) {
                    this.dragHighlight.style.display = 'none';
                    e.preventDefault();
                    var transfer = e.dataTransfer;
                    var file = transfer.files[0];
                    var sceneDesc = new DroppedFileSceneDesc(file);
                    this.droppedFileGroup.sceneDescs.push(sceneDesc);
                    this._loadSceneGroups();
                    this._loadSceneDesc(this.droppedFileGroup, sceneDesc);
                };
                Main.prototype._onResize = function () {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                };
                Main.prototype._loadState = function (state) {
                    var _a = __read(state.split('/')), groupId = _a[0], sceneRest = _a.slice(1);
                    var sceneId = decodeURIComponent(sceneRest.join('/'));
                    var group = this.groups.find(function (g) { return g.id === groupId; });
                    if (!group)
                        return;
                    var desc = group.sceneDescs.find(function (d) { return d.id === sceneId; });
                    var hasDesc = desc !== undefined;
                    this._loadSceneDesc(group, desc);
                };
                Main.prototype._saveState = function () {
                    var groupId = this.currentSceneGroup.id;
                    var sceneId = this.currentSceneDesc.id;
                    return groupId + "/" + sceneId;
                };
                Main.prototype._onSceneChanged = function () {
                    var scene = this.viewer.scene;
                    this.ui.sceneChanged();
                    if (scene && scene.createPanels)
                        this.ui.setScenePanels(scene.createPanels());
                    else
                        this.ui.setScenePanels([]);
                };
                Main.prototype._onSceneDescSelected = function (sceneGroup, sceneDesc) {
                    this._loadSceneDesc(sceneGroup, sceneDesc);
                };
                Main.prototype._loadSceneDesc = function (sceneGroup, sceneDesc) {
                    if (this.currentSceneDesc === sceneDesc)
                        return;
                    this.currentSceneGroup = sceneGroup;
                    this.currentSceneDesc = sceneDesc;
                    this.ui.sceneSelect.setCurrentDesc(this.currentSceneGroup, this.currentSceneDesc);
                    var progressable = this.sceneLoader.loadSceneDesc(sceneDesc);
                    this.ui.sceneSelect.setProgressable(progressable);
                    this._deselectUI();
                    window.history.replaceState('', '', '#' + this._saveState());
                };
                Main.prototype._loadSceneGroups = function () {
                    this.ui.sceneSelect.setSceneGroups(this.groups);
                };
                Main.prototype._makeUI = function () {
                    this.uiContainers = document.createElement('div');
                    document.body.appendChild(this.uiContainers);
                    this.ui = new ui_1.UI(this.viewer);
                    this.ui.elem.style.position = 'absolute';
                    this.ui.elem.style.left = '2em';
                    this.ui.elem.style.top = '2em';
                    this.uiContainers.appendChild(this.ui.elem);
                    this.ui.sceneSelect.onscenedescselected = this._onSceneDescSelected.bind(this);
                    this.dragHighlight = document.createElement('div');
                    this.uiContainers.appendChild(this.dragHighlight);
                    this.dragHighlight.style.position = 'absolute';
                    this.dragHighlight.style.left = '0';
                    this.dragHighlight.style.right = '0';
                    this.dragHighlight.style.top = '0';
                    this.dragHighlight.style.bottom = '0';
                    this.dragHighlight.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                    this.dragHighlight.style.boxShadow = '0 0 40px 5px white inset';
                    this.dragHighlight.style.display = 'none';
                    this.dragHighlight.style.pointerEvents = 'none';
                };
                Main.prototype._toggleUI = function () {
                    this.uiContainers.style.display = this.uiContainers.style.display === 'none' ? '' : 'none';
                };
                Main.prototype._onKeyDown = function (e) {
                    if (e.key === 'z') {
                        this._toggleUI();
                        e.preventDefault();
                    }
                };
                return Main;
            }());
            window.main = new Main();
        }
    };
});
System.register("embeds/main", ["viewer"], function (exports_63, context_63) {
    "use strict";
    var __moduleName = context_63 && context_63.id;
    var Viewer, FsButton, Main;
    return {
        setters: [
            function (Viewer_3) {
                Viewer = Viewer_3;
            }
        ],
        execute: function () {
            FsButton = /** @class */ (function () {
                function FsButton() {
                    var _this = this;
                    this.hover = false;
                    this.elem = document.createElement('div');
                    this.elem.style.border = '1px solid rgba(255, 255, 255, 0.4)';
                    this.elem.style.borderRadius = '4px';
                    this.elem.style.color = 'white';
                    this.elem.style.position = 'absolute';
                    this.elem.style.bottom = '8px';
                    this.elem.style.right = '8px';
                    this.elem.style.width = '32px';
                    this.elem.style.height = '32px';
                    this.elem.style.font = '130% bold sans-serif';
                    this.elem.style.textAlign = 'center';
                    this.elem.style.cursor = 'pointer';
                    this.elem.onmouseover = function () {
                        _this.hover = true;
                        _this.style();
                    };
                    this.elem.onmouseout = function () {
                        _this.hover = false;
                        _this.style();
                    };
                    this.elem.onclick = this.onClick.bind(this);
                    document.addEventListener('fullscreenchange', this.style.bind(this));
                    this.style();
                }
                FsButton.prototype.isFS = function () {
                    return document.fullscreenElement === document.body;
                };
                FsButton.prototype.style = function () {
                    this.elem.style.backgroundColor = this.hover ? 'rgba(50, 50, 50, 0.8)' : 'rgba(0, 0, 0, 0.8)';
                    this.elem.textContent = this.isFS() ? '🡼' : '🡾';
                };
                FsButton.prototype.onClick = function () {
                    if (this.isFS())
                        document.exitFullscreen();
                    else
                        document.body.requestFullscreen();
                };
                return FsButton;
            }());
            Main = /** @class */ (function () {
                function Main() {
                    this.canvas = document.createElement('canvas');
                    document.body.appendChild(this.canvas);
                    window.onresize = this.onResize.bind(this);
                    this.fsButton = new FsButton();
                    document.body.appendChild(this.fsButton.elem);
                    this.viewer = new Viewer.Viewer(this.canvas);
                    this.viewer.start();
                    // Dispatch to the main embed.
                    var hash = window.location.hash.slice(1);
                    this.onResize();
                    this.loadScene(hash);
                }
                Main.prototype.loadScene = function (hash) {
                    var _this = this;
                    var _a = __read(hash.split('/'), 2), file = _a[0], name = _a[1];
                    System.import("embeds/" + file).then(function (embedModule) {
                        var gl = _this.viewer.renderState.gl;
                        embedModule.createScene(gl, name).then(function (scene) {
                            _this.viewer.setCameraControllerClass(Viewer.OrbitCameraController);
                            _this.viewer.setScene(scene);
                        });
                    });
                };
                Main.prototype.onResize = function () {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                };
                return Main;
            }());
            window.main = new Main();
        }
    };
});
System.register("embeds/sunshine_water", ["gl-matrix", "util", "gx/gx_material", "j3d/j3d", "j3d/rarc", "j3d/render", "j3d/sms_scenes", "yaz0"], function (exports_64, context_64) {
    "use strict";
    var __moduleName = context_64 && context_64.id;
    function createScene(gl, name) {
        return util_38.fetch("data/j3d/dolpic0.szs").then(function (buffer) {
            var bufferSlice = Yaz0.decompress(buffer);
            var rarc = RARC.parse(bufferSlice);
            var skyScene = sms_scenes_1.SunshineSceneDesc.createSunshineSceneForBasename(gl, rarc, 'sky', true);
            var bmdFile = rarc.findFile('map/map/sea.bmd');
            var btkFile = rarc.findFile('map/map/sea.btk');
            var bmd = j3d_5.BMD.parse(bmdFile.buffer);
            var btk = j3d_5.BTK.parse(btkFile.buffer);
            var seaScene = new SeaPlaneScene(gl, bmd, btk, name);
            return new sms_scenes_1.SunshineRenderer(skyScene, null, // map
            seaScene, null, // seaindirect
            []);
        });
    }
    exports_64("createScene", createScene);
    var gl_matrix_12, util_38, GX_Material, j3d_5, RARC, render_25, sms_scenes_1, Yaz0, scale, posMtx, packetParamsData, sceneParamsData, SeaPlaneScene, PlaneShape;
    return {
        setters: [
            function (gl_matrix_12_1) {
                gl_matrix_12 = gl_matrix_12_1;
            },
            function (util_38_1) {
                util_38 = util_38_1;
            },
            function (GX_Material_6) {
                GX_Material = GX_Material_6;
            },
            function (j3d_5_1) {
                j3d_5 = j3d_5_1;
            },
            function (RARC_5) {
                RARC = RARC_5;
            },
            function (render_25_1) {
                render_25 = render_25_1;
            },
            function (sms_scenes_1_1) {
                sms_scenes_1 = sms_scenes_1_1;
            },
            function (Yaz0_6) {
                Yaz0 = Yaz0_6;
            }
        ],
        execute: function () {
            scale = 200;
            posMtx = gl_matrix_12.mat4.create();
            gl_matrix_12.mat4.fromScaling(posMtx, [scale, scale, scale]);
            packetParamsData = new Float32Array(11 * 16);
            for (var i = 0; i < 11; i++) {
                packetParamsData.set(posMtx, i * 16);
            }
            sceneParamsData = new Float32Array(4 * 4 + GX_Material.scaledVtxAttributes.length + 4);
            SeaPlaneScene = /** @class */ (function () {
                function SeaPlaneScene(gl, bmd, btk, configName) {
                    this.animationScale = 5;
                    this.bmt = null;
                    this.isSkybox = false;
                    this.useMaterialTexMtx = false;
                    this.fps = 30;
                    this.colorOverrides = [];
                    this.alphaOverrides = [];
                    this.bmd = bmd;
                    this.btk = btk;
                    this.attrScaleData = new Float32Array(GX_Material.scaledVtxAttributes.map(function () { return 1; }));
                    render_25.Scene.prototype.translateTextures.call(this, gl);
                    var seaMaterial = bmd.mat3.materialEntries.find(function (m) { return m.name === '_umi'; });
                    this.seaCmd = this.makeMaterialCommand(gl, seaMaterial, configName);
                    this.plane = new PlaneShape(gl);
                    this.sceneParamsBuffer = gl.createBuffer();
                }
                SeaPlaneScene.prototype.makeMaterialCommand = function (gl, material, configName) {
                    var gxMaterial = material.gxMaterial;
                    if (configName.includes('noalpha')) {
                        // Disable alpha test
                        gxMaterial.alphaTest.compareA = 7 /* ALWAYS */;
                        gxMaterial.alphaTest.op = 1 /* OR */;
                    }
                    if (configName.includes('noblend')) {
                        // Disable blending.
                        gxMaterial.tevStages[0].alphaInD = 6 /* KONST */;
                        gxMaterial.tevStages[1].alphaInD = 6 /* KONST */;
                        gxMaterial.ropInfo.blendMode.dstFactor = 5 /* INVSRCALPHA */;
                    }
                    if (configName.includes('opaque')) {
                        // Make it always opaque.
                        gxMaterial.tevStages[0].colorInB = 9 /* TEXA */;
                        gxMaterial.tevStages[0].colorInC = 11 /* RASA */;
                        gxMaterial.tevStages[0].colorInD = 0 /* CPREV */;
                        gxMaterial.tevStages[0].colorScale = 0 /* SCALE_1 */;
                        gxMaterial.tevStages[1].colorInB = 9 /* TEXA */;
                        gxMaterial.tevStages[1].colorInC = 11 /* RASA */;
                        gxMaterial.tevStages[1].colorInD = 0 /* CPREV */;
                        gxMaterial.tevStages[1].colorScale = 0 /* SCALE_1 */;
                        // Use one TEV stage.
                        if (configName.includes('layer0')) {
                            gxMaterial.tevStages.length = 1;
                        }
                        else if (configName.includes('layer1')) {
                            gxMaterial.tevStages[0] = gxMaterial.tevStages[1];
                            gxMaterial.tevStages.length = 1;
                        }
                    }
                    var scene = this; // Play make-believe.
                    var cmd = new render_25.Command_Material(gl, scene, material);
                    if (configName.includes('nomip')) {
                        try {
                            for (var _a = __values(this.glTextures), _b = _a.next(); !_b.done; _b = _a.next()) {
                                var texture = _b.value;
                                gl.bindTexture(gl.TEXTURE_2D, texture);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_LOD, 1);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LOD, 1);
                            }
                        }
                        catch (e_58_1) { e_58 = { error: e_58_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                            }
                            finally { if (e_58) throw e_58.error; }
                        }
                    }
                    return cmd;
                    var e_58, _c;
                };
                SeaPlaneScene.prototype.render = function (state) {
                    var gl = state.gl;
                    // Update our SceneParams UBO.
                    var offs = 0;
                    sceneParamsData.set(state.projection, offs);
                    offs += 4 * 4;
                    sceneParamsData.set(this.attrScaleData, offs);
                    offs += GX_Material.scaledVtxAttributes.length;
                    sceneParamsData[offs++] = GX_Material.getTextureLODBias(state);
                    gl.bindBuffer(gl.UNIFORM_BUFFER, this.sceneParamsBuffer);
                    gl.bufferData(gl.UNIFORM_BUFFER, sceneParamsData, gl.DYNAMIC_DRAW);
                    this.seaCmd.exec(state);
                    this.plane.render(state);
                };
                SeaPlaneScene.prototype.destroy = function (gl) {
                    this.plane.destroy(gl);
                    this.seaCmd.destroy(gl);
                    gl.deleteBuffer(this.sceneParamsBuffer);
                };
                SeaPlaneScene.prototype.getTimeInFrames = function (milliseconds) {
                    return (milliseconds / 1000) * this.fps * this.animationScale;
                };
                SeaPlaneScene.prototype.getTextureBindData = function (texIndex) {
                    var tex1Sampler = this.tex1Samplers[texIndex];
                    var glTexture = this.glTextures[tex1Sampler.textureDataIndex];
                    var tex1TextureData = this.tex1TextureDatas[tex1Sampler.textureDataIndex];
                    var width = tex1TextureData.width;
                    var height = tex1TextureData.height;
                    var glSampler = this.glSamplers[tex1Sampler.index];
                    return {
                        glSampler: glSampler,
                        glTexture: glTexture,
                        width: width,
                        height: height,
                        lodBias: tex1Sampler.lodBias,
                    };
                };
                return SeaPlaneScene;
            }());
            PlaneShape = /** @class */ (function () {
                function PlaneShape(gl) {
                    this.createBuffers(gl);
                    this.packetParamsBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.UNIFORM_BUFFER, this.packetParamsBuffer);
                    gl.bufferData(gl.UNIFORM_BUFFER, packetParamsData, gl.STATIC_DRAW);
                }
                PlaneShape.prototype.render = function (state) {
                    var gl = state.gl;
                    packetParamsData.set(state.updateModelView(), 0);
                    gl.bindBuffer(gl.UNIFORM_BUFFER, this.packetParamsBuffer);
                    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, packetParamsData, 0, 16);
                    gl.bindBufferBase(gl.UNIFORM_BUFFER, GX_Material.GX_Program.ub_PacketParams, this.packetParamsBuffer);
                    gl.bindVertexArray(this.vao);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    gl.bindVertexArray(null);
                };
                PlaneShape.prototype.destroy = function (gl) {
                    gl.deleteVertexArray(this.vao);
                    gl.deleteBuffer(this.posBuffer);
                    gl.deleteBuffer(this.txcBuffer);
                    gl.deleteBuffer(this.packetParamsBuffer);
                };
                PlaneShape.prototype.createBuffers = function (gl) {
                    this.vao = gl.createVertexArray();
                    gl.bindVertexArray(this.vao);
                    var posData = new Float32Array(4 * 3);
                    posData[0] = -1;
                    posData[1] = 0;
                    posData[2] = -1;
                    posData[3] = 1;
                    posData[4] = 0;
                    posData[5] = -1;
                    posData[6] = -1;
                    posData[7] = 0;
                    posData[8] = 1;
                    posData[9] = 1;
                    posData[10] = 0;
                    posData[11] = 1;
                    this.posBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, posData, gl.STATIC_DRAW);
                    var posAttribLocation = GX_Material.getVertexAttribLocation(9 /* POS */);
                    gl.vertexAttribPointer(posAttribLocation, 3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(posAttribLocation);
                    var txcData = new Float32Array(4 * 2);
                    txcData[0] = 0;
                    txcData[1] = 0;
                    txcData[2] = 2;
                    txcData[3] = 0;
                    txcData[4] = 0;
                    txcData[5] = 2;
                    txcData[6] = 2;
                    txcData[7] = 2;
                    this.txcBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, this.txcBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, txcData, gl.STATIC_DRAW);
                    var tex0AttribLocation = GX_Material.getVertexAttribLocation(13 /* TEX0 */);
                    gl.vertexAttribPointer(tex0AttribLocation, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(tex0AttribLocation);
                    gl.bindVertexArray(null);
                };
                return PlaneShape;
            }());
        }
    };
});
//# sourceMappingURL=main.js.map