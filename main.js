
import { createPublicClient, createWalletClient, custom, decodeAbiParameters, encodeAbiParameters, formatUnits, 
    getContract, hexToBigInt, http, pad, parseAbi, parseUnits, stringToHex, toHex, UserRejectedRequestError } from 'viem'

import { sepolia } from 'viem/chains'

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

const feedAbi = parseAbi([

])

const comptrollerAbi = parseAbi([

])

const ctlxyTokenAbi = parseAbi([

])

const ctlxyUsdAbi = parseAbi([

])

const jumpRateModelAbi = parseAbi([

])

const wethAbi = parseAbi([

])

const ctlxyUsdFacilityAbi = parseAbi([

])

const $ = document.querySelector.bind(document);
const ERR_ACCT = '0x' + '1'.repeat(40);

let account, transport, publicClient, walletClient
let comptroller, ctlxyEth, ctlxyCtlxyUsd, ctlxyUsdFacility, ctlxyUsd, weth, feed
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

    // weth = getContract({ address: wethAddr, abi: wethAbi, client: _client })
    // ctlxyUsd = getContract({ addresss: ctlxyUsdAddr, abi: ctlxyUsdAbi, client: _client })
    // feed = getContract({ address: feedAddr, abi: feedAbi, client: _client })



}