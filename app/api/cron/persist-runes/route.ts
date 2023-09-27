import { RPCClient } from "rpc-bitcoin"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeVaruintSequence, decodeBijectiveBase26 } from '@/app/lib'

let RUNE_STARTING_ASM = 'OP_RETURN 82'
let RUNE_FIRST_BLOCK = 809385

const url = process.env.BITCOIN_RPC_URL  || ""
const port = Number.parseInt(process.env.BITCOIN_RPC_PORT || "0")
const user = process.env.BITCOIN_RPC_USER  || ""
const pass = process.env.BITCOIN_RPC_PASS  || ""
const client = new RPCClient({ url, port, user, pass, timeout: 10000 })

export function decodeTransfer(hexadecimalVaruintSequence: string) {
  return decodeVaruintSequence(hexadecimalVaruintSequence)
}

export function decodeIssuance(hexadecimalVaruintSequence: string) {
  return decodeVaruintSequence(hexadecimalVaruintSequence)
}

export function logRuneIssuance(tx: any) {
  for (let out of tx['vout']) {
    let type: string = out['scriptPubKey']['type']
    let asm: string = out['scriptPubKey']['asm']
    if ( type === 'nulldata' && asm.startsWith(RUNE_STARTING_ASM) ) {
      let runeMessages = asm.slice(RUNE_STARTING_ASM.length).split(' ').filter(s => s !== '')
      // console.log(tx['hash'], 'has', asm, 'with', runeMessages.length, 'rune messages:')
      
      if ( runeMessages.length === 2 ) {
        let transferMessage = runeMessages[0]
        let decodedTransferMessage = decodeVaruintSequence(transferMessage)
        let issuanceMessage = runeMessages[1]
        let decodedIssuanceMessage = decodeVaruintSequence(issuanceMessage)
        if ( decodedTransferMessage.length % 3 !== 0) {
          // console.error('transfer_invalid_length')
          return
        }
        if ( decodedIssuanceMessage.length !== 2) {
          // console.error('issuance_invalid_length')
          return
        }

        // console.log('txhash:', tx['hash'])
        // console.log('transfer:', decodedTransferMessage)
        // console.log('issuance:', decodedIssuanceMessage)
        console.log('Issued', decodeBijectiveBase26(decodedIssuanceMessage[0]), 'with', decodedIssuanceMessage[1], 'digits')
        // console.log('')
      }
    }
  }
}

export async function GET(request: NextRequest) {
  let rawCount = request.nextUrl.searchParams.get('count')

  if (!rawCount) {
    return NextResponse.json(
      {
        message: 'from query parameter must be provided',
      },
      {
        status: 400,
      }
    )
  }

  let count = Number.parseInt(rawCount)
  if ( Number.isNaN(count) || count <= 0 ) {
    return NextResponse.json(
      {
        message: `count must be a positive multiplication of ${count}`,
      },
      {
        status: 400,
      }
    )
  }

  let blockcount: number
  try {
    blockcount = await client.getblockcount()
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      {
          message: "Error encountered on getblockcount",
      },
      {
      status: 500,
      }
    )
  }

  let blockheights = [...Array(count).keys()].map(index => index + (blockcount - count + 1))
  for (let blockheight of blockheights) {
    // console.log('')
    // console.log("---=== block(",blockheight,")>> ===---")
    // console.log('')
    const blockhash = await client.getblockhash({ height: blockheight })
    const block = await client.getblock({ blockhash, verbosity: 2 })
    for (let tx of block['tx']) {
      logRuneIssuance(tx)
    }
    // console.log("---=== <<block(",blockheight,") ===---")
    // console.log('')
  }

  return NextResponse.json(
    {
        blockheights,
    },
    {
      status: 200,
    }
  )
}
