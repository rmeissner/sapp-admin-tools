import axios from 'axios'
import { Safe } from '../safe'

export interface ContractMethod {
    inputs: any[]
    name: string,
    payable: boolean
}

export interface ContractInterface {
    methods: ContractMethod[]
}

class InterfaceRepository {
    safe: Safe
    constructor(safe: Safe) {
        this.safe = safe
    }

    async loadAbi(address: string): Promise<ContractInterface> {
        const host = this.safe.getSafeInfo().network === "rinkeby" ? "https://api-rinkeby.etherscan.io" : "https://api.etherscan.io"
        const apiUrl = `${host}/api?module=contract&action=getabi&address=${address}`
        const contractInfo = await axios.get(apiUrl)
        if (contractInfo.data.status !== "1") throw Error(`Request not successfull: ${contractInfo.data.message}; ${contractInfo.data.result}`)
        const abi = JSON.parse(contractInfo.data.result)
        console.log(abi)
        const methods = abi
            .filter((e: any) => e.constant == false)
            .map((m: any) => { return { inputs: m.inputs, name: m.name, payable: m.payable || false } })
        return { methods }
    }
}

export default InterfaceRepository