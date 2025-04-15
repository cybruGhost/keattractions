"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Trash2, ShoppingCart, ArrowRight, Calendar, Users, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CartItem {
  id: string
  type: "attraction" | "safari"
  name: string
  image: string
  price: number
  priceKES: number
  quantity: number
  date?: string
  adults: number
  children: number
}

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    // In a real app, you'd fetch the cart from an API or local storage
    // For demo purposes, we'll create some sample items
    const sampleItems: CartItem[] = [
      {
        id: "1",
        type: "attraction",
        name: "Maasai Mara Safari",
        image: "/placeholder.svg?height=200&width=300",
        price: 150,
        priceKES: 150 * 130, // Assuming 1 USD = 130 KES
        quantity: 1,
        date: "2023-12-15",
        adults: 2,
        children: 1,
      },
      {
        id: "2",
        type: "safari",
        name: "Amboseli National Park",
        image: "/placeholder.svg?height=200&width=300",
        price: 200,
        priceKES: 200 * 130,
        quantity: 1,
        date: "2023-12-20",
        adults: 2,
        children: 0,
      },
    ]

    setCartItems(sampleItems)
    setLoading(false)
  }, [])

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    })
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "kenya10") {
      setPromoApplied(true)
      setDiscount(10)
      toast({
        title: "Promo code applied",
        description: "You've received a 10% discount!",
      })
    } else {
      toast({
        title: "Invalid promo code",
        description: "Please enter a valid promo code.",
        variant: "destructive",
      })
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = promoApplied ? (subtotal * discount) / 100 : 0
  const total = subtotal - discountAmount

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      })
      return
    }

    // In a real app, you'd process the checkout
    // For demo purposes, we'll just redirect to the first item's booking page
    if (cartItems.length > 0) {
      const item = cartItems[0]
      router.push(
        `/booking?type=${item.type}&id=${item.id}&adults=${item.adults}&children=${item.children}&date=${item.date || ""}&totalUSD=${total}&totalKES=${total * 130}`,
      )
    }
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <ShoppingCart className="h-6 w-6 mr-2" />
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Button asChild>
              <Link href="/attractions">
                Browse Attractions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                  <CardDescription>Review your selected items</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row gap-4 pb-6 border-b">
                      <div className="relative h-32 w-full md:w-48 rounded-md overflow-hidden flex-shrink-0">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                          </div>
                          <div className="text-right mt-2 md:mt-0">
                            <p className="font-bold">${item.price}</p>
                            <p className="text-sm text-muted-foreground">KES {item.priceKES.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{item.date ? new Date(item.date).toLocaleDateString() : "No date selected"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {item.adults} adults, {item.children} children
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>Quantity: {item.quantity}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <span>{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href="/attractions">Continue Shopping</Link>
                  </Button>
                  <Button onClick={handleCheckout}>Proceed to Checkout</Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {promoApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <div className="text-right">
                      <p>${total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">KES {(total * 130).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="promo-code">Promo Code</Label>
                      <div className="flex gap-2">
                        <Input
                          id="promo-code"
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          disabled={promoApplied}
                        />
                        <Button variant="outline" onClick={handleApplyPromo} disabled={promoApplied || !promoCode}>
                          Apply
                        </Button>
                      </div>
                      {promoApplied && <p className="text-sm text-green-600">Promo code applied!</p>}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

