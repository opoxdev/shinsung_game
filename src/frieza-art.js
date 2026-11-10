// Exclusive character artwork: ivory bio-armor, violet carapace, crimson eyes,
// floating menace, five-fingered hands and a curled segmented tail.
// Authorship is independent of all player wardrobe / reward pools.
export function friezaPortrait(id,skin='default'){
  if(id!=='frieza')return null;
  const base='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210" role="img" aria-label="프리져 · 개발자 전용 제왕" data-base="frieza" data-costume="'+skin+'" data-design="developer-emperor" data-art-tier="developer">';
  return base+`
  <defs>
    <linearGradient id="f-ivory" x1=".15" y1="0" x2=".85" y2="1">
      <stop stop-color="#ffffff"/><stop offset=".38" stop-color="#e2f4ee"/><stop offset=".77" stop-color="#b8cdc5"/><stop offset="1" stop-color="#6c8d8b"/>
    </linearGradient>
    <radialGradient id="f-violet" cx=".36" cy=".22" r=".85">
      <stop stop-color="#d9afff"/><stop offset=".26" stop-color="#a15deb"/><stop offset=".65" stop-color="#60228f"/><stop offset="1" stop-color="#27103f"/>
    </radialGradient>
    <linearGradient id="f-metal" x1="0" x2="1" y1=".1" y2=".95">
      <stop stop-color="#fafefa"/><stop offset=".52" stop-color="#c6ddd8"/><stop offset="1" stop-color="#71908e"/>
    </linearGradient>
    <radialGradient id="f-aura"><stop stop-color="#a55bff" stop-opacity=".38"/><stop offset=".62" stop-color="#7b31d9" stop-opacity=".16"/><stop offset="1" stop-color="#7b31d9" stop-opacity="0"/></radialGradient>
  </defs>
  <g stroke-linecap="round" stroke-linejoin="round">
    <!-- Royal gravitational halo and long biomechanical tail silhouette. -->
    <ellipse cx="90" cy="100" rx="84" ry="100" fill="url(#f-aura)" opacity=".72"/>
    <path d="M117 126C167 126 185 161 158 180 138 196 99 175 72 183 42 191 28 199 34 203" fill="none" stroke="#42505a" stroke-width="18"/>
    <path d="M117 126C167 126 185 161 158 180 138 196 99 175 72 183 42 191 28 199 34 203" fill="none" stroke="url(#f-metal)" stroke-width="13"/>
    <path d="M148 161l-7 12m-23 2-4 11m-21-7-2 8m-31 2-2 8" stroke="#5b6b6c" stroke-width="2.2" opacity=".7"/>
    <!-- Legs, purple tibia plates, clawed toes. -->
    <path d="M67 128l-10 31 3 20-17 18 1 7 26 0 10-18 6-35Z" fill="url(#f-ivory)" stroke="#3e5357" stroke-width="3.1"/>
    <path d="M98 130l10 32 2 20 20 15-4 8-25-3-11-22-8-31Z" fill="url(#f-ivory)" stroke="#3e5357" stroke-width="3.1"/>
    <path d="M61 166l11 3-4 26-12 1Z" fill="url(#f-violet)" stroke="#39284a" stroke-width="2.5"/>
    <path d="M102 167l-11 2 7 27 12 1Z" fill="url(#f-violet)" stroke="#39284a" stroke-width="2.5"/>
    <path d="M46 195l-9 5-2 5m14-4-1 7m13-7 5 7M114 197l10 6 7 1m-20 0-3 6m-5-7-9 6" fill="none" stroke="#bcd6ca" stroke-width="4"/>
    <!-- Narrow alien abdomen and ribbed segmented corset. -->
    <path d="M59 84L121 83 113 135Q97 159 90 155 79 157 67 140Z" fill="url(#f-ivory)" stroke="#3b5355" stroke-width="3.4"/>
    <path d="M70 107q20 7 42-1m-37 14q14 5 31 0M85 136l5 13 6-13" stroke="#809b93" stroke-width="2.5" fill="none"/>
    <path d="M76 82 104 82 102 111Q90 117 78 109Z" fill="url(#f-violet)" stroke="#542b71" stroke-width="3"/>
    <path d="M82 86 85 102 94 106" fill="none" stroke="#dfa3ff" stroke-width="3" opacity=".7"/>
    <!-- Shoulder pauldrons and sculpted ivory musculature. -->
    <path d="M62 61Q37 58 26 79L25 110 43 118 62 99Z" fill="url(#f-metal)" stroke="#384f50" stroke-width="3.5"/>
    <path d="M117 61q26-3 36 18l-1 31-18 8-18-19Z" fill="url(#f-metal)" stroke="#384f50" stroke-width="3.5"/>
    <ellipse cx="41" cy="76" rx="19" ry="16" transform="rotate(-18 41 76)" fill="url(#f-violet)" stroke="#3b2b59" stroke-width="4"/>
    <ellipse cx="139" cy="76" rx="19" ry="16" transform="rotate(18 139 76)" fill="url(#f-violet)" stroke="#3b2b59" stroke-width="4"/>
    <path d="M47 83Q60 65 91 76Q117 67 134 84l-13 29-31 9-31-9Z" fill="url(#f-ivory)" stroke="#374f53" stroke-width="3.7"/>
    <path d="M92 78v44M48 89q23-5 42 9M131 89q-20-4-37 9" fill="none" stroke="#9cb8ad" stroke-width="2.4"/>
    <path d="M56 86q11-14 31-4m8 0q18-13 32 5" fill="none" stroke="#ffffff" stroke-width="4" opacity=".82"/>
    <!-- Long forearms, palms with explicitly separated clawed fingers. -->
    <path d="M29 103 21 122 13 151 27 157 40 123 44 109Z" fill="url(#f-metal)" stroke="#40565b" stroke-width="3"/>
    <path d="M150 103l9 19 11 29-13 7-18-34-3-16Z" fill="url(#f-metal)" stroke="#40565b" stroke-width="3"/>
    <path d="M17 149q-11 0-9 12l11 10 12-7-4-12Z" fill="url(#f-ivory)" stroke="#3e5659" stroke-width="3"/>
    <path d="M162 149q12 1 10 12l-11 10-12-7 4-12Z" fill="url(#f-ivory)" stroke="#3e5659" stroke-width="3"/>
    <path d="M12 165l-10 15m16-11-6 21m14-21-1 23m-12-25-12 5M168 164l11 16m-17-11 6 21m-14-21 0 24m12-26 12 3" stroke="#b9d8d0" stroke-width="5"/>
    <path d="M12 165l-10 15m16-11-6 21m14-21-1 23m-12-25-12 5M168 164l11 16m-17-11 6 21m-14-21 0 24m12-26 12 3" stroke="#4b6263" stroke-width="1.8"/>
    <!-- Oversized violet dome and tapered face with cold narrow crimson eyes. -->
    <path d="M60 38Q61 9 90 7 121 6 124 38L117 70q-12 15-27 15-15 0-27-15Z" fill="url(#f-ivory)" stroke="#405355" stroke-width="3.7"/>
    <path d="M61 43Q52 23 71 10 90-3 111 10q23 15 10 35l-11 8-37 1Z" fill="url(#f-violet)" stroke="#302149" stroke-width="4"/>
    <path d="M73 18q20-18 37-3M68 32q16-23 41-12" fill="none" stroke="#e5baff" stroke-width="5.5" opacity=".55"/>
    <path d="M64 50 79 45 86 54l-15 3Zm52 0-15-5-7 9 16 3Z" fill="#d2f2e4" stroke="#405458" stroke-width="2.2"/>
    <path d="M69 52l13-3-5 5Zm42 0-13-3 5 5Z" fill="#e84670"/>
    <path d="M86 59l4 5 4-5m-14 9 10 5 10-5" fill="none" stroke="#3b414c" stroke-width="2.6"/>
    <path d="M80 69q10 4 20 0" fill="none" stroke="#f4ffff" stroke-width="1.6" opacity=".85"/>
    <!-- Hard reflections on the forehead and armor. -->
    <path d="M97 9q18 2 24 18-14-3-24-18M37 67q-8 4-9 13" fill="#fff3ff" opacity=".85"/>
    <path d="M57 85q11-7 25-3m18 0q9-5 20 3M26 113l-8 18m139-18 8 17" stroke="#f6ffff" stroke-width="3" fill="none" opacity=".6"/>
  </g></svg>`;
}
