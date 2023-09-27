import { RPCClient } from "rpc-bitcoin"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const url = process.env.BITCOIN_RPC_URL  || ""
const port = Number.parseInt(process.env.BITCOIN_RPC_PORT || "0")
const user = process.env.BITCOIN_RPC_USER  || ""
const pass = process.env.BITCOIN_RPC_PASS  || ""
const client = new RPCClient({ url, port, user, pass, timeout: 10000 })

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
    console.log('')
    console.log("---=== block(",blockheight,")>> ===---")
    console.log('')
    const blockhash = await client.getblockhash({ height: blockheight })
    const block = await client.getblock({ blockhash, verbosity: 2 })
    for (let tx of block['tx']) {
      for (let out of tx['vout']) {
        if ( out['scriptPubKey']['type'] === 'nulldata' && out['scriptPubKey']['asm'].startsWith('OP_RETURN 82') ) {
          console.log(tx['hash'], '->')
          console.log(out['scriptPubKey']['asm'])
          console.log('')
        }
      }
    }
    console.log("---=== <<block(",blockheight,") ===---")
    console.log('')
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

// list: address / runes as badges (ids first, names later) / issue|send badges / View button->modal
// badges: icons
// issue:
// <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//   <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
// </svg>
// paper:
// <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//   <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
// </svg>
