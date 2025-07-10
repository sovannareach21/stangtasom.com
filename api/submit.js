// File: /api/submit.js

export default async function handler(request, response) {
  // ពិនិត្យថា request method គឺ POST
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests allowed' });
  }

  // យក Token និង Chat ID ពី Environment Variables នៅលើ Vercel
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Server Error: Telegram environment variables are not set!");
    return response.status(500).json({ message: 'Server configuration error.' });
  }

  try {
    // request.body នឹងមានទិន្នន័យពី form (name_kh, name_en, gender, etc.)
    const formData = request.body;

    // បង្កើតข้อความសម្រាប់ផ្ញើទៅ Telegram
    let text = `🔔 **New Student Registration**\n\n`;
    text += `**Khmer Name:** ${formData.name_kh || 'N/A'}\n`;
    text += `**English Name:** ${formData.name_en || 'N/A'}\n`;
    text += `**Gender:** ${formData.gender || 'N/A'}\n`;
    text += `**Date of Birth:** ${formData.dob || 'N/A'}\n`;
    text += `**Place of Birth:** ${formData.birth_place || 'N/A'}\n`;
    text += `**Nationality:** ${formData.nationality || 'N/A'}\n`;
    text += `**Current Address:** ${formData.full_address || 'N/A'}\n`;
    text += `**Middle School:** ${formData.middle_school || 'N/A'}\n`;
    text += `**Academic Year:** ${formData.academic_year || 'N/A'}\n\n`;
    text += `(Text data only. File uploads are not handled yet.)`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // ផ្ញើ request ទៅកាន់ Telegram API
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    // បញ្ជូនការឆ្លើយតបទៅកាន់ Browser ថាជោគជ័យ
    return response.status(200).json({ message: 'Form submitted successfully! Please check your Telegram.' });

  } catch (error) {
    console.error('Server Error:', error);
    return response.status(500).json({ message: 'An internal server error occurred.' });
  }
}