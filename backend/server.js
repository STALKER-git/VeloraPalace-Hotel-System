const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');
const socketManager = require('./socket');
const http = require('http');

// Load env vars
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketManager.init(server);
app.set('io', io); // Make io accessible in requests if needed

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Route files
const rooms = require('./routes/rooms');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');
const restaurant = require('./routes/restaurant');
const services = require('./routes/services');
const payments = require('./routes/payments');
const orders = require('./routes/orders');

// Mount routers
app.use('/api/rooms', rooms);
app.use('/api/auth', auth);
app.use('/api/bookings', bookings);
app.use('/api/restaurant', restaurant);
app.use('/api/services', services);
app.use('/api/payments', payments);
app.use('/api/orders', orders);

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Velora Palace API' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});
