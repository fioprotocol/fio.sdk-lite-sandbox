import { signNonce, getPublicKey, verifySignature} from '@fioprotocol/fio-sdk-lite';
import { createHmac, randomBytes } from 'crypto-browserify';

async function main() {
    const privKey = '5JSTL6nnXztYTD1buYfYSqJkNZTBdS9MDZf5nZsFW7gZd1pxZXo';
    // Get one for testing at: http://monitor.testnet.fioprotocol.io:3000/#createKey
    // And add tokens from faucet at: http://monitor.testnet.fioprotocol.io:3000/#faucet
    const secret = 'nvjrf43dwmcsl';

    try {
        // Get public key from Private key
        const publicKey = getPublicKey({ privateKey: privKey });
        console.log('Public key', publicKey);

        // Generate nonce
        const stringToHash = randomBytes(8).toString('hex');
        const nonce = createHmac('sha256', secret)
            .update(stringToHash)
            .digest('hex');

        // Sign nonce
        const singedNonce = signNonce({ nonce, privateKey: privKey });
        console.log('Signed nonce', singedNonce);

        // Verify nonce
        const isSignatureVerified = verifySignature({
            signature: singedNonce,
            data: nonce,
            publicKey,
        });
        console.log(isSignatureVerified);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
