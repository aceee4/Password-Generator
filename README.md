# Password Generator

A secure, customizable password generator with advanced options and strength analysis.

## Features

- Generate secure passwords with customizable options
- Real-time password strength analysis
- Advanced options for character exclusion and inclusion
- Custom character set support
- Visual strength indicators with color-coded feedback
- Entropy calculation and crack time estimation
- Responsive design for all devices

# Live Demo
- [Click Here](https://advanced-password-gen.vercel.app/)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/aceee4/password-generator.git
cd password-generator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Usage

The password generator provides a RESTful API endpoint that you can use to generate passwords programmatically.

### API Endpoint

```
POST /api/generate-password
```

### Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `length` | number | 16 | Password length (4-128) |
| `uppercase` | boolean | true | Include uppercase letters (A-Z) |
| `lowercase` | boolean | true | Include lowercase letters (a-z) |
| `numbers` | boolean | true | Include numbers (0-9) |
| `symbols` | boolean | true | Include symbols (!@#$%^&*()_-+=<>?/) |
| `excludeSimilar` | boolean | false | Exclude similar characters (i, l, 1, L, o, 0, O) |
| `excludeAmbiguous` | boolean | false | Exclude ambiguous characters ({, }, [, ], (, ), /, , ', ", `, ~, ,, ;, :, <, >) |
| `requireAll` | boolean | true | Require at least one character from each selected type |
| `useCustomCharset` | boolean | false | Use a custom character set instead of the predefined ones |
| `customCharset` | string | "" | Custom character set to use when `useCustomCharset` is true |

### Response Format

The API returns a JSON object with the following properties:

```typescript
{
  password: string;           // The generated password
  strength: number;           // Password strength score (0-100)
  strengthLabel: string;      // Human-readable strength label (Weak, Fair, Good, Strong)
  entropy: number;            // Estimated entropy in bits
  crackTime: string;          // Estimated time to crack (e.g., "Centuries", "Days to Weeks")
  characterTypes: {           // Types of characters present in the password
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  }
}
```

### Error Responses

The API may return the following error responses:

- `400 Bad Request`: When the request parameters are invalid
- `500 Internal Server Error`: When an unexpected error occurs

Error responses have the following format:

```typescript
{
  error: string;  // Error message
}
```

### Example API Usage

#### Basic Usage

```javascript
// Example using fetch API
const response = await fetch('/api/generate-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  }),
});

const data = await response.json();
console.log(data.password); // The generated password
```

#### Advanced Usage

```javascript
// Example with advanced options
const response = await fetch('/api/generate-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: true,
    excludeAmbiguous: true,
    requireAll: true
  }),
});

const data = await response.json();
console.log(data);
```

#### Custom Character Set

```javascript
// Example with custom character set
const response = await fetch('/api/generate-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    length: 12,
    useCustomCharset: true,
    customCharset: 'ABCDEFabcdef0123456789'
  }),
});

const data = await response.json();
console.log(data.password); // Password with only hex characters
```

## Password Strength Analysis

The API calculates password strength based on several factors:

1. **Length**: Longer passwords get higher scores
2. **Character variety**: Using a mix of character types improves the score
3. **Patterns**: Common patterns and sequences reduce the score
4. **Repetition**: Repeated characters reduce the score

The strength is categorized as:

- **Weak** (0-29): Easily crackable in minutes to hours
- **Fair** (30-59): Would take days to weeks to crack
- **Good** (60-79): Would take months to years to crack
- **Strong** (80-100): Would take centuries to crack

## Entropy Calculation

Password entropy is calculated using the formula:

```
Entropy = L * log2(R)
```

Where:
- L is the length of the password
- R is the size of the character pool

Higher entropy means a more secure password.

## License

MIT
