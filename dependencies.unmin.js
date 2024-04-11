"use strict";
(self["webpackChunkcatallaxy_view"] = self["webpackChunkcatallaxy_view"] || []).push([[520],{

/***/ 9190:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CG: () => (/* binding */ output),
/* harmony export */   ai: () => (/* binding */ number),
/* harmony export */   ee: () => (/* binding */ bytes),
/* harmony export */   t2: () => (/* binding */ exists)
/* harmony export */ });
/* unused harmony exports bool, hash */
function number(n) {
    if (!Number.isSafeInteger(n) || n < 0)
        throw new Error(`Wrong positive integer: ${n}`);
}
function bool(b) {
    if (typeof b !== 'boolean')
        throw new Error(`Expected boolean, not ${b}`);
}
function bytes(b, ...lengths) {
    if (!(b instanceof Uint8Array))
        throw new Error('Expected Uint8Array');
    if (lengths.length > 0 && !lengths.includes(b.length))
        throw new Error(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
}
function hash(hash) {
    if (typeof hash !== 'function' || typeof hash.create !== 'function')
        throw new Error('Hash should be wrapped by utils.wrapConstructor');
    number(hash.outputLen);
    number(hash.blockLen);
}
function exists(instance, checkFinished = true) {
    if (instance.destroyed)
        throw new Error('Hash instance has been destroyed');
    if (checkFinished && instance.finished)
        throw new Error('Hash#digest() has already been called');
}
function output(out, instance) {
    bytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
        throw new Error(`digestInto() expects output buffer of length at least ${min}`);
    }
}

const assert = { number, bool, bytes, hash, exists, output };
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (assert)));
//# sourceMappingURL=_assert.js.map

/***/ }),

/***/ 4976:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DH: () => (/* binding */ u32),
/* harmony export */   O8: () => (/* binding */ createView),
/* harmony export */   Ow: () => (/* binding */ rotr),
/* harmony export */   Vw: () => (/* binding */ Hash),
/* harmony export */   ZJ: () => (/* binding */ toBytes),
/* harmony export */   ld: () => (/* binding */ wrapConstructor)
/* harmony export */ });
/* unused harmony exports u8, isLE, bytesToHex, hexToBytes, nextTick, asyncLoop, utf8ToBytes, concatBytes, checkOpts, wrapConstructorWithOpts, wrapXOFConstructorWithOpts, randomBytes */
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// We use WebCrypto aka globalThis.crypto, which exists in browsers and node.js 16+.
// node.js versions earlier than v19 don't declare it in global scope.
// For node.js, package.json#exports field mapping rewrites import
// from `crypto` to `cryptoNode`, which imports native module.
// Makes the utils un-importable in browsers without a bundler.
// Once node.js 18 is deprecated, we can just drop the import.

const u8a = (a) => a instanceof Uint8Array;
// Cast array to different type
const u8 = (arr) => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
const u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
// Cast array to view
const createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
// The rotate right (circular right shift) operation for uint32
const rotr = (word, shift) => (word << (32 - shift)) | (word >>> shift);
// big-endian hardware is rare. Just in case someone still decides to run hashes:
// early-throw an error because we don't support BE yet.
const isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
if (!isLE)
    throw new Error('Non little-endian hardware is not supported');
const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));
/**
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
function bytesToHex(bytes) {
    if (!u8a(bytes))
        throw new Error('Uint8Array expected');
    // pre-caching improves the speed 6x
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += hexes[bytes[i]];
    }
    return hex;
}
/**
 * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
 */
function hexToBytes(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    const len = hex.length;
    if (len % 2)
        throw new Error('padded hex string expected, got unpadded hex of length ' + len);
    const array = new Uint8Array(len / 2);
    for (let i = 0; i < array.length; i++) {
        const j = i * 2;
        const hexByte = hex.slice(j, j + 2);
        const byte = Number.parseInt(hexByte, 16);
        if (Number.isNaN(byte) || byte < 0)
            throw new Error('Invalid byte sequence');
        array[i] = byte;
    }
    return array;
}
// There is no setImmediate in browser and setTimeout is slow.
// call of async fn will return Promise, which will be fullfiled only on
// next scheduler queue processing step and this is exactly what we need.
const nextTick = async () => { };
// Returns control to thread each 'tick' ms to avoid blocking
async function asyncLoop(iters, tick, cb) {
    let ts = Date.now();
    for (let i = 0; i < iters; i++) {
        cb(i);
        // Date.now() is not monotonic, so in case if clock goes backwards we return return control too
        const diff = Date.now() - ts;
        if (diff >= 0 && diff < tick)
            continue;
        await nextTick();
        ts += diff;
    }
}
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes(str) {
    if (typeof str !== 'string')
        throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
    return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
}
/**
 * Normalizes (non-hex) string or Uint8Array to Uint8Array.
 * Warning: when Uint8Array is passed, it would NOT get copied.
 * Keep in mind for future mutable operations.
 */
function toBytes(data) {
    if (typeof data === 'string')
        data = utf8ToBytes(data);
    if (!u8a(data))
        throw new Error(`expected Uint8Array, got ${typeof data}`);
    return data;
}
/**
 * Copies several Uint8Arrays into one.
 */
function concatBytes(...arrays) {
    const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
    let pad = 0; // walk through each item, ensure they have proper type
    arrays.forEach((a) => {
        if (!u8a(a))
            throw new Error('Uint8Array expected');
        r.set(a, pad);
        pad += a.length;
    });
    return r;
}
// For runtime check if class implements interface
class Hash {
    // Safe version that clones internal state
    clone() {
        return this._cloneInto();
    }
}
const toStr = {}.toString;
function checkOpts(defaults, opts) {
    if (opts !== undefined && toStr.call(opts) !== '[object Object]')
        throw new Error('Options should be object or undefined');
    const merged = Object.assign(defaults, opts);
    return merged;
}
function wrapConstructor(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
}
function wrapConstructorWithOpts(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
}
function wrapXOFConstructorWithOpts(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
}
/**
 * Secure PRNG. Uses `crypto.getRandomValues`, which defers to OS.
 */
function randomBytes(bytesLength = 32) {
    if (crypto && typeof crypto.getRandomValues === 'function') {
        return crypto.getRandomValues(new Uint8Array(bytesLength));
    }
    throw new Error('crypto.getRandomValues must be defined');
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 3992:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  U: () => (/* binding */ parseAbi)
});

// EXTERNAL MODULE: ./node_modules/abitype/dist/esm/regex.js
var regex = __webpack_require__(5276);
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/runtime/signatures.js

// https://regexr.com/7gmok
const errorSignatureRegex = /^error (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
function isErrorSignature(signature) {
    return errorSignatureRegex.test(signature);
}
function execErrorSignature(signature) {
    return (0,regex/* execTyped */.Yv)(errorSignatureRegex, signature);
}
// https://regexr.com/7gmoq
const eventSignatureRegex = /^event (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
function isEventSignature(signature) {
    return eventSignatureRegex.test(signature);
}
function execEventSignature(signature) {
    return (0,regex/* execTyped */.Yv)(eventSignatureRegex, signature);
}
// https://regexr.com/7gmot
const functionSignatureRegex = /^function (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)(?: (?<scope>external|public{1}))?(?: (?<stateMutability>pure|view|nonpayable|payable{1}))?(?: returns\s?\((?<returns>.*?)\))?$/;
function isFunctionSignature(signature) {
    return functionSignatureRegex.test(signature);
}
function execFunctionSignature(signature) {
    return (0,regex/* execTyped */.Yv)(functionSignatureRegex, signature);
}
// https://regexr.com/7gmp3
const structSignatureRegex = /^struct (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*) \{(?<properties>.*?)\}$/;
function isStructSignature(signature) {
    return structSignatureRegex.test(signature);
}
function execStructSignature(signature) {
    return (0,regex/* execTyped */.Yv)(structSignatureRegex, signature);
}
// https://regexr.com/78u01
const constructorSignatureRegex = /^constructor\((?<parameters>.*?)\)(?:\s(?<stateMutability>payable{1}))?$/;
function isConstructorSignature(signature) {
    return constructorSignatureRegex.test(signature);
}
function execConstructorSignature(signature) {
    return (0,regex/* execTyped */.Yv)(constructorSignatureRegex, signature);
}
// https://regexr.com/78u18
const fallbackSignatureRegex = /^fallback\(\)$/;
function isFallbackSignature(signature) {
    return fallbackSignatureRegex.test(signature);
}
// https://regexr.com/78u1k
const receiveSignatureRegex = /^receive\(\) external payable$/;
function isReceiveSignature(signature) {
    return receiveSignatureRegex.test(signature);
}
const modifiers = new Set([
    'memory',
    'indexed',
    'storage',
    'calldata',
]);
const eventModifiers = new Set(['indexed']);
const functionModifiers = new Set([
    'calldata',
    'memory',
    'storage',
]);
//# sourceMappingURL=signatures.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/version.js
const version = '1.0.0';
//# sourceMappingURL=version.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/errors.js

class BaseError extends Error {
    constructor(shortMessage, args = {}) {
        const details = args.cause instanceof BaseError
            ? args.cause.details
            : args.cause?.message
                ? args.cause.message
                : args.details;
        const docsPath = args.cause instanceof BaseError
            ? args.cause.docsPath || args.docsPath
            : args.docsPath;
        const message = [
            shortMessage || 'An error occurred.',
            '',
            ...(args.metaMessages ? [...args.metaMessages, ''] : []),
            ...(docsPath ? [`Docs: https://abitype.dev${docsPath}`] : []),
            ...(details ? [`Details: ${details}`] : []),
            `Version: abitype@${version}`,
        ].join('\n');
        super(message);
        Object.defineProperty(this, "details", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "docsPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metaMessages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiTypeError'
        });
        if (args.cause)
            this.cause = args.cause;
        this.details = details;
        this.docsPath = docsPath;
        this.metaMessages = args.metaMessages;
        this.shortMessage = shortMessage;
    }
}
//# sourceMappingURL=errors.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/errors/abiItem.js

class InvalidAbiItemError extends BaseError {
    constructor({ signature }) {
        super('Failed to parse ABI item.', {
            details: `parseAbiItem(${JSON.stringify(signature, null, 2)})`,
            docsPath: '/api/human#parseabiitem-1',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidAbiItemError'
        });
    }
}
class UnknownTypeError extends BaseError {
    constructor({ type }) {
        super('Unknown type.', {
            metaMessages: [
                `Type "${type}" is not a valid ABI type. Perhaps you forgot to include a struct signature?`,
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnknownTypeError'
        });
    }
}
class UnknownSolidityTypeError extends BaseError {
    constructor({ type }) {
        super('Unknown type.', {
            metaMessages: [`Type "${type}" is not a valid ABI type.`],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnknownSolidityTypeError'
        });
    }
}
//# sourceMappingURL=abiItem.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js

class InvalidAbiParameterError extends BaseError {
    constructor({ param }) {
        super('Failed to parse ABI parameter.', {
            details: `parseAbiParameter(${JSON.stringify(param, null, 2)})`,
            docsPath: '/api/human#parseabiparameter-1',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidAbiParameterError'
        });
    }
}
class InvalidAbiParametersError extends BaseError {
    constructor({ params }) {
        super('Failed to parse ABI parameters.', {
            details: `parseAbiParameters(${JSON.stringify(params, null, 2)})`,
            docsPath: '/api/human#parseabiparameters-1',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidAbiParametersError'
        });
    }
}
class InvalidParameterError extends BaseError {
    constructor({ param }) {
        super('Invalid ABI parameter.', {
            details: param,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidParameterError'
        });
    }
}
class SolidityProtectedKeywordError extends BaseError {
    constructor({ param, name }) {
        super('Invalid ABI parameter.', {
            details: param,
            metaMessages: [
                `"${name}" is a protected Solidity keyword. More info: https://docs.soliditylang.org/en/latest/cheatsheet.html`,
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'SolidityProtectedKeywordError'
        });
    }
}
class InvalidModifierError extends BaseError {
    constructor({ param, type, modifier, }) {
        super('Invalid ABI parameter.', {
            details: param,
            metaMessages: [
                `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ''}.`,
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidModifierError'
        });
    }
}
class InvalidFunctionModifierError extends BaseError {
    constructor({ param, type, modifier, }) {
        super('Invalid ABI parameter.', {
            details: param,
            metaMessages: [
                `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ''}.`,
                `Data location can only be specified for array, struct, or mapping types, but "${modifier}" was given.`,
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidFunctionModifierError'
        });
    }
}
class InvalidAbiTypeParameterError extends BaseError {
    constructor({ abiParameter, }) {
        super('Invalid ABI parameter.', {
            details: JSON.stringify(abiParameter, null, 2),
            metaMessages: ['ABI parameter type is invalid.'],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidAbiTypeParameterError'
        });
    }
}
//# sourceMappingURL=abiParameter.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/errors/signature.js

class InvalidSignatureError extends BaseError {
    constructor({ signature, type, }) {
        super(`Invalid ${type} signature.`, {
            details: signature,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidSignatureError'
        });
    }
}
class UnknownSignatureError extends BaseError {
    constructor({ signature }) {
        super('Unknown signature.', {
            details: signature,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnknownSignatureError'
        });
    }
}
class InvalidStructSignatureError extends BaseError {
    constructor({ signature }) {
        super('Invalid struct signature.', {
            details: signature,
            metaMessages: ['No properties exist.'],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidStructSignatureError'
        });
    }
}
//# sourceMappingURL=signature.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/errors/struct.js

class CircularReferenceError extends BaseError {
    constructor({ type }) {
        super('Circular reference detected.', {
            metaMessages: [`Struct "${type}" is a circular reference.`],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'CircularReferenceError'
        });
    }
}
//# sourceMappingURL=struct.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js

class InvalidParenthesisError extends BaseError {
    constructor({ current, depth }) {
        super('Unbalanced parentheses.', {
            metaMessages: [
                `"${current.trim()}" has too many ${depth > 0 ? 'opening' : 'closing'} parentheses.`,
            ],
            details: `Depth "${depth}"`,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidParenthesisError'
        });
    }
}
//# sourceMappingURL=splitParameters.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/runtime/cache.js
/**
 * Gets {@link parameterCache} cache key namespaced by {@link type}. This prevents parameters from being accessible to types that don't allow them (e.g. `string indexed foo` not allowed outside of `type: 'event'`).
 * @param param ABI parameter string
 * @param type ABI parameter type
 * @returns Cache key for {@link parameterCache}
 */
function getParameterCacheKey(param, type) {
    if (type)
        return `${type}:${param}`;
    return param;
}
/**
 * Basic cache seeded with common ABI parameter strings.
 *
 * **Note: When seeding more parameters, make sure you benchmark performance. The current number is the ideal balance between performance and having an already existing cache.**
 */
const parameterCache = new Map([
    // Unnamed
    ['address', { type: 'address' }],
    ['bool', { type: 'bool' }],
    ['bytes', { type: 'bytes' }],
    ['bytes32', { type: 'bytes32' }],
    ['int', { type: 'int256' }],
    ['int256', { type: 'int256' }],
    ['string', { type: 'string' }],
    ['uint', { type: 'uint256' }],
    ['uint8', { type: 'uint8' }],
    ['uint16', { type: 'uint16' }],
    ['uint24', { type: 'uint24' }],
    ['uint32', { type: 'uint32' }],
    ['uint64', { type: 'uint64' }],
    ['uint96', { type: 'uint96' }],
    ['uint112', { type: 'uint112' }],
    ['uint160', { type: 'uint160' }],
    ['uint192', { type: 'uint192' }],
    ['uint256', { type: 'uint256' }],
    // Named
    ['address owner', { type: 'address', name: 'owner' }],
    ['address to', { type: 'address', name: 'to' }],
    ['bool approved', { type: 'bool', name: 'approved' }],
    ['bytes _data', { type: 'bytes', name: '_data' }],
    ['bytes data', { type: 'bytes', name: 'data' }],
    ['bytes signature', { type: 'bytes', name: 'signature' }],
    ['bytes32 hash', { type: 'bytes32', name: 'hash' }],
    ['bytes32 r', { type: 'bytes32', name: 'r' }],
    ['bytes32 root', { type: 'bytes32', name: 'root' }],
    ['bytes32 s', { type: 'bytes32', name: 's' }],
    ['string name', { type: 'string', name: 'name' }],
    ['string symbol', { type: 'string', name: 'symbol' }],
    ['string tokenURI', { type: 'string', name: 'tokenURI' }],
    ['uint tokenId', { type: 'uint256', name: 'tokenId' }],
    ['uint8 v', { type: 'uint8', name: 'v' }],
    ['uint256 balance', { type: 'uint256', name: 'balance' }],
    ['uint256 tokenId', { type: 'uint256', name: 'tokenId' }],
    ['uint256 value', { type: 'uint256', name: 'value' }],
    // Indexed
    [
        'event:address indexed from',
        { type: 'address', name: 'from', indexed: true },
    ],
    ['event:address indexed to', { type: 'address', name: 'to', indexed: true }],
    [
        'event:uint indexed tokenId',
        { type: 'uint256', name: 'tokenId', indexed: true },
    ],
    [
        'event:uint256 indexed tokenId',
        { type: 'uint256', name: 'tokenId', indexed: true },
    ],
]);
//# sourceMappingURL=cache.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/runtime/utils.js







function parseSignature(signature, structs = {}) {
    if (isFunctionSignature(signature)) {
        const match = execFunctionSignature(signature);
        if (!match)
            throw new InvalidSignatureError({ signature, type: 'function' });
        const inputParams = splitParameters(match.parameters);
        const inputs = [];
        const inputLength = inputParams.length;
        for (let i = 0; i < inputLength; i++) {
            inputs.push(parseAbiParameter(inputParams[i], {
                modifiers: functionModifiers,
                structs,
                type: 'function',
            }));
        }
        const outputs = [];
        if (match.returns) {
            const outputParams = splitParameters(match.returns);
            const outputLength = outputParams.length;
            for (let i = 0; i < outputLength; i++) {
                outputs.push(parseAbiParameter(outputParams[i], {
                    modifiers: functionModifiers,
                    structs,
                    type: 'function',
                }));
            }
        }
        return {
            name: match.name,
            type: 'function',
            stateMutability: match.stateMutability ?? 'nonpayable',
            inputs,
            outputs,
        };
    }
    if (isEventSignature(signature)) {
        const match = execEventSignature(signature);
        if (!match)
            throw new InvalidSignatureError({ signature, type: 'event' });
        const params = splitParameters(match.parameters);
        const abiParameters = [];
        const length = params.length;
        for (let i = 0; i < length; i++) {
            abiParameters.push(parseAbiParameter(params[i], {
                modifiers: eventModifiers,
                structs,
                type: 'event',
            }));
        }
        return { name: match.name, type: 'event', inputs: abiParameters };
    }
    if (isErrorSignature(signature)) {
        const match = execErrorSignature(signature);
        if (!match)
            throw new InvalidSignatureError({ signature, type: 'error' });
        const params = splitParameters(match.parameters);
        const abiParameters = [];
        const length = params.length;
        for (let i = 0; i < length; i++) {
            abiParameters.push(parseAbiParameter(params[i], { structs, type: 'error' }));
        }
        return { name: match.name, type: 'error', inputs: abiParameters };
    }
    if (isConstructorSignature(signature)) {
        const match = execConstructorSignature(signature);
        if (!match)
            throw new InvalidSignatureError({ signature, type: 'constructor' });
        const params = splitParameters(match.parameters);
        const abiParameters = [];
        const length = params.length;
        for (let i = 0; i < length; i++) {
            abiParameters.push(parseAbiParameter(params[i], { structs, type: 'constructor' }));
        }
        return {
            type: 'constructor',
            stateMutability: match.stateMutability ?? 'nonpayable',
            inputs: abiParameters,
        };
    }
    if (isFallbackSignature(signature))
        return { type: 'fallback' };
    if (isReceiveSignature(signature))
        return {
            type: 'receive',
            stateMutability: 'payable',
        };
    throw new UnknownSignatureError({ signature });
}
const abiParameterWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
const abiParameterWithTupleRegex = /^\((?<type>.+?)\)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
const dynamicIntegerRegex = /^u?int$/;
function parseAbiParameter(param, options) {
    // optional namespace cache by `type`
    const parameterCacheKey = getParameterCacheKey(param, options?.type);
    if (parameterCache.has(parameterCacheKey))
        return parameterCache.get(parameterCacheKey);
    const isTuple = regex/* isTupleRegex */.wj.test(param);
    const match = (0,regex/* execTyped */.Yv)(isTuple ? abiParameterWithTupleRegex : abiParameterWithoutTupleRegex, param);
    if (!match)
        throw new InvalidParameterError({ param });
    if (match.name && isSolidityKeyword(match.name))
        throw new SolidityProtectedKeywordError({ param, name: match.name });
    const name = match.name ? { name: match.name } : {};
    const indexed = match.modifier === 'indexed' ? { indexed: true } : {};
    const structs = options?.structs ?? {};
    let type;
    let components = {};
    if (isTuple) {
        type = 'tuple';
        const params = splitParameters(match.type);
        const components_ = [];
        const length = params.length;
        for (let i = 0; i < length; i++) {
            // remove `modifiers` from `options` to prevent from being added to tuple components
            components_.push(parseAbiParameter(params[i], { structs }));
        }
        components = { components: components_ };
    }
    else if (match.type in structs) {
        type = 'tuple';
        components = { components: structs[match.type] };
    }
    else if (dynamicIntegerRegex.test(match.type)) {
        type = `${match.type}256`;
    }
    else {
        type = match.type;
        if (!(options?.type === 'struct') && !isSolidityType(type))
            throw new UnknownSolidityTypeError({ type });
    }
    if (match.modifier) {
        // Check if modifier exists, but is not allowed (e.g. `indexed` in `functionModifiers`)
        if (!options?.modifiers?.has?.(match.modifier))
            throw new InvalidModifierError({
                param,
                type: options?.type,
                modifier: match.modifier,
            });
        // Check if resolved `type` is valid if there is a function modifier
        if (functionModifiers.has(match.modifier) &&
            !isValidDataLocation(type, !!match.array))
            throw new InvalidFunctionModifierError({
                param,
                type: options?.type,
                modifier: match.modifier,
            });
    }
    const abiParameter = {
        type: `${type}${match.array ?? ''}`,
        ...name,
        ...indexed,
        ...components,
    };
    parameterCache.set(parameterCacheKey, abiParameter);
    return abiParameter;
}
// s/o latika for this
function splitParameters(params, result = [], current = '', depth = 0) {
    const length = params.trim().length;
    // biome-ignore lint/correctness/noUnreachable: recursive
    for (let i = 0; i < length; i++) {
        const char = params[i];
        const tail = params.slice(i + 1);
        switch (char) {
            case ',':
                return depth === 0
                    ? splitParameters(tail, [...result, current.trim()])
                    : splitParameters(tail, result, `${current}${char}`, depth);
            case '(':
                return splitParameters(tail, result, `${current}${char}`, depth + 1);
            case ')':
                return splitParameters(tail, result, `${current}${char}`, depth - 1);
            default:
                return splitParameters(tail, result, `${current}${char}`, depth);
        }
    }
    if (current === '')
        return result;
    if (depth !== 0)
        throw new InvalidParenthesisError({ current, depth });
    result.push(current.trim());
    return result;
}
function isSolidityType(type) {
    return (type === 'address' ||
        type === 'bool' ||
        type === 'function' ||
        type === 'string' ||
        regex/* bytesRegex */.BD.test(type) ||
        regex/* integerRegex */.Ge.test(type));
}
const protectedKeywordsRegex = /^(?:after|alias|anonymous|apply|auto|byte|calldata|case|catch|constant|copyof|default|defined|error|event|external|false|final|function|immutable|implements|in|indexed|inline|internal|let|mapping|match|memory|mutable|null|of|override|partial|private|promise|public|pure|reference|relocatable|return|returns|sizeof|static|storage|struct|super|supports|switch|this|true|try|typedef|typeof|var|view|virtual)$/;
/** @internal */
function isSolidityKeyword(name) {
    return (name === 'address' ||
        name === 'bool' ||
        name === 'function' ||
        name === 'string' ||
        name === 'tuple' ||
        regex/* bytesRegex */.BD.test(name) ||
        regex/* integerRegex */.Ge.test(name) ||
        protectedKeywordsRegex.test(name));
}
/** @internal */
function isValidDataLocation(type, isArray) {
    return isArray || type === 'bytes' || type === 'string' || type === 'tuple';
}
//# sourceMappingURL=utils.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/runtime/structs.js







function parseStructs(signatures) {
    // Create "shallow" version of each struct (and filter out non-structs or invalid structs)
    const shallowStructs = {};
    const signaturesLength = signatures.length;
    for (let i = 0; i < signaturesLength; i++) {
        const signature = signatures[i];
        if (!isStructSignature(signature))
            continue;
        const match = execStructSignature(signature);
        if (!match)
            throw new InvalidSignatureError({ signature, type: 'struct' });
        const properties = match.properties.split(';');
        const components = [];
        const propertiesLength = properties.length;
        for (let k = 0; k < propertiesLength; k++) {
            const property = properties[k];
            const trimmed = property.trim();
            if (!trimmed)
                continue;
            const abiParameter = parseAbiParameter(trimmed, {
                type: 'struct',
            });
            components.push(abiParameter);
        }
        if (!components.length)
            throw new InvalidStructSignatureError({ signature });
        shallowStructs[match.name] = components;
    }
    // Resolve nested structs inside each parameter
    const resolvedStructs = {};
    const entries = Object.entries(shallowStructs);
    const entriesLength = entries.length;
    for (let i = 0; i < entriesLength; i++) {
        const [name, parameters] = entries[i];
        resolvedStructs[name] = resolveStructs(parameters, shallowStructs);
    }
    return resolvedStructs;
}
const typeWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?$/;
function resolveStructs(abiParameters, structs, ancestors = new Set()) {
    const components = [];
    const length = abiParameters.length;
    for (let i = 0; i < length; i++) {
        const abiParameter = abiParameters[i];
        const isTuple = regex/* isTupleRegex */.wj.test(abiParameter.type);
        if (isTuple)
            components.push(abiParameter);
        else {
            const match = (0,regex/* execTyped */.Yv)(typeWithoutTupleRegex, abiParameter.type);
            if (!match?.type)
                throw new InvalidAbiTypeParameterError({ abiParameter });
            const { array, type } = match;
            if (type in structs) {
                if (ancestors.has(type))
                    throw new CircularReferenceError({ type });
                components.push({
                    ...abiParameter,
                    type: `tuple${array ?? ''}`,
                    components: resolveStructs(structs[type] ?? [], structs, new Set([...ancestors, type])),
                });
            }
            else {
                if (isSolidityType(type))
                    components.push(abiParameter);
                else
                    throw new UnknownTypeError({ type });
            }
        }
    }
    return components;
}
//# sourceMappingURL=structs.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/parseAbi.js



/**
 * Parses human-readable ABI into JSON {@link Abi}
 *
 * @param signatures - Human-Readable ABI
 * @returns Parsed {@link Abi}
 *
 * @example
 * const abi = parseAbi([
 *   //  ^? const abi: readonly [{ name: "balanceOf"; type: "function"; stateMutability:...
 *   'function balanceOf(address owner) view returns (uint256)',
 *   'event Transfer(address indexed from, address indexed to, uint256 amount)',
 * ])
 */
function parseAbi(signatures) {
    const structs = parseStructs(signatures);
    const abi = [];
    const length = signatures.length;
    for (let i = 0; i < length; i++) {
        const signature = signatures[i];
        if (isStructSignature(signature))
            continue;
        abi.push(parseSignature(signature, structs));
    }
    return abi;
}
//# sourceMappingURL=parseAbi.js.map

/***/ }),

/***/ 5276:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BD: () => (/* binding */ bytesRegex),
/* harmony export */   Ge: () => (/* binding */ integerRegex),
/* harmony export */   Yv: () => (/* binding */ execTyped),
/* harmony export */   wj: () => (/* binding */ isTupleRegex)
/* harmony export */ });
// TODO: This looks cool. Need to check the performance of `new RegExp` versus defined inline though.
// https://twitter.com/GabrielVergnaud/status/1622906834343366657
function execTyped(regex, string) {
    const match = regex.exec(string);
    return match?.groups;
}
// `bytes<M>`: binary type of `M` bytes, `0 < M <= 32`
// https://regexr.com/6va55
const bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
// `(u)int<M>`: (un)signed integer type of `M` bits, `0 < M <= 256`, `M % 8 == 0`
// https://regexr.com/6v8hp
const integerRegex = /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
const isTupleRegex = /^\(.+?\).*?$/;
//# sourceMappingURL=regex.js.map

/***/ }),

/***/ 3033:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   J: () => (/* binding */ parseAccount)
/* harmony export */ });
function parseAccount(account) {
    if (typeof account === 'string')
        return { address: account, type: 'json-rpc' };
    return account;
}
//# sourceMappingURL=parseAccount.js.map

/***/ }),

/***/ 718:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PF: () => (/* binding */ getContract)
/* harmony export */ });
/* unused harmony exports getFunctionParameters, getEventParameters */
/* harmony import */ var _utils_getAction_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3692);
/* harmony import */ var _public_createContractEventFilter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1100);
/* harmony import */ var _public_estimateContractGas_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(965);
/* harmony import */ var _public_getContractEvents_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1443);
/* harmony import */ var _public_readContract_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6724);
/* harmony import */ var _public_simulateContract_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8318);
/* harmony import */ var _public_watchContractEvent_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(301);
/* harmony import */ var _wallet_writeContract_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(9177);








/**
 * Gets type-safe interface for performing contract-related actions with a specific `abi` and `address`.
 *
 * - Docs https://viem.sh/docs/contract/getContract
 *
 * Using Contract Instances can make it easier to work with contracts if you don't want to pass the `abi` and `address` properites every time you perform contract actions, e.g. [`readContract`](https://viem.sh/docs/contract/readContract), [`writeContract`](https://viem.sh/docs/contract/writeContract), [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas), etc.
 *
 * @example
 * import { createPublicClient, getContract, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const publicClient = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const contract = getContract({
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi([
 *     'function balanceOf(address owner) view returns (uint256)',
 *     'function ownerOf(uint256 tokenId) view returns (address)',
 *     'function totalSupply() view returns (uint256)',
 *   ]),
 *   client: publicClient,
 * })
 */
function getContract({ abi, address, client: client_, }) {
    const client = client_;
    const [publicClient, walletClient] = (() => {
        if (!client)
            return [undefined, undefined];
        if ('public' in client && 'wallet' in client)
            return [client.public, client.wallet];
        if ('public' in client)
            return [client.public, undefined];
        if ('wallet' in client)
            return [undefined, client.wallet];
        return [client, client];
    })();
    const hasPublicClient = publicClient !== undefined && publicClient !== null;
    const hasWalletClient = walletClient !== undefined && walletClient !== null;
    const contract = {};
    let hasReadFunction = false;
    let hasWriteFunction = false;
    let hasEvent = false;
    for (const item of abi) {
        if (item.type === 'function')
            if (item.stateMutability === 'view' || item.stateMutability === 'pure')
                hasReadFunction = true;
            else
                hasWriteFunction = true;
        else if (item.type === 'event')
            hasEvent = true;
        // Exit early if all flags are `true`
        if (hasReadFunction && hasWriteFunction && hasEvent)
            break;
    }
    if (hasPublicClient) {
        if (hasReadFunction)
            contract.read = new Proxy({}, {
                get(_, functionName) {
                    return (...parameters) => {
                        const { args, options } = getFunctionParameters(parameters);
                        return (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_0__/* .getAction */ .T)(publicClient, _public_readContract_js__WEBPACK_IMPORTED_MODULE_1__/* .readContract */ .J, 'readContract')({
                            abi,
                            address,
                            functionName,
                            args,
                            ...options,
                        });
                    };
                },
            });
        if (hasWriteFunction)
            contract.simulate = new Proxy({}, {
                get(_, functionName) {
                    return (...parameters) => {
                        const { args, options } = getFunctionParameters(parameters);
                        return (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_0__/* .getAction */ .T)(publicClient, _public_simulateContract_js__WEBPACK_IMPORTED_MODULE_2__/* .simulateContract */ .v, 'simulateContract')({
                            abi,
                            address,
                            functionName,
                            args,
                            ...options,
                        });
                    };
                },
            });
        if (hasEvent) {
            contract.createEventFilter = new Proxy({}, {
                get(_, eventName) {
                    return (...parameters) => {
                        const abiEvent = abi.find((x) => x.type === 'event' && x.name === eventName);
                        const { args, options } = getEventParameters(parameters, abiEvent);
                        return (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_0__/* .getAction */ .T)(publicClient, _public_createContractEventFilter_js__WEBPACK_IMPORTED_MODULE_3__/* .createContractEventFilter */ .X, 'createContractEventFilter')({
                            abi,
                            address,
                            eventName,
                            args,
                            ...options,
                        });
                    };
                },
            });
            contract.getEvents = new Proxy({}, {
                get(_, eventName) {
                    return (...parameters) => {
                        const abiEvent = abi.find((x) => x.type === 'event' && x.name === eventName);
                        const { args, options } = getEventParameters(parameters, abiEvent);
                        return (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_0__/* .getAction */ .T)(publicClient, _public_getContractEvents_js__WEBPACK_IMPORTED_MODULE_4__/* .getContractEvents */ .u, 'getContractEvents')({
                            abi,
                            address,
                            eventName,
                            args,
                            ...options,
                        });
                    };
                },
            });
            contract.watchEvent = new Proxy({}, {
                get(_, eventName) {
                    return (...parameters) => {
                        const abiEvent = abi.find((x) => x.type === 'event' && x.name === eventName);
                        const { args, options } = getEventParameters(parameters, abiEvent);
                        return (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_0__/* .getAction */ .T)(publicClient, _public_watchContractEvent_js__WEBPACK_IMPORTED_MODULE_5__/* .watchContractEvent */ .q, 'watchContractEvent')({
                            abi,
                            address,
                            eventName,
                            args,
                            ...options,
                        });
                    };
                },
            });
        }
    }
    if (hasWalletClient) {
        if (hasWriteFunction)
            contract.write = new Proxy({}, {
                get(_, functionName) {
                    return (...parameters) => {
                        const { args, options } = getFunctionParameters(parameters);
                        return (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_0__/* .getAction */ .T)(walletClient, _wallet_writeContract_js__WEBPACK_IMPORTED_MODULE_6__/* .writeContract */ .E, 'writeContract')({
                            abi,
                            address,
                            functionName,
                            args,
                            ...options,
                        });
                    };
                },
            });
    }
    if (hasPublicClient || hasWalletClient)
        if (hasWriteFunction)
            contract.estimateGas = new Proxy({}, {
                get(_, functionName) {
                    return (...parameters) => {
                        const { args, options } = getFunctionParameters(parameters);
                        const client = (publicClient ?? walletClient);
                        return (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_0__/* .getAction */ .T)(client, _public_estimateContractGas_js__WEBPACK_IMPORTED_MODULE_7__/* .estimateContractGas */ .W, 'estimateContractGas')({
                            abi,
                            address,
                            functionName,
                            args,
                            ...options,
                            account: options.account ??
                                walletClient.account,
                        });
                    };
                },
            });
    contract.address = address;
    contract.abi = abi;
    return contract;
}
/**
 * @internal exporting for testing only
 */
function getFunctionParameters(values) {
    const hasArgs = values.length && Array.isArray(values[0]);
    const args = hasArgs ? values[0] : [];
    const options = (hasArgs ? values[1] : values[0]) ?? {};
    return { args, options };
}
/**
 * @internal exporting for testing only
 */
function getEventParameters(values, abiEvent) {
    let hasArgs = false;
    // If first item is array, must be `args`
    if (Array.isArray(values[0]))
        hasArgs = true;
    // Check if first item is `args` or `options`
    else if (values.length === 1) {
        // if event has indexed inputs, must have `args`
        hasArgs = abiEvent.inputs.some((x) => x.indexed);
        // If there are two items in array, must have `args`
    }
    else if (values.length === 2) {
        hasArgs = true;
    }
    const args = hasArgs ? values[0] : undefined;
    const options = (hasArgs ? values[1] : values[0]) ?? {};
    return { args, options };
}
//# sourceMappingURL=getContract.js.map

/***/ }),

/***/ 6782:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  T1: () => (/* binding */ call)
});

// UNUSED EXPORTS: getRevertErrorData, parseAccountStateOverride, parseStateMapping, parseStateOverride

// EXTERNAL MODULE: ./node_modules/viem/_esm/accounts/utils/parseAccount.js
var parseAccount = __webpack_require__(3033);
// EXTERNAL MODULE: ./node_modules/viem/_esm/constants/abis.js
var abis = __webpack_require__(4823);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/constants/contract.js
const aggregate3Signature = '0x82ad56cb';
//# sourceMappingURL=contract.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/address.js
var errors_address = __webpack_require__(4306);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/base.js
var base = __webpack_require__(6329);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/chain.js
var chain = __webpack_require__(8703);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/contract.js + 1 modules
var contract = __webpack_require__(8863);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/data.js
var data = __webpack_require__(6440);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/stateOverride.js
var stateOverride = __webpack_require__(6883);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/decodeFunctionResult.js
var decodeFunctionResult = __webpack_require__(6652);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/encodeFunctionData.js + 1 modules
var encodeFunctionData = __webpack_require__(8503);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/address/isAddress.js + 1 modules
var isAddress = __webpack_require__(1657);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/chain/getChainContractAddress.js
var getChainContractAddress = __webpack_require__(9985);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toHex.js
var toHex = __webpack_require__(4192);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/node.js
var node = __webpack_require__(2592);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/errors/getNodeError.js
var getNodeError = __webpack_require__(1772);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/errors/getCallError.js



function getCallError(err, { docsPath, ...args }) {
    const cause = (() => {
        const cause = (0,getNodeError/* getNodeError */.l)(err, args);
        if (cause instanceof node/* UnknownNodeError */.RM)
            return err;
        return cause;
    })();
    return new contract/* CallExecutionError */.zX(cause, {
        docsPath,
        ...args,
    });
}
//# sourceMappingURL=getCallError.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/formatters/extract.js
var extract = __webpack_require__(9789);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/formatters/transactionRequest.js
var transactionRequest = __webpack_require__(7671);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/promise/createBatchScheduler.js
var createBatchScheduler = __webpack_require__(2167);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/transaction/assertRequest.js
var assertRequest = __webpack_require__(5414);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/call.js



















/**
 * Executes a new message call immediately without submitting a transaction to the network.
 *
 * - Docs: https://viem.sh/docs/actions/public/call
 * - JSON-RPC Methods: [`eth_call`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call)
 *
 * @param client - Client to use
 * @param parameters - {@link CallParameters}
 * @returns The call data. {@link CallReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { call } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const data = await call(client, {
 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 *   data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 * })
 */
async function call(client, args) {
    const { account: account_ = client.account, batch = Boolean(client.batch?.multicall), blockNumber, blockTag = 'latest', accessList, blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride, ...rest } = args;
    const account = account_ ? (0,parseAccount/* parseAccount */.J)(account_) : undefined;
    try {
        (0,assertRequest/* assertRequest */.c)(args);
        const blockNumberHex = blockNumber ? (0,toHex/* numberToHex */.cK)(blockNumber) : undefined;
        const block = blockNumberHex || blockTag;
        const rpcStateOverride = parseStateOverride(stateOverride);
        const chainFormat = client.chain?.formatters?.transactionRequest?.format;
        const format = chainFormat || transactionRequest/* formatTransactionRequest */.Bv;
        const request = format({
            // Pick out extra data that might exist on the chain's transaction request type.
            ...(0,extract/* extract */.o)(rest, { format: chainFormat }),
            from: account?.address,
            accessList,
            blobs,
            data,
            gas,
            gasPrice,
            maxFeePerBlobGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            nonce,
            to,
            value,
        });
        if (batch && shouldPerformMulticall({ request }) && !rpcStateOverride) {
            try {
                return await scheduleMulticall(client, {
                    ...request,
                    blockNumber,
                    blockTag,
                });
            }
            catch (err) {
                if (!(err instanceof chain/* ClientChainNotConfiguredError */.YE) &&
                    !(err instanceof chain/* ChainDoesNotSupportContract */.rj))
                    throw err;
            }
        }
        const response = await client.request({
            method: 'eth_call',
            params: rpcStateOverride
                ? [
                    request,
                    block,
                    rpcStateOverride,
                ]
                : [request, block],
        });
        if (response === '0x')
            return { data: undefined };
        return { data: response };
    }
    catch (err) {
        const data = getRevertErrorData(err);
        const { offchainLookup, offchainLookupSignature } = await __webpack_require__.e(/* import() */ 520).then(__webpack_require__.bind(__webpack_require__, 1316));
        if (client.ccipRead !== false &&
            data?.slice(0, 10) === offchainLookupSignature &&
            to)
            return { data: await offchainLookup(client, { data, to }) };
        throw getCallError(err, {
            ...args,
            account,
            chain: client.chain,
        });
    }
}
// We only want to perform a scheduled multicall if:
// - The request has calldata,
// - The request has a target address,
// - The target address is not already the aggregate3 signature,
// - The request has no other properties (`nonce`, `gas`, etc cannot be sent with a multicall).
function shouldPerformMulticall({ request }) {
    const { data, to, ...request_ } = request;
    if (!data)
        return false;
    if (data.startsWith(aggregate3Signature))
        return false;
    if (!to)
        return false;
    if (Object.values(request_).filter((x) => typeof x !== 'undefined').length > 0)
        return false;
    return true;
}
async function scheduleMulticall(client, args) {
    const { batchSize = 1024, wait = 0 } = typeof client.batch?.multicall === 'object' ? client.batch.multicall : {};
    const { blockNumber, blockTag = 'latest', data, multicallAddress: multicallAddress_, to, } = args;
    let multicallAddress = multicallAddress_;
    if (!multicallAddress) {
        if (!client.chain)
            throw new chain/* ClientChainNotConfiguredError */.YE();
        multicallAddress = (0,getChainContractAddress/* getChainContractAddress */.M)({
            blockNumber,
            chain: client.chain,
            contract: 'multicall3',
        });
    }
    const blockNumberHex = blockNumber ? (0,toHex/* numberToHex */.cK)(blockNumber) : undefined;
    const block = blockNumberHex || blockTag;
    const { schedule } = (0,createBatchScheduler/* createBatchScheduler */.u)({
        id: `${client.uid}.${block}`,
        wait,
        shouldSplitBatch(args) {
            const size = args.reduce((size, { data }) => size + (data.length - 2), 0);
            return size > batchSize * 2;
        },
        fn: async (requests) => {
            const calls = requests.map((request) => ({
                allowFailure: true,
                callData: request.data,
                target: request.to,
            }));
            const calldata = (0,encodeFunctionData/* encodeFunctionData */.p)({
                abi: abis/* multicall3Abi */.v2,
                args: [calls],
                functionName: 'aggregate3',
            });
            const data = await client.request({
                method: 'eth_call',
                params: [
                    {
                        data: calldata,
                        to: multicallAddress,
                    },
                    block,
                ],
            });
            return (0,decodeFunctionResult/* decodeFunctionResult */.e)({
                abi: abis/* multicall3Abi */.v2,
                args: [calls],
                functionName: 'aggregate3',
                data: data || '0x',
            });
        },
    });
    const [{ returnData, success }] = await schedule({ data, to });
    if (!success)
        throw new contract/* RawContractError */.$S({ data: returnData });
    if (returnData === '0x')
        return { data: undefined };
    return { data: returnData };
}
function getRevertErrorData(err) {
    if (!(err instanceof base/* BaseError */.C))
        return undefined;
    const error = err.walk();
    return typeof error?.data === 'object' ? error.data?.data : error.data;
}
function parseStateMapping(stateMapping) {
    if (!stateMapping || stateMapping.length === 0)
        return undefined;
    return stateMapping.reduce((acc, { slot, value }) => {
        if (slot.length !== 66)
            throw new data/* InvalidBytesLengthError */.NV({
                size: slot.length,
                targetSize: 66,
                type: 'hex',
            });
        if (value.length !== 66)
            throw new data/* InvalidBytesLengthError */.NV({
                size: value.length,
                targetSize: 66,
                type: 'hex',
            });
        acc[slot] = value;
        return acc;
    }, {});
}
function parseAccountStateOverride(args) {
    const { balance, nonce, state, stateDiff, code } = args;
    const rpcAccountStateOverride = {};
    if (code !== undefined)
        rpcAccountStateOverride.code = code;
    if (balance !== undefined)
        rpcAccountStateOverride.balance = (0,toHex/* numberToHex */.cK)(balance);
    if (nonce !== undefined)
        rpcAccountStateOverride.nonce = (0,toHex/* numberToHex */.cK)(nonce);
    if (state !== undefined)
        rpcAccountStateOverride.state = parseStateMapping(state);
    if (stateDiff !== undefined) {
        if (rpcAccountStateOverride.state)
            throw new stateOverride/* StateAssignmentConflictError */.ft();
        rpcAccountStateOverride.stateDiff = parseStateMapping(stateDiff);
    }
    return rpcAccountStateOverride;
}
function parseStateOverride(args) {
    if (!args)
        return undefined;
    const rpcStateOverride = {};
    for (const { address, ...accountState } of args) {
        if (!(0,isAddress/* isAddress */.P)(address, { strict: false }))
            throw new errors_address/* InvalidAddressError */.M({ address });
        if (rpcStateOverride[address])
            throw new stateOverride/* AccountStateConflictError */.Hi({ address: address });
        rpcStateOverride[address] = parseAccountStateOverride(accountState);
    }
    return rpcStateOverride;
}
//# sourceMappingURL=call.js.map

/***/ }),

/***/ 1100:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   X: () => (/* binding */ createContractEventFilter)
/* harmony export */ });
/* harmony import */ var _utils_abi_encodeEventTopics_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5226);
/* harmony import */ var _utils_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4192);
/* harmony import */ var _utils_filters_createFilterRequestScope_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3109);



/**
 * Creates a Filter to retrieve event logs that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges) or [`getFilterLogs`](https://viem.sh/docs/actions/public/getFilterLogs).
 *
 * - Docs: https://viem.sh/docs/contract/createContractEventFilter
 *
 * @param client - Client to use
 * @param parameters - {@link CreateContractEventFilterParameters}
 * @returns [`Filter`](https://viem.sh/docs/glossary/types#filter). {@link CreateContractEventFilterReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createContractEventFilter } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createContractEventFilter(client, {
 *   abi: parseAbi(['event Transfer(address indexed, address indexed, uint256)']),
 * })
 */
async function createContractEventFilter(client, parameters) {
    const { address, abi, args, eventName, fromBlock, strict, toBlock } = parameters;
    const getRequest = (0,_utils_filters_createFilterRequestScope_js__WEBPACK_IMPORTED_MODULE_0__/* .createFilterRequestScope */ .g)(client, {
        method: 'eth_newFilter',
    });
    const topics = eventName
        ? (0,_utils_abi_encodeEventTopics_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeEventTopics */ .R)({
            abi,
            args,
            eventName,
        })
        : undefined;
    const id = await client.request({
        method: 'eth_newFilter',
        params: [
            {
                address,
                fromBlock: typeof fromBlock === 'bigint' ? (0,_utils_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_2__/* .numberToHex */ .cK)(fromBlock) : fromBlock,
                toBlock: typeof toBlock === 'bigint' ? (0,_utils_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_2__/* .numberToHex */ .cK)(toBlock) : toBlock,
                topics,
            },
        ],
    });
    return {
        abi,
        args,
        eventName,
        id,
        request: getRequest(id),
        strict: Boolean(strict),
        type: 'event',
    };
}
//# sourceMappingURL=createContractEventFilter.js.map

/***/ }),

/***/ 965:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   W: () => (/* binding */ estimateContractGas)
/* harmony export */ });
/* harmony import */ var _accounts_utils_parseAccount_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3033);
/* harmony import */ var _utils_abi_encodeFunctionData_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8503);
/* harmony import */ var _utils_errors_getContractError_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2350);
/* harmony import */ var _utils_getAction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3692);
/* harmony import */ var _estimateGas_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(432);





/**
 * Estimates the gas required to successfully execute a contract write function call.
 *
 * - Docs: https://viem.sh/docs/contract/estimateContractGas
 *
 * Internally, uses a [Public Client](https://viem.sh/docs/clients/public) to call the [`estimateGas` action](https://viem.sh/docs/actions/public/estimateGas) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateContractGasParameters}
 * @returns The gas estimate (in wei). {@link EstimateContractGasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { estimateContractGas } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const gas = await estimateContractGas(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint() public']),
 *   functionName: 'mint',
 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
 * })
 */
async function estimateContractGas(client, parameters) {
    const { abi, address, args, functionName, ...request } = parameters;
    const data = (0,_utils_abi_encodeFunctionData_js__WEBPACK_IMPORTED_MODULE_0__/* .encodeFunctionData */ .p)({
        abi,
        args,
        functionName,
    });
    try {
        const gas = await (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_1__/* .getAction */ .T)(client, _estimateGas_js__WEBPACK_IMPORTED_MODULE_2__/* .estimateGas */ .Q, 'estimateGas')({
            data,
            to: address,
            ...request,
        });
        return gas;
    }
    catch (error) {
        const account = request.account ? (0,_accounts_utils_parseAccount_js__WEBPACK_IMPORTED_MODULE_3__/* .parseAccount */ .J)(request.account) : undefined;
        throw (0,_utils_errors_getContractError_js__WEBPACK_IMPORTED_MODULE_4__/* .getContractError */ .j)(error, {
            abi,
            address,
            args,
            docsPath: '/docs/contract/estimateContractGas',
            functionName,
            sender: account?.address,
        });
    }
}
//# sourceMappingURL=estimateContractGas.js.map

/***/ }),

/***/ 1989:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   O: () => (/* binding */ internal_estimateFeesPerGas),
/* harmony export */   _: () => (/* binding */ estimateFeesPerGas)
/* harmony export */ });
/* harmony import */ var _errors_fee_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7250);
/* harmony import */ var _utils_getAction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3692);
/* harmony import */ var _estimateMaxPriorityFeePerGas_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1622);
/* harmony import */ var _getBlock_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5603);
/* harmony import */ var _getGasPrice_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(5242);





/**
 * Returns an estimate for the fees per gas (in wei) for a
 * transaction to be likely included in the next block.
 * Defaults to [`chain.fees.estimateFeesPerGas`](/docs/clients/chains#fees-estimatefeespergas) if set.
 *
 * - Docs: https://viem.sh/docs/actions/public/estimateFeesPerGas
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateFeesPerGasParameters}
 * @returns An estimate (in wei) for the fees per gas. {@link EstimateFeesPerGasReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { estimateFeesPerGas } from 'viem/actions'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const maxPriorityFeePerGas = await estimateFeesPerGas(client)
 * // { maxFeePerGas: ..., maxPriorityFeePerGas: ... }
 */
async function estimateFeesPerGas(client, args) {
    return internal_estimateFeesPerGas(client, args);
}
async function internal_estimateFeesPerGas(client, args) {
    const { block: block_, chain = client.chain, request, type = 'eip1559', } = args || {};
    const baseFeeMultiplier = await (async () => {
        if (typeof chain?.fees?.baseFeeMultiplier === 'function')
            return chain.fees.baseFeeMultiplier({
                block: block_,
                client,
                request,
            });
        return chain?.fees?.baseFeeMultiplier ?? 1.2;
    })();
    if (baseFeeMultiplier < 1)
        throw new _errors_fee_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseFeeScalarError */ .sM();
    const decimals = baseFeeMultiplier.toString().split('.')[1]?.length ?? 0;
    const denominator = 10 ** decimals;
    const multiply = (base) => (base * BigInt(Math.ceil(baseFeeMultiplier * denominator))) /
        BigInt(denominator);
    const block = block_
        ? block_
        : await (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_1__/* .getAction */ .T)(client, _getBlock_js__WEBPACK_IMPORTED_MODULE_2__/* .getBlock */ .g, 'getBlock')({});
    if (typeof chain?.fees?.estimateFeesPerGas === 'function') {
        const fees = (await chain.fees.estimateFeesPerGas({
            block: block_,
            client,
            multiply,
            request,
            type,
        }));
        if (fees !== null)
            return fees;
    }
    if (type === 'eip1559') {
        if (typeof block.baseFeePerGas !== 'bigint')
            throw new _errors_fee_js__WEBPACK_IMPORTED_MODULE_0__/* .Eip1559FeesNotSupportedError */ .pw();
        const maxPriorityFeePerGas = typeof request?.maxPriorityFeePerGas === 'bigint'
            ? request.maxPriorityFeePerGas
            : await (0,_estimateMaxPriorityFeePerGas_js__WEBPACK_IMPORTED_MODULE_3__/* .internal_estimateMaxPriorityFeePerGas */ .N)(client, {
                block: block,
                chain,
                request,
            });
        const baseFeePerGas = multiply(block.baseFeePerGas);
        const maxFeePerGas = request?.maxFeePerGas ?? baseFeePerGas + maxPriorityFeePerGas;
        return {
            maxFeePerGas,
            maxPriorityFeePerGas,
        };
    }
    const gasPrice = request?.gasPrice ??
        multiply(await (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_1__/* .getAction */ .T)(client, _getGasPrice_js__WEBPACK_IMPORTED_MODULE_4__/* .getGasPrice */ .L, 'getGasPrice')({}));
    return {
        gasPrice,
    };
}
//# sourceMappingURL=estimateFeesPerGas.js.map

/***/ }),

/***/ 432:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Q: () => (/* binding */ estimateGas)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/accounts/utils/parseAccount.js
var parseAccount = __webpack_require__(3033);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toHex.js
var toHex = __webpack_require__(4192);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/unit/formatEther.js
var formatEther = __webpack_require__(9436);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/unit/formatGwei.js
var formatGwei = __webpack_require__(9670);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/base.js
var base = __webpack_require__(6329);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/transaction.js
var transaction = __webpack_require__(8990);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/errors/estimateGas.js




class EstimateGasExecutionError extends base/* BaseError */.C {
    constructor(cause, { account, docsPath, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, }) {
        const prettyArgs = (0,transaction/* prettyPrint */.aO)({
            from: account?.address,
            to,
            value: typeof value !== 'undefined' &&
                `${(0,formatEther/* formatEther */.c)(value)} ${chain?.nativeCurrency?.symbol || 'ETH'}`,
            data,
            gas,
            gasPrice: typeof gasPrice !== 'undefined' && `${(0,formatGwei/* formatGwei */.Q)(gasPrice)} gwei`,
            maxFeePerGas: typeof maxFeePerGas !== 'undefined' &&
                `${(0,formatGwei/* formatGwei */.Q)(maxFeePerGas)} gwei`,
            maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== 'undefined' &&
                `${(0,formatGwei/* formatGwei */.Q)(maxPriorityFeePerGas)} gwei`,
            nonce,
        });
        super(cause.shortMessage, {
            cause,
            docsPath,
            metaMessages: [
                ...(cause.metaMessages ? [...cause.metaMessages, ' '] : []),
                'Estimate Gas Arguments:',
                prettyArgs,
            ].filter(Boolean),
        });
        Object.defineProperty(this, "cause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'EstimateGasExecutionError'
        });
        this.cause = cause;
    }
}
//# sourceMappingURL=estimateGas.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/node.js
var node = __webpack_require__(2592);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/errors/getNodeError.js
var getNodeError = __webpack_require__(1772);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/errors/getEstimateGasError.js



function getEstimateGasError(err, { docsPath, ...args }) {
    const cause = (() => {
        const cause = (0,getNodeError/* getNodeError */.l)(err, args);
        if (cause instanceof node/* UnknownNodeError */.RM)
            return err;
        return cause;
    })();
    return new EstimateGasExecutionError(cause, {
        docsPath,
        ...args,
    });
}
//# sourceMappingURL=getEstimateGasError.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/formatters/extract.js
var extract = __webpack_require__(9789);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/formatters/transactionRequest.js
var transactionRequest = __webpack_require__(7671);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/transaction/assertRequest.js
var assertRequest = __webpack_require__(5414);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js + 13 modules
var prepareTransactionRequest = __webpack_require__(1093);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/estimateGas.js







/**
 * Estimates the gas necessary to complete a transaction without submitting it to the network.
 *
 * - Docs: https://viem.sh/docs/actions/public/estimateGas
 * - JSON-RPC Methods: [`eth_estimateGas`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas)
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateGasParameters}
 * @returns The gas estimate (in wei). {@link EstimateGasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { estimateGas } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const gasEstimate = await estimateGas(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: parseEther('1'),
 * })
 */
async function estimateGas(client, args) {
    const account_ = args.account ?? client.account;
    const account = account_ ? (0,parseAccount/* parseAccount */.J)(account_) : undefined;
    try {
        const { accessList, blobs, blobVersionedHashes, blockNumber, blockTag, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, ...rest } = (await (0,prepareTransactionRequest/* prepareTransactionRequest */.f)(client, {
            ...args,
            parameters: 
            // Some RPC Providers do not compute versioned hashes from blobs. We will need
            // to compute them.
            account?.type === 'local' ? undefined : ['blobVersionedHashes'],
        }));
        const blockNumberHex = blockNumber ? (0,toHex/* numberToHex */.cK)(blockNumber) : undefined;
        const block = blockNumberHex || blockTag;
        (0,assertRequest/* assertRequest */.c)(args);
        const chainFormat = client.chain?.formatters?.transactionRequest?.format;
        const format = chainFormat || transactionRequest/* formatTransactionRequest */.Bv;
        const request = format({
            // Pick out extra data that might exist on the chain's transaction request type.
            ...(0,extract/* extract */.o)(rest, { format: chainFormat }),
            from: account?.address,
            accessList,
            blobs,
            blobVersionedHashes,
            data,
            gas,
            gasPrice,
            maxFeePerBlobGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            nonce,
            to,
            value,
        });
        const balance = await client.request({
            method: 'eth_estimateGas',
            params: block ? [request, block] : [request],
        });
        return BigInt(balance);
    }
    catch (err) {
        throw getEstimateGasError(err, {
            ...args,
            account,
            chain: client.chain,
        });
    }
}
//# sourceMappingURL=estimateGas.js.map

/***/ }),

/***/ 1622:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   N: () => (/* binding */ internal_estimateMaxPriorityFeePerGas),
/* harmony export */   b: () => (/* binding */ estimateMaxPriorityFeePerGas)
/* harmony export */ });
/* harmony import */ var _errors_fee_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7250);
/* harmony import */ var _utils_encoding_fromHex_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6675);
/* harmony import */ var _utils_getAction_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3692);
/* harmony import */ var _getBlock_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5603);
/* harmony import */ var _getGasPrice_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5242);





/**
 * Returns an estimate for the max priority fee per gas (in wei) for a
 * transaction to be likely included in the next block.
 * Defaults to [`chain.fees.defaultPriorityFee`](/docs/clients/chains#fees-defaultpriorityfee) if set.
 *
 * - Docs: https://viem.sh/docs/actions/public/estimateMaxPriorityFeePerGas
 *
 * @param client - Client to use
 * @returns An estimate (in wei) for the max priority fee per gas. {@link EstimateMaxPriorityFeePerGasReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { estimateMaxPriorityFeePerGas } from 'viem/actions'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const maxPriorityFeePerGas = await estimateMaxPriorityFeePerGas(client)
 * // 10000000n
 */
async function estimateMaxPriorityFeePerGas(client, args) {
    return internal_estimateMaxPriorityFeePerGas(client, args);
}
async function internal_estimateMaxPriorityFeePerGas(client, args) {
    const { block: block_, chain = client.chain, request } = args || {};
    if (typeof chain?.fees?.defaultPriorityFee === 'function') {
        const block = block_ || (await (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_0__/* .getAction */ .T)(client, _getBlock_js__WEBPACK_IMPORTED_MODULE_1__/* .getBlock */ .g, 'getBlock')({}));
        return chain.fees.defaultPriorityFee({
            block,
            client,
            request,
        });
    }
    if (typeof chain?.fees?.defaultPriorityFee !== 'undefined')
        return chain?.fees?.defaultPriorityFee;
    try {
        const maxPriorityFeePerGasHex = await client.request({
            method: 'eth_maxPriorityFeePerGas',
        });
        return (0,_utils_encoding_fromHex_js__WEBPACK_IMPORTED_MODULE_2__/* .hexToBigInt */ .uU)(maxPriorityFeePerGasHex);
    }
    catch {
        // If the RPC Provider does not support `eth_maxPriorityFeePerGas`
        // fall back to calculating it manually via `gasPrice - baseFeePerGas`.
        // See: https://github.com/ethereum/pm/issues/328#:~:text=eth_maxPriorityFeePerGas%20after%20London%20will%20effectively%20return%20eth_gasPrice%20%2D%20baseFee
        const [block, gasPrice] = await Promise.all([
            block_
                ? Promise.resolve(block_)
                : (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_0__/* .getAction */ .T)(client, _getBlock_js__WEBPACK_IMPORTED_MODULE_1__/* .getBlock */ .g, 'getBlock')({}),
            (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_0__/* .getAction */ .T)(client, _getGasPrice_js__WEBPACK_IMPORTED_MODULE_3__/* .getGasPrice */ .L, 'getGasPrice')({}),
        ]);
        if (typeof block.baseFeePerGas !== 'bigint')
            throw new _errors_fee_js__WEBPACK_IMPORTED_MODULE_4__/* .Eip1559FeesNotSupportedError */ .pw();
        const maxPriorityFeePerGas = gasPrice - block.baseFeePerGas;
        if (maxPriorityFeePerGas < 0n)
            return 0n;
        return maxPriorityFeePerGas;
    }
}
//# sourceMappingURL=estimateMaxPriorityFeePerGas.js.map

/***/ }),

/***/ 5603:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   g: () => (/* binding */ getBlock)
/* harmony export */ });
/* harmony import */ var _errors_block_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4259);
/* harmony import */ var _utils_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4192);
/* harmony import */ var _utils_formatters_block_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5385);



/**
 * Returns information about a block at a block number, hash, or tag.
 *
 * - Docs: https://viem.sh/docs/actions/public/getBlock
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks/fetching-blocks
 * - JSON-RPC Methods:
 *   - Calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber) for `blockNumber` & `blockTag`.
 *   - Calls [`eth_getBlockByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbyhash) for `blockHash`.
 *
 * @param client - Client to use
 * @param parameters - {@link GetBlockParameters}
 * @returns Information about the block. {@link GetBlockReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getBlock } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const block = await getBlock(client)
 */
async function getBlock(client, { blockHash, blockNumber, blockTag: blockTag_, includeTransactions: includeTransactions_, } = {}) {
    const blockTag = blockTag_ ?? 'latest';
    const includeTransactions = includeTransactions_ ?? false;
    const blockNumberHex = blockNumber !== undefined ? (0,_utils_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__/* .numberToHex */ .cK)(blockNumber) : undefined;
    let block = null;
    if (blockHash) {
        block = await client.request({
            method: 'eth_getBlockByHash',
            params: [blockHash, includeTransactions],
        });
    }
    else {
        block = await client.request({
            method: 'eth_getBlockByNumber',
            params: [blockNumberHex || blockTag, includeTransactions],
        });
    }
    if (!block)
        throw new _errors_block_js__WEBPACK_IMPORTED_MODULE_1__/* .BlockNotFoundError */ .l({ blockHash, blockNumber });
    const format = client.chain?.formatters?.block?.format || _utils_formatters_block_js__WEBPACK_IMPORTED_MODULE_2__/* .formatBlock */ .$;
    return format(block);
}
//# sourceMappingURL=getBlock.js.map

/***/ }),

/***/ 5639:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  G: () => (/* binding */ getBlockNumber)
});

// UNUSED EXPORTS: getBlockNumberCache

;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/promise/withCache.js
const promiseCache = /*#__PURE__*/ new Map();
const responseCache = /*#__PURE__*/ new Map();
function withCache_getCache(cacheKey) {
    const buildCache = (cacheKey, cache) => ({
        clear: () => cache.delete(cacheKey),
        get: () => cache.get(cacheKey),
        set: (data) => cache.set(cacheKey, data),
    });
    const promise = buildCache(cacheKey, promiseCache);
    const response = buildCache(cacheKey, responseCache);
    return {
        clear: () => {
            promise.clear();
            response.clear();
        },
        promise,
        response,
    };
}
/**
 * @description Returns the result of a given promise, and caches the result for
 * subsequent invocations against a provided cache key.
 */
async function withCache(fn, { cacheKey, cacheTime = Infinity }) {
    const cache = withCache_getCache(cacheKey);
    // If a response exists in the cache, and it's not expired, return it
    // and do not invoke the promise.
    // If the max age is 0, the cache is disabled.
    const response = cache.response.get();
    if (response && cacheTime > 0) {
        const age = new Date().getTime() - response.created.getTime();
        if (age < cacheTime)
            return response.data;
    }
    let promise = cache.promise.get();
    if (!promise) {
        promise = fn();
        // Store the promise in the cache so that subsequent invocations
        // will wait for the same promise to resolve (deduping).
        cache.promise.set(promise);
    }
    try {
        const data = await promise;
        // Store the response in the cache so that subsequent invocations
        // will return the same response.
        cache.response.set({ created: new Date(), data });
        return data;
    }
    finally {
        // Clear the promise cache so that subsequent invocations will
        // invoke the promise again.
        cache.promise.clear();
    }
}
//# sourceMappingURL=withCache.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/getBlockNumber.js

const cacheKey = (id) => `blockNumber.${id}`;
function getBlockNumberCache(id) {
    return getCache(cacheKey(id));
}
/**
 * Returns the number of the most recent block seen.
 *
 * - Docs: https://viem.sh/docs/actions/public/getBlockNumber
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks/fetching-blocks
 * - JSON-RPC Methods: [`eth_blockNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber)
 *
 * @param client - Client to use
 * @param parameters - {@link GetBlockNumberParameters}
 * @returns The number of the block. {@link GetBlockNumberReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getBlockNumber } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const blockNumber = await getBlockNumber(client)
 * // 69420n
 */
async function getBlockNumber(client, { cacheTime = client.cacheTime } = {}) {
    const blockNumberHex = await withCache(() => client.request({
        method: 'eth_blockNumber',
    }), { cacheKey: cacheKey(client.uid), cacheTime });
    return BigInt(blockNumberHex);
}
//# sourceMappingURL=getBlockNumber.js.map

/***/ }),

/***/ 9798:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   T: () => (/* binding */ getChainId)
/* harmony export */ });
/* harmony import */ var _utils_encoding_fromHex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6675);

/**
 * Returns the chain ID associated with the current network.
 *
 * - Docs: https://viem.sh/docs/actions/public/getChainId
 * - JSON-RPC Methods: [`eth_chainId`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_chainid)
 *
 * @param client - Client to use
 * @returns The current chain ID. {@link GetChainIdReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getChainId } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const chainId = await getChainId(client)
 * // 1
 */
async function getChainId(client) {
    const chainIdHex = await client.request({
        method: 'eth_chainId',
    });
    return (0,_utils_encoding_fromHex_js__WEBPACK_IMPORTED_MODULE_0__/* .hexToNumber */ .ME)(chainIdHex);
}
//# sourceMappingURL=getChainId.js.map

/***/ }),

/***/ 1443:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   u: () => (/* binding */ getContractEvents)
/* harmony export */ });
/* harmony import */ var _utils_abi_getAbiItem_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4586);
/* harmony import */ var _utils_getAction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3692);
/* harmony import */ var _getLogs_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3295);



/**
 * Returns a list of event logs emitted by a contract.
 *
 * - Docs: https://viem.sh/docs/actions/public/getContractEvents
 * - JSON-RPC Methods: [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs)
 *
 * @param client - Client to use
 * @param parameters - {@link GetContractEventsParameters}
 * @returns A list of event logs. {@link GetContractEventsReturnType}
 *
 * @example
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getContractEvents } from 'viem/public'
 * import { wagmiAbi } from './abi'
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const logs = await getContractEvents(client, {
 *  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *  abi: wagmiAbi,
 *  eventName: 'Transfer'
 * })
 */
async function getContractEvents(client, parameters) {
    const { abi, address, args, blockHash, eventName, fromBlock, toBlock, strict, } = parameters;
    const event = eventName
        ? (0,_utils_abi_getAbiItem_js__WEBPACK_IMPORTED_MODULE_0__/* .getAbiItem */ .iY)({ abi, name: eventName })
        : undefined;
    const events = !event
        ? abi.filter((x) => x.type === 'event')
        : undefined;
    return (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_1__/* .getAction */ .T)(client, _getLogs_js__WEBPACK_IMPORTED_MODULE_2__/* .getLogs */ .a, 'getLogs')({
        address,
        args,
        blockHash,
        event,
        events,
        fromBlock,
        toBlock,
        strict,
    });
}
//# sourceMappingURL=getContractEvents.js.map

/***/ }),

/***/ 3373:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   I: () => (/* binding */ getFilterChanges)
/* harmony export */ });
/* harmony import */ var _utils_abi_parseEventLogs_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8937);
/* harmony import */ var _utils_formatters_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7070);



/**
 * Returns a list of logs or hashes based on a [Filter](/docs/glossary/terms#filter) since the last time it was called.
 *
 * - Docs: https://viem.sh/docs/actions/public/getFilterChanges
 * - JSON-RPC Methods: [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterchanges)
 *
 * A Filter can be created from the following actions:
 *
 * - [`createBlockFilter`](https://viem.sh/docs/actions/public/createBlockFilter)
 * - [`createContractEventFilter`](https://viem.sh/docs/contract/createContractEventFilter)
 * - [`createEventFilter`](https://viem.sh/docs/actions/public/createEventFilter)
 * - [`createPendingTransactionFilter`](https://viem.sh/docs/actions/public/createPendingTransactionFilter)
 *
 * Depending on the type of filter, the return value will be different:
 *
 * - If the filter was created with `createContractEventFilter` or `createEventFilter`, it returns a list of logs.
 * - If the filter was created with `createPendingTransactionFilter`, it returns a list of transaction hashes.
 * - If the filter was created with `createBlockFilter`, it returns a list of block hashes.
 *
 * @param client - Client to use
 * @param parameters - {@link GetFilterChangesParameters}
 * @returns Logs or hashes. {@link GetFilterChangesReturnType}
 *
 * @example
 * // Blocks
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createBlockFilter, getFilterChanges } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createBlockFilter(client)
 * const hashes = await getFilterChanges(client, { filter })
 *
 * @example
 * // Contract Events
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createContractEventFilter, getFilterChanges } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createContractEventFilter(client, {
 *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
 *   abi: parseAbi(['event Transfer(address indexed, address indexed, uint256)']),
 *   eventName: 'Transfer',
 * })
 * const logs = await getFilterChanges(client, { filter })
 *
 * @example
 * // Raw Events
 * import { createPublicClient, http, parseAbiItem } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createEventFilter, getFilterChanges } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createEventFilter(client, {
 *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
 *   event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
 * })
 * const logs = await getFilterChanges(client, { filter })
 *
 * @example
 * // Transactions
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createPendingTransactionFilter, getFilterChanges } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createPendingTransactionFilter(client)
 * const hashes = await getFilterChanges(client, { filter })
 */
async function getFilterChanges(_client, { filter, }) {
    const strict = 'strict' in filter && filter.strict;
    const logs = await filter.request({
        method: 'eth_getFilterChanges',
        params: [filter.id],
    });
    if (typeof logs[0] === 'string')
        return logs;
    const formattedLogs = logs.map((log) => (0,_utils_formatters_log_js__WEBPACK_IMPORTED_MODULE_0__/* .formatLog */ .e)(log));
    if (!('abi' in filter) || !filter.abi)
        return formattedLogs;
    return (0,_utils_abi_parseEventLogs_js__WEBPACK_IMPORTED_MODULE_1__/* .parseEventLogs */ .p)({
        abi: filter.abi,
        logs: formattedLogs,
        strict,
    });
}
//# sourceMappingURL=getFilterChanges.js.map

/***/ }),

/***/ 5242:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   L: () => (/* binding */ getGasPrice)
/* harmony export */ });
/**
 * Returns the current price of gas (in wei).
 *
 * - Docs: https://viem.sh/docs/actions/public/getGasPrice
 * - JSON-RPC Methods: [`eth_gasPrice`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gasprice)
 *
 * @param client - Client to use
 * @returns The gas price (in wei). {@link GetGasPriceReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getGasPrice } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const gasPrice = await getGasPrice(client)
 */
async function getGasPrice(client) {
    const gasPrice = await client.request({
        method: 'eth_gasPrice',
    });
    return BigInt(gasPrice);
}
//# sourceMappingURL=getGasPrice.js.map

/***/ }),

/***/ 3295:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   a: () => (/* binding */ getLogs)
/* harmony export */ });
/* harmony import */ var _utils_abi_encodeEventTopics_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5226);
/* harmony import */ var _utils_abi_parseEventLogs_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8937);
/* harmony import */ var _utils_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4192);
/* harmony import */ var _utils_formatters_log_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7070);





/**
 * Returns a list of event logs matching the provided parameters.
 *
 * - Docs: https://viem.sh/docs/actions/public/getLogs
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/filters-and-logs/event-logs
 * - JSON-RPC Methods: [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs)
 *
 * @param client - Client to use
 * @param parameters - {@link GetLogsParameters}
 * @returns A list of event logs. {@link GetLogsReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbiItem } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getLogs } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const logs = await getLogs(client)
 */
async function getLogs(client, { address, blockHash, fromBlock, toBlock, event, events: events_, args, strict: strict_, } = {}) {
    const strict = strict_ ?? false;
    const events = events_ ?? (event ? [event] : undefined);
    let topics = [];
    if (events) {
        topics = [
            events.flatMap((event) => (0,_utils_abi_encodeEventTopics_js__WEBPACK_IMPORTED_MODULE_0__/* .encodeEventTopics */ .R)({
                abi: [event],
                eventName: event.name,
                args,
            })),
        ];
        if (event)
            topics = topics[0];
    }
    let logs;
    if (blockHash) {
        logs = await client.request({
            method: 'eth_getLogs',
            params: [{ address, topics, blockHash }],
        });
    }
    else {
        logs = await client.request({
            method: 'eth_getLogs',
            params: [
                {
                    address,
                    topics,
                    fromBlock: typeof fromBlock === 'bigint' ? (0,_utils_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_1__/* .numberToHex */ .cK)(fromBlock) : fromBlock,
                    toBlock: typeof toBlock === 'bigint' ? (0,_utils_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_1__/* .numberToHex */ .cK)(toBlock) : toBlock,
                },
            ],
        });
    }
    const formattedLogs = logs.map((log) => (0,_utils_formatters_log_js__WEBPACK_IMPORTED_MODULE_2__/* .formatLog */ .e)(log));
    if (!events)
        return formattedLogs;
    return (0,_utils_abi_parseEventLogs_js__WEBPACK_IMPORTED_MODULE_3__/* .parseEventLogs */ .p)({
        abi: events,
        logs: formattedLogs,
        strict,
    });
}
//# sourceMappingURL=getLogs.js.map

/***/ }),

/***/ 7755:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   y: () => (/* binding */ getTransactionCount)
/* harmony export */ });
/* harmony import */ var _utils_encoding_fromHex_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6675);
/* harmony import */ var _utils_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4192);


/**
 * Returns the number of [Transactions](https://viem.sh/docs/glossary/terms#transaction) an Account has broadcast / sent.
 *
 * - Docs: https://viem.sh/docs/actions/public/getTransactionCount
 * - JSON-RPC Methods: [`eth_getTransactionCount`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount)
 *
 * @param client - Client to use
 * @param parameters - {@link GetTransactionCountParameters}
 * @returns The number of transactions an account has sent. {@link GetTransactionCountReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getTransactionCount } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const transactionCount = await getTransactionCount(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 */
async function getTransactionCount(client, { address, blockTag = 'latest', blockNumber }) {
    const count = await client.request({
        method: 'eth_getTransactionCount',
        params: [address, blockNumber ? (0,_utils_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__/* .numberToHex */ .cK)(blockNumber) : blockTag],
    });
    return (0,_utils_encoding_fromHex_js__WEBPACK_IMPORTED_MODULE_1__/* .hexToNumber */ .ME)(count);
}
//# sourceMappingURL=getTransactionCount.js.map

/***/ }),

/***/ 6724:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   J: () => (/* binding */ readContract)
/* harmony export */ });
/* harmony import */ var _utils_abi_decodeFunctionResult_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6652);
/* harmony import */ var _utils_abi_encodeFunctionData_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8503);
/* harmony import */ var _utils_errors_getContractError_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2350);
/* harmony import */ var _utils_getAction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3692);
/* harmony import */ var _call_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6782);





/**
 * Calls a read-only function on a contract, and returns the response.
 *
 * - Docs: https://viem.sh/docs/contract/readContract
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts/reading-contracts
 *
 * A "read-only" function (constant function) on a Solidity contract is denoted by a `view` or `pure` keyword. They can only read the state of the contract, and cannot make any changes to it. Since read-only methods do not change the state of the contract, they do not require any gas to be executed, and can be called by any user without the need to pay for gas.
 *
 * Internally, uses a [Public Client](https://viem.sh/docs/clients/public) to call the [`call` action](https://viem.sh/docs/actions/public/call) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
 *
 * @param client - Client to use
 * @param parameters - {@link ReadContractParameters}
 * @returns The response from the contract. Type is inferred. {@link ReadContractReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { readContract } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const result = await readContract(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
 *   functionName: 'balanceOf',
 *   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
 * })
 * // 424122n
 */
async function readContract(client, parameters) {
    const { abi, address, args, functionName, ...rest } = parameters;
    const calldata = (0,_utils_abi_encodeFunctionData_js__WEBPACK_IMPORTED_MODULE_0__/* .encodeFunctionData */ .p)({
        abi,
        args,
        functionName,
    });
    try {
        const { data } = await (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_1__/* .getAction */ .T)(client, _call_js__WEBPACK_IMPORTED_MODULE_2__/* .call */ .T1, 'call')({
            ...rest,
            data: calldata,
            to: address,
        });
        return (0,_utils_abi_decodeFunctionResult_js__WEBPACK_IMPORTED_MODULE_3__/* .decodeFunctionResult */ .e)({
            abi,
            args,
            functionName,
            data: data || '0x',
        });
    }
    catch (error) {
        throw (0,_utils_errors_getContractError_js__WEBPACK_IMPORTED_MODULE_4__/* .getContractError */ .j)(error, {
            abi,
            address,
            args,
            docsPath: '/docs/contract/readContract',
            functionName,
        });
    }
}
//# sourceMappingURL=readContract.js.map

/***/ }),

/***/ 8318:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   v: () => (/* binding */ simulateContract)
/* harmony export */ });
/* harmony import */ var _accounts_utils_parseAccount_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3033);
/* harmony import */ var _utils_abi_decodeFunctionResult_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6652);
/* harmony import */ var _utils_abi_encodeFunctionData_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8503);
/* harmony import */ var _utils_errors_getContractError_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2350);
/* harmony import */ var _utils_getAction_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3692);
/* harmony import */ var _call_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6782);






/**
 * Simulates/validates a contract interaction. This is useful for retrieving **return data** and **revert reasons** of contract write functions.
 *
 * - Docs: https://viem.sh/docs/contract/simulateContract
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts/writing-to-contracts
 *
 * This function does not require gas to execute and _**does not**_ change the state of the blockchain. It is almost identical to [`readContract`](https://viem.sh/docs/contract/readContract), but also supports contract write functions.
 *
 * Internally, uses a [Public Client](https://viem.sh/docs/clients/public) to call the [`call` action](https://viem.sh/docs/actions/public/call) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
 *
 * @param client - Client to use
 * @param parameters - {@link SimulateContractParameters}
 * @returns The simulation result and write request. {@link SimulateContractReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { simulateContract } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const result = await simulateContract(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint(uint32) view returns (uint32)']),
 *   functionName: 'mint',
 *   args: ['69420'],
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 */
async function simulateContract(client, parameters) {
    const { abi, address, args, dataSuffix, functionName, ...callRequest } = parameters;
    const account = callRequest.account
        ? (0,_accounts_utils_parseAccount_js__WEBPACK_IMPORTED_MODULE_0__/* .parseAccount */ .J)(callRequest.account)
        : client.account;
    const calldata = (0,_utils_abi_encodeFunctionData_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeFunctionData */ .p)({ abi, args, functionName });
    try {
        const { data } = await (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_2__/* .getAction */ .T)(client, _call_js__WEBPACK_IMPORTED_MODULE_3__/* .call */ .T1, 'call')({
            batch: false,
            data: `${calldata}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
            to: address,
            ...callRequest,
            account,
        });
        const result = (0,_utils_abi_decodeFunctionResult_js__WEBPACK_IMPORTED_MODULE_4__/* .decodeFunctionResult */ .e)({
            abi,
            args,
            functionName,
            data: data || '0x',
        });
        const minimizedAbi = abi.filter((abiItem) => 'name' in abiItem && abiItem.name === parameters.functionName);
        return {
            result,
            request: {
                abi: minimizedAbi,
                address,
                args,
                dataSuffix,
                functionName,
                ...callRequest,
                account,
            },
        };
    }
    catch (error) {
        throw (0,_utils_errors_getContractError_js__WEBPACK_IMPORTED_MODULE_5__/* .getContractError */ .j)(error, {
            abi,
            address,
            args,
            docsPath: '/docs/contract/simulateContract',
            functionName,
            sender: account?.address,
        });
    }
}
//# sourceMappingURL=simulateContract.js.map

/***/ }),

/***/ 5980:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (/* binding */ uninstallFilter)
/* harmony export */ });
/**
 * Destroys a [`Filter`](https://viem.sh/docs/glossary/types#filter).
 *
 * - Docs: https://viem.sh/docs/actions/public/uninstallFilter
 * - JSON-RPC Methods: [`eth_uninstallFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_uninstallFilter)
 *
 * Destroys a Filter that was created from one of the following Actions:
 * - [`createBlockFilter`](https://viem.sh/docs/actions/public/createBlockFilter)
 * - [`createEventFilter`](https://viem.sh/docs/actions/public/createEventFilter)
 * - [`createPendingTransactionFilter`](https://viem.sh/docs/actions/public/createPendingTransactionFilter)
 *
 * @param client - Client to use
 * @param parameters - {@link UninstallFilterParameters}
 * @returns A boolean indicating if the Filter was successfully uninstalled. {@link UninstallFilterReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createPendingTransactionFilter, uninstallFilter } from 'viem/public'
 *
 * const filter = await createPendingTransactionFilter(client)
 * const uninstalled = await uninstallFilter(client, { filter })
 * // true
 */
async function uninstallFilter(_client, { filter }) {
    return filter.request({
        method: 'eth_uninstallFilter',
        params: [filter.id],
    });
}
//# sourceMappingURL=uninstallFilter.js.map

/***/ }),

/***/ 301:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   q: () => (/* binding */ watchContractEvent)
/* harmony export */ });
/* harmony import */ var _errors_abi_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(7372);
/* harmony import */ var _errors_rpc_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(7513);
/* harmony import */ var _utils_abi_decodeEventLog_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(9483);
/* harmony import */ var _utils_abi_encodeEventTopics_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(5226);
/* harmony import */ var _utils_formatters_log_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(7070);
/* harmony import */ var _utils_getAction_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3692);
/* harmony import */ var _utils_observe_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9726);
/* harmony import */ var _utils_poll_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5213);
/* harmony import */ var _utils_stringify_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8463);
/* harmony import */ var _createContractEventFilter_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1100);
/* harmony import */ var _getBlockNumber_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(5639);
/* harmony import */ var _getContractEvents_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(1443);
/* harmony import */ var _getFilterChanges_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(3373);
/* harmony import */ var _uninstallFilter_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(5980);














/**
 * Watches and returns emitted contract event logs.
 *
 * - Docs: https://viem.sh/docs/contract/watchContractEvent
 *
 * This Action will batch up all the event logs found within the [`pollingInterval`](https://viem.sh/docs/contract/watchContractEvent#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/contract/watchContractEvent#onLogs).
 *
 * `watchContractEvent` will attempt to create an [Event Filter](https://viem.sh/docs/contract/createContractEventFilter) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchContractEvent` will fall back to using [`getLogs`](https://viem.sh/docs/actions/public/getLogs) instead.
 *
 * @param client - Client to use
 * @param parameters - {@link WatchContractEventParameters}
 * @returns A function that can be invoked to stop watching for new event logs. {@link WatchContractEventReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { watchContractEvent } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const unwatch = watchContractEvent(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)']),
 *   eventName: 'Transfer',
 *   args: { from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b' },
 *   onLogs: (logs) => console.log(logs),
 * })
 */
function watchContractEvent(client, parameters) {
    const { abi, address, args, batch = true, eventName, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_, } = parameters;
    const enablePolling = typeof poll_ !== 'undefined'
        ? poll_
        : client.transport.type !== 'webSocket' || typeof fromBlock === 'number';
    const pollContractEvent = () => {
        const strict = strict_ ?? false;
        const observerId = (0,_utils_stringify_js__WEBPACK_IMPORTED_MODULE_0__/* .stringify */ .A)([
            'watchContractEvent',
            address,
            args,
            batch,
            client.uid,
            eventName,
            pollingInterval,
            strict,
            fromBlock,
        ]);
        return (0,_utils_observe_js__WEBPACK_IMPORTED_MODULE_1__/* .observe */ .lB)(observerId, { onLogs, onError }, (emit) => {
            let previousBlockNumber;
            if (fromBlock !== undefined)
                previousBlockNumber = fromBlock - 1n;
            let filter;
            let initialized = false;
            const unwatch = (0,_utils_poll_js__WEBPACK_IMPORTED_MODULE_2__/* .poll */ .w)(async () => {
                if (!initialized) {
                    try {
                        filter = (await (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_3__/* .getAction */ .T)(client, _createContractEventFilter_js__WEBPACK_IMPORTED_MODULE_4__/* .createContractEventFilter */ .X, 'createContractEventFilter')({
                            abi,
                            address,
                            args: args,
                            eventName: eventName,
                            strict: strict,
                            fromBlock,
                        }));
                    }
                    catch { }
                    initialized = true;
                    return;
                }
                try {
                    let logs;
                    if (filter) {
                        logs = await (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_3__/* .getAction */ .T)(client, _getFilterChanges_js__WEBPACK_IMPORTED_MODULE_5__/* .getFilterChanges */ .I, 'getFilterChanges')({ filter });
                    }
                    else {
                        // If the filter doesn't exist, we will fall back to use `getLogs`.
                        // The fall back exists because some RPC Providers do not support filters.
                        // Fetch the block number to use for `getLogs`.
                        const blockNumber = await (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_3__/* .getAction */ .T)(client, _getBlockNumber_js__WEBPACK_IMPORTED_MODULE_6__/* .getBlockNumber */ .G, 'getBlockNumber')({});
                        // If the block number has changed, we will need to fetch the logs.
                        // If the block number doesn't exist, we are yet to reach the first poll interval,
                        // so do not emit any logs.
                        if (previousBlockNumber && previousBlockNumber !== blockNumber) {
                            logs = await (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_3__/* .getAction */ .T)(client, _getContractEvents_js__WEBPACK_IMPORTED_MODULE_7__/* .getContractEvents */ .u, 'getContractEvents')({
                                abi,
                                address,
                                args,
                                eventName,
                                fromBlock: previousBlockNumber + 1n,
                                toBlock: blockNumber,
                                strict,
                            });
                        }
                        else {
                            logs = [];
                        }
                        previousBlockNumber = blockNumber;
                    }
                    if (logs.length === 0)
                        return;
                    if (batch)
                        emit.onLogs(logs);
                    else
                        for (const log of logs)
                            emit.onLogs([log]);
                }
                catch (err) {
                    // If a filter has been set and gets uninstalled, providers will throw an InvalidInput error.
                    // Reinitalize the filter when this occurs
                    if (filter && err instanceof _errors_rpc_js__WEBPACK_IMPORTED_MODULE_8__/* .InvalidInputRpcError */ .Di)
                        initialized = false;
                    emit.onError?.(err);
                }
            }, {
                emitOnBegin: true,
                interval: pollingInterval,
            });
            return async () => {
                if (filter)
                    await (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_3__/* .getAction */ .T)(client, _uninstallFilter_js__WEBPACK_IMPORTED_MODULE_9__/* .uninstallFilter */ .Z, 'uninstallFilter')({ filter });
                unwatch();
            };
        });
    };
    const subscribeContractEvent = () => {
        const strict = strict_ ?? false;
        const observerId = (0,_utils_stringify_js__WEBPACK_IMPORTED_MODULE_0__/* .stringify */ .A)([
            'watchContractEvent',
            address,
            args,
            batch,
            client.uid,
            eventName,
            pollingInterval,
            strict,
        ]);
        let active = true;
        let unsubscribe = () => (active = false);
        return (0,_utils_observe_js__WEBPACK_IMPORTED_MODULE_1__/* .observe */ .lB)(observerId, { onLogs, onError }, (emit) => {
            ;
            (async () => {
                try {
                    const topics = eventName
                        ? (0,_utils_abi_encodeEventTopics_js__WEBPACK_IMPORTED_MODULE_10__/* .encodeEventTopics */ .R)({
                            abi: abi,
                            eventName: eventName,
                            args,
                        })
                        : [];
                    const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
                        params: ['logs', { address, topics }],
                        onData(data) {
                            if (!active)
                                return;
                            const log = data.result;
                            try {
                                const { eventName, args } = (0,_utils_abi_decodeEventLog_js__WEBPACK_IMPORTED_MODULE_11__/* .decodeEventLog */ .j)({
                                    abi: abi,
                                    data: log.data,
                                    topics: log.topics,
                                    strict: strict_,
                                });
                                const formatted = (0,_utils_formatters_log_js__WEBPACK_IMPORTED_MODULE_12__/* .formatLog */ .e)(log, {
                                    args,
                                    eventName: eventName,
                                });
                                emit.onLogs([formatted]);
                            }
                            catch (err) {
                                let eventName;
                                let isUnnamed;
                                if (err instanceof _errors_abi_js__WEBPACK_IMPORTED_MODULE_13__/* .DecodeLogDataMismatch */ .fo ||
                                    err instanceof _errors_abi_js__WEBPACK_IMPORTED_MODULE_13__/* .DecodeLogTopicsMismatch */ .l3) {
                                    // If strict mode is on, and log data/topics do not match event definition, skip.
                                    if (strict_)
                                        return;
                                    eventName = err.abiItem.name;
                                    isUnnamed = err.abiItem.inputs?.some((x) => !('name' in x && x.name));
                                }
                                // Set args to empty if there is an error decoding (e.g. indexed/non-indexed params mismatch).
                                const formatted = (0,_utils_formatters_log_js__WEBPACK_IMPORTED_MODULE_12__/* .formatLog */ .e)(log, {
                                    args: isUnnamed ? [] : {},
                                    eventName,
                                });
                                emit.onLogs([formatted]);
                            }
                        },
                        onError(error) {
                            emit.onError?.(error);
                        },
                    });
                    unsubscribe = unsubscribe_;
                    if (!active)
                        unsubscribe();
                }
                catch (err) {
                    onError?.(err);
                }
            })();
            return () => unsubscribe();
        });
    };
    return enablePolling ? pollContractEvent() : subscribeContractEvent();
}
//# sourceMappingURL=watchContractEvent.js.map

/***/ }),

/***/ 1093:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  M: () => (/* binding */ defaultParameters),
  f: () => (/* binding */ prepareTransactionRequest)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/accounts/utils/parseAccount.js
var parseAccount = __webpack_require__(3033);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/estimateFeesPerGas.js
var estimateFeesPerGas = __webpack_require__(1989);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/estimateGas.js + 2 modules
var estimateGas = __webpack_require__(432);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getBlock.js
var public_getBlock = __webpack_require__(5603);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getTransactionCount.js
var getTransactionCount = __webpack_require__(7755);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/fee.js
var fee = __webpack_require__(7250);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toBytes.js
var toBytes = __webpack_require__(4706);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toHex.js
var toHex = __webpack_require__(4192);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/blob/blobsToCommitments.js


/**
 * Compute commitments from a list of blobs.
 *
 * @example
 * ```ts
 * import { blobsToCommitments, toBlobs } from 'viem'
 * import { kzg } from './kzg'
 *
 * const blobs = toBlobs({ data: '0x1234' })
 * const commitments = blobsToCommitments({ blobs, kzg })
 * ```
 */
function blobsToCommitments(parameters) {
    const { kzg } = parameters;
    const to = parameters.to ?? (typeof parameters.blobs[0] === 'string' ? 'hex' : 'bytes');
    const blobs = (typeof parameters.blobs[0] === 'string'
        ? parameters.blobs.map((x) => (0,toBytes/* hexToBytes */.aT)(x))
        : parameters.blobs);
    const commitments = [];
    for (const blob of blobs)
        commitments.push(Uint8Array.from(kzg.blobToKzgCommitment(blob)));
    return (to === 'bytes'
        ? commitments
        : commitments.map((x) => (0,toHex/* bytesToHex */.My)(x)));
}
//# sourceMappingURL=blobsToCommitments.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/blob/blobsToProofs.js


/**
 * Compute the proofs for a list of blobs and their commitments.
 *
 * @example
 * ```ts
 * import {
 *   blobsToCommitments,
 *   toBlobs
 * } from 'viem'
 * import { kzg } from './kzg'
 *
 * const blobs = toBlobs({ data: '0x1234' })
 * const commitments = blobsToCommitments({ blobs, kzg })
 * const proofs = blobsToProofs({ blobs, commitments, kzg })
 * ```
 */
function blobsToProofs(parameters) {
    const { kzg } = parameters;
    const to = parameters.to ?? (typeof parameters.blobs[0] === 'string' ? 'hex' : 'bytes');
    const blobs = (typeof parameters.blobs[0] === 'string'
        ? parameters.blobs.map((x) => (0,toBytes/* hexToBytes */.aT)(x))
        : parameters.blobs);
    const commitments = (typeof parameters.commitments[0] === 'string'
        ? parameters.commitments.map((x) => (0,toBytes/* hexToBytes */.aT)(x))
        : parameters.commitments);
    const proofs = [];
    for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i];
        const commitment = commitments[i];
        proofs.push(Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment)));
    }
    return (to === 'bytes'
        ? proofs
        : proofs.map((x) => (0,toHex/* bytesToHex */.My)(x)));
}
//# sourceMappingURL=blobsToProofs.js.map
// EXTERNAL MODULE: ./node_modules/@noble/hashes/esm/_assert.js
var _assert = __webpack_require__(9190);
// EXTERNAL MODULE: ./node_modules/@noble/hashes/esm/utils.js
var utils = __webpack_require__(4976);
;// CONCATENATED MODULE: ./node_modules/@noble/hashes/esm/_sha2.js


// Polyfill for Safari 14
function setBigUint64(view, byteOffset, value, isLE) {
    if (typeof view.setBigUint64 === 'function')
        return view.setBigUint64(byteOffset, value, isLE);
    const _32n = BigInt(32);
    const _u32_max = BigInt(0xffffffff);
    const wh = Number((value >> _32n) & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE ? 4 : 0;
    const l = isLE ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
}
// Base SHA2 class (RFC 6234)
class SHA2 extends utils/* Hash */.Vw {
    constructor(blockLen, outputLen, padOffset, isLE) {
        super();
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE;
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.buffer = new Uint8Array(blockLen);
        this.view = (0,utils/* createView */.O8)(this.buffer);
    }
    update(data) {
        (0,_assert/* exists */.t2)(this);
        const { view, buffer, blockLen } = this;
        data = (0,utils/* toBytes */.ZJ)(data);
        const len = data.length;
        for (let pos = 0; pos < len;) {
            const take = Math.min(blockLen - this.pos, len - pos);
            // Fast path: we have at least one block in input, cast it to view and process
            if (take === blockLen) {
                const dataView = (0,utils/* createView */.O8)(data);
                for (; blockLen <= len - pos; pos += blockLen)
                    this.process(dataView, pos);
                continue;
            }
            buffer.set(data.subarray(pos, pos + take), this.pos);
            this.pos += take;
            pos += take;
            if (this.pos === blockLen) {
                this.process(view, 0);
                this.pos = 0;
            }
        }
        this.length += data.length;
        this.roundClean();
        return this;
    }
    digestInto(out) {
        (0,_assert/* exists */.t2)(this);
        (0,_assert/* output */.CG)(out, this);
        this.finished = true;
        // Padding
        // We can avoid allocation of buffer for padding completely if it
        // was previously not allocated here. But it won't change performance.
        const { buffer, view, blockLen, isLE } = this;
        let { pos } = this;
        // append the bit '1' to the message
        buffer[pos++] = 0b10000000;
        this.buffer.subarray(pos).fill(0);
        // we have less than padOffset left in buffer, so we cannot put length in current block, need process it and pad again
        if (this.padOffset > blockLen - pos) {
            this.process(view, 0);
            pos = 0;
        }
        // Pad until full block byte with zeros
        for (let i = pos; i < blockLen; i++)
            buffer[i] = 0;
        // Note: sha512 requires length to be 128bit integer, but length in JS will overflow before that
        // You need to write around 2 exabytes (u64_max / 8 / (1024**6)) for this to happen.
        // So we just write lowest 64 bits of that value.
        setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
        this.process(view, 0);
        const oview = (0,utils/* createView */.O8)(out);
        const len = this.outputLen;
        // NOTE: we do division by 4 later, which should be fused in single op with modulo by JIT
        if (len % 4)
            throw new Error('_sha2: outputLen should be aligned to 32bit');
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
            throw new Error('_sha2: outputLen bigger than state');
        for (let i = 0; i < outLen; i++)
            oview.setUint32(4 * i, state[i], isLE);
    }
    digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
    }
    _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer, length, finished, destroyed, pos } = this;
        to.length = length;
        to.pos = pos;
        to.finished = finished;
        to.destroyed = destroyed;
        if (length % blockLen)
            to.buffer.set(buffer);
        return to;
    }
}
//# sourceMappingURL=_sha2.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/hashes/esm/sha256.js


// SHA2-256 need to try 2^128 hashes to execute birthday attack.
// BTC network is doing 2^67 hashes/sec as per early 2023.
// Choice: a ? b : c
const Chi = (a, b, c) => (a & b) ^ (~a & c);
// Majority function, true if any two inpust is true
const Maj = (a, b, c) => (a & b) ^ (a & c) ^ (b & c);
// Round constants:
// first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311)
// prettier-ignore
const SHA256_K = /* @__PURE__ */ new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);
// Initial state (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
// prettier-ignore
const IV = /* @__PURE__ */ new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]);
// Temporary buffer, not used to store anything between runs
// Named this way because it matches specification.
const SHA256_W = /* @__PURE__ */ new Uint32Array(64);
class SHA256 extends SHA2 {
    constructor() {
        super(64, 32, 8, false);
        // We cannot use array here since array allows indexing by variable
        // which means optimizer/compiler cannot use registers.
        this.A = IV[0] | 0;
        this.B = IV[1] | 0;
        this.C = IV[2] | 0;
        this.D = IV[3] | 0;
        this.E = IV[4] | 0;
        this.F = IV[5] | 0;
        this.G = IV[6] | 0;
        this.H = IV[7] | 0;
    }
    get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [A, B, C, D, E, F, G, H];
    }
    // prettier-ignore
    set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
    }
    process(view, offset) {
        // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array
        for (let i = 0; i < 16; i++, offset += 4)
            SHA256_W[i] = view.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
            const W15 = SHA256_W[i - 15];
            const W2 = SHA256_W[i - 2];
            const s0 = (0,utils/* rotr */.Ow)(W15, 7) ^ (0,utils/* rotr */.Ow)(W15, 18) ^ (W15 >>> 3);
            const s1 = (0,utils/* rotr */.Ow)(W2, 17) ^ (0,utils/* rotr */.Ow)(W2, 19) ^ (W2 >>> 10);
            SHA256_W[i] = (s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16]) | 0;
        }
        // Compression function main loop, 64 rounds
        let { A, B, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
            const sigma1 = (0,utils/* rotr */.Ow)(E, 6) ^ (0,utils/* rotr */.Ow)(E, 11) ^ (0,utils/* rotr */.Ow)(E, 25);
            const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
            const sigma0 = (0,utils/* rotr */.Ow)(A, 2) ^ (0,utils/* rotr */.Ow)(A, 13) ^ (0,utils/* rotr */.Ow)(A, 22);
            const T2 = (sigma0 + Maj(A, B, C)) | 0;
            H = G;
            G = F;
            F = E;
            E = (D + T1) | 0;
            D = C;
            C = B;
            B = A;
            A = (T1 + T2) | 0;
        }
        // Add the compressed chunk to the current hash value
        A = (A + this.A) | 0;
        B = (B + this.B) | 0;
        C = (C + this.C) | 0;
        D = (D + this.D) | 0;
        E = (E + this.E) | 0;
        F = (F + this.F) | 0;
        G = (G + this.G) | 0;
        H = (H + this.H) | 0;
        this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
        SHA256_W.fill(0);
    }
    destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        this.buffer.fill(0);
    }
}
// Constants from https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
class SHA224 extends SHA256 {
    constructor() {
        super();
        this.A = 0xc1059ed8 | 0;
        this.B = 0x367cd507 | 0;
        this.C = 0x3070dd17 | 0;
        this.D = 0xf70e5939 | 0;
        this.E = 0xffc00b31 | 0;
        this.F = 0x68581511 | 0;
        this.G = 0x64f98fa7 | 0;
        this.H = 0xbefa4fa4 | 0;
        this.outputLen = 28;
    }
}
/**
 * SHA2-256 hash function
 * @param message - data that would be hashed
 */
const sha256 = /* @__PURE__ */ (0,utils/* wrapConstructor */.ld)(() => new SHA256());
const sha224 = /* @__PURE__ */ (/* unused pure expression or super */ null && (wrapConstructor(() => new SHA224())));
//# sourceMappingURL=sha256.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/isHex.js
var isHex = __webpack_require__(6394);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/hash/sha256.js




function sha256_sha256(value, to_) {
    const to = to_ || 'hex';
    const bytes = sha256((0,isHex/* isHex */.q)(value, { strict: false }) ? (0,toBytes/* toBytes */.ZJ)(value) : value);
    if (to === 'bytes')
        return bytes;
    return (0,toHex/* toHex */.nj)(bytes);
}
//# sourceMappingURL=sha256.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js


/**
 * Transform a commitment to it's versioned hash.
 *
 * @example
 * ```ts
 * import {
 *   blobsToCommitments,
 *   commitmentToVersionedHash,
 *   toBlobs
 * } from 'viem'
 * import { kzg } from './kzg'
 *
 * const blobs = toBlobs({ data: '0x1234' })
 * const [commitment] = blobsToCommitments({ blobs, kzg })
 * const versionedHash = commitmentToVersionedHash({ commitment })
 * ```
 */
function commitmentToVersionedHash(parameters) {
    const { commitment, version = 1 } = parameters;
    const to = parameters.to ?? (typeof commitment === 'string' ? 'hex' : 'bytes');
    const versionedHash = sha256_sha256(commitment, 'bytes');
    versionedHash.set([version], 0);
    return (to === 'bytes' ? versionedHash : (0,toHex/* bytesToHex */.My)(versionedHash));
}
//# sourceMappingURL=commitmentToVersionedHash.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/blob/commitmentsToVersionedHashes.js

/**
 * Transform a list of commitments to their versioned hashes.
 *
 * @example
 * ```ts
 * import {
 *   blobsToCommitments,
 *   commitmentsToVersionedHashes,
 *   toBlobs
 * } from 'viem'
 * import { kzg } from './kzg'
 *
 * const blobs = toBlobs({ data: '0x1234' })
 * const commitments = blobsToCommitments({ blobs, kzg })
 * const versionedHashes = commitmentsToVersionedHashes({ commitments })
 * ```
 */
function commitmentsToVersionedHashes(parameters) {
    const { commitments, version } = parameters;
    const to = parameters.to ?? (typeof commitments[0] === 'string' ? 'hex' : 'bytes');
    const hashes = [];
    for (const commitment of commitments) {
        hashes.push(commitmentToVersionedHash({
            commitment,
            to,
            version,
        }));
    }
    return hashes;
}
//# sourceMappingURL=commitmentsToVersionedHashes.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/constants/blob.js
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-4844.md#parameters
/** Blob limit per transaction. */
const blobsPerTransaction = 6;
/** The number of bytes in a BLS scalar field element. */
const bytesPerFieldElement = 32;
/** The number of field elements in a blob. */
const fieldElementsPerBlob = 4096;
/** The number of bytes in a blob. */
const bytesPerBlob = bytesPerFieldElement * fieldElementsPerBlob;
/** Blob bytes limit per transaction. */
const maxBytesPerTransaction = bytesPerBlob * blobsPerTransaction -
    // terminator byte (0x80).
    1 -
    // zero byte (0x00) appended to each field element.
    1 * fieldElementsPerBlob * blobsPerTransaction;
//# sourceMappingURL=blob.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/constants/kzg.js
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-4844.md#parameters
/** The number of bytes in a KZG commitment. */
const bytesPerCommitment = 48;
/** The number of bytes in a KZG proof. */
const bytesPerProof = 48;
const versionedHashVersionKzg = 1;
//# sourceMappingURL=kzg.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/base.js
var base = __webpack_require__(6329);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/errors/blob.js


class BlobSizeTooLargeError extends base/* BaseError */.C {
    constructor({ maxSize, size }) {
        super('Blob size is too large.', {
            metaMessages: [`Max: ${maxSize} bytes`, `Given: ${size} bytes`],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'BlobSizeTooLargeError'
        });
    }
}
class EmptyBlobError extends base/* BaseError */.C {
    constructor() {
        super('Blob data must not be empty.');
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'EmptyBlobError'
        });
    }
}
class InvalidVersionedHashSizeError extends base/* BaseError */.C {
    constructor({ hash, size, }) {
        super(`Versioned hash "${hash}" size is invalid.`, {
            metaMessages: ['Expected: 32', `Received: ${size}`],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidVersionedHashSizeError'
        });
    }
}
class InvalidVersionedHashVersionError extends base/* BaseError */.C {
    constructor({ hash, version, }) {
        super(`Versioned hash "${hash}" version is invalid.`, {
            metaMessages: [
                `Expected: ${versionedHashVersionKzg}`,
                `Received: ${version}`,
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidVersionedHashVersionError'
        });
    }
}
//# sourceMappingURL=blob.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/cursor.js
var cursor = __webpack_require__(5834);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/size.js
var size = __webpack_require__(5182);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/blob/toBlobs.js






/**
 * Transforms arbitrary data to blobs.
 *
 * @example
 * ```ts
 * import { toBlobs, stringToHex } from 'viem'
 *
 * const blobs = toBlobs({ data: stringToHex('hello world') })
 * ```
 */
function toBlobs(parameters) {
    const to = parameters.to ?? (typeof parameters.data === 'string' ? 'hex' : 'bytes');
    const data = (typeof parameters.data === 'string'
        ? (0,toBytes/* hexToBytes */.aT)(parameters.data)
        : parameters.data);
    const size_ = (0,size/* size */.E)(data);
    if (!size_)
        throw new EmptyBlobError();
    if (size_ > maxBytesPerTransaction)
        throw new BlobSizeTooLargeError({
            maxSize: maxBytesPerTransaction,
            size: size_,
        });
    const blobs = [];
    let active = true;
    let position = 0;
    while (active) {
        const blob = (0,cursor/* createCursor */.l)(new Uint8Array(bytesPerBlob));
        let size = 0;
        while (size < fieldElementsPerBlob) {
            const bytes = data.slice(position, position + (bytesPerFieldElement - 1));
            // Push a zero byte so the field element doesn't overflow the BLS modulus.
            blob.pushByte(0x00);
            // Push the current segment of data bytes.
            blob.pushBytes(bytes);
            // If we detect that the current segment of data bytes is less than 31 bytes,
            // we can stop processing and push a terminator byte to indicate the end of the blob.
            if (bytes.length < 31) {
                blob.pushByte(0x80);
                active = false;
                break;
            }
            size++;
            position += 31;
        }
        blobs.push(blob);
    }
    return (to === 'bytes'
        ? blobs.map((x) => x.bytes)
        : blobs.map((x) => (0,toHex/* bytesToHex */.My)(x.bytes)));
}
//# sourceMappingURL=toBlobs.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/blob/toBlobSidecars.js



/**
 * Transforms arbitrary data (or blobs, commitments, & proofs) into a sidecar array.
 *
 * @example
 * ```ts
 * import { toBlobSidecars, stringToHex } from 'viem'
 *
 * const sidecars = toBlobSidecars({ data: stringToHex('hello world') })
 * ```
 *
 * @example
 * ```ts
 * import {
 *   blobsToCommitments,
 *   toBlobs,
 *   blobsToProofs,
 *   toBlobSidecars,
 *   stringToHex
 * } from 'viem'
 *
 * const blobs = toBlobs({ data: stringToHex('hello world') })
 * const commitments = blobsToCommitments({ blobs, kzg })
 * const proofs = blobsToProofs({ blobs, commitments, kzg })
 *
 * const sidecars = toBlobSidecars({ blobs, commitments, proofs })
 * ```
 */
function toBlobSidecars(parameters) {
    const { data, kzg, to } = parameters;
    const blobs = parameters.blobs ?? toBlobs({ data: data, to });
    const commitments = parameters.commitments ?? blobsToCommitments({ blobs, kzg: kzg, to });
    const proofs = parameters.proofs ?? blobsToProofs({ blobs, commitments, kzg: kzg, to });
    const sidecars = [];
    for (let i = 0; i < blobs.length; i++)
        sidecars.push({
            blob: blobs[i],
            commitment: commitments[i],
            proof: proofs[i],
        });
    return sidecars;
}
//# sourceMappingURL=toBlobSidecars.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/getAction.js
var getAction = __webpack_require__(3692);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/transaction/assertRequest.js
var assertRequest = __webpack_require__(5414);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/transaction.js
var errors_transaction = __webpack_require__(8990);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/transaction/getTransactionType.js

function getTransactionType(transaction) {
    if (transaction.type)
        return transaction.type;
    if (typeof transaction.blobs !== 'undefined' ||
        typeof transaction.blobVersionedHashes !== 'undefined' ||
        typeof transaction.maxFeePerBlobGas !== 'undefined' ||
        typeof transaction.sidecars !== 'undefined')
        return 'eip4844';
    if (typeof transaction.maxFeePerGas !== 'undefined' ||
        typeof transaction.maxPriorityFeePerGas !== 'undefined') {
        return 'eip1559';
    }
    if (typeof transaction.gasPrice !== 'undefined') {
        if (typeof transaction.accessList !== 'undefined')
            return 'eip2930';
        return 'legacy';
    }
    throw new errors_transaction/* InvalidSerializableTransactionError */.Vg({ transaction });
}
//# sourceMappingURL=getTransactionType.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getChainId.js
var getChainId = __webpack_require__(9798);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js















const defaultParameters = [
    'blobVersionedHashes',
    'chainId',
    'fees',
    'gas',
    'nonce',
    'type',
];
/**
 * Prepares a transaction request for signing.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/prepareTransactionRequest
 *
 * @param args - {@link PrepareTransactionRequestParameters}
 * @returns The transaction request. {@link PrepareTransactionRequestReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { prepareTransactionRequest } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareTransactionRequest(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { prepareTransactionRequest } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareTransactionRequest(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
async function prepareTransactionRequest(client, args) {
    const { account: account_ = client.account, blobs, chain, chainId, gas, kzg, nonce, parameters = defaultParameters, type, } = args;
    const account = account_ ? (0,parseAccount/* parseAccount */.J)(account_) : undefined;
    const request = { ...args, ...(account ? { from: account?.address } : {}) };
    let block;
    async function getBlock() {
        if (block)
            return block;
        block = await (0,getAction/* getAction */.T)(client, public_getBlock/* getBlock */.g, 'getBlock')({ blockTag: 'latest' });
        return block;
    }
    if ((parameters.includes('blobVersionedHashes') ||
        parameters.includes('sidecars')) &&
        blobs &&
        kzg) {
        const commitments = blobsToCommitments({ blobs, kzg });
        if (parameters.includes('blobVersionedHashes')) {
            const versionedHashes = commitmentsToVersionedHashes({
                commitments,
                to: 'hex',
            });
            request.blobVersionedHashes = versionedHashes;
        }
        if (parameters.includes('sidecars')) {
            const proofs = blobsToProofs({ blobs, commitments, kzg });
            const sidecars = toBlobSidecars({
                blobs,
                commitments,
                proofs,
                to: 'hex',
            });
            request.sidecars = sidecars;
        }
    }
    if (parameters.includes('chainId')) {
        if (chain)
            request.chainId = chain.id;
        else if (typeof chainId !== 'undefined')
            request.chainId = chainId;
        else
            request.chainId = await (0,getAction/* getAction */.T)(client, getChainId/* getChainId */.T, 'getChainId')({});
    }
    if (parameters.includes('nonce') && typeof nonce === 'undefined' && account)
        request.nonce = await (0,getAction/* getAction */.T)(client, getTransactionCount/* getTransactionCount */.y, 'getTransactionCount')({
            address: account.address,
            blockTag: 'pending',
        });
    if ((parameters.includes('fees') || parameters.includes('type')) &&
        typeof type === 'undefined') {
        try {
            request.type = getTransactionType(request);
        }
        catch {
            // infer type from block
            const block = await getBlock();
            request.type =
                typeof block?.baseFeePerGas === 'bigint' ? 'eip1559' : 'legacy';
        }
    }
    if (parameters.includes('fees')) {
        // TODO(4844): derive blob base fees once https://github.com/ethereum/execution-apis/pull/486 is merged.
        if (request.type === 'eip1559' || request.type === 'eip4844') {
            // EIP-1559 fees
            if (typeof request.maxFeePerGas === 'undefined' ||
                typeof request.maxPriorityFeePerGas === 'undefined') {
                const block = await getBlock();
                const { maxFeePerGas, maxPriorityFeePerGas } = await (0,estimateFeesPerGas/* internal_estimateFeesPerGas */.O)(client, {
                    block: block,
                    chain,
                    request: request,
                });
                if (typeof args.maxPriorityFeePerGas === 'undefined' &&
                    args.maxFeePerGas &&
                    args.maxFeePerGas < maxPriorityFeePerGas)
                    throw new fee/* MaxFeePerGasTooLowError */.RR({
                        maxPriorityFeePerGas,
                    });
                request.maxPriorityFeePerGas = maxPriorityFeePerGas;
                request.maxFeePerGas = maxFeePerGas;
            }
        }
        else {
            // Legacy fees
            if (typeof args.maxFeePerGas !== 'undefined' ||
                typeof args.maxPriorityFeePerGas !== 'undefined')
                throw new fee/* Eip1559FeesNotSupportedError */.pw();
            const block = await getBlock();
            const { gasPrice: gasPrice_ } = await (0,estimateFeesPerGas/* internal_estimateFeesPerGas */.O)(client, {
                block: block,
                chain,
                request: request,
                type: 'legacy',
            });
            request.gasPrice = gasPrice_;
        }
    }
    if (parameters.includes('gas') && typeof gas === 'undefined')
        request.gas = await (0,getAction/* getAction */.T)(client, estimateGas/* estimateGas */.Q, 'estimateGas')({
            ...request,
            account: account
                ? { address: account.address, type: 'json-rpc' }
                : undefined,
        });
    (0,assertRequest/* assertRequest */.c)(request);
    delete request.parameters;
    return request;
}
//# sourceMappingURL=prepareTransactionRequest.js.map

/***/ }),

/***/ 8498:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   L: () => (/* binding */ sendRawTransaction)
/* harmony export */ });
/**
 * Sends a **signed** transaction to the network
 *
 * - Docs: https://viem.sh/docs/actions/wallet/sendRawTransaction
 * - JSON-RPC Method: [`eth_sendRawTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
 *
 * @param client - Client to use
 * @param parameters - {@link SendRawTransactionParameters}
 * @returns The transaction hash. {@link SendRawTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendRawTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const hash = await sendRawTransaction(client, {
 *   serializedTransaction: '0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33'
 * })
 */
async function sendRawTransaction(client, { serializedTransaction }) {
    return client.request({
        method: 'eth_sendRawTransaction',
        params: [serializedTransaction],
    }, { retryCount: 0 });
}
//# sourceMappingURL=sendRawTransaction.js.map

/***/ }),

/***/ 6479:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  v: () => (/* binding */ sendTransaction)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/accounts/utils/parseAccount.js
var parseAccount = __webpack_require__(3033);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/account.js
var errors_account = __webpack_require__(4337);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/chain/assertCurrentChain.js
var assertCurrentChain = __webpack_require__(3190);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/node.js
var node = __webpack_require__(2592);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/transaction.js
var transaction = __webpack_require__(8990);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/errors/getNodeError.js
var getNodeError = __webpack_require__(1772);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/errors/getTransactionError.js



function getTransactionError(err, { docsPath, ...args }) {
    const cause = (() => {
        const cause = (0,getNodeError/* getNodeError */.l)(err, args);
        if (cause instanceof node/* UnknownNodeError */.RM)
            return err;
        return cause;
    })();
    return new transaction/* TransactionExecutionError */.$s(cause, {
        docsPath,
        ...args,
    });
}
//# sourceMappingURL=getTransactionError.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/formatters/extract.js
var extract = __webpack_require__(9789);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/formatters/transactionRequest.js
var transactionRequest = __webpack_require__(7671);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/getAction.js
var getAction = __webpack_require__(3692);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/transaction/assertRequest.js
var assertRequest = __webpack_require__(5414);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getChainId.js
var getChainId = __webpack_require__(9798);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js + 13 modules
var prepareTransactionRequest = __webpack_require__(1093);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/wallet/sendRawTransaction.js
var sendRawTransaction = __webpack_require__(8498);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/sendTransaction.js











/**
 * Creates, signs, and sends a new transaction to the network.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/sendTransaction
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions/sending-transactions
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
 *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
 *
 * @param client - Client to use
 * @param parameters - {@link SendTransactionParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link SendTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await sendTransaction(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hash = await sendTransaction(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 */
async function sendTransaction(client, parameters) {
    const { account: account_ = client.account, chain = client.chain, accessList, blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, ...rest } = parameters;
    if (!account_)
        throw new errors_account/* AccountNotFoundError */.T({
            docsPath: '/docs/actions/wallet/sendTransaction',
        });
    const account = (0,parseAccount/* parseAccount */.J)(account_);
    try {
        (0,assertRequest/* assertRequest */.c)(parameters);
        let chainId;
        if (chain !== null) {
            chainId = await (0,getAction/* getAction */.T)(client, getChainId/* getChainId */.T, 'getChainId')({});
            (0,assertCurrentChain/* assertCurrentChain */.v)({
                currentChainId: chainId,
                chain,
            });
        }
        if (account.type === 'local') {
            // Prepare the request for signing (assign appropriate fees, etc.)
            const request = await (0,getAction/* getAction */.T)(client, prepareTransactionRequest/* prepareTransactionRequest */.f, 'prepareTransactionRequest')({
                account,
                accessList,
                blobs,
                chain,
                chainId,
                data,
                gas,
                gasPrice,
                maxFeePerBlobGas,
                maxFeePerGas,
                maxPriorityFeePerGas,
                nonce,
                parameters: [...prepareTransactionRequest/* defaultParameters */.M, 'sidecars'],
                to,
                value,
                ...rest,
            });
            const serializer = chain?.serializers?.transaction;
            const serializedTransaction = (await account.signTransaction(request, {
                serializer,
            }));
            return await (0,getAction/* getAction */.T)(client, sendRawTransaction/* sendRawTransaction */.L, 'sendRawTransaction')({
                serializedTransaction,
            });
        }
        const chainFormat = client.chain?.formatters?.transactionRequest?.format;
        const format = chainFormat || transactionRequest/* formatTransactionRequest */.Bv;
        const request = format({
            // Pick out extra data that might exist on the chain's transaction request type.
            ...(0,extract/* extract */.o)(rest, { format: chainFormat }),
            accessList,
            blobs,
            data,
            from: account.address,
            gas,
            gasPrice,
            maxFeePerBlobGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            nonce,
            to,
            value,
        });
        return await client.request({
            method: 'eth_sendTransaction',
            params: [request],
        }, { retryCount: 0 });
    }
    catch (err) {
        throw getTransactionError(err, {
            ...parameters,
            account,
            chain: parameters.chain || undefined,
        });
    }
}
//# sourceMappingURL=sendTransaction.js.map

/***/ }),

/***/ 9177:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   E: () => (/* binding */ writeContract)
/* harmony export */ });
/* harmony import */ var _utils_abi_encodeFunctionData_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8503);
/* harmony import */ var _utils_getAction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3692);
/* harmony import */ var _sendTransaction_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6479);



/**
 * Executes a write function on a contract.
 *
 * - Docs: https://viem.sh/docs/contract/writeContract
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts/writing-to-contracts
 *
 * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms) is needed to be broadcast in order to change the state.
 *
 * Internally, uses a [Wallet Client](https://viem.sh/docs/clients/wallet) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
 *
 * __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract#usage) before you execute it.__
 *
 * @param client - Client to use
 * @param parameters - {@link WriteContractParameters}
 * @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms#hash). {@link WriteContractReturnType}
 *
 * @example
 * import { createWalletClient, custom, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { writeContract } from 'viem/contract'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await writeContract(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
 *   functionName: 'mint',
 *   args: [69420],
 * })
 *
 * @example
 * // With Validation
 * import { createWalletClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { simulateContract, writeContract } from 'viem/contract'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const { request } = await simulateContract(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
 *   functionName: 'mint',
 *   args: [69420],
 * }
 * const hash = await writeContract(client, request)
 */
async function writeContract(client, parameters) {
    const { abi, address, args, dataSuffix, functionName, ...request } = parameters;
    const data = (0,_utils_abi_encodeFunctionData_js__WEBPACK_IMPORTED_MODULE_0__/* .encodeFunctionData */ .p)({
        abi,
        args,
        functionName,
    });
    return (0,_utils_getAction_js__WEBPACK_IMPORTED_MODULE_1__/* .getAction */ .T)(client, _sendTransaction_js__WEBPACK_IMPORTED_MODULE_2__/* .sendTransaction */ .v, 'sendTransaction')({
        data: `${data}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
        to: address,
        ...request,
    });
}
//# sourceMappingURL=writeContract.js.map

/***/ }),

/***/ 2403:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  G: () => (/* binding */ sepolia)
});

;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/chain/defineChain.js
function defineChain(chain) {
    return {
        formatters: undefined,
        fees: undefined,
        serializers: undefined,
        ...chain,
    };
}
//# sourceMappingURL=defineChain.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/chains/definitions/sepolia.js

const sepolia = /*#__PURE__*/ defineChain({
    id: 11_155_111,
    name: 'Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://rpc.sepolia.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Etherscan',
            url: 'https://sepolia.etherscan.io',
            apiUrl: 'https://api-sepolia.etherscan.io/api',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 751532,
        },
        ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' },
        ensUniversalResolver: {
            address: '0xc8Af999e38273D658BE1b921b88A9Ddf005769cC',
            blockCreated: 5_317_080,
        },
    },
    testnet: true,
});
//# sourceMappingURL=sepolia.js.map

/***/ }),

/***/ 8564:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  U: () => (/* binding */ createClient)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/accounts/utils/parseAccount.js
var parseAccount = __webpack_require__(3033);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/uid.js
const size = 256;
let index = size;
let buffer;
function uid(length = 11) {
    if (!buffer || index + length > size * 2) {
        buffer = '';
        index = 0;
        for (let i = 0; i < size; i++) {
            buffer += ((256 + Math.random() * 256) | 0).toString(16).substring(1);
        }
    }
    return buffer.substring(index, index++ + length);
}
//# sourceMappingURL=uid.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/clients/createClient.js


function createClient(parameters) {
    const { batch, cacheTime = parameters.pollingInterval ?? 4_000, ccipRead, key = 'base', name = 'Base Client', pollingInterval = 4_000, type = 'base', } = parameters;
    const chain = parameters.chain;
    const account = parameters.account
        ? (0,parseAccount/* parseAccount */.J)(parameters.account)
        : undefined;
    const { config, request, value } = parameters.transport({
        chain,
        pollingInterval,
    });
    const transport = { ...config, ...value };
    const client = {
        account,
        batch,
        cacheTime,
        ccipRead,
        chain,
        key,
        name,
        pollingInterval,
        request,
        transport,
        type,
        uid: uid(),
    };
    function extend(base) {
        return (extendFn) => {
            const extended = extendFn(base);
            for (const key in client)
                delete extended[key];
            const combined = { ...base, ...extended };
            return Object.assign(combined, { extend: extend(combined) });
        };
    }
    return Object.assign(client, { extend: extend(client) });
}
//# sourceMappingURL=createClient.js.map

/***/ }),

/***/ 6166:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  l: () => (/* binding */ createPublicClient)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/clients/createClient.js + 1 modules
var createClient = __webpack_require__(8564);
// EXTERNAL MODULE: ./node_modules/viem/_esm/constants/abis.js
var abis = __webpack_require__(4823);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/decodeFunctionResult.js
var decodeFunctionResult = __webpack_require__(6652);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/encodeFunctionData.js + 1 modules
var encodeFunctionData = __webpack_require__(8503);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/chain/getChainContractAddress.js
var getChainContractAddress = __webpack_require__(9985);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/trim.js
var trim = __webpack_require__(8583);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toHex.js
var toHex = __webpack_require__(4192);
// EXTERNAL MODULE: ./node_modules/viem/_esm/constants/solidity.js
var solidity = __webpack_require__(4453);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/base.js
var base = __webpack_require__(6329);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/contract.js + 1 modules
var contract = __webpack_require__(8863);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/ens/errors.js



/*
 * @description Checks if error is a valid null result UniversalResolver error
 */
function isNullUniversalResolverError(err, callType) {
    if (!(err instanceof base/* BaseError */.C))
        return false;
    const cause = err.walk((e) => e instanceof contract/* ContractFunctionRevertedError */.M);
    if (!(cause instanceof contract/* ContractFunctionRevertedError */.M))
        return false;
    if (cause.data?.errorName === 'ResolverNotFound')
        return true;
    if (cause.data?.errorName === 'ResolverWildcardNotSupported')
        return true;
    if (cause.data?.errorName === 'ResolverNotContract')
        return true;
    if (cause.data?.errorName === 'ResolverError')
        return true;
    if (cause.data?.errorName === 'HttpError')
        return true;
    // Backwards compatibility for older UniversalResolver contracts
    if (cause.reason?.includes('Wildcard on non-extended resolvers is not supported'))
        return true;
    // No primary name set for address.
    if (callType === 'reverse' && cause.reason === solidity/* panicReasons */.fD[50])
        return true;
    return false;
}
//# sourceMappingURL=errors.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/concat.js
var concat = __webpack_require__(5419);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toBytes.js
var toBytes = __webpack_require__(4706);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/hash/keccak256.js + 2 modules
var keccak256 = __webpack_require__(8729);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/isHex.js
var isHex = __webpack_require__(6394);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/ens/encodedLabelToLabelhash.js

function encodedLabelToLabelhash(label) {
    if (label.length !== 66)
        return null;
    if (label.indexOf('[') !== 0)
        return null;
    if (label.indexOf(']') !== 65)
        return null;
    const hash = `0x${label.slice(1, 65)}`;
    if (!(0,isHex/* isHex */.q)(hash))
        return null;
    return hash;
}
//# sourceMappingURL=encodedLabelToLabelhash.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/ens/namehash.js





/**
 * @description Hashes ENS name
 *
 * - Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `namehash`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
 *
 * @example
 * namehash('wevm.eth')
 * '0xf246651c1b9a6b141d19c2604e9a58f567973833990f830d882534a747801359'
 *
 * @link https://eips.ethereum.org/EIPS/eip-137
 */
function namehash(name) {
    let result = new Uint8Array(32).fill(0);
    if (!name)
        return (0,toHex/* bytesToHex */.My)(result);
    const labels = name.split('.');
    // Iterate in reverse order building up hash
    for (let i = labels.length - 1; i >= 0; i -= 1) {
        const hashFromEncodedLabel = encodedLabelToLabelhash(labels[i]);
        const hashed = hashFromEncodedLabel
            ? (0,toBytes/* toBytes */.ZJ)(hashFromEncodedLabel)
            : (0,keccak256/* keccak256 */.S)((0,toBytes/* stringToBytes */.Af)(labels[i]), 'bytes');
        result = (0,keccak256/* keccak256 */.S)((0,concat/* concat */.xW)([result, hashed]), 'bytes');
    }
    return (0,toHex/* bytesToHex */.My)(result);
}
//# sourceMappingURL=namehash.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/ens/encodeLabelhash.js
function encodeLabelhash(hash) {
    return `[${hash.slice(2)}]`;
}
//# sourceMappingURL=encodeLabelhash.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/ens/labelhash.js




/**
 * @description Hashes ENS label
 *
 * - Since ENS labels prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS labels](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `labelhash`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
 *
 * @example
 * labelhash('eth')
 * '0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0'
 */
function labelhash(label) {
    const result = new Uint8Array(32).fill(0);
    if (!label)
        return (0,toHex/* bytesToHex */.My)(result);
    return encodedLabelToLabelhash(label) || (0,keccak256/* keccak256 */.S)((0,toBytes/* stringToBytes */.Af)(label));
}
//# sourceMappingURL=labelhash.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/ens/packetToBytes.js



/*
 * @description Encodes a DNS packet into a ByteArray containing a UDP payload.
 */
function packetToBytes(packet) {
    // strip leading and trailing `.`
    const value = packet.replace(/^\.|\.$/gm, '');
    if (value.length === 0)
        return new Uint8Array(1);
    const bytes = new Uint8Array((0,toBytes/* stringToBytes */.Af)(value).byteLength + 2);
    let offset = 0;
    const list = value.split('.');
    for (let i = 0; i < list.length; i++) {
        let encoded = (0,toBytes/* stringToBytes */.Af)(list[i]);
        // if the length is > 255, make the encoded label value a labelhash
        // this is compatible with the universal resolver
        if (encoded.byteLength > 255)
            encoded = (0,toBytes/* stringToBytes */.Af)(encodeLabelhash(labelhash(list[i])));
        bytes[offset] = encoded.length;
        bytes.set(encoded, offset + 1);
        offset += encoded.length + 1;
    }
    if (bytes.byteLength !== offset + 1)
        return bytes.slice(0, offset + 1);
    return bytes;
}
//# sourceMappingURL=packetToBytes.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/getAction.js
var getAction = __webpack_require__(3692);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/readContract.js
var readContract = __webpack_require__(6724);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/ens/getEnsAddress.js











/**
 * Gets address for ENS name.
 *
 * - Docs: https://viem.sh/docs/ens/actions/getEnsAddress
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/ens
 *
 * Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
 *
 * Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
 *
 * @param client - Client to use
 * @param parameters - {@link GetEnsAddressParameters}
 * @returns Address for ENS name or `null` if not found. {@link GetEnsAddressReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getEnsAddress, normalize } from 'viem/ens'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const ensAddress = await getEnsAddress(client, {
 *   name: normalize('wevm.eth'),
 * })
 * // '0xd2135CfB216b74109775236E36d4b433F1DF507B'
 */
async function getEnsAddress(client, { blockNumber, blockTag, coinType, name, gatewayUrls, strict, universalResolverAddress: universalResolverAddress_, }) {
    let universalResolverAddress = universalResolverAddress_;
    if (!universalResolverAddress) {
        if (!client.chain)
            throw new Error('client chain not configured. universalResolverAddress is required.');
        universalResolverAddress = (0,getChainContractAddress/* getChainContractAddress */.M)({
            blockNumber,
            chain: client.chain,
            contract: 'ensUniversalResolver',
        });
    }
    try {
        const functionData = (0,encodeFunctionData/* encodeFunctionData */.p)({
            abi: abis/* addressResolverAbi */.Rm,
            functionName: 'addr',
            ...(coinType != null
                ? { args: [namehash(name), BigInt(coinType)] }
                : { args: [namehash(name)] }),
        });
        const readContractParameters = {
            address: universalResolverAddress,
            abi: abis/* universalResolverResolveAbi */.Ag,
            functionName: 'resolve',
            args: [(0,toHex/* toHex */.nj)(packetToBytes(name)), functionData],
            blockNumber,
            blockTag,
        };
        const readContractAction = (0,getAction/* getAction */.T)(client, readContract/* readContract */.J, 'readContract');
        const res = gatewayUrls
            ? await readContractAction({
                ...readContractParameters,
                args: [...readContractParameters.args, gatewayUrls],
            })
            : await readContractAction(readContractParameters);
        if (res[0] === '0x')
            return null;
        const address = (0,decodeFunctionResult/* decodeFunctionResult */.e)({
            abi: abis/* addressResolverAbi */.Rm,
            args: coinType != null ? [namehash(name), BigInt(coinType)] : undefined,
            functionName: 'addr',
            data: res[0],
        });
        if (address === '0x')
            return null;
        if ((0,trim/* trim */.B)(address) === '0x00')
            return null;
        return address;
    }
    catch (err) {
        if (strict)
            throw err;
        if (isNullUniversalResolverError(err, 'resolve'))
            return null;
        throw err;
    }
}
//# sourceMappingURL=getEnsAddress.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/errors/ens.js

class EnsAvatarInvalidMetadataError extends base/* BaseError */.C {
    constructor({ data }) {
        super('Unable to extract image from metadata. The metadata may be malformed or invalid.', {
            metaMessages: [
                '- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.',
                '',
                `Provided data: ${JSON.stringify(data)}`,
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'EnsAvatarInvalidMetadataError'
        });
    }
}
class EnsAvatarInvalidNftUriError extends base/* BaseError */.C {
    constructor({ reason }) {
        super(`ENS NFT avatar URI is invalid. ${reason}`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'EnsAvatarInvalidNftUriError'
        });
    }
}
class EnsAvatarUriResolutionError extends base/* BaseError */.C {
    constructor({ uri }) {
        super(`Unable to resolve ENS avatar URI "${uri}". The URI may be malformed, invalid, or does not respond with a valid image.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'EnsAvatarUriResolutionError'
        });
    }
}
class EnsAvatarUnsupportedNamespaceError extends base/* BaseError */.C {
    constructor({ namespace }) {
        super(`ENS NFT avatar namespace "${namespace}" is not supported. Must be "erc721" or "erc1155".`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'EnsAvatarUnsupportedNamespaceError'
        });
    }
}
//# sourceMappingURL=ens.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/ens/avatar/utils.js


const networkRegex = /(?<protocol>https?:\/\/[^\/]*|ipfs:\/|ipns:\/|ar:\/)?(?<root>\/)?(?<subpath>ipfs\/|ipns\/)?(?<target>[\w\-.]+)(?<subtarget>\/.*)?/;
const ipfsHashRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(?<target>[\w\-.]+))?(?<subtarget>\/.*)?$/;
const base64Regex = /^data:([a-zA-Z\-/+]*);base64,([^"].*)/;
const dataURIRegex = /^data:([a-zA-Z\-/+]*)?(;[a-zA-Z0-9].*?)?(,)/;
async function isImageUri(uri) {
    try {
        const res = await fetch(uri, { method: 'HEAD' });
        // retrieve content type header to check if content is image
        if (res.status === 200) {
            const contentType = res.headers.get('content-type');
            return contentType?.startsWith('image/');
        }
        return false;
    }
    catch (error) {
        // if error is not cors related then fail
        if (typeof error === 'object' && typeof error.response !== 'undefined') {
            return false;
        }
        // fail in NodeJS, since the error is not cors but any other network issue
        // biome-ignore lint/suspicious/noPrototypeBuiltins:
        if (!globalThis.hasOwnProperty('Image'))
            return false;
        // in case of cors, use image api to validate if given url is an actual image
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve(true);
            };
            img.onerror = () => {
                resolve(false);
            };
            img.src = uri;
        });
    }
}
function getGateway(custom, defaultGateway) {
    if (!custom)
        return defaultGateway;
    if (custom.endsWith('/'))
        return custom.slice(0, -1);
    return custom;
}
function resolveAvatarUri({ uri, gatewayUrls, }) {
    const isEncoded = base64Regex.test(uri);
    if (isEncoded)
        return { uri, isOnChain: true, isEncoded };
    const ipfsGateway = getGateway(gatewayUrls?.ipfs, 'https://ipfs.io');
    const arweaveGateway = getGateway(gatewayUrls?.arweave, 'https://arweave.net');
    const networkRegexMatch = uri.match(networkRegex);
    const { protocol, subpath, target, subtarget = '', } = networkRegexMatch?.groups || {};
    const isIPNS = protocol === 'ipns:/' || subpath === 'ipns/';
    const isIPFS = protocol === 'ipfs:/' || subpath === 'ipfs/' || ipfsHashRegex.test(uri);
    if (uri.startsWith('http') && !isIPNS && !isIPFS) {
        let replacedUri = uri;
        if (gatewayUrls?.arweave)
            replacedUri = uri.replace(/https:\/\/arweave.net/g, gatewayUrls?.arweave);
        return { uri: replacedUri, isOnChain: false, isEncoded: false };
    }
    if ((isIPNS || isIPFS) && target) {
        return {
            uri: `${ipfsGateway}/${isIPNS ? 'ipns' : 'ipfs'}/${target}${subtarget}`,
            isOnChain: false,
            isEncoded: false,
        };
    }
    if (protocol === 'ar:/' && target) {
        return {
            uri: `${arweaveGateway}/${target}${subtarget || ''}`,
            isOnChain: false,
            isEncoded: false,
        };
    }
    let parsedUri = uri.replace(dataURIRegex, '');
    if (parsedUri.startsWith('<svg')) {
        // if svg, base64 encode
        parsedUri = `data:image/svg+xml;base64,${btoa(parsedUri)}`;
    }
    if (parsedUri.startsWith('data:') || parsedUri.startsWith('{')) {
        return {
            uri: parsedUri,
            isOnChain: true,
            isEncoded: false,
        };
    }
    throw new EnsAvatarUriResolutionError({ uri });
}
function getJsonImage(data) {
    // validation check for json data, must include one of theses properties
    if (typeof data !== 'object' ||
        (!('image' in data) && !('image_url' in data) && !('image_data' in data))) {
        throw new EnsAvatarInvalidMetadataError({ data });
    }
    return data.image || data.image_url || data.image_data;
}
async function getMetadataAvatarUri({ gatewayUrls, uri, }) {
    try {
        const res = await fetch(uri).then((res) => res.json());
        const image = await parseAvatarUri({
            gatewayUrls,
            uri: getJsonImage(res),
        });
        return image;
    }
    catch {
        throw new EnsAvatarUriResolutionError({ uri });
    }
}
async function parseAvatarUri({ gatewayUrls, uri, }) {
    const { uri: resolvedURI, isOnChain } = resolveAvatarUri({ uri, gatewayUrls });
    if (isOnChain)
        return resolvedURI;
    // check if resolvedURI is an image, if it is return the url
    const isImage = await isImageUri(resolvedURI);
    if (isImage)
        return resolvedURI;
    throw new EnsAvatarUriResolutionError({ uri });
}
function parseNftUri(uri_) {
    let uri = uri_;
    // parse valid nft spec (CAIP-22/CAIP-29)
    // @see: https://github.com/ChainAgnostic/CAIPs/tree/master/CAIPs
    if (uri.startsWith('did:nft:')) {
        // convert DID to CAIP
        uri = uri.replace('did:nft:', '').replace(/_/g, '/');
    }
    const [reference, asset_namespace, tokenID] = uri.split('/');
    const [eip_namespace, chainID] = reference.split(':');
    const [erc_namespace, contractAddress] = asset_namespace.split(':');
    if (!eip_namespace || eip_namespace.toLowerCase() !== 'eip155')
        throw new EnsAvatarInvalidNftUriError({ reason: 'Only EIP-155 supported' });
    if (!chainID)
        throw new EnsAvatarInvalidNftUriError({ reason: 'Chain ID not found' });
    if (!contractAddress)
        throw new EnsAvatarInvalidNftUriError({
            reason: 'Contract address not found',
        });
    if (!tokenID)
        throw new EnsAvatarInvalidNftUriError({ reason: 'Token ID not found' });
    if (!erc_namespace)
        throw new EnsAvatarInvalidNftUriError({ reason: 'ERC namespace not found' });
    return {
        chainID: parseInt(chainID),
        namespace: erc_namespace.toLowerCase(),
        contractAddress: contractAddress,
        tokenID,
    };
}
async function getNftTokenUri(client, { nft }) {
    if (nft.namespace === 'erc721') {
        return (0,readContract/* readContract */.J)(client, {
            address: nft.contractAddress,
            abi: [
                {
                    name: 'tokenURI',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [{ name: 'tokenId', type: 'uint256' }],
                    outputs: [{ name: '', type: 'string' }],
                },
            ],
            functionName: 'tokenURI',
            args: [BigInt(nft.tokenID)],
        });
    }
    if (nft.namespace === 'erc1155') {
        return (0,readContract/* readContract */.J)(client, {
            address: nft.contractAddress,
            abi: [
                {
                    name: 'uri',
                    type: 'function',
                    stateMutability: 'view',
                    inputs: [{ name: '_id', type: 'uint256' }],
                    outputs: [{ name: '', type: 'string' }],
                },
            ],
            functionName: 'uri',
            args: [BigInt(nft.tokenID)],
        });
    }
    throw new EnsAvatarUnsupportedNamespaceError({ namespace: nft.namespace });
}
//# sourceMappingURL=utils.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/ens/avatar/parseAvatarRecord.js

async function parseAvatarRecord(client, { gatewayUrls, record, }) {
    if (/eip155:/i.test(record))
        return parseNftAvatarUri(client, { gatewayUrls, record });
    return parseAvatarUri({ uri: record, gatewayUrls });
}
async function parseNftAvatarUri(client, { gatewayUrls, record, }) {
    // parse NFT URI into properties
    const nft = parseNftUri(record);
    // fetch tokenURI from the NFT contract
    const nftUri = await getNftTokenUri(client, { nft });
    // resolve the URI from the fetched tokenURI
    const { uri: resolvedNftUri, isOnChain, isEncoded, } = resolveAvatarUri({ uri: nftUri, gatewayUrls });
    // if the resolved URI is on chain, return the data
    if (isOnChain &&
        (resolvedNftUri.includes('data:application/json;base64,') ||
            resolvedNftUri.startsWith('{'))) {
        const encodedJson = isEncoded
            ? // if it is encoded, decode it
                atob(resolvedNftUri.replace('data:application/json;base64,', ''))
            : // if it isn't encoded assume it is a JSON string, but it could be anything (it will error if it is)
                resolvedNftUri;
        const decoded = JSON.parse(encodedJson);
        return parseAvatarUri({ uri: getJsonImage(decoded), gatewayUrls });
    }
    let uriTokenId = nft.tokenID;
    if (nft.namespace === 'erc1155')
        uriTokenId = uriTokenId.replace('0x', '').padStart(64, '0');
    return getMetadataAvatarUri({
        gatewayUrls,
        uri: resolvedNftUri.replace(/(?:0x)?{id}/, uriTokenId),
    });
}
//# sourceMappingURL=parseAvatarRecord.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/ens/getEnsText.js










/**
 * Gets a text record for specified ENS name.
 *
 * - Docs: https://viem.sh/docs/ens/actions/getEnsResolver
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/ens
 *
 * Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
 *
 * Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
 *
 * @param client - Client to use
 * @param parameters - {@link GetEnsTextParameters}
 * @returns Address for ENS resolver. {@link GetEnsTextReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getEnsText, normalize } from 'viem/ens'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const twitterRecord = await getEnsText(client, {
 *   name: normalize('wevm.eth'),
 *   key: 'com.twitter',
 * })
 * // 'wagmi_sh'
 */
async function getEnsText(client, { blockNumber, blockTag, name, key, gatewayUrls, strict, universalResolverAddress: universalResolverAddress_, }) {
    let universalResolverAddress = universalResolverAddress_;
    if (!universalResolverAddress) {
        if (!client.chain)
            throw new Error('client chain not configured. universalResolverAddress is required.');
        universalResolverAddress = (0,getChainContractAddress/* getChainContractAddress */.M)({
            blockNumber,
            chain: client.chain,
            contract: 'ensUniversalResolver',
        });
    }
    try {
        const readContractParameters = {
            address: universalResolverAddress,
            abi: abis/* universalResolverResolveAbi */.Ag,
            functionName: 'resolve',
            args: [
                (0,toHex/* toHex */.nj)(packetToBytes(name)),
                (0,encodeFunctionData/* encodeFunctionData */.p)({
                    abi: abis/* textResolverAbi */.SJ,
                    functionName: 'text',
                    args: [namehash(name), key],
                }),
            ],
            blockNumber,
            blockTag,
        };
        const readContractAction = (0,getAction/* getAction */.T)(client, readContract/* readContract */.J, 'readContract');
        const res = gatewayUrls
            ? await readContractAction({
                ...readContractParameters,
                args: [...readContractParameters.args, gatewayUrls],
            })
            : await readContractAction(readContractParameters);
        if (res[0] === '0x')
            return null;
        const record = (0,decodeFunctionResult/* decodeFunctionResult */.e)({
            abi: abis/* textResolverAbi */.SJ,
            functionName: 'text',
            data: res[0],
        });
        return record === '' ? null : record;
    }
    catch (err) {
        if (strict)
            throw err;
        if (isNullUniversalResolverError(err, 'resolve'))
            return null;
        throw err;
    }
}
//# sourceMappingURL=getEnsText.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/ens/getEnsAvatar.js



/**
 * Gets the avatar of an ENS name.
 *
 * - Docs: https://viem.sh/docs/ens/actions/getEnsAvatar
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/ens
 *
 * Calls [`getEnsText`](https://viem.sh/docs/ens/actions/getEnsText) with `key` set to `'avatar'`.
 *
 * Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
 *
 * @param client - Client to use
 * @param parameters - {@link GetEnsAvatarParameters}
 * @returns Avatar URI or `null` if not found. {@link GetEnsAvatarReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getEnsAvatar, normalize } from 'viem/ens'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const ensAvatar = await getEnsAvatar(client, {
 *   name: normalize('wevm.eth'),
 * })
 * // 'https://ipfs.io/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio'
 */
async function getEnsAvatar(client, { blockNumber, blockTag, assetGatewayUrls, name, gatewayUrls, strict, universalResolverAddress, }) {
    const record = await (0,getAction/* getAction */.T)(client, getEnsText, 'getEnsText')({
        blockNumber,
        blockTag,
        key: 'avatar',
        name,
        universalResolverAddress,
        gatewayUrls,
        strict,
    });
    if (!record)
        return null;
    try {
        return await parseAvatarRecord(client, {
            record,
            gatewayUrls: assetGatewayUrls,
        });
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=getEnsAvatar.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/ens/getEnsName.js







/**
 * Gets primary name for specified address.
 *
 * - Docs: https://viem.sh/docs/ens/actions/getEnsName
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/ens
 *
 * Calls `reverse(bytes)` on ENS Universal Resolver Contract to "reverse resolve" the address to the primary ENS name.
 *
 * @param client - Client to use
 * @param parameters - {@link GetEnsNameParameters}
 * @returns Name or `null` if not found. {@link GetEnsNameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getEnsName } from 'viem/ens'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const ensName = await getEnsName(client, {
 *   address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
 * })
 * // 'wevm.eth'
 */
async function getEnsName(client, { address, blockNumber, blockTag, gatewayUrls, strict, universalResolverAddress: universalResolverAddress_, }) {
    let universalResolverAddress = universalResolverAddress_;
    if (!universalResolverAddress) {
        if (!client.chain)
            throw new Error('client chain not configured. universalResolverAddress is required.');
        universalResolverAddress = (0,getChainContractAddress/* getChainContractAddress */.M)({
            blockNumber,
            chain: client.chain,
            contract: 'ensUniversalResolver',
        });
    }
    const reverseNode = `${address.toLowerCase().substring(2)}.addr.reverse`;
    try {
        const readContractParameters = {
            address: universalResolverAddress,
            abi: abis/* universalResolverReverseAbi */.oX,
            functionName: 'reverse',
            args: [(0,toHex/* toHex */.nj)(packetToBytes(reverseNode))],
            blockNumber,
            blockTag,
        };
        const readContractAction = (0,getAction/* getAction */.T)(client, readContract/* readContract */.J, 'readContract');
        const [name, resolvedAddress] = gatewayUrls
            ? await readContractAction({
                ...readContractParameters,
                args: [...readContractParameters.args, gatewayUrls],
            })
            : await readContractAction(readContractParameters);
        if (address.toLowerCase() !== resolvedAddress.toLowerCase())
            return null;
        return name;
    }
    catch (err) {
        if (strict)
            throw err;
        if (isNullUniversalResolverError(err, 'reverse'))
            return null;
        throw err;
    }
}
//# sourceMappingURL=getEnsName.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/ens/getEnsResolver.js





/**
 * Gets resolver for ENS name.
 *
 * - Docs: https://viem.sh/docs/ens/actions/getEnsResolver
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/ens
 *
 * Calls `findResolver(bytes)` on ENS Universal Resolver Contract to retrieve the resolver of an ENS name.
 *
 * Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
 *
 * @param client - Client to use
 * @param parameters - {@link GetEnsResolverParameters}
 * @returns Address for ENS resolver. {@link GetEnsResolverReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getEnsResolver, normalize } from 'viem/ens'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const resolverAddress = await getEnsResolver(client, {
 *   name: normalize('wevm.eth'),
 * })
 * // '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41'
 */
async function getEnsResolver(client, { blockNumber, blockTag, name, universalResolverAddress: universalResolverAddress_, }) {
    let universalResolverAddress = universalResolverAddress_;
    if (!universalResolverAddress) {
        if (!client.chain)
            throw new Error('client chain not configured. universalResolverAddress is required.');
        universalResolverAddress = (0,getChainContractAddress/* getChainContractAddress */.M)({
            blockNumber,
            chain: client.chain,
            contract: 'ensUniversalResolver',
        });
    }
    const [resolverAddress] = await (0,getAction/* getAction */.T)(client, readContract/* readContract */.J, 'readContract')({
        address: universalResolverAddress,
        abi: [
            {
                inputs: [{ type: 'bytes' }],
                name: 'findResolver',
                outputs: [{ type: 'address' }, { type: 'bytes32' }],
                stateMutability: 'view',
                type: 'function',
            },
        ],
        functionName: 'findResolver',
        args: [(0,toHex/* toHex */.nj)(packetToBytes(name))],
        blockNumber,
        blockTag,
    });
    return resolverAddress;
}
//# sourceMappingURL=getEnsResolver.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/call.js + 2 modules
var call = __webpack_require__(6782);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/filters/createFilterRequestScope.js
var createFilterRequestScope = __webpack_require__(3109);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/createBlockFilter.js

/**
 * Creates a [`Filter`](https://viem.sh/docs/glossary/types#filter) to listen for new block hashes that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
 *
 * - Docs: https://viem.sh/docs/actions/public/createBlockFilter
 * - JSON-RPC Methods: [`eth_newBlockFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newBlockFilter)
 *
 * @param client - Client to use
 * @returns [`Filter`](https://viem.sh/docs/glossary/types#filter). {@link CreateBlockFilterReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createBlockFilter } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createBlockFilter(client)
 * // { id: "0x345a6572337856574a76364e457a4366", type: 'block' }
 */
async function createBlockFilter(client) {
    const getRequest = (0,createFilterRequestScope/* createFilterRequestScope */.g)(client, {
        method: 'eth_newBlockFilter',
    });
    const id = await client.request({
        method: 'eth_newBlockFilter',
    });
    return { id, request: getRequest(id), type: 'block' };
}
//# sourceMappingURL=createBlockFilter.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/createContractEventFilter.js
var createContractEventFilter = __webpack_require__(1100);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/encodeEventTopics.js + 1 modules
var encodeEventTopics = __webpack_require__(5226);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/createEventFilter.js



/**
 * Creates a [`Filter`](https://viem.sh/docs/glossary/types#filter) to listen for new events that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
 *
 * - Docs: https://viem.sh/docs/actions/public/createEventFilter
 * - JSON-RPC Methods: [`eth_newFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newfilter)
 *
 * @param client - Client to use
 * @param parameters - {@link CreateEventFilterParameters}
 * @returns [`Filter`](https://viem.sh/docs/glossary/types#filter). {@link CreateEventFilterReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createEventFilter } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createEventFilter(client, {
 *   address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
 * })
 */
async function createEventFilter(client, { address, args, event, events: events_, fromBlock, strict, toBlock, } = {}) {
    const events = events_ ?? (event ? [event] : undefined);
    const getRequest = (0,createFilterRequestScope/* createFilterRequestScope */.g)(client, {
        method: 'eth_newFilter',
    });
    let topics = [];
    if (events) {
        topics = [
            events.flatMap((event) => (0,encodeEventTopics/* encodeEventTopics */.R)({
                abi: [event],
                eventName: event.name,
                args,
            })),
        ];
        if (event)
            topics = topics[0];
    }
    const id = await client.request({
        method: 'eth_newFilter',
        params: [
            {
                address,
                fromBlock: typeof fromBlock === 'bigint' ? (0,toHex/* numberToHex */.cK)(fromBlock) : fromBlock,
                toBlock: typeof toBlock === 'bigint' ? (0,toHex/* numberToHex */.cK)(toBlock) : toBlock,
                ...(topics.length ? { topics } : {}),
            },
        ],
    });
    return {
        abi: events,
        args,
        eventName: event ? event.name : undefined,
        fromBlock,
        id,
        request: getRequest(id),
        strict: Boolean(strict),
        toBlock,
        type: 'event',
    };
}
//# sourceMappingURL=createEventFilter.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/createPendingTransactionFilter.js

/**
 * Creates a Filter to listen for new pending transaction hashes that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
 *
 * - Docs: https://viem.sh/docs/actions/public/createPendingTransactionFilter
 * - JSON-RPC Methods: [`eth_newPendingTransactionFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newpendingtransactionfilter)
 *
 * @param client - Client to use
 * @returns [`Filter`](https://viem.sh/docs/glossary/types#filter). {@link CreateBlockFilterReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createPendingTransactionFilter } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createPendingTransactionFilter(client)
 * // { id: "0x345a6572337856574a76364e457a4366", type: 'transaction' }
 */
async function createPendingTransactionFilter(client) {
    const getRequest = (0,createFilterRequestScope/* createFilterRequestScope */.g)(client, {
        method: 'eth_newPendingTransactionFilter',
    });
    const id = await client.request({
        method: 'eth_newPendingTransactionFilter',
    });
    return { id, request: getRequest(id), type: 'transaction' };
}
//# sourceMappingURL=createPendingTransactionFilter.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/estimateContractGas.js
var estimateContractGas = __webpack_require__(965);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/estimateFeesPerGas.js
var estimateFeesPerGas = __webpack_require__(1989);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/estimateGas.js + 2 modules
var estimateGas = __webpack_require__(432);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/estimateMaxPriorityFeePerGas.js
var estimateMaxPriorityFeePerGas = __webpack_require__(1622);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/getBalance.js

/**
 * Returns the balance of an address in wei.
 *
 * - Docs: https://viem.sh/docs/actions/public/getBalance
 * - JSON-RPC Methods: [`eth_getBalance`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getbalance)
 *
 * You can convert the balance to ether units with [`formatEther`](https://viem.sh/docs/utilities/formatEther).
 *
 * ```ts
 * const balance = await getBalance(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   blockTag: 'safe'
 * })
 * const balanceAsEther = formatEther(balance)
 * // "6.942"
 * ```
 *
 * @param client - Client to use
 * @param parameters - {@link GetBalanceParameters}
 * @returns The balance of the address in wei. {@link GetBalanceReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getBalance } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const balance = await getBalance(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 * // 10000000000000000000000n (wei)
 */
async function getBalance(client, { address, blockNumber, blockTag = 'latest' }) {
    const blockNumberHex = blockNumber ? (0,toHex/* numberToHex */.cK)(blockNumber) : undefined;
    const balance = await client.request({
        method: 'eth_getBalance',
        params: [address, blockNumberHex || blockTag],
    });
    return BigInt(balance);
}
//# sourceMappingURL=getBalance.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/getBlobBaseFee.js
/**
 * Returns the base fee per blob gas in wei.
 *
 * - Docs: https://viem.sh/docs/actions/public/getBlobBaseFee
 * - JSON-RPC Methods: [`eth_blobBaseFee`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blobBaseFee)
 *
 * @param client - Client to use
 * @returns The blob base fee (in wei). {@link GetBlobBaseFeeReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getBlobBaseFee } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const blobBaseFee = await getBlobBaseFee(client)
 */
async function getBlobBaseFee(client) {
    const baseFee = await client.request({
        method: 'eth_blobBaseFee',
    });
    return BigInt(baseFee);
}
//# sourceMappingURL=getBlobBaseFee.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getBlock.js
var getBlock = __webpack_require__(5603);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getBlockNumber.js + 1 modules
var getBlockNumber = __webpack_require__(5639);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/fromHex.js
var fromHex = __webpack_require__(6675);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/getBlockTransactionCount.js


/**
 * Returns the number of Transactions at a block number, hash, or tag.
 *
 * - Docs: https://viem.sh/docs/actions/public/getBlockTransactionCount
 * - JSON-RPC Methods:
 *   - Calls [`eth_getBlockTransactionCountByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbynumber) for `blockNumber` & `blockTag`.
 *   - Calls [`eth_getBlockTransactionCountByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbyhash) for `blockHash`.
 *
 * @param client - Client to use
 * @param parameters - {@link GetBlockTransactionCountParameters}
 * @returns The block transaction count. {@link GetBlockTransactionCountReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getBlockTransactionCount } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const count = await getBlockTransactionCount(client)
 */
async function getBlockTransactionCount(client, { blockHash, blockNumber, blockTag = 'latest', } = {}) {
    const blockNumberHex = blockNumber !== undefined ? (0,toHex/* numberToHex */.cK)(blockNumber) : undefined;
    let count;
    if (blockHash) {
        count = await client.request({
            method: 'eth_getBlockTransactionCountByHash',
            params: [blockHash],
        });
    }
    else {
        count = await client.request({
            method: 'eth_getBlockTransactionCountByNumber',
            params: [blockNumberHex || blockTag],
        });
    }
    return (0,fromHex/* hexToNumber */.ME)(count);
}
//# sourceMappingURL=getBlockTransactionCount.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/getBytecode.js

/**
 * Retrieves the bytecode at an address.
 *
 * - Docs: https://viem.sh/docs/contract/getBytecode
 * - JSON-RPC Methods: [`eth_getCode`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getcode)
 *
 * @param client - Client to use
 * @param parameters - {@link GetBytecodeParameters}
 * @returns The contract's bytecode. {@link GetBytecodeReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getBytecode } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const code = await getBytecode(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 * })
 */
async function getBytecode(client, { address, blockNumber, blockTag = 'latest' }) {
    const blockNumberHex = blockNumber !== undefined ? (0,toHex/* numberToHex */.cK)(blockNumber) : undefined;
    const hex = await client.request({
        method: 'eth_getCode',
        params: [address, blockNumberHex || blockTag],
    });
    if (hex === '0x')
        return undefined;
    return hex;
}
//# sourceMappingURL=getBytecode.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getChainId.js
var getChainId = __webpack_require__(9798);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getContractEvents.js
var getContractEvents = __webpack_require__(1443);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/formatters/feeHistory.js
function formatFeeHistory(feeHistory) {
    return {
        baseFeePerGas: feeHistory.baseFeePerGas.map((value) => BigInt(value)),
        gasUsedRatio: feeHistory.gasUsedRatio,
        oldestBlock: BigInt(feeHistory.oldestBlock),
        reward: feeHistory.reward?.map((reward) => reward.map((value) => BigInt(value))),
    };
}
//# sourceMappingURL=feeHistory.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/getFeeHistory.js


/**
 * Returns a collection of historical gas information.
 *
 * - Docs: https://viem.sh/docs/actions/public/getFeeHistory
 * - JSON-RPC Methods: [`eth_feeHistory`](https://docs.alchemy.com/reference/eth-feehistory)
 *
 * @param client - Client to use
 * @param parameters - {@link GetFeeHistoryParameters}
 * @returns The gas estimate (in wei). {@link GetFeeHistoryReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getFeeHistory } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const feeHistory = await getFeeHistory(client, {
 *   blockCount: 4,
 *   rewardPercentiles: [25, 75],
 * })
 */
async function getFeeHistory(client, { blockCount, blockNumber, blockTag = 'latest', rewardPercentiles, }) {
    const blockNumberHex = blockNumber ? (0,toHex/* numberToHex */.cK)(blockNumber) : undefined;
    const feeHistory = await client.request({
        method: 'eth_feeHistory',
        params: [
            (0,toHex/* numberToHex */.cK)(blockCount),
            blockNumberHex || blockTag,
            rewardPercentiles,
        ],
    });
    return formatFeeHistory(feeHistory);
}
//# sourceMappingURL=getFeeHistory.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getFilterChanges.js
var getFilterChanges = __webpack_require__(3373);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/parseEventLogs.js
var parseEventLogs = __webpack_require__(8937);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/formatters/log.js
var formatters_log = __webpack_require__(7070);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/getFilterLogs.js



/**
 * Returns a list of event logs since the filter was created.
 *
 * - Docs: https://viem.sh/docs/actions/public/getFilterLogs
 * - JSON-RPC Methods: [`eth_getFilterLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterlogs)
 *
 * `getFilterLogs` is only compatible with **event filters**.
 *
 * @param client - Client to use
 * @param parameters - {@link GetFilterLogsParameters}
 * @returns A list of event logs. {@link GetFilterLogsReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbiItem } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createEventFilter, getFilterLogs } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await createEventFilter(client, {
 *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
 *   event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
 * })
 * const logs = await getFilterLogs(client, { filter })
 */
async function getFilterLogs(_client, { filter, }) {
    const strict = filter.strict ?? false;
    const logs = await filter.request({
        method: 'eth_getFilterLogs',
        params: [filter.id],
    });
    const formattedLogs = logs.map((log) => (0,formatters_log/* formatLog */.e)(log));
    if (!filter.abi)
        return formattedLogs;
    return (0,parseEventLogs/* parseEventLogs */.p)({
        abi: filter.abi,
        logs: formattedLogs,
        strict,
    });
}
//# sourceMappingURL=getFilterLogs.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getGasPrice.js
var getGasPrice = __webpack_require__(5242);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getLogs.js
var getLogs = __webpack_require__(3295);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/formatters/proof.js

function formatStorageProof(storageProof) {
    return storageProof.map((proof) => ({
        ...proof,
        value: BigInt(proof.value),
    }));
}
function formatProof(proof) {
    return {
        ...proof,
        balance: proof.balance ? BigInt(proof.balance) : undefined,
        nonce: proof.nonce ? (0,fromHex/* hexToNumber */.ME)(proof.nonce) : undefined,
        storageProof: proof.storageProof
            ? formatStorageProof(proof.storageProof)
            : undefined,
    };
}
//# sourceMappingURL=proof.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/getProof.js


/**
 * Returns the account and storage values of the specified account including the Merkle-proof.
 *
 * - Docs: https://viem.sh/docs/actions/public/getProof
 * - JSON-RPC Methods:
 *   - Calls [`eth_getProof`](https://eips.ethereum.org/EIPS/eip-1186)
 *
 * @param client - Client to use
 * @param parameters - {@link GetProofParameters}
 * @returns Proof data. {@link GetProofReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getProof } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const block = await getProof(client, {
 *  address: '0x...',
 *  storageKeys: ['0x...'],
 * })
 */
async function getProof(client, { address, blockNumber, blockTag: blockTag_, storageKeys, }) {
    const blockTag = blockTag_ ?? 'latest';
    const blockNumberHex = blockNumber !== undefined ? (0,toHex/* numberToHex */.cK)(blockNumber) : undefined;
    const proof = await client.request({
        method: 'eth_getProof',
        params: [address, storageKeys, blockNumberHex || blockTag],
    });
    return formatProof(proof);
}
//# sourceMappingURL=getProof.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/getStorageAt.js

/**
 * Returns the value from a storage slot at a given address.
 *
 * - Docs: https://viem.sh/docs/contract/getStorageAt
 * - JSON-RPC Methods: [`eth_getStorageAt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getstorageat)
 *
 * @param client - Client to use
 * @param parameters - {@link GetStorageAtParameters}
 * @returns The value of the storage slot. {@link GetStorageAtReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getStorageAt } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const code = await getStorageAt(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   slot: toHex(0),
 * })
 */
async function getStorageAt(client, { address, blockNumber, blockTag = 'latest', slot }) {
    const blockNumberHex = blockNumber !== undefined ? (0,toHex/* numberToHex */.cK)(blockNumber) : undefined;
    const data = await client.request({
        method: 'eth_getStorageAt',
        params: [address, slot, blockNumberHex || blockTag],
    });
    return data;
}
//# sourceMappingURL=getStorageAt.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/transaction.js
var errors_transaction = __webpack_require__(8990);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/formatters/transaction.js
var formatters_transaction = __webpack_require__(5948);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/getTransaction.js



/**
 * Returns information about a [Transaction](https://viem.sh/docs/glossary/terms#transaction) given a hash or block identifier.
 *
 * - Docs: https://viem.sh/docs/actions/public/getTransaction
 * - Example: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions/fetching-transactions
 * - JSON-RPC Methods: [`eth_getTransactionByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionByHash)
 *
 * @param client - Client to use
 * @param parameters - {@link GetTransactionParameters}
 * @returns The transaction information. {@link GetTransactionReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getTransaction } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const transaction = await getTransaction(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 */
async function getTransaction(client, { blockHash, blockNumber, blockTag: blockTag_, hash, index, }) {
    const blockTag = blockTag_ || 'latest';
    const blockNumberHex = blockNumber !== undefined ? (0,toHex/* numberToHex */.cK)(blockNumber) : undefined;
    let transaction = null;
    if (hash) {
        transaction = await client.request({
            method: 'eth_getTransactionByHash',
            params: [hash],
        });
    }
    else if (blockHash) {
        transaction = await client.request({
            method: 'eth_getTransactionByBlockHashAndIndex',
            params: [blockHash, (0,toHex/* numberToHex */.cK)(index)],
        });
    }
    else if (blockNumberHex || blockTag) {
        transaction = await client.request({
            method: 'eth_getTransactionByBlockNumberAndIndex',
            params: [blockNumberHex || blockTag, (0,toHex/* numberToHex */.cK)(index)],
        });
    }
    if (!transaction)
        throw new errors_transaction/* TransactionNotFoundError */.Kz({
            blockHash,
            blockNumber,
            blockTag,
            hash,
            index,
        });
    const format = client.chain?.formatters?.transaction?.format || formatters_transaction/* formatTransaction */.uP;
    return format(transaction);
}
//# sourceMappingURL=getTransaction.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/getTransactionConfirmations.js



/**
 * Returns the number of blocks passed (confirmations) since the transaction was processed on a block.
 *
 * - Docs: https://viem.sh/docs/actions/public/getTransactionConfirmations
 * - Example: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions/fetching-transactions
 * - JSON-RPC Methods: [`eth_getTransactionConfirmations`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionConfirmations)
 *
 * @param client - Client to use
 * @param parameters - {@link GetTransactionConfirmationsParameters}
 * @returns The number of blocks passed since the transaction was processed. If confirmations is 0, then the Transaction has not been confirmed & processed yet. {@link GetTransactionConfirmationsReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getTransactionConfirmations } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const confirmations = await getTransactionConfirmations(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 */
async function getTransactionConfirmations(client, { hash, transactionReceipt }) {
    const [blockNumber, transaction] = await Promise.all([
        (0,getAction/* getAction */.T)(client, getBlockNumber/* getBlockNumber */.G, 'getBlockNumber')({}),
        hash
            ? (0,getAction/* getAction */.T)(client, getTransaction, 'getBlockNumber')({ hash })
            : undefined,
    ]);
    const transactionBlockNumber = transactionReceipt?.blockNumber || transaction?.blockNumber;
    if (!transactionBlockNumber)
        return 0n;
    return blockNumber - transactionBlockNumber + 1n;
}
//# sourceMappingURL=getTransactionConfirmations.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getTransactionCount.js
var getTransactionCount = __webpack_require__(7755);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/formatters/transactionReceipt.js




const receiptStatuses = {
    '0x0': 'reverted',
    '0x1': 'success',
};
function formatTransactionReceipt(transactionReceipt) {
    const receipt = {
        ...transactionReceipt,
        blockNumber: transactionReceipt.blockNumber
            ? BigInt(transactionReceipt.blockNumber)
            : null,
        contractAddress: transactionReceipt.contractAddress
            ? transactionReceipt.contractAddress
            : null,
        cumulativeGasUsed: transactionReceipt.cumulativeGasUsed
            ? BigInt(transactionReceipt.cumulativeGasUsed)
            : null,
        effectiveGasPrice: transactionReceipt.effectiveGasPrice
            ? BigInt(transactionReceipt.effectiveGasPrice)
            : null,
        gasUsed: transactionReceipt.gasUsed
            ? BigInt(transactionReceipt.gasUsed)
            : null,
        logs: transactionReceipt.logs
            ? transactionReceipt.logs.map((log) => (0,formatters_log/* formatLog */.e)(log))
            : null,
        to: transactionReceipt.to ? transactionReceipt.to : null,
        transactionIndex: transactionReceipt.transactionIndex
            ? (0,fromHex/* hexToNumber */.ME)(transactionReceipt.transactionIndex)
            : null,
        status: transactionReceipt.status
            ? receiptStatuses[transactionReceipt.status]
            : null,
        type: transactionReceipt.type
            ? formatters_transaction/* transactionType */.b4[transactionReceipt.type] || transactionReceipt.type
            : null,
    };
    if (transactionReceipt.blobGasPrice)
        receipt.blobGasPrice = BigInt(transactionReceipt.blobGasPrice);
    if (transactionReceipt.blobGasUsed)
        receipt.blobGasUsed = BigInt(transactionReceipt.blobGasUsed);
    return receipt;
}
const defineTransactionReceipt = /*#__PURE__*/ (/* unused pure expression or super */ null && (defineFormatter('transactionReceipt', formatTransactionReceipt)));
//# sourceMappingURL=transactionReceipt.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/getTransactionReceipt.js


/**
 * Returns the [Transaction Receipt](https://viem.sh/docs/glossary/terms#transaction-receipt) given a [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash.
 *
 * - Docs: https://viem.sh/docs/actions/public/getTransactionReceipt
 * - Example: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions/fetching-transactions
 * - JSON-RPC Methods: [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionreceipt)
 *
 * @param client - Client to use
 * @param parameters - {@link GetTransactionReceiptParameters}
 * @returns The transaction receipt. {@link GetTransactionReceiptReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getTransactionReceipt } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const transactionReceipt = await getTransactionReceipt(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 */
async function getTransactionReceipt(client, { hash }) {
    const receipt = await client.request({
        method: 'eth_getTransactionReceipt',
        params: [hash],
    });
    if (!receipt)
        throw new errors_transaction/* TransactionReceiptNotFoundError */.Kc({ hash });
    const format = client.chain?.formatters?.transactionReceipt?.format ||
        formatTransactionReceipt;
    return format(receipt);
}
//# sourceMappingURL=getTransactionReceipt.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/abi.js
var errors_abi = __webpack_require__(7372);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/errors/getContractError.js
var getContractError = __webpack_require__(2350);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/multicall.js










/**
 * Similar to [`readContract`](https://viem.sh/docs/contract/readContract), but batches up multiple functions on a contract in a single RPC call via the [`multicall3` contract](https://github.com/mds1/multicall).
 *
 * - Docs: https://viem.sh/docs/contract/multicall
 *
 * @param client - Client to use
 * @param parameters - {@link MulticallParameters}
 * @returns An array of results with accompanying status. {@link MulticallReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { multicall } from 'viem/contract'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const abi = parseAbi([
 *   'function balanceOf(address) view returns (uint256)',
 *   'function totalSupply() view returns (uint256)',
 * ])
 * const results = await multicall(client, {
 *   contracts: [
 *     {
 *       address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *       abi,
 *       functionName: 'balanceOf',
 *       args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
 *     },
 *     {
 *       address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *       abi,
 *       functionName: 'totalSupply',
 *     },
 *   ],
 * })
 * // [{ result: 424122n, status: 'success' }, { result: 1000000n, status: 'success' }]
 */
async function multicall(client, parameters) {
    const { allowFailure = true, batchSize: batchSize_, blockNumber, blockTag, multicallAddress: multicallAddress_, stateOverride, } = parameters;
    const contracts = parameters.contracts;
    const batchSize = batchSize_ ??
        ((typeof client.batch?.multicall === 'object' &&
            client.batch.multicall.batchSize) ||
            1_024);
    let multicallAddress = multicallAddress_;
    if (!multicallAddress) {
        if (!client.chain)
            throw new Error('client chain not configured. multicallAddress is required.');
        multicallAddress = (0,getChainContractAddress/* getChainContractAddress */.M)({
            blockNumber,
            chain: client.chain,
            contract: 'multicall3',
        });
    }
    const chunkedCalls = [[]];
    let currentChunk = 0;
    let currentChunkSize = 0;
    for (let i = 0; i < contracts.length; i++) {
        const { abi, address, args, functionName } = contracts[i];
        try {
            const callData = (0,encodeFunctionData/* encodeFunctionData */.p)({ abi, args, functionName });
            currentChunkSize += (callData.length - 2) / 2;
            // Check to see if we need to create a new chunk.
            if (
            // Check if batching is enabled.
            batchSize > 0 &&
                // Check if the current size of the batch exceeds the size limit.
                currentChunkSize > batchSize &&
                // Check if the current chunk is not already empty.
                chunkedCalls[currentChunk].length > 0) {
                currentChunk++;
                currentChunkSize = (callData.length - 2) / 2;
                chunkedCalls[currentChunk] = [];
            }
            chunkedCalls[currentChunk] = [
                ...chunkedCalls[currentChunk],
                {
                    allowFailure: true,
                    callData,
                    target: address,
                },
            ];
        }
        catch (err) {
            const error = (0,getContractError/* getContractError */.j)(err, {
                abi,
                address,
                args,
                docsPath: '/docs/contract/multicall',
                functionName,
            });
            if (!allowFailure)
                throw error;
            chunkedCalls[currentChunk] = [
                ...chunkedCalls[currentChunk],
                {
                    allowFailure: true,
                    callData: '0x',
                    target: address,
                },
            ];
        }
    }
    const aggregate3Results = await Promise.allSettled(chunkedCalls.map((calls) => (0,getAction/* getAction */.T)(client, readContract/* readContract */.J, 'readContract')({
        abi: abis/* multicall3Abi */.v2,
        address: multicallAddress,
        args: [calls],
        blockNumber,
        blockTag,
        functionName: 'aggregate3',
        stateOverride,
    })));
    const results = [];
    for (let i = 0; i < aggregate3Results.length; i++) {
        const result = aggregate3Results[i];
        // If an error occurred in a `readContract` invocation (ie. network error),
        // then append the failure reason to each contract result.
        if (result.status === 'rejected') {
            if (!allowFailure)
                throw result.reason;
            for (let j = 0; j < chunkedCalls[i].length; j++) {
                results.push({
                    status: 'failure',
                    error: result.reason,
                    result: undefined,
                });
            }
            continue;
        }
        // If the `readContract` call was successful, then decode the results.
        const aggregate3Result = result.value;
        for (let j = 0; j < aggregate3Result.length; j++) {
            // Extract the response from `readContract`
            const { returnData, success } = aggregate3Result[j];
            // Extract the request call data from the original call.
            const { callData } = chunkedCalls[i][j];
            // Extract the contract config for this call from the `contracts` argument
            // for decoding.
            const { abi, address, functionName, args } = contracts[results.length];
            try {
                if (callData === '0x')
                    throw new errors_abi/* AbiDecodingZeroDataError */.O();
                if (!success)
                    throw new contract/* RawContractError */.$S({ data: returnData });
                const result = (0,decodeFunctionResult/* decodeFunctionResult */.e)({
                    abi,
                    args,
                    data: returnData,
                    functionName,
                });
                results.push(allowFailure ? { result, status: 'success' } : result);
            }
            catch (err) {
                const error = (0,getContractError/* getContractError */.j)(err, {
                    abi,
                    address,
                    args,
                    docsPath: '/docs/contract/multicall',
                    functionName,
                });
                if (!allowFailure)
                    throw error;
                results.push({ error, result: undefined, status: 'failure' });
            }
        }
    }
    if (results.length !== contracts.length)
        throw new base/* BaseError */.C('multicall results mismatch');
    return results;
}
//# sourceMappingURL=multicall.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/simulateContract.js
var simulateContract = __webpack_require__(8318);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/uninstallFilter.js
var uninstallFilter = __webpack_require__(5980);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/constants/strings.js
const presignMessagePrefix = '\x19Ethereum Signed Message:\n';
//# sourceMappingURL=strings.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/signature/hashMessage.js




function hashMessage(message, to_) {
    const messageBytes = (() => {
        if (typeof message === 'string')
            return (0,toBytes/* stringToBytes */.Af)(message);
        if (message.raw instanceof Uint8Array)
            return message.raw;
        return (0,toBytes/* toBytes */.ZJ)(message.raw);
    })();
    const prefixBytes = (0,toBytes/* stringToBytes */.Af)(`${presignMessagePrefix}${messageBytes.length}`);
    return (0,keccak256/* keccak256 */.S)((0,concat/* concat */.xW)([prefixBytes, messageBytes]), to_);
}
//# sourceMappingURL=hashMessage.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/constants/contracts.js
const universalSignatureValidatorByteCode = '0x60806040523480156200001157600080fd5b50604051620007003803806200070083398101604081905262000034916200056f565b6000620000438484846200004f565b9050806000526001601ff35b600080846001600160a01b0316803b806020016040519081016040528181526000908060200190933c90507f6492649264926492649264926492649264926492649264926492649264926492620000a68462000451565b036200021f57600060608085806020019051810190620000c79190620005ce565b8651929550909350915060000362000192576000836001600160a01b031683604051620000f5919062000643565b6000604051808303816000865af19150503d806000811462000134576040519150601f19603f3d011682016040523d82523d6000602084013e62000139565b606091505b5050905080620001905760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b505b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90620001c4908b90869060040162000661565b602060405180830381865afa158015620001e2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200020891906200069d565b6001600160e01b031916149450505050506200044a565b805115620002b157604051630b135d3f60e11b808252906001600160a01b03871690631626ba7e9062000259908890889060040162000661565b602060405180830381865afa15801562000277573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200029d91906200069d565b6001600160e01b031916149150506200044a565b8251604114620003195760405162461bcd60e51b815260206004820152603a6024820152600080516020620006e083398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e677468000000000000606482015260840162000187565b620003236200046b565b506020830151604080850151855186939260009185919081106200034b576200034b620006c9565b016020015160f81c9050601b81148015906200036b57508060ff16601c14155b15620003cf5760405162461bcd60e51b815260206004820152603b6024820152600080516020620006e083398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c75650000000000606482015260840162000187565b6040805160008152602081018083528a905260ff83169181019190915260608101849052608081018390526001600160a01b038a169060019060a0016020604051602081039080840390855afa1580156200042e573d6000803e3d6000fd5b505050602060405103516001600160a01b031614955050505050505b9392505050565b60006020825110156200046357600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b03811681146200049f57600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b83811015620004d5578181015183820152602001620004bb565b50506000910152565b600082601f830112620004f057600080fd5b81516001600160401b03808211156200050d576200050d620004a2565b604051601f8301601f19908116603f01168101908282118183101715620005385762000538620004a2565b816040528381528660208588010111156200055257600080fd5b62000565846020830160208901620004b8565b9695505050505050565b6000806000606084860312156200058557600080fd5b8351620005928162000489565b6020850151604086015191945092506001600160401b03811115620005b657600080fd5b620005c486828701620004de565b9150509250925092565b600080600060608486031215620005e457600080fd5b8351620005f18162000489565b60208501519093506001600160401b03808211156200060f57600080fd5b6200061d87838801620004de565b935060408601519150808211156200063457600080fd5b50620005c486828701620004de565b6000825162000657818460208701620004b8565b9190910192915050565b828152604060208201526000825180604084015262000688816060850160208701620004b8565b601f01601f1916919091016060019392505050565b600060208284031215620006b057600080fd5b81516001600160e01b0319811681146200044a57600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572';
//# sourceMappingURL=contracts.js.map
;// CONCATENATED MODULE: ./node_modules/@noble/curves/esm/abstract/utils.js
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// 100 lines of code in the file are duplicated from noble-hashes (utils).
// This is OK: `abstract` directory does not use noble-hashes.
// User may opt-in into using different hashing library. This way, noble-hashes
// won't be included into their bundle.
const _0n = BigInt(0);
const _1n = BigInt(1);
const _2n = BigInt(2);
const u8a = (a) => a instanceof Uint8Array;
const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));
/**
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
function bytesToHex(bytes) {
    if (!u8a(bytes))
        throw new Error('Uint8Array expected');
    // pre-caching improves the speed 6x
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += hexes[bytes[i]];
    }
    return hex;
}
function numberToHexUnpadded(num) {
    const hex = num.toString(16);
    return hex.length & 1 ? `0${hex}` : hex;
}
function hexToNumber(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    // Big Endian
    return BigInt(hex === '' ? '0' : `0x${hex}`);
}
/**
 * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
 */
function hexToBytes(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    const len = hex.length;
    if (len % 2)
        throw new Error('padded hex string expected, got unpadded hex of length ' + len);
    const array = new Uint8Array(len / 2);
    for (let i = 0; i < array.length; i++) {
        const j = i * 2;
        const hexByte = hex.slice(j, j + 2);
        const byte = Number.parseInt(hexByte, 16);
        if (Number.isNaN(byte) || byte < 0)
            throw new Error('Invalid byte sequence');
        array[i] = byte;
    }
    return array;
}
// BE: Big Endian, LE: Little Endian
function bytesToNumberBE(bytes) {
    return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
    if (!u8a(bytes))
        throw new Error('Uint8Array expected');
    return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE(n, len) {
    return hexToBytes(n.toString(16).padStart(len * 2, '0'));
}
function numberToBytesLE(n, len) {
    return numberToBytesBE(n, len).reverse();
}
// Unpadded, rarely used
function numberToVarBytesBE(n) {
    return hexToBytes(numberToHexUnpadded(n));
}
/**
 * Takes hex string or Uint8Array, converts to Uint8Array.
 * Validates output length.
 * Will throw error for other types.
 * @param title descriptive title for an error e.g. 'private key'
 * @param hex hex string or Uint8Array
 * @param expectedLength optional, will compare to result array's length
 * @returns
 */
function ensureBytes(title, hex, expectedLength) {
    let res;
    if (typeof hex === 'string') {
        try {
            res = hexToBytes(hex);
        }
        catch (e) {
            throw new Error(`${title} must be valid hex string, got "${hex}". Cause: ${e}`);
        }
    }
    else if (u8a(hex)) {
        // Uint8Array.from() instead of hash.slice() because node.js Buffer
        // is instance of Uint8Array, and its slice() creates **mutable** copy
        res = Uint8Array.from(hex);
    }
    else {
        throw new Error(`${title} must be hex string or Uint8Array`);
    }
    const len = res.length;
    if (typeof expectedLength === 'number' && len !== expectedLength)
        throw new Error(`${title} expected ${expectedLength} bytes, got ${len}`);
    return res;
}
/**
 * Copies several Uint8Arrays into one.
 */
function concatBytes(...arrays) {
    const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));
    let pad = 0; // walk through each item, ensure they have proper type
    arrays.forEach((a) => {
        if (!u8a(a))
            throw new Error('Uint8Array expected');
        r.set(a, pad);
        pad += a.length;
    });
    return r;
}
function equalBytes(b1, b2) {
    // We don't care about timing attacks here
    if (b1.length !== b2.length)
        return false;
    for (let i = 0; i < b1.length; i++)
        if (b1[i] !== b2[i])
            return false;
    return true;
}
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes(str) {
    if (typeof str !== 'string')
        throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
    return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
}
// Bit operations
/**
 * Calculates amount of bits in a bigint.
 * Same as `n.toString(2).length`
 */
function bitLen(n) {
    let len;
    for (len = 0; n > _0n; n >>= _1n, len += 1)
        ;
    return len;
}
/**
 * Gets single bit at position.
 * NOTE: first bit position is 0 (same as arrays)
 * Same as `!!+Array.from(n.toString(2)).reverse()[pos]`
 */
function bitGet(n, pos) {
    return (n >> BigInt(pos)) & _1n;
}
/**
 * Sets single bit at position.
 */
const bitSet = (n, pos, value) => {
    return n | ((value ? _1n : _0n) << BigInt(pos));
};
/**
 * Calculate mask for N bits. Not using ** operator with bigints because of old engines.
 * Same as BigInt(`0b${Array(i).fill('1').join('')}`)
 */
const bitMask = (n) => (_2n << BigInt(n - 1)) - _1n;
// DRBG
const u8n = (data) => new Uint8Array(data); // creates Uint8Array
const u8fr = (arr) => Uint8Array.from(arr); // another shortcut
/**
 * Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
 * @returns function that will call DRBG until 2nd arg returns something meaningful
 * @example
 *   const drbg = createHmacDRBG<Key>(32, 32, hmac);
 *   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
 */
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
    if (typeof hashLen !== 'number' || hashLen < 2)
        throw new Error('hashLen must be a number');
    if (typeof qByteLen !== 'number' || qByteLen < 2)
        throw new Error('qByteLen must be a number');
    if (typeof hmacFn !== 'function')
        throw new Error('hmacFn must be a function');
    // Step B, Step C: set hashLen to 8*ceil(hlen/8)
    let v = u8n(hashLen); // Minimal non-full-spec HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
    let k = u8n(hashLen); // Steps B and C of RFC6979 3.2: set hashLen, in our case always same
    let i = 0; // Iterations counter, will throw when over 1000
    const reset = () => {
        v.fill(1);
        k.fill(0);
        i = 0;
    };
    const h = (...b) => hmacFn(k, v, ...b); // hmac(k)(v, ...values)
    const reseed = (seed = u8n()) => {
        // HMAC-DRBG reseed() function. Steps D-G
        k = h(u8fr([0x00]), seed); // k = hmac(k || v || 0x00 || seed)
        v = h(); // v = hmac(k || v)
        if (seed.length === 0)
            return;
        k = h(u8fr([0x01]), seed); // k = hmac(k || v || 0x01 || seed)
        v = h(); // v = hmac(k || v)
    };
    const gen = () => {
        // HMAC-DRBG generate() function
        if (i++ >= 1000)
            throw new Error('drbg: tried 1000 values');
        let len = 0;
        const out = [];
        while (len < qByteLen) {
            v = h();
            const sl = v.slice();
            out.push(sl);
            len += v.length;
        }
        return concatBytes(...out);
    };
    const genUntil = (seed, pred) => {
        reset();
        reseed(seed); // Steps D-G
        let res = undefined; // Step H: grind until k is in [1..n-1]
        while (!(res = pred(gen())))
            reseed();
        reset();
        return res;
    };
    return genUntil;
}
// Validating curves and fields
const validatorFns = {
    bigint: (val) => typeof val === 'bigint',
    function: (val) => typeof val === 'function',
    boolean: (val) => typeof val === 'boolean',
    string: (val) => typeof val === 'string',
    stringOrUint8Array: (val) => typeof val === 'string' || val instanceof Uint8Array,
    isSafeInteger: (val) => Number.isSafeInteger(val),
    array: (val) => Array.isArray(val),
    field: (val, object) => object.Fp.isValid(val),
    hash: (val) => typeof val === 'function' && Number.isSafeInteger(val.outputLen),
};
// type Record<K extends string | number | symbol, T> = { [P in K]: T; }
function validateObject(object, validators, optValidators = {}) {
    const checkField = (fieldName, type, isOptional) => {
        const checkVal = validatorFns[type];
        if (typeof checkVal !== 'function')
            throw new Error(`Invalid validator "${type}", expected function`);
        const val = object[fieldName];
        if (isOptional && val === undefined)
            return;
        if (!checkVal(val, object)) {
            throw new Error(`Invalid param ${String(fieldName)}=${val} (${typeof val}), expected ${type}`);
        }
    };
    for (const [fieldName, type] of Object.entries(validators))
        checkField(fieldName, type, false);
    for (const [fieldName, type] of Object.entries(optValidators))
        checkField(fieldName, type, true);
    return object;
}
// validate type tests
// const o: { a: number; b: number; c: number } = { a: 1, b: 5, c: 6 };
// const z0 = validateObject(o, { a: 'isSafeInteger' }, { c: 'bigint' }); // Ok!
// // Should fail type-check
// const z1 = validateObject(o, { a: 'tmp' }, { c: 'zz' });
// const z2 = validateObject(o, { a: 'isSafeInteger' }, { c: 'zz' });
// const z3 = validateObject(o, { test: 'boolean', z: 'bug' });
// const z4 = validateObject(o, { a: 'boolean', z: 'bug' });
//# sourceMappingURL=utils.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/data/isBytesEqual.js



function isBytesEqual(a_, b_) {
    const a = (0,isHex/* isHex */.q)(a_) ? (0,toBytes/* toBytes */.ZJ)(a_) : a_;
    const b = (0,isHex/* isHex */.q)(b_) ? (0,toBytes/* toBytes */.ZJ)(b_) : b_;
    return equalBytes(a, b);
}
//# sourceMappingURL=isBytesEqual.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/encodeDeployData.js
var encodeDeployData = __webpack_require__(5842);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/verifyHash.js







/**
 * Verifies a message hash on chain using ERC-6492.
 *
 * @param client - Client to use.
 * @param parameters - {@link VerifyHashParameters}
 * @returns Whether or not the signature is valid. {@link VerifyHashReturnType}
 */
async function verifyHash(client, { address, hash, signature, ...callRequest }) {
    const signatureHex = (0,isHex/* isHex */.q)(signature) ? signature : (0,toHex/* toHex */.nj)(signature);
    try {
        const { data } = await (0,getAction/* getAction */.T)(client, call/* call */.T1, 'call')({
            data: (0,encodeDeployData/* encodeDeployData */.m)({
                abi: abis/* universalSignatureValidatorAbi */._,
                args: [address, hash, signatureHex],
                bytecode: universalSignatureValidatorByteCode,
            }),
            ...callRequest,
        });
        return isBytesEqual(data ?? '0x0', '0x1');
    }
    catch (error) {
        if (error instanceof contract/* CallExecutionError */.zX) {
            // if the execution fails, the signature was not valid and an internal method inside of the validator reverted
            // this can happen for many reasons, for example if signer can not be recovered from the signature
            // or if the signature has no valid format
            return false;
        }
        throw error;
    }
}
//# sourceMappingURL=verifyHash.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/verifyMessage.js


/**
 * Verify that a message was signed by the provided address.
 *
 * Compatible with Smart Contract Accounts & Externally Owned Accounts via [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492).
 *
 * - Docs {@link https://viem.sh/docs/actions/public/verifyMessage}
 *
 * @param client - Client to use.
 * @param parameters - {@link VerifyMessageParameters}
 * @returns Whether or not the signature is valid. {@link VerifyMessageReturnType}
 */
async function verifyMessage(client, { address, message, signature, ...callRequest }) {
    const hash = hashMessage(message);
    return verifyHash(client, {
        address,
        hash,
        signature,
        ...callRequest,
    });
}
//# sourceMappingURL=verifyMessage.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/encodeAbiParameters.js
var encodeAbiParameters = __webpack_require__(4531);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/typedData.js + 1 modules
var typedData = __webpack_require__(988);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/signature/hashTypedData.js
// Implementation forked and adapted from https://github.com/MetaMask/eth-sig-util/blob/main/src/sign-typed-data.ts





function hashTypedData(parameters) {
    const { domain = {}, message, primaryType, } = parameters;
    const types = {
        EIP712Domain: (0,typedData/* getTypesForEIP712Domain */.H4)({ domain }),
        ...parameters.types,
    };
    // Need to do a runtime validation check on addresses, byte ranges, integer ranges, etc
    // as we can't statically check this with TypeScript.
    (0,typedData/* validateTypedData */.$$)({
        domain,
        message,
        primaryType,
        types,
    });
    const parts = ['0x1901'];
    if (domain)
        parts.push(hashDomain({
            domain,
            types: types,
        }));
    if (primaryType !== 'EIP712Domain')
        parts.push(hashStruct({
            data: message,
            primaryType,
            types: types,
        }));
    return (0,keccak256/* keccak256 */.S)((0,concat/* concat */.xW)(parts));
}
function hashDomain({ domain, types, }) {
    return hashStruct({
        data: domain,
        primaryType: 'EIP712Domain',
        types,
    });
}
function hashStruct({ data, primaryType, types, }) {
    const encoded = encodeData({
        data,
        primaryType,
        types,
    });
    return (0,keccak256/* keccak256 */.S)(encoded);
}
function encodeData({ data, primaryType, types, }) {
    const encodedTypes = [{ type: 'bytes32' }];
    const encodedValues = [hashType({ primaryType, types })];
    for (const field of types[primaryType]) {
        const [type, value] = encodeField({
            types,
            name: field.name,
            type: field.type,
            value: data[field.name],
        });
        encodedTypes.push(type);
        encodedValues.push(value);
    }
    return (0,encodeAbiParameters/* encodeAbiParameters */.h)(encodedTypes, encodedValues);
}
function hashType({ primaryType, types, }) {
    const encodedHashType = (0,toHex/* toHex */.nj)(encodeType({ primaryType, types }));
    return (0,keccak256/* keccak256 */.S)(encodedHashType);
}
function encodeType({ primaryType, types, }) {
    let result = '';
    const unsortedDeps = findTypeDependencies({ primaryType, types });
    unsortedDeps.delete(primaryType);
    const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
    for (const type of deps) {
        result += `${type}(${types[type]
            .map(({ name, type: t }) => `${t} ${name}`)
            .join(',')})`;
    }
    return result;
}
function findTypeDependencies({ primaryType: primaryType_, types, }, results = new Set()) {
    const match = primaryType_.match(/^\w*/u);
    const primaryType = match?.[0];
    if (results.has(primaryType) || types[primaryType] === undefined) {
        return results;
    }
    results.add(primaryType);
    for (const field of types[primaryType]) {
        findTypeDependencies({ primaryType: field.type, types }, results);
    }
    return results;
}
function encodeField({ types, name, type, value, }) {
    if (types[type] !== undefined) {
        return [
            { type: 'bytes32' },
            (0,keccak256/* keccak256 */.S)(encodeData({ data: value, primaryType: type, types })),
        ];
    }
    if (type === 'bytes') {
        const prepend = value.length % 2 ? '0' : '';
        value = `0x${prepend + value.slice(2)}`;
        return [{ type: 'bytes32' }, (0,keccak256/* keccak256 */.S)(value)];
    }
    if (type === 'string')
        return [{ type: 'bytes32' }, (0,keccak256/* keccak256 */.S)((0,toHex/* toHex */.nj)(value))];
    if (type.lastIndexOf(']') === type.length - 1) {
        const parsedType = type.slice(0, type.lastIndexOf('['));
        const typeValuePairs = value.map((item) => encodeField({
            name,
            type: parsedType,
            types,
            value: item,
        }));
        return [
            { type: 'bytes32' },
            (0,keccak256/* keccak256 */.S)((0,encodeAbiParameters/* encodeAbiParameters */.h)(typeValuePairs.map(([t]) => t), typeValuePairs.map(([, v]) => v))),
        ];
    }
    return [{ type }, value];
}
//# sourceMappingURL=hashTypedData.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/verifyTypedData.js


/**
 * Verify that typed data was signed by the provided address.
 *
 * - Docs {@link https://viem.sh/docs/actions/public/verifyTypedData}
 *
 * @param client - Client to use.
 * @param parameters - {@link VerifyTypedDataParameters}
 * @returns Whether or not the signature is valid. {@link VerifyTypedDataReturnType}
 */
async function verifyTypedData(client, parameters) {
    const { address, signature, message, primaryType, types, domain, ...callRequest } = parameters;
    const hash = hashTypedData({ message, primaryType, types, domain });
    return verifyHash(client, {
        address,
        hash,
        signature,
        ...callRequest,
    });
}
//# sourceMappingURL=verifyTypedData.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/block.js
var errors_block = __webpack_require__(4259);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/observe.js
var observe = __webpack_require__(9726);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/promise/withRetry.js
var withRetry = __webpack_require__(9910);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/stringify.js
var stringify = __webpack_require__(8463);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/poll.js
var poll = __webpack_require__(5213);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/watchBlockNumber.js






/**
 * Watches and returns incoming block numbers.
 *
 * - Docs: https://viem.sh/docs/actions/public/watchBlockNumber
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks/watching-blocks
 * - JSON-RPC Methods:
 *   - When `poll: true`, calls [`eth_blockNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber) on a polling interval.
 *   - When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newHeads"` event.
 *
 * @param client - Client to use
 * @param parameters - {@link WatchBlockNumberParameters}
 * @returns A function that can be invoked to stop watching for new block numbers. {@link WatchBlockNumberReturnType}
 *
 * @example
 * import { createPublicClient, watchBlockNumber, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const unwatch = watchBlockNumber(client, {
 *   onBlockNumber: (blockNumber) => console.log(blockNumber),
 * })
 */
function watchBlockNumber(client, { emitOnBegin = false, emitMissed = false, onBlockNumber, onError, poll: poll_, pollingInterval = client.pollingInterval, }) {
    const enablePolling = typeof poll_ !== 'undefined' ? poll_ : client.transport.type !== 'webSocket';
    let prevBlockNumber;
    const pollBlockNumber = () => {
        const observerId = (0,stringify/* stringify */.A)([
            'watchBlockNumber',
            client.uid,
            emitOnBegin,
            emitMissed,
            pollingInterval,
        ]);
        return (0,observe/* observe */.lB)(observerId, { onBlockNumber, onError }, (emit) => (0,poll/* poll */.w)(async () => {
            try {
                const blockNumber = await (0,getAction/* getAction */.T)(client, getBlockNumber/* getBlockNumber */.G, 'getBlockNumber')({ cacheTime: 0 });
                if (prevBlockNumber) {
                    // If the current block number is the same as the previous,
                    // we can skip.
                    if (blockNumber === prevBlockNumber)
                        return;
                    // If we have missed out on some previous blocks, and the
                    // `emitMissed` flag is truthy, let's emit those blocks.
                    if (blockNumber - prevBlockNumber > 1 && emitMissed) {
                        for (let i = prevBlockNumber + 1n; i < blockNumber; i++) {
                            emit.onBlockNumber(i, prevBlockNumber);
                            prevBlockNumber = i;
                        }
                    }
                }
                // If the next block number is greater than the previous,
                // it is not in the past, and we can emit the new block number.
                if (!prevBlockNumber || blockNumber > prevBlockNumber) {
                    emit.onBlockNumber(blockNumber, prevBlockNumber);
                    prevBlockNumber = blockNumber;
                }
            }
            catch (err) {
                emit.onError?.(err);
            }
        }, {
            emitOnBegin,
            interval: pollingInterval,
        }));
    };
    const subscribeBlockNumber = () => {
        const observerId = (0,stringify/* stringify */.A)([
            'watchBlockNumber',
            client.uid,
            emitOnBegin,
            emitMissed,
        ]);
        return (0,observe/* observe */.lB)(observerId, { onBlockNumber, onError }, (emit) => {
            let active = true;
            let unsubscribe = () => (active = false);
            (async () => {
                try {
                    const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
                        params: ['newHeads'],
                        onData(data) {
                            if (!active)
                                return;
                            const blockNumber = (0,fromHex/* hexToBigInt */.uU)(data.result?.number);
                            emit.onBlockNumber(blockNumber, prevBlockNumber);
                            prevBlockNumber = blockNumber;
                        },
                        onError(error) {
                            emit.onError?.(error);
                        },
                    });
                    unsubscribe = unsubscribe_;
                    if (!active)
                        unsubscribe();
                }
                catch (err) {
                    onError?.(err);
                }
            })();
            return () => unsubscribe();
        });
    };
    return enablePolling ? pollBlockNumber() : subscribeBlockNumber();
}
//# sourceMappingURL=watchBlockNumber.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/waitForTransactionReceipt.js










/**
 * Waits for the [Transaction](https://viem.sh/docs/glossary/terms#transaction) to be included on a [Block](https://viem.sh/docs/glossary/terms#block) (one confirmation), and then returns the [Transaction Receipt](https://viem.sh/docs/glossary/terms#transaction-receipt). If the Transaction reverts, then the action will throw an error.
 *
 * - Docs: https://viem.sh/docs/actions/public/waitForTransactionReceipt
 * - Example: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions/sending-transactions
 * - JSON-RPC Methods:
 *   - Polls [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt) on each block until it has been processed.
 *   - If a Transaction has been replaced:
 *     - Calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber) and extracts the transactions
 *     - Checks if one of the Transactions is a replacement
 *     - If so, calls [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt).
 *
 * The `waitForTransactionReceipt` action additionally supports Replacement detection (e.g. sped up Transactions).
 *
 * Transactions can be replaced when a user modifies their transaction in their wallet (to speed up or cancel). Transactions are replaced when they are sent from the same nonce.
 *
 * There are 3 types of Transaction Replacement reasons:
 *
 * - `repriced`: The gas price has been modified (e.g. different `maxFeePerGas`)
 * - `cancelled`: The Transaction has been cancelled (e.g. `value === 0n`)
 * - `replaced`: The Transaction has been replaced (e.g. different `value` or `data`)
 *
 * @param client - Client to use
 * @param parameters - {@link WaitForTransactionReceiptParameters}
 * @returns The transaction receipt. {@link WaitForTransactionReceiptReturnType}
 *
 * @example
 * import { createPublicClient, waitForTransactionReceipt, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const transactionReceipt = await waitForTransactionReceipt(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 */
async function waitForTransactionReceipt(client, { confirmations = 1, hash, onReplaced, pollingInterval = client.pollingInterval, retryCount = 6, retryDelay = ({ count }) => ~~(1 << count) * 200, // exponential backoff
timeout, }) {
    const observerId = (0,stringify/* stringify */.A)(['waitForTransactionReceipt', client.uid, hash]);
    let transaction;
    let replacedTransaction;
    let receipt;
    let retrying = false;
    return new Promise((resolve, reject) => {
        if (timeout)
            setTimeout(() => reject(new errors_transaction/* WaitForTransactionReceiptTimeoutError */.WA({ hash })), timeout);
        const _unobserve = (0,observe/* observe */.lB)(observerId, { onReplaced, resolve, reject }, (emit) => {
            const _unwatch = (0,getAction/* getAction */.T)(client, watchBlockNumber, 'watchBlockNumber')({
                emitMissed: true,
                emitOnBegin: true,
                poll: true,
                pollingInterval,
                async onBlockNumber(blockNumber_) {
                    if (retrying)
                        return;
                    let blockNumber = blockNumber_;
                    const done = (fn) => {
                        _unwatch();
                        fn();
                        _unobserve();
                    };
                    try {
                        // If we already have a valid receipt, let's check if we have enough
                        // confirmations. If we do, then we can resolve.
                        if (receipt) {
                            if (confirmations > 1 &&
                                (!receipt.blockNumber ||
                                    blockNumber - receipt.blockNumber + 1n < confirmations))
                                return;
                            done(() => emit.resolve(receipt));
                            return;
                        }
                        // Get the transaction to check if it's been replaced.
                        // We need to retry as some RPC Providers may be slow to sync
                        // up mined transactions.
                        if (!transaction) {
                            retrying = true;
                            await (0,withRetry/* withRetry */.b)(async () => {
                                transaction = (await (0,getAction/* getAction */.T)(client, getTransaction, 'getTransaction')({ hash }));
                                if (transaction.blockNumber)
                                    blockNumber = transaction.blockNumber;
                            }, {
                                delay: retryDelay,
                                retryCount,
                            });
                            retrying = false;
                        }
                        // Get the receipt to check if it's been processed.
                        receipt = await (0,getAction/* getAction */.T)(client, getTransactionReceipt, 'getTransactionReceipt')({ hash });
                        // Check if we have enough confirmations. If not, continue polling.
                        if (confirmations > 1 &&
                            (!receipt.blockNumber ||
                                blockNumber - receipt.blockNumber + 1n < confirmations))
                            return;
                        done(() => emit.resolve(receipt));
                    }
                    catch (err) {
                        // If the receipt is not found, the transaction will be pending.
                        // We need to check if it has potentially been replaced.
                        if (err instanceof errors_transaction/* TransactionNotFoundError */.Kz ||
                            err instanceof errors_transaction/* TransactionReceiptNotFoundError */.Kc) {
                            if (!transaction) {
                                retrying = false;
                                return;
                            }
                            try {
                                replacedTransaction = transaction;
                                // Let's retrieve the transactions from the current block.
                                // We need to retry as some RPC Providers may be slow to sync
                                // up mined blocks.
                                retrying = true;
                                const block = await (0,withRetry/* withRetry */.b)(() => (0,getAction/* getAction */.T)(client, getBlock/* getBlock */.g, 'getBlock')({
                                    blockNumber,
                                    includeTransactions: true,
                                }), {
                                    delay: retryDelay,
                                    retryCount,
                                    shouldRetry: ({ error }) => error instanceof errors_block/* BlockNotFoundError */.l,
                                });
                                retrying = false;
                                const replacementTransaction = block.transactions.find(({ from, nonce }) => from === replacedTransaction.from &&
                                    nonce === replacedTransaction.nonce);
                                // If we couldn't find a replacement transaction, continue polling.
                                if (!replacementTransaction)
                                    return;
                                // If we found a replacement transaction, return it's receipt.
                                receipt = await (0,getAction/* getAction */.T)(client, getTransactionReceipt, 'getTransactionReceipt')({
                                    hash: replacementTransaction.hash,
                                });
                                // Check if we have enough confirmations. If not, continue polling.
                                if (confirmations > 1 &&
                                    (!receipt.blockNumber ||
                                        blockNumber - receipt.blockNumber + 1n < confirmations))
                                    return;
                                let reason = 'replaced';
                                if (replacementTransaction.to === replacedTransaction.to &&
                                    replacementTransaction.value === replacedTransaction.value) {
                                    reason = 'repriced';
                                }
                                else if (replacementTransaction.from === replacementTransaction.to &&
                                    replacementTransaction.value === 0n) {
                                    reason = 'cancelled';
                                }
                                done(() => {
                                    emit.onReplaced?.({
                                        reason,
                                        replacedTransaction: replacedTransaction,
                                        transaction: replacementTransaction,
                                        transactionReceipt: receipt,
                                    });
                                    emit.resolve(receipt);
                                });
                            }
                            catch (err_) {
                                done(() => emit.reject(err_));
                            }
                        }
                        else {
                            done(() => emit.reject(err));
                        }
                    }
                },
            });
        });
    });
}
//# sourceMappingURL=waitForTransactionReceipt.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/formatters/block.js
var formatters_block = __webpack_require__(5385);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/watchBlocks.js






/**
 * Watches and returns information for incoming blocks.
 *
 * - Docs: https://viem.sh/docs/actions/public/watchBlocks
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks/watching-blocks
 * - JSON-RPC Methods:
 *   - When `poll: true`, calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getBlockByNumber) on a polling interval.
 *   - When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newHeads"` event.
 *
 * @param client - Client to use
 * @param parameters - {@link WatchBlocksParameters}
 * @returns A function that can be invoked to stop watching for new block numbers. {@link WatchBlocksReturnType}
 *
 * @example
 * import { createPublicClient, watchBlocks, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const unwatch = watchBlocks(client, {
 *   onBlock: (block) => console.log(block),
 * })
 */
function watchBlocks(client, { blockTag = 'latest', emitMissed = false, emitOnBegin = false, onBlock, onError, includeTransactions: includeTransactions_, poll: poll_, pollingInterval = client.pollingInterval, }) {
    const enablePolling = typeof poll_ !== 'undefined' ? poll_ : client.transport.type !== 'webSocket';
    const includeTransactions = includeTransactions_ ?? false;
    let prevBlock;
    const pollBlocks = () => {
        const observerId = (0,stringify/* stringify */.A)([
            'watchBlocks',
            client.uid,
            blockTag,
            emitMissed,
            emitOnBegin,
            includeTransactions,
            pollingInterval,
        ]);
        return (0,observe/* observe */.lB)(observerId, { onBlock, onError }, (emit) => (0,poll/* poll */.w)(async () => {
            try {
                const block = await (0,getAction/* getAction */.T)(client, getBlock/* getBlock */.g, 'getBlock')({
                    blockTag,
                    includeTransactions,
                });
                if (block.number && prevBlock?.number) {
                    // If the current block number is the same as the previous,
                    // we can skip.
                    if (block.number === prevBlock.number)
                        return;
                    // If we have missed out on some previous blocks, and the
                    // `emitMissed` flag is truthy, let's emit those blocks.
                    if (block.number - prevBlock.number > 1 && emitMissed) {
                        for (let i = prevBlock?.number + 1n; i < block.number; i++) {
                            const block = (await (0,getAction/* getAction */.T)(client, getBlock/* getBlock */.g, 'getBlock')({
                                blockNumber: i,
                                includeTransactions,
                            }));
                            emit.onBlock(block, prevBlock);
                            prevBlock = block;
                        }
                    }
                }
                if (
                // If no previous block exists, emit.
                !prevBlock?.number ||
                    // If the block tag is "pending" with no block number, emit.
                    (blockTag === 'pending' && !block?.number) ||
                    // If the next block number is greater than the previous block number, emit.
                    // We don't want to emit blocks in the past.
                    (block.number && block.number > prevBlock.number)) {
                    emit.onBlock(block, prevBlock);
                    prevBlock = block;
                }
            }
            catch (err) {
                emit.onError?.(err);
            }
        }, {
            emitOnBegin,
            interval: pollingInterval,
        }));
    };
    const subscribeBlocks = () => {
        let active = true;
        let unsubscribe = () => (active = false);
        (async () => {
            try {
                const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
                    params: ['newHeads'],
                    onData(data) {
                        if (!active)
                            return;
                        const format = client.chain?.formatters?.block?.format || formatters_block/* formatBlock */.$;
                        const block = format(data.result);
                        onBlock(block, prevBlock);
                        prevBlock = block;
                    },
                    onError(error) {
                        onError?.(error);
                    },
                });
                unsubscribe = unsubscribe_;
                if (!active)
                    unsubscribe();
            }
            catch (err) {
                onError?.(err);
            }
        })();
        return () => unsubscribe();
    };
    return enablePolling ? pollBlocks() : subscribeBlocks();
}
//# sourceMappingURL=watchBlocks.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/watchContractEvent.js
var watchContractEvent = __webpack_require__(301);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/rpc.js
var rpc = __webpack_require__(7513);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/decodeEventLog.js
var decodeEventLog = __webpack_require__(9483);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/watchEvent.js












/**
 * Watches and returns emitted [Event Logs](https://viem.sh/docs/glossary/terms#event-log).
 *
 * - Docs: https://viem.sh/docs/actions/public/watchEvent
 * - JSON-RPC Methods:
 *   - **RPC Provider supports `eth_newFilter`:**
 *     - Calls [`eth_newFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newfilter) to create a filter (called on initialize).
 *     - On a polling interval, it will call [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterchanges).
 *   - **RPC Provider does not support `eth_newFilter`:**
 *     - Calls [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs) for each block between the polling interval.
 *
 * This Action will batch up all the Event Logs found within the [`pollingInterval`](https://viem.sh/docs/actions/public/watchEvent#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/actions/public/watchEvent#onLogs).
 *
 * `watchEvent` will attempt to create an [Event Filter](https://viem.sh/docs/actions/public/createEventFilter) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchEvent` will fall back to using [`getLogs`](https://viem.sh/docs/actions/public/getLogs) instead.
 *
 * @param client - Client to use
 * @param parameters - {@link WatchEventParameters}
 * @returns A function that can be invoked to stop watching for new Event Logs. {@link WatchEventReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { watchEvent } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const unwatch = watchEvent(client, {
 *   onLogs: (logs) => console.log(logs),
 * })
 */
function watchEvent(client, { address, args, batch = true, event, events, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_, }) {
    const enablePolling = typeof poll_ !== 'undefined'
        ? poll_
        : client.transport.type !== 'webSocket' || typeof fromBlock === 'bigint';
    const strict = strict_ ?? false;
    const pollEvent = () => {
        const observerId = (0,stringify/* stringify */.A)([
            'watchEvent',
            address,
            args,
            batch,
            client.uid,
            event,
            pollingInterval,
            fromBlock,
        ]);
        return (0,observe/* observe */.lB)(observerId, { onLogs, onError }, (emit) => {
            let previousBlockNumber;
            if (fromBlock !== undefined)
                previousBlockNumber = fromBlock - 1n;
            let filter;
            let initialized = false;
            const unwatch = (0,poll/* poll */.w)(async () => {
                if (!initialized) {
                    try {
                        filter = (await (0,getAction/* getAction */.T)(client, createEventFilter, 'createEventFilter')({
                            address,
                            args,
                            event: event,
                            events,
                            strict,
                            fromBlock,
                        }));
                    }
                    catch { }
                    initialized = true;
                    return;
                }
                try {
                    let logs;
                    if (filter) {
                        logs = await (0,getAction/* getAction */.T)(client, getFilterChanges/* getFilterChanges */.I, 'getFilterChanges')({ filter });
                    }
                    else {
                        // If the filter doesn't exist, we will fall back to use `getLogs`.
                        // The fall back exists because some RPC Providers do not support filters.
                        // Fetch the block number to use for `getLogs`.
                        const blockNumber = await (0,getAction/* getAction */.T)(client, getBlockNumber/* getBlockNumber */.G, 'getBlockNumber')({});
                        // If the block number has changed, we will need to fetch the logs.
                        // If the block number doesn't exist, we are yet to reach the first poll interval,
                        // so do not emit any logs.
                        if (previousBlockNumber && previousBlockNumber !== blockNumber) {
                            logs = await (0,getAction/* getAction */.T)(client, getLogs/* getLogs */.a, 'getLogs')({
                                address,
                                args,
                                event: event,
                                events,
                                fromBlock: previousBlockNumber + 1n,
                                toBlock: blockNumber,
                            });
                        }
                        else {
                            logs = [];
                        }
                        previousBlockNumber = blockNumber;
                    }
                    if (logs.length === 0)
                        return;
                    if (batch)
                        emit.onLogs(logs);
                    else
                        for (const log of logs)
                            emit.onLogs([log]);
                }
                catch (err) {
                    // If a filter has been set and gets uninstalled, providers will throw an InvalidInput error.
                    // Reinitalize the filter when this occurs
                    if (filter && err instanceof rpc/* InvalidInputRpcError */.Di)
                        initialized = false;
                    emit.onError?.(err);
                }
            }, {
                emitOnBegin: true,
                interval: pollingInterval,
            });
            return async () => {
                if (filter)
                    await (0,getAction/* getAction */.T)(client, uninstallFilter/* uninstallFilter */.Z, 'uninstallFilter')({ filter });
                unwatch();
            };
        });
    };
    const subscribeEvent = () => {
        let active = true;
        let unsubscribe = () => (active = false);
        (async () => {
            try {
                const events_ = events ?? (event ? [event] : undefined);
                let topics = [];
                if (events_) {
                    topics = [
                        events_.flatMap((event) => (0,encodeEventTopics/* encodeEventTopics */.R)({
                            abi: [event],
                            eventName: event.name,
                            args,
                        })),
                    ];
                    if (event)
                        topics = topics[0];
                }
                const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
                    params: ['logs', { address, topics }],
                    onData(data) {
                        if (!active)
                            return;
                        const log = data.result;
                        try {
                            const { eventName, args } = (0,decodeEventLog/* decodeEventLog */.j)({
                                abi: events_ ?? [],
                                data: log.data,
                                topics: log.topics,
                                strict,
                            });
                            const formatted = (0,formatters_log/* formatLog */.e)(log, { args, eventName });
                            onLogs([formatted]);
                        }
                        catch (err) {
                            let eventName;
                            let isUnnamed;
                            if (err instanceof errors_abi/* DecodeLogDataMismatch */.fo ||
                                err instanceof errors_abi/* DecodeLogTopicsMismatch */.l3) {
                                // If strict mode is on, and log data/topics do not match event definition, skip.
                                if (strict_)
                                    return;
                                eventName = err.abiItem.name;
                                isUnnamed = err.abiItem.inputs?.some((x) => !('name' in x && x.name));
                            }
                            // Set args to empty if there is an error decoding (e.g. indexed/non-indexed params mismatch).
                            const formatted = (0,formatters_log/* formatLog */.e)(log, {
                                args: isUnnamed ? [] : {},
                                eventName,
                            });
                            onLogs([formatted]);
                        }
                    },
                    onError(error) {
                        onError?.(error);
                    },
                });
                unsubscribe = unsubscribe_;
                if (!active)
                    unsubscribe();
            }
            catch (err) {
                onError?.(err);
            }
        })();
        return () => unsubscribe();
    };
    return enablePolling ? pollEvent() : subscribeEvent();
}
//# sourceMappingURL=watchEvent.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/public/watchPendingTransactions.js







/**
 * Watches and returns pending transaction hashes.
 *
 * - Docs: https://viem.sh/docs/actions/public/watchPendingTransactions
 * - JSON-RPC Methods:
 *   - When `poll: true`
 *     - Calls [`eth_newPendingTransactionFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newpendingtransactionfilter) to initialize the filter.
 *     - Calls [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getFilterChanges) on a polling interval.
 *   - When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newPendingTransactions"` event.
 *
 * This Action will batch up all the pending transactions found within the [`pollingInterval`](https://viem.sh/docs/actions/public/watchPendingTransactions#pollinginterval-optional), and invoke them via [`onTransactions`](https://viem.sh/docs/actions/public/watchPendingTransactions#ontransactions).
 *
 * @param client - Client to use
 * @param parameters - {@link WatchPendingTransactionsParameters}
 * @returns A function that can be invoked to stop watching for new pending transaction hashes. {@link WatchPendingTransactionsReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { watchPendingTransactions } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const unwatch = await watchPendingTransactions(client, {
 *   onTransactions: (hashes) => console.log(hashes),
 * })
 */
function watchPendingTransactions(client, { batch = true, onError, onTransactions, poll: poll_, pollingInterval = client.pollingInterval, }) {
    const enablePolling = typeof poll_ !== 'undefined' ? poll_ : client.transport.type !== 'webSocket';
    const pollPendingTransactions = () => {
        const observerId = (0,stringify/* stringify */.A)([
            'watchPendingTransactions',
            client.uid,
            batch,
            pollingInterval,
        ]);
        return (0,observe/* observe */.lB)(observerId, { onTransactions, onError }, (emit) => {
            let filter;
            const unwatch = (0,poll/* poll */.w)(async () => {
                try {
                    if (!filter) {
                        try {
                            filter = await (0,getAction/* getAction */.T)(client, createPendingTransactionFilter, 'createPendingTransactionFilter')({});
                            return;
                        }
                        catch (err) {
                            unwatch();
                            throw err;
                        }
                    }
                    const hashes = await (0,getAction/* getAction */.T)(client, getFilterChanges/* getFilterChanges */.I, 'getFilterChanges')({ filter });
                    if (hashes.length === 0)
                        return;
                    if (batch)
                        emit.onTransactions(hashes);
                    else
                        for (const hash of hashes)
                            emit.onTransactions([hash]);
                }
                catch (err) {
                    emit.onError?.(err);
                }
            }, {
                emitOnBegin: true,
                interval: pollingInterval,
            });
            return async () => {
                if (filter)
                    await (0,getAction/* getAction */.T)(client, uninstallFilter/* uninstallFilter */.Z, 'uninstallFilter')({ filter });
                unwatch();
            };
        });
    };
    const subscribePendingTransactions = () => {
        let active = true;
        let unsubscribe = () => (active = false);
        (async () => {
            try {
                const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
                    params: ['newPendingTransactions'],
                    onData(data) {
                        if (!active)
                            return;
                        const transaction = data.result;
                        onTransactions([transaction]);
                    },
                    onError(error) {
                        onError?.(error);
                    },
                });
                unsubscribe = unsubscribe_;
                if (!active)
                    unsubscribe();
            }
            catch (err) {
                onError?.(err);
            }
        })();
        return () => unsubscribe();
    };
    return enablePolling
        ? pollPendingTransactions()
        : subscribePendingTransactions();
}
//# sourceMappingURL=watchPendingTransactions.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js + 13 modules
var prepareTransactionRequest = __webpack_require__(1093);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/wallet/sendRawTransaction.js
var sendRawTransaction = __webpack_require__(8498);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/clients/decorators/public.js















































function publicActions(client) {
    return {
        call: (args) => (0,call/* call */.T1)(client, args),
        createBlockFilter: () => createBlockFilter(client),
        createContractEventFilter: (args) => (0,createContractEventFilter/* createContractEventFilter */.X)(client, args),
        createEventFilter: (args) => createEventFilter(client, args),
        createPendingTransactionFilter: () => createPendingTransactionFilter(client),
        estimateContractGas: (args) => (0,estimateContractGas/* estimateContractGas */.W)(client, args),
        estimateGas: (args) => (0,estimateGas/* estimateGas */.Q)(client, args),
        getBalance: (args) => getBalance(client, args),
        getBlobBaseFee: () => getBlobBaseFee(client),
        getBlock: (args) => (0,getBlock/* getBlock */.g)(client, args),
        getBlockNumber: (args) => (0,getBlockNumber/* getBlockNumber */.G)(client, args),
        getBlockTransactionCount: (args) => getBlockTransactionCount(client, args),
        getBytecode: (args) => getBytecode(client, args),
        getChainId: () => (0,getChainId/* getChainId */.T)(client),
        getContractEvents: (args) => (0,getContractEvents/* getContractEvents */.u)(client, args),
        getEnsAddress: (args) => getEnsAddress(client, args),
        getEnsAvatar: (args) => getEnsAvatar(client, args),
        getEnsName: (args) => getEnsName(client, args),
        getEnsResolver: (args) => getEnsResolver(client, args),
        getEnsText: (args) => getEnsText(client, args),
        getFeeHistory: (args) => getFeeHistory(client, args),
        estimateFeesPerGas: (args) => (0,estimateFeesPerGas/* estimateFeesPerGas */._)(client, args),
        getFilterChanges: (args) => (0,getFilterChanges/* getFilterChanges */.I)(client, args),
        getFilterLogs: (args) => getFilterLogs(client, args),
        getGasPrice: () => (0,getGasPrice/* getGasPrice */.L)(client),
        getLogs: (args) => (0,getLogs/* getLogs */.a)(client, args),
        getProof: (args) => getProof(client, args),
        estimateMaxPriorityFeePerGas: (args) => (0,estimateMaxPriorityFeePerGas/* estimateMaxPriorityFeePerGas */.b)(client, args),
        getStorageAt: (args) => getStorageAt(client, args),
        getTransaction: (args) => getTransaction(client, args),
        getTransactionConfirmations: (args) => getTransactionConfirmations(client, args),
        getTransactionCount: (args) => (0,getTransactionCount/* getTransactionCount */.y)(client, args),
        getTransactionReceipt: (args) => getTransactionReceipt(client, args),
        multicall: (args) => multicall(client, args),
        prepareTransactionRequest: (args) => (0,prepareTransactionRequest/* prepareTransactionRequest */.f)(client, args),
        readContract: (args) => (0,readContract/* readContract */.J)(client, args),
        sendRawTransaction: (args) => (0,sendRawTransaction/* sendRawTransaction */.L)(client, args),
        simulateContract: (args) => (0,simulateContract/* simulateContract */.v)(client, args),
        verifyMessage: (args) => verifyMessage(client, args),
        verifyTypedData: (args) => verifyTypedData(client, args),
        uninstallFilter: (args) => (0,uninstallFilter/* uninstallFilter */.Z)(client, args),
        waitForTransactionReceipt: (args) => waitForTransactionReceipt(client, args),
        watchBlocks: (args) => watchBlocks(client, args),
        watchBlockNumber: (args) => watchBlockNumber(client, args),
        watchContractEvent: (args) => (0,watchContractEvent/* watchContractEvent */.q)(client, args),
        watchEvent: (args) => watchEvent(client, args),
        watchPendingTransactions: (args) => watchPendingTransactions(client, args),
    };
}
//# sourceMappingURL=public.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/clients/createPublicClient.js


/**
 * Creates a Public Client with a given [Transport](https://viem.sh/docs/clients/intro) configured for a [Chain](https://viem.sh/docs/clients/chains).
 *
 * - Docs: https://viem.sh/docs/clients/public
 *
 * A Public Client is an interface to "public" [JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) methods such as retrieving block numbers, transactions, reading from smart contracts, etc through [Public Actions](/docs/actions/public/introduction).
 *
 * @param config - {@link PublicClientConfig}
 * @returns A Public Client. {@link PublicClient}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 */
function createPublicClient(parameters) {
    const { key = 'public', name = 'Public Client' } = parameters;
    const client = (0,createClient/* createClient */.U)({
        ...parameters,
        key,
        name,
        type: 'publicClient',
    });
    return client.extend(publicActions);
}
//# sourceMappingURL=createPublicClient.js.map

/***/ }),

/***/ 4928:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  F: () => (/* binding */ createWalletClient)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/clients/createClient.js + 1 modules
var createClient = __webpack_require__(8564);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/getChainId.js
var getChainId = __webpack_require__(9798);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toHex.js
var toHex = __webpack_require__(4192);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/addChain.js

/**
 * Adds an EVM chain to the wallet.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/addChain
 * - JSON-RPC Methods: [`eth_addEthereumChain`](https://eips.ethereum.org/EIPS/eip-3085)
 *
 * @param client - Client to use
 * @param parameters - {@link AddChainParameters}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { addChain } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   transport: custom(window.ethereum),
 * })
 * await addChain(client, { chain: optimism })
 */
async function addChain(client, { chain }) {
    const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain;
    await client.request({
        method: 'wallet_addEthereumChain',
        params: [
            {
                chainId: (0,toHex/* numberToHex */.cK)(id),
                chainName: name,
                nativeCurrency,
                rpcUrls: rpcUrls.default.http,
                blockExplorerUrls: blockExplorers
                    ? Object.values(blockExplorers).map(({ url }) => url)
                    : undefined,
            },
        ],
    }, { retryCount: 0 });
}
//# sourceMappingURL=addChain.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/encodeDeployData.js
var encodeDeployData = __webpack_require__(5842);
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/wallet/sendTransaction.js + 1 modules
var sendTransaction = __webpack_require__(6479);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/deployContract.js


/**
 * Deploys a contract to the network, given bytecode and constructor arguments.
 *
 * - Docs: https://viem.sh/docs/contract/deployContract
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts/deploying-contracts
 *
 * @param client - Client to use
 * @param parameters - {@link DeployContractParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link DeployContractReturnType}
 *
 * @example
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { deployContract } from 'viem/contract'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hash = await deployContract(client, {
 *   abi: [],
 *   account: '0x…,
 *   bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
 * })
 */
function deployContract(walletClient, parameters) {
    const { abi, args, bytecode, ...request } = parameters;
    const calldata = (0,encodeDeployData/* encodeDeployData */.m)({ abi, args, bytecode });
    return (0,sendTransaction/* sendTransaction */.v)(walletClient, {
        ...request,
        data: calldata,
    });
}
//# sourceMappingURL=deployContract.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/address/getAddress.js
var getAddress = __webpack_require__(4569);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/getAddresses.js

/**
 * Returns a list of account addresses owned by the wallet or client.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/getAddresses
 * - JSON-RPC Methods: [`eth_accounts`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_accounts)
 *
 * @param client - Client to use
 * @returns List of account addresses owned by the wallet or client. {@link GetAddressesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getAddresses } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const accounts = await getAddresses(client)
 */
async function getAddresses(client) {
    if (client.account?.type === 'local')
        return [client.account.address];
    const addresses = await client.request({ method: 'eth_accounts' });
    return addresses.map((address) => (0,getAddress/* checksumAddress */.o)(address));
}
//# sourceMappingURL=getAddresses.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/getPermissions.js
/**
 * Gets the wallets current permissions.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/getPermissions
 * - JSON-RPC Methods: [`wallet_getPermissions`](https://eips.ethereum.org/EIPS/eip-2255)
 *
 * @param client - Client to use
 * @returns The wallet permissions. {@link GetPermissionsReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getPermissions } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const permissions = await getPermissions(client)
 */
async function getPermissions(client) {
    const permissions = await client.request({ method: 'wallet_getPermissions' });
    return permissions;
}
//# sourceMappingURL=getPermissions.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js + 13 modules
var prepareTransactionRequest = __webpack_require__(1093);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/requestAddresses.js

/**
 * Requests a list of accounts managed by a wallet.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/requestAddresses
 * - JSON-RPC Methods: [`eth_requestAccounts`](https://eips.ethereum.org/EIPS/eip-1102)
 *
 * Sends a request to the wallet, asking for permission to access the user's accounts. After the user accepts the request, it will return a list of accounts (addresses).
 *
 * This API can be useful for dapps that need to access the user's accounts in order to execute transactions or interact with smart contracts.
 *
 * @param client - Client to use
 * @returns List of accounts managed by a wallet {@link RequestAddressesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { requestAddresses } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const accounts = await requestAddresses(client)
 */
async function requestAddresses(client) {
    const addresses = await client.request({ method: 'eth_requestAccounts' }, { retryCount: 0 });
    return addresses.map((address) => (0,getAddress/* getAddress */.b)(address));
}
//# sourceMappingURL=requestAddresses.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/requestPermissions.js
/**
 * Requests permissions for a wallet.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/requestPermissions
 * - JSON-RPC Methods: [`wallet_requestPermissions`](https://eips.ethereum.org/EIPS/eip-2255)
 *
 * @param client - Client to use
 * @param parameters - {@link RequestPermissionsParameters}
 * @returns The wallet permissions. {@link RequestPermissionsReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { requestPermissions } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const permissions = await requestPermissions(client, {
 *   eth_accounts: {}
 * })
 */
async function requestPermissions(client, permissions) {
    return client.request({
        method: 'wallet_requestPermissions',
        params: [permissions],
    }, { retryCount: 0 });
}
//# sourceMappingURL=requestPermissions.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/wallet/sendRawTransaction.js
var sendRawTransaction = __webpack_require__(8498);
// EXTERNAL MODULE: ./node_modules/viem/_esm/accounts/utils/parseAccount.js
var parseAccount = __webpack_require__(3033);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/account.js
var errors_account = __webpack_require__(4337);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/signMessage.js



/**
 * Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/signMessage
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`personal_sign`](https://docs.metamask.io/guide/signing-data#personal-sign)
 *   - Local Accounts: Signs locally. No JSON-RPC request.
 *
 * With the calculated signature, you can:
 * - use [`verifyMessage`](https://viem.sh/docs/utilities/verifyMessage) to verify the signature,
 * - use [`recoverMessageAddress`](https://viem.sh/docs/utilities/recoverMessageAddress) to recover the signing address from a signature.
 *
 * @param client - Client to use
 * @param parameters - {@link SignMessageParameters}
 * @returns The signed message. {@link SignMessageReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { signMessage } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signMessage(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   message: 'hello world',
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, custom } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { signMessage } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signMessage(client, {
 *   message: 'hello world',
 * })
 */
async function signMessage(client, { account: account_ = client.account, message, }) {
    if (!account_)
        throw new errors_account/* AccountNotFoundError */.T({
            docsPath: '/docs/actions/wallet/signMessage',
        });
    const account = (0,parseAccount/* parseAccount */.J)(account_);
    if (account.type === 'local')
        return account.signMessage({ message });
    const message_ = (() => {
        if (typeof message === 'string')
            return (0,toHex/* stringToHex */.i3)(message);
        if (message.raw instanceof Uint8Array)
            return (0,toHex/* toHex */.nj)(message.raw);
        return message.raw;
    })();
    return client.request({
        method: 'personal_sign',
        params: [message_, account.address],
    }, { retryCount: 0 });
}
//# sourceMappingURL=signMessage.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/chain/assertCurrentChain.js
var assertCurrentChain = __webpack_require__(3190);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/formatters/transactionRequest.js
var transactionRequest = __webpack_require__(7671);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/getAction.js
var getAction = __webpack_require__(3692);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/transaction/assertRequest.js
var assertRequest = __webpack_require__(5414);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/signTransaction.js









/**
 * Signs a transaction.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/signTransaction
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_signTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
 *   - Local Accounts: Signs locally. No JSON-RPC request.
 *
 * @param args - {@link SignTransactionParameters}
 * @returns The signed serialized tranasction. {@link SignTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { signTransaction } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signTransaction(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { signTransaction } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signTransaction(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
async function signTransaction(client, parameters) {
    const { account: account_ = client.account, chain = client.chain, ...transaction } = parameters;
    if (!account_)
        throw new errors_account/* AccountNotFoundError */.T({
            docsPath: '/docs/actions/wallet/signTransaction',
        });
    const account = (0,parseAccount/* parseAccount */.J)(account_);
    (0,assertRequest/* assertRequest */.c)({
        account,
        ...parameters,
    });
    const chainId = await (0,getAction/* getAction */.T)(client, getChainId/* getChainId */.T, 'getChainId')({});
    if (chain !== null)
        (0,assertCurrentChain/* assertCurrentChain */.v)({
            currentChainId: chainId,
            chain,
        });
    const formatters = chain?.formatters || client.chain?.formatters;
    const format = formatters?.transactionRequest?.format || transactionRequest/* formatTransactionRequest */.Bv;
    if (account.type === 'local') {
        return account.signTransaction({
            ...transaction,
            chainId,
        }, { serializer: client.chain?.serializers?.transaction });
    }
    return await client.request({
        method: 'eth_signTransaction',
        params: [
            {
                ...format(transaction),
                chainId: (0,toHex/* numberToHex */.cK)(chainId),
                from: account.address,
            },
        ],
    }, { retryCount: 0 });
}
//# sourceMappingURL=signTransaction.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/isHex.js
var isHex = __webpack_require__(6394);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/stringify.js
var stringify = __webpack_require__(8463);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/typedData.js + 1 modules
var utils_typedData = __webpack_require__(988);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/signTypedData.js





/**
 * Signs typed data and calculates an Ethereum-specific signature in [https://eips.ethereum.org/EIPS/eip-712](https://eips.ethereum.org/EIPS/eip-712): `sign(keccak256("\x19\x01" ‖ domainSeparator ‖ hashStruct(message)))`
 *
 * - Docs: https://viem.sh/docs/actions/wallet/signTypedData
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_signTypedData_v4`](https://docs.metamask.io/guide/signing-data#signtypeddata-v4)
 *   - Local Accounts: Signs locally. No JSON-RPC request.
 *
 * @param client - Client to use
 * @param parameters - {@link SignTypedDataParameters}
 * @returns The signed data. {@link SignTypedDataReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { signTypedData } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signTypedData(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   domain: {
 *     name: 'Ether Mail',
 *     version: '1',
 *     chainId: 1,
 *     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
 *   },
 *   types: {
 *     Person: [
 *       { name: 'name', type: 'string' },
 *       { name: 'wallet', type: 'address' },
 *     ],
 *     Mail: [
 *       { name: 'from', type: 'Person' },
 *       { name: 'to', type: 'Person' },
 *       { name: 'contents', type: 'string' },
 *     ],
 *   },
 *   primaryType: 'Mail',
 *   message: {
 *     from: {
 *       name: 'Cow',
 *       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
 *     },
 *     to: {
 *       name: 'Bob',
 *       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
 *     },
 *     contents: 'Hello, Bob!',
 *   },
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { signTypedData } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const signature = await signTypedData(client, {
 *   domain: {
 *     name: 'Ether Mail',
 *     version: '1',
 *     chainId: 1,
 *     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
 *   },
 *   types: {
 *     Person: [
 *       { name: 'name', type: 'string' },
 *       { name: 'wallet', type: 'address' },
 *     ],
 *     Mail: [
 *       { name: 'from', type: 'Person' },
 *       { name: 'to', type: 'Person' },
 *       { name: 'contents', type: 'string' },
 *     ],
 *   },
 *   primaryType: 'Mail',
 *   message: {
 *     from: {
 *       name: 'Cow',
 *       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
 *     },
 *     to: {
 *       name: 'Bob',
 *       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
 *     },
 *     contents: 'Hello, Bob!',
 *   },
 * })
 */
async function signTypedData(client, parameters) {
    const { account: account_ = client.account, domain, message, primaryType, } = parameters;
    if (!account_)
        throw new errors_account/* AccountNotFoundError */.T({
            docsPath: '/docs/actions/wallet/signTypedData',
        });
    const account = (0,parseAccount/* parseAccount */.J)(account_);
    const types = {
        EIP712Domain: (0,utils_typedData/* getTypesForEIP712Domain */.H4)({ domain }),
        ...parameters.types,
    };
    // Need to do a runtime validation check on addresses, byte ranges, integer ranges, etc
    // as we can't statically check this with TypeScript.
    (0,utils_typedData/* validateTypedData */.$$)({ domain, message, primaryType, types });
    if (account.type === 'local')
        return account.signTypedData({ domain, message, primaryType, types });
    const typedData = (0,stringify/* stringify */.A)({ domain: domain ?? {}, message, primaryType, types }, (_, value) => ((0,isHex/* isHex */.q)(value) ? value.toLowerCase() : value));
    return client.request({
        method: 'eth_signTypedData_v4',
        params: [account.address, typedData],
    }, { retryCount: 0 });
}
//# sourceMappingURL=signTypedData.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/switchChain.js

/**
 * Switch the target chain in a wallet.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/switchChain
 * - JSON-RPC Methods: [`eth_switchEthereumChain`](https://eips.ethereum.org/EIPS/eip-3326)
 *
 * @param client - Client to use
 * @param parameters - {@link SwitchChainParameters}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet, optimism } from 'viem/chains'
 * import { switchChain } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * await switchChain(client, { id: optimism.id })
 */
async function switchChain(client, { id }) {
    await client.request({
        method: 'wallet_switchEthereumChain',
        params: [
            {
                chainId: (0,toHex/* numberToHex */.cK)(id),
            },
        ],
    }, { retryCount: 0 });
}
//# sourceMappingURL=switchChain.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/actions/wallet/watchAsset.js
/**
 * Adds an EVM chain to the wallet.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/watchAsset
 * - JSON-RPC Methods: [`eth_switchEthereumChain`](https://eips.ethereum.org/EIPS/eip-747)
 *
 * @param client - Client to use
 * @param parameters - {@link WatchAssetParameters}
 * @returns Boolean indicating if the token was successfully added. {@link WatchAssetReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { watchAsset } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const success = await watchAsset(client, {
 *   type: 'ERC20',
 *   options: {
 *     address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
 *     decimals: 18,
 *     symbol: 'WETH',
 *   },
 * })
 */
async function watchAsset(client, params) {
    const added = await client.request({
        method: 'wallet_watchAsset',
        params,
    }, { retryCount: 0 });
    return added;
}
//# sourceMappingURL=watchAsset.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/wallet/writeContract.js
var writeContract = __webpack_require__(9177);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/clients/decorators/wallet.js

















function walletActions(client) {
    return {
        addChain: (args) => addChain(client, args),
        deployContract: (args) => deployContract(client, args),
        getAddresses: () => getAddresses(client),
        getChainId: () => (0,getChainId/* getChainId */.T)(client),
        getPermissions: () => getPermissions(client),
        prepareTransactionRequest: (args) => (0,prepareTransactionRequest/* prepareTransactionRequest */.f)(client, args),
        requestAddresses: () => requestAddresses(client),
        requestPermissions: (args) => requestPermissions(client, args),
        sendRawTransaction: (args) => (0,sendRawTransaction/* sendRawTransaction */.L)(client, args),
        sendTransaction: (args) => (0,sendTransaction/* sendTransaction */.v)(client, args),
        signMessage: (args) => signMessage(client, args),
        signTransaction: (args) => signTransaction(client, args),
        signTypedData: (args) => signTypedData(client, args),
        switchChain: (args) => switchChain(client, args),
        watchAsset: (args) => watchAsset(client, args),
        writeContract: (args) => (0,writeContract/* writeContract */.E)(client, args),
    };
}
//# sourceMappingURL=wallet.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/clients/createWalletClient.js


function createWalletClient(parameters) {
    const { key = 'wallet', name = 'Wallet Client', transport } = parameters;
    const client = (0,createClient/* createClient */.U)({
        ...parameters,
        key,
        name,
        transport,
        type: 'walletClient',
    });
    return client.extend(walletActions);
}
//# sourceMappingURL=createWalletClient.js.map

/***/ }),

/***/ 6812:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  o: () => (/* binding */ createTransport)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/base.js
var base = __webpack_require__(6329);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/request.js
var errors_request = __webpack_require__(6595);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/rpc.js
var rpc = __webpack_require__(7513);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/promise/withRetry.js
var withRetry = __webpack_require__(9910);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/buildRequest.js




function buildRequest(request, options = {}) {
    return async (args, overrideOptions = {}) => {
        const { retryDelay = 150, retryCount = 3 } = {
            ...options,
            ...overrideOptions,
        };
        return (0,withRetry/* withRetry */.b)(async () => {
            try {
                return await request(args);
            }
            catch (err_) {
                const err = err_;
                switch (err.code) {
                    // -32700
                    case rpc/* ParseRpcError */.XU.code:
                        throw new rpc/* ParseRpcError */.XU(err);
                    // -32600
                    case rpc/* InvalidRequestRpcError */.CL.code:
                        throw new rpc/* InvalidRequestRpcError */.CL(err);
                    // -32601
                    case rpc/* MethodNotFoundRpcError */.Gi.code:
                        throw new rpc/* MethodNotFoundRpcError */.Gi(err);
                    // -32602
                    case rpc/* InvalidParamsRpcError */.D5.code:
                        throw new rpc/* InvalidParamsRpcError */.D5(err);
                    // -32603
                    case rpc/* InternalRpcError */.bq.code:
                        throw new rpc/* InternalRpcError */.bq(err);
                    // -32000
                    case rpc/* InvalidInputRpcError */.Di.code:
                        throw new rpc/* InvalidInputRpcError */.Di(err);
                    // -32001
                    case rpc/* ResourceNotFoundRpcError */.hA.code:
                        throw new rpc/* ResourceNotFoundRpcError */.hA(err);
                    // -32002
                    case rpc/* ResourceUnavailableRpcError */.qZ.code:
                        throw new rpc/* ResourceUnavailableRpcError */.qZ(err);
                    // -32003
                    case rpc/* TransactionRejectedRpcError */.YW.code:
                        throw new rpc/* TransactionRejectedRpcError */.YW(err);
                    // -32004
                    case rpc/* MethodNotSupportedRpcError */.ab.code:
                        throw new rpc/* MethodNotSupportedRpcError */.ab(err);
                    // -32005
                    case rpc/* LimitExceededRpcError */.s0.code:
                        throw new rpc/* LimitExceededRpcError */.s0(err);
                    // -32006
                    case rpc/* JsonRpcVersionUnsupportedError */.xQ.code:
                        throw new rpc/* JsonRpcVersionUnsupportedError */.xQ(err);
                    // 4001
                    case rpc/* UserRejectedRequestError */.vx.code:
                        throw new rpc/* UserRejectedRequestError */.vx(err);
                    // 4100
                    case rpc/* UnauthorizedProviderError */.sV.code:
                        throw new rpc/* UnauthorizedProviderError */.sV(err);
                    // 4200
                    case rpc/* UnsupportedProviderMethodError */.Sf.code:
                        throw new rpc/* UnsupportedProviderMethodError */.Sf(err);
                    // 4900
                    case rpc/* ProviderDisconnectedError */.RV.code:
                        throw new rpc/* ProviderDisconnectedError */.RV(err);
                    // 4901
                    case rpc/* ChainDisconnectedError */.xq.code:
                        throw new rpc/* ChainDisconnectedError */.xq(err);
                    // 4902
                    case rpc/* SwitchChainError */.ch.code:
                        throw new rpc/* SwitchChainError */.ch(err);
                    // CAIP-25: User Rejected Error
                    // https://docs.walletconnect.com/2.0/specs/clients/sign/error-codes#rejected-caip-25
                    case 5000:
                        throw new rpc/* UserRejectedRequestError */.vx(err);
                    default:
                        if (err_ instanceof base/* BaseError */.C)
                            throw err_;
                        throw new rpc/* UnknownRpcError */.MI(err);
                }
            }
        }, {
            delay: ({ count, error }) => {
                // If we find a Retry-After header, let's retry after the given time.
                if (error && error instanceof errors_request/* HttpRequestError */.Ci) {
                    const retryAfter = error?.headers?.get('Retry-After');
                    if (retryAfter?.match(/\d/))
                        return parseInt(retryAfter) * 1000;
                }
                // Otherwise, let's retry with an exponential backoff.
                return ~~(1 << count) * retryDelay;
            },
            retryCount,
            shouldRetry: ({ error }) => shouldRetry(error),
        });
    };
}
function shouldRetry(error) {
    if ('code' in error && typeof error.code === 'number') {
        if (error.code === -1)
            return true; // Unknown error
        if (error.code === rpc/* LimitExceededRpcError */.s0.code)
            return true;
        if (error.code === rpc/* InternalRpcError */.bq.code)
            return true;
        return false;
    }
    if (error instanceof errors_request/* HttpRequestError */.Ci && error.status) {
        // Forbidden
        if (error.status === 403)
            return true;
        // Request Timeout
        if (error.status === 408)
            return true;
        // Request Entity Too Large
        if (error.status === 413)
            return true;
        // Too Many Requests
        if (error.status === 429)
            return true;
        // Internal Server Error
        if (error.status === 500)
            return true;
        // Bad Gateway
        if (error.status === 502)
            return true;
        // Service Unavailable
        if (error.status === 503)
            return true;
        // Gateway Timeout
        if (error.status === 504)
            return true;
        return false;
    }
    return true;
}
//# sourceMappingURL=buildRequest.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/clients/transports/createTransport.js

/**
 * @description Creates an transport intended to be used with a client.
 */
function createTransport({ key, name, request, retryCount = 3, retryDelay = 150, timeout, type, }, value) {
    return {
        config: { key, name, request, retryCount, retryDelay, timeout, type },
        request: buildRequest(request, { retryCount, retryDelay }),
        value,
    };
}
//# sourceMappingURL=createTransport.js.map

/***/ }),

/***/ 5387:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   I: () => (/* binding */ custom)
/* harmony export */ });
/* harmony import */ var _createTransport_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6812);

/**
 * @description Creates a custom transport given an EIP-1193 compliant `request` attribute.
 */
function custom(provider, config = {}) {
    const { key = 'custom', name = 'Custom Provider', retryDelay } = config;
    return ({ retryCount: defaultRetryCount }) => (0,_createTransport_js__WEBPACK_IMPORTED_MODULE_0__/* .createTransport */ .o)({
        key,
        name,
        request: provider.request.bind(provider),
        retryCount: config.retryCount ?? defaultRetryCount,
        retryDelay,
        type: 'custom',
    });
}
//# sourceMappingURL=custom.js.map

/***/ }),

/***/ 2427:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  L: () => (/* binding */ http)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/request.js
var request = __webpack_require__(6595);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/base.js
var base = __webpack_require__(6329);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/errors/transport.js

class UrlRequiredError extends base/* BaseError */.C {
    constructor() {
        super('No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.', {
            docsPath: '/docs/clients/intro',
        });
    }
}
//# sourceMappingURL=transport.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/promise/createBatchScheduler.js
var createBatchScheduler = __webpack_require__(2167);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/promise/withTimeout.js
function withTimeout(fn, { errorInstance = new Error('timed out'), timeout, signal, }) {
    return new Promise((resolve, reject) => {
        ;
        (async () => {
            let timeoutId;
            try {
                const controller = new AbortController();
                if (timeout > 0) {
                    timeoutId = setTimeout(() => {
                        if (signal) {
                            controller.abort();
                        }
                        else {
                            reject(errorInstance);
                        }
                    }, timeout);
                }
                resolve(await fn({ signal: controller?.signal || null }));
            }
            catch (err) {
                if (err.name === 'AbortError')
                    reject(errorInstance);
                reject(err);
            }
            finally {
                clearTimeout(timeoutId);
            }
        })();
    });
}
//# sourceMappingURL=withTimeout.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/stringify.js
var stringify = __webpack_require__(8463);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/rpc/id.js
function createIdStore() {
    return {
        current: 0,
        take() {
            return this.current++;
        },
        reset() {
            this.current = 0;
        },
    };
}
const idCache = /*#__PURE__*/ createIdStore();
//# sourceMappingURL=id.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/rpc/http.js




function getHttpRpcClient(url, options = {}) {
    return {
        async request(params) {
            const { body, fetchOptions = {}, onRequest = options.onRequest, onResponse = options.onResponse, timeout = options.timeout ?? 10_000, } = params;
            const { headers, method, signal: signal_, } = { ...options.fetchOptions, ...fetchOptions };
            try {
                const response = await withTimeout(async ({ signal }) => {
                    const request = new Request(url, {
                        ...fetchOptions,
                        body: Array.isArray(body)
                            ? (0,stringify/* stringify */.A)(body.map((body) => ({
                                jsonrpc: '2.0',
                                id: body.id ?? idCache.take(),
                                ...body,
                            })))
                            : (0,stringify/* stringify */.A)({
                                jsonrpc: '2.0',
                                id: body.id ?? idCache.take(),
                                ...body,
                            }),
                        headers: {
                            ...headers,
                            'Content-Type': 'application/json',
                        },
                        method: method || 'POST',
                        signal: signal_ || (timeout > 0 ? signal : null),
                    });
                    if (onRequest)
                        await onRequest(request);
                    const response = await fetch(request);
                    return response;
                }, {
                    errorInstance: new request/* TimeoutError */.MU({ body, url }),
                    timeout,
                    signal: true,
                });
                if (onResponse)
                    await onResponse(response);
                let data;
                if (response.headers.get('Content-Type')?.startsWith('application/json'))
                    data = await response.json();
                else
                    data = await response.text();
                if (!response.ok) {
                    throw new request/* HttpRequestError */.Ci({
                        body,
                        details: (0,stringify/* stringify */.A)(data.error) || response.statusText,
                        headers: response.headers,
                        status: response.status,
                        url,
                    });
                }
                return data;
            }
            catch (err) {
                if (err instanceof request/* HttpRequestError */.Ci)
                    throw err;
                if (err instanceof request/* TimeoutError */.MU)
                    throw err;
                throw new request/* HttpRequestError */.Ci({
                    body,
                    details: err.message,
                    url,
                });
            }
        },
    };
}
//# sourceMappingURL=http.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/clients/transports/createTransport.js + 1 modules
var createTransport = __webpack_require__(6812);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/clients/transports/http.js





/**
 * @description Creates a HTTP transport that connects to a JSON-RPC API.
 */
function http(
/** URL of the JSON-RPC API. Defaults to the chain's public RPC URL. */
url, config = {}) {
    const { batch, fetchOptions, key = 'http', name = 'HTTP JSON-RPC', onFetchRequest, onFetchResponse, retryDelay, } = config;
    return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
        const { batchSize = 1000, wait = 0 } = typeof batch === 'object' ? batch : {};
        const retryCount = config.retryCount ?? retryCount_;
        const timeout = timeout_ ?? config.timeout ?? 10_000;
        const url_ = url || chain?.rpcUrls.default.http[0];
        if (!url_)
            throw new UrlRequiredError();
        const rpcClient = getHttpRpcClient(url_, {
            fetchOptions,
            onRequest: onFetchRequest,
            onResponse: onFetchResponse,
            timeout,
        });
        return (0,createTransport/* createTransport */.o)({
            key,
            name,
            async request({ method, params }) {
                const body = { method, params };
                const { schedule } = (0,createBatchScheduler/* createBatchScheduler */.u)({
                    id: `${url}`,
                    wait,
                    shouldSplitBatch(requests) {
                        return requests.length > batchSize;
                    },
                    fn: (body) => rpcClient.request({
                        body,
                    }),
                    sort: (a, b) => a.id - b.id,
                });
                const fn = async (body) => batch
                    ? schedule(body)
                    : [
                        await rpcClient.request({
                            body,
                        }),
                    ];
                const [{ error, result }] = await fn(body);
                if (error)
                    throw new request/* RpcRequestError */.J8({
                        body,
                        error,
                        url: url_,
                    });
                return result;
            },
            retryCount,
            retryDelay,
            timeout,
            type: 'http',
        }, {
            fetchOptions,
            url: url_,
        });
    };
}
//# sourceMappingURL=http.js.map

/***/ }),

/***/ 4823:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ag: () => (/* binding */ universalResolverResolveAbi),
/* harmony export */   Rm: () => (/* binding */ addressResolverAbi),
/* harmony export */   SJ: () => (/* binding */ textResolverAbi),
/* harmony export */   _: () => (/* binding */ universalSignatureValidatorAbi),
/* harmony export */   oX: () => (/* binding */ universalResolverReverseAbi),
/* harmony export */   v2: () => (/* binding */ multicall3Abi)
/* harmony export */ });
/* unused harmony exports smartAccountAbi, erc20Abi, erc20Abi_bytes32, erc721Abi, erc4626Abi */
/* [Multicall3](https://github.com/mds1/multicall) */
const multicall3Abi = [
    {
        inputs: [
            {
                components: [
                    {
                        name: 'target',
                        type: 'address',
                    },
                    {
                        name: 'allowFailure',
                        type: 'bool',
                    },
                    {
                        name: 'callData',
                        type: 'bytes',
                    },
                ],
                name: 'calls',
                type: 'tuple[]',
            },
        ],
        name: 'aggregate3',
        outputs: [
            {
                components: [
                    {
                        name: 'success',
                        type: 'bool',
                    },
                    {
                        name: 'returnData',
                        type: 'bytes',
                    },
                ],
                name: 'returnData',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
];
const universalResolverErrors = [
    {
        inputs: [],
        name: 'ResolverNotFound',
        type: 'error',
    },
    {
        inputs: [],
        name: 'ResolverWildcardNotSupported',
        type: 'error',
    },
    {
        inputs: [],
        name: 'ResolverNotContract',
        type: 'error',
    },
    {
        inputs: [
            {
                name: 'returnData',
                type: 'bytes',
            },
        ],
        name: 'ResolverError',
        type: 'error',
    },
    {
        inputs: [
            {
                components: [
                    {
                        name: 'status',
                        type: 'uint16',
                    },
                    {
                        name: 'message',
                        type: 'string',
                    },
                ],
                name: 'errors',
                type: 'tuple[]',
            },
        ],
        name: 'HttpError',
        type: 'error',
    },
];
const universalResolverResolveAbi = [
    ...universalResolverErrors,
    {
        name: 'resolve',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'name', type: 'bytes' },
            { name: 'data', type: 'bytes' },
        ],
        outputs: [
            { name: '', type: 'bytes' },
            { name: 'address', type: 'address' },
        ],
    },
    {
        name: 'resolve',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'name', type: 'bytes' },
            { name: 'data', type: 'bytes' },
            { name: 'gateways', type: 'string[]' },
        ],
        outputs: [
            { name: '', type: 'bytes' },
            { name: 'address', type: 'address' },
        ],
    },
];
const universalResolverReverseAbi = [
    ...universalResolverErrors,
    {
        name: 'reverse',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'bytes', name: 'reverseName' }],
        outputs: [
            { type: 'string', name: 'resolvedName' },
            { type: 'address', name: 'resolvedAddress' },
            { type: 'address', name: 'reverseResolver' },
            { type: 'address', name: 'resolver' },
        ],
    },
    {
        name: 'reverse',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { type: 'bytes', name: 'reverseName' },
            { type: 'string[]', name: 'gateways' },
        ],
        outputs: [
            { type: 'string', name: 'resolvedName' },
            { type: 'address', name: 'resolvedAddress' },
            { type: 'address', name: 'reverseResolver' },
            { type: 'address', name: 'resolver' },
        ],
    },
];
const textResolverAbi = [
    {
        name: 'text',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'name', type: 'bytes32' },
            { name: 'key', type: 'string' },
        ],
        outputs: [{ name: '', type: 'string' }],
    },
];
const addressResolverAbi = [
    {
        name: 'addr',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'name', type: 'bytes32' }],
        outputs: [{ name: '', type: 'address' }],
    },
    {
        name: 'addr',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'name', type: 'bytes32' },
            { name: 'coinType', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bytes' }],
    },
];
// ERC-1271
// isValidSignature(bytes32 hash, bytes signature) → bytes4 magicValue
const smartAccountAbi = [
    {
        name: 'isValidSignature',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'hash', type: 'bytes32' },
            { name: 'signature', type: 'bytes' },
        ],
        outputs: [{ name: '', type: 'bytes4' }],
    },
];
// ERC-6492 - universal deployless signature validator contract
// constructor(address _signer, bytes32 _hash, bytes _signature) → bytes4 returnValue
// returnValue is either 0x1 (valid) or 0x0 (invalid)
const universalSignatureValidatorAbi = [
    {
        inputs: [
            {
                internalType: 'address',
                name: '_signer',
                type: 'address',
            },
            {
                internalType: 'bytes32',
                name: '_hash',
                type: 'bytes32',
            },
            {
                internalType: 'bytes',
                name: '_signature',
                type: 'bytes',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
];
/** [ERC-20 Token Standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) */
const erc20Abi = [
    {
        type: 'event',
        name: 'Approval',
        inputs: [
            {
                indexed: true,
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                name: 'spender',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'event',
        name: 'Transfer',
        inputs: [
            {
                indexed: true,
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                name: 'to',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'allowance',
        stateMutability: 'view',
        inputs: [
            {
                name: 'owner',
                type: 'address',
            },
            {
                name: 'spender',
                type: 'address',
            },
        ],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'approve',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'spender',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                type: 'bool',
            },
        ],
    },
    {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [
            {
                name: 'account',
                type: 'address',
            },
        ],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'decimals',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'uint8',
            },
        ],
    },
    {
        type: 'function',
        name: 'name',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'string',
            },
        ],
    },
    {
        type: 'function',
        name: 'symbol',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'string',
            },
        ],
    },
    {
        type: 'function',
        name: 'totalSupply',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'transfer',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'recipient',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                type: 'bool',
            },
        ],
    },
    {
        type: 'function',
        name: 'transferFrom',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'sender',
                type: 'address',
            },
            {
                name: 'recipient',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                type: 'bool',
            },
        ],
    },
];
/**
 * [bytes32-flavored ERC-20](https://docs.makerdao.com/smart-contract-modules/mkr-module#4.-gotchas-potential-source-of-user-error)
 * for tokens (ie. Maker) that use bytes32 instead of string.
 */
const erc20Abi_bytes32 = [
    {
        type: 'event',
        name: 'Approval',
        inputs: [
            {
                indexed: true,
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                name: 'spender',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'event',
        name: 'Transfer',
        inputs: [
            {
                indexed: true,
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                name: 'to',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'allowance',
        stateMutability: 'view',
        inputs: [
            {
                name: 'owner',
                type: 'address',
            },
            {
                name: 'spender',
                type: 'address',
            },
        ],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'approve',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'spender',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                type: 'bool',
            },
        ],
    },
    {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [
            {
                name: 'account',
                type: 'address',
            },
        ],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'decimals',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'uint8',
            },
        ],
    },
    {
        type: 'function',
        name: 'name',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'bytes32',
            },
        ],
    },
    {
        type: 'function',
        name: 'symbol',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'bytes32',
            },
        ],
    },
    {
        type: 'function',
        name: 'totalSupply',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'transfer',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'recipient',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                type: 'bool',
            },
        ],
    },
    {
        type: 'function',
        name: 'transferFrom',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'sender',
                type: 'address',
            },
            {
                name: 'recipient',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                type: 'bool',
            },
        ],
    },
];
/** [ERC-721 Non-Fungible Token Standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-721) */
const erc721Abi = [
    {
        type: 'event',
        name: 'Approval',
        inputs: [
            {
                indexed: true,
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                name: 'spender',
                type: 'address',
            },
            {
                indexed: true,
                name: 'tokenId',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'event',
        name: 'ApprovalForAll',
        inputs: [
            {
                indexed: true,
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                name: 'operator',
                type: 'address',
            },
            {
                indexed: false,
                name: 'approved',
                type: 'bool',
            },
        ],
    },
    {
        type: 'event',
        name: 'Transfer',
        inputs: [
            {
                indexed: true,
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                name: 'to',
                type: 'address',
            },
            {
                indexed: true,
                name: 'tokenId',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'approve',
        stateMutability: 'payable',
        inputs: [
            {
                name: 'spender',
                type: 'address',
            },
            {
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [
            {
                name: 'account',
                type: 'address',
            },
        ],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'getApproved',
        stateMutability: 'view',
        inputs: [
            {
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                type: 'address',
            },
        ],
    },
    {
        type: 'function',
        name: 'isApprovedForAll',
        stateMutability: 'view',
        inputs: [
            {
                name: 'owner',
                type: 'address',
            },
            {
                name: 'operator',
                type: 'address',
            },
        ],
        outputs: [
            {
                type: 'bool',
            },
        ],
    },
    {
        type: 'function',
        name: 'name',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'string',
            },
        ],
    },
    {
        type: 'function',
        name: 'ownerOf',
        stateMutability: 'view',
        inputs: [
            {
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                name: 'owner',
                type: 'address',
            },
        ],
    },
    {
        type: 'function',
        name: 'safeTransferFrom',
        stateMutability: 'payable',
        inputs: [
            {
                name: 'from',
                type: 'address',
            },
            {
                name: 'to',
                type: 'address',
            },
            {
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'safeTransferFrom',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'from',
                type: 'address',
            },
            {
                name: 'to',
                type: 'address',
            },
            {
                name: 'id',
                type: 'uint256',
            },
            {
                name: 'data',
                type: 'bytes',
            },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'setApprovalForAll',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'operator',
                type: 'address',
            },
            {
                name: 'approved',
                type: 'bool',
            },
        ],
        outputs: [],
    },
    {
        type: 'function',
        name: 'symbol',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'string',
            },
        ],
    },
    {
        type: 'function',
        name: 'tokenByIndex',
        stateMutability: 'view',
        inputs: [
            {
                name: 'index',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'tokenByIndex',
        stateMutability: 'view',
        inputs: [
            {
                name: 'owner',
                type: 'address',
            },
            {
                name: 'index',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                name: 'tokenId',
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'tokenURI',
        stateMutability: 'view',
        inputs: [
            {
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                type: 'string',
            },
        ],
    },
    {
        type: 'function',
        name: 'totalSupply',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'uint256',
            },
        ],
    },
    {
        type: 'function',
        name: 'transferFrom',
        stateMutability: 'payable',
        inputs: [
            {
                name: 'sender',
                type: 'address',
            },
            {
                name: 'recipient',
                type: 'address',
            },
            {
                name: 'tokeId',
                type: 'uint256',
            },
        ],
        outputs: [],
    },
];
/** [ERC-4626 Tokenized Vaults Standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-4626) */
const erc4626Abi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                name: 'spender',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: 'sender',
                type: 'address',
            },
            {
                indexed: true,
                name: 'receiver',
                type: 'address',
            },
            {
                indexed: false,
                name: 'assets',
                type: 'uint256',
            },
            {
                indexed: false,
                name: 'shares',
                type: 'uint256',
            },
        ],
        name: 'Deposit',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                name: 'to',
                type: 'address',
            },
            {
                indexed: false,
                name: 'value',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: 'sender',
                type: 'address',
            },
            {
                indexed: true,
                name: 'receiver',
                type: 'address',
            },
            {
                indexed: true,
                name: 'owner',
                type: 'address',
            },
            {
                indexed: false,
                name: 'assets',
                type: 'uint256',
            },
            {
                indexed: false,
                name: 'shares',
                type: 'uint256',
            },
        ],
        name: 'Withdraw',
        type: 'event',
    },
    {
        inputs: [
            {
                name: 'owner',
                type: 'address',
            },
            {
                name: 'spender',
                type: 'address',
            },
        ],
        name: 'allowance',
        outputs: [
            {
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'spender',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'approve',
        outputs: [
            {
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'asset',
        outputs: [
            {
                name: 'assetTokenAddress',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'account',
                type: 'address',
            },
        ],
        name: 'balanceOf',
        outputs: [
            {
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'shares',
                type: 'uint256',
            },
        ],
        name: 'convertToAssets',
        outputs: [
            {
                name: 'assets',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'assets',
                type: 'uint256',
            },
        ],
        name: 'convertToShares',
        outputs: [
            {
                name: 'shares',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'assets',
                type: 'uint256',
            },
            {
                name: 'receiver',
                type: 'address',
            },
        ],
        name: 'deposit',
        outputs: [
            {
                name: 'shares',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'caller',
                type: 'address',
            },
        ],
        name: 'maxDeposit',
        outputs: [
            {
                name: 'maxAssets',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'caller',
                type: 'address',
            },
        ],
        name: 'maxMint',
        outputs: [
            {
                name: 'maxShares',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'owner',
                type: 'address',
            },
        ],
        name: 'maxRedeem',
        outputs: [
            {
                name: 'maxShares',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'owner',
                type: 'address',
            },
        ],
        name: 'maxWithdraw',
        outputs: [
            {
                name: 'maxAssets',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'shares',
                type: 'uint256',
            },
            {
                name: 'receiver',
                type: 'address',
            },
        ],
        name: 'mint',
        outputs: [
            {
                name: 'assets',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'assets',
                type: 'uint256',
            },
        ],
        name: 'previewDeposit',
        outputs: [
            {
                name: 'shares',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'shares',
                type: 'uint256',
            },
        ],
        name: 'previewMint',
        outputs: [
            {
                name: 'assets',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'shares',
                type: 'uint256',
            },
        ],
        name: 'previewRedeem',
        outputs: [
            {
                name: 'assets',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'assets',
                type: 'uint256',
            },
        ],
        name: 'previewWithdraw',
        outputs: [
            {
                name: 'shares',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'shares',
                type: 'uint256',
            },
            {
                name: 'receiver',
                type: 'address',
            },
            {
                name: 'owner',
                type: 'address',
            },
        ],
        name: 'redeem',
        outputs: [
            {
                name: 'assets',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalAssets',
        outputs: [
            {
                name: 'totalManagedAssets',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'to',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'transfer',
        outputs: [
            {
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'from',
                type: 'address',
            },
            {
                name: 'to',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'transferFrom',
        outputs: [
            {
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                name: 'assets',
                type: 'uint256',
            },
            {
                name: 'receiver',
                type: 'address',
            },
            {
                name: 'owner',
                type: 'address',
            },
        ],
        name: 'withdraw',
        outputs: [
            {
                name: 'shares',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
];
//# sourceMappingURL=abis.js.map

/***/ }),

/***/ 4453:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   J9: () => (/* binding */ solidityPanic),
/* harmony export */   Mc: () => (/* binding */ solidityError),
/* harmony export */   fD: () => (/* binding */ panicReasons)
/* harmony export */ });
// https://docs.soliditylang.org/en/v0.8.16/control-structures.html#panic-via-assert-and-error-via-require
const panicReasons = {
    1: 'An `assert` condition failed.',
    17: 'Arithmetic operation resulted in underflow or overflow.',
    18: 'Division or modulo by zero (e.g. `5 / 0` or `23 % 0`).',
    33: 'Attempted to convert to an invalid type.',
    34: 'Attempted to access a storage byte array that is incorrectly encoded.',
    49: 'Performed `.pop()` on an empty array',
    50: 'Array index is out of bounds.',
    65: 'Allocated too much memory or created an array which is too large.',
    81: 'Attempted to call a zero-initialized variable of internal function type.',
};
const solidityError = {
    inputs: [
        {
            name: 'message',
            type: 'string',
        },
    ],
    name: 'Error',
    type: 'error',
};
const solidityPanic = {
    inputs: [
        {
            name: 'reason',
            type: 'uint256',
        },
    ],
    name: 'Panic',
    type: 'error',
};
//# sourceMappingURL=solidity.js.map

/***/ }),

/***/ 638:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   eL: () => (/* binding */ etherUnits),
/* harmony export */   sz: () => (/* binding */ gweiUnits)
/* harmony export */ });
/* unused harmony export weiUnits */
const etherUnits = {
    gwei: 9,
    wei: 18,
};
const gweiUnits = {
    ether: -9,
    wei: 9,
};
const weiUnits = {
    ether: -18,
    gwei: -9,
};
//# sourceMappingURL=unit.js.map

/***/ }),

/***/ 7372:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BI: () => (/* binding */ BytesSizeMismatchError),
/* harmony export */   Iy: () => (/* binding */ AbiDecodingDataSizeTooSmallError),
/* harmony export */   Iz: () => (/* binding */ AbiFunctionNotFoundError),
/* harmony export */   MR: () => (/* binding */ AbiFunctionOutputsNotFoundError),
/* harmony export */   M_: () => (/* binding */ AbiEventNotFoundError),
/* harmony export */   Nc: () => (/* binding */ AbiEncodingArrayLengthMismatchError),
/* harmony export */   O: () => (/* binding */ AbiDecodingZeroDataError),
/* harmony export */   Wq: () => (/* binding */ AbiErrorSignatureNotFoundError),
/* harmony export */   YE: () => (/* binding */ AbiEncodingLengthMismatchError),
/* harmony export */   YF: () => (/* binding */ AbiConstructorParamsNotFoundError),
/* harmony export */   YW: () => (/* binding */ AbiConstructorNotFoundError),
/* harmony export */   _z: () => (/* binding */ AbiEventSignatureEmptyTopicsError),
/* harmony export */   d_: () => (/* binding */ InvalidDefinitionTypeError),
/* harmony export */   dm: () => (/* binding */ InvalidArrayError),
/* harmony export */   fo: () => (/* binding */ DecodeLogDataMismatch),
/* harmony export */   gH: () => (/* binding */ AbiEncodingBytesSizeMismatchError),
/* harmony export */   j: () => (/* binding */ InvalidAbiDecodingTypeError),
/* harmony export */   kE: () => (/* binding */ AbiEventSignatureNotFoundError),
/* harmony export */   l3: () => (/* binding */ DecodeLogTopicsMismatch),
/* harmony export */   nK: () => (/* binding */ InvalidAbiEncodingTypeError),
/* harmony export */   nM: () => (/* binding */ AbiItemAmbiguityError)
/* harmony export */ });
/* unused harmony exports AbiDecodingDataSizeInvalidError, AbiDecodingOffsetOutOfBoundsError, AbiErrorInputsNotFoundError, AbiErrorNotFoundError, AbiFunctionSignatureNotFoundError, UnsupportedPackedAbiType */
/* harmony import */ var _utils_abi_formatAbiItem_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5167);
/* harmony import */ var _utils_data_size_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5182);
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);



class AbiConstructorNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ docsPath }) {
        super([
            'A constructor was not found on the ABI.',
            'Make sure you are using the correct ABI and that the constructor exists on it.',
        ].join('\n'), {
            docsPath,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiConstructorNotFoundError'
        });
    }
}
class AbiConstructorParamsNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ docsPath }) {
        super([
            'Constructor arguments were provided (`args`), but a constructor parameters (`inputs`) were not found on the ABI.',
            'Make sure you are using the correct ABI, and that the `inputs` attribute on the constructor exists.',
        ].join('\n'), {
            docsPath,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiConstructorParamsNotFoundError'
        });
    }
}
class AbiDecodingDataSizeInvalidError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ data, size }) {
        super([
            `Data size of ${size} bytes is invalid.`,
            'Size must be in increments of 32 bytes (size % 32 === 0).',
        ].join('\n'), { metaMessages: [`Data: ${data} (${size} bytes)`] });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiDecodingDataSizeInvalidError'
        });
    }
}
class AbiDecodingDataSizeTooSmallError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ data, params, size, }) {
        super([`Data size of ${size} bytes is too small for given parameters.`].join('\n'), {
            metaMessages: [
                `Params: (${(0,_utils_abi_formatAbiItem_js__WEBPACK_IMPORTED_MODULE_1__/* .formatAbiParams */ .A)(params, { includeName: true })})`,
                `Data:   ${data} (${size} bytes)`,
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiDecodingDataSizeTooSmallError'
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "params", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.data = data;
        this.params = params;
        this.size = size;
    }
}
class AbiDecodingOffsetOutOfBoundsError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ offset, position }) {
        super(`Offset at "${offset}" is out-of-bounds (current position: "${position}").`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiDecodingOffsetOutOfBoundsError'
        });
    }
}
class AbiDecodingZeroDataError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor() {
        super('Cannot decode zero data ("0x") with ABI parameters.');
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiDecodingZeroDataError'
        });
    }
}
class AbiEncodingArrayLengthMismatchError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ expectedLength, givenLength, type, }) {
        super([
            `ABI encoding array length mismatch for type ${type}.`,
            `Expected length: ${expectedLength}`,
            `Given length: ${givenLength}`,
        ].join('\n'));
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiEncodingArrayLengthMismatchError'
        });
    }
}
class AbiEncodingBytesSizeMismatchError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ expectedSize, value }) {
        super(`Size of bytes "${value}" (bytes${(0,_utils_data_size_js__WEBPACK_IMPORTED_MODULE_2__/* .size */ .E)(value)}) does not match expected size (bytes${expectedSize}).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiEncodingBytesSizeMismatchError'
        });
    }
}
class AbiEncodingLengthMismatchError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ expectedLength, givenLength, }) {
        super([
            'ABI encoding params/values length mismatch.',
            `Expected length (params): ${expectedLength}`,
            `Given length (values): ${givenLength}`,
        ].join('\n'));
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiEncodingLengthMismatchError'
        });
    }
}
class AbiErrorInputsNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(errorName, { docsPath }) {
        super([
            `Arguments (\`args\`) were provided to "${errorName}", but "${errorName}" on the ABI does not contain any parameters (\`inputs\`).`,
            'Cannot encode error result without knowing what the parameter types are.',
            'Make sure you are using the correct ABI and that the inputs exist on it.',
        ].join('\n'), {
            docsPath,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiErrorInputsNotFoundError'
        });
    }
}
class AbiErrorNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(errorName, { docsPath } = {}) {
        super([
            `Error ${errorName ? `"${errorName}" ` : ''}not found on ABI.`,
            'Make sure you are using the correct ABI and that the error exists on it.',
        ].join('\n'), {
            docsPath,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiErrorNotFoundError'
        });
    }
}
class AbiErrorSignatureNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(signature, { docsPath }) {
        super([
            `Encoded error signature "${signature}" not found on ABI.`,
            'Make sure you are using the correct ABI and that the error exists on it.',
            `You can look up the decoded signature here: https://openchain.xyz/signatures?query=${signature}.`,
        ].join('\n'), {
            docsPath,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiErrorSignatureNotFoundError'
        });
        Object.defineProperty(this, "signature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.signature = signature;
    }
}
class AbiEventSignatureEmptyTopicsError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ docsPath }) {
        super('Cannot extract event signature from empty topics.', {
            docsPath,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiEventSignatureEmptyTopicsError'
        });
    }
}
class AbiEventSignatureNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(signature, { docsPath }) {
        super([
            `Encoded event signature "${signature}" not found on ABI.`,
            'Make sure you are using the correct ABI and that the event exists on it.',
            `You can look up the signature here: https://openchain.xyz/signatures?query=${signature}.`,
        ].join('\n'), {
            docsPath,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiEventSignatureNotFoundError'
        });
    }
}
class AbiEventNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(eventName, { docsPath } = {}) {
        super([
            `Event ${eventName ? `"${eventName}" ` : ''}not found on ABI.`,
            'Make sure you are using the correct ABI and that the event exists on it.',
        ].join('\n'), {
            docsPath,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiEventNotFoundError'
        });
    }
}
class AbiFunctionNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(functionName, { docsPath } = {}) {
        super([
            `Function ${functionName ? `"${functionName}" ` : ''}not found on ABI.`,
            'Make sure you are using the correct ABI and that the function exists on it.',
        ].join('\n'), {
            docsPath,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiFunctionNotFoundError'
        });
    }
}
class AbiFunctionOutputsNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(functionName, { docsPath }) {
        super([
            `Function "${functionName}" does not contain any \`outputs\` on ABI.`,
            'Cannot decode function result without knowing what the parameter types are.',
            'Make sure you are using the correct ABI and that the function exists on it.',
        ].join('\n'), {
            docsPath,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiFunctionOutputsNotFoundError'
        });
    }
}
class AbiFunctionSignatureNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(signature, { docsPath }) {
        super([
            `Encoded function signature "${signature}" not found on ABI.`,
            'Make sure you are using the correct ABI and that the function exists on it.',
            `You can look up the signature here: https://openchain.xyz/signatures?query=${signature}.`,
        ].join('\n'), {
            docsPath,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiFunctionSignatureNotFoundError'
        });
    }
}
class AbiItemAmbiguityError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(x, y) {
        super('Found ambiguous types in overloaded ABI items.', {
            metaMessages: [
                `\`${x.type}\` in \`${(0,_utils_abi_formatAbiItem_js__WEBPACK_IMPORTED_MODULE_1__/* .formatAbiItem */ .B)(x.abiItem)}\`, and`,
                `\`${y.type}\` in \`${(0,_utils_abi_formatAbiItem_js__WEBPACK_IMPORTED_MODULE_1__/* .formatAbiItem */ .B)(y.abiItem)}\``,
                '',
                'These types encode differently and cannot be distinguished at runtime.',
                'Remove one of the ambiguous items in the ABI.',
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AbiItemAmbiguityError'
        });
    }
}
class BytesSizeMismatchError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ expectedSize, givenSize, }) {
        super(`Expected bytes${expectedSize}, got bytes${givenSize}.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'BytesSizeMismatchError'
        });
    }
}
class DecodeLogDataMismatch extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ abiItem, data, params, size, }) {
        super([
            `Data size of ${size} bytes is too small for non-indexed event parameters.`,
        ].join('\n'), {
            metaMessages: [
                `Params: (${(0,_utils_abi_formatAbiItem_js__WEBPACK_IMPORTED_MODULE_1__/* .formatAbiParams */ .A)(params, { includeName: true })})`,
                `Data:   ${data} (${size} bytes)`,
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'DecodeLogDataMismatch'
        });
        Object.defineProperty(this, "abiItem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "params", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.abiItem = abiItem;
        this.data = data;
        this.params = params;
        this.size = size;
    }
}
class DecodeLogTopicsMismatch extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ abiItem, param, }) {
        super([
            `Expected a topic for indexed event parameter${param.name ? ` "${param.name}"` : ''} on event "${(0,_utils_abi_formatAbiItem_js__WEBPACK_IMPORTED_MODULE_1__/* .formatAbiItem */ .B)(abiItem, { includeName: true })}".`,
        ].join('\n'));
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'DecodeLogTopicsMismatch'
        });
        Object.defineProperty(this, "abiItem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.abiItem = abiItem;
    }
}
class InvalidAbiEncodingTypeError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(type, { docsPath }) {
        super([
            `Type "${type}" is not a valid encoding type.`,
            'Please provide a valid ABI type.',
        ].join('\n'), { docsPath });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidAbiEncodingType'
        });
    }
}
class InvalidAbiDecodingTypeError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(type, { docsPath }) {
        super([
            `Type "${type}" is not a valid decoding type.`,
            'Please provide a valid ABI type.',
        ].join('\n'), { docsPath });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidAbiDecodingType'
        });
    }
}
class InvalidArrayError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(value) {
        super([`Value "${value}" is not a valid array.`].join('\n'));
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidArrayError'
        });
    }
}
class InvalidDefinitionTypeError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(type) {
        super([
            `"${type}" is not a valid definition type.`,
            'Valid types: "function", "event", "error"',
        ].join('\n'));
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidDefinitionTypeError'
        });
    }
}
class UnsupportedPackedAbiType extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(type) {
        super(`Type "${type}" is not supported for packed encoding.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnsupportedPackedAbiType'
        });
    }
}
//# sourceMappingURL=abi.js.map

/***/ }),

/***/ 4337:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   T: () => (/* binding */ AccountNotFoundError)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);

class AccountNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ docsPath } = {}) {
        super([
            'Could not find an Account to execute with this Action.',
            'Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the WalletClient.',
        ].join('\n'), {
            docsPath,
            docsSlug: 'account',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AccountNotFoundError'
        });
    }
}
//# sourceMappingURL=account.js.map

/***/ }),

/***/ 4306:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   M: () => (/* binding */ InvalidAddressError)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);

class InvalidAddressError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ address }) {
        super(`Address "${address}" is invalid.`, {
            metaMessages: [
                '- Address must be a hex value of 20 bytes (40 hex characters).',
                '- Address must match its checksum counterpart.',
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidAddressError'
        });
    }
}
//# sourceMappingURL=address.js.map

/***/ }),

/***/ 6329:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   C: () => (/* binding */ BaseError)
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1526);

class BaseError extends Error {
    constructor(shortMessage, args = {}) {
        super();
        Object.defineProperty(this, "details", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "docsPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metaMessages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ViemError'
        });
        Object.defineProperty(this, "version", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (0,_utils_js__WEBPACK_IMPORTED_MODULE_0__/* .getVersion */ .HF)()
        });
        const details = args.cause instanceof BaseError
            ? args.cause.details
            : args.cause?.message
                ? args.cause.message
                : args.details;
        const docsPath = args.cause instanceof BaseError
            ? args.cause.docsPath || args.docsPath
            : args.docsPath;
        this.message = [
            shortMessage || 'An error occurred.',
            '',
            ...(args.metaMessages ? [...args.metaMessages, ''] : []),
            ...(docsPath
                ? [
                    `Docs: https://viem.sh${docsPath}${args.docsSlug ? `#${args.docsSlug}` : ''}`,
                ]
                : []),
            ...(details ? [`Details: ${details}`] : []),
            `Version: ${this.version}`,
        ].join('\n');
        if (args.cause)
            this.cause = args.cause;
        this.details = details;
        this.docsPath = docsPath;
        this.metaMessages = args.metaMessages;
        this.shortMessage = shortMessage;
    }
    walk(fn) {
        return walk(this, fn);
    }
}
function walk(err, fn) {
    if (fn?.(err))
        return err;
    if (err && typeof err === 'object' && 'cause' in err)
        return walk(err.cause, fn);
    return fn ? null : err;
}
//# sourceMappingURL=base.js.map

/***/ }),

/***/ 4259:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   l: () => (/* binding */ BlockNotFoundError)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);

class BlockNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ blockHash, blockNumber, }) {
        let identifier = 'Block';
        if (blockHash)
            identifier = `Block at hash "${blockHash}"`;
        if (blockNumber)
            identifier = `Block at number "${blockNumber}"`;
        super(`${identifier} could not be found.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'BlockNotFoundError'
        });
    }
}
//# sourceMappingURL=block.js.map

/***/ }),

/***/ 8703:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EH: () => (/* binding */ ChainMismatchError),
/* harmony export */   YE: () => (/* binding */ ClientChainNotConfiguredError),
/* harmony export */   jF: () => (/* binding */ ChainNotFoundError),
/* harmony export */   rj: () => (/* binding */ ChainDoesNotSupportContract)
/* harmony export */ });
/* unused harmony export InvalidChainIdError */
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);

class ChainDoesNotSupportContract extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ blockNumber, chain, contract, }) {
        super(`Chain "${chain.name}" does not support contract "${contract.name}".`, {
            metaMessages: [
                'This could be due to any of the following:',
                ...(blockNumber &&
                    contract.blockCreated &&
                    contract.blockCreated > blockNumber
                    ? [
                        `- The contract "${contract.name}" was not deployed until block ${contract.blockCreated} (current block ${blockNumber}).`,
                    ]
                    : [
                        `- The chain does not have the contract "${contract.name}" configured.`,
                    ]),
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ChainDoesNotSupportContract'
        });
    }
}
class ChainMismatchError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ chain, currentChainId, }) {
        super(`The current chain of the wallet (id: ${currentChainId}) does not match the target chain for the transaction (id: ${chain.id} – ${chain.name}).`, {
            metaMessages: [
                `Current Chain ID:  ${currentChainId}`,
                `Expected Chain ID: ${chain.id} – ${chain.name}`,
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ChainMismatchError'
        });
    }
}
class ChainNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor() {
        super([
            'No chain was provided to the request.',
            'Please provide a chain with the `chain` argument on the Action, or by supplying a `chain` to WalletClient.',
        ].join('\n'));
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ChainNotFoundError'
        });
    }
}
class ClientChainNotConfiguredError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor() {
        super('No chain was provided to the Client.');
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ClientChainNotConfiguredError'
        });
    }
}
class InvalidChainIdError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ chainId }) {
        super(typeof chainId === 'number'
            ? `Chain ID "${chainId}" is invalid.`
            : 'Chain ID is invalid.');
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidChainIdError'
        });
    }
}
//# sourceMappingURL=chain.js.map

/***/ }),

/***/ 8863:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  zX: () => (/* binding */ CallExecutionError),
  bG: () => (/* binding */ ContractFunctionExecutionError),
  M: () => (/* binding */ ContractFunctionRevertedError),
  rR: () => (/* binding */ ContractFunctionZeroDataError),
  $S: () => (/* binding */ RawContractError)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/accounts/utils/parseAccount.js
var parseAccount = __webpack_require__(3033);
// EXTERNAL MODULE: ./node_modules/viem/_esm/constants/solidity.js
var solidity = __webpack_require__(4453);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/decodeErrorResult.js
var decodeErrorResult = __webpack_require__(5462);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/formatAbiItem.js
var formatAbiItem = __webpack_require__(5167);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/stringify.js
var stringify = __webpack_require__(8463);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/abi/formatAbiItemWithArgs.js

function formatAbiItemWithArgs({ abiItem, args, includeFunctionName = true, includeName = false, }) {
    if (!('name' in abiItem))
        return;
    if (!('inputs' in abiItem))
        return;
    if (!abiItem.inputs)
        return;
    return `${includeFunctionName ? abiItem.name : ''}(${abiItem.inputs
        .map((input, i) => `${includeName && input.name ? `${input.name}: ` : ''}${typeof args[i] === 'object' ? (0,stringify/* stringify */.A)(args[i]) : args[i]}`)
        .join(', ')})`;
}
//# sourceMappingURL=formatAbiItemWithArgs.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/getAbiItem.js
var getAbiItem = __webpack_require__(4586);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/unit/formatEther.js
var formatEther = __webpack_require__(9436);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/unit/formatGwei.js
var formatGwei = __webpack_require__(9670);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/abi.js
var errors_abi = __webpack_require__(7372);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/base.js
var base = __webpack_require__(6329);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/stateOverride.js
var errors_stateOverride = __webpack_require__(6883);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/transaction.js
var transaction = __webpack_require__(8990);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/utils.js + 1 modules
var utils = __webpack_require__(1526);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/errors/contract.js













class CallExecutionError extends base/* BaseError */.C {
    constructor(cause, { account: account_, docsPath, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride, }) {
        const account = account_ ? (0,parseAccount/* parseAccount */.J)(account_) : undefined;
        let prettyArgs = (0,transaction/* prettyPrint */.aO)({
            from: account?.address,
            to,
            value: typeof value !== 'undefined' &&
                `${(0,formatEther/* formatEther */.c)(value)} ${chain?.nativeCurrency?.symbol || 'ETH'}`,
            data,
            gas,
            gasPrice: typeof gasPrice !== 'undefined' && `${(0,formatGwei/* formatGwei */.Q)(gasPrice)} gwei`,
            maxFeePerGas: typeof maxFeePerGas !== 'undefined' &&
                `${(0,formatGwei/* formatGwei */.Q)(maxFeePerGas)} gwei`,
            maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== 'undefined' &&
                `${(0,formatGwei/* formatGwei */.Q)(maxPriorityFeePerGas)} gwei`,
            nonce,
        });
        if (stateOverride) {
            prettyArgs += `\n${(0,errors_stateOverride/* prettyStateOverride */.uj)(stateOverride)}`;
        }
        super(cause.shortMessage, {
            cause,
            docsPath,
            metaMessages: [
                ...(cause.metaMessages ? [...cause.metaMessages, ' '] : []),
                'Raw Call Arguments:',
                prettyArgs,
            ].filter(Boolean),
        });
        Object.defineProperty(this, "cause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'CallExecutionError'
        });
        this.cause = cause;
    }
}
class ContractFunctionExecutionError extends base/* BaseError */.C {
    constructor(cause, { abi, args, contractAddress, docsPath, functionName, sender, }) {
        const abiItem = (0,getAbiItem/* getAbiItem */.iY)({ abi, args, name: functionName });
        const formattedArgs = abiItem
            ? formatAbiItemWithArgs({
                abiItem,
                args,
                includeFunctionName: false,
                includeName: false,
            })
            : undefined;
        const functionWithParams = abiItem
            ? (0,formatAbiItem/* formatAbiItem */.B)(abiItem, { includeName: true })
            : undefined;
        const prettyArgs = (0,transaction/* prettyPrint */.aO)({
            address: contractAddress && (0,utils/* getContractAddress */.RZ)(contractAddress),
            function: functionWithParams,
            args: formattedArgs &&
                formattedArgs !== '()' &&
                `${[...Array(functionName?.length ?? 0).keys()]
                    .map(() => ' ')
                    .join('')}${formattedArgs}`,
            sender,
        });
        super(cause.shortMessage ||
            `An unknown error occurred while executing the contract function "${functionName}".`, {
            cause,
            docsPath,
            metaMessages: [
                ...(cause.metaMessages ? [...cause.metaMessages, ' '] : []),
                'Contract Call:',
                prettyArgs,
            ].filter(Boolean),
        });
        Object.defineProperty(this, "abi", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "args", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "contractAddress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "formattedArgs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "functionName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sender", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ContractFunctionExecutionError'
        });
        this.abi = abi;
        this.args = args;
        this.cause = cause;
        this.contractAddress = contractAddress;
        this.functionName = functionName;
        this.sender = sender;
    }
}
class ContractFunctionRevertedError extends base/* BaseError */.C {
    constructor({ abi, data, functionName, message, }) {
        let cause;
        let decodedData = undefined;
        let metaMessages;
        let reason;
        if (data && data !== '0x') {
            try {
                decodedData = (0,decodeErrorResult/* decodeErrorResult */.W)({ abi, data });
                const { abiItem, errorName, args: errorArgs } = decodedData;
                if (errorName === 'Error') {
                    reason = errorArgs[0];
                }
                else if (errorName === 'Panic') {
                    const [firstArg] = errorArgs;
                    reason = solidity/* panicReasons */.fD[firstArg];
                }
                else {
                    const errorWithParams = abiItem
                        ? (0,formatAbiItem/* formatAbiItem */.B)(abiItem, { includeName: true })
                        : undefined;
                    const formattedArgs = abiItem && errorArgs
                        ? formatAbiItemWithArgs({
                            abiItem,
                            args: errorArgs,
                            includeFunctionName: false,
                            includeName: false,
                        })
                        : undefined;
                    metaMessages = [
                        errorWithParams ? `Error: ${errorWithParams}` : '',
                        formattedArgs && formattedArgs !== '()'
                            ? `       ${[...Array(errorName?.length ?? 0).keys()]
                                .map(() => ' ')
                                .join('')}${formattedArgs}`
                            : '',
                    ];
                }
            }
            catch (err) {
                cause = err;
            }
        }
        else if (message)
            reason = message;
        let signature;
        if (cause instanceof errors_abi/* AbiErrorSignatureNotFoundError */.Wq) {
            signature = cause.signature;
            metaMessages = [
                `Unable to decode signature "${signature}" as it was not found on the provided ABI.`,
                'Make sure you are using the correct ABI and that the error exists on it.',
                `You can look up the decoded signature here: https://openchain.xyz/signatures?query=${signature}.`,
            ];
        }
        super((reason && reason !== 'execution reverted') || signature
            ? [
                `The contract function "${functionName}" reverted with the following ${signature ? 'signature' : 'reason'}:`,
                reason || signature,
            ].join('\n')
            : `The contract function "${functionName}" reverted.`, {
            cause,
            metaMessages,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ContractFunctionRevertedError'
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "reason", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "signature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.data = decodedData;
        this.reason = reason;
        this.signature = signature;
    }
}
class ContractFunctionZeroDataError extends base/* BaseError */.C {
    constructor({ functionName }) {
        super(`The contract function "${functionName}" returned no data ("0x").`, {
            metaMessages: [
                'This could be due to any of the following:',
                `  - The contract does not have the function "${functionName}",`,
                '  - The parameters passed to the contract function may be invalid, or',
                '  - The address is not a contract.',
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ContractFunctionZeroDataError'
        });
    }
}
class RawContractError extends base/* BaseError */.C {
    constructor({ data, message, }) {
        super(message || '');
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'RawContractError'
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.data = data;
    }
}
//# sourceMappingURL=contract.js.map

/***/ }),

/***/ 8146:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   B4: () => (/* binding */ NegativeOffsetError),
/* harmony export */   SK: () => (/* binding */ PositionOutOfBoundsError),
/* harmony export */   hX: () => (/* binding */ RecursiveReadLimitExceededError)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);

class NegativeOffsetError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ offset }) {
        super(`Offset \`${offset}\` cannot be negative.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'NegativeOffsetError'
        });
    }
}
class PositionOutOfBoundsError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ length, position }) {
        super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'PositionOutOfBoundsError'
        });
    }
}
class RecursiveReadLimitExceededError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ count, limit }) {
        super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'RecursiveReadLimitExceededError'
        });
    }
}
//# sourceMappingURL=cursor.js.map

/***/ }),

/***/ 6440:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Fl: () => (/* binding */ SizeExceedsPaddingSizeError),
/* harmony export */   NV: () => (/* binding */ InvalidBytesLengthError),
/* harmony export */   ii: () => (/* binding */ SliceOffsetOutOfBoundsError)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);

class SliceOffsetOutOfBoundsError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ offset, position, size, }) {
        super(`Slice ${position === 'start' ? 'starting' : 'ending'} at offset "${offset}" is out-of-bounds (size: ${size}).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'SliceOffsetOutOfBoundsError'
        });
    }
}
class SizeExceedsPaddingSizeError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ size, targetSize, type, }) {
        super(`${type.charAt(0).toUpperCase()}${type
            .slice(1)
            .toLowerCase()} size (${size}) exceeds padding size (${targetSize}).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'SizeExceedsPaddingSizeError'
        });
    }
}
class InvalidBytesLengthError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ size, targetSize, type, }) {
        super(`${type.charAt(0).toUpperCase()}${type
            .slice(1)
            .toLowerCase()} is expected to be ${targetSize} ${type} long, but is ${size} ${type} long.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidBytesLengthError'
        });
    }
}
//# sourceMappingURL=data.js.map

/***/ }),

/***/ 4317:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ty: () => (/* binding */ IntegerOutOfRangeError),
/* harmony export */   u: () => (/* binding */ SizeOverflowError),
/* harmony export */   xO: () => (/* binding */ InvalidBytesBooleanError)
/* harmony export */ });
/* unused harmony exports InvalidHexBooleanError, InvalidHexValueError */
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);

class IntegerOutOfRangeError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ max, min, signed, size, value, }) {
        super(`Number "${value}" is not in safe ${size ? `${size * 8}-bit ${signed ? 'signed' : 'unsigned'} ` : ''}integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'IntegerOutOfRangeError'
        });
    }
}
class InvalidBytesBooleanError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(bytes) {
        super(`Bytes value "${bytes}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidBytesBooleanError'
        });
    }
}
class InvalidHexBooleanError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(hex) {
        super(`Hex value "${hex}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidHexBooleanError'
        });
    }
}
class InvalidHexValueError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(value) {
        super(`Hex value "${value}" is an odd length (${value.length}). It must be an even length.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidHexValueError'
        });
    }
}
class SizeOverflowError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ givenSize, maxSize }) {
        super(`Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'SizeOverflowError'
        });
    }
}
//# sourceMappingURL=encoding.js.map

/***/ }),

/***/ 7250:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RR: () => (/* binding */ MaxFeePerGasTooLowError),
/* harmony export */   pw: () => (/* binding */ Eip1559FeesNotSupportedError),
/* harmony export */   sM: () => (/* binding */ BaseFeeScalarError)
/* harmony export */ });
/* harmony import */ var _utils_unit_formatGwei_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9670);
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);


class BaseFeeScalarError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor() {
        super('`baseFeeMultiplier` must be greater than 1.');
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'BaseFeeScalarError'
        });
    }
}
class Eip1559FeesNotSupportedError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor() {
        super('Chain does not support EIP-1559 fees.');
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'Eip1559FeesNotSupportedError'
        });
    }
}
class MaxFeePerGasTooLowError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ maxPriorityFeePerGas }) {
        super(`\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${(0,_utils_unit_formatGwei_js__WEBPACK_IMPORTED_MODULE_1__/* .formatGwei */ .Q)(maxPriorityFeePerGas)} gwei).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'MaxFeePerGasTooLowError'
        });
    }
}
//# sourceMappingURL=fee.js.map

/***/ }),

/***/ 2592:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A7: () => (/* binding */ ExecutionRevertedError),
/* harmony export */   BG: () => (/* binding */ FeeCapTooHighError),
/* harmony export */   Fo: () => (/* binding */ IntrinsicGasTooLowError),
/* harmony export */   K0: () => (/* binding */ NonceTooHighError),
/* harmony export */   Oh: () => (/* binding */ NonceTooLowError),
/* harmony export */   RM: () => (/* binding */ UnknownNodeError),
/* harmony export */   jj: () => (/* binding */ FeeCapTooLowError),
/* harmony export */   k5: () => (/* binding */ InsufficientFundsError),
/* harmony export */   lN: () => (/* binding */ TipAboveFeeCapError),
/* harmony export */   lY: () => (/* binding */ IntrinsicGasTooHighError),
/* harmony export */   uC: () => (/* binding */ TransactionTypeNotSupportedError),
/* harmony export */   vW: () => (/* binding */ NonceMaxValueError)
/* harmony export */ });
/* harmony import */ var _utils_unit_formatGwei_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9670);
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);


class ExecutionRevertedError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ cause, message, } = {}) {
        const reason = message
            ?.replace('execution reverted: ', '')
            ?.replace('execution reverted', '');
        super(`Execution reverted ${reason ? `with reason: ${reason}` : 'for an unknown reason'}.`, {
            cause,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ExecutionRevertedError'
        });
    }
}
Object.defineProperty(ExecutionRevertedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 3
});
Object.defineProperty(ExecutionRevertedError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /execution reverted/
});
class FeeCapTooHighError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ cause, maxFeePerGas, } = {}) {
        super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${(0,_utils_unit_formatGwei_js__WEBPACK_IMPORTED_MODULE_1__/* .formatGwei */ .Q)(maxFeePerGas)} gwei` : ''}) cannot be higher than the maximum allowed value (2^256-1).`, {
            cause,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'FeeCapTooHigh'
        });
    }
}
Object.defineProperty(FeeCapTooHighError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/
});
class FeeCapTooLowError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ cause, maxFeePerGas, } = {}) {
        super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${(0,_utils_unit_formatGwei_js__WEBPACK_IMPORTED_MODULE_1__/* .formatGwei */ .Q)(maxFeePerGas)}` : ''} gwei) cannot be lower than the block base fee.`, {
            cause,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'FeeCapTooLow'
        });
    }
}
Object.defineProperty(FeeCapTooLowError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/
});
class NonceTooHighError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ cause, nonce, } = {}) {
        super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ''}is higher than the next one expected.`, { cause });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'NonceTooHighError'
        });
    }
}
Object.defineProperty(NonceTooHighError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /nonce too high/
});
class NonceTooLowError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ cause, nonce, } = {}) {
        super([
            `Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ''}is lower than the current nonce of the account.`,
            'Try increasing the nonce or find the latest nonce with `getTransactionCount`.',
        ].join('\n'), { cause });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'NonceTooLowError'
        });
    }
}
Object.defineProperty(NonceTooLowError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /nonce too low|transaction already imported|already known/
});
class NonceMaxValueError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ cause, nonce, } = {}) {
        super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ''}exceeds the maximum allowed nonce.`, { cause });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'NonceMaxValueError'
        });
    }
}
Object.defineProperty(NonceMaxValueError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /nonce has max value/
});
class InsufficientFundsError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ cause } = {}) {
        super([
            'The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.',
        ].join('\n'), {
            cause,
            metaMessages: [
                'This error could arise when the account does not have enough funds to:',
                ' - pay for the total gas fee,',
                ' - pay for the value to send.',
                ' ',
                'The cost of the transaction is calculated as `gas * gas fee + value`, where:',
                ' - `gas` is the amount of gas needed for transaction to execute,',
                ' - `gas fee` is the gas fee,',
                ' - `value` is the amount of ether to send to the recipient.',
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InsufficientFundsError'
        });
    }
}
Object.defineProperty(InsufficientFundsError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /insufficient funds/
});
class IntrinsicGasTooHighError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ cause, gas, } = {}) {
        super(`The amount of gas ${gas ? `(${gas}) ` : ''}provided for the transaction exceeds the limit allowed for the block.`, {
            cause,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'IntrinsicGasTooHighError'
        });
    }
}
Object.defineProperty(IntrinsicGasTooHighError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /intrinsic gas too high|gas limit reached/
});
class IntrinsicGasTooLowError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ cause, gas, } = {}) {
        super(`The amount of gas ${gas ? `(${gas}) ` : ''}provided for the transaction is too low.`, {
            cause,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'IntrinsicGasTooLowError'
        });
    }
}
Object.defineProperty(IntrinsicGasTooLowError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /intrinsic gas too low/
});
class TransactionTypeNotSupportedError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ cause }) {
        super('The transaction type is not supported for this chain.', {
            cause,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'TransactionTypeNotSupportedError'
        });
    }
}
Object.defineProperty(TransactionTypeNotSupportedError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /transaction type not valid/
});
class TipAboveFeeCapError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ cause, maxPriorityFeePerGas, maxFeePerGas, } = {}) {
        super([
            `The provided tip (\`maxPriorityFeePerGas\`${maxPriorityFeePerGas
                ? ` = ${(0,_utils_unit_formatGwei_js__WEBPACK_IMPORTED_MODULE_1__/* .formatGwei */ .Q)(maxPriorityFeePerGas)} gwei`
                : ''}) cannot be higher than the fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${(0,_utils_unit_formatGwei_js__WEBPACK_IMPORTED_MODULE_1__/* .formatGwei */ .Q)(maxFeePerGas)} gwei` : ''}).`,
        ].join('\n'), {
            cause,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'TipAboveFeeCapError'
        });
    }
}
Object.defineProperty(TipAboveFeeCapError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /max priority fee per gas higher than max fee per gas|tip higher than fee cap/
});
class UnknownNodeError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ cause }) {
        super(`An error occurred while executing: ${cause?.shortMessage}`, {
            cause,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnknownNodeError'
        });
    }
}
//# sourceMappingURL=node.js.map

/***/ }),

/***/ 6595:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ci: () => (/* binding */ HttpRequestError),
/* harmony export */   J8: () => (/* binding */ RpcRequestError),
/* harmony export */   MU: () => (/* binding */ TimeoutError)
/* harmony export */ });
/* unused harmony export WebSocketRequestError */
/* harmony import */ var _utils_stringify_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8463);
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1526);



class HttpRequestError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ body, details, headers, status, url, }) {
        super('HTTP request failed.', {
            details,
            metaMessages: [
                status && `Status: ${status}`,
                `URL: ${(0,_utils_js__WEBPACK_IMPORTED_MODULE_1__/* .getUrl */ .ID)(url)}`,
                body && `Request body: ${(0,_utils_stringify_js__WEBPACK_IMPORTED_MODULE_2__/* .stringify */ .A)(body)}`,
            ].filter(Boolean),
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'HttpRequestError'
        });
        Object.defineProperty(this, "body", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "headers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.body = body;
        this.headers = headers;
        this.status = status;
        this.url = url;
    }
}
class WebSocketRequestError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ body, details, url, }) {
        super('WebSocket request failed.', {
            details,
            metaMessages: [`URL: ${(0,_utils_js__WEBPACK_IMPORTED_MODULE_1__/* .getUrl */ .ID)(url)}`, `Request body: ${(0,_utils_stringify_js__WEBPACK_IMPORTED_MODULE_2__/* .stringify */ .A)(body)}`],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'WebSocketRequestError'
        });
    }
}
class RpcRequestError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ body, error, url, }) {
        super('RPC Request failed.', {
            cause: error,
            details: error.message,
            metaMessages: [`URL: ${(0,_utils_js__WEBPACK_IMPORTED_MODULE_1__/* .getUrl */ .ID)(url)}`, `Request body: ${(0,_utils_stringify_js__WEBPACK_IMPORTED_MODULE_2__/* .stringify */ .A)(body)}`],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'RpcRequestError'
        });
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.code = error.code;
    }
}
class TimeoutError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ body, url, }) {
        super('The request took too long to respond.', {
            details: 'The request timed out.',
            metaMessages: [`URL: ${(0,_utils_js__WEBPACK_IMPORTED_MODULE_1__/* .getUrl */ .ID)(url)}`, `Request body: ${(0,_utils_stringify_js__WEBPACK_IMPORTED_MODULE_2__/* .stringify */ .A)(body)}`],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'TimeoutError'
        });
    }
}
//# sourceMappingURL=request.js.map

/***/ }),

/***/ 7513:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CL: () => (/* binding */ InvalidRequestRpcError),
/* harmony export */   D5: () => (/* binding */ InvalidParamsRpcError),
/* harmony export */   Di: () => (/* binding */ InvalidInputRpcError),
/* harmony export */   Gi: () => (/* binding */ MethodNotFoundRpcError),
/* harmony export */   MI: () => (/* binding */ UnknownRpcError),
/* harmony export */   RV: () => (/* binding */ ProviderDisconnectedError),
/* harmony export */   Sf: () => (/* binding */ UnsupportedProviderMethodError),
/* harmony export */   XU: () => (/* binding */ ParseRpcError),
/* harmony export */   YW: () => (/* binding */ TransactionRejectedRpcError),
/* harmony export */   ab: () => (/* binding */ MethodNotSupportedRpcError),
/* harmony export */   bq: () => (/* binding */ InternalRpcError),
/* harmony export */   ch: () => (/* binding */ SwitchChainError),
/* harmony export */   hA: () => (/* binding */ ResourceNotFoundRpcError),
/* harmony export */   qZ: () => (/* binding */ ResourceUnavailableRpcError),
/* harmony export */   s0: () => (/* binding */ LimitExceededRpcError),
/* harmony export */   sV: () => (/* binding */ UnauthorizedProviderError),
/* harmony export */   vx: () => (/* binding */ UserRejectedRequestError),
/* harmony export */   xQ: () => (/* binding */ JsonRpcVersionUnsupportedError),
/* harmony export */   xq: () => (/* binding */ ChainDisconnectedError)
/* harmony export */ });
/* unused harmony exports RpcError, ProviderRpcError */
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6595);


const unknownErrorCode = -1;
class RpcError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(cause, { code, docsPath, metaMessages, shortMessage }) {
        super(shortMessage, {
            cause,
            docsPath,
            metaMessages: metaMessages || cause?.metaMessages,
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'RpcError'
        });
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = cause.name;
        this.code = (cause instanceof _request_js__WEBPACK_IMPORTED_MODULE_1__/* .RpcRequestError */ .J8 ? cause.code : code ?? unknownErrorCode);
    }
}
class ProviderRpcError extends RpcError {
    constructor(cause, options) {
        super(cause, options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ProviderRpcError'
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.data = options.data;
    }
}
class ParseRpcError extends RpcError {
    constructor(cause) {
        super(cause, {
            code: ParseRpcError.code,
            shortMessage: 'Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ParseRpcError'
        });
    }
}
Object.defineProperty(ParseRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32700
});
class InvalidRequestRpcError extends RpcError {
    constructor(cause) {
        super(cause, {
            code: InvalidRequestRpcError.code,
            shortMessage: 'JSON is not a valid request object.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidRequestRpcError'
        });
    }
}
Object.defineProperty(InvalidRequestRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32600
});
class MethodNotFoundRpcError extends RpcError {
    constructor(cause) {
        super(cause, {
            code: MethodNotFoundRpcError.code,
            shortMessage: 'The method does not exist / is not available.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'MethodNotFoundRpcError'
        });
    }
}
Object.defineProperty(MethodNotFoundRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32601
});
class InvalidParamsRpcError extends RpcError {
    constructor(cause) {
        super(cause, {
            code: InvalidParamsRpcError.code,
            shortMessage: [
                'Invalid parameters were provided to the RPC method.',
                'Double check you have provided the correct parameters.',
            ].join('\n'),
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidParamsRpcError'
        });
    }
}
Object.defineProperty(InvalidParamsRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32602
});
class InternalRpcError extends RpcError {
    constructor(cause) {
        super(cause, {
            code: InternalRpcError.code,
            shortMessage: 'An internal error was received.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InternalRpcError'
        });
    }
}
Object.defineProperty(InternalRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32603
});
class InvalidInputRpcError extends RpcError {
    constructor(cause) {
        super(cause, {
            code: InvalidInputRpcError.code,
            shortMessage: [
                'Missing or invalid parameters.',
                'Double check you have provided the correct parameters.',
            ].join('\n'),
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidInputRpcError'
        });
    }
}
Object.defineProperty(InvalidInputRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32000
});
class ResourceNotFoundRpcError extends RpcError {
    constructor(cause) {
        super(cause, {
            code: ResourceNotFoundRpcError.code,
            shortMessage: 'Requested resource not found.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ResourceNotFoundRpcError'
        });
    }
}
Object.defineProperty(ResourceNotFoundRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32001
});
class ResourceUnavailableRpcError extends RpcError {
    constructor(cause) {
        super(cause, {
            code: ResourceUnavailableRpcError.code,
            shortMessage: 'Requested resource not available.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ResourceUnavailableRpcError'
        });
    }
}
Object.defineProperty(ResourceUnavailableRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32002
});
class TransactionRejectedRpcError extends RpcError {
    constructor(cause) {
        super(cause, {
            code: TransactionRejectedRpcError.code,
            shortMessage: 'Transaction creation failed.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'TransactionRejectedRpcError'
        });
    }
}
Object.defineProperty(TransactionRejectedRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32003
});
class MethodNotSupportedRpcError extends RpcError {
    constructor(cause) {
        super(cause, {
            code: MethodNotSupportedRpcError.code,
            shortMessage: 'Method is not implemented.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'MethodNotSupportedRpcError'
        });
    }
}
Object.defineProperty(MethodNotSupportedRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32004
});
class LimitExceededRpcError extends RpcError {
    constructor(cause) {
        super(cause, {
            code: LimitExceededRpcError.code,
            shortMessage: 'Request exceeds defined limit.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'LimitExceededRpcError'
        });
    }
}
Object.defineProperty(LimitExceededRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32005
});
class JsonRpcVersionUnsupportedError extends RpcError {
    constructor(cause) {
        super(cause, {
            code: JsonRpcVersionUnsupportedError.code,
            shortMessage: 'Version of JSON-RPC protocol is not supported.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'JsonRpcVersionUnsupportedError'
        });
    }
}
Object.defineProperty(JsonRpcVersionUnsupportedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32006
});
class UserRejectedRequestError extends ProviderRpcError {
    constructor(cause) {
        super(cause, {
            code: UserRejectedRequestError.code,
            shortMessage: 'User rejected the request.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UserRejectedRequestError'
        });
    }
}
Object.defineProperty(UserRejectedRequestError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4001
});
class UnauthorizedProviderError extends ProviderRpcError {
    constructor(cause) {
        super(cause, {
            code: UnauthorizedProviderError.code,
            shortMessage: 'The requested method and/or account has not been authorized by the user.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnauthorizedProviderError'
        });
    }
}
Object.defineProperty(UnauthorizedProviderError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4100
});
class UnsupportedProviderMethodError extends ProviderRpcError {
    constructor(cause) {
        super(cause, {
            code: UnsupportedProviderMethodError.code,
            shortMessage: 'The Provider does not support the requested method.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnsupportedProviderMethodError'
        });
    }
}
Object.defineProperty(UnsupportedProviderMethodError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4200
});
class ProviderDisconnectedError extends ProviderRpcError {
    constructor(cause) {
        super(cause, {
            code: ProviderDisconnectedError.code,
            shortMessage: 'The Provider is disconnected from all chains.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ProviderDisconnectedError'
        });
    }
}
Object.defineProperty(ProviderDisconnectedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4900
});
class ChainDisconnectedError extends ProviderRpcError {
    constructor(cause) {
        super(cause, {
            code: ChainDisconnectedError.code,
            shortMessage: 'The Provider is not connected to the requested chain.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'ChainDisconnectedError'
        });
    }
}
Object.defineProperty(ChainDisconnectedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4901
});
class SwitchChainError extends ProviderRpcError {
    constructor(cause) {
        super(cause, {
            code: SwitchChainError.code,
            shortMessage: 'An error occurred when attempting to switch chain.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'SwitchChainError'
        });
    }
}
Object.defineProperty(SwitchChainError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4902
});
class UnknownRpcError extends RpcError {
    constructor(cause) {
        super(cause, {
            shortMessage: 'An unknown RPC error occurred.',
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'UnknownRpcError'
        });
    }
}
//# sourceMappingURL=rpc.js.map

/***/ }),

/***/ 6883:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Hi: () => (/* binding */ AccountStateConflictError),
/* harmony export */   ft: () => (/* binding */ StateAssignmentConflictError),
/* harmony export */   uj: () => (/* binding */ prettyStateOverride)
/* harmony export */ });
/* unused harmony export prettyStateMapping */
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);

class AccountStateConflictError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ address }) {
        super(`State for account "${address}" is set multiple times.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'AccountStateConflictError'
        });
    }
}
class StateAssignmentConflictError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor() {
        super('state and stateDiff are set on the same account.');
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'StateAssignmentConflictError'
        });
    }
}
function prettyStateMapping(stateMapping) {
    return stateMapping.reduce((pretty, { slot, value }) => {
        return `${pretty}        ${slot}: ${value}\n`;
    }, '');
}
function prettyStateOverride(stateOverride) {
    return stateOverride
        .reduce((pretty, { address, ...state }) => {
        let val = `${pretty}    ${address}:\n`;
        if (state.nonce)
            val += `      nonce: ${state.nonce}\n`;
        if (state.balance)
            val += `      balance: ${state.balance}\n`;
        if (state.code)
            val += `      code: ${state.code}\n`;
        if (state.state) {
            val += '      state:\n';
            val += prettyStateMapping(state.state);
        }
        if (state.stateDiff) {
            val += '      stateDiff:\n';
            val += prettyStateMapping(state.stateDiff);
        }
        return val;
    }, '  State Override:\n')
        .slice(0, -1);
}
//# sourceMappingURL=stateOverride.js.map

/***/ }),

/***/ 8990:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $s: () => (/* binding */ TransactionExecutionError),
/* harmony export */   Kc: () => (/* binding */ TransactionReceiptNotFoundError),
/* harmony export */   Kz: () => (/* binding */ TransactionNotFoundError),
/* harmony export */   Vg: () => (/* binding */ InvalidSerializableTransactionError),
/* harmony export */   WA: () => (/* binding */ WaitForTransactionReceiptTimeoutError),
/* harmony export */   aO: () => (/* binding */ prettyPrint),
/* harmony export */   n3: () => (/* binding */ FeeConflictError)
/* harmony export */ });
/* unused harmony exports InvalidLegacyVError, InvalidSerializedTransactionTypeError, InvalidSerializedTransactionError, InvalidStorageKeySizeError */
/* harmony import */ var _utils_unit_formatEther_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9436);
/* harmony import */ var _utils_unit_formatGwei_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9670);
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);



function prettyPrint(args) {
    const entries = Object.entries(args)
        .map(([key, value]) => {
        if (value === undefined || value === false)
            return null;
        return [key, value];
    })
        .filter(Boolean);
    const maxLength = entries.reduce((acc, [key]) => Math.max(acc, key.length), 0);
    return entries
        .map(([key, value]) => `  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`)
        .join('\n');
}
class FeeConflictError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor() {
        super([
            'Cannot specify both a `gasPrice` and a `maxFeePerGas`/`maxPriorityFeePerGas`.',
            'Use `maxFeePerGas`/`maxPriorityFeePerGas` for EIP-1559 compatible networks, and `gasPrice` for others.',
        ].join('\n'));
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'FeeConflictError'
        });
    }
}
class InvalidLegacyVError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ v }) {
        super(`Invalid \`v\` value "${v}". Expected 27 or 28.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidLegacyVError'
        });
    }
}
class InvalidSerializableTransactionError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ transaction }) {
        super('Cannot infer a transaction type from provided transaction.', {
            metaMessages: [
                'Provided Transaction:',
                '{',
                prettyPrint(transaction),
                '}',
                '',
                'To infer the type, either provide:',
                '- a `type` to the Transaction, or',
                '- an EIP-1559 Transaction with `maxFeePerGas`, or',
                '- an EIP-2930 Transaction with `gasPrice` & `accessList`, or',
                '- an EIP-4844 Transaction with `blobs`, `blobVersionedHashes`, `sidecars`, or',
                '- a Legacy Transaction with `gasPrice`',
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidSerializableTransactionError'
        });
    }
}
class InvalidSerializedTransactionTypeError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ serializedType }) {
        super(`Serialized transaction type "${serializedType}" is invalid.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidSerializedTransactionType'
        });
        Object.defineProperty(this, "serializedType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.serializedType = serializedType;
    }
}
class InvalidSerializedTransactionError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ attributes, serializedTransaction, type, }) {
        const missing = Object.entries(attributes)
            .map(([key, value]) => (typeof value === 'undefined' ? key : undefined))
            .filter(Boolean);
        super(`Invalid serialized transaction of type "${type}" was provided.`, {
            metaMessages: [
                `Serialized Transaction: "${serializedTransaction}"`,
                missing.length > 0 ? `Missing Attributes: ${missing.join(', ')}` : '',
            ].filter(Boolean),
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidSerializedTransactionError'
        });
        Object.defineProperty(this, "serializedTransaction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.serializedTransaction = serializedTransaction;
        this.type = type;
    }
}
class InvalidStorageKeySizeError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ storageKey }) {
        super(`Size for storage key "${storageKey}" is invalid. Expected 32 bytes. Got ${Math.floor((storageKey.length - 2) / 2)} bytes.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'InvalidStorageKeySizeError'
        });
    }
}
class TransactionExecutionError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor(cause, { account, docsPath, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, }) {
        const prettyArgs = prettyPrint({
            chain: chain && `${chain?.name} (id: ${chain?.id})`,
            from: account?.address,
            to,
            value: typeof value !== 'undefined' &&
                `${(0,_utils_unit_formatEther_js__WEBPACK_IMPORTED_MODULE_1__/* .formatEther */ .c)(value)} ${chain?.nativeCurrency?.symbol || 'ETH'}`,
            data,
            gas,
            gasPrice: typeof gasPrice !== 'undefined' && `${(0,_utils_unit_formatGwei_js__WEBPACK_IMPORTED_MODULE_2__/* .formatGwei */ .Q)(gasPrice)} gwei`,
            maxFeePerGas: typeof maxFeePerGas !== 'undefined' &&
                `${(0,_utils_unit_formatGwei_js__WEBPACK_IMPORTED_MODULE_2__/* .formatGwei */ .Q)(maxFeePerGas)} gwei`,
            maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== 'undefined' &&
                `${(0,_utils_unit_formatGwei_js__WEBPACK_IMPORTED_MODULE_2__/* .formatGwei */ .Q)(maxPriorityFeePerGas)} gwei`,
            nonce,
        });
        super(cause.shortMessage, {
            cause,
            docsPath,
            metaMessages: [
                ...(cause.metaMessages ? [...cause.metaMessages, ' '] : []),
                'Request Arguments:',
                prettyArgs,
            ].filter(Boolean),
        });
        Object.defineProperty(this, "cause", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'TransactionExecutionError'
        });
        this.cause = cause;
    }
}
class TransactionNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ blockHash, blockNumber, blockTag, hash, index, }) {
        let identifier = 'Transaction';
        if (blockTag && index !== undefined)
            identifier = `Transaction at block time "${blockTag}" at index "${index}"`;
        if (blockHash && index !== undefined)
            identifier = `Transaction at block hash "${blockHash}" at index "${index}"`;
        if (blockNumber && index !== undefined)
            identifier = `Transaction at block number "${blockNumber}" at index "${index}"`;
        if (hash)
            identifier = `Transaction with hash "${hash}"`;
        super(`${identifier} could not be found.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'TransactionNotFoundError'
        });
    }
}
class TransactionReceiptNotFoundError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ hash }) {
        super(`Transaction receipt with hash "${hash}" could not be found. The Transaction may not be processed on a block yet.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'TransactionReceiptNotFoundError'
        });
    }
}
class WaitForTransactionReceiptTimeoutError extends _base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C {
    constructor({ hash }) {
        super(`Timed out while waiting for transaction with hash "${hash}" to be confirmed.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'WaitForTransactionReceiptTimeoutError'
        });
    }
}
//# sourceMappingURL=transaction.js.map

/***/ }),

/***/ 1526:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  RZ: () => (/* binding */ getContractAddress),
  ID: () => (/* binding */ getUrl),
  HF: () => (/* binding */ getVersion)
});

;// CONCATENATED MODULE: ./node_modules/viem/_esm/errors/version.js
const version = '2.9.15';
//# sourceMappingURL=version.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/errors/utils.js

const getContractAddress = (address) => address;
const getUrl = (url) => url;
const getVersion = () => `viem@${version}`;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 1965:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  n: () => (/* binding */ decodeAbiParameters)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/abi.js
var abi = __webpack_require__(7372);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/address/getAddress.js
var getAddress = __webpack_require__(4569);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/cursor.js
var utils_cursor = __webpack_require__(5834);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/size.js
var size = __webpack_require__(5182);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/slice.js
var slice = __webpack_require__(3577);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/trim.js
var trim = __webpack_require__(8583);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/encoding.js
var encoding = __webpack_require__(4317);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/fromHex.js
var fromHex = __webpack_require__(6675);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toHex.js
var toHex = __webpack_require__(4192);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/encoding/fromBytes.js




/**
 * Decodes a byte array into a UTF-8 string, hex value, number, bigint or boolean.
 *
 * - Docs: https://viem.sh/docs/utilities/fromBytes
 * - Example: https://viem.sh/docs/utilities/fromBytes#usage
 *
 * @param bytes Byte array to decode.
 * @param toOrOpts Type to convert to or options.
 * @returns Decoded value.
 *
 * @example
 * import { fromBytes } from 'viem'
 * const data = fromBytes(new Uint8Array([1, 164]), 'number')
 * // 420
 *
 * @example
 * import { fromBytes } from 'viem'
 * const data = fromBytes(
 *   new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
 *   'string'
 * )
 * // 'Hello world'
 */
function fromBytes(bytes, toOrOpts) {
    const opts = typeof toOrOpts === 'string' ? { to: toOrOpts } : toOrOpts;
    const to = opts.to;
    if (to === 'number')
        return bytesToNumber(bytes, opts);
    if (to === 'bigint')
        return bytesToBigInt(bytes, opts);
    if (to === 'boolean')
        return bytesToBool(bytes, opts);
    if (to === 'string')
        return bytesToString(bytes, opts);
    return bytesToHex(bytes, opts);
}
/**
 * Decodes a byte array into a bigint.
 *
 * - Docs: https://viem.sh/docs/utilities/fromBytes#bytestobigint
 *
 * @param bytes Byte array to decode.
 * @param opts Options.
 * @returns BigInt value.
 *
 * @example
 * import { bytesToBigInt } from 'viem'
 * const data = bytesToBigInt(new Uint8Array([1, 164]))
 * // 420n
 */
function bytesToBigInt(bytes, opts = {}) {
    if (typeof opts.size !== 'undefined')
        (0,fromHex/* assertSize */.Sl)(bytes, { size: opts.size });
    const hex = (0,toHex/* bytesToHex */.My)(bytes, opts);
    return (0,fromHex/* hexToBigInt */.uU)(hex, opts);
}
/**
 * Decodes a byte array into a boolean.
 *
 * - Docs: https://viem.sh/docs/utilities/fromBytes#bytestobool
 *
 * @param bytes Byte array to decode.
 * @param opts Options.
 * @returns Boolean value.
 *
 * @example
 * import { bytesToBool } from 'viem'
 * const data = bytesToBool(new Uint8Array([1]))
 * // true
 */
function bytesToBool(bytes_, opts = {}) {
    let bytes = bytes_;
    if (typeof opts.size !== 'undefined') {
        (0,fromHex/* assertSize */.Sl)(bytes, { size: opts.size });
        bytes = (0,trim/* trim */.B)(bytes);
    }
    if (bytes.length > 1 || bytes[0] > 1)
        throw new encoding/* InvalidBytesBooleanError */.xO(bytes);
    return Boolean(bytes[0]);
}
/**
 * Decodes a byte array into a number.
 *
 * - Docs: https://viem.sh/docs/utilities/fromBytes#bytestonumber
 *
 * @param bytes Byte array to decode.
 * @param opts Options.
 * @returns Number value.
 *
 * @example
 * import { bytesToNumber } from 'viem'
 * const data = bytesToNumber(new Uint8Array([1, 164]))
 * // 420
 */
function bytesToNumber(bytes, opts = {}) {
    if (typeof opts.size !== 'undefined')
        (0,fromHex/* assertSize */.Sl)(bytes, { size: opts.size });
    const hex = (0,toHex/* bytesToHex */.My)(bytes, opts);
    return (0,fromHex/* hexToNumber */.ME)(hex, opts);
}
/**
 * Decodes a byte array into a UTF-8 string.
 *
 * - Docs: https://viem.sh/docs/utilities/fromBytes#bytestostring
 *
 * @param bytes Byte array to decode.
 * @param opts Options.
 * @returns String value.
 *
 * @example
 * import { bytesToString } from 'viem'
 * const data = bytesToString(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]))
 * // 'Hello world'
 */
function bytesToString(bytes_, opts = {}) {
    let bytes = bytes_;
    if (typeof opts.size !== 'undefined') {
        (0,fromHex/* assertSize */.Sl)(bytes, { size: opts.size });
        bytes = (0,trim/* trim */.B)(bytes, { dir: 'right' });
    }
    return new TextDecoder().decode(bytes);
}
//# sourceMappingURL=fromBytes.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toBytes.js
var toBytes = __webpack_require__(4706);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/encodeAbiParameters.js
var encodeAbiParameters = __webpack_require__(4531);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/abi/decodeAbiParameters.js










function decodeAbiParameters(params, data) {
    const bytes = typeof data === 'string' ? (0,toBytes/* hexToBytes */.aT)(data) : data;
    const cursor = (0,utils_cursor/* createCursor */.l)(bytes);
    if ((0,size/* size */.E)(bytes) === 0 && params.length > 0)
        throw new abi/* AbiDecodingZeroDataError */.O();
    if ((0,size/* size */.E)(data) && (0,size/* size */.E)(data) < 32)
        throw new abi/* AbiDecodingDataSizeTooSmallError */.Iy({
            data: typeof data === 'string' ? data : (0,toHex/* bytesToHex */.My)(data),
            params: params,
            size: (0,size/* size */.E)(data),
        });
    let consumed = 0;
    const values = [];
    for (let i = 0; i < params.length; ++i) {
        const param = params[i];
        cursor.setPosition(consumed);
        const [data, consumed_] = decodeParameter(cursor, param, {
            staticPosition: 0,
        });
        consumed += consumed_;
        values.push(data);
    }
    return values;
}
function decodeParameter(cursor, param, { staticPosition }) {
    const arrayComponents = (0,encodeAbiParameters/* getArrayComponents */.k)(param.type);
    if (arrayComponents) {
        const [length, type] = arrayComponents;
        return decodeArray(cursor, { ...param, type }, { length, staticPosition });
    }
    if (param.type === 'tuple')
        return decodeTuple(cursor, param, { staticPosition });
    if (param.type === 'address')
        return decodeAddress(cursor);
    if (param.type === 'bool')
        return decodeBool(cursor);
    if (param.type.startsWith('bytes'))
        return decodeBytes(cursor, param, { staticPosition });
    if (param.type.startsWith('uint') || param.type.startsWith('int'))
        return decodeNumber(cursor, param);
    if (param.type === 'string')
        return decodeString(cursor, { staticPosition });
    throw new abi/* InvalidAbiDecodingTypeError */.j(param.type, {
        docsPath: '/docs/contract/decodeAbiParameters',
    });
}
////////////////////////////////////////////////////////////////////
// Type Decoders
const sizeOfLength = 32;
const sizeOfOffset = 32;
function decodeAddress(cursor) {
    const value = cursor.readBytes(32);
    return [(0,getAddress/* checksumAddress */.o)((0,toHex/* bytesToHex */.My)((0,slice/* sliceBytes */.A1)(value, -20))), 32];
}
function decodeArray(cursor, param, { length, staticPosition }) {
    // If the length of the array is not known in advance (dynamic array),
    // this means we will need to wonder off to the pointer and decode.
    if (!length) {
        // Dealing with a dynamic type, so get the offset of the array data.
        const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
        // Start is the static position of current slot + offset.
        const start = staticPosition + offset;
        const startOfData = start + sizeOfLength;
        // Get the length of the array from the offset.
        cursor.setPosition(start);
        const length = bytesToNumber(cursor.readBytes(sizeOfLength));
        // Check if the array has any dynamic children.
        const dynamicChild = hasDynamicChild(param);
        let consumed = 0;
        const value = [];
        for (let i = 0; i < length; ++i) {
            // If any of the children is dynamic, then all elements will be offset pointer, thus size of one slot (32 bytes).
            // Otherwise, elements will be the size of their encoding (consumed bytes).
            cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed));
            const [data, consumed_] = decodeParameter(cursor, param, {
                staticPosition: startOfData,
            });
            consumed += consumed_;
            value.push(data);
        }
        // As we have gone wondering, restore to the original position + next slot.
        cursor.setPosition(staticPosition + 32);
        return [value, 32];
    }
    // If the length of the array is known in advance,
    // and the length of an element deeply nested in the array is not known,
    // we need to decode the offset of the array data.
    if (hasDynamicChild(param)) {
        // Dealing with dynamic types, so get the offset of the array data.
        const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
        // Start is the static position of current slot + offset.
        const start = staticPosition + offset;
        const value = [];
        for (let i = 0; i < length; ++i) {
            // Move cursor along to the next slot (next offset pointer).
            cursor.setPosition(start + i * 32);
            const [data] = decodeParameter(cursor, param, {
                staticPosition: start,
            });
            value.push(data);
        }
        // As we have gone wondering, restore to the original position + next slot.
        cursor.setPosition(staticPosition + 32);
        return [value, 32];
    }
    // If the length of the array is known in advance and the array is deeply static,
    // then we can just decode each element in sequence.
    let consumed = 0;
    const value = [];
    for (let i = 0; i < length; ++i) {
        const [data, consumed_] = decodeParameter(cursor, param, {
            staticPosition: staticPosition + consumed,
        });
        consumed += consumed_;
        value.push(data);
    }
    return [value, consumed];
}
function decodeBool(cursor) {
    return [bytesToBool(cursor.readBytes(32), { size: 32 }), 32];
}
function decodeBytes(cursor, param, { staticPosition }) {
    const [_, size] = param.type.split('bytes');
    if (!size) {
        // Dealing with dynamic types, so get the offset of the bytes data.
        const offset = bytesToNumber(cursor.readBytes(32));
        // Set position of the cursor to start of bytes data.
        cursor.setPosition(staticPosition + offset);
        const length = bytesToNumber(cursor.readBytes(32));
        // If there is no length, we have zero data.
        if (length === 0) {
            // As we have gone wondering, restore to the original position + next slot.
            cursor.setPosition(staticPosition + 32);
            return ['0x', 32];
        }
        const data = cursor.readBytes(length);
        // As we have gone wondering, restore to the original position + next slot.
        cursor.setPosition(staticPosition + 32);
        return [(0,toHex/* bytesToHex */.My)(data), 32];
    }
    const value = (0,toHex/* bytesToHex */.My)(cursor.readBytes(parseInt(size), 32));
    return [value, 32];
}
function decodeNumber(cursor, param) {
    const signed = param.type.startsWith('int');
    const size = parseInt(param.type.split('int')[1] || '256');
    const value = cursor.readBytes(32);
    return [
        size > 48
            ? bytesToBigInt(value, { signed })
            : bytesToNumber(value, { signed }),
        32,
    ];
}
function decodeTuple(cursor, param, { staticPosition }) {
    // Tuples can have unnamed components (i.e. they are arrays), so we must
    // determine whether the tuple is named or unnamed. In the case of a named
    // tuple, the value will be an object where each property is the name of the
    // component. In the case of an unnamed tuple, the value will be an array.
    const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
    // Initialize the value to an object or an array, depending on whether the
    // tuple is named or unnamed.
    const value = hasUnnamedChild ? [] : {};
    let consumed = 0;
    // If the tuple has a dynamic child, we must first decode the offset to the
    // tuple data.
    if (hasDynamicChild(param)) {
        // Dealing with dynamic types, so get the offset of the tuple data.
        const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
        // Start is the static position of referencing slot + offset.
        const start = staticPosition + offset;
        for (let i = 0; i < param.components.length; ++i) {
            const component = param.components[i];
            cursor.setPosition(start + consumed);
            const [data, consumed_] = decodeParameter(cursor, component, {
                staticPosition: start,
            });
            consumed += consumed_;
            value[hasUnnamedChild ? i : component?.name] = data;
        }
        // As we have gone wondering, restore to the original position + next slot.
        cursor.setPosition(staticPosition + 32);
        return [value, 32];
    }
    // If the tuple has static children, we can just decode each component
    // in sequence.
    for (let i = 0; i < param.components.length; ++i) {
        const component = param.components[i];
        const [data, consumed_] = decodeParameter(cursor, component, {
            staticPosition,
        });
        value[hasUnnamedChild ? i : component?.name] = data;
        consumed += consumed_;
    }
    return [value, consumed];
}
function decodeString(cursor, { staticPosition }) {
    // Get offset to start of string data.
    const offset = bytesToNumber(cursor.readBytes(32));
    // Start is the static position of current slot + offset.
    const start = staticPosition + offset;
    cursor.setPosition(start);
    const length = bytesToNumber(cursor.readBytes(32));
    // If there is no length, we have zero data (empty string).
    if (length === 0) {
        cursor.setPosition(staticPosition + 32);
        return ['', 32];
    }
    const data = cursor.readBytes(length, 32);
    const value = bytesToString((0,trim/* trim */.B)(data));
    // As we have gone wondering, restore to the original position + next slot.
    cursor.setPosition(staticPosition + 32);
    return [value, 32];
}
function hasDynamicChild(param) {
    const { type } = param;
    if (type === 'string')
        return true;
    if (type === 'bytes')
        return true;
    if (type.endsWith('[]'))
        return true;
    if (type === 'tuple')
        return param.components?.some(hasDynamicChild);
    const arrayComponents = (0,encodeAbiParameters/* getArrayComponents */.k)(param.type);
    if (arrayComponents &&
        hasDynamicChild({ ...param, type: arrayComponents[1] }))
        return true;
    return false;
}
//# sourceMappingURL=decodeAbiParameters.js.map

/***/ }),

/***/ 5462:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   W: () => (/* binding */ decodeErrorResult)
/* harmony export */ });
/* harmony import */ var _constants_solidity_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4453);
/* harmony import */ var _errors_abi_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7372);
/* harmony import */ var _data_slice_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3577);
/* harmony import */ var _hash_toFunctionSelector_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2599);
/* harmony import */ var _decodeAbiParameters_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1965);
/* harmony import */ var _formatAbiItem_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(5167);






function decodeErrorResult(parameters) {
    const { abi, data } = parameters;
    const signature = (0,_data_slice_js__WEBPACK_IMPORTED_MODULE_0__/* .slice */ .di)(data, 0, 4);
    if (signature === '0x')
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_1__/* .AbiDecodingZeroDataError */ .O();
    const abi_ = [...(abi || []), _constants_solidity_js__WEBPACK_IMPORTED_MODULE_2__/* .solidityError */ .Mc, _constants_solidity_js__WEBPACK_IMPORTED_MODULE_2__/* .solidityPanic */ .J9];
    const abiItem = abi_.find((x) => x.type === 'error' && signature === (0,_hash_toFunctionSelector_js__WEBPACK_IMPORTED_MODULE_3__/* .toFunctionSelector */ .V)((0,_formatAbiItem_js__WEBPACK_IMPORTED_MODULE_4__/* .formatAbiItem */ .B)(x)));
    if (!abiItem)
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_1__/* .AbiErrorSignatureNotFoundError */ .Wq(signature, {
            docsPath: '/docs/contract/decodeErrorResult',
        });
    return {
        abiItem,
        args: 'inputs' in abiItem && abiItem.inputs && abiItem.inputs.length > 0
            ? (0,_decodeAbiParameters_js__WEBPACK_IMPORTED_MODULE_5__/* .decodeAbiParameters */ .n)(abiItem.inputs, (0,_data_slice_js__WEBPACK_IMPORTED_MODULE_0__/* .slice */ .di)(data, 4))
            : undefined,
        errorName: abiItem.name,
    };
}
//# sourceMappingURL=decodeErrorResult.js.map

/***/ }),

/***/ 9483:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   j: () => (/* binding */ decodeEventLog)
/* harmony export */ });
/* harmony import */ var _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7372);
/* harmony import */ var _data_size_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(5182);
/* harmony import */ var _hash_toEventSelector_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9777);
/* harmony import */ var _errors_cursor_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8146);
/* harmony import */ var _decodeAbiParameters_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1965);
/* harmony import */ var _formatAbiItem_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5167);






const docsPath = '/docs/contract/decodeEventLog';
function decodeEventLog(parameters) {
    const { abi, data, strict: strict_, topics, } = parameters;
    const strict = strict_ ?? true;
    const [signature, ...argTopics] = topics;
    if (!signature)
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .AbiEventSignatureEmptyTopicsError */ ._z({ docsPath });
    const abiItem = abi.find((x) => x.type === 'event' &&
        signature === (0,_hash_toEventSelector_js__WEBPACK_IMPORTED_MODULE_1__/* .toEventSelector */ .h)((0,_formatAbiItem_js__WEBPACK_IMPORTED_MODULE_2__/* .formatAbiItem */ .B)(x)));
    if (!(abiItem && 'name' in abiItem) || abiItem.type !== 'event')
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .AbiEventSignatureNotFoundError */ .kE(signature, { docsPath });
    const { name, inputs } = abiItem;
    const isUnnamed = inputs?.some((x) => !('name' in x && x.name));
    let args = isUnnamed ? [] : {};
    // Decode topics (indexed args).
    const indexedInputs = inputs.filter((x) => 'indexed' in x && x.indexed);
    for (let i = 0; i < indexedInputs.length; i++) {
        const param = indexedInputs[i];
        const topic = argTopics[i];
        if (!topic)
            throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .DecodeLogTopicsMismatch */ .l3({
                abiItem,
                param: param,
            });
        args[isUnnamed ? i : param.name || i] = decodeTopic({ param, value: topic });
    }
    // Decode data (non-indexed args).
    const nonIndexedInputs = inputs.filter((x) => !('indexed' in x && x.indexed));
    if (nonIndexedInputs.length > 0) {
        if (data && data !== '0x') {
            try {
                const decodedData = (0,_decodeAbiParameters_js__WEBPACK_IMPORTED_MODULE_3__/* .decodeAbiParameters */ .n)(nonIndexedInputs, data);
                if (decodedData) {
                    if (isUnnamed)
                        args = [...args, ...decodedData];
                    else {
                        for (let i = 0; i < nonIndexedInputs.length; i++) {
                            args[nonIndexedInputs[i].name] = decodedData[i];
                        }
                    }
                }
            }
            catch (err) {
                if (strict) {
                    if (err instanceof _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .AbiDecodingDataSizeTooSmallError */ .Iy ||
                        err instanceof _errors_cursor_js__WEBPACK_IMPORTED_MODULE_4__/* .PositionOutOfBoundsError */ .SK)
                        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .DecodeLogDataMismatch */ .fo({
                            abiItem,
                            data: data,
                            params: nonIndexedInputs,
                            size: (0,_data_size_js__WEBPACK_IMPORTED_MODULE_5__/* .size */ .E)(data),
                        });
                    throw err;
                }
            }
        }
        else if (strict) {
            throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .DecodeLogDataMismatch */ .fo({
                abiItem,
                data: '0x',
                params: nonIndexedInputs,
                size: 0,
            });
        }
    }
    return {
        eventName: name,
        args: Object.values(args).length > 0 ? args : undefined,
    };
}
function decodeTopic({ param, value }) {
    if (param.type === 'string' ||
        param.type === 'bytes' ||
        param.type === 'tuple' ||
        param.type.match(/^(.*)\[(\d+)?\]$/))
        return value;
    const decodedArg = (0,_decodeAbiParameters_js__WEBPACK_IMPORTED_MODULE_3__/* .decodeAbiParameters */ .n)([param], value) || [];
    return decodedArg[0];
}
//# sourceMappingURL=decodeEventLog.js.map

/***/ }),

/***/ 6652:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   e: () => (/* binding */ decodeFunctionResult)
/* harmony export */ });
/* harmony import */ var _errors_abi_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7372);
/* harmony import */ var _decodeAbiParameters_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1965);
/* harmony import */ var _getAbiItem_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4586);



const docsPath = '/docs/contract/decodeFunctionResult';
function decodeFunctionResult(parameters) {
    const { abi, args, functionName, data } = parameters;
    let abiItem = abi[0];
    if (functionName) {
        const item = (0,_getAbiItem_js__WEBPACK_IMPORTED_MODULE_0__/* .getAbiItem */ .iY)({ abi, args, name: functionName });
        if (!item)
            throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_1__/* .AbiFunctionNotFoundError */ .Iz(functionName, { docsPath });
        abiItem = item;
    }
    if (abiItem.type !== 'function')
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_1__/* .AbiFunctionNotFoundError */ .Iz(undefined, { docsPath });
    if (!abiItem.outputs)
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_1__/* .AbiFunctionOutputsNotFoundError */ .MR(abiItem.name, { docsPath });
    const values = (0,_decodeAbiParameters_js__WEBPACK_IMPORTED_MODULE_2__/* .decodeAbiParameters */ .n)(abiItem.outputs, data);
    if (values && values.length > 1)
        return values;
    if (values && values.length === 1)
        return values[0];
    return undefined;
}
//# sourceMappingURL=decodeFunctionResult.js.map

/***/ }),

/***/ 4531:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   h: () => (/* binding */ encodeAbiParameters),
/* harmony export */   k: () => (/* binding */ getArrayComponents)
/* harmony export */ });
/* harmony import */ var _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7372);
/* harmony import */ var _errors_address_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(4306);
/* harmony import */ var _errors_base_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(6329);
/* harmony import */ var _address_isAddress_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1657);
/* harmony import */ var _data_concat_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5419);
/* harmony import */ var _data_pad_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(586);
/* harmony import */ var _data_size_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5182);
/* harmony import */ var _data_slice_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(3577);
/* harmony import */ var _encoding_toHex_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4192);









/**
 * @description Encodes a list of primitive values into an ABI-encoded hex value.
 *
 * - Docs: https://viem.sh/docs/abi/encodeAbiParameters#encodeabiparameters
 *
 *   Generates ABI encoded data using the [ABI specification](https://docs.soliditylang.org/en/latest/abi-spec), given a set of ABI parameters (inputs/outputs) and their corresponding values.
 *
 * @param params - a set of ABI Parameters (params), that can be in the shape of the inputs or outputs attribute of an ABI Item.
 * @param values - a set of values (values) that correspond to the given params.
 * @example
 * ```typescript
 * import { encodeAbiParameters } from 'viem'
 *
 * const encodedData = encodeAbiParameters(
 *   [
 *     { name: 'x', type: 'string' },
 *     { name: 'y', type: 'uint' },
 *     { name: 'z', type: 'bool' }
 *   ],
 *   ['wagmi', 420n, true]
 * )
 * ```
 *
 * You can also pass in Human Readable parameters with the parseAbiParameters utility.
 *
 * @example
 * ```typescript
 * import { encodeAbiParameters, parseAbiParameters } from 'viem'
 *
 * const encodedData = encodeAbiParameters(
 *   parseAbiParameters('string x, uint y, bool z'),
 *   ['wagmi', 420n, true]
 * )
 * ```
 */
function encodeAbiParameters(params, values) {
    if (params.length !== values.length)
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .AbiEncodingLengthMismatchError */ .YE({
            expectedLength: params.length,
            givenLength: values.length,
        });
    // Prepare the parameters to determine dynamic types to encode.
    const preparedParams = prepareParams({
        params: params,
        values: values,
    });
    const data = encodeParams(preparedParams);
    if (data.length === 0)
        return '0x';
    return data;
}
function prepareParams({ params, values, }) {
    const preparedParams = [];
    for (let i = 0; i < params.length; i++) {
        preparedParams.push(prepareParam({ param: params[i], value: values[i] }));
    }
    return preparedParams;
}
function prepareParam({ param, value, }) {
    const arrayComponents = getArrayComponents(param.type);
    if (arrayComponents) {
        const [length, type] = arrayComponents;
        return encodeArray(value, { length, param: { ...param, type } });
    }
    if (param.type === 'tuple') {
        return encodeTuple(value, {
            param: param,
        });
    }
    if (param.type === 'address') {
        return encodeAddress(value);
    }
    if (param.type === 'bool') {
        return encodeBool(value);
    }
    if (param.type.startsWith('uint') || param.type.startsWith('int')) {
        const signed = param.type.startsWith('int');
        return encodeNumber(value, { signed });
    }
    if (param.type.startsWith('bytes')) {
        return encodeBytes(value, { param });
    }
    if (param.type === 'string') {
        return encodeString(value);
    }
    throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .InvalidAbiEncodingTypeError */ .nK(param.type, {
        docsPath: '/docs/contract/encodeAbiParameters',
    });
}
function encodeParams(preparedParams) {
    // 1. Compute the size of the static part of the parameters.
    let staticSize = 0;
    for (let i = 0; i < preparedParams.length; i++) {
        const { dynamic, encoded } = preparedParams[i];
        if (dynamic)
            staticSize += 32;
        else
            staticSize += (0,_data_size_js__WEBPACK_IMPORTED_MODULE_1__/* .size */ .E)(encoded);
    }
    // 2. Split the parameters into static and dynamic parts.
    const staticParams = [];
    const dynamicParams = [];
    let dynamicSize = 0;
    for (let i = 0; i < preparedParams.length; i++) {
        const { dynamic, encoded } = preparedParams[i];
        if (dynamic) {
            staticParams.push((0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_2__/* .numberToHex */ .cK)(staticSize + dynamicSize, { size: 32 }));
            dynamicParams.push(encoded);
            dynamicSize += (0,_data_size_js__WEBPACK_IMPORTED_MODULE_1__/* .size */ .E)(encoded);
        }
        else {
            staticParams.push(encoded);
        }
    }
    // 3. Concatenate static and dynamic parts.
    return (0,_data_concat_js__WEBPACK_IMPORTED_MODULE_3__/* .concat */ .xW)([...staticParams, ...dynamicParams]);
}
function encodeAddress(value) {
    if (!(0,_address_isAddress_js__WEBPACK_IMPORTED_MODULE_4__/* .isAddress */ .P)(value))
        throw new _errors_address_js__WEBPACK_IMPORTED_MODULE_5__/* .InvalidAddressError */ .M({ address: value });
    return { dynamic: false, encoded: (0,_data_pad_js__WEBPACK_IMPORTED_MODULE_6__/* .padHex */ .db)(value.toLowerCase()) };
}
function encodeArray(value, { length, param, }) {
    const dynamic = length === null;
    if (!Array.isArray(value))
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .InvalidArrayError */ .dm(value);
    if (!dynamic && value.length !== length)
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .AbiEncodingArrayLengthMismatchError */ .Nc({
            expectedLength: length,
            givenLength: value.length,
            type: `${param.type}[${length}]`,
        });
    let dynamicChild = false;
    const preparedParams = [];
    for (let i = 0; i < value.length; i++) {
        const preparedParam = prepareParam({ param, value: value[i] });
        if (preparedParam.dynamic)
            dynamicChild = true;
        preparedParams.push(preparedParam);
    }
    if (dynamic || dynamicChild) {
        const data = encodeParams(preparedParams);
        if (dynamic) {
            const length = (0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_2__/* .numberToHex */ .cK)(preparedParams.length, { size: 32 });
            return {
                dynamic: true,
                encoded: preparedParams.length > 0 ? (0,_data_concat_js__WEBPACK_IMPORTED_MODULE_3__/* .concat */ .xW)([length, data]) : length,
            };
        }
        if (dynamicChild)
            return { dynamic: true, encoded: data };
    }
    return {
        dynamic: false,
        encoded: (0,_data_concat_js__WEBPACK_IMPORTED_MODULE_3__/* .concat */ .xW)(preparedParams.map(({ encoded }) => encoded)),
    };
}
function encodeBytes(value, { param }) {
    const [, paramSize] = param.type.split('bytes');
    const bytesSize = (0,_data_size_js__WEBPACK_IMPORTED_MODULE_1__/* .size */ .E)(value);
    if (!paramSize) {
        let value_ = value;
        // If the size is not divisible by 32 bytes, pad the end
        // with empty bytes to the ceiling 32 bytes.
        if (bytesSize % 32 !== 0)
            value_ = (0,_data_pad_js__WEBPACK_IMPORTED_MODULE_6__/* .padHex */ .db)(value_, {
                dir: 'right',
                size: Math.ceil((value.length - 2) / 2 / 32) * 32,
            });
        return {
            dynamic: true,
            encoded: (0,_data_concat_js__WEBPACK_IMPORTED_MODULE_3__/* .concat */ .xW)([(0,_data_pad_js__WEBPACK_IMPORTED_MODULE_6__/* .padHex */ .db)((0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_2__/* .numberToHex */ .cK)(bytesSize, { size: 32 })), value_]),
        };
    }
    if (bytesSize !== parseInt(paramSize))
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .AbiEncodingBytesSizeMismatchError */ .gH({
            expectedSize: parseInt(paramSize),
            value,
        });
    return { dynamic: false, encoded: (0,_data_pad_js__WEBPACK_IMPORTED_MODULE_6__/* .padHex */ .db)(value, { dir: 'right' }) };
}
function encodeBool(value) {
    if (typeof value !== 'boolean')
        throw new _errors_base_js__WEBPACK_IMPORTED_MODULE_7__/* .BaseError */ .C(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
    return { dynamic: false, encoded: (0,_data_pad_js__WEBPACK_IMPORTED_MODULE_6__/* .padHex */ .db)((0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_2__/* .boolToHex */ .$P)(value)) };
}
function encodeNumber(value, { signed }) {
    return {
        dynamic: false,
        encoded: (0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_2__/* .numberToHex */ .cK)(value, {
            size: 32,
            signed,
        }),
    };
}
function encodeString(value) {
    const hexValue = (0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_2__/* .stringToHex */ .i3)(value);
    const partsLength = Math.ceil((0,_data_size_js__WEBPACK_IMPORTED_MODULE_1__/* .size */ .E)(hexValue) / 32);
    const parts = [];
    for (let i = 0; i < partsLength; i++) {
        parts.push((0,_data_pad_js__WEBPACK_IMPORTED_MODULE_6__/* .padHex */ .db)((0,_data_slice_js__WEBPACK_IMPORTED_MODULE_8__/* .slice */ .di)(hexValue, i * 32, (i + 1) * 32), {
            dir: 'right',
        }));
    }
    return {
        dynamic: true,
        encoded: (0,_data_concat_js__WEBPACK_IMPORTED_MODULE_3__/* .concat */ .xW)([
            (0,_data_pad_js__WEBPACK_IMPORTED_MODULE_6__/* .padHex */ .db)((0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_2__/* .numberToHex */ .cK)((0,_data_size_js__WEBPACK_IMPORTED_MODULE_1__/* .size */ .E)(hexValue), { size: 32 })),
            ...parts,
        ]),
    };
}
function encodeTuple(value, { param }) {
    let dynamic = false;
    const preparedParams = [];
    for (let i = 0; i < param.components.length; i++) {
        const param_ = param.components[i];
        const index = Array.isArray(value) ? i : param_.name;
        const preparedParam = prepareParam({
            param: param_,
            value: value[index],
        });
        preparedParams.push(preparedParam);
        if (preparedParam.dynamic)
            dynamic = true;
    }
    return {
        dynamic,
        encoded: dynamic
            ? encodeParams(preparedParams)
            : (0,_data_concat_js__WEBPACK_IMPORTED_MODULE_3__/* .concat */ .xW)(preparedParams.map(({ encoded }) => encoded)),
    };
}
function getArrayComponents(type) {
    const matches = type.match(/^(.*)\[(\d+)?\]$/);
    return matches
        ? // Return `null` if the array is dynamic.
            [matches[2] ? Number(matches[2]) : null, matches[1]]
        : undefined;
}
//# sourceMappingURL=encodeAbiParameters.js.map

/***/ }),

/***/ 5842:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   m: () => (/* binding */ encodeDeployData)
/* harmony export */ });
/* harmony import */ var _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7372);
/* harmony import */ var _data_concat_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5419);
/* harmony import */ var _encodeAbiParameters_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4531);



const docsPath = '/docs/contract/encodeDeployData';
function encodeDeployData(parameters) {
    const { abi, args, bytecode } = parameters;
    if (!args || args.length === 0)
        return bytecode;
    const description = abi.find((x) => 'type' in x && x.type === 'constructor');
    if (!description)
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .AbiConstructorNotFoundError */ .YW({ docsPath });
    if (!('inputs' in description))
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .AbiConstructorParamsNotFoundError */ .YF({ docsPath });
    if (!description.inputs || description.inputs.length === 0)
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .AbiConstructorParamsNotFoundError */ .YF({ docsPath });
    const data = (0,_encodeAbiParameters_js__WEBPACK_IMPORTED_MODULE_1__/* .encodeAbiParameters */ .h)(description.inputs, args);
    return (0,_data_concat_js__WEBPACK_IMPORTED_MODULE_2__/* .concatHex */ .aP)([bytecode, data]);
}
//# sourceMappingURL=encodeDeployData.js.map

/***/ }),

/***/ 5226:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  R: () => (/* binding */ encodeEventTopics)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/abi.js
var errors_abi = __webpack_require__(7372);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/base.js
var base = __webpack_require__(6329);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/errors/log.js

class FilterTypeNotSupportedError extends base/* BaseError */.C {
    constructor(type) {
        super(`Filter type "${type}" is not supported.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'FilterTypeNotSupportedError'
        });
    }
}
//# sourceMappingURL=log.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toBytes.js
var toBytes = __webpack_require__(4706);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/hash/keccak256.js + 2 modules
var keccak256 = __webpack_require__(8729);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/hash/toEventSelector.js
var toEventSelector = __webpack_require__(9777);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/encodeAbiParameters.js
var encodeAbiParameters = __webpack_require__(4531);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/formatAbiItem.js
var formatAbiItem = __webpack_require__(5167);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/getAbiItem.js
var getAbiItem = __webpack_require__(4586);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/abi/encodeEventTopics.js








const docsPath = '/docs/contract/encodeEventTopics';
function encodeEventTopics(parameters) {
    const { abi, eventName, args } = parameters;
    let abiItem = abi[0];
    if (eventName) {
        const item = (0,getAbiItem/* getAbiItem */.iY)({ abi, name: eventName });
        if (!item)
            throw new errors_abi/* AbiEventNotFoundError */.M_(eventName, { docsPath });
        abiItem = item;
    }
    if (abiItem.type !== 'event')
        throw new errors_abi/* AbiEventNotFoundError */.M_(undefined, { docsPath });
    const definition = (0,formatAbiItem/* formatAbiItem */.B)(abiItem);
    const signature = (0,toEventSelector/* toEventSelector */.h)(definition);
    let topics = [];
    if (args && 'inputs' in abiItem) {
        const indexedInputs = abiItem.inputs?.filter((param) => 'indexed' in param && param.indexed);
        const args_ = Array.isArray(args)
            ? args
            : Object.values(args).length > 0
                ? indexedInputs?.map((x) => args[x.name]) ?? []
                : [];
        if (args_.length > 0) {
            topics =
                indexedInputs?.map((param, i) => Array.isArray(args_[i])
                    ? args_[i].map((_, j) => encodeArg({ param, value: args_[i][j] }))
                    : args_[i]
                        ? encodeArg({ param, value: args_[i] })
                        : null) ?? [];
        }
    }
    return [signature, ...topics];
}
function encodeArg({ param, value, }) {
    if (param.type === 'string' || param.type === 'bytes')
        return (0,keccak256/* keccak256 */.S)((0,toBytes/* toBytes */.ZJ)(value));
    if (param.type === 'tuple' || param.type.match(/^(.*)\[(\d+)?\]$/))
        throw new FilterTypeNotSupportedError(param.type);
    return (0,encodeAbiParameters/* encodeAbiParameters */.h)([param], [value]);
}
//# sourceMappingURL=encodeEventTopics.js.map

/***/ }),

/***/ 8503:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  p: () => (/* binding */ encodeFunctionData)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/concat.js
var concat = __webpack_require__(5419);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/encodeAbiParameters.js
var encodeAbiParameters = __webpack_require__(4531);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/abi.js
var errors_abi = __webpack_require__(7372);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/hash/toFunctionSelector.js
var toFunctionSelector = __webpack_require__(2599);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/formatAbiItem.js
var formatAbiItem = __webpack_require__(5167);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/getAbiItem.js
var getAbiItem = __webpack_require__(4586);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js





const docsPath = '/docs/contract/encodeFunctionData';
function prepareEncodeFunctionData(parameters) {
    const { abi, args, functionName } = parameters;
    let abiItem = abi[0];
    if (functionName) {
        const item = (0,getAbiItem/* getAbiItem */.iY)({
            abi,
            args,
            name: functionName,
        });
        if (!item)
            throw new errors_abi/* AbiFunctionNotFoundError */.Iz(functionName, { docsPath });
        abiItem = item;
    }
    if (abiItem.type !== 'function')
        throw new errors_abi/* AbiFunctionNotFoundError */.Iz(undefined, { docsPath });
    return {
        abi: [abiItem],
        functionName: (0,toFunctionSelector/* toFunctionSelector */.V)((0,formatAbiItem/* formatAbiItem */.B)(abiItem)),
    };
}
//# sourceMappingURL=prepareEncodeFunctionData.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/abi/encodeFunctionData.js



function encodeFunctionData(parameters) {
    const { args } = parameters;
    const { abi, functionName } = (() => {
        if (parameters.abi.length === 1 &&
            parameters.functionName?.startsWith('0x'))
            return parameters;
        return prepareEncodeFunctionData(parameters);
    })();
    const abiItem = abi[0];
    const signature = functionName;
    const data = 'inputs' in abiItem && abiItem.inputs
        ? (0,encodeAbiParameters/* encodeAbiParameters */.h)(abiItem.inputs, args ?? [])
        : undefined;
    return (0,concat/* concatHex */.aP)([signature, data ?? '0x']);
}
//# sourceMappingURL=encodeFunctionData.js.map

/***/ }),

/***/ 5167:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ formatAbiParams),
/* harmony export */   B: () => (/* binding */ formatAbiItem)
/* harmony export */ });
/* harmony import */ var _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7372);

function formatAbiItem(abiItem, { includeName = false } = {}) {
    if (abiItem.type !== 'function' &&
        abiItem.type !== 'event' &&
        abiItem.type !== 'error')
        throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_0__/* .InvalidDefinitionTypeError */ .d_(abiItem.type);
    return `${abiItem.name}(${formatAbiParams(abiItem.inputs, { includeName })})`;
}
function formatAbiParams(params, { includeName = false } = {}) {
    if (!params)
        return '';
    return params
        .map((param) => formatAbiParam(param, { includeName }))
        .join(includeName ? ', ' : ',');
}
function formatAbiParam(param, { includeName }) {
    if (param.type.startsWith('tuple')) {
        return `(${formatAbiParams(param.components, { includeName })})${param.type.slice('tuple'.length)}`;
    }
    return param.type + (includeName && param.name ? ` ${param.name}` : '');
}
//# sourceMappingURL=formatAbiItem.js.map

/***/ }),

/***/ 4586:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   iY: () => (/* binding */ getAbiItem)
/* harmony export */ });
/* unused harmony exports isArgOfType, getAmbiguousTypes */
/* harmony import */ var _errors_abi_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7372);
/* harmony import */ var _utils_data_isHex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6394);
/* harmony import */ var _address_isAddress_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1657);
/* harmony import */ var _hash_toEventSelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9777);
/* harmony import */ var _hash_toFunctionSelector_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2599);






function getAbiItem(parameters) {
    const { abi, args = [], name } = parameters;
    const isSelector = (0,_utils_data_isHex_js__WEBPACK_IMPORTED_MODULE_0__/* .isHex */ .q)(name, { strict: false });
    const abiItems = abi.filter((abiItem) => {
        if (isSelector) {
            if (abiItem.type === 'function')
                return (0,_hash_toFunctionSelector_js__WEBPACK_IMPORTED_MODULE_1__/* .toFunctionSelector */ .V)(abiItem) === name;
            if (abiItem.type === 'event')
                return (0,_hash_toEventSelector_js__WEBPACK_IMPORTED_MODULE_2__/* .toEventSelector */ .h)(abiItem) === name;
            return false;
        }
        return 'name' in abiItem && abiItem.name === name;
    });
    if (abiItems.length === 0)
        return undefined;
    if (abiItems.length === 1)
        return abiItems[0];
    let matchedAbiItem = undefined;
    for (const abiItem of abiItems) {
        if (!('inputs' in abiItem))
            continue;
        if (!args || args.length === 0) {
            if (!abiItem.inputs || abiItem.inputs.length === 0)
                return abiItem;
            continue;
        }
        if (!abiItem.inputs)
            continue;
        if (abiItem.inputs.length === 0)
            continue;
        if (abiItem.inputs.length !== args.length)
            continue;
        const matched = args.every((arg, index) => {
            const abiParameter = 'inputs' in abiItem && abiItem.inputs[index];
            if (!abiParameter)
                return false;
            return isArgOfType(arg, abiParameter);
        });
        if (matched) {
            // Check for ambiguity against already matched parameters (e.g. `address` vs `bytes20`).
            if (matchedAbiItem &&
                'inputs' in matchedAbiItem &&
                matchedAbiItem.inputs) {
                const ambiguousTypes = getAmbiguousTypes(abiItem.inputs, matchedAbiItem.inputs, args);
                if (ambiguousTypes)
                    throw new _errors_abi_js__WEBPACK_IMPORTED_MODULE_3__/* .AbiItemAmbiguityError */ .nM({
                        abiItem,
                        type: ambiguousTypes[0],
                    }, {
                        abiItem: matchedAbiItem,
                        type: ambiguousTypes[1],
                    });
            }
            matchedAbiItem = abiItem;
        }
    }
    if (matchedAbiItem)
        return matchedAbiItem;
    return abiItems[0];
}
function isArgOfType(arg, abiParameter) {
    const argType = typeof arg;
    const abiParameterType = abiParameter.type;
    switch (abiParameterType) {
        case 'address':
            return (0,_address_isAddress_js__WEBPACK_IMPORTED_MODULE_4__/* .isAddress */ .P)(arg, { strict: false });
        case 'bool':
            return argType === 'boolean';
        case 'function':
            return argType === 'string';
        case 'string':
            return argType === 'string';
        default: {
            if (abiParameterType === 'tuple' && 'components' in abiParameter)
                return Object.values(abiParameter.components).every((component, index) => {
                    return isArgOfType(Object.values(arg)[index], component);
                });
            // `(u)int<M>`: (un)signed integer type of `M` bits, `0 < M <= 256`, `M % 8 == 0`
            // https://regexr.com/6v8hp
            if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType))
                return argType === 'number' || argType === 'bigint';
            // `bytes<M>`: binary type of `M` bytes, `0 < M <= 32`
            // https://regexr.com/6va55
            if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType))
                return argType === 'string' || arg instanceof Uint8Array;
            // fixed-length (`<type>[M]`) and dynamic (`<type>[]`) arrays
            // https://regexr.com/6va6i
            if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) {
                return (Array.isArray(arg) &&
                    arg.every((x) => isArgOfType(x, {
                        ...abiParameter,
                        // Pop off `[]` or `[M]` from end of type
                        type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, ''),
                    })));
            }
            return false;
        }
    }
}
function getAmbiguousTypes(sourceParameters, targetParameters, args) {
    for (const parameterIndex in sourceParameters) {
        const sourceParameter = sourceParameters[parameterIndex];
        const targetParameter = targetParameters[parameterIndex];
        if (sourceParameter.type === 'tuple' &&
            targetParameter.type === 'tuple' &&
            'components' in sourceParameter &&
            'components' in targetParameter)
            return getAmbiguousTypes(sourceParameter.components, targetParameter.components, args[parameterIndex]);
        const types = [sourceParameter.type, targetParameter.type];
        const ambiguous = (() => {
            if (types.includes('address') && types.includes('bytes20'))
                return true;
            if (types.includes('address') && types.includes('string'))
                return (0,_address_isAddress_js__WEBPACK_IMPORTED_MODULE_4__/* .isAddress */ .P)(args[parameterIndex], { strict: false });
            if (types.includes('address') && types.includes('bytes'))
                return (0,_address_isAddress_js__WEBPACK_IMPORTED_MODULE_4__/* .isAddress */ .P)(args[parameterIndex], { strict: false });
            return false;
        })();
        if (ambiguous)
            return types;
    }
    return;
}
//# sourceMappingURL=getAbiItem.js.map

/***/ }),

/***/ 8937:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p: () => (/* binding */ parseEventLogs)
/* harmony export */ });
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7372);
/* harmony import */ var _decodeEventLog_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9483);


/**
 * Extracts & decodes logs matching the provided signature(s) (`abi` + optional `eventName`)
 * from a set of opaque logs.
 *
 * @param parameters - {@link ParseEventLogsParameters}
 * @returns The logs. {@link ParseEventLogsReturnType}
 *
 * @example
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { parseEventLogs } from 'viem/op-stack'
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const receipt = await getTransactionReceipt(client, {
 *   hash: '0xec23b2ba4bc59ba61554507c1b1bc91649e6586eb2dd00c728e8ed0db8bb37ea',
 * })
 *
 * const logs = parseEventLogs({ logs: receipt.logs })
 * // [{ args: { ... }, eventName: 'TransactionDeposited', ... }, ...]
 */
function parseEventLogs({ abi, eventName, logs, strict = true, }) {
    return logs
        .map((log) => {
        try {
            const event = (0,_decodeEventLog_js__WEBPACK_IMPORTED_MODULE_0__/* .decodeEventLog */ .j)({
                ...log,
                abi,
                strict,
            });
            if (eventName && !eventName.includes(event.eventName))
                return null;
            return { ...event, ...log };
        }
        catch (err) {
            let eventName;
            let isUnnamed;
            if (err instanceof _index_js__WEBPACK_IMPORTED_MODULE_1__/* .AbiEventSignatureNotFoundError */ .kE)
                return null;
            if (err instanceof _index_js__WEBPACK_IMPORTED_MODULE_1__/* .DecodeLogDataMismatch */ .fo ||
                err instanceof _index_js__WEBPACK_IMPORTED_MODULE_1__/* .DecodeLogTopicsMismatch */ .l3) {
                // If strict mode is on, and log data/topics do not match event definition, skip.
                if (strict)
                    return null;
                eventName = err.abiItem.name;
                isUnnamed = err.abiItem.inputs?.some((x) => !('name' in x && x.name));
            }
            // Set args to empty if there is an error decoding (e.g. indexed/non-indexed params mismatch).
            return { ...log, args: isUnnamed ? [] : {}, eventName };
        }
    })
        .filter(Boolean);
}
//# sourceMappingURL=parseEventLogs.js.map

/***/ }),

/***/ 4569:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   b: () => (/* binding */ getAddress),
/* harmony export */   o: () => (/* binding */ checksumAddress)
/* harmony export */ });
/* harmony import */ var _errors_address_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4306);
/* harmony import */ var _encoding_toBytes_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4706);
/* harmony import */ var _hash_keccak256_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8729);
/* harmony import */ var _isAddress_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1657);




function checksumAddress(address_, chainId) {
    const hexAddress = chainId
        ? `${chainId}${address_.toLowerCase()}`
        : address_.substring(2).toLowerCase();
    const hash = (0,_hash_keccak256_js__WEBPACK_IMPORTED_MODULE_0__/* .keccak256 */ .S)((0,_encoding_toBytes_js__WEBPACK_IMPORTED_MODULE_1__/* .stringToBytes */ .Af)(hexAddress), 'bytes');
    const address = (chainId ? hexAddress.substring(`${chainId}0x`.length) : hexAddress).split('');
    for (let i = 0; i < 40; i += 2) {
        if (hash[i >> 1] >> 4 >= 8 && address[i]) {
            address[i] = address[i].toUpperCase();
        }
        if ((hash[i >> 1] & 0x0f) >= 8 && address[i + 1]) {
            address[i + 1] = address[i + 1].toUpperCase();
        }
    }
    return `0x${address.join('')}`;
}
function getAddress(address, chainId) {
    if (!(0,_isAddress_js__WEBPACK_IMPORTED_MODULE_2__/* .isAddress */ .P)(address, { strict: false }))
        throw new _errors_address_js__WEBPACK_IMPORTED_MODULE_3__/* .InvalidAddressError */ .M({ address });
    return checksumAddress(address, chainId);
}
//# sourceMappingURL=getAddress.js.map

/***/ }),

/***/ 1657:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  P: () => (/* binding */ isAddress)
});

// UNUSED EXPORTS: isAddressCache

;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/lru.js
/**
 * Map with a LRU (Least recently used) policy.
 *
 * @link https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU
 */
class LruMap extends Map {
    constructor(size) {
        super();
        Object.defineProperty(this, "maxSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.maxSize = size;
    }
    set(key, value) {
        super.set(key, value);
        if (this.maxSize && this.size > this.maxSize)
            this.delete(this.keys().next().value);
        return this;
    }
}
//# sourceMappingURL=lru.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/address/getAddress.js
var getAddress = __webpack_require__(4569);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/address/isAddress.js


const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const isAddressCache = /*#__PURE__*/ new LruMap(8192);
function isAddress(address, options) {
    const { strict = true } = options ?? {};
    if (isAddressCache.has(address))
        return isAddressCache.get(address);
    const result = (() => {
        if (!addressRegex.test(address))
            return false;
        if (address.toLowerCase() === address)
            return true;
        if (strict)
            return (0,getAddress/* checksumAddress */.o)(address) === address;
        return true;
    })();
    isAddressCache.set(address, result);
    return result;
}
//# sourceMappingURL=isAddress.js.map

/***/ }),

/***/ 1316:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  offchainLookup: () => (/* binding */ offchainLookup),
  offchainLookupSignature: () => (/* binding */ offchainLookupSignature)
});

// UNUSED EXPORTS: ccipRequest, offchainLookupAbiItem

// EXTERNAL MODULE: ./node_modules/viem/_esm/actions/public/call.js + 2 modules
var call = __webpack_require__(6782);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/stringify.js
var stringify = __webpack_require__(8463);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/base.js
var base = __webpack_require__(6329);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/utils.js + 1 modules
var utils = __webpack_require__(1526);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/errors/ccip.js



class OffchainLookupError extends base/* BaseError */.C {
    constructor({ callbackSelector, cause, data, extraData, sender, urls, }) {
        super(cause.shortMessage ||
            'An error occurred while fetching for an offchain result.', {
            cause,
            metaMessages: [
                ...(cause.metaMessages || []),
                cause.metaMessages?.length ? '' : [],
                'Offchain Gateway Call:',
                urls && [
                    '  Gateway URL(s):',
                    ...urls.map((url) => `    ${(0,utils/* getUrl */.ID)(url)}`),
                ],
                `  Sender: ${sender}`,
                `  Data: ${data}`,
                `  Callback selector: ${callbackSelector}`,
                `  Extra data: ${extraData}`,
            ].flat(),
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'OffchainLookupError'
        });
    }
}
class OffchainLookupResponseMalformedError extends base/* BaseError */.C {
    constructor({ result, url }) {
        super('Offchain gateway response is malformed. Response data must be a hex value.', {
            metaMessages: [
                `Gateway URL: ${(0,utils/* getUrl */.ID)(url)}`,
                `Response: ${(0,stringify/* stringify */.A)(result)}`,
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'OffchainLookupResponseMalformedError'
        });
    }
}
class OffchainLookupSenderMismatchError extends base/* BaseError */.C {
    constructor({ sender, to }) {
        super('Reverted sender address does not match target contract address (`to`).', {
            metaMessages: [
                `Contract address: ${to}`,
                `OffchainLookup sender address: ${sender}`,
            ],
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'OffchainLookupSenderMismatchError'
        });
    }
}
//# sourceMappingURL=ccip.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/request.js
var request = __webpack_require__(6595);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/decodeErrorResult.js
var decodeErrorResult = __webpack_require__(5462);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/abi/encodeAbiParameters.js
var encodeAbiParameters = __webpack_require__(4531);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/address.js
var address = __webpack_require__(4306);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/address/isAddress.js + 1 modules
var isAddress = __webpack_require__(1657);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/address/isAddressEqual.js


function isAddressEqual(a, b) {
    if (!(0,isAddress/* isAddress */.P)(a, { strict: false }))
        throw new address/* InvalidAddressError */.M({ address: a });
    if (!(0,isAddress/* isAddress */.P)(b, { strict: false }))
        throw new address/* InvalidAddressError */.M({ address: b });
    return a.toLowerCase() === b.toLowerCase();
}
//# sourceMappingURL=isAddressEqual.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/concat.js
var concat = __webpack_require__(5419);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/isHex.js
var isHex = __webpack_require__(6394);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/ccip.js










const offchainLookupSignature = '0x556f1830';
const offchainLookupAbiItem = {
    name: 'OffchainLookup',
    type: 'error',
    inputs: [
        {
            name: 'sender',
            type: 'address',
        },
        {
            name: 'urls',
            type: 'string[]',
        },
        {
            name: 'callData',
            type: 'bytes',
        },
        {
            name: 'callbackFunction',
            type: 'bytes4',
        },
        {
            name: 'extraData',
            type: 'bytes',
        },
    ],
};
async function offchainLookup(client, { blockNumber, blockTag, data, to, }) {
    const { args } = (0,decodeErrorResult/* decodeErrorResult */.W)({
        data,
        abi: [offchainLookupAbiItem],
    });
    const [sender, urls, callData, callbackSelector, extraData] = args;
    const { ccipRead } = client;
    const ccipRequest_ = ccipRead && typeof ccipRead?.request === 'function'
        ? ccipRead.request
        : ccipRequest;
    try {
        if (!isAddressEqual(to, sender))
            throw new OffchainLookupSenderMismatchError({ sender, to });
        const result = await ccipRequest_({ data: callData, sender, urls });
        const { data: data_ } = await (0,call/* call */.T1)(client, {
            blockNumber,
            blockTag,
            data: (0,concat/* concat */.xW)([
                callbackSelector,
                (0,encodeAbiParameters/* encodeAbiParameters */.h)([{ type: 'bytes' }, { type: 'bytes' }], [result, extraData]),
            ]),
            to,
        });
        return data_;
    }
    catch (err) {
        throw new OffchainLookupError({
            callbackSelector,
            cause: err,
            data,
            extraData,
            sender,
            urls,
        });
    }
}
async function ccipRequest({ data, sender, urls, }) {
    let error = new Error('An unknown error occurred.');
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const method = url.includes('{data}') ? 'GET' : 'POST';
        const body = method === 'POST' ? { data, sender } : undefined;
        try {
            const response = await fetch(url.replace('{sender}', sender).replace('{data}', data), {
                body: JSON.stringify(body),
                method,
            });
            let result;
            if (response.headers.get('Content-Type')?.startsWith('application/json')) {
                result = (await response.json()).data;
            }
            else {
                result = (await response.text());
            }
            if (!response.ok) {
                error = new request/* HttpRequestError */.Ci({
                    body,
                    details: result?.error
                        ? (0,stringify/* stringify */.A)(result.error)
                        : response.statusText,
                    headers: response.headers,
                    status: response.status,
                    url,
                });
                continue;
            }
            if (!(0,isHex/* isHex */.q)(result)) {
                error = new OffchainLookupResponseMalformedError({
                    result,
                    url,
                });
                continue;
            }
            return result;
        }
        catch (err) {
            error = new request/* HttpRequestError */.Ci({
                body,
                details: err.message,
                url,
            });
        }
    }
    throw error;
}
//# sourceMappingURL=ccip.js.map

/***/ }),

/***/ 3190:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   v: () => (/* binding */ assertCurrentChain)
/* harmony export */ });
/* harmony import */ var _errors_chain_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8703);

function assertCurrentChain({ chain, currentChainId, }) {
    if (!chain)
        throw new _errors_chain_js__WEBPACK_IMPORTED_MODULE_0__/* .ChainNotFoundError */ .jF();
    if (currentChainId !== chain.id)
        throw new _errors_chain_js__WEBPACK_IMPORTED_MODULE_0__/* .ChainMismatchError */ .EH({ chain, currentChainId });
}
//# sourceMappingURL=assertCurrentChain.js.map

/***/ }),

/***/ 9985:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   M: () => (/* binding */ getChainContractAddress)
/* harmony export */ });
/* harmony import */ var _errors_chain_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8703);

function getChainContractAddress({ blockNumber, chain, contract: name, }) {
    const contract = chain?.contracts?.[name];
    if (!contract)
        throw new _errors_chain_js__WEBPACK_IMPORTED_MODULE_0__/* .ChainDoesNotSupportContract */ .rj({
            chain,
            contract: { name },
        });
    if (blockNumber &&
        contract.blockCreated &&
        contract.blockCreated > blockNumber)
        throw new _errors_chain_js__WEBPACK_IMPORTED_MODULE_0__/* .ChainDoesNotSupportContract */ .rj({
            blockNumber,
            chain,
            contract: {
                name,
                blockCreated: contract.blockCreated,
            },
        });
    return contract.address;
}
//# sourceMappingURL=getChainContractAddress.js.map

/***/ }),

/***/ 5834:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   l: () => (/* binding */ createCursor)
/* harmony export */ });
/* harmony import */ var _errors_cursor_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8146);

const staticCursor = {
    bytes: new Uint8Array(),
    dataView: new DataView(new ArrayBuffer(0)),
    position: 0,
    positionReadCount: new Map(),
    recursiveReadCount: 0,
    recursiveReadLimit: Infinity,
    assertReadLimit() {
        if (this.recursiveReadCount >= this.recursiveReadLimit)
            throw new _errors_cursor_js__WEBPACK_IMPORTED_MODULE_0__/* .RecursiveReadLimitExceededError */ .hX({
                count: this.recursiveReadCount + 1,
                limit: this.recursiveReadLimit,
            });
    },
    assertPosition(position) {
        if (position < 0 || position > this.bytes.length - 1)
            throw new _errors_cursor_js__WEBPACK_IMPORTED_MODULE_0__/* .PositionOutOfBoundsError */ .SK({
                length: this.bytes.length,
                position,
            });
    },
    decrementPosition(offset) {
        if (offset < 0)
            throw new _errors_cursor_js__WEBPACK_IMPORTED_MODULE_0__/* .NegativeOffsetError */ .B4({ offset });
        const position = this.position - offset;
        this.assertPosition(position);
        this.position = position;
    },
    getReadCount(position) {
        return this.positionReadCount.get(position || this.position) || 0;
    },
    incrementPosition(offset) {
        if (offset < 0)
            throw new _errors_cursor_js__WEBPACK_IMPORTED_MODULE_0__/* .NegativeOffsetError */ .B4({ offset });
        const position = this.position + offset;
        this.assertPosition(position);
        this.position = position;
    },
    inspectByte(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position);
        return this.bytes[position];
    },
    inspectBytes(length, position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + length - 1);
        return this.bytes.subarray(position, position + length);
    },
    inspectUint8(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position);
        return this.bytes[position];
    },
    inspectUint16(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 1);
        return this.dataView.getUint16(position);
    },
    inspectUint24(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 2);
        return ((this.dataView.getUint16(position) << 8) +
            this.dataView.getUint8(position + 2));
    },
    inspectUint32(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 3);
        return this.dataView.getUint32(position);
    },
    pushByte(byte) {
        this.assertPosition(this.position);
        this.bytes[this.position] = byte;
        this.position++;
    },
    pushBytes(bytes) {
        this.assertPosition(this.position + bytes.length - 1);
        this.bytes.set(bytes, this.position);
        this.position += bytes.length;
    },
    pushUint8(value) {
        this.assertPosition(this.position);
        this.bytes[this.position] = value;
        this.position++;
    },
    pushUint16(value) {
        this.assertPosition(this.position + 1);
        this.dataView.setUint16(this.position, value);
        this.position += 2;
    },
    pushUint24(value) {
        this.assertPosition(this.position + 2);
        this.dataView.setUint16(this.position, value >> 8);
        this.dataView.setUint8(this.position + 2, value & ~4294967040);
        this.position += 3;
    },
    pushUint32(value) {
        this.assertPosition(this.position + 3);
        this.dataView.setUint32(this.position, value);
        this.position += 4;
    },
    readByte() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectByte();
        this.position++;
        return value;
    },
    readBytes(length, size) {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectBytes(length);
        this.position += size ?? length;
        return value;
    },
    readUint8() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint8();
        this.position += 1;
        return value;
    },
    readUint16() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint16();
        this.position += 2;
        return value;
    },
    readUint24() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint24();
        this.position += 3;
        return value;
    },
    readUint32() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint32();
        this.position += 4;
        return value;
    },
    get remaining() {
        return this.bytes.length - this.position;
    },
    setPosition(position) {
        const oldPosition = this.position;
        this.assertPosition(position);
        this.position = position;
        return () => (this.position = oldPosition);
    },
    _touch() {
        if (this.recursiveReadLimit === Infinity)
            return;
        const count = this.getReadCount();
        this.positionReadCount.set(this.position, count + 1);
        if (count > 0)
            this.recursiveReadCount++;
    },
};
function createCursor(bytes, { recursiveReadLimit = 8_192 } = {}) {
    const cursor = Object.create(staticCursor);
    cursor.bytes = bytes;
    cursor.dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    cursor.positionReadCount = new Map();
    cursor.recursiveReadLimit = recursiveReadLimit;
    return cursor;
}
//# sourceMappingURL=cursor.js.map

/***/ }),

/***/ 5419:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   aP: () => (/* binding */ concatHex),
/* harmony export */   xW: () => (/* binding */ concat)
/* harmony export */ });
/* unused harmony export concatBytes */
function concat(values) {
    if (typeof values[0] === 'string')
        return concatHex(values);
    return concatBytes(values);
}
function concatBytes(values) {
    let length = 0;
    for (const arr of values) {
        length += arr.length;
    }
    const result = new Uint8Array(length);
    let offset = 0;
    for (const arr of values) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}
function concatHex(values) {
    return `0x${values.reduce((acc, x) => acc + x.replace('0x', ''), '')}`;
}
//# sourceMappingURL=concat.js.map

/***/ }),

/***/ 6394:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   q: () => (/* binding */ isHex)
/* harmony export */ });
function isHex(value, { strict = true } = {}) {
    if (!value)
        return false;
    if (typeof value !== 'string')
        return false;
    return strict ? /^0x[0-9a-fA-F]*$/.test(value) : value.startsWith('0x');
}
//# sourceMappingURL=isHex.js.map

/***/ }),

/***/ 586:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   db: () => (/* binding */ padHex),
/* harmony export */   eV: () => (/* binding */ pad)
/* harmony export */ });
/* unused harmony export padBytes */
/* harmony import */ var _errors_data_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6440);

function pad(hexOrBytes, { dir, size = 32 } = {}) {
    if (typeof hexOrBytes === 'string')
        return padHex(hexOrBytes, { dir, size });
    return padBytes(hexOrBytes, { dir, size });
}
function padHex(hex_, { dir, size = 32 } = {}) {
    if (size === null)
        return hex_;
    const hex = hex_.replace('0x', '');
    if (hex.length > size * 2)
        throw new _errors_data_js__WEBPACK_IMPORTED_MODULE_0__/* .SizeExceedsPaddingSizeError */ .Fl({
            size: Math.ceil(hex.length / 2),
            targetSize: size,
            type: 'hex',
        });
    return `0x${hex[dir === 'right' ? 'padEnd' : 'padStart'](size * 2, '0')}`;
}
function padBytes(bytes, { dir, size = 32 } = {}) {
    if (size === null)
        return bytes;
    if (bytes.length > size)
        throw new _errors_data_js__WEBPACK_IMPORTED_MODULE_0__/* .SizeExceedsPaddingSizeError */ .Fl({
            size: bytes.length,
            targetSize: size,
            type: 'bytes',
        });
    const paddedBytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
        const padEnd = dir === 'right';
        paddedBytes[padEnd ? i : size - i - 1] =
            bytes[padEnd ? i : bytes.length - i - 1];
    }
    return paddedBytes;
}
//# sourceMappingURL=pad.js.map

/***/ }),

/***/ 5182:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   E: () => (/* binding */ size)
/* harmony export */ });
/* harmony import */ var _isHex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6394);

/**
 * @description Retrieves the size of the value (in bytes).
 *
 * @param value The value (hex or byte array) to retrieve the size of.
 * @returns The size of the value (in bytes).
 */
function size(value) {
    if ((0,_isHex_js__WEBPACK_IMPORTED_MODULE_0__/* .isHex */ .q)(value, { strict: false }))
        return Math.ceil((value.length - 2) / 2);
    return value.length;
}
//# sourceMappingURL=size.js.map

/***/ }),

/***/ 3577:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A1: () => (/* binding */ sliceBytes),
/* harmony export */   di: () => (/* binding */ slice)
/* harmony export */ });
/* unused harmony export sliceHex */
/* harmony import */ var _errors_data_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6440);
/* harmony import */ var _isHex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6394);
/* harmony import */ var _size_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5182);



/**
 * @description Returns a section of the hex or byte array given a start/end bytes offset.
 *
 * @param value The hex or byte array to slice.
 * @param start The start offset (in bytes).
 * @param end The end offset (in bytes).
 */
function slice(value, start, end, { strict } = {}) {
    if ((0,_isHex_js__WEBPACK_IMPORTED_MODULE_0__/* .isHex */ .q)(value, { strict: false }))
        return sliceHex(value, start, end, {
            strict,
        });
    return sliceBytes(value, start, end, {
        strict,
    });
}
function assertStartOffset(value, start) {
    if (typeof start === 'number' && start > 0 && start > (0,_size_js__WEBPACK_IMPORTED_MODULE_1__/* .size */ .E)(value) - 1)
        throw new _errors_data_js__WEBPACK_IMPORTED_MODULE_2__/* .SliceOffsetOutOfBoundsError */ .ii({
            offset: start,
            position: 'start',
            size: (0,_size_js__WEBPACK_IMPORTED_MODULE_1__/* .size */ .E)(value),
        });
}
function assertEndOffset(value, start, end) {
    if (typeof start === 'number' &&
        typeof end === 'number' &&
        (0,_size_js__WEBPACK_IMPORTED_MODULE_1__/* .size */ .E)(value) !== end - start) {
        throw new _errors_data_js__WEBPACK_IMPORTED_MODULE_2__/* .SliceOffsetOutOfBoundsError */ .ii({
            offset: end,
            position: 'end',
            size: (0,_size_js__WEBPACK_IMPORTED_MODULE_1__/* .size */ .E)(value),
        });
    }
}
/**
 * @description Returns a section of the byte array given a start/end bytes offset.
 *
 * @param value The byte array to slice.
 * @param start The start offset (in bytes).
 * @param end The end offset (in bytes).
 */
function sliceBytes(value_, start, end, { strict } = {}) {
    assertStartOffset(value_, start);
    const value = value_.slice(start, end);
    if (strict)
        assertEndOffset(value, start, end);
    return value;
}
/**
 * @description Returns a section of the hex value given a start/end bytes offset.
 *
 * @param value The hex value to slice.
 * @param start The start offset (in bytes).
 * @param end The end offset (in bytes).
 */
function sliceHex(value_, start, end, { strict } = {}) {
    assertStartOffset(value_, start);
    const value = `0x${value_
        .replace('0x', '')
        .slice((start ?? 0) * 2, (end ?? value_.length) * 2)}`;
    if (strict)
        assertEndOffset(value, start, end);
    return value;
}
//# sourceMappingURL=slice.js.map

/***/ }),

/***/ 8583:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   B: () => (/* binding */ trim)
/* harmony export */ });
function trim(hexOrBytes, { dir = 'left' } = {}) {
    let data = typeof hexOrBytes === 'string' ? hexOrBytes.replace('0x', '') : hexOrBytes;
    let sliceLength = 0;
    for (let i = 0; i < data.length - 1; i++) {
        if (data[dir === 'left' ? i : data.length - i - 1].toString() === '0')
            sliceLength++;
        else
            break;
    }
    data =
        dir === 'left'
            ? data.slice(sliceLength)
            : data.slice(0, data.length - sliceLength);
    if (typeof hexOrBytes === 'string') {
        if (data.length === 1 && dir === 'right')
            data = `${data}0`;
        return `0x${data.length % 2 === 1 ? `0${data}` : data}`;
    }
    return data;
}
//# sourceMappingURL=trim.js.map

/***/ }),

/***/ 6675:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ME: () => (/* binding */ hexToNumber),
/* harmony export */   Sl: () => (/* binding */ assertSize),
/* harmony export */   uU: () => (/* binding */ hexToBigInt)
/* harmony export */ });
/* unused harmony exports fromHex, hexToBool, hexToString */
/* harmony import */ var _errors_encoding_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4317);
/* harmony import */ var _data_size_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5182);




function assertSize(hexOrBytes, { size }) {
    if ((0,_data_size_js__WEBPACK_IMPORTED_MODULE_0__/* .size */ .E)(hexOrBytes) > size)
        throw new _errors_encoding_js__WEBPACK_IMPORTED_MODULE_1__/* .SizeOverflowError */ .u({
            givenSize: (0,_data_size_js__WEBPACK_IMPORTED_MODULE_0__/* .size */ .E)(hexOrBytes),
            maxSize: size,
        });
}
/**
 * Decodes a hex string into a string, number, bigint, boolean, or byte array.
 *
 * - Docs: https://viem.sh/docs/utilities/fromHex
 * - Example: https://viem.sh/docs/utilities/fromHex#usage
 *
 * @param hex Hex string to decode.
 * @param toOrOpts Type to convert to or options.
 * @returns Decoded value.
 *
 * @example
 * import { fromHex } from 'viem'
 * const data = fromHex('0x1a4', 'number')
 * // 420
 *
 * @example
 * import { fromHex } from 'viem'
 * const data = fromHex('0x48656c6c6f20576f726c6421', 'string')
 * // 'Hello world'
 *
 * @example
 * import { fromHex } from 'viem'
 * const data = fromHex('0x48656c6c6f20576f726c64210000000000000000000000000000000000000000', {
 *   size: 32,
 *   to: 'string'
 * })
 * // 'Hello world'
 */
function fromHex(hex, toOrOpts) {
    const opts = typeof toOrOpts === 'string' ? { to: toOrOpts } : toOrOpts;
    const to = opts.to;
    if (to === 'number')
        return hexToNumber(hex, opts);
    if (to === 'bigint')
        return hexToBigInt(hex, opts);
    if (to === 'string')
        return hexToString(hex, opts);
    if (to === 'boolean')
        return hexToBool(hex, opts);
    return hexToBytes(hex, opts);
}
/**
 * Decodes a hex value into a bigint.
 *
 * - Docs: https://viem.sh/docs/utilities/fromHex#hextobigint
 *
 * @param hex Hex value to decode.
 * @param opts Options.
 * @returns BigInt value.
 *
 * @example
 * import { hexToBigInt } from 'viem'
 * const data = hexToBigInt('0x1a4', { signed: true })
 * // 420n
 *
 * @example
 * import { hexToBigInt } from 'viem'
 * const data = hexToBigInt('0x00000000000000000000000000000000000000000000000000000000000001a4', { size: 32 })
 * // 420n
 */
function hexToBigInt(hex, opts = {}) {
    const { signed } = opts;
    if (opts.size)
        assertSize(hex, { size: opts.size });
    const value = BigInt(hex);
    if (!signed)
        return value;
    const size = (hex.length - 2) / 2;
    const max = (1n << (BigInt(size) * 8n - 1n)) - 1n;
    if (value <= max)
        return value;
    return value - BigInt(`0x${'f'.padStart(size * 2, 'f')}`) - 1n;
}
/**
 * Decodes a hex value into a boolean.
 *
 * - Docs: https://viem.sh/docs/utilities/fromHex#hextobool
 *
 * @param hex Hex value to decode.
 * @param opts Options.
 * @returns Boolean value.
 *
 * @example
 * import { hexToBool } from 'viem'
 * const data = hexToBool('0x01')
 * // true
 *
 * @example
 * import { hexToBool } from 'viem'
 * const data = hexToBool('0x0000000000000000000000000000000000000000000000000000000000000001', { size: 32 })
 * // true
 */
function hexToBool(hex_, opts = {}) {
    let hex = hex_;
    if (opts.size) {
        assertSize(hex, { size: opts.size });
        hex = trim(hex);
    }
    if (trim(hex) === '0x00')
        return false;
    if (trim(hex) === '0x01')
        return true;
    throw new InvalidHexBooleanError(hex);
}
/**
 * Decodes a hex string into a number.
 *
 * - Docs: https://viem.sh/docs/utilities/fromHex#hextonumber
 *
 * @param hex Hex value to decode.
 * @param opts Options.
 * @returns Number value.
 *
 * @example
 * import { hexToNumber } from 'viem'
 * const data = hexToNumber('0x1a4')
 * // 420
 *
 * @example
 * import { hexToNumber } from 'viem'
 * const data = hexToBigInt('0x00000000000000000000000000000000000000000000000000000000000001a4', { size: 32 })
 * // 420
 */
function hexToNumber(hex, opts = {}) {
    return Number(hexToBigInt(hex, opts));
}
/**
 * Decodes a hex value into a UTF-8 string.
 *
 * - Docs: https://viem.sh/docs/utilities/fromHex#hextostring
 *
 * @param hex Hex value to decode.
 * @param opts Options.
 * @returns String value.
 *
 * @example
 * import { hexToString } from 'viem'
 * const data = hexToString('0x48656c6c6f20576f726c6421')
 * // 'Hello world!'
 *
 * @example
 * import { hexToString } from 'viem'
 * const data = hexToString('0x48656c6c6f20576f726c64210000000000000000000000000000000000000000', {
 *  size: 32,
 * })
 * // 'Hello world'
 */
function hexToString(hex, opts = {}) {
    let bytes = hexToBytes(hex);
    if (opts.size) {
        assertSize(bytes, { size: opts.size });
        bytes = trim(bytes, { dir: 'right' });
    }
    return new TextDecoder().decode(bytes);
}
//# sourceMappingURL=fromHex.js.map

/***/ }),

/***/ 4706:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Af: () => (/* binding */ stringToBytes),
/* harmony export */   ZJ: () => (/* binding */ toBytes),
/* harmony export */   aT: () => (/* binding */ hexToBytes)
/* harmony export */ });
/* unused harmony exports boolToBytes, numberToBytes */
/* harmony import */ var _errors_base_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6329);
/* harmony import */ var _data_isHex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6394);
/* harmony import */ var _data_pad_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(586);
/* harmony import */ var _fromHex_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6675);
/* harmony import */ var _toHex_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4192);





const encoder = /*#__PURE__*/ new TextEncoder();
/**
 * Encodes a UTF-8 string, hex value, bigint, number or boolean to a byte array.
 *
 * - Docs: https://viem.sh/docs/utilities/toBytes
 * - Example: https://viem.sh/docs/utilities/toBytes#usage
 *
 * @param value Value to encode.
 * @param opts Options.
 * @returns Byte array value.
 *
 * @example
 * import { toBytes } from 'viem'
 * const data = toBytes('Hello world')
 * // Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
 *
 * @example
 * import { toBytes } from 'viem'
 * const data = toBytes(420)
 * // Uint8Array([1, 164])
 *
 * @example
 * import { toBytes } from 'viem'
 * const data = toBytes(420, { size: 4 })
 * // Uint8Array([0, 0, 1, 164])
 */
function toBytes(value, opts = {}) {
    if (typeof value === 'number' || typeof value === 'bigint')
        return numberToBytes(value, opts);
    if (typeof value === 'boolean')
        return boolToBytes(value, opts);
    if ((0,_data_isHex_js__WEBPACK_IMPORTED_MODULE_0__/* .isHex */ .q)(value))
        return hexToBytes(value, opts);
    return stringToBytes(value, opts);
}
/**
 * Encodes a boolean into a byte array.
 *
 * - Docs: https://viem.sh/docs/utilities/toBytes#booltobytes
 *
 * @param value Boolean value to encode.
 * @param opts Options.
 * @returns Byte array value.
 *
 * @example
 * import { boolToBytes } from 'viem'
 * const data = boolToBytes(true)
 * // Uint8Array([1])
 *
 * @example
 * import { boolToBytes } from 'viem'
 * const data = boolToBytes(true, { size: 32 })
 * // Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1])
 */
function boolToBytes(value, opts = {}) {
    const bytes = new Uint8Array(1);
    bytes[0] = Number(value);
    if (typeof opts.size === 'number') {
        (0,_fromHex_js__WEBPACK_IMPORTED_MODULE_1__/* .assertSize */ .Sl)(bytes, { size: opts.size });
        return (0,_data_pad_js__WEBPACK_IMPORTED_MODULE_2__/* .pad */ .eV)(bytes, { size: opts.size });
    }
    return bytes;
}
// We use very optimized technique to convert hex string to byte array
const charCodeMap = {
    zero: 48,
    nine: 57,
    A: 65,
    F: 70,
    a: 97,
    f: 102,
};
function charCodeToBase16(char) {
    if (char >= charCodeMap.zero && char <= charCodeMap.nine)
        return char - charCodeMap.zero;
    if (char >= charCodeMap.A && char <= charCodeMap.F)
        return char - (charCodeMap.A - 10);
    if (char >= charCodeMap.a && char <= charCodeMap.f)
        return char - (charCodeMap.a - 10);
    return undefined;
}
/**
 * Encodes a hex string into a byte array.
 *
 * - Docs: https://viem.sh/docs/utilities/toBytes#hextobytes
 *
 * @param hex Hex string to encode.
 * @param opts Options.
 * @returns Byte array value.
 *
 * @example
 * import { hexToBytes } from 'viem'
 * const data = hexToBytes('0x48656c6c6f20776f726c6421')
 * // Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
 *
 * @example
 * import { hexToBytes } from 'viem'
 * const data = hexToBytes('0x48656c6c6f20776f726c6421', { size: 32 })
 * // Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
 */
function hexToBytes(hex_, opts = {}) {
    let hex = hex_;
    if (opts.size) {
        (0,_fromHex_js__WEBPACK_IMPORTED_MODULE_1__/* .assertSize */ .Sl)(hex, { size: opts.size });
        hex = (0,_data_pad_js__WEBPACK_IMPORTED_MODULE_2__/* .pad */ .eV)(hex, { dir: 'right', size: opts.size });
    }
    let hexString = hex.slice(2);
    if (hexString.length % 2)
        hexString = `0${hexString}`;
    const length = hexString.length / 2;
    const bytes = new Uint8Array(length);
    for (let index = 0, j = 0; index < length; index++) {
        const nibbleLeft = charCodeToBase16(hexString.charCodeAt(j++));
        const nibbleRight = charCodeToBase16(hexString.charCodeAt(j++));
        if (nibbleLeft === undefined || nibbleRight === undefined) {
            throw new _errors_base_js__WEBPACK_IMPORTED_MODULE_3__/* .BaseError */ .C(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
        }
        bytes[index] = nibbleLeft * 16 + nibbleRight;
    }
    return bytes;
}
/**
 * Encodes a number into a byte array.
 *
 * - Docs: https://viem.sh/docs/utilities/toBytes#numbertobytes
 *
 * @param value Number to encode.
 * @param opts Options.
 * @returns Byte array value.
 *
 * @example
 * import { numberToBytes } from 'viem'
 * const data = numberToBytes(420)
 * // Uint8Array([1, 164])
 *
 * @example
 * import { numberToBytes } from 'viem'
 * const data = numberToBytes(420, { size: 4 })
 * // Uint8Array([0, 0, 1, 164])
 */
function numberToBytes(value, opts) {
    const hex = (0,_toHex_js__WEBPACK_IMPORTED_MODULE_4__/* .numberToHex */ .cK)(value, opts);
    return hexToBytes(hex);
}
/**
 * Encodes a UTF-8 string into a byte array.
 *
 * - Docs: https://viem.sh/docs/utilities/toBytes#stringtobytes
 *
 * @param value String to encode.
 * @param opts Options.
 * @returns Byte array value.
 *
 * @example
 * import { stringToBytes } from 'viem'
 * const data = stringToBytes('Hello world!')
 * // Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33])
 *
 * @example
 * import { stringToBytes } from 'viem'
 * const data = stringToBytes('Hello world!', { size: 32 })
 * // Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
 */
function stringToBytes(value, opts = {}) {
    const bytes = encoder.encode(value);
    if (typeof opts.size === 'number') {
        (0,_fromHex_js__WEBPACK_IMPORTED_MODULE_1__/* .assertSize */ .Sl)(bytes, { size: opts.size });
        return (0,_data_pad_js__WEBPACK_IMPORTED_MODULE_2__/* .pad */ .eV)(bytes, { dir: 'right', size: opts.size });
    }
    return bytes;
}
//# sourceMappingURL=toBytes.js.map

/***/ }),

/***/ 4192:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $P: () => (/* binding */ boolToHex),
/* harmony export */   My: () => (/* binding */ bytesToHex),
/* harmony export */   cK: () => (/* binding */ numberToHex),
/* harmony export */   i3: () => (/* binding */ stringToHex),
/* harmony export */   nj: () => (/* binding */ toHex)
/* harmony export */ });
/* harmony import */ var _errors_encoding_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4317);
/* harmony import */ var _data_pad_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(586);
/* harmony import */ var _fromHex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6675);



const hexes = /*#__PURE__*/ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, '0'));
/**
 * Encodes a string, number, bigint, or ByteArray into a hex string
 *
 * - Docs: https://viem.sh/docs/utilities/toHex
 * - Example: https://viem.sh/docs/utilities/toHex#usage
 *
 * @param value Value to encode.
 * @param opts Options.
 * @returns Hex value.
 *
 * @example
 * import { toHex } from 'viem'
 * const data = toHex('Hello world')
 * // '0x48656c6c6f20776f726c6421'
 *
 * @example
 * import { toHex } from 'viem'
 * const data = toHex(420)
 * // '0x1a4'
 *
 * @example
 * import { toHex } from 'viem'
 * const data = toHex('Hello world', { size: 32 })
 * // '0x48656c6c6f20776f726c64210000000000000000000000000000000000000000'
 */
function toHex(value, opts = {}) {
    if (typeof value === 'number' || typeof value === 'bigint')
        return numberToHex(value, opts);
    if (typeof value === 'string') {
        return stringToHex(value, opts);
    }
    if (typeof value === 'boolean')
        return boolToHex(value, opts);
    return bytesToHex(value, opts);
}
/**
 * Encodes a boolean into a hex string
 *
 * - Docs: https://viem.sh/docs/utilities/toHex#booltohex
 *
 * @param value Value to encode.
 * @param opts Options.
 * @returns Hex value.
 *
 * @example
 * import { boolToHex } from 'viem'
 * const data = boolToHex(true)
 * // '0x1'
 *
 * @example
 * import { boolToHex } from 'viem'
 * const data = boolToHex(false)
 * // '0x0'
 *
 * @example
 * import { boolToHex } from 'viem'
 * const data = boolToHex(true, { size: 32 })
 * // '0x0000000000000000000000000000000000000000000000000000000000000001'
 */
function boolToHex(value, opts = {}) {
    const hex = `0x${Number(value)}`;
    if (typeof opts.size === 'number') {
        (0,_fromHex_js__WEBPACK_IMPORTED_MODULE_0__/* .assertSize */ .Sl)(hex, { size: opts.size });
        return (0,_data_pad_js__WEBPACK_IMPORTED_MODULE_1__/* .pad */ .eV)(hex, { size: opts.size });
    }
    return hex;
}
/**
 * Encodes a bytes array into a hex string
 *
 * - Docs: https://viem.sh/docs/utilities/toHex#bytestohex
 *
 * @param value Value to encode.
 * @param opts Options.
 * @returns Hex value.
 *
 * @example
 * import { bytesToHex } from 'viem'
 * const data = bytesToHex(Uint8Array.from([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
 * // '0x48656c6c6f20576f726c6421'
 *
 * @example
 * import { bytesToHex } from 'viem'
 * const data = bytesToHex(Uint8Array.from([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]), { size: 32 })
 * // '0x48656c6c6f20576f726c64210000000000000000000000000000000000000000'
 */
function bytesToHex(value, opts = {}) {
    let string = '';
    for (let i = 0; i < value.length; i++) {
        string += hexes[value[i]];
    }
    const hex = `0x${string}`;
    if (typeof opts.size === 'number') {
        (0,_fromHex_js__WEBPACK_IMPORTED_MODULE_0__/* .assertSize */ .Sl)(hex, { size: opts.size });
        return (0,_data_pad_js__WEBPACK_IMPORTED_MODULE_1__/* .pad */ .eV)(hex, { dir: 'right', size: opts.size });
    }
    return hex;
}
/**
 * Encodes a number or bigint into a hex string
 *
 * - Docs: https://viem.sh/docs/utilities/toHex#numbertohex
 *
 * @param value Value to encode.
 * @param opts Options.
 * @returns Hex value.
 *
 * @example
 * import { numberToHex } from 'viem'
 * const data = numberToHex(420)
 * // '0x1a4'
 *
 * @example
 * import { numberToHex } from 'viem'
 * const data = numberToHex(420, { size: 32 })
 * // '0x00000000000000000000000000000000000000000000000000000000000001a4'
 */
function numberToHex(value_, opts = {}) {
    const { signed, size } = opts;
    const value = BigInt(value_);
    let maxValue;
    if (size) {
        if (signed)
            maxValue = (1n << (BigInt(size) * 8n - 1n)) - 1n;
        else
            maxValue = 2n ** (BigInt(size) * 8n) - 1n;
    }
    else if (typeof value_ === 'number') {
        maxValue = BigInt(Number.MAX_SAFE_INTEGER);
    }
    const minValue = typeof maxValue === 'bigint' && signed ? -maxValue - 1n : 0;
    if ((maxValue && value > maxValue) || value < minValue) {
        const suffix = typeof value_ === 'bigint' ? 'n' : '';
        throw new _errors_encoding_js__WEBPACK_IMPORTED_MODULE_2__/* .IntegerOutOfRangeError */ .Ty({
            max: maxValue ? `${maxValue}${suffix}` : undefined,
            min: `${minValue}${suffix}`,
            signed,
            size,
            value: `${value_}${suffix}`,
        });
    }
    const hex = `0x${(signed && value < 0
        ? (1n << BigInt(size * 8)) + BigInt(value)
        : value).toString(16)}`;
    if (size)
        return (0,_data_pad_js__WEBPACK_IMPORTED_MODULE_1__/* .pad */ .eV)(hex, { size });
    return hex;
}
const encoder = /*#__PURE__*/ new TextEncoder();
/**
 * Encodes a UTF-8 string into a hex string
 *
 * - Docs: https://viem.sh/docs/utilities/toHex#stringtohex
 *
 * @param value Value to encode.
 * @param opts Options.
 * @returns Hex value.
 *
 * @example
 * import { stringToHex } from 'viem'
 * const data = stringToHex('Hello World!')
 * // '0x48656c6c6f20576f726c6421'
 *
 * @example
 * import { stringToHex } from 'viem'
 * const data = stringToHex('Hello World!', { size: 32 })
 * // '0x48656c6c6f20576f726c64210000000000000000000000000000000000000000'
 */
function stringToHex(value_, opts = {}) {
    const value = encoder.encode(value_);
    return bytesToHex(value, opts);
}
//# sourceMappingURL=toHex.js.map

/***/ }),

/***/ 2350:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   j: () => (/* binding */ getContractError)
/* harmony export */ });
/* harmony import */ var _errors_abi_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7372);
/* harmony import */ var _errors_base_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6329);
/* harmony import */ var _errors_contract_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8863);
/* harmony import */ var _errors_rpc_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7513);




const EXECUTION_REVERTED_ERROR_CODE = 3;
function getContractError(err, { abi, address, args, docsPath, functionName, sender, }) {
    const { code, data, message, shortMessage } = (err instanceof _errors_contract_js__WEBPACK_IMPORTED_MODULE_0__/* .RawContractError */ .$S
        ? err
        : err instanceof _errors_base_js__WEBPACK_IMPORTED_MODULE_1__/* .BaseError */ .C
            ? err.walk((err) => 'data' in err) || err.walk()
            : {});
    const cause = (() => {
        if (err instanceof _errors_abi_js__WEBPACK_IMPORTED_MODULE_2__/* .AbiDecodingZeroDataError */ .O)
            return new _errors_contract_js__WEBPACK_IMPORTED_MODULE_0__/* .ContractFunctionZeroDataError */ .rR({ functionName });
        if ([EXECUTION_REVERTED_ERROR_CODE, _errors_rpc_js__WEBPACK_IMPORTED_MODULE_3__/* .InternalRpcError */ .bq.code].includes(code) &&
            (data || message || shortMessage)) {
            return new _errors_contract_js__WEBPACK_IMPORTED_MODULE_0__/* .ContractFunctionRevertedError */ .M({
                abi,
                data: typeof data === 'object' ? data.data : data,
                functionName,
                message: shortMessage ?? message,
            });
        }
        return err;
    })();
    return new _errors_contract_js__WEBPACK_IMPORTED_MODULE_0__/* .ContractFunctionExecutionError */ .bG(cause, {
        abi,
        args,
        contractAddress: address,
        docsPath,
        functionName,
        sender,
    });
}
//# sourceMappingURL=getContractError.js.map

/***/ }),

/***/ 1772:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   l: () => (/* binding */ getNodeError)
/* harmony export */ });
/* unused harmony export containsNodeError */
/* harmony import */ var _errors_base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6329);
/* harmony import */ var _errors_node_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2592);




function containsNodeError(err) {
    return (err instanceof TransactionRejectedRpcError ||
        err instanceof InvalidInputRpcError ||
        (err instanceof RpcRequestError && err.code === ExecutionRevertedError.code));
}
function getNodeError(err, args) {
    const message = (err.details || '').toLowerCase();
    const executionRevertedError = err instanceof _errors_base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C
        ? err.walk((e) => e.code === _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .ExecutionRevertedError */ .A7.code)
        : err;
    if (executionRevertedError instanceof _errors_base_js__WEBPACK_IMPORTED_MODULE_0__/* .BaseError */ .C) {
        return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .ExecutionRevertedError */ .A7({
            cause: err,
            message: executionRevertedError.details,
        });
    }
    if (_errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .ExecutionRevertedError */ .A7.nodeMessage.test(message))
        return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .ExecutionRevertedError */ .A7({
            cause: err,
            message: err.details,
        });
    if (_errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .FeeCapTooHighError */ .BG.nodeMessage.test(message))
        return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .FeeCapTooHighError */ .BG({
            cause: err,
            maxFeePerGas: args?.maxFeePerGas,
        });
    if (_errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .FeeCapTooLowError */ .jj.nodeMessage.test(message))
        return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .FeeCapTooLowError */ .jj({
            cause: err,
            maxFeePerGas: args?.maxFeePerGas,
        });
    if (_errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .NonceTooHighError */ .K0.nodeMessage.test(message))
        return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .NonceTooHighError */ .K0({ cause: err, nonce: args?.nonce });
    if (_errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .NonceTooLowError */ .Oh.nodeMessage.test(message))
        return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .NonceTooLowError */ .Oh({ cause: err, nonce: args?.nonce });
    if (_errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .NonceMaxValueError */ .vW.nodeMessage.test(message))
        return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .NonceMaxValueError */ .vW({ cause: err, nonce: args?.nonce });
    if (_errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .InsufficientFundsError */ .k5.nodeMessage.test(message))
        return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .InsufficientFundsError */ .k5({ cause: err });
    if (_errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .IntrinsicGasTooHighError */ .lY.nodeMessage.test(message))
        return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .IntrinsicGasTooHighError */ .lY({ cause: err, gas: args?.gas });
    if (_errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .IntrinsicGasTooLowError */ .Fo.nodeMessage.test(message))
        return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .IntrinsicGasTooLowError */ .Fo({ cause: err, gas: args?.gas });
    if (_errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .TransactionTypeNotSupportedError */ .uC.nodeMessage.test(message))
        return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .TransactionTypeNotSupportedError */ .uC({ cause: err });
    if (_errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .TipAboveFeeCapError */ .lN.nodeMessage.test(message))
        return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .TipAboveFeeCapError */ .lN({
            cause: err,
            maxFeePerGas: args?.maxFeePerGas,
            maxPriorityFeePerGas: args?.maxPriorityFeePerGas,
        });
    return new _errors_node_js__WEBPACK_IMPORTED_MODULE_1__/* .UnknownNodeError */ .RM({
        cause: err,
    });
}
//# sourceMappingURL=getNodeError.js.map

/***/ }),

/***/ 3109:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   g: () => (/* binding */ createFilterRequestScope)
/* harmony export */ });
/**
 * Scopes `request` to the filter ID. If the client is a fallback, it will
 * listen for responses and scope the child transport `request` function
 * to the successful filter ID.
 */
function createFilterRequestScope(client, { method }) {
    const requestMap = {};
    if (client.transport.type === 'fallback')
        client.transport.onResponse?.(({ method: method_, response: id, status, transport, }) => {
            if (status === 'success' && method === method_)
                requestMap[id] = transport.request;
        });
    return ((id) => requestMap[id] || client.request);
}
//# sourceMappingURL=createFilterRequestScope.js.map

/***/ }),

/***/ 5385:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $: () => (/* binding */ formatBlock)
/* harmony export */ });
/* unused harmony export defineBlock */
/* harmony import */ var _transaction_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5948);


function formatBlock(block) {
    const transactions = block.transactions?.map((transaction) => {
        if (typeof transaction === 'string')
            return transaction;
        return (0,_transaction_js__WEBPACK_IMPORTED_MODULE_0__/* .formatTransaction */ .uP)(transaction);
    });
    return {
        ...block,
        baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
        blobGasUsed: block.blobGasUsed ? BigInt(block.blobGasUsed) : undefined,
        difficulty: block.difficulty ? BigInt(block.difficulty) : undefined,
        excessBlobGas: block.excessBlobGas
            ? BigInt(block.excessBlobGas)
            : undefined,
        gasLimit: block.gasLimit ? BigInt(block.gasLimit) : undefined,
        gasUsed: block.gasUsed ? BigInt(block.gasUsed) : undefined,
        hash: block.hash ? block.hash : null,
        logsBloom: block.logsBloom ? block.logsBloom : null,
        nonce: block.nonce ? block.nonce : null,
        number: block.number ? BigInt(block.number) : null,
        size: block.size ? BigInt(block.size) : undefined,
        timestamp: block.timestamp ? BigInt(block.timestamp) : undefined,
        transactions,
        totalDifficulty: block.totalDifficulty
            ? BigInt(block.totalDifficulty)
            : null,
    };
}
const defineBlock = /*#__PURE__*/ (/* unused pure expression or super */ null && (defineFormatter('block', formatBlock)));
//# sourceMappingURL=block.js.map

/***/ }),

/***/ 9789:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   o: () => (/* binding */ extract)
/* harmony export */ });
/**
 * @description Picks out the keys from `value` that exist in the formatter..
 */
function extract(value_, { format }) {
    if (!format)
        return {};
    const value = {};
    function extract_(formatted) {
        const keys = Object.keys(formatted);
        for (const key of keys) {
            if (key in value_)
                value[key] = value_[key];
            if (formatted[key] &&
                typeof formatted[key] === 'object' &&
                !Array.isArray(formatted[key]))
                extract_(formatted[key]);
        }
    }
    const formatted = format(value_ || {});
    extract_(formatted);
    return value;
}
//# sourceMappingURL=extract.js.map

/***/ }),

/***/ 7070:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   e: () => (/* binding */ formatLog)
/* harmony export */ });
function formatLog(log, { args, eventName, } = {}) {
    return {
        ...log,
        blockHash: log.blockHash ? log.blockHash : null,
        blockNumber: log.blockNumber ? BigInt(log.blockNumber) : null,
        logIndex: log.logIndex ? Number(log.logIndex) : null,
        transactionHash: log.transactionHash ? log.transactionHash : null,
        transactionIndex: log.transactionIndex
            ? Number(log.transactionIndex)
            : null,
        ...(eventName ? { args, eventName } : {}),
    };
}
//# sourceMappingURL=log.js.map

/***/ }),

/***/ 5948:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   b4: () => (/* binding */ transactionType),
/* harmony export */   uP: () => (/* binding */ formatTransaction)
/* harmony export */ });
/* unused harmony export defineTransaction */
/* harmony import */ var _encoding_fromHex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6675);


const transactionType = {
    '0x0': 'legacy',
    '0x1': 'eip2930',
    '0x2': 'eip1559',
    '0x3': 'eip4844',
};
function formatTransaction(transaction) {
    const transaction_ = {
        ...transaction,
        blockHash: transaction.blockHash ? transaction.blockHash : null,
        blockNumber: transaction.blockNumber
            ? BigInt(transaction.blockNumber)
            : null,
        chainId: transaction.chainId ? (0,_encoding_fromHex_js__WEBPACK_IMPORTED_MODULE_0__/* .hexToNumber */ .ME)(transaction.chainId) : undefined,
        gas: transaction.gas ? BigInt(transaction.gas) : undefined,
        gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : undefined,
        maxFeePerBlobGas: transaction.maxFeePerBlobGas
            ? BigInt(transaction.maxFeePerBlobGas)
            : undefined,
        maxFeePerGas: transaction.maxFeePerGas
            ? BigInt(transaction.maxFeePerGas)
            : undefined,
        maxPriorityFeePerGas: transaction.maxPriorityFeePerGas
            ? BigInt(transaction.maxPriorityFeePerGas)
            : undefined,
        nonce: transaction.nonce ? (0,_encoding_fromHex_js__WEBPACK_IMPORTED_MODULE_0__/* .hexToNumber */ .ME)(transaction.nonce) : undefined,
        to: transaction.to ? transaction.to : null,
        transactionIndex: transaction.transactionIndex
            ? Number(transaction.transactionIndex)
            : null,
        type: transaction.type
            ? transactionType[transaction.type]
            : undefined,
        typeHex: transaction.type ? transaction.type : undefined,
        value: transaction.value ? BigInt(transaction.value) : undefined,
        v: transaction.v ? BigInt(transaction.v) : undefined,
    };
    transaction_.yParity = (() => {
        // If `yParity` is provided, we will use it.
        if (transaction.yParity)
            return Number(transaction.yParity);
        // If no `yParity` provided, try derive from `v`.
        if (typeof transaction_.v === 'bigint') {
            if (transaction_.v === 0n || transaction_.v === 27n)
                return 0;
            if (transaction_.v === 1n || transaction_.v === 28n)
                return 1;
            if (transaction_.v >= 35n)
                return transaction_.v % 2n === 0n ? 1 : 0;
        }
        return undefined;
    })();
    if (transaction_.type === 'legacy') {
        delete transaction_.accessList;
        delete transaction_.maxFeePerBlobGas;
        delete transaction_.maxFeePerGas;
        delete transaction_.maxPriorityFeePerGas;
        delete transaction_.yParity;
    }
    if (transaction_.type === 'eip2930') {
        delete transaction_.maxFeePerBlobGas;
        delete transaction_.maxFeePerGas;
        delete transaction_.maxPriorityFeePerGas;
    }
    if (transaction_.type === 'eip1559') {
        delete transaction_.maxFeePerBlobGas;
    }
    return transaction_;
}
const defineTransaction = /*#__PURE__*/ (/* unused pure expression or super */ null && (defineFormatter('transaction', formatTransaction)));
//# sourceMappingURL=transaction.js.map

/***/ }),

/***/ 7671:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Bv: () => (/* binding */ formatTransactionRequest)
/* harmony export */ });
/* unused harmony exports rpcTransactionType, defineTransactionRequest */
/* harmony import */ var _encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4192);


const rpcTransactionType = {
    legacy: '0x0',
    eip2930: '0x1',
    eip1559: '0x2',
    eip4844: '0x3',
};
function formatTransactionRequest(request) {
    const rpcRequest = {};
    if (typeof request.accessList !== 'undefined')
        rpcRequest.accessList = request.accessList;
    if (typeof request.blobVersionedHashes !== 'undefined')
        rpcRequest.blobVersionedHashes = request.blobVersionedHashes;
    if (typeof request.blobs !== 'undefined') {
        if (typeof request.blobs[0] !== 'string')
            rpcRequest.blobs = request.blobs.map((x) => (0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__/* .bytesToHex */ .My)(x));
        else
            rpcRequest.blobs = request.blobs;
    }
    if (typeof request.data !== 'undefined')
        rpcRequest.data = request.data;
    if (typeof request.from !== 'undefined')
        rpcRequest.from = request.from;
    if (typeof request.gas !== 'undefined')
        rpcRequest.gas = (0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__/* .numberToHex */ .cK)(request.gas);
    if (typeof request.gasPrice !== 'undefined')
        rpcRequest.gasPrice = (0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__/* .numberToHex */ .cK)(request.gasPrice);
    if (typeof request.maxFeePerBlobGas !== 'undefined')
        rpcRequest.maxFeePerBlobGas = (0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__/* .numberToHex */ .cK)(request.maxFeePerBlobGas);
    if (typeof request.maxFeePerGas !== 'undefined')
        rpcRequest.maxFeePerGas = (0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__/* .numberToHex */ .cK)(request.maxFeePerGas);
    if (typeof request.maxPriorityFeePerGas !== 'undefined')
        rpcRequest.maxPriorityFeePerGas = (0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__/* .numberToHex */ .cK)(request.maxPriorityFeePerGas);
    if (typeof request.nonce !== 'undefined')
        rpcRequest.nonce = (0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__/* .numberToHex */ .cK)(request.nonce);
    if (typeof request.to !== 'undefined')
        rpcRequest.to = request.to;
    if (typeof request.type !== 'undefined')
        rpcRequest.type = rpcTransactionType[request.type];
    if (typeof request.value !== 'undefined')
        rpcRequest.value = (0,_encoding_toHex_js__WEBPACK_IMPORTED_MODULE_0__/* .numberToHex */ .cK)(request.value);
    return rpcRequest;
}
const defineTransactionRequest = /*#__PURE__*/ (/* unused pure expression or super */ null && (defineFormatter('transactionRequest', formatTransactionRequest)));
//# sourceMappingURL=transactionRequest.js.map

/***/ }),

/***/ 3692:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   T: () => (/* binding */ getAction)
/* harmony export */ });
/**
 * Retrieves and returns an action from the client (if exists), and falls
 * back to the tree-shakable action.
 *
 * Useful for extracting overridden actions from a client (ie. if a consumer
 * wants to override the `sendTransaction` implementation).
 */
function getAction(client, action, 
// Some minifiers drop `Function.prototype.name`, meaning that `action.name`
// will not work. For that case, the consumer needs to pass the name explicitly.
name) {
    return (params) => client[action.name || name]?.(params) ?? action(client, params);
}
//# sourceMappingURL=getAction.js.map

/***/ }),

/***/ 8729:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  S: () => (/* binding */ keccak256)
});

// EXTERNAL MODULE: ./node_modules/@noble/hashes/esm/_assert.js
var _assert = __webpack_require__(9190);
;// CONCATENATED MODULE: ./node_modules/@noble/hashes/esm/_u64.js
const U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
const _32n = /* @__PURE__ */ BigInt(32);
// We are not using BigUint64Array, because they are extremely slow as per 2022
function fromBig(n, le = false) {
    if (le)
        return { h: Number(n & U32_MASK64), l: Number((n >> _32n) & U32_MASK64) };
    return { h: Number((n >> _32n) & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
    let Ah = new Uint32Array(lst.length);
    let Al = new Uint32Array(lst.length);
    for (let i = 0; i < lst.length; i++) {
        const { h, l } = fromBig(lst[i], le);
        [Ah[i], Al[i]] = [h, l];
    }
    return [Ah, Al];
}
const toBig = (h, l) => (BigInt(h >>> 0) << _32n) | BigInt(l >>> 0);
// for Shift in [0, 32)
const shrSH = (h, _l, s) => h >>> s;
const shrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
// Right rotate for Shift in [1, 32)
const rotrSH = (h, l, s) => (h >>> s) | (l << (32 - s));
const rotrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
// Right rotate for Shift in (32, 64), NOTE: 32 is special case.
const rotrBH = (h, l, s) => (h << (64 - s)) | (l >>> (s - 32));
const rotrBL = (h, l, s) => (h >>> (s - 32)) | (l << (64 - s));
// Right rotate for shift===32 (just swaps l&h)
const rotr32H = (_h, l) => l;
const rotr32L = (h, _l) => h;
// Left rotate for Shift in [1, 32)
const rotlSH = (h, l, s) => (h << s) | (l >>> (32 - s));
const rotlSL = (h, l, s) => (l << s) | (h >>> (32 - s));
// Left rotate for Shift in (32, 64), NOTE: 32 is special case.
const rotlBH = (h, l, s) => (l << (s - 32)) | (h >>> (64 - s));
const rotlBL = (h, l, s) => (h << (s - 32)) | (l >>> (64 - s));
// JS uses 32-bit signed integers for bitwise operations which means we cannot
// simple take carry out of low bit sum by shift, we need to use division.
function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: (Ah + Bh + ((l / 2 ** 32) | 0)) | 0, l: l | 0 };
}
// Addition with more than 2 elements
const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
const add3H = (low, Ah, Bh, Ch) => (Ah + Bh + Ch + ((low / 2 ** 32) | 0)) | 0;
const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
const add4H = (low, Ah, Bh, Ch, Dh) => (Ah + Bh + Ch + Dh + ((low / 2 ** 32) | 0)) | 0;
const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
const add5H = (low, Ah, Bh, Ch, Dh, Eh) => (Ah + Bh + Ch + Dh + Eh + ((low / 2 ** 32) | 0)) | 0;
// prettier-ignore

// prettier-ignore
const u64 = {
    fromBig, split, toBig,
    shrSH, shrSL,
    rotrSH, rotrSL, rotrBH, rotrBL,
    rotr32H, rotr32L,
    rotlSH, rotlSL, rotlBH, rotlBL,
    add, add3L, add3H, add4L, add4H, add5H, add5L,
};
/* harmony default export */ const _u64 = ((/* unused pure expression or super */ null && (u64)));
//# sourceMappingURL=_u64.js.map
// EXTERNAL MODULE: ./node_modules/@noble/hashes/esm/utils.js
var utils = __webpack_require__(4976);
;// CONCATENATED MODULE: ./node_modules/@noble/hashes/esm/sha3.js



// SHA3 (keccak) is based on a new design: basically, the internal state is bigger than output size.
// It's called a sponge function.
// Various per round constants calculations
const [SHA3_PI, SHA3_ROTL, _SHA3_IOTA] = [[], [], []];
const _0n = /* @__PURE__ */ BigInt(0);
const _1n = /* @__PURE__ */ BigInt(1);
const _2n = /* @__PURE__ */ BigInt(2);
const _7n = /* @__PURE__ */ BigInt(7);
const _256n = /* @__PURE__ */ BigInt(256);
const _0x71n = /* @__PURE__ */ BigInt(0x71);
for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
    // Pi
    [x, y] = [y, (2 * x + 3 * y) % 5];
    SHA3_PI.push(2 * (5 * y + x));
    // Rotational
    SHA3_ROTL.push((((round + 1) * (round + 2)) / 2) % 64);
    // Iota
    let t = _0n;
    for (let j = 0; j < 7; j++) {
        R = ((R << _1n) ^ ((R >> _7n) * _0x71n)) % _256n;
        if (R & _2n)
            t ^= _1n << ((_1n << /* @__PURE__ */ BigInt(j)) - _1n);
    }
    _SHA3_IOTA.push(t);
}
const [SHA3_IOTA_H, SHA3_IOTA_L] = /* @__PURE__ */ split(_SHA3_IOTA, true);
// Left rotation (without 0, 32, 64)
const rotlH = (h, l, s) => (s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s));
const rotlL = (h, l, s) => (s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s));
// Same as keccakf1600, but allows to skip some rounds
function keccakP(s, rounds = 24) {
    const B = new Uint32Array(5 * 2);
    // NOTE: all indices are x2 since we store state as u32 instead of u64 (bigints to slow in js)
    for (let round = 24 - rounds; round < 24; round++) {
        // Theta θ
        for (let x = 0; x < 10; x++)
            B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
        for (let x = 0; x < 10; x += 2) {
            const idx1 = (x + 8) % 10;
            const idx0 = (x + 2) % 10;
            const B0 = B[idx0];
            const B1 = B[idx0 + 1];
            const Th = rotlH(B0, B1, 1) ^ B[idx1];
            const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
            for (let y = 0; y < 50; y += 10) {
                s[x + y] ^= Th;
                s[x + y + 1] ^= Tl;
            }
        }
        // Rho (ρ) and Pi (π)
        let curH = s[2];
        let curL = s[3];
        for (let t = 0; t < 24; t++) {
            const shift = SHA3_ROTL[t];
            const Th = rotlH(curH, curL, shift);
            const Tl = rotlL(curH, curL, shift);
            const PI = SHA3_PI[t];
            curH = s[PI];
            curL = s[PI + 1];
            s[PI] = Th;
            s[PI + 1] = Tl;
        }
        // Chi (χ)
        for (let y = 0; y < 50; y += 10) {
            for (let x = 0; x < 10; x++)
                B[x] = s[y + x];
            for (let x = 0; x < 10; x++)
                s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
        }
        // Iota (ι)
        s[0] ^= SHA3_IOTA_H[round];
        s[1] ^= SHA3_IOTA_L[round];
    }
    B.fill(0);
}
class Keccak extends utils/* Hash */.Vw {
    // NOTE: we accept arguments in bytes instead of bits here.
    constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
        super();
        this.blockLen = blockLen;
        this.suffix = suffix;
        this.outputLen = outputLen;
        this.enableXOF = enableXOF;
        this.rounds = rounds;
        this.pos = 0;
        this.posOut = 0;
        this.finished = false;
        this.destroyed = false;
        // Can be passed from user as dkLen
        (0,_assert/* number */.ai)(outputLen);
        // 1600 = 5x5 matrix of 64bit.  1600 bits === 200 bytes
        if (0 >= this.blockLen || this.blockLen >= 200)
            throw new Error('Sha3 supports only keccak-f1600 function');
        this.state = new Uint8Array(200);
        this.state32 = (0,utils/* u32 */.DH)(this.state);
    }
    keccak() {
        keccakP(this.state32, this.rounds);
        this.posOut = 0;
        this.pos = 0;
    }
    update(data) {
        (0,_assert/* exists */.t2)(this);
        const { blockLen, state } = this;
        data = (0,utils/* toBytes */.ZJ)(data);
        const len = data.length;
        for (let pos = 0; pos < len;) {
            const take = Math.min(blockLen - this.pos, len - pos);
            for (let i = 0; i < take; i++)
                state[this.pos++] ^= data[pos++];
            if (this.pos === blockLen)
                this.keccak();
        }
        return this;
    }
    finish() {
        if (this.finished)
            return;
        this.finished = true;
        const { state, suffix, pos, blockLen } = this;
        // Do the padding
        state[pos] ^= suffix;
        if ((suffix & 0x80) !== 0 && pos === blockLen - 1)
            this.keccak();
        state[blockLen - 1] ^= 0x80;
        this.keccak();
    }
    writeInto(out) {
        (0,_assert/* exists */.t2)(this, false);
        (0,_assert/* bytes */.ee)(out);
        this.finish();
        const bufferOut = this.state;
        const { blockLen } = this;
        for (let pos = 0, len = out.length; pos < len;) {
            if (this.posOut >= blockLen)
                this.keccak();
            const take = Math.min(blockLen - this.posOut, len - pos);
            out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
            this.posOut += take;
            pos += take;
        }
        return out;
    }
    xofInto(out) {
        // Sha3/Keccak usage with XOF is probably mistake, only SHAKE instances can do XOF
        if (!this.enableXOF)
            throw new Error('XOF is not possible for this instance');
        return this.writeInto(out);
    }
    xof(bytes) {
        (0,_assert/* number */.ai)(bytes);
        return this.xofInto(new Uint8Array(bytes));
    }
    digestInto(out) {
        (0,_assert/* output */.CG)(out, this);
        if (this.finished)
            throw new Error('digest() was already called');
        this.writeInto(out);
        this.destroy();
        return out;
    }
    digest() {
        return this.digestInto(new Uint8Array(this.outputLen));
    }
    destroy() {
        this.destroyed = true;
        this.state.fill(0);
    }
    _cloneInto(to) {
        const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
        to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
        to.state32.set(this.state32);
        to.pos = this.pos;
        to.posOut = this.posOut;
        to.finished = this.finished;
        to.rounds = rounds;
        // Suffix can change in cSHAKE
        to.suffix = suffix;
        to.outputLen = outputLen;
        to.enableXOF = enableXOF;
        to.destroyed = this.destroyed;
        return to;
    }
}
const gen = (suffix, blockLen, outputLen) => (0,utils/* wrapConstructor */.ld)(() => new Keccak(blockLen, suffix, outputLen));
const sha3_224 = /* @__PURE__ */ (/* unused pure expression or super */ null && (gen(0x06, 144, 224 / 8)));
/**
 * SHA3-256 hash function
 * @param message - that would be hashed
 */
const sha3_256 = /* @__PURE__ */ (/* unused pure expression or super */ null && (gen(0x06, 136, 256 / 8)));
const sha3_384 = /* @__PURE__ */ (/* unused pure expression or super */ null && (gen(0x06, 104, 384 / 8)));
const sha3_512 = /* @__PURE__ */ (/* unused pure expression or super */ null && (gen(0x06, 72, 512 / 8)));
const keccak_224 = /* @__PURE__ */ (/* unused pure expression or super */ null && (gen(0x01, 144, 224 / 8)));
/**
 * keccak-256 hash function. Different from SHA3-256.
 * @param message - that would be hashed
 */
const keccak_256 = /* @__PURE__ */ gen(0x01, 136, 256 / 8);
const keccak_384 = /* @__PURE__ */ (/* unused pure expression or super */ null && (gen(0x01, 104, 384 / 8)));
const keccak_512 = /* @__PURE__ */ (/* unused pure expression or super */ null && (gen(0x01, 72, 512 / 8)));
const genShake = (suffix, blockLen, outputLen) => wrapXOFConstructorWithOpts((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === undefined ? outputLen : opts.dkLen, true));
const shake128 = /* @__PURE__ */ (/* unused pure expression or super */ null && (genShake(0x1f, 168, 128 / 8)));
const shake256 = /* @__PURE__ */ (/* unused pure expression or super */ null && (genShake(0x1f, 136, 256 / 8)));
//# sourceMappingURL=sha3.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/isHex.js
var isHex = __webpack_require__(6394);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toBytes.js
var toBytes = __webpack_require__(4706);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toHex.js
var toHex = __webpack_require__(4192);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/hash/keccak256.js




function keccak256(value, to_) {
    const to = to_ || 'hex';
    const bytes = keccak_256((0,isHex/* isHex */.q)(value, { strict: false }) ? (0,toBytes/* toBytes */.ZJ)(value) : value);
    if (to === 'bytes')
        return bytes;
    return (0,toHex/* toHex */.nj)(bytes);
}
//# sourceMappingURL=keccak256.js.map

/***/ }),

/***/ 9777:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   h: () => (/* binding */ toEventSelector)
/* harmony export */ });
/* harmony import */ var _toSignatureHash_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(504);

/**
 * Returns the event selector for a given event definition.
 *
 * @example
 * const selector = toEventSelector('Transfer(address indexed from, address indexed to, uint256 amount)')
 * // 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
 */
const toEventSelector = _toSignatureHash_js__WEBPACK_IMPORTED_MODULE_0__/* .toSignatureHash */ .k;
//# sourceMappingURL=toEventSelector.js.map

/***/ }),

/***/ 2599:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   V: () => (/* binding */ toFunctionSelector)
/* harmony export */ });
/* harmony import */ var _data_slice_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3577);
/* harmony import */ var _toSignatureHash_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(504);


/**
 * Returns the function selector for a given function definition.
 *
 * @example
 * const selector = toFunctionSelector('function ownerOf(uint256 tokenId)')
 * // 0x6352211e
 */
const toFunctionSelector = (fn) => (0,_data_slice_js__WEBPACK_IMPORTED_MODULE_0__/* .slice */ .di)((0,_toSignatureHash_js__WEBPACK_IMPORTED_MODULE_1__/* .toSignatureHash */ .k)(fn), 0, 4);
//# sourceMappingURL=toFunctionSelector.js.map

/***/ }),

/***/ 504:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  k: () => (/* binding */ toSignatureHash)
});

// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toBytes.js
var toBytes = __webpack_require__(4706);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/hash/keccak256.js + 2 modules
var keccak256 = __webpack_require__(8729);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/hash/hashSignature.js


const hash = (value) => (0,keccak256/* keccak256 */.S)((0,toBytes/* toBytes */.ZJ)(value));
function hashSignature(sig) {
    return hash(sig);
}
//# sourceMappingURL=hashSignature.js.map
// EXTERNAL MODULE: ./node_modules/abitype/dist/esm/regex.js
var regex = __webpack_require__(5276);
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js

// https://regexr.com/7f7rv
const tupleRegex = /^tuple(?<array>(\[(\d*)\])*)$/;
/**
 * Formats {@link AbiParameter} to human-readable ABI parameter.
 *
 * @param abiParameter - ABI parameter
 * @returns Human-readable ABI parameter
 *
 * @example
 * const result = formatAbiParameter({ type: 'address', name: 'from' })
 * //    ^? const result: 'address from'
 */
function formatAbiParameter(abiParameter) {
    let type = abiParameter.type;
    if (tupleRegex.test(abiParameter.type) && 'components' in abiParameter) {
        type = '(';
        const length = abiParameter.components.length;
        for (let i = 0; i < length; i++) {
            const component = abiParameter.components[i];
            type += formatAbiParameter(component);
            if (i < length - 1)
                type += ', ';
        }
        const result = (0,regex/* execTyped */.Yv)(tupleRegex, abiParameter.type);
        type += `)${result?.array ?? ''}`;
        return formatAbiParameter({
            ...abiParameter,
            type,
        });
    }
    // Add `indexed` to type if in `abiParameter`
    if ('indexed' in abiParameter && abiParameter.indexed)
        type = `${type} indexed`;
    // Return human-readable ABI parameter
    if (abiParameter.name)
        return `${type} ${abiParameter.name}`;
    return type;
}
//# sourceMappingURL=formatAbiParameter.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js

/**
 * Formats {@link AbiParameter}s to human-readable ABI parameters.
 *
 * @param abiParameters - ABI parameters
 * @returns Human-readable ABI parameters
 *
 * @example
 * const result = formatAbiParameters([
 *   //  ^? const result: 'address from, uint256 tokenId'
 *   { type: 'address', name: 'from' },
 *   { type: 'uint256', name: 'tokenId' },
 * ])
 */
function formatAbiParameters(abiParameters) {
    let params = '';
    const length = abiParameters.length;
    for (let i = 0; i < length; i++) {
        const abiParameter = abiParameters[i];
        params += formatAbiParameter(abiParameter);
        if (i !== length - 1)
            params += ', ';
    }
    return params;
}
//# sourceMappingURL=formatAbiParameters.js.map
;// CONCATENATED MODULE: ./node_modules/abitype/dist/esm/human-readable/formatAbiItem.js

/**
 * Formats ABI item (e.g. error, event, function) into human-readable ABI item
 *
 * @param abiItem - ABI item
 * @returns Human-readable ABI item
 */
function formatAbiItem(abiItem) {
    if (abiItem.type === 'function')
        return `function ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability && abiItem.stateMutability !== 'nonpayable'
            ? ` ${abiItem.stateMutability}`
            : ''}${abiItem.outputs.length
            ? ` returns (${formatAbiParameters(abiItem.outputs)})`
            : ''}`;
    else if (abiItem.type === 'event')
        return `event ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
    else if (abiItem.type === 'error')
        return `error ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
    else if (abiItem.type === 'constructor')
        return `constructor(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability === 'payable' ? ' payable' : ''}`;
    else if (abiItem.type === 'fallback')
        return 'fallback()';
    return 'receive() external payable';
}
//# sourceMappingURL=formatAbiItem.js.map
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/base.js
var base = __webpack_require__(6329);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/hash/normalizeSignature.js

function normalizeSignature(signature) {
    let active = true;
    let current = '';
    let level = 0;
    let result = '';
    let valid = false;
    for (let i = 0; i < signature.length; i++) {
        const char = signature[i];
        // If the character is a separator, we want to reactivate.
        if (['(', ')', ','].includes(char))
            active = true;
        // If the character is a "level" token, we want to increment/decrement.
        if (char === '(')
            level++;
        if (char === ')')
            level--;
        // If we aren't active, we don't want to mutate the result.
        if (!active)
            continue;
        // If level === 0, we are at the definition level.
        if (level === 0) {
            if (char === ' ' && ['event', 'function', ''].includes(result))
                result = '';
            else {
                result += char;
                // If we are at the end of the definition, we must be finished.
                if (char === ')') {
                    valid = true;
                    break;
                }
            }
            continue;
        }
        // Ignore spaces
        if (char === ' ') {
            // If the previous character is a separator, and the current section isn't empty, we want to deactivate.
            if (signature[i - 1] !== ',' && current !== ',' && current !== ',(') {
                current = '';
                active = false;
            }
            continue;
        }
        result += char;
        current += char;
    }
    if (!valid)
        throw new base/* BaseError */.C('Unable to normalize signature.');
    return result;
}
//# sourceMappingURL=normalizeSignature.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/hash/toSignature.js


/**
 * Returns the signature for a given function or event definition.
 *
 * @example
 * const signature = toSignature('function ownerOf(uint256 tokenId)')
 * // 'ownerOf(uint256)'
 *
 * @example
 * const signature_3 = toSignature({
 *   name: 'ownerOf',
 *   type: 'function',
 *   inputs: [{ name: 'tokenId', type: 'uint256' }],
 *   outputs: [],
 *   stateMutability: 'view',
 * })
 * // 'ownerOf(uint256)'
 */
const toSignature = (def) => {
    const def_ = (() => {
        if (typeof def === 'string')
            return def;
        return formatAbiItem(def);
    })();
    return normalizeSignature(def_);
};
//# sourceMappingURL=toSignature.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/hash/toSignatureHash.js


/**
 * Returns the hash (of the function/event signature) for a given event or function definition.
 */
function toSignatureHash(fn) {
    return hashSignature(toSignature(fn));
}
//# sourceMappingURL=toSignatureHash.js.map

/***/ }),

/***/ 9726:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   lB: () => (/* binding */ observe)
/* harmony export */ });
/* unused harmony exports listenersCache, cleanupCache */
const listenersCache = /*#__PURE__*/ new Map();
const cleanupCache = /*#__PURE__*/ new Map();
let callbackCount = 0;
/**
 * @description Sets up an observer for a given function. If another function
 * is set up under the same observer id, the function will only be called once
 * for both instances of the observer.
 */
function observe(observerId, callbacks, fn) {
    const callbackId = ++callbackCount;
    const getListeners = () => listenersCache.get(observerId) || [];
    const unsubscribe = () => {
        const listeners = getListeners();
        listenersCache.set(observerId, listeners.filter((cb) => cb.id !== callbackId));
    };
    const unwatch = () => {
        const cleanup = cleanupCache.get(observerId);
        if (getListeners().length === 1 && cleanup)
            cleanup();
        unsubscribe();
    };
    const listeners = getListeners();
    listenersCache.set(observerId, [
        ...listeners,
        { id: callbackId, fns: callbacks },
    ]);
    if (listeners && listeners.length > 0)
        return unwatch;
    const emit = {};
    for (const key in callbacks) {
        emit[key] = ((...args) => {
            const listeners = getListeners();
            if (listeners.length === 0)
                return;
            for (const listener of listeners)
                listener.fns[key]?.(...args);
        });
    }
    const cleanup = fn(emit);
    if (typeof cleanup === 'function')
        cleanupCache.set(observerId, cleanup);
    return unwatch;
}
//# sourceMappingURL=observe.js.map

/***/ }),

/***/ 5213:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   w: () => (/* binding */ poll)
/* harmony export */ });
/* harmony import */ var _wait_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(669);

/**
 * @description Polls a function at a specified interval.
 */
function poll(fn, { emitOnBegin, initialWaitTime, interval }) {
    let active = true;
    const unwatch = () => (active = false);
    const watch = async () => {
        let data = undefined;
        if (emitOnBegin)
            data = await fn({ unpoll: unwatch });
        const initialWait = (await initialWaitTime?.(data)) ?? interval;
        await (0,_wait_js__WEBPACK_IMPORTED_MODULE_0__/* .wait */ .u)(initialWait);
        const poll = async () => {
            if (!active)
                return;
            await fn({ unpoll: unwatch });
            await (0,_wait_js__WEBPACK_IMPORTED_MODULE_0__/* .wait */ .u)(interval);
            poll();
        };
        poll();
    };
    watch();
    return unwatch;
}
//# sourceMappingURL=poll.js.map

/***/ }),

/***/ 2167:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   u: () => (/* binding */ createBatchScheduler)
/* harmony export */ });
const schedulerCache = /*#__PURE__*/ new Map();
function createBatchScheduler({ fn, id, shouldSplitBatch, wait = 0, sort, }) {
    const exec = async () => {
        const scheduler = getScheduler();
        flush();
        const args = scheduler.map(({ args }) => args);
        if (args.length === 0)
            return;
        fn(args)
            .then((data) => {
            if (sort && Array.isArray(data))
                data.sort(sort);
            for (let i = 0; i < scheduler.length; i++) {
                const { pendingPromise } = scheduler[i];
                pendingPromise.resolve?.([data[i], data]);
            }
        })
            .catch((err) => {
            for (let i = 0; i < scheduler.length; i++) {
                const { pendingPromise } = scheduler[i];
                pendingPromise.reject?.(err);
            }
        });
    };
    const flush = () => schedulerCache.delete(id);
    const getBatchedArgs = () => getScheduler().map(({ args }) => args);
    const getScheduler = () => schedulerCache.get(id) || [];
    const setScheduler = (item) => schedulerCache.set(id, [...getScheduler(), item]);
    return {
        flush,
        async schedule(args) {
            const pendingPromise = {};
            const promise = new Promise((resolve, reject) => {
                pendingPromise.resolve = resolve;
                pendingPromise.reject = reject;
            });
            const split = shouldSplitBatch?.([...getBatchedArgs(), args]);
            if (split)
                exec();
            const hasActiveScheduler = getScheduler().length > 0;
            if (hasActiveScheduler) {
                setScheduler({ args, pendingPromise });
                return promise;
            }
            setScheduler({ args, pendingPromise });
            setTimeout(exec, wait);
            return promise;
        },
    };
}
//# sourceMappingURL=createBatchScheduler.js.map

/***/ }),

/***/ 9910:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   b: () => (/* binding */ withRetry)
/* harmony export */ });
/* harmony import */ var _wait_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(669);

function withRetry(fn, { delay: delay_ = 100, retryCount = 2, shouldRetry = () => true, } = {}) {
    return new Promise((resolve, reject) => {
        const attemptRetry = async ({ count = 0 } = {}) => {
            const retry = async ({ error }) => {
                const delay = typeof delay_ === 'function' ? delay_({ count, error }) : delay_;
                if (delay)
                    await (0,_wait_js__WEBPACK_IMPORTED_MODULE_0__/* .wait */ .u)(delay);
                attemptRetry({ count: count + 1 });
            };
            try {
                const data = await fn();
                resolve(data);
            }
            catch (err) {
                if (count < retryCount &&
                    (await shouldRetry({ count, error: err })))
                    return retry({ error: err });
                reject(err);
            }
        };
        attemptRetry();
    });
}
//# sourceMappingURL=withRetry.js.map

/***/ }),

/***/ 8463:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ stringify)
/* harmony export */ });
const stringify = (value, replacer, space) => JSON.stringify(value, (key, value_) => {
    const value = typeof value_ === 'bigint' ? value_.toString() : value_;
    return typeof replacer === 'function' ? replacer(key, value) : value;
}, space);
//# sourceMappingURL=stringify.js.map

/***/ }),

/***/ 5414:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   c: () => (/* binding */ assertRequest)
/* harmony export */ });
/* harmony import */ var _accounts_utils_parseAccount_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3033);
/* harmony import */ var _errors_address_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4306);
/* harmony import */ var _errors_node_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2592);
/* harmony import */ var _errors_transaction_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8990);
/* harmony import */ var _address_isAddress_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1657);





function assertRequest(args) {
    const { account: account_, gasPrice, maxFeePerGas, maxPriorityFeePerGas, to, } = args;
    const account = account_ ? (0,_accounts_utils_parseAccount_js__WEBPACK_IMPORTED_MODULE_0__/* .parseAccount */ .J)(account_) : undefined;
    if (account && !(0,_address_isAddress_js__WEBPACK_IMPORTED_MODULE_1__/* .isAddress */ .P)(account.address))
        throw new _errors_address_js__WEBPACK_IMPORTED_MODULE_2__/* .InvalidAddressError */ .M({ address: account.address });
    if (to && !(0,_address_isAddress_js__WEBPACK_IMPORTED_MODULE_1__/* .isAddress */ .P)(to))
        throw new _errors_address_js__WEBPACK_IMPORTED_MODULE_2__/* .InvalidAddressError */ .M({ address: to });
    if (typeof gasPrice !== 'undefined' &&
        (typeof maxFeePerGas !== 'undefined' ||
            typeof maxPriorityFeePerGas !== 'undefined'))
        throw new _errors_transaction_js__WEBPACK_IMPORTED_MODULE_3__/* .FeeConflictError */ .n3();
    if (maxFeePerGas && maxFeePerGas > 2n ** 256n - 1n)
        throw new _errors_node_js__WEBPACK_IMPORTED_MODULE_4__/* .FeeCapTooHighError */ .BG({ maxFeePerGas });
    if (maxPriorityFeePerGas &&
        maxFeePerGas &&
        maxPriorityFeePerGas > maxFeePerGas)
        throw new _errors_node_js__WEBPACK_IMPORTED_MODULE_4__/* .TipAboveFeeCapError */ .lN({ maxFeePerGas, maxPriorityFeePerGas });
}
//# sourceMappingURL=assertRequest.js.map

/***/ }),

/***/ 988:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  H4: () => (/* binding */ getTypesForEIP712Domain),
  $$: () => (/* binding */ validateTypedData)
});

// UNUSED EXPORTS: domainSeparator

// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/abi.js
var abi = __webpack_require__(7372);
// EXTERNAL MODULE: ./node_modules/viem/_esm/errors/address.js
var address = __webpack_require__(4306);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/address/isAddress.js + 1 modules
var isAddress = __webpack_require__(1657);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/data/size.js
var size = __webpack_require__(5182);
// EXTERNAL MODULE: ./node_modules/viem/_esm/utils/encoding/toHex.js
var toHex = __webpack_require__(4192);
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/regex.js
const arrayRegex = /^(.*)\[([0-9]*)\]$/;
// `bytes<M>`: binary type of `M` bytes, `0 < M <= 32`
// https://regexr.com/6va55
const bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
// `(u)int<M>`: (un)signed integer type of `M` bits, `0 < M <= 256`, `M % 8 == 0`
// https://regexr.com/6v8hp
const integerRegex = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
//# sourceMappingURL=regex.js.map
;// CONCATENATED MODULE: ./node_modules/viem/_esm/utils/typedData.js







function validateTypedData(parameters) {
    const { domain, message, primaryType, types } = parameters;
    const validateData = (struct, data) => {
        for (const param of struct) {
            const { name, type } = param;
            const value = data[name];
            const integerMatch = type.match(integerRegex);
            if (integerMatch &&
                (typeof value === 'number' || typeof value === 'bigint')) {
                const [_type, base, size_] = integerMatch;
                // If number cannot be cast to a sized hex value, it is out of range
                // and will throw.
                (0,toHex/* numberToHex */.cK)(value, {
                    signed: base === 'int',
                    size: parseInt(size_) / 8,
                });
            }
            if (type === 'address' && typeof value === 'string' && !(0,isAddress/* isAddress */.P)(value))
                throw new address/* InvalidAddressError */.M({ address: value });
            const bytesMatch = type.match(bytesRegex);
            if (bytesMatch) {
                const [_type, size_] = bytesMatch;
                if (size_ && (0,size/* size */.E)(value) !== parseInt(size_))
                    throw new abi/* BytesSizeMismatchError */.BI({
                        expectedSize: parseInt(size_),
                        givenSize: (0,size/* size */.E)(value),
                    });
            }
            const struct = types[type];
            if (struct)
                validateData(struct, value);
        }
    };
    // Validate domain types.
    if (types.EIP712Domain && domain)
        validateData(types.EIP712Domain, domain);
    if (primaryType !== 'EIP712Domain') {
        // Validate message types.
        const type = types[primaryType];
        validateData(type, message);
    }
}
function getTypesForEIP712Domain({ domain, }) {
    return [
        typeof domain?.name === 'string' && { name: 'name', type: 'string' },
        domain?.version && { name: 'version', type: 'string' },
        typeof domain?.chainId === 'number' && {
            name: 'chainId',
            type: 'uint256',
        },
        domain?.verifyingContract && {
            name: 'verifyingContract',
            type: 'address',
        },
        domain?.salt && { name: 'salt', type: 'bytes32' },
    ].filter(Boolean);
}
function domainSeparator({ domain }) {
    return hashDomain({
        domain,
        types: {
            EIP712Domain: getTypesForEIP712Domain({ domain }),
        },
    });
}
//# sourceMappingURL=typedData.js.map

/***/ }),

/***/ 9436:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   c: () => (/* binding */ formatEther)
/* harmony export */ });
/* harmony import */ var _constants_unit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(638);
/* harmony import */ var _formatUnits_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7135);


/**
 * Converts numerical wei to a string representation of ether.
 *
 * - Docs: https://viem.sh/docs/utilities/formatEther
 *
 * @example
 * import { formatEther } from 'viem'
 *
 * formatEther(1000000000000000000n)
 * // '1'
 */
function formatEther(wei, unit = 'wei') {
    return (0,_formatUnits_js__WEBPACK_IMPORTED_MODULE_0__/* .formatUnits */ .J)(wei, _constants_unit_js__WEBPACK_IMPORTED_MODULE_1__/* .etherUnits */ .eL[unit]);
}
//# sourceMappingURL=formatEther.js.map

/***/ }),

/***/ 9670:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Q: () => (/* binding */ formatGwei)
/* harmony export */ });
/* harmony import */ var _constants_unit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(638);
/* harmony import */ var _formatUnits_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7135);


/**
 * Converts numerical wei to a string representation of gwei.
 *
 * - Docs: https://viem.sh/docs/utilities/formatGwei
 *
 * @example
 * import { formatGwei } from 'viem'
 *
 * formatGwei(1000000000n)
 * // '1'
 */
function formatGwei(wei, unit = 'wei') {
    return (0,_formatUnits_js__WEBPACK_IMPORTED_MODULE_0__/* .formatUnits */ .J)(wei, _constants_unit_js__WEBPACK_IMPORTED_MODULE_1__/* .gweiUnits */ .sz[unit]);
}
//# sourceMappingURL=formatGwei.js.map

/***/ }),

/***/ 7135:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   J: () => (/* binding */ formatUnits)
/* harmony export */ });
/**
 *  Divides a number by a given exponent of base 10 (10exponent), and formats it into a string representation of the number..
 *
 * - Docs: https://viem.sh/docs/utilities/formatUnits
 *
 * @example
 * import { formatUnits } from 'viem'
 *
 * formatUnits(420000000000n, 9)
 * // '420'
 */
function formatUnits(value, decimals) {
    let display = value.toString();
    const negative = display.startsWith('-');
    if (negative)
        display = display.slice(1);
    display = display.padStart(decimals, '0');
    let [integer, fraction] = [
        display.slice(0, display.length - decimals),
        display.slice(display.length - decimals),
    ];
    fraction = fraction.replace(/(0+)$/, '');
    return `${negative ? '-' : ''}${integer || '0'}${fraction ? `.${fraction}` : ''}`;
}
//# sourceMappingURL=formatUnits.js.map

/***/ }),

/***/ 669:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   u: () => (/* binding */ wait)
/* harmony export */ });
async function wait(time) {
    return new Promise((res) => setTimeout(res, time));
}
//# sourceMappingURL=wait.js.map

/***/ })

}]);