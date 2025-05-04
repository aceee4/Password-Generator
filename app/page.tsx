"use client"

import { useState, useEffect } from "react"
import { Clipboard, Check, RefreshCw, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

type PasswordResult = {
  password: string
  strength: number
  strengthLabel: string
  entropy: number
  crackTime: string
  characterTypes: {
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
  }
}

export default function PasswordGenerator() {
  const [passwordResult, setPasswordResult] = useState<PasswordResult | null>(null)
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [requireAll, setRequireAll] = useState(true)
  const [customCharset, setCustomCharset] = useState("")
  const [useCustomCharset, setUseCustomCharset] = useState(false)
  
  const [copied, setCopied] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    generatePassword()
  }, [])

  const generatePassword = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/generate-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          length,
          uppercase,
          lowercase,
          numbers,
          symbols,
          excludeSimilar,
          excludeAmbiguous,
          requireAll,
          useCustomCharset,
          customCharset,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      setPasswordResult(data)
      setCopied(false)
    } catch (error) {
      setError("Failed to generate password.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!passwordResult) return

    navigator.clipboard.writeText(passwordResult.password)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const getStrengthColor = (strength: number) => {
    if (strength < 30) return "bg-red-500"
    if (strength < 60) return "bg-yellow-500"
    if (strength < 80) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthBackground = (strength: number) => {
    if (strength < 30) return "bg-red-950/20"
    if (strength < 60) return "bg-yellow-950/20"
    if (strength < 80) return "bg-blue-950/20"
    return "bg-green-950/20"
  }

  const getStrengthBorder = (strength: number) => {
    if (strength < 30) return "border-red-500/50"
    if (strength < 60) return "border-yellow-500/50"
    if (strength < 80) return "border-blue-500/50"
    return "border-green-500/50"
  }

  const getStrengthText = (strength: number) => {
    if (strength < 30) return "text-red-400"
    if (strength < 60) return "text-yellow-400"
    if (strength < 80) return "text-blue-400"
    return "text-green-400"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0c] p-4">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Password Generator</h1>
          <p className="text-gray-400 mt-2">Create strong, secure passwords with advanced options</p>
        </div>

        {passwordResult && (
          <Card
            className={`bg-[#1c1c1c] border-2 ${getStrengthBorder(passwordResult.strength)} text-white overflow-hidden transition-all duration-300`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Your Password</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="text-gray-400 hover:text-white"
                  >
                    {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{passwordVisible ? "Hide password" : "Show password"}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    className="text-gray-400 hover:text-white"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                    <span className="sr-only">Copy to clipboard</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  value={passwordResult.password}
                  type={passwordVisible ? "text" : "password"}
                  readOnly
                  className="bg-[#2c2c2c] border-[#3c3c3c] text-white font-mono pr-10 text-lg"
                />
                {copied && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-md">
                    Copied!
                  </div>
                )}
              </div>

              <div className={`p-3 rounded-md ${getStrengthBackground(passwordResult.strength)}`}>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={getStrengthText(passwordResult.strength)}>
                      Strength: <span className="font-bold">{passwordResult.strengthLabel}</span>
                    </span>
                    <span className={getStrengthText(passwordResult.strength)}>
                      {Math.round(passwordResult.strength)}%
                    </span>
                  </div>
                  <Progress
                    value={passwordResult.strength}
                    className="h-2 bg-[#2c2c2c]"
                    indicatorClassName={getStrengthColor(passwordResult.strength)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mt-3">
                  <div className="flex items-center">
                    <span className="mr-1">Length:</span>
                    <Badge variant="outline" className="text-xs">
                      {passwordResult.password.length}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">Entropy:</span>
                    <Badge variant="outline" className="text-xs">
                      ~{passwordResult.entropy} bits
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">Crack time:</span>
                    <Badge variant="outline" className="text-xs">
                      {passwordResult.crackTime}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">Character types:</span>
                    <div className="flex space-x-1">
                      {passwordResult.characterTypes.uppercase && (
                        <Badge variant="secondary" className="text-[0.65rem] px-1 py-0 h-4 bg-purple-900/50">
                          A
                        </Badge>
                      )}
                      {passwordResult.characterTypes.lowercase && (
                        <Badge variant="secondary" className="text-[0.65rem] px-1 py-0 h-4 bg-blue-900/50">
                          a
                        </Badge>
                      )}
                      {passwordResult.characterTypes.numbers && (
                        <Badge variant="secondary" className="text-[0.65rem] px-1 py-0 h-4 bg-green-900/50">
                          0
                        </Badge>
                      )}
                      {passwordResult.characterTypes.symbols && (
                        <Badge variant="secondary" className="text-[0.65rem] px-1 py-0 h-4 bg-yellow-900/50">
                          $
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-[#1c1c1c] border-[#2c2c2c] text-white">
          <CardHeader>
            <CardTitle>Options</CardTitle>
            <CardDescription className="text-gray-400">Customize your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="length" className="text-white">
                    Length: {length}
                  </Label>
                  <Input
                    id="length"
                    type="number"
                    min={4}
                    max={128}
                    value={length}
                    onChange={(e) => setLength(Number.parseInt(e.target.value) || 16)}
                    className="w-20 bg-[#2c2c2c] border-[#3c3c3c] text-white"
                  />
                </div>
                <Slider
                  value={[length]}
                  min={4}
                  max={128}
                  step={1}
                  onValueChange={(value) => setLength(value[0])}
                  className="py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={uppercase}
                    onCheckedChange={(checked) => setUppercase(!!checked)}
                    disabled={useCustomCharset}
                  />
                  <Label htmlFor="uppercase" className={`text-white ${useCustomCharset ? "opacity-50" : ""}`}>
                    Uppercase (A-Z)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={lowercase}
                    onCheckedChange={(checked) => setLowercase(!!checked)}
                    disabled={useCustomCharset}
                  />
                  <Label htmlFor="lowercase" className={`text-white ${useCustomCharset ? "opacity-50" : ""}`}>
                    Lowercase (a-z)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={numbers}
                    onCheckedChange={(checked) => setNumbers(!!checked)}
                    disabled={useCustomCharset}
                  />
                  <Label htmlFor="numbers" className={`text-white ${useCustomCharset ? "opacity-50" : ""}`}>
                    Numbers (0-9)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={symbols}
                    onCheckedChange={(checked) => setSymbols(!!checked)}
                    disabled={useCustomCharset}
                  />
                  <Label htmlFor="symbols" className={`text-white ${useCustomCharset ? "opacity-50" : ""}`}>
                    Symbols (!@#$%^&*)
                  </Label>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced-options" className="border-[#3c3c3c]">
                <AccordionTrigger className="text-white hover:text-purple-400">Advanced Options</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="exclude-similar"
                          checked={excludeSimilar}
                          onCheckedChange={(checked) => setExcludeSimilar(!!checked)}
                          disabled={useCustomCharset}
                        />
                        <Label
                          htmlFor="exclude-similar"
                          className={`text-white ${useCustomCharset ? "opacity-50" : ""}`}
                        >
                          Exclude similar characters (i, l, 1, L, o, 0, O)
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="exclude-ambiguous"
                          checked={excludeAmbiguous}
                          onCheckedChange={(checked) => setExcludeAmbiguous(!!checked)}
                          disabled={useCustomCharset}
                        />
                        <Label
                          htmlFor="exclude-ambiguous"
                          className={`text-white ${useCustomCharset ? "opacity-50" : ""}`}
                        >
                          Exclude ambiguous characters {"{"} {"}"}[ ]( )\/'"` ~,;:.{"<"} {">"}
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="require-all"
                          checked={requireAll}
                          onCheckedChange={(checked) => setRequireAll(!!checked)}
                          disabled={useCustomCharset}
                        />
                        <Label htmlFor="require-all" className={`text-white ${useCustomCharset ? "opacity-50" : ""}`}>
                          Require at least one character from each selected type
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="custom-charset" className="text-white">
                          Custom character set
                        </Label>
                        <Switch
                          id="use-custom-charset"
                          checked={useCustomCharset}
                          onCheckedChange={setUseCustomCharset}
                        />
                      </div>
                      <Input
                        id="custom-charset"
                        value={customCharset}
                        onChange={(e) => setCustomCharset(e.target.value)}
                        placeholder="Enter custom characters to use"
                        className="bg-[#2c2c2c] border-[#3c3c3c] text-white font-mono"
                        disabled={!useCustomCharset}
                      />
                      <p className="text-xs text-gray-400">
                        When enabled, only these characters will be used in password generation
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter>
            <Button
              onClick={generatePassword}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading || (!uppercase && !lowercase && !numbers && !symbols && !useCustomCharset)}
            >
              {loading ? (
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </div>
              ) : (
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Password
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
