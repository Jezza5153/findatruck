/**
 * Seed Adelaide food trucks from publicly available data.
 *
 * Usage: npx tsx scripts/seed-adelaide-trucks.ts
 *
 * Creates truck profiles with complete data (descriptions, contact info,
 * social handles, etc.) and populates the event_sightings table.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';

// ─── Truck Data ────────────────────────────────────────────────
interface TruckSeed {
  name: string;
  cuisine: string;
  description: string;
  phone?: string;
  websiteUrl?: string;
  instagramHandle?: string;
  facebookHandle?: string;
  tiktokHandle?: string;
  address?: string;
  tags?: string[];
  imageUrl?: string;
  events?: string[]; // Event names this truck has been spotted at
}

const TRUCKS: TruckSeed[] = [
  // ─── Argentinian ─────────────────────────────────────────────
  {
    name: 'Chimichurri Grill',
    cuisine: 'Argentinian',
    description: 'Recognised as one of Adelaide\'s top food trucks, Chimichurri Grill serves delicious, authentic Argentinian dishes. From tender steaks to choripán and empanadas, every dish is packed with smoky, South American flavour using locally sourced SA produce.',
    phone: '0434 993 061',
    websiteUrl: 'https://chimichurrigrill.com.au',
    instagramHandle: 'chimichurrigrill',
    facebookHandle: 'ChimiGrill',
    address: 'Adelaide, South Australia',
    tags: ['argentinian', 'grill', 'steak', 'empanadas', 'catering', 'weddings'],
    events: ['Food Truck Carnivale', 'Fork on the Road', 'Tasting Australia'],
  },

  // ─── Mexican ─────────────────────────────────────────────────
  {
    name: 'El Guaco Taco',
    cuisine: 'Mexican',
    description: 'Adelaide\'s premier Mexican food truck. El Guaco is all about delicious, fresh, and colourful soft shell tacos and crunchy nachos. Bold flavours, generous portions, and a fiesta on every plate.',
    phone: '0434 993 061',
    websiteUrl: 'https://elguacotaco.au',
    instagramHandle: 'elguacotacoadl',
    address: 'Adelaide, South Australia',
    tags: ['mexican', 'tacos', 'nachos', 'street-food', 'catering'],
    events: ['Food Truck Carnivale', 'Fork on the Road', 'Gluttony'],
  },
  {
    name: 'Taco Cartel',
    cuisine: 'Mexican',
    description: 'Taco Cartel makes Mexican for everyone! Their entire menu is gluten, dairy, and nut free — so everyone can enjoy delicious street eats. Perfect for corporate events, weddings, and Adelaide\'s major festivals.',
    websiteUrl: 'https://tacocartelaus.com.au',
    address: 'Adelaide, South Australia',
    tags: ['mexican', 'gluten-free', 'dairy-free', 'nut-free', 'inclusive', 'catering'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },

  // ─── Ice Cream & Desserts ────────────────────────────────────
  {
    name: "What's The Scoop",
    cuisine: 'Desserts',
    description: 'A classic international ice cream truck that\'s always a fan favourite. What\'s The Scoop is the perfect dessert option for any event — scooping joy across Adelaide with premium flavours and a vintage truck vibe.',
    phone: '0434 993 061',
    websiteUrl: 'https://whatsthescoop.com.au',
    facebookHandle: 'WhatstheScoopAdelaide',
    address: 'Adelaide, South Australia',
    tags: ['ice-cream', 'desserts', 'gelato', 'catering', 'weddings', 'vintage'],
    events: ['Food Truck Carnivale', 'Gluttony'],
  },
  {
    name: '48 Flavours',
    cuisine: 'Desserts',
    description: 'Adelaide\'s beloved gelato institution. 48 Flavours serves artisanal gelato and sorbets using real fruit, premium chocolate, and local ingredients. A Fringe and festival regular with a cult following.',
    address: 'Adelaide, South Australia',
    tags: ['gelato', 'sorbet', 'desserts', 'artisan', 'local'],
    events: ['Gluttony', 'Adelaide Fringe', 'Garden of Unearthly Delights'],
  },

  // ─── Asian ──────────────────────────────────────────────────
  {
    name: 'Sookii La La',
    cuisine: 'Asian',
    description: 'Asian-inspired street food that brings bold flavours and vibrant dishes to Adelaide. From steaming bowls to loaded bao buns, Sookii La La is a Gluttony staple and one of SA\'s most popular festival food trucks.',
    phone: '0432 274 618',
    websiteUrl: 'https://sookiilala.com.au',
    address: 'Adelaide, South Australia',
    tags: ['asian', 'street-food', 'bao', 'noodles', 'festival'],
    events: ['Gluttony', 'Adelaide Fringe', 'Lucky Dumpling Market'],
  },
  {
    name: 'Moi An Viet Street Food Co',
    cuisine: 'Vietnamese',
    description: 'Mời Ăn means "please eat" in Vietnamese — and that\'s exactly what they\'re about. Authentic Vietnamese street food including phở, bánh mì, and fresh rice paper rolls, all made with love and traditional recipes.',
    websiteUrl: 'https://moianstreetfood.com',
    address: 'Adelaide, South Australia',
    tags: ['vietnamese', 'pho', 'banh-mi', 'street-food', 'asian'],
    events: ['Food Truck Carnivale', 'Lucky Dumpling Market', 'Fork on the Road'],
  },
  {
    name: 'Bao+',
    cuisine: 'Asian',
    description: 'Fluffy steamed bao buns filled with creative, flavour-packed combinations. From classic pork belly to modern fusion fillings, Bao+ brings the best of Taiwanese street food to Adelaide festivals and events.',
    address: 'Adelaide, South Australia',
    tags: ['bao', 'asian', 'taiwanese', 'street-food', 'steamed-buns'],
    events: ['Gluttony', 'Adelaide Fringe'],
  },

  // ─── Pizza ──────────────────────────────────────────────────
  {
    name: 'La Mia Luna Pizza',
    cuisine: 'Italian',
    description: 'Authentic, hand-stretched, woodfire-style pizza made with the freshest ingredients sourced mostly from SA local suppliers. La Mia Luna brings the warmth and flavour of traditional Italian pizza to every event.',
    phone: '0493 618 235',
    websiteUrl: 'https://lamialuna.com.au',
    address: 'Adelaide, South Australia',
    tags: ['pizza', 'italian', 'woodfire', 'handmade', 'local-produce'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },
  {
    name: 'DoughBalls Pizza & Catering',
    cuisine: 'Italian',
    description: 'Wood-fired pizza and indulgent desserts from multiple Adelaide locations. DoughBalls brings the authentic taste of Italian street food with a mobile wood-fired oven that cranks out perfectly blistered pizzas at events and private functions.',
    phone: '0499 777 454',
    websiteUrl: 'https://doughballspizza.com.au',
    address: 'Glenelg, South Australia',
    tags: ['pizza', 'italian', 'woodfire', 'desserts', 'catering'],
    events: ['Food Truck Carnivale', 'Tasting Australia'],
  },

  // ─── Burgers ────────────────────────────────────────────────
  {
    name: 'Daisy Burger',
    cuisine: 'Burgers',
    description: 'Juicy, no-nonsense smash burgers built for maximum flavour. Daisy Burger is Adelaide\'s go-to mobile burger truck for festivals, weddings, and corporate events. Simple ingredients, perfect execution.',
    phone: '0415 179 139',
    websiteUrl: 'https://daisyburger.com.au',
    instagramHandle: 'daisyburgercatering',
    address: 'Adelaide, South Australia',
    tags: ['burgers', 'smash-burgers', 'catering', 'weddings', 'events'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },

  // ─── Jaffles & Comfort Food ──────────────────────────────────
  {
    name: "Jarrod's Jaffles",
    cuisine: 'Australian',
    description: 'Gourmet jaffles and toasties elevated to an art form. From classic cheese and ham to wild creations with brioche bread desserts, Jarrod\'s Jaffles is a uniquely Australian food truck experience loved at festivals across SA.',
    phone: '0400 921 861',
    websiteUrl: 'https://jarrodsjaffles.com.au',
    address: 'Adelaide, South Australia',
    tags: ['jaffles', 'toasties', 'australian', 'comfort-food', 'catering'],
    events: ['Food Truck Carnivale', 'Tasting Australia', 'Fork on the Road'],
  },

  // ─── Grilled Cheese ──────────────────────────────────────────
  {
    name: 'Cheesy Street',
    cuisine: 'American',
    description: 'Epic loaded grilled cheese sandwiches that have earned a spot among Australia\'s top 50 best sandwiches. From The Notorious P.I.G. with slow-cooked BBQ pulled pork to The Mac Attack, Cheesy Street is pure comfort.',
    websiteUrl: 'https://cheesystreet.com.au',
    instagramHandle: 'cheesystreetadl',
    address: 'Adelaide, South Australia',
    tags: ['grilled-cheese', 'sandwiches', 'comfort-food', 'american', 'festival'],
    events: ['Gluttony', 'Adelaide Fringe', 'Food Truck Carnivale', 'Fork on the Road'],
  },

  // ─── German ──────────────────────────────────────────────────
  {
    name: 'Frites & Giggles',
    cuisine: 'European',
    description: 'Belgian-style frites (fries) served with an array of gourmet sauces and loaded toppings. Frites & Giggles brings the fun of European street food to Adelaide\'s biggest festivals with crispy, golden perfection.',
    address: 'Adelaide, South Australia',
    tags: ['fries', 'frites', 'belgian', 'european', 'festival', 'sauces'],
    events: ['Gluttony', 'Adelaide Fringe', 'Garden of Unearthly Delights'],
  },

  // ─── Gelato ──────────────────────────────────────────────────
  {
    name: 'Gelato Messina',
    cuisine: 'Desserts',
    description: 'Australia\'s most famous gelato brand, known for wildly creative flavours and limited-edition specials. Gelato Messina brings their cult-favourite scoops to Adelaide\'s biggest events and festivals.',
    websiteUrl: 'https://gelatomessina.com',
    instagramHandle: 'gelatomessina',
    address: 'Adelaide, South Australia',
    tags: ['gelato', 'desserts', 'premium', 'creative-flavours'],
    events: ['Gluttony', 'Adelaide Fringe'],
  },

  // ═══════════════════════════════════════════════════════════════
  // BATCH 2 — Additional Adelaide trucks from deep research
  // ═══════════════════════════════════════════════════════════════

  // ─── Mexican ─────────────────────────────────────────────────
  {
    name: 'Braising Boy',
    cuisine: 'Mexican',
    description: 'Adelaide\'s premium taqueria on wheels. Braising Boy specialises in simple, seasonal, and tasty tacos with everything made in-house from scratch. Inspired by street-side taquerias and LA food trucks, the menu changes with the seasons.',
    phone: '0428 287 522',
    websiteUrl: 'https://braisingboy.com.au',
    instagramHandle: 'braisingboy',
    address: 'Adelaide, South Australia',
    tags: ['mexican', 'tacos', 'seasonal', 'premium', 'handmade', 'catering', 'weddings'],
    events: ['Food Truck Carnivale', 'Fork on the Road', 'Tasting Australia'],
  },
  {
    name: 'Mexican Madness',
    cuisine: 'Mexican',
    description: 'Bold, flavour-packed Mexican street food with a twist. Mexican Madness serves up Mex burgers, burritos, tacos, loaded nachos, and unique desserts like chilli brownies and spicy chocolate mousse. Vegetarian, vegan, and GF options available.',
    phone: '0422 840 633',
    websiteUrl: 'https://mexicanmadness.com',
    instagramHandle: 'mexican_madness_foodtruck',
    address: 'Adelaide, South Australia',
    tags: ['mexican', 'burritos', 'tacos', 'nachos', 'vegan', 'vegetarian', 'gluten-free'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },
  {
    name: 'La Chiva Taqueria',
    cuisine: 'Mexican',
    description: 'From food truck to fixed restaurant — La Chiva brings South American-inspired Mexican food to Grote Street, Adelaide. Known for birria tacos, patatas bravas, elote corn ribs, and a fully gluten-free menu.',
    phone: '0405 800 330',
    websiteUrl: 'https://lachiva.com.au',
    address: '42 Grote Street, Adelaide SA 5000',
    tags: ['mexican', 'south-american', 'gluten-free', 'tacos', 'birria', 'restaurant'],
    events: ['Food Truck Carnivale', 'Gluttony'],
  },

  // ─── Burgers ────────────────────────────────────────────────
  {
    name: 'Gang Gang',
    cuisine: 'Burgers',
    description: 'Starting at the Adelaide Central Market in 2017, Gang Gang became a festival scene legend with their American and Asian-inspired burgers. Now with a brick-and-mortar in Eden Hills plus the food truck for events.',
    websiteUrl: 'https://goodtimegang.co',
    instagramHandle: '99gangsocial',
    address: 'Adelaide, South Australia',
    tags: ['burgers', 'american', 'asian-inspired', 'festival', 'catering', 'weddings'],
    events: ['Gluttony', 'Adelaide Fringe', 'Food Truck Carnivale', 'Royal Adelaide Show'],
  },
  {
    name: 'Z Town Burgers',
    cuisine: 'Burgers',
    description: 'Serving up thick, juicy burgers with quality ingredients across Adelaide\'s food truck scene. Z Town brings the classic burger experience with creative twists to festivals and events.',
    instagramHandle: 'ztownburgerbar',
    address: 'Adelaide, South Australia',
    tags: ['burgers', 'american', 'festival', 'events'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },

  // ─── Greek / Mediterranean ──────────────────────────────────
  {
    name: 'Staazi & Co',
    cuisine: 'Greek',
    description: '100% plant-based Greek street food — named among the world\'s top vegan food trucks by Lonely Planet. Famous for their "lamb" and "chicken" yiros, falafel, and loaded ABs, all made without any animal products.',
    phone: '0416 202 544',
    websiteUrl: 'https://staaziandco.com.au',
    instagramHandle: 'staaziandco',
    address: '224 Grenfell St, Adelaide SA 5000',
    tags: ['greek', 'vegan', 'plant-based', 'yiros', 'falafel', 'gluten-free', 'sustainable'],
    events: ['Food Truck Carnivale', 'Fork on the Road', 'Gluttony'],
  },
  {
    name: "Bab's Greek BBQ",
    cuisine: 'Greek',
    description: 'Authentic Greek street food featuring lamb souvlaki, yiros, and patates feta. Bab\'s brings the taste of the Mediterranean to Adelaide\'s biggest events with traditional charcoal-grilled meats.',
    address: 'Adelaide, South Australia',
    tags: ['greek', 'souvlaki', 'yiros', 'bbq', 'mediterranean', 'lamb'],
    events: ['Food Truck Carnivale', 'Fork on the Road', 'Royal Adelaide Show'],
  },

  // ─── Pizza ──────────────────────────────────────────────────
  {
    name: 'Cucina Cufone',
    cuisine: 'Italian',
    description: 'Authentic wood-fired pizzas baked fresh on-site from a mobile pizza truck. Cucina Cufone brings Mediterranean flavours to weddings, engagements, birthdays, and corporate events across Adelaide.',
    websiteUrl: 'https://cucinacufone.com.au',
    address: 'Adelaide, South Australia',
    tags: ['pizza', 'italian', 'woodfire', 'catering', 'weddings', 'mediterranean'],
    events: ['Food Truck Carnivale'],
  },
  {
    name: 'Woody the Wood Oven Wagon',
    cuisine: 'Italian',
    description: 'Unique mobile wood-fired pizza wagon serving gourmet pizzas and street food. Every base is made fresh, meats are marinated in-house, and pizzas are rolled and cooked right before your eyes. Dessert pizzas are a must-try.',
    phone: '0415 277 644',
    websiteUrl: 'https://woodythewagon.com.au',
    address: 'Adelaide, South Australia',
    tags: ['pizza', 'woodfire', 'gourmet', 'dessert-pizza', 'catering', 'weddings'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },
  {
    name: 'The Rolling Pizza Oven',
    cuisine: 'Italian',
    description: 'Mobile wood-fired pizza, roasts, grazing tables, and salads. The Rolling Pizza Oven brings restaurant-quality Italian food to your event with a stunning mobile setup.',
    address: 'Adelaide, South Australia',
    tags: ['pizza', 'woodfire', 'roasts', 'grazing', 'catering', 'weddings'],
    events: ['Food Truck Carnivale'],
  },

  // ─── Asian ──────────────────────────────────────────────────
  {
    name: 'Humpty Dumplings',
    cuisine: 'Asian',
    description: 'Hand-folded dumplings made fresh at Adelaide\'s biggest events. Humpty Dumplings serves up steamed and pan-fried dumplings with traditional Asian flavours and modern twists.',
    instagramHandle: 'humptydumplingsadelaide',
    address: 'Adelaide, South Australia',
    tags: ['dumplings', 'asian', 'chinese', 'steamed', 'pan-fried', 'handmade'],
    events: ['Fork on the Road', 'Lucky Dumpling Market', 'Food Truck Carnivale'],
  },
  {
    name: 'The Satay Hut',
    cuisine: 'Asian',
    description: 'Satay skewers, wraps, burgers, spring rolls, and dim sims. The Satay Hut serves up flavourful Asian-inspired street food across Adelaide\'s festival circuit.',
    address: 'Adelaide, South Australia',
    tags: ['satay', 'asian', 'wraps', 'spring-rolls', 'dim-sims', 'festival'],
    events: ['Food Truck Carnivale', 'Fork on the Road', 'Royal Adelaide Show'],
  },
  {
    name: 'Esaan Thai Street Food',
    cuisine: 'Thai',
    description: 'Authentic Isaan-style Thai street food bringing the bold, spicy flavours of northeastern Thailand to Adelaide. Fresh ingredients, traditional recipes, and unforgettable heat.',
    address: 'Adelaide, South Australia',
    tags: ['thai', 'isaan', 'street-food', 'spicy', 'asian'],
    events: ['Fork on the Road', 'Lucky Dumpling Market', 'Asia Oasis Street Food Festival'],
  },
  {
    name: 'Fusion of Tandor',
    cuisine: 'Indian',
    description: 'Aromatic Indian street food featuring tandoori dishes, curries, and naan bread fresh from the oven. Fusion of Tandor brings the rich spices and flavours of India to Adelaide\'s food truck scene.',
    address: 'Adelaide, South Australia',
    tags: ['indian', 'tandoori', 'curry', 'naan', 'street-food', 'spicy'],
    events: ['Fork on the Road', 'Food Truck Carnivale'],
  },

  // ─── German ──────────────────────────────────────────────────
  {
    name: 'WienerBago',
    cuisine: 'German',
    description: 'Hahndorf gourmet wieners, hot dogs, sauerkraut, and all the fixings. WienerBago brings premium German sausages to Adelaide events with quality Adelaide Hills produce.',
    address: 'Adelaide, South Australia',
    tags: ['german', 'hot-dogs', 'sausages', 'sauerkraut', 'hahndorf'],
    events: ['Food Truck Carnivale', 'Royal Adelaide Show'],
  },
  {
    name: 'Bavarian Grill',
    cuisine: 'German',
    description: 'Traditional German cuisine from the grill — bratwurst, schnitzel, and pretzels served with mustard and sauerkraut. Bavarian Grill brings authentic German festival food to Adelaide.',
    address: 'Adelaide, South Australia',
    tags: ['german', 'bavarian', 'bratwurst', 'schnitzel', 'pretzels'],
    events: ['Food Truck Carnivale', 'Royal Adelaide Show'],
  },

  // ─── Spanish ────────────────────────────────────────────────
  {
    name: 'The Paella Bar',
    cuisine: 'Spanish',
    description: 'Giant paella pans sizzling with saffron rice, seafood, chicken, and chorizo. The Paella Bar brings the vibrant taste of Spain to Adelaide events with their spectacular live cooking displays.',
    websiteUrl: 'https://paellabar.com.au',
    address: 'Adelaide, South Australia',
    tags: ['spanish', 'paella', 'seafood', 'rice', 'festival', 'catering'],
    events: ['Food Truck Carnivale', 'Fork on the Road', 'Tasting Australia'],
  },

  // ─── Moroccan ───────────────────────────────────────────────
  {
    name: 'Moorish Bites',
    cuisine: 'Moroccan',
    description: 'Authentic Moroccan street food featuring tagines, couscous, falafel wraps, and aromatic spiced dishes. Moorish Bites brings North African flavours to Adelaide\'s food truck scene.',
    websiteUrl: 'https://moorishbites.com.au',
    address: 'Adelaide, South Australia',
    tags: ['moroccan', 'tagine', 'falafel', 'couscous', 'north-african', 'halal'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },

  // ─── Desserts & Sweet Treats ────────────────────────────────
  {
    name: 'Honey Puff Lads',
    cuisine: 'Desserts',
    description: 'Golden, crunchy honey puffs dusted with cinnamon and drizzled with honey syrup. An Adelaide festival favourite and the perfect sweet treat after a day of street food.',
    address: 'Adelaide, South Australia',
    tags: ['desserts', 'honey-puffs', 'sweet', 'festival', 'greek-dessert'],
    events: ['Food Truck Carnivale', 'Royal Adelaide Show', 'Gluttony'],
  },
  {
    name: 'Van Dough',
    cuisine: 'Desserts',
    description: 'Fresh doughnuts made to order from a vintage van. Van Dough serves up hot, pillowy doughnuts with creative toppings and fillings at Adelaide\'s biggest festivals and events.',
    address: 'Adelaide, South Australia',
    tags: ['doughnuts', 'desserts', 'sweet', 'vintage', 'festival'],
    events: ['Food Truck Carnivale', 'Gluttony', 'Garden of Unearthly Delights'],
  },
  {
    name: 'Strawberries Galore',
    cuisine: 'Desserts',
    description: 'Chocolate-dipped strawberries, strawberry sundaes, and fresh strawberry treats. A colourful, Instagram-worthy dessert truck that\'s a staple at Adelaide events.',
    address: 'Adelaide, South Australia',
    tags: ['strawberries', 'chocolate', 'desserts', 'sweet', 'festival', 'instagram-worthy'],
    events: ['Food Truck Carnivale', 'Royal Adelaide Show'],
  },
  {
    name: 'Chocolate & Co',
    cuisine: 'Desserts',
    description: 'Artisan hot chocolate, chocolate fountains, and handcrafted chocolate treats. Chocolate & Co brings premium chocolate experiences to Adelaide\'s festival scene.',
    address: 'Adelaide, South Australia',
    tags: ['chocolate', 'hot-chocolate', 'desserts', 'premium', 'artisan'],
    events: ['Gluttony', 'Adelaide Fringe', 'Garden of Unearthly Delights'],
  },
  {
    name: 'Cakeboy',
    cuisine: 'Desserts',
    description: 'Decadent cakes, pastries, and sweet treats served from a vibrant mobile setup. Cakeboy is Adelaide\'s go-to for festival desserts with creative, Insta-worthy creations.',
    address: 'Adelaide, South Australia',
    tags: ['cakes', 'pastries', 'desserts', 'instagram-worthy', 'festival'],
    events: ['Gluttony', 'Adelaide Fringe'],
  },
  {
    name: 'TaChs Stroopwafels',
    cuisine: 'Desserts',
    description: 'Handmade Dutch stroopwafels and desserts served from a beautifully restored 1947 caravan. Warm, caramel-filled waffle cookies made fresh — a unique and delicious festival treat.',
    address: 'Adelaide, South Australia',
    tags: ['stroopwafels', 'dutch', 'desserts', 'handmade', 'vintage-caravan', 'catering'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },

  // ─── Coffee ─────────────────────────────────────────────────
  {
    name: 'The Brew Cruiser',
    cuisine: 'Coffee',
    description: 'Premium specialty coffee on wheels. The Brew Cruiser brings barista-quality coffee to Adelaide events, festivals, and private functions with a focus on locally roasted beans.',
    instagramHandle: 'thebrewcruiser',
    address: 'Adelaide, South Australia',
    tags: ['coffee', 'barista', 'specialty', 'mobile-cafe', 'events'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },
  {
    name: 'Bellachino Coffee Van',
    cuisine: 'Coffee',
    description: 'Mobile coffee van serving fresh espresso, lattes, and cold brew at Adelaide events and markets. Bellachino brings café-quality coffee to wherever you are.',
    address: 'Adelaide, South Australia',
    tags: ['coffee', 'espresso', 'cold-brew', 'mobile-cafe', 'markets'],
    events: ['Food Truck Carnivale'],
  },

  // ─── Portuguese ─────────────────────────────────────────────
  {
    name: 'The Pastelaria',
    cuisine: 'Portuguese',
    description: 'Authentic Portuguese pastéis de nata (custard tarts) and other traditional pastries. The Pastelaria brings a taste of Lisbon to Adelaide\'s food truck scene with handcrafted classics.',
    instagramHandle: 'the_pastelaria',
    address: 'Adelaide, South Australia',
    tags: ['portuguese', 'pasteis-de-nata', 'pastries', 'custard-tarts', 'european'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },

  // ─── Australian / Comfort ──────────────────────────────────
  {
    name: 'Spuds & More Mobile Catering',
    cuisine: 'Australian',
    description: 'Loaded baked potatoes, nachos, yiros, and burgers. Spuds & More brings honest, generous comfort food to events across Adelaide with nearly all ingredients being gluten-free, plus extensive vegan and vegetarian options.',
    phone: '0474 560 388',
    websiteUrl: 'https://spudsandmoresa.com',
    address: 'Adelaide, South Australia',
    tags: ['australian', 'baked-potatoes', 'nachos', 'yiros', 'gluten-free', 'vegan', 'catering'],
    events: ['Food Truck Carnivale', 'Fork on the Road'],
  },

  // ─── Caribbean ──────────────────────────────────────────────
  {
    name: 'Taste of Paradise',
    cuisine: 'Caribbean',
    description: 'Tropical Caribbean flavours served up at Adelaide\'s biggest events. Taste of Paradise brings jerk chicken, rice and peas, plantain, and island-inspired dishes to the food truck scene.',
    address: 'Adelaide, South Australia',
    tags: ['caribbean', 'jerk-chicken', 'tropical', 'rice-and-peas', 'plantain'],
    events: ['Fork on the Road', 'Food Truck Carnivale'],
  },

  // ─── Drinks / Bar ──────────────────────────────────────────
  {
    name: 'Bubble Bus',
    cuisine: 'Drinks',
    description: 'A mobile bubble tea and drinks truck serving refreshing boba teas, fruit teas, and creative drinks at Adelaide festivals. Fun, colourful, and perfect for summer events.',
    address: 'Adelaide, South Australia',
    tags: ['bubble-tea', 'boba', 'drinks', 'festival', 'summer'],
    events: ['Gluttony', 'Adelaide Fringe'],
  },
];

// ─── Adelaide Events ──────────────────────────────────────────
const ADELAIDE_EVENTS = [
  { name: 'Gluttony', location: 'Rymill Park / Murlawirrapurka', description: 'Adelaide Fringe\'s premier food precinct with 25+ vendors, pop-up restaurants, and bars.' },
  { name: 'Adelaide Fringe', location: 'Various venues across Adelaide', description: 'The world\'s second-largest annual arts festival, running Feb–Mar with food trucks throughout.' },
  { name: 'Food Truck Carnivale', location: 'Various parks across Adelaide', description: 'Free-entry family events featuring ~20 food trucks, live music, and carnival rides at locations across SA.' },
  { name: 'Fork on the Road', location: 'Various locations', description: 'South Australia\'s premier mobile food truck event series bringing together the best trucks.' },
  { name: 'Lucky Dumpling Market', location: 'Elder Park, Adelaide', description: 'Asian-inspired food festival with 25+ vendors, live music, and entertainment. Oct–Nov each year.' },
  { name: 'Tasting Australia', location: 'Various Adelaide venues', description: 'Major food and drink festival celebrating the best of Australian cuisine. May each year.' },
  { name: 'Garden of Unearthly Delights', location: 'Rundle Park, Adelaide', description: 'Fringe festival hub with carnival rides, live shows, and diverse food stalls. Feb–Mar.' },
  { name: 'Asia Oasis Street Food Festival', location: 'Glenelg Foreshore', description: '100+ authentic Asian dishes from 20+ vendors, with cultural performances and sunset beach bar.' },
  { name: 'Royal Adelaide Show', location: 'Adelaide Showground, Wayville', description: 'South Australia\'s biggest annual agricultural show with 100+ food vendors over 10 days in Sep.' },
  { name: 'Harvest Rock', location: 'Adelaide CBD', description: 'Music and food festival combining live bands with curated food truck experiences. Oct each year.' },
  { name: 'Halal Food Festival', location: 'Various Adelaide venues', description: 'Celebrating diverse halal cuisines from around the world with food trucks and cultural events.' },
  { name: 'A Taste of the Hills', location: 'Lot 100, Adelaide Hills', description: 'Artisan food and wine festival in the Adelaide Hills with ~50 vendors including food trucks.' },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set. Add it to .env.local');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  console.log('\n🚚 Seeding Adelaide food trucks...\n');

  // Step 1: Find or create a system user to own directory-listed trucks
  let [systemUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'directory@foodtrucknext2me.com'))
    .limit(1);

  if (!systemUser) {
    console.log('  📋 Creating system directory user...');
    [systemUser] = await db
      .insert(schema.users)
      .values({
        email: 'directory@foodtrucknext2me.com',
        name: 'FindATruck Directory',
        passwordHash: 'DIRECTORY_LISTING_NO_LOGIN',
        role: 'owner' as const,
      })
      .returning();
  }
  console.log(`  👤 System user: ${systemUser.email} (${systemUser.id})\n`);

  // Step 2: Check existing trucks to avoid duplicates
  const existingTrucks = await db.select().from(schema.trucks);
  const existingNames = new Set(existingTrucks.map(t => t.name.toLowerCase()));

  let created = 0;
  let skipped = 0;
  const createdTruckMap: Record<string, string> = {}; // name -> id

  for (const truckData of TRUCKS) {
    if (existingNames.has(truckData.name.toLowerCase())) {
      console.log(`  ⏭️  "${truckData.name}" already exists — skipping`);
      // Still track existing trucks for sighting linking
      const existing = existingTrucks.find(t => t.name.toLowerCase() === truckData.name.toLowerCase());
      if (existing) createdTruckMap[truckData.name] = existing.id;
      skipped++;
      continue;
    }

    const [newTruck] = await db
      .insert(schema.trucks)
      .values({
        ownerUid: systemUser.id,
        name: truckData.name,
        cuisine: truckData.cuisine,
        description: truckData.description,
        phone: truckData.phone || null,
        websiteUrl: truckData.websiteUrl || null,
        instagramHandle: truckData.instagramHandle || null,
        facebookHandle: truckData.facebookHandle || null,
        tiktokHandle: truckData.tiktokHandle || null,
        address: truckData.address || null,
        imageUrl: truckData.imageUrl || null,
        tags: truckData.tags || [],
        isVisible: true,
        isOpen: false,
      })
      .returning();

    createdTruckMap[truckData.name] = newTruck.id;
    console.log(`  ✅ Created "${truckData.name}" (${truckData.cuisine})`);
    created++;
  }

  console.log(`\n📊 TRUCKS: ${created} created, ${skipped} skipped`);
  console.log(`📊 Total trucks now: ${existingTrucks.length + created}\n`);

  // Step 3: Seed festival events
  console.log('🎪 Seeding festival events...\n');
  const eventMap: Record<string, string> = {}; // name -> id

  for (const eventData of ADELAIDE_EVENTS) {
    const slug = eventData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if already exists
    const [existing] = await db
      .select()
      .from(schema.festivalEvents)
      .where(eq(schema.festivalEvents.slug, slug))
      .limit(1);

    if (existing) {
      eventMap[eventData.name] = existing.id;
      console.log(`  ⏭️  "${eventData.name}" already exists`);
      continue;
    }

    const [newEvent] = await db
      .insert(schema.festivalEvents)
      .values({
        name: eventData.name,
        slug,
        location: eventData.location,
        description: eventData.description,
        isRecurring: true,
      })
      .returning();

    eventMap[eventData.name] = newEvent.id;
    console.log(`  ✅ Created event "${eventData.name}"`);
  }

  // Step 4: Create sightings (link trucks to events)
  console.log('\n🔗 Linking trucks to events...\n');
  let sightings = 0;

  for (const truckData of TRUCKS) {
    const truckId = createdTruckMap[truckData.name];
    if (!truckId || !truckData.events) continue;

    for (const eventName of truckData.events) {
      const eventId = eventMap[eventName];
      if (!eventId) continue;

      // Check if sighting already exists
      const existing = await db
        .select()
        .from(schema.festivalSightings)
        .where(eq(schema.festivalSightings.truckId, truckId))
        .limit(50);

      const alreadyLinked = existing.some(s => s.eventId === eventId && s.year === 2026);
      if (alreadyLinked) continue;

      await db.insert(schema.festivalSightings).values({
        truckId,
        eventId,
        year: 2026,
        confirmed: true,
      });
      sightings++;
    }
  }

  console.log(`  ✅ Created ${sightings} event sightings\n`);

  // Summary
  console.log('─'.repeat(60));
  console.log('📊 FINAL SUMMARY:');
  console.log(`   Trucks: ${created} new + ${skipped} existing = ${created + skipped} total`);
  console.log(`   Events: ${Object.keys(eventMap).length}`);
  console.log(`   Sightings: ${sightings}`);
  console.log('─'.repeat(60));
  console.log('');
}

main().catch(console.error);
