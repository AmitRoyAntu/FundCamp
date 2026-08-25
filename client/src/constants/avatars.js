// Minimalist Silhouette Avatar Logos matching modern profile standards

export const MALE_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- Solid Dark Full Circular Base -->
  <circle cx="100" cy="100" r="100" fill="#000000"/>
  <!-- Pure White Male Silhouette -->
  <g fill="#FFFFFF">
    <!-- Head -->
    <path d="M100 36 C77 36 67 52 67 77 C67 92 72 104 80 113 C86 120 92 124 100 124 C108 124 114 120 120 113 C128 104 133 92 133 77 C133 52 123 36 100 36 Z"/>
    <!-- Shoulders / Torso -->
    <path d="M100 133 C73 133 46 148 33 170 C51 189 74 200 100 200 C126 200 149 189 167 170 C154 148 127 133 100 133 Z"/>
  </g>
</svg>
`)}`;

export const FEMALE_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- Solid Dark Full Circular Base -->
  <circle cx="100" cy="100" r="100" fill="#000000"/>
  <!-- Pure White Female Silhouette -->
  <g fill="#FFFFFF">
    <!-- Head & Hair Shape -->
    <path d="M100 35 C77 35 62 50 62 76 C62 94 66 108 73 118 C79 125 88 127 100 127 C112 127 121 125 127 118 C134 108 138 94 138 76 C138 50 123 35 100 35 Z"/>
    <!-- Flowing Hair Sides -->
    <path d="M62 74 C55 92 54 114 64 133 C68 140 75 140 77 132 C71 118 69 100 72 80 Z"/>
    <path d="M138 74 C145 92 146 114 136 133 C132 140 125 140 123 132 C129 118 131 100 128 80 Z"/>
    <!-- Shoulders / Torso -->
    <path d="M100 133 C75 133 48 148 34 170 C51 189 74 200 100 200 C126 200 149 189 166 170 C152 148 125 133 100 133 Z"/>
  </g>
</svg>
`)}`;

export const PRESET_AVATARS = [
  {
    id: 'male',
    label: 'Male Silhouette',
    gender: 'Male',
    badge: '👨 Male',
    url: MALE_AVATAR,
  },
  {
    id: 'female',
    label: 'Female Silhouette',
    gender: 'Female',
    badge: '👩 Female',
    url: FEMALE_AVATAR,
  },
];
