import axios from 'axios';

const NOWPAYMENTS_URL = 'https://api.nowpayments.io/v1';
const FLUTTERWAVE_URL = 'https://api.flutterwave.com/v3';

export class PaymentGatewayService {
  // Module Financier - Intégration NowPayments (Crypto)
  static async createNowPaymentsDeposit(amount: number, currency: string, orderId: string) {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) throw new Error("Clé API NowPayments manquante");

    try {
      const response = await axios.post(`${NOWPAYMENTS_URL}/payment`, {
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: currency,
        order_id: orderId,
        order_description: "Dépôt Quoto Connect (Crypto)"
      }, {
        headers: { 'x-api-key': apiKey }
      });
      return response.data;
    } catch (error) {
      console.error("Erreur NowPayments Deposit:", error);
      throw error;
    }
  }

  // Module Financier - Intégration Flutterwave (Mobile Money / Cartes)
  static async initiateFlutterwavePayment(amount: number, email: string, tx_ref: string, phoneNumber: string) {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) throw new Error("Clé secrète Flutterwave manquante");

    try {
      const response = await axios.post(`${FLUTTERWAVE_URL}/payments`, {
        tx_ref: tx_ref,
        amount: amount,
        currency: "USD", // Ou CDF/XAF selon besoin
        redirect_url: `${process.env.APP_URL}/payment-callback`,
        customer: {
          email: email,
          phonenumber: phoneNumber,
          name: "Utilisateur Quoto Connect"
        },
        customizations: {
          title: "Quoto Connect Deposit",
          description: "Rechargement de compte Creator Reward",
          logo: "https://ais-dev-bygjbc5zwqphytyok3mn3g-80020386233.europe-west2.run.app/favicon.ico"
        }
      }, {
        headers: { Authorization: `Bearer ${secretKey}` }
      });
      return response.data;
    } catch (error) {
      console.error("Erreur Flutterwave Payment:", error);
      throw error;
    }
  }

  // Logique Retrait (Withdrawal)
  static async initiateWithdrawal(amount: number, bankDetails: any, method: 'flutterwave' | 'nowpayments') {
    // Dans une implémentation réelle, cela utiliserait soit les Transferts Flutterwave 
    // soit les Payouts NowPayments.
    console.log(`[Finance] Retrait initié via ${method} pour un montant de ${amount}`);
    // Notification au développeur (+243860553073) via simulation de log
    console.log(`[Notification SMS] Envoi à ${process.env.NOTIF_PHONE_NUMBER}: Retrait de ${amount} initié.`);
    return { status: 'success', message: 'Retrait en cours de traitement' };
  }
}
