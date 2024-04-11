
import { createPublicClient, createWalletClient, custom, decodeAbiParameters, encodeAbiParameters, formatUnits, 
    getContract, hexToBigInt, http, pad, parseAbi, parseUnits, stringToHex, toHex, UserRejectedRequestError } from 'viem'

import { sepolia } from 'viem/chains'

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
    "allowance(address,address)",
    "approve(address,uint256)",
    "balanceOf(address)",
    "name()",
    "symbol()",
    "totalSupply()",
    "transfer(address,uint256)",
    "transferFrom(address,address,uint256)"
]

const feedAbi = parseAbi([
    "MAX_INTEGER()",
    "MAX_TOKENS()",
    "getTokenConfig(uint256)",
    "getTokenConfigByCToken(address)",
    "getTokenConfigByReporter(address)",
    "getTokenConfigBySymbol(string)",
    "getTokenConfigBySymbolHash(bytes32)",
    "getTokenConfigByUnderlying(address)",
    "getUnderlyingPrice(address)",
    "numTokens()",
    "price(string)",
])

const comptrollerAbi = parseAbi([
    "accountAssets(address,uint256)",
    "allMarkets(uint256)",
    "borrowAllowed(address,address,uint256)",
    "borrowGuardianPaused(address)",
    "closeFactor()",
    "enterMarkets(address[])",
    "exitMarket(address)",
    "feed()",
    "initialize(address)",
    "liquidateBorrowAllowed(address,address,address,address,uint256)",
    "liquidateCalculateSeizeTokens(address,address,uint256)",
    "liquidationIncentive()",
    "markets(address)",
    "maxAssets()",
    "mintAllowed(address,address,uint256)",
    "mintGuardianPaused(address)",
    "owner()",
    "redeemAllowed(address,address,uint256)",
    "renounceOwnership()",
    "repayBorrowAllowed(address,address,address,uint256)",
    "seizeAllowed(address,address,address,address,uint256)",
    "seizeGuardianPaused()",
    "supportMarket(address)",
    "transferAllowed(address,address,address,uint256)",
    "transferOwnership(address)",
])

const ctlxyTokenAbi = parseAbi(erc20.concat([
    "accrualBlockNumber()",
    "accrueInterest()",
    "balanceOfUnderlying(address) ",
    "borrowBalanceCurrent(address) ",
    "borrowBalanceStored(address) ",
    "borrowRatePerBlock()",
    "cash()",
    "comptroller()",
    "exchangeRateCurrent()",
    "exchangeRateStored()",
    "getAccountSnapshot(address) ",
    "seize(address,address,uint256) ",
    "supplyRatePerBlock()",
    "totalBorrowsCurrent()",
]))

const ctlxyUsdAbi = parseAbi(erc20.concat([]))

const jumpRateModelAbi = parseAbi([
    "baseRatePerBlock()",
    "blocksPerYear()",
    "getBorrowRate(uint256,uint256,uint256)",
    "getSupplyRate(uint256,uint256,uint256,uint256)",
    "jumpMultiplierPerBlock()",
    "kink()",
    "multiplierPerBlock()",
    "utilizationRate(uint256,uint256,uint256)"
])

const wethAbi = parseAbi(erc20.concat([ "drip()" ]))

const ctlxyUsdFacilityAbi = parseAbi([

])

const $ = document.querySelector.bind(document);
const ERR_ACCT = '0x' + '1'.repeat(40);

let account, transport, publicClient, walletClient
let comptroller, ctlxyEth, ctlxyCtlxyUsd, ctlxyUsdFacility, ctlxyUsd, 
    weth, feed, ctlxyEthInterestRate, ctlxyUsdInterestRate, ctlxyCtlxyUsdInterestRate
let store = {}
let chain = sepolia

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
    console.log("wtf")
    try {
        if (!window.ethereum) throw new Error();
        [_account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        _transport = custom(window.ethereum)
    } catch (error) {
        _account = ERR_ACCT
        _transport = http()
        $('#connectionError').style.display = "block"
    }
    return [_account, _transport]
}

window.onload = async () => {

    [account, transport] = await simpleConnect();

    walletClient = createWalletClient({ account, chain: chain, transport })
    publicClient = createPublicClient({ batch: { multicall: true }, chain: chain, transport })

    const _client = {public: publicClient, wallet: walletClient}

    weth = getContract({ address: FAUCET_WETH, abi: wethAbi, client: _client })
    ctlxyEth = getContract({ address: CTLXY_ETH, abi: ctlxyTokenAbi, client: _client })
    ctlxyUsd = getContract({ addresss: CTLXY_USD, abi: ctlxyUsdAbi, client: _client })
    ctlxyCtlxyUsd = getContract({ addresss: CTLXY_CTLXY_USD, abi: ctlxyTokenAbi, client: _client })
    comptroller = getContract({ address: CATALLAXY_COMPTROLLER, abi: comptrollerAbi, cleint: _client })
    feed = getContract({ address: CATALLAXY_FEED, abi: feedAbi, client: _client })
    ctlxyEthInterestRate = getContract({ address: CTLXY_ETH_INTEREST_RATE, abi: jumpRateModelAbi, client: _client })
    ctlxyUsdInterestRate = getContract({ address: CTLXY_USD_INTEREST_RATE, abi: jumpRateModelAbi, client: _client })
    ctlxyCtlxyUsdInterestRate = getContract({ address: CTLXY_CTLXY_USD_INTEREST_RATE, abi: jumpRateModelAbi, client: _client })

}