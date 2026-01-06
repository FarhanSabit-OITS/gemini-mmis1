import { GoogleGenAI } from '@google/genai';

/**
 * BFF (Backend-for-Frontend) Service Layer
 * Centralizes AI orchestration and data transformation for the MMIS UI.
 */
class BFFService {
  private ai: GoogleGenAI | null = null;

  private getAI() {
    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    }
    return this.ai;
  }

  async getMarketInsights(role: string) {
    try {
      const response = await this.getAI().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a professional 2-sentence market trend analysis for a user with the role ${role} in a multi-vendor ecommerce system. Focus on BI and performance.`,
      });
      return response.text;
    } catch (e) {
      console.error('BFF Insight Failure:', e);
      return null;
    }
  }

  async getSpatialGrounding(entity: string, city: string) {
    try {
      const response = await this.getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide physical location details, directions, and trade landmarks for ${entity} in ${city}, Uganda.`,
        config: { tools: [{ googleMaps: {} }] },
      });
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return {
        text: response.text,
        links: chunks.filter((c: any) => c.maps).map((c: any) => ({
          title: c.maps.title || "View on Google Maps",
          uri: c.maps.uri
        }))
      };
    } catch (e) {
      console.error('BFF Grounding Failure:', e);
      return null;
    }
  }

  async triageIncident(title: string, desc: string, hasImage: boolean) {
    try {
      const response = await this.getAI().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this market support ticket. ${hasImage ? 'Visual evidence attached.' : ''} Ticket: ${title} - ${desc}`
      });
      return response.text;
    } catch (e) {
      return 'AI triage node offline.';
    }
  }
}

export const bff = new BFFService();