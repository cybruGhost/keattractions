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

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  attraction_id VARCHAR(100),
  booking_date DATE NOT NULL,
  adults INT NOT NULL DEFAULT 1,
  children INT NOT NULL DEFAULT 0,
  total_price_usd DECIMAL(10,2) NOT NULL,
  total_price_kes DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE SET NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  attraction_id VARCHAR(100) NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE
);

-- Insert sample attractions data
INSERT INTO attractions (
  id, name, location, image, rating, reviews, 
  priceUSD, priceKES, featured, category, description, 
  longDescription, bestTimeToVisit, duration, 
  lat, lng, gallery, activities, included, notIncluded
) VALUES 
(
  'maasai-mara',
  'Maasai Mara National Reserve',
  'Narok County, Rift Valley',
  '/placeholder.svg?height=600&width=800',
  4.9,
  328,
  149,
  19370,
  TRUE,
  'Wildlife & Safaris',
  'Home to the Great Migration, one of the most spectacular wildlife events in the world.',
  'The Maasai Mara National Reserve is one of Africa\'s most magnificent game reserves. Bordering Tanzania, the Mara is the northern extension of the Serengeti and forms a wildlife corridor between the two countries. It\'s named after the statuesque, red-cloaked Maasai people who live in the park and graze their animals there as they have done for centuries. The park is famous for the Great Migration, when thousands of wildebeest, zebra, and Thomson\'s gazelle travel to and from the Serengeti, from July through October. In the Mara River, thrilling crocodile attacks on drowning wildebeest can be witnessed. The park is also home to the Big Five (lion, leopard, elephant, cape buffalo, and rhinoceros), and over 470 species of birds have been identified in the park.',
  'July to October (Migration), January to February (Calving season)',
  'Recommended 3-4 days',
  -1.5,
  35.1,
  JSON_ARRAY('/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'),
  JSON_ARRAY('Game drives', 'Hot air balloon safaris', 'Cultural visits to Maasai villages', 'Bird watching', 'Photography'),
  JSON_ARRAY('Park entrance fees', 'Professional guide', 'Transportation', 'Bottled water'),
  JSON_ARRAY('International flights', 'Visa fees', 'Personal expenses', 'Travel insurance')
),
(
  'amboseli',
  'Amboseli National Park',
  'Kajiado County',
  '/placeholder.svg?height=600&width=800',
  4.8,
  245,
  129,
  16770,
  FALSE,
  'Wildlife & Safaris',
  'Famous for large elephant herds and stunning views of Mount Kilimanjaro.',
  'Amboseli National Park is situated at the foot of Africa\'s highest mountain, Mount Kilimanjaro. The snow-capped peak of Kilimanjaro forms a majestic backdrop to one of Kenya\'s most spectacular displays of wildlife. The park is famous for being the best place in Africa to get close to free-ranging elephants. Other attractions include opportunities to meet the Maasai people and witness spectacular views of Mount Kilimanjaro. The park is home to more than 50 mammal species, including the African elephant, cape buffalo, impala, lion, cheetah, spotted hyena, giraffe, zebra, and wildebeest. There are also over 400 species of birds, including the African fish eagle, yellow-billed stork, and pelicans.',
  'June to October (Dry season), January to February',
  'Recommended 2-3 days',
  -2.65,
  37.26,
  JSON_ARRAY('/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'),
  JSON_ARRAY('Game drives', 'Elephant watching', 'Bird watching', 'Photography', 'Cultural visits to Maasai villages'),
  JSON_ARRAY('Park entrance fees', 'Professional guide', 'Transportation', 'Bottled water'),
  JSON_ARRAY('International flights', 'Visa fees', 'Personal expenses', 'Travel insurance')
),
(
  'diani-beach',
  'Diani Beach',
  'Kwale County, Coastal Region',
  '/placeholder.svg?height=600&width=800',
  4.7,
  189,
  99,
  12870,
  FALSE,
  'Beaches & Coastal',
  'Pristine white sand beaches and crystal-clear waters of the Indian Ocean.',
  'Diani Beach is a major beach resort on the Indian Ocean coast of Kenya. It\'s located 30 kilometers south of Mombasa, in Kwale County. The beach is about 17 kilometers long, from the Kongo River to the north and Galu Beach to the south. It\'s known for its coral reefs, black-and-white colobus monkeys, and for the closely located Shimba Hills National Reserve. The water remains shallow near shore, with some underwater sandbars, and is ideal for swimming. The beach has become a popular kiteboarding, diving, and snorkeling location. Several professional diving centers provide equipment and training for all levels of experience.',
  'January to March, July to October',
  'Recommended 4-7 days',
  -4.28,
  39.59,
  JSON_ARRAY('/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800', '/placeholder.svg?height=600&width=800'),
  JSON_ARRAY('Swimming', 'Snorkeling', 'Scuba diving', 'Kiteboarding', 'Dolphin watching', 'Glass-bottom boat tours'),
  JSON_ARRAY('Beach access', 'Beach chair and umbrella', 'Welcome drink'),
  JSON_ARRAY('International flights', 'Visa fees', 'Personal expenses', 'Travel insurance', 'Water sports equipment rental')
);

