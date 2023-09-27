import * as varuint from 'varuint-bitcoin'
import { RPCClient } from "rpc-bitcoin"

var Buffer = require('safe-buffer').Buffer

export const RUNE_STARTING_ASM = 'OP_RETURN 82'
export const RUNE_FIRST_BLOCK = 809385


const url = process.env.BITCOIN_RPC_URL  || ""
const port = Number.parseInt(process.env.BITCOIN_RPC_PORT || "0")
const user = process.env.BITCOIN_RPC_USER  || ""
const pass = process.env.BITCOIN_RPC_PASS  || ""
export const client = new RPCClient({ url, port, user, pass, timeout: 10000 })

// str must be uppercase A-Z only!
export function encodeBijectiveBase26(str: string) {
  if ( /^([A-Z])+$/.test(str) == false ) {
    throw "Invalid bijectiveBase26 input, not all uppercase"
  }

  let encode = 0
  str.split('').forEach( (c, i) => {
    let charIndex = c.charCodeAt(0) - "A".charCodeAt(0) + 1
    let exponent = str.length - 1 - i
    let multiplier = 26 ** exponent
    let letterEncode = charIndex * multiplier
    encode += letterEncode
  })
  return encode
}

export function decodeBijectiveBase26(num: number) {
  if ( num < 1 ) {
    return ''
  } else {
    let letters = []
    while ( 0 < num ) {
      let remainder = num % 26
      letters.unshift( remainder )
      num = (num - remainder) / 26
    }
    return letters.map(letterIndex => String.fromCharCode(65 + letterIndex)).join('')
  }
}

export function decodeVaruintSequence(hexadecimalVaruintSequence: string) {
  let buffer = Buffer.from(hexadecimalVaruintSequence, 'hex')
  
  let offset = 0
  let decodedIntegers = []
  while ( offset < buffer.length ) {
    let decoded: number
    try {
      decoded = varuint.decode(buffer, offset)
      decodedIntegers.push(decoded)
    } catch (e) {
      console.error(e)
      // Bandaid as the library we use cannot handle large integers that can be represented in varuint
      decodedIntegers.push(-1)
    }

    let firstByte = buffer[offset]
    if ( firstByte === 0xff ) {
      offset += 9
    } else if ( firstByte === 0xfe ) {
      offset += 5
    } else if ( firstByte === 0xfd ) {
      offset += 3
    } else {
      offset += 1
    }
  }
  return decodedIntegers
}

export function encodeVaruintSequence(numberArray: number[]) {
  let buffer = Buffer.concat(numberArray.map(num => varuint.encode(num)))
  return buffer.toString('hex').toUpperCase()
}
