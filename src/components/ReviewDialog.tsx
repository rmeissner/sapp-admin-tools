import React from 'react'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import { ProposedTransaction } from './models'
import Typography from '@material-ui/core/Typography'

interface Props {
    visible: boolean,
    transactions: ProposedTransaction[],
    deleteTransaction: (index: number) => void,
    onDismiss: () => void,
    onSubmit: () => void
}
const ReviewDialog: React.FC<Props> = ({ visible, transactions, onDismiss, onSubmit, deleteTransaction }) =>  {  
    if (transactions.length == 0) onDismiss()
    return (
      <>
        <Dialog
          open={visible}
          onClose={onDismiss}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Review Transactions"}</DialogTitle>
          <DialogContent>
                <Box flexDirection="column" width="100%">
                    {transactions.map((tx, index) => (
                        <Box display="flex" flexDirection="row-reverse" alignItems="center" justifyContent="space-between" width="100%">
                            <Button variant="contained" color="secondary" onClick={() => deleteTransaction(index) }>Delete</Button>
                            <Typography>{tx.description}</Typography>
                        </Box>
                    ))}
                </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onSubmit} color="primary" autoFocus>
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

export default ReviewDialog