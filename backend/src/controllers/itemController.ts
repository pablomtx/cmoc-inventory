import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const getItems = async (req: Request, res: Response) => {
  try {
    const { categoriaId, search, status } = req.query;

    const where: any = {};

    if (categoriaId) {
      where.categoriaId = categoriaId as string;
    }

    if (search) {
      where.OR = [
        { nome: { contains: search as string, mode: 'insensitive' } },
        { descricao: { contains: search as string, mode: 'insensitive' } },
        { codigoBarras: { contains: search as string, mode: 'insensitive' } },
        { numeroSerie: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status === 'disponivel') {
      where.quantidadeDisponivel = { gt: 0 };
    } else if (status === 'esgotado') {
      where.quantidadeDisponivel = 0;
    } else if (status === 'estoque_baixo') {
      where.AND = [
        { quantidadeDisponivel: { gt: 0 } },
        { quantidadeDisponivel: { lte: prisma.item.fields.estoqueMinimo } },
      ];
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        categoria: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(items);
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    res.status(500).json({ error: 'Erro ao buscar itens' });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        categoria: true,
        entries: {
          include: {
            responsavel: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
          orderBy: { dataEntrada: 'desc' },
        },
        exits: {
          include: {
            responsavelLiberacao: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
            solicitante: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
            return: true,
          },
          orderBy: { dataSaida: 'desc' },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json(item);
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({ error: 'Erro ao buscar item' });
  }
};

export const getItemByQRCode = async (req: Request, res: Response) => {
  try {
    const { qrCode } = req.params;

    const item = await prisma.item.findUnique({
      where: { qrCode },
      include: {
        categoria: true,
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json(item);
  } catch (error) {
    console.error('Erro ao buscar item por QR Code:', error);
    res.status(500).json({ error: 'Erro ao buscar item' });
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const {
      nome,
      descricao,
      categoriaId,
      codigoBarras,
      numeroSerie,
      localizacao,
      valorUnitario,
      fornecedor,
      observacoes,
      estoqueMinimo,
    } = req.body;

    if (!nome || !categoriaId) {
      return res.status(400).json({ error: 'Nome e categoria são obrigatórios' });
    }

    // Gerar QR Code único
    const qrCodeId = uuidv4();
    const qrCodeDataURL = await QRCode.toDataURL(qrCodeId);

    const item = await prisma.item.create({
      data: {
        nome,
        descricao,
        categoriaId,
        codigoBarras,
        numeroSerie,
        localizacao,
        valorUnitario: valorUnitario ? parseFloat(valorUnitario) : null,
        fornecedor,
        observacoes,
        estoqueMinimo: estoqueMinimo ? parseInt(estoqueMinimo) : 0,
        qrCode: qrCodeId,
        fotoUrl: req.file ? `/uploads/${req.file.filename}` : null,
      },
      include: {
        categoria: true,
      },
    });

    res.status(201).json({ ...item, qrCodeDataURL });
  } catch (error: any) {
    console.error('Erro ao criar item:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Código de barras ou número de série já existe' });
    }
    res.status(500).json({ error: 'Erro ao criar item' });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nome,
      descricao,
      categoriaId,
      codigoBarras,
      numeroSerie,
      localizacao,
      valorUnitario,
      fornecedor,
      observacoes,
      estoqueMinimo,
    } = req.body;

    const updateData: any = {
      nome,
      descricao,
      categoriaId,
      codigoBarras,
      numeroSerie,
      localizacao,
      fornecedor,
      observacoes,
    };

    if (valorUnitario !== undefined) {
      updateData.valorUnitario = parseFloat(valorUnitario);
    }

    if (estoqueMinimo !== undefined) {
      updateData.estoqueMinimo = parseInt(estoqueMinimo);
    }

    if (req.file) {
      updateData.fotoUrl = `/uploads/${req.file.filename}`;
    }

    const item = await prisma.item.update({
      where: { id },
      data: updateData,
      include: {
        categoria: true,
      },
    });

    res.json(item);
  } catch (error: any) {
    console.error('Erro ao atualizar item:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.item.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar item:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    res.status(500).json({ error: 'Erro ao deletar item' });
  }
};
