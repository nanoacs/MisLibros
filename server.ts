import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI client if key exists
  const getAi = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", aiConfigured: !!process.env.GEMINI_API_KEY });
  });

  // Google Books API search endpoint
  app.get("/api/books/search", async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q || !q.trim()) {
        return res.json({ items: [] });
      }

      const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        q
      )}&maxResults=8&printType=books`;

      const response = await fetch(googleBooksUrl);
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.statusText}`);
      }

      const data = await response.json();
      const items = (data.items || []).map((item: any) => {
        const info = item.volumeInfo || {};
        return {
          id: item.id,
          title: info.title || "Sin título",
          authors: info.authors || ["Autor desconocido"],
          publisher: info.publisher,
          publishedDate: info.publishedDate,
          description: info.description,
          pageCount: info.pageCount,
          categories: info.categories || [],
          coverUrl:
            info.imageLinks?.thumbnail?.replace("http://", "https://") ||
            info.imageLinks?.smallThumbnail?.replace("http://", "https://") ||
            "",
        };
      });

      res.json({ items });
    } catch (error: any) {
      console.error("Error fetching Google Books:", error);
      res.status(500).json({ error: "Error al buscar libros en Google Books." });
    }
  });

  // AI Assistant endpoint for book reviews & recommendations
  app.post("/api/ai/review-assistant", async (req, res) => {
    try {
      const ai = getAi();
      if (!ai) {
        return res.status(400).json({
          error: "La API key de Gemini no está configurada.",
        });
      }

      const { action, title, author, genre, reviewText, userReviews } = req.body;

      let prompt = "";

      if (action === "draft") {
        prompt = `Actúa como un crítico literario experto y amable en español.
El usuario quiere escribir una reseña para el libro "${title}" de ${author || "Autor no especificado"} (Género: ${genre || "General"}).
Genera una estructura o borrador de reseña con:
1. Una introducción atractiva sobre la obra.
2. 3 puntos clave o temas principales a analizar.
3. Preguntas de reflexión para ayudar al usuario a escribir su opinión personal.
Responde en español con formato Markdown limpio y amigable.`;
      } else if (action === "polish") {
        prompt = `Actúa como un editor literario profesional.
A continuación tienes las notas o borrador de una reseña escrita por el usuario para el libro "${title}" de ${author || "Autor no especificado"}:

"${reviewText}"

Por favor, pule el texto mejorando la gramática, fluidez y estilo, manteniendo la opinión y voz original del usuario. Organiza en párrafos bien estructurados. Devuelve solo el texto de la reseña mejorada.`;
      } else if (action === "recommend") {
        prompt = `Actúa como un bibliotecario personal y apasionado de la lectura.
Basado en los siguientes libros y reseñas que le han gustado al usuario:
${JSON.stringify(userReviews || [])}

Recomienda 3 libros que le podrían encantar. Para cada libro incluye:
- Título y Autor
- Género
- Breve motivo de por qué le gustará según sus gustos previos
Responde en formato estructurado o Markdown amigable en español.`;
      } else {
        prompt = `Proporciona un pensamiento inspirador o análisis sobre el libro "${title}" de ${author}.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({
        error: error?.message || "Ocurrió un error al procesar la solicitud con AI.",
      });
    }
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server "Mis Libros" running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
