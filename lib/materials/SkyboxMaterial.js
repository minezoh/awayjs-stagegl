var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TriangleSubGeometry = require("awayjs-core/lib/core/base/TriangleSubGeometry");
var ContextGLCompareMode = require("awayjs-stagegl/lib/core/stagegl/ContextGLCompareMode");
var ContextGLMipFilter = require("awayjs-stagegl/lib/core/stagegl/ContextGLMipFilter");
var ContextGLProgramType = require("awayjs-stagegl/lib/core/stagegl/ContextGLProgramType");
var ContextGLTextureFilter = require("awayjs-stagegl/lib/core/stagegl/ContextGLTextureFilter");
var ContextGLWrapMode = require("awayjs-stagegl/lib/core/stagegl/ContextGLWrapMode");
var StageGLMaterialBase = require("awayjs-stagegl/lib/materials/StageGLMaterialBase");
var SkyboxPass = require("awayjs-stagegl/lib/materials/passes/SkyboxPass");
var ShaderCompilerHelper = require("awayjs-stagegl/lib/materials/utils/ShaderCompilerHelper");
/**
 * SkyboxMaterial is a material exclusively used to render skyboxes
 *
 * @see away3d.primitives.Skybox
 */
var SkyboxMaterial = (function (_super) {
    __extends(SkyboxMaterial, _super);
    /**
     * Creates a new SkyboxMaterial object.
     * @param cubeMap The CubeMap to use as the skybox.
     */
    function SkyboxMaterial(cubeMap, smooth, repeat, mipmap) {
        if (smooth === void 0) { smooth = true; }
        if (repeat === void 0) { repeat = false; }
        if (mipmap === void 0) { mipmap = false; }
        _super.call(this);
        this._cubeMap = cubeMap;
        this._pAddScreenPass(this._skyboxPass = new SkyboxPass());
        this._vertexData = new Array(0, 0, 0, 0, 1, 1, 1, 1);
    }
    Object.defineProperty(SkyboxMaterial.prototype, "cubeMap", {
        /**
         * The cube texture to use as the skybox.
         */
        get: function () {
            return this._cubeMap;
        },
        set: function (value) {
            if (value && this._cubeMap && (value.hasMipmaps != this._cubeMap.hasMipmaps || value.format != this._cubeMap.format))
                this._pInvalidatePasses();
            this._cubeMap = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @inheritDoc
     */
    SkyboxMaterial.prototype._iGetVertexCode = function (shaderObject, registerCache, sharedRegisters) {
        return "mul vt0, va0, vc5\n" + "add vt0, vt0, vc4\n" + "m44 op, vt0, vc0\n" + "mov v0, va0\n";
    };
    /**
     * @inheritDoc
     */
    SkyboxMaterial.prototype._iGetFragmentCode = function (shaderObject, registerCache, sharedRegisters) {
        //var cubeMapReg:ShaderRegisterElement = registerCache.getFreeTextureReg();
        //this._texturesIndex = cubeMapReg.index;
        //ShaderCompilerHelper.getTexCubeSampleCode(sharedRegisters.shadedTarget, cubeMapReg, this._cubeTexture, shaderObject.useSmoothTextures, shaderObject.useMipmapping);
        var mip = ",mipnone";
        if (this._cubeMap.hasMipmaps)
            mip = ",miplinear";
        return "tex ft0, v0, fs0 <cube," + ShaderCompilerHelper.getFormatStringForTexture(this._cubeMap) + "linear,clamp" + mip + ">\n";
    };
    /**
     * @inheritDoc
     */
    SkyboxMaterial.prototype._iActivatePass = function (pass, stage, camera) {
        _super.prototype._iActivatePass.call(this, pass, stage, camera);
        var context = stage.context;
        context.setSamplerStateAt(0, ContextGLWrapMode.CLAMP, ContextGLTextureFilter.LINEAR, this._cubeMap.hasMipmaps ? ContextGLMipFilter.MIPLINEAR : ContextGLMipFilter.MIPNONE);
        context.setDepthTest(false, ContextGLCompareMode.LESS);
        context.activateCubeTexture(0, this._cubeMap);
    };
    /**
     * @inheritDoc
     */
    SkyboxMaterial.prototype._iRenderPass = function (pass, renderable, stage, camera, viewProjection) {
        _super.prototype._iRenderPass.call(this, pass, renderable, stage, camera, viewProjection);
        var context = stage.context;
        var pos = camera.scenePosition;
        this._vertexData[0] = pos.x;
        this._vertexData[1] = pos.y;
        this._vertexData[2] = pos.z;
        this._vertexData[4] = this._vertexData[5] = this._vertexData[6] = camera.projection.far / Math.sqrt(3);
        context.setProgramConstantsFromMatrix(ContextGLProgramType.VERTEX, 0, viewProjection, true);
        context.setProgramConstantsFromArray(ContextGLProgramType.VERTEX, 4, this._vertexData, 2);
        context.activateBuffer(0, renderable.getVertexData(TriangleSubGeometry.POSITION_DATA), renderable.getVertexOffset(TriangleSubGeometry.POSITION_DATA), TriangleSubGeometry.POSITION_FORMAT);
        context.drawTriangles(context.getIndexBuffer(renderable.getIndexData()), 0, renderable.numTriangles);
    };
    return SkyboxMaterial;
})(StageGLMaterialBase);
module.exports = SkyboxMaterial;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1hdGVyaWFscy9za3lib3htYXRlcmlhbC50cyJdLCJuYW1lcyI6WyJTa3lib3hNYXRlcmlhbCIsIlNreWJveE1hdGVyaWFsLmNvbnN0cnVjdG9yIiwiU2t5Ym94TWF0ZXJpYWwuY3ViZU1hcCIsIlNreWJveE1hdGVyaWFsLl9pR2V0VmVydGV4Q29kZSIsIlNreWJveE1hdGVyaWFsLl9pR2V0RnJhZ21lbnRDb2RlIiwiU2t5Ym94TWF0ZXJpYWwuX2lBY3RpdmF0ZVBhc3MiLCJTa3lib3hNYXRlcmlhbC5faVJlbmRlclBhc3MiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLElBQU8sbUJBQW1CLFdBQWEsK0NBQStDLENBQUMsQ0FBQztBQVF4RixJQUFPLG9CQUFvQixXQUFhLHNEQUFzRCxDQUFDLENBQUM7QUFDaEcsSUFBTyxrQkFBa0IsV0FBYSxvREFBb0QsQ0FBQyxDQUFDO0FBQzVGLElBQU8sb0JBQW9CLFdBQWEsc0RBQXNELENBQUMsQ0FBQztBQUNoRyxJQUFPLHNCQUFzQixXQUFZLHdEQUF3RCxDQUFDLENBQUM7QUFDbkcsSUFBTyxpQkFBaUIsV0FBYSxtREFBbUQsQ0FBQyxDQUFDO0FBRTFGLElBQU8sbUJBQW1CLFdBQWEsa0RBQWtELENBQUMsQ0FBQztBQUkzRixJQUFPLFVBQVUsV0FBZSxnREFBZ0QsQ0FBQyxDQUFDO0FBQ2xGLElBQU8sb0JBQW9CLFdBQWEseURBQXlELENBQUMsQ0FBQztBQUVuRyxBQUtBOzs7O0dBREc7SUFDRyxjQUFjO0lBQVNBLFVBQXZCQSxjQUFjQSxVQUE0QkE7SUFNL0NBOzs7T0FHR0E7SUFDSEEsU0FWS0EsY0FBY0EsQ0FVUEEsT0FBdUJBLEVBQUVBLE1BQXFCQSxFQUFFQSxNQUFzQkEsRUFBRUEsTUFBc0JBO1FBQXJFQyxzQkFBcUJBLEdBQXJCQSxhQUFxQkE7UUFBRUEsc0JBQXNCQSxHQUF0QkEsY0FBc0JBO1FBQUVBLHNCQUFzQkEsR0FBdEJBLGNBQXNCQTtRQUd6R0EsaUJBQU9BLENBQUNBO1FBRVJBLElBQUlBLENB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QSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUUxRkEsT0FBT0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxhQUFhQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxlQUFlQSxDQUFDQSxtQkFBbUJBLENBQUNBLGFBQWFBLENBQUNBLEVBQUVBLG1CQUFtQkEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0E7UUFDM0xBLE9BQU9BLENBQUNBLGFBQWFBLENBQUNBLE9BQU9BLENBQUNBLGNBQWNBLENBQUNBLFVBQVVBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO0lBQ3RHQSxDQUFDQTtJQUNGTixxQkFBQ0E7QUFBREEsQ0FuR0EsQUFtR0NBLEVBbkc0QixtQkFBbUIsRUFtRy9DO0FBRUQsQUFBd0IsaUJBQWYsY0FBYyxDQUFDIiwiZmlsZSI6Im1hdGVyaWFscy9Ta3lib3hNYXRlcmlhbC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvcm9iYmF0ZW1hbi9XZWJzdG9ybVByb2plY3RzL2F3YXlqcy1zdGFnZWdsLyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTdGFnZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL2Jhc2UvU3RhZ2VcIik7XG5pbXBvcnQgVHJpYW5nbGVTdWJHZW9tZXRyeVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2Jhc2UvVHJpYW5nbGVTdWJHZW9tZXRyeVwiKTtcbmltcG9ydCBNYXRyaXgzRFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2dlb20vTWF0cml4M0RcIik7XG5pbXBvcnQgVmVjdG9yM0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9nZW9tL1ZlY3RvcjNEXCIpO1xuaW1wb3J0IENhbWVyYVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lbnRpdGllcy9DYW1lcmFcIik7XG5pbXBvcnQgQ3ViZVRleHR1cmVCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvQ3ViZVRleHR1cmVCYXNlXCIpO1xuXG5pbXBvcnQgTWF0ZXJpYWxQYXNzRGF0YVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvcG9vbC9NYXRlcmlhbFBhc3NEYXRhXCIpO1xuaW1wb3J0IFJlbmRlcmFibGVCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9wb29sL1JlbmRlcmFibGVCYXNlXCIpO1xuaW1wb3J0IENvbnRleHRHTENvbXBhcmVNb2RlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvc3RhZ2VnbC9Db250ZXh0R0xDb21wYXJlTW9kZVwiKTtcbmltcG9ydCBDb250ZXh0R0xNaXBGaWx0ZXJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9zdGFnZWdsL0NvbnRleHRHTE1pcEZpbHRlclwiKTtcbmltcG9ydCBDb250ZXh0R0xQcm9ncmFtVHlwZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3N0YWdlZ2wvQ29udGV4dEdMUHJvZ3JhbVR5cGVcIik7XG5pbXBvcnQgQ29udGV4dEdMVGV4dHVyZUZpbHRlclx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9zdGFnZWdsL0NvbnRleHRHTFRleHR1cmVGaWx0ZXJcIik7XG5pbXBvcnQgQ29udGV4dEdMV3JhcE1vZGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvY29yZS9zdGFnZWdsL0NvbnRleHRHTFdyYXBNb2RlXCIpO1xuaW1wb3J0IElDb250ZXh0U3RhZ2VHTFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL2NvcmUvc3RhZ2VnbC9JQ29udGV4dFN0YWdlR0xcIik7XG5pbXBvcnQgU3RhZ2VHTE1hdGVyaWFsQmFzZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvU3RhZ2VHTE1hdGVyaWFsQmFzZVwiKTtcbmltcG9ydCBTaGFkZXJPYmplY3RCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlck9iamVjdEJhc2VcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJDYWNoZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJDYWNoZVwiKTtcbmltcG9ydCBTaGFkZXJSZWdpc3RlckRhdGFcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlclJlZ2lzdGVyRGF0YVwiKTtcbmltcG9ydCBTa3lib3hQYXNzXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvcGFzc2VzL1NreWJveFBhc3NcIik7XG5pbXBvcnQgU2hhZGVyQ29tcGlsZXJIZWxwZXJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL3V0aWxzL1NoYWRlckNvbXBpbGVySGVscGVyXCIpO1xuXG4vKipcbiAqIFNreWJveE1hdGVyaWFsIGlzIGEgbWF0ZXJpYWwgZXhjbHVzaXZlbHkgdXNlZCB0byByZW5kZXIgc2t5Ym94ZXNcbiAqXG4gKiBAc2VlIGF3YXkzZC5wcmltaXRpdmVzLlNreWJveFxuICovXG5jbGFzcyBTa3lib3hNYXRlcmlhbCBleHRlbmRzIFN0YWdlR0xNYXRlcmlhbEJhc2Vcbntcblx0cHJpdmF0ZSBfdmVydGV4RGF0YTpBcnJheTxudW1iZXI+O1xuXHRwcml2YXRlIF9jdWJlTWFwOkN1YmVUZXh0dXJlQmFzZTtcblx0cHJpdmF0ZSBfc2t5Ym94UGFzczpTa3lib3hQYXNzO1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IFNreWJveE1hdGVyaWFsIG9iamVjdC5cblx0ICogQHBhcmFtIGN1YmVNYXAgVGhlIEN1YmVNYXAgdG8gdXNlIGFzIHRoZSBza3lib3guXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihjdWJlTWFwOkN1YmVUZXh0dXJlQmFzZSwgc21vb3RoOmJvb2xlYW4gPSB0cnVlLCByZXBlYXQ6Ym9vbGVhbiA9IGZhbHNlLCBtaXBtYXA6Ym9vbGVhbiA9IGZhbHNlKVxuXHR7XG5cblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5fY3ViZU1hcCA9IGN1YmVNYXA7XG5cdFx0dGhpcy5fcEFkZFNjcmVlblBhc3ModGhpcy5fc2t5Ym94UGFzcyA9IG5ldyBTa3lib3hQYXNzKCkpO1xuXG5cdFx0dGhpcy5fdmVydGV4RGF0YSA9IG5ldyBBcnJheTxudW1iZXI+KDAsIDAsIDAsIDAsIDEsIDEsIDEsIDEpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjdWJlIHRleHR1cmUgdG8gdXNlIGFzIHRoZSBza3lib3guXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGN1YmVNYXAoKTpDdWJlVGV4dHVyZUJhc2Vcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jdWJlTWFwO1xuXHR9XG5cblx0cHVibGljIHNldCBjdWJlTWFwKHZhbHVlOkN1YmVUZXh0dXJlQmFzZSlcblx0e1xuXHRcdGlmICh2YWx1ZSAmJiB0aGlzLl9jdWJlTWFwICYmICh2YWx1ZS5oYXNNaXBtYXBzICE9IHRoaXMuX2N1YmVNYXAuaGFzTWlwbWFwcyB8fCB2YWx1ZS5mb3JtYXQgIT0gdGhpcy5fY3ViZU1hcC5mb3JtYXQpKVxuXHRcdFx0dGhpcy5fcEludmFsaWRhdGVQYXNzZXMoKTtcblxuXHRcdHRoaXMuX2N1YmVNYXAgPSB2YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0cHVibGljIF9pR2V0VmVydGV4Q29kZShzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgcmVnaXN0ZXJDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnM6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHJldHVybiBcIm11bCB2dDAsIHZhMCwgdmM1XFxuXCIgK1xuXHRcdFx0XCJhZGQgdnQwLCB2dDAsIHZjNFxcblwiICtcblx0XHRcdFwibTQ0IG9wLCB2dDAsIHZjMFxcblwiICtcblx0XHRcdFwibW92IHYwLCB2YTBcXG5cIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0cHVibGljIF9pR2V0RnJhZ21lbnRDb2RlKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCByZWdpc3RlckNhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0Ly92YXIgY3ViZU1hcFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSByZWdpc3RlckNhY2hlLmdldEZyZWVUZXh0dXJlUmVnKCk7XG5cblx0XHQvL3RoaXMuX3RleHR1cmVzSW5kZXggPSBjdWJlTWFwUmVnLmluZGV4O1xuXG5cdFx0Ly9TaGFkZXJDb21waWxlckhlbHBlci5nZXRUZXhDdWJlU2FtcGxlQ29kZShzaGFyZWRSZWdpc3RlcnMuc2hhZGVkVGFyZ2V0LCBjdWJlTWFwUmVnLCB0aGlzLl9jdWJlVGV4dHVyZSwgc2hhZGVyT2JqZWN0LnVzZVNtb290aFRleHR1cmVzLCBzaGFkZXJPYmplY3QudXNlTWlwbWFwcGluZyk7XG5cblx0XHR2YXIgbWlwOnN0cmluZyA9IFwiLG1pcG5vbmVcIjtcblxuXHRcdGlmICh0aGlzLl9jdWJlTWFwLmhhc01pcG1hcHMpXG5cdFx0XHRtaXAgPSBcIixtaXBsaW5lYXJcIjtcblxuXHRcdHJldHVybiBcInRleCBmdDAsIHYwLCBmczAgPGN1YmUsXCIgKyBTaGFkZXJDb21waWxlckhlbHBlci5nZXRGb3JtYXRTdHJpbmdGb3JUZXh0dXJlKHRoaXMuX2N1YmVNYXApICsgXCJsaW5lYXIsY2xhbXBcIiArIG1pcCArIFwiPlxcblwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRwdWJsaWMgX2lBY3RpdmF0ZVBhc3MocGFzczpNYXRlcmlhbFBhc3NEYXRhLCBzdGFnZTpTdGFnZSwgY2FtZXJhOkNhbWVyYSlcblx0e1xuXHRcdHN1cGVyLl9pQWN0aXZhdGVQYXNzKHBhc3MsIHN0YWdlLCBjYW1lcmEpO1xuXG5cdFx0dmFyIGNvbnRleHQ6SUNvbnRleHRTdGFnZUdMID0gPElDb250ZXh0U3RhZ2VHTD4gc3RhZ2UuY29udGV4dDtcblx0XHRjb250ZXh0LnNldFNhbXBsZXJTdGF0ZUF0KDAsIENvbnRleHRHTFdyYXBNb2RlLkNMQU1QLCBDb250ZXh0R0xUZXh0dXJlRmlsdGVyLkxJTkVBUiwgdGhpcy5fY3ViZU1hcC5oYXNNaXBtYXBzPyBDb250ZXh0R0xNaXBGaWx0ZXIuTUlQTElORUFSIDogQ29udGV4dEdMTWlwRmlsdGVyLk1JUE5PTkUpO1xuXHRcdGNvbnRleHQuc2V0RGVwdGhUZXN0KGZhbHNlLCBDb250ZXh0R0xDb21wYXJlTW9kZS5MRVNTKTtcblx0XHRjb250ZXh0LmFjdGl2YXRlQ3ViZVRleHR1cmUoMCwgdGhpcy5fY3ViZU1hcCk7XG5cdH1cblxuXHQvKipcblx0ICogQGluaGVyaXREb2Ncblx0ICovXG5cdHB1YmxpYyBfaVJlbmRlclBhc3MocGFzczpNYXRlcmlhbFBhc3NEYXRhLCByZW5kZXJhYmxlOlJlbmRlcmFibGVCYXNlLCBzdGFnZTpTdGFnZSwgY2FtZXJhOkNhbWVyYSwgdmlld1Byb2plY3Rpb246TWF0cml4M0QpXG5cdHtcblx0XHRzdXBlci5faVJlbmRlclBhc3MocGFzcywgcmVuZGVyYWJsZSwgc3RhZ2UsIGNhbWVyYSwgdmlld1Byb2plY3Rpb24pO1xuXG5cdFx0dmFyIGNvbnRleHQ6SUNvbnRleHRTdGFnZUdMID0gPElDb250ZXh0U3RhZ2VHTD4gc3RhZ2UuY29udGV4dDtcblx0XHR2YXIgcG9zOlZlY3RvcjNEID0gY2FtZXJhLnNjZW5lUG9zaXRpb247XG5cdFx0dGhpcy5fdmVydGV4RGF0YVswXSA9IHBvcy54O1xuXHRcdHRoaXMuX3ZlcnRleERhdGFbMV0gPSBwb3MueTtcblx0XHR0aGlzLl92ZXJ0ZXhEYXRhWzJdID0gcG9zLno7XG5cdFx0dGhpcy5fdmVydGV4RGF0YVs0XSA9IHRoaXMuX3ZlcnRleERhdGFbNV0gPSB0aGlzLl92ZXJ0ZXhEYXRhWzZdID0gY2FtZXJhLnByb2plY3Rpb24uZmFyL01hdGguc3FydCgzKTtcblx0XHRjb250ZXh0LnNldFByb2dyYW1Db25zdGFudHNGcm9tTWF0cml4KENvbnRleHRHTFByb2dyYW1UeXBlLlZFUlRFWCwgMCwgdmlld1Byb2plY3Rpb24sIHRydWUpO1xuXHRcdGNvbnRleHQuc2V0UHJvZ3JhbUNvbnN0YW50c0Zyb21BcnJheShDb250ZXh0R0xQcm9ncmFtVHlwZS5WRVJURVgsIDQsIHRoaXMuX3ZlcnRleERhdGEsIDIpO1xuXG5cdFx0Y29udGV4dC5hY3RpdmF0ZUJ1ZmZlcigwLCByZW5kZXJhYmxlLmdldFZlcnRleERhdGEoVHJpYW5nbGVTdWJHZW9tZXRyeS5QT1NJVElPTl9EQVRBKSwgcmVuZGVyYWJsZS5nZXRWZXJ0ZXhPZmZzZXQoVHJpYW5nbGVTdWJHZW9tZXRyeS5QT1NJVElPTl9EQVRBKSwgVHJpYW5nbGVTdWJHZW9tZXRyeS5QT1NJVElPTl9GT1JNQVQpO1xuXHRcdGNvbnRleHQuZHJhd1RyaWFuZ2xlcyhjb250ZXh0LmdldEluZGV4QnVmZmVyKHJlbmRlcmFibGUuZ2V0SW5kZXhEYXRhKCkpLCAwLCByZW5kZXJhYmxlLm51bVRyaWFuZ2xlcyk7XG5cdH1cbn1cblxuZXhwb3J0ID0gU2t5Ym94TWF0ZXJpYWw7Il19