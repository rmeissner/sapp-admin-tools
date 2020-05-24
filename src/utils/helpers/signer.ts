declare global {
    interface Window { ethereum: any; }
}

export class EthereumWindowSigner implements Signer {

    async requireProvider(): Promise<{provider: any, accounts: string[]}> {
        const provider = window.ethereum
        if(!provider || !provider.sendAsync) throw Error("window.ethereum required")
        const accounts = await provider.enable()
        return {provider, accounts}
    }

    async request(method: string, params: any): Promise<any> {
        const { provider } = await this.requireProvider()
        console.log({method, params})
        const resp = await new Promise((res, rej) => {
            provider.sendAsync({
                method,
                params,
                jsonrpc: '2.0'
            }, (err: any, resp: any) => {
                console.log({err, resp})
                if(err) rej(err)
                res(resp.result)
            })
        })
        console.log({resp})
        return resp
    }

    async sign(data: string): Promise<string> {
        const { accounts } = await this.requireProvider()
        console.log(accounts)
        const signature: string = await this.request("personal_sign", [
            data, accounts[0]
        ])
        return signature
    }
}

export default interface Signer {
    sign(data: string): Promise<string>
}