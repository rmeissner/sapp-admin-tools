import Web3 from "web3"
import { Safe } from '../safe'
import TransactionServiceApi from '../api/transactionService'
import Signer from '../helpers/signer'

export interface ContractMethod {
    inputs: any[]
    name: string,
    payable: boolean
}

export interface ContractInterface {
    payableFallback: boolean
    methods: ContractMethod[]
}

export class DelegateRepositoryImpl implements DelegateRepository {
    safe: Safe
    service: TransactionServiceApi
    localSigner: Signer
    constructor(safe: Safe, service: TransactionServiceApi, localSigner: Signer) {
        this.safe = safe
        this.service = service
        this.localSigner = localSigner
    }

    async loadDelegates(): Promise<{name: string, address: string}[]> {
        const safeAddress = this.safe.getSafeInfo().safeAddress
        const delegates = await this.service.delegates(safeAddress)
        return delegates.map((delegate) => { return { name: delegate.label, address: delegate.delegate }})
    }

    async addDelegate(delegate: string, label: string): Promise<void> {
        const safeAddress = this.safe.getSafeInfo().safeAddress
        const totp = Math.floor(Date.now() / 1000 / 3600)
        const data = Web3.utils.stringToHex(delegate + totp)
        const signature = await this.localSigner.sign(data)
        console.log({signature})
        await this.service.addDelegates(safeAddress, delegate, label, signature)
    }

    async removeDelegate(delegate: string): Promise<void> {
        const safeAddress = this.safe.getSafeInfo().safeAddress
        const totp = Math.floor(Date.now() / 1000 / 3600)
        const data = Web3.utils.stringToHex(delegate + totp)
        const signature = await this.localSigner.sign(data)
        console.log({signature})
        await this.service.removeDelegates(safeAddress, delegate, signature)
    }
}

export default interface DelegateRepository {
    loadDelegates: () => Promise<{name: string, address: string}[]>
    addDelegate: (delegate: string, label: string) => Promise<void>
    removeDelegate: (delegate: string) => Promise<void>
}