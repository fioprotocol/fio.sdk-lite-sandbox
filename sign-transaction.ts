import { signTransaction } from '@fioprotocol/fio-sdk-lite';

async function main() {
    // URL of FIO Chain API node, see: https://bpmonitor.fio.net/nodes
    const apiUrl = 'https://test.fio.eosusa.io'; // No trailing slashes

    // Transaction data, see https://dev.fio.net/reference/fio-chain-actions-api
    // actor is omitted as it will be inserted by the SDK.
    const params = {
        apiUrl,
        actionParams: [
            {
                action: 'regaddress',
                account: 'fio.address',
                data: {
                    fio_address: `testing-fio-handle-${Date.now()}@regtest`,
                    owner_fio_public_key: '',
                    tpid: '',
                    max_fee: 1500000000000, // Obtain from https://dev.fio.net/reference/get_fee
                },
            },
        ],
        privateKey: '5JSTL6nnXztYTD1buYfYSqJkNZTBdS9MDZf5nZsFW7gZd1pxZXo',
        // Get one for testing at: http://monitor.testnet.fioprotocol.io:3000/#createKey
        // And add tokens from faucet at: http://monitor.testnet.fioprotocol.io:3000/#faucet
    };

    try {
        const signedTransactions = await signTransaction(params);
        const signedTransactionsResult = JSON.parse(signedTransactions);

        const pushTransactionResult = async (signedTransactionsResult: any) => {
            const pushResult = await fetch(
                apiUrl+'/v1/chain/push_transaction',
                {
                    body: JSON.stringify(signedTransactionsResult),
                    method: 'POST',
                }
            );

            if ([400, 403, 500].includes(pushResult.status)) {
                const jsonResult = await pushResult.json();
                const errorMessage = jsonResult.message || 'Something went wrong';

                if (jsonResult.fields) {
                    const fieldErrors = jsonResult.fields.map(field => ({
                        name: field.name,
                        value: field.value,
                        error: field.error,
                    }));
                    throw new Error(`${errorMessage}: ${JSON.stringify(fieldErrors)}`);
                } else if (jsonResult.error && jsonResult.error.what) {
                    throw new Error(jsonResult.error.what);
                } else {
                    throw new Error(errorMessage);
                }
            }

            return await pushResult.json();
        };
        const results = await Promise.allSettled(
            signedTransactionsResult.successed.map(pushTransactionResult)
        );
        console.log(results);
        const processedData = results[0].status === 'fulfilled' ? results[0].value.processed : null;
        if (processedData) {
            const response = JSON.parse(processedData.action_traces[0].receipt.response);
            console.log('Processed Data Response:', JSON.stringify(response, null, 2));
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
