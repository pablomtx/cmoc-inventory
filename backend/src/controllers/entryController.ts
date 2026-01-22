import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getEntries = async (req: Request, res: Response) => {
  try {
    const { itemId, startDate, endDate } = req.query;

    const where: any = {};

    if (itemId) {
      where.itemId = itemId as string;
    }

    if (startDate && endDate) {
      where.dataEntrada = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const entries = await prisma.entry.findMany({
      where,
      include: {
        item: {
          include: {
            categoria: true,
          },
        },
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: { dataEntrada: 'desc' },
    });

    res.json(entries);
  } catch (error) {
    console.error('Erro ao buscar entradas:', error);
    res.status(500).json({ error: 'Erro ao buscar entradas' });
  }
};

export const getEntryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const entry = await prisma.entry.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            categoria: true,
          },
        },
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entrada não encontrada' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Erro ao buscar entrada:', error);
    res.status(500).json({ error: 'Erro ao buscar entrada' });
  }
};

export const createEntry = async (req: AuthRequest, res: Response) => {
  try {
    const {
      itemId,
      quantidade,
      valorTotal,
      notaFiscal,
      fornecedor,
      dataEntrada,
      observacoes,
    } = req.body;

    if (!itemId || !quantidade) {
      return res.status(400).json({ error: 'Item e quantidade são obrigatórios' });
    }

    if (quantidade <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
    }

    const responsavelId = req.user!.id;

    // Criar entrada
    const entry = await prisma.entry.create({
      data: {
        itemId,
        quantidade: parseInt(quantidade),
        valorTotal: valorTotal ? parseFloat(valorTotal) : null,
        notaFiscal,
        fornecedor,
        responsavelId,
        dataEntrada: dataEntrada ? new Date(dataEntrada) : new Date(),
        observacoes,
      },
      include: {
        item: {
          include: {
            categoria: true,
          },
        },
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    // Atualizar quantidades do item
    await prisma.item.update({
      where: { id: itemId },
      data: {
        quantidadeTotal: { increment: parseInt(quantidade) },
        quantidadeDisponivel: { increment: parseInt(quantidade) },
      },
    });

    res.status(201).json(entry);
  } catch (error: any) {
    console.error('Erro ao criar entrada:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    res.status(500).json({ error: 'Erro ao criar entrada' });
  }
};

export const updateEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      valorTotal,
      notaFiscal,
      fornecedor,
      observacoes,
    } = req.body;

    const entry = await prisma.entry.update({
      where: { id },
      data: {
        valorTotal: valorTotal ? parseFloat(valorTotal) : undefined,
        notaFiscal,
        fornecedor,
        observacoes,
      },
      include: {
        item: {
          include: {
            categoria: true,
          },
        },
        responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    res.json(entry);
  } catch (error: any) {
    console.error('Erro ao atualizar entrada:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Entrada não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao atualizar entrada' });
  }
};

export const deleteEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar entrada antes de deletar para ajustar o estoque
    const entry = await prisma.entry.findUnique({
      where: { id },
    });

    if (!entry) {
      return res.status(404).json({ error: 'Entrada não encontrada' });
    }

    // Deletar entrada
    await prisma.entry.delete({
      where: { id },
    });

    // Ajustar quantidades do item
    await prisma.item.update({
      where: { id: entry.itemId },
      data: {
        quantidadeTotal: { decrement: entry.quantidade },
        quantidadeDisponivel: { decrement: entry.quantidade },
      },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar entrada:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Entrada não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao deletar entrada' });
  }
};
