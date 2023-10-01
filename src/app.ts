import express, { Request, Response } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { upload } from './uploads/multer';

const app = express();
const port = process.env.PORT || 8080;

// Rota POST /videos para fazer upload e cortar vídeos
app.post('/videos', upload.single('video'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    // Caminho do arquivo de entrada (vídeo original)
    const inputFilePath = req.file.path;

    const mimetype = req.file.mimetype;

    // Caminho do arquivo de saída (vídeo cortado)
    const outputFilePath = path.join(__dirname, 'uploads', `cut-${Date.now()}-${req.file.originalname}`);

    // Duração máxima desejada em segundos (15 segundos)
    const maxDuration = 15;

    // Executa o comando do ffmpeg para cortar o vídeo
    ffmpeg()
        .input(inputFilePath)
        .inputOptions([`-t ${maxDuration}`]) // Define a duração máxima
        .output(outputFilePath)
        .on('end', () => {
            // Lê o arquivo de vídeo cortado e envia como resposta
            fs.readFile(outputFilePath, (err, data) => {
                if (err) {
                    console.error('Erro ao ler o arquivo de vídeo cortado:', err);
                    res.status(500).json({ error: 'Erro ao ler o arquivo de vídeo cortado.' });
                } else {
                    res.setHeader('Content-Type', mimetype); // Define o tipo de conteúdo como vídeo
                    res.status(200).send(data);
                }

                // Exclui o arquivo de vídeo cortado após o envio
                fs.unlink(outputFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Erro ao excluir o arquivo de vídeo cortado:', unlinkErr);
                    }
                });

                // Exclui o arquivo de vídeo original após o envio
                fs.unlink(inputFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Erro ao excluir o arquivo de vídeo cortado:', unlinkErr);
                    }
                });
            });
        })
        .on('error', (err) => {
            console.error('Erro ao cortar o vídeo:', err);
            res.status(500).json({ error: 'Erro ao cortar o vídeo.' });
        })
        .run();
});

app.listen(port, () => {
    console.log(`Servidor está rodando na porta ${port}`);
});
