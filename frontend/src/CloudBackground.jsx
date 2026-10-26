export default function CloudBackground() {
  return (
    <svg
      className="cloud-background"
      viewBox="0 0 600 340"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="cloudColor" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#a4ffdc" stopOpacity="0.36" />
          <stop offset="55%" stopColor="#53d8b5" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#188f77" stopOpacity="0.16" />
        </linearGradient>

        <filter id="cloudShadow" x="-30%" y="-35%" width="160%" height="180%">
          <feGaussianBlur stdDeviation="17" />
        </filter>
      </defs>

      <path
        d="M115 250
          C65 250 42 220 48 184
          C53 151 81 130 119 135
          C108 91 140 57 181 61
          C207 14 273 17 301 66
          C340 32 395 49 409 94
          C456 77 502 105 503 148
          C547 151 567 184 552 216
          C542 241 519 250 482 250 Z"
        fill="#55e5bd"
        opacity="0.75"
        filter="url(#cloudShadow)"
      />

      <path
        d="M115 245
          C75 245 54 222 59 190
          C63 159 91 141 125 145
          C113 108 143 76 180 78
          C207 35 266 37 294 79
          C330 47 384 59 399 101
          C442 86 484 111 487 150
          C525 148 547 178 536 207
          C528 233 505 245 472 245 Z"
        fill="url(#cloudColor)"
        stroke="#75f0c3"
        strokeOpacity="0.65"
        strokeWidth="2"
      />

      <path
        d="M115 235
          C80 235 66 215 70 190
          C75 166 96 152 130 156
          C120 119 147 88 182 89
          C211 47 261 49 289 88
          C325 57 375 69 389 109
          C432 94 473 119 476 157"
        fill="none"
        stroke="#e0fff3"
        strokeOpacity="0.10"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
