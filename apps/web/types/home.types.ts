export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
}

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
  testimonials: TestimonialItem[];
  faqs: FAQItem[];
  commissariats: CommissariatItem[];
}
