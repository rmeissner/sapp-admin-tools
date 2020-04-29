import React from 'react';
import { Safe } from '../utils/safe';
import TextField from '@material-ui/core/TextField';
import { Services } from '../utils/services';
import { ContractInterface } from '../utils/repositories/interfaceRepository';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

interface ProposedTransaction {
    description: string
    raw: any
}
interface Props {
    safe: Safe,
    services: Services
}
const Dashboard: React.FC<Props> = ({ safe, services }) => {
    const classes = useStyles();
    const [selectedMethodIndex, setSelectedMethodIndex] = React.useState<number>(0);
    const [target, setTarget] = React.useState<string | undefined>(undefined);
    const [contract, setContract] = React.useState<ContractInterface | undefined>(undefined);
    const [inputCache, setInputCache] = React.useState<string[]>([]);
    const [transactions, setTransactions] = React.useState<ProposedTransaction[]>([]);
    const handleAddress = React.useCallback(async (address: string) => {
        setTarget(address)
        try {
            const contract = await services.interfaceRepo().loadAbi(address)
            console.log(contract)
            setContract(contract)
        } catch (e) {
            console.error(e)
        }
    }, [services])

    const handleMethod = React.useCallback(async (methodIndex: number) => {
        if (!contract || contract.methods.length <= methodIndex) return
        setSelectedMethodIndex(methodIndex)
        console.log(contract.methods[methodIndex])
    }, [contract])

    const handleInput = React.useCallback(async (inputIndex: number, input: string) => {
        inputCache[inputIndex] = input
        setInputCache(inputCache.slice())
    }, [inputCache])

    const addTransaction = React.useCallback(async () => {
        if (!contract || contract.methods.length <= selectedMethodIndex) return
        const method = contract.methods[selectedMethodIndex]
        const web3 = services.web3()
        const cleanInputs = []
        let description = method.name + " ("
        for (let i = 0; i < method.inputs.length; i++) {
            const cleanValue = inputCache[i] || ""
            cleanInputs[i] = cleanValue
            if (i > 0) description += ", "
            const input = method.inputs[i]
            description += (input.name || input.type) + ": " + cleanValue
        }
        description += ")"
        try {
            const data = web3.eth.abi.encodeFunctionCall(method, cleanInputs)
            transactions.push({ description, raw: {to: target, value: 0, data}})
            setInputCache([])
            setTransactions(transactions)
            setSelectedMethodIndex(0)
        } catch(e) {
            console.error(e)
        }
    }, [services, transactions, target, contract, selectedMethodIndex, inputCache])

    const deleteTransaction = React.useCallback(async (inputIndex: number) => {
        const newTxs = transactions.slice()
        newTxs.splice(inputIndex, 1)
        setTransactions(newTxs)
    }, [transactions])
    
    const sendTransactions = React.useCallback(async () => {
        if (transactions.length == 0) return
        try {
            safe.sendTransactions(transactions.map((d) => d.raw))
            setInputCache([])
            setTransactions([])
            setSelectedMethodIndex(0)
        } catch(e) {
            console.error(e)
        }
    }, [safe, transactions])
    return <>
        <ExpansionPanel>
            <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            >
                <Box display="flex" flexDirection="row-reverse" alignItems="center" justifyContent="space-between" width="100%">
                    <Button variant="contained" color="primary" onClick={() => sendTransactions() }>Send</Button>
                    <Typography className={classes.heading}>{transactions.length} Transaction(s)</Typography>
                </Box>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <Box  flexDirection="column" width="100%">
                    {transactions.map((tx, index) => (
                        <Box display="flex" flexDirection="row-reverse" alignItems="center" justifyContent="space-between" width="100%">
                            <Button variant="contained" color="secondary" onClick={() => deleteTransaction(index) }>Delete</Button>
                            <Typography>{tx.description}</Typography>
                        </Box>
                    ))}
                </Box>
            </ExpansionPanelDetails>
        </ExpansionPanel>

        <TextField 
            style={{ marginTop: 10 }}
            value={target} 
            label="Target" 
            variant="outlined" 
            onChange={(e) => handleAddress(e.target.value)} />

        {(!target || !contract) ? <></> : 
        <>
            <Select
                style={{ marginTop: 10 }}
                value={selectedMethodIndex}
                onChange={(e) => { handleMethod(e.target.value as number) }}
            >
                {contract.methods.map((method, index) => (
                    <MenuItem value={index}>{method.name}</MenuItem>
                ))}
            </Select>
            {
            contract.methods.length > selectedMethodIndex ? 
                contract.methods[selectedMethodIndex].inputs.map((input, index) => (
                    <TextField 
                        style={{ marginTop: 10 }}
                        value={inputCache[index] || ""} 
                        label={`${input.name || ""}(${input.type})`} 
                        onChange={(e) => handleInput(index, e.target.value)} />
                )) : 
                <></> 
            }
            <Button 
                style={{ marginTop: 10 }}
                variant="contained" color="primary"
                onClick={() => addTransaction() }>
                    Add transaction
            </Button>
        </>
        }
    </>
}
  
  export default Dashboard;