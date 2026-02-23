// SA Food Truck Contacts — Expanded List
// Scraped from funofthefair.com.au, foodtrucksinadelaide.com.au, adelaidefoodtrucks.com.au,
// forkontheroad.com.au, weddingsa.com.au, individual truck websites, and business directories.
// Last updated: 2026-02-23

const FOOD_TRUCKS = [
    // === FOOD TRUCKS WITH VERIFIED EMAILS ===
    { name: 'Braising Boy', cuisine: 'Mexican/Argentinian', email: 'braisingboy@gmail.com', phone: null },
    { name: 'Cebu Soul', cuisine: 'Filipino', email: 'cebu.soul.food@gmail.com', phone: null },
    { name: 'Chimichurri Grill', cuisine: 'Argentinian', email: 'chimichurri.grill@yahoo.com', phone: null },
    { name: 'Mezze Muezza', cuisine: 'Middle Eastern', email: 'mezzemuezza@gmail.com', phone: null },
    { name: 'Moorish Bites', cuisine: 'Middle Eastern', email: 'moorishbites@gmail.com', phone: '0411 312 329' },
    { name: "What's The Scoop?", cuisine: 'Ice Cream', email: 'whatsthescoopadelaide@yahoo.com', phone: null },
    { name: 'Daisy Burger', cuisine: 'Burgers', email: 'info@daisyburger.com.au', phone: '0415 179 139' },
    { name: 'Rolling Pizza Oven', cuisine: 'Pizza', email: 'rollingpizzaoven@adam.com.au', phone: '0430 161 936' },
    { name: 'Staazi & Co', cuisine: 'Plant-based', email: 'hey@staaziandco.com.au', phone: '0416 202 544' },
    { name: 'Strawberries Galore', cuisine: 'Desserts', email: 'info@strawberriesgalore.com.au', phone: '0433 412 632' },
    { name: 'Taco Cartel', cuisine: 'Mexican', email: 'hola@tacocartelaus.com.au', phone: null },
    { name: 'La Mia Luna Pizza', cuisine: 'Italian Pizza', email: 'lamialunapizza@gmail.com', phone: null },
    { name: "Jarrod's Jaffles", cuisine: 'Jaffles', email: 'Jarrod@jarrodsjaffles.com.au', phone: null },

    // === NEW — Round 2 Scraping ===
    { name: 'Hokey Pokey', cuisine: 'Ice Cream', email: 'hokeypokeystirling@gmail.com', phone: null },
    { name: 'Kafethaki', cuisine: 'Greek Coffee/Loukoumades', email: 'kafethaki@outlook.com', phone: null },
    { name: 'Boost Mobeel', cuisine: 'Smoothies/Juice', email: 'info@mobeel.com.au', phone: null },
    { name: "TaCH's Stroopwafels", cuisine: 'Dutch Desserts', email: 'tachs.stroopwafels@gmail.com', phone: null },
    { name: "Soza's Sri Lankan Street Food", cuisine: 'Sri Lankan', email: 'sozassrilankanstreetfood@gmail.com', phone: '0432 361 257' },
    { name: 'The Fusion Fork', cuisine: 'Fusion/Indian', email: 'thefusionfork@gmail.com', phone: null },
    { name: 'Moi An Viet Street Food', cuisine: 'Vietnamese', email: 'hello@moianstreetfood.com', phone: null },
    { name: 'Rebel Roasters', cuisine: 'Coffee', email: 'info@rebelroasters.com.au', phone: null },
    { name: "Juan's Paella / The Paella Man", cuisine: 'Spanish Paella', email: 'party@thepaellaman.com', phone: null },
    { name: 'Bambino Woodfire', cuisine: 'Italian', email: 'events@bambinoadelaide.com.au', phone: null },
    { name: 'Feed My Friends', cuisine: 'Catering', email: 'feedmyfriends.catering@gmail.com', phone: null },
    { name: 'Kombi Keg Adelaide', cuisine: 'Mobile Bar', email: 'adelaide@kombikeg.com', phone: '0422 408 360' },

    // === EVENT ORGANISERS (Partnership opportunities) ===
    { name: 'Adelaide Food Trucks (events)', cuisine: 'Event Organiser', email: 'AdelaideFoodTrucks@yahoo.com', phone: '0434 993 061' },
    { name: 'Fork On The Road (events)', cuisine: 'Event Organiser', email: 'info@forkontheroad.com.au', phone: '0434 993 061' },

    // === PHONE ONLY (no email found — could message via social media) ===
    { name: 'The Satay Hut', cuisine: 'Asian/Satay', email: null, phone: '0416 181 771' },
    { name: 'WienerBago', cuisine: 'German Hotdogs', email: null, phone: '0413 411 211' },
    { name: 'Honey Puff Lads', cuisine: 'Desserts', email: null, phone: '0403 175 183' },
    { name: "Bab's Greek BBQ", cuisine: 'Greek', email: null, phone: '0449 169 105' },
    { name: 'Bavarian Grill', cuisine: 'German', email: null, phone: '0452 226 731' },
    { name: 'Van Dough', cuisine: 'Doughnuts', email: null, phone: '0406 835 817' },
    { name: 'The Paella Bar', cuisine: 'Spanish', email: null, phone: '0414 688 970' },
    { name: 'Bellachino Coffee', cuisine: 'Coffee', email: null, phone: '0416 041 479' },
    { name: 'El Guaco Taco', cuisine: 'Mexican', email: null, phone: '0434 993 061' },
    { name: 'Orexi Souvlaki', cuisine: 'Greek', email: null, phone: '0408 815 336' },
    { name: "Soza's", cuisine: 'Sri Lankan', email: null, phone: '0432 361 257' },
    { name: 'Uncle Docs', cuisine: 'American', email: null, phone: '0411 620 347' },
];

// Summary stats
const withEmail = FOOD_TRUCKS.filter(t => t.email);
const phoneOnly = FOOD_TRUCKS.filter(t => !t.email && t.phone);
console.log(`Total trucks: ${FOOD_TRUCKS.length}`);
console.log(`With email: ${withEmail.length}`);
console.log(`Phone only: ${phoneOnly.length}`);

module.exports = { FOOD_TRUCKS };
