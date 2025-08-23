import React, { useState } from 'react';
import { Container, Typography, Box, TextField, FormControl, InputLabel, MenuItem, Select, CircularProgress, Button } from '@mui/material';
import axios from 'axios';
import './App.css';

function App() {
  const [content, setEmailContent] = useState('');
  const [tone, setEmailTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmitES = async () => {
    setLoading(true);
    setError('');
    try{
        const response = await axios.post("http://localhost:8080/api/email/generateES", {
          content,
          tone
        })
        setGeneratedReply(typeof response.data === 'string' ? response.data : JSON.stringify(response.data));

    }catch (err) {
      setError('Error al generar la respuesta. Por favor, inténtalo de nuevo.');
    }finally {
      setLoading(false);
    }
  };

  const handleSubmitEN = async () => {
    setLoading(true);
    setError('');
    try{
        const response = await axios.post("http://localhost:8080/api/email/generateEN", {
            content,
            tone
        })
        setGeneratedReply(typeof response.data === 'string' ? response.data : JSON.stringify(response.data));

    }catch (err) {
        setError('Error al generar la respuesta. Por favor, inténtalo de nuevo.');
    }finally {
        setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Generador de Respuestas de Email
      </Typography>

      <Box sx={{ mx: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          label="Contenido del Email Original"
          value={content}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tono (Optional)</InputLabel>
          <Select
            value={tone}
            label="Tono (Opcional)"
            onChange={(e) => setEmailTone(e.target.value)}
          >
            <MenuItem value="">Ninguno</MenuItem>
            <MenuItem value="professional">Profesional</MenuItem>
            <MenuItem value="casual">Coloquial</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleSubmitES}
          disabled={!content || loading}
          fullWidth
          sx={{ mb: 2 }}
          >
          {loading ? <CircularProgress size={24}/> : 'Generar Respuesta'}
        </Button>

          <Button
              variant="contained"
              onClick={handleSubmitEN}
              disabled={!content || loading}
              fullWidth
          >
              {loading ? <CircularProgress size={24}/> : 'Generate Response'}
          </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      {generatedReply && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Respuesta Generada
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={generatedReply || ''}
            InputProps={{ readOnly: true }}
          />

          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => navigator.clipboard.writeText(generatedReply)}
            >
            Copiar Respuesta
          </Button>
        </Box>
      )}

    </Container>
  );
}

export default App;
