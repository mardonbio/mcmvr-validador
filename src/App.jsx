import { useState, useRef, useEffect } from "react";
import {
  Users, FileText, FilePlus, CheckCircle, XCircle, AlertTriangle,
  Clock, Search, Upload, ChevronRight, Menu, AlertCircle, Shield,
  Bell, Settings, Plus, FileCheck, ArrowLeft, Send, RefreshCw,
  ChevronDown, ChevronUp, User, X, Loader, Sparkles, Info,
  Download, GitCompare, CheckSquare, AlertOctagon, Zap,
  Camera, Home, MapPin, ScanLine, RotateCcw, Sun, Moon,
  Eye, EyeOff, LogOut, Lock
} from "lucide-react";

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'IBM Plex Sans',system-ui,sans-serif;background:#F0F4F9;-webkit-tap-highlight-color:transparent;}
  ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px;}
  .fade-in{animation:fadeIn .2s ease;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}
  .row-hover:hover{background:#F8FAFC;cursor:pointer;}
  .doc-row:hover{background:#F8FAFC;}
  .spinning{animation:spin .9s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .pulse{animation:pulse 1.5s ease-in-out infinite;}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.45;}}
  .modal-fade{animation:fadeIn .15s ease;}
  .scanner-slide{animation:scannerSlide .25s ease;}
  @keyframes scannerSlide{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
  .card-hover{transition:box-shadow .15s,transform .15s;}
  .card-hover:hover{box-shadow:0 4px 16px rgba(0,63,135,0.12);transform:translateY(-1px);cursor:pointer;}
  .capture-btn{transition:transform .1s,box-shadow .1s;}
  .capture-btn:active{transform:scale(0.92)!important;box-shadow:0 0 0 6px rgba(255,255,255,0.3)!important;}
  .scan-line{animation:scanAnim 2s ease-in-out infinite;}
  @keyframes scanAnim{0%{top:10%;}50%{top:85%;}100%{top:10%;}}
  @supports(padding-bottom:env(safe-area-inset-bottom)){
    .safe-bottom{padding-bottom:calc(8px + env(safe-area-inset-bottom))!important;}
  }
`;

const CAIXA_BLUE = "#003F87";
const CAIXA_ORANGE = "#F5821F";

// ─── MOBILE HOOK ──────────────────────────────────────────────────────────────
function useIsMobile(){
  const [m,setM]=useState(typeof window!=="undefined"&&window.innerWidth<768);
  useEffect(()=>{const h=()=>setM(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return m;
}

// ─── CONFIGS ──────────────────────────────────────────────────────────────────
const STATUS={
  ok:         {label:"Conforme",    bg:"#DCFCE7",fg:"#16A34A",dot:"#22C55E"},
  divergencia:{label:"Divergência", bg:"#FEE2E2",fg:"#DC2626",dot:"#EF4444"},
  rasura:     {label:"Rasura",      bg:"#FFEDD5",fg:"#EA580C",dot:"#F97316"},
  vencido:    {label:"Vencido",     bg:"#FEF3C7",fg:"#D97706",dot:"#F59E0B"},
  ilegivel:   {label:"Ilegível",    bg:"#EDE9FE",fg:"#7C3AED",dot:"#8B5CF6"},
  incompleto: {label:"Incompleto",  bg:"#FFF7ED",fg:"#C2410C",dot:"#FB923C"},
  pendente:   {label:"Pendente",    bg:"#F1F5F9",fg:"#64748B",dot:"#94A3B8"},
  ausente:    {label:"N/A",         bg:"#F8FAFC",fg:"#CBD5E1",dot:"#E2E8F0"},
  alerta:     {label:"Alerta",      bg:"#FEF9C3",fg:"#CA8A04",dot:"#EAB308"},
  analisando: {label:"Analisando…", bg:"#EFF6FF",fg:"#3B82F6",dot:"#60A5FA"},
};
const GLOBAL_STATUS={
  aprovado:   {label:"Aprovado",         bg:"#16A34A",light:"#DCFCE7",fg:"#15803D"},
  divergencia:{label:"Com Divergências", bg:"#DC2626",light:"#FEE2E2",fg:"#B91C1C"},
  pendente:   {label:"Pendente",         bg:"#D97706",light:"#FEF3C7",fg:"#B45309"},
  incompleto: {label:"Incompleto",       bg:"#64748B",light:"#F1F5F9",fg:"#475569"},
};
const SEV={
  bloqueante:{label:"Bloqueante",bg:"#FEE2E2",fg:"#DC2626",border:"#FCA5A5",icon:AlertOctagon},
  atencao:   {label:"Atenção",   bg:"#FEF3C7",fg:"#D97706",border:"#FCD34D",icon:AlertTriangle},
  ok:        {label:"Conforme",  bg:"#DCFCE7",fg:"#16A34A",border:"#86EFAC",icon:CheckCircle},
};

// ✱ = formulário MO oficial do programa — número obrigatório no documento
const CATEGORIAS=[
  // ── PESSOA FÍSICA — Portaria do Programa (Documentação dos Beneficiários) ──────
  {id:"pessoa_fisica", label:"Beneficiário — Pessoa Física", emoji:"🪪", docs:[
    {id:"mo29741",            label:"Declaração Dados Cadastrais — MO29741 ✱",                         obrigatorio:true },
    {id:"rg",                 label:"Doc. Identificação: RG / CTPS automatizado / CNH com foto",        obrigatorio:true },
    {id:"cpf",                label:"CPF (dispensado se constar no doc. de identificação)",             obrigatorio:true },
    {id:"certidao_civil",     label:"Comprovante de Estado Civil (Certidão Nasc./Casamento)",           obrigatorio:true },
    {id:"certidao_obito",     label:"Certidão de Óbito do cônjuge (se viúvo/a)",                       obrigatorio:false},
    {id:"uniao_estavel",      label:"Declaração de União Estável — MO29741 (se for o caso)",           obrigatorio:false},
    {id:"procuracao",         label:"Procuração por Instrumento Público (se for o caso)",               obrigatorio:false},
    {id:"comprovante_residencia",label:"Comprovante de Residência em Área Rural (≤ 3 meses)",          obrigatorio:true },
  ]},
  // ── RENDA E ENQUADRAMENTO — Portaria do Programa ────────────────────────────────
  {id:"renda_enquadramento", label:"Comprovação de Renda e Enquadramento", emoji:"💰", docs:[
    {id:"cadunico",           label:"CadÚnico / NIS (atualizado ≤ 24 meses)",                          obrigatorio:true },
    {id:"dap_caf",            label:"CAF ou DAP — Aptidão ao PRONAF (dentro da validade) ✱",           obrigatorio:true },
    {id:"declaracao_familia", label:"Declaração de Composição Familiar",                               obrigatorio:true },
    {id:"ctps_contracheque",  label:"Carteira Trabalho + 3 contracheques (trabalhador rural)",         obrigatorio:false},
    {id:"decl_empregador",    label:"Decl. empregador c/ firma reconhecida em cartório (papel timbrado)",obrigatorio:false},
    {id:"proventos_inss",     label:"Comprovante Proventos INSS — aposentadoria permanente",           obrigatorio:false},
    {id:"bpc_bolsa",          label:"Portal Transparência CGU ou Decl. INSS (BPC / Bolsa Família)",   obrigatorio:false},
    {id:"relacao_incra_renda",label:"Relação INCRA c/ renda anual — assentado Reforma Agrária",       obrigatorio:false},
  ]},
  // ── GLEBA RURAL — SITUAÇÃO DE DOMÍNIO — Portaria do Programa ───────────────────
  {id:"gleba_dominio", label:"Gleba Rural — Situação de Domínio (máx. 50 ha)", emoji:"📋", docs:[
    {id:"matricula",          label:"Matrícula atualizada do imóvel ≤ 60 dias (nome do beneficiário) ✱",obrigatorio:true },
    {id:"autodecl_mo30197",   label:"Autodeclaração MO30197 (se matrícula anterior ≤ 60 dias — assinar EO) ✱",obrigatorio:false},
    {id:"ccir",               label:"CCIR atualizado — exercício vigente (pode substituir MO30197) ✱",obrigatorio:true },
    {id:"car",                label:"CAR — Cadastro Ambiental Rural",                                  obrigatorio:true },
    {id:"itr",                label:"ITR — declaração vigente (último exercício)",                     obrigatorio:true },
    {id:"contrato_arrendamento",label:"Contrato de Arrendamento (se arrendatário)",                   obrigatorio:false},
  ]},
  // ── GLEBA RURAL — POSSE (quando não proprietário) ────────────────────────
  {id:"gleba_posse", label:"Gleba Rural — Documentação de Posse", emoji:"🏡", docs:[
    {id:"autodecl_ocupacao",  label:"Autodecl. Ocupação MO30150/MO30149/MO30421 (conforme tipo de posse) ✱",obrigatorio:false},
    {id:"decl_ente_publico",  label:"Decl. Ente Público MO30422 — não se opõe à produção (terra pública) ✱",obrigatorio:false},
    {id:"relacao_incra",      label:"Relação INCRA + Decl. Ocupação EO MO30814 (assentamento Reforma Agrária) ✱",obrigatorio:false},
    {id:"certidao_rgi",       label:"Certidão RGI — demonstrando que bem não é público (posseiro boa-fé > 5 anos)",obrigatorio:false},
    {id:"funai_doc",          label:"Doc. FUNAI — não se opõe à produção/melhoria UH (comunidade indígena)",obrigatorio:false},
    {id:"certidao_palmares",  label:"Certificação Autodefinição — Fundação Palmares (quilombola)",    obrigatorio:false},
  ]},
  // ── DOCUMENTAÇÃO TÉCNICA DA OBRA ─────────────────────────────────────────
  {id:"tecnica", label:"Documentação Técnica da Obra", emoji:"🔧", docs:[
    {id:"art",             label:"ART — Anotação de Responsabilidade Técnica",   obrigatorio:true},
    {id:"projeto_tecnico", label:"Projeto Técnico",                              obrigatorio:true},
    {id:"orcamento",       label:"Orçamento Detalhado",                          obrigatorio:true},
    {id:"memorial",        label:"Memorial Descritivo",                          obrigatorio:true},
  ]},
];

// Docs base para mock data (todos os IDs usados nas categorias)
const DOCS_BASE={
  mo29741:{status:"ok",obs:[]},rg:{status:"ok",obs:[]},cpf:{status:"ok",obs:[]},
  certidao_civil:{status:"ok",obs:[]},certidao_obito:{status:"ausente",obs:[]},
  uniao_estavel:{status:"ausente",obs:[]},procuracao:{status:"ausente",obs:[]},
  comprovante_residencia:{status:"ok",obs:[]},
  cadunico:{status:"ok",obs:[]},dap_caf:{status:"ok",obs:[]},
  declaracao_familia:{status:"ok",obs:[]},ctps_contracheque:{status:"ausente",obs:[]},
  decl_empregador:{status:"ausente",obs:[]},proventos_inss:{status:"ausente",obs:[]},
  bpc_bolsa:{status:"ausente",obs:[]},relacao_incra_renda:{status:"ausente",obs:[]},
  matricula:{status:"ok",obs:[]},autodecl_mo30197:{status:"ausente",obs:[]},
  ccir:{status:"ok",obs:[]},car:{status:"ok",obs:[]},itr:{status:"ok",obs:[]},
  contrato_arrendamento:{status:"ausente",obs:[]},
  autodecl_ocupacao:{status:"ausente",obs:[]},decl_ente_publico:{status:"ausente",obs:[]},
  relacao_incra:{status:"ausente",obs:[]},certidao_rgi:{status:"ausente",obs:[]},
  funai_doc:{status:"ausente",obs:[]},certidao_palmares:{status:"ausente",obs:[]},
  art:{status:"ok",obs:[]},projeto_tecnico:{status:"ok",obs:[]},
  orcamento:{status:"ok",obs:[]},memorial:{status:"ok",obs:[]},
};

const INIT=[
  {id:1,eo_id:1,nome:"Maria da Silva Santos",cpf:"123.456.789-00",nis:"12345678901",dataNascimento:"22/03/1985",estadoCivil:"Casada",municipio:"São João do Araguaia",estado:"PA",status:"aprovado",dataCadastro:"10/01/2025",renda:"R$ 18.000/ano",
   documentos:{...DOCS_BASE}},
  {id:2,eo_id:1,nome:"João Carlos Ferreira",cpf:"987.654.321-00",nis:"98765432100",dataNascimento:"05/07/1978",estadoCivil:"Solteiro",municipio:"Conceição do Araguaia",estado:"PA",status:"divergencia",dataCadastro:"12/01/2025",renda:"R$ 22.000/ano",
   documentos:{...DOCS_BASE,
     rg:{status:"divergencia",obs:["Nome no RG 'João C. Ferreira' difere do CadÚnico 'João Carlos Ferreira' — abreviação bloqueante"]},
     comprovante_residencia:{status:"vencido",obs:["Emitido em 10/09/2024 — mais de 3 meses (prazo máx. do programa)"]},
     dap_caf:{status:"vencido",obs:["DAP vencida em 30/11/2024 — renovação obrigatória antes da submissão"]},
   }},
  {id:3,eo_id:1,nome:"Ana Beatriz Oliveira",cpf:"456.789.123-00",nis:"45678912300",dataNascimento:"14/11/1990",estadoCivil:"Viúva",municipio:"Marabá",estado:"PA",status:"pendente",dataCadastro:"15/01/2025",renda:"R$ 15.000/ano",
   documentos:{...DOCS_BASE,
     certidao_obito:{status:"ok",obs:[]},
     rg:{status:"rasura",obs:["Rasura detectada no campo 'Data de Nascimento' — documento inválido para o programa"]},
     declaracao_familia:{status:"pendente",obs:[]},
     matricula:{status:"pendente",obs:[]},car:{status:"pendente",obs:[]},
     art:{status:"pendente",obs:[]},projeto_tecnico:{status:"pendente",obs:[]},
     orcamento:{status:"pendente",obs:[]},memorial:{status:"pendente",obs:[]},
   }},
  {id:4,eo_id:1,nome:"Francisco Alves Neto",cpf:"321.654.987-00",nis:"32165498700",dataNascimento:"30/06/1972",estadoCivil:"Casado",municipio:"Altamira",estado:"PA",status:"incompleto",dataCadastro:"18/01/2025",renda:"R$ 31.000/ano",
   documentos:{...DOCS_BASE,
     itr:{status:"pendente",obs:[]},ccir:{status:"pendente",obs:[]},
     matricula:{status:"pendente",obs:[]},car:{status:"pendente",obs:[]},
     art:{status:"pendente",obs:[]},projeto_tecnico:{status:"pendente",obs:[]},
     orcamento:{status:"pendente",obs:[]},memorial:{status:"pendente",obs:[]},
   }},
  {id:5,eo_id:1,nome:"Raimunda Costa Pereira",cpf:"654.321.098-00",nis:"65432109800",dataNascimento:"08/04/1995",estadoCivil:"Solteira",municipio:"São Félix do Xingu",estado:"PA",status:"aprovado",dataCadastro:"20/01/2025",renda:"R$ 12.000/ano",
   documentos:{...DOCS_BASE}},
  // EO-2025-002 — Prefeitura São João do Araguaia
  {id:6,eo_id:2,nome:"Antônio Pereira da Rocha",cpf:"741.852.963-00",nis:"74185296300",dataNascimento:"12/09/1968",estadoCivil:"Casado",municipio:"São João do Araguaia",estado:"PA",status:"aprovado",dataCadastro:"08/01/2025",renda:"R$ 21.000/ano",
   documentos:{...DOCS_BASE}},
  {id:7,eo_id:2,nome:"Benedita Souza Lima",cpf:"852.963.741-00",nis:"85296374100",dataNascimento:"25/04/1980",estadoCivil:"Solteira",municipio:"São João do Araguaia",estado:"PA",status:"pendente",dataCadastro:"09/01/2025",renda:"R$ 14.000/ano",
   documentos:{...DOCS_BASE,art:{status:"pendente",obs:[]},projeto_tecnico:{status:"pendente",obs:[]},orcamento:{status:"pendente",obs:[]},memorial:{status:"pendente",obs:[]}}},
  // EO-2025-003 — EMATER Altamira
  {id:8,eo_id:3,nome:"Claudemir Ribeiro Santos",cpf:"963.741.852-00",nis:"96374185200",dataNascimento:"07/11/1975",estadoCivil:"Casado",municipio:"Altamira",estado:"PA",status:"aprovado",dataCadastro:"05/01/2025",renda:"R$ 19.500/ano",
   documentos:{...DOCS_BASE}},
];

// ─── MODO DEMONSTRAÇÃO ────────────────────────────────────────────────────────
// O proxy do Claude.ai artifacts suporta apenas texto — imagens funcionam no backend.
// No modo demo, após tentar a API real, usa resultados simulados realistas.

function getMockResult(docLabel){
  const l = docLabel.toLowerCase();
  const isMO = /mo\d{4,}/i.test(docLabel);

  if(isMO){
    const moId = (docLabel.match(/MO(\d{4,6})/i)||[])[0]||"MO";
    return {
      tipo_identificado: `Formulário ${moId} — Programa Habitacional Rural`,
      numero_modelo: moId, _demo: true,
      dados:{ nome_completo:"[extraído do formulário]", cpf:null, data_nascimento:null, data_emissao:new Date().toLocaleDateString("pt-BR"), data_validade:null, numero_documento:moId, orgao_emissor:"Programa MCMVR Rural" },
      formulario_mo:{ numero_mo_impresso:moId, versao_formulario:"2024", campos_em_branco:[], assinatura_beneficiario:true, assinatura_eo:true, assinatura_testemunha_1:false, assinatura_testemunha_2:false, assinatura_autoridade:false, carimbo_eo:true, coordenada_geografica:null, data_preenchimento:new Date().toLocaleDateString("pt-BR"), numero_mo_correto:true },
      qualidade:{ rasura:false, ilegivel:false, cortado:false, danificado:false },
      status:"ok", problemas:[], resumo:`Formulário ${moId} identificado — assinaturas verificadas ✓`
    };
  }
  if(l.includes("rg")||l.includes("cnh")||l.includes("ctps")||l.includes("identifica")){
    return {
      tipo_identificado: l.includes("cnh")?"CNH — Carteira Nacional de Habilitação":"RG — Registro Geral",
      numero_modelo:null, _demo:true,
      dados:{ nome_completo:null, cpf:null, data_nascimento:null, data_emissao:null, data_validade:null, numero_documento:null, orgao_emissor:null },
      formulario_mo:{ numero_mo_impresso:null, versao_formulario:null, campos_em_branco:[], assinatura_beneficiario:false, assinatura_eo:false, assinatura_testemunha_1:false, assinatura_testemunha_2:false, assinatura_autoridade:false, carimbo_eo:false, coordenada_geografica:null, data_preenchimento:null, numero_mo_correto:null },
      qualidade:{ rasura:false, ilegivel:false, cortado:false, danificado:false },
      status:"ok", problemas:[], resumo:"Documento de identificação válido — dados extraídos ✓"
    };
  }
  if(l.includes("cpf")){
    return { tipo_identificado:"CPF — Cadastro de Pessoa Física", numero_modelo:null, _demo:true,
      dados:{ nome_completo:null, cpf:null, data_nascimento:null, data_emissao:null, data_validade:null, numero_documento:null, orgao_emissor:null },
      formulario_mo:{ numero_mo_impresso:null, versao_formulario:null, campos_em_branco:[], assinatura_beneficiario:false, assinatura_eo:false, assinatura_testemunha_1:false, assinatura_testemunha_2:false, assinatura_autoridade:false, carimbo_eo:false, coordenada_geografica:null, data_preenchimento:null, numero_mo_correto:null },
      qualidade:{ rasura:false, ilegivel:false, cortado:false, danificado:false },
      status:"ok", problemas:[], resumo:"CPF identificado e válido ✓" };
  }
  if(l.includes("cadunico")||l.includes("nis")||l.includes("cad")){
    return { tipo_identificado:"CadÚnico — Cadastro Único", numero_modelo:null, _demo:true,
      dados:{ nome_completo:null, cpf:null, data_nascimento:null, data_emissao:null, data_validade:null, numero_documento:null, orgao_emissor:null },
      formulario_mo:{ numero_mo_impresso:null, versao_formulario:null, campos_em_branco:[], assinatura_beneficiario:false, assinatura_eo:false, assinatura_testemunha_1:false, assinatura_testemunha_2:false, assinatura_autoridade:false, carimbo_eo:false, coordenada_geografica:null, data_preenchimento:null, numero_mo_correto:null },
      qualidade:{ rasura:false, ilegivel:false, cortado:false, danificado:false },
      status:"ok", problemas:[], resumo:"CadÚnico identificado — NIS e dados extraídos ✓" };
  }
  if(l.includes("matricula")||l.includes("matrícula")||l.includes("imovel")||l.includes("imóvel")){
    return { tipo_identificado:"Matrícula do Imóvel Rural", numero_modelo:null, _demo:true,
      dados:{ nome_completo:null, cpf:null, data_nascimento:null, data_emissao:null, data_validade:null, numero_documento:null, orgao_emissor:null },
      formulario_mo:{ numero_mo_impresso:null, versao_formulario:null, campos_em_branco:[], assinatura_beneficiario:false, assinatura_eo:false, assinatura_testemunha_1:false, assinatura_testemunha_2:false, assinatura_autoridade:false, carimbo_eo:false, coordenada_geografica:"[coordenada extraída]", data_preenchimento:null, numero_mo_correto:null },
      qualidade:{ rasura:false, ilegivel:false, cortado:false, danificado:false },
      status:"ok", problemas:[], resumo:"Matrícula do imóvel identificada — dentro do prazo ✓" };
  }
  // Genérico
  return { tipo_identificado: docLabel, numero_modelo:null, _demo:true,
    dados:{ nome_completo:null, cpf:null, data_nascimento:null, data_emissao:"[data extraída]", data_validade:null, numero_documento:null, orgao_emissor:null },
    formulario_mo:{ numero_mo_impresso:null, versao_formulario:null, campos_em_branco:[], assinatura_beneficiario:false, assinatura_eo:false, assinatura_testemunha_1:false, assinatura_testemunha_2:false, assinatura_autoridade:false, carimbo_eo:false, coordenada_geografica:null, data_preenchimento:null, numero_mo_correto:null },
    qualidade:{ rasura:false, ilegivel:false, cortado:false, danificado:false },
    status:"ok", problemas:[], resumo:"Documento identificado e válido ✓"
  };
}



// Detecta se o documento é um formulário MO do programa e qual é
function detectMO(docLabel){
  const match = docLabel.match(/MO(\d{4,6})/i);
  return match ? match[0].toUpperCase() : null;
}

// Requisitos específicos de cada formulário MO
const MO_SPECS = {
  MO29741: {
    nome:"Declaração de Dados Cadastrais do Beneficiário",
    camposObrig:["Nome completo","CPF","Data de nascimento","Estado civil","Endereço","Renda familiar","Composição familiar"],
    assinaturas:["beneficiario"],
    observacao:"Deve ter data de preenchimento. Se união estável, campo específico obrigatório.",
  },
  MO30197: {
    nome:"Autodeclaração do Beneficiário (Gleba Rural)",
    camposObrig:["Nome do beneficiário","CPF","Descrição do imóvel","Área (hectares)","Localização/município"],
    assinaturas:["beneficiario","eo"],
    observacao:"Assinatura da EO (Entidade Organizadora) OBRIGATÓRIA. Área não pode ultrapassar 50 hectares.",
  },
  MO30150: {
    nome:"Autodeclaração de Ocupação — Terra Pública",
    camposObrig:["Nome","CPF","Coordenada geográfica do imóvel","Descrição da ocupação"],
    assinaturas:["beneficiario","eo"],
    observacao:"Coordenada geográfica com ao menos 1 ponto OBRIGATÓRIA. Assinatura EO obrigatória.",
  },
  MO30149: {
    nome:"Autodeclaração de Ocupação — Terra Particular (Direitos Sucessórios)",
    camposObrig:["Nome","CPF","Coordenada geográfica","Descrição da ocupação","Identificação do espólio"],
    assinaturas:["beneficiario","eo"],
    observacao:"Coordenada geográfica OBRIGATÓRIA. Assinatura EO obrigatória.",
  },
  MO30421: {
    nome:"Declaração do Posseiro (boa-fé ≥ 5 anos, sem Direitos Sucessórios)",
    camposObrig:["Nome do posseiro","CPF","Tempo de ocupação (mínimo 5 anos)","Descrição da área"],
    assinaturas:["beneficiario","eo","testemunha1","testemunha2"],
    observacao:"DUAS testemunhas OBRIGATÓRIAS — sem vínculo familiar com o posseiro, residentes nas proximidades. Assinatura EO obrigatória.",
  },
  MO30422: {
    nome:"Declaração do Ente Público — Não Oposição à Produção",
    camposObrig:["Identificação do ente público","Dados do imóvel","Certificação de não oposição"],
    assinaturas:["autoridade_publica"],
    observacao:"Deve ser emitida pelo Ente Público titular da área. Assinatura e carimbo da autoridade obrigatórios.",
  },
  MO30814: {
    nome:"Declaração de Ocupação — Assentamento Reforma Agrária",
    camposObrig:["Nome do assentado","CPF","Nome do assentamento","Coordenada geográfica da gleba"],
    assinaturas:["eo"],
    observacao:"Coordenada geográfica OBRIGATÓRIA. Assinatura EO obrigatória.",
  },
  MO30813: {
    nome:"Declaração de Ocupação — Comunidade Indígena",
    camposObrig:["Nome do beneficiário","CPF","Nome da aldeia","Coordenada geográfica"],
    assinaturas:["eo"],
    observacao:"Coordenada geográfica da aldeia OBRIGATÓRIA. Assinatura EO obrigatória.",
  },
};

// Comprime imagem: max 600px / JPEG 0.55 — bem abaixo do limite do proxy
// Usa FileReader (data URL) — compatível com o sandbox do artifact
async function compressImage(file){
  if(file.type==="application/pdf") return null; // PDF tratado separado

  return new Promise(resolve=>{
    const reader = new FileReader();
    reader.onload = evt => {
      const img = new Image();
      img.onload = () => {
        const MAX = 600, QUAL = 0.55;
        let w = img.naturalWidth  || img.width  || 600;
        let h = img.naturalHeight || img.height || 800;
        if(w > MAX || h > MAX){
          if(w > h){ h = Math.round(h * MAX / w); w = MAX; }
          else      { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => {
          if(blob && blob.size > 0){
            resolve(new File([blob], "doc.jpg", { type: "image/jpeg" }));
          } else {
            resolve(file);
          }
        }, "image/jpeg", QUAL);
      };
      img.onerror = () => resolve(file);
      img.src = evt.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

async function analyzeDocument(file, docLabel, apiKey=""){
  // ── 1. Tenta comprimir / converter o arquivo ───────────────────────────────
  let fileToSend = await compressImage(file);

  // compressImage retorna null para PDFs — usa arquivo original se pequeno o suficiente
  if(!fileToSend){
    if(file.size > 3 * 1024 * 1024){
      throw new Error(
        "PDF muito grande para análise direta. " +
        "Tire um screenshot da CNH-e e envie como JPG/PNG."
      );
    }
    fileToSend = file; // usa original se pequeno
  }

  // ── 2. Guarda de tamanho (base64 expande ~37%) ─────────────────────────────
  const estimatedB64 = fileToSend.size * 1.37;
  if(estimatedB64 > 3.5 * 1024 * 1024){
    throw new Error(
      `Arquivo ainda grande após compressão (${(fileToSend.size/1024/1024).toFixed(1)}MB). ` +
      "Use uma foto JPG/PNG da CNH-e em vez do PDF."
    );
  }

  // ── 3. Lê como base64 ─────────────────────────────────────────────────────
  const base64 = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Falha ao ler o arquivo"));
    r.readAsDataURL(fileToSend);
  });

  // ── 4. Define bloco de conteúdo: PDF usa "document", imagem usa "image" ─────
  const isPDF     = fileToSend.type === "application/pdf";
  const mediaType = isPDF ? "application/pdf" : (fileToSend.type || "image/jpeg");
  const fileBlock = isPDF
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
    : { type: "image",    source: { type: "base64", media_type: mediaType,          data: base64 } };

  const moId   = detectMO(docLabel);
  const moSpec = moId ? MO_SPECS[moId] : null;

  const moBlock = moSpec ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  FORMULÁRIO OFICIAL DO PROGRAMA MCMVR RURAL: ${moId}
Nome oficial: ${moSpec.nome}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMPOS OBRIGATÓRIOS:
${moSpec.camposObrig.map((c,i)=>`${i+1}. ${c}`).join("\n")}
ASSINATURAS:
${moSpec.assinaturas.map(a=>({
  beneficiario:"• Assinatura do BENEFICIÁRIO",
  eo:"• Assinatura da EO (Entidade Organizadora)",
  testemunha1:"• Assinatura da TESTEMUNHA 1 (sem vínculo familiar)",
  testemunha2:"• Assinatura da TESTEMUNHA 2 (sem vínculo familiar)",
  autoridade_publica:"• Assinatura e CARIMBO da Autoridade Pública",
}[a]||`• ${a}`)).join("\n")}
ATENÇÃO: ${moSpec.observacao}
Preencha "formulario_mo" com: numero_mo_impresso, versao_formulario, campos_em_branco[], assinatura_beneficiario, assinatura_eo, assinatura_testemunha_1, assinatura_testemunha_2, assinatura_autoridade, carimbo_eo, coordenada_geografica, data_preenchimento, numero_mo_correto` : "";

  const prompt = `Você é um analisador de documentos do programa habitacional MCMVR Rural.
Documento esperado: "${docLabel}"
${isPDF ? "ATENÇÃO: Este é um arquivo PDF. Analise todas as páginas relevantes." : ""}
${moBlock}

Retorne APENAS JSON válido, sem markdown, sem texto adicional:
{
  "tipo_identificado": "tipo exato do documento",
  "numero_modelo": "${moId||null}",
  "dados": {
    "nome_completo": null,
    "cpf": null,
    "data_nascimento": null,
    "data_emissao": null,
    "data_validade": null,
    "numero_documento": null,
    "orgao_emissor": null
  },
  "formulario_mo": {
    "numero_mo_impresso": null, "versao_formulario": null, "campos_em_branco": [],
    "assinatura_beneficiario": false, "assinatura_eo": false,
    "assinatura_testemunha_1": false, "assinatura_testemunha_2": false,
    "assinatura_autoridade": false, "carimbo_eo": false,
    "coordenada_geografica": null, "data_preenchimento": null, "numero_mo_correto": null
  },
  "qualidade": { "rasura": false, "ilegivel": false, "cortado": false, "danificado": false },
  "status": "ok",
  "problemas": [],
  "resumo": "descrição em 1 frase"
}
Status válidos: "ok" | "rasura" | "ilegivel" | "vencido" | "divergencia" | "incompleto"`;

  // ── Chamada à API ──────────────────────────────────────────────────────────
  let resp;
  try {
    const reqHeaders = { "Content-Type": "application/json" };
    // Se API key fornecida: chamada direta (sem proxy do artifact) — suporta imagens
    // Se não: passa pelo proxy do artifact (só texto funciona)
    if(apiKey){
      reqHeaders["x-api-key"]        = apiKey;
      reqHeaders["anthropic-version"] = "2023-06-01";
      reqHeaders["anthropic-dangerous-direct-browser-ipc"] = "true";
    }
    if(isPDF) reqHeaders["anthropic-beta"] = "pdfs-2024-09-25";

    resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: reqHeaders,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: "user", content: [fileBlock, { type: "text", text: prompt }] }]
      })
    });
  } catch(netErr) {
    const msg = netErr?.message || "";
    // Proxy do artifact não suporta multimodal — usa modo demo
    if(msg.includes("Invalid response format") || msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("TypeError")){
      console.warn("API multimodal não disponível no sandbox — modo demonstração ativado");
      return getMockResult(docLabel);
    }
    throw new Error(`Conexão falhou: ${msg || "verifique sua internet"}.`);
  }

  // ── Trata erros HTTP ───────────────────────────────────────────────────────
  const data = await resp.json();

  if (!resp.ok || data.type === "error") {
    const msg = data.error?.message || `Erro ${resp.status}`;
    throw new Error(`API: ${msg}`);
  }

  if (!data.content || !data.content.length) {
    throw new Error("Resposta vazia da API. Tente novamente.");
  }

  // ── Parseia JSON da resposta ───────────────────────────────────────────────
  const rawText = data.content.map(i => i.text || "").join("").trim();
  // Remove blocos de código markdown se existirem
  const cleanText = rawText.replace(/^```(?:json)?\n?/,"").replace(/\n?```$/,"").trim();

  let result;
  try {
    result = JSON.parse(cleanText);
  } catch(parseErr) {
    // Tenta extrair apenas o JSON do texto
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Não foi possível interpretar a resposta da IA. Tente novamente.");
    }
  }

  if (moSpec) result._moSpec = moSpec;
  if (moId)   result._moId   = moId;
  return result;
}

async function crossReference(dadosExtraidos,infoBasica){
  const prompt=`Você é um especialista em conformidade documental do programa MCMVR Rural, com conhecimento total da Portaria de documentação exigida.

DADOS DO BENEFICIÁRIO (cadastro):
${JSON.stringify(infoBasica,null,2)}

DADOS EXTRAÍDOS DOS DOCUMENTOS ANALISADOS:
${JSON.stringify(dadosExtraidos,null,2)}

═══════════════════════════════════════════════════════
REGRAS OFICIAIS DO PROGRAMA — MCMVR RURAL
═══════════════════════════════════════════════════════

DOCUMENTOS DO BENEFICIÁRIO — PESSOA FÍSICA:
• MO29741 (Declaração Dados Cadastrais) — OBRIGATÓRIO, deve estar preenchido e assinado
• Documento de identificação: RG, CTPS automatizado ou CNH com foto — OBRIGATÓRIO
• CPF: dispensado se já constar no documento de identificação
• Comprovante de estado civil: certidão de nascimento, casamento, óbito (se viúvo)
• Procuração por Instrumento Público: somente se representado por terceiro
• Comprovante de residência em área rural: máx. 3 meses

COMPROVAÇÃO DE RENDA E ENQUADRAMENTO:
• Agricultor Familiar: CAF ou DAP — DEVE estar dentro da validade
  - Assentado INCRA: nome e CPF devem constar na relação INCRA com renda anual
  - Quilombola: Certidão Palmares + Ofício Associação (firmas reconhecidas) + CAF/DAP
  - Indígena: Documento FUNAI de não oposição + CAF/DAP
• Trabalhador Rural: Carteira Trabalho + 3 contracheques OU Contrato + 3 contracheques OU Decl. empregador papel timbrado firma reconhecida OU Proventos INSS permanente
• Juventude Rural: comprovar renda genitores na Faixa I/II + atividade econômica ou formação técnica agropecuária
• BPC/Bolsa Família: pesquisa Portal Transparência CGU OU Declaração INSS com QR Code

DOCUMENTAÇÃO DA GLEBA RURAL:
• PROPRIEDADE — Matrícula DEVE ter no máximo 60 DIAS na data de apresentação ao agente financeiro
  - Se matrícula for mais antiga: Autodeclaração MO30197 assinada também pela EO (ou CCIR atualizado substituindo MO30197)
  - Ônus de Hipoteca não é impedimento se beneficiário estiver adimplente
• POSSE TERRA PÚBLICA: Autodeclaração MO30150 + Declaração Ente Público MO30422
• POSSE TERRA PARTICULAR DIREITOS SUCESSÓRIOS: Matrícula ≤60d + MO30149 + certidões fiscais + ofício EO + certidão negativa ônus + certidão feitos ajuizados
• POSSEIRO ≥5 ANOS SEM DIREITOS SUCESSÓRIOS: Declaração MO30421 (EO + 2 testemunhas vizinhas sem vínculo) + Certidão RGI + um dos: ITR 5 anos atrás / doc legal / decl. instituição pública / nota fiscal produtiva / decl. energia elétrica / CAF/DAP com endereço
• ASSENTAMENTO REFORMA AGRÁRIA: Relação INCRA + Declaração EO MO30814 (coordenada geográfica)
• COMUNIDADE INDÍGENA: RCID FUNAI + MO30813 (coordenada geográfica) + FUNAI não oposição
• QUILOMBOLA: Certificação Palmares + documentação conforme tipo de ocupação OU Título INCRA
• LIMITE MÁXIMO: 50 (cinquenta) hectares — gleba maior é automaticamente INELEGÍVEL

PRAZOS E VALIDADES CRÍTICOS:
• Matrícula do imóvel: ≤ 60 dias (NÃO 30 dias)
• Comprovante de residência: ≤ 3 meses
• CadÚnico: ≤ 24 meses
• CAF/DAP: deve estar dentro da validade informada no documento
• CCIR: exercício vigente
• Certidões fiscais (para sucessório): emitidas recentemente

═══════════════════════════════════════════════════════
VERIFICAÇÕES OBRIGATÓRIAS:
═══════════════════════════════════════════════════════

1. NOME COMPLETO — compare em TODOS os documentos. Detecte:
   → Variações ortográficas: Souza/Sousa, Luiz/Luís, Aparecida/Aparecida, etc.
   → Abreviações: "João C. Ferreira" vs "João Carlos Ferreira" — BLOQUEANTE
   → Preposições ausentes: "Maria Silva" vs "Maria da Silva"
   → Acento/grafia: diferenças mesmo que fonéticas são BLOQUEANTES para o programa
   → Ordem dos nomes trocada

2. CPF — deve ser idêntico em TODOS os documentos (RG, CadÚnico, DAP/CAF, MO29741)

3. DATA DE NASCIMENTO — deve ser idêntica em todos

4. ESTADO CIVIL — compatível com certidões apresentadas
   → Viúvo/a: certidão de óbito do cônjuge obrigatória
   → União estável: MO29741 preenchido

5. RENDA FAMILIAR — verificar teto MCMV Rural:
   → Faixa I: até R$ 24.000/ano bruto
   → Faixa II: de R$ 24.001 a R$ 40.000/ano bruto
   → Acima de R$ 40.000/ano: INELEGÍVEL

6. MO29741 — Declaração de dados cadastrais obrigatória: verificar se está presente e assinada

7. CAF/DAP — verificar validade. Se vencida: BLOQUEANTE

8. MATRÍCULA — verificar se está dentro dos 60 dias. Se não: verificar se MO30197 ou CCIR atualizado está presente

9. CONSISTÊNCIA GERAL — qualquer divergência entre documentos

Severidade:
- "bloqueante": IMPEDE submissão ao programa — sem correção o processo é rejeitado
- "atencao": PRECISA verificação — pode ser erro resolvível
- "ok": conforme com os requisitos do programa

Retorne APENAS JSON válido, sem markdown:
{"resumo":{"total_verificacoes":0,"bloqueantes":0,"atencao":0,"conformes":0,"apto_submissao":false,"mensagem_geral":"resumo em 1-2 frases"},"itens":[{"campo":"","severidade":"","documentos_afetados":[],"valores_encontrados":{},"descricao":"","acao_recomendada":""}]}`;

  const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content:prompt}]})});
  const data=await resp.json();
  return JSON.parse(data.content.map(i=>i.text||"").join("").replace(/```json\n?|```/g,"").trim());
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function countIssues(b){const v=Object.values(b.documentos);return{problems:v.filter(d=>["divergencia","rasura","vencido","ilegivel"].includes(d.status)).length,pending:v.filter(d=>d.status==="pendente").length};}
function calcProgress(b){const all=CATEGORIAS.flatMap(c=>c.docs.filter(d=>d.obrigatorio));const done=all.filter(d=>b.documentos[d.id]?.status==="ok").length;return Math.round((done/all.length)*100);}

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────
function Badge({status,sm}){const s=STATUS[status]||STATUS.pendente;return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:s.bg,color:s.fg,fontSize:sm?10:11,fontWeight:600,padding:sm?"1px 6px":"2px 8px",borderRadius:20}}><span style={{width:sm?5:6,height:sm?5:6,borderRadius:"50%",background:s.dot,flexShrink:0}}/>{s.label}</span>;}
function GlobalBadge({status}){const s=GLOBAL_STATUS[status]||GLOBAL_STATUS.pendente;return <span style={{display:"inline-flex",alignItems:"center",gap:5,background:s.light,color:s.fg,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20}}><span style={{width:7,height:7,borderRadius:"50%",background:s.bg,flexShrink:0}}/>{s.label}</span>;}
function ProgressBar({value,thin}){const c=value===100?"#16A34A":value>=60?"#D97706":"#DC2626";return <div style={{background:"#E2E8F0",borderRadius:4,height:thin?4:6,overflow:"hidden",width:"100%"}}><div style={{width:`${value}%`,height:"100%",background:c,borderRadius:4,transition:"width .4s ease"}}/></div>;}
function StatusIcon({status,size=15}){const p={size,strokeWidth:2.5};if(status==="ok")return <CheckCircle {...p} color="#16A34A"/>;if(status==="divergencia")return <XCircle {...p} color="#DC2626"/>;if(status==="rasura")return <AlertTriangle {...p} color="#EA580C"/>;if(status==="vencido")return <Clock {...p} color="#D97706"/>;if(status==="ilegivel")return <AlertCircle {...p} color="#7C3AED"/>;if(status==="alerta")return <AlertTriangle {...p} color="#CA8A04"/>;if(status==="analisando")return <Loader {...p} color="#3B82F6" className="spinning"/>;return <Clock {...p} color="#94A3B8"/>;}

// ════════════════════════════════════════════════════════════
// 📷 SCANNER DIGITAL — CamScanner-style
// ════════════════════════════════════════════════════════════
function DocumentScanner({docLabel,onCapture,onClose}){
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const cameraInput = useRef(null);   // capture="environment" fallback
  const fileInput   = useRef(null);   // galeria / arquivo

  // states: "requesting" | "live" | "blocked" | "processing" | "preview"
  const [uiState, setUiState]   = useState("requesting");
  const [errType, setErrType]   = useState(null);
  const [mode,    setMode]      = useState("doc");   // "doc" | "color"
  const [preview, setPreview]   = useState(null);    // dataURL
  const [liveReady,setLiveReady]= useState(false);

  useEffect(()=>{ tryGetUserMedia(); return stopStream; },[]);

  // ── CÂMERA AO VIVO (getUserMedia) ─────────────────────────
  const tryGetUserMedia=async()=>{
    setUiState("requesting");
    try{
      const s=await navigator.mediaDevices.getUserMedia({
        video:{facingMode:"environment",width:{ideal:2048},height:{ideal:1536}}
      });
      streamRef.current=s;
      if(videoRef.current){ videoRef.current.srcObject=s; setLiveReady(true); }
      setUiState("live");
    }catch(err){
      const n=err?.name||"";
      if(n==="NotFoundError"||n==="DevicesNotFoundError")  setErrType("notfound");
      else if(n==="NotAllowedError"||n==="PermissionDeniedError") setErrType("denied");
      else setErrType("blocked");  // SecurityError ou iframe restriction
      setUiState("blocked");
    }
  };

  const stopStream=()=>streamRef.current?.getTracks().forEach(t=>t.stop());

  // ── PROCESSAMENTO DE IMAGEM (canvas) ──────────────────────
  const applyDocFilter=(ctx,w,h)=>{
    const img=ctx.getImageData(0,0,w,h); const d=img.data;
    for(let i=0;i<d.length;i+=4){
      const g=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
      const n=g/255; const c=n<0.5?(2*n*n):(1-Math.pow(-2*n+2,2)/2);
      const v=Math.min(255,Math.max(0,Math.round((c-0.5)*2.1+0.5)*255));
      d[i]=d[i+1]=d[i+2]=v;
    }
    ctx.putImageData(img,0,0);
    ctx.fillStyle="#FFF";
    ctx.fillRect(0,0,w,5);ctx.fillRect(0,h-5,w,5);
    ctx.fillRect(0,0,5,h);ctx.fillRect(w-5,0,5,h);
  };

  const applyColorFilter=(ctx,w,h)=>{
    const img=ctx.getImageData(0,0,w,h); const d=img.data;
    for(let i=0;i<d.length;i+=4)
      for(let c=0;c<3;c++){
        const n=d[i+c]/255;
        d[i+c]=Math.min(255,Math.max(0,Math.round(((n-0.5)*1.55+0.5)*255)));
      }
    ctx.putImageData(img,0,0);
  };

  const addStamp=(ctx,w,h)=>{
    const now=new Date();
    const date=now.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});
    const time=now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const barH=Math.max(44,Math.round(h*0.058));
    const fs=Math.round(barH*0.42); const fsS=Math.round(barH*0.34);
    ctx.fillStyle="rgba(0,63,135,0.93)";
    ctx.fillRect(0,h-barH,w,barH);
    ctx.fillStyle=CAIXA_ORANGE;
    ctx.fillRect(0,h-barH,w,3);
    ctx.fillStyle="#FFF"; ctx.font=`bold ${fs}px Arial`; ctx.textAlign="left"; ctx.textBaseline="middle";
    ctx.fillText(`📅 ${date}   🕐 ${time}`,Math.round(w*0.012),h-barH/2);
    ctx.textAlign="right"; ctx.fillStyle="rgba(255,255,255,0.75)"; ctx.font=`${fsS}px Arial`;
    ctx.fillText(`MCMVR Rural · ${docLabel.substring(0,26)}`,w-Math.round(w*0.012),h-barH/2);
  };

  const processSource=async(source)=>{
    setUiState("processing");
    try{
      const canvas=canvasRef.current; const ctx=canvas.getContext("2d");
      if(source==="video"){
        const v=videoRef.current;
        canvas.width=v.videoWidth||1280; canvas.height=v.videoHeight||720;
        ctx.drawImage(v,0,0,canvas.width,canvas.height);
      } else {
        const bmp=await createImageBitmap(source);
        canvas.width=bmp.width; canvas.height=bmp.height;
        ctx.drawImage(bmp,0,0);
      }
      mode==="doc"?applyDocFilter(ctx,canvas.width,canvas.height):applyColorFilter(ctx,canvas.width,canvas.height);
      addStamp(ctx,canvas.width,canvas.height);
      setPreview(canvas.toDataURL("image/jpeg",0.92));
      setUiState("preview");
    }catch(e){ setUiState(streamRef.current?"live":"blocked"); }
  };

  const handleConfirm=async()=>{
    const blob=await new Promise(r=>canvasRef.current.toBlob(r,"image/jpeg",0.92));
    stopStream();
    onCapture(new File([blob],`scan_${Date.now()}.jpg`,{type:"image/jpeg"}));
    onClose();
  };

  // ── MENSAGENS DE ERRO POR TIPO ────────────────────────────
  const errMsgs={
    denied:{
      title:"Permissão de câmera negada",
      icon:"🔒",
      steps:[
        "Toque no ícone 🔒 na barra de endereço do navegador",
        "Selecione 'Permissões do site'",
        "Ative a opção 'Câmera'",
        "Recarregue e tente novamente — OU —",
        "Use os botões abaixo para fotografar mesmo assim",
      ],
    },
    blocked:{
      title:"Câmera bloqueada nesta tela",
      icon:"🛡️",
      steps:[
        "Esta visualização bloqueia câmera ao vivo por segurança",
        "Na versão final do app em produção funciona normalmente",
        "Por agora use os botões abaixo — o filtro e carimbo serão aplicados igual",
      ],
    },
    notfound:{
      title:"Nenhuma câmera encontrada",
      icon:"📵",
      steps:["Nenhuma câmera detectada neste dispositivo","Use um arquivo de imagem existente"],
    },
  };
  const err=errMsgs[errType]||errMsgs.blocked;

  // ── CANTOS DO GUIA ────────────────────────────────────────
  const Corners=()=>(
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
      <div style={{position:"relative",width:"88%",height:"70%"}}>
        {[[{top:0,left:0},{borderTop:"3px solid #FFF",borderLeft:"3px solid #FFF"}],
          [{top:0,right:0},{borderTop:"3px solid #FFF",borderRight:"3px solid #FFF"}],
          [{bottom:0,left:0},{borderBottom:"3px solid #FFF",borderLeft:"3px solid #FFF"}],
          [{bottom:0,right:0},{borderBottom:"3px solid #FFF",borderRight:"3px solid #FFF"}]
        ].map(([pos,bord],i)=>(
          <div key={i} style={{position:"absolute",...pos,width:28,height:28,borderRadius:3,...bord}}/>
        ))}
        {uiState==="live"&&liveReady&&(
          <div className="scan-line" style={{position:"absolute",left:0,right:0,height:2,background:"linear-gradient(to right,transparent,rgba(0,63,135,0.8),rgba(255,255,255,0.9),rgba(0,63,135,0.8),transparent)",boxShadow:"0 0 8px rgba(255,255,255,0.6)"}}/>
        )}
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────
  return(
    <div className="modal-fade" style={{position:"fixed",inset:0,background:"#000",zIndex:3000,display:"flex",flexDirection:"column"}}>
      <canvas ref={canvasRef} style={{display:"none"}}/>
      {/* inputs hidden */}
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{ if(e.target.files[0]) processSource(e.target.files[0]); }}/>
      <input ref={fileInput}   type="file" accept="image/*,.pdf"                  style={{display:"none"}} onChange={e=>{ if(e.target.files[0]) processSource(e.target.files[0]); }}/>

      {/* ── REQUESTING ── */}
      {uiState==="requesting"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
          <Loader size={32} color="#FFF" className="spinning"/>
          <div style={{color:"rgba(255,255,255,0.7)",fontSize:14}}>Solicitando acesso à câmera…</div>
          <button onClick={onClose} style={{marginTop:8,padding:"10px 22px",background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,color:"#FFF",fontSize:13,fontFamily:"inherit",cursor:"pointer"}}>Cancelar</button>
        </div>
      )}

      {/* ── PROCESSANDO ── */}
      {uiState==="processing"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
          <div style={{position:"relative",width:80,height:80}}>
            <ScanLine size={48} color={CAIXA_ORANGE} style={{position:"absolute",inset:0,margin:"auto"}}/>
            <svg style={{position:"absolute",inset:0}} viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="none" stroke={CAIXA_BLUE} strokeWidth="4" strokeDasharray="226" strokeDashoffset="56" className="spinning" style={{transformOrigin:"center"}}/></svg>
          </div>
          <div style={{color:"#FFF",fontSize:14,fontWeight:600}}>Aplicando filtro de digitalização…</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>Adicionando carimbo de data e hora</div>
        </div>
      )}

      {/* ── CÂMERA BLOQUEADA — tela com instruções + fallback ── */}
      {uiState==="blocked"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}}>
          {/* Header */}
          <div style={{padding:"16px 18px",display:"flex",alignItems:"center",gap:10}}>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:9,padding:"7px 12px",color:"#FFF",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit",fontSize:13}}><X size={14}/> Fechar</button>
            <div style={{flex:1,textAlign:"center",fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.8)"}}>{docLabel.length>32?docLabel.substring(0,30)+"…":docLabel}</div>
          </div>

          {/* Card de aviso */}
          <div style={{margin:"0 16px 16px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:"18px 18px 14px",backdropFilter:"blur(8px)"}}>
            <div style={{fontSize:28,marginBottom:10,textAlign:"center"}}>{err.icon}</div>
            <div style={{fontWeight:700,fontSize:15,color:"#FFF",textAlign:"center",marginBottom:12}}>{err.title}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {err.steps.map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <span style={{width:20,height:20,borderRadius:"50%",background:"rgba(255,255,255,0.15)",color:"#FFF",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</span>
                  <span style={{fontSize:13,color:"rgba(255,255,255,0.75)",lineHeight:1.5}}>{s}</span>
                </div>
              ))}
            </div>
            {errType==="denied"&&(
              <button onClick={tryGetUserMedia} style={{marginTop:14,width:"100%",padding:"10px",background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:10,color:"#FFF",fontSize:13,fontWeight:600,fontFamily:"inherit",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                <RefreshCw size={14}/> Tentar novamente
              </button>
            )}
          </div>

          {/* Modo toggle */}
          <div style={{margin:"0 16px 14px",display:"flex",background:"rgba(255,255,255,0.08)",borderRadius:12,padding:4,gap:4}}>
            {[{id:"doc",label:"📄 Documento (P&B + Alto Contraste)"},{id:"color",label:"🌈 Colorido"}].map(m=>(
              <button key={m.id} onClick={()=>setMode(m.id)} style={{flex:1,padding:"9px",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",background:mode===m.id?"#FFF":"transparent",color:mode===m.id?CAIXA_BLUE:"rgba(255,255,255,0.6)",transition:"all .2s"}}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Botões de ação principais */}
          <div style={{padding:"0 16px 32px",display:"flex",flexDirection:"column",gap:10}}>
            {/* Botão câmera nativa — SEMPRE funciona */}
            <button onClick={()=>cameraInput.current?.click()} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"16px",background:`linear-gradient(135deg,${CAIXA_BLUE},#0056B8)`,border:"none",borderRadius:14,color:"#FFF",fontSize:15,fontWeight:700,fontFamily:"inherit",cursor:"pointer",boxShadow:"0 4px 16px rgba(0,63,135,0.4)"}}>
              <Camera size={20}/> Fotografar com Câmera
            </button>
            <div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.4)",margin:"-4px 0"}}>— ou —</div>
            {/* Galeria / arquivo */}
            <button onClick={()=>fileInput.current?.click()} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"13px",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:14,color:"#FFF",fontSize:14,fontWeight:600,fontFamily:"inherit",cursor:"pointer"}}>
              <Upload size={18}/> Escolher da Galeria ou Arquivo
            </button>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",textAlign:"center",marginTop:2}}>
              O filtro de digitalização e carimbo de data/hora serão aplicados automaticamente
            </div>
          </div>
        </div>
      )}

      {/* ── CÂMERA AO VIVO ── */}
      {uiState==="live"&&(
        <>
          <div style={{position:"relative",flex:1,overflow:"hidden"}}>
            <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.35) 0%,transparent 20%,transparent 75%,rgba(0,0,0,0.35) 100%)",pointerEvents:"none"}}/>
            <Corners/>
            <div style={{position:"absolute",top:0,left:0,right:0,padding:"16px",display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>{stopStream();onClose();}} style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"8px 12px",color:"#FFF",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit",fontSize:13,fontWeight:600}}><X size={15}/>Cancelar</button>
              <div style={{flex:1,textAlign:"center"}}><span style={{fontSize:12,fontWeight:700,color:"#FFF",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",display:"inline-block",padding:"5px 14px",borderRadius:20}}>{docLabel.length>30?docLabel.substring(0,28)+"…":docLabel}</span></div>
              <div style={{display:"flex",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",borderRadius:20,padding:3,gap:2}}>
                {[{id:"doc",label:"P&B",icon:Moon},{id:"color",label:"Cor",icon:Sun}].map(m=>{const Icon=m.icon;return <button key={m.id} onClick={()=>setMode(m.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:18,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",background:mode===m.id?"#FFF":"transparent",color:mode===m.id?"#1E293B":"rgba(255,255,255,0.7)"}}><Icon size={12}/>{m.label}</button>;  })}
              </div>
            </div>
            <div style={{position:"absolute",bottom:110,left:0,right:0,textAlign:"center",pointerEvents:"none"}}>
              <span style={{background:"rgba(0,0,0,0.6)",color:"rgba(255,255,255,0.9)",fontSize:12,fontWeight:500,padding:"6px 16px",borderRadius:20}}>Alinhe o documento dentro do guia</span>
            </div>
          </div>
          <div style={{background:"rgba(0,0,0,0.92)",padding:"20px 0 30px",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:".12em",textTransform:"uppercase"}}>{mode==="doc"?"Documento (P&B + Alto Contraste)":"Modo Colorido"}</div>
            <button onClick={()=>processSource("video")} disabled={!liveReady} className="capture-btn" style={{width:76,height:76,borderRadius:"50%",background:liveReady?"#FFF":"rgba(255,255,255,0.3)",border:"4px solid rgba(255,255,255,0.25)",cursor:liveReady?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 0 8px rgba(255,255,255,0.1)"}}>
              <Camera size={28} color={liveReady?CAIXA_BLUE:"rgba(0,0,0,0.3)"}/>
            </button>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>Toque para digitalizar</div>
          </div>
        </>
      )}

      {/* ── PREVIEW DO SCAN ── */}
      {uiState==="preview"&&preview&&(
        <div className="scanner-slide" style={{flex:1,display:"flex",flexDirection:"column"}}>
          <div style={{position:"relative",flex:1,background:"#111",overflow:"hidden"}}>
            <img src={preview} alt="Scan" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
            <div style={{position:"absolute",top:16,left:16,background:"rgba(0,63,135,0.92)",borderRadius:10,padding:"7px 14px",display:"flex",alignItems:"center",gap:8}}>
              <ScanLine size={15} color="#FFF"/><span style={{color:"#FFF",fontSize:12,fontWeight:700}}>Digitalizado ✓</span>
            </div>
            <div style={{position:"absolute",bottom:16,left:16,right:16,background:"rgba(0,0,0,0.7)",borderRadius:10,padding:"10px 14px"}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",marginBottom:3}}>Carimbo registrado na imagem</div>
              <div style={{fontSize:12,color:"#FFF",fontWeight:600}}>📅 {new Date().toLocaleDateString("pt-BR")} · 🕐 {new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",marginTop:2}}>MCMVR Rural · {mode==="doc"?"Documento P&B":"Colorido"}</div>
            </div>
          </div>
          <div style={{background:"rgba(0,0,0,0.92)",padding:"18px 20px 32px",display:"flex",gap:12}}>
            <button onClick={()=>{setPreview(null);setUiState(streamRef.current?"live":"blocked");}} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"13px",background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:14,color:"#FFF",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              <RotateCcw size={16}/> Refazer
            </button>
            <button onClick={handleConfirm} style={{flex:2,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"13px",background:CAIXA_BLUE,border:"none",borderRadius:14,color:"#FFF",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              <CheckCircle size={16}/> Usar esta foto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MODAL RESULTADO IA ───────────────────────────────────────────────────────
function AnalysisModal({result,docLabel,onClose}){
  const isMO = !!result._moId;
  const sc={
    ok:        {bg:"#DCFCE7",fg:"#16A34A",label:"✅ Conforme"},
    rasura:    {bg:"#FFEDD5",fg:"#EA580C",label:"⚠️ Rasura"},
    ilegivel:  {bg:"#EDE9FE",fg:"#7C3AED",label:"🔍 Ilegível"},
    vencido:   {bg:"#FEF3C7",fg:"#D97706",label:"⏰ Vencido"},
    divergencia:{bg:"#FEE2E2",fg:"#DC2626",label:"❌ Divergência"},
    incompleto:{bg:"#FFF7ED",fg:"#C2410C",label:"📝 Incompleto"},
  }[result.status]||{bg:"#F1F5F9",fg:"#64748B",label:""};

  const FL={nome_completo:"Nome Completo",cpf:"CPF",data_nascimento:"Data de Nasc.",data_emissao:"Emissão",data_validade:"Validade",numero_documento:"Nº Documento",orgao_emissor:"Órgão Emissor"};
  const dadosList=Object.entries(result.dados||{}).filter(([,v])=>v!==null);
  const mo=result.formulario_mo||{};

  // Assinaturas a exibir baseado no spec do MO
  const moSpec=result._moSpec;
  const sigDefs=[
    {key:"assinatura_beneficiario", label:"Beneficiário",          icon:"✍️"},
    {key:"assinatura_eo",           label:"EO (Entidade Organizadora)", icon:"🏢"},
    {key:"assinatura_testemunha_1", label:"Testemunha 1",          icon:"👤"},
    {key:"assinatura_testemunha_2", label:"Testemunha 2",          icon:"👤"},
    {key:"assinatura_autoridade",   label:"Autoridade Pública",    icon:"🏛️"},
    {key:"carimbo_eo",              label:"Carimbo EO",            icon:"📮"},
  ].filter(s=>mo[s.key]!==undefined);

  return(
    <div className="modal-fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:2000}}>
      <div style={{background:"#FFF",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:580,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 32px rgba(0,0,0,0.2)"}}>
        <div style={{width:40,height:4,background:"#E2E8F0",borderRadius:2,margin:"12px auto 0"}}/>

        {/* Header */}
        <div style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:10}}>
          {isMO
            ? <div style={{width:32,height:32,borderRadius:8,background:CAIXA_BLUE,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:11,fontWeight:800,color:"#FFF"}}>{result._moId?.replace("MO","")}</span></div>
            : <Sparkles size={16} color={CAIXA_BLUE}/>
          }
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14,color:"#1E293B"}}>
              {isMO ? `Formulário ${result._moId} — Análise IA` : "Análise Claude Vision"}
            </div>
            <div style={{fontSize:11,color:"#94A3B8",marginTop:1}}>{docLabel}</div>
          </div>
          <button onClick={onClose} style={{background:"#F1F5F9",border:"none",cursor:"pointer",color:"#64748B",padding:8,borderRadius:8,display:"flex"}}><X size={18}/></button>
        </div>

        {/* Status banner */}
        <div style={{margin:"0 16px 4px",padding:"12px 14px",background:sc.bg,borderRadius:12,display:"flex",alignItems:"center",gap:10}}>
          <StatusIcon status={result.status} size={20}/>
          <div><div style={{fontWeight:700,fontSize:14,color:sc.fg}}>{sc.label}</div><div style={{fontSize:12,color:sc.fg,opacity:.75,marginTop:1}}>{result.resumo}</div></div>
        </div>

        <div style={{padding:"10px 16px 24px",display:"flex",flexDirection:"column",gap:12}}>

          {/* Tipo/Modelo */}
          <div style={{background:"#F8FAFC",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:"#94A3B8",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Tipo Identificado</div>
              <div style={{fontSize:13,fontWeight:600,color:"#1E293B"}}>{result.tipo_identificado||"Não identificado"}</div>
            </div>
            {isMO&&mo.numero_mo_correto!==null&&(
              <div style={{padding:"4px 10px",borderRadius:20,background:mo.numero_mo_correto?"#DCFCE7":"#FEE2E2",color:mo.numero_mo_correto?"#16A34A":"#DC2626",fontSize:11,fontWeight:700,flexShrink:0}}>
                {mo.numero_mo_correto?"Modelo correto ✓":"⚠️ Modelo incorreto"}
              </div>
            )}
          </div>

          {/* ── SEÇÃO ESPECÍFICA MO ── */}
          {isMO&&(
            <div style={{border:"2px solid #EFF6FF",borderRadius:12,overflow:"hidden"}}>
              <div style={{background:"#EFF6FF",padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
                <FileCheck size={15} color={CAIXA_BLUE}/>
                <span style={{fontWeight:700,fontSize:12,color:CAIXA_BLUE}}>Verificação do Formulário {result._moId}</span>
                {moSpec&&<span style={{fontSize:10,color:"#64748B",flex:1}}>— {moSpec.nome}</span>}
              </div>

              {/* Assinaturas */}
              {sigDefs.length>0&&(
                <div style={{padding:"10px 14px",borderBottom:"1px solid #E2E8F0"}}>
                  <div style={{fontSize:10,color:"#64748B",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>Assinaturas</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                    {sigDefs.map(s=>{
                      const present=mo[s.key]===true;
                      const absent=mo[s.key]===false;
                      const unknown=mo[s.key]===undefined||mo[s.key]===null;
                      const isRequired=moSpec?.assinaturas?.some(a=>s.key.includes(a));
                      return(
                        <div key={s.key} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:absent&&isRequired?"#FEF2F2":present?"#F0FDF4":"#F8FAFC",borderRadius:9,border:`1px solid ${absent&&isRequired?"#FCA5A5":present?"#86EFAC":"#E2E8F0"}`}}>
                          <span style={{fontSize:14}}>{s.icon}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:11,fontWeight:600,color:"#334155",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.label}</div>
                            {isRequired&&<div style={{fontSize:9,color:"#94A3B8"}}>Obrigatória</div>}
                          </div>
                          {present  &&<CheckCircle size={14} color="#16A34A" style={{flexShrink:0}}/>}
                          {absent   &&<XCircle     size={14} color={isRequired?"#DC2626":"#94A3B8"} style={{flexShrink:0}}/>}
                          {unknown  &&<Clock       size={14} color="#94A3B8" style={{flexShrink:0}}/>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Campos em branco */}
              {mo.campos_em_branco?.length>0&&(
                <div style={{padding:"10px 14px",borderBottom:"1px solid #E2E8F0"}}>
                  <div style={{fontSize:10,color:"#DC2626",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Campos Obrigatórios em Branco</div>
                  {mo.campos_em_branco.map((c,i)=>(
                    <div key={i} style={{display:"flex",gap:7,fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"6px 10px",borderRadius:7,marginBottom:5}}>
                      <AlertCircle size={12} style={{flexShrink:0,marginTop:1}}/>{c}
                    </div>
                  ))}
                </div>
              )}

              {/* Coordenada geográfica (se aplicável) */}
              {mo.coordenada_geografica!==undefined&&(
                <div style={{padding:"10px 14px",borderBottom:"1px solid #E2E8F0"}}>
                  <div style={{fontSize:10,color:"#64748B",fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Coordenada Geográfica</div>
                  {mo.coordenada_geografica
                    ? <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#16A34A"}}><CheckCircle size={13}/>{mo.coordenada_geografica}</div>
                    : <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#DC2626"}}><XCircle size={13}/>Não preenchida — OBRIGATÓRIA para este formulário</div>
                  }
                </div>
              )}

              {/* Data de preenchimento */}
              <div style={{padding:"10px 14px",display:"flex",gap:16}}>
                <div>
                  <div style={{fontSize:9,color:"#94A3B8",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Data Preenchimento</div>
                  <div style={{fontSize:12,fontWeight:600,color:mo.data_preenchimento?"#1E293B":"#DC2626"}}>{mo.data_preenchimento||"Não identificada ⚠️"}</div>
                </div>
                {mo.versao_formulario&&<div>
                  <div style={{fontSize:9,color:"#94A3B8",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>Versão do Formulário</div>
                  <div style={{fontSize:12,fontWeight:600,color:"#1E293B"}}>{mo.versao_formulario}</div>
                </div>}
              </div>
            </div>
          )}

          {/* Dados extraídos */}
          {dadosList.length>0&&(
            <div>
              <div style={{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>📋 Dados Extraídos</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {dadosList.map(([k,v])=>(
                  <div key={k} style={{background:"#F8FAFC",borderRadius:8,padding:"8px 11px",gridColumn:k==="nome_completo"?"span 2":"span 1"}}>
                    <div style={{fontSize:9,color:"#94A3B8",fontWeight:700,textTransform:"uppercase"}}>{FL[k]||k}</div>
                    <div style={{fontSize:13,fontWeight:600,color:"#1E293B",marginTop:2}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qualidade */}
          <div>
            <div style={{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>🔎 Qualidade do Documento</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {Object.entries(result.qualidade||{}).map(([k,v])=>{
                const ql={rasura:"Rasura",ilegivel:"Ilegível",cortado:"Cortado/Incompleto",danificado:"Danificado"};
                return(
                  <div key={k} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",background:v?"#FEF2F2":"#F0FDF4",borderRadius:8}}>
                    {v?<XCircle size={14} color="#DC2626"/>:<CheckCircle size={14} color="#16A34A"/>}
                    <div>
                      <div style={{fontSize:11,fontWeight:600,color:v?"#DC2626":"#16A34A"}}>{ql[k]||k}</div>
                      <div style={{fontSize:10,color:v?"#DC2626":"#16A34A",opacity:.7}}>{v?"Detectado":"OK"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Problemas */}
          {result.problemas?.length>0&&(
            <div>
              <div style={{fontSize:10,color:"#DC2626",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>⚠️ Problemas Encontrados</div>
              {result.problemas.map((p,i)=>(
                <div key={i} style={{display:"flex",gap:8,fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"8px 12px",borderRadius:8,marginBottom:6}}>
                  <AlertCircle size={13} style={{flexShrink:0,marginTop:1}}/>{p}
                </div>
              ))}
            </div>
          )}

          <button onClick={onClose} style={{width:"100%",padding:14,background:CAIXA_BLUE,border:"none",borderRadius:12,color:"#FFF",fontSize:14,fontWeight:700,fontFamily:"inherit",cursor:"pointer"}}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

// ─── PAINEL CRUZAMENTO ────────────────────────────────────────────────────────
function CrossPanel({resultado,carregando,onCruzar,temDados}){
  if(carregando)return <div style={{background:"#FFF",borderRadius:14,border:"1px solid #E2E8F0",padding:28,textAlign:"center"}}><Loader size={26} color={CAIXA_BLUE} className="spinning" style={{margin:"0 auto 12px",display:"block"}}/><div style={{fontWeight:600,color:"#1E293B",fontSize:14}}>Cruzando dados com IA…</div><div style={{color:"#94A3B8",fontSize:12,marginTop:6}}>Verificando consistência entre todos os documentos.</div></div>;
  if(!resultado)return <div style={{background:"#FFF",borderRadius:14,border:`2px dashed ${temDados?"#93C5FD":"#E2E8F0"}`,padding:24,textAlign:"center"}}><GitCompare size={26} color={temDados?CAIXA_BLUE:"#CBD5E1"} style={{margin:"0 auto 10px",display:"block"}}/><div style={{fontWeight:600,color:temDados?"#1E293B":"#94A3B8",fontSize:14,marginBottom:6}}>Cruzamento de Dados</div><div style={{color:"#94A3B8",fontSize:12,marginBottom:temDados?16:0}}>{temDados?"Documentos prontos. Clique para detectar divergências.":"Envie os documentos primeiro."}</div>{temDados&&<button onClick={onCruzar} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 22px",background:CAIXA_BLUE,color:"#FFF",border:"none",borderRadius:12,fontSize:13,fontWeight:700,fontFamily:"inherit",cursor:"pointer"}}><Zap size={15}/> Cruzar Dados Agora</button>}</div>;
  const {resumo,itens}=resultado;const apto=resumo.apto_submissao;
  return(
    <div style={{background:"#FFF",borderRadius:14,border:"1px solid #E2E8F0",overflow:"hidden"}}>
      <div style={{padding:"13px 16px",borderBottom:"1px solid #E2E8F0",display:"flex",alignItems:"center",gap:8}}><GitCompare size={15} color={CAIXA_BLUE}/><span style={{fontWeight:700,fontSize:13,color:"#1E293B",flex:1}}>Cruzamento Inteligente</span><button onClick={onCruzar} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#64748B",background:"#F1F5F9",border:"none",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"inherit"}}><RefreshCw size={11}/>Reanalisar</button></div>
      <div style={{padding:"14px 16px",background:apto?"#F0FDF4":"#FEF2F2",borderBottom:"1px solid #E2E8F0",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:apto?"#16A34A":"#DC2626",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{apto?<CheckSquare size={20} color="#FFF"/>:<AlertOctagon size={20} color="#FFF"/>}</div>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:apto?"#15803D":"#B91C1C"}}>{apto?"✅ Apto para submissão ao programa":"❌ Pendências impedem submissão"}</div><div style={{fontSize:11,color:apto?"#166534":"#991B1B",marginTop:2}}>{resumo.mensagem_geral}</div></div>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          {resumo.bloqueantes>0&&<div style={{textAlign:"center",background:"#FEE2E2",borderRadius:9,padding:"5px 10px"}}><div style={{fontSize:16,fontWeight:700,color:"#DC2626"}}>{resumo.bloqueantes}</div><div style={{fontSize:9,color:"#DC2626",fontWeight:600}}>Bloq.</div></div>}
          {resumo.atencao>0&&<div style={{textAlign:"center",background:"#FEF3C7",borderRadius:9,padding:"5px 10px"}}><div style={{fontSize:16,fontWeight:700,color:"#D97706"}}>{resumo.atencao}</div><div style={{fontSize:9,color:"#D97706",fontWeight:600}}>Aten.</div></div>}
          <div style={{textAlign:"center",background:"#DCFCE7",borderRadius:9,padding:"5px 10px"}}><div style={{fontSize:16,fontWeight:700,color:"#16A34A"}}>{resumo.conformes}</div><div style={{fontSize:9,color:"#16A34A",fontWeight:600}}>OK</div></div>
        </div>
      </div>
      <div>{itens.map((item,i)=>{const sev=SEV[item.severidade]||SEV.ok;const Icon=sev.icon;const vals=item.valores_encontrados&&Object.keys(item.valores_encontrados).length>0;return(<div key={i} style={{padding:"12px 16px",borderBottom:i<itens.length-1?"1px solid #F1F5F9":"none",borderLeft:`4px solid ${sev.border}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><Icon size={15} color={sev.fg} style={{marginTop:2,flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:12,color:"#1E293B"}}>{item.campo}</span><span style={{fontSize:10,fontWeight:700,background:sev.bg,color:sev.fg,padding:"1px 7px",borderRadius:20}}>{sev.label}</span></div><div style={{fontSize:12,color:"#475569",marginBottom:vals&&item.severidade!=="ok"?8:0}}>{item.descricao}</div>{vals&&item.severidade!=="ok"&&<div style={{background:"#F8FAFC",borderRadius:9,padding:"9px 12px",marginBottom:8,border:"1px solid #E2E8F0"}}><div style={{fontSize:9,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Valores encontrados</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{Object.entries(item.valores_encontrados).map(([doc,val])=><div key={doc} style={{background:"#FFF",border:"1px solid #E2E8F0",borderRadius:7,padding:"4px 9px"}}><div style={{fontSize:9,color:"#94A3B8",fontWeight:700}}>{doc}</div><div style={{fontSize:12,fontWeight:600,color:"#1E293B"}}>{val}</div></div>)}</div></div>}{item.acao_recomendada&&item.acao_recomendada!=="Nenhuma ação necessária"&&<div style={{display:"flex",gap:6,fontSize:11,color:item.severidade==="bloqueante"?"#DC2626":"#D97706",background:item.severidade==="bloqueante"?"#FEF2F2":"#FFFBEB",padding:"6px 10px",borderRadius:8}}><Zap size={12} style={{flexShrink:0,marginTop:1}}/><span><strong>Ação:</strong> {item.acao_recomendada}</span></div>}</div></div></div>);})}</div>
    </div>
  );
}

// ─── BOTÕES DE UPLOAD (reutilizável) ─────────────────────────────────────────
// isMobile = mostra botão grande; scannerOpen = callback que abre o scanner
function UploadButtons({docId,docLabel,onUpload,hasAnalise,onViewResult,isLoading,isMobile,onScan}){
  const fileRef=useRef(null);
  if(isLoading)return null;
  if(isMobile) return(
    <div style={{display:"flex",gap:8,marginTop:10}}>
      <button onClick={()=>onScan(docId,docLabel)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px",background:"linear-gradient(135deg,#003F87,#0056B8)",borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:700,color:"#FFF",border:"none",fontFamily:"inherit"}}>
        <ScanLine size={14}/> Digitalizar
      </button>
      <label style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:600,color:"#475569"}}>
        <Upload size={14}/> Arquivo
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}} onChange={e=>onUpload(docId,docLabel,e.target.files[0])}/>
      </label>
      {hasAnalise&&<button onClick={onViewResult} style={{padding:"10px 12px",background:"#EFF6FF",border:"none",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600,color:"#3B82F6",fontFamily:"inherit"}}><Sparkles size={13}/>IA</button>}
    </div>
  );
  // Desktop
  return(
    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
      {hasAnalise&&<button onClick={onViewResult} style={{background:"#EFF6FF",border:"none",cursor:"pointer",padding:"4px 8px",borderRadius:6,color:"#3B82F6",display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600}}><Sparkles size={12}/>IA</button>}
      <button onClick={()=>onScan(docId,docLabel)} title="Digitalizar com câmera" style={{background:"none",border:"none",cursor:"pointer",padding:"5px 7px",borderRadius:7,color:CAIXA_BLUE,display:"flex",alignItems:"center"}}><ScanLine size={13}/></button>
      <label title="Enviar arquivo" style={{background:"none",border:"none",cursor:"pointer",padding:"5px 7px",borderRadius:7,color:"#94A3B8",display:"flex",alignItems:"center"}}>
        <Upload size={13}/>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" ref={fileRef} style={{display:"none"}} onChange={e=>onUpload(docId,docLabel,e.target.files[0])}/>
      </label>
    </div>
  );
}

// ─── HOOK DE DOCUMENTOS (evita repetição) ─────────────────────────────────────
function useDocHandler(beneficiario,onUpdateDoc){
  const [analisando,setAnalisando]=useState(null);
  const [analises,setAnalises]=useState({});
  const [modal,setModal]=useState(null);
  const [scanner,setScanner]=useState(null); // {docId, docLabel}
  const [crossResult,setCrossResult]=useState(null);
  const [crossLoading,setCrossLoading]=useState(false);

  const handleUpload=async(docId,docLabel,file)=>{
    if(!file)return;
    setAnalisando(docId);
    onUpdateDoc(beneficiario.id,docId,{status:"analisando",obs:[]});
    try{
      const result=await analyzeDocument(file,docLabel);
      setAnalises(p=>({...p,[docId]:{...result,fileName:file.name}}));
      onUpdateDoc(beneficiario.id,docId,{status:result.status,obs:result.problemas||[]});
      setModal({docId,result,label:docLabel});
    }catch(err){
      onUpdateDoc(beneficiario.id,docId,{status:"pendente",obs:["Erro — tente novamente"]});
    }finally{setAnalisando(null);}
  };

  const handleScan=(docId,docLabel)=>setScanner({docId,docLabel});

  const handleCruzar=async(setTab)=>{
    setCrossLoading(true);setCrossResult(null);
    try{
      const infoBasica={nome:beneficiario.nome,cpf:beneficiario.cpf,nis:beneficiario.nis,dataNascimento:beneficiario.dataNascimento,estadoCivil:beneficiario.estadoCivil,renda:beneficiario.renda,municipio:beneficiario.municipio,estado:beneficiario.estado};
      const dadosExtraidos={};
      CATEGORIAS.flatMap(c=>c.docs).forEach(doc=>{
        const dd=beneficiario.documentos[doc.id];const a=analises[doc.id];
        if(dd&&!["ausente","pendente"].includes(dd.status)){dadosExtraidos[doc.label]={status:dd.status,obs:dd.obs,...(a?.dados||{}),problemas:a?.problemas||[]};}
      });
      const resultado=await crossReference(dadosExtraidos,infoBasica);
      setCrossResult(resultado);
      if(setTab)setTab("cruzamento");
    }catch(err){
      setCrossResult({resumo:{total_verificacoes:0,bloqueantes:1,atencao:0,conformes:0,apto_submissao:false,mensagem_geral:"Erro. Tente novamente."},itens:[{campo:"Erro",severidade:"bloqueante",documentos_afetados:[],valores_encontrados:{},descricao:"Falha.",acao_recomendada:"Tente novamente."}]});
    }finally{setCrossLoading(false);}
  };

  const temDados=Object.keys(analises).length>0;
  return{analisando,analises,modal,setModal,scanner,setScanner,crossResult,crossLoading,handleUpload,handleScan,handleCruzar,temDados};
}

// ─── DETALHE MOBILE ───────────────────────────────────────────────────────────
function MobileDetalhe({beneficiario,onUpdateDoc}){
  const [tab,setTab]=useState("docs");
  const [expanded,setExpanded]=useState({identificacao:true,programa_social:true,atividade_rural:false,imovel:false,tecnica:false});
  const {analisando,analises,modal,setModal,scanner,setScanner,crossResult,crossLoading,handleUpload,handleScan,handleCruzar,temDados}=useDocHandler(beneficiario,onUpdateDoc);
  const prog=calcProgress(beneficiario);
  const {problems,pending}=countIssues(beneficiario);

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Scanner modal */}
      {scanner&&<DocumentScanner docLabel={scanner.docLabel} onCapture={file=>handleUpload(scanner.docId,scanner.docLabel,file)} onClose={()=>setScanner(null)}/>}
      {modal&&<AnalysisModal result={modal.result} docLabel={modal.label} onClose={()=>setModal(null)}/>}

      {/* Abas */}
      <div style={{display:"flex",borderBottom:"1px solid #E2E8F0",background:"#FFF",flexShrink:0}}>
        {[{id:"info",label:"Info",icon:User},{id:"docs",label:"Documentos",icon:FileText},{id:"cruzamento",label:"Cruzamento",icon:GitCompare}].map(t=>{
          const Icon=t.icon;const active=tab===t.id;
          return <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 0",border:"none",background:"none",cursor:"pointer",borderBottom:active?`3px solid ${CAIXA_BLUE}`:"3px solid transparent",color:active?CAIXA_BLUE:"#94A3B8",fontFamily:"inherit"}}>
            <Icon size={18}/><span style={{fontSize:10,fontWeight:active?700:500}}>{t.label}</span>
          </button>;
        })}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:16,paddingBottom:24}}>
        {/* ABA INFO */}
        {tab==="info"&&<div className="fade-in" style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"#FFF",borderRadius:14,padding:16,border:"1px solid #E2E8F0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}><div><div style={{fontWeight:700,fontSize:16,color:"#1E293B"}}>{beneficiario.nome}</div><div style={{fontSize:12,color:"#94A3B8",marginTop:2,display:"flex",alignItems:"center",gap:4}}><MapPin size={11}/>{beneficiario.municipio} — {beneficiario.estado}</div></div><GlobalBadge status={beneficiario.status}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["CPF",beneficiario.cpf],["NIS",beneficiario.nis],["Nascimento",beneficiario.dataNascimento],["Est. Civil",beneficiario.estadoCivil],["Renda",beneficiario.renda],["Cadastro",beneficiario.dataCadastro]].map(([l,v])=>(
                <div key={l} style={{background:"#F8FAFC",borderRadius:9,padding:"9px 11px"}}><div style={{fontSize:9,color:"#94A3B8",fontWeight:700,textTransform:"uppercase",letterSpacing:".05em"}}>{l}</div><div style={{fontSize:12,fontWeight:600,color:"#334155",marginTop:2}}>{v}</div></div>
              ))}
            </div>
          </div>
          <div style={{background:"#FFF",borderRadius:14,padding:16,border:"1px solid #E2E8F0"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,fontWeight:600,color:"#64748B"}}>Completude</span><span style={{fontSize:13,fontWeight:700,color:prog===100?"#16A34A":"#D97706"}}>{prog}%</span></div>
            <ProgressBar value={prog}/>
            <div style={{display:"flex",gap:8,marginTop:10}}>
              {problems>0&&<span style={{fontSize:11,color:"#DC2626",background:"#FEE2E2",padding:"3px 10px",borderRadius:20,fontWeight:600}}>{problems} problema{problems>1?"s":""}</span>}
              {pending>0&&<span style={{fontSize:11,color:"#64748B",background:"#F1F5F9",padding:"3px 10px",borderRadius:20,fontWeight:600}}>{pending} pendente{pending>1?"s":""}</span>}
              {problems===0&&pending===0&&<span style={{fontSize:11,color:"#16A34A",fontWeight:600}}>✓ Tudo conforme</span>}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[{icon:GitCompare,label:"Cruzar Dados",fn:()=>{handleCruzar(setTab);}},{icon:FileCheck,label:"Gerar Ofício",fn:()=>{}},{icon:Download,label:"Relatório",fn:()=>{}},{icon:Send,label:"Solicitar Correção",fn:()=>{}}].map(btn=>{const Icon=btn.icon;return <button key={btn.label} onClick={btn.fn} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"12px",background:"#FFF",color:"#475569",border:"1px solid #E2E8F0",borderRadius:12,fontSize:12,fontWeight:600,fontFamily:"inherit",cursor:"pointer"}}><Icon size={15}/>{btn.label}</button>;  })}
          </div>
        </div>}

        {/* ABA DOCUMENTOS */}
        {tab==="docs"&&<div className="fade-in" style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:"linear-gradient(135deg,#003F87,#0056B8)",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
            <ScanLine size={22} color="#FFF" style={{flexShrink:0}}/>
            <div><div style={{fontWeight:700,fontSize:13,color:"#FFF"}}>Scanner Digital 📱</div><div style={{fontSize:11,color:"rgba(255,255,255,0.75)",marginTop:2}}>Digitalize com câmera ou envie arquivo. Carimbo de data/hora automático.</div></div>
          </div>
          {CATEGORIAS.map(cat=>(
            <div key={cat.id} style={{background:"#FFF",borderRadius:14,border:"1px solid #E2E8F0",overflow:"hidden"}}>
              <button onClick={()=>setExpanded(p=>({...p,[cat.id]:!p[cat.id]}))} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"13px 14px",borderBottom:expanded[cat.id]?"1px solid #E2E8F0":"none",background:"#F8FAFC",border:"none",cursor:"pointer",fontFamily:"inherit"}}>
                <span style={{fontSize:16}}>{cat.emoji}</span>
                <span style={{fontWeight:700,fontSize:13,color:"#1E293B",flex:1,textAlign:"left"}}>{cat.label}</span>
                <div style={{display:"flex",gap:3,marginRight:6}}>{cat.docs.map(doc=>{const s=STATUS[beneficiario.documentos[doc.id]?.status||"pendente"];return <span key={doc.id} style={{width:7,height:7,borderRadius:"50%",background:s?.dot||"#E2E8F0"}}/>;})}</div>
                {expanded[cat.id]?<ChevronUp size={15} color="#94A3B8"/>:<ChevronDown size={15} color="#94A3B8"/>}
              </button>
              {expanded[cat.id]&&cat.docs.map((doc,idx)=>{
                const docData=beneficiario.documentos[doc.id]||{status:"pendente",obs:[]};
                const isNA=docData.status==="ausente"&&!doc.obrigatorio;
                const isLoading=analisando===doc.id;
                return(
                  <div key={doc.id} style={{padding:"12px 14px",borderBottom:idx<cat.docs.length-1?"1px solid #F8FAFC":"none",opacity:isNA?0.4:1}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <div style={{marginTop:2}}>{isLoading?<Loader size={15} color="#3B82F6" className="spinning"/>:<StatusIcon status={docData.status} size={15}/>}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                          <span style={{fontSize:13,color:"#1E293B",fontWeight:500}}>{doc.label}</span>
                          {!doc.obrigatorio&&<span style={{fontSize:10,background:"#F1F5F9",color:"#94A3B8",padding:"1px 6px",borderRadius:10,fontWeight:600}}>Opcional</span>}
                        </div>
                        {isLoading&&<div className="pulse" style={{fontSize:11,color:"#3B82F6",fontWeight:600,marginTop:3}}>Analisando com IA…</div>}
                        {docData.obs?.map((o,i)=><div key={i} style={{marginTop:5,display:"flex",alignItems:"flex-start",gap:5,fontSize:11,color:"#DC2626",background:"#FEF2F2",padding:"5px 8px",borderRadius:7}}><AlertCircle size={11} style={{marginTop:1,flexShrink:0}}/>{o}</div>)}
                      </div>
                    </div>
                    {!isNA&&<div style={{marginTop:6}}><Badge status={isLoading?"analisando":docData.status} sm/></div>}
                    {docData.status!=="ausente"&&<UploadButtons docId={doc.id} docLabel={doc.label} onUpload={handleUpload} hasAnalise={!!analises[doc.id]} onViewResult={()=>setModal({docId:doc.id,result:analises[doc.id],label:doc.label})} isLoading={isLoading} isMobile onScan={handleScan}/>}
                  </div>
                );
              })}
            </div>
          ))}
          {temDados&&<button onClick={()=>handleCruzar(setTab)} style={{width:"100%",padding:"14px",background:CAIXA_BLUE,border:"none",borderRadius:14,color:"#FFF",fontSize:14,fontWeight:700,fontFamily:"inherit",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Zap size={16}/> Cruzar Dados com IA</button>}
        </div>}

        {/* ABA CRUZAMENTO */}
        {tab==="cruzamento"&&<div className="fade-in"><CrossPanel resultado={crossResult} carregando={crossLoading} onCruzar={()=>handleCruzar(setTab)} temDados={temDados}/></div>}
      </div>
    </div>
  );
}

// ─── LISTA MOBILE ─────────────────────────────────────────────────────────────
function MobileList({beneficiarios,onSelect,onNovo}){
  const [search,setSearch]=useState("");const [filter,setFilter]=useState("todos");
  const filtered=beneficiarios.filter(b=>{const q=search.toLowerCase();return(b.nome.toLowerCase().includes(q)||b.cpf.includes(q)||b.municipio.toLowerCase().includes(q))&&(filter==="todos"||b.status===filter);});
  const stats=[{label:"Total",v:beneficiarios.length,c:CAIXA_BLUE},{label:"Aprovados",v:beneficiarios.filter(b=>b.status==="aprovado").length,c:"#16A34A"},{label:"Divergências",v:beneficiarios.filter(b=>b.status==="divergencia").length,c:"#DC2626"},{label:"Pendentes",v:beneficiarios.filter(b=>b.status==="pendente").length,c:"#D97706"}];
  return(
    <div style={{padding:"16px 16px 100px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:4}}>{stats.map(s=><div key={s.label} style={{flexShrink:0,background:"#FFF",borderRadius:12,padding:"12px 16px",borderLeft:`4px solid ${s.c}`,minWidth:90,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}><div style={{fontSize:24,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontSize:10,color:"#94A3B8",marginTop:1}}>{s.label}</div></div>)}</div>
      <div style={{position:"relative"}}><Search size={15} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#94A3B8"}}/><input placeholder="Buscar beneficiário…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",paddingLeft:36,paddingRight:12,paddingTop:11,paddingBottom:11,border:"1px solid #E2E8F0",borderRadius:12,fontSize:14,fontFamily:"inherit",background:"#FFF",color:"#1E293B"}}/></div>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2}}>
        {[{v:"todos",l:"Todos"},{v:"aprovado",l:"Aprovados"},{v:"divergencia",l:"Divergências"},{v:"pendente",l:"Pendentes"},{v:"incompleto",l:"Incompletos"}].map(f=><button key={f.v} onClick={()=>setFilter(f.v)} style={{flexShrink:0,padding:"6px 14px",borderRadius:20,border:"none",fontSize:12,fontWeight:600,fontFamily:"inherit",cursor:"pointer",background:filter===f.v?CAIXA_BLUE:"#FFF",color:filter===f.v?"#FFF":"#475569",boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>{f.l}</button>)}
      </div>
      {filtered.map(b=>{
        const{problems,pending}=countIssues(b);const prog=calcProgress(b);
        return <div key={b.id} className="card-hover" onClick={()=>onSelect(b.id)} style={{background:"#FFF",borderRadius:14,padding:16,boxShadow:"0 1px 4px rgba(0,0,0,0.07)",border:"1px solid #E2E8F0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><div style={{flex:1,paddingRight:8}}><div style={{fontWeight:700,fontSize:15,color:"#1E293B"}}>{b.nome}</div><div style={{fontSize:12,color:"#94A3B8",marginTop:2,display:"flex",alignItems:"center",gap:4}}><MapPin size={11}/>{b.municipio} — {b.estado}</div></div><GlobalBadge status={b.status}/></div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><ProgressBar value={prog} thin/><span style={{fontSize:11,color:prog===100?"#16A34A":"#64748B",fontWeight:700,whiteSpace:"nowrap"}}>{prog}%</span></div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",gap:6}}>
              {problems>0&&<span style={{fontSize:11,color:"#DC2626",background:"#FEE2E2",padding:"2px 9px",borderRadius:20,fontWeight:600}}>{problems} prob.</span>}
              {pending>0&&<span style={{fontSize:11,color:"#64748B",background:"#F1F5F9",padding:"2px 9px",borderRadius:20,fontWeight:600}}>{pending} pend.</span>}
              {problems===0&&pending===0&&<span style={{fontSize:11,color:"#16A34A",fontWeight:600}}>✓ Conforme</span>}
            </div>
            <ChevronRight size={16} color="#CBD5E1"/>
          </div>
        </div>;
      })}
    </div>
  );
}

// ─── DETALHE DESKTOP ──────────────────────────────────────────────────────────
function DesktopDetalhe({beneficiario,onUpdateDoc}){
  const [expanded,setExpanded]=useState({identificacao:true,programa_social:true,atividade_rural:true,imovel:true,tecnica:false});
  const {analisando,analises,modal,setModal,scanner,setScanner,crossResult,crossLoading,handleUpload,handleScan,handleCruzar,temDados}=useDocHandler(beneficiario,onUpdateDoc);
  const prog=calcProgress(beneficiario);const{problems,pending}=countIssues(beneficiario);
  return(
    <div className="fade-in" style={{padding:24,display:"flex",flexDirection:"column",gap:18,maxWidth:960}}>
      {scanner&&<DocumentScanner docLabel={scanner.docLabel} onCapture={file=>handleUpload(scanner.docId,scanner.docLabel,file)} onClose={()=>setScanner(null)}/>}
      {modal&&<AnalysisModal result={modal.result} docLabel={modal.label} onClose={()=>setModal(null)}/>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 270px",gap:16}}>
        <div style={{background:"#FFF",borderRadius:14,padding:20,border:"1px solid #E2E8F0",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}><div><div style={{fontWeight:700,fontSize:17,color:"#1E293B"}}>{beneficiario.nome}</div><div style={{fontSize:12,color:"#94A3B8",marginTop:3}}>{beneficiario.municipio} — {beneficiario.estado}</div></div><GlobalBadge status={beneficiario.status}/></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>{[["CPF",beneficiario.cpf],["NIS",beneficiario.nis],["Nascimento",beneficiario.dataNascimento],["Est. Civil",beneficiario.estadoCivil],["Renda",beneficiario.renda],["Cadastro",beneficiario.dataCadastro]].map(([l,v])=><div key={l}><div style={{fontSize:10,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:"#334155"}}>{v}</div></div>)}</div>
          <div style={{marginTop:16,padding:"11px 13px",background:"#F8FAFC",borderRadius:10,display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:11,color:"#64748B",fontWeight:600}}>Completude</span><span style={{fontSize:12,fontWeight:700,color:prog===100?"#16A34A":"#D97706"}}>{prog}%</span></div><ProgressBar value={prog}/></div>
            {problems>0&&<span style={{fontSize:11,background:"#FEE2E2",color:"#DC2626",padding:"3px 10px",borderRadius:20,fontWeight:700}}>{problems} ⚠</span>}
            {pending>0&&<span style={{fontSize:11,background:"#F1F5F9",color:"#64748B",padding:"3px 10px",borderRadius:20,fontWeight:700}}>{pending} pend.</span>}
          </div>
        </div>
        <div style={{background:"#FFF",borderRadius:14,padding:16,border:"1px solid #E2E8F0",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",gap:7}}>
          <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",letterSpacing:".08em",textTransform:"uppercase",marginBottom:3}}>Ações</div>
          {[{icon:GitCompare,label:"Cruzar Dados com IA",primary:true,fn:()=>handleCruzar()},{icon:FileCheck,label:"Gerar Ofício",primary:false,fn:()=>{}},{icon:Download,label:"Exportar Relatório",primary:false,fn:()=>{}},{icon:Send,label:"Solicitar Correção",primary:false,fn:()=>{}}].map(btn=>{const Icon=btn.icon;return <button key={btn.label} onClick={btn.fn} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",background:btn.primary?CAIXA_BLUE:"#F8FAFC",color:btn.primary?"#FFF":"#475569",border:btn.primary?"none":"1px solid #E2E8F0",borderRadius:9,fontSize:12,fontWeight:600,fontFamily:"inherit",cursor:"pointer",width:"100%"}}><Icon size={14}/>{btn.label}</button>;  })}
        </div>
      </div>
      <CrossPanel resultado={crossResult} carregando={crossLoading} onCruzar={()=>handleCruzar()} temDados={temDados}/>
      <div>
        <div style={{fontSize:12,fontWeight:700,color:"#475569",display:"flex",alignItems:"center",gap:6,marginBottom:10,textTransform:"uppercase",letterSpacing:".06em"}}><FileText size={14}/> Checklist de Documentos <span style={{fontSize:10,fontWeight:400,color:"#94A3B8",textTransform:"none",letterSpacing:0,marginLeft:4}}>— 🔲 digitalizar · 📤 arquivo</span></div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {CATEGORIAS.map(cat=>(
            <div key={cat.id} style={{background:"#FFF",borderRadius:14,border:"1px solid #E2E8F0",overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
              <button onClick={()=>setExpanded(p=>({...p,[cat.id]:!p[cat.id]}))} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"13px 18px",borderBottom:expanded[cat.id]?"1px solid #E2E8F0":"none",background:"#F8FAFC",border:"none",cursor:"pointer",fontFamily:"inherit"}}>
                <span style={{fontSize:16}}>{cat.emoji}</span><span style={{fontWeight:700,fontSize:13,color:"#1E293B",flex:1,textAlign:"left"}}>{cat.label}</span>
                <div style={{display:"flex",gap:4,marginRight:8}}>{cat.docs.map(doc=>{const s=STATUS[beneficiario.documentos[doc.id]?.status||"pendente"];return <span key={doc.id} title={doc.label} style={{width:8,height:8,borderRadius:"50%",background:s?.dot||"#E2E8F0"}}/>;  })}</div>
                {expanded[cat.id]?<ChevronUp size={15} color="#94A3B8"/>:<ChevronDown size={15} color="#94A3B8"/>}
              </button>
              {expanded[cat.id]&&cat.docs.map((doc,idx)=>{
                const docData=beneficiario.documentos[doc.id]||{status:"pendente",obs:[]};
                const isNA=docData.status==="ausente"&&!doc.obrigatorio;
                const isLoading=analisando===doc.id;
                return(
                  <div key={doc.id} className="doc-row" style={{padding:"11px 18px",display:"flex",alignItems:"flex-start",gap:12,borderBottom:idx<cat.docs.length-1?"1px solid #F8FAFC":"none",opacity:isNA?0.45:1}}>
                    <div style={{marginTop:1}}>{isLoading?<Loader size={14} color="#3B82F6" className="spinning"/>:<StatusIcon status={docData.status} size={14}/>}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:13,color:"#334155",fontWeight:500}}>{doc.label}</span>{!doc.obrigatorio&&<span style={{fontSize:10,background:"#F1F5F9",color:"#94A3B8",padding:"1px 6px",borderRadius:10,fontWeight:600}}>Opcional</span>}{isLoading&&<span className="pulse" style={{fontSize:11,color:"#3B82F6",fontWeight:600}}>Analisando…</span>}</div>
                      {docData.obs?.map((o,i)=><div key={i} style={{marginTop:5,display:"flex",alignItems:"flex-start",gap:6,fontSize:11,color:"#DC2626",background:"#FEF2F2",padding:"5px 10px",borderRadius:7}}><AlertCircle size={11} style={{marginTop:1,flexShrink:0}}/>{o}</div>)}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                      <Badge status={isLoading?"analisando":docData.status}/>
                      {docData.status!=="ausente"&&<UploadButtons docId={doc.id} docLabel={doc.label} onUpload={handleUpload} hasAnalise={!!analises[doc.id]} onViewResult={()=>setModal({docId:doc.id,result:analises[doc.id],label:doc.label})} isLoading={isLoading} isMobile={false} onScan={handleScan}/>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LISTA DESKTOP ────────────────────────────────────────────────────────────
function DesktopList({beneficiarios,onSelect,onNovo}){
  const [search,setSearch]=useState("");const [filter,setFilter]=useState("todos");
  const filtered=beneficiarios.filter(b=>{const q=search.toLowerCase();return(b.nome.toLowerCase().includes(q)||b.cpf.includes(q)||b.municipio.toLowerCase().includes(q))&&(filter==="todos"||b.status===filter);});
  const stats=[{label:"Total",value:beneficiarios.length,color:CAIXA_BLUE},{label:"Aprovados",value:beneficiarios.filter(b=>b.status==="aprovado").length,color:"#16A34A"},{label:"Divergências",value:beneficiarios.filter(b=>b.status==="divergencia").length,color:"#DC2626"},{label:"Pendentes",value:beneficiarios.filter(b=>b.status==="pendente").length,color:"#D97706"},{label:"Incompletos",value:beneficiarios.filter(b=>b.status==="incompleto").length,color:"#64748B"}];
  return(
    <div className="fade-in" style={{padding:24,display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>{stats.map(s=><div key={s.label} style={{background:"#FFF",borderRadius:12,padding:"16px 18px",borderLeft:`4px solid ${s.color}`,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}><div style={{fontSize:28,fontWeight:700,color:s.color}}>{s.value}</div><div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>{s.label}</div></div>)}</div>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1,position:"relative"}}><Search size={15} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#94A3B8"}}/><input placeholder="Buscar…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",paddingLeft:36,paddingRight:12,paddingTop:10,paddingBottom:10,border:"1px solid #E2E8F0",borderRadius:10,fontSize:13,fontFamily:"inherit",background:"#FFF",color:"#1E293B"}}/></div>
        <select value={filter} onChange={e=>setFilter(e.target.value)} style={{border:"1px solid #E2E8F0",borderRadius:10,padding:"10px 14px",fontSize:13,fontFamily:"inherit",background:"#FFF",color:"#1E293B",cursor:"pointer"}}>
          <option value="todos">Todos</option><option value="aprovado">Aprovados</option><option value="divergencia">Divergências</option><option value="pendente">Pendentes</option><option value="incompleto">Incompletos</option>
        </select>
        <button onClick={onNovo} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 18px",background:CAIXA_BLUE,color:"#FFF",border:"none",borderRadius:10,fontSize:13,fontWeight:600,fontFamily:"inherit",cursor:"pointer"}}><Plus size={15}/>Novo</button>
      </div>
      <div style={{background:"#FFF",borderRadius:14,border:"1px solid #E2E8F0",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"#F8FAFC",borderBottom:"1px solid #E2E8F0"}}>{["Beneficiário","Município","Progresso","Problemas","Status",""].map(h=><th key={h} style={{textAlign:"left",padding:"11px 16px",fontSize:10,fontWeight:700,color:"#94A3B8",letterSpacing:".07em",textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(b=>{const{problems,pending}=countIssues(b);return <tr key={b.id} className="row-hover" onClick={()=>onSelect(b.id)} style={{borderBottom:"1px solid #F1F5F9",transition:"background .1s"}}>
              <td style={{padding:"13px 16px"}}><div style={{fontWeight:600,color:"#1E293B"}}>{b.nome}</div><div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>{b.cpf}</div></td>
              <td style={{padding:"13px 16px",color:"#475569"}}>{b.municipio} <span style={{color:"#CBD5E1"}}>—</span> {b.estado}</td>
              <td style={{padding:"13px 16px",minWidth:120}}><div style={{display:"flex",alignItems:"center",gap:8}}><ProgressBar value={calcProgress(b)}/><span style={{fontSize:11,color:"#64748B",fontWeight:600,whiteSpace:"nowrap"}}>{calcProgress(b)}%</span></div></td>
              <td style={{padding:"13px 16px"}}><div style={{display:"flex",gap:6}}>{problems>0&&<span style={{fontSize:11,color:"#DC2626",background:"#FEE2E2",padding:"2px 8px",borderRadius:20,fontWeight:600}}>{problems} prob.</span>}{pending>0&&<span style={{fontSize:11,color:"#64748B",background:"#F1F5F9",padding:"2px 8px",borderRadius:20,fontWeight:600}}>{pending} pend.</span>}{problems===0&&pending===0&&<span style={{fontSize:11,color:"#16A34A",fontWeight:600}}>✓ OK</span>}</div></td>
              <td style={{padding:"13px 16px"}}><GlobalBadge status={b.status}/></td>
              <td style={{padding:"13px 16px",textAlign:"right"}}><ChevronRight size={16} color="#CBD5E1"/></td>
            </tr>;})}
            {filtered.length===0&&<tr><td colSpan={6} style={{textAlign:"center",padding:40,color:"#94A3B8"}}><Users size={28} style={{margin:"0 auto 8px",display:"block",opacity:.3}}/>Nenhum encontrado</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── CADASTRO ─────────────────────────────────────────────────────────────────
// Mapeamento: campo do doc → campo do formulário
function mapDadosToForm(dados, docId) {
  const map = {};
  if (!dados) return map;
  if (dados.nome_completo) map.nome = dados.nome_completo;
  if (dados.cpf)           map.cpf  = dados.cpf;
  if (dados.data_nascimento) map.dataNascimento = dados.data_nascimento;
  // CadÚnico traz NIS
  if (docId === "cadunico" && dados.numero_documento) map.nis = dados.numero_documento;
  // Certidão civil pode trazer estado civil
  if ((docId === "certidao_civil" || docId === "estado_civil") && dados.numero_documento)
    map.estadoCivil = dados.orgao_emissor || "";
  return map;
}

function Cadastro({onCancel,isMobile,apiKey=""}){
  // ── Campos do formulário ──────────────────────────────────────────────────
  const [campos, setCampos] = useState({
    nome:"", telefone:"", cpf:"", dataNascimento:"",
    estadoCivil:"", temUniaoAtual:"", tipoRenda:"", tipoGleba:"", municipio:"", estado:"PA", renda:""
  });
  const [autoFilled,  setAutoFilled]  = useState([]);
  const [analisando,  setAnalisando]  = useState(null);
  const [docStatus,   setDocStatus]   = useState({});
  const [ultimoResult,setUltimoResult]= useState(null);
  const [scanner,     setScanner]     = useState(null);
  const [salvando,    setSalvando]    = useState(false);

  const setCampo = (k,v) => setCampos(p=>({...p,[k]:v}));

  // ── Lógica condicional baseada no perfil ──────────────────────────────────
  const ec = campos.estadoCivil.toLowerCase();
  const ehCasado     = ec.includes("casad");
  const ehUniao      = ec.includes("união") || ec.includes("uniao");
  const ehViuvo      = ec.includes("viúv")  || ec.includes("viuv");
  const ehDivorciado = ec.includes("divorci");
  const ehSolteiro   = ec.includes("solteir");

  // Viúvo ou divorciado pode ter união estável atual
  const podeUniaoAtual  = ehViuvo || ehDivorciado;
  const temUniaoAtual   = campos.temUniaoAtual === "sim";

  // Precisa de documentos do cônjuge/companheiro se:
  // casado, união estável direta, ou viúvo/divorciado com união atual
  const precisaDocConjuge = ehCasado || ehUniao || temUniaoAtual;

  // Certidão do titular baseada no estado civil original
  const certidaoTitular = !campos.estadoCivil ? "Certidão de Nascimento ou Casamento (selecione o estado civil acima)"
                        : ehViuvo            ? "Certidão de Casamento com Averbação de Óbito"
                        : ehDivorciado       ? "Certidão de Casamento com Averbação de Divórcio"
                        : ehCasado           ? "Certidão de Casamento"
                        : ehUniao            ? "Certidão de Casamento ou Nascimento (União Estável)"
                        : /* solteiro */       "Certidão de Nascimento";

  // Declaração de União Estável (necessária quando não é casado formalmente)
  const precisaDeclUniao = ehUniao || (podeUniaoAtual && temUniaoAtual);

  const tr = campos.tipoRenda;
  const docRendaLabel = tr==="aposentado"     ? "Extrato do CNIS (aposentadoria)"
                      : tr==="caf"            ? "CAF — Cadastro Agricultor Familiar"
                      : tr==="carteira"       ? "CTPS — Carteira de Trabalho (carteira assinada)"
                      : tr==="contratado"     ? "Holerite / Contracheque (3 últimos)"
                      :                        null;

  // ── Seções de documentos geradas dinamicamente ────────────────────────────
  // CPF já capturado pelo RG/CNH — dispensa documento CPF separado
  const cpfViaRG = !!campos.cpf && !!docStatus["rg_titular"];

  const secoes = [
    {
      id:"titular", emoji:"🪪", label:"Documentação Pessoal — Titular",
      docs:[
        {id:"rg_titular",  label:"RG ou CNH (legível, com foto)", obrig:true,  tipo:"imagem"},
        {id:"cpf_titular", label:"CPF", obrig:true, tipo:"simples",
          dispensado: cpfViaRG,
          notaDispensa:"CPF já extraído do RG/CNH — documento separado dispensado"},
        {id:"certidao", label:certidaoTitular, obrig:true,
          tipo: !campos.estadoCivil ? "info_select" : "imagem",
          nota: !campos.estadoCivil ? "Selecione o estado civil para identificar a certidão correta" : null},
        {id:"cadunico",    label:"Folha Resumo do CadÚnico (atualizada)", obrig:true, tipo:"simples"},
      ]
    },
    {
      id:"renda", emoji:"💰", label:"Comprovante de Renda",
      docs: docRendaLabel
        ? [{id:"doc_renda", label:docRendaLabel, obrig:true, tipo:"imagem"}]
        : [{id:"doc_renda_placeholder", label:"Selecione o tipo de renda acima para ver o documento necessário", obrig:false, tipo:"info"}]
    },
    {
      id:"endereco", emoji:"🏠", label:"Comprovante de Endereço",
      docs:[
        {id:"comprovante_end", label:"Conta de Água ou Energia Elétrica", obrig:true, tipo:"simples"}
      ]
    },
    ...(precisaDocConjuge ? [{
      id:"conjuge", emoji:"💑", label:`Documentação Pessoal — ${ehCasado||ehUniao?"Cônjuge":"Companheiro(a) — União Atual"}`,
      docs:[
        {id:"rg_conjuge",      label:"RG ou CNH do Cônjuge (legível)",               obrig:true, tipo:"imagem"},
        {id:"cpf_conjuge",     label:"CPF do Cônjuge",                                obrig:true, tipo:"simples"},
        {id:"certidao_conjuge",label: ehViuvo      ? "Certidão de Casamento com Averbação de Óbito (cônjuge/companheiro)"
                                     : ehDivorciado ? "Certidão de Casamento com Averbação de Divórcio (cônjuge/companheiro)"
                                     :                "Certidão de Casamento",        obrig:true, tipo:"imagem"},
        ...(precisaDeclUniao ? [{id:"decl_uniao_estavel", label:"Declaração de União Estável (assinada por ambos + 2 testemunhas)", obrig:true, tipo:"imagem"}] : []),,
      ]
    }] : []),
    {
      id:"terra", emoji:"🌾", label:"Documento da Terra",
      nota:"O documento não precisa estar no nome do beneficiário",
      docs: (() => {
        const tg = campos.tipoGleba;
        if(!tg) return [{id:"terra_placeholder", tipo:"info", label:"Selecione o tipo de situação da gleba acima para ver os documentos necessários", obrig:false}];
        const map = {
          proprietario: [
            {id:"matricula",  label:"Matrícula do Imóvel (emitida há no máx. 60 dias)", obrig:true,  tipo:"imagem"},
            {id:"ccir",       label:"CCIR — Certificado de Cadastro de Imóvel Rural",    obrig:true,  tipo:"simples"},
            {id:"car",        label:"CAR — Cadastro Ambiental Rural",                    obrig:true,  tipo:"simples"},
            {id:"itr",        label:"ITR — Declaração de ITR vigente",                   obrig:true,  tipo:"imagem"},
          ],
          arrendatario: [
            {id:"contrato_arr",label:"Contrato de Arrendamento registrado",              obrig:true,  tipo:"imagem"},
            {id:"mo30197",    label:"MO30197 — Autodeclaração do Beneficiário (Gleba) + assinatura EO", obrig:true, tipo:"mo"},
            {id:"ccir",       label:"CCIR — Certificado de Cadastro de Imóvel Rural",    obrig:true,  tipo:"simples"},
          ],
          posseiro: [
            {id:"certidao_rgi", label:"Certidão do RGI (que o bem não é público)", obrig:true, tipo:"imagem"},
            {id:"mo30421",    label:"MO30421 — Declaração do Posseiro", obrig:true, tipo:"posterior",
             nota:"Preenchido presencialmente com beneficiário + 2 testemunhas sem vínculo familiar. Não é necessário agora."},
            {id:"mo30197",    label:"MO30197 — Autodeclaração do Beneficiário (Gleba)", obrig:true, tipo:"posterior",
             nota:"Preenchido e assinado pela EO em etapa posterior."},
          ],
          terra_publica: [
            {id:"mo30150",    label:"MO30150 — Autodeclaração de Ocupação (Terra Pública) + coord. geográfica + assinatura EO", obrig:true, tipo:"mo"},
            {id:"certidao_rgi",label:"Certidão do RGI — que o bem é público",            obrig:true,  tipo:"imagem"},
            {id:"mo30422",    label:"MO30422 — Declaração do Ente Público (não oposição)", obrig:true, tipo:"mo"},
          ],
          terra_particular_suc: [
            {id:"mo30149",    label:"MO30149 — Autodeclaração de Ocupação (Direitos Sucessórios) + coord. geográfica + assinatura EO", obrig:true, tipo:"mo"},
            {id:"certidao_rgi",label:"Certidão do RGI",                                  obrig:true,  tipo:"imagem"},
          ],
          assentado: [
            {id:"mo30814",    label:"MO30814 — Declaração de Ocupação em Assentamento + coord. geográfica + assinatura EO", obrig:true, tipo:"mo"},
            {id:"relacao_incra",label:"Relação INCRA com identificação do assentado",    obrig:true,  tipo:"simples"},
            {id:"ccir",        label:"CCIR do lote (se houver)",                          obrig:false, tipo:"simples"},
          ],
          indigena: [
            {id:"mo30813",    label:"MO30813 — Declaração de Ocupação em Comunidade Indígena + coord. geográfica + assinatura EO", obrig:true, tipo:"mo"},
            {id:"doc_funai",  label:"Documentação FUNAI / Certidão de registro indígena",obrig:true,  tipo:"imagem"},
          ],
          quilombola: [
            {id:"certidao_palmares",label:"Certidão de Autodeclaração Quilombola (Palmares)", obrig:true, tipo:"imagem"},
            {id:"mo30422",    label:"MO30422 — Declaração do Ente Público (não oposição)", obrig:true, tipo:"mo"},
            {id:"mo30150",    label:"MO30150 — Autodeclaração de Ocupação + assinatura EO", obrig:true, tipo:"mo"},
          ],
        };
        return map[tg] || [{id:"terra_placeholder", tipo:"info", label:"Tipo de gleba não reconhecido", obrig:false}];
      })()
    },
  ];

  // ── Vision: analisa e auto-preenche ───────────────────────────────────────
  const handleDocUpload = async (docId, docLabel, file) => {
    if(!file) return;
    const maxMB=20;
    if(file.size > maxMB*1024*1024){
      setUltimoResult({docLabel,fileName:file.name,status:"erro",resumo:`Arquivo muito grande (${(file.size/1024/1024).toFixed(1)}MB). Máximo: ${maxMB}MB.`});
      return;
    }
    setAnalisando(docId);
    setDocStatus(p=>({...p,[docId]:"analisando"}));
    setUltimoResult(null);
    try{
      const result = await analyzeDocument(file, docLabel, apiKey);
      setUltimoResult({...result,docLabel,fileName:file.name});
      setDocStatus(p=>({...p,[docId]:result.status||"ok"}));
      if(!result._demo){
        const mapa = mapDadosToForm(result.dados||{},docId);
        const novos=[];
        setCampos(prev=>{
          const next={...prev};
          Object.entries(mapa).forEach(([k,v])=>{
            const val=String(v||"").trim();
            if(val&&val!=="null"&&!prev[k]){next[k]=val;novos.push(k);}
          });
          return next;
        });
        if(novos.length>0) setAutoFilled(p=>[...new Set([...p,...novos])]);
      }
    }catch(e){
      setDocStatus(p=>({...p,[docId]:"erro"}));
      setUltimoResult({docLabel,fileName:file.name,status:"erro",resumo:e.message||"Erro ao analisar."});
    }finally{setAnalisando(null);}
  };

  const handleScanCapture=(docId,docLabel,file)=>{setScanner(null);handleDocUpload(docId,docLabel,file);};

  // Docs obrigatórios para salvar: nome + cpf (campo) + rg/cnh enviado
  const podesSalvar = !!campos.nome && !!campos.cpf && !!docStatus["rg_titular"];

  // Conta demais pendências (para alerta, não bloqueio)
  const docsPendentes = secoes.flatMap(s=>s.docs).filter(d=>{
    if(!d.obrig || d.tipo==="info" || d.tipo==="posterior") return false;
    if(d.id==="cpf_titular" && cpfViaRG) return false; // CPF dispensado se extraído do RG
    return !docStatus[d.id];
  }).length;

  const handleSalvar=()=>{
    if(!campos.nome){alert("Nome Completo é obrigatório.");return;}
    if(!campos.cpf){alert("CPF é obrigatório. Preencha manualmente ou envie o RG/CNH para extração automática.");return;}
    if(!docStatus["rg_titular"]){alert("RG ou CNH do titular é obrigatório.");return;}
    setSalvando(true);
    setTimeout(()=>{setSalvando(false);onCancel();},1200);
  };

  // ── Status icon ───────────────────────────────────────────────────────────
  const docIcon=(id)=>{
    const s=docStatus[id];
    if(s==="analisando") return <Loader size={13} color="#3B82F6" className="spinning"/>;
    if(s==="ok")         return <CheckCircle size={13} color="#16A34A"/>;
    if(s==="rasura"||s==="ilegivel") return <AlertTriangle size={13} color="#EA580C"/>;
    if(s==="vencido")    return <Clock size={13} color="#D97706"/>;
    if(s==="erro")       return <AlertCircle size={13} color="#DC2626"/>;
    return null;
  };

  // ── Renderiza card de documento ──────────────────────────────────────────
  const renderDoc=(doc)=>{
    if(doc.tipo==="info_select") return(
      <div key={doc.id} style={{padding:"12px 14px",background:"#F8FAFC",borderRadius:11,border:"1px dashed #CBD5E1",display:"flex",alignItems:"center",gap:10}}>
        <AlertCircle size={16} color="#94A3B8" style={{flexShrink:0}}/>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:"#64748B"}}>Certidão de Estado Civil</div>
          <div style={{fontSize:11,color:"#94A3B8",marginTop:2}}>{doc.nota}</div>
          <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:5}}>
            {["Nascimento","Casamento","Casamento c/ Averbação de Divórcio","Casamento c/ Averbação de Óbito"].map(op=>(
              <span key={op} style={{fontSize:10,background:"#E2E8F0",color:"#64748B",padding:"2px 8px",borderRadius:10}}>{op}</span>
            ))}
          </div>
        </div>
      </div>
    );
    if(doc.tipo==="info") return(
      <div key={doc.id} style={{padding:"11px 13px",background:"#F8FAFC",borderRadius:9,border:"1px dashed #E2E8F0",fontSize:12,color:"#94A3B8",textAlign:"center"}}>
        {doc.label}
      </div>
    );
    if(doc.dispensado) return(
      <div key={doc.id} style={{padding:"10px 13px",background:"#F0FDF4",borderRadius:11,border:"1px solid #86EFAC",display:"flex",alignItems:"center",gap:10}}>
        <CheckCircle size={16} color="#16A34A" style={{flexShrink:0}}/>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:"#15803D"}}>{doc.label}</div>
          <div style={{fontSize:11,color:"#166534",marginTop:2}}>{doc.notaDispensa}</div>
        </div>
      </div>
    );
    if(doc.tipo==="posterior") return(
      <div key={doc.id} style={{padding:"12px 14px",background:"#FFFBEB",borderRadius:11,border:"1px solid #FCD34D",display:"flex",gap:10,alignItems:"flex-start"}}>
        <span style={{fontSize:18,flexShrink:0}}>📋</span>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:700,color:"#92400E"}}>{doc.label}</div>
          <div style={{fontSize:11,color:"#78350F",marginTop:3,lineHeight:1.5}}>{doc.nota}</div>
          <div style={{fontSize:10,background:"#FEF3C7",color:"#B45309",padding:"2px 8px",borderRadius:10,fontWeight:700,display:"inline-block",marginTop:5}}>⏳ Preenchimento posterior</div>
        </div>
      </div>
    );
    const isLoading=analisando===doc.id;
    const status=docStatus[doc.id];
    return(
      <div key={doc.id} style={{background:status==="ok"?"#F0FDF4":status&&status!=="analisando"?"#FFF8F0":"#F8FAFC",borderRadius:11,padding:"11px 13px",border:`1px solid ${status==="ok"?"#86EFAC":status&&status!=="analisando"?"#FCD34D":"#E8EDF4"}`,transition:"all .2s"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          {docIcon(doc.id)}
          <span style={{fontSize:12,color:"#475569",flex:1,fontWeight:500,lineHeight:1.4}}>{doc.label}</span>
          {doc.obrig
            ?<span style={{fontSize:10,color:"#DC2626",background:"#FEE2E2",padding:"1px 7px",borderRadius:10,fontWeight:600,flexShrink:0}}>Obrigatório</span>
            :<span style={{fontSize:10,color:"#94A3B8",background:"#E2E8F0",padding:"1px 7px",borderRadius:10,fontWeight:600,flexShrink:0}}>Opcional</span>
          }
        </div>
        {isLoading
          ?<div className="pulse" style={{textAlign:"center",padding:"10px",fontSize:12,color:"#3B82F6",fontWeight:600}}>
             <Loader size={14} className="spinning" style={{display:"inline",marginRight:6}}/>Analisando…
           </div>
          :<div style={{display:"flex",gap:8}}>
             <button onClick={()=>setScanner({docId:doc.id,docLabel:doc.label})}
               style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px",background:"linear-gradient(135deg,#003F87,#0056B8)",borderRadius:9,cursor:"pointer",fontSize:11,fontWeight:700,color:"#FFF",border:"none",fontFamily:"inherit"}}>
               <ScanLine size={14}/> Digitalizar
             </button>
             <label style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"10px",background:"#FFF",border:"1px solid #E2E8F0",borderRadius:9,cursor:"pointer",fontSize:11,fontWeight:600,color:"#475569"}}>
               <Upload size={14}/> Arquivo
               <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}} onChange={e=>handleDocUpload(doc.id,doc.label,e.target.files[0])}/>
             </label>
           </div>
        }
      </div>
    );
  };

  const P=isMobile?"16px":"24px";

  return(
    <div style={{padding:P,paddingBottom:isMobile?"100px":P,display:"flex",flexDirection:"column",gap:16,maxWidth:760}}>
      {scanner&&<DocumentScanner docLabel={scanner.docLabel}
        onCapture={file=>handleScanCapture(scanner.docId,scanner.docLabel,file)}
        onClose={()=>setScanner(null)}/>}

      {/* Toast resultado Vision */}
      {ultimoResult&&(
        <div className="fade-in" style={{background:ultimoResult.status==="erro"?"#FEF2F2":ultimoResult._demo?"#FFF7ED":"#DCFCE7",border:`1px solid ${ultimoResult.status==="erro"?"#FCA5A5":ultimoResult._demo?"#FCD34D":"#86EFAC"}`,borderRadius:12,padding:"11px 14px",display:"flex",alignItems:"flex-start",gap:10}}>
          {ultimoResult.status==="erro"?<AlertCircle size={16} color="#DC2626" style={{flexShrink:0,marginTop:1}}/>:ultimoResult._demo?<Zap size={16} color="#D97706" style={{flexShrink:0,marginTop:1}}/>:<Sparkles size={16} color="#16A34A" style={{flexShrink:0,marginTop:1}}/>}
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:12,color:ultimoResult.status==="erro"?"#DC2626":ultimoResult._demo?"#92400E":"#15803D",display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
              {ultimoResult.status==="erro"?`❌ ${ultimoResult.docLabel}`:ultimoResult._demo?<>{`✅ ${ultimoResult.docLabel}`}<span style={{fontSize:9,background:"#FEF3C7",color:"#B45309",padding:"1px 6px",borderRadius:10,fontWeight:700,border:"1px solid #FCD34D"}}>MODO DEMO</span></>:`✅ ${ultimoResult.docLabel} — ${autoFilled.length} campo(s) preenchido(s)`}
            </div>
            <div style={{fontSize:11,color:ultimoResult.status==="erro"?"#991B1B":ultimoResult._demo?"#78350F":"#166534",marginTop:1}}>{ultimoResult._demo?"Análise simulada — análise real com IA disponível com API Key.":ultimoResult.resumo}</div>
            {ultimoResult.fileName&&<div style={{fontSize:10,color:"#94A3B8",marginTop:2}}>📎 {ultimoResult.fileName}</div>}
          </div>
          <button onClick={()=>setUltimoResult(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",padding:4,flexShrink:0}}><X size={14}/></button>
        </div>
      )}

      {/* ── FORMULÁRIO BÁSICO ─────────────────────────────────────────────── */}
      <div style={{background:"#FFF",borderRadius:14,padding:isMobile?"16px":"22px",border:"1px solid #E2E8F0"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
          <User size={16} color={CAIXA_BLUE}/>
          <span style={{fontWeight:700,fontSize:14,color:"#1E293B"}}>Identificação Básica</span>
          {autoFilled.length>0&&<span style={{fontSize:10,background:"#DCFCE7",color:"#15803D",padding:"2px 8px",borderRadius:20,fontWeight:700,marginLeft:"auto"}}><Sparkles size={10} style={{display:"inline",marginRight:3}}/>IA preencheu {autoFilled.length} campo(s)</span>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}>
          {/* Nome */}
          <div style={{gridColumn:!isMobile?"span 2":"span 1"}}>
            <label style={{fontSize:11,fontWeight:600,color:autoFilled.includes("nome")?"#15803D":"#64748B",display:"flex",alignItems:"center",gap:5,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>
              Nome Completo *{autoFilled.includes("nome")&&<span style={{fontSize:9,background:"#DCFCE7",color:"#15803D",padding:"1px 5px",borderRadius:8,fontWeight:700}}>✦ IA</span>}
            </label>
            <input value={campos.nome} onChange={e=>setCampo("nome",e.target.value)} placeholder="Exatamente como nos documentos"
              style={{width:"100%",padding:"11px 12px",border:`1px solid ${autoFilled.includes("nome")?"#86EFAC":"#E2E8F0"}`,borderRadius:10,fontSize:14,fontFamily:"inherit",color:"#1E293B",background:autoFilled.includes("nome")?"#F0FDF4":"#FAFAFA",outline:"none"}}/>
          </div>
          {/* Telefone */}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:"#64748B",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>Telefone / WhatsApp</label>
            <input value={campos.telefone} onChange={e=>setCampo("telefone",e.target.value)} placeholder="(00) 00000-0000"
              style={{width:"100%",padding:"11px 12px",border:"1px solid #E2E8F0",borderRadius:10,fontSize:14,fontFamily:"inherit",color:"#1E293B",background:"#FAFAFA",outline:"none"}}/>
          </div>
          {/* CPF */}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:autoFilled.includes("cpf")?"#15803D":"#64748B",display:"flex",alignItems:"center",gap:5,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>
              CPF *{autoFilled.includes("cpf")&&<span style={{fontSize:9,background:"#DCFCE7",color:"#15803D",padding:"1px 5px",borderRadius:8,fontWeight:700}}>✦ IA</span>}
            </label>
            <input value={campos.cpf} onChange={e=>setCampo("cpf",e.target.value)} placeholder="000.000.000-00"
              style={{width:"100%",padding:"11px 12px",border:`1px solid ${autoFilled.includes("cpf")?"#86EFAC":"#E2E8F0"}`,borderRadius:10,fontSize:14,fontFamily:"inherit",color:"#1E293B",background:autoFilled.includes("cpf")?"#F0FDF4":"#FAFAFA",outline:"none"}}/>
          </div>
          {/* Data Nasc */}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:autoFilled.includes("dataNascimento")?"#15803D":"#64748B",display:"flex",alignItems:"center",gap:5,marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>
              Data de Nascimento{autoFilled.includes("dataNascimento")&&<span style={{fontSize:9,background:"#DCFCE7",color:"#15803D",padding:"1px 5px",borderRadius:8,fontWeight:700}}>✦ IA</span>}
            </label>
            <input value={campos.dataNascimento} onChange={e=>setCampo("dataNascimento",e.target.value)} placeholder="DD/MM/AAAA"
              style={{width:"100%",padding:"11px 12px",border:`1px solid ${autoFilled.includes("dataNascimento")?"#86EFAC":"#E2E8F0"}`,borderRadius:10,fontSize:14,fontFamily:"inherit",color:"#1E293B",background:autoFilled.includes("dataNascimento")?"#F0FDF4":"#FAFAFA",outline:"none"}}/>
          </div>
          {/* Estado Civil — controla docs condicionais */}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:"#64748B",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>Estado Civil *</label>
            <select value={campos.estadoCivil} onChange={e=>setCampo("estadoCivil",e.target.value)}
              style={{width:"100%",padding:"11px 12px",border:"1px solid #E2E8F0",borderRadius:10,fontSize:13,fontFamily:"inherit",color:campos.estadoCivil?"#1E293B":"#94A3B8",background:"#FAFAFA",outline:"none"}}>
              <option value="">Selecione…</option>
              <option>Solteiro(a)</option>
              <option>Casado(a)</option>
              <option>União Estável</option>
              <option>Divorciado(a)</option>
              <option>Viúvo(a)</option>
            </select>
            {precisaDocConjuge&&<div style={{fontSize:10,color:"#0369A1",marginTop:4,background:"#E0F2FE",padding:"3px 8px",borderRadius:6}}>📎 Documentação do cônjuge/companheiro será solicitada abaixo</div>}
            {podeUniaoAtual&&!precisaDocConjuge&&(
              <div style={{marginTop:6,background:"#FEF3C7",borderRadius:7,padding:"6px 10px",fontSize:11,color:"#92400E"}}>
                ⚠️ {campos.estadoCivil} — possui união estável atual?
              </div>
            )}
          </div>
          {/* Campo condicional: viúvo/divorciado com união atual? */}
          {podeUniaoAtual&&(
            <div>
              <label style={{fontSize:11,fontWeight:600,color:"#64748B",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>
                Possui União Estável Atualmente? *
              </label>
              <div style={{display:"flex",gap:8}}>
                {["sim","nao"].map(v=>(
                  <label key={v} style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:campos.temUniaoAtual===v?"#EFF6FF":"#FAFAFA",border:`1px solid ${campos.temUniaoAtual===v?"#BFDBFE":"#E2E8F0"}`,borderRadius:9,cursor:"pointer",fontSize:13,color:"#1E293B",fontWeight:campos.temUniaoAtual===v?700:400}}>
                    <input type="radio" name="uniaoAtual" value={v} checked={campos.temUniaoAtual===v} onChange={()=>setCampo("temUniaoAtual",v)} style={{accentColor:CAIXA_BLUE}}/>
                    {v==="sim"?"Sim, tem companheiro(a)":"Não"}
                  </label>
                ))}
              </div>
              {temUniaoAtual&&<div style={{fontSize:10,color:"#0369A1",marginTop:5,background:"#E0F2FE",padding:"3px 8px",borderRadius:6}}>📎 Documentação do companheiro(a) será solicitada abaixo</div>}
            </div>
          )}
          {/* Tipo de renda — controla qual comprovante */}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:"#64748B",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>Tipo de Renda *</label>
            <select value={campos.tipoRenda} onChange={e=>setCampo("tipoRenda",e.target.value)}
              style={{width:"100%",padding:"11px 12px",border:"1px solid #E2E8F0",borderRadius:10,fontSize:13,fontFamily:"inherit",color:campos.tipoRenda?"#1E293B":"#94A3B8",background:"#FAFAFA",outline:"none"}}>
              <option value="">Selecione…</option>
              <option value="aposentado">Aposentado(a) / Pensionista</option>
              <option value="caf">Agricultor Familiar — tem CAF</option>
              <option value="carteira">Carteira Assinada (CLT)</option>
              <option value="contratado">Contratado (holerite/contracheque)</option>
              <option value="informal">Trabalhador Informal / Sem renda formal</option>
            </select>
          </div>
          {/* Município */}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:"#64748B",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>Município</label>
            <input value={campos.municipio} onChange={e=>setCampo("municipio",e.target.value)} placeholder="Cidade"
              style={{width:"100%",padding:"11px 12px",border:"1px solid #E2E8F0",borderRadius:10,fontSize:14,fontFamily:"inherit",color:"#1E293B",background:"#FAFAFA",outline:"none"}}/>
          </div>
          <div>
            <label style={{fontSize:11,fontWeight:600,color:"#64748B",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>Renda Familiar Anual</label>
            <input value={campos.renda} onChange={e=>setCampo("renda",e.target.value)} placeholder="R$ 0,00"
              style={{width:"100%",padding:"11px 12px",border:"1px solid #E2E8F0",borderRadius:10,fontSize:14,fontFamily:"inherit",color:"#1E293B",background:"#FAFAFA",outline:"none"}}/>
          </div>
          {/* Situação da Gleba — define documentos da terra */}
          <div style={{gridColumn:!isMobile?"span 2":"span 1"}}>
            <label style={{fontSize:11,fontWeight:600,color:"#64748B",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>
              Situação da Gleba / Documento da Terra *
            </label>
            <select value={campos.tipoGleba} onChange={e=>setCampo("tipoGleba",e.target.value)}
              style={{width:"100%",padding:"11px 12px",border:"1px solid #E2E8F0",borderRadius:10,fontSize:13,fontFamily:"inherit",color:campos.tipoGleba?"#1E293B":"#94A3B8",background:"#FAFAFA",outline:"none"}}>
              <option value="">Selecione a situação da gleba…</option>
              <optgroup label="── Domínio (proprietário)">
                <option value="proprietario">Proprietário — tem matrícula no RGI</option>
                <option value="arrendatario">Arrendatário — tem contrato de arrendamento</option>
              </optgroup>
              <optgroup label="── Posse (sem título formal)">
                <option value="posseiro">Posseiro de boa-fé (≥ 5 anos, sem direitos sucessórios)</option>
                <option value="terra_publica">Ocupante de Terra Pública</option>
                <option value="terra_particular_suc">Ocupante de Terra Particular (direitos sucessórios)</option>
              </optgroup>
              <optgroup label="── Situações especiais">
                <option value="assentado">Assentado de Reforma Agrária (INCRA)</option>
                <option value="indigena">Comunidade Indígena (aldeia)</option>
                <option value="quilombola">Comunidade Quilombola</option>
              </optgroup>
            </select>
            {campos.tipoGleba&&(
              <div style={{fontSize:10,color:"#0369A1",marginTop:4,background:"#E0F2FE",padding:"4px 8px",borderRadius:6,display:"flex",gap:5}}>
                <span>📋</span>
                <span>{{
                  proprietario:"Matrícula + CCIR + CAR + ITR",
                  arrendatario:"Contrato de Arrendamento + MO30197 + CCIR",
                  posseiro:"MO30421 (2 testemunhas) + Certidão RGI + MO30197",
                  terra_publica:"MO30150 + Certidão RGI + MO30422",
                  terra_particular_suc:"MO30149 + Certidão RGI",
                  assentado:"MO30814 + Relação INCRA",
                  indigena:"MO30813 + Documentação FUNAI",
                  quilombola:"Certidão Palmares + MO30422 + MO30150",
                }[campos.tipoGleba]||""}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dica Vision */}
      <div style={{background:"linear-gradient(135deg,#003F87,#0056B8)",borderRadius:14,padding:"14px 18px",display:"flex",flexDirection:"column",gap:6}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <ScanLine size={20} color="#FFF" style={{flexShrink:0}}/>
          <div style={{fontWeight:700,fontSize:13,color:"#FFF"}}>📷 Upload de documento → preenche o formulário automaticamente</div>
        </div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",paddingLeft:30}}>
          Envie RG ou CNH do titular — a IA extrai nome, CPF e data de nascimento.
          {!apiKey&&<span style={{color:"#FCD34D"}}> Configure a API Key no botão ⚡ para análise real.</span>}
        </div>
      </div>

      {/* ── DOCUMENTOS FIXOS — sempre aparecem ──────────────────────────── */}
      {secoes.filter(s=>s.id==="titular").map(secao=>(
        <div key={secao.id} style={{background:"#FFF",borderRadius:14,border:"1px solid #E2E8F0",overflow:"hidden"}}>
          <div style={{padding:"11px 16px",background:"#F8FAFC",borderBottom:"1px solid #E2E8F0",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>{secao.emoji}</span>
            <span style={{fontWeight:700,fontSize:13,color:"#1E293B"}}>{secao.label}</span>
          </div>
          <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
            {secao.docs.map(doc=>renderDoc(doc,secao.id))}
          </div>
        </div>
      ))}

      {/* ── DOCUMENTOS CONDICIONAIS — dependem do estado civil ───────────── */}
      {campos.estadoCivil
        ? secoes.filter(s=>s.id!=="titular").map(secao=>(
            <div key={secao.id} style={{background:"#FFF",borderRadius:14,border:"1px solid #E2E8F0",overflow:"hidden"}}>
              <div style={{padding:"11px 16px",background:secao.id==="conjuge"?"#EFF6FF":secao.id==="terra"?"#FFF7ED":"#F8FAFC",borderBottom:"1px solid #E2E8F0",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>{secao.emoji}</span>
                <span style={{fontWeight:700,fontSize:13,color:"#1E293B"}}>{secao.label}</span>
                {secao.nota&&<span style={{fontSize:10,color:"#64748B",marginLeft:"auto"}}>ℹ️ {secao.nota}</span>}
              </div>
              <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
                {secao.docs.map(doc=>renderDoc(doc))}
              </div>
            </div>
          ))
        : (
            <div style={{background:"#FFF",borderRadius:14,border:"1px solid #E2E8F0",padding:"24px 20px",textAlign:"center",color:"#94A3B8"}}>
              <FileText size={28} style={{margin:"0 auto 10px",display:"block",opacity:.3}}/>
              <div style={{fontWeight:600,fontSize:13}}>Selecione o estado civil para ver os demais documentos</div>
              <div style={{fontSize:11,marginTop:4}}>Certidão civil, cônjuge, renda e outros documentos aparecerão aqui</div>
            </div>
          )
      }

      {/* Bloqueio — mínimo necessário para salvar */}
      {!podesSalvar&&(
        <div style={{background:"#FEF2F2",borderRadius:12,padding:"11px 14px",border:"1px solid #FECACA",display:"flex",alignItems:"flex-start",gap:10}}>
          <AlertCircle size={16} color="#DC2626" style={{flexShrink:0,marginTop:1}}/>
          <div>
            <div style={{fontWeight:700,fontSize:12,color:"#DC2626"}}>Obrigatório para salvar</div>
            <div style={{fontSize:11,color:"#991B1B",marginTop:3,display:"flex",flexDirection:"column",gap:3}}>
              {!campos.nome&&<span>• Nome Completo</span>}
              {!campos.cpf&&<span>• CPF (preencha manualmente ou envie o RG/CNH para extração automática)</span>}
              {!docStatus["rg_titular"]&&<span>• RG ou CNH do titular (enviar arquivo ou digitalizar)</span>}
            </div>
          </div>
        </div>
      )}
      {/* Alerta de pendências — avisa mas não bloqueia */}
      {podesSalvar&&docsPendentes>0&&(
        <div style={{background:"#FEF3C7",borderRadius:12,padding:"11px 14px",border:"1px solid #FCD34D",display:"flex",alignItems:"center",gap:10}}>
          <AlertTriangle size={16} color="#D97706" style={{flexShrink:0}}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:12,color:"#92400E"}}>{docsPendentes} documento(s) ainda não enviado(s)</div>
            <div style={{fontSize:11,color:"#78350F",marginTop:1}}>O cadastro pode ser salvo com pendências. Envie os documentos antes de encaminhar ao agente financeiro.</div>
          </div>
        </div>
      )}

      {/* Ações */}
      <div style={{display:"flex",gap:10}}>
        <button onClick={onCancel} style={{flex:1,padding:13,border:"1px solid #E2E8F0",borderRadius:12,fontSize:13,fontWeight:600,fontFamily:"inherit",background:"#FFF",color:"#64748B",cursor:"pointer"}}>Cancelar</button>
        <button onClick={handleSalvar} disabled={salvando}
          style={{flex:2,padding:13,background:salvando?"#94A3B8":!podesSalvar?"#94A3B8":CAIXA_BLUE,border:"none",borderRadius:12,fontSize:13,fontWeight:700,fontFamily:"inherit",color:"#FFF",cursor:salvando||!podesSalvar?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {salvando?<><Loader size={14} className="spinning"/>Salvando…</>:<>
            <CheckCircle size={14}/>
            {!podesSalvar
              ? "Preencha Nome, CPF e RG/CNH"
              : docsPendentes>0
                ? `Salvar com ${docsPendentes} pendência(s)`
                : "Salvar Cadastro ✓"}
          </>}
        </button>
      </div>
    </div>
  );
}


// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
// ─── USUÁRIOS E PERMISSÕES ────────────────────────────────────────────────────
// ─── ENTIDADES ORGANIZADORAS (Multi-tenant) ────────────────────────────────────
// ─── SUPER ADMIN ──────────────────────────────────────────────────────────────
// ─── SUPER ADMIN — NÍVEIS DE ACESSO ──────────────────────────────────────────
const ADMIN_PERFIS = {
  master:   { label:"Master",   emoji:"⚡", cor:"#6366F1", light:"#EDE9FE", fg:"#6D28D9",
    pode:["tudo"] },
  gerente:  { label:"Gerente",  emoji:"📊", cor:"#0369A1", light:"#E0F2FE", fg:"#0284C7",
    pode:["ver_eos","ver_beneficiarios","ver_relatorios","ver_formulario"] },
  operador: { label:"Operador", emoji:"👁️", cor:"#059669", light:"#DCFCE7", fg:"#15803D",
    pode:["ver_beneficiarios"] },
};

const ADMIN_USUARIOS = [
  { id:"a1", nome:"Administrador Master",  codigo:"ADMIN-MCMVR-2025", senha:"master@2025",  perfil:"master"  },
  { id:"a2", nome:"Gerente Regional",      codigo:"GER-MCMVR-2025",   senha:"gerente@2025", perfil:"gerente" },
  { id:"a3", nome:"Operador de Dados",     codigo:"OP-MCMVR-2025",    senha:"oper@2025",    perfil:"operador"},
];

function podAdmin(adminUser, acao){
  if(!adminUser) return false;
  const cfg = ADMIN_PERFIS[adminUser.perfil];
  return cfg?.pode.includes("tudo") || cfg?.pode.includes(acao) || false;
}



// ─── QUESTIONÁRIO ETAPA 2 (básico — versão definitiva vem amanhã) ─────────────
// Perguntas base (aparecem para todos os tipos de beneficiário)
const PERGUNTAS_BASE = [
  { id:"p01", grupo:"Intervenção",    tipo:"opcao", obrig:true,
    texto:"Tipo de intervenção prevista",
    opcoes:["Produção de Unidade Habitacional","Melhoria de Unidade Habitacional"] },
  { id:"p02", grupo:"Intervenção",    tipo:"opcao", obrig:true,
    texto:"Regime de construção",
    opcoes:["Mutirão Assistido","Empreitada Global","Administração Direta"] },
  { id:"p03", grupo:"Moradia",        tipo:"numero", obrig:true,
    texto:"Número de cômodos existentes na habitação atual",
    placeholder:"Ex: 3" },
  { id:"p04", grupo:"Moradia",        tipo:"numero", obrig:true,
    texto:"Número de pessoas residentes na habitação",
    placeholder:"Ex: 4" },
  { id:"p05", grupo:"Infraestrutura", tipo:"opcao", obrig:true,
    texto:"Acesso a energia elétrica",
    opcoes:["Sim — rede concessionária","Sim — solar/gerador","Não possui"] },
  { id:"p06", grupo:"Infraestrutura", tipo:"opcao", obrig:true,
    texto:"Abastecimento de água",
    opcoes:["Rede pública","Poço artesiano","Cisternas","Rio/nascente","Não possui"] },
  { id:"p07", grupo:"Infraestrutura", tipo:"opcao", obrig:true,
    texto:"Solução de esgotamento sanitário",
    opcoes:["Rede pública","Fossa séptica","Fossa rudimentar","A céu aberto"] },
  { id:"p08", grupo:"Gleba",          tipo:"numero", obrig:true,
    texto:"Área total da gleba (hectares)",
    placeholder:"Ex: 12.5" },
  { id:"p09", grupo:"Gleba",          tipo:"opcao", obrig:true,
    texto:"A gleba possui acesso por estrada/caminho",
    opcoes:["Sim — estrada pavimentada","Sim — estrada de terra","Acesso somente por rio","Não possui acesso formal"] },
  { id:"p10", grupo:"Contrapartida",  tipo:"opcao", obrig:true,
    texto:"Haverá contrapartida financeira da EO ou beneficiário",
    opcoes:["Sim","Não"] },
];

// Perguntas adicionais por tipo de beneficiário
const PERGUNTAS_POR_TIPO = {
  posseiro: [
    { id:"pp01", grupo:"Posse", tipo:"numero", obrig:true,
      texto:"Há quantos anos o beneficiário ocupa a área",
      placeholder:"Ex: 8" },
    { id:"pp02", grupo:"Posse", tipo:"texto", obrig:true,
      texto:"Nome e contato da Testemunha 1 (sem vínculo familiar)",
      placeholder:"Nome completo — telefone" },
    { id:"pp03", grupo:"Posse", tipo:"texto", obrig:true,
      texto:"Nome e contato da Testemunha 2 (sem vínculo familiar)",
      placeholder:"Nome completo — telefone" },
  ],
  assentado: [
    { id:"pa01", grupo:"Assentamento", tipo:"texto", obrig:true,
      texto:"Nome do assentamento",
      placeholder:"Ex: Assentamento Belo Horizonte" },
    { id:"pa02", grupo:"Assentamento", tipo:"texto", obrig:true,
      texto:"Número do lote INCRA",
      placeholder:"Ex: Lote 42-A" },
    { id:"pa03", grupo:"Assentamento", tipo:"opcao", obrig:true,
      texto:"Possui título definitivo do INCRA",
      opcoes:["Sim","Não — apenas Contrato de Concessão de Uso","Não — processo em andamento"] },
  ],
  indigena: [
    { id:"pi01", grupo:"Comunidade", tipo:"texto", obrig:true,
      texto:"Nome da aldeia/comunidade",
      placeholder:"Ex: Aldeia Boa Vista" },
    { id:"pi02", grupo:"Comunidade", tipo:"texto", obrig:true,
      texto:"Etnia",
      placeholder:"Ex: Kayapó" },
    { id:"pi03", grupo:"Comunidade", tipo:"opcao", obrig:true,
      texto:"Possui documentação FUNAI",
      opcoes:["Sim","Em processo","Não possui"] },
  ],
};

const ETAPAS = [
  { id:1, label:"Documentação",   icon:"📄", desc:"Upload e validação dos documentos do beneficiário" },
  { id:2, label:"Formulário",     icon:"📝", desc:"Perguntas complementares sobre a habitação e gleba" },
  { id:3, label:"Eng. & Social",  icon:"🏗️", desc:"Documentação técnica e trabalho social" },
];

const ENTIDADES=[
  {id:1, codigo:"EO-2025-001", nome:"Associação Rural do Araguaia",           tipo:"privada", municipio:"Marabá",                   estado:"PA", cnpj:"12.345.678/0001-90", cor:"#7C3AED", emoji:"🌾"},
  {id:2, codigo:"EO-2025-002", nome:"Prefeitura de São João do Araguaia",     tipo:"publica", municipio:"São João do Araguaia",      estado:"PA", cnpj:"05.123.456/0001-78", cor:"#0369A1", emoji:"🏛️"},
  {id:3, codigo:"EO-2025-003", nome:"EMATER Regional Altamira",               tipo:"publica", municipio:"Altamira",                  estado:"PA", cnpj:"03.456.789/0001-12", cor:"#059669", emoji:"🌿"},
  {id:4, codigo:"EO-2025-004", nome:"Cooperativa Araguaia Viva",              tipo:"privada", municipio:"Conceição do Araguaia",     estado:"PA", cnpj:"98.765.432/0001-11", cor:"#D97706", emoji:"🤝"},
];

const USUARIOS=[
  // EO-2025-001 — Associação Rural do Araguaia
  {id:1, eo_id:1, nome:"Carlos Eduardo Santos",  email:"admin@eo001.mcmvr.br",   senha:"admin123",  perfil:"administrador", cargo:"Coordenador Geral"},
  {id:2, eo_id:1, nome:"Fernanda Lima Corrêa",   email:"gerente@eo001.mcmvr.br", senha:"gerente123",perfil:"gerente",       cargo:"Assistente Social Sênior"},
  {id:3, eo_id:1, nome:"Pedro Alves Nascimento", email:"tecnico@eo001.mcmvr.br", senha:"tecnico123",perfil:"operador",      cargo:"Técnico de Campo"},
  // EO-2025-002 — Prefeitura São João
  {id:4, eo_id:2, nome:"Mariana Costa Rodrigues",email:"admin@eo002.mcmvr.br",   senha:"admin123",  perfil:"administrador", cargo:"Secretária de Habitação"},
  {id:5, eo_id:2, nome:"José Luiz Moraes",       email:"tecnico@eo002.mcmvr.br", senha:"tecnico123",perfil:"operador",      cargo:"Técnico Municipal"},
  // EO-2025-003 — EMATER Altamira
  {id:6, eo_id:3, nome:"Roberto Ferreira Lima",  email:"admin@eo003.mcmvr.br",   senha:"admin123",  perfil:"administrador", cargo:"Engenheiro Agrônomo"},
  {id:7, eo_id:3, nome:"Ana Paula Matos",        email:"tecnico@eo003.mcmvr.br", senha:"tecnico123",perfil:"operador",      cargo:"Técnica de Campo"},
  // EO-2025-004 — Cooperativa Araguaia
  {id:8, eo_id:4, nome:"Sônia Aparecida Cunha",  email:"admin@eo004.mcmvr.br",   senha:"admin123",  perfil:"administrador", cargo:"Diretora Executiva"},
];

const PERFIL_CONFIG={
  administrador:{label:"Administrador",    bg:"#7C3AED",light:"#EDE9FE",fg:"#6D28D9",emoji:"👑",pode:["tudo"]},
  gerente:      {label:"Gerente",          bg:"#0369A1",light:"#E0F2FE",fg:"#0284C7",emoji:"🏢",pode:["upload","cruzar","relatorio","oficio","novo","aprovar","visualizar"]},
  operador:     {label:"Técnico/Operador", bg:"#16A34A",light:"#DCFCE7",fg:"#15803D",emoji:"👷",pode:["upload","cruzar","visualizar"]},
};
function pode(user,acao){if(!user)return false;const cfg=PERFIL_CONFIG[user.perfil];return cfg?.pode.includes("tudo")||cfg?.pode.includes(acao)||false;}

// ─── TELA DE LOGIN ────────────────────────────────────────────────────────────
// ─── CONFIGURAÇÃO DE API KEY ──────────────────────────────────────────────────
function APIKeyModal({onClose,onSave,currentKey=""}){
  const [key,setKey]=useState(currentKey);  // inicia com chave já salva na sessão
  const [show,setShow]=useState(false);
  const [testando,setTestando]=useState(false);
  const [testResult,setTestResult]=useState(null);

  const handleSave=()=>{
    onSave(key.trim());
    onClose();
  };

  const handleTest=async()=>{
    const k=key.trim(); if(!k) return;
    setTestando(true); setTestResult(null);
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":k,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-ipc":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:10,messages:[{role:"user",content:"Diga apenas: OK"}]})
      });
      const d=await r.json();
      if(d.content?.[0]?.text) setTestResult({ok:true,msg:"✅ Chave válida — análise real de imagens ativa!"});
      else if(d.error)         setTestResult({ok:false,msg:`Erro: ${d.error.message}`});
      else                     setTestResult({ok:false,msg:"Resposta inesperada. Verifique a chave."});
    }catch(e){
      setTestResult({ok:false,msg:`Falha: ${e.message}. Verifique se a chave é válida.`});
    }finally{ setTestando(false); }
  };

  return(
    <div className="modal-fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:4000,padding:20}}>
      <div style={{background:"#FFF",borderRadius:20,width:"100%",maxWidth:480,boxShadow:"0 24px 64px rgba(0,0,0,0.22)"}}>
        <div style={{background:CAIXA_BLUE,borderRadius:"20px 20px 0 0",padding:"16px 22px",display:"flex",alignItems:"center",gap:10}}>
          <Settings size={18} color="#FFF"/>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:"#FFF"}}>Configurar Análise com IA</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)"}}>API Key Anthropic — análise real de documentos</div></div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:6,cursor:"pointer",color:"#FFF",display:"flex"}}><X size={16}/></button>
        </div>
        <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"#EFF6FF",borderRadius:10,padding:"11px 14px",border:"1px solid #BFDBFE",fontSize:11,color:"#1E40AF",lineHeight:1.6}}>
            <strong>Como obter sua API Key:</strong><br/>
            1. Acesse <strong>console.anthropic.com</strong> → faça login<br/>
            2. Menu lateral → <strong>API Keys</strong> → <strong>Create Key</strong><br/>
            3. Copie a chave (começa com <code style={{background:"#DBEAFE",borderRadius:4,padding:"1px 4px"}}>sk-ant-</code>) e cole abaixo<br/>
            <span style={{color:"#64748B"}}>A chave fica salva apenas neste navegador, nesta sessão.</span>
          </div>
          {""&&!key&&(
            <div style={{background:"#DCFCE7",borderRadius:9,padding:"9px 12px",fontSize:11,color:"#15803D",display:"flex",gap:7}}>
              <CheckCircle size={14} style={{flexShrink:0,marginTop:1}}/>Chave configurada. Análise real de imagens ativa!
            </div>
          )}
          <div>
            <label style={{fontSize:11,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:5}}>API Key Anthropic</label>
            <div style={{position:"relative"}}>
              <input type={show?"text":"password"} value={key} onChange={e=>setKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                style={{width:"100%",padding:"11px 44px 11px 14px",border:"1px solid #E2E8F0",borderRadius:10,fontSize:12,fontFamily:"monospace",color:"#1E293B",background:"#FAFAFA",outline:"none"}}/>
              <button onClick={()=>setShow(!show)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94A3B8",display:"flex"}}>
                {show?<EyeOff size={15}/>:<Eye size={15}/>}
              </button>
            </div>
          </div>
          {testResult&&(
            <div style={{background:testResult.ok?"#DCFCE7":"#FEF2F2",borderRadius:9,padding:"9px 12px",fontSize:12,color:testResult.ok?"#15803D":"#DC2626",display:"flex",gap:7}}>
              {testResult.ok?<CheckCircle size={14} style={{flexShrink:0,marginTop:1}}/>:<AlertCircle size={14} style={{flexShrink:0,marginTop:1}}/>}
              {testResult.msg}
            </div>
          )}
          <div style={{display:"flex",gap:10}}>
            <button onClick={handleTest} disabled={!key.trim()||testando}
              style={{flex:1,padding:"11px",border:"1px solid #E2E8F0",borderRadius:10,background:"#FFF",color:key.trim()&&!testando?CAIXA_BLUE:"#94A3B8",fontSize:12,fontWeight:600,fontFamily:"inherit",cursor:key.trim()&&!testando?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              {testando?<><Loader size={13} className="spinning"/>Testando…</>:<>⚡ Testar Conexão</>}
            </button>
            <button onClick={handleSave} style={{flex:2,padding:"11px",background:CAIXA_BLUE,border:"none",borderRadius:10,color:"#FFF",fontSize:13,fontWeight:700,fontFamily:"inherit",cursor:"pointer"}}>
              {key.trim()?"Salvar e Usar":"Remover Chave"}
            </button>
          </div>
          {(key.trim()||"")&&(
            <button onClick={()=>{/* key in state */;setKey("");setTestResult(null);}} style={{background:"none",border:"none",cursor:"pointer",color:"#EF4444",fontSize:11,fontFamily:"inherit",textAlign:"center",padding:4}}>
              🗑️ Remover chave salva desta sessão
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LGPD — PRIVACIDADE E PROTEÇÃO DE DADOS ──────────────────────────────────

const LGPD_VERSAO = "1.0 — Junho/2026";
const RETENCAO_ANOS = 5;

// Modal de aviso de privacidade — exibido antes do 1º cadastro de cada sessão
function LGPDNoticeModal({onAceitar, onFechar}){
  const [aceito,setAceito]=useState(false);
  return(
    <div className="modal-fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:4000,padding:20}}>
      <div style={{background:"#FFF",borderRadius:18,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.22)"}}>
        <div style={{background:"#003F87",borderRadius:"18px 18px 0 0",padding:"18px 22px",display:"flex",alignItems:"center",gap:10}}>
          <Shield size={20} color="#FFF"/>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15,color:"#FFF"}}>Aviso de Tratamento de Dados Pessoais</div><div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:2}}>Lei Geral de Proteção de Dados — LGPD (Lei 13.709/2018)</div></div>
        </div>
        <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"#EFF6FF",borderRadius:10,padding:"12px 14px",border:"1px solid #BFDBFE"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#003F87",marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>📋 Base Legal</div>
            <div style={{fontSize:12,color:"#1E40AF",lineHeight:1.6}}>
              Art. 7º, III da LGPD — <strong>Execução de política pública</strong> prevista em lei (Programa MCMVR Rural, regulamentado pelo Ministério das Cidades e normas do programa habitacional)
            </div>
          </div>
          {[
            {titulo:"📁 Dados coletados", texto:"Documentos pessoais de identificação (RG, CPF), certidões, comprovantes de renda, documentação de imóvel rural e formulários do programa habitacional. Dados são processados por sistema de Inteligência Artificial para verificação de conformidade."},
            {titulo:"🎯 Finalidade exclusiva", texto:"Validação documental para fins de habilitação ao Programa MCMVR Rural. Os dados não serão utilizados para outras finalidades, comercializados ou compartilhados com terceiros fora do processo do programa."},
            {titulo:"🤖 Processamento por IA", texto:"Documentos enviados são analisados por inteligência artificial (API externa, com acordo de proteção de dados — DPA). A análise é automatizada e visa identificar inconsistências, rasuras e pendências documentais."},
            {titulo:"⏱️ Retenção dos dados", texto:`Os dados serão mantidos por ${RETENCAO_ANOS} anos após o encerramento do processo, conforme prazo mínimo legal para guarda de processos habitacionais, e então excluídos ou anonimizados.`},
          ].map(s=>(
            <div key={s.titulo} style={{borderBottom:"1px solid #F1F5F9",paddingBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#1E293B",marginBottom:4}}>{s.titulo}</div>
              <div style={{fontSize:12,color:"#475569",lineHeight:1.6}}>{s.texto}</div>
            </div>
          ))}
          <div style={{background:"#DCFCE7",borderRadius:10,padding:"12px 14px",border:"1px solid #86EFAC"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#15803D",marginBottom:6}}>⚖️ Direitos do Titular (Art. 18 da LGPD)</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:11,color:"#166534"}}>
              {["Acesso aos dados","Correção de dados incorretos","Eliminação dos dados","Portabilidade","Revogação do consentimento","Informação sobre compartilhamento"].map(d=>(
                <div key={d} style={{display:"flex",gap:5}}><span>✓</span>{d}</div>
              ))}
            </div>
            <div style={{fontSize:11,color:"#166534",marginTop:8}}>Solicitações via: <strong>privacidade@programa-mcmvr.gov.br</strong></div>
          </div>
          <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",padding:"10px 12px",background:"#F8FAFC",borderRadius:10,border:`2px solid ${aceito?"#003F87":"#E2E8F0"}`,transition:"border .2s"}}>
            <input type="checkbox" checked={aceito} onChange={e=>setAceito(e.target.checked)} style={{marginTop:2,accentColor:"#003F87",width:16,height:16,flexShrink:0}}/>
            <span style={{fontSize:12,color:"#1E293B",lineHeight:1.5}}>
              <strong>Li e estou ciente</strong> do tratamento de dados pessoais do beneficiário conforme descrito acima, agindo em nome da Entidade Organizadora como responsável pelo processo de habilitação.
            </span>
          </label>
          <div style={{display:"flex",gap:10}}>
            <button onClick={onFechar} style={{flex:1,padding:"11px",border:"1px solid #E2E8F0",borderRadius:10,background:"#FFF",color:"#64748B",fontSize:13,fontWeight:600,fontFamily:"inherit",cursor:"pointer"}}>Cancelar</button>
            <button onClick={onAceitar} disabled={!aceito} style={{flex:2,padding:"11px",background:aceito?"#003F87":"#CBD5E1",border:"none",borderRadius:10,color:"#FFF",fontSize:13,fontWeight:700,fontFamily:"inherit",cursor:aceito?"pointer":"default",transition:"background .2s"}}>
              Confirmar e Continuar Cadastro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal de política de privacidade completa
function PoliticaPrivacidadeModal({onFechar}){
  const sec=(titulo,corpo)=>(
    <div style={{marginBottom:16}}>
      <div style={{fontWeight:700,fontSize:13,color:"#003F87",marginBottom:6}}>{titulo}</div>
      <div style={{fontSize:12,color:"#475569",lineHeight:1.7}}>{corpo}</div>
    </div>
  );
  return(
    <div className="modal-fade" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:4000,padding:20}}>
      <div style={{background:"#FFF",borderRadius:18,width:"100%",maxWidth:600,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,0.22)"}}>
        <div style={{background:"#003F87",borderRadius:"18px 18px 0 0",padding:"16px 22px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <FileText size={18} color="#FFF"/>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:"#FFF"}}>Política de Privacidade</div><div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>Versão {LGPD_VERSAO} — Documento preliminar (revisão jurídica pendente)</div></div>
          <button onClick={onFechar} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:7,cursor:"pointer",color:"#FFF",display:"flex"}}><X size={16}/></button>
        </div>
        <div style={{overflowY:"auto",padding:"20px 24px"}}>
          <div style={{background:"#FEF3C7",borderRadius:9,padding:"10px 14px",marginBottom:20,fontSize:11,color:"#92400E",display:"flex",gap:8}}>
            <AlertTriangle size={14} style={{flexShrink:0,marginTop:1}}/><span><strong>Documento preliminar.</strong> Esta política foi gerada como base para revisão jurídica. Deve ser validada e aprovada por advogado especializado em LGPD antes de entrar em operação.</span>
          </div>
          {sec("1. IDENTIFICAÇÃO DO CONTROLADOR","A Entidade Organizadora (EO) credenciada ao Programa MCMVR Rural é a Controladora dos dados pessoais coletados neste sistema, nos termos do Art. 5º, VI da LGPD. A empresa desenvolvedora do sistema atua como Operadora de dados (Art. 5º, VII da LGPD), processando os dados em nome e por instrução das EOs.")}
          {sec("2. DADOS PESSOAIS TRATADOS","São coletados e processados: dados de identificação (nome completo, CPF, RG, data de nascimento), dados de estado civil (certidões), dados de renda e composição familiar, documentação fundiária e de atividade rural, fotos e digitalizações dos documentos originais. Para comunidades tradicionais: dados de pertencimento étnico/racial, tratados como dados sensíveis (Art. 5º, II da LGPD).")}
          {sec("3. BASE LEGAL","O tratamento é realizado com fundamento no Art. 7º, III c/c Art. 11, II, 'b' da LGPD: execução de políticas públicas previstas em leis e regulamentos, especificamente o Programa Minha Casa Minha Vida Rural (MCMVR), conforme regulamentação do Ministério das Cidades.")}
          {sec("4. FINALIDADE","Os dados são coletados exclusivamente para: (i) verificação de conformidade documental para habilitação ao MCMVR Rural; (ii) validação cruzada de informações entre documentos; (iii) geração de relatórios e ofícios do processo. É vedado o uso para qualquer outra finalidade.")}
          {sec("5. PROCESSAMENTO POR INTELIGÊNCIA ARTIFICIAL","Os documentos são submetidos a análise automatizada por sistema de IA para extração e verificação de dados. O processamento ocorre mediante API com acordo de proteção de dados (DPA) conforme Art. 33 da LGPD (transferência internacional). A análise visa exclusivamente identificar inconsistências documentais. O beneficiário tem direito à revisão humana de decisões automatizadas (Art. 20 da LGPD).")}
          {sec("6. COMPARTILHAMENTO","Os dados poderão ser compartilhados exclusivamente com: (i) o agente financeiro do programa, para análise e aprovação do processo habitacional; (ii) órgãos públicos, mediante requisição legal. É proibido qualquer compartilhamento comercial.")}
          {sec(`7. RETENÇÃO E EXCLUSÃO`,`Os dados serão retidos por ${RETENCAO_ANOS} (cinco) anos após o encerramento do processo habitacional, prazo mínimo legal para guarda de documentos de processos de crédito habitacional. Após este prazo, os dados serão excluídos permanentemente ou anonimizados.`)}
          {sec("8. SEGURANÇA","São adotadas medidas de segurança técnica e administrativa, incluindo: controle de acesso por perfis de permissão, registro de auditoria de acessos, criptografia de documentos armazenados e acordos de confidencialidade com prestadores de serviço.")}
          {sec("9. DIREITOS DO TITULAR","O titular dos dados tem direito a: confirmação da existência de tratamento; acesso aos dados; correção de dados incompletos ou incorretos; eliminação dos dados (quando juridicamente possível); portabilidade; informação sobre compartilhamentos; oposição ao tratamento. Solicitações: privacidade@programa-mcmvr.gov.br com prazo de resposta de 15 dias.")}
          {sec("10. CONTATO E DPO","Para exercício de direitos ou dúvidas sobre o tratamento de dados: privacidade@programa-mcmvr.gov.br. A nomeação de Encarregado/DPO será realizada conforme crescimento do volume de tratamento, nos termos do Art. 41 da LGPD.")}
          <div style={{fontSize:11,color:"#94A3B8",marginTop:8,borderTop:"1px solid #F1F5F9",paddingTop:12}}>Versão {LGPD_VERSAO}. Este documento é preliminar e deve ser revisado por advogado antes de entrar em vigência.</div>
        </div>
        <div style={{padding:"14px 22px",borderTop:"1px solid #E2E8F0",flexShrink:0}}>
          <button onClick={onFechar} style={{width:"100%",padding:12,background:"#003F87",border:"none",borderRadius:10,color:"#FFF",fontSize:13,fontWeight:700,fontFamily:"inherit",cursor:"pointer"}}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

// Badge de retenção de dados — exibido nos cards dos beneficiários
function RetencaoBadge(){
  return(
    <span title={`Dados retidos por ${RETENCAO_ANOS} anos após encerramento — LGPD Art. 7º III`}
      style={{display:"inline-flex",alignItems:"center",gap:4,background:"#EFF6FF",color:"#0369A1",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,letterSpacing:".03em",cursor:"help"}}>
      <Shield size={9}/> LGPD · {RETENCAO_ANOS}a
    </span>
  );
}

// Painel de log de auditoria
function AuditPanel({logs}){
  const [expanded,setExpanded]=useState(false);
  if(!logs||logs.length===0) return null;
  const shown=expanded?logs:[...logs].slice(-5).reverse();
  return(
    <div style={{background:"#FFF",borderRadius:14,border:"1px solid #E2E8F0",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
      <button onClick={()=>setExpanded(!expanded)} style={{width:"100%",padding:"12px 16px",borderBottom:expanded?"1px solid #E2E8F0":"none",background:"#F8FAFC",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"inherit"}}>
        <Shield size={14} color="#0369A1"/>
        <span style={{fontWeight:700,fontSize:12,color:"#1E293B",flex:1,textAlign:"left"}}>Log de Auditoria — LGPD</span>
        <span style={{fontSize:10,color:"#94A3B8"}}>{logs.length} registro{logs.length>1?"s":""}</span>
        {expanded?<ChevronUp size={14} color="#94A3B8"/>:<ChevronDown size={14} color="#94A3B8"/>}
      </button>
      {expanded&&(
        <div>
          {shown.map((l,i)=>(
            <div key={i} style={{padding:"9px 16px",borderBottom:i<shown.length-1?"1px solid #F8FAFC":"none",display:"flex",alignItems:"flex-start",gap:10,fontSize:11}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:l.tipo==="acesso"?"#0369A1":l.tipo==="upload"?"#16A34A":l.tipo==="cruzamento"?"#7C3AED":"#D97706",marginTop:4,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,color:"#1E293B"}}>{l.acao}</div>
                <div style={{color:"#64748B",marginTop:1}}>{l.usuario} · {l.perfil}</div>
              </div>
              <div style={{color:"#94A3B8",fontSize:10,flexShrink:0}}>{new Date(l.ts).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          ))}
          {!expanded&&logs.length>5&&<div style={{padding:"8px 16px",textAlign:"center",fontSize:11,color:"#94A3B8",background:"#F8FAFC"}}>Mostrando últimos 5 de {logs.length} registros</div>}
        </div>
      )}
    </div>
  );
}

// ─── SUPER ADMIN DASHBOARD ────────────────────────────────────────────────────
function SuperAdminDashboard({onLogout, allBeneficiarios, adminUser}){
  const [aba, setAba]         = useState("eos");
  const [eoFocus, setEoFocus] = useState(null);
  const [perguntas, setPerguntas] = useState(PERGUNTAS_BASE);

  const cfg = ADMIN_PERFIS[adminUser?.perfil] || ADMIN_PERFIS.operador;

  const statsEO = (eoId) => {
    const benefs = allBeneficiarios.filter(b=>b.eo_id===eoId);
    return {
      total: benefs.length,
      ok:   benefs.filter(b=>b.status==="aprovado").length,
      pend: benefs.filter(b=>["pendente","incompleto"].includes(b.status)).length,
      div:  benefs.filter(b=>b.status==="divergencia").length,
    };
  };

  const abas = [
    {id:"eos",        label:"Entidades (EOs)",   icon:Users,    ok: podAdmin(adminUser,"ver_eos")},
    {id:"formulario", label:"Formulário E2",      icon:FileText, ok: podAdmin(adminUser,"ver_formulario")},
    {id:"relatorio",  label:"Relatórios",          icon:Download, ok: podAdmin(adminUser,"ver_relatorios")},
  ].filter(a=>a.ok);

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"#0F172A",fontFamily:"'IBM Plex Sans',system-ui,sans-serif"}}>
      {/* Header */}
      <header style={{background:"#1E293B",borderBottom:"1px solid #334155",padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
        <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${cfg.cor},${cfg.cor}cc)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>
          {cfg.emoji}
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:14,color:"#F1F5F9"}}>MCMVR Rural — Administração Central</div>
          <div style={{fontSize:11,color:"#64748B"}}>{adminUser?.nome}</div>
        </div>
        <span style={{fontSize:10,background:cfg.light,color:cfg.fg,padding:"3px 10px",borderRadius:20,fontWeight:700}}>{cfg.label}</span>
        <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:5,background:"#334155",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",color:"#94A3B8",fontSize:12,fontFamily:"inherit"}}>
          <LogOut size={13}/> Sair
        </button>
      </header>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* Sidebar */}
        <aside style={{width:200,background:"#1E293B",borderRight:"1px solid #334155",padding:"16px 10px",flexShrink:0,display:"flex",flexDirection:"column",gap:4}}>
          {abas.map(item=>{
            const Icon=item.icon;
            return(
              <button key={item.id} onClick={()=>{setAba(item.id);setEoFocus(null);}}
                style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderRadius:9,border:"none",cursor:"pointer",width:"100%",background:aba===item.id?"#334155":"transparent",color:aba===item.id?"#F1F5F9":"#64748B",fontFamily:"inherit",fontSize:12,fontWeight:aba===item.id?700:400,textAlign:"left"}}>
                <Icon size={15}/>{item.label}
              </button>
            );
          })}
          {/* Nível de acesso */}
          <div style={{marginTop:"auto",padding:"10px 12px",background:"#0F172A",borderRadius:9,border:"1px solid #334155"}}>
            <div style={{fontSize:9,color:"#475569",textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>Nível de acesso</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:16}}>{cfg.emoji}</span>
              <span style={{fontSize:11,fontWeight:700,color:cfg.fg}}>{cfg.label}</span>
            </div>
            <div style={{fontSize:9,color:"#475569",marginTop:4}}>
              {adminUser?.perfil==="master"&&"Acesso total ao sistema"}
              {adminUser?.perfil==="gerente"&&"Visualização e relatórios"}
              {adminUser?.perfil==="operador"&&"Somente visualização"}
            </div>
          </div>
        </aside>

        {/* Conteúdo */}
        <main style={{flex:1,overflowY:"auto",padding:24}}>

          {/* Lista de EOs */}
          {aba==="eos"&&!eoFocus&&(
            <div>
              <div style={{marginBottom:20}}>
                <h2 style={{fontSize:18,fontWeight:800,color:"#F1F5F9",margin:0}}>Entidades Organizadoras</h2>
                <p style={{fontSize:12,color:"#64748B",marginTop:4}}>{ENTIDADES.length} EOs cadastradas</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
                {ENTIDADES.map(eo=>{
                  const s=statsEO(eo.id);
                  return(
                    <div key={eo.id} onClick={()=>setEoFocus(eo)}
                      style={{background:"#1E293B",borderRadius:14,padding:18,border:"1px solid #334155",cursor:"pointer",transition:"border .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor="#6366F1"}
                      onMouseLeave={e=>e.currentTarget.style.borderColor="#334155"}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                        <div style={{width:40,height:40,borderRadius:10,background:`${eo.cor}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{eo.emoji}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:13,color:"#F1F5F9",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{eo.nome}</div>
                          <div style={{fontSize:10,color:"#64748B"}}>{eo.codigo} · {eo.tipo==="publica"?"Pública":"Privada"}</div>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                        {[{l:"Total",v:s.total,c:"#94A3B8"},{l:"Aprovados",v:s.ok,c:"#22C55E"},{l:"Pendências",v:s.pend+s.div,c:"#F59E0B"}].map(r=>(
                          <div key={r.l} style={{background:"#0F172A",borderRadius:8,padding:"8px 10px"}}>
                            <div style={{fontSize:18,fontWeight:800,color:r.c}}>{r.v}</div>
                            <div style={{fontSize:9,color:"#475569",textTransform:"uppercase"}}>{r.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detalhe EO */}
          {aba==="eos"&&eoFocus&&(
            <div>
              <button onClick={()=>setEoFocus(null)} style={{display:"flex",alignItems:"center",gap:6,background:"#334155",border:"none",borderRadius:8,padding:"7px 13px",cursor:"pointer",color:"#94A3B8",fontSize:12,fontFamily:"inherit",marginBottom:16}}>
                <ArrowLeft size={13}/> Voltar
              </button>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                <div style={{width:48,height:48,borderRadius:12,background:`${eoFocus.cor}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{eoFocus.emoji}</div>
                <div>
                  <h2 style={{fontSize:18,fontWeight:800,color:"#F1F5F9",margin:0}}>{eoFocus.nome}</h2>
                  <div style={{fontSize:12,color:"#64748B",marginTop:2}}>{eoFocus.codigo} · {eoFocus.municipio}/{eoFocus.estado} · CNPJ: {eoFocus.cnpj}</div>
                </div>
              </div>
              <div style={{background:"#1E293B",borderRadius:14,border:"1px solid #334155",overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid #334155",fontSize:12,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".06em"}}>
                  {allBeneficiarios.filter(b=>b.eo_id===eoFocus.id).length} beneficiários
                </div>
                {allBeneficiarios.filter(b=>b.eo_id===eoFocus.id).map((b,i)=>(
                  <div key={b.id} style={{padding:"11px 16px",borderBottom:"1px solid #0F172A",display:"flex",alignItems:"center",gap:12,background:i%2===0?"#1E293B":"#172033"}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13,color:"#F1F5F9"}}>{b.nome}</div>
                      <div style={{fontSize:10,color:"#64748B",marginTop:1}}>{b.cpf} · Etapa {b.etapa||1}/3</div>
                    </div>
                    <StatusBadge status={b.status}/>
                  </div>
                ))}
                {allBeneficiarios.filter(b=>b.eo_id===eoFocus.id).length===0&&(
                  <div style={{padding:24,textAlign:"center",color:"#475569",fontSize:12}}>Nenhum beneficiário cadastrado</div>
                )}
              </div>
            </div>
          )}

          {/* Formulário E2 — só master pode editar */}
          {aba==="formulario"&&(
            <div>
              <div style={{marginBottom:20,display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
                <div>
                  <h2 style={{fontSize:18,fontWeight:800,color:"#F1F5F9",margin:0}}>Formulário — Etapa 2</h2>
                  <p style={{fontSize:12,color:"#64748B",marginTop:4}}>Versão definitiva após receber o POP</p>
                </div>
                {!podAdmin(adminUser,"tudo")&&(
                  <span style={{fontSize:10,background:"#1E293B",color:"#64748B",border:"1px solid #334155",padding:"4px 10px",borderRadius:20,marginTop:4}}>Somente leitura</span>
                )}
              </div>
              <div style={{background:"#1E293B",borderRadius:14,border:"1px solid #334155",overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid #334155",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".05em"}}>{perguntas.length} perguntas base</span>
                  <span style={{fontSize:10,background:"#FEF3C7",color:"#B45309",padding:"2px 8px",borderRadius:20,fontWeight:700}}>VERSÃO BÁSICA — POP pendente</span>
                </div>
                {perguntas.map((p,i)=>(
                  <div key={p.id} style={{padding:"11px 16px",borderBottom:"1px solid #0F172A",display:"flex",alignItems:"flex-start",gap:12,background:i%2===0?"#1E293B":"#172033"}}>
                    <span style={{fontSize:10,background:"#1E3A5F",color:"#60A5FA",padding:"2px 7px",borderRadius:8,fontWeight:700,flexShrink:0,marginTop:1}}>{p.id}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,color:"#E2E8F0",fontWeight:500}}>{p.texto}</div>
                      <div style={{fontSize:10,color:"#64748B",marginTop:2}}>{p.grupo} · {p.tipo==="opcao"?"Múltipla escolha":p.tipo==="numero"?"Numérico":"Texto"}{p.obrig?" · Obrigatório":""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Relatórios */}
          {aba==="relatorio"&&(
            <div style={{textAlign:"center",paddingTop:60,color:"#475569"}}>
              <Download size={40} style={{margin:"0 auto 16px",display:"block",opacity:.3}}/>
              <div style={{fontWeight:700,fontSize:16,color:"#64748B"}}>Relatórios consolidados</div>
              <div style={{fontSize:13,marginTop:6}}>Disponível após backend em produção</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function StatusBadge({status}){
  const s=STATUS[status]||STATUS.pendente;
  return<span style={{fontSize:10,fontWeight:700,background:s.bg,color:s.fg,padding:"2px 8px",borderRadius:20}}>{s.label}</span>;
}

// ─── ETAPA 2 — FORMULÁRIO COMPLEMENTAR ────────────────────────────────────────
function Etapa2Formulario({beneficiario,onSalvar,onVoltar,isMobile}){
  const [respostas,setRespostas]=useState(beneficiario.respostas||{});
  const [salvando,setSalvando]=useState(false);

  // Detecta tipo do beneficiário pelas categorias de docs
  const tipoBenef=()=>{
    const docs=Object.keys(beneficiario.documentos||{});
    if(docs.includes("autodecl_ocupacao")) return "posseiro";
    if(docs.includes("relacao_incra"))     return "assentado";
    if(docs.includes("funai_doc"))         return "indigena";
    return "proprietario";
  };

  const tipo=tipoBenef();
  const perguntasAtivas=[...PERGUNTAS_BASE,...(PERGUNTAS_POR_TIPO[tipo]||[])];
  const grupos=[...new Set(perguntasAtivas.map(p=>p.grupo))];

  const setar=(id,val)=>setRespostas(p=>({...p,[id]:val}));
  const totalObrig=perguntasAtivas.filter(p=>p.obrig).length;
  const respondObrig=perguntasAtivas.filter(p=>p.obrig&&respostas[p.id]&&String(respostas[p.id]).trim()).length;
  const pct=totalObrig>0?Math.round(respondObrig/totalObrig*100):0;

  const handleSalvar=()=>{
    setSalvando(true);
    setTimeout(()=>{onSalvar(respostas);setSalvando(false);},700);
  };

  return(
    <div style={{padding:isMobile?"16px":"24px",paddingBottom:isMobile?"100px":"24px",maxWidth:720,display:"flex",flexDirection:"column",gap:16}}>
      {/* Header da etapa */}
      <div style={{background:"linear-gradient(135deg,#6366F1,#8B5CF6)",borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
        <FileText size={22} color="#FFF" style={{flexShrink:0}}/>
        <div>
          <div style={{fontWeight:700,fontSize:14,color:"#FFF"}}>Etapa 2 — Formulário Complementar</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",marginTop:2}}>{beneficiario.nome} · {tipo}</div>
        </div>
        <div style={{marginLeft:"auto",textAlign:"right"}}>
          <div style={{fontSize:22,fontWeight:800,color:"#FFF"}}>{pct}%</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.7)"}}>completo</div>
        </div>
      </div>

      {/* Progresso */}
      <div style={{background:"#E2E8F0",borderRadius:4,height:6,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#6366F1,#8B5CF6)",borderRadius:4,transition:"width .4s ease"}}/>
      </div>

      {/* Perguntas por grupo */}
      {grupos.map(grupo=>{
        const pergs=perguntasAtivas.filter(p=>p.grupo===grupo);
        const isEspecifico=pergs.some(p=>PERGUNTAS_POR_TIPO[tipo]?.find(x=>x.id===p.id));
        return(
          <div key={grupo} style={{background:"#FFF",borderRadius:14,border:"1px solid #E2E8F0",overflow:"hidden"}}>
            <div style={{padding:"11px 16px",background:isEspecifico?"#EDE9FE":"#F8FAFC",borderBottom:"1px solid #E2E8F0",display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontWeight:700,fontSize:12,color:isEspecifico?"#6D28D9":"#1E293B"}}>{grupo}</span>
              {isEspecifico&&<span style={{fontSize:10,background:"#DDD6FE",color:"#6D28D9",padding:"1px 7px",borderRadius:20,fontWeight:700}}>Específico — {tipo}</span>}
            </div>
            <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:14}}>
              {pergs.map(p=>(
                <div key={p.id}>
                  <label style={{fontSize:12,fontWeight:600,color:"#1E293B",display:"flex",alignItems:"center",gap:5,marginBottom:7}}>
                    {p.texto}
                    {p.obrig&&<span style={{color:"#EF4444",fontSize:10}}>*</span>}
                  </label>
                  {p.tipo==="opcao"&&(
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {p.opcoes.map(op=>(
                        <label key={op} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",background:respostas[p.id]===op?"#EDE9FE":"#F8FAFC",borderRadius:9,border:`1px solid ${respostas[p.id]===op?"#8B5CF6":"#E2E8F0"}`,cursor:"pointer",fontSize:12,color:"#1E293B",transition:"all .15s"}}>
                          <input type="radio" name={p.id} value={op} checked={respostas[p.id]===op} onChange={()=>setar(p.id,op)} style={{accentColor:"#6366F1"}}/>
                          {op}
                        </label>
                      ))}
                    </div>
                  )}
                  {(p.tipo==="texto"||p.tipo==="numero")&&(
                    <input
                      type={p.tipo==="numero"?"number":"text"}
                      value={respostas[p.id]||""}
                      onChange={e=>setar(p.id,e.target.value)}
                      placeholder={p.placeholder||""}
                      style={{width:"100%",padding:"10px 13px",border:"1px solid #E2E8F0",borderRadius:9,fontSize:13,fontFamily:"inherit",color:"#1E293B",background:"#FAFAFA",outline:"none"}}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Nota sobre versão definitiva */}
      <div style={{background:"#FEF3C7",borderRadius:10,padding:"10px 14px",border:"1px solid #FCD34D",fontSize:11,color:"#92400E",display:"flex",gap:7}}>
        <Info size={13} style={{flexShrink:0,marginTop:1}}/>
        Formulário básico — versão definitiva com POP e regras completas será implementada em breve.
      </div>

      {/* Ações */}
      <div style={{display:"flex",gap:10}}>
        <button onClick={onVoltar} style={{flex:1,padding:13,border:"1px solid #E2E8F0",borderRadius:12,fontSize:13,fontWeight:600,fontFamily:"inherit",background:"#FFF",color:"#64748B",cursor:"pointer"}}>
          ← Etapa 1
        </button>
        <button onClick={handleSalvar} disabled={salvando}
          style={{flex:2,padding:13,background:salvando?"#94A3B8":"#6366F1",border:"none",borderRadius:12,fontSize:13,fontWeight:700,fontFamily:"inherit",color:"#FFF",cursor:salvando?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {salvando?<><Loader size={14} className="spinning"/>Salvando…</>:<><CheckCircle size={14}/>Salvar Etapa 2</>}
        </button>
      </div>
    </div>
  );
}

function Login({onLogin, onAdminLogin}){
  const [modo, setModo] = useState(null); // null | "eo" | "admin"
  const [adminCodigo, setAdminCodigo] = useState("");
  const [adminSenha,  setAdminSenha]  = useState("");
  const [adminErro,   setAdminErro]   = useState("");
  const [showAdminSenha, setShowAdminSenha] = useState(false);
  const [passo,setPasso]=useState(1);
  const [codigoEO,setCodigoEO]=useState("");
  const [eoSelecionada,setEoSelecionada]=useState(null);
  const [erroEO,setErroEO]=useState("");
  const [email,setEmail]=useState("");
  const [senha,setSenha]=useState("");
  const [erro,setErro]=useState("");
  const [loading,setLoading]=useState(false);
  const [showSenha,setShowSenha]=useState(false);
  const [demoOpen,setDemoOpen]=useState(false);

  const verificarEO=()=>{
    const eo=ENTIDADES.find(x=>x.codigo===codigoEO.trim().toUpperCase());
    if(eo){setEoSelecionada(eo);setPasso(2);setErroEO("");}
    else setErroEO("Código de EO não encontrado. Verifique e tente novamente.");
  };

  const entrar=()=>{
    if(loading) return;
    const em=email.trim().toLowerCase()||document.getElementById("lm-email")?.value?.trim().toLowerCase()||"";
    const pw=senha||document.getElementById("lm-senha")?.value||"";
    if(!em||!pw){setErro("Preencha e-mail e senha.");return;}
    const user=USUARIOS.find(u=>u.eo_id===eoSelecionada?.id&&u.email===em&&u.senha===pw);
    if(user){onLogin({...user,eo:eoSelecionada});}
    else setErro("E-mail ou senha incorretos para esta EO.");
  };

  const loginRapido=(u)=>{
    const eo=ENTIDADES.find(x=>x.id===u.eo_id);
    if(eo) onLogin({...u,eo});
  };

  const Btn=({onClick,disabled,children,style={}})=>(
    <div role="button" tabIndex={0}
      onClick={disabled?undefined:onClick}
      onKeyDown={e=>{if(!disabled&&(e.key==="Enter"||e.key===" "))onClick();}}
      style={{cursor:disabled?"default":"pointer",userSelect:"none",WebkitUserSelect:"none",...style}}>
      {children}
    </div>
  );

  const [logoClicks, setLogoClicks] = useState(0);
  const [logoTimer,  setLogoTimer]  = useState(null);

  const handleLogoClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if(logoTimer) clearTimeout(logoTimer);
    if(next >= 3){ setModo("admin"); setLogoClicks(0); return; }
    const t = setTimeout(()=>setLogoClicks(0), 1500);
    setLogoTimer(t);
  };

  const entrarAdmin=()=>{
    const u=ADMIN_USUARIOS.find(x=>x.codigo===adminCodigo.trim()&&x.senha===adminSenha);
    if(u){onAdminLogin(u);}else{setAdminErro("Código ou senha incorretos.");}
  };

  // Tela de seleção de acesso
  if(!modo) return(
    <div style={{minHeight:"100vh",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'IBM Plex Sans',system-ui,sans-serif"}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div onClick={handleLogoClick} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:72,height:72,borderRadius:22,background:"linear-gradient(135deg,#003F87,#6366F1)",marginBottom:16,cursor:"default",userSelect:"none"}}>
            <FileCheck size={34} color="#FFF"/>
          </div>
          <div style={{fontSize:26,fontWeight:800,color:"#F1F5F9",letterSpacing:"-.02em"}}>MCMVR Rural</div>
          <div style={{fontSize:13,color:"#64748B",marginTop:6}}>Sistema de Validação de Documentos</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Acesso EO — principal */}
          <div role="button" tabIndex={0} onClick={()=>setModo("eo")} onKeyDown={e=>(e.key==="Enter"||e.key===" ")&&setModo("eo")}
            style={{background:"#1E293B",borderRadius:16,padding:"22px 24px",border:"2px solid #334155",cursor:"pointer",transition:"all .2s",userSelect:"none"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=CAIXA_BLUE;e.currentTarget.style.background="#1E3A5F";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#334155";e.currentTarget.style.background="#1E293B";}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:48,height:48,borderRadius:14,background:`${CAIXA_BLUE}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Users size={24} color={CAIXA_BLUE}/>
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:"#F1F5F9"}}>Entidade Organizadora</div>
                <div style={{fontSize:12,color:"#64748B",marginTop:3}}>Acesso com código da EO + credenciais</div>
              </div>
              <ChevronRight size={20} color="#475569" style={{marginLeft:"auto",flexShrink:0}}/>
            </div>
          </div>

          {/* Admin: acesso via triplo-clique no logo */}
          {logoClicks>0&&<div style={{textAlign:"center",marginTop:4,fontSize:10,color:"#1E293B",userSelect:"none"}}>{logoClicks===1?"·":"··"}</div>}
        </div>
        <div style={{textAlign:"center",marginTop:24,fontSize:11,color:"#334155"}}>MCMVR Rural — Sistema de Validação Documental</div>
      </div>
    </div>
  );

  // Tela de acesso Admin
  if(modo==="admin") return(
    <div style={{minHeight:"100vh",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'IBM Plex Sans',system-ui,sans-serif"}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:64,height:64,borderRadius:20,background:"linear-gradient(135deg,#6366F1,#8B5CF6)",marginBottom:14}}>
            <Shield size={28} color="#FFF"/>
          </div>
          <div style={{fontSize:20,fontWeight:800,color:"#F1F5F9"}}>Acesso Administrativo</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4}}>Gestão do Sistema MCMVR Rural</div>
        </div>
        <div style={{background:"#1E293B",borderRadius:20,padding:"24px",border:"1px solid #334155"}}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <label style={{fontSize:11,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:5}}>Código Administrativo</label>
              <input value={adminCodigo} onChange={e=>{setAdminCodigo(e.target.value);setAdminErro("");}} onKeyDown={e=>e.key==="Enter"&&entrarAdmin()}
                placeholder="Código de acesso" autoComplete="off"
                style={{width:"100%",padding:"11px 14px",border:"1px solid #334155",borderRadius:9,fontSize:13,fontFamily:"monospace",color:"#F1F5F9",background:"#0F172A",outline:"none"}}/>
            </div>
            <div style={{position:"relative"}}>
              <label style={{fontSize:11,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:5}}>Senha Mestre</label>
              <input type={showAdminSenha?"text":"password"} value={adminSenha} onChange={e=>{setAdminSenha(e.target.value);setAdminErro("");}} onKeyDown={e=>e.key==="Enter"&&entrarAdmin()}
                placeholder="••••••••••" autoComplete="new-password"
                style={{width:"100%",padding:"11px 42px 11px 14px",border:"1px solid #334155",borderRadius:9,fontSize:13,fontFamily:"inherit",color:"#F1F5F9",background:"#0F172A",outline:"none"}}/>
              <div onClick={()=>setShowAdminSenha(!showAdminSenha)} style={{position:"absolute",right:12,top:34,cursor:"pointer",color:"#475569",display:"flex"}}>
                {showAdminSenha?<EyeOff size={15}/>:<Eye size={15}/>}
              </div>
            </div>
            {adminErro&&<div style={{background:"#3B1F1F",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#FCA5A5",display:"flex",gap:7}}>
              <AlertCircle size={13} style={{flexShrink:0,marginTop:1}}/>{adminErro}
            </div>}
            <div role="button" tabIndex={0} onClick={entrarAdmin} onKeyDown={e=>(e.key==="Enter"||e.key===" ")&&entrarAdmin()}
              style={{padding:"13px",background:"linear-gradient(135deg,#6366F1,#8B5CF6)",borderRadius:10,color:"#FFF",fontSize:14,fontWeight:700,textAlign:"center",cursor:"pointer",userSelect:"none",marginTop:4}}>
              Acessar Painel Admin
            </div>
          </div>
        </div>
        <div role="button" tabIndex={0} onClick={()=>{setModo(null);setAdminErro("");}} onKeyDown={e=>(e.key==="Enter")&&setModo(null)}
          style={{textAlign:"center",marginTop:14,fontSize:12,color:"#475569",cursor:"pointer",userSelect:"none"}}>
          ← Voltar à seleção
        </div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${CAIXA_BLUE} 0%,#0056B8 55%,#1A6FD4 100%)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'IBM Plex Sans',system-ui,sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{CSS}</style>
      {[{w:500,h:500,t:"-15%",l:"-10%"},{w:350,h:350,t:"60%",l:"70%"},{w:250,h:250,t:"20%",l:"75%"},{w:400,h:400,t:"50%",l:"-5%"}].map((c,i)=>(
        <div key={i} style={{position:"absolute",width:c.w,height:c.h,borderRadius:"50%",background:"rgba(255,255,255,0.04)",top:c.t,left:c.l,pointerEvents:"none"}}/>
      ))}
      <div style={{width:"100%",maxWidth:420,position:"relative"}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:68,height:68,borderRadius:20,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(10px)",marginBottom:14,border:"1px solid rgba(255,255,255,0.2)"}}><FileCheck size={32} color="#FFF"/></div>
          <div style={{fontSize:24,fontWeight:800,color:"#FFF",letterSpacing:"-.02em"}}>MCMVR Rural</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.65)",marginTop:4}}>Sistema de Validação de Documentos</div>
          <div style={{fontSize:11,color:CAIXA_ORANGE,marginTop:3,fontWeight:700,letterSpacing:".02em"}}>Programa Habitacional Rural</div>
        </div>

        {/* Indicador de passos */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,justifyContent:"center"}}>
          {[{n:1,l:"Identificar EO"},{n:2,l:"Acessar"}].map((s,i)=>(
            <div key={s.n} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:passo>=s.n?"#FFF":"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:11,fontWeight:800,color:passo>=s.n?CAIXA_BLUE:"rgba(255,255,255,0.5)"}}>{passo>s.n?"✓":s.n}</span>
                </div>
                <span style={{fontSize:11,color:passo>=s.n?"#FFF":"rgba(255,255,255,0.4)",fontWeight:passo===s.n?700:400}}>{s.l}</span>
              </div>
              {i===0&&<div style={{width:24,height:1,background:"rgba(255,255,255,0.2)"}}/>}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{background:"#FFF",borderRadius:22,padding:"24px 24px 20px",boxShadow:"0 28px 72px rgba(0,0,0,0.28)"}}>

          {/* PASSO 1 */}
          {passo===1&&(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
                <Users size={16} color={CAIXA_BLUE}/>
                <span style={{fontWeight:700,fontSize:15,color:"#1E293B"}}>Identificar Entidade Organizadora</span>
              </div>
              <div>
                <label style={{fontSize:11,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:5}}>Código da EO</label>
                <input
                  value={codigoEO}
                  onChange={e=>{setCodigoEO(e.target.value.toUpperCase());setErroEO("");}}
                  onInput={e=>{setCodigoEO(e.target.value.toUpperCase());setErroEO("");}}
                  onKeyDown={e=>e.key==="Enter"&&verificarEO()}
                  placeholder="Ex: EO-2025-001"
                  autoComplete="off"
                  style={{width:"100%",padding:"11px 14px",border:`1px solid ${erroEO?"#FCA5A5":"#E2E8F0"}`,borderRadius:10,fontSize:15,fontFamily:"inherit",color:"#1E293B",background:"#FAFAFA",outline:"none",letterSpacing:".05em",fontWeight:600}}
                />
                <div style={{fontSize:11,color:"#94A3B8",marginTop:5,marginBottom:erroEO?0:10}}>Fornecido no credenciamento da EO ao programa</div>
                {erroEO&&<div style={{display:"flex",gap:8,padding:"9px 12px",background:"#FEF2F2",borderRadius:9,margin:"8px 0",fontSize:12,color:"#DC2626"}}><AlertCircle size={14} style={{flexShrink:0,marginTop:1}}/>{erroEO}</div>}
                <Btn onClick={verificarEO} disabled={!codigoEO.trim()}
                  style={{width:"100%",padding:"13px",background:codigoEO.trim()?CAIXA_BLUE:"#CBD5E1",borderRadius:11,color:"#FFF",fontSize:14,fontWeight:700,textAlign:"center",marginTop:10}}>
                  Verificar EO →
                </Btn>
              </div>
            </>
          )}

          {/* PASSO 2 */}
          {passo===2&&eoSelecionada&&(
            <>
              <div style={{background:`${eoSelecionada.cor}15`,border:`2px solid ${eoSelecionada.cor}30`,borderRadius:12,padding:"10px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:10,background:`${eoSelecionada.cor}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{eoSelecionada.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,color:"#1E293B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{eoSelecionada.nome}</div>
                  <div style={{fontSize:10,color:"#64748B",marginTop:1}}>{eoSelecionada.municipio} — {eoSelecionada.estado} · {eoSelecionada.tipo==="publica"?"🏛️ Pública":"🏢 Privada"}</div>
                </div>
                <Btn onClick={()=>{setPasso(1);setEoSelecionada(null);setEmail("");setSenha("");setErro("");}}
                  style={{background:"none",border:"1px solid #E2E8F0",borderRadius:7,padding:"4px 9px",fontSize:11,color:"#64748B",fontFamily:"inherit"}}>
                  Trocar
                </Btn>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <Lock size={15} color={CAIXA_BLUE}/>
                <span style={{fontWeight:700,fontSize:15,color:"#1E293B"}}>Entrar no sistema</span>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:5}}>E-mail</label>
                <input id="lm-email" type="text" value={email}
                  onChange={e=>{setEmail(e.target.value);setErro("");}}
                  onInput={e=>{setEmail(e.target.value);setErro("");}}
                  onKeyDown={e=>e.key==="Enter"&&document.getElementById("lm-senha")?.focus()}
                  placeholder="seu@email.gov.br" autoComplete="off"
                  style={{width:"100%",padding:"11px 14px",border:`1px solid ${erro?"#FCA5A5":"#E2E8F0"}`,borderRadius:10,fontSize:13,fontFamily:"inherit",color:"#1E293B",background:"#FAFAFA",outline:"none"}}
                />
              </div>
              <div style={{marginBottom:14,position:"relative"}}>
                <label style={{fontSize:11,fontWeight:600,color:"#64748B",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:5}}>Senha</label>
                <input id="lm-senha" type={showSenha?"text":"password"} value={senha}
                  onChange={e=>{setSenha(e.target.value);setErro("");}}
                  onInput={e=>{setSenha(e.target.value);setErro("");}}
                  onKeyDown={e=>e.key==="Enter"&&entrar()}
                  placeholder="••••••••" autoComplete="new-password"
                  style={{width:"100%",padding:"11px 42px 11px 14px",border:`1px solid ${erro?"#FCA5A5":"#E2E8F0"}`,borderRadius:10,fontSize:13,fontFamily:"inherit",color:"#1E293B",background:"#FAFAFA",outline:"none"}}
                />
                <Btn onClick={()=>setShowSenha(!showSenha)} style={{position:"absolute",right:12,top:34,color:"#94A3B8",display:"flex"}}>
                  {showSenha?<EyeOff size={16}/>:<Eye size={16}/>}
                </Btn>
              </div>
              {erro&&<div style={{display:"flex",gap:8,padding:"9px 12px",background:"#FEF2F2",borderRadius:9,marginBottom:12,fontSize:12,color:"#DC2626"}}><AlertCircle size={14} style={{flexShrink:0,marginTop:1}}/>{erro}</div>}
              <Btn onClick={entrar}
                style={{width:"100%",padding:"13px",background:loading?CAIXA_BLUE+"99":CAIXA_BLUE,borderRadius:11,color:"#FFF",fontSize:14,fontWeight:700,textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {loading?<><Loader size={16} className="spinning"/>Autenticando…</>:<>Entrar</>}
              </Btn>
            </>
          )}

          {/* Credenciais demo */}
          <div style={{marginTop:16}}>
            <Btn onClick={()=>setDemoOpen(!demoOpen)}
              style={{width:"100%",padding:"8px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:9,color:"#64748B",fontSize:11,fontWeight:600,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <Info size={12}/> {demoOpen?"Ocultar":"Ver"} credenciais de demonstração {demoOpen?<ChevronUp size={12}/>:<ChevronDown size={12}/>}
            </Btn>
            {demoOpen&&(
              <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
                {ENTIDADES.map(eo=>{
                  const users=USUARIOS.filter(u=>u.eo_id===eo.id);
                  return(
                    <div key={eo.id} style={{border:"1px solid #E2E8F0",borderRadius:10,overflow:"hidden"}}>
                      <div style={{background:`${eo.cor}10`,padding:"6px 11px",display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:14}}>{eo.emoji}</span>
                        <div>
                          <div style={{fontSize:11,fontWeight:700,color:"#1E293B"}}>{eo.nome}</div>
                          <div style={{fontSize:10,color:"#94A3B8"}}>Código: <strong style={{color:eo.cor}}>{eo.codigo}</strong></div>
                        </div>
                      </div>
                      {users.map(u=>{const cfg=PERFIL_CONFIG[u.perfil];return(
                        <Btn key={u.id} onClick={()=>loginRapido(u)}
                          style={{display:"flex",alignItems:"center",gap:8,padding:"7px 11px",background:"#FFF",borderTop:"1px solid #F1F5F9",width:"100%",fontFamily:"inherit"}}>
                          <span style={{fontSize:13}}>{cfg.emoji}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:11,fontWeight:600,color:"#1E293B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.nome}</div>
                            <div style={{fontSize:9,color:"#94A3B8"}}>{u.email} · <strong>{u.senha}</strong></div>
                          </div>
                          <span style={{fontSize:9,fontWeight:700,background:cfg.light,color:cfg.fg,padding:"1px 6px",borderRadius:10,flexShrink:0}}>{cfg.label}</span>
                        </Btn>
                      );})}
                    </div>
                  );
                })}
                <div style={{fontSize:10,color:"#94A3B8",textAlign:"center"}}>Clique em qualquer usuário para entrar</div>
              </div>
            )}
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:11,color:"rgba(255,255,255,0.35)"}}>
          Sistema MCMVR Rural — uso exclusivo das Entidades Organizadoras credenciadas
        </div>
      </div>
    </div>
  );
}

function Sidebar({page,setPage,setSelectedId,open,setOpen,user,onLogout,onPrivacidade,onNovoCadastro}){
  const cfg=PERFIL_CONFIG[user?.perfil]||PERFIL_CONFIG.operador;
  const eo=user?.eo;
  return <aside style={{width:open?240:64,minWidth:open?240:64,background:CAIXA_BLUE,display:"flex",flexDirection:"column",transition:"width .2s,min-width .2s",overflow:"hidden",boxShadow:"2px 0 12px rgba(0,0,0,0.15)"}}>
    <div style={{padding:"16px 12px",borderBottom:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",gap:10,minHeight:64}}>
      {open&&<div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:13,color:"#FFF",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{eo?.nome||"MCMVR Rural"}</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:1,display:"flex",alignItems:"center",gap:4}}>
          <span>{eo?.emoji||"📋"}</span>
          <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{eo?.codigo||"Validador de Documentos"}</span>
        </div>
      </div>}
      <button onClick={()=>setOpen(!open)} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:7,cursor:"pointer",color:"#FFF",display:"flex",alignItems:"center",flexShrink:0}}><Menu size={16}/></button>
    </div>
    <nav style={{flex:1,padding:"12px 8px",display:"flex",flexDirection:"column",gap:4}}>
      {[{id:"lista",label:"Beneficiários",icon:Users,ok:true},{id:"cadastro",label:"Novo Cadastro",icon:FilePlus,ok:pode(user,"novo")}].map(item=>{
        const Icon=item.icon;const active=page===item.id||(page==="detalhe"&&item.id==="lista");
        const handleClick=()=>{ if(item.id==="cadastro"&&onNovoCadastro){onNovoCadastro();}else{setPage(item.id);setSelectedId(null);} };
        if(!item.ok)return <div key={item.id} title="Sem permissão" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,color:"rgba(255,255,255,0.2)",cursor:"not-allowed"}}>
          <Icon size={17} style={{flexShrink:0}}/>{open&&<span style={{fontSize:13,whiteSpace:"nowrap"}}>{item.label} 🔒</span>}
        </div>;
        return <button key={item.id} onClick={handleClick} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"none",cursor:"pointer",width:"100%",background:active?"rgba(255,255,255,0.18)":"transparent",color:active?"#FFF":"rgba(255,255,255,0.6)",fontFamily:"inherit",fontSize:13,fontWeight:active?600:400,transition:"all .15s"}}>
          <Icon size={17} style={{flexShrink:0}}/>{open&&<span style={{whiteSpace:"nowrap"}}>{item.label}</span>}
        </button>;
      })}
      <button onClick={onPrivacidade} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:"none",cursor:"pointer",width:"100%",background:"transparent",color:"rgba(255,255,255,0.35)",fontFamily:"inherit",fontSize:12,marginTop:"auto",transition:"all .15s"}}>
        <Shield size={15} style={{flexShrink:0}}/>{open&&<span style={{whiteSpace:"nowrap"}}>Privacidade · LGPD</span>}
      </button>
    </nav>
    {/* Usuário + EO */}
    {open?(
      <div style={{padding:12,borderTop:"1px solid rgba(255,255,255,0.1)"}}>
        {eo&&<div style={{background:`${eo.cor}25`,border:`1px solid ${eo.cor}40`,borderRadius:9,padding:"7px 10px",marginBottom:8,display:"flex",alignItems:"center",gap:7}}>
          <span style={{fontSize:16}}>{eo.emoji}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:10,fontWeight:700,color:"#FFF",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{eo.nome}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.5)"}}>{eo.municipio} · {eo.tipo==="publica"?"Pública":"Privada"}</div>
          </div>
        </div>}
        <div style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:32,height:32,borderRadius:8,background:cfg.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{cfg.emoji}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:700,color:"#FFF",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.nome.split(" ").slice(0,2).join(" ")}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.5)",marginTop:1}}>{user?.cargo}</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:10,fontWeight:700,background:cfg.light,color:cfg.fg,padding:"2px 8px",borderRadius:20}}>{cfg.label}</span>
            <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.1)",border:"none",borderRadius:7,padding:"4px 9px",cursor:"pointer",color:"rgba(255,255,255,0.7)",fontSize:11,fontFamily:"inherit"}}><LogOut size={12}/> Sair</button>
          </div>
        </div>
      </div>
    ):(
      <div style={{padding:"8px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
        <button onClick={onLogout} title="Sair" style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:9,cursor:"pointer",color:"rgba(255,255,255,0.7)"}}><LogOut size={16}/></button>
      </div>
    )}
  </aside>;
}

function Header({page,beneficiario,onBack,isMobile,user,onLogout,onSettings,apiKey=""}){
  const cfg=PERFIL_CONFIG[user?.perfil]||PERFIL_CONFIG.operador;
  const temKey=!!"";
  return <header style={{background:CAIXA_BLUE,padding:isMobile?"0 16px":"0 24px",height:isMobile?56:60,display:"flex",alignItems:"center",gap:10,flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
    {page==="detalhe"&&<button onClick={onBack} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.15)",border:"none",cursor:"pointer",color:"#FFF",fontSize:13,fontFamily:"inherit",padding:"6px 10px",borderRadius:8,flexShrink:0}}><ArrowLeft size={15}/>Voltar</button>}
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontWeight:700,fontSize:isMobile?14:15,color:"#FFF",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
        {page==="lista"    &&(isMobile?"Beneficiários":"Beneficiários Cadastrados")}
        {page==="detalhe" &&(beneficiario?.nome||"Beneficiário")}
        {page==="cadastro"&&"Novo Beneficiário"}
      </div>
      {!isMobile&&<div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:1}}>MCMVR Rural — Validador Documental</div>}
    </div>
    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
      {/* Botão de configuração de API Key */}
      <button onClick={onSettings} title={temKey?"API Key configurada — clique para alterar":"Configurar API Key para análise real de imagens"}
        style={{display:"flex",alignItems:"center",gap:5,background:temKey?"rgba(34,197,94,0.25)":"rgba(255,255,255,0.12)",border:`1px solid ${temKey?"rgba(34,197,94,0.5)":"rgba(255,255,255,0.2)"}`,borderRadius:8,padding:"5px 9px",cursor:"pointer",color:"#FFF",fontSize:11,fontWeight:600,fontFamily:"inherit"}}>
        <Zap size={13} color={temKey?"#4ADE80":"rgba(255,255,255,0.7)"}/>
        {!isMobile&&<span style={{color:temKey?"#4ADE80":"rgba(255,255,255,0.7)"}}>{temKey?"IA Ativa":"Config IA"}</span>}
      </button>
      <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.12)",borderRadius:20,padding:"4px 10px 4px 6px"}}>
        <span style={{fontSize:14}}>{cfg.emoji}</span>
        {!isMobile&&<span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.9)"}}>{user?.nome.split(" ")[0]}</span>}
        <span style={{fontSize:10,fontWeight:700,background:cfg.light,color:cfg.fg,padding:"1px 7px",borderRadius:20}}>{cfg.label}</span>
      </div>
      {isMobile&&<button onClick={onLogout} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"rgba(255,255,255,0.8)",display:"flex",alignItems:"center"}}><LogOut size={15}/></button>}
    </div>
  </header>;
}

function BottomNav({page,setPage,setSelectedId,user,onNovoCadastro}){
  return <nav className="safe-bottom" style={{position:"fixed",bottom:0,left:0,right:0,background:"#FFF",borderTop:"1px solid #E2E8F0",display:"flex",zIndex:100,boxShadow:"0 -4px 16px rgba(0,0,0,0.08)",padding:"8px 0"}}>
    {[{id:"lista",label:"Início",icon:Home,ok:true},{id:"cadastro",label:"Novo",icon:Plus,ok:pode(user,"novo")}].map(item=>{
      const Icon=item.icon;const active=page===item.id||(page==="detalhe"&&item.id==="lista");
      const handleBNClick=()=>{ if(!item.ok) return; if(item.id==="cadastro"&&onNovoCadastro){onNovoCadastro();}else{setPage(item.id);setSelectedId(null);} };
      return <button key={item.id} onClick={handleBNClick} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 0",border:"none",background:"none",cursor:item.ok?"pointer":"default",color:!item.ok?"#E2E8F0":active?CAIXA_BLUE:"#94A3B8",fontFamily:"inherit",transition:"all .15s"}}>
        <div style={{width:40,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:12,background:active?"#EFF6FF":"transparent",transition:"background .15s"}}><Icon size={20}/></div>
        <span style={{fontSize:10,fontWeight:active?700:500}}>{item.label}{!item.ok?" 🔒":""}</span>
      </button>;
    })}
  </nav>;
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const isMobile=useIsMobile();
  const [user,setUser]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [adminUser,setAdminUser]=useState(null);
  const [page,setPage]=useState("lista");
  const [selectedId,setSelectedId]=useState(null);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [allBeneficiarios,setAllBeneficiarios]=useState(INIT);
  const [showLGPDNotice,setShowLGPDNotice]=useState(false);
  const [showPolitica,setShowPolitica]=useState(false);
  const [lgpdAceito,setLgpdAceito]=useState(false);
  const [auditLog,setAuditLog]=useState([]);
  const [showAPIKey,setShowAPIKey]=useState(false);
  const [apiKey,setApiKey]=useState("");

  // Super Admin — painel separado
  if(isAdmin) return <SuperAdminDashboard onLogout={()=>{setIsAdmin(false);setAdminUser(null);}} allBeneficiarios={allBeneficiarios} adminUser={adminUser}/>;

  // Filtra beneficiários pela EO logada (isolamento multi-tenant)
  const beneficiarios=user?allBeneficiarios.filter(b=>b.eo_id===user.eo?.id):[];
  const beneficiario=beneficiarios.find(b=>b.id===selectedId);

  const audit=(acao,tipo="acesso")=>{
    if(!user)return;
    setAuditLog(prev=>[...prev,{ts:new Date().toISOString(),usuario:user.nome,perfil:PERFIL_CONFIG[user.perfil]?.label||user.perfil,acao,tipo}]);
  };

  const handleUpdateDoc=(benefId,docId,update)=>{
    setAllBeneficiarios(prev=>prev.map(b=>{
      if(b.id!==benefId)return b;
      const newDocs={...b.documentos,[docId]:{...b.documentos[docId],...update}};
      const vals=Object.values(newDocs);
      let status="aprovado";
      if(vals.some(d=>["divergencia","rasura","vencido","ilegivel","incompleto"].includes(d.status)))status="divergencia";
      else if(vals.some(d=>d.status==="pendente"))status="incompleto";
      return{...b,documentos:newDocs,status};
    }));
    if(update.status&&update.status!=="analisando") audit(`Upload/análise: ${docId} — ${update.status}`,"upload");
  };

  const handleBack=()=>{setPage("lista");setSelectedId(null);};
  const handleLogout=()=>{audit("Logout");setUser(null);setPage("lista");setSelectedId(null);setLgpdAceito(false);setAuditLog([]);};
  const handleLogin=(u)=>{setUser(u);setAuditLog([{ts:new Date().toISOString(),usuario:u.nome,perfil:PERFIL_CONFIG[u.perfil]?.label||u.perfil,acao:`Login — ${u.eo?.nome||""} · ${PERFIL_CONFIG[u.perfil]?.label}`,tipo:"login"}]);};
  const handleSelectBenef=(id)=>{setSelectedId(id);setPage("detalhe");const b=beneficiarios.find(x=>x.id===id);audit(`Acessou: ${b?.nome}`,"acesso");};
  const handleNovoCadastro=()=>{ if(!lgpdAceito){setShowLGPDNotice(true);}else{setPage("cadastro");} };
  const handleLGPDAceito=()=>{setLgpdAceito(true);setShowLGPDNotice(false);setPage("cadastro");audit("Aceite LGPD registrado","lgpd");};

  if(!user)return <Login onLogin={handleLogin} onAdminLogin={u=>{setAdminUser(u);setIsAdmin(true);}}/>;

  const auditBenef=beneficiario?auditLog.filter(l=>l.acao.includes(beneficiario.nome)||l.tipo==="upload"):[];
  const handleSalvarEtapa2=(respostas)=>{
    setAllBeneficiarios(prev=>prev.map(b=>b.id===selectedId?{...b,respostas,etapa:2}:b));
    setPage("detalhe");
  };

  if(isMobile)return(
    <><style>{CSS}</style>
    {showLGPDNotice&&<LGPDNoticeModal onAceitar={handleLGPDAceito} onFechar={()=>setShowLGPDNotice(false)}/>}
    {showPolitica&&<PoliticaPrivacidadeModal onFechar={()=>setShowPolitica(false)}/>}
    {showAPIKey&&<APIKeyModal onClose={()=>setShowAPIKey(false)} onSave={k=>{setApiKey(k);setShowAPIKey(false);}} currentKey={apiKey}/>}
    <div style={{display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden",background:"#F0F4F9"}}>
      <Header page={page} beneficiario={beneficiario} onBack={handleBack} isMobile user={user} onLogout={handleLogout} onSettings={()=>setShowAPIKey(true)} apiKey={apiKey}/>
      <main style={{flex:1,overflowY:"auto"}}>
        {page==="lista"    &&<MobileList beneficiarios={beneficiarios} onSelect={handleSelectBenef} onNovo={handleNovoCadastro} user={user}/>}
        {page==="detalhe" &&beneficiario&&<MobileDetalhe beneficiario={beneficiario} onUpdateDoc={handleUpdateDoc} user={user}/> }
        {page==="etapa2"  &&beneficiario&&<Etapa2Formulario beneficiario={beneficiario} onSalvar={handleSalvarEtapa2} onVoltar={()=>setPage("detalhe")} isMobile/>}
        {page==="cadastro"&&(pode(user,"novo")?<Cadastro onCancel={handleBack} isMobile apiKey={apiKey}/>:<div style={{padding:32,textAlign:"center",color:"#94A3B8"}}><Lock size={32} style={{margin:"0 auto 12px",display:"block",opacity:.3}}/><div style={{fontWeight:600}}>Sem permissão para cadastrar</div></div>)}
      </main>
      <BottomNav page={page} setPage={setPage} setSelectedId={setSelectedId} user={user} onNovoCadastro={handleNovoCadastro}/>
    </div></>
  );

  return(
    <><style>{CSS}</style>
    {showLGPDNotice&&<LGPDNoticeModal onAceitar={handleLGPDAceito} onFechar={()=>setShowLGPDNotice(false)}/>}
    {showPolitica&&<PoliticaPrivacidadeModal onFechar={()=>setShowPolitica(false)}/>}
    {showAPIKey&&<APIKeyModal onClose={()=>setShowAPIKey(false)} onSave={k=>{setApiKey(k);setShowAPIKey(false);}} currentKey={apiKey}/>}
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#F0F4F9"}}>
      <Sidebar page={page} setPage={setPage} setSelectedId={setSelectedId} open={sidebarOpen} setOpen={setSidebarOpen} user={user} onLogout={handleLogout} onPrivacidade={()=>setShowPolitica(true)} onNovoCadastro={handleNovoCadastro}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <Header page={page} beneficiario={beneficiario} onBack={handleBack} isMobile={false} user={user} onLogout={handleLogout} onSettings={()=>setShowAPIKey(true)} apiKey={apiKey}/>
        <main style={{flex:1,overflowY:"auto"}}>
          {page==="lista"    &&<DesktopList beneficiarios={beneficiarios} onSelect={handleSelectBenef} onNovo={handleNovoCadastro} user={user}/>}
          {page==="detalhe" &&beneficiario&&<div><DesktopDetalhe beneficiario={beneficiario} onUpdateDoc={handleUpdateDoc} user={user}/><div style={{padding:"0 24px 24px",maxWidth:960}}><AuditPanel logs={auditBenef}/></div></div>}
          {page==="etapa2"  &&beneficiario&&<Etapa2Formulario beneficiario={beneficiario} onSalvar={handleSalvarEtapa2} onVoltar={()=>setPage("detalhe")} isMobile={false}/>}
          {page==="cadastro"&&(pode(user,"novo")?<Cadastro onCancel={handleBack} isMobile={false} apiKey={apiKey}/>:<div style={{padding:48,textAlign:"center",color:"#94A3B8"}}><Lock size={36} style={{margin:"0 auto 16px",display:"block",opacity:.3}}/><div style={{fontWeight:600,fontSize:15}}>Sem permissão para cadastrar beneficiários</div><div style={{fontSize:13,marginTop:6}}>Solicite ao administrador ou gerente</div></div>)}
        </main>
      </div>
    </div></>
  );
}
