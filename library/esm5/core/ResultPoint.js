"use strict";
/*
 * Copyright 2007 ZXing authors
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
Object.defineProperty(exports, "__esModule", { value: true });
/*namespace com.google.zxing {*/
var MathUtils_1 = require("./common/detector/MathUtils");
var Float_1 = require("./util/Float");
/**
 * <p>Encapsulates a point of interest in an image containing a barcode. Typically, this
 * would be the location of a finder pattern or the corner of the barcode, for example.</p>
 *
 * @author Sean Owen
 */
var ResultPoint = /** @class */ (function () {
    function ResultPoint(x /*float*/, y /*float*/) {
        this.x = x;
        this.y = y;
    }
    ResultPoint.prototype.getX = function () {
        return this.x;
    };
    ResultPoint.prototype.getY = function () {
        return this.y;
    };
    /*@Override*/
    ResultPoint.prototype.equals = function (other) {
        if (other instanceof ResultPoint) {
            var otherPoint = other;
            return this.x === otherPoint.x && this.y === otherPoint.y;
        }
        return false;
    };
    /*@Override*/
    ResultPoint.prototype.hashCode = function () {
        return 31 * Float_1.default.floatToIntBits(this.x) + Float_1.default.floatToIntBits(this.y);
    };
    /*@Override*/
    ResultPoint.prototype.toString = function () {
        return '(' + this.x + ',' + this.y + ')';
    };
    /**
     * Orders an array of three ResultPoints in an order [A,B,C] such that AB is less than AC
     * and BC is less than AC, and the angle between BC and BA is less than 180 degrees.
     *
     * @param patterns array of three {@code ResultPoint} to order
     */
    ResultPoint.orderBestPatterns = function (patterns) {
        // Find distances between pattern centers
        var zeroOneDistance = this.distance(patterns[0], patterns[1]);
        var oneTwoDistance = this.distance(patterns[1], patterns[2]);
        var zeroTwoDistance = this.distance(patterns[0], patterns[2]);
        var pointA;
        var pointB;
        var pointC;
        // Assume one closest to other two is B; A and C will just be guesses at first
        if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
            pointB = patterns[0];
            pointA = patterns[1];
            pointC = patterns[2];
        }
        else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
            pointB = patterns[1];
            pointA = patterns[0];
            pointC = patterns[2];
        }
        else {
            pointB = patterns[2];
            pointA = patterns[0];
            pointC = patterns[1];
        }
        // Use cross product to figure out whether A and C are correct or flipped.
        // This asks whether BC x BA has a positive z component, which is the arrangement
        // we want for A, B, C. If it's negative, then we've got it flipped around and
        // should swap A and C.
        if (this.crossProductZ(pointA, pointB, pointC) < 0.0) {
            var temp = pointA;
            pointA = pointC;
            pointC = temp;
        }
        patterns[0] = pointA;
        patterns[1] = pointB;
        patterns[2] = pointC;
    };
    /**
     * @param pattern1 first pattern
     * @param pattern2 second pattern
     * @return distance between two points
     */
    ResultPoint.distance = function (pattern1, pattern2) {
        return MathUtils_1.default.distance(pattern1.x, pattern1.y, pattern2.x, pattern2.y);
    };
    /**
     * Returns the z component of the cross product between vectors BC and BA.
     */
    ResultPoint.crossProductZ = function (pointA, pointB, pointC) {
        var bX = pointB.x;
        var bY = pointB.y;
        return ((pointC.x - bX) * (pointA.y - bY)) - ((pointC.y - bY) * (pointA.x - bX));
    };
    return ResultPoint;
}());
exports.default = ResultPoint;
//# sourceMappingURL=ResultPoint.js.map