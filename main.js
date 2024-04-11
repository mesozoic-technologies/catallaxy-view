
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
    "function allowance(address,address)",
    "function approve(address,uint256)",
    "function balanceOf(address)",
    "function name()",
    "function symbol()",
    "function totalSupply()",
    "function transfer(address,uint256)",
    "function transferFrom(address,address,uint256)"
]

const feedAbi = parseAbi([
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

const comptrollerAbi = parseAbi([
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

const ctlxyTokenAbi = parseAbi(erc20.concat([
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

const ctlxyUsdAbi = parseAbi(erc20.concat([]))

const jumpRateModelAbi = parseAbi([
    "function baseRatePerBlock()",
    "function blocksPerYear()",
    "function getBorrowRate(uint256,uint256,uint256)",
    "function getSupplyRate(uint256,uint256,uint256,uint256)",
    "function jumpMultiplierPerBlock()",
    "function kink()",
    "function multiplierPerBlock()",
    "function utilizationRate(uint256,uint256,uint256)"
])

const wethAbi = parseAbi(erc20.concat([ "function drip()" ]))

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


const drip = async () => {
    try {
        const { request } = await weth.simulate.drip()
        const hash = walletClient.writeContract(request)
        await publicClient.waitForTransactionReceipt({hash})
    } catch (err) {
        console.log("err", err)
    }
}


const simpleConnect = async () => {
    let _account, _transport
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

    $("#btnDrip").addEventListener('click', async () => {
        await drip()
    })

}