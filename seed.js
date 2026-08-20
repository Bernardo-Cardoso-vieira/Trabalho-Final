// ConnectContábil — Seed
// Popula o banco em ordem que respeita as chaves estrangeiras:
// Cliente / Contador / Servico (independentes) -> Agendamento -> Depoimento
// Faq é independente e pode ser criado a qualquer momento.

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // 1. Limpa tabelas na ordem inversa das dependências (filhos antes dos pais)
  await prisma.depoimento.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.contador.deleteMany();
  await prisma.cliente.deleteMany();

  // 2. Entidades "pai" (sem dependências)

  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        nome: "Ana Beatriz Souza",
        email: "ana.souza@padariadobairro.com.br",
        telefone: "(31) 99123-4567",
        empresa: "Padaria do Bairro Ltda",
      },
    }),
    prisma.cliente.create({
      data: {
        nome: "Carlos Eduardo Lima",
        email: "carlos.lima@gmail.com",
        telefone: null,
        empresa: null, // MEI ainda sem razão social formal
      },
    }),
    prisma.cliente.create({
      data: {
        nome: "Fernanda Costa",
        email: "fernanda.costa@studiofc.com.br",
        telefone: "(31) 98877-1122",
        empresa: "Studio FC Design",
      },
    }),
  ]);

  const contadores = await Promise.all([
    prisma.contador.create({
      data: {
        nome: "Marcos Vinícius Alves",
        especialidade: "Fiscal",
        email: "marcos.alves@connectcontabil.com.br",
      },
    }),
    prisma.contador.create({
      data: {
        nome: "Juliana Ribeiro",
        especialidade: "Trabalhista",
        email: "juliana.ribeiro@connectcontabil.com.br",
      },
    }),
  ]);

  const servicos = await Promise.all([
    prisma.servico.create({
      data: {
        nome: "Abertura de Empresa (MEI/ME)",
        descricao: "Consultoria completa para abertura formal do CNPJ.",
        duracaoMinutos: 60,
        precoBase: 250.0,
      },
    }),
    prisma.servico.create({
      data: {
        nome: "Consultoria Tributária",
        descricao: "Análise do regime tributário mais vantajoso para o negócio.",
        duracaoMinutos: 45,
        precoBase: null, // serviço sob consulta, depende do porte da empresa
      },
    }),
    prisma.servico.create({
      data: {
        nome: "Folha de Pagamento",
        descricao: "Gestão mensal de folha, encargos e obrigações trabalhistas.",
        duracaoMinutos: 30,
        precoBase: 180.0,
      },
    }),
  ]);

  // 3. Entidades "filho" (dependem de Cliente/Contador/Servico)

  const agendamentos = await Promise.all([
    prisma.agendamento.create({
      data: {
        data: new Date("2026-09-02T14:00:00Z"),
        status: "confirmado",
        observacoes: "Cliente prefere atendimento por videochamada.",
        clienteId: clientes[0].id,
        contadorId: contadores[0].id,
        servicoId: servicos[0].id,
      },
    }),
    prisma.agendamento.create({
      data: {
        data: new Date("2026-09-03T10:30:00Z"),
        status: "pendente",
        observacoes: null,
        clienteId: clientes[1].id,
        contadorId: contadores[1].id,
        servicoId: servicos[2].id,
      },
    }),
    prisma.agendamento.create({
      data: {
        data: new Date("2026-09-04T16:00:00Z"),
        status: "concluido",
        observacoes: "Levar contrato social na consulta.",
        clienteId: clientes[2].id,
        contadorId: contadores[0].id,
        servicoId: servicos[1].id,
      },
    }),
  ]);

  await Promise.all([
    prisma.depoimento.create({
      data: {
        texto:
          "Atendimento rápido e muito claro, consegui abrir minha empresa em poucos dias.",
        nota: 5,
        aprovado: true,
        clienteId: clientes[0].id,
      },
    }),
    prisma.depoimento.create({
      data: {
        texto: "Equipe atenciosa e agendamento pelo WhatsApp facilitou muito.",
        nota: 4,
        aprovado: true,
        clienteId: clientes[2].id,
      },
    }),
  ]);

  // 4. Conteúdo institucional independente

  await Promise.all([
    prisma.faq.create({
      data: {
        pergunta: "Como faço para agendar uma consulta?",
        resposta:
          'Basta clicar no botão "Agende sua consulta" e você será redirecionado para o nosso WhatsApp.',
        ordem: 1,
      },
    }),
    prisma.faq.create({
      data: {
        pergunta: "O atendimento é presencial ou online?",
        resposta:
          "Ambos! Você escolhe o formato mais conveniente no momento do agendamento.",
        ordem: 2,
      },
    }),
    prisma.faq.create({
      data: {
        pergunta: "Quais documentos preciso levar na primeira consulta?",
        resposta:
          "Depende do serviço contratado; nossa equipe envia a lista completa após a confirmação do agendamento.",
        ordem: 3,
      },
    }),
  ]);

  console.log("Seed concluído com sucesso!");
  console.log(
    `Criados: ${clientes.length} clientes, ${contadores.length} contadores, ${servicos.length} serviços, ${agendamentos.length} agendamentos.`
  );
}

main()
  .catch((e) => {
    console.error("Erro ao rodar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
