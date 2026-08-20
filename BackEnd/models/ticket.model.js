import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    ticketType: {
        type: String,
        enum: ['Regular', 'VIP'],  // You can expand the types as needed
        default: 'Regular',
    },
    status: {
        type: String,
        enum: ['Booked', 'Cancelled'],
        default: 'Booked',  // The ticket is initially booked
    },
    bookingCode: {
        type: String, 
    },
    numberOfTickets: {
        type: Number,
        default: 1,  // Default is 1 ticket per booking
    },
    bookingDate: { 
        type: Date, 
        default: Date.now 
    }
}, {timestamps: true});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
