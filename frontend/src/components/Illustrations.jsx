const iconPaths = {
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13l2-7h12l2 7v5H4z" />
      <path d="M4 13h5l1 2h4l1-2h5" />
    </>
  ),
  pot: (
    <>
      <path d="M5 11h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" />
      <path d="M3 11h18M9 7c0-1.5 1-1.5 1-3M14 7c0-1.5 1-1.5 1-3" />
    </>
  ),
  scooter: (
    <>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M9 17h6l-3-9H9M15 17l2-7h2" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l1 13H4z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  utensils: (
    <>
      <path d="M7 3v7a2 2 0 0 0 4 0V3M9 3v18" />
      <path d="M17 3c-2 2-2 6 0 8v10" />
    </>
  ),
}

export function Icon({ name, className = '' }) {
  return (
    <svg
      className={`icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {iconPaths[name]}
    </svg>
  )
}

export function RiderScene({ className = '' }) {
  return (
    <svg
      className={`rider-scene ${className}`.trim()}
      viewBox="0 52 400 252"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="205" cy="288" rx="150" ry="11" fill="#071E48" opacity=".16" />

      <g className="rider-speed" stroke="#fff" strokeLinecap="round" strokeWidth="5" opacity=".7">
        <path d="M6 168h46" />
        <path d="M18 196h40" />
        <path d="M2 224h34" />
      </g>

      <g className="rider-bob">
        <g className="rider-pin">
          <path
            d="M352 62c-11 0-19 8-19 19 0 14 19 34 19 34s19-20 19-34c0-11-8-19-19-19z"
            fill="#fff"
          />
          <circle cx="352" cy="81" r="7" fill="#D30101" />
        </g>

        <rect x="38" y="96" width="102" height="82" rx="16" fill="#FAF5F3" />
        <rect x="38" y="96" width="102" height="26" rx="16" fill="#071E48" />
        <rect x="38" y="108" width="102" height="14" fill="#071E48" />
        <g
          fill="none"
          stroke="#D30101"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M70 134v9M76 134v9M82 134v9M70 143a6 6 0 0 0 12 0M76 149v19" />
          <path d="M104 154v14" />
        </g>
        <path d="M100 133c8 3 10 14 10 21h-10z" fill="#D30101" />
        <rect x="58" y="178" width="62" height="9" rx="4.5" fill="#071E48" />

        <path
          d="M64 216c0-26 28-38 66-38h62c11 0 17 8 17 19v32H86c-13 0-22-5-22-13z"
          fill="#A90000"
        />
        <path d="M118 172h78a11 11 0 0 1 0 14h-84z" fill="#071E48" />
        <path d="M196 232h108v12H196z" fill="#A90000" />
        <path d="M262 178c0-22 36-26 58-12l14 66h-48l-24 6z" fill="#D30101" />
        <circle cx="326" cy="188" r="8" fill="#FAF5F3" />
        <path d="M306 252 292 150" stroke="#071E48" strokeWidth="10" strokeLinecap="round" />
        <path d="M278 146h28" stroke="#071E48" strokeWidth="9" strokeLinecap="round" />

        <path
          d="M172 176c-6-40 4-72 24-80 18-6 32 4 34 24l7 42c-7 10-27 16-45 14z"
          fill="#071E48"
        />
        <path d="M214 112 294 146" stroke="#071E48" strokeWidth="15" strokeLinecap="round" />
        <circle cx="297" cy="147" r="7" fill="#FFD9CF" />
        <path
          d="M182 176 236 198 252 232"
          fill="none"
          stroke="#243B6B"
          strokeWidth="17"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="258" cy="236" rx="14" ry="7" fill="#FAF5F3" />

        <circle cx="222" cy="78" r="17" fill="#FFD9CF" />
        <path d="M203 78c0-19 13-29 28-27 12 2 19 12 17 26h-26z" fill="#D30101" />
        <path d="M232 76h18v9a5 5 0 0 1-5 5h-13z" fill="#071E48" opacity=".85" />
        <rect x="199" y="70" width="12" height="9" rx="4.5" fill="#FF5C5C" />
      </g>

      <g className="rider-wheel">
        <circle cx="110" cy="252" r="35" fill="#071E48" />
        <circle cx="110" cy="252" r="17" fill="#FAF5F3" />
        <path d="M110 238v28M96 252h28" stroke="#FF5C5C" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="rider-wheel">
        <circle cx="306" cy="252" r="35" fill="#071E48" />
        <circle cx="306" cy="252" r="17" fill="#FAF5F3" />
        <path d="M306 238v28M292 252h28" stroke="#FF5C5C" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function EmptyBag({ className = '' }) {
  return (
    <svg
      className={`empty-bag ${className}`.trim()}
      viewBox="0 0 200 160"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="100" cy="146" rx="62" ry="7" fill="#071E48" opacity=".1" />
      <g className="empty-bag-float">
        <path d="M44 62h112l8 80H36z" fill="#FFE3DF" />
        <path d="M44 62h112l3 30H41z" fill="#FF5C5C" opacity=".5" />
        <path
          d="M76 62v-8a24 24 0 0 1 48 0v8"
          fill="none"
          stroke="#071E48"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <g
          fill="none"
          stroke="#D30101"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M84 92v9M90 92v9M96 92v9M84 101a6 6 0 0 0 12 0M90 107v21" />
          <path d="M114 112v16" />
        </g>
        <path d="M110 91c8 3 10 14 10 21h-10z" fill="#D30101" />
      </g>
      <g className="empty-bag-dots" fill="#071E48">
        <circle cx="22" cy="108" r="3" opacity=".5" />
        <circle cx="12" cy="124" r="2" opacity=".3" />
        <circle cx="180" cy="40" r="3" opacity=".4" />
        <circle cx="190" cy="58" r="2" opacity=".25" />
      </g>
    </svg>
  )
}
