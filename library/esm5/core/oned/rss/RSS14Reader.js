"use strict";
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
var AbstractRSSReader_1 = require("./AbstractRSSReader");
var Pair_1 = require("./Pair");
var Result_1 = require("../../Result");
var DecodeHintType_1 = require("../../DecodeHintType");
var NotFoundException_1 = require("../../NotFoundException");
var StringBuilder_1 = require("../../util/StringBuilder");
var BarcodeFormat_1 = require("../../BarcodeFormat");
var ResultPoint_1 = require("../../ResultPoint");
var FinderPattern_1 = require("./FinderPattern");
var DataCharacter_1 = require("./DataCharacter");
var MathUtils_1 = require("../../common/detector/MathUtils");
var RSSUtils_1 = require("./RSSUtils");
var System_1 = require("../../util/System");
var OneDReader_1 = require("../OneDReader");
var RSS14Reader = /** @class */ (function (_super) {
    __extends(RSS14Reader, _super);
    function RSS14Reader() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.possibleLeftPairs = [];
        _this.possibleRightPairs = [];
        return _this;
    }
    RSS14Reader.prototype.decodeRow = function (rowNumber, row, hints) {
        var leftPair = this.decodePair(row, false, rowNumber, hints);
        RSS14Reader.addOrTally(this.possibleLeftPairs, leftPair);
        row.reverse();
        var rightPair = this.decodePair(row, true, rowNumber, hints);
        RSS14Reader.addOrTally(this.possibleRightPairs, rightPair);
        row.reverse();
        for (var _i = 0, _a = this.possibleLeftPairs; _i < _a.length; _i++) {
            var left = _a[_i];
            if (left.getCount() > 1) {
                for (var _b = 0, _c = this.possibleRightPairs; _b < _c.length; _b++) {
                    var right = _c[_b];
                    if (right.getCount() > 1 && RSS14Reader.checkChecksum(left, right)) {
                        return RSS14Reader.constructResult(left, right);
                    }
                }
            }
        }
        throw new NotFoundException_1.default();
    };
    RSS14Reader.addOrTally = function (possiblePairs, pair) {
        if (pair == null) {
            return;
        }
        var found = false;
        for (var _i = 0, possiblePairs_1 = possiblePairs; _i < possiblePairs_1.length; _i++) {
            var other = possiblePairs_1[_i];
            if (other.getValue() === pair.getValue()) {
                other.incrementCount();
                found = true;
                break;
            }
        }
        if (!found) {
            possiblePairs.push(pair);
        }
    };
    RSS14Reader.prototype.reset = function () {
        this.possibleLeftPairs.length = 0;
        this.possibleRightPairs.length = 0;
    };
    RSS14Reader.constructResult = function (leftPair, rightPair) {
        var symbolValue = 4537077 * leftPair.getValue() + rightPair.getValue();
        var text = new String(symbolValue).toString();
        var buffer = new StringBuilder_1.default();
        for (var i = 13 - text.length; i > 0; i--) {
            buffer.append('0');
        }
        buffer.append(text);
        var checkDigit = 0;
        for (var i = 0; i < 13; i++) {
            var digit = buffer.charAt(i).charCodeAt(0) - '0'.charCodeAt(0);
            checkDigit += ((i & 0x01) === 0) ? 3 * digit : digit;
        }
        checkDigit = 10 - (checkDigit % 10);
        if (checkDigit === 10) {
            checkDigit = 0;
        }
        buffer.append(checkDigit.toString());
        var leftPoints = leftPair.getFinderPattern().getResultPoints();
        var rightPoints = rightPair.getFinderPattern().getResultPoints();
        return new Result_1.default(buffer.toString(), null, 0, [leftPoints[0], leftPoints[1], rightPoints[0], rightPoints[1]], BarcodeFormat_1.default.RSS_14, new Date().getTime());
    };
    RSS14Reader.checkChecksum = function (leftPair, rightPair) {
        var checkValue = (leftPair.getChecksumPortion() + 16 * rightPair.getChecksumPortion()) % 79;
        var targetCheckValue = 9 * leftPair.getFinderPattern().getValue() + rightPair.getFinderPattern().getValue();
        if (targetCheckValue > 72) {
            targetCheckValue--;
        }
        if (targetCheckValue > 8) {
            targetCheckValue--;
        }
        return checkValue === targetCheckValue;
    };
    RSS14Reader.prototype.decodePair = function (row, right, rowNumber, hints) {
        try {
            var startEnd = this.findFinderPattern(row, right);
            var pattern = this.parseFoundFinderPattern(row, rowNumber, right, startEnd);
            var resultPointCallback = hints == null ? null : hints.get(DecodeHintType_1.default.NEED_RESULT_POINT_CALLBACK);
            if (resultPointCallback != null) {
                var center = (startEnd[0] + startEnd[1]) / 2.0;
                if (right) {
                    // row is actually reversed
                    center = row.getSize() - 1 - center;
                }
                resultPointCallback.foundPossibleResultPoint(new ResultPoint_1.default(center, rowNumber));
            }
            var outside = this.decodeDataCharacter(row, pattern, true);
            var inside = this.decodeDataCharacter(row, pattern, false);
            return new Pair_1.default(1597 * outside.getValue() + inside.getValue(), outside.getChecksumPortion() + 4 * inside.getChecksumPortion(), pattern);
        }
        catch (err) {
            return null;
        }
    };
    RSS14Reader.prototype.decodeDataCharacter = function (row, pattern, outsideChar) {
        var counters = this.getDataCharacterCounters();
        for (var x = 0; x < counters.length; x++) {
            counters[x] = 0;
        }
        if (outsideChar) {
            OneDReader_1.default.recordPatternInReverse(row, pattern.getStartEnd()[0], counters);
        }
        else {
            OneDReader_1.default.recordPattern(row, pattern.getStartEnd()[1] + 1, counters);
            // reverse it
            for (var i = 0, j = counters.length - 1; i < j; i++, j--) {
                var temp = counters[i];
                counters[i] = counters[j];
                counters[j] = temp;
            }
        }
        var numModules = outsideChar ? 16 : 15;
        var elementWidth = MathUtils_1.default.sum(new Int32Array(counters)) / numModules;
        var oddCounts = this.getOddCounts();
        var evenCounts = this.getEvenCounts();
        var oddRoundingErrors = this.getOddRoundingErrors();
        var evenRoundingErrors = this.getEvenRoundingErrors();
        for (var i = 0; i < counters.length; i++) {
            var value = counters[i] / elementWidth;
            var count = Math.floor(value + 0.5);
            if (count < 1) {
                count = 1;
            }
            else if (count > 8) {
                count = 8;
            }
            var offset = Math.floor(i / 2);
            if ((i & 0x01) === 0) {
                oddCounts[offset] = count;
                oddRoundingErrors[offset] = value - count;
            }
            else {
                evenCounts[offset] = count;
                evenRoundingErrors[offset] = value - count;
            }
        }
        this.adjustOddEvenCounts(outsideChar, numModules);
        var oddSum = 0;
        var oddChecksumPortion = 0;
        for (var i = oddCounts.length - 1; i >= 0; i--) {
            oddChecksumPortion *= 9;
            oddChecksumPortion += oddCounts[i];
            oddSum += oddCounts[i];
        }
        var evenChecksumPortion = 0;
        var evenSum = 0;
        for (var i = evenCounts.length - 1; i >= 0; i--) {
            evenChecksumPortion *= 9;
            evenChecksumPortion += evenCounts[i];
            evenSum += evenCounts[i];
        }
        var checksumPortion = oddChecksumPortion + 3 * evenChecksumPortion;
        if (outsideChar) {
            if ((oddSum & 0x01) !== 0 || oddSum > 12 || oddSum < 4) {
                throw new NotFoundException_1.default();
            }
            var group = (12 - oddSum) / 2;
            var oddWidest = RSS14Reader.OUTSIDE_ODD_WIDEST[group];
            var evenWidest = 9 - oddWidest;
            var vOdd = RSSUtils_1.default.getRSSvalue(oddCounts, oddWidest, false);
            var vEven = RSSUtils_1.default.getRSSvalue(evenCounts, evenWidest, true);
            var tEven = RSS14Reader.OUTSIDE_EVEN_TOTAL_SUBSET[group];
            var gSum = RSS14Reader.OUTSIDE_GSUM[group];
            return new DataCharacter_1.default(vOdd * tEven + vEven + gSum, checksumPortion);
        }
        else {
            if ((evenSum & 0x01) !== 0 || evenSum > 10 || evenSum < 4) {
                throw new NotFoundException_1.default();
            }
            var group = (10 - evenSum) / 2;
            var oddWidest = RSS14Reader.INSIDE_ODD_WIDEST[group];
            var evenWidest = 9 - oddWidest;
            var vOdd = RSSUtils_1.default.getRSSvalue(oddCounts, oddWidest, true);
            var vEven = RSSUtils_1.default.getRSSvalue(evenCounts, evenWidest, false);
            var tOdd = RSS14Reader.INSIDE_ODD_TOTAL_SUBSET[group];
            var gSum = RSS14Reader.INSIDE_GSUM[group];
            return new DataCharacter_1.default(vEven * tOdd + vOdd + gSum, checksumPortion);
        }
    };
    RSS14Reader.prototype.findFinderPattern = function (row, rightFinderPattern) {
        var counters = this.getDecodeFinderCounters();
        counters[0] = 0;
        counters[1] = 0;
        counters[2] = 0;
        counters[3] = 0;
        var width = row.getSize();
        var isWhite = false;
        var rowOffset = 0;
        while (rowOffset < width) {
            isWhite = !row.get(rowOffset);
            if (rightFinderPattern === isWhite) {
                // Will encounter white first when searching for right finder pattern
                break;
            }
            rowOffset++;
        }
        var counterPosition = 0;
        var patternStart = rowOffset;
        for (var x = rowOffset; x < width; x++) {
            if (row.get(x) !== isWhite) {
                counters[counterPosition]++;
            }
            else {
                if (counterPosition === 3) {
                    if (AbstractRSSReader_1.default.isFinderPattern(counters)) {
                        return [patternStart, x];
                    }
                    patternStart += counters[0] + counters[1];
                    counters[0] = counters[2];
                    counters[1] = counters[3];
                    counters[2] = 0;
                    counters[3] = 0;
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
    RSS14Reader.prototype.parseFoundFinderPattern = function (row, rowNumber, right, startEnd) {
        // Actually we found elements 2-5
        var firstIsBlack = row.get(startEnd[0]);
        var firstElementStart = startEnd[0] - 1;
        // Locate element 1
        while (firstElementStart >= 0 && firstIsBlack !== row.get(firstElementStart)) {
            firstElementStart--;
        }
        firstElementStart++;
        var firstCounter = startEnd[0] - firstElementStart;
        // Make 'counters' hold 1-4
        var counters = this.getDecodeFinderCounters();
        var copy = new Array(counters.length);
        System_1.default.arraycopy(counters, 0, copy, 1, counters.length - 1);
        copy[0] = firstCounter;
        var value = this.parseFinderValue(copy, RSS14Reader.FINDER_PATTERNS);
        var start = firstElementStart;
        var end = startEnd[1];
        if (right) {
            // row is actually reversed
            start = row.getSize() - 1 - start;
            end = row.getSize() - 1 - end;
        }
        return new FinderPattern_1.default(value, [firstElementStart, startEnd[1]], start, end, rowNumber);
    };
    RSS14Reader.prototype.adjustOddEvenCounts = function (outsideChar, numModules) {
        var oddSum = MathUtils_1.default.sum(new Int32Array(this.getOddCounts()));
        var evenSum = MathUtils_1.default.sum(new Int32Array(this.getEvenCounts()));
        var incrementOdd = false;
        var decrementOdd = false;
        var incrementEven = false;
        var decrementEven = false;
        if (outsideChar) {
            if (oddSum > 12) {
                decrementOdd = true;
            }
            else if (oddSum < 4) {
                incrementOdd = true;
            }
            if (evenSum > 12) {
                decrementEven = true;
            }
            else if (evenSum < 4) {
                incrementEven = true;
            }
        }
        else {
            if (oddSum > 11) {
                decrementOdd = true;
            }
            else if (oddSum < 5) {
                incrementOdd = true;
            }
            if (evenSum > 10) {
                decrementEven = true;
            }
            else if (evenSum < 4) {
                incrementEven = true;
            }
        }
        var mismatch = oddSum + evenSum - numModules;
        var oddParityBad = (oddSum & 0x01) === (outsideChar ? 1 : 0);
        var evenParityBad = (evenSum & 0x01) === 1;
        if (mismatch === 1) {
            if (oddParityBad) {
                if (evenParityBad) {
                    throw new NotFoundException_1.default();
                }
                decrementOdd = true;
            }
            else {
                if (!evenParityBad) {
                    throw new NotFoundException_1.default();
                }
                decrementEven = true;
            }
        }
        else if (mismatch === -1) {
            if (oddParityBad) {
                if (evenParityBad) {
                    throw new NotFoundException_1.default();
                }
                incrementOdd = true;
            }
            else {
                if (!evenParityBad) {
                    throw new NotFoundException_1.default();
                }
                incrementEven = true;
            }
        }
        else if (mismatch === 0) {
            if (oddParityBad) {
                if (!evenParityBad) {
                    throw new NotFoundException_1.default();
                }
                // Both bad
                if (oddSum < evenSum) {
                    incrementOdd = true;
                    decrementEven = true;
                }
                else {
                    decrementOdd = true;
                    incrementEven = true;
                }
            }
            else {
                if (evenParityBad) {
                    throw new NotFoundException_1.default();
                }
                // Nothing to do!
            }
        }
        else {
            throw new NotFoundException_1.default();
        }
        if (incrementOdd) {
            if (decrementOdd) {
                throw new NotFoundException_1.default();
            }
            AbstractRSSReader_1.default.increment(this.getOddCounts(), this.getOddRoundingErrors());
        }
        if (decrementOdd) {
            AbstractRSSReader_1.default.decrement(this.getOddCounts(), this.getOddRoundingErrors());
        }
        if (incrementEven) {
            if (decrementEven) {
                throw new NotFoundException_1.default();
            }
            AbstractRSSReader_1.default.increment(this.getEvenCounts(), this.getOddRoundingErrors());
        }
        if (decrementEven) {
            AbstractRSSReader_1.default.decrement(this.getEvenCounts(), this.getEvenRoundingErrors());
        }
    };
    RSS14Reader.OUTSIDE_EVEN_TOTAL_SUBSET = [1, 10, 34, 70, 126];
    RSS14Reader.INSIDE_ODD_TOTAL_SUBSET = [4, 20, 48, 81];
    RSS14Reader.OUTSIDE_GSUM = [0, 161, 961, 2015, 2715];
    RSS14Reader.INSIDE_GSUM = [0, 336, 1036, 1516];
    RSS14Reader.OUTSIDE_ODD_WIDEST = [8, 6, 4, 3, 1];
    RSS14Reader.INSIDE_ODD_WIDEST = [2, 4, 6, 8];
    RSS14Reader.FINDER_PATTERNS = [
        [3, 8, 2, 1],
        [3, 5, 5, 1],
        [3, 3, 7, 1],
        [3, 1, 9, 1],
        [2, 7, 4, 1],
        [2, 5, 6, 1],
        [2, 3, 8, 1],
        [1, 5, 7, 1],
        [1, 3, 9, 1],
    ];
    return RSS14Reader;
}(AbstractRSSReader_1.default));
exports.default = RSS14Reader;
//# sourceMappingURL=RSS14Reader.js.map