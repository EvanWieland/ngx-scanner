/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
/// <reference path="./image-capture.d.ts" />
/// <reference path="./image-capture.d.ts" />
import { BrowserMultiFormatReader, ChecksumException, FormatException, NotFoundException } from '@zxing/library';
import { BehaviorSubject } from 'rxjs';
/**
 * Based on zxing-typescript BrowserCodeReader
 */
var /**
 * Based on zxing-typescript BrowserCodeReader
 */
BrowserMultiFormatContinuousReader = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserMultiFormatContinuousReader, _super);
    function BrowserMultiFormatContinuousReader() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Says if there's a torch available for the current device.
         */
        _this._isTorchAvailable = new BehaviorSubject(undefined);
        return _this;
    }
    Object.defineProperty(BrowserMultiFormatContinuousReader.prototype, "isTorchAvailable", {
        /**
         * Exposes _tochAvailable .
         */
        get: /**
         * Exposes _tochAvailable .
         * @return {?}
         */
        function () {
            return this._isTorchAvailable.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Starts the decoding from the current or a new video element.
     *
     * @param callbackFn The callback to be executed after every scan attempt
     * @param deviceId The device's to be used Id
     * @param videoSource A new video element
     */
    /**
     * Starts the decoding from the current or a new video element.
     *
     * @param {?=} deviceId The device's to be used Id
     * @param {?=} videoSource A new video element
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.continuousDecodeFromInputVideoDevice = /**
     * Starts the decoding from the current or a new video element.
     *
     * @param {?=} deviceId The device's to be used Id
     * @param {?=} videoSource A new video element
     * @return {?}
     */
    function (deviceId, videoSource) {
        var _this = this;
        this.reset();
        // Keeps the deviceId between scanner resets.
        if (typeof deviceId !== 'undefined') {
            this.deviceId = deviceId;
        }
        if (typeof navigator === 'undefined') {
            return;
        }
        /** @type {?} */
        var scan$ = new BehaviorSubject({});
        try {
            // this.decodeFromInputVideoDeviceContinuously(deviceId, videoSource, (result, error) => scan$.next({ result, error }));
            this.getStreamForDevice({ deviceId: deviceId })
                .then((/**
             * @param {?} stream
             * @return {?}
             */
            function (stream) { return _this.attachStreamToVideoAndCheckTorch(stream, videoSource); }))
                .then((/**
             * @param {?} videoElement
             * @return {?}
             */
            function (videoElement) { return _this.decodeOnSubject(scan$, videoElement, _this.timeBetweenScansMillis); }));
        }
        catch (e) {
            scan$.error(e);
        }
        this._setScanStream(scan$);
        // @todo Find a way to emit a complete event on the scan stream once it's finished.
        return scan$.asObservable();
    };
    /**
     * Gets the media stream for certain device.
     * Falls back to any available device if no `deviceId` is defined.
     */
    /**
     * Gets the media stream for certain device.
     * Falls back to any available device if no `deviceId` is defined.
     * @param {?} __0
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.getStreamForDevice = /**
     * Gets the media stream for certain device.
     * Falls back to any available device if no `deviceId` is defined.
     * @param {?} __0
     * @return {?}
     */
    function (_a) {
        var deviceId = _a.deviceId;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var constraints, stream;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        constraints = this.getUserMediaConstraints(deviceId);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia(constraints)];
                    case 1:
                        stream = _b.sent();
                        return [2 /*return*/, stream];
                }
            });
        });
    };
    /**
     * Creates media steram constraints for certain `deviceId`.
     * Falls back to any environment available device if no `deviceId` is defined.
     */
    /**
     * Creates media steram constraints for certain `deviceId`.
     * Falls back to any environment available device if no `deviceId` is defined.
     * @param {?} deviceId
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.getUserMediaConstraints = /**
     * Creates media steram constraints for certain `deviceId`.
     * Falls back to any environment available device if no `deviceId` is defined.
     * @param {?} deviceId
     * @return {?}
     */
    function (deviceId) {
        /** @type {?} */
        var video = typeof deviceId === 'undefined'
            ? { facingMode: { exact: 'environment' } }
            : { deviceId: { exact: deviceId } };
        /** @type {?} */
        var constraints = { video: video };
        return constraints;
    };
    /**
     * Enables and disables the device torch.
     */
    /**
     * Enables and disables the device torch.
     * @param {?} on
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.setTorch = /**
     * Enables and disables the device torch.
     * @param {?} on
     * @return {?}
     */
    function (on) {
        if (!this._isTorchAvailable.value) {
            // compatibility not checked yet
            return;
        }
        /** @type {?} */
        var tracks = this.getVideoTracks(this.stream);
        if (on) {
            this.applyTorchOnTracks(tracks, true);
        }
        else {
            this.applyTorchOnTracks(tracks, false);
            // @todo check possibility to disable torch without restart
            this.restart();
        }
    };
    /**
     * Update the torch compatibility state and attachs the stream to the preview element.
     */
    /**
     * Update the torch compatibility state and attachs the stream to the preview element.
     * @private
     * @param {?} stream
     * @param {?} videoSource
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.attachStreamToVideoAndCheckTorch = /**
     * Update the torch compatibility state and attachs the stream to the preview element.
     * @private
     * @param {?} stream
     * @param {?} videoSource
     * @return {?}
     */
    function (stream, videoSource) {
        this.updateTorchCompatibility(stream);
        return this.attachStreamToVideo(stream, videoSource);
    };
    /**
     * Checks if the stream supports torch control.
     *
     * @param stream The media stream used to check.
     */
    /**
     * Checks if the stream supports torch control.
     *
     * @private
     * @param {?} stream The media stream used to check.
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.updateTorchCompatibility = /**
     * Checks if the stream supports torch control.
     *
     * @private
     * @param {?} stream The media stream used to check.
     * @return {?}
     */
    function (stream) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var e_1, _a, tracks, tracks_1, tracks_1_1, track, e_1_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tracks = this.getVideoTracks(stream);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        tracks_1 = tslib_1.__values(tracks), tracks_1_1 = tracks_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!tracks_1_1.done) return [3 /*break*/, 5];
                        track = tracks_1_1.value;
                        return [4 /*yield*/, this.isTorchCompatible(track)];
                    case 3:
                        if (_b.sent()) {
                            this._isTorchAvailable.next(true);
                            return [3 /*break*/, 5];
                        }
                        _b.label = 4;
                    case 4:
                        tracks_1_1 = tracks_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (tracks_1_1 && !tracks_1_1.done && (_a = tracks_1.return)) _a.call(tracks_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param stream The video stream where the tracks gonna be extracted from.
     */
    /**
     *
     * @private
     * @param {?} stream The video stream where the tracks gonna be extracted from.
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.getVideoTracks = /**
     *
     * @private
     * @param {?} stream The video stream where the tracks gonna be extracted from.
     * @return {?}
     */
    function (stream) {
        /** @type {?} */
        var tracks = [];
        try {
            tracks = stream.getVideoTracks();
        }
        finally {
            return tracks || [];
        }
    };
    /**
     *
     * @param track The media stream track that will be checked for compatibility.
     */
    /**
     *
     * @private
     * @param {?} track The media stream track that will be checked for compatibility.
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.isTorchCompatible = /**
     *
     * @private
     * @param {?} track The media stream track that will be checked for compatibility.
     * @return {?}
     */
    function (track) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var compatible, imageCapture, capabilities;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        compatible = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        imageCapture = new ImageCapture(track);
                        return [4 /*yield*/, imageCapture.getPhotoCapabilities()];
                    case 2:
                        capabilities = _a.sent();
                        compatible = !!capabilities['torch'] || ('fillLightMode' in capabilities && capabilities.fillLightMode.length !== 0);
                        return [3 /*break*/, 4];
                    case 3: return [2 /*return*/, compatible];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply the torch setting in all received tracks.
     */
    /**
     * Apply the torch setting in all received tracks.
     * @private
     * @param {?} tracks
     * @param {?} state
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.applyTorchOnTracks = /**
     * Apply the torch setting in all received tracks.
     * @private
     * @param {?} tracks
     * @param {?} state
     * @return {?}
     */
    function (tracks, state) {
        tracks.forEach((/**
         * @param {?} track
         * @return {?}
         */
        function (track) { return track.applyConstraints({
            advanced: [(/** @type {?} */ ({ torch: state, fillLightMode: state ? 'torch' : 'none' }))]
        }); }));
    };
    /**
     * Correctly sets a new scanStream value.
     */
    /**
     * Correctly sets a new scanStream value.
     * @private
     * @param {?} scan$
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype._setScanStream = /**
     * Correctly sets a new scanStream value.
     * @private
     * @param {?} scan$
     * @return {?}
     */
    function (scan$) {
        // cleans old stream
        this._cleanScanStream();
        // sets new stream
        this.scanStream = scan$;
    };
    /**
     * Cleans any old scan stream value.
     */
    /**
     * Cleans any old scan stream value.
     * @private
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype._cleanScanStream = /**
     * Cleans any old scan stream value.
     * @private
     * @return {?}
     */
    function () {
        if (this.scanStream && !this.scanStream.isStopped) {
            this.scanStream.complete();
        }
        this.scanStream = null;
    };
    /**
     * Decodes values in a stream with delays between scans.
     *
     * @param scan$ The subject to receive the values.
     * @param videoElement The video element the decode will be applied.
     * @param delay The delay between decode results.
     */
    /**
     * Decodes values in a stream with delays between scans.
     *
     * @private
     * @param {?} scan$ The subject to receive the values.
     * @param {?} videoElement The video element the decode will be applied.
     * @param {?} delay The delay between decode results.
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.decodeOnSubject = /**
     * Decodes values in a stream with delays between scans.
     *
     * @private
     * @param {?} scan$ The subject to receive the values.
     * @param {?} videoElement The video element the decode will be applied.
     * @param {?} delay The delay between decode results.
     * @return {?}
     */
    function (scan$, videoElement, delay) {
        var _this = this;
        // stops loop
        if (scan$.isStopped) {
            return;
        }
        /** @type {?} */
        var result;
        try {
            result = this.decode(videoElement);
            scan$.next({ result: result });
        }
        catch (error) {
            // stream cannot stop on fails.
            if (!error ||
                // scan Failure - found nothing, no error
                error instanceof NotFoundException ||
                // scan Error - found the QR but got error on decoding
                error instanceof ChecksumException ||
                error instanceof FormatException) {
                scan$.next({ error: error });
            }
            else {
                scan$.error(error);
            }
        }
        finally {
            /** @type {?} */
            var timeout = !result ? 0 : delay;
            setTimeout((/**
             * @return {?}
             */
            function () { return _this.decodeOnSubject(scan$, videoElement, delay); }), timeout);
        }
    };
    /**
     * Restarts the scanner.
     */
    /**
     * Restarts the scanner.
     * @private
     * @return {?}
     */
    BrowserMultiFormatContinuousReader.prototype.restart = /**
     * Restarts the scanner.
     * @private
     * @return {?}
     */
    function () {
        // reset
        // start
        return this.continuousDecodeFromInputVideoDevice(this.deviceId, this.videoElement);
    };
    return BrowserMultiFormatContinuousReader;
}(BrowserMultiFormatReader));
/**
 * Based on zxing-typescript BrowserCodeReader
 */
export { BrowserMultiFormatContinuousReader };
if (false) {
    /**
     * Says if there's a torch available for the current device.
     * @type {?}
     * @private
     */
    BrowserMultiFormatContinuousReader.prototype._isTorchAvailable;
    /**
     * The device id of the current media device.
     * @type {?}
     * @private
     */
    BrowserMultiFormatContinuousReader.prototype.deviceId;
    /**
     * If there's some scan stream open, it shal be here.
     * @type {?}
     * @private
     */
    BrowserMultiFormatContinuousReader.prototype.scanStream;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1tdWx0aS1mb3JtYXQtY29udGludW91cy1yZWFkZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Aenhpbmcvbmd4LXNjYW5uZXIvIiwic291cmNlcyI6WyJsaWIvYnJvd3Nlci1tdWx0aS1mb3JtYXQtY29udGludW91cy1yZWFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBNkM7O0FBRTdDLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQVUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6SCxPQUFPLEVBQUUsZUFBZSxFQUFjLE1BQU0sTUFBTSxDQUFDOzs7O0FBTW5EOzs7O0lBQXdELDhEQUF3QjtJQUFoRjtRQUFBLHFFQXVQQzs7OztRQTNPUyx1QkFBaUIsR0FBRyxJQUFJLGVBQWUsQ0FBVSxTQUFTLENBQUMsQ0FBQzs7SUEyT3RFLENBQUM7SUFsUEMsc0JBQVcsZ0VBQWdCO1FBSDNCOztXQUVHOzs7OztRQUNIO1lBQ0UsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDL0MsQ0FBQzs7O09BQUE7SUFpQkQ7Ozs7OztPQU1HOzs7Ozs7OztJQUNJLGlGQUFvQzs7Ozs7OztJQUEzQyxVQUNFLFFBQWlCLEVBQ2pCLFdBQThCO1FBRmhDLGlCQWdDQztRQTNCQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFYiw2Q0FBNkM7UUFDN0MsSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7U0FDMUI7UUFFRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsRUFBRTtZQUNwQyxPQUFPO1NBQ1I7O1lBRUssS0FBSyxHQUFHLElBQUksZUFBZSxDQUFpQixFQUFFLENBQUM7UUFFckQsSUFBSTtZQUNGLHdIQUF3SDtZQUN4SCxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxRQUFRLFVBQUEsRUFBRSxDQUFDO2lCQUNsQyxJQUFJOzs7O1lBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxLQUFJLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxFQUExRCxDQUEwRCxFQUFDO2lCQUMxRSxJQUFJOzs7O1lBQUMsVUFBQSxZQUFZLElBQUksT0FBQSxLQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSSxDQUFDLHNCQUFzQixDQUFDLEVBQXRFLENBQXNFLEVBQUMsQ0FBQztTQUNqRztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQjtRQUVELElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0IsbUZBQW1GO1FBRW5GLE9BQU8sS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRDs7O09BR0c7Ozs7Ozs7SUFDVSwrREFBa0I7Ozs7OztJQUEvQixVQUFnQyxFQUFzQztZQUFwQyxzQkFBUTs7Ozs7O3dCQUNsQyxXQUFXLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQzt3QkFDM0MscUJBQU0sU0FBUyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEVBQUE7O3dCQUEvRCxNQUFNLEdBQUcsU0FBc0Q7d0JBQ3JFLHNCQUFPLE1BQU0sRUFBQzs7OztLQUNmO0lBRUQ7OztPQUdHOzs7Ozs7O0lBQ0ksb0VBQXVCOzs7Ozs7SUFBOUIsVUFBK0IsUUFBZ0I7O1lBRXZDLEtBQUssR0FBRyxPQUFPLFFBQVEsS0FBSyxXQUFXO1lBQzNDLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsRUFBRTtZQUMxQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUU7O1lBRS9CLFdBQVcsR0FBMkIsRUFBRSxLQUFLLE9BQUEsRUFBRTtRQUVyRCxPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO0lBRUQ7O09BRUc7Ozs7OztJQUNJLHFEQUFROzs7OztJQUFmLFVBQWdCLEVBQVc7UUFFekIsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUU7WUFDakMsZ0NBQWdDO1lBQ2hDLE9BQU87U0FDUjs7WUFFSyxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRS9DLElBQUksRUFBRSxFQUFFO1lBQ04sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN2QzthQUFNO1lBQ0wsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2QywyREFBMkQ7WUFDM0QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ2hCO0lBQ0gsQ0FBQztJQUVEOztPQUVHOzs7Ozs7OztJQUNLLDZFQUFnQzs7Ozs7OztJQUF4QyxVQUF5QyxNQUFtQixFQUFFLFdBQTZCO1FBQ3pGLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0QyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVEOzs7O09BSUc7Ozs7Ozs7O0lBQ1cscUVBQXdCOzs7Ozs7O0lBQXRDLFVBQXVDLE1BQW1COzs7Ozs7d0JBRWxELE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQzs7Ozt3QkFFdEIsV0FBQSxpQkFBQSxNQUFNLENBQUE7Ozs7d0JBQWYsS0FBSzt3QkFDVixxQkFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQUE7O3dCQUF2QyxJQUFJLFNBQW1DLEVBQUU7NEJBQ3ZDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ2xDLHdCQUFNO3lCQUNQOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQUVKO0lBRUQ7OztPQUdHOzs7Ozs7O0lBQ0ssMkRBQWM7Ozs7OztJQUF0QixVQUF1QixNQUFtQjs7WUFDcEMsTUFBTSxHQUFHLEVBQUU7UUFDZixJQUFJO1lBQ0YsTUFBTSxHQUFHLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUNsQztnQkFDTztZQUNOLE9BQU8sTUFBTSxJQUFJLEVBQUUsQ0FBQztTQUNyQjtJQUNILENBQUM7SUFFRDs7O09BR0c7Ozs7Ozs7SUFDVyw4REFBaUI7Ozs7OztJQUEvQixVQUFnQyxLQUF1Qjs7Ozs7O3dCQUVqRCxVQUFVLEdBQUcsS0FBSzs7Ozt3QkFHZCxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDO3dCQUN2QixxQkFBTSxZQUFZLENBQUMsb0JBQW9CLEVBQUUsRUFBQTs7d0JBQXhELFlBQVksR0FBRyxTQUF5Qzt3QkFDOUQsVUFBVSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLElBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDOzs0QkFHckgsc0JBQU8sVUFBVSxFQUFDOzs7OztLQUVyQjtJQUVEOztPQUVHOzs7Ozs7OztJQUNLLCtEQUFrQjs7Ozs7OztJQUExQixVQUEyQixNQUEwQixFQUFFLEtBQWM7UUFDbkUsTUFBTSxDQUFDLE9BQU87Ozs7UUFBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztZQUM3QyxRQUFRLEVBQUUsQ0FBQyxtQkFBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBQSxDQUFDO1NBQzNFLENBQUMsRUFGc0IsQ0FFdEIsRUFBQyxDQUFDO0lBQ04sQ0FBQztJQUVEOztPQUVHOzs7Ozs7O0lBQ0ssMkRBQWM7Ozs7OztJQUF0QixVQUF1QixLQUFzQztRQUMzRCxvQkFBb0I7UUFDcEIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDeEIsa0JBQWtCO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFRDs7T0FFRzs7Ozs7O0lBQ0ssNkRBQWdCOzs7OztJQUF4QjtRQUVFLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFO1lBQ2pELElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDNUI7UUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7OztPQU1HOzs7Ozs7Ozs7O0lBQ0ssNERBQWU7Ozs7Ozs7OztJQUF2QixVQUF3QixLQUFzQyxFQUFFLFlBQThCLEVBQUUsS0FBYTtRQUE3RyxpQkE4QkM7UUE1QkMsYUFBYTtRQUNiLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRTtZQUNuQixPQUFPO1NBQ1I7O1lBRUcsTUFBYztRQUVsQixJQUFJO1lBQ0YsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbkMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sUUFBQSxFQUFFLENBQUMsQ0FBQztTQUN4QjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsK0JBQStCO1lBQy9CLElBQ0UsQ0FBQyxLQUFLO2dCQUNOLHlDQUF5QztnQkFDekMsS0FBSyxZQUFZLGlCQUFpQjtnQkFDbEMsc0RBQXNEO2dCQUN0RCxLQUFLLFlBQVksaUJBQWlCO2dCQUNsQyxLQUFLLFlBQVksZUFBZSxFQUNoQztnQkFDQSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZCO2lCQUFNO2dCQUNMLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEI7U0FDRjtnQkFBUzs7Z0JBQ0YsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDbkMsVUFBVTs7O1lBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBaEQsQ0FBZ0QsR0FBRSxPQUFPLENBQUMsQ0FBQztTQUM3RTtJQUNILENBQUM7SUFFRDs7T0FFRzs7Ozs7O0lBQ0ssb0RBQU87Ozs7O0lBQWY7UUFDRSxRQUFRO1FBQ1IsUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLG9DQUFvQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFSCx5Q0FBQztBQUFELENBQUMsQUF2UEQsQ0FBd0Qsd0JBQXdCLEdBdVAvRTs7Ozs7Ozs7Ozs7SUEzT0MsK0RBQW9FOzs7Ozs7SUFLcEUsc0RBQXlCOzs7Ozs7SUFLekIsd0RBQW9EIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vaW1hZ2UtY2FwdHVyZS5kLnRzXCIgLz5cclxuXHJcbmltcG9ydCB7IEJyb3dzZXJNdWx0aUZvcm1hdFJlYWRlciwgQ2hlY2tzdW1FeGNlcHRpb24sIEZvcm1hdEV4Y2VwdGlvbiwgTm90Rm91bmRFeGNlcHRpb24sIFJlc3VsdCB9IGZyb20gJ0B6eGluZy9saWJyYXJ5JztcclxuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IFJlc3VsdEFuZEVycm9yIH0gZnJvbSAnLi9SZXN1bHRBbmRFcnJvcic7XHJcblxyXG4vKipcclxuICogQmFzZWQgb24genhpbmctdHlwZXNjcmlwdCBCcm93c2VyQ29kZVJlYWRlclxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEJyb3dzZXJNdWx0aUZvcm1hdENvbnRpbnVvdXNSZWFkZXIgZXh0ZW5kcyBCcm93c2VyTXVsdGlGb3JtYXRSZWFkZXIge1xyXG5cclxuICAvKipcclxuICAgKiBFeHBvc2VzIF90b2NoQXZhaWxhYmxlIC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGlzVG9yY2hBdmFpbGFibGUoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XHJcbiAgICByZXR1cm4gdGhpcy5faXNUb3JjaEF2YWlsYWJsZS5hc09ic2VydmFibGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNheXMgaWYgdGhlcmUncyBhIHRvcmNoIGF2YWlsYWJsZSBmb3IgdGhlIGN1cnJlbnQgZGV2aWNlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2lzVG9yY2hBdmFpbGFibGUgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+KHVuZGVmaW5lZCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBkZXZpY2UgaWQgb2YgdGhlIGN1cnJlbnQgbWVkaWEgZGV2aWNlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZGV2aWNlSWQ6IHN0cmluZztcclxuXHJcbiAgLyoqXHJcbiAgICogSWYgdGhlcmUncyBzb21lIHNjYW4gc3RyZWFtIG9wZW4sIGl0IHNoYWwgYmUgaGVyZS5cclxuICAgKi9cclxuICBwcml2YXRlIHNjYW5TdHJlYW06IEJlaGF2aW9yU3ViamVjdDxSZXN1bHRBbmRFcnJvcj47XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXJ0cyB0aGUgZGVjb2RpbmcgZnJvbSB0aGUgY3VycmVudCBvciBhIG5ldyB2aWRlbyBlbGVtZW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGNhbGxiYWNrRm4gVGhlIGNhbGxiYWNrIHRvIGJlIGV4ZWN1dGVkIGFmdGVyIGV2ZXJ5IHNjYW4gYXR0ZW1wdFxyXG4gICAqIEBwYXJhbSBkZXZpY2VJZCBUaGUgZGV2aWNlJ3MgdG8gYmUgdXNlZCBJZFxyXG4gICAqIEBwYXJhbSB2aWRlb1NvdXJjZSBBIG5ldyB2aWRlbyBlbGVtZW50XHJcbiAgICovXHJcbiAgcHVibGljIGNvbnRpbnVvdXNEZWNvZGVGcm9tSW5wdXRWaWRlb0RldmljZShcclxuICAgIGRldmljZUlkPzogc3RyaW5nLFxyXG4gICAgdmlkZW9Tb3VyY2U/OiBIVE1MVmlkZW9FbGVtZW50XHJcbiAgKTogT2JzZXJ2YWJsZTxSZXN1bHRBbmRFcnJvcj4ge1xyXG5cclxuICAgIHRoaXMucmVzZXQoKTtcclxuXHJcbiAgICAvLyBLZWVwcyB0aGUgZGV2aWNlSWQgYmV0d2VlbiBzY2FubmVyIHJlc2V0cy5cclxuICAgIGlmICh0eXBlb2YgZGV2aWNlSWQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMuZGV2aWNlSWQgPSBkZXZpY2VJZDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNjYW4kID0gbmV3IEJlaGF2aW9yU3ViamVjdDxSZXN1bHRBbmRFcnJvcj4oe30pO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIHRoaXMuZGVjb2RlRnJvbUlucHV0VmlkZW9EZXZpY2VDb250aW51b3VzbHkoZGV2aWNlSWQsIHZpZGVvU291cmNlLCAocmVzdWx0LCBlcnJvcikgPT4gc2NhbiQubmV4dCh7IHJlc3VsdCwgZXJyb3IgfSkpO1xyXG4gICAgICB0aGlzLmdldFN0cmVhbUZvckRldmljZSh7IGRldmljZUlkIH0pXHJcbiAgICAgICAgLnRoZW4oc3RyZWFtID0+IHRoaXMuYXR0YWNoU3RyZWFtVG9WaWRlb0FuZENoZWNrVG9yY2goc3RyZWFtLCB2aWRlb1NvdXJjZSkpXHJcbiAgICAgICAgLnRoZW4odmlkZW9FbGVtZW50ID0+IHRoaXMuZGVjb2RlT25TdWJqZWN0KHNjYW4kLCB2aWRlb0VsZW1lbnQsIHRoaXMudGltZUJldHdlZW5TY2Fuc01pbGxpcykpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBzY2FuJC5lcnJvcihlKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zZXRTY2FuU3RyZWFtKHNjYW4kKTtcclxuXHJcbiAgICAvLyBAdG9kbyBGaW5kIGEgd2F5IHRvIGVtaXQgYSBjb21wbGV0ZSBldmVudCBvbiB0aGUgc2NhbiBzdHJlYW0gb25jZSBpdCdzIGZpbmlzaGVkLlxyXG5cclxuICAgIHJldHVybiBzY2FuJC5hc09ic2VydmFibGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG1lZGlhIHN0cmVhbSBmb3IgY2VydGFpbiBkZXZpY2UuXHJcbiAgICogRmFsbHMgYmFjayB0byBhbnkgYXZhaWxhYmxlIGRldmljZSBpZiBubyBgZGV2aWNlSWRgIGlzIGRlZmluZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGFzeW5jIGdldFN0cmVhbUZvckRldmljZSh7IGRldmljZUlkIH06IFBhcnRpYWw8TWVkaWFEZXZpY2VJbmZvPik6IFByb21pc2U8TWVkaWFTdHJlYW0+IHtcclxuICAgIGNvbnN0IGNvbnN0cmFpbnRzID0gdGhpcy5nZXRVc2VyTWVkaWFDb25zdHJhaW50cyhkZXZpY2VJZCk7XHJcbiAgICBjb25zdCBzdHJlYW0gPSBhd2FpdCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYShjb25zdHJhaW50cyk7XHJcbiAgICByZXR1cm4gc3RyZWFtO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBtZWRpYSBzdGVyYW0gY29uc3RyYWludHMgZm9yIGNlcnRhaW4gYGRldmljZUlkYC5cclxuICAgKiBGYWxscyBiYWNrIHRvIGFueSBlbnZpcm9ubWVudCBhdmFpbGFibGUgZGV2aWNlIGlmIG5vIGBkZXZpY2VJZGAgaXMgZGVmaW5lZC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VXNlck1lZGlhQ29uc3RyYWludHMoZGV2aWNlSWQ6IHN0cmluZyk6IE1lZGlhU3RyZWFtQ29uc3RyYWludHMge1xyXG5cclxuICAgIGNvbnN0IHZpZGVvID0gdHlwZW9mIGRldmljZUlkID09PSAndW5kZWZpbmVkJ1xyXG4gICAgICA/IHsgZmFjaW5nTW9kZTogeyBleGFjdDogJ2Vudmlyb25tZW50JyB9IH1cclxuICAgICAgOiB7IGRldmljZUlkOiB7IGV4YWN0OiBkZXZpY2VJZCB9IH07XHJcblxyXG4gICAgY29uc3QgY29uc3RyYWludHM6IE1lZGlhU3RyZWFtQ29uc3RyYWludHMgPSB7IHZpZGVvIH07XHJcblxyXG4gICAgcmV0dXJuIGNvbnN0cmFpbnRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW5hYmxlcyBhbmQgZGlzYWJsZXMgdGhlIGRldmljZSB0b3JjaC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0VG9yY2gob246IGJvb2xlYW4pOiB2b2lkIHtcclxuXHJcbiAgICBpZiAoIXRoaXMuX2lzVG9yY2hBdmFpbGFibGUudmFsdWUpIHtcclxuICAgICAgLy8gY29tcGF0aWJpbGl0eSBub3QgY2hlY2tlZCB5ZXRcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRyYWNrcyA9IHRoaXMuZ2V0VmlkZW9UcmFja3ModGhpcy5zdHJlYW0pO1xyXG5cclxuICAgIGlmIChvbikge1xyXG4gICAgICB0aGlzLmFwcGx5VG9yY2hPblRyYWNrcyh0cmFja3MsIHRydWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hcHBseVRvcmNoT25UcmFja3ModHJhY2tzLCBmYWxzZSk7XHJcbiAgICAgIC8vIEB0b2RvIGNoZWNrIHBvc3NpYmlsaXR5IHRvIGRpc2FibGUgdG9yY2ggd2l0aG91dCByZXN0YXJ0XHJcbiAgICAgIHRoaXMucmVzdGFydCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSB0b3JjaCBjb21wYXRpYmlsaXR5IHN0YXRlIGFuZCBhdHRhY2hzIHRoZSBzdHJlYW0gdG8gdGhlIHByZXZpZXcgZWxlbWVudC5cclxuICAgKi9cclxuICBwcml2YXRlIGF0dGFjaFN0cmVhbVRvVmlkZW9BbmRDaGVja1RvcmNoKHN0cmVhbTogTWVkaWFTdHJlYW0sIHZpZGVvU291cmNlOiBIVE1MVmlkZW9FbGVtZW50KTogUHJvbWlzZTxIVE1MVmlkZW9FbGVtZW50PiB7XHJcbiAgICB0aGlzLnVwZGF0ZVRvcmNoQ29tcGF0aWJpbGl0eShzdHJlYW0pO1xyXG4gICAgcmV0dXJuIHRoaXMuYXR0YWNoU3RyZWFtVG9WaWRlbyhzdHJlYW0sIHZpZGVvU291cmNlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyBpZiB0aGUgc3RyZWFtIHN1cHBvcnRzIHRvcmNoIGNvbnRyb2wuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RyZWFtIFRoZSBtZWRpYSBzdHJlYW0gdXNlZCB0byBjaGVjay5cclxuICAgKi9cclxuICBwcml2YXRlIGFzeW5jIHVwZGF0ZVRvcmNoQ29tcGF0aWJpbGl0eShzdHJlYW06IE1lZGlhU3RyZWFtKTogUHJvbWlzZTx2b2lkPiB7XHJcblxyXG4gICAgY29uc3QgdHJhY2tzID0gdGhpcy5nZXRWaWRlb1RyYWNrcyhzdHJlYW0pO1xyXG5cclxuICAgIGZvciAoY29uc3QgdHJhY2sgb2YgdHJhY2tzKSB7XHJcbiAgICAgIGlmIChhd2FpdCB0aGlzLmlzVG9yY2hDb21wYXRpYmxlKHRyYWNrKSkge1xyXG4gICAgICAgIHRoaXMuX2lzVG9yY2hBdmFpbGFibGUubmV4dCh0cnVlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICpcclxuICAgKiBAcGFyYW0gc3RyZWFtIFRoZSB2aWRlbyBzdHJlYW0gd2hlcmUgdGhlIHRyYWNrcyBnb25uYSBiZSBleHRyYWN0ZWQgZnJvbS5cclxuICAgKi9cclxuICBwcml2YXRlIGdldFZpZGVvVHJhY2tzKHN0cmVhbTogTWVkaWFTdHJlYW0pIHtcclxuICAgIGxldCB0cmFja3MgPSBbXTtcclxuICAgIHRyeSB7XHJcbiAgICAgIHRyYWNrcyA9IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpO1xyXG4gICAgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgIHJldHVybiB0cmFja3MgfHwgW107XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKlxyXG4gICAqIEBwYXJhbSB0cmFjayBUaGUgbWVkaWEgc3RyZWFtIHRyYWNrIHRoYXQgd2lsbCBiZSBjaGVja2VkIGZvciBjb21wYXRpYmlsaXR5LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXN5bmMgaXNUb3JjaENvbXBhdGlibGUodHJhY2s6IE1lZGlhU3RyZWFtVHJhY2spIHtcclxuXHJcbiAgICBsZXQgY29tcGF0aWJsZSA9IGZhbHNlO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGltYWdlQ2FwdHVyZSA9IG5ldyBJbWFnZUNhcHR1cmUodHJhY2spO1xyXG4gICAgICBjb25zdCBjYXBhYmlsaXRpZXMgPSBhd2FpdCBpbWFnZUNhcHR1cmUuZ2V0UGhvdG9DYXBhYmlsaXRpZXMoKTtcclxuICAgICAgY29tcGF0aWJsZSA9ICEhY2FwYWJpbGl0aWVzWyd0b3JjaCddIHx8ICgnZmlsbExpZ2h0TW9kZScgaW4gY2FwYWJpbGl0aWVzICYmIGNhcGFiaWxpdGllcy5maWxsTGlnaHRNb2RlLmxlbmd0aCAhPT0gMCk7XHJcbiAgICB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgcmV0dXJuIGNvbXBhdGlibGU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBseSB0aGUgdG9yY2ggc2V0dGluZyBpbiBhbGwgcmVjZWl2ZWQgdHJhY2tzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXBwbHlUb3JjaE9uVHJhY2tzKHRyYWNrczogTWVkaWFTdHJlYW1UcmFja1tdLCBzdGF0ZTogYm9vbGVhbikge1xyXG4gICAgdHJhY2tzLmZvckVhY2godHJhY2sgPT4gdHJhY2suYXBwbHlDb25zdHJhaW50cyh7XHJcbiAgICAgIGFkdmFuY2VkOiBbPGFueT57IHRvcmNoOiBzdGF0ZSwgZmlsbExpZ2h0TW9kZTogc3RhdGUgPyAndG9yY2gnIDogJ25vbmUnIH1dXHJcbiAgICB9KSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb3JyZWN0bHkgc2V0cyBhIG5ldyBzY2FuU3RyZWFtIHZhbHVlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX3NldFNjYW5TdHJlYW0oc2NhbiQ6IEJlaGF2aW9yU3ViamVjdDxSZXN1bHRBbmRFcnJvcj4pOiB2b2lkIHtcclxuICAgIC8vIGNsZWFucyBvbGQgc3RyZWFtXHJcbiAgICB0aGlzLl9jbGVhblNjYW5TdHJlYW0oKTtcclxuICAgIC8vIHNldHMgbmV3IHN0cmVhbVxyXG4gICAgdGhpcy5zY2FuU3RyZWFtID0gc2NhbiQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhbnMgYW55IG9sZCBzY2FuIHN0cmVhbSB2YWx1ZS5cclxuICAgKi9cclxuICBwcml2YXRlIF9jbGVhblNjYW5TdHJlYW0oKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKHRoaXMuc2NhblN0cmVhbSAmJiAhdGhpcy5zY2FuU3RyZWFtLmlzU3RvcHBlZCkge1xyXG4gICAgICB0aGlzLnNjYW5TdHJlYW0uY29tcGxldGUoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNjYW5TdHJlYW0gPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVjb2RlcyB2YWx1ZXMgaW4gYSBzdHJlYW0gd2l0aCBkZWxheXMgYmV0d2VlbiBzY2Fucy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzY2FuJCBUaGUgc3ViamVjdCB0byByZWNlaXZlIHRoZSB2YWx1ZXMuXHJcbiAgICogQHBhcmFtIHZpZGVvRWxlbWVudCBUaGUgdmlkZW8gZWxlbWVudCB0aGUgZGVjb2RlIHdpbGwgYmUgYXBwbGllZC5cclxuICAgKiBAcGFyYW0gZGVsYXkgVGhlIGRlbGF5IGJldHdlZW4gZGVjb2RlIHJlc3VsdHMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBkZWNvZGVPblN1YmplY3Qoc2NhbiQ6IEJlaGF2aW9yU3ViamVjdDxSZXN1bHRBbmRFcnJvcj4sIHZpZGVvRWxlbWVudDogSFRNTFZpZGVvRWxlbWVudCwgZGVsYXk6IG51bWJlcik6IHZvaWQge1xyXG5cclxuICAgIC8vIHN0b3BzIGxvb3BcclxuICAgIGlmIChzY2FuJC5pc1N0b3BwZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCByZXN1bHQ6IFJlc3VsdDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICByZXN1bHQgPSB0aGlzLmRlY29kZSh2aWRlb0VsZW1lbnQpO1xyXG4gICAgICBzY2FuJC5uZXh0KHsgcmVzdWx0IH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgLy8gc3RyZWFtIGNhbm5vdCBzdG9wIG9uIGZhaWxzLlxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgIWVycm9yIHx8XHJcbiAgICAgICAgLy8gc2NhbiBGYWlsdXJlIC0gZm91bmQgbm90aGluZywgbm8gZXJyb3JcclxuICAgICAgICBlcnJvciBpbnN0YW5jZW9mIE5vdEZvdW5kRXhjZXB0aW9uIHx8XHJcbiAgICAgICAgLy8gc2NhbiBFcnJvciAtIGZvdW5kIHRoZSBRUiBidXQgZ290IGVycm9yIG9uIGRlY29kaW5nXHJcbiAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBDaGVja3N1bUV4Y2VwdGlvbiB8fFxyXG4gICAgICAgIGVycm9yIGluc3RhbmNlb2YgRm9ybWF0RXhjZXB0aW9uXHJcbiAgICAgICkge1xyXG4gICAgICAgIHNjYW4kLm5leHQoeyBlcnJvciB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzY2FuJC5lcnJvcihlcnJvcik7XHJcbiAgICAgIH1cclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIGNvbnN0IHRpbWVvdXQgPSAhcmVzdWx0ID8gMCA6IGRlbGF5O1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuZGVjb2RlT25TdWJqZWN0KHNjYW4kLCB2aWRlb0VsZW1lbnQsIGRlbGF5KSwgdGltZW91dCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXN0YXJ0cyB0aGUgc2Nhbm5lci5cclxuICAgKi9cclxuICBwcml2YXRlIHJlc3RhcnQoKTogT2JzZXJ2YWJsZTxSZXN1bHRBbmRFcnJvcj4ge1xyXG4gICAgLy8gcmVzZXRcclxuICAgIC8vIHN0YXJ0XHJcbiAgICByZXR1cm4gdGhpcy5jb250aW51b3VzRGVjb2RlRnJvbUlucHV0VmlkZW9EZXZpY2UodGhpcy5kZXZpY2VJZCwgdGhpcy52aWRlb0VsZW1lbnQpO1xyXG4gIH1cclxuXHJcbn1cclxuIl19