import axios from 'axios'

interface Delegate {
    delegate: string
    delegator: string
    label: string
}

interface PaginatedResult<T> {
    results: T[]
}

export class TransactionServiceApiImpl implements TransactionServiceApi {
    baseUrl: any
    constructor(network: string) {
        this.baseUrl = network === "rinkeby" ? "https://safe-transaction.rinkeby.gnosis.io/api" : "https://safe-transaction.gnosis.io/api"
    }

    async delegates(safe: string): Promise<Delegate[]> {
        const resp = await axios.get(`${this.baseUrl}/v1/safes/${safe}/delegates/`)
        if (resp.status < 200 || resp.status >= 300) throw new Error(`Request was not successfull: ${resp}`)
        const data: PaginatedResult<Delegate> = resp.data
        return data.results
    }

    async addDelegates(safe: string, delegate: string, label: string, signature: string): Promise<void> {
        const data = {
            "delegate": delegate,
            "signature": signature,
            "label": label
        }
        const resp = await axios.post(`${this.baseUrl}/v1/safes/${safe}/delegates/`, data)
        if (resp.status < 200 || resp.status >= 300) throw new Error(`Request was not successfull: ${resp.status}`)
    }

    async removeDelegates(safe: string, delegate: string, signature: string): Promise<void> {
        const data = {
            "signature": signature,
            "delegate": delegate
        }
        const resp = await axios.delete(`${this.baseUrl}/v1/safes/${safe}/delegates/${delegate}/`, { data })
        if (resp.status < 200 || resp.status >= 300) throw new Error(`Request was not successfull: ${resp.status}`)
    }
}

export default interface TransactionServiceApi {
    delegates(safe: string): Promise<Delegate[]>
    addDelegates(safe: string, delegate: string, label: string, signature: string): Promise<void>
    removeDelegates(safe: string, delegate: string, signature: string): Promise<void>
}