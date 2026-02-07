export interface ClickoutProduct {
  id: string;
  affiliate_url: string | null;
  product_url: string | null;
  merchant_id: string | null;
}

export interface ClickEvent {
  product_id: string;
  merchant_id: string | null;
  referrer: string | null;
  user_agent: string | null;
  session_id: string;
}
