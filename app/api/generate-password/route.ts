import { type NextRequest, NextResponse } from "next/server"

type PasswordStrength = {
  score: number
  label: string
  crackTime: string
}

export async function POST(request: NextRequest) {
  try {
    const {
      length = 16,
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = true,
      excludeSimilar = false,
      excludeAmbiguous = false,
      requireAll = true,
      useCustomCharset = false,
      customCharset = "",
    } = await request.json()
    
    if (useCustomCharset && !customCharset) {
      return NextResponse.json({ error: "Custom character set is enabled but empty" }, { status: 400 })
    }

    if (!useCustomCharset && !uppercase && !lowercase && !numbers && !symbols) {
      return NextResponse.json({ error: "At least one character type must be selected" }, { status: 400 })
    }
    
    const passwordLength = Math.min(Math.max(Number.parseInt(String(length), 10) || 16, 4), 128)
    
    let uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let lowercaseChars = "abcdefghijklmnopqrstuvwxyz"
    let numberChars = "0123456789"
    let symbolChars = "!@#$%^&*()_-+=<>?/"
    
    if (excludeSimilar) {
      uppercaseChars = uppercaseChars.replace(/[IO]/g, "")
      lowercaseChars = lowercaseChars.replace(/[il]/g, "")
      numberChars = numberChars.replace(/[10]/g, "")
    }

    if (excludeAmbiguous) {
      symbolChars = "!@#$%^&*()_-+="
    }
    
    let charPool = ""
    if (useCustomCharset) {
      charPool = customCharset
    } else {
      if (uppercase) charPool += uppercaseChars
      if (lowercase) charPool += lowercaseChars
      if (numbers) charPool += numberChars
      if (symbols) charPool += symbolChars
    }

    if (charPool.length === 0) {
      return NextResponse.json({ error: "No valid characters available with current settings" }, { status: 400 })
    }
    
    let password = ""
    
    if (requireAll && !useCustomCharset) {
      if (uppercase && uppercaseChars.length > 0) {
        password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length))
      }
      if (lowercase && lowercaseChars.length > 0) {
        password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length))
      }
      if (numbers && numberChars.length > 0) {
        password += numberChars.charAt(Math.floor(Math.random() * numberChars.length))
      }
      if (symbols && symbolChars.length > 0) {
        password += symbolChars.charAt(Math.floor(Math.random() * symbolChars.length))
      }
    }
    
    const remainingLength = passwordLength - password.length
    for (let i = 0; i < remainingLength; i++) {
      const randomIndex = Math.floor(Math.random() * charPool.length)
      password += charPool.charAt(randomIndex)
    }
    
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("")

    const strength = calculatePasswordStrength(password, {
      uppercase,
      lowercase,
      numbers,
      symbols,
    })

    const entropy = calculateEntropy(password, {
      uppercase,
      lowercase,
      numbers,
      symbols,
      excludeSimilar,
      excludeAmbiguous,
    })

    const characterTypes = {
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password),
    }

    return NextResponse.json({
      password,
      strength: strength.score,
      strengthLabel: strength.label,
      entropy: Math.round(entropy),
      crackTime: strength.crackTime,
      characterTypes,
    })
  } catch (error) {
    console.error("Password generation error:", error)
    return NextResponse.json({ error: "Failed to generate password" }, { status: 500 })
  }
}

function calculatePasswordStrength(password: string, options: any): PasswordStrength {
  if (!password) {
    return { score: 0, label: "None", crackTime: "Instant" }
  }
  
  let score = 0
  
  score += Math.min(40, (password.length / 32) * 40)

  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  if (hasUpper) score += 15
  if (hasLower) score += 15
  if (hasNumber) score += 15
  if (hasSymbol) score += 15

  const repeats = (password.match(/(.)\1+/g) || []).length
  score -= repeats * 2

  const sequences = [
    "abcdefghijklmnopqrstuvwxyz",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "0123456789",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM",
  ]

  for (const seq of sequences) {
    for (let i = 0; i < seq.length - 2; i++) {
      const pattern = seq.substring(i, i + 3)
      if (password.includes(pattern)) {
        score -= 5
        break
      }
    }
  }

  score = Math.max(0, Math.min(100, score))

  let label: string
  let crackTime: string

  if (score < 30) {
    label = "Weak"
    crackTime = password.length <= 6 ? "Instant" : "Minutes to Hours"
  } else if (score < 60) {
    label = "Fair"
    crackTime = "Days to Weeks"
  } else if (score < 80) {
    label = "Good"
    crackTime = "Months to Years"
  } else {
    label = "Strong"
    crackTime = "Centuries"
  }

  return { score, label, crackTime }
}

function calculateEntropy(password: string, options: any): number {
  let poolSize = 0

  if (options.useCustomCharset) {
    poolSize = new Set(options.customCharset).size
  } else {
    if (options.uppercase) poolSize += options.excludeSimilar ? 24 : 26 // Without I, O if excludeSimilar
    if (options.lowercase) poolSize += options.excludeSimilar ? 24 : 26 // Without i, l if excludeSimilar
    if (options.numbers) poolSize += options.excludeSimilar ? 8 : 10 // Without 1, 0 if excludeSimilar
    if (options.symbols) {
      if (options.excludeAmbiguous) {
        poolSize += 13
      } else {
        poolSize += 33
      }
    }
  }

  return password.length * Math.log2(Math.max(2, poolSize))
}
