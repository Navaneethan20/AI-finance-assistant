"use client"

import { useState } from "react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import { Bell, Moon, Sun, Smartphone, Globe, Eye } from "lucide-react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [currencySymbol, setCurrencySymbol] = useState("₹")

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Customize the appearance of the application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-5 w-5 text-orange-500" />
                      <Label htmlFor="light-theme">Light Theme</Label>
                    </div>
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className={theme === "light" ? "bg-gradient-to-r from-primary to-blue-600" : ""}
                    >
                      {theme === "light" ? "Active" : "Select"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-5 w-5 text-orange-500" />
                      <Label htmlFor="dark-theme">Dark Theme</Label>
                    </div>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className={theme === "dark" ? "bg-gradient-to-r from-orange-500 to-orange-600" : ""}
                    >
                      {theme === "dark" ? "Active" : "Select"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-5 w-5" />
                      <Label htmlFor="system-theme">System Theme</Label>
                    </div>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("system")}
                    >
                      {theme === "system" ? "Active" : "Select"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5" />
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                  </div>
                  <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  </div>
                  <Switch id="marketing-emails" checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Notification Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Customize how financial information is displayed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="currency-symbol">Currency Symbol</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={currencySymbol === "₹" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrencySymbol("₹")}
                      >
                        ₹ (INR)
                      </Button>
                      <Button
                        variant={currencySymbol === "$" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrencySymbol("$")}
                      >
                        $ (USD)
                      </Button>
                      <Button
                        variant={currencySymbol === "€" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrencySymbol("€")}
                      >
                        € (EUR)
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5" />
                      <Label htmlFor="show-balance">Show Account Balance</Label>
                    </div>
                    <Switch id="show-balance" defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Display Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}
