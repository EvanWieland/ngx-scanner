"use strict";
/*
 * Copyright 2008 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/*namespace com.google.zxing.oned {*/
var BarcodeFormat_1 = require("../BarcodeFormat");
var ChecksumException_1 = require("../ChecksumException");
var FormatException_1 = require("../FormatException");
var NotFoundException_1 = require("../NotFoundException");
var OneDReader_1 = require("./OneDReader");
var Result_1 = require("../Result");
var ResultPoint_1 = require("../ResultPoint");
/**
 * <p>Decodes Code 39 barcodes. Supports "Full ASCII Code 39" if USE_CODE_39_EXTENDED_MODE is set.</p>
 *
 * @author Sean Owen
 * @see Code93Reader
 */
var Code39Reader = /** @class */ (function (_super) {
    __extends(Code39Reader, _super);
    /**
     * Creates a reader that assumes all encoded data is data, and does not treat the final
     * character as a check digit. It will not decoded "extended Code 39" sequences.
     */
    // public Code39Reader() {
    //   this(false);
    // }
    /**
     * Creates a reader that can be configured to check the last character as a check digit.
     * It will not decoded "extended Code 39" sequences.
     *
     * @param usingCheckDigit if true, treat the last data character as a check digit, not
     * data, and verify that the checksum passes.
     */
    // public Code39Reader(boolean usingCheckDigit) {
    //   this(usingCheckDigit, false);
    // }
    /**
     * Creates a reader that can be configured to check the last character as a check digit,
     * or optionally attempt to decode "extended Code 39" sequences that are used to encode
     * the full ASCII character set.
     *
     * @param usingCheckDigit if true, treat the last data character as a check digit, not
     * data, and verify that the checksum passes.
     * @param extendedMode if true, will attempt to decode extended Code 39 sequences in the
     * text.
     */
    function Code39Reader(usingCheckDigit, extendedMode) {
        if (usingCheckDigit === void 0) { usingCheckDigit = false; }
        if (extendedMode === void 0) { extendedMode = false; }
        var _this = _super.call(this) || this;
        _this.usingCheckDigit = usingCheckDigit;
        _this.extendedMode = extendedMode;
        _this.decodeRowResult = '';
        _this.counters = new Array(9);
        return _this;
    }
    Code39Reader.prototype.decodeRow = function (rowNumber, row, hints) {
        var theCounters = this.counters;
        theCounters.fill(0);
        this.decodeRowResult = '';
        var start = Code39Reader.findAsteriskPattern(row, theCounters);
        // Read off white space
        var nextStart = row.getNextSet(start[1]);
        var end = row.getSize();
        var decodedChar;
        var lastStart;
        do {
            Code39Reader.recordPattern(row, nextStart, theCounters);
            var pattern = Code39Reader.toNarrowWidePattern(theCounters);
            if (pattern < 0) {
                throw new NotFoundException_1.default();
            }
            decodedChar = Code39Reader.patternToChar(pattern);
            this.decodeRowResult += decodedChar;
            lastStart = nextStart;
            for (var _i = 0, theCounters_1 = theCounters; _i < theCounters_1.length; _i++) {
                var counter = theCounters_1[_i];
                nextStart += counter;
            }
            // Read off white space
            nextStart = row.getNextSet(nextStart);
        } while (decodedChar !== '*');
        this.decodeRowResult = this.decodeRowResult.substring(0, this.decodeRowResult.length - 1); // remove asterisk
        // Look for whitespace after pattern:
        var lastPatternSize = 0;
        for (var _a = 0, theCounters_2 = theCounters; _a < theCounters_2.length; _a++) {
            var counter = theCounters_2[_a];
            lastPatternSize += counter;
        }
        var whiteSpaceAfterEnd = nextStart - lastStart - lastPatternSize;
        // If 50% of last pattern size, following last pattern, is not whitespace, fail
        // (but if it's whitespace to the very end of the image, that's OK)
        if (nextStart !== end && (whiteSpaceAfterEnd * 2) < lastPatternSize) {
            throw new NotFoundException_1.default();
        }
        if (this.usingCheckDigit) {
            var max = this.decodeRowResult.length - 1;
            var total = 0;
            for (var i = 0; i < max; i++) {
                total += Code39Reader.ALPHABET_STRING.indexOf(this.decodeRowResult.charAt(i));
            }
            if (this.decodeRowResult.charAt(max) !== Code39Reader.ALPHABET_STRING.charAt(total % 43)) {
                throw new ChecksumException_1.default();
            }
            this.decodeRowResult = this.decodeRowResult.substring(0, max);
        }
        if (this.decodeRowResult.length === 0) {
            // false positive
            throw new NotFoundException_1.default();
        }
        var resultString;
        if (this.extendedMode) {
            resultString = Code39Reader.decodeExtended(this.decodeRowResult);
        }
        else {
            resultString = this.decodeRowResult;
        }
        var left = (start[1] + start[0]) / 2.0;
        var right = lastStart + lastPatternSize / 2.0;
        return new Result_1.default(resultString, null, 0, [new ResultPoint_1.default(left, rowNumber), new ResultPoint_1.default(right, rowNumber)], BarcodeFormat_1.default.CODE_39, new Date().getTime());
    };
    Code39Reader.findAsteriskPattern = function (row, counters) {
        var width = row.getSize();
        var rowOffset = row.getNextSet(0);
        var counterPosition = 0;
        var patternStart = rowOffset;
        var isWhite = false;
        var patternLength = counters.length;
        for (var i = rowOffset; i < width; i++) {
            if (row.get(i) !== isWhite) {
                counters[counterPosition]++;
            }
            else {
                if (counterPosition === patternLength - 1) {
                    // Look for whitespace before start pattern, >= 50% of width of start pattern
                    if (this.toNarrowWidePattern(counters) === Code39Reader.ASTERISK_ENCODING &&
                        row.isRange(Math.max(0, patternStart - Math.floor((i - patternStart) / 2)), patternStart, false)) {
                        return [patternStart, i];
                    }
                    patternStart += counters[0] + counters[1];
                    counters.copyWithin(0, 2, 2 + counterPosition - 1);
                    counters[counterPosition - 1] = 0;
                    counters[counterPosition] = 0;
                    counterPosition--;
                }
                else {
                    counterPosition++;
                }
                counters[counterPosition] = 1;
                isWhite = !isWhite;
            }
        }
        throw new NotFoundException_1.default();
    };
    // For efficiency, returns -1 on failure. Not throwing here saved as many as 700 exceptions
    // per image when using some of our blackbox images.
    Code39Reader.toNarrowWidePattern = function (counters) {
        var numCounters = counters.length;
        var maxNarrowCounter = 0;
        var wideCounters;
        do {
            var minCounter = 0x7fffffff;
            for (var _i = 0, counters_1 = counters; _i < counters_1.length; _i++) {
                var counter = counters_1[_i];
                if (counter < minCounter && counter > maxNarrowCounter) {
                    minCounter = counter;
                }
            }
            maxNarrowCounter = minCounter;
            wideCounters = 0;
            var totalWideCountersWidth = 0;
            var pattern = 0;
            for (var i = 0; i < numCounters; i++) {
                var counter = counters[i];
                if (counter > maxNarrowCounter) {
                    pattern |= 1 << (numCounters - 1 - i);
                    wideCounters++;
                    totalWideCountersWidth += counter;
                }
            }
            if (wideCounters === 3) {
                // Found 3 wide counters, but are they close enough in width?
                // We can perform a cheap, conservative check to see if any individual
                // counter is more than 1.5 times the average:
                for (var i = 0; i < numCounters && wideCounters > 0; i++) {
                    var counter = counters[i];
                    if (counter > maxNarrowCounter) {
                        wideCounters--;
                        // totalWideCountersWidth = 3 * average, so this checks if counter >= 3/2 * average
                        if ((counter * 2) >= totalWideCountersWidth) {
                            return -1;
                        }
                    }
                }
                return pattern;
            }
        } while (wideCounters > 3);
        return -1;
    };
    Code39Reader.patternToChar = function (pattern) {
        for (var i = 0; i < Code39Reader.CHARACTER_ENCODINGS.length; i++) {
            if (Code39Reader.CHARACTER_ENCODINGS[i] === pattern) {
                return Code39Reader.ALPHABET_STRING.charAt(i);
            }
        }
        if (pattern === Code39Reader.ASTERISK_ENCODING) {
            return '*';
        }
        throw new NotFoundException_1.default();
    };
    Code39Reader.decodeExtended = function (encoded) {
        var length = encoded.length;
        var decoded = '';
        for (var i = 0; i < length; i++) {
            var c = encoded.charAt(i);
            if (c === '+' || c === '$' || c === '%' || c === '/') {
                var next = encoded.charAt(i + 1);
                var decodedChar = '\0';
                switch (c) {
                    case '+':
                        // +A to +Z map to a to z
                        if (next >= 'A' && next <= 'Z') {
                            decodedChar = String.fromCharCode(next.charCodeAt(0) + 32);
                        }
                        else {
                            throw new FormatException_1.default();
                        }
                        break;
                    case '$':
                        // $A to $Z map to control codes SH to SB
                        if (next >= 'A' && next <= 'Z') {
                            decodedChar = String.fromCharCode(next.charCodeAt(0) - 64);
                        }
                        else {
                            throw new FormatException_1.default();
                        }
                        break;
                    case '%':
                        // %A to %E map to control codes ESC to US
                        if (next >= 'A' && next <= 'E') {
                            decodedChar = String.fromCharCode(next.charCodeAt(0) - 38);
                        }
                        else if (next >= 'F' && next <= 'J') {
                            decodedChar = String.fromCharCode(next.charCodeAt(0) - 11);
                        }
                        else if (next >= 'K' && next <= 'O') {
                            decodedChar = String.fromCharCode(next.charCodeAt(0) + 16);
                        }
                        else if (next >= 'P' && next <= 'T') {
                            decodedChar = String.fromCharCode(next.charCodeAt(0) + 43);
                        }
                        else if (next === 'U') {
                            decodedChar = '\0';
                        }
                        else if (next === 'V') {
                            decodedChar = '@';
                        }
                        else if (next === 'W') {
                            decodedChar = '`';
                        }
                        else if (next === 'X' || next === 'Y' || next === 'Z') {
                            decodedChar = '\x7f';
                        }
                        else {
                            throw new FormatException_1.default();
                        }
                        break;
                    case '/':
                        // /A to /O map to ! to , and /Z maps to :
                        if (next >= 'A' && next <= 'O') {
                            decodedChar = String.fromCharCode(next.charCodeAt(0) - 32);
                        }
                        else if (next === 'Z') {
                            decodedChar = ':';
                        }
                        else {
                            throw new FormatException_1.default();
                        }
                        break;
                }
                decoded += decodedChar;
                // bump up i again since we read two characters
                i++;
            }
            else {
                decoded += c;
            }
        }
        return decoded;
    };
    Code39Reader.ALPHABET_STRING = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';
    /**
     * These represent the encodings of characters, as patterns of wide and narrow bars.
     * The 9 least-significant bits of each int correspond to the pattern of wide and narrow,
     * with 1s representing "wide" and 0s representing narrow.
     */
    Code39Reader.CHARACTER_ENCODINGS = [
        0x034, 0x121, 0x061, 0x160, 0x031, 0x130, 0x070, 0x025, 0x124, 0x064,
        0x109, 0x049, 0x148, 0x019, 0x118, 0x058, 0x00D, 0x10C, 0x04C, 0x01C,
        0x103, 0x043, 0x142, 0x013, 0x112, 0x052, 0x007, 0x106, 0x046, 0x016,
        0x181, 0x0C1, 0x1C0, 0x091, 0x190, 0x0D0, 0x085, 0x184, 0x0C4, 0x0A8,
        0x0A2, 0x08A, 0x02A // /-%
    ];
    Code39Reader.ASTERISK_ENCODING = 0x094;
    return Code39Reader;
}(OneDReader_1.default));
exports.default = Code39Reader;
//# sourceMappingURL=Code39Reader.js.map