export interface Manual {
  id: number;
  disaster_type: string;
  warning_signs_and_conditions: string[];
  protective_measures: string[];
}

export const MANUALS_DATA: Manual[] = [
  {
    "id": 1,
    "disaster_type": "Active Shooter",
    "warning_signs_and_conditions": [
      "Something or someone acting suspicious"
    ],
    "protective_measures": [
      "Report suspicious activity to local law enforcement",
      "Run: Get away from the shooter, warn others, call 9-1-1, and describe the shooter's location and weapons",
      "Hide: Find a place out of view, stay quiet, silence electronic devices, lock and block doors, and do not hide in groups",
      "Fight: As a last resort, commit to your actions and act aggressively to defend yourself",
      "Keep hands visible and empty when law enforcement arrives",
      "Follow law enforcement instructions and evacuate in the direction they describe"
    ]
  },
  {
    "id": 2,
    "disaster_type": "Avalanche",
    "warning_signs_and_conditions": [
      "Recent avalanches and shooting cracks along slopes",
      "Areas of increased risk like slopes steeper than 30 degrees"
    ],
    "protective_measures": [
      "Always travel in pairs and use a guide familiar with the area",
      "Wear a helmet and an avalanche beacon to help others locate you",
      "Carry a collapsible avalanche probe and a small shovel",
      "If a partner is buried, call 9-1-1 and then begin to search",
      "Treat others for suffocation, hypothermia, traumatic injury, or shock"
    ]
  },
  {
    "id": 3,
    "disaster_type": "Cyberattack",
    "warning_signs_and_conditions": [
      "Suspicious activity such as messages asking for immediate tasks or personal information",
      "Offers that seem too good to be true"
    ],
    "protective_measures": [
      "Keep software and operating systems up-to-date",
      "Use strong passwords and two-factor authentication",
      "Use encrypted internet communications, antivirus, and firewall solutions",
      "Regularly back up files in an encrypted format",
      "Limit personal information shared online and deactivate location features",
      "Protect home networks by changing administrative and Wi-Fi passwords regularly"
    ]
  },
  {
    "id": 4,
    "disaster_type": "Earthquake",
    "warning_signs_and_conditions": [
      "Shaking of the ground",
      "Aftershocks following the largest shock"
    ],
    "protective_measures": [
      "Drop, Cover, and Hold On: Drop to hands and knees, cover head and neck (under sturdy furniture if possible), and hold on",
      "Do not run outside; stay indoors until shaking stops",
      "If in bed, stay there and cover your head and neck with a pillow",
      "If in a vehicle, stop in a clear area away from buildings and wires",
      "If trapped, send a text or bang on a pipe; do not shout unless necessary to avoid inhaling dust",
      "If in a tsunami-prone area, go inland or to higher ground immediately after shaking stops"
    ]
  },
  {
    "id": 5,
    "disaster_type": "Extreme Heat",
    "warning_signs_and_conditions": [
      "Signs of heat-related illness: cramps, exhaustion, and heat stroke",
      "Heat stroke symptoms: high body temperature, hot and red skin, dizziness, confusion, and rapid pulse"
    ],
    "protective_measures": [
      "Stay indoors in a place with working air conditioning",
      "Use shades, wear light-colored loose clothing, and stay hydrated",
      "If outdoors, seek shade and wear a wide-brimmed hat",
      "Never leave a child, adult, or animal alone inside a vehicle",
      "If someone has heat stroke, call 9-1-1, cool them down with water or ice, and do not give them fluids to drink"
    ]
  },
  {
    "id": 6,
    "disaster_type": "Flood",
    "warning_signs_and_conditions": [
      "Flooded roadways or moving water",
      "Barricades set up by local responders"
    ],
    "protective_measures": [
      "Turn Around, Don’t Drown® when encountering flooded roadways",
      "Evacuate immediately if told to do so",
      "Seek high ground right away if flooding is expected",
      "If trapped in a building, go to the highest level but do not climb into a closed attic",
      "Do not touch electrical equipment if it is wet or you are standing in water",
      "Avoid wading in floodwater which may be contaminated or electrically charged"
    ]
  },
  {
    "id": 7,
    "disaster_type": "Hurricane",
    "warning_signs_and_conditions": [
      "High winds and potential flooding",
      "Evacuation orders from local officials"
    ],
    "protective_measures": [
      "Evacuate immediately if told to do so",
      "If sheltering, go to a safe room or small, interior, windowless room on the lowest level",
      "Gather supplies for at least three days, including medications",
      "Prepare the home: declutter drains, install check valves, use shutters, and trim trees",
      "If trapped by flooding, go to the highest level of the building (not a closed attic)"
    ]
  },
  {
    "id": 8,
    "disaster_type": "Landslide",
    "warning_signs_and_conditions": [
      "New cracks in ground or foundations",
      "Soaked ground or soil moving away from foundations",
      "Tilting objects like trees or fences, and unusual rumbling sounds"
    ],
    "protective_measures": [
      "Evacuate immediately if authorities give the order",
      "Move away from the path of the landslide or debris flow",
      "Avoid river valleys and low-lying areas during landslide conditions",
      "Stay away from the slide area after the event as more debris may come loose",
      "Watch for flooding which may follow the landslide"
    ]
  },
  {
    "id": 9,
    "disaster_type": "Nuclear Explosion",
    "warning_signs_and_conditions": [
      "Blast, heat, and radiation from detonation",
      "Official alerts via media or authorities"
    ],
    "protective_measures": [
      "Get inside the nearest building, ideally underground or in the middle of a brick/concrete structure",
      "Stay away from outer walls and roofs",
      "Stay inside for 24 hours unless instructed otherwise",
      "Remove contaminated clothing and wash skin if exposed to fallout",
      "Do not consume uncovered food or liquids that may be contaminated",
      "Keep pets inside and clean them if they were exposed"
    ]
  },
  {
    "id": 10,
    "disaster_type": "Pandemic",
    "warning_signs_and_conditions": [
      "Spread of a novel virus (like COVID-19) from person to person"
    ],
    "protective_measures": [
      "Wash hands often with soap and water for at least 20 seconds",
      "Avoid close contact by keeping a distance of six feet from others",
      "Wear a cloth face covering over mouth and nose in public",
      "Clean and disinfect frequently touched surfaces daily",
      "Use hand sanitizer with at least 60 percent alcohol if soap is unavailable"
    ]
  },
  {
    "id": 11,
    "disaster_type": "Power Outage",
    "warning_signs_and_conditions": [
      "Loss of electricity to the home or area",
      "Potential for power surges when power returns"
    ],
    "protective_measures": [
      "Use flashlights for lighting, not candles",
      "Keep freezers and refrigerators closed to keep food cold",
      "Run generators outdoors only, at least 20 feet away from windows",
      "Disconnect appliances to protect from surges",
      "Check on neighbors, especially older adults and children",
      "Discard perishable food exposed to temperatures over 40 degrees for two hours or more"
    ]
  },
  {
    "id": 12,
    "disaster_type": "Thunderstorm, Lightning, and Hail",
    "warning_signs_and_conditions": [
      "Thunder roaring or lightning sightings",
      "Darkening skies or increasing wind"
    ],
    "protective_measures": [
      "Go indoors to a sturdy building or enclosed metal-roof vehicle when thunder roars",
      "Avoid sheds, gazebos, convertibles, and touching metal",
      "Get to land immediately if swimming or boating",
      "Unplug chargers and avoid using landline phones or running water",
      "Pay attention to alerts and watch for fallen power lines"
    ]
  },
  {
    "id": 13,
    "disaster_type": "Tornado",
    "warning_signs_and_conditions": [
      "Rotating funnel-shaped cloud",
      "Approaching cloud of debris",
      "Loud roar similar to a freight train"
    ],
    "protective_measures": [
      "Seek shelter in a FEMA-safe room, storm shelter, or small interior windowless room on the lowest level",
      "Do not stay in mobile homes or modular structures",
      "Protect your head and neck",
      "Follow watch and warning alerts carefully",
      "After the event, wear thick-soled shoes and work gloves during cleanup"
    ]
  },
  {
    "id": 14,
    "disaster_type": "Tsunami",
    "warning_signs_and_conditions": [
      "Earthquake or loud roar from the ocean",
      "Unusual ocean behavior such as a sudden rise or draining of water"
    ],
    "protective_measures": [
      "Get to high ground (100 feet above sea level) or go inland (at least one mile)",
      "Follow evacuation routes and signs",
      "Stay in a safe, elevated place and wait for alerts",
      "Do not return home until authorities say it is safe"
    ]
  },
  {
    "id": 15,
    "disaster_type": "Volcano",
    "warning_signs_and_conditions": [
      "Evacuation orders or notifications from the USGS Volcano Notification Service",
      "Heavy ash fall"
    ],
    "protective_measures": [
      "Evacuate immediately if ordered to avoid debris, gas, and lava",
      "Avoid areas downwind and river valleys",
      "If sheltering, cover ventilation openings and seal doors/windows",
      "Avoid driving in heavy ash",
      "Wear N95 respirators, goggles, and long sleeves to protect from ash"
    ]
  },
  {
    "id": 16,
    "disaster_type": "Wildfire",
    "warning_signs_and_conditions": [
      "Notices issued by authorities",
      "Weather conditions such as drought or high wind"
    ],
    "protective_measures": [
      "Evacuate immediately once a notice is issued",
      "Create defense zones by removing fuel and vegetation within 30 to 100 feet of property",
      "Use N95 respirators to avoid breathing dangerous particles",
      "Do not return home until authorities say it is safe",
      "Avoid hot ash and smoldering debris which can burn skin or spark fires"
    ]
  },
  {
    "id": 17,
    "disaster_type": "Winter Storm",
    "warning_signs_and_conditions": [
      "Extreme cold temperatures",
      "Snow, ice, or freezing conditions"
    ],
    "protective_measures": [
      "Limit time outside and wear layers of warm clothing",
      "Avoid driving; if trapped, stay in the vehicle",
      "Use generators and grills outdoors only to avoid carbon monoxide poisoning",
      "Install battery-powered smoke and carbon monoxide detectors",
      "Check on neighbors, as older adults and children are at risk"
    ]
  }
];
