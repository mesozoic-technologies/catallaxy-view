
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

let account, transport, publicCient, walletClient
let comptroller, ctlxyEth, ctlxyCtlxyUsd, ctlxyUsdFacility, ctlxyUsd, weth
let store = {}

const updateCatallaxyStats = async () => {

}

const updateHook = async () => { 
    reset()
}

const updateUni = async () => {

}

const valueNFTs = async (nfts) => {

}


