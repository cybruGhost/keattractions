"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Globe, DollarSign, Mail, Lock, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)

  // General settings
  const [siteName, setSiteName] = useState("Savanak Kenya Tours")
  const [siteDescription, setSiteDescription] = useState(
    "Experience the beauty of Kenya with our premium safari and tour packages.",
  )
  const [contactEmail, setContactEmail] = useState("info@savanak.co.ke")
  const [contactPhone, setContactPhone] = useState("+254 700 000 000")
  const [address, setAddress] = useState("Kenyatta Avenue, Nairobi, Kenya")

  // Payment settings
  const [currency, setCurrency] = useState("USD")
  const [exchangeRate, setExchangeRate] = useState("130")
  const [depositPercentage, setDepositPercentage] = useState("30")
  const [paymentMethods, setPaymentMethods] = useState(["credit-card", "mpesa", "paypal"])

  // Email settings
  const [smtpHost, setSmtpHost] = useState("smtp.example.com")
  const [smtpPort, setSmtpPort] = useState("587")
  const [smtpUser, setSmtpUser] = useState("notifications@savanak.co.ke")
  const [smtpPassword, setSmtpPassword] = useState("••••••••••••")
  const [senderName, setSenderName] = useState("Savanak Kenya Tours")
  const [senderEmail, setSenderEmail] = useState("notifications@savanak.co.ke")

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [adminEmails, setAdminEmails] = useState("admin@savanak.co.ke, manager@savanak.co.ke")
  const [notifyOnBooking, setNotifyOnBooking] = useState(true)
  const [notifyOnPayment, setNotifyOnPayment] = useState(true)
  const [notifyOnContact, setNotifyOnContact] = useState(true)

  const handleSaveSettings = (tab: string) => {
    setSaving(true)

    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      toast({
        title: "Settings Saved",
        description: `${tab} settings have been updated successfully.`,
      })
    }, 1000)
  }

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Configure your website settings</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic website information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea
                    id="site-description"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input id="contact-phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 border rounded-md flex items-center justify-center bg-muted">
                      <Globe className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline" type="button">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Recommended size: 200x200px. Max file size: 2MB.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSaveSettings("General")} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure payment options and currencies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exchange-rate">USD to KES Exchange Rate</Label>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input
                      id="exchange-rate"
                      type="number"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Current rate: 1 USD = {exchangeRate} KES</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deposit-percentage">Deposit Percentage</Label>
                  <div className="relative">
                    <Input
                      id="deposit-percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={depositPercentage}
                      onChange={(e) => setDepositPercentage(e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-2.5">%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Percentage of total amount required as deposit</p>
                </div>

                <div className="space-y-2">
                  <Label>Enabled Payment Methods</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="credit-card"
                        checked={paymentMethods.includes("credit-card")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPaymentMethods([...paymentMethods, "credit-card"])
                          } else {
                            setPaymentMethods(paymentMethods.filter((m) => m !== "credit-card"))
                          }
                        }}
                      />
                      <Label htmlFor="credit-card">Credit/Debit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mpesa"
                        checked={paymentMethods.includes("mpesa")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPaymentMethods([...paymentMethods, "mpesa"])
                          } else {
                            setPaymentMethods(paymentMethods.filter((m) => m !== "mpesa"))
                          }
                        }}
                      />
                      <Label htmlFor="mpesa">M-Pesa</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="paypal"
                        checked={paymentMethods.includes("paypal")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPaymentMethods([...paymentMethods, "paypal"])
                          } else {
                            setPaymentMethods(paymentMethods.filter((m) => m !== "paypal"))
                          }
                        }}
                      />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSaveSettings("Payment")} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>Configure email server settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input id="smtp-host" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-user">SMTP Username</Label>
                    <Input id="smtp-user" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">SMTP Password</Label>
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id="smtp-password"
                        type="password"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender-name">Sender Name</Label>
                    <Input id="sender-name" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sender-email">Sender Email</Label>
                    <Input
                      id="sender-email"
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Test Email Configuration</Label>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Enter email address for test" />
                    <Button variant="outline" type="button">
                      Send Test
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSaveSettings("Email")} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how notifications are sent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Notification Methods</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-emails">Admin Notification Emails</Label>
                  <Textarea
                    id="admin-emails"
                    value={adminEmails}
                    onChange={(e) => setAdminEmails(e.target.value)}
                    placeholder="Enter email addresses separated by commas"
                    rows={2}
                  />
                  <p className="text-sm text-muted-foreground">
                    These email addresses will receive admin notifications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Notification Events</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-booking" checked={notifyOnBooking} onCheckedChange={setNotifyOnBooking} />
                      <Label htmlFor="notify-booking">New Booking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-payment" checked={notifyOnPayment} onCheckedChange={setNotifyOnPayment} />
                      <Label htmlFor="notify-payment">Payment Received</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="notify-contact" checked={notifyOnContact} onCheckedChange={setNotifyOnContact} />
                      <Label htmlFor="notify-contact">Contact Form Submission</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleSaveSettings("Notification")} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

