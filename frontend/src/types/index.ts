export interface Room {
  id: string;
  name: string;
  type: 'standard' | 'deluxe' | 'suite' | 'villa';
  description: string;
  price_per_night: number;
  capacity: number;
  size_sqm: number;
  floor: number;
  view_type: string;
  amenities: string[];
  images: string[];
  is_available: boolean;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  created_at: string;
}

export interface Chambre {
  id: string;
  numero_chambre: string;
  type_chambre: string;
  prix_base_nuit: number;
  capacite_adultes: number;
  capacite_enfants: number;
  etage: number;
  vue: string;
  superficie_m2: number;
  equipements: any;
  statut: string;
  image_urls: string[];
}

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  promo_code: string;
  discount_amount: number;
  payment_method: string;
  special_requests: string;
  created_at: string;
  rooms?: Room;
}

export interface RestaurantReservation {
  id: string;
  user_id: string;
  date: string;
  time: string;
  guests: number;
  special_requests: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface Utilisateur {
  id: string;
  nom_utilisateur: string;
  prenom: string;
  email: string;
  telephone: string | null;
  avatar_url: string | null;
  date_creation: string;
  dernier_login?: string;
  role: 'client' | 'personnel' | 'admin';
}

export interface Client {
  id: string;
  utilisateur_id: string;
  adresse_facturation: string | null;
  adresse_livraison: string | null;
  date_naissance: string | null;
  nationalite: string | null;
  document_identite: string | null;
  points_fidelite: number;
  code_pays: string | null;
  sexe: string | null;
}

export interface ReservationChambre {
  id: string;
  reference_reservation: string;
  date_arrivee: string;
  date_depart: string;
  nombre_adultes: number;
  nombre_enfants: number;
  prix_nuit: number;
  statut: 'en_attente' | 'confirmee' | 'annulee' | 'terminee';
  methode_paiement: string;
  date_reservation: string;
  heure_arrivee_prevue: string;
  client_id: string;
  chambre_id: string;
  personnel_id: string | null;
  telephone_client: string | null;
  code_pays_client: string | null;
  nom_complet_client: string | null;
  date_naissance_client: string | null;
  document_identite_client: string | null;
  chambres?: Chambre;
  utilisateurs?: Utilisateur;
}

export interface RoomServiceOrder {
  id: string;
  user_id: string;
  room_id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total_price: number;
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled';
  special_requests: string;
  created_at: string;
  rooms?: Room;
  utilisateurs?: Utilisateur;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  description: string;
  is_active: boolean;
  expires_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage';
  image_url: string;
  is_available: boolean;
}

export type Language = 'en' | 'fr' | 'ar';

export interface BookingForm {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
  promoCode: string;
}
