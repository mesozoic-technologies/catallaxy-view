/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 7091:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var viem__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3992);
/* harmony import */ var viem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5387);
/* harmony import */ var viem__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2427);
/* harmony import */ var viem__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4928);
/* harmony import */ var viem__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(6166);
/* harmony import */ var viem__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(718);
/* harmony import */ var viem_chains__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2403);





const FAUCET_WETH="0x05A5e11F6cb8b0BE8898A7ae21407f8D6e7f6fAE"
const CATALLAXY_SOVEREIGN="0x9b3468120872287868f1Fadd55ea369624EbdfE9"
const CTLXY_USD="0xee5E23Fb9364CeA4620FD8121fC213A54f97ad84"
const CTLXY_USD_INTEREST_RATE="0xC826d2099967Cd9e15f5d3F5825ca1C3cE8216d7"
const CTLXY_ETH_INTEREST_RATE="0x713af1bBa747796B18eC20a42D28208E14da406C"
const CTLXY_CTLXY_USD_INTEREST_RATE="0xeDaF1e44de13eff2D4830F75dEeC10a1C0021e2C"
const CATALLAXY_COMPTROLLER="0x79549588eF8a67e84c339062AF74D1B4BB5572e5"
const CTLXY_CTLXY_USD="0x8Bfe66EA5361d9357255e52219b626181B2A4622"
const CTLXY_ETH="0xdCaBB4336Fe4BfC97754E79082927dE5B53C008A"
const CTLXY_USD_FACILITY="0x993C7218C535589f5683D03Aa3cC485873B108d4"
const CATALLAXY_FEED="0x16C06d4D1e63f070FCD786805AF6F7C2dd729aDC"

const erc20 = [
    "function allowance(address,address) view returns (uint)",
    "function approve(address,uint256)",
    "function balanceOf(address) view returns(uint)",
    "function name()",
    "function symbol()",
    "function totalSupply()",
    "function transfer(address,uint256)",
    "function transferFrom(address,address,uint256)"
]

const feedAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)([
    "function MAX_INTEGER()",
    "function MAX_TOKENS()",
    "function getTokenConfig(uint256)",
    "function getTokenConfigByCToken(address)",
    "function getTokenConfigByReporter(address)",
    "function getTokenConfigBySymbol(string)",
    "function getTokenConfigBySymbolHash(bytes32)",
    "function getTokenConfigByUnderlying(address)",
    "function getUnderlyingPrice(address)",
    "function numTokens()",
    "function price(string)",
])

const comptrollerAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)([
    "function accountAssets(address,uint256)",
    "function allMarkets(uint256)",
    "function borrowAllowed(address,address,uint256)",
    "function borrowGuardianPaused(address)",
    "function closeFactor()",
    "function enterMarkets(address[])",
    "function exitMarket(address)",
    "function feed()",
    "function initialize(address)",
    "function liquidateBorrowAllowed(address,address,address,address,uint256)",
    "function liquidateCalculateSeizeTokens(address,address,uint256)",
    "function liquidationIncentive()",
    "function markets(address)",
    "function maxAssets()",
    "function mintAllowed(address,address,uint256)",
    "function mintGuardianPaused(address)",
    "function owner()",
    "function redeemAllowed(address,address,uint256)",
    "function renounceOwnership()",
    "function repayBorrowAllowed(address,address,address,uint256)",
    "function seizeAllowed(address,address,address,address,uint256)",
    "function seizeGuardianPaused()",
    "function supportMarket(address)",
    "function transferAllowed(address,address,address,uint256)",
    "function transferOwnership(address)",
])

const ctlxyTokenAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)(erc20.concat([
    "function accrualBlockNumber()",
    "function accrueInterest()",
    "function balanceOfUnderlying(address)",
    "function borrowBalanceCurrent(address)",
    "function borrowBalanceStored(address)",
    "function borrowRatePerBlock()",
    "function cash()",
    "function comptroller()",
    "function exchangeRateCurrent()",
    "function exchangeRateStored()",
    "function getAccountSnapshot(address)",
    "function seize(address,address,uint256)",
    "function supplyRatePerBlock()",
    "function totalBorrowsCurrent()",
]))

const ctlxyUsdAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)(erc20.concat([]))

const jumpRateModelAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)([
    "function baseRatePerBlock()",
    "function blocksPerYear()",
    "function getBorrowRate(uint256,uint256,uint256)",
    "function getSupplyRate(uint256,uint256,uint256,uint256)",
    "function jumpMultiplierPerBlock()",
    "function kink()",
    "function multiplierPerBlock()",
    "function utilizationRate(uint256,uint256,uint256)"
])

const wethAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)(erc20.concat([ "function drip()" ]))

const ctlxyUsdFacilityAbi = (0,viem__WEBPACK_IMPORTED_MODULE_0__/* .parseAbi */ .U)([

])

const $ = document.querySelector.bind(document);
const ERR_ACCT = '0x' + '1'.repeat(40);

let account, transport, publicClient, walletClient
let comptroller, ctlxyEth, ctlxyCtlxyUsd, ctlxyUsdFacility, ctlxyUsd, 
    weth, feed, ctlxyEthInterestRate, ctlxyUsdInterestRate, ctlxyCtlxyUsdInterestRate
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


const drip = async () => {
    try {
        const { request } = await weth.simulate.drip()
        const hash = walletClient.writeContract(request)
        await publicClient.waitForTransactionReceipt({hash})
    } catch (err) {
        console.log("err", err)
    }
}

const updateWeth = async () => {

    const wethBal = await weth.read.balanceOf([account])
    $('#wethBal').textContent = wethBal

}


const simpleConnect = async () => {
    let _account, _transport
    try {
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

    [account, transport] = await simpleConnect();

    walletClient = (0,viem__WEBPACK_IMPORTED_MODULE_4__/* .createWalletClient */ .F)({ account, chain: chain, transport })
    publicClient = (0,viem__WEBPACK_IMPORTED_MODULE_5__/* .createPublicClient */ .l)({ batch: { multicall: true }, chain: chain, transport })

    const _client = {public: publicClient, wallet: walletClient}

    weth = (0,viem__WEBPACK_IMPORTED_MODULE_6__/* .getContract */ .PF)({ address: FAUCET_WETH, abi: wethAbi, client: _client })
    ctlxyEth = (0,viem__WEBPACK_IMPORTED_MODULE_6__/* .getContract */ .PF)({ address: CTLXY_ETH, abi: ctlxyTokenAbi, client: _client })
    ctlxyUsd = (0,viem__WEBPACK_IMPORTED_MODULE_6__/* .getContract */ .PF)({ addresss: CTLXY_USD, abi: ctlxyUsdAbi, client: _client })
    ctlxyCtlxyUsd = (0,viem__WEBPACK_IMPORTED_MODULE_6__/* .getContract */ .PF)({ addresss: CTLXY_CTLXY_USD, abi: ctlxyTokenAbi, client: _client })
    comptroller = (0,viem__WEBPACK_IMPORTED_MODULE_6__/* .getContract */ .PF)({ address: CATALLAXY_COMPTROLLER, abi: comptrollerAbi, cleint: _client })
    feed = (0,viem__WEBPACK_IMPORTED_MODULE_6__/* .getContract */ .PF)({ address: CATALLAXY_FEED, abi: feedAbi, client: _client })
    ctlxyEthInterestRate = (0,viem__WEBPACK_IMPORTED_MODULE_6__/* .getContract */ .PF)({ address: CTLXY_ETH_INTEREST_RATE, abi: jumpRateModelAbi, client: _client })
    ctlxyUsdInterestRate = (0,viem__WEBPACK_IMPORTED_MODULE_6__/* .getContract */ .PF)({ address: CTLXY_USD_INTEREST_RATE, abi: jumpRateModelAbi, client: _client })
    ctlxyCtlxyUsdInterestRate = (0,viem__WEBPACK_IMPORTED_MODULE_6__/* .getContract */ .PF)({ address: CTLXY_CTLXY_USD_INTEREST_RATE, abi: jumpRateModelAbi, client: _client })

    $("#btnDrip").addEventListener('click', async () => {
        await drip()
    })

    await updateWeth()

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