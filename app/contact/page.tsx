"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Phone, MapPin, Send, Clock, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ContactPage() {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, you'd send this data to your API
      // For demo purposes, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSuccess(true)
      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you soon.",
      })

      // Reset form
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-lg md:text-xl opacity-90">
              We'd love to hear from you. Contact us for any inquiries or to plan your perfect Kenyan adventure.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-green-100 text-green-800 rounded-full p-3 mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Message Sent Successfully!</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Thank you for reaching out. We've received your message and will respond within 24 hours.
                    </p>
                    <Button onClick={() => setIsSuccess(false)}>Send Another Message</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Reach out to us through any of these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:info@savanak.co.ke" className="text-sm text-primary hover:underline">
                      info@savanak.co.ke
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:+254700000000" className="text-sm text-primary hover:underline">
                      +254 700 000 000
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      Savanak Kenya Tours
                      <br />
                      Kenyatta Avenue
                      <br />
                      Nairobi, Kenya
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 8:00 AM - 6:00 PM
                      <br />
                      Saturday: 9:00 AM - 4:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="booking">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="booking">Booking</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="tours">Tours</TabsTrigger>
                  </TabsList>
                  <TabsContent value="booking">
                    <div className="space-y-4 pt-4">
                      <div>
                        <h4 className="font-medium">How do I book a tour?</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          You can book a tour through our website by selecting your desired attraction or safari and
                          following the booking process. Alternatively, you can contact us directly via email or phone.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Can I modify my booking?</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Yes, you can modify your booking up to 7 days before your scheduled tour date. Please contact
                          our customer service team for assistance.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="payment">
                    <div className="space-y-4 pt-4">
                      <div>
                        <h4 className="font-medium">What payment methods do you accept?</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          We accept credit/debit cards, PayPal, and M-Pesa for all bookings. Bank transfers are
                          available for group bookings.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Is my payment secure?</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Yes, all payments are processed through secure payment gateways with industry-standard
                          encryption.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="tours">
                    <div className="space-y-4 pt-4">
                      <div>
                        <h4 className="font-medium">What should I bring on a safari?</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          We recommend bringing comfortable clothing, sun protection, insect repellent, a camera, and
                          any personal medications. A detailed packing list will be provided upon booking.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Are meals included in the tours?</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Most safari packages include meals as specified in the itinerary. Please check the specific
                          tour details for more information.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

