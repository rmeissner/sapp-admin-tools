import React from 'react'
import { Safe } from '../utils/safe'
import TextField from '@material-ui/core/TextField'
import { Services } from '../utils/services'
import { ContractInterface } from '../utils/repositories/interfaceRepository'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import ReviewDialog from './ReviewDialog'
import Divider from '@material-ui/core/Divider';
import { ProposedTransaction } from './models'

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

interface Props {
    safe: Safe,
    services: Services
}
const Dashboard: React.FC<Props> = ({ safe, services }) => {
    const classes = useStyles();
    const [reviewing, setReviewing] = React.useState<boolean>(false);
    const [selectedMethodIndex, setSelectedMethodIndex] = React.useState<number>(0);
    const [addressOrAbi, setAddressOrAbi] = React.useState<string | undefined>(undefined);
    const [contract, setContract] = React.useState<ContractInterface | undefined>(undefined);
    const [inputCache, setInputCache] = React.useState<string[]>([]);
    const [transactions, setTransactions] = React.useState<ProposedTransaction[]>([]);
    const [to, setTo] = React.useState<string>("");
    const [value, setValue] = React.useState<string>("");

    const handleAddressOrABI = React.useCallback(async (input: string) => {
        const cleanInput = input.trim()
        setAddressOrAbi(cleanInput)
        if (to.length == 0 && services.web3().utils.isAddress(cleanInput))
            setTo(cleanInput)
        try {
            const contract = await services.interfaceRepo().loadAbi(cleanInput)
            console.log(contract)
            setContract(contract)
        } catch (e) {
            console.error(e)
        }
    }, [services, to])

    const handleMethod = React.useCallback(async (methodIndex: number) => {
        if (!contract || contract.methods.length <= methodIndex) return
        setSelectedMethodIndex(methodIndex)
        console.log(contract.methods[methodIndex])
    }, [contract])

    const handleInput = React.useCallback(async (inputIndex: number, input: string) => {
        inputCache[inputIndex] = input
        setInputCache(inputCache.slice())
    }, [inputCache])

    const method = (contract && contract.methods.length > selectedMethodIndex) ? contract.methods[selectedMethodIndex] : undefined

    const addTransaction = React.useCallback(async () => {
        let description = ""
        let data = ""
        const web3 = services.web3()
        if (contract && contract.methods.length > selectedMethodIndex) {
            const method = contract.methods[selectedMethodIndex]
            const cleanInputs = []
            description = method.name + " ("
            for (let i = 0; i < method.inputs.length; i++) {
                const cleanValue = inputCache[i] || ""
                cleanInputs[i] = cleanValue
                if (i > 0) description += ", "
                const input = method.inputs[i]
                description += (input.name || input.type) + ": " + cleanValue
            }
            description += ")"
            data = web3.eth.abi.encodeFunctionCall(method, cleanInputs)
        }
        try {
            const cleanTo = web3.utils.toChecksumAddress(to)
            const cleanValue = (value.length > 0) ? web3.utils.toWei(value) : 0
            if (data.length == 0) data = "0x"
            if (description.length == 0) {
                description = `Transfer ${value} ETH to ${cleanTo}`
            }
            transactions.push({ description, raw: {to: cleanTo, value: cleanValue, data}})
            setInputCache([])
            setTransactions(transactions)
            setSelectedMethodIndex(0)
            setValue("")
        } catch(e) {
            console.error(e)
        }
    }, [services, transactions, to, value, contract, selectedMethodIndex, inputCache])

    const deleteTransaction = React.useCallback(async (inputIndex: number) => {
        const newTxs = transactions.slice()
        newTxs.splice(inputIndex, 1)
        setTransactions(newTxs)
    }, [transactions])

    const clearTransactions = () => {
        setInputCache([])
        setTransactions([])
        setSelectedMethodIndex(0)
    }
    
    const sendTransactions = React.useCallback(async () => {
        if (transactions.length == 0) return
        try {
            safe.sendTransactions(transactions.map((d) => d.raw))
        } catch(e) {
            console.error(e)
        }
    }, [safe, transactions])

    const handleSubmit = () => {
        sendTransactions()
        setReviewing(false)
    }

    const handleDismiss = () => {
        setReviewing(false)
    }

    return <>
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" width="100%" height={48}>
            <Typography className={classes.heading}>{transactions.length} Transaction(s)</Typography>
            {transactions.length > 0 ? <Button variant="contained" color="primary" onClick={() => setReviewing(true) }>Review</Button> : <></>}
        </Box>

        <ReviewDialog 
            visible={reviewing} 
            transactions={transactions} 
            onDismiss={handleDismiss} 
            onSubmit={handleSubmit} 
            deleteTransaction={deleteTransaction} />
        
        <Typography
            style={{ marginTop: 10 }}
            color="textSecondary"
            display="block"
            variant="caption"
        >
          Optional: Contract ABI source
        </Typography>
        <Divider />

        <TextField 
            style={{ marginTop: 10 }}
            value={addressOrAbi} 
            label="Contract Address or ABI" 
            variant="outlined" 
            onChange={(e) => handleAddressOrABI(e.target.value)} />

        <Typography
            style={{ marginTop: 20 }}
            color="textSecondary"
            display="block"
            variant="caption"
        >
            Transaction information
        </Typography>
        <Divider />

        <TextField 
            style={{ marginTop: 10 }}
            value={to} 
            label="To Address" 
            variant="outlined" 
            onChange={(e) => setTo(e.target.value)} />

        {
            !((contract && !contract.payableFallback) || (method && !method.payable)) && 
                <TextField 
                    style={{ marginTop: 10 }}
                    value={value} 
                    label="ETH" 
                    variant="outlined" 
                    onChange={(e) => setValue(e.target.value)} />
        }

        {(!addressOrAbi || !contract) ? <></> : 
        <>
            {contract.methods.length == 0 ? 
                <Typography style={{ marginTop: 10 }}>Contract doesn't have any public methods</Typography>
            :
                <Select
                    style={{ marginTop: 10 }}
                    value={selectedMethodIndex}
                    onChange={(e) => { handleMethod(e.target.value as number) }}
                >
                    {contract.methods.map((method, index) => (
                        <MenuItem value={index}>{method.name}</MenuItem>
                    ))}
                </Select>
            }
            {
                method && method.inputs.map((input, index) => (
                    <TextField 
                        style={{ marginTop: 10 }}
                        value={inputCache[index] || ""} 
                        label={`${input.name || ""}(${input.type})`} 
                        onChange={(e) => handleInput(index, e.target.value)} />
                )) 
            }
        </>
        }
            
        <Divider
            style={{ marginTop: 10 }} />

        <Button 
            style={{ marginTop: 10 }}
            variant="contained" color="primary"
            onClick={() => addTransaction() }>
                Add transaction
        </Button>
    </>
}
  
  export default Dashboard;