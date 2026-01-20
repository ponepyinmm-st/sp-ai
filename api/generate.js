export const config = {
  runtime: 'edge', // Vercel Edge Runtime ကိုသုံးထားလို့ မြန်ဆန်ပါမယ်
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
    // Vercel Environment Variable ထဲက ရှိသမျှ Key တွေကို စုစည်းလိုက်ပါမယ်
    // ညီလေးအနေနဲ့ Key ဘယ်နှခုထည့်ထည့် ဒီ code က အလိုလိုသိပါလိမ့်မယ်
    const allKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
      process.env.GEMINI_API_KEY_4,
      process.env.GEMINI_API_KEY_5
    ];

    // တကယ်တန်ဖိုးရှိတဲ့ (မလွတ်နေတဲ့) Key တွေကိုပဲ စစ်ထုတ်ပါမယ်
    const validKeys = allKeys.filter(key => key !== undefined && key !== null && key !== '');

    // Key လုံးဝမထည့်ထားရင် Error ပြပါမယ်
    if (validKeys.length === 0) {
      return new Response(JSON.stringify({ error: 'Server API Keys are missing. Please add GEMINI_API_KEY in Vercel settings.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ရှိတဲ့ Key တွေထဲက တစ်ခုကို ကျပန်း (Random) ရွေးလိုက်ပါမယ်
    // ဒါက Load Balancing လုပ်တဲ့ သဘောတရားပါပဲ
    const selectedKey = validKeys[Math.floor(Math.random() * validKeys.length)];

    // Frontend က ပို့လိုက်တဲ့ Data ကို လက်ခံမယ်
    const requestBody = await req.json();

    // Google Gemini API ကို ရွေးထားတဲ့ Key နဲ့ လှမ်းခေါ်မယ်
    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${selectedKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await googleResponse.json();

    // Google က Error ပြန်လာရင် (ဥပမာ - ဒီ Key လည်း Limit ပြည့်နေရင်)
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