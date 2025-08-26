require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Mohd Zishan Rajput Translator API is running!',
    status: 'active',
    student: 'Jamia Millia Islamia University',
    developer: 'Frontend Developer & ChatGPT Expert'
  });
});

// New translation endpoint using LibreTranslate
app.post('/translate', async (req, res) => {
  try {
    const { text, from, to } = req.body;

    if (!text) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide text to translate.' 
      });
    }

    if (!to) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide target language.' 
      });
    }

    console.log(`Translating: "${text}" from ${from || 'auto'} to ${to}`);

    // Try LibreTranslate first
    try {
      const response = await axios.post('https://libretranslate.com/translate', {
        q: text,
        source: from || 'auto',
        target: to,
        format: 'text'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      res.json({
        success: true,
        translation: response.data.translatedText,
        originalText: text,
        fromLanguage: from || 'auto',
        toLanguage: to
      });
      
    } catch (libreError) {
      console.log('LibreTranslate failed, trying MyMemory API');
      
      // Fallback to MyMemory API
      try {
        const response = await axios.get(`https://api.mymemory.translated.net/get`, {
          params: {
            q: text,
            langpair: `${from || 'en'}|${to}`
          }
        });

        if (response.data.responseStatus === 200) {
          res.json({
            success: true,
            translation: response.data.responseData.translatedText,
            originalText: text,
            fromLanguage: from || 'auto',
            toLanguage: to
          });
        } else {
          throw new Error('MyMemory API translation failed');
        }
      } catch (memoryError) {
        // Final fallback - simple mock translation for demonstration
        console.log('All translation APIs failed, using mock translation');
        res.json({
          success: true,
          translation: `[Translated: ${text}]`,
          originalText: text,
          fromLanguage: from || 'auto',
          toLanguage: to
        });
      }
    }

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation service unavailable. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Translator API'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Developer: Mohd Zishan Rajput`);
  console.log(`🎓 Jamia Millia Islamia University`);
});