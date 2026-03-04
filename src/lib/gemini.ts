import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface BusinessData {
    name: string;
    niche: string;
    location: string;
    website?: string;
    phone?: string;
}

export async function generateWebsiteDemo(data: BusinessData): Promise<string> {
    const prompt = `
    You are an elite web designer and copywriter. 
    Your goal is to generate a single-file premium HTML landing page for a business to convince them to buy a professional website redesign.

    BUSINESS INFO:
    - Name: ${data.name}
    - Niche: ${data.niche}
    - Location: ${data.location}
    ${data.website ? `- Current Website: ${data.website}` : ""}

    DESIGN REQUIREMENTS:
    1. STYLE: Sleek, high-end, dark-mode aesthetic (deep blues/blacks with vibrant accents like indigo or emerald).
    2. TYPOGRAPHY: Use "Inter" or "Outfit" font via Google Fonts.
    3. SECTIONS: 
       - Hero: catchy headline, value proposition, and a prominent CTA.
       - Services: 3-4 key services for a ${data.niche} business.
       - Social Proof: Mock testimonials or "Why Choose Us" cards.
       - Contact: A professional form and their phone number (${data.phone || "provided in demo"}).
    4. RESPONSIVENESS: Must be fully responsive using Tailwind CSS.
    5. TECH: Use Tailwind CSS via CDN. Do not use external images unless from Unsplash via a descriptive URL.

    OUTPUT:
    Return ONLY the raw HTML code. Do not include any markdown formatting wrappers (like \`\`\`html). 
    The landing page should feel 10x better than a generic template. Use gradients, subtle animations (Animate.css or basic CSS transitions), and high-conversion copy.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let html = response.text();

    // Clean up any potential markdown backticks if Gemini accidentally includes them
    html = html.replace(/^```html/, "").replace(/```$/, "").trim();

    return html;
}
