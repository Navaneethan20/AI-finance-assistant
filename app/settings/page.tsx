"use client"

import { useState } from "react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import { Bell, Moon, Sun, Smartphone, Globe, Shield, User, Palette, Sliders, Trash2, LogOut } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CustomLoader } from "@/components/ui/custom-loader"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { user, logout } = useAuth()

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  // Display settings
  const [currencySymbol, setCurrencySymbol] = useState("₹")
  const [showBalance, setShowBalance] = useState(true)
  const [chartAnimation, setChartAnimation] = useState(true)
  const [colorScheme, setColorScheme] = useState("default")

  // Privacy settings
  const [anonymizeData, setAnonymizeData] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  // Preferences
  const [language, setLanguage] = useState("en")
  const [dateFormat, setDateFormat] = useState("dd/mm/yyyy")
  const [fontSize, setFontSize] = useState([16])

  // State for loading animations
  const [isSaving, setIsSaving] = useState(false)
  const [savingSection, setSavingSection] = useState<string | null>(null)

  const handleSave = (section: string) => {
    setIsSaving(true)
    setSavingSection(section)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setSavingSection(null)
      toast({
        title: "Settings saved",
        description: `Your ${section} settings have been updated successfully.`,
      })
    }, 1500)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5">
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="display">
              <Sliders className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
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
                <CardTitle className="flex items-center">
                  <Sliders className="h-5 w-5 mr-2 text-primary" />
                  Display Settings
                </CardTitle>
                <CardDescription>Customize how financial information is displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency-symbol">Currency Symbol</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={currencySymbol === "₹" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrencySymbol("₹")}
                        className={currencySymbol === "₹" ? "bg-gradient-to-r from-primary to-primary/80" : ""}
                      >
                        ₹ (INR)
                      </Button>
                      <Button
                        variant={currencySymbol === "$" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrencySymbol("$")}
                        className={currencySymbol === "$" ? "bg-gradient-to-r from-primary to-primary/80" : ""}
                      >
                        $ (USD)
                      </Button>
                      <Button
                        variant={currencySymbol === "€" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrencySymbol("€")}
                        className={currencySymbol === "€" ? "bg-gradient-to-r from-primary to-primary/80" : ""}
                      >
                        € (EUR)
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-balance">Show Account Balance</Label>
                      <p className="text-sm text-muted-foreground">Display your account balance on the dashboard</p>
                    </div>
                    <Switch id="show-balance" checked={showBalance} onCheckedChange={setShowBalance} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="chart-animation">Chart Animations</Label>
                      <p className="text-sm text-muted-foreground">Enable animations in charts and graphs</p>
                    </div>
                    <Switch id="chart-animation" checked={chartAnimation} onCheckedChange={setChartAnimation} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <div className="pt-2">
                      <Slider id="font-size" min={12} max={24} step={1} value={fontSize} onValueChange={setFontSize} />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Small</span>
                        <span>{fontSize}px</span>
                        <span>Large</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color-scheme">Color Scheme</Label>
                    <Select value={colorScheme} onValueChange={setColorScheme}>
                      <SelectTrigger id="color-scheme">
                        <SelectValue placeholder="Select color scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Blue</SelectItem>
                        <SelectItem value="green">Success Green</SelectItem>
                        <SelectItem value="purple">Royal Purple</SelectItem>
                        <SelectItem value="orange">Vibrant Orange</SelectItem>
                        <SelectItem value="teal">Teal Accent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSave("display")}
                  disabled={isSaving && savingSection === "display"}
                  className="w-full"
                >
                  {isSaving && savingSection === "display" ? (
                    <span className="flex items-center gap-2">
                      <CustomLoader type="spinner" size="sm" />
                      Saving...
                    </span>
                  ) : (
                    "Save Display Settings"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>Manage your privacy and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch id="two-factor" checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="anonymize-data">Anonymize Financial Data</Label>
                    <p className="text-sm text-muted-foreground">Hide actual amounts in reports and dashboards</p>
                  </div>
                  <Switch id="anonymize-data" checked={anonymizeData} onCheckedChange={setAnonymizeData} />
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="current-password">Change Password</Label>
                  <Input id="current-password" type="password" placeholder="Current password" />
                  <Input type="password" placeholder="New password" />
                  <Input type="password" placeholder="Confirm new password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSave("privacy")}
                  disabled={isSaving && savingSection === "privacy"}
                  className="w-full"
                >
                  {isSaving && savingSection === "privacy" ? (
                    <span className="flex items-center gap-2">
                      <CustomLoader type="spinner" size="sm" />
                      Saving...
                    </span>
                  ) : (
                    "Save Privacy Settings"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Account Information
                </CardTitle>
                <CardDescription>Manage your personal information and account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input id="display-name" defaultValue={user?.displayName || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={user?.email || ""} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="mr">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy/mm/dd">YYYY/MM/DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="bg-destructive/10 hover:bg-destructive/20 text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
                <Button onClick={() => handleSave("account")} disabled={isSaving && savingSection === "account"}>
                  {isSaving && savingSection === "account" ? (
                    <span className="flex items-center gap-2">
                      <CustomLoader type="spinner" size="sm" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  )
}
