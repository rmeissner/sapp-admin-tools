import React from 'react'
import Web3 from "web3"
import DelegateRepository, { DelegateRepositoryImpl } from "./repositories/delegateRepository"
import { Safe } from "./safe"
import { useSafe } from './SafeProvider'
import TransactionServiceApi, { TransactionServiceApiImpl } from './api/transactionService'
import Signer, { EthereumWindowSigner } from './helpers/signer'

class Singleton<T> {
    _provider: () => T
    _cached: T|undefined
    constructor(provider: () => T) {
        this._provider = provider
    }

    get = (): T => {
        if (!this._cached) {
            this._cached = this._provider()
        }
        return this._cached
    } 
}

class Graph {
    _safe: Safe
    constructor(safe: Safe) {
        this._safe = safe
    }

    web3 = new Singleton<any>(
        () => new Web3(new Web3.providers.HttpProvider(`https://${this._safe.getSafeInfo().network}.infura.io/v3/8c45ecc4f2e944c7866d974d6dcd52c9`))
    )

    localSigner = new Singleton<Signer>(
        () => new EthereumWindowSigner()
    )

    transactionService = new Singleton<TransactionServiceApi>(
        () => new TransactionServiceApiImpl(this._safe.getSafeInfo().network)
    )

    delegateRepository = new Singleton<DelegateRepository>(
        () => new DelegateRepositoryImpl(this._safe, this.transactionService.get(), this.localSigner.get())
    )
}

const DependenciesContext = React.createContext<Graph|undefined>(undefined)

export const DependenciesProvider: React.FC = ({ children }) => {
    const safe = useSafe()
    const [dependencies] = React.useState(new Graph(safe));

    return (
        <div className="App">
            <DependenciesContext.Provider value={dependencies}>
                {children}
            </DependenciesContext.Provider>
        </div>
    )
}

const useDependency = (): Graph => {
    const value = React.useContext(DependenciesContext)
    if (value == undefined) {
        throw new Error('You probably forgot to put <DependenciesProvider>.');
    }
    return value
}

export const useWeb3 = (): any => {
    return useDependency().web3.get();
}

export const useDelegateRepository = (): DelegateRepository => {
    return useDependency().delegateRepository.get();
}

export default DependenciesProvider