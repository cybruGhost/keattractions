CREATE TABLE IF NOT EXISTS safaris (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(255),
  priceUSD DECIMAL(10, 2) NOT NULL,
  priceKES DECIMAL(10, 2) NOT NULL,
  featured BOOLEAN DEFAULT 0,
  duration INT NOT NULL,
  itinerary TEXT,
  included TEXT,
  not_included TEXT,
  gallery TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

