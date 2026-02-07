import crypto from 'crypto';

/**
 * Verify Plaid webhook signature
 * @param body - Raw request body as string
 * @param signature - Plaid-Verification header value
 * @param webhookSecret - Your Plaid webhook secret
 * @returns boolean - true if signature is valid
 */
export function verifyPlaidWebhook(
  body: string,
  signature: string,
  webhookSecret: string
): boolean {
  try {
    const hash = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');
    
    return hash === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}
