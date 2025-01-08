export interface VisitingCard {
  id: number;
  visiting_card_url: string;
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
  designation: string;
  website: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse {
  data: {
    visiting_card: VisitingCard[];
  };
}