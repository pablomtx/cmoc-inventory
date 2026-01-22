import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { nome: 'asc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json(category);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ error: 'Erro ao buscar categoria' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { nome, descricao, icone } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const category = await prisma.category.create({
      data: {
        nome,
        descricao,
        icone,
      },
    });

    res.status(201).json(category);
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Categoria já existe' });
    }
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, descricao, icone } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        nome,
        descricao,
        icone,
      },
    });

    res.json(category);
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar categoria:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao deletar categoria' });
  }
};
