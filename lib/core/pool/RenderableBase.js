var SubGeometryBase = require("awayjs-core/lib/core/base/SubGeometryBase");
var TriangleSubGeometry = require("awayjs-core/lib/core/base/TriangleSubGeometry");
var AbstractMethodError = require("awayjs-core/lib/errors/AbstractMethodError");
var SubGeometryEvent = require("awayjs-core/lib/events/SubGeometryEvent");
var IndexDataPool = require("awayjs-stagegl/lib/core/pool/IndexDataPool");
var VertexDataPool = require("awayjs-stagegl/lib/core/pool/VertexDataPool");
/**
 * @class RenderableListItem
 */
var RenderableBase = (function () {
    /**
     *
     * @param sourceEntity
     * @param materialOwner
     * @param subGeometry
     * @param animationSubGeometry
     */
    function RenderableBase(pool, sourceEntity, materialOwner, level, indexOffset) {
        var _this = this;
        if (level === void 0) { level = 0; }
        if (indexOffset === void 0) { indexOffset = 0; }
        this._geometryDirty = true;
        this._indexDataDirty = true;
        this._vertexData = new Object();
        this._pVertexDataDirty = new Object();
        this._vertexOffset = new Object();
        this._onIndicesUpdatedDelegate = function (event) { return _this._onIndicesUpdated(event); };
        this._onVerticesUpdatedDelegate = function (event) { return _this._onVerticesUpdated(event); };
        //store a reference to the pool for later disposal
        this._pool = pool;
        //reference to level of overflow
        this._level = level;
        //reference to the offset on indices (if this is an overflow renderable)
        this._indexOffset = indexOffset;
        this.sourceEntity = sourceEntity;
        this.materialOwner = materialOwner;
    }
    Object.defineProperty(RenderableBase.prototype, "overflow", {
        /**
         *
         */
        get: function () {
            if (this._indexDataDirty)
                this._updateIndexData();
            return this._overflow;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderableBase.prototype, "numTriangles", {
        /**
         *
         */
        get: function () {
            return this._numTriangles;
        },
        enumerable: true,
        configurable: true
    });
    /**
     *
     */
    RenderableBase.prototype.getIndexData = function () {
        if (this._indexDataDirty)
            this._updateIndexData();
        return this._indexData;
    };
    /**
     *
     */
    RenderableBase.prototype.getVertexData = function (dataType) {
        if (this._indexDataDirty)
            this._updateIndexData();
        if (this._pVertexDataDirty[dataType])
            this._updateVertexData(dataType);
        return this._vertexData[this._concatenateArrays ? TriangleSubGeometry.VERTEX_DATA : dataType];
    };
    /**
     *
     */
    RenderableBase.prototype.getVertexOffset = function (dataType) {
        if (this._indexDataDirty)
            this._updateIndexData();
        if (this._pVertexDataDirty[dataType])
            this._updateVertexData(dataType);
        return this._vertexOffset[dataType];
    };
    RenderableBase.prototype.dispose = function () {
        this._pool.disposeItem(this.materialOwner);
        this._indexData.dispose();
        this._indexData = null;
        for (var dataType in this._vertexData) {
            this._vertexData[dataType].dispose();
            this._vertexData[dataType] = null;
        }
        if (this._overflow) {
            this._overflow.dispose();
            this._overflow = null;
        }
    };
    RenderableBase.prototype.invalidateGeometry = function () {
        this._geometryDirty = true;
        //invalidate indices
        if (this._level == 0)
            this._indexDataDirty = true;
        if (this._overflow)
            this._overflow.invalidateGeometry();
    };
    /**
     *
     */
    RenderableBase.prototype.invalidateIndexData = function () {
        this._indexDataDirty = true;
    };
    /**
     * //TODO
     *
     * @param dataType
     */
    RenderableBase.prototype.invalidateVertexData = function (dataType) {
        this._pVertexDataDirty[dataType] = true;
    };
    RenderableBase.prototype._pGetSubGeometry = function () {
        throw new AbstractMethodError();
    };
    /**
     * //TODO
     *
     * @param subGeometry
     * @param offset
     * @internal
     */
    RenderableBase.prototype._iFillIndexData = function (indexOffset) {
        if (this._geometryDirty)
            this._updateGeometry();
        this._indexData = IndexDataPool.getItem(this._subGeometry, this._level, indexOffset);
        this._numTriangles = this._indexData.data.length / 3;
        indexOffset = this._indexData.offset;
        //check if there is more to split
        if (indexOffset < this._subGeometry.indices.length) {
            if (!this._overflow)
                this._overflow = this._pGetOverflowRenderable(this._pool, this.materialOwner, indexOffset, this._level + 1);
            this._overflow._iFillIndexData(indexOffset);
        }
        else if (this._overflow) {
            this._overflow.dispose();
            this._overflow = null;
        }
    };
    RenderableBase.prototype._pGetOverflowRenderable = function (pool, materialOwner, level, indexOffset) {
        throw new AbstractMethodError();
    };
    /**
     * //TODO
     *
     * @private
     */
    RenderableBase.prototype._updateGeometry = function () {
        if (this._subGeometry) {
            if (this._level == 0)
                this._subGeometry.removeEventListener(SubGeometryEvent.INDICES_UPDATED, this._onIndicesUpdatedDelegate);
            this._subGeometry.removeEventListener(SubGeometryEvent.VERTICES_UPDATED, this._onVerticesUpdatedDelegate);
        }
        this._subGeometry = this._pGetSubGeometry();
        this._concatenateArrays = this._subGeometry.concatenateArrays;
        if (this._subGeometry) {
            if (this._level == 0)
                this._subGeometry.addEventListener(SubGeometryEvent.INDICES_UPDATED, this._onIndicesUpdatedDelegate);
            this._subGeometry.addEventListener(SubGeometryEvent.VERTICES_UPDATED, this._onVerticesUpdatedDelegate);
        }
        //dispose
        //			if (this._indexData) {
        //				this._indexData.dispose(); //TODO where is a good place to dispose?
        //				this._indexData = null;
        //			}
        //			for (var dataType in this._vertexData) {
        //				(<VertexData> this._vertexData[dataType]).dispose(); //TODO where is a good place to dispose?
        //				this._vertexData[dataType] = null;
        //			}
        this._geometryDirty = false;
        //specific vertex data types have to be invalidated in the specific renderable
    };
    /**
     * //TODO
     *
     * @private
     */
    RenderableBase.prototype._updateIndexData = function () {
        this._iFillIndexData(this._indexOffset);
        this._indexDataDirty = false;
    };
    /**
     * //TODO
     *
     * @param dataType
     * @private
     */
    RenderableBase.prototype._updateVertexData = function (dataType) {
        this._vertexOffset[dataType] = this._subGeometry.getOffset(dataType);
        if (this._subGeometry.concatenateArrays)
            dataType = SubGeometryBase.VERTEX_DATA;
        this._vertexData[dataType] = VertexDataPool.getItem(this._subGeometry, this.getIndexData(), dataType);
        this._pVertexDataDirty[dataType] = false;
    };
    /**
     * //TODO
     *
     * @param event
     * @private
     */
    RenderableBase.prototype._onIndicesUpdated = function (event) {
        this.invalidateIndexData();
    };
    /**
     * //TODO
     *
     * @param event
     * @private
     */
    RenderableBase.prototype._onVerticesUpdated = function (event) {
        this._concatenateArrays = event.target.concatenateArrays;
        this.invalidateVertexData(event.dataType);
    };
    return RenderableBase;
})();
module.exports = RenderableBase;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUvcG9vbC9yZW5kZXJhYmxlYmFzZS50cyJdLCJuYW1lcyI6WyJSZW5kZXJhYmxlQmFzZSIsIlJlbmRlcmFibGVCYXNlLmNvbnN0cnVjdG9yIiwiUmVuZGVyYWJsZUJhc2Uub3ZlcmZsb3ciLCJSZW5kZXJhYmxlQmFzZS5udW1UcmlhbmdsZXMiLCJSZW5kZXJhYmxlQmFzZS5nZXRJbmRleERhdGEiLCJSZW5kZXJhYmxlQmFzZS5nZXRWZXJ0ZXhEYXRhIiwiUmVuZGVyYWJsZUJhc2UuZ2V0VmVydGV4T2Zmc2V0IiwiUmVuZGVyYWJsZUJhc2UuZGlzcG9zZSIsIlJlbmRlcmFibGVCYXNlLmludmFsaWRhdGVHZW9tZXRyeSIsIlJlbmRlcmFibGVCYXNlLmludmFsaWRhdGVJbmRleERhdGEiLCJSZW5kZXJhYmxlQmFzZS5pbnZhbGlkYXRlVmVydGV4RGF0YSIsIlJlbmRlcmFibGVCYXNlLl9wR2V0U3ViR2VvbWV0cnkiLCJSZW5kZXJhYmxlQmFzZS5faUZpbGxJbmRleERhdGEiLCJSZW5kZXJhYmxlQmFzZS5fcEdldE92ZXJmbG93UmVuZGVyYWJsZSIsIlJlbmRlcmFibGVCYXNlLl91cGRhdGVHZW9tZXRyeSIsIlJlbmRlcmFibGVCYXNlLl91cGRhdGVJbmRleERhdGEiLCJSZW5kZXJhYmxlQmFzZS5fdXBkYXRlVmVydGV4RGF0YSIsIlJlbmRlcmFibGVCYXNlLl9vbkluZGljZXNVcGRhdGVkIiwiUmVuZGVyYWJsZUJhc2UuX29uVmVydGljZXNVcGRhdGVkIl0sIm1hcHBpbmdzIjoiQUFDQSxJQUFPLGVBQWUsV0FBYywyQ0FBMkMsQ0FBQyxDQUFDO0FBQ2pGLElBQU8sbUJBQW1CLFdBQWEsK0NBQStDLENBQUMsQ0FBQztBQUt4RixJQUFPLG1CQUFtQixXQUFhLDRDQUE0QyxDQUFDLENBQUM7QUFDckYsSUFBTyxnQkFBZ0IsV0FBYyx5Q0FBeUMsQ0FBQyxDQUFDO0FBSWhGLElBQU8sYUFBYSxXQUFjLDRDQUE0QyxDQUFDLENBQUM7QUFFaEYsSUFBTyxjQUFj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QWtCQSxHQUFzQkEsS0FBS0EsQ0FBQ0EsTUFBT0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtRQUU3RUEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUMzQ0EsQ0FBQ0E7SUFDRmxCLHFCQUFDQTtBQUFEQSxDQWhWQSxBQWdWQ0EsSUFBQTtBQUVELEFBQXdCLGlCQUFmLGNBQWMsQ0FBQyIsImZpbGUiOiJjb3JlL3Bvb2wvUmVuZGVyYWJsZUJhc2UuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL3JvYmJhdGVtYW4vV2Vic3Rvcm1Qcm9qZWN0cy9hd2F5anMtc3RhZ2VnbC8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgSU1hdGVyaWFsT3duZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2Jhc2UvSU1hdGVyaWFsT3duZXJcIik7XG5pbXBvcnQgU3ViR2VvbWV0cnlCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9iYXNlL1N1Ykdlb21ldHJ5QmFzZVwiKTtcbmltcG9ydCBUcmlhbmdsZVN1Ykdlb21ldHJ5XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvYmFzZS9UcmlhbmdsZVN1Ykdlb21ldHJ5XCIpO1xuaW1wb3J0IE1hdHJpeDNEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvZ2VvbS9NYXRyaXgzRFwiKTtcbmltcG9ydCBJUmVuZGVyYWJsZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9wb29sL0lSZW5kZXJhYmxlXCIpO1xuaW1wb3J0IFJlbmRlcmFibGVQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9wb29sL1JlbmRlcmFibGVQb29sXCIpO1xuaW1wb3J0IElFbnRpdHlcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZW50aXRpZXMvSUVudGl0eVwiKTtcbmltcG9ydCBBYnN0cmFjdE1ldGhvZEVycm9yXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Vycm9ycy9BYnN0cmFjdE1ldGhvZEVycm9yXCIpO1xuaW1wb3J0IFN1Ykdlb21ldHJ5RXZlbnRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvU3ViR2VvbWV0cnlFdmVudFwiKTtcbmltcG9ydCBNYXRlcmlhbEJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL21hdGVyaWFscy9NYXRlcmlhbEJhc2VcIik7XG5cbmltcG9ydCBJbmRleERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvcG9vbC9JbmRleERhdGFcIik7XG5pbXBvcnQgSW5kZXhEYXRhUG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvcG9vbC9JbmRleERhdGFQb29sXCIpO1xuaW1wb3J0IFZlcnRleERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvcG9vbC9WZXJ0ZXhEYXRhXCIpO1xuaW1wb3J0IFZlcnRleERhdGFQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9wb29sL1ZlcnRleERhdGFQb29sXCIpO1xuXG4vKipcbiAqIEBjbGFzcyBSZW5kZXJhYmxlTGlzdEl0ZW1cbiAqL1xuY2xhc3MgUmVuZGVyYWJsZUJhc2UgaW1wbGVtZW50cyBJUmVuZGVyYWJsZVxue1xuXHRwcml2YXRlIF9vbkluZGljZXNVcGRhdGVkRGVsZWdhdGU6KGV2ZW50OlN1Ykdlb21ldHJ5RXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgX29uVmVydGljZXNVcGRhdGVkRGVsZWdhdGU6KGV2ZW50OlN1Ykdlb21ldHJ5RXZlbnQpID0+IHZvaWQ7XG5cblx0cHJpdmF0ZSBfc3ViR2VvbWV0cnk6U3ViR2VvbWV0cnlCYXNlO1xuXHRwcml2YXRlIF9nZW9tZXRyeURpcnR5OmJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF9pbmRleERhdGE6SW5kZXhEYXRhO1xuXHRwcml2YXRlIF9pbmRleERhdGFEaXJ0eTpib29sZWFuID0gdHJ1ZTtcblx0cHJpdmF0ZSBfdmVydGV4RGF0YTpPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cdHB1YmxpYyBfcFZlcnRleERhdGFEaXJ0eTpPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cdHByaXZhdGUgX3ZlcnRleE9mZnNldDpPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cblx0cHJpdmF0ZSBfbGV2ZWw6bnVtYmVyO1xuXHRwcml2YXRlIF9pbmRleE9mZnNldDpudW1iZXI7XG5cdHByaXZhdGUgX292ZXJmbG93OlJlbmRlcmFibGVCYXNlO1xuXHRwcml2YXRlIF9udW1UcmlhbmdsZXM6bnVtYmVyO1xuXHRwcml2YXRlIF9jb25jYXRlbmF0ZUFycmF5czpib29sZWFuO1xuXG5cblx0cHVibGljIEpPSU5UX0lOREVYX0ZPUk1BVDpzdHJpbmc7XG5cdHB1YmxpYyBKT0lOVF9XRUlHSFRfRk9STUFUOnN0cmluZztcblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBfcG9vbDpSZW5kZXJhYmxlUG9vbDtcblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBnZXQgb3ZlcmZsb3coKTpSZW5kZXJhYmxlQmFzZVxuXHR7XG5cdFx0aWYgKHRoaXMuX2luZGV4RGF0YURpcnR5KVxuXHRcdFx0dGhpcy5fdXBkYXRlSW5kZXhEYXRhKCk7XG5cblx0XHRyZXR1cm4gdGhpcy5fb3ZlcmZsb3c7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBnZXQgbnVtVHJpYW5nbGVzKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbnVtVHJpYW5nbGVzO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgbmV4dDpSZW5kZXJhYmxlQmFzZTtcblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBtYXRlcmlhbElkOm51bWJlcjtcblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyByZW5kZXJPcmRlcklkOm51bWJlcjtcblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyB6SW5kZXg6bnVtYmVyO1xuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGNhc2NhZGVkOmJvb2xlYW47XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgcmVuZGVyU2NlbmVUcmFuc2Zvcm06TWF0cml4M0Q7XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgc291cmNlRW50aXR5OklFbnRpdHk7XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgbWF0ZXJpYWxPd25lcjpJTWF0ZXJpYWxPd25lcjtcblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBtYXRlcmlhbDpNYXRlcmlhbEJhc2U7XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgZ2V0SW5kZXhEYXRhKCk6SW5kZXhEYXRhXG5cdHtcblx0XHRpZiAodGhpcy5faW5kZXhEYXRhRGlydHkpXG5cdFx0XHR0aGlzLl91cGRhdGVJbmRleERhdGEoKTtcblxuXHRcdHJldHVybiB0aGlzLl9pbmRleERhdGE7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBnZXRWZXJ0ZXhEYXRhKGRhdGFUeXBlOnN0cmluZyk6VmVydGV4RGF0YVxuXHR7XG5cdFx0aWYgKHRoaXMuX2luZGV4RGF0YURpcnR5KVxuXHRcdFx0dGhpcy5fdXBkYXRlSW5kZXhEYXRhKCk7XG5cblx0XHRpZiAodGhpcy5fcFZlcnRleERhdGFEaXJ0eVtkYXRhVHlwZV0pXG5cdFx0XHR0aGlzLl91cGRhdGVWZXJ0ZXhEYXRhKGRhdGFUeXBlKTtcblxuXHRcdHJldHVybiB0aGlzLl92ZXJ0ZXhEYXRhW3RoaXMuX2NvbmNhdGVuYXRlQXJyYXlzPyBUcmlhbmdsZVN1Ykdlb21ldHJ5LlZFUlRFWF9EQVRBIDogZGF0YVR5cGVdXG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBnZXRWZXJ0ZXhPZmZzZXQoZGF0YVR5cGU6c3RyaW5nKTpudW1iZXJcblx0e1xuXHRcdGlmICh0aGlzLl9pbmRleERhdGFEaXJ0eSlcblx0XHRcdHRoaXMuX3VwZGF0ZUluZGV4RGF0YSgpO1xuXG5cdFx0aWYgKHRoaXMuX3BWZXJ0ZXhEYXRhRGlydHlbZGF0YVR5cGVdKVxuXHRcdFx0dGhpcy5fdXBkYXRlVmVydGV4RGF0YShkYXRhVHlwZSk7XG5cblx0XHRyZXR1cm4gdGhpcy5fdmVydGV4T2Zmc2V0W2RhdGFUeXBlXTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gc291cmNlRW50aXR5XG5cdCAqIEBwYXJhbSBtYXRlcmlhbE93bmVyXG5cdCAqIEBwYXJhbSBzdWJHZW9tZXRyeVxuXHQgKiBAcGFyYW0gYW5pbWF0aW9uU3ViR2VvbWV0cnlcblx0ICovXG5cdGNvbnN0cnVjdG9yKHBvb2w6UmVuZGVyYWJsZVBvb2wsIHNvdXJjZUVudGl0eTpJRW50aXR5LCBtYXRlcmlhbE93bmVyOklNYXRlcmlhbE93bmVyLCBsZXZlbDpudW1iZXIgPSAwLCBpbmRleE9mZnNldDpudW1iZXIgPSAwKVxuXHR7XG5cdFx0dGhpcy5fb25JbmRpY2VzVXBkYXRlZERlbGVnYXRlID0gKGV2ZW50OlN1Ykdlb21ldHJ5RXZlbnQpID0+IHRoaXMuX29uSW5kaWNlc1VwZGF0ZWQoZXZlbnQpO1xuXHRcdHRoaXMuX29uVmVydGljZXNVcGRhdGVkRGVsZWdhdGUgPSAoZXZlbnQ6U3ViR2VvbWV0cnlFdmVudCkgPT4gdGhpcy5fb25WZXJ0aWNlc1VwZGF0ZWQoZXZlbnQpO1xuXG5cdFx0Ly9zdG9yZSBhIHJlZmVyZW5jZSB0byB0aGUgcG9vbCBmb3IgbGF0ZXIgZGlzcG9zYWxcblx0XHR0aGlzLl9wb29sID0gcG9vbDtcblxuXHRcdC8vcmVmZXJlbmNlIHRvIGxldmVsIG9mIG92ZXJmbG93XG5cdFx0dGhpcy5fbGV2ZWwgPSBsZXZlbDtcblxuXHRcdC8vcmVmZXJlbmNlIHRvIHRoZSBvZmZzZXQgb24gaW5kaWNlcyAoaWYgdGhpcyBpcyBhbiBvdmVyZmxvdyByZW5kZXJhYmxlKVxuXHRcdHRoaXMuX2luZGV4T2Zmc2V0ID0gaW5kZXhPZmZzZXQ7XG5cblx0XHR0aGlzLnNvdXJjZUVudGl0eSA9IHNvdXJjZUVudGl0eTtcblx0XHR0aGlzLm1hdGVyaWFsT3duZXIgPSBtYXRlcmlhbE93bmVyO1xuXHR9XG5cblx0cHVibGljIGRpc3Bvc2UoKVxuXHR7XG5cdFx0dGhpcy5fcG9vbC5kaXNwb3NlSXRlbSh0aGlzLm1hdGVyaWFsT3duZXIpO1xuXG5cdFx0dGhpcy5faW5kZXhEYXRhLmRpc3Bvc2UoKTtcblx0XHR0aGlzLl9pbmRleERhdGEgPSBudWxsO1xuXG5cdFx0Zm9yICh2YXIgZGF0YVR5cGUgaW4gdGhpcy5fdmVydGV4RGF0YSkge1xuXHRcdFx0KDxWZXJ0ZXhEYXRhPiB0aGlzLl92ZXJ0ZXhEYXRhW2RhdGFUeXBlXSkuZGlzcG9zZSgpO1xuXHRcdFx0dGhpcy5fdmVydGV4RGF0YVtkYXRhVHlwZV0gPSBudWxsO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9vdmVyZmxvdykge1xuXHRcdFx0dGhpcy5fb3ZlcmZsb3cuZGlzcG9zZSgpO1xuXHRcdFx0dGhpcy5fb3ZlcmZsb3cgPSBudWxsO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBpbnZhbGlkYXRlR2VvbWV0cnkoKVxuXHR7XG5cdFx0dGhpcy5fZ2VvbWV0cnlEaXJ0eSA9IHRydWU7XG5cblx0XHQvL2ludmFsaWRhdGUgaW5kaWNlc1xuXHRcdGlmICh0aGlzLl9sZXZlbCA9PSAwKVxuXHRcdFx0dGhpcy5faW5kZXhEYXRhRGlydHkgPSB0cnVlO1xuXG5cdFx0aWYgKHRoaXMuX292ZXJmbG93KVxuXHRcdFx0dGhpcy5fb3ZlcmZsb3cuaW52YWxpZGF0ZUdlb21ldHJ5KCk7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBpbnZhbGlkYXRlSW5kZXhEYXRhKClcblx0e1xuXHRcdHRoaXMuX2luZGV4RGF0YURpcnR5ID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiAvL1RPRE9cblx0ICpcblx0ICogQHBhcmFtIGRhdGFUeXBlXG5cdCAqL1xuXHRwdWJsaWMgaW52YWxpZGF0ZVZlcnRleERhdGEoZGF0YVR5cGU6c3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5fcFZlcnRleERhdGFEaXJ0eVtkYXRhVHlwZV0gPSB0cnVlO1xuXHR9XG5cblx0cHVibGljIF9wR2V0U3ViR2VvbWV0cnkoKTpTdWJHZW9tZXRyeUJhc2Vcblx0e1xuXHRcdHRocm93IG5ldyBBYnN0cmFjdE1ldGhvZEVycm9yKCk7XG5cdH1cblxuXHQvKipcblx0ICogLy9UT0RPXG5cdCAqXG5cdCAqIEBwYXJhbSBzdWJHZW9tZXRyeVxuXHQgKiBAcGFyYW0gb2Zmc2V0XG5cdCAqIEBpbnRlcm5hbFxuXHQgKi9cblx0cHVibGljIF9pRmlsbEluZGV4RGF0YShpbmRleE9mZnNldDpudW1iZXIpXG5cdHtcblx0XHRpZiAodGhpcy5fZ2VvbWV0cnlEaXJ0eSlcblx0XHRcdHRoaXMuX3VwZGF0ZUdlb21ldHJ5KCk7XG5cblx0XHR0aGlzLl9pbmRleERhdGEgPSBJbmRleERhdGFQb29sLmdldEl0ZW0odGhpcy5fc3ViR2VvbWV0cnksIHRoaXMuX2xldmVsLCBpbmRleE9mZnNldCk7XG5cblx0XHR0aGlzLl9udW1UcmlhbmdsZXMgPSB0aGlzLl9pbmRleERhdGEuZGF0YS5sZW5ndGgvMztcblxuXHRcdGluZGV4T2Zmc2V0ID0gdGhpcy5faW5kZXhEYXRhLm9mZnNldDtcblxuXHRcdC8vY2hlY2sgaWYgdGhlcmUgaXMgbW9yZSB0byBzcGxpdFxuXHRcdGlmIChpbmRleE9mZnNldCA8IHRoaXMuX3N1Ykdlb21ldHJ5LmluZGljZXMubGVuZ3RoKSB7XG5cdFx0XHRpZiAoIXRoaXMuX292ZXJmbG93KVxuXHRcdFx0XHR0aGlzLl9vdmVyZmxvdyA9IHRoaXMuX3BHZXRPdmVyZmxvd1JlbmRlcmFibGUodGhpcy5fcG9vbCwgdGhpcy5tYXRlcmlhbE93bmVyLCBpbmRleE9mZnNldCwgdGhpcy5fbGV2ZWwgKyAxKTtcblxuXHRcdFx0dGhpcy5fb3ZlcmZsb3cuX2lGaWxsSW5kZXhEYXRhKGluZGV4T2Zmc2V0KTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX292ZXJmbG93KSB7XG5cdFx0XHR0aGlzLl9vdmVyZmxvdy5kaXNwb3NlKCk7XG5cdFx0XHR0aGlzLl9vdmVyZmxvdyA9IG51bGw7XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIF9wR2V0T3ZlcmZsb3dSZW5kZXJhYmxlKHBvb2w6UmVuZGVyYWJsZVBvb2wsIG1hdGVyaWFsT3duZXI6SU1hdGVyaWFsT3duZXIsIGxldmVsOm51bWJlciwgaW5kZXhPZmZzZXQ6bnVtYmVyKTpSZW5kZXJhYmxlQmFzZVxuXHR7XG5cdFx0dGhyb3cgbmV3IEFic3RyYWN0TWV0aG9kRXJyb3IoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiAvL1RPRE9cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgX3VwZGF0ZUdlb21ldHJ5KClcblx0e1xuXHRcdGlmICh0aGlzLl9zdWJHZW9tZXRyeSkge1xuXHRcdFx0aWYgKHRoaXMuX2xldmVsID09IDApXG5cdFx0XHRcdHRoaXMuX3N1Ykdlb21ldHJ5LnJlbW92ZUV2ZW50TGlzdGVuZXIoU3ViR2VvbWV0cnlFdmVudC5JTkRJQ0VTX1VQREFURUQsIHRoaXMuX29uSW5kaWNlc1VwZGF0ZWREZWxlZ2F0ZSk7XG5cdFx0XHR0aGlzLl9zdWJHZW9tZXRyeS5yZW1vdmVFdmVudExpc3RlbmVyKFN1Ykdlb21ldHJ5RXZlbnQuVkVSVElDRVNfVVBEQVRFRCwgdGhpcy5fb25WZXJ0aWNlc1VwZGF0ZWREZWxlZ2F0ZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fc3ViR2VvbWV0cnkgPSB0aGlzLl9wR2V0U3ViR2VvbWV0cnkoKTtcblxuXHRcdHRoaXMuX2NvbmNhdGVuYXRlQXJyYXlzID0gdGhpcy5fc3ViR2VvbWV0cnkuY29uY2F0ZW5hdGVBcnJheXM7XG5cblx0XHRpZiAodGhpcy5fc3ViR2VvbWV0cnkpIHtcblx0XHRcdGlmICh0aGlzLl9sZXZlbCA9PSAwKVxuXHRcdFx0XHR0aGlzLl9zdWJHZW9tZXRyeS5hZGRFdmVudExpc3RlbmVyKFN1Ykdlb21ldHJ5RXZlbnQuSU5ESUNFU19VUERBVEVELCB0aGlzLl9vbkluZGljZXNVcGRhdGVkRGVsZWdhdGUpO1xuXHRcdFx0dGhpcy5fc3ViR2VvbWV0cnkuYWRkRXZlbnRMaXN0ZW5lcihTdWJHZW9tZXRyeUV2ZW50LlZFUlRJQ0VTX1VQREFURUQsIHRoaXMuX29uVmVydGljZXNVcGRhdGVkRGVsZWdhdGUpO1xuXHRcdH1cblxuXHRcdC8vZGlzcG9zZVxuLy9cdFx0XHRpZiAodGhpcy5faW5kZXhEYXRhKSB7XG4vL1x0XHRcdFx0dGhpcy5faW5kZXhEYXRhLmRpc3Bvc2UoKTsgLy9UT0RPIHdoZXJlIGlzIGEgZ29vZCBwbGFjZSB0byBkaXNwb3NlP1xuLy9cdFx0XHRcdHRoaXMuX2luZGV4RGF0YSA9IG51bGw7XG4vL1x0XHRcdH1cblxuLy9cdFx0XHRmb3IgKHZhciBkYXRhVHlwZSBpbiB0aGlzLl92ZXJ0ZXhEYXRhKSB7XG4vL1x0XHRcdFx0KDxWZXJ0ZXhEYXRhPiB0aGlzLl92ZXJ0ZXhEYXRhW2RhdGFUeXBlXSkuZGlzcG9zZSgpOyAvL1RPRE8gd2hlcmUgaXMgYSBnb29kIHBsYWNlIHRvIGRpc3Bvc2U/XG4vL1x0XHRcdFx0dGhpcy5fdmVydGV4RGF0YVtkYXRhVHlwZV0gPSBudWxsO1xuLy9cdFx0XHR9XG5cblx0XHR0aGlzLl9nZW9tZXRyeURpcnR5ID0gZmFsc2U7XG5cblx0XHQvL3NwZWNpZmljIHZlcnRleCBkYXRhIHR5cGVzIGhhdmUgdG8gYmUgaW52YWxpZGF0ZWQgaW4gdGhlIHNwZWNpZmljIHJlbmRlcmFibGVcblx0fVxuXG5cdC8qKlxuXHQgKiAvL1RPRE9cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgX3VwZGF0ZUluZGV4RGF0YSgpXG5cdHtcblx0XHR0aGlzLl9pRmlsbEluZGV4RGF0YSh0aGlzLl9pbmRleE9mZnNldCk7XG5cblx0XHR0aGlzLl9pbmRleERhdGFEaXJ0eSA9IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIC8vVE9ET1xuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YVR5cGVcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgX3VwZGF0ZVZlcnRleERhdGEoZGF0YVR5cGU6c3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5fdmVydGV4T2Zmc2V0W2RhdGFUeXBlXSA9IHRoaXMuX3N1Ykdlb21ldHJ5LmdldE9mZnNldChkYXRhVHlwZSk7XG5cblx0XHRpZiAodGhpcy5fc3ViR2VvbWV0cnkuY29uY2F0ZW5hdGVBcnJheXMpXG5cdFx0XHRkYXRhVHlwZSA9IFN1Ykdlb21ldHJ5QmFzZS5WRVJURVhfREFUQTtcblxuXHRcdHRoaXMuX3ZlcnRleERhdGFbZGF0YVR5cGVdID0gVmVydGV4RGF0YVBvb2wuZ2V0SXRlbSh0aGlzLl9zdWJHZW9tZXRyeSwgdGhpcy5nZXRJbmRleERhdGEoKSwgZGF0YVR5cGUpO1xuXG5cdFx0dGhpcy5fcFZlcnRleERhdGFEaXJ0eVtkYXRhVHlwZV0gPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiAvL1RPRE9cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9vbkluZGljZXNVcGRhdGVkKGV2ZW50OlN1Ykdlb21ldHJ5RXZlbnQpXG5cdHtcblx0XHR0aGlzLmludmFsaWRhdGVJbmRleERhdGEoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiAvL1RPRE9cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9vblZlcnRpY2VzVXBkYXRlZChldmVudDpTdWJHZW9tZXRyeUV2ZW50KVxuXHR7XG5cdFx0dGhpcy5fY29uY2F0ZW5hdGVBcnJheXMgPSAoPFN1Ykdlb21ldHJ5QmFzZT4gZXZlbnQudGFyZ2V0KS5jb25jYXRlbmF0ZUFycmF5cztcblxuXHRcdHRoaXMuaW52YWxpZGF0ZVZlcnRleERhdGEoZXZlbnQuZGF0YVR5cGUpO1xuXHR9XG59XG5cbmV4cG9ydCA9IFJlbmRlcmFibGVCYXNlOyJdfQ==