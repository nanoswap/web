import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { XYPlot, XAxis, YAxis, VerticalBarSeries, LineSeries } from 'react-vis';
import { useParams } from 'react-router-dom';
import { useAuth } from 'pages/authentication/auth-forms/AuthProvider';
import ImageComponent from 'components/ImageUUID';
import LoanRepaymentChart from 'pages/loan-details/LoanRepaymentChart';

const LoanDetails = () => {
    const { loanId } = useParams();
    const { user } = useAuth();

    const [loanData, setLoanData] = useState(null);

    useEffect(() => {
        const loadLoanDetails = async () => {
            const result = await fetch(`http://127.0.0.1:8000/loan?loan_id=${loanId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                    'X-User-Uid': user.uid
                }
            }).then((res) => res.json());

            setLoanData(result);
        };

        loadLoanDetails();
    }, [loanId]);

    if (!loanData) {
        return <div>Loading...</div>;
    }

    const paymentData = loanData.repaymentSchedule.map((payment, index) => {
        const cumulativePaid = loanData.repaymentSchedule.slice(0, index + 1).reduce((sum, p) => sum + p.amountDue, 0);
        const cumulativePrincipalPaid = (loanData.principalAmount / loanData.repaymentSchedule.length) * (index + 1);
        const cumulativeInterestPaid = cumulativePaid - cumulativePrincipalPaid;
        const remainingDebt = loanData.repaymentSchedule.reduce((sum, p) => sum + p.amountDue, 0) - cumulativePaid;

        return {
            x: new Date(payment.dueDate),
            y: payment.amountDue,
            interest: cumulativeInterestPaid,
            yCumulative: remainingDebt
        };
    });

    return (
        <Box pt={2} px={2}>
            <Grid item xs={12}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                        <ImageComponent ipfsLink={loanData.metadata.loanImageLink} size="medium" />
                    </Grid>
                    <Grid item>
                        <Typography variant="h4">Loan Details</Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper>
                        <Box m={500}>
                            <Grid container>
                                <Grid item m={500}>
                                    <Typography variant="h5">Principal Amount: {loanData.principalAmount}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>
                <Typography variant="h6">Repayment Schedule</Typography>
                <Grid item xs={12}>
                    <Paper>
                        <Box m={500}>
                            <Box m={500}>
                                <LoanRepaymentChart data={paymentData} />
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Typography variant="h6">Payment Details</Typography>
                <Grid item xs={12}>
                    <Paper>
                        <Box m={500}>
                            <Box m={500}>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID Image</TableCell>
                                                <TableCell>Amount Due</TableCell>
                                                <TableCell>Due Date</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {loanData.repaymentSchedule.map((payment) => (
                                                <TableRow key={payment.paymentId}>
                                                    <TableCell>
                                                        <Box m={1}>
                                                            <ImageComponent ipfsLink={payment.imageLink} size="medium" />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{payment.amountDue}</TableCell>
                                                    <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default LoanDetails;
