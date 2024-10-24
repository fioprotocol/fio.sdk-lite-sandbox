import { decryptContent } from '@fioprotocol/fio-sdk-lite';

async function main() {
    // URL of FIO Chain API node, see: https://bpmonitor.fio.net/nodes
    const apiUrl = 'https://test.fio.eosusa.io'; // No trailing slashes
    const params = {
        fio_public_key: "FIO7MYkz3serGGGanVPnPPupE1xSm1t7t8mWJ3H7KEd2vS2ZZbXBF",
        limit: 1,
        offset: 0,
    };

    try {
        const response = await fetch(apiUrl+'/v1/chain/get_sent_fio_requests',
            {
                body: JSON.stringify(params),
                method: 'POST',
            },
        );
        const sentFioRequests = await response.json();
        const fioRequestToDecrypt = sentFioRequests.requests[0];
        const decryptedContent = decryptContent({
            content: fioRequestToDecrypt.content,
            encryptionPublicKey: fioRequestToDecrypt.payer_fio_public_key,
            fioContentType: 'new_funds_content', // new_funds_content - FIO Request, or 'record_obt_data_content' - FIO Data
            privateKey: '5JTmqev7ZsryGGkN6z4FRzd4ELQJLNZuhtQhobVVsJsBHnXxFCw',
            // Get one for testing at: http://monitor.testnet.fioprotocol.io:3000/#createKey
            // And add tokens from faucet at: http://monitor.testnet.fioprotocol.io:3000/#faucet
        });
        console.log(decryptedContent);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
