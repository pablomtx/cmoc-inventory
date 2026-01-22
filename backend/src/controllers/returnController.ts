import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getReturns = async (req: Request, res: Response) => {
  try {
    const { condicao, startDate, endDate } = req.query;

    const where: any = {};

    if (condicao) {
      where.condicao = condicao as string;
    }

    if (startDate && endDate) {
      where.dataDevolucao = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const returns = await prisma.return.findMany({
      where,
      include: {
        exit: {
          include: {
            item: {
              include: {
                categoria: true,
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
        },
        responsavelRecebimento: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: { dataDevolucao: 'desc' },
    });

    res.json(returns);
  } catch (error) {
    console.error('Erro ao buscar devoluções:', error);
    res.status(500).json({ error: 'Erro ao buscar devoluções' });
  }
};

export const getReturnById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const returnData = await prisma.return.findUnique({
      where: { id },
      include: {
        exit: {
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
        },
        responsavelRecebimento: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!returnData) {
      return res.status(404).json({ error: 'Devolução não encontrada' });
    }

    res.json(returnData);
  } catch (error) {
    console.error('Erro ao buscar devolução:', error);
    res.status(500).json({ error: 'Erro ao buscar devolução' });
  }
};

export const createReturn = async (req: AuthRequest, res: Response) => {
  try {
    const {
      exitId,
      condicao,
      motivoDefeito,
      necessitaReparo,
      dataDevolucao,
      observacoes,
    } = req.body;

    if (!exitId || !condicao) {
      return res.status(400).json({
        error: 'ID da saída e condição são obrigatórios',
      });
    }

    // Verificar se a saída existe
    const exit = await prisma.exit.findUnique({
      where: { id: exitId },
      include: {
        return: true,
      },
    });

    if (!exit) {
      return res.status(404).json({ error: 'Saída não encontrada' });
    }

    if (exit.return) {
      return res.status(400).json({
        error: 'Esta saída já possui uma devolução registrada',
      });
    }

    const responsavelRecebimentoId = req.user!.id;

    // Processar fotos de defeito
    let fotosDefeito = null;
    if (req.files && Array.isArray(req.files)) {
      fotosDefeito = JSON.stringify(
        req.files.map((file: any) => `/uploads/${file.filename}`)
      );
    }

    // Criar devolução
    const returnData = await prisma.return.create({
      data: {
        exitId,
        condicao,
        motivoDefeito,
        necessitaReparo: necessitaReparo === 'true' || necessitaReparo === true,
        fotosDefeito,
        responsavelRecebimentoId,
        dataDevolucao: dataDevolucao ? new Date(dataDevolucao) : new Date(),
        observacoes,
      },
      include: {
        exit: {
          include: {
            item: {
              include: {
                categoria: true,
              },
            },
          },
        },
        responsavelRecebimento: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    // Atualizar status da saída
    let novoStatus = 'devolvido';
    if (condicao === 'danificado') {
      novoStatus = 'baixado';
    }

    await prisma.exit.update({
      where: { id: exitId },
      data: {
        status: novoStatus,
      },
    });

    // Atualizar quantidades do item
    const item = exit.item || (await prisma.item.findUnique({ where: { id: exit.itemId } }));

    if (condicao === 'perfeito' || condicao === 'defeito') {
      // Item volta para disponível
      await prisma.item.update({
        where: { id: exit.itemId },
        data: {
          quantidadeDisponivel: { increment: exit.quantidade },
          quantidadeEmUso: { decrement: exit.quantidade },
        },
      });
    } else if (condicao === 'danificado') {
      // Item é baixado (não volta para disponível)
      await prisma.item.update({
        where: { id: exit.itemId },
        data: {
          quantidadeTotal: { decrement: exit.quantidade },
          quantidadeEmUso: { decrement: exit.quantidade },
        },
      });
    }

    res.status(201).json(returnData);
  } catch (error: any) {
    console.error('Erro ao criar devolução:', error);
    res.status(500).json({ error: 'Erro ao criar devolução' });
  }
};

export const updateReturn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      condicao,
      motivoDefeito,
      necessitaReparo,
      observacoes,
    } = req.body;

    const returnData = await prisma.return.update({
      where: { id },
      data: {
        condicao,
        motivoDefeito,
        necessitaReparo: necessitaReparo === 'true' || necessitaReparo === true,
        observacoes,
      },
      include: {
        exit: {
          include: {
            item: {
              include: {
                categoria: true,
              },
            },
          },
        },
        responsavelRecebimento: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    res.json(returnData);
  } catch (error: any) {
    console.error('Erro ao atualizar devolução:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Devolução não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao atualizar devolução' });
  }
};

export const deleteReturn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar devolução antes de deletar
    const returnData = await prisma.return.findUnique({
      where: { id },
      include: {
        exit: true,
      },
    });

    if (!returnData) {
      return res.status(404).json({ error: 'Devolução não encontrada' });
    }

    // Deletar devolução
    await prisma.return.delete({
      where: { id },
    });

    // Reverter status da saída
    await prisma.exit.update({
      where: { id: returnData.exitId },
      data: {
        status: 'em_uso',
      },
    });

    // Reverter quantidades do item
    if (returnData.condicao === 'perfeito' || returnData.condicao === 'defeito') {
      await prisma.item.update({
        where: { id: returnData.exit.itemId },
        data: {
          quantidadeDisponivel: { decrement: returnData.exit.quantidade },
          quantidadeEmUso: { increment: returnData.exit.quantidade },
        },
      });
    } else if (returnData.condicao === 'danificado') {
      await prisma.item.update({
        where: { id: returnData.exit.itemId },
        data: {
          quantidadeTotal: { increment: returnData.exit.quantidade },
          quantidadeEmUso: { increment: returnData.exit.quantidade },
        },
      });
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar devolução:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Devolução não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao deletar devolução' });
  }
};
