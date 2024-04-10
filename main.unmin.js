/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 7091:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var viem__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3992);
/* harmony import */ var viem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5387);
/* harmony import */ var viem__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2427);
/* harmony import */ var viem__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1298);
/* harmony import */ var viem__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2381);
/* harmony import */ var viem_chains__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2403);





const feedAddr = '0x0000000000000000000000000000000000000000'
const comptrollerAddr = '0x0000000000000000000000000000000000000000'
const ctlxyEthAddr = '0x0000000000000000000000000000000000000000'
const ctlxyCtlxyUsdAddr = '0x0000000000000000000000000000000000000000'
const ctlxyUsdAddr = '0x0000000000000000000000000000000000000000'
const ctlxyUsdFacilityAddr = '0x0000000000000000000000000000000000000000'
const ctlxyEthInterestRateAddr = '0x0000000000000000000000000000000000000000'
const ctlxyCtlxyUsdInterestRateAddr = '0x0000000000000000000000000000000000000000'
const wethAddr = '0x0000000000000000000000000000000000000000'
const wstethAddr = '0x0000000000000000000000000000000000000000'

const feedAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)([

])

const comptrollerAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)([

])

const ctlxyTokenAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)([

])

const ctlxyUsdAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)([

])

const jumpRateModelAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)([

])

const wethAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)([

])

const ctlxyUsdFacilityAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)([

])

const $ = document.querySelector.bind(document);
const ERR_ACCT = '0x' + '1'.repeat(40);

let account, transport, publicClient, walletClient
let comptroller, ctlxyEth, ctlxyCtlxyUsd, ctlxyUsdFacility, ctlxyUsd, weth, feed
let store = {}
let chain = viem_chains__WEBPACK_IMPORTED_MODULE_1__/* .sepolia */ .G

const updateCatallaxyStats = async () => {

}

const updateHook = async () => { 
    reset()
}

const updateUni = async () => {

}

const valueNFTs = async (nfts) => {

}



const simpleConnect = async () => {
    let _account, _transport
    try {

        console.log("window.eth", window.ethereum)

        if (!window.ethereum) throw new Error();
        [_account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        _transport = (0,viem__WEBPACK_IMPORTED_MODULE_2__/* .custom */ .I)(window.ethereum)

    } catch (error) {
        _account = ERR_ACCT
        _transport = (0,viem__WEBPACK_IMPORTED_MODULE_3__/* .http */ .L)()
        $('#connectionError').style.display = "block"
    }
    return [_account, _transport]
}

window.onload = async () => {

    console.log("loading");

    [account, transport] = await simpleConnect();
    walletClient = (0,viem__WEBPACK_IMPORTED_MODULE_4__/* .createWalletClient */ .F)({ account, chain: chain, transport })
    publicClient = (0,viem__WEBPACK_IMPORTED_MODULE_5__/* .createPublicClient */ .l)({ batch: { multicall: true }, chain: chain, transport })

    const _client = {public: publicClient, wallet: walletClient}

    // weth = getContract({ address: wethAddr, abi: wethAbi, client: _client })
    // ctlxyUsd = getContract({ addresss: ctlxyUsdAddr, abi: ctlxyUsdAbi, client: _client })
    // feed = getContract({ address: feedAddr, abi: feedAbi, client: _client })



}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		// The chunk loading function for additional chunks
/******/ 		// Since all referenced chunks are already included
/******/ 		// in this file, this function is empty here.
/******/ 		__webpack_require__.e = () => (Promise.resolve());
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			792: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkcatallaxy_view"] = self["webpackChunkcatallaxy_view"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [520], () => (__webpack_require__(7091)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;