// File: /api/submit.js

import { formidable } from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

// ការកំណត់ពិសេសសម្រាប់ Vercel ដើម្បីអាចទទួលไฟล์បាន
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests allowed' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return response.status(500).json({ message: 'Server configuration error.' });
  }

  try {
    // ប្រើ formidable ដើម្បីបំបែកข้อมูล Text និង Files
    const form = formidable({});
    const [fields, files] = await form.parse(request);

    // ---- ផ្នែកទី១: បញ្ជូនទិន្នន័យជាអក្សរ (Text Data) ----
    let textMessage = `🔔 **មានសិស្សថ្មីចុះឈ្មោះ**\n\n`;
    textMessage += `**ឈ្មោះខ្មែរ:** ${fields.name_kh?.[0] || 'N/A'}\n`;
    textMessage += `**ឈ្មោះឡាតាំង:** ${fields.name_en?.[0] || 'N/A'}\n`;
    textMessage += `**ភេទ:** ${fields.gender?.[0] || 'N/A'}\n`;
    textMessage += `**ថ្ងៃខែឆ្នាំកំណើត:** ${fields.dob?.[0] || 'N/A'}\n`;
    textMessage += `**ទីកន្លែងកំណើត:** ${fields.full_address?.[0] || 'N/A'}\n`;
    textMessage += `**សញ្ជាតិ:** ${fields.nationality?.[0] || 'N/A'}\n`;
    textMessage += `**ទិលំនៅបច្ចុប្បន្ន:** ${fields.full_address?.[0] || 'N/A'}\n`;
    textMessage += `**មកពីអនុវិទ្យាល៍យ:** ${fields.middle_school?.[0] || 'N/A'}\n`;
    textMessage += `**ឆ្នាំសិក្សា:** ${fields.academic_year?.[0] || 'N/A'}\n`;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: textMessage,
        parse_mode: 'Markdown',
      }),
    });

    / ---- ផ្នែកទី២: បញ្ជូនไฟล์ម្តងមួយៗ (File Data) ----
    // យើងនឹង перебирать ไฟล์ทั้งหมดที่ถูกอัปโหลด
    for (const fileField in files) {
      const fileArray = files[fileField];
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        
        // បង្កើត FormData ថ្មីសម្រាប់ส่งไฟล์ទៅ Telegram
        const fileFormData = new FormData();
        fileFormData.append('chat_id', chatId);
        // 'document' អាចรับไฟล์ប្រភេទ PDF, JPG, PNG បាន
        fileFormData.append('document', fs.createReadStream(file.filepath), file.originalFilename);
        fileFormData.append('caption', `📄 File uploaded: ${file.originalFilename}`);

        // ส่งไฟล์ទៅកាន់ Telegram
        await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
          method: 'POST',
          body: fileFormData,
        });
      }
    }

    // បន្ទាប់ពីส่งเสร็จទាំងអស់ redirect អ្នកប្រើប្រាស់ទៅหน้า "Thank you" (ถ้ามี)
    // ឬส่ง JSON response กลับไป
    return response.status(200).json({ message: 'Form and files submitted successfully!' });

  } catch (error) {
    console.error('Server Error:', error);
    return response.status(500).json({ message: 'An internal server error occurred while processing files.' });
  }
}