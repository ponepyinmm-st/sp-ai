// api/generate.js
export const config = {
  runtime: 'edge', // Vercel Edge Runtime ကိုသုံးထားလို့ မြန်ဆန်မယ်၊ Region ပိတ်တာတွေ ကျော်နိုင်မယ်
};

export default async function handler(req) {
  // POST request မဟုတ်ရင် လက်မခံပါ
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Vercel Environment Variable ထဲက API Key ကို ယူမယ်
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server API Key is missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Frontend က ပို့လိုက်တဲ့ Data ကို လက်ခံမယ်
    const requestBody = await req.json();

    // Google Gemini API ကို Server ဘက်ကနေ လှမ်းခေါ်မယ် (VPN မလိုတော့ဘူး)
    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await googleResponse.json();

    // Google က Error ပြန်လာရင် အဲဒီအတိုင်း ပြန်ပို့မယ်
    if (!googleResponse.ok) {
      return new Response(JSON.stringify(data), {
        status: googleResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // အဆင်ပြေရင် Data ပြန်ပို့မယ်
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
