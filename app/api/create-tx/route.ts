import { encodeBijectiveBase26, encodeVaruintSequence } from '@/app/lib'

import { RPCClient } from "rpc-bitcoin"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as bitcoin from 'bitcoinjs-lib'

let DUST_AMOUNT = 546

export function codeToHex(codeArray: string[]) {
  let hexArray = []
  for (let code of codeArray) {
    if (code === 'OP_RETURN') {
      hexArray.push('6A')
    } else {
      // Assuming data
      let dataByteLength = (code.length / 2)
      let dataPushOpCode = dataByteLength.toString(16).padStart(2, '0')
      hexArray.push(dataPushOpCode)
      hexArray.push(code)
    }
  }
  return hexArray.join('')
}

export async function GET(request: NextRequest) {
  // let destination = request.nextUrl.searchParams.get('destination')
  // if (!destination || destination.length === 0) {
  // return NextResponse.json(
  //   {
  //       message: 'destination query parameter must be provided',
  //   },
  //   {
  //       status: 400,
  //   }
  // )
  // }
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

  // console.log("destination:", destination)
  console.log("ticker:", ticker)
  console.log("decimals:", decimals)
  console.log("amount:", amount)
  console.log("output:", output)
  
  let runeTransferData = encodeVaruintSequence([0, output, amount*(10**decimals)])
  console.log(runeTransferData)
  let runeIssuanceData = encodeVaruintSequence([encodeBijectiveBase26(ticker), decimals])
  let runeOutputScriptAsm = ['OP_RETURN', 'R'.charCodeAt(0).toString(16), runeTransferData, runeIssuanceData]
  let runeOutputScriptHex = codeToHex(runeOutputScriptAsm)
  let runeOutputScript = bitcoin.script.decompile(Buffer.from(runeOutputScriptHex,'hex'))
  return NextResponse.json(
    {
      request: {
        // destination,
        ticker,
        decimals,
        amount,
        output,
      },
      response: {
        runeOutputScriptAsm,
        runeOutputScriptHex,
        runeOutputScript,
      }
    },
    {
      status: 200,
    }
  )
}