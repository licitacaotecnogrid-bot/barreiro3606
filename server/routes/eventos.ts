import { RequestHandler } from "express";
import prisma from "../prisma";

export const handleGetEventos: RequestHandler = async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({
      include: {
        odsAssociadas: true,
        anexos: true,
      },
      orderBy: {
        data: "desc",
      },
    });

    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
};

export const handleGetEventoById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const evento = await prisma.evento.findUnique({
      where: { id: parseInt(id) },
      include: {
        odsAssociadas: true,
        anexos: true,
      },
    });

    if (!evento) {
      res.status(404).json({ error: "Evento não encontrado" });
      return;
    }

    res.json(evento);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar evento" });
  }
};

export const handleCreateEvento: RequestHandler = async (req, res) => {
  try {
    const {
      titulo,
      data,
      responsavel,
      status,
      local,
      curso,
      tipoEvento,
      modalidade,
      descricao,
      imagem,
      documento,
      link,
      odsAssociadas,
      anexos,
    } = req.body;

    if (!titulo || !data || !responsavel || !status || !tipoEvento || !modalidade) {
      res.status(400).json({ error: "Campos obrigatórios faltando" });
      return;
    }

    const evento = await prisma.evento.create({
      data: {
        titulo,
        data: new Date(data),
        responsavel,
        status,
        local: local || null,
        curso,
        tipoEvento,
        modalidade,
        descricao,
        imagem,
        documento,
        link: link || null,
        odsAssociadas: {
          create: (odsAssociadas || []).map((ods: number) => ({
            odsNumero: ods,
          })),
        },
        anexos: {
          create: (anexos || []).map((nome: string) => ({
            nome,
          })),
        },
      },
      include: {
        odsAssociadas: true,
        anexos: true,
      },
    });

    res.json(evento);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar evento" });
  }
};

export const handleUpdateEvento: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      data,
      responsavel,
      status,
      local,
      curso,
      tipoEvento,
      modalidade,
      descricao,
      imagem,
      documento,
      link,
      odsAssociadas,
      anexos,
    } = req.body;

    // Deletar ODS existentes
    await prisma.odsEvento.deleteMany({
      where: { eventoId: parseInt(id) },
    });

    // Deletar anexos existentes
    await prisma.anexoEvento.deleteMany({
      where: { eventoId: parseInt(id) },
    });

    const evento = await prisma.evento.update({
      where: { id: parseInt(id) },
      data: {
        ...(titulo && { titulo }),
        ...(data && { data: new Date(data) }),
        ...(responsavel && { responsavel }),
        ...(status && { status }),
        ...(local !== undefined && { local: local || null }),
        ...(curso && { curso }),
        ...(tipoEvento && { tipoEvento }),
        ...(modalidade && { modalidade }),
        ...(descricao !== undefined && { descricao }),
        ...(imagem && { imagem }),
        ...(documento && { documento }),
        ...(link !== undefined && { link: link || null }),
        ...(odsAssociadas && {
          odsAssociadas: {
            create: odsAssociadas.map((ods: number) => ({
              odsNumero: ods,
            })),
          },
        }),
        ...(anexos && {
          anexos: {
            create: anexos.map((nome: string) => ({
              nome,
            })),
          },
        }),
      },
      include: {
        odsAssociadas: true,
        anexos: true,
      },
    });

    res.json(evento);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
};

export const handleDeleteEvento: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.evento.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Evento deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar evento" });
  }
};
