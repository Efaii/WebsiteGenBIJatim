export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface CommissariatItem {
  id: string;
  name: string;
  logo: string;
}

export interface HomeDataResponse {
  faqs: FAQItem[];
  commissariats: CommissariatItem[];
}
