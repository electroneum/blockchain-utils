const basex = require('base-x')
const base58 = basex('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')
const sha3 = require('js-sha3');

// nettype can be one of {"mainnet","testnet","stagenet"}
// however etn does use the same network bytes fora all three, but will keep this way so other projects can fork & adapt

function isValidElectroneumAddress(address, nettype) {
    if (typeof address !== 'string') { //is it a string?
        console.log("address is not a string")
        return false;
    }

    if (typeof nettype !== 'string' && nettype != ("mainnet" || "testnet" || "stagenet" )) {
        console.log("bad network type")
        return false;
    }

    if (address.length !== 98) { // is it 98 chars long?
        console.log("bad address length")
        return false;
    }

    const decoded = base58Decode11(address); //b58 decode it the 'xmr way'
    if (!decoded) {
        console.log("bad decode")
        return false;
    }

    const netHex = nettype == "mainnet" ? "e28c01" : nettype == "testnet" ? "e28c01" : nettype == "Stagenet" ? "e28c01": ("e28c01");
    const expectedPrefix = Buffer.from(netHex, 'hex'); // js needs to know whether the string is hex or not to serialse to buf

    if (!array_equal(expectedPrefix, decoded.prefix)) {
        console.log("bad prefix")
        return false;
    }

    const hash = Buffer.from(sha3.keccak_256.arrayBuffer(decoded.prefixspendview));
    //console.log(hash.toString('hex'))
    const expectedChecksum = Uint8Array.from(hash.slice(0,4));
    if (!array_equal(expectedChecksum, decoded.checksum)) {
        console.log("bad checksum")
        return false;
    }

    return true;
}


// decode 11 base 58 characters at a time.
// when encoding, 8 byte blocks were b58 encoded to 11 or less characters, and if less than 11,
// the algo padded the etn address with 1s. This means that when decoding, we need to strip out some zeroes
// from the start of a decoded block sometimes
function base58Decode11(address) {
    try {
        let decodedHex = '';
        let decoded = Buffer.alloc(0);
        for (let i = 0; i < address.length - 10; i += 11) { // ten lots of 11 is 88 and the last 10 can be decoded separately
            let block = address.substring(i, i + 11)
            const buf = Buffer.from(base58.decode(block))
            const last7Bytes = buf.slice(-8); // get rid of padding
            decodedHex += last7Bytes.toString('hex')
            decoded = Buffer.concat([decoded, last7Bytes]);
        }
        const block = address.substring(address.length - 10, address.length)// the last 10 can be decoded separately
        const buf = Buffer.from(base58.decode(block))
        const last7Bytes = buf.slice(-7); // monero has 5 bytes remaining, so electroneum with a 3-byte prefix has 7
        //decodedHex += last7Bytes.toString('hex')
        //console.log(decodedHex)
        decoded = Buffer.concat([decoded, last7Bytes]);
        //console.log(decoded.toString('hex'))

        const prefix = decoded.slice(0, 3); // network bytes
        //console.log("prefix", prefix.toString('hex'))
        const checksum = decoded.slice(-4); // get keccak hash of all prior bytes placed at end
        //console.log("checksum", checksum.toString('hex'))
        const prefixspendview = decoded.slice(0, -4); // netbyte + spend + view (this is what has been hashed to achieve slice(-4)
        //console.log("prefixspendview", prefixspendview.toString('hex'))
        return { prefix, checksum, prefixspendview };
    }  catch (err) {
    return null;
}

}

function array_equal(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

function tests(address, nettype) {
    console.log('MAINNET TESTS')
    console.log('first test')
    console.log(isValidElectroneumAddress("etnkMDRr7y9bMbU8WJPVkEa2w6WLMyWYc1oB9K6tX9DmabaBRkyejf1D77aMx8HSRJWvyCioVqtD47Hc7yjb3PUB9Y4rnwPoVy", "mainnet"))
    console.log('second test')
    console.log(isValidElectroneumAddress("etnkPei7QLegFeTbGHM5C54nX6dmtz5iH1JkEDnxsoDBBis4nr8LUxL5bBAoBpAQUkJ594TYZhqmMdAPKQZrKF8M3FLdpHg9d3", "mainnet"))
    console.log('third test')
    console.log(isValidElectroneumAddress("etnk9rPQU2wAskvbsttr86fdJLHK2nvAKNbDy3HsH9hZdHT3dFHWgwAcJ2DDghPxMA46B7GJgVYtUckQJPUxKvqC1BTbAp4dui", "mainnet"))
    console.log()
    console.log()
    console.log('TESTNET TESTS')
    console.log('first test')
    console.log(isValidElectroneumAddress("etnkMDRr7y9bMbU8WJPVkEa2w6WLMyWYc1oB9K6tX9DmabaBRkyejf1D77aMx8HSRJWvyCioVqtD47Hc7yjb3PUB9Y4rnwPoVy", "testnet"))
    console.log('second test')
    console.log(isValidElectroneumAddress("etnk2AkoqvR7KCTWdW4zhfNoLP8ihywPMUL8Ms9krpRhRW9s8eP6dfvG2pbsEXvdzu1A7G3whTgDCFoaR3fcpPPR7pYEgBERjK", "testnet"))
    console.log('third test')
    console.log(isValidElectroneumAddress("etnkPutWz3uEy9nUTxPAbRjN1MMM3ih34SjdgcT5EZrcQjZbhvZDjG8SCP3XFBLRH72Y7QGAQUQEPNYRvt7sEFJy2rMnRQWTav", "testnet"))
    console.log()
    console.log()
    console.log('STAGENET TESTS')
    console.log('first test')
    console.log(isValidElectroneumAddress("etnkDKi9xpkeLfZhE3Xe2hKeNLfUoSpppeTXsqBiCXjvaPNwaY9GKSxBJbgCApqx518b44tgwEbQ617d4TnVD5da1sYCrjPZn4", "stagenet"))
}

const address = process.argv[2];
const nettype = process.argv[3];
console.log(isValidElectroneumAddress(address, nettype));
module.exports = {isValidElectroneumAddress};