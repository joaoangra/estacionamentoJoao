const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Função para buscar veículos
const read = async (req, res) => {
    try {
        if (req.params.placa) {
            // Buscar um veículo específico pela placa
            const veiculo = await prisma.veiculo.findUnique({
                where: { placa: req.params.placa },
                include: { estadias: true } // Se necessário incluir a relação com estadias
            });
            
            if (!veiculo) {
                return res.status(404).json({ erro: 'Veículo não encontrado' });
            }

            return res.json(veiculo).end();
        } else {
            // Buscar todos os veículos
            const veiculos = await prisma.veiculo.findMany();
            return res.json(veiculos).end();
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao buscar veículos', detalhe: error.message });
    }
};

// Função para criar um novo veículo
const create = async (req, res) => {
    try {
        // Verificar se já existe um veículo com a mesma placa
        const existingVeiculo = await prisma.veiculo.findUnique({
            where: { placa: req.body.placa }
        });

        if (existingVeiculo) {
            return res.status(400).json({
                erro: 'Erro ao criar veículo',
                detalhe: 'A placa fornecida já está cadastrada.'
            });
        }

        // Criar o novo veículo
        const veiculo = await prisma.veiculo.create({
            data: req.body
        });

        return res.status(201).json(veiculo).end();
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            erro: 'Erro ao criar veículo',
            detalhe: error.message
        }).end();
    }
};

// Função para atualizar os dados de um veículo
const update = async (req, res) => {
    const { placa } = req.params;

    try {
        // Tentar atualizar o veículo
        const veiculo = await prisma.veiculo.update({
            where: { placa: placa },
            data: req.body
        });

        return res.status(202).json(veiculo);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                erro: 'Veículo não encontrado para atualização',
                detalhe: 'Verifique a placa fornecida.'
            });
        }

        console.error(error);
        return res.status(400).json({
            erro: 'Erro ao atualizar veículo',
            detalhe: error.message
        });
    }
};

// Função para excluir um veículo
const del = async (req, res) => {
    const { placa } = req.params;

    try {
        // Tentar deletar o veículo
        await prisma.veiculo.delete({
            where: { placa: placa }
        });

        return res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                erro: 'Veículo não encontrado para exclusão',
                detalhe: 'Verifique a placa fornecida.'
            });
        }

        console.error(error);
        return res.status(400).json({
            erro: 'Erro ao excluir veículo',
            detalhe: error.message
        });
    }
};

module.exports = {
    read,
    create,
    update,
    del
};
