import { codeToHex, client, encodeBijectiveBase26, encodeVaruintSequence } from '@/app/lib'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as ecc from 'tiny-secp256k1'
import * as bitcoin from 'bitcoinjs-lib'
bitcoin.initEccLib(ecc)

let DUST_AMOUNT = 546
let FEE_AMOUNT = 5000

function toOutputScript(address: string): Buffer {
  return bitcoin.address.toOutputScript(address)
}

function idToHash(txid: string): Buffer {
  return Buffer.from(txid, 'hex').reverse();
}

export async function GET(request: NextRequest) {
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
  let rawOutput = request.nextUrl.searchParams.get('output')
  if (!rawOutput) {
    return NextResponse.json(
      {
        message: 'output query parameter must be provided',
      },
      {
        status: 400,
      }
    )
  }
  let output = Number.parseInt(rawOutput)

  console.log("source:", source)
  console.log("destination:", destination)
  console.log("ticker:", ticker)
  console.log("decimals:", decimals)
  console.log("amount:", amount)
  console.log("output:", output)
  
  let runeTransferData = encodeVaruintSequence([0, output, amount*(10**decimals)])
  console.log(runeTransferData)
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
  
  for ( let txInputsIndex = 0; txInputsTotalAmount < FEE_AMOUNT + DUST_AMOUNT; txInputsIndex++ ) {
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
  let outputAmount = txInputsTotalAmount - FEE_AMOUNT // Bigger than or equal to DUST_AMOUNT

  const tx = new bitcoin.Transaction()
  for ( let txInput of txInputs ) {
    tx.addInput( idToHash(txInput.txid), txInput.vout )
  }
  tx.addOutput(runeOutputScriptBuffer, 0)
  tx.addOutput(toOutputScript(destination), outputAmount)
  let txHex = tx.toHex()

  return NextResponse.json(
    {
      request: {
        source,
        destination,
        ticker,
        decimals,
        amount,
        output,
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