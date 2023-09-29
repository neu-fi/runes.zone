import { codeToHex, client, encodeBijectiveBase26, encodeVaruintSequence } from '@/app/lib'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as ecc from 'tiny-secp256k1'
import * as bitcoin from 'bitcoinjs-lib'
bitcoin.initEccLib(ecc)

let DUST_AMOUNT = 330
let MINIMUM_CHANGE_AMOUNT = 2500

export async function POST(request: NextRequest) {
  async function estimateFee( txVirtualSize: number ) {
    let feePremium = 1.25 // 25% more than necessary
    let feeRateInBitcoinsperKiloByte = (await client.estimatesmartfee({ conf_target: 1 }))['feerate']
    let feeRateInSatoshisperKiloByte = feeRateInBitcoinsperKiloByte * 10**8
    let feeRateInSatoshisperVirtualByte = feeRateInSatoshisperKiloByte / 4000
    return Math.ceil(feePremium *  txVirtualSize * feeRateInSatoshisperVirtualByte)
  }
  
  function toOutputScript(address: string): Buffer {
    return bitcoin.address.toOutputScript(address)
  }
  
  function idToHash(txid: string): Buffer {
    return Buffer.from(txid, 'hex').reverse();
  }
  
  function approximatelyEqual (number1: number, number2: number, maximumDifferenceRatio = 0.05) {
    return Math.abs((number1 - number2) / number1) <= maximumDifferenceRatio  
  }

  let APPROXIMATE_FEE_AMOUNT = await estimateFee(154)

  let source = request.nextUrl.searchParams.get('source')
  if (!source || source.length === 0) {
    return NextResponse.json(
      {
          message: 'source query parameter must be provided',
      },
      {
          status: 400,
      }
    )
  }
  // TODO: Require destination being Taproot because 330 is DUST_AMOUNT for taproot
  let destination = request.nextUrl.searchParams.get('destination')
  if (!destination || destination.length === 0) {
    return NextResponse.json(
      {
          message: 'destination query parameter must be provided',
      },
      {
          status: 400,
      }
    )
  }
  let ticker = request.nextUrl.searchParams.get('ticker')
  if (!ticker || ticker.length === 0) {
    return NextResponse.json(
      {
        message: 'ticker query parameter must be provided',
      },
      {
        status: 400,
      }
    )
  }
  let rawDecimals = request.nextUrl.searchParams.get('decimals')
  if (!rawDecimals) {
    return NextResponse.json(
      {
        message: 'decimals query parameter must be provided',
      },
      {
        status: 400,
      }
    )
  }
  let decimals = Number.parseInt(rawDecimals)
  let rawAmount = request.nextUrl.searchParams.get('amount')
  if (!rawAmount) {
    return NextResponse.json(
      {
        message: 'amount query parameter must be provided',
      },
      {
        status: 400,
      }
    )
  }
  let amount = Number.parseInt(rawAmount)

  let runeTransferData = encodeVaruintSequence([0, 1, amount*(10**decimals)])
  let runeIssuanceData = encodeVaruintSequence([encodeBijectiveBase26(ticker), decimals])
  let runeOutputScriptAsm = ['OP_RETURN', 'R'.charCodeAt(0).toString(16), runeTransferData, runeIssuanceData]
  let runeOutputScriptHex = codeToHex(runeOutputScriptAsm)
  let runeOutputScriptBuffer = Buffer.from(runeOutputScriptHex,'hex')
  let runeOutputScript = bitcoin.script.decompile(runeOutputScriptBuffer)

  const addresses = [ source ]
  const minconf = 1
  const include_unsafe = false
  const unspent: { txid: string, vout: number, amount: number }[] = await client.listunspent(
    { addresses, minconf, include_unsafe },
  )
  unspent.sort((a, b) => a.amount - b.amount)
  let txInputs = []
  let txInputsTotalAmount = 0
  
  for ( let txInputsIndex = 0; txInputsTotalAmount < APPROXIMATE_FEE_AMOUNT + DUST_AMOUNT; txInputsIndex++ ) {
    if ( txInputsIndex === unspent.length ) {
      return NextResponse.json(
        {
          message: 'not enough utxos'
        },
        {
          status: 400,
        }
      )
    }
    txInputs.push(unspent[txInputsIndex])
    txInputsTotalAmount += Math.floor(unspent[txInputsIndex].amount * 10**8)
  }

  const tx = new bitcoin.Transaction()
  for ( let txInput of txInputs ) {
    tx.addInput( idToHash(txInput.txid), txInput.vout )
  }
  tx.addOutput(runeOutputScriptBuffer, 0)
  
  
  if ( APPROXIMATE_FEE_AMOUNT + DUST_AMOUNT + MINIMUM_CHANGE_AMOUNT < txInputsTotalAmount ) {
    let estimatedFinalTxVirtualSize = 154
    let fee = await estimateFee(estimatedFinalTxVirtualSize)
    tx.addOutput(toOutputScript(destination), DUST_AMOUNT)
    tx.addOutput(toOutputScript(source), txInputsTotalAmount - (fee + DUST_AMOUNT))
    if( !approximatelyEqual(estimatedFinalTxVirtualSize, tx.virtualSize()) ) {
      return NextResponse.json(
        {
          message: 'transaction size calculation error'
        },
        {
          status: 500,
        }
      )
    }
  } else {
    let estimatedFinalTxVirtualSize = 123
    let fee = await estimateFee(estimatedFinalTxVirtualSize)
    tx.addOutput(toOutputScript(destination), txInputsTotalAmount - fee)
    if( !approximatelyEqual(estimatedFinalTxVirtualSize, tx.virtualSize()) ) {
      return NextResponse.json(
        {
          message: 'transaction size calculation error'
        },
        {
          status: 500,
        }
      )
    }
  }
  let txHex = tx.toHex()

  console.log('fee satoshis', )

  return NextResponse.json(
    {
      request: {
        source,
        destination,
        ticker,
        decimals,
        amount,
      },
      middleware: {
        txInputs,
        txInputsTotalAmount,
      },
      response: {
        runeOutputScriptAsm,
        runeOutputScriptHex,
        runeOutputScript,
        tx,
        txHex
      }
    },
    {
      status: 200,
    }
  )
}