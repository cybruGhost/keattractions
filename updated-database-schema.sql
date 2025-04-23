--initial sql database
-- Create the database
CREATE DATABASE IF NOT EXISTS savanak_ke;
USE savanak_ke;

-- Create attractions table
CREATE TABLE IF NOT EXISTS attractions (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  image VARCHAR(255) NOT NULL,
  rating DECIMAL(3,1) DEFAULT 0,
  reviews INT DEFAULT 0,
  priceUSD DECIMAL(10,2) NOT NULL,
  priceKES DECIMAL(10,2) NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  longDescription TEXT,
  bestTimeToVisit VARCHAR(255),
  duration VARCHAR(100),
  lat DECIMAL(10,6) DEFAULT 0,
  lng DECIMAL(10,6) DEFAULT 0,
  gallery JSON,
  activities JSON,
  included JSON,
  notIncluded JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table (replacing Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  username VARCHAR(100),
  phone_number VARCHAR(20),
  avatar_url VARCHAR(255),
  bio TEXT,
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create safaris table
CREATE TABLE IF NOT EXISTS safaris (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration VARCHAR(100) NOT NULL,
  max_people INT NOT NULL,
  image VARCHAR(255) NOT NULL,
  priceUSD DECIMAL(10,2) NOT NULL,
  priceKES DECIMAL(10,2) NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  itinerary JSON,
  included JSON,
  not_included JSON,
  gallery JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  booking_type ENUM('attraction', 'safari') NOT NULL,
  item_id VARCHAR(100) NOT NULL,
  booking_date DATE NOT NULL,
  travel_date DATE NOT NULL,
  adults INT NOT NULL DEFAULT 1,
  children INT NOT NULL DEFAULT 0,
  accommodation_type VARCHAR(100),
  special_requests TEXT,
  total_price_usd DECIMAL(10,2) NOT NULL,
  total_price_kes DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  deposit_paid BOOLEAN DEFAULT FALSE,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('unpaid', 'partially_paid', 'paid', 'refunded') DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  review_type ENUM('attraction', 'safari') NOT NULL,
  item_id VARCHAR(100) NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample safari data
INSERT INTO safaris (
  id, name, description, duration, max_people, image, 
  priceUSD, priceKES, featured, itinerary, included, not_included
) VALUES 
(
  'classic-kenya-safari',
  'Classic Kenya Safari',
  'Experience the best of Kenya\'s wildlife in Maasai Mara, Lake Nakuru, and Amboseli.',
  '7 Days',
  8,
  '/placeholder.svg?height=200&width=400',
  1299,
  168870,
  TRUE,
  JSON_ARRAY(
    JSON_OBJECT('day', 1, 'title', 'Arrival in Nairobi', 'description', 'Arrive at Jomo Kenyatta International Airport. Transfer to your hotel in Nairobi for overnight stay.'),
    JSON_OBJECT('day', 2, 'title', 'Nairobi to Maasai Mara', 'description', 'After breakfast, drive to the world-famous Maasai Mara Game Reserve. Afternoon game drive.'),
    JSON_OBJECT('day', 3, 'title', 'Maasai Mara', 'description', 'Full day in the Maasai Mara with morning and afternoon game drives.'),
    JSON_OBJECT('day', 4, 'title', 'Maasai Mara to Lake Nakuru', 'description', 'Drive to Lake Nakuru National Park, known for its flamingos and rhinos. Afternoon game drive.'),
    JSON_OBJECT('day', 5, 'title', 'Lake Nakuru to Amboseli', 'description', 'Travel to Amboseli National Park, with views of Mount Kilimanjaro. Evening game drive.'),
    JSON_OBJECT('day', 6, 'title', 'Amboseli National Park', 'description', 'Full day in Amboseli with game drives and optional Maasai village visit.'),
    JSON_OBJECT('day', 7, 'title', 'Amboseli to Nairobi - Departure', 'description', 'Morning game drive, then return to Nairobi for departure.')
  ),
  JSON_ARRAY('All park entrance fees', 'Professional safari guide', 'Transport in a 4x4 safari vehicle', 'Full board accommodation', 'Bottled water'),
  JSON_ARRAY('International flights', 'Visa fees', 'Travel insurance', 'Personal expenses', 'Tips and gratuities')
),
(
  'big-five-adventure',
  'Big Five Adventure',
  'Track the Big Five (lion, leopard, elephant, buffalo, and rhino) in their natural habitat.',
  '5 Days',
  6,
  '/placeholder.svg?height=200&width=400',
  999,
  129870,
  FALSE,
  JSON_ARRAY(
    JSON_OBJECT('day', 1, 'title', 'Nairobi to Ol Pejeta Conservancy', 'description', 'Drive to Ol Pejeta Conservancy, home to the last two northern white rhinos. Afternoon game drive.'),
    JSON_OBJECT('day', 2, 'title', 'Ol Pejeta Conservancy', 'description', 'Full day game drives focusing on rhino and lion tracking.'),
    JSON_OBJECT('day', 3, 'title', 'Ol Pejeta to Lake Nakuru', 'description', 'Travel to Lake Nakuru National Park, known for its rhino sanctuary. Afternoon game drive.'),
    JSON_OBJECT('day', 4, 'title', 'Lake Nakuru to Maasai Mara', 'description', 'Drive to Maasai Mara, home to large populations of lions, leopards, and buffalo. Evening game drive.'),
    JSON_OBJECT('day', 5, 'title', 'Maasai Mara to Nairobi - Departure', 'description', 'Early morning game drive focusing on leopard sightings, then return to Nairobi.')
  ),
  JSON_ARRAY('All park entrance fees', 'Professional safari guide', 'Transport in a 4x4 safari vehicle', 'Full board accommodation', 'Bottled water'),
  JSON_ARRAY('International flights', 'Visa fees', 'Travel insurance', 'Personal expenses', 'Tips and gratuities')
),
(
  'coastal-escape',
  'Coastal Escape',
  'Relax on the beautiful beaches of Mombasa and explore marine life.',
  '4 Days',
  10,
  '/placeholder.svg?height=200&width=400',
  799,
  103870,
  FALSE,
  JSON_ARRAY(
    JSON_OBJECT('day', 1, 'title', 'Arrival in Mombasa', 'description', 'Arrive at Moi International Airport, Mombasa. Transfer to your beach resort.'),
    JSON_OBJECT('day', 2, 'title', 'Diani Beach', 'description', 'Day at leisure on Diani Beach. Optional water sports activities available.'),
    JSON_OBJECT('day', 3, 'title', 'Marine Park Excursion', 'description', 'Glass-bottom boat trip to Kisite-Mpunguti Marine Park. Snorkeling and dolphin watching.'),
    JSON_OBJECT('day', 4, 'title', 'Departure', 'description', 'Morning at leisure. Transfer to Mombasa airport for departure.')
  ),
  JSON_ARRAY('Airport transfers', 'Accommodation in beach resort', 'Breakfast and dinner daily', 'Marine park excursion', 'Snorkeling equipment'),
  JSON_ARRAY('International flights', 'Visa fees', 'Travel insurance', 'Personal expenses', 'Additional water sports activities')
);

