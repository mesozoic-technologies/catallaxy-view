
import { createPublicClient, createWalletClient, custom, decodeAbiParameters, encodeAbiParameters, formatUnits, 
    getContract, hexToBigInt, http, pad, parseAbi, parseUnits, stringToHex, toHex, UserRejectedRequestError } from 'viem'

import { sepolia } from 'viem/chains'

const FAUCET_WETH="0x832c6D83Fc43466Ed8f0902F996A23E901015c5f"
const CATALLAXY_SOVEREIGN="0xa83fDBFaeeAcE5140EFb89561048E5eD4DA3b0c3"
const CTLXY_USD="0x132c0998190368ef6C1e22429EBAf65ce5B514B4"
const CTLXY_USD_INTEREST_RATE="0x5B482e9d46912a831d92C1Ad5D34eEA6F56aa894"
const CTLXY_ETH_INTEREST_RATE="0x7B69767eE72093023A76Faed86000376b1c201F2"
const CTLXY_CTLXY_USD_INTEREST_RATE="0x9B00F11e31643D7524D52862C245154E8087389C"
const CATALLAXY_COMPTROLLER="0xE79e490f9EbCD55D819DcE4d058e72db411d3842"
const CTLXY_CTLXY_USD="0x558Df8E220348953343bABEba84Fb2580956d210"
const CTLXY_ETH="0xe8F8c822c0Ea2b7032b313DBD948c2A06aD8b74e"
const CTLXY_USD_FACILITY="0xfB0caC901E8c50eAE8f88DB251c974932898c836"
const CATALLAXY_FEED="0x2dA256ED051EbcB0Da276a3eB3DAb16830B2EbE7"

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
    "function mint(address,uint)",
    "function cash()",
    "function comptroller()",
    "function exchangeRateCurrent()",
    "function exchangeRateStored()",
    "function getAccountSnapshot(address)",
    "function seize(address,address,uint256)",
    "function supplyRatePerBlock()",
    "function totalBorrowsCurrent()",
]))

const ctlxyUsdAbi = parseAbi(erc20)

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

const MAXUINT  = BigInt(2)**BigInt(256) - BigInt(1);

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
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

const approve = async () => {
    try {

        const [a,b] = 
            $('input[name="supply"]:checked').value == 'ETH' ? [ weth, ctlxyEth ] :
            $('input[name="supply"]:checked').value == 'ctlxyUSD' ? [ ctlxyUsd, ctlxyCtlxyUsd ] :
            null;

        const { request } = await a.simulate.approve([b.address, MAXUINT])
        const hash = walletClient.writeContract(request)
        await publicClient.waitForTransactionReceipt({hash})

    } catch (e) {
        console.log("err", e)
    }
}

const supply = async () => {

    try {

        const market = 
            $('input[name="supply"]:checked').value == 'ETH' ? ctlxyEth :
            $('input[name="supply"]:checked').value == 'ctlxyUSD' ? ctlxyCtlxyUsd :
            null;
        
        const amount = $('#supplyAmount').value
        const { request } = await market.write.mint([account, amount])
        // const { request } = await market.simulate.mint([account, amount])
        const hash = walletClient.writeContract(request)
        await publicClient.waitForTransactionReceipt({hash})

    } catch (e) {
        console.log("err", e)
    }

}

const checkApprove = async () => {

    console.log("?")

    const contract = 
        $('input[name="supply"]:checked').value == 'ETH' ? weth :
        $('input[name="supply"]:checked').value == 'ctlxyUSD' ? ctlxyUsd :
        null;

    const approved = await contract.read.allowance([account, CTLXY_ETH])

    $('#btnApprove').style.display = approved == 0 ? '' : 'none';
    $('#btnSupply').style.display = approved == 0 ? 'none' : '';

}

const updateWeth = async () => {
    const wethBal = await weth.read.balanceOf([account])
    $('#wethBal').textContent = wethBal
}

const updateCtlxyEth = async () => {

    const ctlxyEthBal = await ctlxyEth.read.balanceOf([account])
    $('#ctlxyEthBal').textContent = ctlxyEthBal

}

const updateCtlxyUsd = async () => {

    const ctlxyUsdBal = await ctlxyUsd.read.balanceOf([account])
    $('#ctlxyUsdBal').textContent = ctlxyUsdBal

}

const updateCtlxyCtlxyUsd = async () => {

    const ctlxyCtlxyUsdBal = await ctlxyCtlxyUsd.read.balanceOf([account])
    $('#ctlxyCtlxyUsdBal').textContent = ctlxyCtlxyUsdBal

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
    ctlxyUsd = getContract({ address: CTLXY_USD, abi: ctlxyUsdAbi, client: _client })
    ctlxyCtlxyUsd = getContract({ address: CTLXY_CTLXY_USD, abi: ctlxyTokenAbi, client: _client })
    comptroller = getContract({ address: CATALLAXY_COMPTROLLER, abi: comptrollerAbi, cleint: _client })
    feed = getContract({ address: CATALLAXY_FEED, abi: feedAbi, client: _client })
    ctlxyEthInterestRate = getContract({ address: CTLXY_ETH_INTEREST_RATE, abi: jumpRateModelAbi, client: _client })
    ctlxyUsdInterestRate = getContract({ address: CTLXY_USD_INTEREST_RATE, abi: jumpRateModelAbi, client: _client })
    ctlxyCtlxyUsdInterestRate = getContract({ address: CTLXY_CTLXY_USD_INTEREST_RATE, abi: jumpRateModelAbi, client: _client })

    $("#btnDrip").addEventListener('click', async () => await drip())
    $("#btnSupply").addEventListener('click', async () => await supply())
    $("#btnApprove").addEventListener('click', async () => await approve())

    $$('input[name="supply"]').forEach(input => 
        input.addEventListener('click', async () => await checkApprove())
    )

    await updateWeth()
    await updateCtlxyEth()
    await updateCtlxyUsd()
    await updateCtlxyCtlxyUsd()
    await checkApprove()

}