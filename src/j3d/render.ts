
import { mat4, vec3 } from 'gl-matrix';

import { BMD, BMT, BTK, HierarchyNode, HierarchyType, MaterialEntry, Shape, BTI_Texture, ShapeDisplayFlags, TEX1_Sampler, TEX1_TextureData, VertexArray } from './j3d';

import * as GX from 'gx/gx_enum';
import * as GX_Material from 'gx/gx_material';
import * as GX_Texture from 'gx/gx_texture';
import * as Viewer from 'viewer';

import { BufferCoalescer, CoalescedBuffers, CompareMode, RenderFlags, RenderState } from '../render';
import { align, assert } from '../util';

function translateCompType(gl: WebGL2RenderingContext, compType: GX.CompType): { type: GLenum, normalized: boolean } {
    switch (compType) {
    case GX.CompType.F32:
        return { type: gl.FLOAT, normalized: false };
    case GX.CompType.S8:
        return { type: gl.BYTE, normalized: false };
    case GX.CompType.S16:
        return { type: gl.SHORT, normalized: false };
    case GX.CompType.U16:
        return { type: gl.UNSIGNED_SHORT, normalized: false };
    case GX.CompType.U8:
        return { type: gl.UNSIGNED_BYTE, normalized: false };
    case GX.CompType.RGBA8: // XXX: Is this right?
        return { type: gl.UNSIGNED_BYTE, normalized: true };
    default:
        throw new Error(`Unknown CompType ${compType}`);
    }
}

const packetParamsData = new Float32Array(11 * 16);
const modelViewScratch = mat4.create();
class Command_Shape {
    private scene: Scene;
    private bmd: BMD;
    private shape: Shape;
    private vao: WebGLVertexArrayObject;
    private jointMatrices: mat4[];
    private coalescedBuffers: CoalescedBuffers;
    private packetParamsBuffer: WebGLBuffer;

    constructor(gl: WebGL2RenderingContext, scene: Scene, shape: Shape, coalescedBuffers: CoalescedBuffers, jointMatrices: mat4[]) {
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

        for (const attrib of this.shape.packedVertexAttributes) {
            const vertexArray: VertexArray = this.bmd.vtx1.vertexArrays.get(attrib.vtxAttrib);
            const compType = vertexArray.compType;
            const compCount = vertexArray.compCount;

            const attribLocation = GX_Material.getVertexAttribLocation(attrib.vtxAttrib);
            gl.enableVertexAttribArray(attribLocation);

            const { type, normalized } = translateCompType(gl, compType);

            gl.vertexAttribPointer(
                attribLocation,
                compCount,
                type, normalized,
                this.shape.packedVertexSize,
                coalescedBuffers.vertexBuffer.offset + attrib.offset,
            );
            if (gl.getError() !== gl.NO_ERROR)
                throw new Error();
        }

        gl.bindVertexArray(null);
    }

    private computeModelView(modelView: mat4, state: RenderState) {
        mat4.copy(modelView, state.view);
        if (this.scene.isSkybox) {
            modelView[12] = 0;
            modelView[13] = 0;
            modelView[14] = 0;
        }

        switch (this.shape.displayFlags) {
        case ShapeDisplayFlags.NORMAL:
        case ShapeDisplayFlags.USE_PNMTXIDX:
            // We should already be using PNMTXIDX in the normal case -- it's hardwired to 0.
            break;
        case ShapeDisplayFlags.BILLBOARD:
        case ShapeDisplayFlags.Y_BILLBOARD:
            // TODO(jstpierre): Proper Y
            const tx = modelView[12];
            const ty = modelView[13];
            const tz = modelView[14];
            mat4.fromTranslation(modelView, [tx, ty, tz]);
            break;
        default:
            throw new Error("whoops");
        }

        mat4.mul(modelView, modelView, this.scene.modelMatrix);
    }

    public exec(state: RenderState) {
        if (!this.scene.currentMaterialCommand.visible)
            return;

        const gl = state.gl;

        gl.bindVertexArray(this.vao);

        const indexOffset = this.coalescedBuffers.indexBuffer.offset;

        gl.bindBuffer(gl.UNIFORM_BUFFER, this.packetParamsBuffer);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, GX_Material.GX_Program.ub_PacketParams, this.packetParamsBuffer);

        let offs = 0;
        this.computeModelView(modelViewScratch, state);
        packetParamsData.set(modelViewScratch, 0);
        offs += 4*4;

        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, packetParamsData, 0, offs);

        this.shape.packets.forEach((packet, packetIndex) => {
            // Update our matrix table.
            let updated = false;
            for (let i = 0; i < packet.weightedJointTable.length; i++) {
                const weightedJointIndex = packet.weightedJointTable[i];
                // Leave existing joint.
                if (weightedJointIndex === 0xFFFF)
                    continue;
                const weightedJoint = this.bmd.drw1.weightedJoints[weightedJointIndex];
                if (weightedJoint.isWeighted)
                    throw new Error("whoops");

                const posMtx = this.jointMatrices[weightedJoint.jointIndex];
                packetParamsData.set(posMtx, offs + i * 16);
                updated = true;
            }

            if (updated)
                gl.bufferSubData(gl.UNIFORM_BUFFER, offs*Float32Array.BYTES_PER_ELEMENT, packetParamsData, offs, 10*16);
            gl.drawElements(gl.TRIANGLES, packet.numTriangles * 3, gl.UNSIGNED_SHORT, indexOffset + packet.firstTriangle * 3 * 2);
        });

        gl.bindVertexArray(null);
    }

    public destroy(gl: WebGL2RenderingContext) {
        gl.deleteVertexArray(this.vao);
        gl.deleteBuffer(this.packetParamsBuffer);
    }
}

const materialParamsData = new Float32Array(4*2 + 4*8 + 4*3*10 + 4*3*20 + 4*2*3 + 4*8);
export class Command_Material {
    private static matrixScratch = mat4.create();
    private static textureScratch = new Int32Array(8);

    public bmd: BMD;
    public btk: BTK;
    public bmt: BMT;
    public material: MaterialEntry;

    public name: string;
    public visible: boolean = true;

    private scene: Scene;
    private renderFlags: RenderFlags;
    private program: GX_Material.GX_Program;

    private materialParamsBuffer: WebGLBuffer;

    constructor(gl: WebGL2RenderingContext, scene: Scene, material: MaterialEntry) {
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

    public exec(state: RenderState) {
        this.scene.currentMaterialCommand = this;

        if (!this.scene.currentMaterialCommand.visible)
            return;

        const gl = state.gl;

        state.useProgram(this.program);
        state.useFlags(this.renderFlags);

        let offs = 0;
        for (let i = 0; i < 2; i++) {
            const color = this.material.colorMatRegs[i];
            if (color !== null) {
                materialParamsData[offs+i*4+0] = color.r;
                materialParamsData[offs+i*4+1] = color.g;
                materialParamsData[offs+i*4+2] = color.b;
                materialParamsData[offs+i*4+3] = color.a;
            }
        }
        offs += 4*2;

        for (let i = 0; i < 8; i++) {
            let fallbackColor: GX_Material.Color;
            if (i >= 4)
                fallbackColor = this.material.gxMaterial.colorRegisters[i - 4];
            else
                fallbackColor = this.material.gxMaterial.colorConstants[i];

            let color: GX_Material.Color;
            if (this.scene.colorOverrides[i]) {
                color = this.scene.colorOverrides[i];
            } else {
                color = fallbackColor;
            }

            let alpha: number;
            if (this.scene.alphaOverrides[i] !== undefined) {
                alpha = this.scene.alphaOverrides[i];
            } else {
                alpha = fallbackColor.a;
            }

            materialParamsData[offs + i*4 + 0] = color.r;
            materialParamsData[offs + i*4 + 1] = color.g;
            materialParamsData[offs + i*4 + 2] = color.b;
            materialParamsData[offs + i*4 + 3] = alpha;
        }
        offs += 4*8;

        // Bind our texture matrices.
        const matrixScratch = Command_Material.matrixScratch;
        for (let i = 0; i < this.material.texMatrices.length; i++) {
            const texMtx = this.material.texMatrices[i];
            if (texMtx === null)
                continue;

            let finalMatrix = matrixScratch;
            if (this.btk && this.btk.calcAnimatedTexMtx(matrixScratch, this.material.name, i, this.scene.getTimeInFrames(state.time))) {
                ;
            } else {
                mat4.copy(finalMatrix, texMtx.matrix);
            }

            switch(texMtx.type) {
            case 0x00: // Normal. Does nothing.
                break;

            case 0x01: // Defino Plaza
            case 0x0B: // Luigi Circuit
                break;
            case 0x06: // Rainbow Road
                mat4.mul(finalMatrix, finalMatrix, mat4.fromValues(
                    0.5, 0,   0, 0,
                    0,  -0.5, 0, 0,
                    0,   0,   0, 0,
                    0.5, 0.5, 1, 0,
                ));
                mat4.mul(finalMatrix, finalMatrix, state.view);
                finalMatrix[12] = 0;
                finalMatrix[13] = 0;
                finalMatrix[14] = 0;
                break;
            case 0x07: // Rainbow Road
                mat4.mul(finalMatrix, finalMatrix, mat4.fromValues(
                    0.5,  0,   0, 0,
                    0,   -0.5, 0, 0,
                    0.5,  0.5, 1, 0,
                    0,    0,   0, 0,
                ));
                mat4.mul(finalMatrix, finalMatrix, state.view);
                finalMatrix[12] = 0;
                finalMatrix[13] = 0;
                finalMatrix[14] = 0;
                break;
            case 0x08: // Peach Beach
                mat4.mul(finalMatrix, finalMatrix, mat4.fromValues(
                    0.5,  0,   0, 0,
                    0,   -0.5, 0, 0,
                    0.5,  0.5, 1, 0,
                    0,    0,   0, 0,
                ));
                mat4.mul(finalMatrix, finalMatrix, texMtx.projectionMatrix);
                break;
            case 0x09: // Rainbow Road
                mat4.mul(finalMatrix, finalMatrix, mat4.fromValues(
                    0.5,  0,   0, 0,
                    0,   -0.5, 0, 0,
                    0.5,  0.5, 1, 0,
                    0,    0,   0, 0,
                ));
                mat4.mul(finalMatrix, finalMatrix, texMtx.projectionMatrix);
                mat4.mul(finalMatrix, finalMatrix, state.view);
                break;
            default:
                throw "whoops";
            }

            // We bind texture matrices as row-major for memory usage purposes.
            materialParamsData[offs + i*12 +  0] = finalMatrix[0];
            materialParamsData[offs + i*12 +  1] = finalMatrix[4];
            materialParamsData[offs + i*12 +  2] = finalMatrix[8];
            materialParamsData[offs + i*12 +  3] = finalMatrix[12];
            materialParamsData[offs + i*12 +  4] = finalMatrix[1];
            materialParamsData[offs + i*12 +  5] = finalMatrix[5];
            materialParamsData[offs + i*12 +  6] = finalMatrix[9];
            materialParamsData[offs + i*12 +  7] = finalMatrix[13];
            materialParamsData[offs + i*12 +  8] = finalMatrix[2];
            materialParamsData[offs + i*12 +  9] = finalMatrix[6];
            materialParamsData[offs + i*12 + 10] = finalMatrix[10];
            materialParamsData[offs + i*12 + 11] = finalMatrix[14];
        }
        offs += 4*3*10;

        for (let i = 0; i < this.material.postTexMatrices.length; i++) {
            const postTexMtx = this.material.postTexMatrices[i];
            if (postTexMtx === null)
                continue;

            const finalMatrix = postTexMtx.matrix;
            materialParamsData[offs + i*12 +  0] = finalMatrix[0];
            materialParamsData[offs + i*12 +  1] = finalMatrix[3];
            materialParamsData[offs + i*12 +  2] = finalMatrix[6];
            materialParamsData[offs + i*12 +  3] = 0;
            materialParamsData[offs + i*12 +  4] = finalMatrix[1];
            materialParamsData[offs + i*12 +  5] = finalMatrix[4];
            materialParamsData[offs + i*12 +  6] = finalMatrix[7];
            materialParamsData[offs + i*12 +  7] = 0;
            materialParamsData[offs + i*12 +  8] = finalMatrix[2];
            materialParamsData[offs + i*12 +  9] = finalMatrix[5];
            materialParamsData[offs + i*12 + 10] = finalMatrix[9];
            materialParamsData[offs + i*12 + 11] = 0;
        }
        offs += 4*3*20;

        for (let i = 0; i < this.material.indTexMatrices.length; i++) {
            const indTexMtx = this.material.indTexMatrices[i];
            if (indTexMtx === null)
                continue;

            const finalMatrix = indTexMtx;
            materialParamsData[offs + i*8 + 0] = finalMatrix[0];
            materialParamsData[offs + i*8 + 1] = finalMatrix[1];
            materialParamsData[offs + i*8 + 2] = finalMatrix[2];
            materialParamsData[offs + i*8 + 3] = 0;
            materialParamsData[offs + i*8 + 4] = finalMatrix[3];
            materialParamsData[offs + i*8 + 5] = finalMatrix[4];
            materialParamsData[offs + i*8 + 6] = finalMatrix[5];
            materialParamsData[offs + i*8 + 7] = 0;
        }
        offs += 4*2*3;

        // Bind textures.
        const textureScratch = Command_Material.textureScratch;
        for (let i = 0; i < this.material.textureIndexes.length; i++) {
            const texIndex = this.material.textureIndexes[i];
            if (texIndex < 0)
                continue;
            const textureBindData = this.scene.getTextureBindData(texIndex);
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, textureBindData.glTexture);
            gl.bindSampler(i, textureBindData.glSampler);
            textureScratch[i] = i;
            materialParamsData[offs + i*4 + 0] = textureBindData.width;
            materialParamsData[offs + i*4 + 1] = textureBindData.height;
            materialParamsData[offs + i*4 + 3] = textureBindData.lodBias;
        }
        gl.uniform1iv(this.program.u_Texture, textureScratch);
        offs += 4*8;

        gl.bindBufferBase(gl.UNIFORM_BUFFER, GX_Material.GX_Program.ub_SceneParams, this.scene.sceneParamsBuffer);

        gl.bindBuffer(gl.UNIFORM_BUFFER, this.materialParamsBuffer);
        gl.bufferData(gl.UNIFORM_BUFFER, materialParamsData, gl.DYNAMIC_DRAW);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, GX_Material.GX_Program.ub_MaterialParams, this.materialParamsBuffer);
    }

    public destroy(gl: WebGL2RenderingContext) {
        this.program.destroy(gl);
        gl.deleteBuffer(this.materialParamsBuffer);
    }
}

type Command = Command_Shape | Command_Material;

interface HierarchyTraverseContext {
    commandList: Command[];
    parentJointMatrix: mat4;
}

export enum ColorOverride {
    K0, K1, K2, K3,
    C0, C1, C2, C3,
}

export interface TextureBindData {
    glTexture: WebGLTexture;
    glSampler: WebGLSampler;
    width: number;
    height: number;
    lodBias: number;
}

// Used mostly by indirect texture FB installations...
export interface TextureOverride {
    glTexture: WebGLTexture;
    width?: number;
    height?: number;
}

const sceneParamsData = new Float32Array(4*4 + GX_Material.scaledVtxAttributes.length + 4);
export class Scene implements Viewer.Scene {
    public textures: Viewer.Texture[];

    public name: string = '';
    public visible: boolean = true;
    public isSkybox: boolean = false;
    public fps: number = 30;

    public modelMatrix: mat4;

    public attrScaleData: Float32Array;

    public colorOverrides: GX_Material.Color[] = [];
    public alphaOverrides: number[] = [];
    public sceneParamsBuffer: WebGLBuffer;

    // Texture information.
    private tex1TextureDatas: TEX1_TextureData[];
    private tex1Samplers: TEX1_Sampler[];
    private glSamplers: WebGLSampler[];
    private glTextures: WebGLTexture[];
    public textureOverrides = new Map<string, TextureOverride>();

    public currentMaterialCommand: Command_Material;

    public materialCommands: Command_Material[];
    private shapeCommands: Command_Shape[];
    private jointMatrices: mat4[];

    private bufferCoalescer: BufferCoalescer;

    private opaqueCommands: Command[];
    private transparentCommands: Command[];

    constructor(
        gl: WebGL2RenderingContext,
        public bmd: BMD,
        public btk: BTK,
        public bmt: BMT,
        public extraTextures: TEX1_TextureData[] = [],
    ) {
        this.translateModel(gl);

        this.sceneParamsBuffer = gl.createBuffer();
        this.modelMatrix = mat4.create();

        // TODO(jstpierre): Support weighted joints.
        if (this.bmd.drw1.isAnyWeighted)
            this.visible = false;
    }

    public destroy(gl: WebGL2RenderingContext) {
        this.bufferCoalescer.destroy(gl);
        this.materialCommands.forEach((command) => command.destroy(gl));
        this.shapeCommands.forEach((command) => command.destroy(gl));
        this.glSamplers.forEach((sampler) => gl.deleteSampler(sampler));
        this.glTextures.forEach((texture) => gl.deleteTexture(texture));
        gl.deleteBuffer(this.sceneParamsBuffer);
    }

    public setColorOverride(i: ColorOverride, color: GX_Material.Color) {
        this.colorOverrides[i] = color;
    }

    public setAlphaOverride(i: ColorOverride, alpha: number) {
        this.alphaOverrides[i] = alpha;
    }

    public setIsSkybox(v: boolean) {
        this.isSkybox = v;
    }

    public setFPS(v: number) {
        this.fps = v;
    }

    public setTextureOverride(name: string, override: TextureOverride) {
        this.textureOverrides.set(name, override);
    }

    public setVisible(v: boolean): void {
        this.visible = v;
    }

    public getTextureBindData(texIndex: number): TextureBindData {
        const tex1Sampler = this.tex1Samplers[texIndex];

        const textureOverride: TextureOverride = this.textureOverrides.get(tex1Sampler.name);

        let glTexture: WebGLTexture;
        let width: number;
        let height: number;
        if (textureOverride !== undefined) {
            glTexture = textureOverride.glTexture;
            width = textureOverride.width;
            height = textureOverride.height;
        } else {
            glTexture = this.glTextures[tex1Sampler.textureDataIndex];
        }

        const tex1TextureData = this.tex1TextureDatas[tex1Sampler.textureDataIndex];
        if (width === undefined)
            width = tex1TextureData.width;
        if (height === undefined)
            height = tex1TextureData.height;

        const glSampler = this.glSamplers[tex1Sampler.index];
        return {
            glSampler,
            glTexture,
            width,
            height,
            lodBias: tex1Sampler.lodBias,
        };
    }

    public getTimeInFrames(milliseconds: number) {
        return (milliseconds / 1000) * this.fps;
    }

    public bindState(state: RenderState): boolean {
        if (!this.visible)
            return false;

        const gl = state.gl;

        state.setClipPlanes(10, 500000);

        // Update our SceneParams UBO.
        let offs = 0;
        sceneParamsData.set(state.projection, offs);
        offs += 4*4;
        sceneParamsData.set(this.attrScaleData, offs);
        offs += GX_Material.scaledVtxAttributes.length;
        sceneParamsData[offs++] = GX_Material.getTextureLODBias(state);

        gl.bindBuffer(gl.UNIFORM_BUFFER, this.sceneParamsBuffer);
        gl.bufferData(gl.UNIFORM_BUFFER, sceneParamsData, gl.DYNAMIC_DRAW);
        return true;
    }

    public renderOpaque(state: RenderState) {
        this.execCommands(state, this.opaqueCommands);
    }

    public renderTransparent(state: RenderState) {
        this.execCommands(state, this.transparentCommands);
    }

    public render(state: RenderState) {
        if (!this.bindState(state))
            return;

        this.renderOpaque(state);
        this.renderTransparent(state);
    }

    private execCommands(state: RenderState, commands: Command[]) {
        commands.forEach((command, i) => {
            command.exec(state);
        });
    }

    private loadExtraTexture(texture: TEX1_TextureData): TEX1_TextureData {
        // XXX(jstpierre): Better texture replacement API, this one is ZTP specific...
        const textureName = texture.name.toLowerCase().replace('.tga', '');
        for (const extraTexture of this.extraTextures) {
            if (extraTexture.name.toLowerCase() === textureName)
                return extraTexture;
        }
        return texture;
    }

    private static translateTexFilter(gl: WebGL2RenderingContext, texFilter: GX.TexFilter) {
        switch (texFilter) {
        case GX.TexFilter.LIN_MIP_NEAR:
            return gl.LINEAR_MIPMAP_NEAREST;
        case GX.TexFilter.LIN_MIP_LIN:
            return gl.LINEAR_MIPMAP_LINEAR;
        case GX.TexFilter.LINEAR:
            return gl.LINEAR;
        case GX.TexFilter.NEAR_MIP_NEAR:
            return gl.NEAREST_MIPMAP_NEAREST;
        case GX.TexFilter.NEAR_MIP_LIN:
            return gl.NEAREST_MIPMAP_LINEAR;
        case GX.TexFilter.NEAR:
            return gl.NEAREST;
        }
    }

    private static translateWrapMode(gl: WebGL2RenderingContext, wrapMode: GX.WrapMode) {
        switch (wrapMode) {
        case GX.WrapMode.CLAMP:
            return gl.CLAMP_TO_EDGE;
        case GX.WrapMode.MIRROR:
            return gl.MIRRORED_REPEAT;
        case GX.WrapMode.REPEAT:
            return gl.REPEAT;
        }
    }

    public static translateSampler(gl: WebGL2RenderingContext, sampler: TEX1_Sampler): WebGLSampler {
        const glSampler = gl.createSampler();
        gl.samplerParameteri(glSampler, gl.TEXTURE_MIN_FILTER, this.translateTexFilter(gl, sampler.minFilter));
        gl.samplerParameteri(glSampler, gl.TEXTURE_MAG_FILTER, this.translateTexFilter(gl, sampler.magFilter));
        gl.samplerParameteri(glSampler, gl.TEXTURE_WRAP_S, this.translateWrapMode(gl, sampler.wrapS));
        gl.samplerParameteri(glSampler, gl.TEXTURE_WRAP_T, this.translateWrapMode(gl, sampler.wrapT));
        gl.samplerParameterf(glSampler, gl.TEXTURE_MIN_LOD, sampler.minLOD);
        gl.samplerParameterf(glSampler, gl.TEXTURE_MAX_LOD, sampler.maxLOD);
        return glSampler;
    }

    public static translateTexture(gl: WebGL2RenderingContext, texture: TEX1_TextureData): WebGLTexture {
        const texId = gl.createTexture();
        (<any> texId).name = texture.name;
        gl.bindTexture(gl.TEXTURE_2D, texId);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, texture.mipCount - 1);

        const ext_compressed_texture_s3tc = gl.getExtension('WEBGL_compressed_texture_s3tc');
        const format = texture.format;

        let offs = 0, width = texture.width, height = texture.height;
        for (let i = 0; i < texture.mipCount; i++) {
            const name = texture.name;
            const size = GX_Texture.calcTextureSize(format, width, height);
            const data = texture.data !== null ? texture.data.subarray(offs, size) : null;
            const surface = { name, format, width, height, data };
            const decodedTexture = GX_Texture.decodeTexture(surface, !!ext_compressed_texture_s3tc);

            if (decodedTexture.type === 'RGBA') {
                gl.texImage2D(gl.TEXTURE_2D, i, gl.RGBA8, decodedTexture.width, decodedTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, decodedTexture.pixels);
            } else if (decodedTexture.type === 'S3TC') {
                gl.compressedTexImage2D(gl.TEXTURE_2D, i, ext_compressed_texture_s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT, decodedTexture.width, decodedTexture.height, 0, decodedTexture.pixels);
            }

            offs += size;
            width /= 2;
            height /= 2;
        }

        return texId;
    }

    private static translateTextureToViewer(texture: TEX1_TextureData): Viewer.Texture {
        const surfaces = [];

        let width = texture.width, height = texture.height, offs = 0;
        const format = texture.format;
        for (let i = 0; i < texture.mipCount; i++) {
            const name = texture.name;
            const size = GX_Texture.calcTextureSize(format, width, height);
            const data = texture.data !== null ? texture.data.subarray(offs, size) : null;
            const surface = { name, format, width, height, data };
            const rgbaTexture = GX_Texture.decodeTexture(surface, false);
            // Should never happen.
            if (rgbaTexture.type === 'S3TC')
                throw new Error("whoops");

            const canvas = document.createElement('canvas');
            canvas.width = rgbaTexture.width;
            canvas.height = rgbaTexture.height;
            canvas.title = `${texture.name} ${texture.format}`;
            const ctx = canvas.getContext('2d');
            const imgData = new ImageData(rgbaTexture.width, rgbaTexture.height);
            imgData.data.set(new Uint8Array(rgbaTexture.pixels.buffer));
            ctx.putImageData(imgData, 0, 0);
            surfaces.push(canvas);

            offs += size;
            width /= 2;
            height /= 2;
        }

        return { name: texture.name, surfaces };
    }

    public translateTextures(gl: WebGL2RenderingContext) {
        const tex1 = this.bmt !== null ? this.bmt.tex1 : this.bmd.tex1;

        this.glTextures = [];
        this.textures = [];
        for (let textureData of tex1.textureDatas) {
            if (textureData.data === null) {
                textureData = this.loadExtraTexture(textureData);
            }

            this.glTextures.push(Scene.translateTexture(gl, textureData));
            this.textures.push(Scene.translateTextureToViewer(textureData));
        }

        this.glSamplers = [];
        for (let sampler of tex1.samplers) {
            this.glSamplers.push(Scene.translateSampler(gl, sampler));
        }

        this.tex1TextureDatas = tex1.textureDatas;
        this.tex1Samplers = tex1.samplers;
    }

    private translateModel(gl: WebGL2RenderingContext) {
        const attrScaleCount = GX_Material.scaledVtxAttributes.length;
        const attrScaleData = new Float32Array(attrScaleCount);
        for (let i = 0; i < GX_Material.scaledVtxAttributes.length; i++) {
            const attrib = GX_Material.scaledVtxAttributes[i];
            const vtxArray = this.bmd.vtx1.vertexArrays.get(attrib);
            const scale = vtxArray !== undefined ? vtxArray.scale : 1;
            attrScaleData[i] = scale;
        }
        this.attrScaleData = attrScaleData;

        this.opaqueCommands = [];
        this.transparentCommands = [];
        this.jointMatrices = [];

        this.translateTextures(gl);

        const mat3 = this.bmt !== null ? this.bmt.mat3 : this.bmd.mat3;
        this.materialCommands = mat3.materialEntries.map((material) => {
            return new Command_Material(gl, this, material);
        });

        this.bufferCoalescer = new BufferCoalescer(gl,
            this.bmd.shp1.shapes.map((shape) => shape.packedData),
            this.bmd.shp1.shapes.map((shape) => shape.indexData),
        );

        this.shapeCommands = this.bmd.shp1.shapes.map((shape, i) => {
            return new Command_Shape(gl, this, shape, this.bufferCoalescer.coalescedBuffers[i], this.jointMatrices);
        });

        // Iterate through scene graph.
        const context: HierarchyTraverseContext = {
            commandList: null,
            parentJointMatrix: mat4.create(),
        };
        this.translateSceneGraph(this.bmd.inf1.sceneGraph, context);
    }

    private translateSceneGraph(node: HierarchyNode, context: HierarchyTraverseContext) {
        const mat3 = this.bmt ? this.bmt.mat3 : this.bmd.mat3;
        const jnt1 = this.bmd.jnt1;

        let commandList = context.commandList;
        let parentJointMatrix = context.parentJointMatrix;
        switch (node.type) {
        case HierarchyType.Shape:
            commandList.push(this.shapeCommands[node.shapeIdx]);
            break;
        case HierarchyType.Joint:
            const boneMatrix = jnt1.bones[jnt1.remapTable[node.jointIdx]].matrix;
            const jointMatrix = mat4.create();
            mat4.mul(jointMatrix, boneMatrix, parentJointMatrix);
            this.jointMatrices[node.jointIdx] = jointMatrix;
            parentJointMatrix = jointMatrix;
            break;
        case HierarchyType.Material:
            const materialIdx = mat3.remapTable[node.materialIdx];
            const materialCommand = this.materialCommands[materialIdx];
            commandList = materialCommand.material.translucent ? this.transparentCommands : this.opaqueCommands;
            commandList.push(materialCommand);
            break;
        }

        const childContext = { commandList, parentJointMatrix };

        for (const child of node.children)
            this.translateSceneGraph(child, childContext);
    }
}
