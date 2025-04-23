--i am Modifying the payment_status column to include 'partially_paid'
ALTER TABLE bookings 
MODIFY COLUMN payment_status ENUM('unpaid', 'paid', 'refunded', 'partially_paid') DEFAULT 'unpaid';

