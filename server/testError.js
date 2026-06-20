import { connectDB } from './db.js';
import Invoice from './models/Invoice.js';

const run = async () => {
    await connectDB();
    try {
        const invData = {
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
            dueDate: new Date(),
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
            remarks: 'First installment',
            invoiceNumber: 'INV002002',
            receiptNumber: 'RCPT002002',
            date: new Date(),
            time: '12:00 PM',
            qrCodeData: '{}',
            verificationUrl: 'http://none'
        };
        const inv = new Invoice(invData);
        await inv.save();
        console.log("Success");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
};

run();
