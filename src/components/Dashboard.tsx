import React from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { useSafe } from '../utils/SafeProvider'
import { useDelegateRepository } from '../utils/AppDependencies';

interface Props {
}

const Dashboard: React.FC<Props> = () => {
    const safe = useSafe();
    const delegateRepo = useDelegateRepository()
    const [delegates, setDelegates] = React.useState<{name: string, address: string}[]>([])
    const [newDelegateAddress, setNewDelegateAddress] = React.useState<string>("")
    const [newDelegateLabel, setNewDelegateLabel] = React.useState<string>("")

    const loadDelegates = React.useCallback(async () => {
        try {
            setDelegates(await delegateRepo.loadDelegates())
        } catch (e) {
            console.error(e)
        }
    }, [delegateRepo])

    const addDelegate = React.useCallback(async () => {
        try {
            await delegateRepo.addDelegate(newDelegateAddress, newDelegateLabel)
            await loadDelegates()
        } catch (e) {
            console.error(e)
            console.error(e.response)
        }
    }, [delegateRepo, newDelegateAddress, newDelegateLabel])

    const removeDelegate = React.useCallback(async (delegate) => {
        try {
            await delegateRepo.removeDelegate(delegate)
            await loadDelegates()
        } catch (e) {
            console.error(e)
            console.error(e.response)
        }
    }, [delegateRepo])

    React.useEffect(() => {
        loadDelegates()
    }, [loadDelegates])


    return <>
        {safe.getSafeInfo().safeAddress}<br />
        <TextField 
            style={{ marginTop: 10 }}
            value={newDelegateAddress} 
            label="Delegate Address" 
            variant="outlined" 
            onChange={(e) => setNewDelegateAddress(e.target.value)} />
        <TextField 
            style={{ marginTop: 10 }}
            value={newDelegateLabel} 
            label="Delegate Label" 
            variant="outlined" 
            onChange={(e) => setNewDelegateLabel(e.target.value)} />
        <Button 
            style={{ marginTop: 10 }}
            variant="contained" color="primary"
            onClick={addDelegate}>
                Add Delegate
        </Button>
        <br />
        {delegates.map((d) => <p onClick={() => removeDelegate(d.address)}>{d.name} ({d.address})<br /></p>)}
    </>
}
  
  export default Dashboard;