import Web3 from "web3"
import InterfaceRepo from "./repositories/interfaceRepository"
import { Safe } from "./safe"

export interface Services {
    web3(): any
    interfaceRepo(): InterfaceRepo
}

class SafeBasedServices implements Services {
    _safe: Safe
    _web3: any | undefined
    _interfaceRepo: InterfaceRepo | undefined
    constructor(safe: Safe) {
        this._safe = safe
    }
    
    web3() { 
        if (!this._web3) {
            console.log(this._safe.getSafeInfo().network)
            this._web3 = new Web3(new Web3.providers.HttpProvider(`https://${this._safe.getSafeInfo().network}.infura.io/v3/8c45ecc4f2e944c7866d974d6dcd52c9`))
        }
        return this._web3
    }
    interfaceRepo() { 
        if (!this._interfaceRepo) {
            this._interfaceRepo = new InterfaceRepo(this._safe, this.web3()) 
        }
        return this._interfaceRepo
    }
}

const buildServices = (safe: Safe): Services => {
    return new SafeBasedServices(safe)
}

export default buildServices