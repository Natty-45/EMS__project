import User from '../models/user.model.js';
import Ticket from '../models/ticket.model.js';
import Event from '../models/event.model.js';
import bcrypt from 'bcryptjs';
import path from 'path';//
import fs from 'fs';// Function to validate email format


// Function to validate email format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const updateProfile = async (req, res, next) => {
  try {
    const userIdFromParams = req.params.id;
    const loggedInUserId = req.userId; // User ID from the middleware (VerifiedUser)

    // Check if the logged-in user is trying to update their own profile
    if (userIdFromParams !== loggedInUserId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to update this profile.' });
    }

    const user = await User.findById(userIdFromParams);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { fullName, username, email, password, profilepic } = req.body;

    // Validate email format
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Only update fields that are provided in the request body
    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (email) user.email = email;

    if (password) {
      // Hash the password before saving
      try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      } catch (error) {
        return res.status(500).json({ error: 'Error hashing the password' });
      }
    }

    if (profilepic) {
      const base64Data = profilepic.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const filePath = path.join('uploads', `${Date.now()}.png`);
      fs.writeFileSync(filePath, buffer);
      user.profilePic = filePath;
    }

    // Save updated user data
    try {
      await user.save();
      res.status(200).json({
        message: 'User updated successfully',
        user: {
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          profilePic: user.profilePic,
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Error saving the user data' });
    }

  } catch (error) {
    next(error); // Pass error to next middleware for centralized error handling
  }
};
export const deleteUser = async (req, res, next) => {
    try {
        const userIdFromParams = req.params.id;
        const loggedInUserId = req.userId; // User ID from the middleware (VerifiedUser)

        // Check if the logged-in user is trying to delete their own account
        if (userIdFromParams !== loggedInUserId.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this account.' });
        }

        const user = await User.findByIdAndDelete(userIdFromParams);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Optionally log the deletion action for auditing purposes
        console.log(`User with ID ${userIdFromParams} deleted.`);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);  // Log the error for debugging purposes
        next(error); // Pass error to next middleware for centralized error handling    
    }    
};

export const getTickets = async (req, res, next) => {
    try {
        const userId = req.userId; // User ID from the middleware (VerifiedUser)
       
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Find tickets that belong to the user with populated event data
        const tickets = await Ticket.find({ userId: userId }).populate('eventId', 'title date StartTime location eventType eventCategory host');

        if (!tickets || tickets.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(tickets);
    } catch (error) {
        console.error(error);  // Log the error for debugging purposes
        next(error); // Pass error to next middleware for centralized error handling    
    }    
};


export const getTicketDetails = async (req, res, next) => {
  try {
    const ticketId = req.params.id;
    const userId = req.userId; // User ID from middleware (VerifiedUser)

    // Find the ticket by its ID
    const ticket = await Ticket.findById(ticketId).populate('eventId', 'title date location eventType').populate('userId', 'fullName email');
    
    // Check if the ticket exists
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if the ticket belongs to the logged-in user
    if (ticket.userId._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to view this ticket' });
    }

    // Prepare the response object
    const ticketDetails = {
      ticketId: ticket._id,
      Event: {
        title: ticket.eventId.title,
        date: ticket.eventId.date,
        location: ticket.eventId.location,
        eventType: ticket.eventId.eventType,
      },
      User: {
        fullName: ticket.userId.fullName,
        email: ticket.userId.email,
      },
      ticketType: ticket.ticketType,
      status: ticket.status,
      numberOfTickets: ticket.numberOfTickets,
      bookingCode: ticket.bookingCode,
      bookingDate: ticket.bookingDate,
    };

    res.status(200).json(ticketDetails);
  } catch (error) {
    console.error(error);  // Log the error for debugging purposes
    next(error); // Pass error to next middleware for centralized error handling    
  }
};

// superAdmin: Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    if (req.userRole !== 'superAdmin' && req.userRole !== 'Admin') {
      return res.status(403).json({ error: 'Access Denied. Admins only.' });
    }
    const users = await User.find().select('-password -verificationToken -resetPasswordToken');
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// superAdmin: Update user role
export const updateUserRole = async (req, res, next) => {
  try {
    if (req.userRole !== 'superAdmin') {
      return res.status(403).json({ error: 'Access Denied. Only superAdmin can change roles.' });
    }
    const { role } = req.body;
    const userId = req.params.id;

    if (!['user', 'Admin', 'superAdmin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User role updated', user });
  } catch (error) {
    next(error);
  }
};

// superAdmin: Delete any user
export const adminDeleteUser = async (req, res, next) => {
  try {
    if (req.userRole !== 'superAdmin') {
      return res.status(403).json({ error: 'Access Denied. Only superAdmin can delete users.' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Cancel a ticket
export const cancelTicket = async (req, res, next) => {
  try {
    const userId = req.userId;
    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (ticket.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to cancel this ticket' });
    }
    if (ticket.status === 'Cancelled') {
      return res.status(400).json({ error: 'Ticket already cancelled' });
    }

    ticket.status = 'Cancelled';
    await ticket.save();
    res.status(200).json({ message: 'Ticket cancelled successfully', ticket });
  } catch (error) {
    next(error);
  }
};

export const contactForm = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Send contact email to admin
    const transporter = (await import('../nodeMailer/nodeMailer.config.js')).default;
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL,
      subject: `Contact Form: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `<h3>New Contact Form Submission</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
    });

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    next(error);
  }
};
