
export interface Manual {
    id: number;
    disaster_type: string;
    warning_signs_and_conditions: string[];
    protective_measures: string[];
}

export interface ManualsDataset {
    dataset: {
        [category: string]: Manual[];
    };
}

export const MANUALS_DATA: ManualsDataset = {
  "dataset": {
    "Natural_Disasters": [
      {
        "id": 1,
        "disaster_type": "Earthquake",
        "warning_signs_and_conditions": [
          "Sudden shaking or rolling of the ground",
          "Potential aftershocks following the largest shock of an earthquake sequence",
          "Risk of falling rocks and landslides if near slopes, cliffs, or mountains",
          "Potential for fire alarms and sprinklers to go off in high-rise buildings"
        ],
        "protective_measures": [
          "Drop to your hands and knees to minimize injuries from falls",
          "Cover your head and neck with your arms; cover under sturdy furniture if available",
          "Hold on to sturdy furniture to stay covered during shaking",
          "Stay indoors until shaking stops; do not run outside",
          "If in bed, stay there and cover head and neck with a pillow",
          "If in a vehicle, stop in a clear area away from buildings, trees, overpasses, or utility wires",
          "If trapped, bang on a pipe or wall, or use a whistle instead of shouting to avoid inhaling dust",
          "If in a tsunami-prone area, go inland or to higher ground immediately after shaking stops"
        ]
      },
      {
        "id": 2,
        "disaster_type": "Tornado",
        "warning_signs_and_conditions": [
          "A rotating funnel-shaped cloud",
          "An approaching cloud of debris",
          "A loud roar, similar to a freight train",
          "Tornado Watch: Conditions are possible for a tornado",
          "Tornado Warning: An event is expected, imminent, or already happening"
        ],
        "protective_measures": [
          "Seek shelter in a safe room built to FEMA P-361 or ICC 500 standards",
          "If no safe room is available, seek a small, interior, windowless room on the lowest level of a sturdy building",
          "Do not stay inside mobile homes or modular structures; they are not safe",
          "Protect your head and neck with your arms",
          "Wear thick-soled shoes, long pants, and work gloves during cleanup"
        ]
      },
      {
        "id": 3,
        "disaster_type": "Flood",
        "warning_signs_and_conditions": [
          "Heavy rainfall or storm surge leading to water accumulation",
          "Six inches of moving water can knock a person off their feet",
          "Twelve inches of moving water can lift a small vehicle",
          "Water may contain hidden debris or be electrically charged by downed power lines"
        ],
        "protective_measures": [
          "Turn Around, Don’t Drown®; do not drive around barricades or through flooded roadways",
          "Seek high ground immediately if flooding is expected",
          "If trapped in a building, go to the highest level; avoid basements but do not climb into a closed attic where you may be trapped",
          "Avoid wading in floodwater due to contamination and debris",
          "Turn off electricity if safe to do so to prevent electric shock",
          "Elevate critical utilities and waterproof basements in advance"
        ]
      },
      {
        "id": 4,
        "disaster_type": "Hurricane",
        "warning_signs_and_conditions": [
          "High winds and potential flooding",
          "Presence of damaged tree limbs and debris",
          "Storm surge and rising flood waters"
        ],
        "protective_measures": [
          "Make plans for evacuation and sheltering before the season begins",
          "Know your evacuation zone and route",
          "Shelter in a small, interior, windowless room on the lowest level not subject to flooding",
          "Install hurricane shutters or board up windows",
          "Gather supplies for at least three days",
          "If told to evacuate, do so immediately",
          "Do not climb into a closed attic if trapped by rising water"
        ]
      },
      {
        "id": 5,
        "disaster_type": "Tsunami",
        "warning_signs_and_conditions": [
          "An earthquake occurring near a coastal area",
          "A loud roar from the ocean",
          "Unusual ocean behavior, such as a sudden rise or wall of water",
          "Sudden draining of water showing the ocean floor"
        ],
        "protective_measures": [
          "Get to high ground (100 feet above sea level) or go at least one mile inland",
          "If you feel an earthquake in a coastal area, move to high ground immediately",
          "Follow local tsunami alerts and evacuation orders",
          "Stay away from the beach until authorities say it is safe"
        ]
      },
      {
        "id": 6,
        "disaster_type": "Landslide",
        "warning_signs_and_conditions": [
          "New cracks in the ground or building foundations",
          "Soil moving away from foundations",
          "Tilting objects indoors (doors) or outdoors (fences, poles)",
          "Unusual cracking or rumbling sounds",
          "Changes in stream water levels"
        ],
        "protective_measures": [
          "Evacuate immediately if signs are present or authorities order it",
          "Move away from the path of the landslide; stay away from outer edges",
          "Avoid rock ledges, bases of steep slopes, and ravines during landslide conditions",
          "Watch for flooding, which often follows landslides",
          "Curl into a tight ball and protect your head if escape is not possible"
        ]
      },
      {
        "id": 7,
        "disaster_type": "Volcanic Eruption",
        "warning_signs_and_conditions": [
          "Evacuation orders from authorities",
          "Falling ash, which can irritate skin and injure breathing passages",
          "Flying debris, hot gases, lateral blast, and lava flow"
        ],
        "protective_measures": [
          "Evacuate immediately from the volcano area to avoid debris and hot gases",
          "Avoid areas downwind and river valleys downstream",
          "If caught in ash fall, seek temporary shelter and seal doors/windows",
          "Wear long-sleeved shirts and pants; use goggles instead of contact lenses",
          "Wear N95 respirator masks to avoid breathing ash",
          "Avoid driving in heavy ash fall as it clogs engines"
        ]
      },
      {
        "id": 8,
        "disaster_type": "Wildfire",
        "warning_signs_and_conditions": [
          "Visible fire or smoke",
          "Hot ash, charred trees, and live embers",
          "Ground containing heat pockets",
          "Weather conditions conducive to fire spread"
        ],
        "protective_measures": [
          "Evacuate immediately once a notice is issued",
          "Create defense zones by removing fuel sources within 30 feet of the home",
          "Use fire-resistant construction materials",
          "Wear N95 respirator masks to avoid breathing smoke and particles",
          "Listen to authorities regarding safe return and water safety"
        ]
      },
      {
        "id": 9,
        "disaster_type": "Avalanche",
        "warning_signs_and_conditions": [
          "Recent avalanches or shooting cracks along slopes",
          "Slopes steeper than 30 degrees",
          "Increased danger signs in snowpack and mountain weather"
        ],
        "protective_measures": [
          "Always travel in pairs",
          "Wear a helmet and an avalanche beacon",
          "Carry a collapsible probe and small shovel",
          "Use swimming motions to stay on the surface if caught in snow",
          "If buried, inhale deeply before snow sets to make breathing space",
          "Do not struggle to conserve oxygen; shout only when rescuers are near"
        ]
      }
    ],
    "Technological_and_ManMade_Hazards": [
      {
        "id": 10,
        "disaster_type": "Nuclear Explosion",
        "warning_signs_and_conditions": [
          "Bright flash of light or fireball",
          "Blast wave causing pressure and wind",
          "Presence of fallout (radioactive soil/water particles)"
        ],
        "protective_measures": [
          "Get inside the nearest building, preferably underground or in the middle of a brick/concrete structure",
          "Stay away from outer walls and roofs",
          "Stay inside for 24 hours unless instructed otherwise",
          "Remove contaminated clothing and wash unprotected skin",
          "Do not consume food or liquids left uncovered outdoors",
          "Use shielding (lead, concrete, earth) to reduce radiation exposure"
        ]
      },
      {
        "id": 11,
        "disaster_type": "Chemical Agent Attack",
        "warning_signs_and_conditions": [
          "Dead animals or sick people in the area",
          "Strange odors like garlic, mustard, geraniums, or bitter almonds,",
          "Oily spots on surfaces or liquid droplets on vegetation,",
          "Symptoms such as tearing, difficulty breathing, choking, or itching,",
          "Muffled shell or bomb detonations"
        ],
        "protective_measures": [
          "Don protective mask and hood immediately",
          "Move crosswind or upwind to leave the contaminated area",
          "Decontaminate skin immediately using soap and water or pinch-blotting; do not rub",
          "Do not use wood or vegetation from the area for fire",
          "Avoid low places like trenches and gullies where agents settle",
          "Use atropine or specific antidotes only if symptoms appear (e.g., pinpoint pupils)"
        ]
      },
      {
        "id": 12,
        "disaster_type": "Biological Agent Attack",
        "warning_signs_and_conditions": [
          "Aircraft spraying or dropping objects",
          "Smokes or mists of unknown origin",
          "Unusual substances on the ground or vegetation",
          "Sick or dead animals and large infestations of insects (vectors)",
          "Rapid onset of symptoms in a group of people"
        ],
        "protective_measures": [
          "Wear a protective mask; if unavailable, cover mouth and nose with cloth",
          "Keep body fully covered; button clothing and tie wrists/ankles",
          "Practice high standards of sanitation and personal hygiene",
          "Boil water for at least 10 minutes; chlorine/iodine alone may not destroy all biological agents",
          "Cook food thoroughly; eat only from sealed containers if possible",
          "Travel crosswind or upwind to escape aerosols"
        ]
      },
      {
        "id": 13,
        "disaster_type": "Active Shooter",
        "warning_signs_and_conditions": [
          "Sound of gunshots",
          "Sighting a suspicious person with a weapon"
        ],
        "protective_measures": [
          "Run: Get away from the shooter is the top priority",
          "Hide: Find a place out of view, lock/block doors, silence phones",
          "Fight: As a last resort, act aggressively to stop the shooter",
          "Keep hands visible and empty when law enforcement arrives",
          "Follow law enforcement instructions"
        ]
      },
      {
        "id": 14,
        "disaster_type": "Cyberattack",
        "warning_signs_and_conditions": [
          "Suspicious activity on devices",
          "Requests to complete tasks immediately or offers that seem too good to be true",
          "Requests for personal information"
        ],
        "protective_measures": [
          "Use strong passwords and two-factor authentication",
          "Keep software and operating systems up to date",
          "Use encrypted internet communications",
          "Regularly back up files",
          "Limit personal information shared online"
        ]
      },
      {
        "id": 15,
        "disaster_type": "Power Outage",
        "warning_signs_and_conditions": [
          "Loss of electrical lighting and appliance function",
          "Disruption of communications"
        ],
        "protective_measures": [
          "Keep freezers and refrigerators closed; food stays cold for about 4 hours in a fridge",
          "Use flashlights instead of candles to avoid fire hazards",
          "Use generators outdoors only, away from windows to avoid carbon monoxide",
          "Disconnect appliances to protect from power surges",
          "Discard refrigerated medications if power is out for more than a day, unless label says otherwise"
        ]
      }
    ],
    "Environmental_Survival_Scenarios": [
      {
        "id": 16,
        "disaster_type": "Desert Survival",
        "warning_signs_and_conditions": [
          "Intense sunlight and heat causing dehydration",
          "Temperature variance: hot days (up to 140°F) and cold nights (down to 50°F),",
          "Sandstorms causing visibility loss and respiratory issues",
          "Mirages distorting visual perception and distance estimation"
        ],
        "protective_measures": [
          "Cover entire body (including head and neck) to protect from sun and conserve sweat",
          "Limit movement to night or cooler hours",
          "Do not ration water; drink as needed to maintain efficiency",
          "If water is scarce, do not eat, as digestion consumes water",
          "Build shelters with multilayered roofs for airflow and cooling",
          "Wear sunglasses or improvise eye protection against glare"
        ]
      },
      {
        "id": 17,
        "disaster_type": "Cold Weather Survival",
        "warning_signs_and_conditions": [
          "Low temperatures leading to hypothermia and frostbite",
          "Windchill increasing the rate of heat loss",
          "Dehydration (dark yellow urine) often unnoticed in cold",
          "Carbon monoxide danger in unventilated shelters"
        ],
        "protective_measures": [
          "Keep clothing Clean, Avoid Overheating, Wear Loose layers, Keep Dry (COLDER principle)",
          "Wear headgear to prevent 40-50% heat loss through the head",
          "Do not sleep directly on the ground; use insulation (boughs, parachute)",
          "Drink plenty of water; do not eat snow without melting it first",
          "Exercise fingers and toes to maintain circulation"
        ]
      },
      {
        "id": 18,
        "disaster_type": "Sea Survival (Open Water)",
        "warning_signs_and_conditions": [
          "Exposure to sun, wind, and saltwater spray",
          "Risk of hypothermia in cold water (below 66°F)",
          "Presence of sharks or poisonous marine life,",
          "Dehydration and seasickness,"
        ],
        "protective_measures": [
          "Do not drink seawater or urine",
          "Use the HELP (Heat Escaping Lessening Posture) or huddle with others to conserve heat in cold water",
          "Keep skin covered to prevent sunburn",
          "If sharks are present, do not fish or throw waste overboard",
          "Squeeze moisture from fish flesh if freshwater is unavailable"
        ]
      },
      {
        "id": 19,
        "disaster_type": "Tropical/Jungle Survival",
        "warning_signs_and_conditions": [
          "High temperatures and humidity",
          "Heavy rainfall and rapid vegetation growth",
          "Presence of insects (mosquitoes, leeches) and venomous snakes,",
          "Fungal infections and skin rot due to wetness"
        ],
        "protective_measures": [
          "Cover skin to prevent insect bites and scratches",
          "Boil or purify all water; use water vines or green bamboo as sources,",
          "Build raised platforms or hammocks for sleeping to avoid ground pests",
          "Treat scratches immediately to prevent infection",
          "Shake out clothes and bedding to remove scorpions or spiders"
        ]
      }
    ],
    "Medical_and_Physiological_Emergencies": [
      {
        "id": 20,
        "disaster_type": "Heat Stroke",
        "warning_signs_and_conditions": [
          "Lack of sweating (hot, dry skin)",
          "Headache, dizziness, fast pulse",
          "Mental confusion or unconsciousness"
        ],
        "protective_measures": [
          "Cool the victim immediately (immersion, dousing with water, fanning)",
          "Massage arms and legs to aid circulation",
          "Do not give water if the victim is unconscious",
          "If conscious, give small amounts of water every 3 minutes"
        ]
      },
      {
        "id": 21,
        "disaster_type": "Hypothermia",
        "warning_signs_and_conditions": [
          "Uncontrollable shivering (initial symptom)",
          "Sluggish thinking and irrational reasoning",
          "Muscle rigidity and unconsciousness as core temp drops"
        ],
        "protective_measures": [
          "Rewarm the entire body; use body heat from another person in a sleeping bag",
          "Remove wet clothing and replace with dry",
          "Give hot, sweetened fluids if conscious (honey, sugar, cocoa)",
          "Do not force an unconscious person to drink"
        ]
      },
      {
        "id": 22,
        "disaster_type": "Frostbite",
        "warning_signs_and_conditions": [
          "Skin takes on a dull whitish pallor (light frostbite)",
          "Tissue becomes solid and immovable (deep frostbite)",
          "Loss of feeling in hands or feet"
        ],
        "protective_measures": [
          "Warm with bare hands or place hands under armpits",
          "Place frostbitten feet next to a companion's stomach",
          "Do not rub the injury with snow or massage it",
          "Do not thaw deep frostbite if there is a risk of refreezing"
        ]
      },
      {
        "id": 23,
        "disaster_type": "Snakebite",
        "warning_signs_and_conditions": [
          "Fang marks (puncture wounds)",
          "Pain and swelling at the bite site",
          "Spontaneous bleeding or breathing difficulty (neurotoxic effects)"
        ],
        "protective_measures": [
          "Keep the victim quiet and still",
          "Immobilize the affected limb and keep it lower than the heart,",
          "Remove watches or constricting items",
          "Do not cut the bite or suck out poison with mouth (unless no other option exists and mouth is healthy)",
          "Apply a constricting band between the wound and heart (not a tourniquet)"
        ]
      },
      {
        "id": 24,
        "disaster_type": "Carbon Monoxide Poisoning",
        "warning_signs_and_conditions": [
          "Pressure at temples, headache, pounding pulse",
          "Cherry red coloring in lips, mouth, and eyelids",
          "Drowsiness and nausea"
        ],
        "protective_measures": [
          "Get into fresh air immediately",
          "Ensure ventilation in shelters when using open flames",
          "Turn off stoves or lamps before falling asleep"
        ]
      },
      {
        "id": 25,
        "disaster_type": "Dehydration",
        "warning_signs_and_conditions": [
          "Dark urine with strong odor",
          "Thirst (note: thirst is a late sign)",
          "Loss of skin elasticity and sunken eyes",
          "Emotional instability and fatigue"
        ],
        "protective_measures": [
          "Drink water even when not thirsty",
          "Drink small amounts frequently rather than large amounts at once",
          "Do not substitute alcohol or seawater for water",
          "Monitor urine color; light yellow indicates good hydration"
        ]
      }
    ],
    "Crisis_Q_and_A_Scenarios": [
      {
        "id": 26,
        "disaster_type": "Psychological Response: Managing Fear and Panic",
        "warning_signs_and_conditions": [
          "Question: How do I stop myself from panicking?",
          "Question: What does the acronym SURVIVAL stand for?",
          "Condition: Trembling, quick pulse, dilation of pupils, or inability to concentrate."
        ],
        "protective_measures": [
          "Understand that fear is a normal reaction; admit it exists and accept it as reality.",
          "Use the SURVIVAL acronym to guide actions: Size up the situation; Use all your senses; Remember where you are; Vanquish fear and panic; Improvise; Value living; Act like the natives; Live by your wits.",
          "Keep busy: Check equipment, plan signals, and improve shelters to prevent idleness that increases fear.",
          "Use 'crisis' vs. 'coping' phases: Recognize the crisis period (realizing gravity of situation) and move to the coping period (resolving to endure)."
        ]
      },
      {
        "id": 27,
        "disaster_type": "Emergency Water Procurement (Plants)",
        "warning_signs_and_conditions": [
          "Question: How can I get water if I cannot find a stream or lake?",
          "Question: Which plants provide safe drinking water?",
          "Condition: Tropical or arid environment with no surface water."
        ],
        "protective_measures": [
          "Vines: Cut a notch high on the vine, then cut the vine off close to the ground; catch dripping liquid in mouth or container.",
          "Green Bamboo: Bend a stalk, tie it down, and cut off the top; water will drip during the night.",
          "Banana Trees: Cut down the tree leaving a 12-inch stump; scoop out the center to form a bowl; water from roots will fill it.",
          "Coconuts: Drink milk from green (unripe) coconuts; milk from mature brown nuts acts as a strong laxative.",
          "Avoid: Vines with sticky, milky sap or those that cause skin irritation."
        ]
      },
      {
        "id": 28,
        "disaster_type": "Emergency Water Procurement (Solar Stills)",
        "warning_signs_and_conditions": [
          "Question: How do I get water from the soil or desert vegetation?",
          "Question: Can I purify polluted water using the sun?",
          "Condition: Arid environment or presence of only polluted water sources."
        ],
        "protective_measures": [
          "Belowground Still: Dig a hole 3 feet wide/2 feet deep with a sump in the center for a container; cover with clear plastic sheet anchored with soil; place a rock in the center of the plastic to form a cone pointing down into the container.",
          "Vegetation Bag: Fill a clear plastic bag with green leafy vegetation; place a rock inside and tie the mouth securely; place in sunlight with mouth downhill so condensation collects.",
          "Transpiration Bag: Tie a clear plastic bag over a living tree limb; seal the mouth tightly around the branch; weigh down the end so water collects in the corner.",
          "Polluted Water: Dig a trough inside a belowground still and fill with polluted water; the soil filters it and the still distills it."
        ]
      },
      {
        "id": 29,
        "disaster_type": "Food Safety: The Universal Edibility Test",
        "warning_signs_and_conditions": [
          "Question: How do I know if a wild plant is safe to eat?",
          "Question: What plants should I avoid immediately?",
          "Condition: Starvation situation with unknown vegetation."
        ],
        "protective_measures": [
          "Avoid plants with: Milky/discolored sap, beans/bulbs inside pods, bitter/soapy taste, spines/hairs/thorns, dill/carrot/parsnip-like foliage, or almond scent.",
          "Test only one part of a plant at a time; do not eat for 8 hours before starting.",
          "Contact Test: Place a piece of the plant on inner elbow or wrist for 15 minutes to check for reaction.",
          "Lip/Tongue Test: Touch a small portion to outer lip for 3 minutes; if no reaction, place on tongue for 15 minutes.",
          "Chew Test: Thoroughly chew a pinch and hold in mouth for 15 minutes without swallowing; if no burning/numbing occurs, swallow.",
          "Wait 8 hours: If no ill effects (nausea, cramps), eat 0.25 cup and wait another 8 hours before considering safe."
        ]
      },
      {
        "id": 30,
        "disaster_type": "Field-Expedient Fire Making",
        "warning_signs_and_conditions": [
          "Question: How do I start a fire without matches?",
          "Question: What materials do I need to start a fire?",
          "Condition: Loss of modern ignition sources."
        ],
        "protective_measures": [
          "Lens Method: Use a convex lens (camera, binoculars, magnifying glass) to concentrate the sun's rays on tinder.",
          "Battery Method: Attach wires to positive and negative terminals; touch ends to a piece of noninsulated wire or steel wool next to tinder to create sparks/heat.",
          "Fire-Plow: Cut a groove in a softwood base; plow the blunt tip of a hardwood shaft up and down the groove to create friction and wood dust that ignites.",
          "Bow and Drill: Use a hardwood spindle, a softwood fireboard with a V-cut, and a bow to spin the spindle rapidly, grinding hot black powder into tinder."
        ]
      },
      {
        "id": 31,
        "disaster_type": "Shelter Construction: The BLISS Principle",
        "warning_signs_and_conditions": [
          "Question: Where is the safest place to set up a shelter?",
          "Question: What factors should I consider when hiding or sheltering?",
          "Condition: Need for protection from elements or hostile observation."
        ],
        "protective_measures": [
          "Blend: Ensure the shelter blends with the surroundings.",
          "Low Silhouette: Keep the structure low to be difficult to spot.",
          "Irregular Shape: Avoid straight lines and perfect geometric shapes found in man-made structures.",
          "Small: Make the shelter only as big as necessary to retain body heat.",
          "Secluded Location: Avoid skylines, low ground (cold air/flash floods), and insect-infested areas."
        ]
      },
      {
        "id": 32,
        "disaster_type": "Emergency Signaling",
        "warning_signs_and_conditions": [
          "Question: How do I signal an aircraft for help?",
          "Question: What are the international distress codes?",
          "Condition: Attempting recovery or rescue."
        ],
        "protective_measures": [
          "Fire: Build three fires in a triangle or straight line (International Distress Signal).",
          "Smoke: Use dark smoke (rubber/oil) against light backgrounds; use white smoke (green leaves/moss) against dark backgrounds.",
          "Signal Mirror: Reflect sunlight onto a nearby surface to find the aim indicator (spot of light), then slowly manipulate the mirror to aim the spot at the aircraft.",
          "Body Signals: Arms raised vertically for 'Pick us up'; Arms parallel to ground for 'Mechanical Help'; One arm raised for 'All OK'.",
          "Ground-to-Air Symbols: 'V' for require assistance; 'X' for require medical assistance; 'N' for No; 'Y' for Yes."
        ]
      },
      {
        "id": 33,
        "disaster_type": "Nuclear Fallout Survival",
        "warning_signs_and_conditions": [
          "Question: How do I survive radioactive fallout?",
          "Question: Is it safe to eat or drink after a nuclear blast?",
          "Condition: Post-nuclear explosion environment."
        ],
        "protective_measures": [
          "Shielding: Use dense materials; 18 inches of earth, 5 inches of concrete, or 3 inches of iron reduce gamma radiation by 50 percent.",
          "Shelter Management: Stay inside a deep shelter (trench/cave/basement) for 4 to 6 days for complete isolation.",
          "Water: Water from deep underground sources (springs/wells) or pipes in abandoned houses is safest; filter stream water through soil (seepage basin) to remove 99% of radioactivity.",
          "Food: Canned/processed foods are safe if containers are washed; underground vegetables (potatoes/carrots) are safe if peeled and scrubbed; avoid milk and bone-in meat."
        ]
      },
      {
        "id": 34,
        "disaster_type": "Field-Expedient Wound Care",
        "warning_signs_and_conditions": [
          "Question: How do I treat a wound without a first aid kit?",
          "Question: Should I stitch a wound in the wild?",
          "Condition: Injury in a survival situation without medical supplies."
        ],
        "protective_measures": [
          "Open Treatment: Do not suture wounds; leave them open to allow drainage of pus and infection.",
          "Cleaning: Rinse (do not scrub) with large amounts of water or fresh urine if water is unavailable.",
          "Antiseptics: Use tannins from boiling oak bark, garlic juice, or sugar/honey (applied directly to wound) to prevent infection.",
          "Maggot Therapy: If severe infection/gangrene occurs, expose wound to flies; maggots will eat dead tissue; flush them out with water once dead tissue is removed."
        ]
      },
      {
        "id": 35,
        "disaster_type": "Cold Weather Hygiene",
        "warning_signs_and_conditions": [
          "Question: How do I stay clean in freezing temperatures?",
          "Question: Why is hygiene important in the cold?",
          "Condition: Arctic or sub-zero environment."
        ],
        "protective_measures": [
          "Snow Bath: Wash sweat-prone areas (armpits, groin) with a handful of snow and wipe dry immediately to prevent skin rashes.",
          "Clothing: Change underwear twice a week; if unable to wash, shake it out and air it for an hour to reduce lice/bacteria.",
          "Shaving: Shave before going to bed, not in the morning, to allow skin natural oils to recover before exposure to elements."
        ]
      }
    ]
  }
};
