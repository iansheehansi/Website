/// <reference path="../../../dist/preview release/babylon.d.ts"/>
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BABYLON;
(function (BABYLON) {
    var GridMaterialDefines = (function (_super) {
        __extends(GridMaterialDefines, _super);
        function GridMaterialDefines() {
            var _this = _super.call(this) || this;
            _this.TRANSPARENT = false;
            _this.FOG = false;
            _this.rebuild();
            return _this;
        }
        return GridMaterialDefines;
    }(BABYLON.MaterialDefines));
    /**
     * The grid materials allows you to wrap any shape with a grid.
     * Colors are customizable.
     */
    var GridMaterial = (function (_super) {
        __extends(GridMaterial, _super);
        /**
         * constructor
         * @param name The name given to the material in order to identify it afterwards.
         * @param scene The scene the material is used in.
         */
        function GridMaterial(name, scene) {
            var _this = _super.call(this, name, scene) || this;
            /**
             * Main color of the grid (e.g. between lines)
             */
            _this.mainColor = BABYLON.Color3.White();
            /**
             * Color of the grid lines.
             */
            _this.lineColor = BABYLON.Color3.Black();
            /**
             * The scale of the grid compared to unit.
             */
            _this.gridRatio = 1.0;
            /**
             * The frequency of thicker lines.
             */
            _this.majorUnitFrequency = 10;
            /**
             * The visibility of minor units in the grid.
             */
            _this.minorUnitVisibility = 0.33;
            /**
             * The grid opacity outside of the lines.
             */
            _this.opacity = 1.0;
            _this._gridControl = new BABYLON.Vector4(_this.gridRatio, _this.majorUnitFrequency, _this.minorUnitVisibility, _this.opacity);
            return _this;
        }
        /**
         * Returns wehter or not the grid requires alpha blending.
         */
        GridMaterial.prototype.needAlphaBlending = function () {
            return this.opacity < 1.0;
        };
        GridMaterial.prototype.isReadyForSubMesh = function (mesh, subMesh, useInstances) {
            if (this.isFrozen) {
                if (this._wasPreviouslyReady && subMesh.effect) {
                    return true;
                }
            }
            if (!subMesh._materialDefines) {
                subMesh._materialDefines = new GridMaterialDefines();
            }
            var defines = subMesh._materialDefines;
            var scene = this.getScene();
            if (!this.checkReadyOnEveryCall && subMesh.effect) {
                if (this._renderId === scene.getRenderId()) {
                    return true;
                }
            }
            var engine = scene.getEngine();
            if (this.opacity < 1.0 && !defines.TRANSPARENT) {
                defines.TRANSPARENT = true;
                defines.markAsUnprocessed();
            }
            BABYLON.MaterialHelper.PrepareDefinesForMisc(mesh, scene, false, false, this.fogEnabled, defines);
            // Get correct effect      
            if (defines.isDirty) {
                defines.markAsProcessed();
                scene.resetCachedMaterial();
                // Attributes
                var attribs = [BABYLON.VertexBuffer.PositionKind, BABYLON.VertexBuffer.NormalKind];
                // Effect
                var shaderName = scene.getEngine().getCaps().standardDerivatives ? "grid" : "legacygrid";
                // Defines
                var join = defines.toString();
                subMesh.setEffect(scene.getEngine().createEffect(shaderName, attribs, ["worldViewProjection", "mainColor", "lineColor", "gridControl", "vFogInfos", "vFogColor", "world", "view"], [], join, null, this.onCompiled, this.onError), defines);
            }
            if (!subMesh.effect.isReady()) {
                return false;
            }
            this._renderId = scene.getRenderId();
            this._wasPreviouslyReady = true;
            return true;
        };
        GridMaterial.prototype.bindForSubMesh = function (world, mesh, subMesh) {
            var scene = this.getScene();
            var defines = subMesh._materialDefines;
            if (!defines) {
                return;
            }
            var effect = subMesh.effect;
            this._activeEffect = effect;
            // Matrices
            this.bindOnlyWorldMatrix(world);
            this._activeEffect.setMatrix("worldViewProjection", world.multiply(scene.getTransformMatrix()));
            this._activeEffect.setMatrix("view", scene.getViewMatrix());
            // Uniforms
            if (this._mustRebind(scene, effect)) {
                this._activeEffect.setColor3("mainColor", this.mainColor);
                this._activeEffect.setColor3("lineColor", this.lineColor);
                this._gridControl.x = this.gridRatio;
                this._gridControl.y = Math.round(this.majorUnitFrequency);
                this._gridControl.z = this.minorUnitVisibility;
                this._gridControl.w = this.opacity;
                this._activeEffect.setVector4("gridControl", this._gridControl);
            }
            // Fog
            BABYLON.MaterialHelper.BindFogParameters(scene, mesh, this._activeEffect);
            this._afterBind(mesh, this._activeEffect);
        };
        GridMaterial.prototype.dispose = function (forceDisposeEffect) {
            _super.prototype.dispose.call(this, forceDisposeEffect);
        };
        GridMaterial.prototype.clone = function (name) {
            var _this = this;
            return BABYLON.SerializationHelper.Clone(function () { return new GridMaterial(name, _this.getScene()); }, this);
        };
        GridMaterial.prototype.serialize = function () {
            var serializationObject = BABYLON.SerializationHelper.Serialize(this);
            serializationObject.customType = "BABYLON.GridMaterial";
            return serializationObject;
        };
        GridMaterial.Parse = function (source, scene, rootUrl) {
            return BABYLON.SerializationHelper.Parse(function () { return new GridMaterial(source.name, scene); }, source, scene, rootUrl);
        };
        return GridMaterial;
    }(BABYLON.PushMaterial));
    __decorate([
        BABYLON.serializeAsColor3()
    ], GridMaterial.prototype, "mainColor", void 0);
    __decorate([
        BABYLON.serializeAsColor3()
    ], GridMaterial.prototype, "lineColor", void 0);
    __decorate([
        BABYLON.serialize()
    ], GridMaterial.prototype, "gridRatio", void 0);
    __decorate([
        BABYLON.serialize()
    ], GridMaterial.prototype, "majorUnitFrequency", void 0);
    __decorate([
        BABYLON.serialize()
    ], GridMaterial.prototype, "minorUnitVisibility", void 0);
    __decorate([
        BABYLON.serialize()
    ], GridMaterial.prototype, "opacity", void 0);
    BABYLON.GridMaterial = GridMaterial;
})(BABYLON || (BABYLON = {}));

//# sourceMappingURL=babylon.gridmaterial.js.map

BABYLON.Effect.ShadersStore['gridVertexShader'] = "precision highp float;\n\nattribute vec3 position;\nattribute vec3 normal;\n\nuniform mat4 worldViewProjection;\nuniform mat4 world;\nuniform mat4 view;\n\nvarying vec3 vPosition;\nvarying vec3 vNormal;\n#include<fogVertexDeclaration>\nvoid main(void) {\n#ifdef FOG\nvec4 worldPos=world*vec4(position,1.0);\n#endif\n#include<fogVertex>\ngl_Position=worldViewProjection*vec4(position,1.0);\nvPosition=position;\nvNormal=normal;\n}";
BABYLON.Effect.ShadersStore['gridPixelShader'] = "#extension GL_OES_standard_derivatives : enable\n#define SQRT2 1.41421356\n#define PI 3.14159\nprecision highp float;\nuniform vec3 mainColor;\nuniform vec3 lineColor;\nuniform vec4 gridControl;\n\nvarying vec3 vPosition;\nvarying vec3 vNormal;\n#include<fogFragmentDeclaration>\nfloat getVisibility(float position) {\n\nfloat majorGridFrequency=gridControl.y;\nif (floor(position+0.5) == floor(position/majorGridFrequency+0.5)*majorGridFrequency)\n{\nreturn 1.0;\n} \nreturn gridControl.z;\n}\nfloat getAnisotropicAttenuation(float differentialLength) {\nconst float maxNumberOfLines=10.0;\nreturn clamp(1.0/(differentialLength+1.0)-1.0/maxNumberOfLines,0.0,1.0);\n}\nfloat isPointOnLine(float position,float differentialLength) {\nfloat fractionPartOfPosition=position-floor(position+0.5); \nfractionPartOfPosition/=differentialLength; \nfractionPartOfPosition=clamp(fractionPartOfPosition,-1.,1.);\nfloat result=0.5+0.5*cos(fractionPartOfPosition*PI); \nreturn result; \n}\nfloat contributionOnAxis(float position) {\nfloat differentialLength=length(vec2(dFdx(position),dFdy(position)));\ndifferentialLength*=SQRT2; \n\nfloat result=isPointOnLine(position,differentialLength);\n\nfloat visibility=getVisibility(position);\nresult*=visibility;\n\nfloat anisotropicAttenuation=getAnisotropicAttenuation(differentialLength);\nresult*=anisotropicAttenuation;\nreturn result;\n}\nfloat normalImpactOnAxis(float x) {\nfloat normalImpact=clamp(1.0-2.8*abs(x*x*x),0.0,1.0);\nreturn normalImpact;\n}\nvoid main(void) {\n\nfloat gridRatio=gridControl.x;\nvec3 gridPos=vPosition/gridRatio;\n\nfloat x=contributionOnAxis(gridPos.x);\nfloat y=contributionOnAxis(gridPos.y);\nfloat z=contributionOnAxis(gridPos.z); \n\nvec3 normal=normalize(vNormal);\nx*=normalImpactOnAxis(normal.x);\ny*=normalImpactOnAxis(normal.y);\nz*=normalImpactOnAxis(normal.z);\n\nfloat grid=clamp(x+y+z,0.,1.);\n\nvec3 color=mix(mainColor,lineColor,grid);\n#ifdef FOG\n#include<fogFragment>\n#endif\n#ifdef TRANSPARENT\nfloat opacity=clamp(grid,0.08,gridControl.w);\ngl_FragColor=vec4(color.rgb,opacity);\n#else\n\ngl_FragColor=vec4(color.rgb,1.0);\n#endif\n}";
BABYLON.Effect.ShadersStore['legacygridVertexShader'] = "precision highp float;\n\nattribute vec3 position;\n\nuniform mat4 worldViewProjection;\nvoid main(void) {\ngl_Position=worldViewProjection*vec4(position,1.0);\n}";
BABYLON.Effect.ShadersStore['legacygridPixelShader'] = "uniform vec3 mainColor;\nuniform vec4 gridControl;\nvoid main(void) {\ngl_FragColor=vec4(1,1,1,0.1);\n#ifdef TRANSPARENT\n\ngl_FragColor=vec4(mainColor.rgb,0.08);\n#else\n\ngl_FragColor=vec4(mainColor.rgb,1.0);\n#endif\n}";
