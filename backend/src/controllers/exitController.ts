import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getExits = async (req: Request, res: Response) => {
  try {
    const { itemId, status, startDate, endDate } = req.query;

    const where: any = {};

    if (itemId) {
      where.itemId = itemId as string;
    }

    if (status) {
      where.status = status as string;
    }

    if (startDate && endDate) {
      where.dataSaida = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const exits = await prisma.exit.findMany({
      where,
      include: {
        item: {
          include: {
            categoria: true,
          },
        },
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
    });

    res.json(exits);
  } catch (error) {
    console.error('Erro ao buscar saídas:', error);
    res.status(500).json({ error: 'Erro ao buscar saídas' });
  }
};

export const getExitById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const exit = await prisma.exit.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            categoria: true,
          },
        },
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
    });

    if (!exit) {
      return res.status(404).json({ error: 'Saída não encontrada' });
    }

    res.json(exit);
  } catch (error) {
    console.error('Erro ao buscar saída:', error);
    res.status(500).json({ error: 'Erro ao buscar saída' });
  }
};

export const createExit = async (req: AuthRequest, res: Response) => {
  try {
    const {
      itemId,
      quantidade,
      solicitanteId,
      destino,
      motivoSaida,
      previsaoDevolucao,
      dataSaida,
      observacoes,
    } = req.body;

    if (!itemId || !quantidade || !solicitanteId || !destino || !motivoSaida) {
      return res.status(400).json({
        error: 'Item, quantidade, solicitante, destino e motivo são obrigatórios',
      });
    }

    if (quantidade <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
    }

    // Verificar se há quantidade disponível
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    if (item.quantidadeDisponivel < quantidade) {
      return res.status(400).json({
        error: `Quantidade insuficiente. Disponível: ${item.quantidadeDisponivel}`,
      });
    }

    const responsavelLiberacaoId = req.user!.id;

    // Criar saída
    const exit = await prisma.exit.create({
      data: {
        itemId,
        quantidade: parseInt(quantidade),
        responsavelLiberacaoId,
        solicitanteId,
        destino,
        motivoSaida,
        previsaoDevolucao: previsaoDevolucao ? new Date(previsaoDevolucao) : null,
        dataSaida: dataSaida ? new Date(dataSaida) : new Date(),
        status: 'em_uso',
        observacoes,
      },
      include: {
        item: {
          include: {
            categoria: true,
          },
        },
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
      },
    });

    // Atualizar quantidades do item
    await prisma.item.update({
      where: { id: itemId },
      data: {
        quantidadeDisponivel: { decrement: parseInt(quantidade) },
        quantidadeEmUso: { increment: parseInt(quantidade) },
      },
    });

    res.status(201).json(exit);
  } catch (error: any) {
    console.error('Erro ao criar saída:', error);
    res.status(500).json({ error: 'Erro ao criar saída' });
  }
};

export const updateExit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      destino,
      motivoSaida,
      previsaoDevolucao,
      observacoes,
    } = req.body;

    const exit = await prisma.exit.update({
      where: { id },
      data: {
        destino,
        motivoSaida,
        previsaoDevolucao: previsaoDevolucao ? new Date(previsaoDevolucao) : undefined,
        observacoes,
      },
      include: {
        item: {
          include: {
            categoria: true,
          },
        },
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
    });

    res.json(exit);
  } catch (error: any) {
    console.error('Erro ao atualizar saída:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Saída não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao atualizar saída' });
  }
};

export const deleteExit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar saída antes de deletar para ajustar o estoque
    const exit = await prisma.exit.findUnique({
      where: { id },
      include: {
        return: true,
      },
    });

    if (!exit) {
      return res.status(404).json({ error: 'Saída não encontrada' });
    }

    if (exit.return) {
      return res.status(400).json({
        error: 'Não é possível excluir uma saída que já possui devolução',
      });
    }

    // Deletar saída
    await prisma.exit.delete({
      where: { id },
    });

    // Ajustar quantidades do item
    await prisma.item.update({
      where: { id: exit.itemId },
      data: {
        quantidadeDisponivel: { increment: exit.quantidade },
        quantidadeEmUso: { decrement: exit.quantidade },
      },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar saída:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Saída não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao deletar saída' });
  }
};
