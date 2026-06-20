const invoiceData = {
    branch: "Main Branch",
    collectedBy: "Online Portal",
    memberId: "M197838",
    memberName: "bala",
    memberMobile: "6382820063",
    memberAddress: "address",
    memberAadhar: "123",
    chitName: "Gamma",
    chitGroup: "Group1",
    chitNumber: `CHIT-5000-001`,
    totalChitValue: 5000,
    monthlyAmount: 50,
    duration: 100,
    currentMonth: 1,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    installmentAmount: 50,
    lateFine: 0,
    discount: 0,
    previousDue: 0,
    totalPayable: 50,
    amountPaid: 0,
    balance: 50,
    paymentMethod: 'Pending',
    referenceNumber: '',
    paidInstallments: 0,
    remainingInstallments: 100,
    totalPaid: 0,
    remainingAmount: 5000,
    status: 'Pending',
    remarks: 'First installment'
};

fetch('http://localhost:5000/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoiceData)
}).then(r => r.json()).then(console.log).catch(console.error);
