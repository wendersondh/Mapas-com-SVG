import pg from 'pg';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

dotenv.config();

const { Client } = pg;
const client = new Client({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB
});

// Conexão com o banco de dados
conectar();
async function conectar() {
    await client.connect();
}

const app = express();
app.use(express.json());
app.use(cors());

// Endpoint para buscar todos os estados usando a API do IBGE
app.get('/api/estados', async (req, res) => {
    try {
        const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const estados = response.data.map((estado) => ({
            id: estado.id,
            nome: estado.nome,
            sigla: estado.sigla
        }));
        res.json(estados);
    } catch (error) {
        console.error('Erro ao buscar estados:', error);
        res.status(500).json({ error: 'Erro ao buscar estados.' });
    }
});

// Endpoint para buscar municípios com base no estado selecionado
app.get('/api/municipios/:estadoId', async (req, res) => {
    const { estadoId } = req.params;
    try {
        const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`);
        const municipios = response.data.map((municipio) => ({
            id: municipio.id,
            nome: municipio.nome
        }));
        res.json(municipios);
    } catch (error) {
        console.error('Erro ao buscar municípios:', error);
        res.status(500).json({ error: 'Erro ao buscar municípios.' });
    }
});

// Endpoint para retornar o SVG do estado e município destacados
app.get('/api/svg/:estado/:municipio', async (req, res) => {
    const { estado, municipio } = req.params;

    try {
        const pathEstado = await client.query(`SELECT ST_AsSVG(geom) FROM estado WHERE nome ILIKE $1`, [estado]);
        const pathMunicipio = await client.query(`SELECT ST_AsSVG(geom) FROM municipio WHERE nome ILIKE $1`, [municipio]);
        const viewBox = await client.query(`SELECT getViewBox($1)`, [estado]);

        res.json({
            pathEstado: pathEstado.rows[0]?.st_assvg || null,
            pathMunicipio: pathMunicipio.rows[0]?.st_assvg || null,
            viewBox: viewBox.rows[0]?.getviewbox || null
        });
    } catch (error) {
        console.error('Erro ao buscar SVG:', error);
        res.status(500).json({ error: 'Erro ao buscar SVG.' });
    }
});

// Inicializando o servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
