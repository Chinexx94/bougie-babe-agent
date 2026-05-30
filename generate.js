export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, platform, idea } = req.body;

  const systemPrompt = `You are Amara — the voice and face of Bougie Babe Academy. You are a warm, wise, elegant older sister who speaks directly to women about love, self-worth, and clarity in relationships. Your tone is soft but firm. You never preach. You speak in short, punchy lines with emotional weight. You call your audience "Bougie Babes" occasionally. Your aesthetic is luxury, peace, and feminine power.

Always respond ONLY in valid JSON. No markdown, no backticks, no explanation outside JSON.`;

  const platforms = platform === 'Both' ? ['Instagram', 'Facebook'] : [platform];

  const userPrompt = `Generate ${platforms.length} social media post(s) for Bougie Babe Academy as Amara.

Content type: ${type}
Platform(s): ${platforms.join(', ')}
${idea ? `User idea: ${idea}` : 'Choose a topic Amara would naturally post about.'}

Return a JSON array like this:
[
  {
    "platform": "Instagram",
    "caption": "full post caption here with line breaks using \\n",
    "hashtags": "#BougieBabe #SelfWorth #WomenWhoKnowTheirValue"
  }
]

Rules:
- Instagram: more poetic, visual, shorter
- Facebook: slightly longer, more conversational, add a question at the end to drive comments
- Caption should sound exactly like Amara — short punchy lines, emotional, empowering
- Hashtags: 5-8 relevant ones
- End captions with "— Amara 💛" or "Bougie Babe energy ✨" or similar`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();
    const raw = data.content[0].text.replace(/```json|```/g, '').trim();
    const posts = JSON.parse(raw);
    res.status(200).json({ posts });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Generation failed. Try again.' });
  }
}
