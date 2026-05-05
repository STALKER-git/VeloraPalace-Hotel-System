import { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '../types';

interface Translations {
  nav: {
    home: string; rooms: string; dining: string; services: string; location: string; book: string; account: string;
  };
  common: {
    bookNow: string; learnMore: string; viewAll: string; perNight: string; guests: string; checkIn: string; checkOut: string; reserve: string; cancel: string; confirm: string; loading: string; close: string; search: string; submit: string; price: string; status: string; actions: string; add: string; edit: string; delete: string; save: string; 
  };
  hero: { eyebrow: string; title: string; subtitle: string; cta: string; explore: string; };
  home: {
    scroll: string; checkAvailability: string; 
    awardsTitle: string; awardsSub: string;
    roomsEyebrow: string; roomsTitle: string; roomsDesc: string; from: string; reserve: string; viewAllRooms: string;
    storyYears: string; storyEyebrow: string; storyTitle: string; storyP1: string; storyP2: string; discoverHeritage: string;
    expEyebrow: string; expTitle: string;
    guestEyebrow: string; guestTitle: string;
    ctaEyebrow: string; ctaTitle: string; ctaDesc: string; makeRes: string;
  };
  rooms: {
    eyebrow: string; title: string; desc: string;
    adults: string; kids: string; findSanctuary: string;
    filters: string; reset: string; roomCategory: string; allCollections: string; standard: string; deluxe: string; suite: string; villa: string;
    maxPrice: string; desiredVista: string; 
    showing: string; results: string; sort: string; priceHighLow: string;
    curating: string; startingFrom: string; 
    noMatches: string; noMatchesDesc: string; clearFilters: string;
    roomDesc: string;
  };
  services: {
    eyebrow: string; title: string; desc: string;
    bookService: string;
    included: string; complimentary: string;
    titles: string[];
    descs: string[];
  };
  restaurant: {
    eyebrow: string; title: string; desc: string;
    menu: string; reserveTable: string; ourMenu: string;
    cart: string; total: string; checkout: string; emptyCart: string;
    bookingDeposit: string; nonRefundable: string; securePayment: string;
    cardNumber: string; expiry: string; cvc: string; confirmBooking: string;
    table: string; time: string; date: string; specialRequests: string;
    bookExperience: string; bookDesc: string; tableRes: string; roomService: string;
    adults: string; children: string; requestTable: string;
    roomNumber: string; orderRoom: string; placeOrder: string;
    categories: string[];
  };
  footer: {
    desc: string; explore: string; guestServices: string; contact: string;
    newsletter: string; join: string; rights: string;
    privacy: string; terms: string; cookies: string;
    servicesList: string[];
  };
  booking: {
    eyebrow: string; title: string;
    step1: string; step2: string; step3: string;
    stayDetails: string; roomSelection: string; noRoomSelected: string;
    guestInfo: string; fullName: string; dob: string; phone: string; passport: string; specialReq: string;
    paymentMethod: string; creditCard: string; paypal: string; cash: string;
    prev: string; continue: string; finalizing: string; confirmRes: string;
    summary: string; selectRoomFirst: string; duration: string; nights: string;
    promoCode: string; apply: string; subtotal: string; taxes: string; discount: string; totalBalance: string; secureEnc: string;
  };
  auth: {
    welcome: string; signInTo: string; email: string; password: string;
    signIn: string; signUp: string; noAccount: string; haveAccount: string;
    fullName: string; createAccount: string; loggingIn: string; signingUp: string;
  };
  dashboard: {
    admin: string; recep: string; client: string;
    overview: string; rooms: string; users: string; bookings: string; restaurant: string; venues: string; orders: string; promos: string;
    logout: string; totalRev: string; activeRes: string; totalUsers: string; occRate: string;
    recentRes: string; roomStatus: string; noRes: string;
  };
  chatbot: {
    title: string; available: string; ask: string;
  };
  location: {
    eyebrow: string; title: string; desc: string;
    contactInfo: string; address: string; addressVal: string;
    telephone: string; telVal: string;
    email: string; emailVal: string;
    transportProtocol: string; transportDesc: string;
    reqTransfer: string; getDirections: string;
    distances: string; beach: string; oldTown: string; airport: string; monaco: string;
    mins2: string; mins10: string; mins15: string; mins35: string;
  };
  clientDashboard: {
    myProfile: string; myBookings: string; settings: string; signOut: string;
    member: string; bookings: string; points: string; since: string;
    welcomeBack: string; dearGuest: string; manageDesc: string;
    personalInfo: string; firstName: string; lastName: string;
    gender: string; male: string; female: string; select: string;
    dob: string; phone: string; nationality: string; selectNat: string;
    idPassport: string; billingAddress: string; saveChanges: string; saving: string;
    resHistory: string; suites: string; dining: string;
    checkIn: string; checkOut: string; guests: string;
    date: string; time: string; cancelRes: string;
    noRoomRes: string; exploreAcc: string;
    noDiningRes: string; bookTable: string;
    accountSettings: string; changePass: string; changePassDesc: string; update: string;
    emailNotif: string; emailNotifDesc: string; configure: string;
    deleteAccount: string; deleteAccountDesc: string; delete: string;
    memberExclusive: string; spaCredit: string; useCode: string;
  };
  adminDashboard: {
    title: string; subtitle: string;
    roomMgmt: string; addRoom: string;
    roomNo: string; type: string; price: string; status: string; actions: string;
    userDir: string; makeRecep: string; revokeAccess: string;
    culinaryMgmt: string; addDish: string;
    allRes: string; reference: string; dates: string;
    promoMgmt: string; promoMgmtDesc: string; addPromo: string; editPromo: string;
    promoFormDesc: string; promoCodeLabel: string; generate: string;
    discountPercent: string; maxUses: string; quickPresets: string;
    promoDesc: string; expiryDate: string;
    totalCodes: string; activeCodes: string; totalUses: string; avgDiscount: string;
    noPromos: string; usage: string;
    promoActive: string; promoInactive: string; promoExpired: string; promoExhausted: string;
  };
  recepDashboard: {
    title: string; subtitle: string;
    hotel: string; restaurant: string; orders: string;
    occupancy: string; seats: string;
    roomRes: string; searchGuest: string; stayDates: string;
    liveFloor: string; tableRes: string; noTableRes: string;
    roomService: string; order: string; totalAmount: string; note: string; noOrders: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: { home: 'Home', rooms: 'Rooms & Suites', dining: 'Dining', services: 'Services', location: 'Location', book: 'Reserve', account: 'My Account' },
    common: { bookNow: 'Book Now', learnMore: 'Learn More', viewAll: 'View All', perNight: 'per night', guests: 'Guests', checkIn: 'Check-in', checkOut: 'Check-out', reserve: 'Reserve', cancel: 'Cancel', confirm: 'Confirm', loading: 'Loading...', close: 'Close', search: 'Search', submit: 'Submit', price: 'Price', status: 'Status', actions: 'Actions', add: 'Add', edit: 'Edit', delete: 'Delete', save: 'Save' },
    hero: { eyebrow: 'Where Elegance Meets Infinity', title: 'VELORA PALACE', subtitle: 'An extraordinary sanctuary of refined luxury, where every moment is crafted with unparalleled artistry and devotion.', cta: 'Reserve Your Stay', explore: 'Explore' },
    home: { scroll: 'SCROLL', checkAvailability: 'Check Availability', awardsTitle: 'Awards', awardsSub: 'Excellence', roomsEyebrow: 'Accommodations', roomsTitle: 'Rooms & Suites', roomsDesc: 'Each accommodation is a masterpiece of design, offering sanctuary, privacy, and unrivaled comfort.', from: 'From', reserve: 'Reserve', viewAllRooms: 'View All Accommodations', storyYears: 'YEARS OF EXCELLENCE', storyEyebrow: 'Our Story', storyTitle: 'A Legacy of Timeless Refinement', storyP1: 'Since 1989, Velora Palace has stood as the definitive expression of European luxury on the French Riviera. Founded by the visionary hotelier Édouard Velora, our establishment has hosted royalty, heads of state, and the worlds most distinguished guests.', storyP2: 'Every corner of Velora Palace tells a story — of artisanship, of passion, of an unwavering commitment to creating moments that transcend ordinary experience.', discoverHeritage: 'Discover Our Heritage', expEyebrow: 'Experiences', expTitle: 'World-Class Amenities', guestEyebrow: 'Guest Stories', guestTitle: 'Voices of Excellence', ctaEyebrow: 'Begin Your Journey', ctaTitle: 'Reserve Your Extraordinary Stay', ctaDesc: 'Allow us to craft an experience beyond imagination. Our concierge team awaits your arrival with the utmost care.', makeRes: 'Make a Reservation' },
    rooms: { eyebrow: 'Rooms & Suites', title: 'Unrivaled Grandeur', desc: 'From intimate sanctuaries to sprawling estates, discover a collection of accommodations designed for the most discerning travelers.', adults: 'Adults', kids: 'Kids', findSanctuary: 'Find Sanctuary', filters: 'Filters', reset: 'Reset', roomCategory: 'Room Category', allCollections: 'All Collections', standard: 'Standard', deluxe: 'Deluxe', suite: 'Suite', villa: 'Private Villa', maxPrice: 'Max Price', desiredVista: 'Desired Vista', showing: 'Showing', results: 'exquisite results', sort: 'Sort', priceHighLow: 'Price (High to Low)', curating: 'Curating Available Sanctuaries...', startingFrom: 'Starting From', noMatches: 'No Matching Sanctuaries', noMatchesDesc: 'Our curators could not find a room matching your exact criteria. Please try adjusting your filters or stay dates.', clearFilters: 'Clear All Filters', roomDesc: 'A beautifully appointed room offering unparalleled luxury and comfort for our esteemed guests.' },
    services: { eyebrow: 'Unparalleled Experiences', title: 'Services & Amenities', desc: 'Beyond the threshold of your suite lies a world designed purely for your gratification. Every service crafted for the extraordinary.', bookService: 'Inquire & Book', included: 'Included With Every Stay', complimentary: 'Complimentary Amenities', titles: ['Serenity Spa', 'Infinity Pool', 'Fitness Atelier', 'Chauffeur Fleet', 'Business Lounge', 'Private Beach Club'], descs: ['Indulge in ancient wellness rituals and bespoke therapies. Our 3,000 sqm sanctuary features twelve private treatment rooms.', 'Swim among the clouds in our rooftop temperature-controlled infinity pool overlooking the Mediterranean.', 'A state-of-the-art gymnasium equipped with Technogym Artis machines, a dedicated yoga studio with panoramic sea views.', 'Travel the French Riviera in our exclusive fleet of Rolls-Royce Phantom and Maybach vehicles.', 'State-of-the-art facilities for our executive guests. Private meeting rooms with video conferencing.', 'Exclusive access to our pristine private beach with sun loungers, Balinese daybeds, water sports equipment.'] },
    restaurant: { eyebrow: 'Culinary Excellence', title: 'A Michelin Star Experience', desc: 'Savour the artistry of our three award-winning master chefs. Our exclusive dining experience at L Aura Noire features authentic and avant-garde flavors.', menu: 'Menu', reserveTable: 'Reserve Table', ourMenu: 'Our Menu', cart: 'Cart', total: 'Total', checkout: 'Checkout', emptyCart: 'Your cart is empty', bookingDeposit: 'A booking deposit of 50 DZD is required.', nonRefundable: 'Non-refundable', securePayment: 'Secure Payment', cardNumber: 'Card Number', expiry: 'MM/YY', cvc: 'CVC', confirmBooking: 'Confirm Booking', table: 'Table', time: 'Time', date: 'Date', specialRequests: 'Special Requests', bookExperience: 'Book Your Experience', bookDesc: 'Reserve a table at L Aura Noire or order directly to your suite using our 24/7 concierge service.', tableRes: 'Table Reservation', roomService: 'Room Service', adults: 'Adults', children: 'Children', requestTable: 'Request Table', roomNumber: 'Room Number', orderRoom: 'Order to Room', placeOrder: 'Place Room Service Order', categories: ['All Dishes', 'Starters', 'Main Courses', 'Desserts', 'Drinks'] },
    footer: { desc: 'An extraordinary sanctuary where timeless luxury meets unparalleled service. Every detail crafted for the discerning traveler.', explore: 'Explore', guestServices: 'Guest Services', contact: 'Contact', newsletter: 'Newsletter', join: 'Join', rights: '© 2025 Velora Palace. All rights reserved.', privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookie Policy', servicesList: ['Concierge Services', 'Airport Transfers', 'Spa & Wellness', 'Business Center', 'Private Events', 'Wedding Planning'] },
    booking: { eyebrow: 'Your Reservation', title: 'Secure Your Stay', step1: '1. Stay Details', step2: '2. Guest Info', step3: '3. Payment', stayDetails: 'Stay Details', roomSelection: 'Room Selection', noRoomSelected: 'No room pre-selected', guestInfo: 'Guest Information', fullName: 'Full Legal Name', dob: 'Date of Birth (Must be 18+)', phone: 'Phone Number', passport: 'National ID / Passport', specialReq: 'Special Requests (Optional)', paymentMethod: 'Payment Method', creditCard: 'Credit Card', paypal: 'PayPal', cash: 'Upon Arrival', prev: 'Previous Step', continue: 'Continue', finalizing: 'Finalizing...', confirmRes: 'Confirm Reservation', summary: 'Reservation Summary', selectRoomFirst: 'Select a room from the Rooms page.', duration: 'Duration', nights: 'Nights', promoCode: 'Promo Code', apply: 'Apply', subtotal: 'Subtotal', taxes: 'Taxes & Fees (Included)', discount: 'Discount', totalBalance: 'Total Balance', secureEnc: 'Secure 256-bit Encryption' },
    auth: { welcome: 'Welcome Back', signInTo: 'Sign in to access your exclusive benefits', email: 'Email Address', password: 'Password', signIn: 'Sign In', signUp: 'Create Account', noAccount: 'Don\'t have an account?', haveAccount: 'Already a member?', fullName: 'Full Name', createAccount: 'Create Account', loggingIn: 'Signing in...', signingUp: 'Creating account...' },
    dashboard: { admin: 'Admin Control Center', recep: 'Reception Desk', client: 'Client Portal', overview: 'Overview', rooms: 'Rooms', users: 'Users', bookings: 'Bookings', restaurant: 'Restaurant', venues: 'Venues', orders: 'Orders', promos: 'Promos', logout: 'Sign Out', totalRev: 'Total Revenue', activeRes: 'Active Reservations', totalUsers: 'Total Users', occRate: 'Occupancy Rate', recentRes: 'Recent Reservations', roomStatus: 'Room Status', noRes: 'No reservations found' },
    chatbot: { title: 'Palace Concierge', available: 'Available 24/7', ask: 'Ask your concierge...' },
    location: { eyebrow: 'Discover the Destination', title: 'Location & Protocol', desc: 'Set on the famed Promenade des Anglais along the French Riviera, Velora Palace occupies the most coveted address in Nice — a gateway to Monaco, Cannes, and the entire Côte d\'Azur.', contactInfo: 'Contact Information', address: 'Address', addressVal: '1 Promenade des Anglais\n06000 Nice, French Riviera', telephone: 'Telephone', telVal: '+33 4 93 12 34 56', email: 'Email', emailVal: 'reservations@velorapalace.com', transportProtocol: 'Transportation Protocol', transportDesc: 'Velora Palace offers complimentary luxury chauffeured transfers for all suite and villa guests from Nice Côte d\'Azur Airport (NCE), located just 15 minutes away. Helicopter transfers can be arranged upon request.', reqTransfer: 'Request Transfer', getDirections: 'Get Directions', distances: 'Distances to Attractions', beach: 'Private Beach Club', oldTown: 'Nice Old Town (Vieux Nice)', airport: 'Nice Côte d\'Azur Airport', monaco: 'Monte Carlo, Monaco', mins2: '2 minutes', mins10: '10 minutes', mins15: '15 minutes', mins35: '35 minutes' },
    clientDashboard: { myProfile: 'My Profile', myBookings: 'My Bookings', settings: 'Settings', signOut: 'Sign Out', member: 'Velora Member', bookings: 'Bookings', points: 'Points', since: 'Since', welcomeBack: 'Welcome back', dearGuest: 'Dear Guest.', manageDesc: 'Manage your personal information and keep your profile up to date for a seamless booking experience.', personalInfo: 'Personal Information', firstName: 'First Name', lastName: 'Last Name', gender: 'Gender', male: 'Male', female: 'Female', select: 'Select', dob: 'Date of Birth', phone: 'Phone Number', nationality: 'Nationality', selectNat: 'Select nationality', idPassport: 'National ID / Passport', billingAddress: 'Billing Address', saveChanges: 'Save Changes', saving: 'Saving...', resHistory: 'Reservation History', suites: 'Suites', dining: 'Dining', checkIn: 'Check-In', checkOut: 'Check-Out', guests: 'Guests', date: 'Date', time: 'Time', cancelRes: 'Cancel Reservation', noRoomRes: 'You have no room reservations yet. Your next extraordinary journey awaits.', exploreAcc: 'Explore Accommodations', noDiningRes: 'You have no dining reservations. Experience our Michelin-starred cuisine.', bookTable: 'Book a Table', accountSettings: 'Account Settings', changePass: 'Change Password', changePassDesc: 'Update your account security credentials', update: 'Update', emailNotif: 'Email Notifications', emailNotifDesc: 'Manage booking alerts and promotions', configure: 'Configure', deleteAccount: 'Delete Account', deleteAccountDesc: 'Permanently remove your account and all data', delete: 'Delete', memberExclusive: 'Member Exclusive', spaCredit: 'Complimentary Spa Credit', useCode: 'Use code' },
    adminDashboard: { title: 'Admin Control Center', subtitle: 'Velora Palace Management', roomMgmt: 'Room Management', addRoom: 'Add Room', roomNo: 'Room #', type: 'Type', price: 'Price', status: 'Status', actions: 'Actions', userDir: 'User Directory', makeRecep: 'Make Receptionist', revokeAccess: 'Revoke Access', culinaryMgmt: 'Culinary Management', addDish: 'Add Dish', allRes: 'All Reservations', reference: 'Reference', dates: 'Dates', promoMgmt: 'Promo Code Management', promoMgmtDesc: 'Create and manage promotional discount codes', addPromo: 'Add Promo Code', editPromo: 'Edit Promo Code', promoFormDesc: 'Configure discount code settings', promoCodeLabel: 'Promo Code', generate: 'Generate', discountPercent: 'Discount (%)', maxUses: 'Max Uses', quickPresets: 'Quick Presets', promoDesc: 'Description (Optional)', expiryDate: 'Expiry Date (Optional)', totalCodes: 'Total Codes', activeCodes: 'Active Codes', totalUses: 'Total Uses', avgDiscount: 'Avg Discount', noPromos: 'No promo codes yet. Create your first one!', usage: 'Usage', promoActive: 'Active', promoInactive: 'Inactive', promoExpired: 'Expired', promoExhausted: 'Exhausted' },
    recepDashboard: { title: 'Reception Desk', subtitle: 'Live Operations Management', hotel: 'Hotel', restaurant: 'Restaurant', orders: 'Orders', occupancy: 'Today\'s Occupancy', seats: 'Seats', roomRes: 'Room Reservations', searchGuest: 'Search Guest...', stayDates: 'Stay Dates', liveFloor: 'Live Floor Plan', tableRes: 'Table Reservations', noTableRes: 'No table reservations found', roomService: 'Room Service & Restaurant Orders', order: 'Order', totalAmount: 'Total Amount', note: 'Note', noOrders: 'No orders to handle.' }
  },
  fr: {
    nav: { home: 'Accueil', rooms: 'Chambres & Suites', dining: 'Restaurant', services: 'Services', location: 'Localisation', book: 'Réserver', account: 'Mon Compte' },
    common: { bookNow: 'Réserver', learnMore: 'En Savoir Plus', viewAll: 'Voir Tout', perNight: 'par nuit', guests: 'Invités', checkIn: 'Arrivée', checkOut: 'Départ', reserve: 'Réserver', cancel: 'Annuler', confirm: 'Confirmer', loading: 'Chargement...', close: 'Fermer', search: 'Rechercher', submit: 'Soumettre', price: 'Prix', status: 'Statut', actions: 'Actions', add: 'Ajouter', edit: 'Modifier', delete: 'Supprimer', save: 'Enregistrer' },
    hero: { eyebrow: "Où L'Élégance Rencontre L'Infini", title: 'VELORA PALACE', subtitle: "Un sanctuaire extraordinaire de luxe raffiné, où chaque moment est façonné avec un art et une dévotion incomparables.", cta: 'Réservez Votre Séjour', explore: 'Explorer' },
    home: { scroll: 'DÉFILER', checkAvailability: 'Vérifier la Disponibilité', awardsTitle: 'Récompenses', awardsSub: 'Excellence', roomsEyebrow: 'Hébergements', roomsTitle: 'Chambres & Suites', roomsDesc: 'Chaque hébergement est un chef-d\'œuvre de design, offrant sanctuaire, intimité et un confort inégalé.', from: 'À partir de', reserve: 'Réserver', viewAllRooms: 'Voir Tous Les Hébergements', storyYears: 'ANNÉES D\'EXCELLENCE', storyEyebrow: 'Notre Histoire', storyTitle: 'Un Héritage de Raffinement Intemporel', storyP1: 'Depuis 1989, le Velora Palace est l\'expression définitive du luxe européen sur la Côte d\'Azur.', storyP2: 'Chaque coin du Velora Palace raconte une histoire — d\'artisanat, de passion.', discoverHeritage: 'Découvrez Notre Héritage', expEyebrow: 'Expériences', expTitle: 'Équipements de Classe Mondiale', guestEyebrow: 'Histoires d\'Invités', guestTitle: 'Voix d\'Excellence', ctaEyebrow: 'Commencez Votre Voyage', ctaTitle: 'Réservez Votre Séjour Extraordinaire', ctaDesc: 'Laissez-nous concevoir une expérience au-delà de l\'imagination.', makeRes: 'Faire une Réservation' },
    rooms: { eyebrow: 'Chambres & Suites', title: 'Grandeur Inégalée', desc: 'Des sanctuaires intimes aux vastes domaines, découvrez une collection.', adults: 'Adultes', kids: 'Enfants', findSanctuary: 'Trouver un Sanctuaire', filters: 'Filtres', reset: 'Réinitialiser', roomCategory: 'Catégorie de Chambre', allCollections: 'Toutes les Collections', standard: 'Standard', deluxe: 'Deluxe', suite: 'Suite', villa: 'Villa Privée', maxPrice: 'Prix Max', desiredVista: 'Vue Souhaitée', showing: 'Affichage', results: 'résultats', sort: 'Trier', priceHighLow: 'Prix (Décroissant)', curating: 'Sélection des Sanctuaires...', startingFrom: 'À Partir De', noMatches: 'Aucun Sanctuaire', noMatchesDesc: 'Nos conservateurs n\'ont pas pu trouver de chambre.', clearFilters: 'Effacer Tous les Filtres', roomDesc: 'Une chambre magnifiquement aménagée offrant un luxe et un confort inégalés.' },
    services: { eyebrow: 'Expériences Inégalées', title: 'Services & Équipements', desc: 'Au-delà du seuil de votre suite se trouve un monde conçu uniquement pour votre satisfaction.', bookService: 'Se Renseigner & Réserver', included: 'Inclus Avec Chaque Séjour', complimentary: 'Équipements Gratuits', titles: ['Spa Sérénité', 'Piscine à Débordement', 'Atelier de Fitness', 'Flotte de Chauffeurs', 'Salon d\'Affaires', 'Club de Plage Privé'], descs: ['Laissez-vous tenter par d\'anciens rituels de bien-être et des thérapies sur mesure.', 'Nagez parmi les nuages dans notre piscine à débordement sur le toit.', 'Un gymnase à la pointe de la technologie équipé de machines Technogym Artis.', 'Parcourez la Côte d\'Azur dans notre flotte exclusive.', 'Installations ultramodernes pour nos clients exécutifs.', 'Accès exclusif à notre plage privée immaculée.'] },
    restaurant: { eyebrow: 'Excellence Culinaire', title: 'Une Expérience Étoilée Michelin', desc: 'Savourez l\'art de nos trois maîtres chefs primés.', menu: 'Menu', reserveTable: 'Réserver', ourMenu: 'Notre Menu', cart: 'Panier', total: 'Total', checkout: 'Paiement', emptyCart: 'Votre panier est vide', bookingDeposit: 'Un acompte de 50 DZD est requis.', nonRefundable: 'Non remboursable', securePayment: 'Paiement Sécurisé', cardNumber: 'Numéro de Carte', expiry: 'MM/AA', cvc: 'CVC', confirmBooking: 'Confirmer la Réservation', table: 'Table', time: 'Heure', date: 'Date', specialRequests: 'Demandes Spéciales', bookExperience: 'Réservez Votre Expérience', bookDesc: 'Réservez une table à L Aura Noire ou commandez dans votre suite.', tableRes: 'Réservation de Table', roomService: 'Service en Chambre', adults: 'Adultes', children: 'Enfants', requestTable: 'Demander une Table', roomNumber: 'Numéro de Chambre', orderRoom: 'Commander en Chambre', placeOrder: 'Passer la Commande', categories: ['Tous les Plats', 'Entrées', 'Plats Principaux', 'Desserts', 'Boissons'] },
    footer: { desc: 'Un sanctuaire extraordinaire où le luxe intemporel rencontre un service inégalé.', explore: 'Explorer', guestServices: 'Services aux Invités', contact: 'Contact', newsletter: 'Newsletter', join: 'Rejoindre', rights: '© 2025 Velora Palace. Tous droits réservés.', privacy: 'Politique de Confidentialité', terms: 'Conditions d\'Utilisation', cookies: 'Politique des Cookies', servicesList: ['Services de Conciergerie', 'Transferts Aéroport', 'Spa & Bien-être', 'Centre d\'Affaires', 'Événements Privés', 'Organisation de Mariages'] },
    booking: { eyebrow: 'Votre Réservation', title: 'Sécurisez Votre Séjour', step1: '1. Détails', step2: '2. Invité', step3: '3. Paiement', stayDetails: 'Détails du Séjour', roomSelection: 'Sélection de Chambre', noRoomSelected: 'Aucune chambre sélectionnée', guestInfo: 'Informations de l\'Invité', fullName: 'Nom Complet Légal', dob: 'Date de Naissance (18+)', phone: 'Numéro de Téléphone', passport: 'Carte d\'Identité / Passeport', specialReq: 'Demandes Spéciales (Optionnel)', paymentMethod: 'Méthode de Paiement', creditCard: 'Carte de Crédit', paypal: 'PayPal', cash: 'À l\'Arrivée', prev: 'Précédent', continue: 'Continuer', finalizing: 'Finalisation...', confirmRes: 'Confirmer la Réservation', summary: 'Résumé', selectRoomFirst: 'Sélectionnez une chambre.', duration: 'Durée', nights: 'Nuits', promoCode: 'Code Promo', apply: 'Appliquer', subtotal: 'Sous-total', taxes: 'Taxes Incluses', discount: 'Remise', totalBalance: 'Solde Total', secureEnc: 'Cryptage Sécurisé' },
    auth: { welcome: 'Bon Retour', signInTo: 'Connectez-vous', email: 'Email', password: 'Mot de Passe', signIn: 'Se Connecter', signUp: 'Créer un Compte', noAccount: 'Pas de compte ?', haveAccount: 'Déjà membre ?', fullName: 'Nom Complet', createAccount: 'Créer un Compte', loggingIn: 'Connexion...', signingUp: 'Création...' },
    dashboard: { admin: 'Admin', recep: 'Réception', client: 'Client', overview: 'Aperçu', rooms: 'Chambres', users: 'Utilisateurs', bookings: 'Réservations', restaurant: 'Restaurant', venues: 'Lieux', orders: 'Commandes', promos: 'Promos', logout: 'Déconnexion', totalRev: 'Revenus', activeRes: 'Réservations Actives', totalUsers: 'Utilisateurs', occRate: 'Taux d\'Occupation', recentRes: 'Réservations Récentes', roomStatus: 'Statut des Chambres', noRes: 'Aucune réservation' },
    chatbot: { title: 'Concierge du Palais', available: 'Disponible 24/7', ask: 'Demandez à votre concierge...' },
    location: { eyebrow: 'Découvrir la Destination', title: 'Localisation & Protocole', desc: 'Situé sur la célèbre Promenade des Anglais, le Velora Palace occupe l\'adresse la plus convoitée de Nice — une porte vers Monaco, Cannes et toute la Côte d\'Azur.', contactInfo: 'Informations de Contact', address: 'Adresse', addressVal: '1 Promenade des Anglais\n06000 Nice, France', telephone: 'Téléphone', telVal: '+33 4 93 12 34 56', email: 'Email', emailVal: 'reservations@velorapalace.com', transportProtocol: 'Protocole de Transport', transportDesc: 'Le Velora Palace propose des transferts avec chauffeur de luxe pour les clients des suites et villas depuis l\'aéroport (NCE). Transferts en hélicoptère sur demande.', reqTransfer: 'Demander un Transfert', getDirections: 'Itinéraire', distances: 'Distances des Attractions', beach: 'Club de Plage Privé', oldTown: 'Vieux Nice', airport: 'Aéroport Nice Côte d\'Azur', monaco: 'Monte-Carlo, Monaco', mins2: '2 minutes', mins10: '10 minutes', mins15: '15 minutes', mins35: '35 minutes' },
    clientDashboard: { myProfile: 'Mon Profil', myBookings: 'Mes Réservations', settings: 'Paramètres', signOut: 'Déconnexion', member: 'Membre Velora', bookings: 'Réservations', points: 'Points', since: 'Depuis', welcomeBack: 'Bon Retour', dearGuest: 'Cher Client.', manageDesc: 'Gérez vos informations personnelles et gardez votre profil à jour.', personalInfo: 'Informations Personnelles', firstName: 'Prénom', lastName: 'Nom', gender: 'Sexe', male: 'Homme', female: 'Femme', select: 'Sélectionner', dob: 'Date de Naissance', phone: 'Téléphone', nationality: 'Nationalité', selectNat: 'Choisir la nationalité', idPassport: 'ID National / Passeport', billingAddress: 'Adresse de Facturation', saveChanges: 'Enregistrer', saving: 'Enregistrement...', resHistory: 'Historique', suites: 'Suites', dining: 'Restaurant', checkIn: 'Arrivée', checkOut: 'Départ', guests: 'Invités', date: 'Date', time: 'Heure', cancelRes: 'Annuler la Réservation', noRoomRes: 'Aucune réservation de chambre. Votre prochain voyage vous attend.', exploreAcc: 'Explorer les Hébergements', noDiningRes: 'Aucune réservation de restaurant. Découvrez notre cuisine étoilée.', bookTable: 'Réserver une Table', accountSettings: 'Paramètres du Compte', changePass: 'Changer le Mot de Passe', changePassDesc: 'Mettre à jour vos identifiants', update: 'Mettre à jour', emailNotif: 'Notifications par Email', emailNotifDesc: 'Gérer les alertes', configure: 'Configurer', deleteAccount: 'Supprimer le Compte', deleteAccountDesc: 'Supprimer définitivement vos données', delete: 'Supprimer', memberExclusive: 'Exclusivité Membre', spaCredit: 'Crédit Spa Offert', useCode: 'Utilisez le code' },
    adminDashboard: { title: 'Centre de Contrôle', subtitle: 'Gestion du Velora Palace', roomMgmt: 'Gestion des Chambres', addRoom: 'Ajouter une Chambre', roomNo: 'Chambre #', type: 'Type', price: 'Prix', status: 'Statut', actions: 'Actions', userDir: 'Annuaire des Utilisateurs', makeRecep: 'Rendre Réceptionniste', revokeAccess: 'Révoquer l\'Accès', culinaryMgmt: 'Gestion Culinaire', addDish: 'Ajouter un Plat', allRes: 'Toutes les Réservations', reference: 'Référence', dates: 'Dates', promoMgmt: 'Gestion des Codes Promo', promoMgmtDesc: 'Créer et gérer les codes promotionnels', addPromo: 'Ajouter un Code Promo', editPromo: 'Modifier le Code Promo', promoFormDesc: 'Configurer les paramètres du code', promoCodeLabel: 'Code Promo', generate: 'Générer', discountPercent: 'Remise (%)', maxUses: 'Utilisations Max', quickPresets: 'Préréglages', promoDesc: 'Description (Optionnel)', expiryDate: 'Date d\'Expiration (Optionnel)', totalCodes: 'Total Codes', activeCodes: 'Codes Actifs', totalUses: 'Utilisations', avgDiscount: 'Remise Moy.', noPromos: 'Aucun code promo. Créez le premier !', usage: 'Utilisation', promoActive: 'Actif', promoInactive: 'Inactif', promoExpired: 'Expiré', promoExhausted: 'Épuisé' },
    recepDashboard: { title: 'Réception', subtitle: 'Gestion Opérationnelle en Direct', hotel: 'Hôtel', restaurant: 'Restaurant', orders: 'Commandes', occupancy: 'Occupation du Jour', seats: 'Sièges', roomRes: 'Réservations de Chambres', searchGuest: 'Rechercher un Client...', stayDates: 'Dates de Séjour', liveFloor: 'Plan en Direct', tableRes: 'Réservations de Tables', noTableRes: 'Aucune réservation de table', roomService: 'Commandes en Chambre & Restaurant', order: 'Commande', totalAmount: 'Montant Total', note: 'Note', noOrders: 'Aucune commande à traiter.' }
  },
  ar: {
    nav: { home: 'الرئيسية', rooms: 'الغرف والأجنحة', dining: 'المطعم', services: 'الخدمات', location: 'الموقع', book: 'احجز', account: 'حسابي' },
    common: { bookNow: 'احجز الآن', learnMore: 'اعرف المزيد', viewAll: 'عرض الكل', perNight: 'في الليلة', guests: 'الضيوف', checkIn: 'تاريخ الوصول', checkOut: 'تاريخ المغادرة', reserve: 'احجز', cancel: 'إلغاء', confirm: 'تأكيد', loading: 'جاري التحميل...', close: 'إغلاق', search: 'بحث', submit: 'إرسال', price: 'السعر', status: 'الحالة', actions: 'إجراءات', add: 'إضافة', edit: 'تعديل', delete: 'حذف', save: 'حفظ' },
    hero: { eyebrow: 'حيث تلتقي الأناقة باللانهاية', title: 'قصر فيلورا', subtitle: 'ملاذ استثنائي من الرفاهية الراقية، حيث يُصنع كل لحظة بفن وإتقان لا مثيل لهما.', cta: 'احجز إقامتك', explore: 'استكشف' },
    home: { scroll: 'تمرير', checkAvailability: 'التحقق من التوفر', awardsTitle: 'الجوائز', awardsSub: 'التميز', roomsEyebrow: 'أماكن الإقامة', roomsTitle: 'الغرف والأجنحة', roomsDesc: 'كل مكان إقامة هو تحفة فنية في التصميم، توفر الملاذ والخصوصية والراحة التي لا مثيل لها.', from: 'ابتداءً من', reserve: 'احجز', viewAllRooms: 'عرض جميع أماكن الإقامة', storyYears: 'سنوات من التميز', storyEyebrow: 'قصتنا', storyTitle: 'إرث من الرقي الخالد', storyP1: 'منذ عام 1989، يقف قصر فيلورا كتعبير نهائي عن الفخامة الأوروبية في الريفيرا الفرنسية.', storyP2: 'كل زاوية في قصر فيلورا تحكي قصة — من الحرفية، من العاطفة.', discoverHeritage: 'اكتشف تراثنا', expEyebrow: 'التجارب', expTitle: 'مرافق عالمية المستوى', guestEyebrow: 'قصص الضيوف', guestTitle: 'أصوات التميز', ctaEyebrow: 'ابدأ رحلتك', ctaTitle: 'احجز إقامتك الاستثنائية', ctaDesc: 'اسمح لنا بتصميم تجربة تفوق الخيال.', makeRes: 'قم بالحجز' },
    rooms: { eyebrow: 'الغرف والأجنحة', title: 'عظمة لا مثيل لها', desc: 'من الملاذات الحميمة إلى العقارات المترامية الأطراف، اكتشف مجموعة من أماكن الإقامة.', adults: 'بالغين', kids: 'أطفال', findSanctuary: 'ابحث عن الملاذ', filters: 'عوامل التصفية', reset: 'إعادة تعيين', roomCategory: 'فئة الغرفة', allCollections: 'جميع المجموعات', standard: 'قياسي', deluxe: 'ديلوكس', suite: 'جناح', villa: 'فيلا خاصة', maxPrice: 'الحد الأقصى للسعر', desiredVista: 'الإطلالة المطلوبة', showing: 'عرض', results: 'نتائج', sort: 'فرز', priceHighLow: 'السعر (من الأعلى للأقل)', curating: 'تنظيم الملاذات المتاحة...', startingFrom: 'ابتداءً من', noMatches: 'لا يوجد ملاذات مطابقة', noMatchesDesc: 'لم يتمكن القيمون لدينا من العثور على غرفة تطابق معاييرك الدقيقة.', clearFilters: 'مسح جميع عوامل التصفية', roomDesc: 'غرفة مفروشة بشكل جميل توفر رفاهية وراحة لا مثيل لها لضيوفنا الكرام.' },
    services: { eyebrow: 'تجارب لا مثيل لها', title: 'الخدمات والمرافق', desc: 'خلف عتبة جناحك يكمن عالم مصمم خصيصاً لإرضائك.', bookService: 'استفسار وحجز', included: 'متضمنة مع كل إقامة', complimentary: 'مرافق مجانية', titles: ['سبا الصفاء', 'حمام سباحة لا متناهي', 'استوديو اللياقة البدنية', 'أسطول السائقين', 'صالة الأعمال', 'نادي الشاطئ الخاص'], descs: ['انغمس في طقوس العافية القديمة والعلاجات المخصصة.', 'اسبح بين الغيوم في حمام السباحة اللامتناهي على السطح.', 'صالة ألعاب رياضية على أحدث طراز مجهزة بآلات تكنوجيم.', 'سافر في الريفيرا الفرنسية في أسطولنا الحصري من سيارات رولز رويس.', 'مرافق حديثة لضيوفنا التنفيذيين.', 'وصول حصري إلى شاطئنا الخاص البكر.'] },
    restaurant: { eyebrow: 'فن الطهو', title: 'تجربة ميشلان ستار', desc: 'تذوق فن الطهاة الثلاثة الحائزين على جوائز.', menu: 'القائمة', reserveTable: 'حجز طاولة', ourMenu: 'قائمتنا', cart: 'العربة', total: 'المجموع', checkout: 'الدفع', emptyCart: 'عربتك فارغة', bookingDeposit: 'مطلوب وديعة حجز بقيمة 50 دينار جزائري.', nonRefundable: 'غير قابلة للاسترداد', securePayment: 'دفع آمن', cardNumber: 'رقم البطاقة', expiry: 'شهر/سنة', cvc: 'رمز التحقق', confirmBooking: 'تأكيد الحجز', table: 'طاولة', time: 'الوقت', date: 'التاريخ', specialRequests: 'طلبات خاصة', bookExperience: 'احجز تجربتك', bookDesc: 'احجز طاولة في المطعم أو اطلب مباشرة إلى جناحك.', tableRes: 'حجز طاولة', roomService: 'خدمة الغرف', adults: 'بالغين', children: 'أطفال', requestTable: 'طلب طاولة', roomNumber: 'رقم الغرفة', orderRoom: 'طلب للغرفة', placeOrder: 'تقديم طلب خدمة الغرف', categories: ['جميع الأطباق', 'مقبلات', 'أطباق رئيسية', 'حلويات', 'مشروبات'] },
    footer: { desc: 'ملاذ استثنائي حيث تلتقي الفخامة الخالدة بخدمة لا مثيل لها.', explore: 'استكشف', guestServices: 'خدمات الضيوف', contact: 'اتصل بنا', newsletter: 'النشرة الإخبارية', join: 'انضم', rights: '© 2025 قصر فيلورا. جميع الحقوق محفوظة.', privacy: 'سياسة الخصوصية', terms: 'شروط الخدمة', cookies: 'سياسة ملفات تعريف الارتباط', servicesList: ['خدمات الكونسيرج', 'نقل المطار', 'سبا وعافية', 'مركز الأعمال', 'المناسبات الخاصة', 'تخطيط حفلات الزفاف'] },
    booking: { eyebrow: 'حجزك', title: 'تأمين إقامتك', step1: '1. تفاصيل الإقامة', step2: '2. معلومات الضيف', step3: '3. الدفع', stayDetails: 'تفاصيل الإقامة', roomSelection: 'اختيار الغرفة', noRoomSelected: 'لم يتم اختيار غرفة مسبقاً', guestInfo: 'معلومات الضيف', fullName: 'الاسم القانوني الكامل', dob: 'تاريخ الميلاد (يجب أن يكون 18+)', phone: 'رقم الهاتف', passport: 'الهوية الوطنية / جواز السفر', specialReq: 'طلبات خاصة (اختياري)', paymentMethod: 'طريقة الدفع', creditCard: 'بطاقة ائتمان', paypal: 'باي بال', cash: 'عند الوصول', prev: 'الخطوة السابقة', continue: 'متابعة', finalizing: 'جاري الانتهاء...', confirmRes: 'تأكيد الحجز', summary: 'ملخص الحجز', selectRoomFirst: 'حدد غرفة من صفحة الغرف.', duration: 'المدة', nights: 'ليالي', promoCode: 'رمز ترويجي', apply: 'تطبيق', subtotal: 'المجموع الفرعي', taxes: 'الضرائب والرسوم (مشمولة)', discount: 'الخصم', totalBalance: 'إجمالي الرصيد', secureEnc: 'تشفير آمن 256 بت' },
    auth: { welcome: 'مرحباً بعودتك', signInTo: 'قم بتسجيل الدخول للوصول إلى المزايا الحصرية الخاصة بك', email: 'عنوان البريد الإلكتروني', password: 'كلمة المرور', signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب', noAccount: 'ليس لديك حساب؟', haveAccount: 'هل أنت عضو بالفعل؟', fullName: 'الاسم الكامل', createAccount: 'إنشاء حساب', loggingIn: 'جاري تسجيل الدخول...', signingUp: 'جاري إنشاء الحساب...' },
    dashboard: { admin: 'مركز تحكم المشرف', recep: 'مكتب الاستقبال', client: 'بوابة العميل', overview: 'نظرة عامة', rooms: 'الغرف', users: 'المستخدمين', bookings: 'الحجوزات', restaurant: 'المطعم', venues: 'الأماكن', orders: 'الطلبات', promos: 'العروض', logout: 'تسجيل الخروج', totalRev: 'إجمالي الإيرادات', activeRes: 'الحجوزات النشطة', totalUsers: 'إجمالي المستخدمين', occRate: 'معدل الإشغال', recentRes: 'الحجوزات الأخيرة', roomStatus: 'حالة الغرفة', noRes: 'لا توجد حجوزات' },
    chatbot: { title: 'كونسيرج القصر', available: 'متاح 24/7', ask: 'اسأل الكونسيرج الخاص بك...' },
    location: { eyebrow: 'اكتشف الوجهة', title: 'الموقع والبروتوكول', desc: 'يقع قصر فيلورا على ممشى الإنجليز الشهير في الريفيرا الفرنسية، ويحتل العنوان الأكثر طلباً في نيس - بوابة إلى موناكو وكان.', contactInfo: 'معلومات الاتصال', address: 'العنوان', addressVal: '1 ممشى الإنجليز\n06000 نيس، الريفيرا الفرنسية', telephone: 'الهاتف', telVal: '+33 4 93 12 34 56', email: 'البريد الإلكتروني', emailVal: 'reservations@velorapalace.com', transportProtocol: 'بروتوكول النقل', transportDesc: 'يوفر قصر فيلورا خدمات نقل مجانية فاخرة بالسائق لجميع ضيوف الأجنحة والفلل من مطار نيس.', reqTransfer: 'طلب نقل', getDirections: 'احصل على الاتجاهات', distances: 'المسافات إلى المعالم', beach: 'نادي الشاطئ الخاص', oldTown: 'مدينة نيس القديمة', airport: 'مطار نيس كوت دازور', monaco: 'مونت كارلو، موناكو', mins2: 'دقيقتين', mins10: '10 دقائق', mins15: '15 دقيقة', mins35: '35 دقيقة' },
    clientDashboard: { myProfile: 'ملفي الشخصي', myBookings: 'حجوزاتي', settings: 'الإعدادات', signOut: 'تسجيل الخروج', member: 'عضو فيلورا', bookings: 'الحجوزات', points: 'النقاط', since: 'عضو منذ', welcomeBack: 'مرحباً بعودتك', dearGuest: 'ضيفنا العزيز.', manageDesc: 'قم بإدارة معلوماتك الشخصية للحصول على تجربة حجز سلسة.', personalInfo: 'المعلومات الشخصية', firstName: 'الاسم الأول', lastName: 'اسم العائلة', gender: 'الجنس', male: 'ذكر', female: 'أنثى', select: 'اختر', dob: 'تاريخ الميلاد', phone: 'رقم الهاتف', nationality: 'الجنسية', selectNat: 'اختر الجنسية', idPassport: 'الهوية الوطنية / جواز السفر', billingAddress: 'عنوان إرسال الفواتير', saveChanges: 'حفظ التغييرات', saving: 'جاري الحفظ...', resHistory: 'تاريخ الحجوزات', suites: 'الأجنحة', dining: 'المطعم', checkIn: 'تاريخ الوصول', checkOut: 'تاريخ المغادرة', guests: 'الضيوف', date: 'التاريخ', time: 'الوقت', cancelRes: 'إلغاء الحجز', noRoomRes: 'ليس لديك حجوزات غرف. رحلتك الاستثنائية القادمة في انتظارك.', exploreAcc: 'استكشاف أماكن الإقامة', noDiningRes: 'ليس لديك حجوزات طعام. جرب مطبخنا الحائز على نجمة ميشلان.', bookTable: 'حجز طاولة', accountSettings: 'إعدادات الحساب', changePass: 'تغيير كلمة المرور', changePassDesc: 'تحديث بيانات اعتماد الأمان الخاصة بك', update: 'تحديث', emailNotif: 'إشعارات البريد', emailNotifDesc: 'إدارة تنبيهات الحجوزات والعروض', configure: 'إعداد', deleteAccount: 'حذف الحساب', deleteAccountDesc: 'إزالة حسابك وجميع بياناتك بشكل دائم', delete: 'حذف', memberExclusive: 'حصري للأعضاء', spaCredit: 'رصيد سبا مجاني', useCode: 'استخدم الرمز' },
    adminDashboard: { title: 'مركز تحكم المشرف', subtitle: 'إدارة قصر فيلورا', roomMgmt: 'إدارة الغرف', addRoom: 'إضافة غرفة', roomNo: 'رقم الغرفة', type: 'النوع', price: 'السعر', status: 'الحالة', actions: 'الإجراءات', userDir: 'دليل المستخدمين', makeRecep: 'تعيين كموظف استقبال', revokeAccess: 'إلغاء الوصول', culinaryMgmt: 'إدارة المطعم', addDish: 'إضافة طبق', allRes: 'جميع الحجوزات', reference: 'المرجع', dates: 'التواريخ', promoMgmt: 'إدارة أكواد الخصم', promoMgmtDesc: 'إنشاء وإدارة أكواد الخصم الترويجية', addPromo: 'إضافة كود خصم', editPromo: 'تعديل كود الخصم', promoFormDesc: 'تكوين إعدادات كود الخصم', promoCodeLabel: 'كود الخصم', generate: 'توليد', discountPercent: 'نسبة الخصم (%)', maxUses: 'الحد الأقصى للاستخدام', quickPresets: 'إعدادات سريعة', promoDesc: 'الوصف (اختياري)', expiryDate: 'تاريخ الانتهاء (اختياري)', totalCodes: 'إجمالي الأكواد', activeCodes: 'أكواد نشطة', totalUses: 'إجمالي الاستخدامات', avgDiscount: 'متوسط الخصم', noPromos: 'لا توجد أكواد خصم. أنشئ أول كود!', usage: 'الاستخدام', promoActive: 'نشط', promoInactive: 'غير نشط', promoExpired: 'منتهي', promoExhausted: 'مستنفد' },
    recepDashboard: { title: 'مكتب الاستقبال', subtitle: 'إدارة العمليات المباشرة', hotel: 'الفندق', restaurant: 'المطعم', orders: 'الطلبات', occupancy: 'إشغال اليوم', seats: 'مقاعد', roomRes: 'حجوزات الغرف', searchGuest: 'البحث عن ضيف...', stayDates: 'تواريخ الإقامة', liveFloor: 'مخطط الطابق المباشر', tableRes: 'حجوزات الطاولات', noTableRes: 'لا توجد حجوزات طاولات', roomService: 'خدمة الغرف وطلبات المطعم', order: 'الطلب', totalAmount: 'المبلغ الإجمالي', note: 'ملاحظة', noOrders: 'لا توجد طلبات للتعامل معها.' }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('velora-lang') as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('velora-lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      t: translations[language],
      isRTL,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);
