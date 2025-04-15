import Image from "next/image"
import Link from "next/link"
import { MapPin, Mail, Phone, Clock, Users, Award, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=400&width=1920"
            alt="Kenya Landscape"
            fill
            className="object-cover brightness-[0.7]"
            priority
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Savanak.ke</h1>
            <p className="text-xl text-white/90">Your trusted partner for exploring the wonders of Kenya since 2010</p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Savanak.ke was founded in 2010 by a group of passionate Kenyan tourism professionals with a shared
                vision: to showcase the authentic beauty of Kenya to the world while promoting sustainable tourism
                practices.
              </p>
              <p className="text-muted-foreground mb-6">
                What started as a small team operating out of a tiny office in Nairobi has grown into one of Kenya's
                most respected tour operators. Our deep knowledge of Kenya's landscapes, wildlife, and cultures allows
                us to create unforgettable experiences for travelers from around the globe.
              </p>
              <div className="flex items-center gap-4">
                <Button>Our Team</Button>
                <Button variant="outline">Our Values</Button>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image src="/placeholder.svg?height=400&width=600" alt="Savanak Team" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl mb-8">
              To provide exceptional travel experiences that showcase Kenya's natural beauty and cultural heritage while
              promoting conservation and supporting local communities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">Excellence</h3>
                    <p className="text-sm text-muted-foreground">
                      We strive for excellence in every aspect of our service, from planning to execution.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">Sustainability</h3>
                    <p className="text-sm text-muted-foreground">
                      We are committed to environmentally responsible tourism and supporting conservation efforts.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">Community</h3>
                    <p className="text-sm text-muted-foreground">
                      We believe in giving back to local communities and creating positive social impact.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-10 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative h-64">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-primary text-sm mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
              <p className="text-muted-foreground mb-8">
                Have questions about our tours or need help planning your Kenyan adventure? Our team is here to help!
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Our Office</p>
                    <p className="text-muted-foreground">123 Safari Avenue, Nairobi, Kenya</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email Us</p>
                    <p className="text-muted-foreground">info@savanak.ke</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Call Us</p>
                    <p className="text-muted-foreground">+254 123 456 789</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Office Hours</p>
                    <p className="text-muted-foreground">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground">Saturday: 9:00 AM - 1:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-background p-6 rounded-lg border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Send Us a Message</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Your Name
                    </label>
                    <input type="text" id="name" className="w-full p-2 border rounded-md" placeholder="John Doe" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-2 border rounded-md"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full p-2 border rounded-md"
                    placeholder="Inquiry about safari packages"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full p-2 border rounded-md"
                    placeholder="Your message here..."
                  ></textarea>
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-10 text-center">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground flex-1 mb-4">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/testimonials">
              <Button variant="outline">View All Testimonials</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold mb-10 text-center">Our Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="bg-background p-4 rounded-lg border w-full h-24 flex items-center justify-center">
                  <Image
                    src={partner.logo || "/placeholder.svg"}
                    alt={partner.name}
                    width={120}
                    height={60}
                    className="max-h-12 w-auto"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// Sample data
const teamMembers = [
  {
    name: "David Kimani",
    role: "Founder & CEO",
    bio: "With over 20 years of experience in Kenyan tourism, David founded Savanak.ke with a vision to share Kenya's beauty with the world.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Sarah Omondi",
    role: "Head of Operations",
    bio: "Sarah ensures that every safari and tour runs smoothly, with attention to detail and exceptional customer service.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "James Mwangi",
    role: "Lead Safari Guide",
    bio: "A certified wildlife expert with extensive knowledge of Kenya's national parks and animal behavior.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Amina Hassan",
    role: "Customer Relations",
    bio: "Amina is dedicated to ensuring our clients have the best possible experience from first contact to post-trip follow-up.",
    image: "/placeholder.svg?height=300&width=300",
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "United States",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    text: "Our safari with Savanak.ke was absolutely incredible! The guides were knowledgeable, and we saw all of the Big Five. A dream come true!",
  },
  {
    name: "David Chen",
    location: "Canada",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    text: "From booking to the actual safari, everything was seamless. The accommodations were luxurious and the wildlife sightings were spectacular.",
  },
  {
    name: "Emma Williams",
    location: "United Kingdom",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    text: "Diani Beach was paradise! The Savanak.ke team arranged everything perfectly and were always available to answer questions.",
  },
]

const partners = [
  { name: "Kenya Tourism Board", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Kenya Wildlife Service", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Eco Tourism Kenya", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Kenya Association of Tour Operators", logo: "/placeholder.svg?height=60&width=120" },
  { name: "African Travel Association", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Sustainable Travel International", logo: "/placeholder.svg?height=60&width=120" },
]

